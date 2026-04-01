<template>
  <div>
    <v-card flat class="pa-4">
      <!-- Header with Back Button -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="#DB4C77" size="24">mdi-account-group</v-icon>
          <span class="text-h5">Customer Settings</span>
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
            Customer Options
          </v-card-title>
          
          <v-list class="pa-0">
            <v-list-item
              v-for="(item, key) in customerItems"
              :key="key"
              class="px-0 py-2"
            >
              <template v-slot:prepend>
                <v-checkbox
                  v-model="customerSettings[key]"
                  color="#DB4C77"
                  hide-details
                  density="compact"
                ></v-checkbox>
              </template>
              
              <v-list-item-title class="d-flex align-center">
                <v-icon 
                  :icon="item.icon" 
                  :color="customerSettings[key] ? '#DB4C77' : 'grey'"
                  class="mr-3"
                  size="20"
                ></v-icon>
                <span :class="customerSettings[key] ? 'font-weight-medium' : 'text-grey'">
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
          
          <!-- Conditional Payment Reminder Days Field -->
          <v-row v-if="customerSettings.enablePaymentReminder" class="mt-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="paymentReminderDays"
                label="Remind me for payment due in (days)"
                type="number"
                min="1"
                max="365"
                :rules="[v => !!v || 'Days is required', v => v >= 1 || 'Minimum 1 day', v => v <= 365 || 'Maximum 365 days']"
                color="#DB4C77"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mt-2"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="paymentReminderMessage"
                label="Reminder Message"
                placeholder="Hi, It's a friendly reminder to you for paying <balance amount> to me."
                :rules="[v => !!v || 'Reminder message is required']"
                color="#DB4C77"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="mt-2"
                rows="3"
                auto-grow
              ></v-textarea>
            </v-col>
          </v-row>
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
  name: 'CustomerSettings',
  
  mixins: [get_sales_purchase_config],
  
  components: {
    SnackBar,
  },
  
  data() {
    return {
      saving: false,
      customerSettings: {
        enableShippingAddress: true,
        enablePaymentReminder: false
      },
      paymentReminderDays: 7,
      paymentReminderMessage: 'Hi, It\'s a friendly reminder to you for paying <balance amount> to me.',
      customerConfig: {},
      SnackBarComponent: {},
      customerItems: {
        enableShippingAddress: {
          title: 'Shipping Address',
          description: 'Enable shipping address management for customers',
          icon: 'mdi-map-marker'
        },
        enablePaymentReminder: {
          title: 'Enable Payment Reminder',
          description: 'Enable automatic payment reminder notifications for customers',
          icon: 'mdi-bell'
        }
      }
    }
  },
  
  async mounted() {
    await this.loadCustomerConfig();
  },
  
  methods: {
    goBack() {
      this.$emit('backAction');
    },
    
    async loadCustomerConfig() {
      try {
        // Call the mixin method to get sales purchase config
        await this.get_sales_purchase_config();
        this.customerConfig = this.salesPurchaseConfig.find(
          (config) => config.config_type === "PARTY"
        );
        
        // console.log("Customer Config loaded:", this.customerConfig);
        
        // Load settings from API if they exist
        if (this.customerConfig) {
          // Map API properties to our checkbox settings
          this.customerSettings = {
            enableShippingAddress: Boolean(this.customerConfig.shipping_address),
            enablePaymentReminder: Boolean(this.customerConfig.enable_payment_reminders)
          };
          
          // Load payment reminder settings if they exist
          if (this.customerConfig.payment_due_in) {
            this.paymentReminderDays = this.customerConfig.payment_due_in;
          }
          
          if (this.customerConfig.remainder_message) {
            this.paymentReminderMessage = this.customerConfig.remainder_message;
          }
          
          // console.log("Mapped customer settings:", this.customerSettings);
        }
      } catch (error) {
        console.error("Error loading customer config:", error);
      }
    },
    
    async saveSettings() {
      this.saving = true;
      try {
        // Map our checkbox settings to API structure
        const apiSettings = {
          shipping_address: this.customerSettings.enableShippingAddress,
          enable_payment_reminders: this.customerSettings.enablePaymentReminder,
          payment_due_in: this.paymentReminderDays,
          remainder_message: this.paymentReminderMessage
        };

        // console.log("Saving customer settings:", apiSettings);

        // Call the API to save customer settings
        let result = await API.graphql(
          graphqlOperation(organization_sales_purchase_config, {
            input: {
              config_type: this.customerConfig?.config_type || "PARTY",
              config_settings: JSON.stringify(apiSettings),
              config_id: this.customerConfig?.config_id || null,
            },
          })
        );
        
        var response = JSON.parse(result.data.organization_sales_purchase_config);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message || 'Customer settings saved successfully!',
            timeout: 5000,
            Top: true,
          };
          
          // Refresh the config data
          await this.loadCustomerConfig();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message || 'Failed to save customer settings',
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.error("Error saving customer settings:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error saving customer settings. Please try again.",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.saving = false;
      }
    },
    
    resetForm() {
      // Reset to default values
      this.customerSettings = {
        enableShippingAddress: true,
        enablePaymentReminder: false
      };
      this.paymentReminderDays = 7;
      this.paymentReminderMessage = 'Hi, It\'s a friendly reminder to you for paying <balance amount> to me.';
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
