<template>
  <div>
    <v-card flat class="pa-4">
      <!-- Header with Back Button -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="#DB4C77" size="24">mdi-cog-outline</v-icon>
          <span class="text-h5">Sales Configuration</span>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="#DB4C77"
            @click="saveConfiguration"
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
         <v-row>
           <v-col cols="12">
             <v-card class="pa-4" elevation="1">
               <v-card-title class="text-h6 mb-4">
                 <v-icon class="mr-2" color="#DB4C77">mdi-cog</v-icon>
                 Sales Configuration Settings
               </v-card-title>
               
               <v-list class="pa-0">
                 <v-list-item
                   v-for="(item, key) in configItems"
                   :key="key"
                   class="px-0 py-2"
                 >
                   <template v-slot:prepend>
                     <v-checkbox
                       v-model="configSettings[key]"
                       color="#DB4C77"
                       hide-details
                       density="compact"
                     ></v-checkbox>
                   </template>
                   
                   <v-list-item-title class="d-flex align-center">
                     <v-icon 
                       :icon="item.icon" 
                       :color="configSettings[key] ? '#DB4C77' : 'grey'"
                       class="mr-3"
                       size="20"
                     ></v-icon>
                     <span :class="configSettings[key] ? 'font-weight-medium' : 'text-grey'">
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
           </v-col>
         </v-row>
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
  name: 'SalesConfiguration',
  
  mixins: [get_sales_purchase_config],
  
  components: {
    SnackBar,
  },
  
  data() {
    return {
      saving: false,
      SnackBarComponent:{},
      salesPurchaseConfig: [],
      configSettings: {
        itemsUnit: false,
        itemCategory: false,
        description: false,
        itemsWiseDiscount: false
      },
      configItems: {
        // itemsUnit: {
        //   title: 'Items Unit',
        //   description: 'Display and manage units for items in sales transactions',
        //   icon: 'mdi-ruler'
        // },
        itemCategory: {
          title: 'Item Category',
          description: 'Organize items by categories for better sales management',
          icon: 'mdi-folder-multiple'
        },
        description: {
          title: 'Description',
          description: 'Show detailed descriptions for items in sales documents',
          icon: 'mdi-text'
        },
        itemsWiseDiscount: {
          title: 'Items Wise Discount',
          description: 'Enable discount to be applied at individual item level in sales transactions',
          icon: 'mdi-percent'
        }
      }
    }
  },
  async mounted() {
    await this.loadSalesPurchaseConfig();
  },
  
  methods: {
    async saveConfiguration() {
      this.saving = true;
      try {
        // Map our checkbox settings to API structure
        const apiSettings = {
          items_unit: this.configSettings.itemsUnit,
          item_category: this.configSettings.itemCategory,
          description: this.configSettings.description,
          items_wise_discount: this.configSettings.itemsWiseDiscount
        };

        // console.log("Saving tax settings:", apiSettings);

        // Call the API to save tax settings
        let result = await API.graphql(
          graphqlOperation(organization_sales_purchase_config, {
            input: {
              config_type: this.salesPurchaseConfig?.config_type || "ITEM",
              config_settings: JSON.stringify(apiSettings),
              config_id: this.salesPurchaseConfig?.config_id || null,
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
          await this.loadSalesPurchaseConfig();
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
    async loadSalesPurchaseConfig() {
      try {
        // Call the mixin method to get sales purchase config
        await this.get_sales_purchase_config();
        this.salesPurchaseConfig = this.salesPurchaseConfig.find(
          (config) => config.config_type === "ITEM"
        );
        if(this.salesPurchaseConfig){
          this.configSettings = {
            itemsUnit: Boolean(this.salesPurchaseConfig.items_unit),
            itemCategory: Boolean(this.salesPurchaseConfig.item_category),
            description: Boolean(this.salesPurchaseConfig.description),
            itemsWiseDiscount: Boolean(this.salesPurchaseConfig.items_wise_discount ?? false)
          }
        }
      } catch (error) {
        console.error("Error loading sales purchase config:", error);
      }
    },
    resetConfiguration() {
      // Reset to default values
      this.configSettings = {
        itemsUnit: false,
        itemCategory: false,
        description: false,
        itemsWiseDiscount: false
      };
      
      this.$emit('showMessage', {
        type: 'info',
        text: 'Configuration reset to default values.'
      });
    },

    goBack() {
      this.$emit('backAction');
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

.v-text-field,
.v-textarea {
  margin-bottom: 8px;
}
</style>
