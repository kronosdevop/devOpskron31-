<template>
  <div class="google-address-autocomplete">
    <gmp-place-autocomplete
      v-if="isLoaded"
      ref="autocompleteElement"
      :class="inputClass"
      :style="inputStyle"
      :placeholder="placeholder"
      @gmp-placeselect="onPlaceSelect"
      @input="onWebComponentInput"
      @error="onPlaceAutocompleteError"
    ></gmp-place-autocomplete>
    
    <!-- Fallback input for when PlaceAutocompleteElement is not loaded -->
    <input
      v-else
      ref="autocompleteInput"
      v-model="inputValue"
      :placeholder="placeholder"
      :class="inputClass"
      :style="inputStyle"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />

    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-indicator">
      <v-progress-circular
        indeterminate
        size="16"
        color="primary"
      ></v-progress-circular>
    </div>

    <!-- Error message -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="compact"
      class="error-alert mt-2"
      closable
      @click:close="error = null"
    >
      <div class="error-content">
        <div class="font-weight-bold mb-2">Google Maps API Error</div>
        <div class="error-text" v-html="formatError(error)"></div>
      </div>
    </v-alert>
  </div>
</template>

<script>
export default {
  name: "GoogleAddressAutocomplete",
  props: {
    // Input props
    modelValue: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "Search Location",
    },
    inputClass: {
      type: String,
      default: "location-search-input",
    },
    inputStyle: {
      type: Object,
      default: () => ({
        borderBottom: "1px solid grey",
        marginLeft: "8px",
        width: "300px",
        fontSize: "12px",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        outline: "none",
      }),
    },

    // Google Maps props
    apiKey: {
      type: String,
      required: true,
    },

    // Autocomplete options
    types: {
      type: Array,
      default: () => [], // Empty array allows all location types (addresses, establishments, geocode, etc.)
    },

    // Validation
    required: {
      type: Boolean,
      default: false,
    },

    // Callback function name
    callback: {
      type: String,
      default: "callback",
    },
  },

  data() {
    return {
      inputValue: this.modelValue,
      autocomplete: null,
      autocompleteElement: null,
      google: null,
      isLoading: false,
      error: null,
      isLoaded: false,
      requestedResultType: null,
      componentRestrictions: null, // No country restriction - search all locations
    };
  },

  watch: {
    modelValue(newValue) {
      this.inputValue = newValue;
      // Update web component value if it exists
      if (this.autocompleteElement && this.isLoaded) {
        this.$nextTick(() => {
          if (this.autocompleteElement) {
            this.autocompleteElement.value = newValue;
          }
        });
      }
    },

    inputValue(newValue) {
      this.$emit("update:modelValue", newValue);
    },
  },

  async mounted() {
    this.setupComponentRestrictions();
    await this.loadGoogleMaps();
  },

  methods: {
    async loadGoogleMaps() {
      try {
        this.isLoading = true;
        this.error = null;

        if (!window.googleMapsLoader) {
          throw new Error(
            "Google Maps loader not found. Make sure it's configured in main.js"
          );
        }

        this.google = await window.googleMapsLoader.load();
        
        // Use legacy Autocomplete API directly due to network errors with PlaceAutocompleteElement
        // The new API has issues with "can't access property 'suggestions', b is undefined"
        // This error occurs because the Places API (New) may not be properly enabled or configured
        console.info("Using legacy Autocomplete API (PlaceAutocompleteElement has network errors)");
        this.isLoaded = false; // Use fallback input (legacy API)
        this.initAutocompleteFallback();
        this.isLoading = false;
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        
        // Check for specific error types
        if (error.message && (error.message.includes("RefererNotAllowedMapError") || error.message.includes("RefererNotAllowed"))) {
          const currentUrl = window.location.origin + window.location.pathname;
          this.error = `Google Maps API key is not authorized for this domain. 
          
To fix this:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on your API key
3. Under "Application restrictions" → Select "HTTP referrers (web sites)"
4. Add these referrers:
   - http://localhost:8081/*
   - http://localhost:*/*
   - ${currentUrl.split('/').slice(0, 3).join('/')}/*
5. Click "Save"

Current URL: ${currentUrl}`;
        } else {
          this.error = "Failed to load Google Maps. Please check your API key and ensure Places API (New) is enabled.";
        }
        
        this.isLoading = false;
        // Fallback to old API if new one fails
        this.initAutocompleteFallback();
      }
    },

    setupComponentRestrictions() {
      // Convert types array to requestedResultType for PlaceAutocompleteElement
      // PlaceAutocompleteElement uses RequestAutocompleteResultType enum
      if (this.types && this.types.length > 0) {
        // Map legacy types to new RequestAutocompleteResultType
        const typeMap = {
          geocode: "GEOCODE",
          establishment: "ESTABLISHMENT",
          address: "ADDRESS",
          "(cities)": "(cities)",
        };
        
        // PlaceAutocompleteElement accepts array of RequestAutocompleteResultType
        this.requestedResultType = this.types.map((type) => {
          const mapped = typeMap[type];
          return mapped || type.toUpperCase();
        });
      } else {
        this.requestedResultType = ["GEOCODE"];
      }

      // Component restrictions (country filter) - set to null for global search
      // Set this.componentRestrictions = { country: "in" } if you need to restrict to India
      this.componentRestrictions = null; // No restriction - search all locations globally
    },

    initAutocompleteElement() {
      if (!this.google || !this.$refs.autocompleteElement) {
        // Retry after a short delay if element not ready
        setTimeout(() => {
          if (this.google && this.$refs.autocompleteElement) {
            this.initAutocompleteElement();
          } else {
            // Fallback if element never becomes available
            console.warn("PlaceAutocompleteElement not available, falling back to legacy API");
            this.isLoaded = false;
            this.initAutocompleteFallback();
          }
        }, 100);
        return;
      }

      this.autocompleteElement = this.$refs.autocompleteElement;
      
      // Set up error handler to catch network errors from PlaceAutocompleteElement
      // Errors like "can't access property 'suggestions', b is undefined" indicate API issues
      const originalError = window.onerror;
      const errorHandler = (message, source, lineno, colno, error) => {
        if (message && (
          message.includes('gmp-place-autocomplete') || 
          message.includes('suggestions') || 
          message.includes('network request error')
        )) {
          console.warn("PlaceAutocompleteElement network error detected, falling back to legacy API");
          window.onerror = originalError; // Restore original
          this.isLoaded = false;
          this.$nextTick(() => {
            this.initAutocompleteFallback();
          });
          return true; // Prevent default error handling
        }
        if (originalError) {
          return originalError(message, source, lineno, colno, error);
        }
        return false;
      };
      
      // Set up temporary error handler
      window.onerror = errorHandler;
      
      // Remove error handler after 3 seconds (enough time to catch initial errors)
      setTimeout(() => {
        window.onerror = originalError;
      }, 3000);
      
      // Set properties on the element after it's rendered
      this.$nextTick(() => {
        if (this.autocompleteElement) {
          try {
            // Set requested result types (array of RequestAutocompleteResultType)
            // Note: Only set if the property exists and is supported
            if (this.requestedResultType && this.requestedResultType.length > 0) {
              try {
                // PlaceAutocompleteElement uses requestedResultType property
                if ('requestedResultType' in this.autocompleteElement) {
                  this.autocompleteElement.requestedResultType = this.requestedResultType;
                }
              } catch (e) {
                console.warn("requestedResultType not supported:", e);
              }
            }
            
            // Note: componentRestrictions is not available in PlaceAutocompleteElement
            // Country filtering must be done through other means or in the legacy API
            // We'll skip setting componentRestrictions for the new API

            // Sync input value if it exists
            if (this.inputValue) {
              this.autocompleteElement.value = this.inputValue;
            }
          } catch (e) {
            console.error("Error setting PlaceAutocompleteElement properties:", e);
            window.onerror = originalError; // Restore original
            // Fallback to legacy API if properties can't be set
            this.isLoaded = false;
            this.initAutocompleteFallback();
          }
        } else {
          window.onerror = originalError; // Restore original
        }
      });
    },

    async onPlaceSelect(event) {
      const place = event.place;
      
      if (!place) {
        console.warn("No place selected");
        this.$emit(this.callback, null);
        return;
      }

      try {
        // PlaceAutocompleteElement returns a Place object
        // We need to fetch full place details if needed
        let placeData = place;
        
        // If place has toJSON method, use it to get full details
        if (typeof place.toJSON === "function") {
          placeData = place.toJSON();
        }

        // Get location - handle both LatLng object and plain object
        const location = place.geometry?.location || placeData.geometry?.location;
        
        if (location) {
          // Extract lat/lng - handle both function-based and property-based LatLng
          let lat, lng;
          if (typeof location.lat === "function") {
            lat = location.lat();
            lng = location.lng();
          } else {
            lat = location.lat;
            lng = location.lng;
          }

          // Emit the callback event with place data (maintain backward compatibility)
          this.$emit(this.callback, {
            place: place,
            formatted_address: place.formattedAddress || placeData.formattedAddress || place.displayName || "",
            name: place.displayName || placeData.displayName || "",
            geometry: place.geometry || placeData.geometry,
            location: {
              lat: lat,
              lng: lng,
            },
            address_components: place.addressComponents || placeData.addressComponents || [],
          });

          // Update input value
          this.inputValue = place.formattedAddress || placeData.formattedAddress || place.displayName || "";
        } else {
          console.warn("Selected place has no geometry");
          this.$emit(this.callback, null);
        }
      } catch (error) {
        console.error("Error processing place selection:", error);
        this.$emit(this.callback, null);
      }
    },

    // Fallback to old API if new one is not available
    initAutocompleteFallback() {
      // Wait for input to be rendered
      this.$nextTick(() => {
        if (!this.google || !this.$refs.autocompleteInput) {
          // Retry after a short delay if element not ready
          setTimeout(() => {
            if (this.google && this.$refs.autocompleteInput) {
              this.initAutocompleteFallback();
            }
          }, 100);
          return;
        }

        try {
          // Check if legacy Autocomplete is available
          if (!this.google.maps.places || !this.google.maps.places.Autocomplete) {
            console.error("Legacy Autocomplete API also not available");
            this.error = "Google Maps Places API is not available. Please check your API key configuration.";
            return;
          }

          // Build options object - only include types and componentRestrictions if set
          const autocompleteOptions = {};
          
          // Only add types if it's provided and not empty (empty array means search all types)
          if (this.types && this.types.length > 0) {
            autocompleteOptions.types = this.types;
          }
          
          // Only add componentRestrictions if it's set (not null)
          if (this.componentRestrictions && Object.keys(this.componentRestrictions).length > 0) {
            autocompleteOptions.componentRestrictions = this.componentRestrictions;
          }

          this.autocomplete = new this.google.maps.places.Autocomplete(
            this.$refs.autocompleteInput,
            autocompleteOptions
          );

          this.autocomplete.addListener("place_changed", () => {
            const place = this.autocomplete.getPlace();

            console.log("Place selected:", place);

            if (place.geometry) {
              // Emit the callback event with place data
              const placeData = {
                place: place,
                formatted_address: place.formatted_address || place.name || "",
                name: place.name || "",
                geometry: place.geometry,
                location: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                },
                address_components: place.address_components || [],
              };
              
              console.log("Emitting place data:", placeData);
              this.$emit(this.callback, placeData);

              // Update input value
              this.inputValue = place.formatted_address || place.name || "";
            } else {
              console.warn("Selected place has no geometry:", place);
              console.warn("Place details:", {
                name: place.name,
                formatted_address: place.formatted_address,
                place_id: place.place_id,
                types: place.types
              });
              this.$emit(this.callback, null);
            }
          });
        } catch (error) {
          console.error("Error initializing autocomplete fallback:", error);
          this.error = "Failed to initialize address autocomplete. " + (error.message || "");
        }
      });
    },

    onInput(event) {
      this.inputValue = event.target.value;
      this.$emit("input", this.inputValue);
    },

    onWebComponentInput(event) {
      // Handle input from PlaceAutocompleteElement web component
      if (this.autocompleteElement) {
        this.inputValue = this.autocompleteElement.value || "";
        this.$emit("input", this.inputValue);
      }
    },

    onFocus() {
      this.$emit("focus");
    },

    onBlur() {
      this.$emit("blur");
    },

    // Public method to clear the input
    clear() {
      this.inputValue = "";
      if (this.$refs.autocompleteElement) {
        this.$refs.autocompleteElement.value = "";
      }
      if (this.$refs.autocompleteInput) {
        this.$refs.autocompleteInput.value = "";
      }
    },

    // Public method to get the current value
    getValue() {
      return this.inputValue;
    },

    // Public method to set the value
    setValue(value) {
      this.inputValue = value;
      if (this.$refs.autocompleteElement) {
        this.$refs.autocompleteElement.value = value;
      }
      if (this.$refs.autocompleteInput) {
        this.$refs.autocompleteInput.value = value;
      }
    },

    // Format error message for display
    formatError(errorText) {
      if (!errorText) return "";
      // Replace newlines with <br> tags for HTML display
      return errorText.replace(/\n/g, "<br>");
    },
  },
};
</script>

<style scoped>
.google-address-autocomplete {
  position: relative;
  display: inline-block;
}

.location-search-input {
  transition: all 0.3s ease;
  background-color: #ffffff !important;
  color: #333333 !important;
}

.location-search-input:focus {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  background-color: #ffffff !important;
  color: #333333 !important;
}

/* Ensure input elements have white background */
.location-search-input input,
.location-search-input input[type="text"] {
  background-color: #ffffff !important;
  color: #333333 !important;
}

.loading-indicator {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 8px;
}

.error-alert {
  margin-top: 8px;
  margin-left: 8px;
  max-width: 600px;
}

.error-content {
  font-size: 13px;
  line-height: 1.6;
}

.error-text {
  white-space: pre-line;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
}

/* Google Autocomplete dropdown styling - Legacy API */
:deep(.pac-container) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  font-family: inherit;
}

:deep(.pac-item) {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.pac-item:hover) {
  background-color: #f5f5f5;
}

:deep(.pac-item-selected) {
  background-color: #e3f2fd;
}

:deep(.pac-item-query) {
  font-weight: 500;
  color: #333;
}

:deep(.pac-matched) {
  font-weight: bold;
  color: #1976d2;
}

/* PlaceAutocompleteElement web component styling */
gmp-place-autocomplete {
  display: block;
  width: 100%;
}

gmp-place-autocomplete::part(input) {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  transition: all 0.3s ease;
  background-color: #ffffff !important;
  color: #333333 !important;
}

gmp-place-autocomplete::part(input):focus {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  background-color: #ffffff !important;
  color: #333333 !important;
}
</style> 