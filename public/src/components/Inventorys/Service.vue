<template>
  <div class="product-container">
    <v-row>
      <!-- Left Panel: Service List -->
      <v-col cols="12" md="4">
        <v-card flat class="pa-4 overflow-y-auto">
          <!-- Header with Search and Add Service Button -->
          <div class="d-flex align-center justify-space-between mb-4">
            <v-text-field
              v-model="searchService"
              placeholder="Search services..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="product-search"
              clearable
            />

            <v-btn size="small" class="action-btn ml-2" @click="addService">
              <v-icon left>mdi-plus</v-icon>
              Add Service
            </v-btn>
          </div>

          <!-- Services Table -->
          <v-card flat class="overflow-y-auto" :height="windowHeight">
            <v-table class="products-table">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">SERVICE NAME</th>
                  <th class="text-left font-weight-bold">QUANTITY</th>
                  <th class="text-right"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredServices.length === 0">
                  <td colspan="3" class="text-center pa-8">
                    <div class="d-flex flex-column align-center">
                      <v-icon size="48" color="grey" class="mb-2"
                        >mdi-package-variant</v-icon
                      >
                      <span class="text-h6 text-grey">No services found</span>
                      <span class="text-body-2 text-grey"
                        >Try adjusting your search criteria</span
                      >
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="service in filteredServices"
                  :key="service.item_id"
                  :class="{
                    'selected-product':
                      selectedService?.item_id === service.item_id,
                  }"
                  @click="selectService(service)"
                  class="product-row"
                >
                  <td>{{ service.item_name }}</td>
                  <td>
                    <span
                      :style="{ color: getStockColor(service.stock_quantity) }"
                    >
                      {{
                        service.stock_quantity == ""
                          ? 0
                          : service.stock_quantity
                      }}
                    </span>
                  </td>
                  <td class="text-right">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          variant="text"
                          size="small"
                          v-bind="props"
                          @click.stop
                        ></v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="editService(service)">
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteService(service)">
                          <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-card>
      </v-col>
      <!-- Right Panel: Service Details and Transactions -->
      <v-col cols="12" md="8">
        <div v-if="selectedService">
  
          <!-- <v-card class="mb-2">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <h2 class="text-h5 font-weight-medium mr-2">
                    {{ selectedService.item_name }}
                  </h2>
                </div>
              </div>

              <v-row>
                <v-col cols="3">
                  <div class="mb-3">
                    <div class="text-caption text-grey">SALE PRICE</div>
                    <div class="text-h6 font-weight-medium">
                      ₹{{ selectedService.sale_price?.sale_price || 0 }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="3">
                  <div>
                    <div class="text-caption text-grey">PURCHASE PRICE</div>
                    <div class="text-h6 font-weight-medium">
                      ₹{{ selectedService.purchase_price?.purchase_price || 0 }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="3">
                  <div class="mb-3">
                    <div class="text-caption text-grey">STOCK QUANTITY</div>
                    <div class="">
                      <span
                        class="text-h6 font-weight-medium"
                        :style="{
                          color: getStockColor(selectedService.stock_quantity),
                        }"
                        >{{ selectedService.stock_quantity || 0 }}</span
                      >
                    </div>
                  </div>
                </v-col>
                <v-col cols="3" class="text-right">
                  <div>
                    <div class="text-caption text-grey">STOCK VALUE</div>
                    <div class="text-h6 font-weight-medium">
                      ₹{{ selectedService.stock_value || 0 }}
                    </div>
                  </div>
                </v-col>
              </v-row>

            </v-card-text>
          </v-card> -->

          <!-- Transactions Section -->
          <v-card class="">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6 font-weight-medium">Service Transactions</h3>
                <div class="d-flex align-center">
                  <v-text-field
                    v-model="searchTransaction"
                    placeholder="Search transactions..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    width="250"
                  />
                </div>
              </div>

              <!-- Transactions Table -->
              <v-data-table
                :headers="transactionHeaders"
                :items="filteredTransactions"
                :loading="transactionLoading"
                :sort-by="['transaction_date']"
                :items-per-page="transactionItemsPerPage"
                :page="transactionCurrentPage"
                :server-items-length="totalTransactions"
                hide-default-footer
                :height="transactionTableHeight"
                class="modern-data-table"
                density="comfortable"
                hover
                :fixed-header="true"
                @update:sort-by="handleTransactionSortChange"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="48" color="grey" class="mb-2"
                      >mdi-receipt-text</v-icon
                    >
                    <div class="text-h6 text-grey">No transactions to show</div>
                    <div class="text-body-2 text-grey">
                      No transaction records available for this service.
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
                      Loading transactions...
                    </div>
                  </div>
                </template>

                <!-- Transaction Type Name -->
                <template v-slot:[`item.transaction_type_name`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon
                      size="16"
                      :color="
                        getTransactionTypeColor(item.transaction_type_name)
                      "
                      class="mr-2"
                    >
                      {{ getTransactionTypeIcon(item.transaction_type_name) }}
                    </v-icon>
                    <span class="caption font-weight-medium">{{
                      item.transaction_type_name
                    }}</span>
                  </div>
                </template>

                <!-- Transaction Type (CREDIT/DEBIT) -->
                <template v-slot:[`item.transaction_type`]="{ item }">
                  <v-chip
                    :color="
                      item.transaction_type === 'CREDIT' ? 'green' : 'red'
                    "
                    size="small"
                    variant="tonal"
                    class="text-none"
                  >
                    {{ item.transaction_type }}
                  </v-chip>
                </template>

                <!-- Transaction Name -->
                <template v-slot:[`item.transaction_name`]="{ item }">
                  <span class="caption font-weight-medium">{{
                    item.transaction_name
                  }}</span>
                </template>

                <!-- Transaction Date -->
                <template v-slot:[`item.transaction_date`]="{ item }">
                  <span class="caption font-weight-medium">{{
                    item.transaction_date || "N/A"
                  }}</span>
                </template>

                <!-- Stock Quantity -->
                <template v-slot:[`item.stock_quantity`]="{ item }">
                  <span
                    class="caption font-weight-medium"
                    :style="{ color: getStockColor(item.stock_quantity) }"
                    >{{ item.stock_quantity }}</span
                  >
                </template>

                <!-- Stock Value -->
                <template v-slot:[`item.stock_value`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="green" class="mr-2"
                      >mdi-currency-inr</v-icon
                    >
                    <span class="caption font-weight-medium">{{
                      item.stock_value
                    }}</span>
                  </div>
                </template>
                <template v-slot:[`item.transaction_details`]="{ item }">
                  <span>{{
                    item.transaction_details == undefined ||
                    item.transaction_details == null
                      ? "N/A"
                      : item.transaction_details
                  }}</span>
                </template>

                <!-- Tracking Type -->
                <template v-slot:[`item.tracking_type`]="{ item }">
                  <v-chip
                    color="blue"
                    size="small"
                    variant="tonal"
                    class="text-none"
                  >
                    {{ item.tracking_type }}
                  </v-chip>
                </template>
              </v-data-table>

              <!-- Table Footer with Pagination -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalTransactions === 0
                      ? "No Results"
                      : `Showing ${filteredTransactions.length} of ${totalTransactions} transactions`
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn
                    :disabled="transactionCurrentPage === 1"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="transactionCurrentPage = transactionCurrentPage - 1"
                    style="color: #666 !important"
                  >
                    Previous
                  </v-btn>
                  <div class="page-numbers">
                    <v-btn
                      v-for="page in visibleTransactionPages"
                      :key="page"
                      :variant="
                        page === transactionCurrentPage ? 'elevated' : 'text'
                      "
                      size="small"
                      :class="
                        page === transactionCurrentPage
                          ? 'active-page'
                          : 'inactive-page'
                      "
                      @click="transactionCurrentPage = page"
                      :style="
                        page === transactionCurrentPage
                          ? 'background: #DB4C77 !important; color: white !important;'
                          : 'color: #666 !important;'
                      "
                    >
                      {{ page }}
                    </v-btn>
                  </div>
                  <v-btn
                    :disabled="transactionCurrentPage === transactionPageCount"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="transactionCurrentPage = transactionCurrentPage + 1"
                    style="color: #666 !important"
                  >
                    Next
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- No Service Selected -->
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-package-variant</v-icon
          >
          <div class="text-h6 text-grey mb-2">No Service Selected</div>
          <div class="text-body-2 text-grey">
            Select a service from the list to view details and transactions.
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Service Dialog Component (for adding new services) -->
    <ServiceDialog
      :dialog="serviceDialog"
      :editing-service="null"
      @update:dialog="serviceDialog = $event"
      @clicked="serviceDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Edit Service Dialog Component -->
    <EditServiceDialog
      :dialog="editServiceDialog"
      :editing-service="editingService"
      @update:dialog="editServiceDialog = $event"
      @clicked="editServiceDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Delete Service Dialog Component -->
    <DeleteServiceDialog
      :deleteServiceDialog="deleteServiceDialog"
      :serviceItem="serviceToDelete"
      @clicked="deleteServiceDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Stock Adjustment Dialog -->
    <StockAdjustmentDialog
      :dialog="stockAdjustmentDialog"
      :selected-product="selectedService"
      @update:dialog="stockAdjustmentDialog = $event"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import ServiceDialog from "./ServiceDialog.vue";
import EditServiceDialog from "./EditServiceDialog.vue";
import DeleteServiceDialog from "./DeleteServiceDialog.vue";
import StockAdjustmentDialog from "./StockAdjustmentDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import { list_items, get_items_transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  name: "Service",
  components: {
    ServiceDialog,
    EditServiceDialog,
    DeleteServiceDialog,
    StockAdjustmentDialog,
    SnackBar,
  },
  data() {
    return {
      services: [],
      selectedService: null,
      searchService: "",
      serviceDialog: false,
      editServiceDialog: false,
      editingService: null,
      deleteServiceDialog: false,
      serviceToDelete: null,
      stockAdjustmentDialog: false,
      saving: false,
      windowHeight: 0,
      tableLoading: false,
      SnackBarComponent: {},
      // Transaction table properties
      searchTransaction: "",
      transactionLoading: false,
      transactionCurrentPage: 1,
      transactionItemsPerPage: 10,
      totalTransactions: 0,
      transactions: [], // Mock data for now
      transactionHeaders: [
        { title: "TYPE", value: "transaction_type_name", sortable: true },
        {
          title: "TRANSACTION TYPE",
          value: "transaction_type",
          sortable: true,
        },
        { title: "NAME", value: "transaction_details", sortable: true },
        { title: "DATE", value: "transaction_date", sortable: true },
        { title: "QUANTITY", value: "stock_quantity", sortable: true },
        { title: "STOCK VALUE", value: "stock_value", sortable: true },
        //  { title: "TRACKING", value: "tracking_type", sortable: true },
      ],
      transactionTableHeight: 0,
    };
  },
  computed: {
    filteredServices() {
      if (!this.searchService) return this.services;
      return this.services.filter(
        (service) =>
          service.item_name
            .toLowerCase()
            .includes(this.searchService.toLowerCase()) ||
          (service.stock_quantity &&
            service.stock_quantity
              .toLowerCase()
              .includes(this.searchService.toLowerCase()))
      );
    },
    // Transaction table computed properties
    filteredTransactions() {
      if (!this.searchTransaction) return this.transactions;
      const searchLower = this.searchTransaction.toLowerCase();
      return this.transactions.filter(
        (item) =>
          item.transaction_type_name?.toLowerCase().includes(searchLower) ||
          item.transaction_type?.toLowerCase().includes(searchLower) ||
          item.transaction_name?.toLowerCase().includes(searchLower) ||
          item.tracking_type?.toLowerCase().includes(searchLower)
      );
    },
    transactionPageCount() {
      return Math.ceil(this.totalTransactions / this.transactionItemsPerPage);
    },
    visibleTransactionPages() {
      const pages = [];
      const start = Math.max(1, this.transactionCurrentPage - 2);
      const end = Math.min(
        this.transactionPageCount,
        this.transactionCurrentPage + 2
      );
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  async mounted() {
    this.windowHeight = window.innerHeight - 290;
    this.transactionTableHeight = window.innerHeight - 300;
    await this.getServices();
    // Select first service by default
  },
  methods: {
    async getServices() {
      // Mock data for now - replace with actual API call
      try {
        const result = await API.graphql(graphqlOperation(list_items));
        // console.log(result);
        const resultData = JSON.parse(result.data.list_items);
        // console.log(resultData);
        if (resultData.Status == "SUCCESS") {
          this.services = resultData.data.filter(
            (item) => item.item_type === "SERVICE"
          );
          if (this.services.length > 0) {
            this.selectService(this.services[0]);
          }
        } else {
          this.services = [];
        }
      } catch (error) {
        this.services = [];
        console.log(error);
      }
    },

    selectService(service) {
      this.selectedService = service;
      this.loadTransactionData(); // Load transaction data when service is selected
    },

    addService() {
      this.editingService = null;
      this.serviceDialog = true;
    },

    editService(service) {
      this.editingService = service;
      // console.log(this.editingService, "editingService");
      this.editServiceDialog = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.services = [];
      this.selectedService = null;
      this.serviceDialog = false;
      this.editServiceDialog = false;
      this.deleteServiceDialog = false;
      this.getServices();
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

    deleteService(service) {
      this.serviceToDelete = service;
      this.deleteServiceDialog = true;
    },

    openStockAdjustment() {
      this.stockAdjustmentDialog = true;
    },

    // Transaction table methods
    handleTransactionSortChange(value) {
      // Implement sorting logic here
      // console.log("Transaction sort changed:", value);
    },

    getTransactionTypeColor(type) {
      switch (type?.toLowerCase()) {
        case "opening stock":
          return "blue";
        case "add adjustment":
          return "green";
        case "reduce adjustment":
          return "orange";
        case "purchase":
          return "purple";
        case "sale":
          return "teal";
        default:
          return "grey";
      }
    },

    getTransactionTypeIcon(type) {
      switch (type?.toLowerCase()) {
        case "opening stock":
          return "mdi-package-variant-plus";
        case "add adjustment":
          return "mdi-plus-circle";
        case "reduce adjustment":
          return "mdi-minus-circle";
        case "purchase":
          return "mdi-cart-arrow-down";
        case "sale":
          return "mdi-cart-arrow-up";
        default:
          return "mdi-circle";
      }
    },

    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case "completed":
          return "green";
        case "pending":
          return "orange";
        case "cancelled":
          return "red";
        case "processing":
          return "blue";
        default:
          return "grey";
      }
    },

    getStockColor(quantity) {
      const qty = parseFloat(quantity) || 0;
      if (qty < 0) return "red";
      if (qty >= 0) return "green";
      return "grey";
    },

    // Load mock transaction data when service is selected
    async loadTransactionData() {
      if (this.selectedService) {
        // console.log(
        //   "Fetching transactions for item_id:",
        //   this.selectedService.item_id
        // );
        // console.log("Item type:", this.selectedService.item_type); // Should be 'SERVICE'
        try {
          const result = await API.graphql(
            graphqlOperation(get_items_transactions, {
              input: {
                item_id: this.selectedService.item_id,
                limit: 100,
                nextToken: null,
              },
            })
          );
          const resultData = JSON.parse(result.data.get_items_transactions);
          // console.log("API Response for Transactions:", resultData); // Check if data is empty
          if (resultData.Status == "SUCCESS") {
            this.transactions = resultData.data;
            this.totalTransactions = resultData.data.length;
          } else {
            this.transactions = [];
            this.totalTransactions = 0;
          }
        } catch (error) {
          console.error("Error fetching transactions:", error);
          this.transactions = [];
          this.totalTransactions = 0;
        }
      }
    },
  },
};
</script>

<style scoped>
.product-container {
  background-color: white;
}

.products-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.product-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.product-row:hover {
  background-color: #f5f5f5;
}

.selected-product {
  background-color: #e3f2fd !important;
}

.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

.product-search {
  max-width: 300px;
}

/* Table Footer Styles */
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
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-weight: 500;
  text-transform: none;
  min-width: 80px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 6px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 6px;
  min-width: 32px;
}
</style>
