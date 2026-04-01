<template>
    <div>
      <!-- eslint-disable -->
      <v-dialog :model-value="locationlogged" @update:model-value="$emit('update:locationlogged', $event)" persistent max-width="500" transition="dialog-top-transition">
        <v-card>
          <v-toolbar elevation="0" dark dense class="navBar">
            <v-toolbar-title class="text--black ml-2"
              > <div class="custom-title">
              Log Location
              </div></v-toolbar-title
            >
            <v-spacer />
            <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
          </v-toolbar>
          <v-card-text class="mt-4">
            <v-row>
              <v-col cols="12">
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
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </template>
  <script>
  export default {
    props: {
      locationlogged: Boolean,
      rowInfo: Object,
    },
    data() {
      return {
        center: { lat: 45.508, lng: -73.587 },
        markers: [],
        places: [],
        currentPlace: null,
      };
    },
    watch: {
      locationlogged: {
        async handler() {
          if (this.locationlogged == true) {
            if (
              this.rowInfo.lat != null &&
              this.rowInfo.long != null
            ) {
              this.markers = [];
              var marker = {
                lat: Number(this.rowInfo.lat),
                lng: Number(this.rowInfo.long),
              };
              this.markers.push({ position: marker });
            }
          }
        },
        immediate: true,
      },
    },
    methods: {
      close_dialog() {
        this.$emit("clicked", 0);
      },
      callposition(latLng) {
        this.markers = [];
        var marker = {
          lat: latLng.latLng.lat(),
          lng: latLng.latLng.lng(),
        };
        this.markers.push({ position: marker });
      },
    },
  };
  </script>