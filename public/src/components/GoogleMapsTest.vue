<template>
  <div class="pa-4">
    <h2>Google Maps Test Component</h2>
    
    <v-card class="mb-4">
      <v-card-title>Search Location</v-card-title>
      <v-card-text>
        <GoogleMaps
          ref="googleMaps"
          :center="mapCenter"
          :zoom="12"
          :markers="markers"
          :draggable="true"
          map-height="400px"
          :show-autocomplete="true"
          autocomplete-placeholder="Search for a location..."
          @maps-loaded="onMapsLoaded"
          @place-changed="onPlaceChanged"
          @marker-dragend="onMarkerDragEnd"
        />
      </v-card-text>
    </v-card>
    
    <v-card>
      <v-card-title>Debug Information</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <strong>Map Center:</strong>
            <pre>{{ JSON.stringify(mapCenter, null, 2) }}</pre>
          </v-col>
          <v-col cols="6">
            <strong>Markers:</strong>
            <pre>{{ JSON.stringify(markers, null, 2) }}</pre>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12">
            <strong>Last Place Selected:</strong>
            <pre>{{ JSON.stringify(lastPlace, null, 2) }}</pre>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12">
            <strong>Status:</strong>
            <v-chip :color="mapsLoaded ? 'green' : 'red'" class="ml-2">
              {{ mapsLoaded ? 'Maps Loaded' : 'Maps Loading...' }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import GoogleMaps from './GoogleMaps.vue'

export default {
  name: 'GoogleMapsTest',
  components: {
    GoogleMaps
  },
  data() {
    return {
      mapCenter: { lat: 20.5937, lng: 78.9629 }, // India center
      markers: [],
      lastPlace: null,
      mapsLoaded: false
    }
  },
  methods: {
    onMapsLoaded(google) {
      // console.log('✅ Google Maps loaded successfully:', google);
      this.mapsLoaded = true;
    },
    
    onPlaceChanged(place) {
      // console.log('📍 Place selected:', place);
      this.lastPlace = place;
      
      if (place && place.geometry && place.geometry.location) {
        const position = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        // Update map center
        this.mapCenter = position;
        
        // Add marker
        this.markers = [{
          position: position,
          title: place.formatted_address || place.name
        }];
        
        // console.log('✅ Marker added at:', position);
      }
    },
    
    onMarkerDragEnd(position) {
      // console.log('🎯 Marker dragged to:', position);
      this.mapCenter = position;
      
      // Update the marker position
      if (this.markers.length > 0) {
        this.markers[0].position = position;
      }
    }
  }
}
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}
</style> 