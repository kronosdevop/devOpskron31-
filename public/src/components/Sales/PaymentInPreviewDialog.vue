<template>
  <div>
    <v-dialog
      v-model="dialogVisible"
      persistent
      max-width="1000"
      transition="dialog-top-transition"
    >
      <v-card class="payment-preview-card">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Payment Receipt Preview</div>
          </v-toolbar-title>
          <v-spacer />
          <div class="d-flex align-center">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click="printPaymentReceipt"
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
          <div v-if="!hasPaymentData" class="loading-state">
            <div class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="32"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-body-2 text-grey">
                Loading payment receipt...
              </div>
            </div>
          </div>

          <!-- Payment Receipt Content -->
          <div v-else class="payment-content" ref="paymentContent">
            <!-- Main Receipt Container -->
            <div class="receipt-container">
              <!-- Header with Title and Receipt Details -->
              <div class="receipt-header">
                <div class="receipt-title">Payment Receipt</div>
                <div class="receipt-details">
                  <div class="receipt-no">
                    <div class="label">Receipt No.</div>
                    <div class="value">
                      {{ selectedPayment.invoice_no || "N/A" }}
                    </div>
                  </div>
                  <div class="receipt-date">
                    <div class="label">Date</div>
                    <div class="value">
                      {{ formatDate(selectedPayment.transaction_date) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Main Content Grid -->
              <div class="receipt-grid">
                <!-- Left Column -->
                <div class="left-column">
                  <!-- Recipient Information -->
                  <div class="info-box">
                    <div class="recipient-name">
                      {{ selectedEntity.entity_name || "N/A" }}
                    </div>
                    <div class="recipient-phone">
                      GST No: {{ selectedEntity.entity_gst || "N/A" }}
                    </div>
                    <div class="recipient-email">
                      Email: {{ selectedEntity.entity_owner_email || "N/A" }}
                    </div>
                  </div>

                  <!-- Received From Information -->
                  <div class="info-box">
                    <div class="section-label">Received From</div>
                    <div class="company-name">
                      {{ selectedPayment.transaction_details || "N/A" }}
                    </div>
                    <!-- <div class="company-address">
                      {{ selectedEntity.entity_address || "address not" }}
                    </div>
                    <div class="company-contact">
                      Contact No.: {{ selectedEntity.entity_phone || "N/A" }}
                    </div>
                    <div class="company-state">
                      State: {{ selectedEntity.entity_state || "N/A" }}
                    </div> -->
                  </div>

                  <!-- Amount in Words -->
                  <div class="info-box">
                    <div class="section-label">Amount In Words</div>
                    <div class="amount-words">{{ amountInWords }}</div>
                  </div>
                </div>

                <!-- Right Column -->
                <div class="right-column">
                  <!-- Amounts Section -->
                  <div class="amounts-box">
                    <div class="amounts-header">Amounts</div>
                    <div class="amount-row">
                      <span class="amount-label">Received</span>
                      <span class="amount-value">{{
                        formatAmount(selectedPayment.received_cost)
                      }}</span>
                    </div>
                  </div>

                  <!-- Signatory Section -->
                  <div class="signatory-box">
                    <div class="signatory-text">
                      For : {{ selectedEntity.entity_name || "N/A" }}
                    </div>
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
                    <div class="authorized-text">Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "PaymentInPreviewDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    paymentData: {
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
    hasPaymentData() {
      return (
        this.selectedPayment && Object.keys(this.selectedPayment).length > 0
      );
    },
    selectedPayment() {
      return this.paymentData || {};
    },
    selectedEntity() {
      return this.entityData || {};
    },
    amountInWords() {
      return this.numberToWords(
        parseFloat(this.selectedPayment.total_cost) || 0
      );
    },
  },

  methods: {
    closeDialog() {
      this.dialogVisible = false;
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    formatAmount(amount) {
      if (!amount) return "0.00";
      return parseFloat(amount).toFixed(2);
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
    printPaymentReceipt() {
      // Get the payment content element
      const paymentElement = this.$refs.paymentContent;

      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=800,height=600");

      // Clone the element to avoid modifying the original
      const clonedElement = paymentElement.cloneNode(true);

      // Process images to ensure correct sources are used
      const images = clonedElement.querySelectorAll("img");
      images.forEach((img) => {
        // Ensure the image source is preserved
        if (img.src) {
          img.setAttribute("src", img.src);
        }
      });

      // Also process v-img elements by finding their actual img children
      const vImgElements = clonedElement.querySelectorAll(".v-img");
      vImgElements.forEach((vImg) => {
        const actualImg = vImg.querySelector("img");
        if (actualImg && actualImg.src) {
          actualImg.setAttribute("src", actualImg.src);
        }
      });

      // Create the print HTML with all necessary styles
      printWindow.document.write(`
        <html>
          <head>
            <title>Payment Receipt - ${
              this.selectedPayment.invoice_no || "N/A"
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
              
                             .payment-content { 
                 max-width: 800px; 
                 margin: 0 auto;
                 padding: 20px;
                 background: white;
                 font-family: 'Arial', sans-serif;
                 line-height: 1.4;
               }
               
               .receipt-container {
                 border: 2px solid #000;
                 padding: 0;
                 background: white;
               }
               
               .receipt-header {
                 display: flex;
                 justify-content: space-between;
                 align-items: flex-start;
                 padding: 15px;
                 border-bottom: 1px solid #000;
               }
               
               .receipt-title {
                 font-size: 20px;
                 font-weight: bold;
                 text-align: right;
                 flex: 1;
               }
               
               .receipt-details {
                 display: flex;
                 gap: 20px;
               }
               
               .receipt-no,
               .receipt-date {
                 text-align: center;
               }
               
               .receipt-no .label,
               .receipt-date .label {
                 font-weight: bold;
                 font-size: 12px;
                 margin-bottom: 5px;
               }
               
               .receipt-no .value,
               .receipt-date .value {
                 font-size: 14px;
                 font-weight: bold;
               }
               
               .receipt-grid {
                 display: grid;
                 grid-template-columns: 1fr 1fr;
                 min-height: 400px;
               }
               
               .left-column,
               .right-column {
                 border-right: 1px solid #000;
                 padding: 0;
               }
               
               .right-column {
                 border-right: none;
               }
               
               .info-box,
               .amounts-box,
               .signatory-box {
                 border-bottom: 1px solid #000;
                 padding: 10px;
                 min-height: 120px;
                 display: flex;
                 flex-direction: column;
                 justify-content: flex-start;
               }
               
               .info-box:last-child,
               .amounts-box:last-child,
               .signatory-box:last-child {
                 border-bottom: none;
               }
               
               .recipient-name {
                 font-weight: bold;
                 font-size: 16px;
                 margin-bottom: 5px;
               }
               
               .recipient-phone,
               .recipient-email {
                 font-size: 12px;
                 margin-bottom: 3px;
               }
               
               .section-label {
                 font-weight: bold;
                 font-size: 12px;
                 margin-bottom: 5px;
               }
               
               .company-name {
                 font-weight: bold;
                 font-size: 14px;
                 margin-bottom: 3px;
               }
               
               .company-address,
               .company-contact,
               .company-state {
                 font-size: 12px;
                 margin-bottom: 2px;
               }
               
               .amount-words {
                 font-weight: bold;
                 font-size: 14px;
                 margin-top: 5px;
               }
               
               .amounts-header {
                 font-weight: bold;
                 font-size: 14px;
                 margin-bottom: 10px;
               }
               
               .amount-row {
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
               }
               
               .amount-label {
                 font-size: 12px;
                 font-weight: bold;
               }
               
               .amount-value {
                 font-size: 14px;
                 font-weight: bold;
                 text-align: right;
               }
               
               .signatory-text {
                 font-size: 12px;
                 text-align: right;
                 margin-bottom: 15px;
                 clear: both;
                 display: block;
                 width: 100%;
               }
               
               .signature-container {
                 margin-bottom: 15px;
                 text-align: center;
                 clear: both;
                 display: block;
                 width: 100%;
               }

               .signature-container img,
               .signature-container .v-img {
                 width: 120px !important;
                 height: 60px !important;
                 max-width: 120px !important;
                 max-height: 60px !important;
                 min-width: 120px !important;
                 min-height: 60px !important;
                 object-fit: contain !important;
                 display: block !important;
                 margin: 10px auto !important;
                 clear: both !important;
                 position: relative !important;
                 float: none !important;
               }
               
               .authorized-text {
                 font-size: 12px;
                 text-align: center;
                 font-weight: bold;
                 margin-top: 10px;
                 clear: both;
                 display: block;
                 width: 100%;
               }
              
              /* Print-specific styles */
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
                }
                
                .payment-content {
                  padding: 20px;
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
.payment-preview-card {
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

.payment-content {
  padding: 20px;
  background: white;
  font-family: "Arial", sans-serif;
  line-height: 1.4;
  max-width: 800px;
  margin: 0 auto;
}

.receipt-container {
  border: 2px solid #000;
  padding: 0;
  background: white;
}

.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #000;
}

.receipt-title {
  font-size: 20px;
  font-weight: bold;
  text-align: right;
  flex: 1;
}

.receipt-details {
  display: flex;
  gap: 20px;
}

.receipt-no,
.receipt-date {
  text-align: center;
}

.receipt-no .label,
.receipt-date .label {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
}

.receipt-no .value,
.receipt-date .value {
  font-size: 14px;
  font-weight: bold;
}

.receipt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400px;
}

.left-column,
.right-column {
  border-right: 1px solid #000;
  padding: 0;
}

.right-column {
  border-right: none;
}

.info-box,
.amounts-box,
.signatory-box {
  border-bottom: 1px solid #000;
  padding: 10px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.info-box:last-child,
.amounts-box:last-child,
.signatory-box:last-child {
  border-bottom: none;
}

.recipient-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
}

.recipient-phone,
.recipient-email {
  font-size: 12px;
  margin-bottom: 3px;
}

.section-label {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
}

.company-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 3px;
}

.company-address,
.company-contact,
.company-state {
  font-size: 12px;
  margin-bottom: 2px;
}

.amount-words {
  font-weight: bold;
  font-size: 14px;
  margin-top: 5px;
}

.amounts-header {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 10px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 12px;
  font-weight: bold;
}

.amount-value {
  font-size: 14px;
  font-weight: bold;
  text-align: right;
}

.signatory-text {
  font-size: 12px;
  text-align: right;
  margin-bottom: 15px;
  clear: both;
  display: block;
  width: 100%;
}



.authorized-text {
  font-size: 12px;
  text-align: center;
  font-weight: bold;
  margin-top: 10px;
  clear: both;
  display: block;
  width: 100%;
}

.signature-container {
  margin-bottom: 15px;
  text-align: center;
}

.signature-img {
  max-width: 100%;
  height: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 120px !important;
  height: 60px !important;
  object-fit: contain !important;
  max-width: 120px !important;
  max-height: 60px !important;
  min-width: 120px !important;
  min-height: 60px !important;
  margin: 10px auto;
  clear: both;
  display: block;
}

.signature-placeholder {
  text-align: center;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  margin-bottom: 10px;
}

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
  }

  .payment-content {
    padding: 20px;
  }

  .navBar {
    display: none;
  }

  .payment-preview-card {
    box-shadow: none;
  }
}
</style>
