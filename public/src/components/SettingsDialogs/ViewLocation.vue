<template>
  <!-- eslint-disable -->
  <div>
    <!-- Backdrop overlay -->
    <div
      v-if="locationViewDialog"
      class="dialog-backdrop"
      @click="close_dialog()"
    ></div>

    <!-- Card with dialog-like styling -->
    <v-card
      v-if="locationViewDialog"
      class="dialog-card"
      elevation="24"
      max-width="1000"
    >
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text-black ml-2">
          <div class="custom-title">
            <v-icon class="mr-2">mdi-map-marker</v-icon>
            Location: {{ rowInfo.location_name }}
          </div></v-toolbar-title
        >
        <v-spacer />

        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-toolbar dense flat class="bg-white search-toolbar">
        <GoogleAddressAutocomplete
          v-model="searchLocation"
          :api-key="googleApiKey"
          class="location-search-input"
          @callback="setPlace"
          placeholder="Search Location"
        />
        <v-btn
          dark
          small
          class="pa-0 ml-2 white--text cardCss search-btn"
          @click="clearField()"
          :disabled="!currentPlace"
        >
          Go
        </v-btn>
      </v-toolbar>
      <v-card-text class="dialog-content">
        <v-form ref="form">
          <v-row>
            <v-col cols="6">
              <div class="map-section">
                <GoogleMaps
                  ref="googleMapsMain"
                  :center="mapCenter"
                  :zoom="12"
                  :markers="mapMarkers"
                  :draggable="true"
                  map-height="450px"
                  @maps-loaded="onMapsLoaded"
                  @place-changed="setPlace"
                  @marker-dragend="callposition"
                  @marker-click="onMarkerClick"
                />
              </div>
              <v-row no-gutters class="mt-3">
                <div class="section-title">
                  <v-icon class="mr-2">mdi-cog</v-icon>
                  <b>Additional Parameters</b>
                </div>

                <v-col class="mt-2" cols="6">
                  <v-select
                    density="compact"
                    v-model="countryData"
                    label="Country"
                    :items="countryitems"
                    class="mr-2"
                    item-title="name"
                    item-value="code"
                    variant="outlined"
                    prepend-inner-icon="mdi-flag"
                    clearable
                  ></v-select>
                </v-col>
                <v-col class="mt-2" cols="6">
                  <v-text-field
                    density="compact"
                    v-model="locationState"
                    label="State"
                    variant="outlined"
                    prepend-inner-icon="mdi-city"
                    clearable
                  ></v-text-field>
                </v-col>
                <v-col v-show="countryData == 'India'" class="mt-2" cols="12">
                  <v-alert
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="mb-2"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-information</v-icon>
                    </template>
                    Search by pincode to fetch the state, country, district
                    fields.
                  </v-alert>
                </v-col>
                <v-row v-show="countryData == 'India'" no-gutters>
                  <v-col class="mt-2" cols="6">
                    <v-text-field
                      density="compact"
                      v-model="locationPincode"
                      label="Location Pincode"
                      maxlength="6"
                      @keypress="is_Number($event)"
                      variant="outlined"
                      prepend-inner-icon="mdi-map-marker"
                      clearable
                    ></v-text-field>
                  </v-col>
                  <v-col class="mt-2" cols="3">
                    <v-btn
                      dark
                      small
                      :loading="loading1"
                      :disabled="
                        !locationPincode || locationPincode.length !== 6
                      "
                      class="pa-0 ml-2 white--text cardCss"
                      @click="fetchPinData()"
                    >
                      Go
                    </v-btn>
                  </v-col>
                  <v-col class="mt-2" cols="6">
                    <v-select
                      v-model="locationDistrict"
                      density="compact"
                      variant="outlined"
                      label="District"
                      :items="districtItems"
                      prepend-inner-icon="mdi-map"
                      clearable
                    />
                  </v-col>
                </v-row>
              </v-row>
            </v-col>
            <v-col cols="6">
              <div class="form-section">
                <div class="section-title">
                  <v-icon class="mr-2">mdi-form-select</v-icon>
                  <b>Location Details</b>
                </div>
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-3"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  To update the latitude and longitude, click GO once the
                  location is entered
                </v-alert>

                <v-row no-gutters>
                  <v-col class="mt-2" cols="12">
                    <v-select
                      density="compact"
                      variant="outlined"
                      v-model="locationType"
                      :rules="[(v) => !!v || 'Location type is required']"
                      label="Location Type*"
                      :items="locationitems"
                      item-title="text"
                      item-value="value"
                      prepend-inner-icon="mdi-tag"
                      clearable
                    />
                  </v-col>
                  <v-col
                    v-show="locationType == 'RETAILER'"
                    class="mt-2"
                    cols="12"
                  >
                    <v-select
                      density="compact"
                      v-model="selectRetailer"
                      label="Select Retailer*"
                      :rules="
                        locationType == 'RETAILER'
                          ? [(v) => !!v || 'Retailer selection is required']
                          : []
                      "
                      :items="retailerItems"
                      class=""
                      item-title="asset_retailer_name"
                      item-value="asset_retailer_id"
                      variant="outlined"
                      prepend-inner-icon="mdi-store"
                      clearable
                    ></v-select>
                  </v-col>
                  <v-col
                    v-show="locationType == 'DISTRIBUTOR'"
                    class="mt-2"
                    cols="12"
                  >
                    <v-select
                      density="compact"
                      v-model="selectDistributor"
                      :rules="
                        locationType == 'DISTRIBUTOR'
                          ? [(v) => !!v || 'Distributor selection is required']
                          : []
                      "
                      label="Select Distributor*"
                      :items="distribuorList"
                      class=""
                      item-title="asset_distributor_name"
                      item-value="asset_distributor_id"
                      variant="outlined"
                      prepend-inner-icon="mdi-truck"
                      clearable
                    ></v-select>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-select
                      density="compact"
                      variant="outlined"
                      v-model="territory"
                      :items="territoryitems"
                      v-if="locationType != 'PROJECT SITE'"
                      label="Territory"
                      item-title="text"
                      item-value="value"
                      prepend-inner-icon="mdi-earth"
                      clearable
                    />
                  </v-col>
                  <v-col cols="6" class="mt-2">
                    <v-text-field
                      density="compact"
                      class=""
                      v-model="geoLattitude"
                      label="Latitude*"
                      :rules="[(v) => !!v || 'Latitude is required']"
                      variant="outlined"
                      prepend-inner-icon="mdi-latitude"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" class="mt-2">
                    <v-text-field
                      density="compact"
                      class="ml-2"
                      v-model="geoLongitude"
                      label="Longitude*"
                      :rules="[(v) => !!v || 'Longitude is required']"
                      variant="outlined"
                      prepend-inner-icon="mdi-longitude"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-textarea
                      density="compact"
                      rows="2"
                      auto-grow
                      v-model="locationAddress"
                      label="Location Address"
                      variant="outlined"
                      prepend-inner-icon="mdi-map-marker"
                      clearable
                    ></v-textarea>
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end dialog-actions">
        <v-btn
          variant="outlined"
          @click="close_dialog()"
          class="mr-3"
          height="40"
        >
          Cancel
        </v-btn>
        <v-btn
          dark
          @click="validate_data()"
          :loading="loading"
          :disabled="!isFormValid"
          class="text-capitalize cardCss"
          height="40"
        >
          <v-icon class="mr-2">mdi-content-save</v-icon>
          Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import { get_master_loactiontype } from "@/mixins/GetMasterlocationtype";
import CountryList from "@/JsonFiles/CountryList.json";
import { get_project_site } from "@/mixins/GetProjectsite.js";
import { edit_location } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { get_asset_reatilers } from "@/mixins/GetAssetRetailers.js";
import { get_master_terittory } from "@/mixins/GetMasterTerritory";
import GoogleMaps from "@/components/GoogleMaps.vue";
import GoogleAddressAutocomplete from "@/components/GoogleAddressAutocomplete.vue";

export default {
  components: {
    GoogleMaps,
    GoogleAddressAutocomplete,
  },
  props: {
    locationViewDialog: Boolean,
    rowInfo: Object,
  },
  mixins: [
    get_master_terittory,
    get_asset_reatilers,
    get_asset_distributors,
    get_master_loactiontype,
    get_project_site,
  ],
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      mapMarkers: [],
      mapCenter: { lat: 0, lng: 0 },
      places: [],
      currentPlace: null,
      loading1: false,
      countryitems: [],
      territory: "",
      selectRetailer: "",
      selectprojectsite: "",
      selectDistributor: "",
      distribuorList: [],
      projectsiteList: [],
      retailerItems: [],
      territoryitems: [],
      searchLocation: "",
      locationAddress: "",
      locationState: "",
      geoLongitude: "",
      districtItems: [],
      geoLattitude: "",
      countryData: "",
      locationPincode: "",
      locationDistrict: "",
      locationType: "",
      loading: false,
      locationitems: [],
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
      googleApiKey: "AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI",
    };
  },
  computed: {
    isFormValid() {
      // Basic required fields validation
      const basicRequired =
        this.locationType && this.geoLattitude && this.geoLongitude;

      // Conditional validation based on location type
      let conditionalValid = true;
      if (this.locationType === "RETAILER") {
        conditionalValid = !!this.selectRetailer;
      } else if (this.locationType === "DISTRIBUTOR") {
        conditionalValid = !!this.selectDistributor;
      }

      return basicRequired && conditionalValid;
    },
  },
  watch: {
    locationViewDialog: {
      async handler() {
        if (this.locationViewDialog == true) {
          await this.initializeDialog();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async initializeDialog() {
      try {
        await Promise.all([
          this.get_master_terittory(),
          this.get_asset_distributors(),
          this.get_project_site(),
          this.get_asset_reatilers(),
          this.get_master_loactiontype(),
        ]);

        this.fetch_details();
        this.loadLocationData();
      } catch (error) {
        console.error("Error initializing dialog:", error);
        this.$emit(
          "errorMsg",
          "Failed to initialize dialog. Please try again."
        );
      }
    },

    loadLocationData() {
      // Load territory data
      this.territory = this.rowInfo.territory_id || "";

      // Load distributor data
      this.selectDistributor = this.rowInfo.distributor_id || "";

      // Load retailer data
      this.selectRetailer = this.rowInfo.retailer_id || "";

      // Load location data if coordinates exist
      if (this.rowInfo.geo_lat != null && this.rowInfo.geo_long != null) {
        this.locationPincode =
          this.rowInfo.location_pincode && this.rowInfo.location_pincode !== 0
            ? this.rowInfo.location_pincode.toString()
            : "";

        if (this.locationPincode !== "") {
          this.fetchPinData();
        }

        this.countryData = this.rowInfo.location_country || "";
        this.locationState = this.rowInfo.location_state || "";
        this.locationDistrict = this.rowInfo.location_district || "";
        this.locationAddress = this.rowInfo.location_address || "";
        this.geoLattitude = this.rowInfo.geo_lat;
        this.geoLongitude = this.rowInfo.geo_long;
        this.locationType = this.rowInfo.location_type;

        // Set up map marker
        this.mapMarkers = [];
        var marker = {
          position: {
            lat: Number(this.rowInfo.geo_lat),
            lng: Number(this.rowInfo.geo_long),
          },
        };
        this.mapCenter = marker.position;
        this.mapMarkers = [marker];
      }
    },

    onMapsLoaded(google) {
      // Map loaded callback
    },

    onMarkerClick(markerData) {
      this.mapCenter = markerData.position;
    },

    fetch_details() {
      this.territoryitems = [];
      this.retailerItems = [];
      this.distribuorList = [];
      this.projectsiteList = [];
      this.locationitems = [];
      this.countryitems = [];

      if (this.siteProject) {
        this.siteProject.forEach((element) => {
          this.projectsiteList.push({
            text: element.project_site_name,
            value: element.project_site_id,
          });
        });
      }

      if (this.masterlocationtype) {
        this.masterlocationtype.forEach((element) => {
          this.locationitems.push({
            text: element.location_type,
            value: element.location_type,
          });
        });
      }

      if (this.orgTerittory) {
        this.orgTerittory.forEach((element) => {
          this.territoryitems.push({
            text: element.territory_name,
            value: element.territory_id,
          });
        });
      }

      this.distribuorList = this.masterAssetDistributors || [];
      this.retailerItems = this.masterAssetRetailers || [];

      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name,
          code: element.name,
        });
      });
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

    async fetchPinData() {
      if (!this.locationPincode || this.locationPincode.length !== 6) {
        this.$emit(
          "errorMsg",
          "Please enter a valid 6-digit Postal Index Number"
        );
        return;
      }

      this.districtItems = [];
      this.loading1 = true;

      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${this.locationPincode}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data[0] || data[0].Status !== "Success") {
          throw new Error("Invalid pincode or no data found");
        }

        var masterArray = data[0].PostOffice;

        if (!masterArray || masterArray.length === 0) {
          throw new Error("No post office data found for this pincode");
        }

        // Deduplicate districts and states
        this.districtItems = [
          ...new Set(masterArray.map((element) => element.District)),
        ];
        this.locationDistrict = data[0].PostOffice[0].District;
        this.locationState = data[0].PostOffice[0].State;

        // this.$emit("successMsg", "Pincode data fetched successfully");
      } catch (err) {
        console.error("Error fetching pincode data:", err);
        this.$emit("errorMsg", err.message || "Failed to fetch pincode data");
        this.locationPincode = "";
        this.locationDistrict = "";
        this.locationState = "";
      } finally {
        this.loading1 = false;
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },

    setPlace(placeData) {
      if (placeData && placeData.location) {
        this.currentPlace = placeData.place;
        this.searchLocation = placeData.formatted_address;

        // Add marker to map - use Vue.set or spread operator to ensure reactivity
        this.mapMarkers = [];
        var marker = {
          position: {
            lat: placeData.location.lat,
            lng: placeData.location.lng,
          },
        };
        this.mapMarkers = [marker]; // Force reactivity by creating new array
        this.geoLattitude = marker.position.lat;
        this.geoLongitude = marker.position.lng;

        // Update map center to the new marker
        this.mapCenter = marker.position;

        // Update address if available
        if (placeData.formatted_address) {
          this.locationAddress = placeData.formatted_address;
        }
      } else {
        this.$emit(
          "errorMsg",
          "Please select a valid location from the search results"
        );
      }
    },

    clearField() {
      this.searchLocation = "";

      // Check if currentPlace exists before trying to add marker
      if (
        this.currentPlace &&
        this.currentPlace.geometry &&
        this.currentPlace.geometry.location
      ) {
        this.add_Marker();
      } else {
        this.$emit(
          "errorMsg",
          "Please select a location from the search results first"
        );
      }
    },

    add_Marker() {
      // Add null check for currentPlace
      if (
        !this.currentPlace ||
        !this.currentPlace.geometry ||
        !this.currentPlace.geometry.location
      ) {
        console.error("No valid place selected");
        this.$emit(
          "errorMsg",
          "Please select a valid location from the search results"
        );
        return;
      }

      this.mapMarkers = [];
      var marker = {
        position: {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng(),
        },
      };
      this.mapMarkers = [marker]; // Force reactivity by creating new array
      this.geoLattitude = marker.position.lat;
      this.geoLongitude = marker.position.lng;

      // Update map center to the new marker
      this.mapCenter = marker.position;

      // Update address if available
      if (this.currentPlace.formatted_address) {
        this.locationAddress = this.currentPlace.formatted_address;
      }
    },

    callposition(latLng) {
      this.mapMarkers = [];
      var marker = {
        position: {
          lat: latLng.lat,
          lng: latLng.lng,
        },
      };
      this.mapMarkers = [marker]; // Force reactivity by creating new array
      this.geoLattitude = marker.position.lat;
      this.geoLongitude = marker.position.lng;

      // Update map center to the new marker position
      this.mapCenter = marker.position;
    },

    async validate_data() {
      try {
        const { valid } = await this.$refs.form.validate();
        if (valid) {
          await this.edit_location_view();
        } else {
          this.$emit(
            "errorMsg",
            "Please fill in all required fields correctly"
          );
        }
      } catch (error) {
        console.error("Form validation error:", error);
        this.$emit(
          "errorMsg",
          "Form validation failed. Please check your inputs."
        );
      }
    },

    async edit_location_view() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_location, {
            location_id: this.rowInfo.location_id,
            geo_lat: this.geoLattitude,
            geo_long: this.geoLongitude,
            location_address: this.locationAddress,
            location_pincode:
              this.locationPincode == ""
                ? 0
                : this.countryData == "India"
                ? Number(this.locationPincode)
                : 0,
            location_state: this.locationState,
            location_country: this.countryData,
            location_district:
              this.countryData == "India" ? this.locationDistrict : "",
            location_type: this.locationType,
            territory_id: this.territory,
            distributor_id: this.selectDistributor,
            retailer_id: this.selectRetailer,
          })
        );

        // var response = JSON.parse(result.data.edit_location);

        // if (response.Status == "SUCCESS") {
        if(result){
          this.$emit(
            "successMsg",
            "Location updated successfully"
          );
          this.close_dialog();
        }
         
        // } else {
        //   this.$emit(
        //     "errorMsg",
        //     response.Message || "Failed to update location"
        //   );
        // }
      } catch (error) {
        console.error("Error updating location:", error);
        const errorMessage =
          error.errors && error.errors[0]
            ? error.errors[0].message
            : "Failed to update location. Please try again.";
        this.$emit("errorMsg", errorMessage);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  backdrop-filter: blur(3px);
}

.dialog-card {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.search-toolbar {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 20px;
  position: relative;
}

.search-toolbar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
}

.location-search-input {
  min-width: 450px;
  margin-right: 12px;
}

.search-btn {
  border-radius: 8px;
  font-weight: 500;
}

.dialog-content {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.map-section {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  position: relative;
  min-height: 450px;
}

.map-section .v-alert {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 5;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  height: fit-content;
  position: relative;
  max-height: 600px;
  overflow-y: auto;
}

.form-section::-webkit-scrollbar {
  width: 6px;
}

.form-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.form-section::-webkit-scrollbar-thumb {
  background: #db4c77;
  border-radius: 3px;
}

.form-section::-webkit-scrollbar-thumb:hover {
  background: #c73e6b;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #db4c77;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #fce4ec;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #db4c77;
  border-radius: 2px;
}

.section-title b {
  font-weight: 600;
}

.dialog-actions {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* Ensure the card has proper spacing */
.v-card-text {
  padding: 0;
}

/* Make sure toolbar styling is preserved */
.navBar {
  background: #f8f9fa !important;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navBar .custom-title {
  color: black !important;
  font-weight: 600;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.navBar .icon-class {
  color: black !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.navBar .icon-class:hover {
  transform: scale(1.1);
  color: #db4c77 !important;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 4px;
}

/* Form field enhancements */
.v-text-field,
.v-select,
.v-autocomplete,
.v-textarea {
  margin-bottom: 8px;
}

.v-text-field .v-field,
.v-select .v-field,
.v-autocomplete .v-field,
.v-textarea .v-field {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.v-text-field .v-field:hover,
.v-select .v-field:hover,
.v-autocomplete .v-field:hover,
.v-textarea .v-field:hover {
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.15);
}

.v-text-field .v-field--focused,
.v-select .v-field--focused,
.v-autocomplete .v-field--focused,
.v-textarea .v-field--focused {
  box-shadow: 0 0 0 2px rgba(219, 76, 119, 0.2);
  border-color: #db4c77;
}

/* Readonly field styling */
.v-text-field .v-field--readonly {
  background-color: #f5f5f5;
  opacity: 0.8;
}

/* Error state styling */
.v-text-field .v-field--error,
.v-select .v-field--error,
.v-autocomplete .v-field--error,
.v-textarea .v-field--error {
  border-color: #ff5252;
  box-shadow: 0 0 0 2px rgba(255, 82, 82, 0.2);
}

/* Success state styling */
.v-text-field .v-field--success,
.v-select .v-field--success,
.v-autocomplete .v-field--success,
.v-textarea .v-field--success {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

/* Button enhancements */
.v-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
  height: 40px !important;
  align-items: center;
  display: inline-flex;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.v-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.cardCss {
  background: #db4c77;
  border-radius: 8px;
}

.button-corner {
  border-radius: 8px;
  padding: 0 24px;
  font-weight: 600;
}

/* Alert styling */
.v-alert {
  margin-bottom: 16px;
  border-radius: 8px;
  border-left: 4px solid #db4c77;
}

.v-alert--info {
  background: rgba(33, 150, 243, 0.1);
  border-left-color: #2196f3;
}

.v-alert--success {
  background: rgba(76, 175, 80, 0.1);
  border-left-color: #4caf50;
}

.v-alert--warning {
  background: rgba(255, 193, 7, 0.1);
  border-left-color: #ffc107;
}

.v-alert--error {
  background: rgba(244, 67, 54, 0.1);
  border-left-color: #f44336;
}

/* Responsive adjustments */
@media (max-width: 1600px) {
  .dialog-card {
    width: 95%;
    max-width: 1000px;
    max-height: 80vh;
    margin: 20px;
  }

  .location-search-input {
    min-width: 350px;
  }

  .dialog-content {
    padding: 12px;
    max-height: calc(80vh - 200px);
    overflow-y: auto;
  }

  .map-section,
  .form-section {
    padding: 8px;
  }
}

@media (max-width: 1200px) {
  .dialog-card {
    width: 95%;
    max-width: 1200px;
  }

  .location-search-input {
    min-width: 300px;
  }
}

@media (max-width: 992px) {
  .dialog-card {
    width: 98%;
    max-width: 1000px;
  }

  .location-search-input {
    min-width: 250px;
  }

  .v-col {
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .dialog-card {
    width: 100%;
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .location-search-input {
    min-width: 200px;
  }

  .dialog-content {
    padding: 8px;
  }

  .map-section,
  .form-section {
    padding: 8px;
    margin-bottom: 8px;
  }

  .section-title {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .dialog-actions {
    padding: 8px;
    flex-direction: column;
    gap: 8px;
  }

  .dialog-actions .v-btn {
    width: 100%;
    margin: 0;
  }

  .v-btn {
    font-size: 12px;
    padding: 8px 16px;
  }
}

/* Scrollbar styling */
.dialog-card::-webkit-scrollbar {
  width: 8px;
}

.dialog-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.dialog-card::-webkit-scrollbar-thumb {
  background: #db4c77;
  border-radius: 4px;
}

.dialog-card::-webkit-scrollbar-thumb:hover {
  background: #c73e6b;
}

/* Print styles */
@media print {
  .dialog-backdrop,
  .dialog-actions,
  .search-toolbar {
    display: none !important;
  }

  .dialog-card {
    position: static;
    transform: none;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .dialog-card {
    border: 2px solid #000;
  }

  .v-btn {
    border: 1px solid #000;
  }

  .v-text-field .v-field,
  .v-select .v-field,
  .v-autocomplete .v-field,
  .v-textarea .v-field {
    border: 1px solid #000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .dialog-card {
    animation: none;
  }

  .v-btn:hover {
    transform: none;
  }

  .navBar .icon-class:hover {
    transform: none;
  }
}
</style>