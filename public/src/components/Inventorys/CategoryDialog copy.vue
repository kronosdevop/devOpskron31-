<template>
  <div class="categories-container">
    <v-row>
      <!-- Left Panel: Categories List -->
      <v-col cols="12" md="4">
        <v-card flat class="pa-4 overflow-y-auto">
          <!-- Header with Search and Add Categories Button -->
          <div class="d-flex align-center justify-space-between mb-4">
            <v-text-field
              v-model="searchCategory"
              placeholder="Search categories..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="category-search"
              clearable
            />

            <v-btn size="small" class="action-btn ml-2" @click="addCategory">
              <v-icon left>mdi-plus</v-icon>
              Add Category
            </v-btn>
          </div>

          <!-- Categories Table -->
          <v-card flat class="overflow-y-auto" :height="windowHeight">
            <v-table class="categories-table">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">CATEGORY NAME</th>
                  <th class="text-right"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredCategories.length === 0">
                  <td colspan="2" class="text-center pa-8">
                    <div class="d-flex flex-column align-center">
                      <v-icon size="48" color="grey" class="mb-2"
                        >mdi-tag-multiple</v-icon
                      >
                      <span class="text-h6 text-grey">No categories found</span>
                      <span class="text-body-2 text-grey"
                        >Try adjusting your search criteria</span
                      >
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="category in filteredCategories"
                  :key="category.category_id"
                  :class="{
                    'selected-category':
                      selectedCategory?.category_id === category.category_id,
                  }"
                  @click="selectCategory(category)"
                  class="category-row"
                >
                  <td>{{ category.category_name }}</td>
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
                        <v-list-item @click="editCategory(category)">
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteCategory(category)">
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
      <v-col cols="12" md="8">
        <div v-if="selectedCategory && selectedCategory.length > 0">
          <!-- Category Products Overview -->
          <v-card class="mb-4">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6 font-weight-medium">CATEGORY PRODUCTS</h3>
                <v-chip color="primary" variant="tonal">
                  {{ selectedCategory.length }} Products
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Products Table -->
          <v-card>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="productHeaders"
                :items="selectedCategory"
                :loading="tableLoading"
                :sort-by="['item_name']"
                :items-per-page="10"
                hide-default-footer
                :height="productTableHeight"
                class="modern-data-table"
                density="comfortable"
                hover
                :fixed-header="true"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="48" color="grey" class="mb-2"
                      >mdi-package-variant</v-icon
                    >
                    <div class="text-h6 text-grey">
                      No products in this category
                    </div>
                    <div class="text-body-2 text-grey">
                      This category doesn't have any products yet.
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
                    <div class="text-body-2 text-grey">Loading products...</div>
                  </div>
                </template>

                <!-- Product Name -->
                <template v-slot:[`item.item_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-avatar size="32" class="mr-3">
                         <v-img 
                           :src="item.item_image" 
                           :alt="item.item_name"
                         >
                           <template v-slot:placeholder>
                             <v-icon size="20" color="grey">mdi-package-variant</v-icon>
                           </template>
                           <template v-slot:error>
                             <v-icon size="20" color="grey">mdi-package-variant</v-icon>
                           </template>
                         </v-img>
                       </v-avatar> -->
                    <div>
                      <div class="font-weight-medium">{{ item.item_name }}</div>
                      <div class="text-caption text-grey">
                        {{ item.item_code }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Stock Quantity -->
                <template v-slot:[`item.stock_quantity`]="{ item }">
                  <div class="d-flex align-center">
                    <v-chip
                      :color="getStockColor(item.stock_quantity)"
                      size="small"
                      variant="tonal"
                      class="text-none"
                    >
                      {{ item.stock_quantity || 0 }}
                    </v-chip>
                  </div>
                </template>

                <!-- Sale Price -->
                <template v-slot:[`item.sale_price`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="green" class="mr-2"
                      >mdi-currency-inr</v-icon
                    >
                    <span class="font-weight-medium">{{
                      item.sale_price?.sale_price || 0
                    }}</span>
                  </div>
                </template>

                <!-- Purchase Price -->
                <template v-slot:[`item.purchase_price`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="blue" class="mr-2"
                      >mdi-currency-inr</v-icon
                    >
                    <span class="font-weight-medium">{{
                      item.purchase_price?.purchase_price || 0
                    }}</span>
                  </div>
                </template>

                <!-- Stock Value -->
                <template v-slot:[`item.stock_value`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="purple" class="mr-2"
                      >mdi-currency-inr</v-icon
                    >
                    <span class="font-weight-medium">{{
                      item.stock_value || 0
                    }}</span>
                  </div>
                </template>

                <!-- Status -->
                <template v-slot:[`item.item_status`]="{ item }">
                  <v-chip
                    :color="getStatusColor(item.item_status)"
                    size="small"
                    variant="tonal"
                    class="text-none"
                  >
                    {{ item.item_status }}
                  </v-chip>
                </template>

                <!-- Actions -->
                <template v-slot:[`item.actions`]="{ item }">
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
                      <v-list-item @click="viewProduct(item)">
                        <v-list-item-title>View Details</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="editProduct(item)">
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>

              <!-- Table Footer with Pagination -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    selectedCategory && selectedCategory.length > 0
                      ? `Showing ${selectedCategory.length} of ${selectedCategory.length} products`
                      : "No products in this category"
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn
                    :disabled="productCurrentPage === 1"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="productCurrentPage = productCurrentPage - 1"
                    style="color: #666 !important"
                  >
                    Previous
                  </v-btn>
                  <div class="page-numbers">
                    <v-btn
                      v-for="page in visibleProductPages"
                      :key="page"
                      :variant="
                        page === productCurrentPage ? 'elevated' : 'text'
                      "
                      size="small"
                      :class="
                        page === productCurrentPage
                          ? 'active-page'
                          : 'inactive-page'
                      "
                      @click="productCurrentPage = page"
                      :style="
                        page === productCurrentPage
                          ? 'background: #DB4C77 !important; color: white !important;'
                          : 'color: #666 !important;'
                      "
                    >
                      {{ page }}
                    </v-btn>
                  </div>
                  <v-btn
                    :disabled="productCurrentPage === productPageCount"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="productCurrentPage = productCurrentPage + 1"
                    style="color: #666 !important"
                  >
                    Next
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- No Category Selected -->
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-folder-open</v-icon
          >
          <div class="text-h6 text-grey mb-2">No Category Selected</div>
          <div class="text-body-2 text-grey">
            Select a category from the list to view its products.
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Category Dialog Component -->
    <CategoryDialog
      :dialog="categoryDialog"
      :editing-category="editingCategory"
      @update:dialog="categoryDialog = $event"
      @clicked="categoryDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Delete Category Dialog Component -->
    <DeleteCategoryDialog
      @clicked="deleteCategoryDialog = false"
      :deleteCategoryDialog="deleteCategoryDialog"
      :categoryItem="categoryToDelete"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import CategoryDialog from "./CategoryDialog.vue";
import DeleteCategoryDialog from "./DeleteCategoryDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_category_items } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  name: "Categories",
  components: {
    CategoryDialog,
    DeleteCategoryDialog,
    SnackBar,
  },
  mixins: [get_global_categories],
  data() {
    return {
      masterGlobalCategories: [],
      selectedCategory: null,
      searchCategory: "",
      categoryDialog: false,
      editingCategory: null,
      deleteCategoryDialog: false,
      categoryToDelete: null,
      saving: false,
      windowHeight: 0,
      tableLoading: false,
      SnackBarComponent: {},
      // Product table properties
      productHeaders: [
        { title: "PRODUCT", value: "item_name", sortable: true },
        { title: "STOCK", value: "stock_quantity", sortable: true },
        { title: "SALE PRICE", value: "sale_price", sortable: true },
        { title: "PURCHASE PRICE", value: "purchase_price", sortable: true },
        { title: "STOCK VALUE", value: "stock_value", sortable: true },
        { title: "STATUS", value: "item_status", sortable: true },
        // { title: "ACTIONS", value: "actions", sortable: false },
      ],
      productTableHeight: 0,
      // Pagination properties
      productCurrentPage: 1,
      productItemsPerPage: 10,
    };
  },
  computed: {
    filteredCategories() {
      if (!this.searchCategory) return this.masterGlobalCategories;
      return this.masterGlobalCategories.filter((category) =>
        category.category_name
          .toLowerCase()
          .includes(this.searchCategory.toLowerCase())
      );
    },
    // Pagination computed properties
    productPageCount() {
      return Math.ceil(
        (this.selectedCategory?.length || 0) / this.productItemsPerPage
      );
    },
    visibleProductPages() {
      const pages = [];
      const start = Math.max(1, this.productCurrentPage - 2);
      const end = Math.min(this.productPageCount, this.productCurrentPage + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  async mounted() {
    this.windowHeight = window.innerHeight - 290;
    this.productTableHeight = window.innerHeight - 360;
    await this.get_global_categories();
    // Select first category by default
    if (this.masterGlobalCategories.length > 0) {
      this.selectCategory(this.masterGlobalCategories[0]);
    }
  },
  methods: {
    async selectCategory(category) {
      // console.log(category);
      let response = await API.graphql(
        graphqlOperation(get_category_items, {
          input: {
            category_id: category.category_id,
          },
        })
      );
      let res = JSON.parse(response.data.get_category_items);
      // console.log(res, "response");
      if (res.Status === "SUCCESS") {
        this.selectedCategory = res.data;
      } else {
        this.selectedCategory = null;
      }
    },

    addCategory() {
      this.editingCategory = null;
      this.categoryDialog = true;
    },

    editCategory(category) {
      this.editingCategory = category;
      // console.log(this.editingCategory, "editingCategory");
      this.categoryDialog = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.masterGlobalCategories = [];
      this.selectedCategory = null;
      this.categoryDialog = false;
      this.deleteCategoryDialog = false;
      this.get_global_categories();
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

    deleteCategory(category) {
      this.categoryToDelete = category;
      this.deleteCategoryDialog = true;
    },

    // Product table helper methods
    getStockColor(quantity) {
      const qty = parseFloat(quantity) || 0;
      if (qty <= 0) return "red";
      if (qty < 10) return "orange";
      return "green";
    },

    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case "active":
          return "green";
        case "deactive":
          return "red";
        case "pending":
          return "orange";
        default:
          return "grey";
      }
    },

    viewProduct(product) {
      // console.log("View product:", product);
      // You can implement product detail view here
    },

    editProduct(product) {
      // console.log("Edit product:", product);
      // You can implement product edit here
    },
  },
};
</script>

<style scoped>
.categories-container {
  background-color: white;
}

.categories-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.category-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.category-row:hover {
  background-color: #f5f5f5;
}

.selected-category {
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

.category-search {
  max-width: 300px;
}

/* Product table styles */
.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.modern-data-table .v-data-table__wrapper {
  border-radius: 8px;
}

.modern-data-table .v-data-table-header {
  background-color: #f8f9fa;
}

.modern-data-table .v-data-table-header th {
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.modern-data-table .v-data-table__tr:hover {
  background-color: #f8f9fa;
}

.modern-data-table .v-data-table__td {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}

/* Product image styles */
.product-image {
  border-radius: 4px;
  object-fit: cover;
}

/* Status chip styles */
.status-chip {
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
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
