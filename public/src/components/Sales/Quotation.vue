<template>
  <div>
    <!-- Quotation List View -->
    <div class="pa-4">
      <v-card class="" flat>
        <v-card-text class="pa-4">
          <v-data-table
            :headers="headers"
            :items="paginatedItems"
            :loading="tableLoading"
            :sort-by="['invoice_date']"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="totalItems"
            hide-default-footer
            class="modern-data-table"
            density="comfortable"
            hover
            :fixed-header="true"
            :height="windowHeight"
            @click:row="handleClick"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4"
                  >mdi-file-question-outline</v-icon
                >
                <div class="text-h6 text-grey mb-2">No Quotations Found</div>
                <div class="text-body-2 text-grey">
                  Create your first quotation to get started.
                </div>
              </div>
            </template>

            <template v-slot:loading>
              <div class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-4"
                ></v-progress-circular>
                <div class="text-body-2 text-grey">Loading quotations...</div>
              </div>
            </template>

            <!-- Reference Number -->
            <template v-slot:[`item.invoice_no`]="{ item }">
              <div class="d-flex flex-column">
                <span class="caption font-weight-medium">{{
                  item.invoice_no
                }}</span>
              </div>
            </template>

            <!-- Customer -->
            <template v-slot:[`item.customer_name`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2"
                  >mdi-account</v-icon
                > -->
                <span class="caption font-weight-medium">{{
                  item.customer_name
                }}</span>
              </div>
            </template>

            <!-- Date -->
            <template v-slot:[`item.invoice_date`]="{ item }">
              <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="primary" class="mr-2"
                    >mdi-calendar</v-icon
                  > -->
                <span class="caption">{{ item.invoice_date }}</span>
              </div>
            </template>

            <!-- Total Amount -->
            <template v-slot:[`item.total_cost`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption font-weight-medium">
                  {{
                    generalSettings.billing_currency == undefined
                      ? " "
                      : generalSettings.billing_currency == "None"
                      ? " "
                      : generalSettings.billing_currency == "INR"
                      ? "₹"
                      : generalSettings.billing_currency == "USD"
                      ? "$"
                      : generalSettings.billing_currency == "EUR"
                      ? "€"
                      : generalSettings.billing_currency == "GBP"
                      ? "£"
                      : generalSettings.billing_currency == "JPY"
                      ? "¥"
                      : generalSettings.billing_currency == "CAD"
                      ? "CA$"
                      : generalSettings.billing_currency == "AUD"
                      ? "A$"
                      : generalSettings.billing_currency == "CHF"
                      ? "CHF"
                      : generalSettings.billing_currency == "CNY"
                      ? "CN¥"
                      : generalSettings.billing_currency
                  }}
                  {{ formatAmount(item.total_cost) }}</span
                >
              </div>
            </template>

            <!-- Status -->
            <template v-slot:[`item.order_status`]="{ item }">
              <div class="d-flex align-center">
                <span 
                  :class="{
                    'status-generated': item.order_status === 'GENERATED',
                    'status-converted': item.order_status === 'CONVERTED',
                    'status-cancelled': item.order_status === 'CANCELLED',
                    'status-expired': item.order_status === 'EXPIRED',
                    'status-na': !item.order_status || item.order_status === 'N/A',
                  }"
                  class="caption font-weight-medium"
                >
                  {{
                    item.order_status == "GENERATED"
                      ? "Generated"
                      : item.order_status == "CONVERTED"
                      ? item.order_status_type
                      : item.order_status == "CANCELLED"
                      ? "Cancelled"
                      : item.order_status == "EXPIRED"
                      ? "Expired"
                      : "N/A"
                  }}
                </span>
              </div>
            </template>

            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="primary"
                    v-bind="props"
                    class=""
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-if="item.order_status != 'CONVERTED'"
                    @click="editQuotation(item)"
                    prepend-icon="mdi-pencil"
                    title="Edit Quotation"
                  />
                  <v-list-item  @click="viewQuotation(item)"
                  prepend-icon="mdi-eye" title="View Quotation" />
                  <v-list-item
                    v-if="item.order_status != 'CONVERTED'"
                    @click="convertPerform(item)"
                    prepend-icon="mdi-check-circle"
                    title="Convert Proform"
                  />
                  <v-list-item
                    v-if="item.order_status != 'CONVERTED'"
                    @click="convertSaleOrder(item)"
                    prepend-icon="mdi-file-document"
                    title="Convert Sale Order"
                  />
                  <v-list-item
                    v-if="item.order_status != 'CONVERTED'"
                    @click="convertInvoice(item)"
                    prepend-icon="mdi-receipt"
                    title="Convert Invoice"
                  />
                </v-list>
              </v-menu>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalItems === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${totalItems} quotations`
              }}
            </div>
            <div class="pagination-controls">
              <v-btn
                :disabled="currentPage === 1"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage - 1"
                style="color: #666 !important"
              >
                Previous
              </v-btn>
              <div class="page-numbers">
                <v-btn
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === currentPage ? 'elevated' : 'text'"
                  size="small"
                  :class="
                    page === currentPage ? 'active-page' : 'inactive-page'
                  "
                  @click="currentPage = page"
                  :style="
                    page === currentPage
                      ? 'background: #DB4C77 !important; color: white !important;'
                      : 'color: #666 !important;'
                  "
                >
                  {{ page }}
                </v-btn>
              </div>
              <v-btn
                :disabled="currentPage === pageCount"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage + 1"
                style="color: #666 !important"
              >
                Next
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Create Quotation Dialog -->
    <CreateQuotationDialog
      v-model="showCreateDialog"
      :salesPurchaseConfig="salesPurchaseConfig"
      @successMsg="handleSuccess"
      @errorMsg="handleError"
    />

    <!-- Edit Quotation Dialog -->
    <EditQuotationDialog
      v-model="showEditDialog"
      :quotationData="selectedQuotation"
      :salesPurchaseConfig="salesPurchaseConfig"
      @successMsg="handleEditSuccess"
      @errorMsg="handleError"
    />

    <!-- Quotation Preview Dialog -->
    <QuotationPreviewDialog
      v-model="showPreviewDialog"
      :quotationData="selectedQuotation"
      :entityData="selectedEntity"
      :salesPurchaseConfig="salesPurchaseConfig"
    />

    <!-- Create Proforma Dialog -->
    <CreateProformaDialog
      v-model="showProformaDialog"
      :salesPurchaseConfig="salesPurchaseConfig"
      :quotationData="selectedQuotation"
      :isEditMode="true"
      @successMsg="handleProformaSuccess"
      @errorMsg="handleError"
    />

    <!-- Create Sales Order Dialog -->
    <CreateSalesOrderDialog
      :dialog="showSalesOrderDialog"
      @update:dialog="showSalesOrderDialog = $event"
      @clicked="showSalesOrderDialog = false"
      :salesPurchaseConfig="salesPurchaseConfig"
      :quotationData="selectedQuotation"
      :isEditMode="true"
      @successMsg="handleSalesOrderSuccess"
      @errorMsg="handleError"
    />

    <!-- Add Sale Dialog -->
    <AddSaleDialog
      v-model="showAddSaleDialog"
      :salesPurchaseConfig="salesPurchaseConfig"
      :quotationData="selectedQuotation"
      :isEditMode="true"
      @successMsg="handleAddSaleSuccess"
      @errorMsg="handleError"
    />

    <!-- Quotation Success Dialog -->
    <GlobalSuccessDialog
      v-model="showSuccessDialog"
      :documentData="successQuotationData"
      :config="quotationSuccessConfig"
      @view-document="handleSuccessViewQuotation"
    />

    <!-- Proforma Success Dialog -->
    <GlobalSuccessDialog
      v-model="showProformaSuccessDialog"
      :documentData="successProformaData"
      :config="proformaSuccessConfig"
      @view-document="handleSuccessViewProforma"
    />

    <!-- Sales Order Success Dialog -->
    <GlobalSuccessDialog
      v-model="showSalesOrderSuccessDialog"
      :documentData="successSalesOrderData"
      :config="salesOrderSuccessConfig"
      @view-document="handleSuccessViewSalesOrder"
    />

    <!-- Invoice Success Dialog -->
    <GlobalSuccessDialog
      v-model="showInvoiceSuccessDialog"
      :documentData="successInvoiceData"
      :config="invoiceSuccessConfig"
      @view-document="handleSuccessViewInvoice"
    />

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_sales_purchase_config } from "@/mixins/GetSalesPurchaseConfig.js";
import CreateQuotationDialog from "./CreateQuotationDialog.vue";
import EditQuotationDialog from "./EditQuotationDialog.vue";
import QuotationPreviewDialog from "./QuotationPreviewDialog.vue";
import { list_sale_order_quotations } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { get_organization_entity } from "@/mixins/GetOrganizationEntity.js";
import CreateProformaDialog from "./CreateProformaDialog.vue";
import CreateSalesOrderDialog from "./CreateSalesOrderDialog.vue";
import AddSaleDialog from "./InvoiceComponents/AddSaleDialog.vue";
import GlobalSuccessDialog from "../Common/GlobalSuccessDialog.vue";
export default {
  name: "Quotation",
  components: {
    CreateQuotationDialog,
    EditQuotationDialog,
    QuotationPreviewDialog,
    SnackBar,
    CreateProformaDialog,
    CreateSalesOrderDialog,
    AddSaleDialog,
    GlobalSuccessDialog,
  },
  mixins: [get_organization_entity, get_sales_purchase_config],
  props: {
    dialog: Boolean,
  },
  data() {
    return {
      generalSettings: {},
      SnackBarComponent: {},
      selectedEntity: {},
      showCreateDialog: false,
      showEditDialog: false,
      showPreviewDialog: false,
      showProformaDialog: false,
      showSalesOrderDialog: false,
      showAddSaleDialog: false,
      selectedQuotation: {},
      showSuccessDialog: false,
      successQuotationData: {},
      showProformaSuccessDialog: false,
      successProformaData: {},
      showSalesOrderSuccessDialog: false,
      successSalesOrderData: {},
      showInvoiceSuccessDialog: false,
      successInvoiceData: {},
      quotationSuccessConfig: {
        title: "Quotation Generated Successfully!",
        subtitle: "Your quotation has been created and is ready for use.",
        documentType: "Quotation",
        documentNumberLabel: "Quotation No",
        detailsTitle: "Quotation Details",
        detailsIcon: "mdi-file-document",
        viewButtonText: "View Quotation",
        successMessage: "You can now view, edit, or share this quotation.",
        statusField: "quotation_status",
        statusFallbackField: "order_status",
        theme: "quotation",
        partyLabel: "Customer",
        partyField: "customer_name"
      },
      proformaSuccessConfig: {
        title: "Proforma Generated Successfully!",
        subtitle: "Your proforma has been created and is ready for use.",
        documentType: "Proforma",
        documentNumberLabel: "Proforma No",
        detailsTitle: "Proforma Details",
        detailsIcon: "mdi-file-document-outline",
        viewButtonText: "View Proforma",
        successMessage: "You can now view, edit, or convert this proforma to an invoice.",
        statusField: "proforma_order_staus",
        statusFallbackField: "order_status",
        theme: "proforma",
        partyLabel: "Customer",
        partyField: "customer_name"
      },
      salesOrderSuccessConfig: {
        title: "Sales Order Generated Successfully!",
        subtitle: "Your sales order has been created and is ready for use.",
        documentType: "Sales Order",
        documentNumberLabel: "Sales Order No",
        detailsTitle: "Sales Order Details",
        detailsIcon: "mdi-file-document-multiple",
        viewButtonText: "View Sales Order",
        successMessage: "You can now view, edit, or process this sales order.",
        statusField: "order_status",
        statusFallbackField: "quotation_status",
        theme: "default",
        partyLabel: "Customer",
        partyField: "customer_name"
      },
      invoiceSuccessConfig: {
        title: "Invoice Generated Successfully!",
        subtitle: "Your invoice has been created and is ready for use.",
        documentType: "Invoice",
        documentNumberLabel: "Invoice No",
        detailsTitle: "Invoice Details",
        detailsIcon: "mdi-receipt",
        viewButtonText: "View Invoice",
        successMessage: "You can now view, edit, or send this invoice to your customer.",
        statusField: "order_status",
        statusFallbackField: "quotation_status",
        theme: "invoice",
        partyLabel: "Customer",
        partyField: "customer_name"
      },
      tableLoading: false,
      tableData: [],
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,
      headers: [
        {
          title: "Quotation No",
          key: "invoice_no",
          sortable: false,
          width: "200px",
        },
        {
          title: "Customer",
          key: "customer_name",
          sortable: false,
          width: "200px",
        },
        { title: "Date", key: "invoice_date", sortable: false, width: "150px" },
        {
          title: "Total Amount",
          key: "total_cost",
          sortable: false,
          width: "150px",
        },
        {
          title: "Transaction Status",
          key: "order_status",
          sortable: false,
          width: "120px",
        },

        { title: "Actions", key: "actions", sortable: false, width: "120px" },
      ],
    };
  },

  computed: {
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  async mounted() {
    this.windowHeight = window.innerHeight - 280;
    this.tableLoading = true;
    await this.get_sales_purchase_config();
    this.loadQuotations();
    await this.get_organization_entity();
    // console.log("Raw entitylist:", this.entitylist);
    let entity = this.entitylist.find((entity) => entity.is_default === true);
    // console.log("Entity:", entity);
    this.selectedEntity = entity;
    
    this.generalSettings = this.salesPurchaseConfig.find(
      (config) => config.config_type === "GENERAL"
    );
    // console.log(
    //   "Sales Purchase Config:",
    //   this.generalSettings.billing_currency
    // );
  },

  methods: {
    // Method to expose dialog functionality to parent component
    openCreateDialog() {
      this.showCreateDialog = true;
    },
    viewQuotation(item) {
      this.selectedQuotation = item;
      this.showPreviewDialog = true;
    },

    handleSuccess(message,data) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadQuotations();
      // console.log("data",data); // Reload quotations after successful creation
      
      // Store the quotation data and show success dialog
      this.successQuotationData = data;
      this.showSuccessDialog = true;
    },

    handleEditSuccess(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadQuotations(); // Reload quotations after successful edit
      this.selectedQuotation = {}; // Reset selected quotation
    },

    handleProformaSuccess(message, data) {
      // console.log("data",data);
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadQuotations(); // Reload quotations after successful proforma creation
      this.selectedQuotation = {}; // Reset selected quotation
      this.showProformaDialog = false; // Close the proforma dialog
      
      // Store the proforma data and show success dialog
      if (data) {
        this.successProformaData = data;
        this.showProformaSuccessDialog = true;
      }
    },

    handleSalesOrderSuccess(message, data) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadQuotations(); // Reload quotations after successful conversion
      this.selectedQuotation = {}; // Reset selected quotation
      this.showSalesOrderDialog = false; // Close the sales order dialog
      
      // Store the sales order data and show success dialog
      if (data) {
        this.successSalesOrderData = data;
        this.showSalesOrderSuccessDialog = true;
      }
    },

    handleAddSaleSuccess(message, data) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadQuotations(); // Reload quotations after successful conversion
      this.selectedQuotation = {}; // Reset selected quotation
      this.showAddSaleDialog = false; // Close the invoice dialog
      
      // Store the invoice data and show success dialog
      if (data) {
        this.successInvoiceData = data;
        this.showInvoiceSuccessDialog = true;
      }
    },

    handleError(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
    },

    async loadQuotations() {
      // Simulate loading quotations data
      try {
        this.tableLoading = true;
        const response = await API.graphql(
          graphqlOperation(list_sale_order_quotations, {
            input: { transaction_type: "QUOTATION" },
          })
        );
        // console.log("Response:", response);
        let result = JSON.parse(response.data.list_sale_order_quotations);
        // console.log("Result:", result);
        if (result.Status === "SUCCESS") {
          this.tableData = result.data;
          // console.log("Table Data:", this.tableData);
          this.totalItems = result.data.length;
        } else {
          this.tableData = [];
          this.totalItems = 0;
        }
        this.tableLoading = false;
      } catch (error) {
        console.error("Error loading quotations:", error);
        this.tableData = [];
        this.totalItems = 0;
        this.tableLoading = false;
      }
    },

    handleClick(click, value) {
      // Handle row click if needed
      // console.log("Row clicked:", value.item);
    },

    editQuotation(item) {
      // console.log("Edit quotation:", item);
      this.selectedQuotation = item;
      this.showEditDialog = true;
    },

    convertPerform(item) {
      // console.log("Convert perform:", item);
      this.selectedQuotation = item;
      this.showProformaDialog = true;
    },

    convertSaleOrder(item) {
      // console.log("Convert sale order:", item);
      // console.log("Convert sale order:", item);
      this.selectedQuotation = item;
      this.showSalesOrderDialog = true;
      // console.log("showSalesOrderDialog", this.showSalesOrderDialog);
    },

    convertInvoice(item) {
      // console.log("Convert invoice:", item);
      // console.log(this.salesPurchaseConfig)
      this.selectedQuotation = item;
      this.showAddSaleDialog = true;
    },

    deleteQuotation(item) {
      // console.log("Delete quotation:", item);
      // Implement delete logic
    },

    getStatusColor(status) {
      switch (status) {
        case "GENERATED":
          return "success";
        case "CONVERTED":
          return "info";

        default:
          return "grey";
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case "GENERATED":
          return "mdi-pencil";
        case "CONVERTED":
          return "mdi-send";
        case "CANCELLED":
          return "mdi-check-circle";
        case "EXPIRED":
          return "mdi-close-circle";
        default:
          return "mdi-help-circle";
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

    handleViewQuotationFromSuccess(quotation) {
      this.selectedQuotation = quotation;
      this.showPreviewDialog = true;
    },

    // Method to handle view quotation from success dialog
    handleSuccessViewQuotation(quotation) {
      this.selectedQuotation = quotation;
      this.showPreviewDialog = true;
      this.showSuccessDialog = false; // Close success dialog
    },

    // Method to handle view proforma from success dialog
    handleSuccessViewProforma(proforma) {
      this.selectedQuotation = proforma;
      this.showProformaDialog = true;
      this.showProformaSuccessDialog = false; // Close proforma success dialog
    },

    // Method to handle view sales order from success dialog
    handleSuccessViewSalesOrder(salesOrder) {
      this.selectedQuotation = salesOrder;
      this.showSalesOrderDialog = true;
      this.showSalesOrderSuccessDialog = false; // Close sales order success dialog
    },

    // Method to handle view invoice from success dialog
    handleSuccessViewInvoice(invoice) {
      this.selectedQuotation = invoice;
      this.showAddSaleDialog = true;
      this.showInvoiceSuccessDialog = false; // Close invoice success dialog
    },
  },
};
</script>

<style scoped>
/* Card Container */
.card-container {
  position: relative;
}

/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.footer-info {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-width: 80px !important;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.active-page {
  background: #db4c77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
}

.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}

/* Status color styling */
.status-generated {
  color: #28a745;
  font-weight: 600;
  background-color: #d4edda;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #c3e6cb;
}

.status-converted {
  color: #007bff;
  font-weight: 600;
  background-color: #d1ecf1;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #bee5eb;
}

.status-cancelled {
  color: #dc3545;
  font-weight: 600;
  background-color: #f8d7da;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #f5c6cb;
}

.status-expired {
  color: #ffc107;
  font-weight: 600;
  background-color: #fff3cd;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #ffeaa7;
}

.status-na {
  color: #6c757d;
  font-weight: 600;
  background-color: #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid #dee2e6;
}
</style>
