<template>
  <div>
    <v-card flat >
      <v-toolbar flat class="bg-white" >
        <v-btn
          variant="text"
          class="back-link"
          @click="$emit('backAction')"
        >
          <v-icon>mdi-arrow-left</v-icon>
          Back to Asset Settings
        </v-btn>
        <v-spacer />
        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="outlined"
          label="Search Categories"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          style="max-width: 300px;"
          class="mr-4"
          @input="onSearchChange"
        ></v-text-field>
        <v-btn
          size="small"
          dark
          @click="add_categories()"
          class="text-capitalize cardCss text-white"
        >
          Add Categories</v-btn
        >
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="categoriesHeaders"
          :items="paginatedItems"
          :loading="tableLoading"
          :sort-by="['category_prefix']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          item-key="category_id"
          class="modern-data-table"
          density="comfortable"
          hover
          :fixed-header="true"
          :height="windowHeight"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-folder-multiple</v-icon>
              <div class="text-h6 text-grey mb-2">No Categories Found</div>
              <div class="text-body-2 text-grey">
                No asset categories have been created yet.
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
              <div class="text-body-2 text-grey">Loading categories...</div>
            </div>
          </template>

          <template v-slot:[`item.timesheet_created_on`]="{ item }">
            <span v-text="get_date(item.timesheet_created_on * 1000)"></span>
          </template>
          <template v-slot:[`item.category_verification_date`]="{ item }">
            <span>{{
              item.category_verification_date == null ||
              item.category_verification_date == undefined
                ? "-"
                : item.category_verification_date
            }}</span>
          </template>

          <template v-slot:[`item.category_description`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  {{
                    item.category_description.length >= 10
                      ? item.category_description.substr(0, 10) + "..."
                      : item.category_description
                  }}
                </div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.category_description }}
              </div>
            </v-tooltip>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  size="small"
                  icon="mdi-format-list-bulleted-square"
                  variant="text"
                  color="#DB4C77"
                  v-bind="props"
                ></v-btn>
              </template>

              <v-list style="max-width: 220px" density="compact">
                <v-list-item @click.stop="handle_row_click(item)">
                  <v-list-item-title> Add Subcategory </v-list-item-title>
                </v-list-item>
                <v-list-item @click.stop="open_editDailog(item)">
                  <v-list-item-title> Edit Category </v-list-item-title>
                </v-list-item>
                <v-list-item @click.stop="open_deleteDailog(item)">
                  <v-list-item-title> Delete Category</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalCount} categories`
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
      <EditCategories
        :categoriesEddition="categoriesEddition"
        @clicked="categoriesEddition = false"
        :categoriesItem="categoriesItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AssetVerfication
        :verficationAsset="verficationAsset"
        @clicked="verficationAsset = false"
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
      <AddCategories
        :categoriesAddition="categoriesAddition"
        @clicked="categoriesAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
    <script>
/*eslint-disable*/
import EditCategories from "@/components/Asset/Popups/EditCategories.vue";
import AssetVerfication from "@/components/Asset/Popups/AssetVerfication.vue";
import SnackBar from "@/components/SnackBar.vue";
import DeleteCategories from "@/components/Asset/Popups/DeleteCategories.vue";
import AddSubcategories from "@/components/Asset/Popups/AddSubcategories.vue";
import AddCategories from "@/components/Asset/Popups/AddCategories.vue";
import { get_asset_sub_categories } from "@/mixins/GetAssetSubCategories.js";
import { asset_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
    DeleteCategories,
    EditCategories,
    AssetVerfication,
    AddSubcategories,
    AddCategories,
  },
  emits: ['backAction'],
  mixins: [get_asset_sub_categories],
  data() {
    return {
      SnackBarComponent: {},
      categoriesEddition: false,
      categoriesdeletion: false,
      tableLoading: false,
      componentCheck: 0,
      categoriesItem: {},
      verficationAsset: false,
      categoriessubAddition: false,
      categoriesHeaders: [
        {
          title: "Prefix",
          key: "category_prefix",
          sortable: false,
        },

        { title: "Name", key: "category_name", sortable: false },

        {
          title: "#No.of Subcategories",
          key: "sub_category_count",
          sortable: false,
        },

        {
          title: "Depreciation(%)",
          key: "category_depriciation",
          sortable: false,
        },

        // {
        //   title: "Verfication Date",
        //   key: "category_verification_date",
        //   sortable: false,
        // },

        {
          title: "Created By",
          key: "category_created_by_name",
          sortable: false,
        },

        { title: "Actions", key: "actions", sortable: false },
      ],
      categoriesRecords: [],
      fixed: false,
      expanded: [],
      singleExpand: true,
      allSubCategories: [],
      categoryPrefix: "",
      subcategoryName: "",
      rowInfo: {},
      categoriesAddition: false,
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
      searchQuery: "",
      filteredCategoriesRecords: [],
    };
  },
  computed: {
    totalCount() {
      return this.filteredCategoriesRecords.length;
    },
    pageCount() {
      return Math.ceil(this.filteredCategoriesRecords.length / this.itemsPerPage);
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
  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },
  async created() {
    this.allSubCategories = [];
    await this.fetch_categories();
    await this.get_asset_sub_categories();
    this.allSubCategories = this.assetSubCategories;
  },
  mounted() {
    this.updateWindowHeight();
    window.addEventListener('resize', this.updateWindowHeight);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWindowHeight);
  },
  methods: {
    add_categories() {
      this.componentCheck = 5;
      this.categoriesAddition = true;
    },
    convert_to_uppercase() {
      this.categoryPrefix = this.categoryPrefix.toUpperCase();
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
    open_veficationDailog(item) {
      this.componentCheck = 3;
      this.categoriesItem = item;
      this.verficationAsset = true;
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
      this.verficationAsset = false;
      this.categoriesAddition = false;
      this.fetch_categories();
    },

    async fetch_categories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_categories, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_CATEGORY",
            },
          })
        );
        var response = JSON.parse(result.data.asset_categories);
        //  console.log(response);
        this.categoriesRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.categoriesRecords = response.data;
          this.filterCategories();
          this.tableLoading = false;
          this.updatePageItems();
        } else {
          this.categoriesRecords = [];
          this.filteredCategoriesRecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.categoriesRecords = [];
        this.filteredCategoriesRecords = [];

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
    onSearchChange() {
      this.currentPage = 1;
      this.filterCategories();
      this.updatePageItems();
    },
    filterCategories() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        this.filteredCategoriesRecords = this.categoriesRecords;
      } else {
        const query = this.searchQuery.toLowerCase().trim();
        this.filteredCategoriesRecords = this.categoriesRecords.filter(
          (category) => {
            return (
              (category.category_name &&
                category.category_name.toLowerCase().includes(query)) ||
              (category.category_prefix &&
                category.category_prefix.toLowerCase().includes(query)) ||
              (category.category_created_by_name &&
                category.category_created_by_name.toLowerCase().includes(query)) ||
              (category.category_description &&
                category.category_description.toLowerCase().includes(query)) ||
              (category.category_depriciation &&
                category.category_depriciation.toString().includes(query)) ||
              (category.sub_category_count &&
                category.sub_category_count.toString().includes(query))
            );
          }
        );
      }
    },
    updatePageItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedItems = this.filteredCategoriesRecords.slice(startIndex, endIndex);
    },
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 310; // Adjust for header and toolbar
    },
  },
};
</script>

<style scoped>
/* Back Button */
.back-link {
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  color: #DB4C77 !important;
}

.back-link:hover {
  background-color: rgba(219, 76, 119, 0.1) !important;
  transform: translateX(-2px) !important;
}

.back-link .v-icon {
  margin-right: 8px !important;
}

/* Modern Data Table */
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

/* Responsive Design */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 16px;
    padding: 12px 16px;
  }
  
  .pagination-controls {
    gap: 4px;
  }
  
  .pagination-btn {
    min-width: 60px !important;
    font-size: 12px !important;
  }
  
  .page-numbers {
    gap: 2px;
  }
  
  .active-page,
  .inactive-page {
    min-width: 32px !important;
    height: 32px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 480px) {
  .table-footer {
    padding: 8px 12px;
  }
  
  .footer-info {
    font-size: 12px;
  }
  
  .pagination-btn {
    min-width: 50px !important;
    font-size: 11px !important;
  }
  
  .active-page,
  .inactive-page {
    min-width: 28px !important;
    height: 28px !important;
    font-size: 11px !important;
  }
}
</style>