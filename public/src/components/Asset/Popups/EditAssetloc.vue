<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="locationViewDialog"
      @update:model-value="locationViewDialog = $event"
      persistent
      transition="dialog-bottom-transition"
      max-width="800"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Edit Location for {{ rowInfo.asset_location_name }}
            </div></v-toolbar-title
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
            class="pa-0 ml-2 text-white cardCss"
            @click="clearField()"
          >
            Go
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <gmap-map
                :center="
                  markers[0] != undefined ? markers[0].position : defaultCenter
                "
                :zoom="12"
                style="height: 300px"
              >
                <gmap-marker
                  :key="index"
                  v-for="(m, index) in markers"
                  :position="m.position"
                  :clickable="true"
                  :title="m.title"
                  :draggable="true"
                  @dragend="callposition"
                  @click="center = m.position"
                ></gmap-marker>
              </gmap-map>
            </v-col>
            <v-col cols="6">
              <v-form ref="form">
                <v-row no-gutters>
                  <v-col cols="12"
                    ><i
                      >To update the latitude and longitude, click GO once the
                      location is entered</i
                    >
                  </v-col>
                  <!-- <v-col cols="2"> </v-col> -->

                  <v-col class="mt-3" cols="6">
                    <v-text-field
                      class=""
                      v-model="geoLattitude"
                      label="Lattitude"
                      :rules="[(v) => !!v || 'required ']"
                      density="compact"
                      variant="outlined"                    ></v-text-field>
                  </v-col>
                  <v-col class="mt-3" cols="6">
                    <v-text-field
                      class="ml-2"
                      v-model="geoLongitude"
                      label="Longitude"
                      :rules="[(v) => !!v || 'required ']"
                      density="compact"
                      variant="outlined"                    ></v-text-field>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-textarea
                      rows="0"
                      auto-grow
                      v-model="locationAddress"
                      label="Location Address"
                      density="compact"
                      variant="outlined"                    ></v-textarea>
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
            >Update</v-btn
          >
        </v-card-actions>
        <!-- <v-card elevation="0" flat height="270px">
           
          </v-card> -->
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import CountryList from "@/JsonFiles/CountryList.json";
import { asset_config_create_list_update_locations } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    locationViewDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      markers: [],
      places: [],
      currentPlace: null,
      loading1: false,
      countryitems: [],
      search: "",
      locationAddress: "",
      locationState: "",
      geoLongitude: "",
      districtItems: [],
      geoLattitude: "",
      countryData: "",
      locationPincode: "",
      locationDistrict: "",
      loading: false,
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
    };
  },
  watch: {
    locationViewDialog: {
      async handler() {
        if (this.locationViewDialog == true) {
          this.fetch_details();
          if (this.rowInfo.geo_lat != null && this.rowInfo.geo_long != null) {
            this.locationPincode =
              this.rowInfo.asset_location_pincode == null ||
              this.rowInfo.asset_location_pincode == undefined ||
              this.rowInfo.asset_location_pincode == 0
                ? ""
                : this.rowInfo.asset_location_pincode;

            if (this.locationPincode != "") {
              this.fetchPinData();
            }
            this.countryData =
              this.rowInfo.asset_location_country == null
                ? ""
                : this.rowInfo.asset_location_country;
            this.locationState =
              this.rowInfo.asset_location_state == null
                ? ""
                : this.rowInfo.asset_location_state;
            this.locationDistrict =
              this.rowInfo.asset_location_district == null
                ? ""
                : this.rowInfo.asset_location_district;
            this.locationAddress =
              this.rowInfo.asset_location_address == null
                ? ""
                : this.rowInfo.asset_location_address;
            this.geoLattitude = this.rowInfo.geo_lat;
            this.geoLongitude = this.rowInfo.geo_long;
            this.markers = [];
            var marker = {
              lat: Number(this.rowInfo.geo_lat),
              lng: Number(this.rowInfo.geo_long),
            };
            this.markers.push({ position: marker });
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_details() {
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
        this.locationDistrict = data[0].PostOffice[0].District;
        this.locationState = data[0].PostOffice[0].State;
      } catch (err) {
        this.loading1 = false;
        this.error = err.message;
        this.locationPincode = "";
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
    setPlace(place) {
      this.currentPlace = place;
    },
    clearField() {
      this.search = null;
      this.add_Marker();
    },
    add_Marker() {
      this.markers = [];
      var marker = {
        lat: this.currentPlace.geometry.location.lat(),
        lng: this.currentPlace.geometry.location.lng(),
      };
      this.markers.push({ position: marker });
      this.geoLattitude = marker.lat;
      this.geoLongitude = marker.lng;
    },

    callposition(latLng) {
      this.markers = [];
      var marker = {
        lat: latLng.latLng.lat(),
        lng: latLng.latLng.lng(),
      };
      this.markers.push({ position: marker });
      this.geoLattitude = marker.lat;
      this.geoLongitude = marker.lng;
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_location_view();
      }
    },

    async edit_location_view() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_config_create_list_update_locations, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "UPDATE",
              asset_location_status: "ACTIVE",
              asset_location_id: this.rowInfo.asset_location_id,
              asset_location_lat: this.geoLattitude,
              asset_location_long: this.geoLongitude,
              asset_location_state: this.locationState,
              asset_location_district:
                this.countryData == "India" ? this.locationDistrict : "",
              asset_location_country: this.countryData,
              asset_location_pincode:
                this.countryData == "India" ? Number(this.locationPincode) : 0,
              asset_location_address: this.locationAddress,
            },
          })
        );
        var response = JSON.parse(
          result.data.asset_config_create_list_update_locations
        );
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.$emit("successMsg", response.Message);
        } else {
          this.loading = false;
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