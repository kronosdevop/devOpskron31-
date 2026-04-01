<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog :model-value="addvisitorLocation" @update:model-value="$emit('update:addvisitorLocation', $event)" persistent max-width="1000" transition="dialog-top-transition">
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
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <GmapMap
                  :center="
                    markers[0] != undefined
                      ? markers[0].position
                      : defaultCenter
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
                <v-row no-gutters>
                  <v-col class="mt-2" cols="12"
                    ><i
                      >To update the latitude and longitude, click GO once the
                      location is entered</i
                    >
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      dense
                      v-model="geoLattitude"
                      label="Lattitude"
                      outlined
                      :rules="[(v) => !!v || 'required ']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      dense
                      v-model="geoLongitude"
                      label="Longitude"
                      :rules="[(v) => !!v || 'required ']"
                      class="ml-2 mr-2"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      dense
                      v-model="visitorCity"
                      label="City"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      dense
                      v-model="visitorState"
                      label="State"
                      class="ml-2 mr-2"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      dense
                      v-model="loactionaddress"
                      label="Address"
                      class=""
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="6">
                <v-row no-gutters>
                  <!-- <v-col class="" cols="12"
                    ><i
                      >To update the latitude and longitude, click GO once the
                      location is entered</i
                    >
                  </v-col> -->
                  <v-col class="mt-2" cols="12">
                    <v-select
                      dense
                      v-model="locationType"
                      :items="locationitemsType"
                      multiple
                      label="Location Type*"
                      item-text="text"
                      item-value="value"
                      :rules="[
                        (v) =>
                          (v && v.length > 0) || 'Location Type is required',
                      ]"
                      outlined
                      return-object
                    ></v-select>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-select
                      dense
                      v-model="visitTypes"
                      multiple
                      :items="visititemstype"
                      label="Visit Types*"
                      outlined
                      :rules="[(v) => (v && v.length > 0) || 'required ']"
                      item-text="text"
                      item-value="value"
                      return-object
                    ></v-select>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-select
                      dense
                      v-model="selectedTerritories"
                      :items="territoryitems"
                      label="Territories*"
                      multiple
                      item-text="text"
                      item-value="value"
                      :rules="[(v) => (v && v.length > 0) || 'required ']"
                      outlined
                      return-object
                    ></v-select>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-text-field
                      dense
                      v-model="locationName"
                      label="Location Name*"
                      :rules="[(v) => !!v || 'required ']"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col class="mt-2" cols="12">
                    <v-text-field
                      dense
                      v-model="locationID"
                      label="External Reference ID"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" class="mt-n2"
                    ><i> Contact Details</i>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      dense
                      v-model="userName"
                      label="Name"
                      class="mt-1"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      dense
                      v-model="emailId"
                      label="Email Id"
                      class="ml-2 mt-1"
                      :rules="[
                        (value) =>
                          !value ||
                          /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(
                            value
                          ) ||
                          'Enter a valid email',
                      ]"
                      outlined
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      dense
                      v-model="countryList"
                      label="Country Code"
                      :items="countryitems"
                      class="mr-2"
                      item-text="name"
                      item-value="code"
                      outlined
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      dense
                      v-model="contactNumber"
                      label="Contact Number"
                      class="ml-2 mr-2"
                      maxlength="14"
                      @keypress="is_number($event)"
                      v-on:paste="process($event)"
                      :rules="[
                        (value) =>
                          !value ||
                          /^\d{8,13}$/.test(value) ||
                          'Contact number must be between 8 and 13 digits',
                      ]"
                      outlined
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_data()"
            dark
            class="text-capitalize cardCss button-corner"
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
import { create_visit_locations } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import CountryList from "@/JsonFiles/CountryList.json";
import { get_visit_terittory } from "@/mixins/GetVisitTerritory.js";
import { get_visit_type } from "@/mixins/GetVisitType";

export default {
  props: {
    addvisitorLocation: Boolean,
  },
  mixins: [get_visit_terittory, get_visit_type, ],
  data() {
    return {
      currentPlace: null,
      search: "",
      markers: [],
      geoLattitude: "",
      geoLongitude: "",
      loading: false,
      locationAddress: "",
      locationName: "",
      locationType: [],
      locationID: "",
      contactNumber: "",
      countryList: "",
      countryitems: [],
      emailId: "",
      loactionaddress: "",
      visitorCity: "",
      visitorState: "",
      selectedTerritories: [],
      dueDateNectVisit: "",
      territoryitems: [],
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
      center: { lat: 45.508, lng: -73.587 },
      visitTypes: [],
      userName: "",
      visititemstype: [],
      locationitemsType: [],
    };
  },
  watch: {
    addvisitorLocation: {
      async handler() {
        if (this.addvisitorLocation == true) {
          this.markers = [];
          await this.get_visit_terittory();
          await this.get_visit_type();

          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    validate_data() {
      if (this.$refs.form.validate()) {
        this.add_mutation();
      }
    },

    async add_mutation() {
      this.loading = true;
      var loactionName = [];
      var loactionvalue = [];
      var visitName = [];
      var visitvalue = [];
      var territoryName = [];
      var territoryvalue = [];
      this.locationType.forEach((item) => {
        loactionName.push(item.text);
        loactionvalue.push(item.value);
      });
      this.visitTypes.forEach((item) => {
        visitName.push(item.text);
        visitvalue.push(item.value);
      });
      this.selectedTerritories.forEach((item) => {
        territoryName.push(item.text);
        territoryvalue.push(item.value);
      });
      try {
        let result = await API.graphql(
          graphqlOperation(create_visit_locations, {
            input: {
              location_name: this.locationName,
              location_type: loactionvalue,
              location_type_name: loactionName,
              location_ref_id: this.locationID,
              country_code: this.countryList,
              mobile_number: this.contactNumber,
              email_address: this.emailId,
              loc_latitude: this.geoLattitude,
              loc_longitude: this.geoLongitude,
              state: this.visitorState,
              city: this.visitorCity,
              address_details: this.loactionaddress,
              visit_types: visitvalue,
              visit_types_name: visitName,
              territory: territoryvalue,
              territory_name: territoryName,
              contact_name: this.userName,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_visit_locations);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("loactionupdate", "dataValue");
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
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    callposition(latLng) {
      this.markers = [];
      var marker = {
        lat: latLng.latLng.lat(),
        lng: latLng.latLng.lng(),
      };
      this.markers.push({ position: marker });
    },
    fetch_details() {
      this.territoryitems = [];
      this.visititemstype = [];
      this.locationitemsType = [];

      this.visitTerittory.forEach((element) => {
        this.territoryitems.push({
          text: element.territory_name,
          value: element.territory_id,
        });
      });
      this.typeVist.forEach((element) => {
        this.visititemstype.push({
          text: element.visit_type_name,
          value: element.visit_type_id,
        });
      });
     

      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
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
    setPlace(place) {
      this.currentPlace = place;
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
  },
};
</script>