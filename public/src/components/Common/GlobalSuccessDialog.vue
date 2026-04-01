<template>
  <v-dialog
    v-model="dialog"
    max-width="800px"
    persistent
    transition="dialog-bottom-transition"
  >
    <v-card class="success-dialog" :style="themeStyles">
      <!-- Header -->
      <v-card-title class="success-header pa-6 pb-4" :style="{
          '--header-color': themeStyles.headerColor,
          '--header-color-dark': themeStyles.headerColorDark
        }">
        <div class="d-flex align-center">
          <v-icon size="32" color="success" class="mr-3">mdi-check-circle</v-icon>
          <div>
            <h2 class="text-h4 font-weight-bold text-white mb-1">
              {{ config.title }}
            </h2>
            <p class="text-subtitle-1 text-white-lighten-1 mb-0">
              {{ config.subtitle }}
            </p>
          </div>
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6 pt-4">
        <div class="document-details">
          <!-- Main Info Cards -->
          <div class="row mb-6">
            <div class="col-md-6 mb-4">
              <v-card class="info-card" elevation="2" :style="{
                '--accent-color': themeStyles.accentColor
              }">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-3">
                    <v-icon size="24" color="primary" class="mr-3">{{ config.detailsIcon }}</v-icon>
                    <h3 class="text-h6 font-weight-bold mb-0">{{ config.detailsTitle }}</h3>
                  </div>
                  <div class="detail-item">
                    <span class="label">{{ config.documentNumberLabel }}:</span>
                    <span class="value font-weight-bold">{{ documentData.invoice_no || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">{{ config.partyLabel || 'Customer' }}:</span>
                    <span class="value">{{ documentData[config.partyField || 'customer_name'] || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Date:</span>
                    <span class="value">{{ formatDate(documentData.invoice_date) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Status:</span>
                    <v-chip
                      color="success"
                      size="small"
                      class="font-weight-bold"
                    >
                      {{ getStatusText(documentData) }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <div class="col-md-6 mb-4">
              <v-card class="info-card" elevation="2">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-3">
                    <v-icon size="24" color="primary" class="mr-3">mdi-currency-inr</v-icon>
                    <h3 class="text-h6 font-weight-bold mb-0">Financial Summary</h3>
                  </div>
                  <div class="detail-item">
                    <span class="label">Total Amount:</span>
                    <span class="value font-weight-bold text-h6">
                      {{ getCurrencySymbol(documentData.currency) }}{{ formatAmount(documentData.total_cost) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Currency:</span>
                    <span class="value">{{ documentData.currency || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Items Count:</span>
                    <span class="value">{{ (documentData.table_data && documentData.table_data.length) || 0 }} items</span>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Items Summary -->
          <v-card class="items-summary mb-6" elevation="2">
            <v-card-title class="pa-4 pb-2">
              <div class="d-flex align-center">
                <v-icon size="24" color="primary" class="mr-3">mdi-package-variant</v-icon>
                <h3 class="text-h6 font-weight-bold mb-0">Items Summary</h3>
              </div>
            </v-card-title>
            <v-card-text class="pa-4 pt-0">
              <div v-if="documentData.table_data && documentData.table_data.length > 0">
                <div 
                  v-for="(item, index) in documentData.table_data.slice(0, 3)" 
                  :key="index"
                  class="item-row mb-3 pa-3 rounded"
                  :class="index % 2 === 0 ? 'bg-grey-lighten-5' : 'bg-white'"
                >
                  <div class="d-flex justify-space-between align-center">
                    <div class="d-flex align-center">
                      <v-icon size="20" color="primary" class="mr-3">mdi-circle-small</v-icon>
                      <span class="font-weight-medium">{{ item.item_name }}</span>
                    </div>
                    <div class="text-right">
                      <div class="text-caption text-grey">
                        {{ item.quantity }} {{ item.unit }} × {{ getCurrencySymbol(documentData.currency) }}{{ formatAmount(item.price_per_unit) }}
                      </div>
                      <div class="font-weight-bold">
                        {{ getCurrencySymbol(documentData.currency) }}{{ formatAmount(item.amount) }}
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="documentData.table_data.length > 3" class="text-center pa-3">
                  <v-chip color="primary" variant="outlined" size="small">
                    +{{ documentData.table_data.length - 3 }} more items
                  </v-chip>
                </div>
              </div>
              <div v-else class="text-center pa-4 text-grey">
                <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-package-variant-closed</v-icon>
                <div>No items added to this {{ config.documentType.toLowerCase() }}</div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Success Message -->
          <v-card class="success-message" elevation="1" :style="{
            '--message-bg-light': themeStyles.messageBgLight,
            '--message-bg-dark': themeStyles.messageBgDark
          }">
            <v-card-text class="pa-4 text-center">
              <v-icon size="48" color="success" class="mb-3">mdi-party-popper</v-icon>
              <h4 class="text-h5 font-weight-bold text-success mb-2">
                Congratulations!
              </h4>
              <p class="text-body-1 text-grey-darken-1 mb-0">
                Your {{ config.documentType.toLowerCase() }} <strong>{{ documentData.invoice_no || 'N/A' }}</strong> has been successfully generated 
                for <strong>{{ documentData[config.partyField || 'customer_name'] || 'N/A' }}</strong>. 
              </p>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <!-- <v-btn
          color="primary"
          variant="outlined"
          size="large"
          @click="viewDocument"
          prepend-icon="mdi-eye"
        >
          {{ config.viewButtonText }}
        </v-btn> -->
        <v-btn
          color="success"
          size="large"
          @click="closeDialog"
          prepend-icon="mdi-check"
        >
          Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "GlobalSuccessDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    documentData: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: Object,
      required: true,
      default: () => ({
        title: "Document Generated Successfully!",
        subtitle: "Your document has been created and is ready for use.",
        documentType: "Document",
        documentNumberLabel: "Document No",
        detailsTitle: "Document Details",
        detailsIcon: "mdi-file-document",
        viewButtonText: "View Document",
        successMessage: "You can now view, edit, or share this document.",
        statusField: "order_status",
        statusFallbackField: "quotation_status",
        theme: "default", // default, quotation, proforma, invoice
        partyLabel: "Customer",
        partyField: "customer_name"
      }),
    },
  },
  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    themeStyles() {
      const themes = {
        default: {
          headerColor: '#4CAF50',
          headerColorDark: '#45a049',
          accentColor: '#4CAF50',
          messageBgLight: '#f8fff9',
          messageBgDark: '#f0fdf0'
        },
        quotation: {
          headerColor: '#4CAF50',
          headerColorDark: '#45a049',
          accentColor: '#4CAF50',
          messageBgLight: '#f8fff9',
          messageBgDark: '#f0fdf0'
        },
        proforma: {
          headerColor: '#2196F3',
          headerColorDark: '#1976D2',
          accentColor: '#2196F3',
          messageBgLight: '#f0f8ff',
          messageBgDark: '#e3f2fd'
        },
        invoice: {
          headerColor: '#FF9800',
          headerColorDark: '#F57C00',
          accentColor: '#FF9800',
          messageBgLight: '#fff8f0',
          messageBgDark: '#fdf0e0'
        }
      };
      
      return themes[this.config.theme] || themes.default;
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false;
    },
    viewDocument() {
      // Emit event to parent to view the document
      this.$emit("view-document", this.documentData);
      this.closeDialog();
    },
    getStatusText(data) {
      // Try to get status from config fields, with fallbacks
      const status = data[this.config.statusField] || 
                    data[this.config.statusFallbackField] || 
                    data.proforma_order_staus || 
                    'N/A';
      return status;
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (error) {
        return dateString;
      }
    },
    formatAmount(amount) {
      if (!amount) return "0.00";
      const num = parseFloat(amount);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    },
    getCurrencySymbol(currency) {
      const symbols = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        JPY: "¥",
        CAD: "CA$",
        AUD: "A$",
        CHF: "CHF",
        CNY: "CN¥",
      };
      return symbols[currency] || currency || "₹";
    },
  },
};
</script>

<style scoped>
.success-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.success-header {
  background: linear-gradient(135deg, var(--header-color, #4CAF50) 0%, var(--header-color-dark, #45a049) 100%);
  color: white;
}

.info-card {
  border-radius: 12px;
  border-left: 4px solid var(--accent-color, #4CAF50);
  height: 100%;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.value {
  color: #333;
  font-size: 14px;
}

.items-summary {
  border-radius: 12px;
  border-left: 4px solid #2196F3;
}

.item-row {
  transition: all 0.2s ease;
}

.item-row:hover {
  background-color: #f8f9fa !important;
  transform: translateX(4px);
}

.success-message {
  border-radius: 12px;
  border-left: 4px solid var(--accent-color, #4CAF50);
  background: linear-gradient(135deg, var(--message-bg-light, #f8fff9) 0%, var(--message-bg-dark, #f0fdf0) 100%);
}

/* Button styling */
.v-btn {
  border-radius: 8px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  transition: all 0.3s ease !important;
}

.v-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .success-header h2 {
    font-size: 1.5rem !important;
  }
  
  .col-md-6 {
    margin-bottom: 16px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
