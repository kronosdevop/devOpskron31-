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
                >mdi-folder-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Categories Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or add a new category.
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
              <div class="text-body-2 grey--text">Loading categories...</div>
            </div>
          </template>

          <!-- Category Name -->
          <template v-slot:[`item.category_name`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="20" color="primary" class="mr-3">mdi-folder</v-icon>
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.category_name || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <!-- Category Description -->
          <template v-slot:[`item.category_description`]="{ item }">
            <v-tooltip location="top">
              <template v-slot:activator="{ on }">
                <div class="d-flex align-center" v-on="on">
                  <v-icon size="16" color="grey" class="mr-2">mdi-text</v-icon>
                  <span class="caption text-truncate" style="max-width: 200px">
                    {{ item.category_description || "N/A" }}
                  </span>
                </div>
              </template>
              <div style="max-width: 300px">
                <div class="font-weight-medium mb-1">Description</div>
                <div>
                  {{ item.category_description || "No description available" }}
                </div>
              </div>
            </v-tooltip>
          </template>

          <!-- Created Date -->
          <template v-slot:[`item.category_created_on`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
              <span class="caption">
                {{ get_date(item.category_created_on * 1000) }}
              </span>
            </div>
          </template>

          <!-- Verification Date -->
          <template v-slot:[`item.category_verification_date`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2"
                >mdi-check-circle</v-icon
              >
              <span class="caption">
                {{ item.category_verification_date || "Not verified" }}
              </span>
            </div>
          </template>

          <!-- Created By -->
          <template v-slot:[`item.category_created_by`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="24" color="primary" class="mr-2">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{
                    (fetch_user_name(item.category_created_by) || "U")
                      .substring(0, 1)
                      .toUpperCase()
                  }}
                </span>
              </v-avatar>
              <span class="caption">
                {{ fetch_user_name(item.category_created_by) || "N/A" }}
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
                    @click.stop="open_editDailog(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="blue">mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Edit Category</v-list-item-title>
                  </v-list-item>

                  <v-divider class="my-1" />

                  <v-list-item
                    @click.stop="open_deleteDailog(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="red">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Delete Category</v-list-item-title>
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
                : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} categories`
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
      <DeleteCategories
        :categoriesdeletion="categoriesdeletion"
        @clicked="categoriesdeletion = false"
        :categoriesItem="categoriesItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditCategory
        :categoriesEddition="categoriesEddition"
        @clicked="categoriesEddition = false"
        :categoriesItem="categoriesItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <div v-if="componentCheck == 4">
      <AddSubcategories
        :rowInfo="rowInfo"
        :categoriessubAddition="categoriessubAddition"
        @clicked="categoriessubAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 5">
      <AddCategory
        :categoriesAddition="categoriesAddition"
        @clicked="categoriesAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
      <script>
/*eslint-disable*/
import AddCategory from "@/components/SettingsDialogs/AddCategory.vue";
import DeleteCategories from "@/components/SettingsDialogs/DeleteCategories.vue";
import EditCategory from "@/components/SettingsDialogs/EditCategory.vue";
import SnackBar from "@/components/SnackBar.vue";
import AddSubcategories from "@/components/SettingsDialogs/AddSubcategories.vue";
import { items_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  components: {
    SnackBar,
    DeleteCategories,
    EditCategory,
    AddCategory,
    AddSubcategories,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      SnackBarComponent: {},
      categoriesEddition: false,
      categoriesdeletion: false,
      categoriesAddition: false,
      tableLoading: false,
      componentCheck: 0,
      categoriesItem: {},
      categoriessubAddition: false,
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: [{ key: "category_name", order: "asc" }],
      categoriesHeaders: [
        {
          title: "Category Name",
          value: "category_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Created By",
          value: "category_created_by",
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
      categoriesRecords: [],
      fixed: true,
      expanded: [],
      allUSersNames: [],
      singleExpand: true,
      categoryPrefix: "",
      subcategoryName: "",
      rowInfo: {},
      windowHeight: 0,
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.categoriesRecords;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.categoriesRecords.filter(
        (item) =>
          (item.category_name &&
            item.category_name.toLowerCase().includes(searchTerm)) ||
          (item.category_description &&
            item.category_description.toLowerCase().includes(searchTerm)) ||
          (item.category_created_by &&
            this.fetch_user_name(item.category_created_by)
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
  async created() {
    this.windowHeight = window.innerHeight - 380;
    await this.fetch_categories();
    await this.get_all_org_users();
    this.allUSersNames = this.orgUsers;
  },
  methods: {
    add_categories() {
      this.componentCheck = 5;
      this.categoriesAddition = true;
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
    get_date(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },
    handle_row_click(item) {
      this.componentCheck = 4;
      this.categoriessubAddition = true;
      this.rowInfo = item;
    },

    open_editDailog(item) {
      this.categoriesItem = item;
      this.componentCheck = 2;
      this.categoriesEddition = true;
    },
    open_deleteDailog(item) {
      this.categoriesItem = item;
      this.componentCheck = 1;
      this.categoriesdeletion = true;
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

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.categoriesdeletion = false;
      this.categoriesEddition = false;
      this.categoriesAddition = false;
      this.fetch_categories();
    },

    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "category_name" ||
        key === "category_description" ||
        key === "category_created_by"
      ) {
        return value.toLowerCase();
      }
      if (key === "category_created_on") {
        return new Date(parseInt(value) * 1000).getTime();
      }
      return value;
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },

    async fetch_categories() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(items_categories, {
            input: {
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(result.data.items_categories);
      

        this.categoriesRecords = [];
        this.tableLoading = false;

        if (response.Status == "SUCCESS") {
          // Check multiple possible data structures
          let categoriesData = null;

          if (response.data && Array.isArray(response.data)) {
            categoriesData = response.data;
          
          } else if (
            response.categories &&
            Array.isArray(response.categories)
          ) {
            categoriesData = response.categories;
           
          } else if (response.result && Array.isArray(response.result)) {
            categoriesData = response.result;
           
          } else if (response.items && Array.isArray(response.items)) {
            categoriesData = response.items;
            
          } else {
           
            categoriesData = [];
          }

          this.categoriesRecords = categoriesData || [];
        
          this.tableLoading = false;
        } else {
        
          this.categoriesRecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        // console.error("Error fetching categories:", error);
        this.categoriesRecords = [];
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
      this.$emit('backAction');
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