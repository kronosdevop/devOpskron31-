<template>
  <v-dialog
    v-model="dialogVisible"
    persistent
    max-width="1400"
    transition="dialog-top-transition"
    style="z-index: 1000;"
  >
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">Add Location</span>
        <v-btn icon variant="text" @click="close_dialog" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text class="px-4 py-3">
        <!-- Search Location Toolbar -->
        <div class="d-flex align-center mb-4">
          <div class="flex-grow-1">
            <GoogleAddressAutocomplete
              v-model="searchLocation"
              :api-key="googleApiKey"
              class="location-search-input"
              @callback="setPlace"
              placeholder="Search Location (select from dropdown)"
            />
            <div class="text-caption text-grey mt-1">
              <v-icon size="12" class="mr-1">mdi-information-outline</v-icon>
              Type and select a location from the dropdown suggestions
            </div>
          </div>
          <v-btn
            dark
            small
            class="pa-0 ml-2 white--text cardCss search-btn"
            @click="clearField()"
            :disabled="!currentPlace"
          >
            Go
          </v-btn>
        </div>

        <v-form ref="addLocationForm">
          <v-row>
            <v-col cols="6">
              <div class="map-section">
                <GoogleMaps
                  v-if="dialogVisible && mapReady"
                  :key="'map-' + mapKey"
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
                  <v-icon class="mr-2">mdi-map-marker</v-icon>
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
                      label="Location Type*"
                      :rules="[(v) => !!v || 'Location type is required']"
                      :items="locationitems"
                      item-title="text"
                      item-value="value"
                      @update:model-value="clearvalue"
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
                      :items="retailerItems"
                      :rules="
                        locationType == 'RETAILER'
                          ? [(v) => !!v || 'Retailer selection is required']
                          : []
                      "
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
                      label="Select Distributor*"
                      :items="distribuorList"
                      :rules="
                        locationType == 'DISTRIBUTOR'
                          ? [(v) => !!v || 'Distributor selection is required']
                          : []
                      "
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
                      v-if="locationType != 'PROJECT SITE'"
                      v-model="territory"
                      :items="territoryitems"
                      label="Territory"
                      item-title="text"
                      item-value="value"
                      prepend-inner-icon="mdi-earth"
                      clearable
                    />
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-text-field
                      density="compact"
                      v-model="locationName"
                      label="Location Name*"
                      :rules="[(v) => !!v || 'Location name is required']"
                      variant="outlined"
                      prepend-inner-icon="mdi-map-marker"
                      clearable
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6" class="mt-2">
                    <v-text-field
                      density="compact"
                      class=""
                      v-model="geoLattitude"
                      :rules="[(v) => !!v || 'Latitude is required']"
                      label="Latitude*"
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
                      :rules="[(v) => !!v || 'Longitude is required']"
                      label="Longitude*"
                      variant="outlined"
                      prepend-inner-icon="mdi-longitude"
                      readonly
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="mt-2">
                    <v-autocomplete
                      density="compact"
                      v-model="locationHead"
                      label="Location Head*"
                      :items="masterUsers"
                      item-title="label"
                      item-value="value"
                      :rules="[(v) => !!v || 'Location head is required']"
                      variant="outlined"
                      hide-no-data
                      hide-selected
                      prepend-inner-icon="mdi-account"
                      clearable
                    />
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

      <v-divider></v-divider>
      <v-card-actions class="px-4 py-3 justify-end">
        <v-btn text @click="close_dialog" size="small">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :loading="loading"
          :disabled="!isAddFormValid"
          @click="validate_add_data()"
          size="small"
        >
          <v-icon class="mr-2">mdi-plus</v-icon>
          Add Location
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/* eslint-disable */
import { get_master_loactiontype } from "@/mixins/GetMasterlocationtype";
import { get_master_terittory } from "@/mixins/GetMasterTerritory";
import { get_project_site } from "@/mixins/GetProjectsite.js";
import { create_locations } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_users } from "@/mixins/GetAllUsers.js";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { get_asset_reatilers } from "@/mixins/GetAssetRetailers.js";
import CountryList from "@/JsonFiles/CountryList.json";
import GoogleMaps from "@/components/GoogleMaps.vue";
import GoogleAddressAutocomplete from "@/components/GoogleAddressAutocomplete.vue";

export default {
  components: {
    GoogleMaps,
    GoogleAddressAutocomplete,
  },
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:dialog", "close", "errorMsg", "successMsg"],
  mixins: [
    get_all_users,
    get_master_terittory,
    get_project_site,
    get_asset_reatilers,
    get_asset_distributors,
    get_master_loactiontype,
  ],
  data() {
    return {
      locationName: "",
      selectprojectsite: "",
      projectsiteList: [],
      territory: "",
      selectRetailer: "",
      selectDistributor: "",
      distribuorList: [],
      retailerItems: [],
      territoryitems: [],
      loading1: false,
      geoLattitude: "",
      geoLongitude: "",
      loading: false,
      searchLocation: "",
      currentPlace: null,
      mapMarkers: [],
      mapCenter: { lat: 0, lng: 0 },
      locationHead: "",
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
      masterUsers: [],
      locationType: "",
      locationDistrict: "",
      locationCountry: "",
      locationAddress: "",
      locationPincode: "",
      locationState: "",
      countryitems: [],
      districtItems: [],
      stateItems: [],
      locationitems: [],
      countryData: "",
      googleApiKey: "AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI",
      mapReady: false,
      mapKey: 0,
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.dialog;
      },
      set(value) {
        this.$emit("update:dialog", value);
      },
    },
    isAddFormValid() {
      // Basic required fields validation
      const basicRequired =
        this.locationName &&
        this.locationType &&
        this.locationHead &&
        this.geoLattitude &&
        this.geoLongitude;

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
    dialog: {
      async handler(newVal) {
        if (newVal === true) {
          this.mapReady = false;
          await this.initializeDialog();
          // Wait for dialog to be fully rendered before initializing map
          await this.$nextTick();
          // Additional delay to ensure dialog transition completes
          setTimeout(() => {
            this.mapReady = true;
            this.mapKey += 1;
          }, 300);
        } else {
          this.mapReady = false;
          this.resetForm();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async initializeDialog() {
      try {
        this.locationHead = "";
        await Promise.all([
          this.get_master_terittory(),
          this.get_project_site(),
          this.get_asset_distributors(),
          this.get_asset_reatilers(),
          this.get_all_users(),
          this.get_master_loactiontype(),
        ]);

        this.fetch_users();
        this.resetFormData();
        this.fetch_details();
      } catch (error) {
        console.error("Error initializing dialog:", error);
        this.$emit(
          "errorMsg",
          "Failed to initialize dialog. Please try again."
        );
      }
    },

    resetFormData() {
      this.locationPincode = "";
      this.locationCountry = "";
      this.countryData = "";
      this.locationState = "";
      this.locationDistrict = "";
      this.locationAddress = "";
      this.locationName = "";
      this.locationType = "";
      this.selectRetailer = "";
      this.selectDistributor = "";
      this.territory = "";
      this.geoLattitude = "";
      this.geoLongitude = "";
      this.searchLocation = "";
      this.currentPlace = null;
      this.mapMarkers = [];
      this.mapCenter = { lat: 0, lng: 0 };
      this.districtItems = [];
      this.stateItems = [];
      this.locationHead = "";
      this.mapReady = false;
    },

    resetForm() {
      this.resetFormData();
      if (this.$refs.addLocationForm) {
        this.$refs.addLocationForm.resetValidation();
      }
    },

    onMapsLoaded(google) {
      // Map loaded callback
    },

    onMarkerClick(markerData) {
      this.mapCenter = markerData.position;
    },

    fetch_details() {
      this.countryitems = [];
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name,
          code: element.name,
        });
      });
    },

    fetch_users() {
      this.masterUsers = [];
      this.territoryitems = [];
      this.retailerItems = [];
      this.projectsiteList = [];
      this.locationitems = [];
      this.distribuorList = [];

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

      if (this.listUsers) {
        this.listUsers.forEach((element) => {
          if (element.user_type != "CHATBOT") {
            this.masterUsers.push({
              label: element.full_user_name,
              value: element.user_id,
            });
          }
        });
        this.masterUsers.sort((a, b) => a.label.localeCompare(b.label));
        if (this.masterUsers.length == 1) {
          this.locationHead = this.masterUsers[0].value;
        }
      }
    },

    setPlace(placeData) {
      console.log("setPlace called with:", placeData);
      
      if (!placeData) {
        this.$emit(
          "errorMsg",
          "No location data received. Please select a location from the dropdown suggestions."
        );
        return;
      }

      if (!placeData.location) {
        console.error("Place data missing location:", placeData);
        this.$emit(
          "errorMsg",
          "Selected location has no coordinates. Please try selecting a different location from the suggestions."
        );
        return;
      }

      try {
        this.currentPlace = placeData.place;
        this.searchLocation = placeData.formatted_address || placeData.name || "";

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
        } else if (placeData.name) {
          this.locationAddress = placeData.name;
        }

        console.log("Location set successfully:", {
          lat: this.geoLattitude,
          lng: this.geoLongitude,
          address: this.locationAddress
        });
      } catch (error) {
        console.error("Error setting place:", error);
        this.$emit(
          "errorMsg",
          "Error processing location. Please try again or select a different location."
        );
      }
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
      this.dialogVisible = false;
      this.$emit("close");
      this.resetForm();
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

    clearvalue() {
      this.selectDistributor = "";
      this.selectRetailer = "";
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

    async validate_add_data() {
      try {
        const { valid } = await this.$refs.addLocationForm.validate();
        if (valid) {
          await this.create_master_locations();
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

    async create_master_locations() {
      this.loading = true;

      try {
        var data = this.$store.getters.GetUserObj;

        if (!data || !data.organization || !data.user) {
          throw new Error("User data not available");
        }

        let result = await API.graphql(
          graphqlOperation(create_locations, {
            input: {
              location_name: this.locationName,
              geo_lat:
                this.geoLattitude == ""
                  ? undefined
                  : this.geoLattitude.toString(),
              geo_long:
                this.geoLongitude == ""
                  ? undefined
                  : this.geoLongitude.toString(),
              location_pincode:
                this.locationPincode == "" ? 0 : this.locationPincode,
              location_state: this.locationState,
              location_country: this.countryData,
              location_district: this.locationDistrict,
              location_address: this.locationAddress,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              location_head: this.locationHead,
              location_type: this.locationType,
              distributor_id: this.selectDistributor,
              retailer_id: this.selectRetailer,
              territory_id: this.territory,
            },
          })
        );

        var response = JSON.parse(result.data.create_locations);

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.close_dialog();
        } else {
          this.$emit(
            "errorMsg",
            response.Message || "Failed to create location"
          );
        }
      } catch (error) {
        console.error("Error creating location:", error);
        const errorMessage =
          error.errors && error.errors[0]
            ? error.errors[0].message
            : "Failed to create location. Please try again.";
        this.$emit("errorMsg", errorMessage);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
}

.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}

.v-btn[variant="text"] {
  color: #888;
}

.location-search-input {
  min-width: 450px;
  margin-right: 12px;
  flex: 1;
}

.search-btn {
  border-radius: 8px;
  font-weight: 500;
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
@media (max-width: 1200px) {
  .location-search-input {
    min-width: 300px;
  }

  .map-section,
  .form-section {
    padding: 8px;
  }
}

@media (max-width: 992px) {
  .location-search-input {
    min-width: 250px;
  }

  .v-col {
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .location-search-input {
    min-width: 200px;
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
}
</style>

