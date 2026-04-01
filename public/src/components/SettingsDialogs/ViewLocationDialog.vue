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
        <span class="font-weight-bold text-h5">
          <v-icon class="mr-2">mdi-map-marker</v-icon>
          Location: {{ rowInfo.location_name }}
        </span>
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

        <v-form ref="form">
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

      <v-divider></v-divider>
      <v-card-actions class="px-4 py-3 justify-end">
        <v-btn text @click="close_dialog" size="small">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :loading="loading"
          :disabled="!isFormValid"
          @click="validate_data()"
          size="small"
        >
          <v-icon class="mr-2">mdi-content-save</v-icon>
          Update
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
import { edit_location } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
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
    rowInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:dialog", "close", "errorMsg", "successMsg"],
  mixins: [
    get_master_terittory,
    get_project_site,
    get_asset_reatilers,
    get_asset_distributors,
    get_master_loactiontype,
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
    dialog(newVal) {
      if (newVal) {
        this.initializeViewLocation();
      } else {
        this.resetViewLocationData();
      }
    },
  },
  methods: {
    async initializeViewLocation() {
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
        
        // Initialize map after a delay to ensure dialog is rendered
        this.$nextTick(() => {
          setTimeout(() => {
            this.mapReady = true;
            this.mapKey++;
          }, 300);
        });
      } catch (error) {
        console.error("Error initializing view location:", error);
        this.error_info("Failed to initialize view location. Please try again.");
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
        this.error_info("Please enter a valid 6-digit Postal Index Number");
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
        this.error_info(err.message || "Failed to fetch pincode data");
        this.locationPincode = "";
        this.locationDistrict = "";
        this.locationState = "";
      } finally {
        this.loading1 = false;
      }
    },

    close_dialog() {
      this.$emit("update:dialog", false);
      this.$emit("close");
      this.resetViewLocationData();
    },

    resetViewLocationData() {
      // Reset all ViewLocation related data
      this.mapMarkers = [];
      this.mapCenter = { lat: 0, lng: 0 };
      this.currentPlace = null;
      this.searchLocation = "";
      this.locationAddress = "";
      this.locationState = "";
      this.geoLongitude = "";
      this.districtItems = [];
      this.geoLattitude = "";
      this.countryData = "";
      this.locationPincode = "";
      this.locationDistrict = "";
      this.locationType = "";
      this.territory = "";
      this.selectRetailer = "";
      this.selectDistributor = "";
      this.mapReady = false;
    },

    setPlace(placeData) {
      console.log("setPlace called with:", placeData);
      
      if (!placeData) {
        this.error_info("No location data received. Please select a location from the dropdown suggestions.");
        return;
      }

      if (!placeData.location) {
        console.error("Place data missing location:", placeData);
        this.error_info("Selected location has no coordinates. Please try selecting a different location from the suggestions.");
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
        this.error_info("Error processing location. Please try again or select a different location.");
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
        this.error_info("Please select a location from the search results first");
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
        this.error_info("Please select a valid location from the search results");
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
          this.error_info("Please fill in all required fields correctly");
        }
      } catch (error) {
        console.error("Form validation error:", error);
        this.error_info("Form validation failed. Please check your inputs.");
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

        if (result) {
          this.success_info("Location updated successfully");
          this.close_dialog();
          this.$emit("successMsg", "Location updated successfully");
        }
      } catch (error) {
        console.error("Error updating location:", error);
        const errorMessage =
          error.errors && error.errors[0]
            ? error.errors[0].message
            : "Failed to update location. Please try again.";
        this.error_info(errorMessage);
        this.$emit("errorMsg", errorMessage);
      } finally {
        this.loading = false;
      }
    },

    error_info(message) {
      this.$emit("errorMsg", message);
    },

    success_info(message) {
      this.$emit("successMsg", message);
    },
  },
};
</script>

<style scoped>
.location-search-input {
  flex: 1;
  margin-right: 8px;
}

.search-btn {
  min-width: 60px;
}

.map-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  color: #333;
  width: 100%;
}

.form-section {
  padding-left: 16px;
}

.cardCss {
  background: #db4c77;
  border-radius: 8px;
}

/* Google Maps styling */
gmp-place-autocomplete::part(input),
.google-address-autocomplete input[type="text"] {
  background-color: white !important;
  color: #333333 !important;
}
</style>

