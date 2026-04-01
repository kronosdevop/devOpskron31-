<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="retaileredition"
      @update:model-value="retaileredition = $event"
      persistent
      transition="dialog-bottom-transition"
      max-width="500"
      
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Edit Retailer</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  v-model="retailereName"
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
                  v-model="retailereemailID"
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
            Save
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
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    retaileredition: Boolean,
    retaileritem: Object,
  },
  data() {
    return {
      loading: false,
      retailereName: "",
      contactName: "",
      retailereemailID: "",
      countryList: "",
      contactNumber: "",
      retailereCode: "",
      countryitems: [],
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          if (value === "" || value === null || value === undefined) {
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
    retaileredition: {
      async handler() {
        await this.fetch_details();
        this.retailereName = this.retaileritem.asset_retailer_name;
        this.retailereemailID = this.retaileritem.asset_retailer_email;
        this.countryList = this.retaileritem.county_code;
        this.contactNumber = this.retaileritem.contact_number;
        this.retailereCode = this.retaileritem.asset_retailer_code;
        this.contactName =
          this.retaileritem.contact_name == undefined
            ? ""
            : this.retaileritem.contact_name;
      },
      immediate: true,
    },
  },
  methods: {
    fetch_details() {
      // Clear existing data before pushing new data
      this.countryitems = [];
      
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
  async  validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.edit_mutation();
      }
    },
    async edit_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_asset_retailers, {
            input: {
              organization_id: data.organization.organization_id,
              asset_retailer_id: this.retaileritem.asset_retailer_id,
              action_type: "EDIT",
              asset_retailer_name: this.retailereName,
              asset_retailer_email:
                this.retaileremailID == null ? "" : this.retaileremailID,
              county_code: this.countryList == null ? "" : this.countryList,
              contact_number:
                this.contactNumber == null ? "" : this.contactNumber,
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