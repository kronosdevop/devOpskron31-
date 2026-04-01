<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-card flat>
      <v-form ref="form">
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
        <v-row class="">
          <v-col cols="6">
            <GmapMap
              :center="
                markers[0] != undefined ? markers[0].position : defaultCenter
              "
              :zoom="20"
              style="height: 250px"
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
            <v-row no-gutters>
              <v-col class="" cols="12"
                ><i
                  >To update the latitude and longitude, click GO once the
                  location is entered</i
                >
              </v-col>

              <!-- <v-col class="mt-2" cols="12">
                <v-text-field
                  dense
                  v-model="locationName"
                  label="Location Name*"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-text-field>
              </v-col> -->
              <v-col cols="10"> </v-col>
              <v-col cols="2"> </v-col>

              <v-col cols="6" class="mt-4">
                <v-text-field
                  dense
                  class=""
                  v-model="geoLattitude"
                  :rules="[(v) => !!v || 'required ']"
                  label="Lattitude*"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="6" class="mt-4">
                <v-text-field
                  dense
                  class="ml-2"
                  v-model="geoLongitude"
                  :rules="[(v) => !!v || 'required ']"
                  label="Longitude*"
                  outlined
                ></v-text-field>
              </v-col>

              <v-col class="mt-2" cols="12">
                <v-textarea
                  dense
                  rows="0"
                  auto-grow
                  v-model="locationAddress"
                  label="Location Address"
                  outlined
                ></v-textarea>
              </v-col>
              <v-col class="mt-2" cols="12">
                <v-text-field
                  dense
                  v-model="pincode"
                  label="Pin Code*"
                  @keypress="is_number($event)"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) => (v && v.length === 6) || 'Pincode must be 6 digits'
                  ]"
                  maxlength="6"        
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
      <v-card-actions class="justify-center mt-2">
        <v-btn depressed @click="back_action()" dark color="primary">
          Back
        </v-btn>
        <v-btn
          depressed
          @click="emit_third_step()"
          dark
          class="cardCss"
        >
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */

export default {
  data() {
    return {
      locationAddress: "",
      geoLongitude: "",
      geoLattitude: "",
      // locationName: "",
      pincode: "",
      search: "",
      currentPlace: null,
      markers: [],
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
      latt: "",
      longg: "",
      loading: false,
    };
  },
  created() {
    this.markers = [];
  },
  methods: {
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
    back_action() {
      this.$emit("backtofirstStep", 1);
    },
    emit_third_step() {
      if (this.$refs.form.validate()) {
        var data = {
          // locationName: this.locationName,
          geoLattitude: this.geoLattitude.toString(),
          geoLongitude: this.geoLongitude.toString(),
          locationsAddress: this.locationAddress,
          pincode: Number(this.pincode), 
        };
        this.$emit("emitThirdSTep", data);
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
        this.locationAddress = this.currentPlace.formatted_address;
        this.markers = [];
        var marker = {
          lat: this.currentPlace.geometry.location.lat(),
          lng: this.currentPlace.geometry.location.lng(),
        };
        this.markers.push({ position: marker });
        (this.geoLattitude = marker.lat), (this.geoLongitude = marker.lng);
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
  },
};
</script>
