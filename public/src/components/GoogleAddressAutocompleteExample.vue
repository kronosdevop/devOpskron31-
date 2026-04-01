<template>
  <div class="pa-4">
    <h2>Google Address Autocomplete Example</h2>
    
    <v-card class="mb-4">
      <v-card-title>Location Search</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <!-- Example 1: Basic Usage -->
            <h3>Basic Usage</h3>
            <GoogleAddressAutocomplete
              v-model="searchLocation"
              :api-key="googleApiKey"
              class="location-search-input"
              @callback="setPlace"
              placeholder="Search Location"
            />
            
            <v-btn
              @click="clearSearch"
              class="mt-2"
              size="small"
              color="primary"
            >
              Clear Search
            </v-btn>
          </v-col>
          
          <v-col cols="12" md="6">
            <!-- Example 2: Custom Styling -->
            <h3>Custom Styling</h3>
            <GoogleAddressAutocomplete
              v-model="searchLocation2"
              :api-key="googleApiKey"
              :input-style="{
                width: '100%',
                padding: '12px',
                border: '2px solid #1976d2',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f5f5f5'
              }"
              @callback="setPlace2"
              placeholder="Search with custom styling"
            />
          </v-col>
        </v-row>
        
        <v-row class="mt-4">
          <v-col cols="12">
            <!-- Example 3: With Map Display -->
            <h3>With Map Display</h3>
            <GoogleAddressAutocomplete
              v-model="searchLocation3"
              :api-key="googleApiKey"
              @callback="setPlaceWithMap"
              placeholder="Search and see on map"
            />
            
            <!-- Map Display -->
            <div v-if="selectedLocation" class="mt-4">
              <GoogleMaps
                :center="selectedLocation"
                :zoom="15"
                :markers="mapMarkers"
                map-height="300px"
                @maps-loaded="onMapsLoaded"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <!-- Debug Information -->
    <v-card>
      <v-card-title>Debug Information</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <strong>Search Location 1:</strong>
            <pre>{{ searchLocation }}</pre>
          </v-col>
          <v-col cols="6">
            <strong>Search Location 2:</strong>
            <pre>{{ searchLocation2 }}</pre>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="6">
            <strong>Search Location 3:</strong>
            <pre>{{ searchLocation3 }}</pre>
          </v-col>
          <v-col cols="6">
            <strong>Selected Location:</strong>
            <pre>{{ JSON.stringify(selectedLocation, null, 2) }}</pre>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col cols="12">
            <strong>Last Place Data:</strong>
            <pre>{{ JSON.stringify(lastPlaceData, null, 2) }}</pre>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import GoogleAddressAutocomplete from './GoogleAddressAutocomplete.vue'
import GoogleMaps from './GoogleMaps.vue'

export default {
  name: 'GoogleAddressAutocompleteExample',
  components: {
    GoogleAddressAutocomplete,
    GoogleMaps
  },
  data() {
    return {
      // API Key - Replace with your actual API key
      googleApiKey: 'AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI',
      
      // Search locations
      searchLocation: '',
      searchLocation2: '',
      searchLocation3: '',
      
      // Selected location data
      selectedLocation: null,
      mapMarkers: [],
      lastPlaceData: null
    }
  },
  methods: {
    // Example 1: Basic callback
    setPlace(placeData) {
      // console.log('📍 Place selected (Basic):', placeData);
      this.lastPlaceData = placeData;
      
      if (placeData) {
        this.searchLocation = placeData.formatted_address;
        // console.log('✅ Location set:', placeData.formatted_address);
        // console.log('📍 Coordinates:', placeData.location);
      }
    },
    
    // Example 2: Custom callback
    setPlace2(placeData) {
      // console.log('📍 Place selected (Custom):', placeData);
      this.lastPlaceData = placeData;
      
      if (placeData) {
        this.searchLocation2 = placeData.formatted_address;
        // You can add custom logic here
        this.$emit('location-selected', placeData);
      }
    },
    
    // Example 3: With map integration
    setPlaceWithMap(placeData) {
      // console.log('📍 Place selected (Map):', placeData);
      this.lastPlaceData = placeData;
      
      if (placeData && placeData.location) {
        this.searchLocation3 = placeData.formatted_address;
        this.selectedLocation = placeData.location;
        
        // Add marker to map
        this.mapMarkers = [{
          position: placeData.location,
          title: placeData.formatted_address
        }];
        
        // console.log('✅ Map updated with new location');
      }
    },
    
    // Clear search
    clearSearch() {
      this.searchLocation = '';
      this.lastPlaceData = null;
      // console.log('🧹 Search cleared');
    },
    
    // Maps loaded callback
    onMapsLoaded(google) {
      // console.log('✅ Google Maps loaded in example');
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
  max-height: 200px;
  overflow-y: auto;
}

h3 {
  color: #1976d2;
  margin-bottom: 8px;
  font-size: 16px;
}
</style> 