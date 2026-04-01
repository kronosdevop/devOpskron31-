<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  
      <v-card flat class="ma-2">
        <!-- Data Table -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="
              $store.getters.GetFormObject.directory_visibility_type == 'USERS'
                ? subscribers
                : dataHeaders
            "
            :items="paginatedItems"
            :loading="tableLoading"
            :sort-by="['full_user_name']"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="totalCount"
            hide-default-footer
            class="modern-data-table"
            density="comfortable"
            hover
            :fixed-header="true"
            :height="windowHeight"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-group</v-icon>
                <div class="text-h6 text-grey mb-2">No Members Found</div>
                <div class="text-body-2 text-grey">
                  This directory has no members yet.
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
                <div class="text-body-2 text-grey">Loading members...</div>
              </div>
            </template>

            <!-- Name Column -->
            <template v-slot:[`item.full_user_name`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="primary" class="mr-2">mdi-account</v-icon>
                <span class="caption font-weight-medium">{{ item.full_user_name }}</span>
              </div>
            </template>

            <!-- Email Column -->
            <template v-slot:[`item.user_email_id`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="grey" class="mr-2">mdi-email</v-icon>
                <span class="caption font-weight-medium">{{ item.user_email_id }}</span>
                <v-icon
                  size="16"
                  color="pink"
                  class="ml-2"
                  v-if="
                    item.user_email_id ==
                    $store.getters.GetFormObject.directory_created_by
                  "
                >
                  mdi-account
                </v-icon>
              </div>
            </template>

            <!-- Actions Column -->
            <template v-slot:[`item.actions`]="{ item }">
              <div class="d-flex align-center">
                <v-tooltip location="top" v-if="
                  item.user_email_id !=
                  $store.getters.GetFormObject.directory_created_by
                ">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      size="small"
                      color="red"
                      class="ml-2"
                      @click="delete_user(item)"
                    >
                      mdi-delete
                    </v-icon>
                  </template>
                  <span>Remove Member</span>
                </v-tooltip>
                <span class="caption text-grey" v-else>-</span>
              </div>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalCount === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${totalCount} members`
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
      <AddDeleteUsers
        :addDeleteMember="addDeleteMember"
        :actionType="actionType"
        :rowInfo="rowInfo"
        v-on:successMsg="succes_info"
        v-on:errorMsg="error_info"
        @clicked="close_action"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

// Imports
import { list_directory_users } from "@/graphql/queries.js";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import AddDeleteUsers from "@/components/LookitUPDirectiory/AllDialogs/AddDeleteUsers.vue";

export default {
  // Components
  components: {
    SnackBar,
    AddDeleteUsers,
  },

  // Data
  data() {
    return {
      // Table headers
      subscribers: [
        { title: "Name", key: "full_user_name", sortable: false },
        { title: "Email", key: "user_email_id", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ],
      dataHeaders: [
        { title: "Name", key: "full_user_name", sortable: false },
        { title: "Email", key: "user_email_id", sortable: false },
      ],

      // Table data and loading state
      tableData: [],
      tableLoading: false,

      // Dialog states
      addDeleteMember: false,
      componentCheck: 0,

      // Component data
      rowInfo: {},
      actionType: "",
      SnackBarComponent: {},

      // Pagination properties
      currentPage: 1,
      itemsPerPage: 10,
      searchQuery: '',
      windowHeight: 0,
    };
  },

  // Lifecycle hooks
  created() {
    this.fetch_subscribers_users();
    this.updateWindowHeight();
  },

  mounted() {
    window.addEventListener('resize', this.updateWindowHeight);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWindowHeight);
  },

  // Computed properties
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter(member => 
        (member.full_user_name && member.full_user_name.toLowerCase().includes(searchTerm)) ||
        (member.user_email_id && member.user_email_id.toLowerCase().includes(searchTerm))
      );
    },

    totalCount() {
      return this.filteredItems.length;
    },

    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },

    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
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

  // Watchers
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },

    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  // Methods
  methods: {
    // Data fetching methods
    async fetch_subscribers_users() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_directory_users, {
            input: {
              directory_id: this.$store.getters.GetFormObject.directory_id,
            },
          })
        );
        
        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.list_directory_users);
        
        if (response.Status == "Success") {
          this.tableData = response.Data;
          localStorage.setItem(
            "directoryMembers",
            JSON.stringify(response.Data)
          );
        }
      } catch (error) {
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

    // User management methods
    delete_user(value) {
      if (
        value.user_email_id ==
        this.$store.getters.GetFormObject.directory_created_by
      ) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            " You can't delete yourself from the directory since you're the owner.",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.actionType = "Delete";
        this.componentCheck = 1;
        this.addDeleteMember = true;
        this.rowInfo = value;
      }
    },

    // Dialog management methods
    close_action() {
      this.addDeleteMember = false;
      this.actionType = "";
    },

    // Notification methods
    succes_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      
      this.addDeleteMember = false;
      this.actionType = "";
      this.tableData = [];
      this.currentPage = 1;
      this.searchQuery = '';
      this.fetch_subscribers_users();
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addDeleteMember = true;
    },

    // Utility methods
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 310; // Adjust height based on header and padding
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

/* Legacy styles cleanup - keeping only what's needed */
.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
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