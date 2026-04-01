<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="locationasset"
      @update:model-value="locationasset = $event"
      persistent
      max-width="600"
      transition="dialog-bottom-transition"
    >
      <v-card class="location-dialog-card" elevation="24">
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text-black ml-2">
            <div class="custom-title">
              <v-icon class="mr-2">mdi-map-marker</v-icon>
              Location of {{ adminassetItems.asset_prefix }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="dialog-content">
          <div class="map-section">
            <GoogleMaps
              ref="googleMapsMain"
              :center="mapCenter"
              :zoom="15"
              :markers="mapMarkers"
              :draggable="false"
              map-height="500px"
              @maps-loaded="onMapsLoaded"
              @marker-click="onMarkerClick"
            />
          </div>
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
    locationasset: Boolean,
    adminassetItems: Object,
  },
  data() {
    return {
      mapCenter: { lat: 45.508, lng: -73.587 },
      mapMarkers: [],
      places: [],
      currentPlace: null,
    };
  },
  watch: {
    locationasset: {
      async handler() {
        if (this.locationasset == true) {
          if (
            this.adminassetItems.asset_location_lat != null &&
            this.adminassetItems.asset_location_long != null
          ) {
            this.mapMarkers = [];
            var marker = {
              position: {
                lat: Number(this.adminassetItems.asset_location_lat),
                lng: Number(this.adminassetItems.asset_location_long),
              },
            };
            this.mapMarkers.push(marker);
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
      // console.log("Google Maps loaded successfully");
    },
    onMarkerClick() {
      // Handle marker click if needed
    },
  },
};
</script>

<style scoped>
.location-dialog-card {
  border-radius: 12px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.dialog-content {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.map-section {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  margin-bottom: 16px;
}

/* Toolbar styling */
.navBar .custom-title {
  color: black !important;
  font-weight: 600;
  font-size: 18px;
  display: flex;
  align-items: center;
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

/* Animation for dialog appearance */
.location-dialog-card {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .location-dialog-card {
    margin: 10px;
    max-height: 95vh;
  }

  .dialog-content {
    padding: 12px;
  }

  .map-section {
    padding: 8px;
  }
}
</style>