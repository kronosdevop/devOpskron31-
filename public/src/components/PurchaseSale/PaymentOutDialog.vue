<template>
  <v-dialog
    :model-value="DialogPaymentOut"
    persistent
    max-width="1000"
    transition="dialog-top-transition"
  >
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">Payment-Out</span>
        <v-btn icon variant="text" @click="DialogPaymentOutEmit(1)" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-4 py-3">
        <v-form ref="form">
          <!-- Payment Details Section -->
          <v-row class="mb-4">
            <!-- Left Column - Customer & Payment Details -->
            <v-col cols="12" md="6">
              <div class="mb-3">
                <v-autocomplete
                  v-model="supplierName"
                  label="Search by Name/Phone*"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account-search"
                  :items="supplierItems"
                  item-title="full_user_name"
                  item-value="supplier_id"
                  clearable
                  :rules="[(v) => !!v || 'Supplier selection is required']"
                  required
                  placeholder="Type to search suppliers..."
                  :filter="customFilter"
                  @update:modelValue="selectedOrder = []"
                />
              </div>
              <div class="mb-3">
                <v-select
                  v-model="paymentType"
                  label="Payment Type*"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-credit-card"
                  :items="paymentItems"
                  item-title="title"
                  item-value="value"
                  :rules="[(v) => !!v || 'Payment type is required']"
                  required
                  placeholder="Select payment type..."
                />
              </div>
              <div class="mb-3" v-if="paymentType === 'cheque'">
                <v-text-field
                  v-model="referenceNumber"
                  label="Reference Number"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-receipt"
                  hide-details
                  placeholder="Enter reference number..."
                />
              </div>
              <div class="mb-3">
                <v-textarea
                  v-model="description"
                  label="Description"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  hide-details
                  placeholder="Enter payment description..."
                />
              </div>
            </v-col>

            <!-- Right Column - Amount & Date Details -->
            <v-col cols="12" md="6">
              <div class="mb-3">
                <div class="d-flex align-center">
                  <v-text-field
                    v-model="paymentForm.prefix_name"
                    label="Prefix"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-receipt"
                    hide-details
                    readonly
                    class="mr-2"
                  />
                  <v-text-field
                    v-model="paymentForm.payment_count"
                    label="Reference No."
                    variant="outlined"
                    density="compact"
                    hide-details
                    type="number"
                    class="mr-2"
                    @input="updatePaymentNumber"
                  />
                </div>
              </div>
              <div class="mb-3">
                <v-menu v-model="dateMenu" :close-on-content-click="false">
                  <template #activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      label="Payment Date"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-calendar"
                      transition="scale-transition"
                      :model-value="formatedDate"
                      hide-details
                      readonly
                    />
                  </template>
                  <v-date-picker
                    v-model="selectedDate"
                    header-color="primary"
                  />
                </v-menu>
              </div>
              <div class="mb-3">
                <v-text-field
                  v-model="amountPaid"
                  label="Amount Paid*"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-currency-inr"
                  type="number"
                  :rules="[
                    (v) => !!v || 'Amount paid is required',
                    (v) => v > 0 || 'Amount must be greater than 0',
                  ]"
                  required
                  placeholder="Enter amount..."
                  @input="calculateTotal"
                />
              </div>
              <div class="mb-3">
                <v-text-field
                  v-model="additionalCharges"
                  label="Additional Charges"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-plus-circle"
                  type="number"
                  hide-details
                  placeholder="Enter additional charges..."
                  @input="calculateTotal"
                />
              </div>
              <div class="mb-3">
                <v-text-field
                  v-model="totalAmount"
                  label="Total Amount"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calculator"
                  type="number"
                  hide-details
                  placeholder="Total amount..."
                  readonly
                />
              </div>
            </v-col>
          </v-row>

          <!-- Image Upload Section -->
          <v-row class="mb-4">
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between mb-2">
                <h3 class="text-h6 font-weight-medium">Payment Receipt</h3>
                <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-camera"
                  class="text-none"
                  size="small"
                  @click="toggleImageUpload"
                >
                  {{ showImageUpload ? "HIDE IMAGE" : "ADD IMAGE" }}
                </v-btn>
              </div>

              <!-- Image Upload Container -->
              <div v-if="showImageUpload" class="image-upload-container">
                <v-file-input
                  label="Payment Receipt Image"
                  variant="outlined"
                  density="compact"
                  accept="image/png, image/jpeg"
                  @update:modelValue="handleFileChange"
                  clearable
                  @click:clear="clearImage"
                  hide-details
                />
                <v-img
                  v-if="imagePreview"
                  :src="imagePreview"
                  max-height="200"
                  max-width="400"
                  class="rounded-lg mt-2"
                  contain
                  @error="imagePreview = null"
                />
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="px-4 py-3">
        <v-btn
          text
          color="success"
          @click="linkPayment()"
          v-if="supplierName"
          size="small"
          >Link Payment</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn text @click="DialogPaymentOutEmit(1)" size="small">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :loading="loading"
          @click="savePayment"
          size="small"
        >
          Add Payment
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Link Payment Dialog -->
  <v-dialog
    v-model="linkPaymentDialog"
    persistent
    max-width="1200"
    transition="dialog-top-transition"
  >
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">Link Payment to Purchase Order</span>
        <v-btn icon variant="text" @click="closeLinkPaymentDialog" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-4 py-3">
        <div class="mb-4">
          <p class="text-body-2 text-grey">
            Select a purchase order with partial payment to link this payment to:
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="linkPaymentLoading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="32"
            class="mb-4"
          ></v-progress-circular>
          <div class="text-body-2 text-grey">Loading purchase orders...</div>
        </div>

        <!-- Purchase Orders Table -->
        <div v-else>
          <v-data-table
            v-model="selectedOrder"
            :headers="linkPaymentHeaders"
            :items="partialPaymentOrders"
            :loading="linkPaymentLoading"
            item-value="transaction_id"
            show-select
            single-select
            class="modern-data-table"
            density="comfortable"
            hover
            :height="400"
          >
            <template v-slot:[`item.invoice_no`]="{ item }">
              <div class="d-flex flex-column">
                <span class="caption font-weight-medium">{{
                  item.invoice_no
                }}</span>
                <span class="caption text-grey">{{
                  item.refrence_no || "-"
                }}</span>
              </div>
            </template>

            <template v-slot:[`item.supplier_name`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="primary" class="mr-2"
                  >mdi-account</v-icon
                >
                <span class="caption font-weight-medium">{{
                  item.supplier_name
                }}</span>
              </div>
            </template>

            <template v-slot:[`item.invoice_date`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                >
                <span class="caption">{{ formatDate(item.invoice_date) }}</span>
              </div>
            </template>

            <template v-slot:[`item.total_cost`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption font-weight-medium"
                  >₹ {{ formatAmount(item.total_cost) }}</span
                >
              </div>
            </template>

            <template v-slot:[`item.received_cost`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption font-weight-medium"
                  >₹ {{ formatAmount(item.received_cost) }}</span
                >
              </div>
            </template>

            <template v-slot:[`item.balance_cost`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption font-weight-medium text-orange"
                  >₹ {{ formatAmount(item.balance_cost) }}</span
                >
              </div>
            </template>

            <template v-slot:[`item.payment_status`]>
              <div class="d-flex align-center">
                <v-chip
                  color="warning"
                  size="small"
                  variant="flat"
                  class="caption"
                >
                  Partial
                </v-chip>
              </div>
            </template>

            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4"
                  >mdi-file-document-outline</v-icon
                >
                <div class="text-h6 text-grey mb-2">
                  No Partial Payment Purchase Orders Found
                </div>
                <div class="text-body-2 text-grey">
                  All purchase orders are fully paid or no orders exist
                </div>
              </div>
            </template>
          </v-data-table>
        </div>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="px-4 py-3">
        <v-spacer></v-spacer>
        <v-btn text @click="closeLinkPaymentDialog" size="small">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :disabled="!selectedOrder || selectedOrder.length === 0"
          @click="linkPaymentToOrder"
          size="small"
        >
          Link Payment
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";
import { get_organization_prefix, list_purchase_order_transactions } from "@/graphql/queries.js";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { API, graphqlOperation } from "aws-amplify";
import { payment_out_transactions } from "@/graphql/mutations.js";
export default {
  props: {
    DialogPaymentOut: Boolean,
  },
  emits: ["clicked", "successMsg", "errorMsg"],
  mixins: [get_all_org_suppliers],

  computed: {
    formatedDate() {
      if (!this.selectedDate) return "";
      return this.ConvertDate(this.selectedDate);
    },
  },
  mounted() {
    this.fetch_details();
    this.get_organization_prefix();
  },
  data: () => ({
    loading: false,
    showImageUpload: false,
    supplierName: "",
    paymentType: "",
    referenceNumber: "",
    amountPaid: "",
    additionalCharges: "",
    totalAmount: "",
    description: "",

    dateMenu: false,

    imagePreview: null,
    imageFile: null,
    bucketUrls: {
      image: null,
    },

    selectedDate: new Date(),

    paymentForm: {
      prefix_name: "",
      payment_count: "",
      payment_no: "",
    },

    supplierItems: [],
    paymentItems: [
      { title: "Cash", value: "cash" },
      { title: "Cheque", value: "cheque" },
      { title: "Bank Transfer", value: "bank_transfer" },
      { title: "UPI", value: "upi" },
      { title: "Credit Card", value: "credit_card" },
      { title: "Debit Card", value: "debit_card" },
    ],

    // Link Payment Dialog Data
    linkPaymentDialog: false,
    linkPaymentLoading: false,
    partialPaymentOrders: [],
    selectedOrder: [],
    refrence_id: "",
    linkPaymentHeaders: [
      { title: "Order No", key: "invoice_no", sortable: false, width: "150px" },
      {
        title: "Supplier",
        key: "supplier_name",
        sortable: false,
        width: "200px",
      },
      { title: "Date", key: "invoice_date", sortable: false, width: "120px" },
      {
        title: "Total Amount",
        key: "total_cost",
        sortable: false,
        width: "120px",
      },
      {
        title: "Received",
        key: "received_cost",
        sortable: false,
        width: "120px",
      },
      {
        title: "Balance",
        key: "balance_cost",
        sortable: false,
        width: "120px",
      },
      {
        title: "Status",
        key: "payment_status",
        sortable: false,
        width: "100px",
      },
    ],
  }),
  methods: {
    async fetch_details() {
      await this.get_all_org_suppliers();
      this.supplierItems = [];
      this.orgSupplier.forEach((supplier) => {
        this.supplierItems.push({
          full_user_name:
            supplier.supplier_name +
            " ( " +
            (supplier.vendor_display_id || "") +
            " ) ",
          supplier_id: supplier.suppliers_id,
        });
      });
    },
    DialogPaymentOutEmit(Toggle) {
      this.$emit("clicked", Toggle);
      this.resetForm();
    },

    customFilter(item, queryText, itemTitle) {
      const text = itemTitle.toLowerCase();
      const query = queryText.toLowerCase();
      return (
        text.indexOf(query) > -1 ||
        (item.phone_number &&
          item.phone_number.toLowerCase().indexOf(query) > -1) ||
        (item.email && item.email.toLowerCase().indexOf(query) > -1)
      );
    },
    ConvertDate(selectedDate) {
      const date = new Date(selectedDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    handleFileChange(file) {
      if (file instanceof Blob) {
        this.imageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.onerror = () => {
          this.imagePreview = null;
        };
        reader.readAsDataURL(file);
      } else {
        this.imagePreview = null;
        this.imageFile = null;
      }
    },

    toggleImageUpload() {
      if (this.showImageUpload) {
        this.clearImage();
      }
      this.showImageUpload = !this.showImageUpload;
    },

    clearImage() {
      this.imagePreview = null;
      this.imageFile = null;
      this.bucketUrls.image = null;
    },

    calculateTotal() {
      const amount = parseFloat(this.amountPaid) || 0;
      const charges = parseFloat(this.additionalCharges) || 0;
      this.totalAmount = (amount + charges).toFixed(0);
    },

    async uploadImage() {
      if (!this.imageFile) return null;

      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        const key = [
          "payment-out-receipts",
          orgDetails.organization.organization_id,
          `${Date.now()}__${this.imageFile.name.replace(/\s+/g, "")}`,
        ].join("/");

        const fileUrl = await uploadToS3(
          this.imageFile,
          orgDetails.s3_details,
          key
        );

        if (fileUrl) {
          this.bucketUrls.image = fileUrl;
          return fileUrl;
        }
      } catch (error) {
        console.error("Image upload error:", error);
        throw new Error("Failed to upload payment receipt image");
      }
    },

    async savePayment() {
      // Validate required fields first
      if (!this.supplierName) {
        this.$emit("errorMsg", "Please select a supplier");
        return;
      }

      if (!this.paymentType) {
        this.$emit("errorMsg", "Please select a payment type");
        return;
      }

      if (!this.amountPaid || this.amountPaid <= 0) {
        this.$emit("errorMsg", "Please enter a valid amount paid");
        return;
      }

      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;

        try {
          // Upload image first if present
          const imageUrl = await this.uploadImage();

          // TODO: Implement payment save logic with actual API call
          // console.log("Saving payment-out:", {
          //   supplier: this.supplierName,
          //   paymentType: this.paymentType,
          //   amount: this.amountPaid,
          //   date: this.selectedDate,
          //   paymentNumber: this.paymentForm.payment_no,
          //   referenceNumber: this.referenceNumber,
          //   description: this.description,
          //   imageUrl: imageUrl,
          //   totalAmount: this.totalAmount,
          //   refrence_id: this.refrence_id,
          // });

          const response = await API.graphql(
            graphqlOperation(payment_out_transactions, {
              input: {
                invoice_no: this.paymentForm.payment_no,
                supplier_id: this.supplierName,
                received_cost: this.amountPaid,
                transaction_date: this.selectedDate.toISOString().split("T")[0],
                transaction_type: "PAYMENT_OUT",
                supplier_name:
                  this.supplierItems.find(
                    (customer) => customer.supplier_id === this.supplierName
                  )?.full_user_name || "",
                transaction_description: this.description,
                discount_amount: this.additionalCharges,
                total_cost: this.totalAmount ,
                image_url: imageUrl,
                refrence_id:
                  this.selectedOrder.length > 0 ? this.refrence_id : undefined,
              },
            })
          );
          // console.log(response);
          const responseData = JSON.parse(
            response.data.payment_out_transactions
          );
          if (responseData.Status === "SUCCESS") {
            this.$emit("successMsg", "Payment-In created successfully!");
            this.resetForm();
            this.DialogPaymentOutEmit(1);
          } else {
            this.$emit("errorMsg", responseData.Message);
          }

        } catch (error) {
          console.error("Error saving payment:", error);
          this.$emit(
            "errorMsg",
            error.message || "An error occurred while creating the payment"
          );
        } finally {
          this.loading = false;
        }
      } else {
        this.$emit("errorMsg", "Please fill in all required fields correctly");
      }
    },

    updatePaymentNumber() {
      if (this.paymentForm.prefix_name && this.paymentForm.payment_count) {
        this.paymentForm.payment_no =
          this.paymentForm.prefix_name + this.paymentForm.payment_count;
      }
    },

    async get_organization_prefix() {
      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        if (
          !orgDetails ||
          !orgDetails.organization ||
          !orgDetails.organization.organization_id
        ) {
          console.warn("Organization details not available");
          this.setDefaultPrefix();
          return;
        }

        const prefix = await API.graphql(
          graphqlOperation(get_organization_prefix, {
            organization_id: orgDetails.organization.organization_id,
            prefix_type: "PAYMENT_OUT",
          })
        );

        if (!prefix.data || !prefix.data.get_organization_prefix) {
          console.warn("No prefix data received from API");
          this.setDefaultPrefix();
          return;
        }

        let prefix_no;
        try {
          prefix_no = JSON.parse(prefix.data.get_organization_prefix);
        } catch (parseError) {
          console.error("Error parsing prefix data:", parseError);
          this.setDefaultPrefix();
          return;
        }

        if (Array.isArray(prefix_no) && prefix_no.length > 0 && prefix_no[0]) {
          const firstPrefix = prefix_no[0];

          if (firstPrefix.prefix_name && firstPrefix.count !== undefined) {
            this.paymentForm.prefix_name = firstPrefix.prefix_name;
            this.paymentForm.payment_count = firstPrefix.count.toString();
            this.updatePaymentNumber();
          } else {
            console.warn(
              "Prefix data missing required properties:",
              firstPrefix
            );
            this.setDefaultPrefix();
          }
        } else {
          console.warn("Invalid prefix data structure:", prefix_no);
          this.setDefaultPrefix();
        }
      } catch (error) {
        console.error("Error fetching organization prefix:", error);
        this.setDefaultPrefix();
      }
    },

    setDefaultPrefix() {
      this.paymentForm.prefix_name = "PO-";
      this.paymentForm.payment_count = "001";
      this.updatePaymentNumber();
    },

    resetForm() {
      this.paymentType = "";
      this.supplierName = "";
      this.referenceNumber = "";
      this.amountPaid = "";
      this.additionalCharges = "";
      this.totalAmount = "";
      this.description = "";
      this.imagePreview = null;
      this.imageFile = null;
      this.bucketUrls.image = null;
      this.showImageUpload = false;
      this.selectedDate = new Date();
      this.paymentForm = {
        prefix_name: "",
        payment_count: "",
        payment_no: "",
      };
      this.selectedOrder = [];
      this.refrence_id = "";
    },

    // Link Payment Methods
    async linkPayment() {
      this.selectedOrder = [];
      this.partialPaymentOrders = [];
      this.linkPaymentDialog = true;
      await this.loadPartialPaymentOrders();
    },

    async loadPartialPaymentOrders() {
      try {
        this.linkPaymentLoading = true;
        const response = await API.graphql(
          graphqlOperation(list_purchase_order_transactions, {
            input: {
              transaction_type: "PURCHASE",
              supplier_id: this.supplierName,
            },
          })
        );

        const result = JSON.parse(response.data.list_purchase_order_transactions);

        if (result.Status === "SUCCESS") {
          // Filter orders with partial payment status
          this.partialPaymentOrders = result.data
        } else {
          this.partialPaymentOrders = [];
        }
      } catch (error) {
        console.error("Error loading partial payment orders:", error);
        this.partialPaymentOrders = [];
        this.$emit("errorMsg", "Failed to load purchase orders");
      } finally {
        this.linkPaymentLoading = false;
      }
    },

    closeLinkPaymentDialog() {
      this.linkPaymentDialog = false;
    },

    linkPaymentToOrder() {
      if (this.selectedOrder && this.selectedOrder.length === 1) {
        const selectedOrderData = this.selectedOrder[0];
        const updatedData = this.partialPaymentOrders.find(
          (order) => order.transaction_id === selectedOrderData
        );
        
        // Populate the form with selected order data
        this.amountPaid = updatedData.balance_cost;
        this.additionalCharges = updatedData.additional_charges || "0";
        this.refrence_id = updatedData.transaction_id;
        this.calculateTotal();
        this.description = updatedData.description || `Payment for Purchase Order: ${updatedData.invoice_no}`;

        // Close the dialog
        this.closeLinkPaymentDialog();

        this.$emit("successMsg", `Payment linked to purchase order ${updatedData.invoice_no}`);
      } else {
        this.$emit("errorMsg", "Please select only one purchase order");
      }
    },

    formatDate(dateString) {
      if (!dateString) return "-";
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
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
}

.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}

.v-btn[variant="text"] {
  color: #888;
}

.image-upload-container {
  text-align: center;
  padding: 16px;
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.image-upload-container:hover {
  border-color: #3b82f6;
  background-color: #f8fafc;
}

/* Form styling improvements */
.v-text-field .v-field__outline {
  border-radius: 8px !important;
}

.v-select .v-field__outline {
  border-radius: 8px !important;
}

.v-textarea .v-field__outline {
  border-radius: 8px !important;
}

.v-file-input .v-field__outline {
  border-radius: 8px !important;
}

/* Link Payment Dialog Styles */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.text-orange {
  color: #ff9800 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .v-card {
    margin: 16px !important;
  }

  .v-card-title {
    font-size: 1.1rem !important;
  }
}
</style>
