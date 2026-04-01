<template>
  <div>
    <v-dialog
      v-model="dialogVisible"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card class="quotation-preview-card">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Quotation Preview</div>
          </v-toolbar-title>
          <v-spacer />
          <div class="d-flex align-center">
            <v-btn
              v-if="isDataReady"
              icon
              variant="text"
              size="small"
              color="primary"
              @click="printQuotation"
              class="mr-2"
              title="Print"
            >
              <v-icon>mdi-printer</v-icon>
            </v-btn>
            <!-- <v-btn
              icon
              variant="text"
              size="small"
              color="success"
              @click="downloadQuotation"
              class="mr-2"
              title="Download PDF"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn> -->
            <v-icon class="icon-class" @click="closeDialog">mdi-close</v-icon>
          </div>
        </v-toolbar>

        <v-card-text class="pa-0">
          <!-- Loading State -->
          <div v-if="!hasQuotationData" class="loading-state">
            <div class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="32"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-body-2 text-grey">Loading quotation...</div>
            </div>
          </div>

          <!-- Quotation Content -->
          <div v-else class="quotation-content" ref="quotationContent">
            <!-- Header -->
            <table class="quotation-header-table" border="1" cellspacing="0" cellpadding="8">
              <tbody>
                <tr>
                  <td class="header-left-cell" :rowspan="selectedQuotation.validity_days ? 4 : 3">
                    <div class="header-left-content">
                      <div class="company-logo">
                        <v-img
                          v-if="selectedEntity.entity_logo"
                          :src="selectedEntity.entity_logo"
                          width="60"
                          height="60"
                          class="company-logo-img"
                          contain
                        />
                        <v-icon v-else size="48" color="grey-lighten-1">mdi-domain</v-icon>
                      </div>
                      <div class="company-info">
                        <h2 class="company-name">{{ selectedEntity.entity_name }}</h2>
                        <p class="company-gst">
                          GST: {{ selectedEntity.entity_gst }}
                        </p>
                        <p class="company-address" v-if="selectedEntity.entity_address">
                          {{ selectedEntity.entity_address }}
                        </p>
                        <p class="company-phone" v-if="selectedEntity.entity_phone">
                          Phone : {{ selectedEntity.entity_phone }}
                        </p>
                        <p class="company-email" v-if="selectedEntity.entity_email">
                          {{ selectedEntity.entity_email }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="header-right-cell quotation-title-cell">
                    <h1 class="quotation-title">QUOTATION</h1>
                  </td>
                </tr>
                <tr>
                  <td class="header-right-cell detail-row-cell">
                    <div class="detail-row-content">
                      <span class="detail-label">QUOTATION NO</span>
                      <span class="detail-value">{{
                        selectedQuotation.invoice_no || "N/A"
                      }}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="header-right-cell detail-row-cell">
                    <div class="detail-row-content">
                      <span class="detail-label">DATE:</span>
                      <span class="detail-value">{{
                        formatDate(selectedQuotation.invoice_date)
                      }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="selectedQuotation.validity_days">
                  <td class="header-right-cell detail-row-cell">
                    <div class="detail-row-content">
                      <span class="detail-label">VALIDITY</span>
                      <span class="detail-value">{{
                        selectedQuotation.validity_days + " days"
                      }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <!-- Customer Details -->
            <div class="customer-section">
              <table class="customer-table" border="1" cellspacing="0" cellpadding="8">
                <thead>
                  <tr>
                    <th class="customer-header-cell">Bill to</th>
                    <th class="reference-header-cell">Reference / Comments / Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="customer-info-cell">
                      <div class="customer-info">
                        <h3 class="customer-name">
                          {{ selectedQuotation.customer_name || "N/A" }}
                        </h3>
                        
                        <div class="customer-details-list">
                          <div class="customer-detail-row" v-if="selectedCustomer?.customer_display_id || selectedQuotation.customer_code">
                            <span class="customer-detail-label">Customer ID#:</span>
                            <span class="customer-detail-value">{{ selectedCustomer?.customer_display_id || selectedQuotation.customer_code }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedCustomer?.address_line_1 || selectedQuotation.customer_address || selectedQuotation.address_line_1">
                            <span class="customer-detail-label">Address:</span>
                            <span class="customer-detail-value">{{ selectedCustomer?.address_line_1 || selectedQuotation.customer_address || selectedQuotation.address_line_1 }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedCustomer?.primary_contact_no || selectedQuotation.customer_phone">
                            <span class="customer-detail-label">Phone:</span>
                            <span class="customer-detail-value">{{ formatPhoneNumber(selectedCustomer?.primary_contact_no || selectedQuotation.customer_phone) }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedCustomer?.gst_no || selectedQuotation.customer_gst">
                            <span class="customer-detail-label">GST:</span>
                            <span class="customer-detail-value">{{ selectedCustomer?.gst_no || selectedQuotation.customer_gst }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedCustomer?.state_1 || selectedQuotation.customer_state">
                            <span class="customer-detail-label">State:</span>
                            <span class="customer-detail-value">{{ selectedCustomer?.state_1 || selectedQuotation.customer_state }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedQuotation.project_name">
                            <span class="customer-detail-label">Project:</span>
                            <span class="customer-detail-value">{{ selectedQuotation.project_name }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="reference-info-cell">
                      <div class="reference-section">
                        <div class="reference-content">
                          <div v-if="selectedQuotation.reference">{{ selectedQuotation.reference }}</div>
                          <div v-if="selectedQuotation.comments">{{ selectedQuotation.comments }}</div>
                          <div v-if="selectedQuotation.instructions">{{ selectedQuotation.instructions }}</div>
                          <div v-if="!selectedQuotation.reference && !selectedQuotation.comments && !selectedQuotation.instructions" class="empty-reference">
                            &nbsp;
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Combined Items Table with Notes and Summary -->
            <table class="items-table-combined" border="1" cellspacing="0" cellpadding="8">
              <colgroup v-if="itemConfiguration.items_wise_discount">
                <col style="width:6%">
                <col style="width:8%">
                <col style="width:42%">
                <col style="width:10%">
                <col style="width:6%">
                <col style="width:6%">
                <col style="width:8%">
                <col style="width:6%">
                <col style="width:8%">
              </colgroup>
              <colgroup v-else>
                <col style="width:6%">
                <col style="width:8%">
                <col style="width:42%">
                <col style="width:10%">
                <col style="width:6%">
                <col style="width:6%">
                <col style="width:11%">
                <col style="width:11%">
              </colgroup>
              <thead>
                <tr>
                  <th class="text-left">Sl.No.</th>
                  <th class="text-left">Item#</th>
                  <th class="text-left">Description</th>
                  <th class="text-right">Unit price</th>
                  <th class="text-right">Qty.</th>
                  <th class="text-right">GST@</th>
                  <th v-if="itemConfiguration.items_wise_discount" class="text-right">DISCOUNT</th>
                  <th :colspan="itemConfiguration.items_wise_discount ? 2 : 2" class="text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="quotationItems && quotationItems.length > 0">
                  <tr v-for="(item, index) in quotationItems" :key="index">
                    <td valign="top">{{ index + 1 }}</td>
                    <td valign="top">{{ item.item_code || "N/A" }}</td>
                    <td valign="top">
                      <strong>{{ item.item_name || "N/A" }}</strong>
                      <div v-if="itemConfiguration.description && item.description" class="item-description-text">
                        {{ item.description }}
                      </div>
                      <div v-if="taxConfiguration.enable_hsn && item.hsn_code" class="item-hsn">
                        <strong>HSN : {{ item.hsn_code }}</strong>
                      </div>
                    </td>
                    <td valign="top" align="right">{{ getCurrencySymbol() }}{{ formatAmount(item.price_per_unit) }}</td>
                    <td valign="top" align="center">{{ item.quantity || "0" }}</td>
                    <td valign="top" align="center">{{ item.tax_percent || "0" }}%</td>
                    <td v-if="itemConfiguration.items_wise_discount" valign="top" align="right">{{ getCurrencySymbol() }}{{ formatAmount(item.discount_amount || "0.00") }}</td>
                    <td valign="top" align="right" :colspan="itemConfiguration.items_wise_discount ? 2 : 2">{{ getCurrencySymbol() }}{{ formatAmount(item.amount) }}</td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td :colspan="itemConfiguration.items_wise_discount ? 9 : 8" class="text-center">
                      No items available
                    </td>
                  </tr>
                </template>

                <!-- Notes (left) + Summary rows (right) -->
                <tr>
                  <td :colspan="itemConfiguration.items_wise_discount ? 7 : 6" :rowspan="summaryRowspan" valign="top" class="notes-cell">
                    <div class="notes-section">
                      <strong v-if="selectedQuotation.description">Note:</strong>
                      <div class="notes-content">
                        <div v-if="selectedQuotation.description">
                          <template v-for="(line, idx) in formatNotes(selectedQuotation.description)" :key="idx">
                            {{ idx + 1 }}. {{ line }}<br v-if="idx < formatNotes(selectedQuotation.description).length - 1">
                          </template>
                        </div>
                        <div v-else class="empty-notes">
                          <br><br>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td align="left" class="summary-label-cell">Subtotal</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(subTotal) }}</td>
                </tr>

                <tr v-if="selectedQuotation.discount_amount && parseFloat(selectedQuotation.discount_amount) > 0">
                  <td align="left" class="summary-label-cell">Discount</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(selectedQuotation.discount_amount || '0.00') }}</td>
                </tr>

                <tr v-if="selectedQuotation.cgst_amount && parseFloat(selectedQuotation.cgst_amount) > 0">
                  <td align="left" class="summary-label-cell">CGST</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(selectedQuotation.cgst_amount || '0.00') }}</td>
                </tr>

                <tr v-if="selectedQuotation.sgst_amount && parseFloat(selectedQuotation.sgst_amount) > 0">
                  <td align="left" class="summary-label-cell">SGST</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(selectedQuotation.sgst_amount || '0.00') }}</td>
                </tr>

                <tr v-if="!selectedQuotation.cgst_amount && !selectedQuotation.sgst_amount && selectedQuotation.tax_amount && parseFloat(selectedQuotation.tax_amount) > 0">
                  <td align="left" class="summary-label-cell">Tax</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(selectedQuotation.tax_amount || '0.00') }}</td>
                </tr>

                <tr v-if="selectedQuotation.round_off && parseFloat(selectedQuotation.round_off_amount || '0') !== 0">
                  <td align="left" class="summary-label-cell">Round Off</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(selectedQuotation.round_off_amount || '0.00') }}</td>
                </tr>

                <!-- Amount in words (left) + Total (right) -->
                <tr>
                  <td :colspan="itemConfiguration.items_wise_discount ? 7 : 6" valign="top" class="notes-cell">
                    <strong>Amount in words :</strong>
                    {{ amountInWords }}
                  </td>
                  <td align="left" class="summary-label-cell total-row"><strong>Total</strong></td>
                  <td align="right" class="summary-value-cell total-row"><strong>{{ getCurrencySymbol() }}{{ formatAmount(totalAmount) }}</strong></td>
                </tr>
              </tbody>
            </table>

            <!-- Terms and Conditions Section -->
            <div v-if="selectedQuotation.terms_conditions" class="terms-section">
              <div class="section-title">Terms and Conditions</div>
              <div class="terms-content">
                {{ selectedQuotation.terms_conditions }}
              </div>
            </div>

            <!-- Signature Section -->
            <!-- <div class="signature-section">
             
              <div class="signature-text-container">
                 <div class="signature-container">
                <v-img
                  v-if="selectedEntity.entity_seal_signature"
                  :src="selectedEntity.entity_seal_signature"
                  width="200"
                  height="100"
                  class="signature-img"
                  contain
                />
                <div v-else class="signature-placeholder">
                  <v-icon size="48" color="grey">mdi-signature</v-icon>
                  <p>Signature Placeholder</p>
                </div>
              </div>
                <p class="company-name-bold">For {{ selectedEntity.entity_name }}</p>
                <div class="signature-line"></div>
                <p class="signature-text">Authorised Signatory</p>
              </div>
            </div> -->
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";

export default {
  name: "QuotationPreviewDialog",
  mixins: [get_global_categories, get_global_customers],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    quotationData: {
      type: Object,
      default: () => ({}),
    },
    entityData: {
      type: Object,
      default: () => ({}),
    },
    salesPurchaseConfig: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      // Component data will be populated from props
      isLoadingCategories: false,
      isLoadingCustomers: false,
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    hasQuotationData() {
      return (
        this.selectedQuotation && Object.keys(this.selectedQuotation).length > 0
      );
    },
    isDataReady() {
      // Check if quotation data exists and categories API call is complete
      return this.hasQuotationData && !this.isLoadingCategories;
    },
    selectedQuotation() {
      return this.quotationData || {};
    },
    selectedEntity() {
      return this.entityData || {};
    },
    itemConfiguration() {
      const itemconfig = this.salesPurchaseConfig?.find(
        (config) => config.config_type === "ITEM"
      );
      if (itemconfig) {
        return itemconfig;
      } else {
        return {
          item_category: false,
          description: false,
          items_wise_discount: false,
        };
      }
    },
    taxConfiguration() {
      const taxconfig = this.salesPurchaseConfig?.find(
        (config) => config.config_type === "TAXES"
      );
      if (taxconfig) {
        return taxconfig;
      } else {
        return {
          enable_place_of_supply: false,
          enable_hsn: false,
          enable_gst: false,
        };
      }
    },
    generalSettings() {
      const generalConfig = this.salesPurchaseConfig?.find(
        (config) => config.config_type === "GENERAL"
      );
      return generalConfig || {};
    },
    selectedCustomer() {
      // Find customer by matching customer_name with legal_name
      if (!this.selectedQuotation?.customer_name || !this.masterCustomers || this.masterCustomers.length === 0) {
        return null;
      }
      return this.masterCustomers.find(
        (customer) => customer.legal_name === this.selectedQuotation.customer_name
      ) || null;
    },
    quotationItems() {
      // Parse items from quotation data - handle multiple possible field names
      let items = [];

      // Try table_data first (this is the correct field name from EditQuotationDialog)
      if (this.selectedQuotation.table_data) {
        if (typeof this.selectedQuotation.table_data === "string") {
          try {
            items = JSON.parse(this.selectedQuotation.table_data);
          } catch (e) {
            console.error("Error parsing table_data:", e);
          }
        } else if (Array.isArray(this.selectedQuotation.table_data)) {
          items = this.selectedQuotation.table_data;
        }
      }

      // If no items found, try tableData field (fallback)
      if (!items || items.length === 0) {
        if (this.selectedQuotation.tableData) {
          if (typeof this.selectedQuotation.tableData === "string") {
            try {
              items = JSON.parse(this.selectedQuotation.tableData);
            } catch (e) {
              console.error("Error parsing tableData:", e);
            }
          } else if (Array.isArray(this.selectedQuotation.tableData)) {
            items = this.selectedQuotation.tableData;
          }
        }
      }

      // If still no items found, try items field
      if (!items || items.length === 0) {
        if (this.selectedQuotation.items) {
          if (typeof this.selectedQuotation.items === "string") {
            try {
              items = JSON.parse(this.selectedQuotation.items);
            } catch (e) {
              console.error("Error parsing items:", e);
            }
          } else if (Array.isArray(this.selectedQuotation.items)) {
            items = this.selectedQuotation.items;
          }
        }
      }

      return items || [];
    },
    subTotal() {
      if (!this.quotationItems || !this.quotationItems.length) return 0;
      return this.quotationItems.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    },
    totalTaxAmount() {
      if (!this.quotationItems || !this.quotationItems.length) return 0;
      return this.quotationItems.reduce((sum, item) => {
        return sum + (parseFloat(item.tax_amount) || 0);
      }, 0);
    },
    totalAmount() {
      // Use total_cost from quotation data if available, otherwise calculate from items
      if (this.selectedQuotation.total_cost) {
        return parseFloat(this.selectedQuotation.total_cost);
      }
      // Calculate with CGST and SGST if available, otherwise use tax_amount
      let tax = 0;
      if (this.selectedQuotation.cgst_amount && this.selectedQuotation.sgst_amount) {
        tax = parseFloat(this.selectedQuotation.cgst_amount || 0) + parseFloat(this.selectedQuotation.sgst_amount || 0);
      } else {
        tax = this.totalTaxAmount;
      }
      const discount = parseFloat(this.selectedQuotation.discount_amount || 0);
      const roundOff = parseFloat(this.selectedQuotation.round_off_amount || 0);
      return this.subTotal - discount + tax + roundOff;
    },
    amountInWords() {
      return this.numberToWords(this.totalAmount);
    },
    summaryRowspan() {
      // Count the number of summary rows (excluding Total which is in the last row)
      let count = 1; // Subtotal is always there
      if (this.selectedQuotation.discount_amount && parseFloat(this.selectedQuotation.discount_amount) > 0) count++;
      if (this.selectedQuotation.cgst_amount && parseFloat(this.selectedQuotation.cgst_amount) > 0) count++;
      if (this.selectedQuotation.sgst_amount && parseFloat(this.selectedQuotation.sgst_amount) > 0) count++;
      if (!this.selectedQuotation.cgst_amount && !this.selectedQuotation.sgst_amount && this.selectedQuotation.tax_amount && parseFloat(this.selectedQuotation.tax_amount) > 0) count++;
      if (this.selectedQuotation.round_off && parseFloat(this.selectedQuotation.round_off_amount || '0') !== 0) count++;
      return count;
    },
  },

  watch: {
    modelValue: {
      async handler(newVal) {
        if (newVal) {
          // Fetch global categories and customers when dialog opens
          this.isLoadingCategories = true;
          this.isLoadingCustomers = true;
          try {
            await Promise.all([
              this.get_global_categories(),
              this.get_global_customers()
            ]);
          } finally {
            this.isLoadingCategories = false;
            this.isLoadingCustomers = false;
          }
        }
      },
      immediate: true,
    },
  },

  methods: {
    getTotalColumns() {
      // Fixed columns matching image: Sl.No., Item#, Description, Unit price, Qty., GST@, Line total = 7
      return 7;
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    getCategoryName(categoryId) {
      if (!categoryId) return "N/A";
      
      // Find category name from the fetched global categories
      if (this.masterGlobalCategories && this.masterGlobalCategories.length > 0) {
        const category = this.masterGlobalCategories.find(cat => cat.category_id === categoryId);
        return category ? category.category_name : categoryId;
      }
      
      return categoryId;
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    formatAmount(amount) {
      if (!amount) return "0.00";
      return parseFloat(amount).toFixed(2);
    },
    formatPhoneNumber(phone) {
      if (!phone) return "";
      return String(phone).replace(/_/g, " ");
    },
    formatNotes(notes) {
      if (!notes) return [];
      // Split by newlines and filter empty lines
      return notes.split('\n').filter(line => line.trim().length > 0);
    },
    getCurrencySymbol() {
      if (!this.generalSettings || !this.generalSettings.billing_currency) {
        return " ";
      }
      const currency = this.generalSettings.billing_currency;
      if (currency === "None" || currency === undefined) {
        return " ";
      }
      const currencyMap = {
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
      return currencyMap[currency] || currency;
    },
    numberToWords(num) {
      if (num === 0) return "Zero";

      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
      ];
      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];
      const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];

      function convertLessThanOneThousand(n) {
        if (n === 0) return "";

        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100)
          return (
            tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
          );
        if (n < 1000)
          return (
            ones[Math.floor(n / 100)] +
            " Hundred" +
            (n % 100 !== 0 ? " and " + convertLessThanOneThousand(n % 100) : "")
          );
      }

      function convert(n) {
        if (n === 0) return "Zero";
        if (n < 1000) return convertLessThanOneThousand(n);
        if (n < 100000)
          return (
            convertLessThanOneThousand(Math.floor(n / 1000)) +
            " Thousand" +
            (n % 1000 !== 0 ? " " + convertLessThanOneThousand(n % 1000) : "")
          );
        if (n < 10000000)
          return (
            convertLessThanOneThousand(Math.floor(n / 100000)) +
            " Lakh" +
            (n % 100000 !== 0 ? " " + convert(n % 100000) : "")
          );
        return (
          convertLessThanOneThousand(Math.floor(n / 10000000)) +
          " Crore" +
          (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "")
        );
      }

      const rupees = Math.floor(num);
      const paise = Math.round((num - rupees) * 100);

      let result = convert(rupees) + " Rupees";
      if (paise > 0) {
        result += " and " + convert(paise) + " Paise";
      }

      return result + " Only";
    },
    async printQuotation() {
      // Get the quotation content element
      const quotationElement = this.$refs.quotationContent;
      
      // Find the scrollable parent container (could be v-card-text or dialog content)
      let scrollableContainer = quotationElement;
      let parent = quotationElement.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        if (style.overflow === 'auto' || style.overflow === 'scroll' || 
            style.overflowY === 'auto' || style.overflowY === 'scroll') {
          scrollableContainer = parent;
          break;
        }
        parent = parent.parentElement;
      }

      // Force all images to load by temporarily scrolling to ensure v-img components load
      const originalScrollTop = scrollableContainer.scrollTop || 0;
      const originalScrollLeft = scrollableContainer.scrollLeft || 0;
      
      // Scroll to bottom to trigger lazy loading of all images
      scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
      scrollableContainer.scrollLeft = 0;
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Scroll back to original position
      scrollableContainer.scrollTop = originalScrollTop;
      scrollableContainer.scrollLeft = originalScrollLeft;
      
      // Wait a bit more to ensure images are fully loaded
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Get all image sources from the ORIGINAL element before cloning
      const imageSources = [];
      
      // Get all img elements from original (including those inside v-img)
      const allImages = quotationElement.querySelectorAll("img");
      allImages.forEach((img) => {
        if (img.src && 
            img.src !== 'data:image/svg+xml' && 
            !img.src.includes('data:image/svg') &&
            img.complete) {
          imageSources.push(img.src);
        }
      });
      
      // Also try to get from v-img wrappers directly
      const vImgWrappers = quotationElement.querySelectorAll(".v-img");
      vImgWrappers.forEach((vImg) => {
        const actualImg = vImg.querySelector("img");
        if (actualImg && actualImg.src && 
            actualImg.src !== 'data:image/svg+xml' &&
            !actualImg.src.includes('data:image/svg')) {
          // Check if we already have this src
          if (!imageSources.includes(actualImg.src)) {
            imageSources.push(actualImg.src);
          }
        }
      });

      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=800,height=600");

      // Clone the element to avoid modifying the original
      const clonedElement = quotationElement.cloneNode(true);

      // Apply image sources to cloned element - match by order
      const clonedImages = clonedElement.querySelectorAll("img");
      clonedImages.forEach((img, index) => {
        if (index < imageSources.length && imageSources[index]) {
          img.setAttribute("src", imageSources[index]);
          img.src = imageSources[index]; // Force set src
          img.onload = null; // Remove any load handlers
        }
      });

      // Also process v-img elements - use component data to match correctly
      const clonedVImgs = clonedElement.querySelectorAll(".v-img");
      let imageSourceIndex = 0;
      clonedVImgs.forEach((vImg) => {
        const actualImg = vImg.querySelector("img");
        if (actualImg) {
          // Try to match by checking parent classes or use available sources
          // Check if it's company logo
          const logoParent = vImg.closest('.company-logo');
          // Check if it's signature
          const signatureParent = vImg.closest('.signature-container');
          let matchingSrc = null;
          
          if (logoParent && logoParent.classList.contains('company-logo')) {
            // Find logo source
            matchingSrc = imageSources.find(src => 
              src === this.selectedEntity.entity_logo ||
              (this.selectedEntity.entity_logo && src.includes(this.selectedEntity.entity_logo.split('/').pop()))
            ) || this.selectedEntity.entity_logo;
          } else if (signatureParent && signatureParent.classList.contains('signature-container')) {
            // Find signature source
            matchingSrc = imageSources.find(src => 
              src === this.selectedEntity.entity_seal_signature ||
              (this.selectedEntity.entity_seal_signature && src.includes(this.selectedEntity.entity_seal_signature.split('/').pop()))
            ) || this.selectedEntity.entity_seal_signature;
          } else {
            // Fallback: use next available source
            if (imageSourceIndex < imageSources.length) {
              matchingSrc = imageSources[imageSourceIndex];
              imageSourceIndex++;
            }
          }
          
          if (matchingSrc) {
            actualImg.setAttribute("src", matchingSrc);
            actualImg.src = matchingSrc;
            actualImg.onload = null;
          }
        }
      });
      // Create the print HTML with all necessary styles
      printWindow.document.write(`
        <html>
          <head>
            <title>Quotation - ${
              this.selectedQuotation.invoice_no || "N/A"
            }</title>
            <style>
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              
              body { 
                font-family: 'Arial', sans-serif; 
                margin: 20px; 
                color: #333;
                line-height: 1.4;
                background: white;
              }
              
              .quotation-content { 
                max-width: 800px; 
                margin: 0 auto;
                padding: 20px;
                background: white;
                font-family: 'Arial', sans-serif;
                line-height: 1.4;
              }
              
              .quotation-header-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                border: 1px solid #000;
                background: white;
              }
              
              .quotation-header-table tbody {
                border: none;
              }
              
              .quotation-header-table tr {
                border: none;
              }
              
              .header-left-cell {
                width: 50%;
                vertical-align: top;
                padding: 15px;
                border: 1px solid #000;
                border-right: 1px solid #000;
              }
              
              .header-right-cell {
                width: 50%;
                vertical-align: top;
                padding: 15px;
                border: 1px solid #000;
              }
              
              .quotation-title-cell {
                vertical-align: top;
                padding: 15px;
                border: 1px solid #000;
                text-align: right;
              }
              
              .detail-cell {
                vertical-align: top;
                padding: 0 15px 15px 15px;
              }
              
              .detail-row-cell {
                vertical-align: middle;
                padding: 10px 12px;
                background: #f5f5f5;
                border-left: 1px solid #000;
                border-right: 1px solid #000;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
              }
              
              .detail-row-cell:first-of-type {
                border-top: 1px solid #000;
                margin-top: 10px;
              }
              
              .detail-row-cell:last-of-type {
                border-bottom: 1px solid #000;
              }
              
              .detail-row-cell:not(:last-of-type) {
                border-bottom: 1px solid #000;
              }
              
              .detail-row-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
              }
              
              .detail-label {
                font-weight: 600;
                color: #333;
                font-size: 13px;
                text-align: left;
              }
              
              .detail-value {
                color: #333;
                font-size: 13px;
                text-align: right;
                font-weight: normal;
              }
              
              .header-left-content {
                display: flex;
                align-items: flex-start;
                gap: 15px;
              }
              
              .header-right-content {
                text-align: right;
              }
              
              .company-logo {
                flex-shrink: 0;
                margin: 0;
              }
              
              .company-logo img,
              .company-logo .v-img {
                width: 60px !important;
                height: 60px !important;
                max-width: 60px !important;
                max-height: 60px !important;
                min-width: 60px !important;
                min-height: 60px !important;
                object-fit: contain !important;
                display: block !important;
              }
              
              .company-info {
                flex: 1;
              }
              
              .company-name { 
                font-size: 18px; 
                font-weight: bold; 
                margin: 0 0 8px 0; 
                color: #333;
              }
              
              .company-gst {
                font-size: 13px;
                font-weight: bold;
                margin: 0 0 6px 0;
                color: #333;
              }
              
              .company-address {
                font-size: 13px;
                margin: 0 0 4px 0;
                color: #333;
                line-height: 1.5;
              }
              
              .company-phone {
                font-size: 13px;
                margin: 0 0 4px 0;
                color: #333;
              }
              
              .company-email {
                font-size: 13px;
                margin: 0;
                color: #333;
              }
              
              .quotation-title { 
                font-size: 28px; 
                font-weight: bold; 
                margin: 0 0 15px 0; 
                color: #333;
                text-transform: uppercase;
              }
              
              .quotation-details-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                border: 1px solid #e0e0e0;
                background: #f5f5f5;
              }
              
              .quotation-details-table tbody {
                border: none;
              }
              
              .quotation-details-table tr {
                border: none;
              }
              
              .quotation-details-table td {
                border: 1px solid #e0e0e0 !important;
                padding: 10px 12px;
                border-style: solid !important;
                border-width: 1px !important;
                border-color: #e0e0e0 !important;
                background: #f5f5f5;
              }
              
              .quotation-details-table .detail-label {
                font-weight: 600;
                color: #333;
                font-size: 13px;
                text-align: left;
                width: 40%;
                background: #f5f5f5;
              }
              
              .quotation-details-table .detail-value {
                color: #333;
                font-size: 13px;
                text-align: right;
                width: 60%;
                background: #f5f5f5;
              }
              
              .customer-section { 
                margin-bottom: 10px; 
              }
              
              .customer-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
              }
              
              .customer-table thead {
                background: #f8f9fa;
              }
              
              .customer-header-cell,
              .reference-header-cell {
                padding: 8px 12px;
                font-size: 13px;
                font-weight: bold;
                color: #333;
                text-align: left;
                border: 1px solid #000;
                background: #f8f9fa;
              }
              
              .customer-info-cell,
              .reference-info-cell {
                padding: 12px;
                vertical-align: top;
                border: 1px solid #000;
                background: white;
              }
              
              .customer-info {
                width: 100%;
              }
              
              .customer-name {
                font-size: 16px;
                font-weight: bold;
                margin: 0 0 8px 0;
                color: #333;
              }
              
              .customer-details-list {
                margin-top: 0;
              }
              
              .customer-detail-row {
                display: flex;
                margin-bottom: 4px;
                font-size: 12px;
                line-height: 1.4;
              }
              
              .customer-detail-label {
                font-weight: 600;
                color: #333;
                margin-right: 8px;
                min-width: 100px;
              }
              
              .customer-detail-value {
                color: #666;
                flex: 1;
              }
              
              .customer-details-compact {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 2px;
              }
              
              .customer-detail {
                font-size: 13px;
                color: #666;
                line-height: 1.2;
              }
              
              .reference-section {
                margin-top: 0;
                padding-top: 0;
                border-top: none;
              }
              
              .reference-content {
                font-size: 12px;
                color: #666;
                line-height: 1.5;
                margin-top: 0;
              }
              
              .empty-reference {
                min-height: 20px;
              }
              
              .items-section {
                margin-bottom: 0;
              }
              
              .notes-summary-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 0;
                margin-bottom: 20px;
                border: 1px solid #000;
              }
              
              .notes-summary-table tbody {
                border: none;
              }
              
              .notes-summary-table tr {
                border: none;
              }
              
              .notes-cell {
                width: 50%;
                vertical-align: top;
                padding: 16px;
                border-right: 1px solid #000;
                border-left: 1px solid #000;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
                border-bottom-left-radius: 8px;
                background: #f8f9fa;
              }
              
              .summary-cell {
                width: 50%;
                vertical-align: top;
                padding: 16px;
                border-right: 1px solid #000;
                border-top: 1px solid #000;
                border-bottom: 1px solid #000;
                border-bottom-right-radius: 8px;
                background: #f8f9fa;
              }
              
              .summary-container {
                background: transparent;
                border: none;
                padding: 0;
              }
              
              .notes-section {
                padding: 0;
                border: none;
                background: transparent;
              }
              
              .summary-container {
                background: #f8f9fa;
                border: 1px solid #000;
                border-top: 1px solid #000;
                border-left: none;
                border-right: 1px solid #000;
                border-bottom: 1px solid #000;
                border-top-left-radius: 0;
                border-top-right-radius: 0;
                border-bottom-left-radius: 0;
                border-bottom-right-radius: 8px;
                padding: 16px;
                min-width: 300px;
                max-width: 400px;
                width: 100%;
                margin-top: 0;
                margin-left: 0;
                height: 100%;
                display: flex;
                flex-direction: column;
              }
              
              .summary-row.total-row {
                border-top: 2px solid #dee2e6;
                padding-top: 12px;
                margin-top: auto;
                margin-bottom: 0;
              }
              
              .summary-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                padding: 4px 0;
              }
              
              .summary-row:last-child {
                margin-bottom: 0;
              }
              
              .summary-label {
                font-size: 14px;
                color: #495057;
                font-weight: 500;
              }
              
              .summary-value {
                font-size: 14px;
                color: #212529;
                font-weight: 600;
                text-align: right;
              }
              
              .summary-row.total-row {
                border-top: 2px solid #dee2e6;
                padding-top: 12px;
                margin-top: 8px;
              }
              
              .total-label {
                font-size: 16px;
                font-weight: 700;
                color: #212529;
              }
              
              .total-value {
                font-size: 16px;
                font-weight: 700;
                color: #059669;
              }
              
              .notes-section {
                margin: 0;
                padding: 0;
                border: none;
                background: transparent;
                display: flex;
                flex-direction: column;
                height: 100%;
              }
              
              .notes-content {
                font-size: 13px;
                color: #666;
                line-height: 1.6;
                white-space: pre-wrap;
              }
              
              .empty-notes {
                min-height: 20px;
              }
              
              .amount-words-text {
                margin-top: auto;
                padding-top: 12px;
                padding-left: 0;
                padding-right: 0;
                padding-bottom: 0;
                border: none;
                border-top: 1px solid #e0e0e0;
                margin-bottom: 0;
              }
              
              .amount-words-text strong {
                font-size: 13px;
                font-weight: bold;
                color: #333;
                display: block;
                margin-bottom: 6px;
              }
              
              .amount-words-text .amount-text {
                font-size: 13px;
                font-weight: bold;
                color: #333;
                margin: 0;
                line-height: 1.5;
              }
              
              .terms-section {
                margin-bottom: 20px;
                padding: 12px;
              }
              
              .terms-content {
                font-size: 13px;
                color: #666;
                line-height: 1.6;
                white-space: pre-wrap;
              }
              
              .items-table-combined {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                border: 1px solid #000;
                background: white;
              }
              
              .items-table-combined th {
                background: #f8f9fa;
                padding: 8px 4px;
                font-weight: bold;
                text-align: left;
                border: 1px solid #000;
                font-size: 11px;
                color: #333;
              }
              
              .items-table-combined th.text-right {
                text-align: right;
              }
              
              .items-table-combined td {
                padding: 8px 4px;
                border: 1px solid #000;
                vertical-align: top;
                font-size: 11px;
              }
              
              .items-table-combined td.text-right {
                text-align: right;
              }
              
              .items-table-combined td.text-center {
                text-align: center;
              }
              
              .notes-cell {
                vertical-align: top;
                padding: 16px;
                background: #f8f9fa;
                border: 1px solid #000;
              }
              
              .summary-label-cell {
                padding: 8px 12px;
                background: #f8f9fa;
                border: 1px solid #000;
                font-size: 14px;
                color: #495057;
                font-weight: 500;
              }
              
              .summary-value-cell {
                padding: 8px 12px;
                background: #f8f9fa;
                border: 1px solid #000;
                font-size: 14px;
                color: #212529;
                font-weight: 600;
                text-align: right;
              }
              
              .summary-label-cell.total-row,
              .summary-value-cell.total-row {
                background: #e9ecef;
                font-weight: 700;
                border-top: 2px solid #dee2e6;
              }
              
              .summary-value-cell.total-row {
                color: #059669;
                font-size: 16px;
              }
              
              .item-description {
                max-width: 300px;
              }
              
              .item-description-text {
                font-size: 11px;
                color: #666;
                margin-top: 4px;
                line-height: 1.4;
                font-weight: normal;
              }
              
              .item-hsn {
                font-size: 11px;
                color: #666;
                margin-top: 4px;
                font-weight: normal;
              }
              
              .item-details {
                font-size: 11px;
                color: #666;
                margin-top: 5px;
                font-style: italic;
              }
              
              .tax-row {
                background: #f8f9fa;
              }
              
              .subtotal-row {
                background: #f8f9fa;
                font-weight: 600;
                border-top: 1px solid #dee2e6;
              }
              
              .total-row {
                background: #e9ecef;
                font-weight: bold;
              }
              
              .signature-section {
                display: flex !important;
                justify-content: flex-end !important;
                align-items: flex-start !important;
                margin-top: 20px !important;
                clear: both !important;
                width: 100% !important;
              }
              
              .signature-container {
                margin-bottom: 15px !important;
                text-align: right !important;
                clear: none !important;
                width: auto !important;
              }

              .signature-container img,
              .signature-container .v-img {
                width: 150px !important;
                height: 75px !important;
                max-width: 150px !important;
                max-height: 75px !important;
                min-width: 150px !important;
                min-height: 75px !important;
                object-fit: contain !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                display: block !important;
                margin: 0 0 0 auto !important;
              }

              .signature-text-container {
                text-align: right !important;
                margin-top: 0 !important;
                clear: both !important;
                width: auto !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-end !important;
              }
              
              .company-name-bold {
                display: block !important;
              }
              
              .signature-line {
                width: 200px !important;
                height: 2px !important;
                background: #333 !important;
                margin: 20px 0 20px auto !important;
                display: block !important;
              }
              
              .signature-text {
                font-size: 14px !important;
                color: #666 !important;
                margin: 0 !important;
              }
              
              /* Print-specific layout fixes */
              @media print {
                @page {
                  margin: 0;
                  size: A4;
                }
                
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  -webkit-print-color-adjust: exact !important;
                }
                
                html {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                
                /* Hide any browser-generated headers/footers */
                @page :first {
                  margin-top: 0 !important;
                }
                
                @page :left {
                  margin-left: 0 !important;
                }
                
                @page :right {
                  margin-right: 0 !important;
                }
                
                .company-logo {
                  margin-bottom: 30px !important;
                  padding-bottom: 15px !important;
                }
                
                .company-logo img,
                .company-logo .v-img {
                  margin-bottom: 15px !important;
                }
                
                .company-info {
                  margin-top: 15px !important;
                }
                
                .company-name {
                  margin-top: 10px !important;
                }
                
                .signature-section {
                  clear: both !important;
                  display: flex !important;
                  justify-content: flex-end !important;
                  align-items: flex-start !important;
                  margin-top: 20px !important;
                  width: 100% !important;
                  padding-top: 15px !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: transparent !important;
                  padding: 0 !important;
                }
                
                .signature-container {
                  display: block !important;
                  margin: 0 !important;
                  text-align: right !important;
                  margin-bottom: 15px !important;
                  width: auto !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: transparent !important;
                  padding: 0 !important;
                }
                
                .signature-container img,
                .signature-container .v-img {
                  padding: 0 !important;
                  margin: 0 0 0 auto !important;
                  width: 150px !important;
                  height: 75px !important;
                  max-width: 150px !important;
                  max-height: 75px !important;
                  min-width: 150px !important;
                  min-height: 75px !important;
                  object-fit: contain !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: transparent !important;
                  display: block !important;
                }
                
                .signature-text-container {
                  text-align: right !important;
                  margin-top: 0 !important;
                  clear: both !important;
                  float: none !important;
                  position: relative !important;
                  width: auto !important;
                  padding-top: 0 !important;
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: flex-end !important;
                }
                
                .signature-line {
                  width: 200px !important;
                  height: 2px !important;
                  background: #333 !important;
                  margin: 20px 0 20px auto !important;
                  display: block !important;
                }
                
                .signature-text {
                  display: block !important;
                  text-align: right !important;
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                  padding-top: 0 !important;
                  padding-bottom: 0 !important;
                }
                
                /* Force all images to display properly in print */
                img, .v-img {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
              }
            </style>
          </head>
          <body>
            ${clonedElement.outerHTML}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for images to load in the print window before printing
      printWindow.onload = () => {
        // Wait for all images in print window to load
        const printImages = printWindow.document.querySelectorAll('img');
        const imagePromises = Array.from(printImages).map(img => {
          if (img.complete) {
            return Promise.resolve();
          }
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // Resolve even on error to not block printing
            // Timeout after 3 seconds
            setTimeout(resolve, 3000);
          });
        });
        
        Promise.all(imagePromises).then(() => {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            // Don't close immediately, let user see print dialog
            setTimeout(() => {
              printWindow.close();
            }, 100);
          }, 500);
        });
      };
      
      // Fallback timeout in case onload doesn't fire
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => {
            if (printWindow && !printWindow.closed) {
              printWindow.close();
            }
          }, 100);
        }
      }, 3000);
    },
    async downloadQuotation() {
      try {
        // For now, we'll use the print functionality as a base
        // In a real implementation, you might want to use a library like jsPDF or html2pdf
        // You can install and use jsPDF: npm install jspdf html2canvas
        this.printQuotation();

        // Example of how to implement PDF download with jsPDF:
        /*
        import jsPDF from 'jspdf';
        import html2canvas from 'html2canvas';
        
        const element = this.$refs.quotationContent;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`quotation-${this.selectedQuotation.invoice_no || 'N/A'}.pdf`);
        */
      } catch (error) {
        console.error("Error downloading quotation:", error);
        // Fallback to print
        this.printQuotation();
      }
    },
  },
};
</script>

<style scoped>
.quotation-preview-card {
  border-radius: 12px;
  overflow: hidden;
}

.navBar {
  background: #f5f5f5 !important;
  color: #333 !important;
}

.custom-title {
  font-weight: 600;
  font-size: 18px;
}

.icon-class {
  color: #666 !important;
  cursor: pointer;
}

.quotation-content {
  padding: 20px;
  background: white;
  font-family: "Arial", sans-serif;
  line-height: 1.4;
  max-width: 800px;
  margin: 0 auto;
}

.quotation-header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border: 1px solid #000;
  background: white;
}

.quotation-header-table tbody {
  border: none;
}

.quotation-header-table tr {
  border: none;
}

.header-left-cell {
  width: 50%;
  vertical-align: top;
  padding: 15px;
  border: 1px solid #000;
  border-right: 1px solid #000;
}

.header-right-cell {
  width: 50%;
  vertical-align: top;
  padding: 15px;
  border: 1px solid #000;
}

.quotation-title-cell {
  vertical-align: top;
  padding: 15px;
  border: 1px solid #000;
  text-align: right;
}

.detail-cell {
  vertical-align: top;
  padding: 0 15px 15px 15px;
}

.detail-row-cell {
  vertical-align: middle;
  padding: 10px 12px;
  background: #f5f5f5;
  border-left: 1px solid #000;
  border-right: 1px solid #000;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}

.detail-row-cell:first-of-type {
  border-top: 1px solid #000;
  margin-top: 10px;
}

.detail-row-cell:last-of-type {
  border-bottom: 1px solid #000;
}

.detail-row-cell:not(:last-of-type) {
  border-bottom: 1px solid #000;
}

.detail-row-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.detail-label {
  font-weight: 600;
  color: #333;
  font-size: 13px;
  text-align: left;
}

.detail-value {
  color: #333;
  font-size: 13px;
  text-align: right;
  font-weight: normal;
}

.header-left-content {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.header-right-content {
  text-align: right;
}

.company-logo {
  flex-shrink: 0;
  margin: 0;
}

.company-logo-img {
  width: 60px !important;
  height: 60px !important;
  object-fit: contain !important;
  max-width: 60px !important;
  max-height: 60px !important;
  min-width: 60px !important;
  min-height: 60px !important;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.company-gst {
  font-size: 13px;
  font-weight: bold;
  margin: 0 0 6px 0;
  color: #333;
}

.company-address {
  font-size: 13px;
  margin: 0 0 4px 0;
  color: #333;
  line-height: 1.5;
}

.company-phone {
  font-size: 13px;
  margin: 0 0 4px 0;
  color: #333;
}

.company-email {
  font-size: 13px;
  margin: 0;
  color: #333;
}

.quotation-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 15px 0;
  color: #333;
  text-transform: uppercase;
}

.quotation-details-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.quotation-details-table tbody {
  border: none;
}

.quotation-details-table tr {
  border: none;
}

.quotation-details-table td {
  border: 1px solid #e0e0e0 !important;
  padding: 10px 12px;
  border-style: solid !important;
  border-width: 1px !important;
  border-color: #e0e0e0 !important;
  background: #f5f5f5;
}

.quotation-details-table .detail-label {
  font-weight: 600;
  color: #333;
  font-size: 13px;
  text-align: left;
  width: 40%;
  background: #f5f5f5;
}

.quotation-details-table .detail-value {
  color: #333;
  font-size: 13px;
  text-align: right;
  width: 60%;
  background: #f5f5f5;
}

  .customer-section {
    margin-bottom: 8px;
  }

.customer-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
}

.customer-table thead {
  background: #f8f9fa;
}

.customer-header-cell,
.reference-header-cell {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: bold;
  color: #333;
  text-align: left;
  border: 1px solid #000;
  background: #f8f9fa;
}

.customer-info-cell,
.reference-info-cell {
  padding: 12px;
  vertical-align: top;
  border: 1px solid #000;
  background: white;
}

.customer-info {
  width: 100%;
}

.customer-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
}

.customer-details-list {
  margin-top: 0;
}

.customer-detail-row {
  display: flex;
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.4;
}

.customer-detail-label {
  font-weight: 600;
  color: #333;
  margin-right: 8px;
  min-width: 100px;
}

.customer-detail-value {
  color: #666;
  flex: 1;
}

.customer-details-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

.customer-detail {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
}

.reference-section {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.reference-content {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
  margin-top: 0;
}

.empty-reference {
  min-height: 20px;
}

.items-section {
  margin-bottom: 0;
}

.items-table-combined {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border: 1px solid #000;
  background: white;
}

.items-table-combined th {
  background: #f8f9fa;
  padding: 8px 4px;
  font-weight: bold;
  text-align: left;
  border: 1px solid #000;
  font-size: 11px;
  color: #333;
}

.items-table-combined th.text-right {
  text-align: right;
}

.items-table-combined td {
  padding: 8px 4px;
  border: 1px solid #000;
  vertical-align: top;
  font-size: 11px;
}

.items-table-combined td.text-right {
  text-align: right;
}

.items-table-combined td.text-center {
  text-align: center;
}

.notes-cell {
  vertical-align: top;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #000;
}

.notes-section {
  padding: 0;
  border: none;
  background: transparent;
  margin: 0;
}

.notes-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-top: 8px;
}

.empty-notes {
  min-height: 20px;
}

.summary-label-cell {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #000;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.summary-value-cell {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #000;
  font-size: 14px;
  color: #212529;
  font-weight: 600;
  text-align: right;
}

.summary-label-cell.total-row,
.summary-value-cell.total-row {
  background: #e9ecef;
  font-weight: 700;
  border-top: 2px solid #dee2e6;
}

.summary-value-cell.total-row {
  color: #059669;
  font-size: 16px;
}

.summary-container {
  background: transparent;
  border: none;
  padding: 0;
  min-width: 300px;
  max-width: 400px;
  width: 100%;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.summary-value {
  font-size: 14px;
  color: #212529;
  font-weight: 600;
  text-align: right;
}

.summary-row.total-row {
  border-top: 2px solid #dee2e6;
  padding-top: 12px;
  margin-top: auto;
  margin-bottom: 0;
}

.total-label {
  font-size: 16px;
  font-weight: 700;
  color: #212529;
}

.total-value {
  font-size: 16px;
  font-weight: 700;
  color: #059669;
}

.notes-section {
  padding: 0;
  border: none;
  background: transparent;
  margin: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.notes-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
}

.empty-notes {
  min-height: 20px;
}

.notes-column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.amount-words-text {
  margin-top: auto;
  padding-top: 12px;
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
  border: none;
  border-top: 1px solid #e0e0e0;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 0;
}

.amount-words-text strong {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 6px;
}

.amount-words-text .amount-text {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  margin: 0;
  line-height: 1.5;
}

.terms-section {
  margin-bottom: 20px;
  padding: 12px;
}

.terms-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Responsive styles for smaller screens */
@media (max-width: 768px) {
  .notes-summary-container {
    flex-direction: column;
  }

  .order-summary-section {
    justify-content: flex-start;
  }

  .summary-container {
    max-width: 100%;
  }
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  margin-bottom: 0;
}

.items-table tbody tr:last-child td {
  border-bottom: 1px solid #000;
}

.items-table th {
  background: #f8f9fa;
  padding: 8px 4px;
  font-weight: bold;
  text-align: left;
  border: 1px solid #000;
  font-size: 11px;
  color: #333;
}

.items-table th.text-right {
  text-align: right;
}

.items-table td {
  padding: 8px 4px;
  border: 1px solid #000;
  vertical-align: top;
  font-size: 11px;
}

.items-table td.text-right {
  text-align: right;
}

.items-table td.text-center {
  text-align: center;
}

.item-description {
  max-width: 300px;
}

.item-description-text {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
  font-weight: normal;
}

.item-hsn {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  font-weight: normal;
}

.item-details {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  font-style: italic;
}

.tax-row {
  background: #f8f9fa;
}

.subtotal-row {
  background: #f8f9fa;
  font-weight: 600;
  border-top: 1px solid #dee2e6;
}

.total-row {
  background: #e9ecef;
  font-weight: bold;
}

.signature-section {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-top: 20px;
  width: 100%;
}

.signature-container {
  margin-bottom: 15px;
  text-align: right;
}

.signature-img {
  max-width: 100%;
  height: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 150px !important;
  height: 75px !important;
  object-fit: contain !important;
  max-width: 150px !important;
  max-height: 75px !important;
  min-width: 150px !important;
  min-height: 75px !important;
  margin-left: auto;
  display: block;
}

.signature-line {
  width: 200px;
  height: 2px;
  background: #333;
  margin: 20px 0 20px auto;
}

.signature-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.signature-text-container {
  text-align: right;
  margin-top: 0;
  clear: both;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.signature-placeholder {
  text-align: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  margin-bottom: 10px;
  display: inline-block;
}

.signature-placeholder p {
  margin: 10px 0 0 0;
  font-size: 12px;
  color: #999;
}

.company-name-bold {
  font-weight: bold;
  color: #333;
}


.disclaimer {
  text-align: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.disclaimer-text {
  font-style: italic;
  color: #999;
  margin: 0;
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 40px;
}

.loading-state .text-grey {
  color: #666;
}

/* Print styles */
@media print {
  @page {
    margin: 0;
    size: A4;
  }
  
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  body {
    margin: 0 !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  html {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  /* Hide any browser-generated headers/footers */
  @page :first {
    margin-top: 0 !important;
  }
  
  @page :left {
    margin-left: 0 !important;
  }
  
  @page :right {
    margin-right: 0 !important;
  }
  
  .quotation-content {
    padding: 20px;
  }

  .navBar {
    display: none;
  }

  .quotation-preview-card {
    box-shadow: none;
  }
  
  .quotation-header-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-bottom: 20px !important;
    border: 1px solid #000 !important;
    background: white !important;
  }
  
  .quotation-header-table tbody {
    border: none !important;
  }
  
  .quotation-header-table tr {
    border: none !important;
  }
  
  .header-left-cell {
    width: 50% !important;
    vertical-align: top !important;
    padding: 15px !important;
    border: 1px solid #000 !important;
    border-right: 1px solid #000 !important;
  }
  
  .header-right-cell {
    width: 50% !important;
    vertical-align: top !important;
    padding: 15px !important;
    border: 1px solid #000 !important;
  }
  
  .quotation-title-cell {
    vertical-align: top !important;
    padding: 15px !important;
    border: 1px solid #000 !important;
    text-align: right !important;
  }
  
  .detail-cell {
    vertical-align: top !important;
    padding: 0 15px 15px 15px !important;
  }
  
  .detail-row-cell {
    vertical-align: middle !important;
    padding: 10px 12px !important;
    background: #f5f5f5 !important;
    border-left: 1px solid #000 !important;
    border-right: 1px solid #000 !important;
    border-top: 1px solid #000 !important;
    border-bottom: 1px solid #000 !important;
  }
  
  .detail-row-cell:first-of-type {
    border-top: 1px solid #000 !important;
    margin-top: 10px !important;
  }
  
  .detail-row-cell:last-of-type {
    border-bottom: 1px solid #000 !important;
  }
  
  .detail-row-cell:not(:last-of-type) {
    border-bottom: 1px solid #000 !important;
  }
  
  .detail-row-content {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    width: 100% !important;
  }
  
  .detail-label {
    font-weight: 600 !important;
    color: #333 !important;
    font-size: 13px !important;
    text-align: left !important;
  }
  
  .detail-value {
    color: #333 !important;
    font-size: 13px !important;
    text-align: right !important;
    font-weight: normal !important;
  }
  
  .header-left-content {
    display: flex !important;
    align-items: flex-start !important;
    gap: 15px !important;
  }
  
  .header-right-content {
    text-align: right !important;
  }
  
  .company-logo {
    flex-shrink: 0 !important;
    margin: 0 !important;
  }
  
  .company-logo-img {
    margin: 0 !important;
  }
  
  .company-info {
    flex: 1 !important;
    margin: 0 !important;
  }
  
  .company-name {
    margin: 0 0 8px 0 !important;
  }
  
  /* Customer section print styles - table layout */
  .customer-section {
    margin-bottom: 10px !important;
  }
  
  .customer-table {
    width: 100% !important;
    border-collapse: collapse !important;
    border: 1px solid #000 !important;
  }
  
  .customer-table thead {
    background: #f8f9fa !important;
  }
  
  .customer-header-cell,
  .reference-header-cell {
    padding: 8px 12px !important;
    font-size: 13px !important;
    font-weight: bold !important;
    color: #333 !important;
    text-align: left !important;
    border: 1px solid #000 !important;
    background: #f8f9fa !important;
  }
  
  .customer-info-cell,
  .reference-info-cell {
    padding: 12px !important;
    vertical-align: top !important;
    border: 1px solid #000 !important;
    background: white !important;
  }
  
  .customer-info {
    width: 100% !important;
  }
  
  .customer-section .customer-name {
    font-size: 16px !important;
    font-weight: bold !important;
    margin: 0 0 8px 0 !important;
  }
  
  .customer-details-list {
    margin-top: 0 !important;
  }
  
  .customer-detail-row {
    display: flex !important;
    margin-bottom: 4px !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
  }
  
  .customer-detail-label {
    font-weight: 600 !important;
    color: #333 !important;
    margin-right: 8px !important;
    min-width: 100px !important;
  }
  
  .customer-detail-value {
    color: #666 !important;
    flex: 1 !important;
  }
  
  .reference-section {
    margin-top: 0 !important;
    padding-top: 0 !important;
    border-top: none !important;
  }
  
  .reference-content {
    font-size: 12px !important;
    color: #666 !important;
    line-height: 1.5 !important;
    margin-top: 0 !important;
  }
  
  .empty-reference {
    min-height: 20px !important;
  }
  
  .customer-section .customer-detail {
    font-size: 13px !important;
  }
  
  /* Signature section styles */
  .signature-section {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: flex-start !important;
    clear: both !important;
    margin-top: 20px !important;
    width: 100% !important;
  }
  
  .signature-container {
    display: block !important;
    margin: 0 !important;
    text-align: right !important;
    margin-bottom: 15px !important;
  }
  
  .signature-container img,
  .signature-container .v-img {
    margin-left: auto !important;
    display: block !important;
  }
  
  .signature-text-container {
    text-align: right !important;
    margin-top: 0 !important;
    clear: both !important;
    width: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
  }
  
  .signature-line {
    width: 200px !important;
    height: 2px !important;
    background: #333 !important;
    margin: 20px 0 20px auto !important;
    display: block !important;
  }
  
  .signature-text {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    text-align: right !important;
    line-height: 1.6 !important;
  }

  /* Ensure images maintain their sizes - sizes are controlled by specific container styles above */

  /* Page break controls */
  .quotation-header-table,
  .customer-section,
  .items-section,
  .items-table-combined,
  .signature-section {
    page-break-inside: avoid !important;
  }
  
  .items-table-combined {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-bottom: 20px !important;
    border: 1px solid #000 !important;
    background: white !important;
  }
  
  .items-table-combined th {
    background: #f8f9fa !important;
    padding: 8px 4px !important;
    font-weight: bold !important;
    text-align: left !important;
    border: 1px solid #000 !important;
    font-size: 11px !important;
    color: #333 !important;
  }
  
  .items-table-combined th.text-right {
    text-align: right !important;
  }
  
  .items-table-combined td {
    padding: 8px 4px !important;
    border: 1px solid #000 !important;
    vertical-align: top !important;
    font-size: 11px !important;
  }
  
  .items-table-combined td.text-right {
    text-align: right !important;
  }
  
  .items-table-combined td.text-center {
    text-align: center !important;
  }
  
  .notes-cell {
    vertical-align: top !important;
    padding: 16px !important;
    background: #f8f9fa !important;
    border: 1px solid #000 !important;
  }
  
  .summary-label-cell {
    padding: 8px 12px !important;
    background: #f8f9fa !important;
    border: 1px solid #000 !important;
    font-size: 14px !important;
    color: #495057 !important;
    font-weight: 500 !important;
  }
  
  .summary-value-cell {
    padding: 8px 12px !important;
    background: #f8f9fa !important;
    border: 1px solid #000 !important;
    font-size: 14px !important;
    color: #212529 !important;
    font-weight: 600 !important;
    text-align: right !important;
  }
  
  .summary-label-cell.total-row,
  .summary-value-cell.total-row {
    background: #e9ecef !important;
    font-weight: 700 !important;
    border-top: 2px solid #dee2e6 !important;
  }
  
  .summary-value-cell.total-row {
    color: #059669 !important;
    font-size: 16px !important;
  }
  
  .signature-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }


  /* Notes print styles */
  .notes-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    border-bottom: 1px solid #000 !important;
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
    border-bottom-left-radius: 8px !important;
    border-bottom-right-radius: 0 !important;
    background: #f8f9fa !important;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
  }

  .notes-content {
    font-size: 13px !important;
    color: #666 !important;
    line-height: 1.6 !important;
    white-space: pre-wrap !important;
    margin: 0 !important;
  }

  .empty-notes {
    min-height: 20px !important;
  }

  .notes-column {
    display: flex !important;
    flex-direction: column !important;
  }

  .amount-words-text {
    margin-top: auto !important;
    padding-top: 12px !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-bottom: 0 !important;
    border: none !important;
    border-top: 1px solid #e0e0e0 !important;
    margin-bottom: 0 !important;
  }

  .amount-words-text strong {
    font-size: 13px !important;
    font-weight: bold !important;
    color: #333 !important;
    display: block !important;
    margin-bottom: 6px !important;
  }

  .amount-words-text .amount-text {
    font-size: 13px !important;
    font-weight: bold !important;
    color: #333 !important;
    margin: 0 !important;
    line-height: 1.5 !important;
  }

  /* Terms and conditions print styles */
  .terms-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 20px !important;
    padding: 12px !important;
  }

  .terms-content {
    font-size: 13px !important;
    color: #666 !important;
    line-height: 1.6 !important;
    white-space: pre-wrap !important;
    margin: 0 !important;
  }

  /* Notes and Order Summary print styles */
  .notes-summary-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-top: 0 !important;
    margin-bottom: 20px !important;
    border: 1px solid #000 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .notes-summary-table tbody {
    border: none !important;
  }

  .notes-summary-table tr {
    border: none !important;
  }

  .notes-cell {
    width: 50% !important;
    vertical-align: top !important;
    padding: 16px !important;
    border-right: 1px solid #000 !important;
    border-left: 1px solid #000 !important;
    border-top: 1px solid #000 !important;
    border-bottom: 1px solid #000 !important;
    border-bottom-left-radius: 8px !important;
    background: #f8f9fa !important;
  }

  .summary-cell {
    width: 50% !important;
    vertical-align: top !important;
    padding: 16px !important;
    border-right: 1px solid #000 !important;
    border-top: 1px solid #000 !important;
    border-bottom: 1px solid #000 !important;
    border-bottom-right-radius: 8px !important;
    background: #f8f9fa !important;
  }

  .summary-container {
    background: transparent !important;
    border: none !important;
    padding: 16px !important;
    min-width: 300px !important;
    max-width: 400px !important;
    width: 100% !important;
    margin-top: 0 !important;
    margin-left: 0 !important;
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .summary-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 8px !important;
    padding: 4px 0 !important;
  }

  .summary-row:last-child {
    margin-bottom: 0 !important;
  }

  .summary-label {
    font-size: 14px !important;
    color: #495057 !important;
    font-weight: 500 !important;
  }

  .summary-value {
    font-size: 14px !important;
    color: #212529 !important;
    font-weight: 600 !important;
    text-align: right !important;
  }

  .summary-row.total-row {
    border-top: 2px solid #dee2e6 !important;
    padding-top: 12px !important;
    margin-top: auto !important;
    margin-bottom: 0 !important;
  }

  .total-label {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #212529 !important;
  }

  .total-value {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #059669 !important;
  }
}
</style>
