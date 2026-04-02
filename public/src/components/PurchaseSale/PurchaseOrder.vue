<template>
  <div>
    <!-- Purchase Order List View -->
    <div class="pa-4">
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
                  >mdi-file-document-outline</v-icon
                >
                <div class="text-h6 text-grey mb-2">
                  No Purchase Orders Found
                </div>
                <div class="text-body-2 text-grey">
                  Create your first purchase order to get started
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
                <div class="text-body-2 text-grey">
                  Loading purchase orders...
                </div>
              </div>
            </template>

            <!-- Order Number -->
            <template v-slot:[`item.invoice_no`]="{ item }">
              <div class="d-flex flex-column">
                <span class="caption font-weight-medium">{{
                  item.invoice_no
                }}</span>
              </div>
            </template>

            <!-- Supplier -->
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

            <!-- Order Date -->
            <template v-slot:[`item.invoice_date`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                >
                <span class="caption">{{ item.invoice_date }}</span>
              </div>
            </template>

            <!-- Total Amount -->
            <template v-slot:[`item.total_cost`]="{ item }">
              <div class="d-flex align-center">
                <span class="caption font-weight-medium"
                  >₹ {{ formatAmount(item.total_cost) }}</span
                >
              </div>
            </template>

            <!-- Order Status -->
            <template v-slot:[`item.order_status`]="{ item }">
              <div class="d-flex align-center">
                <span
                  :class="{
                    'status-generated': item.order_status === 'GENERATED',
                    'status-converted': item.order_status === 'CONVERTED',
                    'status-cancelled': item.order_status === 'CANCELLED',
                    'status-expired': item.order_status === 'EXPIRED',
                    'status-na':
                      !item.order_status || item.order_status === 'N/A',
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

            <!-- Reference No -->
            <template v-slot:[`item.refrence_no`]="{ item }">
              <div class="d-flex flex-column">
                <span class="caption font-weight-medium">
                  {{
                    item.refrence_no == null ||
                    item.refrence_no == "" ||
                    item.refrence_no == undefined
                      ? "- "
                      : item.refrence_no
                  }}</span
                >
              </div>
            </template>

            <!-- Payment Status -->
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
                  {{
                    item.payment_status == undefined
                      ? "N/A"
                      : item.payment_status == "PARTIAL"
                      ? "Partial"
                      : "Full"
                  }}
                </v-chip>
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
                    @click="viewOrder(item)"
                    prepend-icon="mdi-eye"
                    title="View Purchase Order"
                  />
                  <v-list-item
                    v-if="
                      item.order_status != 'CONVERTED' &&
                      (item.created_by ===
                        $store.getters.GetUserObj.user?.user_name ||
                        ['ADMIN', 'OWNER'].includes(
                          $store.getters.GetUserObj.user?.user_type
                        ))
                    "
                    @click="editOrder(item)"
                    prepend-icon="mdi-pencil"
                    title="Edit Purchase Order"
                  />
                  <v-list-item
                    v-if="item.order_status != 'CONVERTED'"
                    @click="convertPurchaseInvoice(item)"
                    prepend-icon="mdi-receipt"
                    title="Convert to Purchase Invoice"
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
                  : `Showing ${paginatedItems.length} of ${totalItems} purchase orders`
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

    <!-- Create Purchase Order Dialog -->
    <CreatePurchaseOrderDialog
      :dialog="createOrderDialog"
      :salesPurchaseConfig="salesPurchaseConfig"
      @update:dialog="createOrderDialog = $event"
      @clicked="createOrderDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <EditPurchaseOrderDialog
      v-model="editOrderDialog"
      :salesOrderData="selectedPurchaseOrder"
      :salesPurchaseConfig="salesPurchaseConfig"
      @successMsg="handleEditSuccess"
      @errorMsg="error_info"
    />

    <!-- Purchase Order Success Dialog -->
    <GlobalSuccessDialog
      v-model="showPurchaseOrderSuccessDialog"
      :documentData="successPurchaseOrderData"
      :config="purchaseOrderSuccessConfig"
      @view-document="handleSuccessViewPurchaseOrder"
    />

    <!-- Purchase Order Preview Dialog -->
    <PurchaseOrderPreviewDialog
      v-model="showPurchaseOrderPreviewDialog"
      :orderData="previewPurchaseOrderData"
      :entityData="previewEntityData"
    />

    <!-- Add Purchase Dialog -->
    <AddPurchaseDialog
      v-model="showAddPurchaseDialog"
      :salesPurchaseConfig="salesPurchaseConfig"
      :quotationData="selectedPurchaseOrderForInvoice"
      :isEditMode="true"
      @successMsg="handleAddPurchaseSuccess"
      @errorMsg="error_info"
    />
  </div>
</template>

<script>
import EditPurchaseOrderDialog from "./EditPurchaseOrderDialog.vue";
import CreatePurchaseOrderDialog from "./CreatePurchaseOrderDialog.vue";
import AddPurchaseDialog from "./InvoiceComponents/AddPurchaseDialog.vue";
import { list_purchase_order_transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { get_organization_entity } from "@/mixins/GetOrganizationEntity.js";
import { get_sales_purchase_config } from "@/mixins/GetSalesPurchaseConfig.js";
import GlobalSuccessDialog from "../Common/GlobalSuccessDialog.vue";
import PurchaseOrderPreviewDialog from "./PurchaseOrderPreviewDialog.vue";

export default {
  name: "PurchaseOrder",
  components: {
    CreatePurchaseOrderDialog,
    SnackBar,
    EditPurchaseOrderDialog,
    GlobalSuccessDialog,
    PurchaseOrderPreviewDialog,
    AddPurchaseDialog,
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
      createOrderDialog: false,
      selectedPurchaseOrder: {},
      editOrderDialog: false,
      selectedEntity: {},
      showPurchaseOrderSuccessDialog: false,
      successPurchaseOrderData: {},
      showPurchaseOrderPreviewDialog: false,
      previewPurchaseOrderData: {},
      previewEntityData: {},
      showAddPurchaseDialog: false,
      selectedPurchaseOrderForInvoice: {},
      generalSettings: {
        billing_currency: " ", // Default currency
      },
      purchaseOrderSuccessConfig: {
        title: "Purchase Order Generated Successfully!",
        subtitle: "Your purchase order has been created and is ready for use.",
        documentType: "Purchase Order",
        documentNumberLabel: "Purchase Order No",
        detailsTitle: "Purchase Order Details",
        detailsIcon: "mdi-file-document-multiple",
        viewButtonText: "View Purchase Order",
        successMessage:
          "You can now view, edit, or process this purchase order.",
        statusField: "order_status",
        statusFallbackField: "payment_status",
        theme: "default",
        partyLabel: "Supplier",
        partyField: "supplier_name",
      },
      headers: [
        {
          title: "Order No",
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
          title: "Supplier",
          key: "supplier_name",
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
        // {
        //   title: "Status",
        //   key: "payment_status",
        //   sortable: false,
        //   width: "120px",
        // },
        {
          title: "Transaction Status",
          key: "order_status",
          sortable: false,
          width: "120px",
        },
        { title: "Actions", key: "actions", sortable: false, width: "160px" },
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

    try {
      // First get the sales purchase configuration
      await this.get_sales_purchase_config();

      // Then load purchase orders
      this.loadPurchaseOrders();

      // Get organization entity
      await this.get_organization_entity();
      let entity = this.entitylist.find((entity) => entity.is_default === true);
      this.selectedEntity = entity;

      // Set general settings from configuration
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
    }
  },

  methods: {
    // Method to expose dialog functionality to parent component
    openCreateDialog() {
      this.createOrderDialog = true;
    },

    // Method to expose dialog functionality to parent component (alias for consistency)
    openPurchaseOrderDialog() {
      this.createOrderDialog = true;
    },

    async loadPurchaseOrders() {
      try {
        this.tableLoading = true;
        const response = await API.graphql(
          graphqlOperation(list_purchase_order_transactions, {
            input: { transaction_type: "PURCHASE_ORDER" },
          })
        );
        let result = JSON.parse(response.data.list_purchase_order_transactions);
        if (result.Status === "SUCCESS") {
          this.tableData = result.data;
          this.totalItems = result.data.length;
          this.tableLoading = false;
        } else {
          this.tableData = [];
          this.totalItems = 0;
          this.tableLoading = false;
        }
      } catch (error) {
        console.error("Error loading purchase orders:", error);
        this.tableData = [];
        this.totalItems = 0;
        this.tableLoading = false;
      }
    },

    handleClick(click, value) {
      // Handle row click if needed
    },

    viewOrder(order) {
      this.selectedPurchaseOrder = order;
      this.previewPurchaseOrderData = order;
      this.previewEntityData = this.selectedEntity;
      this.showPurchaseOrderPreviewDialog = true;
    },

    editOrder(order) {
      this.selectedPurchaseOrder = order;
      this.editOrderDialog = true;
      // TODO: Implement edit functionality
    },

    convertPurchaseInvoice(order) {
      this.selectedPurchaseOrderForInvoice = order;
      this.showAddPurchaseDialog = true;
    },
    handleEditSuccess(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadPurchaseOrders();
      this.selectedPurchaseOrder = {};
      this.editOrderDialog = false;
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
      this.loadPurchaseOrders();

      // Store the purchase order data and show success dialog
      if (data) {
        this.successPurchaseOrderData = data;
        this.showPurchaseOrderSuccessDialog = true;
      }
    },

    formatAmount(amount) {
      if (!amount) return "0.00";
      return parseFloat(amount).toFixed(2);
    },

    getStatusColor(status) {
      switch (status) {
        case "PARTIAL":
          return "warning";
        case "FULL":
          return "success";
        default:
          return "grey";
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case "PARTIAL":
          return "mdi-clock-outline";
        case "FULL":
          return "mdi-check-circle";
        default:
          return "mdi-help-circle";
      }
    },

    // Method to handle view purchase order from success dialog
    handleSuccessViewPurchaseOrder(purchaseOrder) {
      this.selectedPurchaseOrder = purchaseOrder;
      this.previewPurchaseOrderData = purchaseOrder;
      this.previewEntityData = this.selectedEntity;
      this.showPurchaseOrderPreviewDialog = true;
      this.showPurchaseOrderSuccessDialog = false; // Close success dialog
    },

    handleAddPurchaseSuccess(message, data) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      this.loadPurchaseOrders(); // Reload purchase orders after successful invoice creation
      this.selectedPurchaseOrderForInvoice = {}; // Reset selected purchase order
      this.showAddPurchaseDialog = false; // Close the invoice dialog
    },
  },
};
</script>

<style scoped>
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

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
  color: #666;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.pagination-btn {
  color: #666 !important;
  font-size: 14px !important;
}

.active-page {
  background: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #666 !important;
}

.status-generated {
  color: #1976d2;
}

.status-converted {
  color: #388e3c;
}

.status-cancelled {
  color: #d32f2f;
}

.status-expired {
  color: #f57c00;
}

.status-na {
  color: #757575;
}
</style>
