<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addmember" @update:model-value="$emit('update:addmember', $event)" persistent max-width="600" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Create
              </div>
            </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="6">
                <v-text-field
                  dense
                  v-model="firstName"
                  label="Name"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  v-model="emailId"
                  label="Email ID"
                  class="mr-2"
                  :rules="email_rules"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  dense
                  v-model="countryList"
                  label="Country"
                  :items="countryitems"
                  class="mr-2"
                  :rules="[(v) => !!v || 'required ']"
                  item-text="name"
                  item-value="code"
                  outlined
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  dense
                  v-model="contactNumber"
                  label="Contact Number"
                  class="mr-2"
                  maxlength="14"
                  :rules="[(v) => !!v || 'required ']"
                  v-on:keypress="is_Number($event)"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="selectedModel"
                  :items="productserviceList"
                  dense
                  class="mr-2"
                  item-text="label"
                  :rules="[(v) => !!v || 'required ']"
                  item-value="value"
                  label="Choose Product/Services "
                  outlined
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
// import { crm_users_create } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import CountryList from "@/JsonFiles/CountryList.json";
// import { get_product_service_list } from "@/mixins/GetProductServiceList.js";
export default {
  props: {
    addmember: Boolean,
  },
  mixins: [get_product_service_list],
  data() {
    return {
      firstName: "",
      emailId: "",
      contactNumber: "",
      productserviceList: [],
      loading: false,
      countryList: "",
      selectedModel: "",
      countryitems: [],
      // email_rules: [(v) => /.+@.+\..+/.test(v) || "E-mail must be valid"],
    };
  },
  watch: {
    addmember: {
      async handler() {
        this.fetch_details();
        this.productserviceList = [];
        await this.get_product_service_list();
        this.productListArray.forEach((element) => {
          this.productserviceList.push({
            label: element.product_name,
            value: element.product_id,
          });
        });
      },

      immediate: true,
    },
  },
  computed: {
    email_rules() {
      // Define validation rules for the email input
      const rules = [];

      // Make the field optional
      rules.push((v) => !v || /.+@.+\..+/.test(v) || "Invalid email address");

      return rules;
    },
  },
  methods: {
    fetch_details() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
    },
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },

    is_Number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.create_event_info();
      }
    },
    async create_event_info() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(crm_users_create, {
            input: {
              product_id: this.selectedModel,
              full_contact_number: this.countryList + this.contactNumber,
              organization_id: data.organization.organization_id,
              customer_name: this.firstName,
              customer_email_id: this.emailId,
              customer_created_by: data.user.user_email_id,
              // customer_address:
            },
          })
        );

        var response = JSON.parse(result.data.crm_users_create);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>

<style>
</style>