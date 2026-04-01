<template>
  <div class="product-container">
    <v-row>
      <!-- Left Panel: Product List -->
      <v-col cols="12" md="4">
        <v-card flat class="pa-4 overflow-y-auto">
          <!-- Header with Search, Filter and Add Product Button -->
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center">
              <v-text-field
                v-model="searchProduct"
                placeholder="Search ..."
              
                variant="outlined"
                density="compact"
                hide-details
                class="product-search mr-3"
                clearable
              />
              
              <!-- <v-select
                v-model="selectedFilter"
                :items="filterOptions"
                variant="outlined"
                density="compact"
                hide-details
                item-title="title"
                item-value="value"
                class="filter-select"
                style="min-width: 150px;"
              /> -->
            </div>

            <v-btn size="small" class="action-btn ml-2" @click="addProduct">
              <v-icon left>mdi-plus</v-icon>
           
            </v-btn>
          </div>

          <!-- Search Field for Products -->

          <!-- Products Table -->
          <v-card flat class="overflow-y-auto" :height="windowHeight">
            <v-table class="products-table">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">ITEM NAME</th>
                  <th class="text-left font-weight-bold">QUANTITY</th>
                  <th class="text-right"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredProducts.length === 0">
                  <td colspan="3" class="text-center pa-8">
                    <div class="d-flex flex-column align-center">
                      <v-icon size="48" color="grey" class="mb-2"
                        >mdi-package-variant</v-icon
                      >
                      <span class="text-h6 text-grey">No items found</span>
                      <span class="text-body-2 text-grey"
                        >Try adjusting your search criteria</span
                      >
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="product in filteredProducts"
                  :key="product.item_id"
                  :class="{
                    'selected-product':
                      selectedProduct?.item_id === product.item_id,
                  }"
                  @click="selectProduct(product)"
                  class="product-row"
                >
                  <td>{{ product.item_name }}</td>
                  <td>
                    <span
                      :style="{ color: getStockColor(product.stock_quantity) }"
                    >
                      {{
                        product.stock_quantity == ""
                          ? 0
                          : product.stock_quantity
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
                        <v-list-item @click="editProduct(product)">
                          <v-list-item-title>Edit Item</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteProduct(product)">
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
      <!-- Right Panel: Product Details and Transactions -->
      <v-col cols="12" md="8">
        <div v-if="selectedProduct">
          <!-- Product Overview Section -->
          <v-card class="mb-2" v-if="selectedProduct.item_type == 'PRODUCT'">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <h2 class="text-h5 font-weight-medium mr-2">
                    {{ selectedProduct.item_name }}
                  </h2>
                </div>
                <v-btn
                  color="primary"
                  size="small"
                  prepend-icon="mdi-chart-line"
                  class="text-none"
                  @click="openStockAdjustment"
                >
                  ADJUST STOCK
                </v-btn>
              </div>

              <v-row>
                <v-col cols="3">
                  <div class="mb-3">
                    <div class="text-caption text-grey">SALE PRICE</div>
                    <div class="text-h6 font-weight-medium">
                      ₹{{ selectedProduct.sale_price?.sale_price || 0 }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="3">
                  <div>
                    <div class="text-caption text-grey">PURCHASE PRICE</div>
                    <div class="text-h6 font-weight-medium">
                      ₹{{ selectedProduct.purchase_price?.purchase_price || 0 }}
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
                          color: getStockColor(selectedProduct.stock_quantity),
                        }"
                        >{{ selectedProduct.stock_quantity || 0 }}</span
                      >
                    </div>
                  </div>
                </v-col>
                <v-col cols="3" class="text-right">
                  <div>
                    <div class="text-caption text-grey">STOCK VALUE</div>
                    <div class="text-h6 font-weight-medium">
                      ₹{{ selectedProduct.stock_value || 0 }}
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Low Stock Alert Banner -->
            </v-card-text>
          </v-card>

          <!-- Transactions Section -->
          <v-card class="">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6 font-weight-medium">TRANSACTIONS</h3>
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
                :height=" selectedProduct.item_type == 'PRODUCT' ? transactionTableHeight : serviceTableHeight"
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
                      No transaction records available for this product.
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

        <!-- No Product Selected -->
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-package-variant</v-icon
          >
          <div class="text-h6 text-grey mb-2">No Product Selected</div>
          <div class="text-body-2 text-grey">
            Select a product from the list to view details and transactions.
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Product Dialog Component (for adding new products) -->
    <ProductDialog
      :dialog="productDialog"
      :editing-product="null"
      @update:dialog="productDialog = $event"
      @clicked="productDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Edit Product Dialog Component -->
    <EditProductDialog
      :dialog="editProductDialog"
      :editing-product="editingProduct"
      @update:dialog="editProductDialog = $event"
      @clicked="editProductDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Delete Product Dialog Component -->
    <DeleteProductDialog
      :deleteProductDialog="deleteProductDialog"
      :productItem="productToDelete"
      @clicked="deleteProductDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Stock Adjustment Dialog -->
    <StockAdjustmentDialog
      :dialog="stockAdjustmentDialog"
      :selected-product="selectedProduct"
      @update:dialog="stockAdjustmentDialog = $event"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

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

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import ProductDialog from "./ProductDialog.vue";
import EditProductDialog from "./EditProductDialog.vue";
import DeleteProductDialog from "./DeleteProductDialog.vue";
import StockAdjustmentDialog from "./StockAdjustmentDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import ServiceDialog from "./ServiceDialog.vue";
import EditServiceDialog from "./EditServiceDialog.vue";
import DeleteServiceDialog from "./DeleteServiceDialog.vue";
import { list_items, get_items_transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  name: "Product",
  components: {
    ProductDialog,
    EditProductDialog,
    DeleteProductDialog,
    StockAdjustmentDialog,
    SnackBar,
    ServiceDialog,
    EditServiceDialog,
    DeleteServiceDialog,
  },
  data() {
    return {
      products: [],
      selectedProduct: null,
      searchProduct: "",
      productDialog: false,
      editProductDialog: false,
      editingProduct: null,
      deleteProductDialog: false,
      productToDelete: null,
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
      // Filter properties
      selectedFilter: "PRODUCT",
      filterOptions: [{title: "Goods", value: "PRODUCT"}, {title: "Services", value: "SERVICE"}],
      serviceTableHeight: 0,
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
    filteredProducts() {
      let filtered = this.products;
      
      // Filter by type (PRODUCT/SERVICE)
      if (this.selectedFilter) {
        filtered = filtered.filter(
          (product) => product.item_type === this.selectedFilter
        );
      }
      
      // Filter by search query
      if (this.searchProduct) {
        filtered = filtered.filter(
          (product) =>
            product.item_name
              .toLowerCase()
              .includes(this.searchProduct.toLowerCase()) ||
            (product.stock_quantity &&
              product.stock_quantity
                .toString()
                .toLowerCase()
                .includes(this.searchProduct.toLowerCase()))
        );
      }
      
      return filtered;
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
    this.transactionTableHeight = window.innerHeight - 460;
    this.serviceTableHeight = window.innerHeight - 300;
    await this.getProducts();
    // Select first product by default
  },

  watch: {
    // Watch for filter changes and handle product selection
    selectedFilter() {
      this.handleFilterChange();
    },
  },
  methods: {
    async getProducts() {
      try {
        const result = await API.graphql(graphqlOperation(list_items));
        // console.log(result);
        const resultData = JSON.parse(result.data.list_items);
        // console.log(resultData);
        if (resultData.Status == "SUCCESS") {
          this.products = resultData.data;
          
          // Select first product based on current filter
          if (this.products.length > 0) {
            // Find first product that matches current filter
            const firstMatchingProduct = this.products.find(
              product => product.item_type === this.selectedFilter
            );
            
            if (firstMatchingProduct) {
              this.selectProduct(firstMatchingProduct);
            } else if (this.products.length > 0) {
              // If no product matches filter, select first available
              this.selectProduct(this.products[0]);
            }
          }
        } else {
          this.products = [];
        }
      } catch (error) {
        this.products = [];
        console.log(error);
      }
    },

    selectProduct(product) {
      this.selectedProduct = product;
      this.loadTransactionData(); // Load transaction data when product is selected
    },

    handleFilterChange() {
      // Check if current selected product is still visible after filter change
      if (this.selectedProduct) {
        const isStillVisible = this.filteredProducts.some(
          product => product.item_id === this.selectedProduct.item_id
        );
        
        if (!isStillVisible) {
          // Current product is no longer visible, select first available product
          if (this.filteredProducts.length > 0) {
            this.selectProduct(this.filteredProducts[0]);
          } else {
            // No products available in current filter, clear selection
            this.selectedProduct = null;
            this.transactions = [];
            this.totalTransactions = 0;
          }
        }
      } else if (this.filteredProducts.length > 0) {
        // No product was selected but we have filtered products, select first one
        this.selectProduct(this.filteredProducts[0]);
      }
    },

    addProduct() {
      if (this.selectedFilter === 'SERVICE') {
        this.editingService = null;
        this.serviceDialog = true;
      } else {
        this.editingProduct = null;
        this.productDialog = true;
      }
    },

    editProduct(product) {
      if (this.selectedFilter === 'SERVICE') {
        this.editingService = product;
        this.editServiceDialog = true;
      } else {
        this.editingProduct = product;
        this.editProductDialog = true;
      }
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.products = [];
      this.selectedProduct = null;
      this.productDialog = false;
      this.editProductDialog = false;
      this.deleteProductDialog = false;
      this.serviceDialog = false;
      this.editServiceDialog = false;
      this.deleteServiceDialog = false;
      this.getProducts();
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

    deleteProduct(product) {
      if (this.selectedFilter === 'SERVICE') {
        this.serviceToDelete = product;
        this.deleteServiceDialog = true;
      } else {
        this.productToDelete = product;
        this.deleteProductDialog = true;
      }
    },

    openStockAdjustment() {
      this.stockAdjustmentDialog = true;
    },

    handleTransactionSortChange(value) {
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

    // Load mock transaction data when product is selected
    async loadTransactionData() {
      if (this.selectedProduct) {
        try {
          const result = await API.graphql(
            graphqlOperation(get_items_transactions, {
              input: {
                item_id: this.selectedProduct.item_id,
                limit: 100,
                nextToken: null,
              },
            })
          );
          const resultData = JSON.parse(result.data.get_items_transactions);
          if (resultData.Status == "SUCCESS") {
            this.transactions = resultData.data;
            this.totalTransactions = resultData.data.length;
          } else {
            this.transactions = [];
            this.totalTransactions = 0;
          }
          // console.log(resultData);
        } catch (error) {
          console.log(error);
        }

        this.totalTransactions = this.transactions.length;
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
  min-width: 200px;
  max-width: 300px;
}

.filter-select {
  max-width: 150px;
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
