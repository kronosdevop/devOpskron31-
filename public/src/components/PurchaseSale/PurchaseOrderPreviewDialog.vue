<template>
  <div>
    <v-dialog
      v-model="dialogVisible"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card class="order-preview-card">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Purchase Order Preview</div>
          </v-toolbar-title>
          <v-spacer />
          <div class="d-flex align-center">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click="printOrder"
              class="mr-2"
              title="Print"
            >
              <v-icon>mdi-printer</v-icon>
            </v-btn>
            <v-icon class="icon-class" @click="closeDialog">mdi-close</v-icon>
          </div>
        </v-toolbar>

        <v-card-text class="pa-0">
          <!-- Loading State -->
          <div v-if="!hasOrderData" class="loading-state">
            <div class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="32"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-body-2 text-grey">Loading purchase order...</div>
            </div>
          </div>

          <!-- Order Content -->
          <div v-else class="order-content" ref="orderContent">
            <!-- Header -->
            <div class="order-header">
              <div class="header-left">
                <div class="company-logo">
                  <v-img
                    v-if="selectedEntity.entity_logo"
                    :src="selectedEntity.entity_logo"
                    width="60"
                    height="60"
                    class="company-logo-img"
                    contain
                  />
                  <v-icon v-else size="48" color="primary">mdi-domain</v-icon>
                </div>
                <div class="company-info">
                  <h2 class="company-name">{{ selectedEntity.entity_name }}</h2>
                  <p class="company-gst">GST: {{ selectedEntity.entity_gst }}</p>
                  <p class="company-address">{{ selectedEntity.entity_address }}</p>
                </div>
              </div>
              <div class="header-right">
                <h1 class="order-title">PURCHASE ORDER</h1>
                <div class="order-details">
                  <div class="detail-row">
                    <span class="detail-label">Order No:</span>
                    <span class="detail-value">{{ selectedOrder.invoice_no || 'N/A' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{ formatDate(selectedOrder.invoice_date) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Expected Delivery:</span>
                    <span class="detail-value">{{ formatDate(selectedOrder.due_date) || 'TBD' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Supplier Details -->
            <div class="supplier-section">
              <div class="supplier-info">
                <div class="supplier-header">
                  <span class="section-title">Order From:</span>
                  <h3 class="supplier-name">
                    {{ selectedOrder.supplier_name || selectedOrder.party_name || "N/A" }}
                  </h3>
                </div>
                <div class="supplier-details-compact">
                  <span class="supplier-detail" v-if="selectedOrder.supplier_address || selectedOrder.address_line_1">
                    {{ selectedOrder.supplier_address || selectedOrder.address_line_1 }}
                  </span>
                  <span class="supplier-detail"
                    >GST: {{ selectedOrder.supplier_gst || "N/A" }}</span
                  >
                  <span class="supplier-detail"
                    >Code: {{ selectedOrder.supplier_code || "N/A" }}</span
                  >
                  <span class="supplier-detail"
                    >State: {{ selectedOrder.supplier_state || "N/A" }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="items-section">
              <div class="section-title">Order Items</div>
              
              <v-table class="items-table">
                <thead>
                  <tr>
                    <th class="text-left">S.No</th>
                    <th class="text-left">Description of Goods / Services</th>
                    <th class="text-left">HSN/SAC</th>
                    <th class="text-left">Item Code</th>
                    <th class="text-left">Category</th>
                    <th class="text-left">Description</th>
                    <th class="text-left">Quantity</th>
                    <th class="text-left">Unit</th>
                    <th class="text-left">Rate</th>
                    <th class="text-center" colspan="2">
                      <div class="header-group">
                        <div class="main-header">DISCOUNT</div>
                        <div class="sub-headers">
                          <span class="sub-header">%</span>
                          <span class="sub-header">AMOUNT</span>
                        </div>
                      </div>
                    </th>
                    <th class="text-center" colspan="2">
                      <div class="header-group">
                        <div class="main-header">TAX</div>
                        <div class="sub-headers">
                          <span class="sub-header">%</span>
                          <span class="sub-header">AMOUNT</span>
                        </div>
                      </div>
                    </th>
                    <th class="text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="orderItems && orderItems.length > 0">
                    <tr v-for="(item, index) in orderItems" :key="index">
                      <td>{{ index + 1 }}</td>
                      <td>
                        <div class="item-description">
                          <strong>{{ item.item_name || item.description || 'N/A' }}</strong>
                        </div>
                      </td>
                      <td>{{ item.hsn_code || 'N/A' }}</td>
                      <td>{{ item.item_code || 'N/A' }}</td>
                      <td>{{ getCategoryName(item.category) || 'N/A' }}</td>
                      <td>{{ item.description || 'N/A' }}</td>
                      <td>{{ item.quantity || '0' }}</td>
                      <td>{{ item.unit || 'N/A' }}</td>
                      <td>{{ formatAmount(item.price_per_unit) }}</td>
                      <td class="text-center">{{ item.discount_percent || '0' }}</td>
                      <td class="text-center">{{ formatAmount(item.discount_amount) }}</td>
                      <td class="text-center">{{ item.tax_percent || '0' }}</td>
                      <td class="text-center">{{ formatAmount(item.tax_amount) }}</td>
                      <td>{{ formatAmount(item.amount) }}</td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr>
                      <td colspan="14" class="text-center">No items available</td>
                    </tr>
                  </template>
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td colspan="12"></td>
                    <td class="text-right"><strong>Total:</strong></td>
                    <td>
                      <strong>{{ formatAmount(totalAmount) }}</strong>
                    </td>
                  </tr>
                </tfoot>
              </v-table>
            </div>

            <!-- Order Summary Section -->
            <div class="order-summary-section">
              <div class="summary-container">
                <div class="summary-row">
                  <span class="summary-label">Sub Total:</span>
                  <span class="summary-value">{{ formatAmount(subTotal) }}</span>
                </div>
                <div class="summary-row" v-if="selectedOrder.discount_percent && parseFloat(selectedOrder.discount_percent) > 0">
                  <span class="summary-label">Discount ({{ selectedOrder.discount_percent }}%):</span>
                  <span class="summary-value">-{{ formatAmount(selectedOrder.discount_amount || '0.00') }}</span>
                </div>
                <div class="summary-row" v-if="selectedOrder.tax_type && selectedOrder.tax_type !== 'Exempt'">
                  <span class="summary-label">Tax ({{ selectedOrder.tax_type }}):</span>
                  <span class="summary-value">{{ formatAmount(selectedOrder.tax_amount || '0.00') }}</span>
                </div>
                <div class="summary-row" v-if="selectedOrder.round_off && parseFloat(selectedOrder.round_off_amount || '0') !== 0">
                  <span class="summary-label">Round Off:</span>
                  <span class="summary-value">{{ formatAmount(selectedOrder.round_off_amount || '0.00') }}</span>
                </div>
                <div class="summary-row total-row">
                  <span class="summary-label total-label">Total:</span>
                  <span class="summary-value total-value">{{ formatAmount(totalAmount) }}</span>
                </div>
              </div>
            </div>

            <!-- Terms and Conditions Section -->
            <div v-if="selectedOrder.terms_conditions" class="terms-section">
              <div class="section-title">Terms and Conditions</div>
              <div class="terms-content">
                {{ selectedOrder.terms_conditions }}
              </div>
            </div>

            <!-- Footer -->
            <div class="order-footer">
              <table class="footer-table">
                <tbody>
                  <tr>
                    <td class="footer-left">
                      <div class="amount-words">
                        <strong>Amount Chargeable (in words):</strong>
                        <p class="amount-text">{{ amountInWords }}</p>
                      </div>
                      <div class="payment-details">
                        <p><strong>GST:</strong> {{ selectedEntity.entity_gst }}</p>
                        <p><strong>Payment by cheque should be drawn in favour of:</strong></p>
                        <p class="company-name-bold">"{{ selectedEntity.entity_name }}"</p>
                        <p><strong>RTGS/NEFT</strong></p>
                      </div>
                    </td>
                    <td class="footer-right">
                      <div class="qr-code-section">
                        <div class="qr-code-container">
                          <v-img
                            v-if="selectedEntity.entity_qr_code"
                            :src="selectedEntity.entity_qr_code"
                            width="100"
                            height="100"
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
                            width="150"
                            height="75"
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

export default {
  name: "PurchaseOrderPreviewDialog",
  mixins: [get_global_categories],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    orderData: {
      type: Object,
      default: () => ({}),
    },
    entityData: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      // Component data will be populated from props
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
    hasOrderData() {
      return this.selectedOrder && Object.keys(this.selectedOrder).length > 0;
    },
    selectedOrder() {
      return this.orderData || {};
    },
    selectedEntity() {
      return this.entityData || {};
    },
    orderItems() {
      // Parse items from order data - handle multiple possible field names
      let items = [];
      
      // Try table_data first
      if (this.selectedOrder.table_data) {
        if (typeof this.selectedOrder.table_data === 'string') {
          try {
            items = JSON.parse(this.selectedOrder.table_data);
          } catch (e) {
            console.error('Error parsing table_data:', e);
          }
        } else if (Array.isArray(this.selectedOrder.table_data)) {
          items = this.selectedOrder.table_data;
        }
      }
      
      // If no items found, try tableData field (fallback)
      if (!items || items.length === 0) {
        if (this.selectedOrder.tableData) {
          if (typeof this.selectedOrder.tableData === 'string') {
            try {
              items = JSON.parse(this.selectedOrder.tableData);
            } catch (e) {
              console.error('Error parsing tableData:', e);
            }
          } else if (Array.isArray(this.selectedOrder.tableData)) {
            items = this.selectedOrder.tableData;
          }
        }
      }
      
      // If still no items found, try items field
      if (!items || items.length === 0) {
        if (this.selectedOrder.items) {
          if (typeof this.selectedOrder.items === 'string') {
            try {
              items = JSON.parse(this.selectedOrder.items);
            } catch (e) {
              console.error('Error parsing items:', e);
            }
          } else if (Array.isArray(this.selectedOrder.items)) {
            items = this.selectedOrder.items;
          }
        }
      }
      
      return items || [];
    },
    subTotal() {
      if (!this.orderItems || !this.orderItems.length) return 0;
      return this.orderItems.reduce((sum, item) => {
        return sum + (parseFloat(item.amount) || 0);
      }, 0);
    },
    totalTaxAmount() {
      if (!this.orderItems || !this.orderItems.length) return 0;
      return this.orderItems.reduce((sum, item) => {
        return sum + (parseFloat(item.tax_amount) || 0);
      }, 0);
    },
    totalAmount() {
      // Use total_cost from order data if available, otherwise calculate from items
      if (this.selectedOrder.total_cost) {
        return parseFloat(this.selectedOrder.total_cost);
      }
      return this.subTotal + this.totalTaxAmount;
    },
    amountInWords() {
      return this.numberToWords(this.totalAmount);
    },
  },

  watch: {
    modelValue: {
      async handler(newVal) {
        if (newVal) {
          // Fetch global categories when dialog opens
          await this.get_global_categories();
        }
      },
      immediate: true,
    },
  },

  methods: {
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
    printOrder() {
      // Get the order content element
      const orderElement = this.$refs.orderContent;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      // Clone the element to avoid modifying the original
      const clonedElement = orderElement.cloneNode(true);
      
      // Process images to ensure correct sources are used
      const images = clonedElement.querySelectorAll('img');
      images.forEach(img => {
        if (img.src) {
          img.setAttribute('src', img.src);
        }
      });
      
      // Also process v-img elements
      const vImgElements = clonedElement.querySelectorAll('.v-img');
      vImgElements.forEach(vImg => {
        const actualImg = vImg.querySelector('img');
        if (actualImg && actualImg.src) {
          actualImg.setAttribute('src', actualImg.src);
        }
      });
      
      // Create the print HTML with all necessary styles
      printWindow.document.write(`
        <html>
          <head>
            <title>Purchase Order - ${this.selectedOrder.invoice_no || 'N/A'}</title>
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
              
              .order-content { 
                max-width: 800px; 
                margin: 0 auto;
                padding: 20px;
                background: white;
                font-family: 'Arial', sans-serif;
                line-height: 1.4;
              }
              
              .order-header { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start;
                margin-bottom: 20px; 
                padding-bottom: 15px;
                border-bottom: 1px solid #ddd;
              }
              
              .header-left { 
                flex: 1; 
              }
              
              .header-right { 
                flex: 1; 
                text-align: right; 
              }
              
              .company-logo {
                margin-bottom: 20px;
                padding-bottom: 10px;
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
                margin-bottom: 20px !important;
              }
              
              .company-info {
                margin-top: 5px;
              }
              
              .company-name { 
                font-size: 20px; 
                font-weight: normal; 
                margin: 0 0 15px 0; 
                color: #333;
              }
              
              .company-gst {
                font-size: 14px;
                margin: 0 0 5px 0;
                color: #666;
              }
              
              .company-address {
                font-size: 14px;
                margin: 0;
                color: #666;
              }
              
              .order-title { 
                font-size: 24px; 
                font-weight: normal; 
                margin: 0 0 15px 0; 
                color: #333;
                text-transform: uppercase;
              }
              
              .order-details {
                text-align: right;
              }
              
              .detail-row {
                margin-bottom: 8px;
              }
              
              .detail-label {
                font-weight: 600;
                margin-right: 10px;
                color: #333;
              }
              
              .detail-value {
                color: #666;
              }
              
              .supplier-section { 
                margin-bottom: 10px; 
                padding: 6px 10px;
                border: 1px solid #ddd;
                border-radius: 6px;
              }
              
              .supplier-header {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 4px;
              }
              
              .section-title {
                font-size: 12px;
                font-weight: bold;
                color: #333;
                margin: 0;
              }
              
              .supplier-name {
                font-size: 13px;
                font-weight: bold;
                margin: 0;
                color: #333;
              }
              
              .supplier-details-compact {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 2px;
              }
              
              .supplier-detail {
                font-size: 11px;
                color: #666;
                line-height: 1.2;
              }
              
              .order-summary-section {
                margin-bottom: 20px;
                display: block;
                text-align: right;
                width: 100%;
                clear: both;
              }
              
              .summary-container {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 16px;
                min-width: 300px;
                max-width: 400px;
                display: inline-block;
                margin-left: auto;
                margin-right: 0;
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
              
              .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                border: 1px solid #ddd;
                margin-bottom: 20px;
              }
              
              .items-table th { 
                background: #f8f9fa;
                padding: 8px 4px;
                font-weight: bold;
                text-align: left;
                border: 1px solid #ddd;
                font-size: 11px;
                color: #333;
              }
              
              .items-table td { 
                padding: 8px 4px;
                border: 1px solid #ddd;
                vertical-align: top;
                font-size: 11px;
              }
              
              .items-table td.text-center {
                text-align: center;
              }
              
              .item-description {
                max-width: 200px;
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
              
              .order-footer { 
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
                margin-bottom: 15px;
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
                margin: 0 0 20px 0 !important;
                margin-left: auto !important;
                clear: both;
              }
              
              .signature-line {
                width: 150px;
                height: 2px;
                background: #333;
                margin: 20px 0 20px auto;
              }
              
              .signature-text {
                font-size: 14px;
                color: #666;
                margin: 0;
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
                
                .order-footer {
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
                  margin-bottom: 15px !important;
                  width: 100% !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: transparent !important;
                  padding: 0 !important;
                }
                
                .signature-container img,
                .signature-container .v-img {
                  padding: 0 !important;
                  margin: 0 0 20px 0 !important;
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
                
                .signature-text {
                  display: block !important;
                  text-align: right !important;
                  margin-top: 10px !important;
                  float: none !important;
                  position: relative !important;
                  clear: both !important;
                  width: 100% !important;
                }
                
                .signature-text-container {
                  text-align: right !important;
                  margin-top: 10px !important;
                  clear: both !important;
                  float: none !important;
                  position: relative !important;
                  width: 100% !important;
                }
                
                .signature-line {
                  width: 150px !important;
                  height: 2px !important;
                  background: #333 !important;
                  margin: 20px 0 20px auto !important;
                  float: none !important;
                  position: relative !important;
                  clear: both !important;
                  display: block !important;
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
      
      // Wait for images to load before printing
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 1000);
    },
  },
};
</script>

<style scoped>
.order-preview-card {
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

.order-content {
  padding: 20px;
  background: white;
  font-family: 'Arial', sans-serif;
  line-height: 1.4;
  max-width: 800px;
  margin: 0 auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.header-left {
  flex: 1;
}

.header-right {
  flex: 1;
  text-align: right;
}

.company-logo {
  margin-bottom: 20px;
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

.company-name {
  font-size: 20px;
  font-weight: normal;
  margin: 0 0 15px 0;
  color: #333;
}

.company-gst {
  font-size: 14px;
  margin: 0 0 5px 0;
  color: #666;
}

.company-address {
  font-size: 14px;
  margin: 0;
  color: #666;
}

.order-title {
  font-size: 24px;
  font-weight: normal;
  margin: 0 0 15px 0;
  color: #333;
  text-transform: uppercase;
}

.order-details {
  text-align: right;
}

.detail-row {
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 600;
  margin-right: 10px;
  color: #333;
}

.detail-value {
  color: #666;
}

.supplier-section {
  margin-bottom: 12px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.supplier-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.section-title {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.supplier-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.supplier-details-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

.supplier-detail {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
}

.items-section {
  margin-bottom: 20px;
}

.order-summary-section {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.summary-container {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  min-width: 300px;
  max-width: 400px;
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

.items-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.items-table th {
  background: #f8f9fa;
  padding: 8px 4px;
  font-weight: bold;
  text-align: left;
  border: 1px solid #ddd;
  font-size: 11px;
  color: #333;
}

.items-table td {
  padding: 8px 4px;
  border: 1px solid #ddd;
  vertical-align: top;
  font-size: 11px;
}

.items-table td.text-center {
  text-align: center;
}

.item-description {
  max-width: 200px;
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

.order-footer {
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
  width: 150px;
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
  
  .order-content {
    padding: 20px;
  }
  
  .navBar {
    display: none;
  }
  
  .order-preview-card {
    box-shadow: none;
  }
  
  /* Ensure footer layout matches preview exactly */
  .order-footer {
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
    margin-bottom: 15px !important;
  }
  
  /* Ensure images maintain their sizes */
  .company-logo-img,
  .qr-code-img,
  .signature-img {
    /* Sizes are now controlled by specific container styles above */
  }
  
  /* Page break controls */
  .order-header,
  .supplier-section,
  .items-section,
  .order-footer {
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

  /* Order summary print styles */
  .order-summary-section {
    margin-bottom: 20px !important;
    display: block !important;
    text-align: right !important;
    width: 100% !important;
    float: none !important;
    clear: both !important;
  }

  .summary-container {
    background: #f8f9fa !important;
    border: 1px solid #e9ecef !important;
    border-radius: 8px !important;
    padding: 16px !important;
    min-width: 300px !important;
    max-width: 400px !important;
    display: inline-block !important;
    margin-left: auto !important;
    margin-right: 0 !important;
    float: none !important;
    position: relative !important;
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
