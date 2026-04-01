<template>
  <div>
    <v-card flat class="pa-4">
      <!-- Header with Back Button -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="#DB4C77" size="24">mdi-percent</v-icon>
          <span class="text-h5">Tax Settings</span>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="#DB4C77"
            @click="saveSettings"
            :loading="saving"
            class="mr-2"
          >
            Save
          </v-btn>
          <v-btn 
            text
            @click="goBack"
            class="back-link"
            color="primary"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            Back 
          </v-btn>
        </div>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-card class="pa-4" elevation="1">
          <v-card-title class="text-h6 mb-4">
            <v-icon class="mr-2" color="#DB4C77">mdi-cog</v-icon>
            Tax Options
          </v-card-title>
          
          <v-list class="pa-0">
            <v-list-item
              v-for="(item, key) in taxItems"
              :key="key"
              class="px-0 py-2"
            >
              <template v-slot:prepend>
                <v-checkbox
                  v-model="taxSettings[key]"
                  color="#DB4C77"
                  hide-details
                  density="compact"
                ></v-checkbox>
              </template>
              
              <v-list-item-title class="d-flex align-center">
                <v-icon 
                  :icon="item.icon" 
                  :color="taxSettings[key] ? '#DB4C77' : 'grey'"
                  class="mr-3"
                  size="20"
                ></v-icon>
                <span :class="taxSettings[key] ? 'font-weight-medium' : 'text-grey'">
                  {{ item.title }}
                </span>
                <v-tooltip
                  :text="item.description"
                  location="top"
                  max-width="300"
                >
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      icon="mdi-information-outline"
                      size="16"
                      color="grey"
                      class="ml-2"
                    ></v-icon>
                  </template>
                </v-tooltip>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_sales_purchase_config } from "@/mixins/GetSalesPurchaseConfig.js";
import { API, graphqlOperation } from "aws-amplify";
import { organization_sales_purchase_config } from "@/graphql/mutations.js";
import SnackBar from "@/components/SnackBar.vue";

export default {
  name: 'SalesTaxes',
  
  mixins: [get_sales_purchase_config],
  
  components: {
    SnackBar,
  },
  
  data() {
    return {
      saving: false,
      taxSettings: {
        enableGST: true,
        enableHSNCode: true,
        enablePlaceOfSupply: false
      },
      taxConfig: {},
      SnackBarComponent: {},
      taxItems: {
        // enableGST: {
        //   title: 'Enable GST',
        //   description: 'Enable Goods and Services Tax calculation and reporting for transactions',
        //   icon: 'mdi-percent'
        // },
        enableHSNCode: {
          title: 'Enable HSN/SAC Code',
          description: 'Enable Harmonized System of Nomenclature (HSN) or Service Accounting Code (SAC) for items',
          icon: 'mdi-barcode'
        },
        enablePlaceOfSupply: {
          title: 'Enable Place of Supply',
          description: 'Enable place of supply tracking for GST compliance and tax calculations',
          icon: 'mdi-map-marker'
        }
      }
    }
  },
  
  async mounted() {
    await this.loadTaxConfig();
  },
  
  methods: {
    goBack() {
      this.$emit('backAction');
    },
    
    async loadTaxConfig() {
      try {
        // Call the mixin method to get sales purchase config
        await this.get_sales_purchase_config();
        this.taxConfig = this.salesPurchaseConfig.find(
          (config) => config.config_type === "TAXES"
        );
        
        // console.log("Tax Config loaded:", this.taxConfig);
        
        // Load settings from API if they exist
        if (this.taxConfig) {
          // Map API properties to our checkbox settings
          this.taxSettings = {
            enableGST: Boolean(this.taxConfig.enable_gst),
            enableHSNCode: Boolean(this.taxConfig.enable_hsn),
            enablePlaceOfSupply: Boolean(this.taxConfig.enable_place_of_supply)
          };
          
          // console.log("Mapped tax settings:", this.taxSettings);
        }
      } catch (error) {
        console.error("Error loading tax config:", error);
      }
    },
    
    async saveSettings() {
      this.saving = true;
      try {
        // Map our checkbox settings to API structure
        const apiSettings = {
          enable_gst: this.taxSettings.enableGST,
          enable_hsn: this.taxSettings.enableHSNCode,
          enable_place_of_supply: this.taxSettings.enablePlaceOfSupply
        };

        // console.log("Saving tax settings:", apiSettings);

        // Call the API to save tax settings
        let result = await API.graphql(
          graphqlOperation(organization_sales_purchase_config, {
            input: {
              config_type: this.taxConfig?.config_type || "TAXES",
              config_settings: JSON.stringify(apiSettings),
              config_id: this.taxConfig?.config_id || null,
            },
          })
        );
        
        var response = JSON.parse(result.data.organization_sales_purchase_config);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message || 'Tax settings saved successfully!',
            timeout: 5000,
            Top: true,
          };
          
          // Refresh the config data
          await this.loadTaxConfig();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message || 'Failed to save tax settings',
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.error("Error saving tax settings:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error saving tax settings. Please try again.",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.saving = false;
      }
    },
    
    resetForm() {
      // Reset to default values
      this.taxSettings = {
        enableGST: true,
        enableHSNCode: true,
        enablePlaceOfSupply: false
      };
    }
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-card-title {
  color: #2c3e50;
  font-weight: 600;
}

.back-link {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.back-link:hover {
  background-color: rgba(156, 39, 176, 0.1);
  transform: translateX(-2px);
}

.back-link .v-icon {
  margin-right: 8px;
}

.v-list-item {
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.2s ease;
}

.v-list-item:last-child {
  border-bottom: none;
}

.v-list-item:hover {
  background-color: #f8f9fa;
}

.v-list-item-title {
  font-size: 14px;
  line-height: 1.4;
}
</style>
