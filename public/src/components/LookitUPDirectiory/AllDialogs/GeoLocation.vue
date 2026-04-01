<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="viewGeoLocation" @update:model-value="$emit('update:viewGeoLocation', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Geo Location</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="12">
              <GoogleMaps
                ref="googleMapsMain"
                :center="mapCenter"
                :zoom="15"
                :markers="mapMarkers"
                :draggable="false"
                map-height="300px"
                @maps-loaded="onMapsLoaded"
                @marker-click="onMarkerClick"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
import GoogleMaps from "@/components/GoogleMaps.vue";

export default {
  components: {
    GoogleMaps,
  },
  props: {
    viewGeoLocation: Boolean,
    entryInfo: Object,
  },
  data() {
    return {
      mapCenter: { lat: 45.508, lng: -73.587 },
      mapMarkers: [],
    };
  },
  watch: {
    viewGeoLocation: {
      async handler() {
        if (this.viewGeoLocation == true) {
          if (
            this.entryInfo.geo_lat != null &&
            this.entryInfo.geo_long != null
          ) {
            const marker = {
              position: {
                lat: Number(this.entryInfo.geo_lat),
                lng: Number(this.entryInfo.geo_long),
              },
            };
            this.mapMarkers = [marker];
            this.mapCenter = marker.position;
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
    onMapsLoaded() {
      // Optional: handle map loaded event
    },
    onMarkerClick(marker) {
      this.mapCenter = marker.position;
    },
  },
};
</script>