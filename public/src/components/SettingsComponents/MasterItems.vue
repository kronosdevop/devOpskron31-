<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    
    <v-card flat>
      <v-card-text>
        <!-- Top Controls: All in one row -->
      

        <v-data-table
          :headers="categoriesHeaders"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :fixed-header="fixed"
          :height="windowHeight"
          hide-default-footer
          density="comfortable"
          class="modern-data-table"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-package-variant-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Products Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or add a new product.
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
              <div class="text-body-2 grey--text">Loading products...</div>
            </div>
          </template>

          <!-- Product Image -->
          <template v-slot:[`item.sub_category_Image`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="40" class="mr-3">
                <img
                  :src="item.sub_category_Image"
                  alt="Product"
                  style="object-fit: contain"
                  v-if="item.sub_category_Image"
                />
                <v-icon v-else size="20" color="grey">mdi-image-off</v-icon>
              </v-avatar>
            </div>
          </template>

          <!-- Product Name -->
          <template v-slot:[`item.sub_category_name`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="20" color="primary" class="mr-3"
                >mdi-package</v-icon
              >
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.sub_category_name || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <!-- Product Type -->
          <template v-slot:[`item.sub_category_type`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2">mdi-tag</v-icon>
              <v-chip
                :color="getTypeColor(item.sub_category_type)"
                size="small"
                variant="flat"
                class="text-caption"
              >
                {{ item.sub_category_type || "N/A" }}
              </v-chip>
            </div>
          </template>

          <!-- Product Code/SKU -->
          <template v-slot:[`item.sub_category_Sku`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2">mdi-barcode</v-icon>
              <span class="caption font-weight-medium">
                {{ item.sub_category_Sku || "N/A" }}
              </span>
            </div>
          </template>

          <!-- Product Description -->
          <template v-slot:[`item.sub_category_description`]="{ item }">
            <v-tooltip location="top">
              <template v-slot:activator="{ on }">
                <div class="d-flex align-center" v-on="on">
                  <v-icon size="16" color="grey" class="mr-2">mdi-text</v-icon>
                  <span class="caption text-truncate" style="max-width: 200px">
                    {{ item.sub_category_description || "N/A" }}
                  </span>
                </div>
              </template>
              <div style="max-width: 300px">
                <div class="font-weight-medium mb-1">Description</div>
                <div>
                  {{
                    item.sub_category_description || "No description available"
                  }}
                </div>
              </div>
            </v-tooltip>
          </template>

          <!-- Created By -->
          <template v-slot:[`item.sub_category_created_by`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="24" color="primary" class="mr-2">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{
                    (fetch_user_name(item.sub_category_created_by) || "U")
                      .substring(0, 1)
                      .toUpperCase()
                  }}
                </span>
              </v-avatar>
              <span class="caption">
                {{ fetch_user_name(item.sub_category_created_by) || "N/A" }}
              </span>
            </div>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex align-center justify-center">
              <v-menu offset-y>
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    v-bind="props"
                    class="cursor-pointer"
                  >
                    <v-icon size="18">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list density="compact">
                  <v-list-item
                    @click.stop="View_Product(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="green">mdi-eye</v-icon>
                    </template>
                    <v-list-item-title>View Product</v-list-item-title>
                  </v-list-item>

                  <v-divider class="my-1" />

                  <v-list-item
                    @click.stop="edition(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="blue">mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Edit Product</v-list-item-title>
                  </v-list-item>

                  <v-divider class="my-1" />

                  <v-list-item
                    @click.stop="deletion(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="red">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Delete Product</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} products`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage === 1"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage = currentPage - 1"
              style="color: #666 !important;"
            >
              Previous
            </v-btn>
            <div class="page-numbers">
              <v-btn
                v-for="page in visiblePages"
                :key="page"
                :variant="page === currentPage ? 'elevated' : 'text'"
                size="small"
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
                @click="currentPage = page"
                :style="page === currentPage ? 'background: #DB4C77 !important; color: white !important;' : 'color: #666 !important;'"
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
              style="color: #666 !important;"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <div v-if="componentCheck == 1">
      <DeleteItem
        :itemdeletion="itemdeletion"
        @clicked="itemdeletion = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditItem
        :itemEdition="itemEdition"
        @clicked="itemEdition = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <ViewItems
        :ViewProductDialog="ViewProductDialog"
        @clicked="ViewProductDialog = false"
        :rowInfo="rowInfo"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
    <script>
import EditItem from "@/components/SettingsDialogs/EditItem.vue";
import DeleteItem from "@/components/SettingsDialogs/DeleteItem.vue";
import ViewItems from "@/components/SettingsDialogs/ViewItems.vue";
import SnackBar from "@/components/SnackBar.vue";
import { quotation_sub_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  components: {
    SnackBar,
    DeleteItem,
    EditItem,
    ViewItems,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      componentCheck: 0,
      SnackBarComponent: {},
      rowInfo: {},
      tableLoading: false,
      allUSersNames: [],
      itemdeletion: false,
      itemEdition: false,
      fixed: true,
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: [{ key: "sub_category_name", order: "asc" }],
      itemsRecords: [],
      categoriesHeaders: [
        {
          title: "Image",
          value: "sub_category_Image",
          sortable: false,
          align: "center",
          width: "80px",
        },
        {
          title: "Product Name",
          value: "sub_category_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Type",
          value: "sub_category_type",
          sortable: true,
          align: "start",
        },
        {
          title: "SKU Code",
          value: "sub_category_Sku",
          sortable: true,
          align: "start",
        },
        {
          title: "Description",
          value: "sub_category_description",
          sortable: true,
          align: "start",
        },
        {
          title: "Created By",
          value: "sub_category_created_by",
          sortable: true,
          align: "start",
        },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
      windowHeight: 0,
      ViewProductDialog: false,
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.itemsRecords;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.itemsRecords.filter(
        (item) =>
          (item.sub_category_name &&
            item.sub_category_name.toLowerCase().includes(searchTerm)) ||
          (item.sub_category_Sku &&
            item.sub_category_Sku.toLowerCase().includes(searchTerm)) ||
          (item.sub_category_type &&
            item.sub_category_type.toLowerCase().includes(searchTerm)) ||
          (item.sub_category_description &&
            item.sub_category_description.toLowerCase().includes(searchTerm)) ||
          (item.sub_category_created_by &&
            this.fetch_user_name(item.sub_category_created_by)
              .toLowerCase()
              .includes(searchTerm))
      );
    },
    sortedAndPaginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },
    totalItems() {
      return this.filteredItems.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.pageCount, this.currentPage + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    currentPage(newVal) {
      // When the page changes, scroll to top of the card container
      this.$nextTick(() => {
        const cardContainer = document.querySelector(".card-container");
        if (cardContainer) {
          cardContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Fallback to scrolling to top of page
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    },
  },
  async mounted() {
    this.windowHeight = window.innerHeight - 380;
    await this.fetch_items();
    await this.get_all_org_users();
    this.allUSersNames = this.orgUsers;
  },
  methods: {
    add_items() {
      // This method should be implemented to add new items
    },
    getTypeColor(type) {
      const colors = {
        physical: "blue",
        digital: "green",
        service: "orange",
        default: "grey",
      };
      return colors[type?.toLowerCase()] || colors.default;
    },
    deletion(item) {
      this.rowInfo = item;
      this.componentCheck = 1;
      this.itemdeletion = true;
    },
    edition(item) {
      this.rowInfo = item;
      this.componentCheck = 2;
      this.itemEdition = true;
    },
    View_Product(item) {
      this.rowInfo = item;
      this.componentCheck = 3;
      this.ViewProductDialog = true;
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
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      if (value == "SYSTEM") {
        name = value;
      }
      return name;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.itemdeletion = false;
      this.itemEdition = false;
      this.ViewProductDialog = false;
      this.itemsRecords = [];
      this.fetch_items();
    },

    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "sub_category_name" ||
        key === "sub_category_Sku" ||
        key === "sub_category_type" ||
        key === "sub_category_description" ||
        key === "sub_category_created_by"
      ) {
        return value.toLowerCase();
      }
      return value;
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },

    async fetch_items() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(quotation_sub_categories, {
            input: {
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(result.data.quotation_sub_categories);

        this.itemsRecords = [];
        this.tableLoading = false;

        if (response.Status == "SUCCESS") {
          // Check multiple possible data structures
          let itemsData = null;

          if (response.data && Array.isArray(response.data)) {
            itemsData = response.data;
          } else if (response.items && Array.isArray(response.items)) {
            itemsData = response.items;
          } else if (response.result && Array.isArray(response.result)) {
            itemsData = response.result;
          } else if (response.products && Array.isArray(response.products)) {
            itemsData = response.products;
          } else {
            itemsData = [];
          }

          this.itemsRecords = itemsData || [];

          this.tableLoading = false;
        } else {
          this.itemsRecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.itemsRecords = [];
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
}

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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  background: #DB4C77 !important;
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

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}

.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}
</style>
