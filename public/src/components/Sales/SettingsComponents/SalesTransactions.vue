<template>
  <div>
    <v-card flat class="pa-4">
      <!-- Header with Back Button -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="#DB4C77" size="24">mdi-cash-multiple</v-icon>
          <span class="text-h5">Transaction Settings</span>
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
        <v-row>
          <!-- Left Column -->
          <v-col cols="12" md="6">
            <v-card class="pa-4" elevation="1">
              <v-card-title class="text-h6 mb-4">
                <v-icon class="mr-2" color="#DB4C77">mdi-cog</v-icon>
                Transaction Options
              </v-card-title>
              
              <v-list class="pa-0">
                <v-list-item
                  v-for="(item, key) in leftColumnItems"
                  :key="key"
                  class="px-0 py-2"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      v-model="transactionSettings[key]"
                      color="#DB4C77"
                      hide-details
                      density="compact"
                    ></v-checkbox>
                  </template>
                  
                  <v-list-item-title class="d-flex align-center">
                    <v-icon 
                      :icon="item.icon" 
                      :color="transactionSettings[key] ? '#DB4C77' : 'grey'"
                      class="mr-3"
                      size="20"
                    ></v-icon>
                    <span :class="transactionSettings[key] ? 'font-weight-medium' : 'text-grey'">
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

              <!-- Due Dates and Payment Terms Button -->
              <div v-if="transactionSettings.dueDatesAndPaymentTerms" class="mt-4">
                <v-btn
                  color="#DB4C77"
                  variant="outlined"
                  @click="openPaymentTermsDialog"
                  class="w-100"
                >
                  <v-icon left>mdi-calendar-clock</v-icon>
                  Set Payment Terms
                </v-btn>
              </div>
            </v-card>
          </v-col>
          
          <!-- Right Column -->
          <v-col cols="12" md="6">
            <v-card class="pa-4" elevation="1">
              <v-card-title class="text-h6 mb-4">
                <v-icon class="mr-2" color="#DB4C77">mdi-cog</v-icon>
               Taxes, Discount & Totals
              </v-card-title>
              
              <v-list class="pa-0">
                <v-list-item
                  v-for="(item, key) in rightColumnItems"
                  :key="key"
                  class="px-0 py-2"
                >
                  <template v-slot:prepend>
                    <v-checkbox
                      v-model="transactionSettings[key]"
                      color="#DB4C77"
                      hide-details
                      density="compact"
                    ></v-checkbox>
                  </template>
                  
                  <v-list-item-title class="d-flex align-center">
                    <v-icon 
                      :icon="item.icon" 
                      :color="transactionSettings[key] ? '#DB4C77' : 'grey'"
                      class="mr-3"
                      size="20"
                    ></v-icon>
                    <span :class="transactionSettings[key] ? 'font-weight-medium' : 'text-grey'">
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

    <!-- Payment Terms Dialog -->
    <PaymentTermsDialog
      v-model="paymentTermsDialog"
      :payment-terms="paymentTerms"
      @save="handlePaymentTermsSave"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_sales_purchase_config } from "@/mixins/GetSalesPurchaseConfig.js";
import { API, graphqlOperation } from "aws-amplify";
import { organization_sales_purchase_config } from "@/graphql/mutations.js";
import PaymentTermsDialog from "./PaymentTermsDialog.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  name: 'SalesTransactions',
  
  mixins: [get_sales_purchase_config],
  
  components: {
    PaymentTermsDialog,
    SnackBar,
  },
  
  data() {
    return {
      saving: false,
             transactionSettings: {
         invoiceBillNo: true,
         billingNameParties: true,
         inclusiveExclusiveTax: false,
         displayPurchasePrice: false,
         showLast5SalePrice: true,
         transactionWiseTax: false,
         transactionWiseDiscount: true,
         roundOffTotal: false,
         discountDuringPayments: false,
         linkPaymentsToInvoices: false,
         doNotShowInvoicePreview: false,
         dueDatesAndPaymentTerms: false,
         triggerOverDueEmail: false,
         autoTriggeredEmail: false
       },
      transactionConfig: {},
      paymentTermsDialog: false,
      paymentTerms: [],
      SnackBarComponent: {},
      leftColumnItems: {
        // invoiceBillNo: {
        //   title: 'Invoice/Bill No',
        //   description: 'Enable automatic generation and display of invoice/bill numbers for transactions',
        //   icon: 'mdi-receipt'
        // },
        billingNameParties: {
          title: 'Billing Name of Parties',
          description: 'Show billing names of parties involved in the transaction',
          icon: 'mdi-account-group'
        },
        // inclusiveExclusiveTax: {
        //   title: 'Inclusive/Exclusive Tax on Rate (Price/Unit)',
        //   description: 'Display whether tax is included or excluded in the item price/unit rate',
        //   icon: 'mdi-percent'
        // },
        // displayPurchasePrice: {
        //   title: 'Display Purchase Price of Items',
        //   description: 'Show the purchase price of items in transaction details',
        //   icon: 'mdi-currency-usd'
        // },
        // showLast5SalePrice: {
        //   title: 'Show last 5 Sale Price of Items',
        //   description: 'Display the last 5 sale prices for each item in transactions',
        //   icon: 'mdi-history'
        // },
        // discountDuringPayments: {
        //   title: 'Discount During Payments',
        //   description: 'Allow discount to be applied during payment processing',
        //   icon: 'mdi-cash-minus'
        // },
        // linkPaymentsToInvoices: {
        //   title: 'Link Payments to Invoices',
        //   description: 'Automatically link payments to their corresponding invoices',
        //   icon: 'mdi-link'
        // },
        // doNotShowInvoicePreview: {
        //   title: 'Do not Show Invoice Preview',
        //   description: 'Skip showing invoice preview before finalizing',
        //   icon: 'mdi-eye-off'
        // },
        dueDatesAndPaymentTerms: {
          title: 'Due Dates and Payment Terms',
          description: 'Enable and manage due dates and payment terms for transactions',
          icon: 'mdi-calendar-clock'
        },
        triggerOverDueEmail: {
          title: 'Trigger Over Due Email',
          description: 'Automatically send email notifications for overdue payments',
          icon: 'mdi-email-alert'
        },
        autoTriggeredEmail: {
          title: 'Auto Triggered Email',
          description: 'Enable automatic email notifications for various transaction events',
          icon: 'mdi-email-send'
        }
        
      },
      rightColumnItems: {
        transactionWiseTax: {
          title: 'Transaction wise Tax',
          description: 'Calculate and display tax amounts for each transaction separately',
          icon: 'mdi-calculator'
        },
        transactionWiseDiscount: {
          title: 'Transaction wise Discount',
          description: 'Apply and show discount amounts for each transaction individually',
          icon: 'mdi-tag'
        },
        roundOffTotal: {
          title: 'Round Off Total',
          description: 'Automatically round off the total amount to the nearest whole number',
          icon: 'mdi-round-corner'
        }
      }
    }
  },
  
  async mounted() {
    await this.loadTransactionConfig();
  },
  
  methods: {
    goBack() {
      this.$emit('backAction');
    },
    
    async loadTransactionConfig() {
      try {
        // Call the mixin method to get sales purchase config
        await this.get_sales_purchase_config();
        this.transactionConfig = this.salesPurchaseConfig.find(
          (config) => config.config_type === "TRANSACTION"
        );
        
        // console.log("Transaction Config loaded:", this.transactionConfig);
        
        // Load settings from API if they exist
        if (this.transactionConfig) {
          // Map API properties to our checkbox settings
          // console.log("transactionConfig", this.transactionConfig)
                     this.transactionSettings = {
             invoiceBillNo: Boolean(this.transactionConfig.invoice_or_bill_no),
             billingNameParties: Boolean(this.transactionConfig.billing_name_parties),
             inclusiveExclusiveTax: Boolean(this.transactionConfig.with_or_without_tax),
             displayPurchasePrice: Boolean(this.transactionConfig.item_purchase_price),
             showLast5SalePrice: Boolean(this.transactionConfig.last_sale_price),
             transactionWiseTax: Boolean(this.transactionConfig.with_or_without_tax), // Using same property as inclusiveExclusiveTax for now
           
             transactionWiseDiscount: Boolean(this.transactionConfig.transaction_wise_discount),
             roundOffTotal: Boolean(this.transactionConfig.round_of),
             discountDuringPayments: Boolean(this.transactionConfig.discount_payments), // Using same property as transactionWiseDiscount
             linkPaymentsToInvoices: Boolean(this.transactionConfig.link_payments_invoice),
             doNotShowInvoicePreview: !Boolean(this.transactionConfig.show_preview), // Inverted because it's "do not show"
             dueDatesAndPaymentTerms: Boolean(this.transactionConfig.due_dates),
             triggerOverDueEmail: Boolean(this.transactionConfig.trigger_over_due_email),
             autoTriggeredEmail: Boolean(this.transactionConfig.auto_triggered_email)
           };
        
          
          // Load payment terms if they exist
          if (this.transactionConfig.due_date_terms) {
            this.paymentTerms = Array.isArray(this.transactionConfig.due_date_terms) 
              ? this.transactionConfig.due_date_terms 
              : [];
          } else {
            // Set default payment terms if none exist
            this.paymentTerms = [
              { name: 'Due on Receipt', days: 0, isDefault: true },
              { name: 'Net 15', days: 15, isDefault: false },
              { name: 'Net 30', days: 30, isDefault: false },
              { name: 'Net 45', days: 45, isDefault: false }
            ];
          }
          // console.log("transactionWiseTax", this.transactionSettings.transactionWiseTax)
          //  console.log("Mapped transaction settings:", this.transactionSettings);
          // console.log("Payment terms loaded:", this.paymentTerms);
        }
        
      } catch (error) {
        console.error("Error loading transaction config:", error);
      }
    },
    
    async saveSettings() {
      this.saving = true;
      try {
        // Map our checkbox settings to API structure
                 const apiSettings = {
           // Map our UI settings to API properties
           invoice_or_bill_no: this.transactionSettings.invoiceBillNo,
           billing_name_parties: this.transactionSettings.billingNameParties,
           with_or_without_tax: this.transactionSettings.transactionWiseTax,
           item_purchase_price: this.transactionSettings.displayPurchasePrice,
           last_sale_price: this.transactionSettings.showLast5SalePrice,
           discount_payments: this.transactionSettings.discountDuringPayments, 
           transaction_wise_discount: this.transactionSettings.transactionWiseDiscount,
           round_of: this.transactionSettings.roundOffTotal,
           link_payments_invoice: this.transactionSettings.linkPaymentsToInvoices,
           show_preview: !this.transactionSettings.doNotShowInvoicePreview, // Inverted because it's "do not show"
           due_dates: this.transactionSettings.dueDatesAndPaymentTerms,
           due_date_terms: this.paymentTerms,
           trigger_over_due_email: this.transactionSettings.triggerOverDueEmail,
           auto_triggered_email: this.transactionSettings.autoTriggeredEmail
         };

        // console.log("Saving transaction settings:", apiSettings);

        // Call the API to save transaction settings
        let result = await API.graphql(
          graphqlOperation(organization_sales_purchase_config, {
            input: {
              config_type: this.transactionConfig?.config_type || "TRANSACTION",
              config_settings: JSON.stringify(apiSettings),
              config_id: this.transactionConfig?.config_id || null,
            },
          })
        );
        
        var response = JSON.parse(result.data.organization_sales_purchase_config);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message || 'Transaction settings saved successfully!',
            timeout: 5000,
            Top: true,
          };
          
          // Refresh the config data
          await this.loadTransactionConfig();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message || 'Failed to save transaction settings',
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.error("Error saving transaction settings:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error saving transaction settings. Please try again.",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.saving = false;
      }
    },
    
    resetForm() {
             // Reset to default values
       this.transactionSettings = {
         invoiceBillNo: true,
         billingNameParties: true,
         inclusiveExclusiveTax: false,
         displayPurchasePrice: false,
         showLast5SalePrice: true,
         transactionWiseTax: false,
         transactionWiseDiscount: false,
         roundOffTotal: false,
         discountDuringPayments: false,
         linkPaymentsToInvoices: false,
         doNotShowInvoicePreview: false,
         dueDatesAndPaymentTerms: false,
         triggerOverDueEmail: false,
         autoTriggeredEmail: false
       };
      this.paymentTerms = [];
    },

    openPaymentTermsDialog() {
      this.paymentTermsDialog = true;
    },

    handlePaymentTermsSave(newTerms) {
      this.paymentTerms = newTerms;
      this.transactionSettings.dueDatesAndPaymentTerms = true;
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: "Payment terms saved successfully!",
        timeout: 5000,
        Top: true,
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
