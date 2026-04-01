<template>
  <div>
    <div>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      
      <div class="card-container" style="position: relative">
        <v-card class="" flat>
          <v-card-text>
            <!-- Top Controls: All in one row -->
            <v-row
              class="align-center px-6 pt-6 pb-2"
              
            >
              <v-col cols="auto" class="d-flex align-center">
                <v-icon class="mr-3" color="primary" size="large"
                  >mdi-account-group</v-icon
                >
                <span class="font-weight-bold text-h6"
                  >Groups </span
                >
              </v-col>
              <v-spacer />

              <!-- Search Field -->
              <v-col cols="auto" class="d-flex align-center">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Search groups..."
                  prepend-inner-icon="mdi-magnify"
                  variant="solo"
                  hide-details
                  density="compact"
                  class="search-pill mr-4"
                  style="
                    min-width: 280px;
                    max-width: 280px;
                    height: 32px;
                    border-radius: 999px;
                    background: #fff;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
                    font-size: 14px;
                  "
                  clearable
                  @click:clear="searchQuery = ''"
                ></v-text-field>
              </v-col>

              <!-- Add Button -->
              <v-col cols="auto" class="d-flex align-center">
                <v-btn
                  @click="add_action()"
                  class="cardCss text-capitalize"
                  dark
                  size="small"
                  prepend-icon="mdi-plus"
                  flat
                >
                  Add Group
                </v-btn>
              </v-col>

              <!-- Back Button -->
              <v-col cols="auto" class="d-flex align-center">
                <v-btn 
                  text
                  @click="goBack"
                  class="back-link ml-4"
                  color="primary"
                   size="small"
                >
                  <v-icon left>mdi-arrow-left</v-icon>
                  Back 
                </v-btn>
              </v-col>
            </v-row>

            <v-data-table
              :headers="headers"
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
                    >mdi-account-group-outline</v-icon
                  >
                  <div class="text-h6 grey--text mb-2">No Groups Found</div>
                  <div class="text-body-2 grey--text">
                    Try adjusting your search criteria or add a new group.
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
                  <div class="text-body-2 grey--text">Loading groups...</div>
                </div>
              </template>

              <!-- Group Name -->
              <template v-slot:[`item.department_name`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="20" color="primary" class="mr-3"
                    >mdi-account-group</v-icon
                  > -->
                  <div>
                    <div class="font-weight-medium text-body-2">
                      {{ item.department_name || "N/A" }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Group Head -->
              <template v-slot:[`item.department_head`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-avatar size="24" color="primary" class="mr-2">
                    <span
                      class="white--text font-weight-medium"
                      style="font-size: 10px"
                    >
                      {{
                        (item.department_head || "H")
                          .substring(0, 1)
                          .toUpperCase()
                      }}
                    </span>
                  </v-avatar> -->
                  <span class="caption">
                    {{ item.department_head || "N/A" }}
                  </span>
                </div>
              </template>

              <!-- Actions -->
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex align-center justify-center">
                  <v-btn
                    icon
                    color="blue"
                    size="small"
                    variant="text"
                    @click.stop="edit_department(item)"
                    class="cursor-pointer mr-2"
                  >
                    <v-icon size="18">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    color="red"
                    size="small"
                    variant="text"
                    @click.stop="delete_user_items(item)"
                    class="cursor-pointer"
                  >
                    <v-icon size="18">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>

            <!-- Modern Table Footer -->
            <div class="table-footer">
              <div class="footer-info">
                {{
                  totalItems === 0
                    ? "No Results"
                    : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} groups`
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
      </div>

      <div v-if="componentCheck == 1">
        <AddDepartment
          :addDialog="addDialog"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @clicked="close_dialogs"
        />
      </div>
      <div v-if="componentCheck == 2">
        <DeleteDepartment
          :deleteDialog="deleteDialog"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @clicked="close_dialogs"
          :rowInfo="rowInfo"
        />
      </div>
      <div v-if="componentCheck == 3">
        <EditMasterhead
          :editMasterDailog="editMasterDailog"
          :rowInfo="rowInfo"
          :tabName="tabName"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @clicked="editMasterDailog = false"
        />
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */

// Imports
import SnackBar from "@/components/SnackBar.vue";
import AddDepartment from "@/components/SettingsDialogs/AddDepartment.vue";
import DeleteDepartment from "@/components/SettingsDialogs/DeleteDepartment.vue";
import EditMasterhead from "@/components/SettingsDialogs/EditMasterhead.vue";
import { list_all_departments } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  // Components
  components: {
    AddDepartment,
    SnackBar,
    DeleteDepartment,
    EditMasterhead,
  },

  // Data
  data() {
    return {
      // Table properties
      tableData: [],
      tableLoading: false,
      fixed: true,
      windowHeight: 0,

      // Search and pagination
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: [{ key: "department_name", order: "asc" }],

      // Table headers
      headers: [
        {
          title: "Group Name",
          value: "department_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Group Head",
          value: "department_head",
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

      // Dialog states
      addDialog: false,
      deleteDialog: false,
      editMasterDailog: false,
      componentCheck: 0,

      // Component data
      SnackBarComponent: {},
      rowInfo: {},
      tabName: "",
      roleActions: "roleCreation",
    };
  },

  // Computed properties
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter(
        (item) =>
          (item.department_name &&
            item.department_name.toLowerCase().includes(searchTerm)) ||
          (item.department_head &&
            item.department_head.toLowerCase().includes(searchTerm))
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

  // Watchers
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

  // Lifecycle hooks
  created() {
    this.fetch_master_departments();
    this.windowHeight = window.innerHeight - 310;
  },

  // Methods
  methods: {
    // Sorting methods
    getSortValue(value, key) {
      if (!value) return "";
      if (key === "department_name" || key === "department_head") {
        return value.toLowerCase();
      }
      return value;
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },

    // Data fetching methods
    async fetch_master_departments() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_departments, {
            organization_id: data.organization.organization_id,
            department_status: "ACTIVE",
            limit: 500,
            next_token: null,
          })
        );
        
        this.tableLoading = false;
        var response = result.data.list_all_departments;

        // Check multiple possible data structures
        let departmentsData = null;

        if (response.details && Array.isArray(response.details)) {
          departmentsData = response.details;
        } else if (response.data && Array.isArray(response.data)) {
          departmentsData = response.data;
        } else if (response.items && Array.isArray(response.items)) {
          departmentsData = response.items;
        } else if (response.departments && Array.isArray(response.departments)) {
          departmentsData = response.departments;
        } else {
          departmentsData = [];
        }

        this.tableData = departmentsData || [];
      } catch (error) {
        this.tableData = [];
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

    // Dialog management methods
    add_action() {
      this.componentCheck = 1;
      this.addDialog = true;
    },

    delete_user_items(item) {
      this.rowInfo = item;
      this.componentCheck = 2;
      this.deleteDialog = true;
    },

    edit_department(item) {
      this.rowInfo = item;
      this.tabName = "Group";
      this.editMasterDailog = true;
      this.componentCheck = 3;
    },

    close_dialogs(val) {
      if (val == 0) {
        this.addDialog = false;
        this.deleteDialog = false;
      }
    },

    // Navigation methods
    goBack() {
      this.$emit('backAction');
    },

    // Notification methods
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
      this.addDialog = false;
      this.deleteDialog = false;
      this.editMasterDailog = false;
      this.fetch_master_departments();
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