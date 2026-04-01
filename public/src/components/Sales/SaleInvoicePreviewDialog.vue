<template>
  <div>
    <v-dialog
      v-model="dialogVisible"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card class="invoice-preview-card">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Tax  Invoice Preview</div>
          </v-toolbar-title>
          <v-spacer />
          <div class="d-flex align-center">
            <v-btn
              v-if="isDataReady"
              icon
              variant="text"
              size="small"
              color="primary"
              @click="printInvoice"
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
              @click="downloadInvoice"
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
          <div v-if="!hasInvoiceData" class="loading-state">
            <div class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="32"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-body-2 text-grey">Loading Tax  invoice...</div>
            </div>
          </div>

          <!-- Invoice Content -->
          <div v-else class="invoice-content" ref="invoiceContent">
            <!-- Header -->
            <table class="invoice-header-table" border="1" cellspacing="0" cellpadding="8">
              <tbody>
                <tr>
                  <td class="header-left-cell" :rowspan="selectedInvoice.due_date ? 4 : 3">
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
                        <p class="company-gst">GST: {{ selectedEntity.entity_gst }}</p>
                        <p class="company-address" v-if="selectedEntity.entity_address">{{ selectedEntity.entity_address }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="header-right-cell invoice-title-cell">
                    <h1 class="invoice-title">Tax  INVOICE</h1>
                  </td>
                </tr>
                <tr>
                  <td class="header-right-cell detail-row-cell">
                    <div class="detail-row-content">
                      <span class="detail-label">INVOICE NO:</span>
                      <span class="detail-value">{{ selectedInvoice.invoice_no || 'N/A' }}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="header-right-cell detail-row-cell">
                    <div class="detail-row-content">
                      <span class="detail-label">DATE:</span>
                      <span class="detail-value">{{ formatDate(selectedInvoice.invoice_date) }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="selectedInvoice.due_date">
                  <td class="header-right-cell detail-row-cell">
                    <div class="detail-row-content">
                      <span class="detail-label">DUE DATE:</span>
                      <span class="detail-value">{{ formatDate(selectedInvoice.due_date) || 'TBD' }}</span>
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
                        <h3 class="customer-name">{{ selectedInvoice.customer_name || selectedInvoice.party_name || 'N/A' }}</h3>
                        <div class="customer-details-list">
                          <div class="customer-detail-row" v-if="selectedCustomer?.customer_display_id || selectedInvoice.customer_code">
                            <span class="customer-detail-label">Customer ID#:</span>
                            <span class="customer-detail-value">{{ selectedCustomer?.customer_display_id || selectedInvoice.customer_code }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedCustomer?.address_line_1 || selectedInvoice.customer_address || selectedInvoice.address_line_1">
                            <span class="customer-detail-label">Address:</span>
                            <span class="customer-detail-value">{{ selectedCustomer?.address_line_1 || selectedInvoice.customer_address || selectedInvoice.address_line_1 }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedCustomer?.primary_contact_no || selectedInvoice.customer_phone">
                            <span class="customer-detail-label">Phone:</span>
                            <span class="customer-detail-value">{{ formatPhoneNumber(selectedCustomer?.primary_contact_no || selectedInvoice.customer_phone) }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedCustomer?.gst_no || selectedInvoice.customer_gst">
                            <span class="customer-detail-label">GST:</span>
                            <span class="customer-detail-value">{{ selectedCustomer?.gst_no || selectedInvoice.customer_gst }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedCustomer?.state_1 || selectedInvoice.customer_state">
                            <span class="customer-detail-label">State:</span>
                            <span class="customer-detail-value">{{ selectedCustomer?.state_1 || selectedInvoice.customer_state }}</span>
                          </div>
                          <div class="customer-detail-row" v-if="selectedInvoice.project_name">
                            <span class="customer-detail-label">Project:</span>
                            <span class="customer-detail-value">{{ selectedInvoice.project_name }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="reference-info-cell">
                      <div class="reference-section">
                        <div class="reference-content">
                          <div v-if="selectedInvoice.reference">{{ selectedInvoice.reference }}</div>
                          <div v-if="selectedInvoice.comments">{{ selectedInvoice.comments }}</div>
                          <div v-if="selectedInvoice.instructions">{{ selectedInvoice.instructions }}</div>
                          <div v-if="!selectedInvoice.reference && !selectedInvoice.comments && !selectedInvoice.instructions" class="empty-reference">
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
                <template v-if="invoiceItems && invoiceItems.length > 0">
                  <tr v-for="(item, index) in invoiceItems" :key="index">
                    <td valign="top">{{ index + 1 }}</td>
                    <td valign="top">{{ item.item_code || 'N/A' }}</td>
                    <td valign="top">
                      <strong>{{ item.item_name || item.description || 'N/A' }}</strong>
                      <div v-if="itemConfiguration.description && item.description" class="item-description-text">
                        {{ item.description }}
                      </div>
                      <div v-if="taxConfiguration.enable_hsn && item.hsn_code" class="item-hsn">
                        <strong>HSN : {{ item.hsn_code }}</strong>
                      </div>
                    </td>
                    <td valign="top" align="right">{{ getCurrencySymbol() }}{{ formatAmount(item.price_per_unit) }}</td>
                    <td valign="top" align="center">{{ item.quantity || '0' }}</td>
                    <td valign="top" align="center">{{ item.tax_percent || '0' }}%</td>
                    <td v-if="itemConfiguration.items_wise_discount" valign="top" align="right">{{ getCurrencySymbol() }}{{ formatAmount(item.discount_amount || '0.00') }}</td>
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
                      <strong v-if="selectedInvoice.description">Note:</strong>
                      <div class="notes-content">
                        <div v-if="selectedInvoice.description">
                          <template v-for="(line, idx) in formatNotes(selectedInvoice.description)" :key="idx">
                            {{ idx + 1 }}. {{ line }}<br v-if="idx < formatNotes(selectedInvoice.description).length - 1">
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

                <tr v-if="itemConfiguration.items_wise_discount && selectedInvoice.discount_amount && parseFloat(selectedInvoice.discount_amount) > 0">
                  <td align="left" class="summary-label-cell">Discount</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(selectedInvoice.discount_amount || '0.00') }}</td>
                </tr>

                <tr v-if="selectedInvoice.tax_type && selectedInvoice.tax_type !== 'Exempt' && selectedInvoice.tax_amount && parseFloat(selectedInvoice.tax_amount) > 0">
                  <td align="left" class="summary-label-cell">Tax</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(selectedInvoice.tax_amount || '0.00') }}</td>
                </tr>

                <tr v-if="selectedInvoice.round_off && parseFloat(selectedInvoice.round_off_amount || '0') !== 0">
                  <td align="left" class="summary-label-cell">Round Off</td>
                  <td align="right" class="summary-value-cell">{{ getCurrencySymbol() }}{{ formatAmount(selectedInvoice.round_off_amount || '0.00') }}</td>
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
            <div v-if="selectedInvoice.terms_conditions" class="terms-section">
              <div class="section-title">Terms and Conditions</div>
              <div class="terms-content">
                {{ selectedInvoice.terms_conditions }}
              </div>
            </div>

            <!-- Footer -->
            <div class="invoice-footer">
              <table class="footer-table">
                <tbody>
                  <tr>
                  
                    <td class="footer-right">
                      <div class="qr-code-section">
                        <div class="qr-code-container">
                          <v-img
                            v-if="selectedEntity.entity_qr_code"
                            :src="selectedEntity.entity_qr_code"
                            width="120"
                            height="120"
                            class="qr-code-img"
                            contain
                          />
                          <div v-else class="qr-placeholder">
                            <v-icon size="48" color="grey">mdi-qrcode</v-icon>
                            <p>QR Code Placeholder</p>
                          </div>
                          <p class="qr-text">Payment QR Code</p>
                        </div>
                      </div>
                      <div class="signature-section">
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
                        <div class="signature-text-container">
                          <p class="company-name-bold">For {{ selectedEntity.entity_name }}</p>
                          <div class="signature-line"></div>
                          <p class="signature-text">Authorised Signatory</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
  name: "SaleInvoicePreviewDialog",
  mixins: [get_global_categories, get_global_customers],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    invoiceData: {
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
    hasInvoiceData() {
      return this.selectedInvoice && Object.keys(this.selectedInvoice).length > 0;
    },
    isDataReady() {
      // Check if invoice data exists and categories API call is complete
      return this.hasInvoiceData && !this.isLoadingCategories;
    },
    selectedInvoice() {
      return this.invoiceData || {};
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
      if (!this.selectedInvoice?.customer_name || !this.masterCustomers || this.masterCustomers.length === 0) {
        return null;
      }
      return this.masterCustomers.find(
        (customer) => customer.legal_name === this.selectedInvoice.customer_name
      ) || null;
    },
    invoiceItems() {
      // Parse items from invoice data - handle multiple possible field names
      let items = [];
      
      // Try table_data first
      if (this.selectedInvoice.table_data) {
        if (typeof this.selectedInvoice.table_data === 'string') {
          try {
            items = JSON.parse(this.selectedInvoice.table_data);
          } catch (e) {
            console.error('Error parsing table_data:', e);
          }
        } else if (Array.isArray(this.selectedInvoice.table_data)) {
          items = this.selectedInvoice.table_data;
        }
      }
      
      // If no items found, try tableData field (fallback)
      if (!items || items.length === 0) {
        if (this.selectedInvoice.tableData) {
          if (typeof this.selectedInvoice.tableData === 'string') {
            try {
              items = JSON.parse(this.selectedInvoice.tableData);
            } catch (e) {
              console.error('Error parsing tableData:', e);
            }
          } else if (Array.isArray(this.selectedInvoice.tableData)) {
            items = this.selectedInvoice.tableData;
          }
        }
      }
      
      // If still no items found, try items field
      if (!items || items.length === 0) {
        if (this.selectedInvoice.items) {
          if (typeof this.selectedInvoice.items === 'string') {
            try {
              items = JSON.parse(this.selectedInvoice.items);
            } catch (e) {
              console.error('Error parsing items:', e);
            }
          } else if (Array.isArray(this.selectedInvoice.items)) {
            items = this.selectedInvoice.items;
          }
        }
      }
      
      return items || [];
    },
    subTotal() {
      if (!this.invoiceItems || !this.invoiceItems.length) return 0;
      return this.invoiceItems.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    },
    totalTaxAmount() {
      if (!this.invoiceItems || !this.invoiceItems.length) return 0;
      return this.invoiceItems.reduce((sum, item) => {
        return sum + (parseFloat(item.tax_amount) || 0);
      }, 0);
    },
    totalAmount() {
      // Use total_cost from invoice data if available, otherwise calculate from items
      if (this.selectedInvoice.total_cost) {
        return parseFloat(this.selectedInvoice.total_cost);
      }
      return this.subTotal + this.totalTaxAmount;
    },
    amountInWords() {
      return this.numberToWords(this.totalAmount);
    },
    summaryRowspan() {
      // Count the number of summary rows (excluding Total which is in the last row)
      let count = 1; // Subtotal is always there
      if (this.itemConfiguration.items_wise_discount && this.selectedInvoice.discount_amount && parseFloat(this.selectedInvoice.discount_amount) > 0) count++;
      if (this.selectedInvoice.tax_type && this.selectedInvoice.tax_type !== 'Exempt' && this.selectedInvoice.tax_amount && parseFloat(this.selectedInvoice.tax_amount) > 0) count++;
      if (this.selectedInvoice.round_off && parseFloat(this.selectedInvoice.round_off_amount || '0') !== 0) count++;
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
      // Base columns: S.No(1), Description(1), Item Code(1), Quantity(1), Unit(1), Rate(1), Tax(2), Amount(1) = 9
      let cols = 9;
      if (this.taxConfiguration.enable_hsn) cols += 1;
      if (this.itemConfiguration.item_category) cols += 1;
      if (this.itemConfiguration.description) cols += 1;
      if (this.itemConfiguration.items_wise_discount) cols += 2;
      return cols;
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
      
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      
      function convertLessThanOneThousand(n) {
        if (n === 0) return '';
        
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '');
      }
      
      function convert(n) {
        if (n === 0) return 'Zero';
        if (n < 1000) return convertLessThanOneThousand(n);
        if (n < 100000) return convertLessThanOneThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertLessThanOneThousand(n % 1000) : '');
        if (n < 10000000) return convertLessThanOneThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
        return convertLessThanOneThousand(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
      }
      
      const rupees = Math.floor(num);
      const paise = Math.round((num - rupees) * 100);
      
      let result = convert(rupees) + ' Rupees';
      if (paise > 0) {
        result += ' and ' + convert(paise) + ' Paise';
      }
      
      return result + ' Only';
    },
    async printInvoice() {
      // Get the invoice content element
      const invoiceElement = this.$refs.invoiceContent;
      
      // Find the scrollable parent container (could be v-card-text or dialog content)
      let scrollableContainer = invoiceElement;
      let parent = invoiceElement.parentElement;
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
      const allImages = invoiceElement.querySelectorAll("img");
      allImages.forEach((img) => {
        if (img.src && 
            img.src !== 'data:image/svg+xml' && 
            !img.src.includes('data:image/svg') &&
            img.complete) {
          imageSources.push(img.src);
        }
      });
      
      // Also try to get from v-img wrappers directly
      const vImgWrappers = invoiceElement.querySelectorAll(".v-img");
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
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      // Clone the element to avoid modifying the original
      const clonedElement = invoiceElement.cloneNode(true);
      
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
          // Check if it's QR code or signature by parent class
          const parent = vImg.closest('.qr-code-container, .signature-container, .company-logo');
          let matchingSrc = null;
          
          if (parent && parent.classList.contains('qr-code-container')) {
            // Find QR code source
            matchingSrc = imageSources.find(src => 
              src === this.selectedEntity.entity_qr_code || 
              (this.selectedEntity.entity_qr_code && src.includes(this.selectedEntity.entity_qr_code.split('/').pop()))
            ) || this.selectedEntity.entity_qr_code;
          } else if (parent && parent.classList.contains('signature-container')) {
            // Find signature source
            matchingSrc = imageSources.find(src => 
              src === this.selectedEntity.entity_seal_signature ||
              (this.selectedEntity.entity_seal_signature && src.includes(this.selectedEntity.entity_seal_signature.split('/').pop()))
            ) || this.selectedEntity.entity_seal_signature;
          } else if (parent && parent.classList.contains('company-logo')) {
            // Find logo source
            matchingSrc = imageSources.find(src => 
              src === this.selectedEntity.entity_logo ||
              (this.selectedEntity.entity_logo && src.includes(this.selectedEntity.entity_logo.split('/').pop()))
            ) || this.selectedEntity.entity_logo;
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
            <title>Tax  Invoice - ${this.selectedInvoice.invoice_no || 'N/A'}</title>
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
                line-height: 1.6;
                background: white;
              }
              
              .invoice-content { 
                max-width: 800px; 
                margin: 0 auto;
                padding: 20px;
                background: white;
                font-family: 'Arial', sans-serif;
                line-height: 1.4;
              }
              
              .invoice-header-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
                border: 1px solid #000;
              }
              
              .invoice-header-table td {
                border: 1px solid #000;
                padding: 12px;
                vertical-align: top;
              }
              
              .header-left-cell {
                width: 60%;
                background: white;
              }
              
              .header-right-cell {
                width: 40%;
                background: white;
                text-align: right;
              }
              
              .invoice-title-cell {
                text-align: right;
              }
              
              .detail-row-cell {
                text-align: right;
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
              
              .invoice-title { 
                font-size: 28px; 
                font-weight: bold; 
                margin: 0 0 15px 0; 
                color: #333;
                text-transform: uppercase;
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
              
              .reference-content {
                font-size: 12px;
                color: #666;
                line-height: 1.5;
                margin-top: 0;
              }
              
              .customer-header {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 4px;
              }
              
              .section-title {
                font-size: 14px;
                font-weight: bold;
                color: #333;
                margin: 0;
              }
              
              .customer-name {
                font-size: 16px;
                font-weight: bold;
                margin: 0;
                color: #333;
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
              
              .notes-summary-container {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                align-items: flex-start;
              }
              
              .notes-column {
                flex: 1;
                min-width: 0;
              }
              
              .invoice-summary-section {
                flex: 1;
                display: flex;
                justify-content: flex-end;
                min-width: 0;
              }
              
              .summary-container {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 16px;
                min-width: 300px;
                max-width: 400px;
                width: 100%;
              }
              
              .notes-section {
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
              }
              
              .notes-content {
                font-size: 13px;
                color: #666;
                line-height: 1.6;
                white-space: pre-wrap;
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
              
              .items-section {
                margin-bottom: 20px;
              }
              
              .terms-section {
                margin-bottom: 20px;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
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
                border: 1px solid #000;
                margin-bottom: 20px;
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
              
              .items-table-combined td { 
                padding: 8px 4px;
                border: 1px solid #000;
                vertical-align: top;
                font-size: 11px;
                background: white;
              }
              
              .items-table-combined td.text-center {
                text-align: center;
              }
              
              .item-description-text {
                font-size: 11px;
                color: #666;
                margin-top: 4px;
                line-height: 1.4;
              }
              
              .item-hsn {
                font-size: 11px;
                color: #666;
                margin-top: 4px;
                line-height: 1.4;
              }
              
              .notes-cell {
                background: #f8f9fa;
                padding: 12px;
              }
              
              .notes-section {
                padding: 0;
                border: none;
                background: transparent;
              }
              
              .notes-content {
                font-size: 12px;
                color: #666;
                line-height: 1.6;
                margin-top: 8px;
              }
              
              .summary-label-cell {
                background: #f8f9fa;
                font-weight: 600;
                padding: 8px 12px;
                border: 1px solid #000;
              }
              
              .summary-value-cell {
                background: #f8f9fa;
                font-weight: 600;
                padding: 8px 12px;
                border: 1px solid #000;
                text-align: right;
              }
              
              .summary-label-cell.total-row,
              .summary-value-cell.total-row {
                background: #e9ecef;
                font-weight: bold;
                font-size: 13px;
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
              
              .total-row {
                background: #e9ecef;
                font-weight: bold;
              }
              
              .invoice-footer { 
                margin-top: 20px; 
                padding-top: 15px;
                border-top: 1px solid #ddd;
              }
              
              .footer-table {
                width: 100%;
                border-collapse: collapse;
              }
              
              .footer-left {
                width: 50%;
                vertical-align: top;
                padding-right: 20px;
              }
              
              .footer-right {
                width: 50%;
                vertical-align: top;
                text-align: center;
                padding-top: 0;
              }
              
              .amount-words {
                margin-bottom: 15px;
              }
              
              .amount-text {
                font-size: 15px;
                font-weight: bold;
                color: #333;
                margin: 8px 0;
              }
              
              .payment-details p {
                margin: 5px 0;
                font-size: 14px;
                color: #666;
              }
              
              .company-name-bold {
                font-weight: bold;
                color: #333;
              }
              
              .qr-code-section {
                margin-bottom: 20px;
                text-align: right;
                margin-top: 15px;
                clear: both;
                display: block;
                width: 100%;
              }
              
              .qr-code-container {
                display: block;
                padding: 0;
                border-radius: 8px;
                margin-bottom: 15px;
                text-align: right;
                clear: both;
                width: 100%;
              }

              .qr-code-container img,
              .qr-code-container .v-img {
                width: 100px !important;
                height: 100px !important;
                max-width: 100px !important;
                max-height: 100px !important;
                min-width: 100px !important;
                min-height: 100px !important;
                object-fit: contain !important;
                margin: 0 0 10px 0 !important;
                display: block !important;
                margin-left: auto !important;
                clear: both;
              }
              
              .qr-text {
                font-size: 14px;
                color: #666;
                margin-top: 5px;
                display: block !important;
                text-align: right !important;
                clear: both;
                margin-bottom: 20px;
              }
              
              .signature-section {
                text-align: right;
                margin-top: 20px;
                clear: both;
                display: block;
                width: 100%;
              }
              
              .signature-container {
                margin-bottom: 50px;
                text-align: right;
                clear: both;
                width: 100%;
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
                margin: 0 0 50px 0 !important;
                margin-left: auto !important;
                clear: both;
              }
              
              .signature-text-container {
                text-align: right;
                margin-top: 20px;
                clear: both;
                width: 100%;
              }
              
              .company-name-bold {
                display: none;
              }
              
              .signature-line {
                width: 150px;
                height: 2px;
                background: #333;
                margin: 0 0 15px auto;
                display: block;
              }
              
              .signature-text {
                font-size: 14px;
                color: #666;
                margin: 0;
                padding: 0;
                text-align: right;
                line-height: 1.6;
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
                
                .invoice-footer {
                  margin-top: 20px !important;
                  padding-top: 15px !important;
                  margin-bottom: 0 !important;
                }
                  
                .footer-left {
                  width: 50% !important;
                  float: left !important;
                }
                
                .footer-right {
                  width: 50% !important;
                  float: right !important;
                  text-align: right !important;
                }
                
                .qr-code-section {
                  clear: both !important;
                  margin-bottom: 20px !important;
                  text-align: right !important;
                  margin-top: 15px !important;
                  display: block !important;
                  width: 100% !important;
                  padding-bottom: 15px !important;
                }
                
                .signature-section {
                  clear: both !important;
                  text-align: right !important;
                  margin-top: 20px !important;
                  display: block !important;
                  width: 100% !important;
                  padding-top: 15px !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: transparent !important;
                  padding: 0 !important;
                }
                
                .qr-code-container {
                  display: block !important;
                  margin: 0 0 0 auto !important;
                  text-align: right !important;
                  padding: 0 !important;
                  border: none !important;
                  margin-bottom: 15px !important;
                  width: 100% !important;
                }
                
                .qr-code-container img,
                .qr-code-container .v-img {
                  padding: 0 !important;
                  margin: 0 0 10px 0 !important;
                  margin-left: auto !important;
                  width: 100px !important;
                  height: 100px !important;
                  max-width: 100px !important;
                  max-height: 100px !important;
                  min-width: 100px !important;
                  min-height: 100px !important;
                  object-fit: contain !important;
                  display: block !important;
                  float: none !important;
                  position: relative !important;
                  clear: both !important;
                }
                
                .qr-text {
                  display: none !important;
                }
                
                .signature-container {
                  display: block !important;
                  margin: 0 0 0 auto !important;
                  text-align: right !important;
                  margin-bottom: 50px !important;
                  width: 100% !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: transparent !important;
                  padding: 0 !important;
                }
                
                .signature-container img,
                .signature-container .v-img {
                  padding: 0 !important;
                  margin: 0 0 50px 0 !important;
                  margin-left: auto !important;
                  width: 150px !important;
                  height: 75px !important;
                  max-width: 150px !important;
                  max-height: 75px !important;
                  min-width: 150px !important;
                  min-height: 75px !important;
                  object-fit: contain !important;
                  display: block !important;
                  float: none !important;
                  position: relative !important;
                  clear: both !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: transparent !important;
                }
                
                .company-name-bold {
                  display: none !important;
                }
                
                .signature-text-container {
                  text-align: right !important;
                  margin-top: 20px !important;
                  clear: both !important;
                  float: none !important;
                  position: relative !important;
                  width: 100% !important;
                  padding-top: 0 !important;
                }
                
                .signature-line {
                  display: none !important;
                }
                
                .signature-text {
                  display: block !important;
                  text-align: right !important;
                  margin-top: 0 !important;
                  margin-bottom: 0 !important;
                  padding-top: 0 !important;
                  padding-bottom: 0 !important;
                  float: none !important;
                  position: relative !important;
                  clear: both !important;
                  width: 100% !important;
                  line-height: 1.6 !important;
                }
                
                /* Additional print layout fixes */
                .footer-table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  table-layout: fixed !important;
                }
                
                .footer-left {
                  width: 50% !important;
                  vertical-align: top !important;
                  padding-right: 20px !important;
                  float: none !important;
                  position: relative !important;
                }
                
                .footer-right {
                  width: 50% !important;
                  vertical-align: top !important;
                  text-align: right !important;
                  float: none !important;
                  padding-right: 0 !important;
                  position: relative !important;
                }
                
                /* Ensure no overlapping in print */
                .amount-words {
                  margin-bottom: 15px !important;
                  clear: both !important;
                  float: none !important;
                  position: relative !important;
                }
                
                .payment-details {
                  clear: both !important;
                  float: none !important;
                  position: relative !important;
                }
                
                .payment-details p {
                  margin: 5px 0 !important;
                  clear: both !important;
                  float: none !important;
                  position: relative !important;
                }
                
                /* Force all images to display properly in print */
                img, .v-img {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                
                /* Ensure QR and signature sections don't break */
                .qr-code-section,
                .signature-section {
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
    async downloadInvoice() {
      try {
        // For now, we'll use the print functionality as a base
        this.printInvoice();
      } catch (error) {
        console.error('Error downloading invoice:', error);
        // Fallback to print
        this.printInvoice();
      }
    },
  },
};
</script>

<style scoped>
.invoice-preview-card {
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

.invoice-content {
  padding: 20px;
  background: white;
  font-family: 'Arial', sans-serif;
  line-height: 1.4;
  max-width: 800px;
  margin: 0 auto;
}

.invoice-header-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  border: 1px solid #000;
}

.invoice-header-table td {
  border: 1px solid #000;
  padding: 12px;
  vertical-align: top;
}

.header-left-cell {
  width: 60%;
  background: white;
}

.header-right-cell {
  width: 40%;
  background: white;
  text-align: right;
}

.invoice-title-cell {
  text-align: right;
}

.detail-row-cell {
  text-align: right;
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

.company-logo {
  flex-shrink: 0;
  margin: 0;
}

.company-logo-img {
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

.invoice-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 15px 0;
  color: #333;
  text-transform: uppercase;
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

.section-title {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.items-section {
  margin-bottom: 20px;
}

.notes-summary-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.notes-column {
  flex: 1;
  min-width: 0;
}

.invoice-summary-section {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

.summary-container {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
  max-width: 400px;
  width: 100%;
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

.header-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.main-header {
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}

.sub-headers {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
}

.sub-header {
  font-weight: 600;
  color: #475569;
  text-transform: none;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  flex: 1;
  text-align: center;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.notes-section {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 100%;
}

.notes-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
}

.terms-section {
  margin-bottom: 20px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.terms-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap; /* Preserve line breaks */
}

/* Responsive styles for smaller screens */
@media (max-width: 768px) {
  .notes-summary-container {
    flex-direction: column;
  }

  .invoice-summary-section {
    justify-content: flex-start;
  }

  .summary-container {
    max-width: 100%;
  }
}

.items-table-combined {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border: 1px solid #000;
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

.items-table-combined td {
  padding: 8px 4px;
  border: 1px solid #000;
  vertical-align: top;
  font-size: 11px;
  background: white;
}

.items-table-combined td.text-center {
  text-align: center;
}

.item-description-text {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

.item-hsn {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
}

.notes-cell {
  background: #f8f9fa;
  padding: 12px;
}

.notes-section {
  padding: 0;
  border: none;
  background: transparent;
}

.notes-content {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  margin-top: 8px;
}

.empty-notes {
  min-height: 40px;
}

.summary-label-cell {
  background: #f8f9fa;
  font-weight: 600;
  padding: 8px 12px;
  border: 1px solid #000;
}

.summary-value-cell {
  background: #f8f9fa;
  font-weight: 600;
  padding: 8px 12px;
  border: 1px solid #000;
  text-align: right;
}

.summary-label-cell.total-row,
.summary-value-cell.total-row {
  background: #e9ecef;
  font-weight: bold;
  font-size: 13px;
}

.tax-row {
  background: #f8f9fa;
}

.total-row {
  background: #e9ecef;
  font-weight: bold;
}

.invoice-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
  margin-bottom: 0;
}

.footer-table {
  width: 100%;
  border-collapse: collapse;
}

.footer-left {
  width: 50%;
  vertical-align: top;
  padding-right: 20px;
}

.footer-right {
  width: 50%;
  vertical-align: top;
  text-align: right;
  padding-top: 0;
  padding-right: 0;
}

.amount-words {
  margin-bottom: 15px;
}

.amount-text {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin: 8px 0;
}

.payment-details p {
  margin: 5px 0;
  font-size: 14px;
  color: #666;
}

.company-name-bold {
  font-weight: bold;
  color: #333;
}

.qr-code-section {
  margin-bottom: 20px;
  text-align: right;
  margin-top: 15px;
}

.qr-code-container {
  display: block;
  padding: 0;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: right;
}

.qr-code-img {
  max-width: 100%;
  height: auto;
  margin-bottom: 10px;
  width: 100px !important;
  height: 100px !important;
  object-fit: contain !important;
  max-width: 100px !important;
  max-height: 100px !important;
  min-width: 100px !important;
  min-height: 100px !important;
  margin-left: auto;
}

.qr-text {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
  display: block;
  text-align: right;
  clear: both;
}

.signature-section {
  text-align: right;
  margin-top: 20px;
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
  margin-top: 10px;
  clear: both;
}

.qr-placeholder,
.signature-placeholder {
  text-align: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  margin-bottom: 10px;
}

.qr-placeholder p,
.signature-placeholder p {
  margin: 10px 0 0 0;
  font-size: 12px;
  color: #999;
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
  
  .invoice-content {
    padding: 20px;
  }
  
  .navBar {
    display: none;
  }
  
  .invoice-preview-card {
    box-shadow: none;
  }
  
  .company-logo {
    margin-bottom: 30px !important;
    padding-bottom: 15px !important;
  }
  
  .company-logo-img {
    margin-bottom: 15px !important;
  }
  
  .company-info {
    margin-top: 15px !important;
  }
  
  .company-name {
    margin-top: 10px !important;
  }
  
  /* Header table print styles */
  .invoice-header-table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-bottom: 10px !important;
    border: 1px solid #000 !important;
  }
  
  .invoice-header-table td {
    border: 1px solid #000 !important;
    padding: 12px !important;
    vertical-align: top !important;
  }
  
  /* Customer section print styles */
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
  
  .customer-name {
    font-size: 16px !important;
    font-weight: bold !important;
    margin: 0 0 8px 0 !important;
    color: #333 !important;
  }
  
  /* Items table print styles */
  .items-table-combined {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-bottom: 20px !important;
    border: 1px solid #000 !important;
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
  
  .items-table-combined td {
    padding: 8px 4px !important;
    border: 1px solid #000 !important;
    vertical-align: top !important;
    font-size: 11px !important;
    background: white !important;
  }
  
  .notes-cell {
    background: #f8f9fa !important;
    padding: 12px !important;
  }
  
  .summary-label-cell {
    background: #f8f9fa !important;
    font-weight: 600 !important;
    padding: 8px 12px !important;
    border: 1px solid #000 !important;
  }
  
  .summary-value-cell {
    background: #f8f9fa !important;
    font-weight: 600 !important;
    padding: 8px 12px !important;
    border: 1px solid #000 !important;
    text-align: right !important;
  }
  
  .summary-label-cell.total-row,
  .summary-value-cell.total-row {
    background: #e9ecef !important;
    font-weight: bold !important;
    font-size: 13px !important;
  }
  
  /* Ensure footer layout matches preview exactly */
  .invoice-footer {
    margin-top: 20px !important;
    padding-top: 15px !important;
    border-top: 1px solid #ddd !important;
    margin-bottom: 0 !important;
  }
  
  .footer-table {
    width: 100% !important;
    border-collapse: collapse !important;
  }
  
  .footer-left {
    width: 50% !important;
    vertical-align: top !important;
    padding-right: 20px !important;
    float: none !important;
  }
  
  .footer-right {
    width: 50% !important;
    vertical-align: top !important;
    text-align: right !important;
    float: none !important;
    padding-right: 0 !important;
  }
  
  .qr-code-section {
    margin-bottom: 20px !important;
    text-align: right !important;
    clear: both !important;
    margin-top: 15px !important;
  }
  
  .signature-section {
    text-align: right !important;
    clear: both !important;
    margin-top: 20px !important;
  }
  
  .qr-code-container {
    display: block !important;
    margin: 0 0 0 auto !important;
    text-align: right !important;
    margin-bottom: 15px !important;
  }
  
  .signature-container {
    display: block !important;
    margin: 0 0 0 auto !important;
    text-align: right !important;
    margin-bottom: 50px !important;
  }
  
  .signature-text-container {
    text-align: right !important;
    margin-top: 20px !important;
    clear: both !important;
    width: 100% !important;
  }
  
  .signature-line {
    display: none !important;
  }
  
  .signature-text {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    text-align: right !important;
    line-height: 1.6 !important;
  }
  
  /* Ensure images maintain their sizes */
  .company-logo-img,
  .qr-code-img,
  .signature-img {
    /* Sizes are now controlled by specific container styles above */
  }
  
  /* Page break controls */
  .invoice-header-table,
  .customer-section,
  .items-table-combined,
  .invoice-footer {
    page-break-inside: avoid !important;
  }
  
  /* Additional print compatibility */
  .qr-code-section,
  .signature-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  
  .qr-code-container,
  .signature-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  
  /* Notes print styles */
  .notes-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 20px !important;
    padding: 12px !important;
    border: 1px solid #ddd !important;
    border-radius: 8px !important;
  }

  .notes-content {
    font-size: 13px !important;
    color: #666 !important;
    line-height: 1.6 !important;
    white-space: pre-wrap !important;
    margin: 0 !important;
  }

  /* Terms and conditions print styles */
  .terms-section {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 20px !important;
    padding: 12px !important;
    border: 1px solid #ddd !important;
    border-radius: 8px !important;
  }
  
  .terms-content {
    font-size: 13px !important;
    color: #666 !important;
    line-height: 1.6 !important;
    white-space: pre-wrap !important;
    margin: 0 !important;
  }

  /* Notes and Invoice Summary print styles */
  .notes-summary-container {
    display: flex !important;
    gap: 20px !important;
    margin-bottom: 20px !important;
    align-items: flex-start !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .notes-column {
    flex: 1 !important;
    min-width: 0 !important;
  }

  .invoice-summary-section {
    flex: 1 !important;
    display: flex !important;
    justify-content: flex-end !important;
    min-width: 0 !important;
  }

  .summary-container {
    background: #f8f9fa !important;
    border: 1px solid #e9ecef !important;
    border-radius: 8px !important;
    padding: 16px !important;
    min-width: 300px !important;
    max-width: 400px !important;
    width: 100% !important;
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
    margin-top: 8px !important;
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
