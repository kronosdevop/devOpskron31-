<template>
  <div>
    <!-- Google Maps Autocomplete -->
    <div v-if="showAutocomplete" class="google-autocomplete-container">
      <input
        ref="autocompleteInput"
        :placeholder="autocompletePlaceholder"
        class="google-autocomplete-input"
        :style="autocompleteStyle"
        v-model="autocompleteValue"
      />
    </div>

    <!-- Google Maps Container -->
    <div 
      ref="mapContainer" 
      class="google-map-container"
      :style="{ height: mapHeight, width: mapWidth }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'GoogleMaps',
  props: {
    // Map props
    center: {
      type: Object,
      default: () => ({ lat: 0, lng: 0 })
    },
    zoom: {
      type: Number,
      default: 12
    },
    mapHeight: {
      type: String,
      default: '300px'
    },
    mapWidth: {
      type: String,
      default: '100%'
    },
    
    // Autocomplete props
    showAutocomplete: {
      type: Boolean,
      default: false
    },
    autocompletePlaceholder: {
      type: String,
      default: 'Search Location'
    },
    autocompleteStyle: {
      type: Object,
      default: () => ({
        borderBottom: '1px solid grey',
        marginLeft: '8px',
        width: '300px',
        fontSize: '12px',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      })
    },
    
    // Marker props
    markers: {
      type: Array,
      default: () => []
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      map: null,
      google: null,
      autocomplete: null,
      mapMarkers: [],
      isLoaded: false,
      autocompleteValue: ''
    }
  },
  
  async mounted() {
    await this.loadGoogleMaps();
  },
  
  watch: {
    center: {
      handler(newCenter) {
        if (this.map && newCenter.lat && newCenter.lng) {
          this.map.setCenter(newCenter);
        }
      },
      deep: true
    },
    
    markers: {
      handler(newMarkers) {
        this.updateMarkers(newMarkers);
      },
      deep: true
    }
  },
  
  methods: {
    async loadGoogleMaps() {
      try {
        if (!window.googleMapsLoader) {
          console.error('Google Maps loader not found. Make sure it\'s configured in main.js');
          return;
        }
        
        this.google = await window.googleMapsLoader.load();
        this.isLoaded = true;
        
        // Initialize map
        this.initMap();
        
        // Initialize autocomplete if needed
        if (this.showAutocomplete) {
          this.initAutocomplete();
        }
        
        this.$emit('maps-loaded', this.google);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        this.$emit('maps-error', error);
      }
    },
    
    initMap() {
      if (!this.google || !this.$refs.mapContainer) return;
      
      this.map = new this.google.maps.Map(this.$refs.mapContainer, {
        center: this.center,
        zoom: this.zoom,
        mapTypeId: this.google.maps.MapTypeId.ROADMAP
      });
      
      // Add markers if provided
      if (this.markers.length > 0) {
        this.updateMarkers(this.markers);
      }
      
      this.$emit('map-ready', this.map);
    },
    
    initAutocomplete() {
      if (!this.google || !this.$refs.autocompleteInput) return;
      
      this.autocomplete = new this.google.maps.places.Autocomplete(
        this.$refs.autocompleteInput,
        { types: ['geocode'] }
      );
      
      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete.getPlace();
        // console.log('Autocomplete place selected:', place);
        
        if (place.geometry) {
          this.$emit('place-changed', place);
          
          // Update the input value
          this.autocompleteValue = place.formatted_address || place.name || '';
          
          // If we have a map, center it on the selected place
          if (this.map) {
            this.map.setCenter(place.geometry.location);
            this.map.setZoom(15);
          }
        } else {
          console.warn('Selected place has no geometry');
          this.$emit('place-changed', null);
        }
      });
    },
    
    updateMarkers(markers) {
      // Clear existing markers
      this.mapMarkers.forEach(marker => marker.setMap(null));
      this.mapMarkers = [];
      
      // Add new markers
      markers.forEach((markerData, index) => {
        const marker = new this.google.maps.Marker({
          position: markerData.position,
          map: this.map,
          title: markerData.title || `Marker ${index + 1}`,
          draggable: this.draggable
        });
        
        // Add drag event listener
        if (this.draggable) {
          marker.addListener('dragend', (event) => {
            this.$emit('marker-dragend', {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            });
          });
        }
        
        // Add click event listener
        marker.addListener('click', () => {
          this.$emit('marker-click', markerData);
        });
        
        this.mapMarkers.push(marker);
      });
    },
    
    addMarker(position, title = '') {
      if (!this.google || !this.map) return;
      
      const marker = new this.google.maps.Marker({
        position,
        map: this.map,
        title,
        draggable: this.draggable
      });
      
      this.mapMarkers.push(marker);
      return marker;
    },
    
    clearMarkers() {
      this.mapMarkers.forEach(marker => marker.setMap(null));
      this.mapMarkers = [];
    },
    
    setCenter(position) {
      if (this.map) {
        this.map.setCenter(position);
      }
    },
    
    setZoom(zoom) {
      if (this.map) {
        this.map.setZoom(zoom);
      }
    },
    
    // Public method to get map instance
    getMap() {
      return this.map;
    },
    
    // Public method to get Google instance
    getGoogle() {
      return this.google;
    },
    
    // Public method to clear autocomplete
    clearAutocomplete() {
      if (this.$refs.autocompleteInput) {
        this.$refs.autocompleteInput.value = '';
        this.autocompleteValue = '';
      }
    }
  }
}
</script>

<style scoped>
.google-map-container {
  border-radius: 8px;
  overflow: hidden;
}

.google-autocomplete-container {
  margin-bottom: 10px;
}

.google-autocomplete-input {
  outline: none;
}

.google-autocomplete-input:focus {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}
</style> 