<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="locationMapDialog"
      @update:model-value="locationMapDialog = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Geo Location of {{ rowInfo.asset_location_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
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
    locationMapDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      markers: [],
      places: [],
      currentPlace: null,
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
    };
  },
  watch: {
    locationMapDialog: {
      async handler() {
        if (this.locationMapDialog == true) {
          if (this.rowInfo.geo_lat != null && this.rowInfo.geo_long != null) {
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