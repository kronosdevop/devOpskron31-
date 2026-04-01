<template>
  <div>
    <!-- Proforma List View -->
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
                <div class="text-h6 text-grey mb-2">No Proforma Found</div>
                <div class="text-body-2 text-grey">
                  Create your first proforma to get started.
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
                <div class="text-body-2 text-grey">Loading proforma...</div>
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
            <template v-slot:[`item.refrence_no`]="{ item }">
              <div class="d-flex flex-column">
                <span class="caption font-weight-medium" > {{
                  item.refrence_no == null || item.refrence_no == ""  || item.refrence_no == undefined ? "- " : item.refrence_no
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
            <template v-slot:[`item.proforma_order_staus`]="{ item }">
              <span
                :class="{
                  'status-generated': item.proforma_order_staus === 'GENERATED',
                  'status-converted': item.proforma_order_staus === 'CONVERTED',
                  'status-cancelled': item.proforma_order_staus === 'CANCELLED',
                  'status-expired': item.proforma_order_staus === 'EXPIRED',
                  'status-na':
                    !item.proforma_order_staus || item.proforma_order_staus === 'N/A',
                }"
              >
                {{
                  item.proforma_order_staus == "GENERATED"
                    ? "Generated"
                    : item.proforma_order_staus == "CONVERTED"
                    ? "Converted"
                    : item.proforma_order_staus == "CANCELLED"
                    ? "Cancelled"
                    : item.proforma_order_staus == "EXPIRED"
                    ? "Expired"
                    : "N/A"
                }}
              </span>
            </template>
            <!-- Transaction Status -->
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
                    @click="editProforma(item)"
                    prepend-icon="mdi-pencil"
                    title="Edit Proforma"
                  />
                  <v-list-item
                    @click="viewProforma(item)"
                    prepend-icon="mdi-eye"
                    title="View Proforma"
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
                  : `Showing ${paginatedItems.length} of ${totalItems} proforma`
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

    <!-- Create Proforma Dialog -->
    <CreateProformaDialog
      v-model="showCreateDialog"
      :salesPurchaseConfig="salesPurchaseConfig"
      @successMsg="handleSuccess"
      @errorMsg="handleError"
    />

    <!-- Edit Proforma Dialog -->
    <EditProformaDialog
      v-model="showEditDialog"
      :proformaData="selectedProforma"
      :salesPurchaseConfig="salesPurchaseConfig"
      @successMsg="handleEditSuccess"
      @errorMsg="handleError"
    />

    <!-- Proforma Preview Dialog -->
    <ProformaPreviewDialog
      v-model="showPreviewDialog"
      :proformaData="selectedProforma"
      :entityData="selectedEntity"
      :salesPurchaseConfig="salesPurchaseConfig"
    />

    <!-- Add Sale Dialog -->
    <AddSaleDialog
      v-model="showAddSaleDialog"
      :salesPurchaseConfig="salesPurchaseConfig"
      :quotationData="selectedProforma"
      :isEditMode="true"
      @successMsg="handleAddSaleSuccess"
      @errorMsg="error_info"
    />

    <!-- Proforma Success Dialog -->
    <GlobalSuccessDialog
      v-model="showSuccessDialog"
      :documentData="successProformaData"
      :config="proformaSuccessConfig"
      @view-document="handleSuccessViewProforma"
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
import CreateProformaDialog from "./CreateProformaDialog.vue";
import EditProformaDialog from "./EditProformaDialog.vue";
import ProformaPreviewDialog from "./PorformaPreviewDialog.vue";
import AddSaleDialog from "./InvoiceComponents/AddSaleDialog.vue";
import GlobalSuccessDialog from "../Common/GlobalSuccessDialog.vue";
import { list_sale_order_quotations } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { get_organization_entity } from "@/mixins/GetOrganizationEntity.js";
export default {
  name: "Proforma",
  components: {
    CreateProformaDialog,
    EditProformaDialog,
    ProformaPreviewDialog,
    AddSaleDialog,
    GlobalSuccessDialog,
    SnackBar
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
      showAddSaleDialog: false,
      selectedProforma: {},
      showSuccessDialog: false,
      successProformaData: {},
      showInvoiceSuccessDialog: false,
      successInvoiceData: {},
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
        statusFallbackField: "proforma_order_staus",
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
          title: "Proforma No",
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
    this.loadProformas();
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
    viewProforma(item) {
      this.selectedProforma = item;
      this.showPreviewDialog = true;
    },

    handleSuccess(message, data) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadProformas(); // Reload proforma after successful creation
      
      // Store the proforma data and show success dialog
      this.successProformaData = data;
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
      this.loadProformas(); // Reload proforma after successful edit
      this.selectedProforma = {}; // Reset selected proforma
    },

    handleAddSaleSuccess(message, data) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadProformas(); // Reload proformas after successful invoice creation
      this.selectedProforma = {}; // Reset selected proforma
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

    async loadProformas() {
      // Simulate loading proforma data
      try {
        this.tableLoading = true;
        const response = await API.graphql(
          graphqlOperation(list_sale_order_quotations, {
            input: { transaction_type: "PROFORMA" },
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
        console.error("Error loading proforma:", error);
        this.tableData = [];
        this.totalItems = 0;
        this.tableLoading = false;
      }
    },

    handleClick(click, value) {
      // Handle row click if needed
      // console.log("Row clicked:", value.item);
    },

    editProforma(item) {
      // console.log("Edit proforma:", item);
      this.selectedProforma = item;
      this.showEditDialog = true;
    },
    convertInvoice(item) {
      // console.log("Convert invoice:", item);
      this.selectedProforma = item;
      this.showAddSaleDialog = true;
    },
    deleteProforma(item) {
      // console.log("Delete proforma:", item);
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

    // Method to handle view proforma from success dialog
    handleSuccessViewProforma(proforma) {
      this.selectedProforma = proforma;
      this.showPreviewDialog = true;
      this.showSuccessDialog = false; // Close success dialog
    },

    // Method to handle view invoice from success dialog
    handleSuccessViewInvoice(invoice) {
      this.selectedProforma = invoice;
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
