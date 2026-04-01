<template>
  <div class="product-container">
    <!-- Left Panel: Product List -->
    <v-card flat class="overflow-y-auto ma-4">
      <div class="d-flex align-center justify-space-between">
        <v-text-field
          v-model="searchProduct"
          variant="outlined"
          density="compact"
          label="Search"
          class="mr-4 mt-2"
          style="max-width: 250px"
          prepend-inner-icon="mdi-magnify"
          clearable
        />
        <v-spacer />
        <div class="header-actions">
          <!-- Add any action buttons here if needed -->
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="text-capitalize cardCss white--text mr-2"
                size="small"
                elevation="2"
                :loading="actionLoading"
                :disabled="actionLoading"
              >
                Actions
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="addProduct">
                <template #prepend>
                  <v-icon color="primary">mdi-plus</v-icon>
                </template>
                <v-list-item-title> Add Item </v-list-item-title>
              </v-list-item>

              <v-divider class="my-1" />

              <v-list-item @click="download_item" :disabled="templateLoading">
                <template #prepend>
                  <v-icon v-if="!templateLoading" color="primary"
                    >mdi-download</v-icon
                  >
                  <v-progress-circular
                    v-else
                    indeterminate
                    size="18"
                    width="2"
                    color="primary"
                  />
                </template>
                <v-list-item-title>
                  {{ templateLoading ? "Downloading..." : "Download Template" }}
                </v-list-item-title>
              </v-list-item>

              <v-divider class="my-1" />
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-import</v-icon>
                </template>
                <BulkItemImport
                  :on-success="handleSuccess"
                  :before-upload="beforeUpload"
                />
              </v-list-item>
              <v-divider class="my-1" />

              <v-list-item @click="export_item" :disabled="exportLoading">
                <template #prepend>
                  <v-icon v-if="!exportLoading" color="primary"
                    >mdi-export</v-icon
                  >
                  <v-progress-circular
                    v-else
                    indeterminate
                    size="18"
                    width="2"
                    color="primary"
                  />
                </template>
                <v-list-item-title>
                  {{ exportLoading ? "Exporting..." : "Export" }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
      <v-data-table
        :headers="productHeaders"
        :items="productTableItems"
        item-key="item_id"
        class="modern-data-table"
        density="comfortable"
        hover
        :loading="tableloading"
        :height="windowHeight"
        fixed-header
        hide-default-footer
        @click:row="selectProduct"
      >
        <!-- Empty State -->
        <template #no-data>
          <div class="d-flex flex-column align-center pa-8">
            <v-icon size="48" color="grey" class="mb-2">
              mdi-package-variant
            </v-icon>
            <span class="text-h6 text-grey">No items found</span>
            <span class="text-body-2 text-grey">
              Try adjusting your search criteria
            </span>
          </div>
        </template>

        <!-- Loading State -->
        <template #loading>
          <div class="text-center py-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="32"
              class="mb-4"
            />
            <div class="text-body-2 grey--text">Loading products...</div>
          </div>
        </template>

        <!-- Item Name -->
        <template v-slot:[`item.item_name`]="{ item }">
          <div
            class="d-flex align-center font-weight-medium cursor-pointer"
            :class="{
              'selected-product': selectedProduct?.item_id === item.item_id,
            }"
          >
            {{ item.item_name }}
          </div>
        </template>

        <template v-slot:[`item.stock_quantity`]="{ item }">
          <span
            class="caption font-weight-medium"
            :style="{
              color: getStockColor(
                Number(item.stock_quantity) > 0
                  ? item.stock_quantity
                  : item.slab_stock_fields?.slab_balance_stock
              ),
            }"
          >
            {{
              Number(item.stock_quantity) > 0
                ? item.stock_quantity
                : item.slab_stock_fields?.slab_balance_stock || "-"
            }}
          </span>
        </template>

        <!-- Stock -->
        <template v-slot:[`item.item_unit_text`]="{ item }">
          <span
            class="caption font-weight-medium"
            :style="{ color: getStockColor(item.item_unit_text) }"
          >
            {{ item.item_unit_text || 0 }}
          </span>
        </template>

        <!-- Price -->
        <template v-slot:[`item.sale_price`]="{ item }">
          <div class="d-flex align-center">
            <v-icon size="16" color="green" class="mr-2"
              >mdi-currency-inr</v-icon
            >
            <span
              class="caption font-weight-medium"
              :style="{ color: getStockColor(item.sale_price) }"
            >
              {{ item.sale_price || item.sale_price?.sale_price }}
            </span>
          </div>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.action`]="{ item }">
          <div class="d-flex align-center justify-end">
            <v-icon
              size="18"
              color="green"
              class="mr-4 cursor-pointer"
              @click.stop="editProduct(item)"
            >
              mdi-pencil
            </v-icon>

            <v-icon
              size="18"
              color="red"
              class="cursor-pointer"
              @click.stop="deleteProduct(item)"
            >
              mdi-delete
            </v-icon>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Right Panel: Product Details and Transactions -->
    <v-dialog v-model="productDetailsDialog" max-width="1200" persistent>
      <v-card>
        <!-- Header -->
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-package-variant</v-icon>
            <span class="text-h6">
              {{ selectedProduct?.item_name || "Product Details" }}
            </span>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="productDetailsDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text style="height: 75vh; overflow-y: auto">
          <div v-if="selectedProduct">
            <!-- PRODUCT OVERVIEW -->
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
                        ₹{{
                          selectedProduct.sale_price?.sale_price ||
                          selectedProduct.sale_price
                        }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="3">
                    <div>
                      <div class="text-caption text-grey">PURCHASE PRICE</div>
                      <div class="text-h6 font-weight-medium">
                        ₹{{
                          selectedProduct.purchase_price?.purchase_price || 0
                        }}
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="3">
                    <div class="mb-3">
                      <div class="text-caption text-grey">STOCK QUANTITY</div>
                      <div>
                        <span
                          class="text-h6 font-weight-medium"
                          :style="{
                            color: getStockColor(
                              Number(selectedProduct.stock_quantity) > 0
                                ? selectedProduct.stock_quantity
                                : selectedProduct.slab_stock_fields
                                    ?.slab_balance_stock
                            ),
                          }"
                        >
                          {{
                            Number(selectedProduct.stock_quantity) > 0
                              ? selectedProduct.stock_quantity
                              : selectedProduct.slab_stock_fields
                                  ?.slab_balance_stock || "-"
                          }}
                        </span>
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
                  :height="
                    selectedProduct.item_type == 'PRODUCT'
                      ? transactionTableHeight
                      : serviceTableHeight
                  "
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
                      <div class="text-h6 text-grey">
                        No transactions to show
                      </div>
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
                      :style="{
                        color: getStockColor(
                          Number(item.stock_quantity) > 0
                            ? item.stock_quantity
                            : item.slab_stock_fields?.slab_balance_stock
                        ),
                      }"
                    >
                      {{
                        Number(item.stock_quantity) > 0
                          ? item.stock_quantity
                          : item.slab_stock_fields?.slab_balance_stock || "-"
                      }}
                    </span>
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
                      @click="
                        transactionCurrentPage = transactionCurrentPage - 1
                      "
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
                      :disabled="
                        transactionCurrentPage === transactionPageCount
                      "
                      variant="text"
                      size="small"
                      class="pagination-btn"
                      @click="
                        transactionCurrentPage = transactionCurrentPage + 1
                      "
                      style="color: #666 !important"
                    >
                      Next
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

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
import BulkItemImport from "../NewInventory/BulkItemImport.vue";
import { export_inventory_items } from "@/graphql/mutations.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
const FileSaver = require("file-saver");
import * as XLSX from "xlsx";
import axios from "axios";
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
    BulkItemImport,
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
      filterOptions: [
        { title: "Goods", value: "PRODUCT" },
        { title: "Services", value: "SERVICE" },
      ],
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
      productHeaders: [
        { title: "Item Name", value: "item_name", sortable: true },
        { title: "Sale Quantity", value: "item_unit_text", sortable: true },
        { title: "Sale Price", value: "sale_price", sortable: true },
        { title: "Stock Quantity", value: "stock_quantity", sortable: true },
        { title: "", value: "action", sortable: false },
      ],

      transactionTableHeight: 0,
      productDetailsDialog: false,
      exportLoading: false,
      templateLoading: false,
      actionLoading: false, // ✅ stop Actions loader
    };
  },
  computed: {
    filteredProducts() {
      let filtered = this.products;
      console.log(filtered)

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

    productTableItems() {
      return this.filteredProducts.map((p) => ({
        ...p,
        sale_price: p.sale_price?.sale_price || 0,
      }));
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
    this.windowHeight = window.innerHeight - 280;
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
      this.tableloading = true;
      try {
        const result = await API.graphql(graphqlOperation(list_items));
        // console.log(result);
        const resultData = JSON.parse(result.data.list_items);
        // console.log(resultData);
        if (resultData.Status == "SUCCESS") {
          this.products = resultData.data;
          console.log("products", this.products);
          this.tableloading = false;

          // Select first product based on current filter
          // if (this.products.length > 0) {
          //   // Find first product that matches current filter
          //   const firstMatchingProduct = this.products.find(
          //     product => product.item_type === this.selectedFilter
          //   );

          //   if (firstMatchingProduct) {
          //     this.selectProduct(firstMatchingProduct);
          //   } else if (this.products.length > 0) {
          //     // If no product matches filter, select first available
          //     this.selectProduct(this.products[0]);
          //   }
          // }
        } else {
          this.tableloading = false;

          this.products = [];
        }
      } catch (error) {
        this.products = [];
        console.log(error);
        this.tableloading = false;
      }
    },

    selectProduct(event, product) {
      console.log(product);
      this.selectedProduct = product.item;
      this.productDetailsDialog = true; // 🔥 open dialog
      this.transactionCurrentPage = 1; // reset pagination
      this.loadTransactionData();
    },

    handleFilterChange() {
      // Check if current selected product is still visible after filter change
      if (this.selectedProduct) {
        const isStillVisible = this.filteredProducts.some(
          (product) => product.item_id === this.selectedProduct.item_id
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
      if (this.selectedFilter === "SERVICE") {
        this.editingService = null;
        this.serviceDialog = true;
      } else {
        this.editingProduct = null;
        this.productDialog = true;
      }
    },

    editProduct(product) {
      if (this.selectedFilter === "SERVICE") {
        this.editingService = product;
        this.editServiceDialog = true;
      } else {
        this.editingProduct = product;
        console.log("this.editingProduct", this.editingProduct);
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
      if (this.selectedFilter === "SERVICE") {
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
    async download_item() {
      try {
        this.templateLoading = true;
        this.actionLoading = true; // 🔥 activate Actions loader

        const headers = [
          "item_name",
          "item_type",
          "item_code",
          "item_hsn",
          "category_name",
          "sub_category_name",
          "item_unit",
          "tracking_type",
          "purchase_price",
          "sale_price",
          "whole_sale_price",
          "stock_quantity",
          "stock_value",
          "minimum_stock",
          "discount_price",
          "item_tax",
          "item_description",
          "item_location",
        ];

        let teamId =
          this.$store.getters.GetUserObj?.organization?.organization_team_id ||
          "";

        let fileName = teamId
          ? `${teamId}_Inventory Template.xlsx`
          : "Inventory Template.xlsx";

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, fileName);
      } finally {
        this.templateLoading = false;
        this.actionLoading = false; // ✅ stop Actions loader
      }
    },
    handleSuccess({ results, header }) {
      this.$router.push("/home/BulkUploadInventory");
      let customerData = {
        excelHeaders: header,
        excelTableData: results,
      };
      this.$store.commit("SetcustomerDetails", customerData);
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 5;
      return isLt1M;
    },
    async export_item() {
      try {
        this.exportLoading = true;
        this.actionLoading = true; // 🔥 start Actions loader

        const data = this.$store.getters.GetUserObj;

        const result = await API.graphql(
          graphqlOperation(export_inventory_items, {
            input: {
              user_email_id: data.organization.organization_created_by,
              item_type: "ALL",
              category_id: "ALL",
            },
          })
        );

        const response = JSON.parse(result.data.export_inventory_items);

        if (response.Status === "SUCCESS" && response.URL) {
          await this.download_items(response.URL, response.FileName);
          this.actionLoading = false; // ✅ stop Actions loader
        } else {
          throw new Error(response.Message || "Export failed");
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.message || error.errors?.[0]?.message,
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.exportLoading = false;
        this.actionLoading = false; // ✅ stop Actions loader
      }
    },

    async download_items(url, fileNameFromApi) {
      let teamId =
        this.$store.getters.GetUserObj?.organization?.organization_team_id ||
        "";

      let fileName = fileNameFromApi
        ? `${teamId}_${fileNameFromApi}`
        : `${teamId}_Inventory.xlsx`;

      try {
        const response = await axios({
          url,
          method: "GET",
          responseType: "blob",
        });

        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        FileSaver.saveAs(blob, fileName);
        this.actionLoading = false; // ✅ stop Actions loader
      } catch (error) {
        console.error("Download failed:", error);
        this.actionLoading = false; // ✅ stop Actions loader
      }
    },
  },
};
</script>

<style scoped>
.product-container {
  background-color: white;
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
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}
</style>
