<template>
  <div>
    <!-- Card Grid View -->
    <div v-if="!selectedComponent">
      <v-card flat class="pa-4 overflow-y-auto" :height="windowHeight">
        <v-card-text class="pa-0">
          <!-- Card Grid Layout -->
          <v-row>
            <v-col 
              v-for="(item, index) in settingsCards" 
              :key="index"
              cols="12"
              sm="6"
              md="4"
              class="mb-4"
            >
              <v-card 
                class="settings-card"
                elevation="2"
                @click="openComponent(item)"
              >
                <v-card-text class="pa-4">
                  <!-- Header with Icon -->
                  <div class="d-flex align-start mb-3">
                    <!-- Icon Container -->
                    <div class="icon-container">
                      <v-icon class="icon-outline" size="24">{{ item.icon }}</v-icon>
                    </div>
                  </div>

                  <!-- Title -->
                  <div class="mb-2">
                    <h3 class="card-title">{{ item.title }}</h3>
                  </div>

                  <!-- Description -->
                  <p class="card-description">{{ item.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Component View -->
    <div v-else>
      <v-card flat>
        <!-- Component Content -->
        <v-card-text class="pa-0">
          <component 
            :is="selectedComponent.component" 
            v-if="selectedComponent.component"
            @backAction="goBack"
          />
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
/* eslint-disable */

// Imports for sales settings components
import SalesGeneral from "@/components/Sales/SettingsComponents/SalesGeneral.vue";
import SalesTransactions from "@/components/Sales/SettingsComponents/SalesTransactions.vue";
import SalesTaxes from "@/components/Sales/SettingsComponents/SalesTaxes.vue";
import CustomerSettings from "@/components/Sales/SettingsComponents/CustomerSettings.vue";
import SalesConfiguration from "@/components/Sales/SettingsComponents/SalesConfiguration.vue";
import SalesTermsAndConditions from "@/components/Sales/SettingsComponents/SalesTermsAndConditions.vue";

export default {
  // Components
  components: {
    SalesGeneral,
    SalesTransactions,
    SalesTaxes,
    CustomerSettings,
    SalesConfiguration,
    SalesTermsAndConditions,
  },

  // Data
  data() {
    return {
      // UI properties
      windowHeight: 0,
      selectedComponent: null,

      // Settings cards configuration
      settingsCards: [
        {
          title: "General",
          description: "Configure general sales settings, defaults, and preferences",
          icon: "mdi-cog",
          value: "general",
          component: "SalesGeneral"
        },
        {
          title: "Transactions",
          description: "Manage transaction types, workflows, and approval processes",
          icon: "mdi-cash-multiple",
          value: "transactions",
          component: "SalesTransactions"
        },
        {
          title: "Taxes",
          description: "Configure tax rates, rules, and tax-related settings",
          icon: "mdi-percent",
          value: "taxes",
          component: "SalesTaxes"
        },
        // {
        //   title: "Customers",
        //   description: "Manage customer settings, groups, and preferences",
        //   icon: "mdi-account-group",
        //   value: "customers",
        //   component: "CustomerSettings"
        // },
        {
          title: "Configuration",
          description: "Configure sales settings, rules, and preferences",
          icon: "mdi-cog-outline",
          value: "configuration",
          component: "SalesConfiguration"
        },
        {
          title: "Terms and Conditions",
          description: "Manage terms and conditions for quotations, proformas, and sales orders",
          icon: "mdi-file-document-edit",
          value: "termsAndConditions",
          component: "SalesTermsAndConditions"
        }
      ]
    };
  },

  // Lifecycle hooks
  mounted() {
    this.windowHeight = window.innerHeight - 150;
  },

  // Methods
  methods: {
    // Component navigation methods
    openComponent(item) {
      this.selectedComponent = item;
    },

    goBack() {
      this.selectedComponent = null;
    }
  },
};
</script>

<style scoped>
/* Card Grid Layout */
.settings-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  height: 100% !important;
  min-height: 180px !important;
  background: white !important;
  border: 1px solid transparent !important;
}

.settings-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  background: linear-gradient(135deg, #FFE5F0 0%, #E8F4FD 50%, #F0E8FF 100%) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}

/* Icon Container */
.icon-container {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #DB4C77 0%, #9C27B0 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.3) !important;
}

/* Icon Outline Style */
.icon-outline {
  color: rgba(255, 255, 255, 0.85) !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) !important;
  text-shadow: 
    0 0 2px rgba(255, 255, 255, 0.6),
    0 0 4px rgba(255, 255, 255, 0.4),
    0 0 6px rgba(255, 255, 255, 0.2) !important;
  opacity: 0.95 !important;
}

/* Card Title */
.card-title {
  font-size: 18px !important;
  font-weight: 500 !important;
  color: #2c3e50 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Card Description */
.card-description {
  font-size: 14px !important;
  color: #6c757d !important;
  line-height: 1.4 !important;
  margin: 0 !important;
  font-weight: 400 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-card {
    min-height: 160px !important;
  }
  
  .card-title {
    font-size: 16px !important;
  }
  
  .card-description {
    font-size: 13px !important;
  }
  
  .icon-container {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>
