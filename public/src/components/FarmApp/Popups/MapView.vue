<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="viewSwipeLocation" @update:model-value="$emit('update:viewSwipeLocation', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >    <div class="custom-title">Sector  1</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="12">
              <GmapMap
                :center="
                  markers[0] != undefined ? markers[0].position : defaultCenter
                "
                :zoom="12"
                ref="map"
              
                style="height: 300px"
              >
                <GmapPolygon
                  v-if="polygonPaths.length > 0"
                  :paths="polygonPaths"
                  :options="{ editable: true }"
                />
              </GmapMap>
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
    viewSwipeLocation: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      defaultCenter: { lat: 12.9327419188583, lng: 77.5684701707031 },
      markers: [],
      places: [],
      polygonPaths: [],
      currentPlace: null,
    };
  },
  watch: {
    viewSwipeLocation: {
      async handler() {
        if (this.viewSwipeLocation == true) {
          this.polygonPaths = [
            { lat: 12.9327419188583, lng: 77.5684701707031 },
            { lat: 12.897270332631296, lng: 77.5959359910156 },
            { lat: 12.921364788901041, lng: 77.62752168437497 },
            { lat: 12.942780132158736, lng: 77.61035554667966 },
          ];
          // if (
          //   this.rowInfo.swipe_lat != null &&
          //   this.rowInfo.swipe_long != null
          // ) {
          //   this.markers = [];
          //   var marker = {
          //     lat: Number(this.rowInfo.swipe_lat),
          //     lng: Number(this.rowInfo.swipe_long),
          //   };
          //   this.markers.push({ position: marker });
          // }
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