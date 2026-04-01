<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="addFields"
      @update:model-value="$emit('update:addFields', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Add Location</div></v-toolbar-title
          >
          <v-spacer />

          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-toolbar dense flat>
          <gmap-autocomplete
            class=""
            placeholder="Search Location"
            style="
              border-bottom: 1px solid grey;
              margin-left: 8px;
              width: 480px;
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
          <v-btn
            v-if="polygonPaths.length != 0"
            dark
            small
            class="pa-0 ml-2 white--text cardCss"
            @click="clearpolyarray()"
            >Clear</v-btn
          >
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <GmapMap
                :center="
                  markers[0] != undefined ? markers[0].position : defaultCenter
                "
                :zoom="zoom"
                ref="map"
                @click="placeMarker"
                style="height: 300px"
              >
                <GmapPolygon
                  v-if="polygonPaths.length > 0"
                  :paths="polygonPaths"
                  :options="{ editable: true }"
                  @mouseup="updatePolygon"
                />
                <!-- <GmapMarker
                    :key="index"
                    v-for="(m, index) in markers"
                    :position="m.position"
                    :clickable="true"
                    :draggable="true"
                    @dragend="callposition"
                    @click="center = m.position"
                  /> -->
              </GmapMap>
            </v-col>
            <v-col cols="12">
              <v-form ref="form">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-text-field
                      dense
                      v-model="locationName"
                      label="Layout Parser"
                      :rules="[(v) => !!v || 'required ']"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="10"> </v-col>
                  <v-col cols="2"> </v-col>

                  <!-- <v-col cols="6">
                    <v-text-field
                      dense
                      class=""
                      v-model="geoLattitude"
                      label="Lattitude"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      dense
                      class="ml-2"
                      v-model="geoLongitude"
                      label="Longitude"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-autocomplete
                      dense
                      v-model="locationHead"
                      label="Location Head"
                      :search-input.sync="search1"
                      @input="search1 = ''"
                      :items="masterUsers"
                      item-text="label"
                      item-value="value"
                      :rules="[(v) => !!v || 'required ']"
                      outlined
                      hide-no-data
                      hide-selected
                    />
                  </v-col> -->
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

// import { gmapApi } from "vue2-google-maps";
// TODO: Replace with Vue 3 compatible map solution (e.g., vue-leaflet, @googlemaps/js-api-loader)

import { create_locations } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_users } from "@/mixins/GetAllUsers.js";
export default {
  props: {
    addFields: Boolean,
  },
  mixins: [get_all_users],
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
      locationHead: "",
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
      latt: "",
      longg: "",
      masterUsers: [],
      zoom: 8,
      polygonPaths: [],
    };
  },
  watch: {
    addFields: {
      async handler() {
        if (this.addFields == true) {
          this.locationHead = "";
          await this.initMap();
          await this.get_all_users();
          this.fetch_users();
        }
        this.polygonPaths = [];
        this.markers = [];
      },
      immediate: true,
    },
  },
  methods: {
    clearpolyarray() {
      this.polygonPaths = [];
    },
    async initMap() {
      // await gmapApi.loaded();
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
    submit() {
      if (this.polygonPaths.length > 0) {
        // You can send this.polygonPaths to your server
        // console.log("Polygon vertices:", this.polygonPaths);
      }
    },
    fetch_users() {
      this.masterUsers = [];

      // if (this.listUsers.length == 1) {
      //   this.locationHead = this.listUsers[0].user_id;
      // }
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
    },
    setPlace(place) {
      this.currentPlace = place;
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
        // this.locationName = this.currentPlace.formatted_address;
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
        if (this.polygonPaths.length > 0) {
          this.$emit("clicked", 0);
          // You can send this.polygonPaths to your server
          // console.log("Polygon vertices:", this.polygonPaths);
        }
        // this.create_master_locations();
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

    async create_master_locations() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_locations, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              location_name: this.locationName,
              geo_lat: this.geoLattitude == "" ? undefined : this.geoLattitude,
              geo_long: this.geoLongitude == "" ? undefined : this.geoLongitude,
              location_head: this.locationHead,
            },
          })
        );
        var response = JSON.parse(result.data.create_locations);
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