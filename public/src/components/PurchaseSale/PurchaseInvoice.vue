<template>
  <div>
    <!-- Purchase Invoice List View -->
    <div class="pa-4">
      <!-- Summary Cards Section -->
      <div class="summary-cards mb-4">
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card
              class="summary-card received-card"
              elevation="1"
              @click="filterByStatus('Received')"
            >
              <v-card-text class="text-center pa-1">
                <v-icon size="20" class="mb-1" color="success"
                  >mdi-check-circle</v-icon
                >
                <div class="text-h5 font-weight-bold mb-1">
                  {{
                    (generalSettings?.billing_currency || "INR") === "INR"
                      ? "₹"
                      : (generalSettings?.billing_currency || "INR") === "USD"
                      ? "$"
                      : (generalSettings?.billing_currency || "INR") === "EUR"
                      ? "€"
                        : (generalSettings?.billing_currency || "INR") === "GBP"
                      ? "£"
                      : (generalSettings?.billing_currency || "INR") === "JPY"
                      ? "¥"
                      : (generalSettings?.billing_currency || "INR") === "CAD"
                      ? "CA$"
                      : (generalSettings?.billing_currency || "INR") === "AUD"
                      ? "A$"
                      : (generalSettings?.billing_currency || "INR") === "CHF"
                      ? "CHF"
                      : (generalSettings?.billing_currency || "INR") === "CNY"
                      ? "CN¥"
                      : " "
                  }}{{ formatAmount(summaryData.received_cost) }}
                </div>
                <div class="text-body-1 font-weight-medium">Paid Amount</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card
              class="summary-card balance-card"
              elevation="1"
              @click="filterByStatus('Balance')"
            >
              <v-card-text class="text-center pa-1">
                <v-icon size="20" class="mb-1" color="warning"
                  >mdi-account-balance-wallet</v-icon
                >
                <div class="text-h5 font-weight-bold mb-1">
                  {{
                    (generalSettings?.billing_currency || "INR") === "INR"
                      ? "₹"
                      : (generalSettings?.billing_currency || "INR") === "USD"
                      ? "$"
                      : (generalSettings?.billing_currency || "INR") === "EUR"
                      ? "€"
                        : (generalSettings?.billing_currency || "INR") === "GBP"
                      ? "£"
                      : (generalSettings?.billing_currency || "INR") === "JPY"
                      ? "¥"
                      : (generalSettings?.billing_currency || "INR") === "CAD"
                      ? "CA$"
                      : (generalSettings?.billing_currency || "INR") === "AUD"
                      ? "A$"
                      : (generalSettings?.billing_currency || "INR") === "CHF"
                      ? "CHF"
                      : (generalSettings?.billing_currency || "INR") === "CNY"
                      ? "CN¥"
                      : " "
                  }}{{ formatAmount(summaryData.balance_cost) }}
                </div>
                <div class="text-body-1 font-weight-medium">Balance Due</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-card
              class="summary-card total-card"
              elevation="1"
              @click="showAllInvoices()"
            >
              <v-card-text class="text-center pa-1">
                <v-icon size="20" class="mb-1" color="primary"
                  >mdi-receipt</v-icon
                >
                <div class="text-h5 font-weight-bold mb-1">
                  {{
                    (generalSettings?.billing_currency || "INR") === "INR"
                      ? "₹"
                      : (generalSettings?.billing_currency || "INR") === "USD"
                      ? "$"
                      : (generalSettings?.billing_currency || "INR") === "EUR"
                      ? "€"
                        : (generalSettings?.billing_currency || "INR") === "GBP"
                      ? "£"
                      : (generalSettings?.billing_currency || "INR") === "JPY"
                      ? "¥"
                      : (generalSettings?.billing_currency || "INR") === "CAD"
                      ? "CA$"
                      : (generalSettings?.billing_currency || "INR") === "AUD"
                      ? "A$"
                      : (generalSettings?.billing_currency || "INR") === "CHF"
                      ? "CHF"
                      : (generalSettings?.billing_currency || "INR") === "CNY"
                      ? "CN¥"
                      : " "
                  }}
                  {{ formatAmount(summaryData.total_cost) }}
                </div>
                <div class="text-body-1 font-weight-medium">Total Amount</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Invoice Table -->
      <v-card class="" flat>
        <v-card-text class="pa-4">
          <v-data-table
            :headers="headers"
            :items="paginatedItems"
            :loading="tableLoading"
            :sort-by="['created_date']"
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
                  >mdi-receipt-outline</v-icon
                >
                <div class="text-h6 text-grey mb-2">No Purchase Invoices Found</div>
                <div class="text-body-2 text-grey">
                  Create your first purchase invoice to get started
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
                <div class="text-body-2 text-grey">Loading purchase invoices...</div>
              </div>
            </template>
            <template v-slot:[`item.balance_cost`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption font-weight-medium">
                  {{
                    (generalSettings?.billing_currency || "INR") === "INR"
                      ? "₹"
                      : (generalSettings?.billing_currency || "INR") === "USD"
                      ? "$"
                      : (generalSettings?.billing_currency || "INR") === "EUR"
                      ? "€"
                      : (generalSettings?.billing_currency || "INR") === "GBP"
                      ? "£"
                      : (generalSettings?.billing_currency || "INR") === "JPY"
                      ? "¥"
                      : (generalSettings?.billing_currency || "INR") === "CAD"
                      ? "CA$"
                      : (generalSettings?.billing_currency || "INR") === "AUD"
                      ? "A$"
                      : (generalSettings?.billing_currency || "INR") === "CHF"
                      ? "CHF"
                      : (generalSettings?.billing_currency || "INR") === "CNY"
                      ? "CN¥"
                      : " "
                  }}
                  {{ formatAmount(item.balance_cost) }}
                </span>
              </div>
            </template>

            <!-- Invoice Number -->
            <template v-slot:[`item.invoice_no`]="{ item }">
              <div class="d-flex flex-column">
                <span class="caption font-weight-medium">{{
                  item.invoice_no
                }}</span>
              </div>
            </template>

            <!-- Vendor Name -->
            <template v-slot:[`item.supplier_name`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption font-weight-medium">{{
                  item.supplier_name
                }}</span>
              </div>
            </template>

            <!-- Invoice Date -->
            <template v-slot:[`item.invoice_date`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption">{{ item.invoice_date }}</span>
              </div>
            </template>

            <!-- Amount -->
            <template v-slot:[`item.total_cost`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption font-weight-medium">
                  {{
                    (generalSettings?.billing_currency || "INR") === "INR"
                      ? "₹"
                      : (generalSettings?.billing_currency || "INR") === "USD"
                      ? "$"
                      : (generalSettings?.billing_currency || "INR") === "EUR"
                      ? "€"
                      : (generalSettings?.billing_currency || "INR") === "GBP"
                      ? "£"
                      : (generalSettings?.billing_currency || "INR") === "JPY"
                      ? "¥"
                      : (generalSettings?.billing_currency || "INR") === "CAD"
                      ? "CA$"
                      : (generalSettings?.billing_currency || "INR") === "AUD"
                      ? "A$"
                      : (generalSettings?.billing_currency || "INR") === "CHF"
                      ? "CHF"
                      : (generalSettings?.billing_currency || "INR") === "CNY"
                      ? "CN¥"
                      : " "
                  }}
                  {{ formatAmount(item.total_cost) }}</span
                >
              </div>
            </template>

            <!-- Balance Due -->
            <template v-slot:[`item.balance_due`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="warning" class="mr-2"
                  >mdi-account-balance-wallet</v-icon
                >
                <span class="caption font-weight-medium"
                  >{{
                    (generalSettings?.billing_currency || "INR") === "INR"
                      ? "₹"
                      : (generalSettings?.billing_currency || "INR") === "USD"
                      ? "$"
                      : (generalSettings?.billing_currency || "INR") === "EUR"
                      ? "€"
                      : (generalSettings?.billing_currency || "INR") === "GBP"
                      ? "£"
                      : (generalSettings?.billing_currency || "INR") === "JPY"
                      ? "¥"
                      : (generalSettings?.billing_currency || "INR") === "CAD"
                      ? "CA$"
                      : (generalSettings?.billing_currency || "INR") === "AUD"
                      ? "A$"
                      : (generalSettings?.billing_currency || "INR") === "CHF"
                      ? "CHF"
                      : (generalSettings?.billing_currency || "INR") === "CNY"
                      ? "CN¥"
                      : " "
                  }}
                  {{ formatAmount(item.balance_due) }}</span
                >
              </div>
            </template>

            <!-- Due Date -->
            <template v-slot:[`item.due_date`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption">{{ item.due_date }}</span>
              </div>
            </template>

            <!-- Status -->
            <template v-slot:[`item.payment_status`]="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  size="16"
                  :color="getStatusColor(item.payment_status)"
                  class="mr-2"
                >
                  {{ getStatusIcon(item.payment_status) }}
                </v-icon>
                <v-chip
                  :color="getStatusColor(item.payment_status)"
                  size="small"
                  variant="flat"
                  class="caption"
                >
                  {{ item.payment_status == undefined ? "N/A" : item.payment_status.split("_").join(" ") }}
                </v-chip>
              </div>
            </template>
            <template v-slot:[`item.refrence_no`]="{ item }"> 
              <div class="d-flex flex-column">
                <span class="caption font-weight-medium" > {{
                  item.refrence_no == null || item.refrence_no == ""  || item.refrence_no == undefined ? "- " : item.refrence_no
                }}</span>
              </div>
            </template>

            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  color="primary"
                  @click.stop="viewInvoice(item)"
                  class=""
                  title="View"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalItems === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${totalItems} purchase invoices`
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
  </div>
  <!-- Create Purchase Invoice Dialog -->
  <AddPurchaseDialog
    v-model="createInvoiceDialog"
    :salesPurchaseConfig="salesPurchaseConfig"
    @successMsg="success_info"
    @errorMsg="error_info"
  />

  <!-- Edit Purchase Invoice Dialog -->


  <!-- Purchase Invoice Preview Dialog -->
  <PurchaseInvoicePreviewDialog
    v-model="showPreviewDialog"
    :invoiceData="selectedInvoice"
    :entityData="selectedEntity"
  />

  <!-- Invoice Success Dialog -->
  <GlobalSuccessDialog
    v-model="showInvoiceSuccessDialog"
    :documentData="successInvoiceData"
    :config="invoiceSuccessConfig"
    @view-document="handleSuccessViewInvoice"
  />

  <SnackBar :SnackBarComponent="SnackBarComponent" />
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import AddPurchaseDialog from "./InvoiceComponents/AddPurchaseDialog.vue";
import GlobalSuccessDialog from "../Common/GlobalSuccessDialog.vue";
import PurchaseInvoicePreviewDialog from "./PurchaseInvoicePreviewDialog.vue";
import { list_purchase_order_transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_organization_entity } from "@/mixins/GetOrganizationEntity.js";
import { get_sales_purchase_config } from "@/mixins/GetSalesPurchaseConfig.js";
export default {
  name: "PurchaseInvoice",
  components: {
    AddPurchaseDialog,
    GlobalSuccessDialog,
    PurchaseInvoicePreviewDialog,
    SnackBar,
  },
  mixins: [get_organization_entity, get_sales_purchase_config],
  data() {
    return {
      tableLoading: false,
      SnackBarComponent: {},
      tableData: [],
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,
      createInvoiceDialog: false,
      editInvoiceDialog: false,
      showPreviewDialog: false,
      selectedInvoice: {},
      selectedEntity: {},
      currentFilter: "all",
      showInvoiceSuccessDialog: false,
      successInvoiceData: {},
      invoiceSuccessConfig: {
        title: "Purchase Invoice Generated Successfully!",
        subtitle: "Your purchase invoice has been created and is ready for use.",
        documentType: "Purchase Invoice",
        documentNumberLabel: "Invoice No",
        detailsTitle: "Purchase Invoice Details",
        detailsIcon: "mdi-receipt",
        viewButtonText: "View Purchase Invoice",
        successMessage: "You can now view, edit, or process this purchase invoice.",
        statusField: "payment_status",
        statusFallbackField: "order_status",
        theme: "invoice",
        partyLabel: "Vendor",
        partyField: "supplier_name"
      },
      headers: [
        {
          title: "Invoice No",
          key: "invoice_no",
          sortable: false,
          width: "200px",
        },
        {
          title: "Reference No",
          key: "refrence_no",
          sortable: false,
          width: "200px",
        },
        {
          title: "Vendor",
          key: "supplier_name",
          sortable: false,
          width: "200px",
        },
        {
          title: "Invoice Date",
          key: "invoice_date",
          sortable: false,
          width: "150px",
        },
        { title: "Amount", key: "total_cost", sortable: false, width: "150px" },
        {
          title: "Balance Due",
          key: "balance_cost",
          sortable: false,
          width: "150px",
        },
        { title: "Due Date", key: "due_date", sortable: false, width: "150px" },
        {
          title: "Status",
          key: "payment_status",
          sortable: false,
          width: "120px",
        },
        { title: "Actions", key: "actions", sortable: false, width: "160px" },
      ],
      summaryData: {
        received_cost: 0,
        balance_cost: 0,
        total_cost: 0,
      },
      overallTransactions: null,
      generalSettings: {
         // Default currency
      },
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
    this.windowHeight = window.innerHeight - 400;
    this.tableLoading = true;
    await this.get_sales_purchase_config();
    this.loadInvoices();
    
    try {
      await this.get_organization_entity();
      let entity = this.entitylist.find((entity) => entity.is_default === true);
      this.selectedEntity = entity;
      
      if (this.salesPurchaseConfig && this.salesPurchaseConfig.length > 0) {
        const generalConfig = this.salesPurchaseConfig.find(
          (config) => config.config_type === "GENERAL"
        );
        if (generalConfig) {
          this.generalSettings = generalConfig;
        }
      }
    } catch (error) {
      console.warn("Error loading configuration:", error);
      // Keep default generalSettings
    }
  },

  methods: {
    // Method to expose dialog functionality to parent component
    openCreateDialog() {
      this.createInvoiceDialog = true;
    },

    // Method to expose preview dialog functionality to parent component
    openPreviewDialog(invoiceData) {
      this.selectedInvoice = invoiceData;
      this.showPreviewDialog = true;
    },

    createInvoice() {
      this.createInvoiceDialog = true;
    },

    async loadInvoices() {
      // Simulate loading invoices data
      try {
        this.tableLoading = true;
        const response = await API.graphql(
          graphqlOperation(list_purchase_order_transactions, {
            input: { transaction_type: "PURCHASE" },
          })
        );
        let result = JSON.parse(response.data.list_purchase_order_transactions);
        if (result.Status === "SUCCESS") {
          this.tableData = result.data;
          this.totalItems = this.tableData.length;
          this.overallTransactions = result.overal_transactions;
          this.updateSummaryData();
          this.tableLoading = false;
        } else {
          this.tableData = [];
          this.overallTransactions = result.overal_transactions || null;
          this.totalItems = 0;
          this.tableLoading = false;
        }
      } catch (error) {
        console.error("Error loading purchase invoices:", error);
        this.tableData = [];
        this.totalItems = 0;
        this.tableLoading = false;
      }
    },

    updateSummaryData() {
      // Update summary data from overall transactions
      if (this.overallTransactions) {
        this.summaryData.received_cost =
          this.overallTransactions.received_cost || 0;
        this.summaryData.balance_cost =
          this.overallTransactions.balance_cost || 0;
        this.summaryData.total_cost = this.overallTransactions.total_cost || 0;
      }
    },

    filterByStatus(status) {
      this.currentFilter = status;
      // Implement filtering logic here
    },

    showAllInvoices() {
      this.currentFilter = "all";
      // Show all invoices
    },

    handleClick(click, value) {
      // Handle row click if needed
    },

    viewInvoice(item) {
      this.selectedInvoice = item;
      this.showPreviewDialog = true;
    },

    editInvoice(item) {
      this.selectedInvoice = item;
      this.editInvoiceDialog = true;
    },

    deleteInvoice(item) {
      // Implement delete logic
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    success_info(val, data) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      // Refresh invoices list after successful creation
      this.loadInvoices();
      
      // Store the invoice data and show success dialog for CREATE operations
      if (data) {
        this.successInvoiceData = data;
        this.showInvoiceSuccessDialog = true;
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

    getStatusColor(status) {
      switch (status) {
        case "PARTIAL_PAID":
          return "warning";
        case "FULLY_PAID":
          return "success";
        case "NOT_PAID":
          return "info";
        default:
          return "grey";
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case "PARTIAL_PAID":
          return "mdi-clock-outline";
        case "FULLY_PAID":
          return "mdi-check-circle";
        case "NOT_PAID":
          return "mdi-close-circle";
        default:
          return "mdi-help-circle";
      }
    },

    handleSuccessViewInvoice(invoice) {
      this.showInvoiceSuccessDialog = false;
      this.selectedInvoice = invoice;
      this.showPreviewDialog = true;
    },
  },
};
</script>

<style scoped>
/* Summary Cards */
.summary-cards {
  margin-bottom: 16px;
}

.summary-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  overflow: hidden;
  min-height: 80px;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.received-card {
  background: #e8f5e8;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.balance-card {
  background: #fff3e0;
  color: #ef6c00;
  border: 1px solid #ffcc02;
}

.total-card {
  background: #e3f2fd;
  color: #1565c0;
  border: 1px solid #bbdefb;
}

.summary-card .v-card-text {
  padding: 8px;
}

.summary-card .text-h5 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1px;
}

.summary-card .text-body-1 {
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 1px;
}

.summary-card .text-caption {
  opacity: 0.9;
  font-size: 0.7rem;
}

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

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .summary-cards .v-col {
    margin-bottom: 16px;
  }

  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>
