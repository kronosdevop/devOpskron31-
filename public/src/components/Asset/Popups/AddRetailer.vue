<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="createretailer"
      @update:model-value="createretailer = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Add Retailer</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-select
                  v-model="Distributor"
                  label="Distributor*"
                  :items="Distributoritems"
                  item-title="name"
                  item-value="value"
                  :rules="[(v) => !!v || 'required ']"
                  density="compact"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="retailerName"
                  label="Retailer Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="retailereCode"
                  label="Retailer Code"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <div class="font-weight-bold mt-n2 mb-1">Contact Details</div>
              <v-col cols="12">
                <v-text-field
                  v-model="contactName"
                  label="Name"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="retaileremailID"
                  label="Email ID"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.email]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="countryList"
                  label="Country Code"
                  :items="countryitems"
                  class="mr-2"
                  item-text="title"
                  item-value="code"
                  density="compact"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="contactNumber"
                  label="Contact Number"
                  class="ml-2 mr-2"
                  maxlength="14"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_data()"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
              <script>
/* eslint-disable */
import CountryList from "@/JsonFiles/CountryList.json";
import { create_list_edit_delete_asset_retailers } from "@/graphql/mutations.js";
import { create_list_edit_delete_asset_distributors } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    createretailer: Boolean,
  },
  data() {
    return {
      loading: false,
      retailerName: "",
      retailereCode: "",
      retaileremailID: "",
      countryList: "",
      Distributor: "",
      contactNumber: "",
      contactName: "",
      Distributoritems: [],
      countryitems: [],
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          if (value === "" || value === null) {
            return true;
          }
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid Email";
        },
        phoneNumber: (value) => {
          return (
            (value && /^[0-9]{8,13}$/.test(value)) ||
            "Length must be between 8 and 13 digits"
          );
        },
      },
    };
  },
  watch: {
    createretailer: {
      async handler() {
        await this.fetch_details();
        await this.fetch_distributorlist();
      },
      immediate: true,
    },
  },
  methods: {
    async fetch_distributorlist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_asset_distributors, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(
          result.data.create_list_edit_delete_asset_distributors
        );
        this.Distributoritems = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          var datadistributor = response.data;
          datadistributor.forEach((element) => {
            this.Distributoritems.push({
              name: element.asset_distributor_name,
              value: element.asset_distributor_id,
            });
          });
          //   this.Distributoritems = response.data;
          this.tableLoading = false;
        } else {
          this.Distributoritems = [];

          this.tableLoading = false;
        }
      } catch (error) {
        this.distributorRecords = [];

        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    fetch_details() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          title: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    is_number(evt) {
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
    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.add_mutation();
      }
    },
    async add_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_asset_retailers, {
            input: {
              action_type: "CREATE",
              organization_id: data.organization.organization_id,
              asset_retailer_name: this.retailerName,
              asset_retailer_email:
                this.retaileremailID == null ? "" : this.retaileremailID,
              county_code: this.countryList == null ? "" : this.countryList,
              contact_number:
                this.contactNumber == null ? "" : this.contactNumber,
              asset_distributor_id: this.Distributor,
              asset_retailer_code: this.retailereCode,
              contact_name: this.contactName == null ? "" : this.contactName,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(
          result.data.create_list_edit_delete_asset_retailers
        );
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.resetValidation();
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>