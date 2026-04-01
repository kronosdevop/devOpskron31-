<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="createdistributors"
      @update:model-value="createdistributors = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Add Distributor/Agent
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  v-model="distributorName"
                  label="Distributor Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="distributorCode"
                  label="Distributor Code"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="selectedTerritories"
                  label="Territory"
                  :items="territoryItems"
                  class="mr-2"
                  item-text="title"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                  multiple
                  chips
                  clearable
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="selectedBusinessType"
                  label="Business Type"
                  :items="businessTypeItems"
                  class="mr-2"
                  item-text="title"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                  clearable
                ></v-select>
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
                  v-model="distributoremailID"
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
import { create_list_edit_delete_asset_distributors } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_master_terittory } from "@/mixins/GetMasterTerritory.js";
import { get_business_types } from "@/mixins/GetBusinessTypes.js";

import CountryList from "@/JsonFiles/CountryList.json";

export default {
  props: {
    createdistributors: Boolean,
  },
  mixins: [get_master_terittory, get_business_types],
  data() {
    return {
      loading: false,
      distributorName: "",
      distributorCode: "",
      distributoremailID: "",
      countryList: "",
      contactNumber: "",
      contactName: "",
      selectedTerritories: [],
      territoryItems: [],
      countryitems: [],
      selectedBusinessType: "",
      businessTypeItems: [],
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
    createdistributors: {
      async handler() {
        await this.fetch_details();
      },
      immediate: true,
    },
  },
  methods: {
    async fetch_details() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          title: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
      await Promise.all([
        this.get_master_terittory(),
        this.get_business_types()
      ]);
      this.populate_territory_items();
      this.populate_business_type_items();
    },
    populate_territory_items() {
      this.territoryItems = [];
      if (this.orgTerittory && Array.isArray(this.orgTerittory)) {
        this.orgTerittory.forEach((element) => {
          this.territoryItems.push({
            title: element.territory_name,
            value: element.territory_id,
          });
        });
      }
    },
    populate_business_type_items() {
      this.businessTypeItems = [];
      if (this.masterBusinessTypes && Array.isArray(this.masterBusinessTypes)) {
        this.masterBusinessTypes.forEach((element) => {
          this.businessTypeItems.push({
            title: element.bussinesstypes_name,
            value: element.bussinesstype_id,
          });
        });
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.selectedTerritories = [];
      this.selectedBusinessType = "";
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
          graphqlOperation(create_list_edit_delete_asset_distributors, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "CREATE",
              asset_distributor_name: this.distributorName,
              asset_distributor_email:
                this.distributoremailID == null ? "" : this.distributoremailID,
              county_code: this.countryList == null ? "" : this.countryList,
              contact_number:
                this.contactNumber == null ? "" : this.contactNumber,
              asset_distributor_code: this.distributorCode,
              contact_name: this.contactName == null ? "" : this.contactName,
              territory_id: this.selectedTerritories && this.selectedTerritories.length > 0 ? this.selectedTerritories : [],
              territory_id_name: this.selectedTerritories && this.selectedTerritories.length > 0 
                ? this.selectedTerritories.map(territoryId => {
                    const territory = this.territoryItems.find(item => item.value === territoryId);
                    return territory ? territory.title : null;
                  }).filter(name => name !== null)
                : [],
              bussinesstypes_name: this.businessTypeItems.find(item => item.value === this.selectedBusinessType)?.title || undefined,
              bussinesstype_id: this.selectedBusinessType || undefined,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(
          result.data.create_list_edit_delete_asset_distributors
        );
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.selectedTerritories = [];
          this.selectedBusinessType = "";
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