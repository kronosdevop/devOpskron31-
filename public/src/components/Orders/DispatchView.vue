<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-dialog :model-value="dispatchOrderDialog" @update:model-value="$emit('update:dispatchOrderDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense flat class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Dispatch Details</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-form ref="formRef" lazy-validation>
          <v-card-text class="mt-2 scrollable-content">
            <p>
              Delivery Date: <b>{{ rowInfo.expected_delevery_date }}</b>
            </p>
            <p>
              Order-ID: <b>{{ rowInfo.order_transaction_id }}</b>
            </p>
            <p>
              Customer Name: <b>{{ rowInfo.customer_name }}</b>
            </p>
            <p><b>Select Delivery Partner</b></p>

            <v-row class="mt-n2">
              <v-col cols="12">
                <v-radio-group
                  v-model="selectpartner"
                  inline
                  class="d-flex align-center"
                >
                  <v-radio
                    label="Internal Users"
                    value="INTERNAL"
                    class="mr-4"
                  />
                  <v-radio label="External User" value="EXTERNAL" />
                </v-radio-group>
              </v-col>
            </v-row>

            <div v-if="selectpartner === 'INTERNAL'" class="">
              <v-select
                v-model="teamMemberSelected"
                :items="userList"
                label="Select Internal Agent"
                item-title="full_user_name"
                item-value="user_id"
                :rules="[(v) => !!v || 'Please select an internal agent']"
                required
                variant="outlined"
                density="compact"
                return-object
              ></v-select>
            </div>

            <div v-if="selectpartner === 'EXTERNAL'">
              <v-text-field
                v-model="agentName"
                label="Agent Name"
                :rules="[(v) => !!v || 'Agent name is required']"
                required
                variant="outlined"
                density="compact"
              ></v-text-field>
              <div class="d-flex align-center">
                <v-autocomplete
                  label="Country Code*"
                  v-model="userCCcode"
                  :items="countryCodes"
                  :search-input.sync="search"
                  @input="search = ''"
                  item-value="value"
                  item-title="label"
                  density="compact"
                  class="mr-4"
                  :rules="[(v) => !!v || 'Country Code is required']"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                ></v-autocomplete>
                <v-text-field
                  v-model="agentContact"
                  label="Contact Number"
                  :rules="[(v) => !!v || 'Contact number is required']"
                  required
                  variant="outlined"
                  density="compact"
                  @keypress="is_number($event, agentContact)"
                ></v-text-field>
              </div>
              <v-text-field
                v-model="agentEmail"
                label="Email ID"
                :rules="[(v) => !!v || 'Email is required']"
                required
                variant="outlined"
                density="compact"
              ></v-text-field>
            </div>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn
              class="cardCss text-capitalize mr-2"
              dark
              @click="confirmOrder"
              :loading="loading"
            >
              Confirm Order
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */

import { edit_orders } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import CountryList from "@/JsonFiles/CountryList.json";

export default {
  components: {
    SnackBar,
    CountryList,
  },

  mixins: [get_all_org_users],

  props: {
    dispatchOrderDialog: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      selectpartner: "INTERNAL",
      teamMemberSelected: "",
      userList: [],
      agentName: "",
      agentEmail: "",
      agentContact: "",
      SnackBarComponent: {},
      addedRecords: {},
      countryCodes: [],
      userCCcode: "",
      search: "",
      loading: false,
    };
  },

  async created() {
    await this.get_all_org_users();
    this.addedRecords = this.orgUsers;
    this.fetch_users();
    this.countries();
  },

  methods: {
    fetch_users() {
      this.userList = [];

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
            user_email_id: element.user_email_id,
            user_contact_number: element.user_contact_number,
            user_country_code: element.user_country_code,
          });
        }
      });
      this.userList.sort((a, b) =>
        a.full_user_name.localeCompare(b.full_user_name)
      );
    },
    is_number(evt, value) {
      evt = evt || window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
      if (value.length >= 14 && charCode >= 48 && charCode <= 57) {
        evt.preventDefault();
      }
    },
    countries() {
      var countryWithCc = [];
      this.countriesData = [];
      CountryList.forEach((element) => {
        countryWithCc.push({
          label: element.name + "(" + element.dial_code + ")",
          value: element.dial_code,
        });
        this.countriesData.push(element.name);
      });

      var countryListt = countryWithCc;
      this.countryCodes = countryListt;
    },
    async confirmOrder() {
      if (this.selectpartner === "INTERNAL") {
        if (!this.teamMemberSelected) {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Please select an internal agent.",
            timeout: 5000,
            Top: true,
          };
          return;
        }
        this.proceedConfirmation();
      } else if (this.selectpartner === "EXTERNAL") {
        const { valid } = await this.$refs.formRef.validate();
        if (valid) {
          this.proceedConfirmation();
        }
      }
    },

    internal_agent() {
      var internaldata = {
        user_type: "INTERNAL",
        email_id: this.teamMemberSelected.user_email_id,
        name: this.teamMemberSelected.full_user_name,
        phone_no: this.teamMemberSelected.user_contact_number,
        country_code: this.teamMemberSelected.user_country_code,
      };
      return JSON.stringify(internaldata);
    },

    external_agent() {
      var externalData = {
        user_type: "EXTERNAL",
        email_id: this.agentEmail,
        name: this.agentName,
        phone_no: this.agentContact,
        country_code: this.userCCcode,
      };
      return JSON.stringify(externalData);
    },

    async proceedConfirmation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_orders, {
            input: {
              order_id: this.rowInfo.order_id,
              order_delevery_status: "DISPATCHED",
              order_deleverd_by:
                this.selectpartner === "EXTERNAL"
                  ? this.external_agent()
                  : this.internal_agent(),
              expected_delevery_date: this.rowInfo.expected_delevery_date,
              total_amount: this.rowInfo.total_amount,
              received_amount: this.rowInfo.received_amount,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.edit_orders);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.selectpartner = "INTERNAL";
      this.teamMemberSelected = "";
      this.agentName = "";
      this.agentEmail = "";
      this.agentContact = "";
      this.$nextTick(() => {
        if (this.$refs.formRef) {
          this.$refs.formRef.resetValidation();
        }
      });
    },
  },
};
</script>

<style scoped>
.custom-title {
  font-weight: 600;
  font-size: 16px;
}

.icon-class {
  cursor: pointer;
}

.cardCss {
  background-color: #1976d2;
}
</style>
