<template>
  <div>
    <!-- Card Grid View -->
    <div v-if="!selectedComponent">
      <v-card flat class="pa-4 overflow-y-auto" :height="windowHeight">
        <v-card-text class="pa-0">
          <!-- Card Grid Layout -->
          <v-row>
            <v-col 
              v-for="(item, index) in templateCards" 
              :key="index"
              cols="12"
              sm="6"
              md="4"
              class="mb-4"
            >
              <v-card 
                class="template-card"
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

// Imports for email template components
import QuotationTemplate from "@/components/Sales/EmailTemplateComponents/QuotationTemplate.vue";
import ProformaTemplate from "@/components/Sales/EmailTemplateComponents/ProformaTemplate.vue";
import SaleOrderTemplate from "@/components/Sales/EmailTemplateComponents/SaleOrderTemplate.vue";
import InvoiceTemplate from "@/components/Sales/EmailTemplateComponents/InvoiceTemplate.vue";
import OverdueTemplate from "@/components/Sales/EmailTemplateComponents/OverdueTemplate.vue";

export default {
  // Components
  components: {
    QuotationTemplate,
    ProformaTemplate,
    SaleOrderTemplate,
    InvoiceTemplate,
    OverdueTemplate,
  },

  // Data
  data() {
    return {
      // UI properties
      windowHeight: 0,
      selectedComponent: null,

      // Template cards configuration
      templateCards: [
        // {
        //   title: "Quotation Template",
        //   description: "Customize email templates for quotation notifications and communications",
        //   icon: "mdi-file-document-outline",
        //   value: "quotation",
        //   component: "QuotationTemplate"
        // },
        // {
        //   title: "Proforma Template",
        //   description: "Configure email templates for proforma invoice communications",
        //   icon: "mdi-file-document-multiple-outline",
        //   value: "proforma",
        //   component: "ProformaTemplate"
        // },
        // {
        //   title: "Sale Order Template",
        //   description: "Manage email templates for sales order confirmations and updates",
        //   icon: "mdi-clipboard-text-outline",
        //   value: "saleorder",
        //   component: "SaleOrderTemplate"
        // },
        {
          title: "Invoice Template",
          description: "Customize email templates for invoice notifications and reminders",
          icon: "mdi-receipt-outline",
          value: "invoice",
          component: "InvoiceTemplate"
        },
        {
          title: "Overdue Template",
          description: "Configure email templates for overdue payment reminders",
          icon: "mdi-clock-alert-outline",
          value: "overdue",
          component: "OverdueTemplate"
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
.template-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  height: 100% !important;
  min-height: 180px !important;
  background: white !important;
  border: 1px solid transparent !important;
}

.template-card:hover {
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
  .template-card {
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