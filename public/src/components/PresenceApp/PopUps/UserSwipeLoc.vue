<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="viewSwipeLocation"
      @update:model-value="viewSwipeLocation = $event"
      persistent
      transition="dialog-bottom-transition"
      max-width="600"
    >
      <v-card class="location-dialog-card" elevation="24">
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text-black ml-2">
            <div class="custom-title">
              <v-icon class="mr-2">mdi-map-marker</v-icon>
              Geo Location
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
    viewSwipeLocation: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      center: { lat: 45.508, lng: -73.587 },
      markers: [],
      places: [],
      currentPlace: null,
      mapCenter: { lat: 45.508, lng: -73.587 },
      mapMarkers: [],
    };
  },
  watch: {
    viewSwipeLocation: {
      async handler() {
        if (this.viewSwipeLocation == true) {
          if (
            this.rowInfo.swipe_lat != null &&
            this.rowInfo.swipe_long != null
          ) {
            this.markers = [];
            var marker = {
              position: {
                lat: Number(this.rowInfo.swipe_lat),
                lng: Number(this.rowInfo.swipe_long),
              },
            };
            this.markers.push(marker);
            this.mapMarkers = this.markers;
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
    onMarkerClick(marker) {
      this.mapCenter = marker.position;
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

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #db4c77;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #fce4ec;
}

.section-title b {
  font-weight: 600;
}

.dialog-actions {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

/* Form field enhancements */
.v-text-field {
  margin-bottom: 8px;
}

.v-text-field .v-field {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.v-text-field .v-field:hover {
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.15);
}

.v-text-field .v-field--focused {
  box-shadow: 0 0 0 2px rgba(219, 76, 119, 0.2);
}

/* Button enhancements */
.v-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
  height: 40px !important;
  align-items: center;
  display: inline-flex;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

  .section-title {
    font-size: 12px;
  }

  .dialog-actions {
    padding: 12px 16px;
  }
}
</style>