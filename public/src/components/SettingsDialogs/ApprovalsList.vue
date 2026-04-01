<template>
  <div >
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat >
      <!-- Top Controls: All in one row -->
      <!-- <v-toolbar flat class="mt-n4" >
        <v-spacer />
        <v-text-field
          v-model="search"
          placeholder="Search approvals..."
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
          @click:clear="search = ''"
        ></v-text-field>
      </v-toolbar> -->

      <!-- Data Table -->
      <v-card-text class="pa-4">
        <v-data-table
             :headers="headers"
          :items="paginatedItems"
          :loading="tableLoading"
          hide-default-footer
          class="modern-data-table"
          :height="windowHeight"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <!-- <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-approval</v-icon
              > -->
              <div class="text-h6 grey--text mb-2">No Approvals Found</div>
              <div class="text-body-2 grey--text">
                No system approval settings available.
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
              <div class="text-body-2 grey--text">Loading approvals...</div>
            </div>
          </template>

          <!-- Name -->
          <template v-slot:[`item.name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="20" color="primary" class="mr-3"
                >mdi-format-list-text</v-icon
              > -->
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ fetch_form_name(item.name) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Approval -->
          <template v-slot:[`item.is_approval`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                size="16"
                class="mr-2"
                :color="item.is_approval == true ? 'green' : 'red'"
              >
                {{
                  item.is_approval == true
                    ? "mdi-check-circle"
                    : "mdi-close-circle"
                }}
              </v-icon>
              <span
                class="caption"
                :class="item.is_approval == true ? 'green--text' : 'red--text'"
              >
                {{ item.is_approval == true ? "Yes" : "No" }}
              </span>
            </div>
          </template>

          <!-- Approval On -->
          <template v-slot:[`item.is_approve`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="primary" class="mr-2"
                >mdi-account-check</v-icon
              > -->
              <span class="caption">
                {{
                  item.is_approval == true
                    ? item.approvers_list[0].user_email_id ==
                      "New Reporting Manager"
                      ? "Reporting Manager"
                      : item.approvers_list[0].user_email_id == "LOCATION_HEAD"
                      ? "Location Head"
                      : item.approvers_list[0].user_email_id ==
                        "DEPARTMENT_HEAD"
                      ? "Group Head"
                      : fetch_user_name(item.approvers_list[0].user_email_id)
                    : "-"
                }}
              </span>
            </div>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              :disabled="item.name == 'CHANGE_REPORTING_MANAGER'"
              size="x-small"
              class="elevation-0 cardCss white--text"
              @click="get_approvals(item)"
            >
              Approvals
            </v-btn>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} approvals`
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
      <ApprovalDialog
        :approveDialog="approveDialog"
        :tableArray="tableArray"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="approveDialog = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */

// Imports
import SnackBar from "@/components/SnackBar.vue";
import ApprovalDialog from "@/components/DialogsList/ApprovalDialog.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  // Components
  props:{
    globalSearch:{
      type:String,
      default:'ALL'
    }
  },
  components: {
    ApprovalDialog,
    SnackBar,
  },

  // Mixins
  mixins: [get_Org_details, get_all_org_users],

  // Data
  data() {
    return {
      // Table properties
      height: 0,
      windowHeight: 0,
      fixed: true,
      tableLoading: false,
      tableData: [],

      // Table headers
      headers: [
        { title: "Name", value: "name", sortable: false },
        { title: "Approval", value: "is_approval", sortable: false },
        { title: "Approval On", value: "is_approve", sortable: false },
        { title: "Actions", value: "actions", sortable: false },
      ],

      // Dialog states
      approveDialog: false,
      componentCheck: 0,
      rowInfo: {},

      // Data arrays
      allUSersNames: [],
      tableArray: [],

      // Component data
      SnackBarComponent: {},
      toggle_exclusive: "approvals",

      // Search and pagination
      search: "",
      currentPage: 1,
      totalCount: 0,
      itemsPerPage: 20,
    };
  },

  // Lifecycle hooks
  mounted() {
    this.windowHeight = window.innerHeight - 250;
  },

  async created() {
    this.height = window.innerHeight - 230;
    this.tableLoading = true;
    
    await Promise.all([this.get_Org_details(), this.get_all_org_users()]);

    this.fetch_details();
    this.allUSersNames = this.orgUsers;
    this.tableLoading = false;
  },

  // Watchers
  watch: {
    search() {
      this.currentPage = 1;
    },

    currentPage() {
      // When the page changes, scroll to top of table (optional)
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  // Computed properties
  computed: {
  filteredItems() {
  const search =
    this.globalSearch  .toLowerCase();

  if (!search) return this.tableData;
  return this.tableData.filter(item =>
    this.fetch_form_name(item.name)
      .toLowerCase()
      .includes(search)
  );
},


    sortedAndPaginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        // Default sort by name
        const aValue = this.fetch_form_name(a.name).toLowerCase();
        const bValue = this.fetch_form_name(b.name).toLowerCase();
        return aValue.localeCompare(bValue);
      });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },
    paginatedItems() {
      const start =
        (this.currentPage - 1) * this.itemsPerPage;

      return this.filteredItems.slice(
        start,
        start + this.itemsPerPage
      );
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
    // Data fetching methods
    fetch_details() {
      this.tableData = [];
      this.tableArray = [];
      this.tableData = this.orgDetails.organization.member_management_settings;
      this.tableArray = this.orgDetails.organization.member_management_settings;
    },

    // Dialog management methods
    get_approvals(val) {
      this.componentCheck = 1;
      this.rowInfo = val;
      this.approveDialog = true;
    },

    // Utility methods
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },

    fetch_form_name(val) {
      var data = "";
      switch (val) {
        case "ADD_MEMBER":
          data = "Add Member";
          break;
        case "REMOVE_MEMBER":
          data = "Remove Member";
          break;
        case "CHANGE_DESIGNATION":
          data = "Change Designation";
          break;
        case "CHANGE_DEPARTMENT":
          data = "Change Group";
          break;
        case "CHANGE_LOCATION":
          data = "Change Location";
          break;
        case "EDIT_MEMBER":
          data = "Update Profile Details";
          break;
        case "CHANGE_REPORTING_MANAGER":
          data = "Change Reporting Manager";
          break;
        case "UPDATE_PROFILE_PIC":
          data = "Update Profile Picture";
          break;
        case "BROADCAST_MESSAGE":
          data = "Broadcast Message";
          break;
        case "DATA_CORRECTION":
          data = "Data Correction";
          break;
        case "RETIRE_ASSET":
          data = "Retire Asset";
          break;
        case "PROJECT_MANAGEMENT":
          data = "Projects";
          break;
        case "PURCHASE_ORDER_REQUEST":
          data = "Purchase Order ";
          break;
        case "PROJECT_CREATION_REQUEST":
          data = "Project Creation Request";
          break;
        case "PROJECT_EDIT_REQUEST":
          data = "Project Edit Request";
          break;
        case "PROJECT_PROGRESS_REQUEST":
          data = "Project Progress Request";
          break;
        case "SUPPLIER_CREATION_REQUEST":
          data = "Supplier/Vendors Creation Request";
          break;
        case "PRODUCT_REORDER":
          data = "Product Reorder";
          break;
        default:
          data = val;
      }
      return data;
    },

    // Sorting methods
    handleSortChange(value) {
      // Implement sorting logic here
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

    async success_info(val) {
      this.approveDialog = false;
      
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      
      await this.get_Org_details();
      this.fetch_details();
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
</style>