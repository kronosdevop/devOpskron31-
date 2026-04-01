<template>
  <div>
    <!-- Backdrop overlay -->
    <div
      v-if="addGeoLocationDialog"
      class="dialog-backdrop"
      @click="close_dialog()"
    ></div>

    <!-- Card with dialog-like styling -->
    <v-card
      v-if="addGeoLocationDialog"
      class="dialog-card"
      elevation="24"
      max-width="600"
    >
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text-black ml-2">
          <div class="custom-title">Add Geo Location</div></v-toolbar-title
        >
        <v-spacer />

        <v-icon class="icon-class mr-4" @click="close_dialog()"
          >mdi-close</v-icon
        >
      </v-toolbar>
      <v-toolbar dense flat class="bg-white search-toolbar">
        <GoogleAddressAutocomplete
          v-model="search"
          :api-key="googleApiKey"
          class="location-search-input"
          @callback="setPlace"
          placeholder="Search Location"
        />
        <v-btn
          dark
          size="small"
          class="ml-2 white--text cardCss"
          @click="clearField()"
        >
          Go
        </v-btn>
        <v-btn
          v-if="polygonPaths.length != 0"
          dark
          small
          class="pa-0 ml-2 white--text cardCss"
          @click="clearpolyarray()"
          >Clear</v-btn
        >
      </v-toolbar>
      <v-card-text class="dialog-content">
        <div class="map-section">
          <GoogleMaps
            ref="googleMapsMain"
            :center="mapCenter"
            :zoom="zoom"
            :markers="mapMarkers"
            :draggable="true"
            map-height="250px"
            @maps-loaded="onMapsLoaded"
            @place-changed="setPlace"
            @marker-dragend="callposition"
            @marker-click="onMarkerClick"
            @map-click="placeMarker"
          />
        </div>

        <div class="form-section mt-3">
          <div class="section-title">
            <v-icon class="mr-2">mdi-map-marker</v-icon>
            <b>Location Details</b>
          </div>

          <v-row no-gutters>
            <v-col cols="6" class="mt-1">
              <v-text-field
                density="compact"
                class=""
                v-model="geoLattitude"
                :rules="[(v) => !!v || 'required ']"
                label="Latitude*"
                variant="outlined"
                prepend-inner-icon="mdi-latitude"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="6" class="mt-1">
              <v-text-field
                density="compact"
                class="ml-2"
                v-model="geoLongitude"
                :rules="[(v) => !!v || 'required ']"
                label="Longitude*"
                variant="outlined"
                prepend-inner-icon="mdi-longitude"
                readonly
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="mt-1">
              <v-textarea
                density="compact"
                rows="2"
                auto-grow
                v-model="locationAddress"
                label="Location Address"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                readonly
              ></v-textarea>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions class="justify-end dialog-actions">
        <v-btn
          dark
          @click="validate_data()"
          :loading="loading"
          class="text-capitalize cardCss"
          size="small"
        >
          <v-icon class="mr-2">mdi-plus</v-icon>
          Add Location
        </v-btn>
      </v-card-actions>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/* eslint-disable */
// import { gmapApi } from "vue2-google-maps";
// import { GoogleMap } from 'vue3-google-map';
import SnackBar from "@/components/SnackBar.vue";
import GoogleMaps from "@/components/GoogleMaps.vue";
import GoogleAddressAutocomplete from "@/components/GoogleAddressAutocomplete.vue";

export default {
  props: {
    addGeoLocationDialog: Boolean,
    location_type: String,
  },
  components: {
    SnackBar,
    GoogleMaps,
    GoogleAddressAutocomplete,
  },
  data() {
    return {
      SnackBarComponent: {},
      zoom: 8,
      polygonPaths: [],
      locationName: "",
      geoLattitude: "",
      geoLongitude: "",
      loading: false,
      search: "",
      search1: "",
      currentPlace: null,
      markers: [],
      locationHead: "",
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
      latt: "",
      longg: "",
      mapMarkers: [],
      mapCenter: { lat: 0, lng: 0 },
      locationAddress: "",
      googleApiKey: "AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI",
    };
  },

  methods: {
    onMapsLoaded(google) {
      // console.log("Google Maps loaded successfully");
    },

    onMarkerClick(markerData) {
      this.mapCenter = markerData.position;
    },

    clearpolyarray() {
      this.polygonPaths = [];
    },
    async initMap() {
      await GoogleMap.loaded();
      this.map = this.$refs.map.$mapObject;
    },
    placeMarker(event) {
      this.polygonPaths.push({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    },
    updatePolygon(event) {
      const newPaths = event
        .getPath()
        .getArray()
        .map((vertex) => ({ lat: vertex.lat(), lng: vertex.lng() }));
      this.polygonPaths = newPaths;
    },
    clearField() {
      this.search = "";

      // Check if currentPlace exists before trying to add marker
      if (
        this.currentPlace &&
        this.currentPlace.geometry &&
        this.currentPlace.geometry.location
      ) {
        this.addMarker();
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            "Please select a location from the search results first",
          timeout: 2000,
          Top: true,
        };
      }
    },
    addMarker() {
      if (this.currentPlace) {
        // this.locationName = this.currentPlace.formatted_address;
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

        // Update map center
        this.mapCenter = marker.position;
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

      // Update map center
      this.mapCenter = marker.position;
    },

    setPlace(placeData) {
      // console.log("Place selected:", placeData);

      if (placeData && placeData.location) {
        this.currentPlace = placeData.place;
        this.search = placeData.formatted_address;

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

        // console.log("Marker added:", marker);
      } else {
        console.warn("No valid place data received");
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            "Please select a valid location from the search results",
          timeout: 2000,
          Top: true,
        };
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
      // this.$refs.form.resetValidation();
      this.locationName = "";
      this.mapMarkers = [];
      this.geoLattitude = "";
      this.geoLongitude = "";
      this.search = "";
      this.locationAddress = "";
    },

    validate_data() {
      if (!this.currentPlace || !this.currentPlace.formatted_address) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please select a valid location before saving.",
          timeout: 2000,
          Top: true,
        };
        return;
      }

      const locationData = {
        location_type: this.location_type,
        address_Detail: this.currentPlace.formatted_address,
        geo_lat: this.geoLattitude,
        geo_long: this.geoLongitude,
      };
      this.$emit("savelocation", locationData);
      this.locationName = "";
      this.mapMarkers = [];
      this.geoLattitude = "";
      this.geoLongitude = "";
      this.search = "";
      this.locationAddress = "";
      this.currentPlace = null;
      this.polygonPaths = [];
      this.mapCenter = { lat: 0, lng: 0 };
      this.mapMarkers = [];
      this.geoLattitude = "";
      this.geoLongitude = "";
      this.search = "";
      this.locationAddress = "";
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
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-toolbar {
  border-bottom: 1px solid #e0e0e0;
  padding: 6px 16px;
}

.location-search-input {
  min-width: 350px;
  margin-right: 8px;
}

.dialog-content {
  padding: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.map-section {
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  height: fit-content;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #db4c77;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid #fce4ec;
}

.section-title b {
  font-weight: 600;
}

.dialog-actions {
  padding: 12px 16px;
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

.navBar .custom-title {
  color: black !important;
  font-weight: 600;
  font-size: 16px;
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
  margin-bottom: 6px;
}

.v-text-field .v-field,
.v-select .v-field,
.v-autocomplete .v-field,
.v-textarea .v-field {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.v-text-field .v-field:hover,
.v-select .v-field:hover,
.v-autocomplete .v-field:hover,
.v-textarea .v-field:hover {
  box-shadow: 0 2px 6px rgba(219, 76, 119, 0.15);
}

.v-text-field .v-field--focused,
.v-select .v-field--focused,
.v-autocomplete .v-field--focused,
.v-textarea .v-field--focused {
  box-shadow: 0 0 0 2px rgba(219, 76, 119, 0.2);
}

/* Button enhancements */
.v-btn {
  border-radius: 6px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
  height: 36px !important;
  align-items: center;
  display: inline-flex;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.button-corner {
  border-radius: 6px;
  padding: 0 20px;
  font-weight: 600;
}

/* Alert styling */
.v-alert {
  border-radius: 6px;
  border-left: 4px solid #db4c77;
}

/* Responsive adjustments */
@media (max-width: 1600px) {
  .dialog-card {
    width: 90%;
    max-width: none;
    margin: 16px;
  }

  .location-search-input {
    min-width: 280px;
  }

  .dialog-content {
    padding: 8px;
  }

  .map-section,
  .form-section {
    padding: 6px;
  }
}

@media (max-width: 768px) {
  .dialog-card {
    width: 95%;
    max-width: none;
    margin: 8px;
    max-height: 90vh;
  }

  .location-search-input {
    min-width: 180px;
  }

  .dialog-content {
    padding: 6px;
  }

  .map-section,
  .form-section {
    padding: 4px;
    margin-bottom: 8px;
  }

  .section-title {
    font-size: 11px;
  }

  .dialog-actions {
    padding: 8px 6px;
  }

  .v-btn {
    font-size: 11px;
    padding: 4px 12px;
  }
}

/* Scrollbar styling */
.dialog-card::-webkit-scrollbar {
  width: 6px;
}

.dialog-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-card::-webkit-scrollbar-thumb {
  background: #db4c77;
  border-radius: 3px;
}

.dialog-card::-webkit-scrollbar-thumb:hover {
  background: #c73e6b;
}

/* Animation for card appearance */
.dialog-card {
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
</style>