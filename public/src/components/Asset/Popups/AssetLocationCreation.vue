<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="addAssetLocationDialog"
      @update:model-value="addAssetLocationDialog = $event"
      persistent
      max-width="1000"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Add Location</div></v-toolbar-title
          >
          <v-spacer />

          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-toolbar dense flat>
          <gmap-autocomplete
            class=""
            placeholder="Search Location"
            style="
              border-bottom: 1px solid grey;
              margin-left: 8px;
              width: 300px;
              font-size: 12px;
            "
            :value="search"
            ref="clearSearch"
            @place_changed="setPlace"
          ></gmap-autocomplete>
          <v-btn
            dark
            small
            class="pa-0 ml-2 white--text cardCss"
            @click="clearField()"
          >
            Go
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <GmapMap
                :center="
                  markers[0] != undefined ? markers[0].position : defaultCenter
                "
                :zoom="20"
                style="height: 300px"
              >
                <GmapMarker
                  :key="index"
                  v-for="(m, index) in markers"
                  :position="m.position"
                  :clickable="true"
                  :draggable="true"
                  @dragend="callposition"
                  @click="center = m.position"
                />
              </GmapMap>
            </v-col>
            <v-col cols="6">
              <v-form ref="form">
                <v-row no-gutters>
                  <v-col class="" cols="12"
                    ><i
                      >To update the latitude and longitude, click GO once the
                      location is entered</i
                    >
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-select
                      v-model="locationType"
                      :items="[
                        { title: 'Distributor', value: 'DISTRIBUTOR' },
                        { title: 'Retailer', value: 'CUTOMERS' },
                      ]"
                      label="Location Type*"
                      density="compact"
                      variant="outlined"
                      @input="fetch_inputs"
                    ></v-select>
                  </v-col>
                  <!-- { text: 'Warehouse', value: 'WAREHOUSE' },
                        { text: 'Store', value: 'STORE' }, -->
                  <v-col
                    v-show="locationType == 'CUTOMERS'"
                    class="mt-2"
                    cols="12"
                  >
                    <v-select
                      v-model="selectRetailer"
                      label="Select Retailer"
                      :items="retailerItems"
                      class="mr-2"
                      item-text="asset_retailer_name"
                      item-value="asset_retailer_id"
                      density="compact"
                      variant="outlined"
                    ></v-select>
                  </v-col>
                  <v-col
                    v-show="locationType == 'DISTRIBUTOR'"
                    class="mt-2"
                    cols="12"
                  >
                    <v-select
                      v-model="selectDistributor"
                      label="Select Distributor"
                      :items="distribuorList"
                      class="mr-2"
                      item-text="asset_distributor_name"
                      item-value="asset_distributor_id"
                      density="compact"
                      variant="outlined"
                    ></v-select>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-text-field
                      v-model="locationName"
                      label="Location Name*"
                      :rules="[(v) => !!v || 'required ']"
                      density="compact"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-select
                      v-model="selectTerritory"
                      label="Select Territory *"
                      :rules="[(v) => !!v || 'required ']"
                      :items="selectTerritoryItems"
                      class="mr-2"
                      item-text="territory_name"
                      item-value="territory_id"
                      density="compact"
                      variant="outlined"
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      class=""
                      v-model="geoLattitude"
                      :rules="[(v) => !!v || 'required ']"
                      label="Lattitude*"
                      density="compact"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      class="ml-2"
                      v-model="geoLongitude"
                      :rules="[(v) => !!v || 'required ']"
                      label="Longitude*"
                      density="compact"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>

                  <v-col class="mt-2" cols="12">
                    <v-textarea
                      rows="0"
                      auto-grow
                      v-model="locationAddress"
                      label="Location Address"
                      density="compact"
                      variant="outlined"
                    ></v-textarea>
                  </v-col>
                  <div class="text--left"><b>Additional Parameters</b></div>

                  <v-col class="mt-2" cols="12">
                    <v-select
                      v-model="countryData"
                      label="Country"
                      :items="countryitems"
                      class="mr-2"
                      item-text="name"
                      item-value="code"
                      density="compact"
                      variant="outlined"                    ></v-select>
                    <!-- <v-text-field
                      dense
                      v-model="locationCountry"
                      label="Country"
                      outlined
                    ></v-text-field> -->
                  </v-col>
                  <v-col v-show="countryData == 'India'" class="" cols="12">
                    <i>
                      Search by pincode to fetch the state,country,district
                      Fields.
                    </i>
                  </v-col>
                  <v-row v-show="countryData == 'India'" no-gutters>
                    <v-col class="mt-2" cols="8">
                      <v-text-field
                        density="compact"
                        v-model="locationPincode"
                        label="Location Pincode"
                        maxlength="6"
                        @keypress="is_Number($event)"
                      ></v-text-field>
                    </v-col>
                    <v-col class="mt-2" cols="4">
                      <v-btn
                        dark
                        small
                        :loading="loading1"
                        class="pa-0 ml-2 white--text cardCss"
                        @click="fetchPinData()"
                      >
                        Go
                      </v-btn>
                    </v-col>
                  </v-row>
                  <!-- <v-col v-show="countryData == 'India'" class="mt-2" cols="12">
                    <v-select
                      dense
                      v-model="locationState"
                      outlined
                      label="State"
                      :items="stateItems"
                    />
                  </v-col> -->
                  <!-- v-show="countryData != 'India'" -->
                  <v-col class="mt-2" cols="12">
                    <v-text-field
                      v-model="locationState"
                      label="State"
                      density="compact"
                      variant="outlined"                    ></v-text-field>
                  </v-col>

                  <v-col v-show="countryData == 'India'" class="mt-2" cols="12">
                    <v-select
                      v-model="locationDistrict"
                      density="compact"
                      variant="outlined"
                      label="District"
                      :items="districtItems"
                    />
                    <!-- <v-text-field
                      dense
                      v-model="locationDistrict"
                      label="District"
                      outlined
                    ></v-text-field> -->
                  </v-col>
                </v-row>
              </v-form>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner text-white"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { asset_config_create_list_update_locations } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import CountryList from "@/JsonFiles/CountryList.json";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { get_asset_reatilers } from "@/mixins/GetAssetRetailers.js";
import { get_asset_terittory } from "@/mixins/GetAssetTerittory.js";
export default {
  props: {
    addAssetLocationDialog: Boolean,
  },
  mixins: [get_asset_distributors, get_asset_reatilers, get_asset_terittory],
  data() {
    return {
      locationName: "",
      geoLattitude: "",
      geoLongitude: "",
      loading: false,
      search: "",
      search1: "",
      currentPlace: null,
      markers: [],
      locationAddress: "",
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
      latt: "",
      longg: "",
      locationType: "",
      locationDistrict: "",
      locationCountry: "",
      locationAddress: "",
      locationPincode: "",
      locationState: "",
      loading1: false,
      countryitems: [],
      countryData: "",
      districtItems: [],
      stateItems: [],
      selectTerritory: "",
      selectTerritoryItems: [],
      selectRetailer: "",
      selectDistributor: "",
      distribuorList: [],
      retailerItems: [],
      isVisibile: false,
    };
  },
  watch: {
    addAssetLocationDialog: {
      async handler() {
        if (this.addAssetLocationDialog == true) {
          this.retailerItems = [];
          this.distribuorList = [];
          this.locationPincode = "";
          this.locationCountry = "";
          this.locationState = "";
          this.locationType = "";
          this.selectTerritory = "";
          await this.get_asset_terittory();
          this.fetch_details();
        }
        this.markers = [];
      },
      immediate: true,
    },
  },
  methods: {
    async fetch_inputs() {
      if (this.locationType == "DISTRIBUTOR") {
        this.retailerItems = [];
        await this.get_asset_distributors();
        this.distribuorList = this.masterAssetDistributors;
      } else {
        this.distribuorList = [];
        await this.get_asset_reatilers();
        this.retailerItems = this.masterAssetRetailers;
      }
    },

    fetch_details() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name,
          code: element.name,
        });
      });
      this.assetTerittory.forEach((element) => {
        this.selectTerritoryItems.push({
          territory_name: element.territory_name,
          territory_id: element.territory_id,
        });
      });
    },
    setPlace(place) {
      this.currentPlace = place;
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

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.locationName = "";
      this.markers = [];
      this.geoLattitude = "";
      this.geoLongitude = "";
    },

    clearField() {
      this.search = null;
      this.addMarker();
    },

    addMarker() {
      if (this.currentPlace) {
        this.locationAddress = this.currentPlace.name;
        this.markers = [];
        var marker = {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng(),
        };
        this.markers.push({ position: marker });
        (this.geoLattitude = marker.lat), (this.geoLongitude = marker.lng);
      }
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.create_master_locations();
      }
    },

    callposition(latLng) {
      this.markers = [];
      var marker = {
        lat: latLng.latLng.lat(),
        lng: latLng.latLng.lng(),
      };
      this.markers.push({ position: marker });
      (this.geoLattitude = marker.lat), (this.geoLongitude = marker.lng);
    },

    async fetchPinData() {
      this.stateItems = [];
      this.districtItems = [];
      // Reset any previous errors
      if (!this.locationPincode) {
        this.$emit("errorMsg", "Please enter a Postal Index Number");
        // this.error = "Please enter a Postal Index Number";
        return;
      }
      this.loading1 = true;
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${this.locationPincode}`
        ); // Replace with your API URL
        if (!response.ok) {
          this.$emit("errorMsg", "Failed to fetch data");
          throw new Error("Failed to fetch data");
        }
        this.loading1 = false;
        const data = await response.json();
        var masterArray = data[0].PostOffice;
        masterArray.forEach((element) => {
          this.stateItems.push(element.State);
          this.districtItems.push(element.District);
        });

        // array.forEach(element => {

        // });
        this.locationDistrict = data[0].PostOffice[0].District;
        // this.locationCountry = data[0].PostOffice[0].Country;
        this.locationState = data[0].PostOffice[0].State;

        // this.pinData = await response.json();
      } catch (err) {
        this.loading1 = false;
        this.error = err.message;
        this.locationPincode = "";
      }
    },

    async create_master_locations() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_config_create_list_update_locations, {
            input: {
              action_type: "CREATE",
              territory_id: this.selectTerritory,
              asset_location_name: this.locationName,
              asset_location_lat:
                this.geoLattitude == "" ? undefined : this.geoLattitude,
              asset_location_long:
                this.geoLongitude == "" ? undefined : this.geoLongitude,
              asset_location_type: this.locationType,
              asset_location_state: this.locationState,
              asset_location_district: this.locationDistrict,
              asset_location_country: this.countryData,
              asset_location_pincode: this.locationPincode,
              asset_location_address: this.locationAddress,
              asset_distributor_id:
                this.selectDistributor == ""
                  ? undefined
                  : this.selectDistributor,
              asset_retailer_id:
                this.selectRetailer == "" ? undefined : this.selectRetailer,
            },
          })
        );
        var response = JSON.parse(
          result.data.asset_config_create_list_update_locations
        );
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("recallcomponent", 0);
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