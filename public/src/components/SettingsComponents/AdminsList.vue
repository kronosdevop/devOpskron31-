<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    
    <v-card flat>
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :height="windowHeight"
          :page="currentPage"
          :server-items-length="totalItems"
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
              <div class="text-h6 grey--text mb-2">No Admins Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or add a new admin.
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
              <div class="text-body-2 grey--text">Loading admins...</div>
            </div>
          </template>

          <!-- User Name -->
          <template v-slot:[`item.full_user_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-avatar size="32" class="mr-3" color="primary">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 14px"
                >
                  {{ item.full_user_name.substring(0, 1).toUpperCase() }}
                </span>
              </v-avatar> -->
              <div>
                <div class="font-weight-medium text-body-1">
                  {{ item.full_user_name }}
                </div>
              </div>
            </div>
          </template>

          <!-- User Email -->
          <template v-slot:[`item.user_email_id`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2"
                >mdi-email-outline</v-icon
              > -->
              <span class="caption text-truncate" style="max-width: 200px">{{
                item.user_email_id
              }}</span>
            </div>
          </template>

          <!-- Role -->
          <template v-slot:[`item.user_type`]="{ item }">
            <v-chip
              :color="getRoleColor(item.user_type)"
              :text-color="getRoleTextColor(item.user_type)"
              size="small"
              class="font-weight-medium"
              variant="flat"
            >
              {{ item.user_type }}
            </v-chip>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.action`]="{ item }">
            <div class="d-flex align-center">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    v-if="
                      item.user_type != 'OWNER' &&
                      $store.getters.GetUserObj.user.user_id != item.user_id
                    "
                    small
                    color="error"
                    @click="delete_admin(item)"
                    v-bind="props"
                    class="mr-2 cursor-pointer"
                    >mdi-delete</v-icon
                  >
                </template>
                <span>Remove Admin</span>
              </v-tooltip>

              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    small
                    color="primary"
                    @click="change_admin(item)"
                    v-if="
                      item.user_type == 'OWNER' &&
                      $store.getters.GetUserObj.user.user_id == item.user_id
                    "
                    v-bind="props"
                    class="cursor-pointer"
                  >
                    mdi-account-convert-outline
                  </v-icon>
                </template>
                <span>Change Ownership</span>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${Math.min(itemsPerPage, totalItems - (currentPage - 1) * itemsPerPage)} of ${totalItems} admins (Page ${currentPage} of ${pageCount})`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage <= 1"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="goToPage(currentPage - 1)"
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
                @click="goToPage(page)"
                :style="page === currentPage ? 'background: #DB4C77 !important; color: white !important;' : 'color: #666 !important;'"
              >
                {{ page }}
              </v-btn>
            </div>
            <v-btn
              :disabled="currentPage >= pageCount"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="goToPage(currentPage + 1)"
              style="color: #666 !important;"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <div v-if="componentCheck == 1">
      <AdminAccess
        :adminAccess="adminAccess"
        :userArray="userArray"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="close_dialogs"
      />
    </div>
    <div v-if="componentCheck == 2">
      <RemoveAdmin
        :deleteAdmin="deleteAdmin"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="close_dialogs"
        :rowInfo="rowInfo"
      />
    </div>
    <div v-if="componentCheck == 3">
      <ChangeOwner
        :ownerupdate="ownerupdate"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="ownerupdate = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */

// Imports
import ChangeOwner from "@/components/SettingsDialogs/ChangeOwner.vue";
import SnackBar from "@/components/SnackBar.vue";
import AdminAccess from "@/components/SettingsDialogs/AdminAccess.vue";
import RemoveAdmin from "@/components/SettingsDialogs/RemoveAdmin.vue";
import { list_users } from "@/graphql/queries.js";
import { get_all_users } from "@/mixins/GetAllUsers.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  // Components
  components: {
    AdminAccess,
    RemoveAdmin,
    SnackBar,
    ChangeOwner,
  },

  // Mixins
  mixins: [get_all_users],

  // Props
  props: {
    searchValue: {
      type: String,
      default: ""
    }
  },

  // Data
  data() {
    return {
      // Component data
      SnackBarComponent: {},
      windowHeight: 0,

      // Table properties
      tableData: [],
      tableLoading: false,

      // Table headers
      headers: [
        { title: "User Name", key: "full_user_name", sortable: false },
        { title: "User Email", key: "user_email_id", sortable: false },
        {
          title: "Role",
          key: "user_type",
          sortable: false,
        },
        {
          title: "Action",
          key: "action",
          sortable: false,
        },
      ],

      // Dialog states
      componentCheck: 0,
      adminAccess: false,
      deleteAdmin: false,
      ownerupdate: false,

      // User data
      userArray: [],
      rowInfo: {},

      // Search and pagination
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
    };
  },

  // Lifecycle hooks
  mounted() {
    this.windowHeight = window.innerHeight - 260;
  },

  async created() {
    await this.get_admins();
    await this.get_all_users();
  },

  // Watchers
  watch: {
    searchValue: {
      handler(newVal) {
        this.search = newVal;
        this.currentPage = 1;
      },
      immediate: true
    },

    search() {
      this.currentPage = 1;
    },

    currentPage(newVal) {
      // When the page changes, scroll to top of table (optional)
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },

    // Reset current page if it's out of bounds
    pageCount(newVal) {
      if (this.currentPage > newVal && newVal > 0) {
        this.currentPage = newVal;
      }
    }
  },

  // Computed properties
  computed: {
    filteredItems() {
      if (!this.search || this.search.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.search.toLowerCase().trim();
      return this.tableData.filter(
        (item) =>
          item.full_user_name.toLowerCase().includes(searchTerm) ||
          item.user_email_id.toLowerCase().includes(searchTerm) ||
          item.user_type.toLowerCase().includes(searchTerm)
      );
    },

    sortedAndPaginatedItems() {
      // Sort the filtered items
      return this.filteredItems.slice().sort((a, b) => {
        // Default sort by user name
        const aValue = a.full_user_name ? a.full_user_name.toLowerCase() : "";
        const bValue = b.full_user_name ? b.full_user_name.toLowerCase() : "";
        return aValue.localeCompare(bValue);
      });
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

  // Methods
  methods: {
    // Dialog management methods
    change_admin(item) {
      this.componentCheck = 3;
      this.rowInfo = item;
      this.ownerupdate = true;
    },

    async add_action() {
      this.userArray = [];
      await this.get_all_users();
      
      this.listUsers.forEach((element) => {
        if (!this.tableData.some((data) => data.user_id === element.user_id)) {
          this.userArray.push({
            username: element.full_user_name,
            userId: element.user_id,
          });
        }
      });
      
      this.userArray.sort((a, b) => a.username.localeCompare(b.username));
      this.componentCheck = 1;
      this.adminAccess = true;
    },

    delete_admin(item) {
      this.componentCheck = 2;
      this.deleteAdmin = true;
      this.rowInfo = item;
    },

    close_dialogs(val) {
      if (val == 0) {
        this.adminAccess = false;
        this.deleteAdmin = false;
      }
    },

    // Data fetching methods
    async get_admins() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      
      try {
        let result = await API.graphql(
          graphqlOperation(list_users, {
            organization_id: data.organization.organization_id,
            user_status: "ACTIVE",
            user_type: "ADMIN",
            limit: 1000,
            next_token: null,
          })
        );
        
        this.tableLoading = false;
        this.tableData = [];
        var response = result.data.list_users;
        
        response.details.forEach((element) => {
          if (element.user_type != "CHATBOT") {
            this.tableData.push({
              full_user_name: element.full_user_name,
              user_email_id: element.user_email_id,
              user_id: element.user_id,
              user_type: element.user_type,
            });
          }
        });
       
        this.$store.commit("SetadministrationCheck", true);
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

    // Navigation methods
    back_action() {
      this.$emit("backAction", 0);
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pageCount) {
        this.currentPage = page;
      }
    },

    // Search and sorting methods
    handleSearchChange(value) {
      this.search = value;
      this.currentPage = 1;
    },

    handleSortChange(value) {
      // Implement sorting logic here
    },

    // Styling methods
    getRoleColor(role) {
      switch (role) {
        case "OWNER":
          return "deep-purple lighten-4";
        case "ADMIN":
          return "blue lighten-4";
        case "SUPER_ADMIN":
          return "indigo lighten-4";
        default:
          return "grey lighten-4";
      }
    },

    getRoleTextColor(role) {
      switch (role) {
        case "OWNER":
          return "deep-purple darken-2";
        case "ADMIN":
          return "blue darken-2";
        case "SUPER_ADMIN":
          return "indigo darken-2";
        default:
          return "grey darken-2";
      }
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
      
      this.ownerupdate = false;
      this.adminAccess = false;
      this.deleteAdmin = false;
      this.get_admins();
      this.get_all_users();
    },
  },
};
</script>
<style scoped>
.font-weight-medium {
  font-weight: 500;
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