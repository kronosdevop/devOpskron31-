<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <ExportAuditTrailDialog
      :DialogExportAuditTrail="DialogExportAuditTrail"
      @clicked="DialogExportAuditTrailEmit"
      :tableData="tableData"
    />

    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2">
        <!-- Data Table -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="headers"
            :items="paginatedItems"
            :loading="tableLoading"
            :sort-by="['action_time']"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="totalItems"
            hide-default-footer
            class="modern-data-table"
            density="comfortable"
            hover
            multi-sort
            :fixed-header="true"
            :height="height"
            @update:sort-by="handleSortChange"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4"
                  >mdi-history</v-icon
                >
                <div class="text-h6 grey--text mb-2">No Audit Logs Found</div>
                <div class="text-body-2 grey--text">
                  Try adjusting your filter criteria or date range.
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
                <div class="text-body-2 grey--text">Loading audit logs...</div>
              </div>
            </template>

            <!-- Action Date -->
            <template v-slot:[`item.action_time`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="grey" class="mr-2"
                  >mdi-clock-outline</v-icon
                >
                <span class="caption">{{ fetch_value(item.action_time) }}</span>
              </div>
            </template>

            <!-- App -->
            <template v-slot:[`item.app`]="{ item }">
              <span class="caption font-weight-medium">{{
                fetch_audit_type(item.app)
              }}</span>
            </template>

            <!-- Source -->
            <template v-slot:[`item.init_from`]="{ item }">
              <span class="caption font-weight-medium">{{
                item.init_from === 1 ? "Web" : "Phone"
              }}</span>
            </template>

            <!-- Action Taken By -->
            <template v-slot:[`item.user_name`]="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="24" class="mr-2" color="primary">
                  <span
                    class="white--text font-weight-medium"
                    style="font-size: 12px"
                  >
                    {{
                      item.user_name
                        ? item.user_name.substring(0, 1).toUpperCase()
                        : "U"
                    }}
                  </span>
                </v-avatar>
                <span class="caption font-weight-medium">{{
                  item.user_name || "Unknown User"
                }}</span>
              </div>
            </template>

            <!-- Action Message -->
            <template v-slot:[`item.description`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="grey" class="mr-2"
                  >mdi-message-text-outline</v-icon
                >
                <span class="caption text-truncate" style="max-width: 300px">{{
                  item.description
                }}</span>
              </div>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalItems === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${totalItems} audit logs`
              }}
            </div>
            <div class="pagination-controls">
              <v-btn
                :disabled="currentPage === 1"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage - 1"
                style="color: #666 !important"
              >
                Previous
              </v-btn>
              <div class="page-numbers">
                <v-btn
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === currentPage ? 'elevated' : 'text'"
                  size="small"
                  :class="
                    page === currentPage ? 'active-page' : 'inactive-page'
                  "
                  @click="currentPage = page"
                  :style="
                    page === currentPage
                      ? 'background: #DB4C77 !important; color: white !important;'
                      : 'color: #666 !important;'
                  "
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
                style="color: #666 !important"
              >
                Next
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
<script>
/* eslint-disable */

// Imports
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import { list_all_audit_logs } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ExportAuditTrailDialog from "@/components/ExportAuditTrailDialog.vue";

export default {
  // Props
  props: {
    DialogExportAuditTrail: Boolean,
    openExportDialog: Boolean,
    fromDate: {
      type: String,
      default: "",
    },
    toDate: {
      type: String,
      default: "",
    },
    statusType: {
      type: String,
      default: "ALL",
    },
    sourceType: {
      type: String,
      default: "0",
    },
  },

  // Components
  components: {
    SnackBar,
    ExportAuditTrailDialog,
  },

  // Emits
  emits: ["filter-applied"],

  // Data
  data() {
    return {
      // Table properties
      dataArray: [],
      tableData: [],
      tableLoading: false,
      height: 0,

      // Table headers
      headers: [
        { title: "Action Date", key: "action_time", sortable: false },
        { title: "App", key: "app", sortable: false },
        { title: "Source", key: "init_from", sortable: false },
        { title: "Action Taken By", key: "user_name", sortable: false },
        { title: "Action Message", key: "description", sortable: false },
      ],

      // Filter properties
      selectStatusType: this.statusType,
      selectSourceType: this.sourceType,
      sortBy: "audit_created_on",
      sortDesc: true,
      fixed: true,

      // Pagination properties
      next_token: null,
      currentPage: 1,
      itemsPerPage: 20,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },

      // Date properties
      selectedDate: "",
      minmonth: "",
      date: new Date().toISOString().substr(0, 10),
      todate: new Date().toISOString().substr(0, 10),
      computedDateFormatted: "",
      dataFormatted: "",
      tempDate: null,
      tempDateTo: null,

      // UI state properties
      modal: false,
      endmodal: false,
      goLoading: false,
      datePicker: false,
      datePickerTo: false,
      DialogExportAuditTrail: false,

      // Component data
      SnackBarComponent: {},
    };
  },

  // Lifecycle hooks
  created() {
    this.height = window.innerHeight - 250;

    // Set current date as default for both date pickers
    const currentDate = new Date().toISOString().substr(0, 10);
    this.computedDateFormatted = currentDate;
    this.dataFormatted = currentDate;
    this.tempDate = currentDate;
    this.tempDateTo = currentDate;

    // Initialize with props if provided
    if (this.fromDate) {
      this.computedDateFormatted = this.parseDateFromDisplay(this.fromDate);
    }
    if (this.toDate) {
      this.dataFormatted = this.parseDateFromDisplay(this.toDate);
    }

    this.fetch_audit_logs();
  },

  // Watchers
  watch: {
    openExportDialog(val) {
      if (val) {
        this.DialogExportAuditTrail = true;
      }
    },
    // Watch for prop changes - only update local values, don't call API
    fromDate(newVal) {
      if (newVal) {
        this.computedDateFormatted = this.parseDateFromDisplay(newVal);
      }
    },

    toDate(newVal) {
      if (newVal) {
        this.dataFormatted = this.parseDateFromDisplay(newVal);
      }
    },

    statusType(newVal) {
      this.selectStatusType = newVal;
    },

    sourceType(newVal) {
      this.selectSourceType = newVal;
    },

    currentPage(newVal, oldVal) {
      // When the page changes, check if we need to load more data
      if (newVal > oldVal && this.next_token) {
        // User is going to next page and we have more data to load
        this.fetch_audit_logs();
      } else {
        // Just scroll to top of table for same page or going back
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },

    tableData() {
      // Reset to first page when data changes
      this.currentPage = 1;
    },
  },

  // Computed properties
  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },

    dataDisplayFormatted() {
      return this.displayFormatDate(this.dataFormatted);
    },

    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },

    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
    },

    totalItems() {
      return this.tableData.length;
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
    async DialogExportAuditTrailEmit(Toggle) {
      this.DialogExportAuditTrail = false;
      this.AuditTrialEmit(Toggle);
      if (Toggle == 2) {
        await this.fetch_audit_logs();
      }
    },
    AuditTrialEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    // Date formatting methods
    displayFormatDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    parseDateFromDisplay(displayDate) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      if (!displayDate) return "";
      const parts = displayDate.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return displayDate;
    },

    // Date picker methods
    saveDate() {
      this.computedDateFormatted = this.tempDate
        ? this.formatDate(this.tempDate)
        : "";
      this.datePicker = false;

      // Reset To Date if From Date is after current To Date
      if (this.computedDateFormatted && this.dataFormatted) {
        if (this.computedDateFormatted > this.dataFormatted) {
          this.dataFormatted = this.computedDateFormatted;
          this.tempDateTo = this.computedDateFormatted;
        }
      }
    },

    saveDateTo() {
      this.dataFormatted = this.tempDateTo
        ? this.formatDate(this.tempDateTo)
        : "";
      this.datePickerTo = false;
    },

    check_from_date(date) {
      this.$refs.dialog1.save(date);
      this.todate = new Date().toISOString().substr(0, 10);
    },

    // Data fetching methods
    async fetch_audit_logs() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      // Convert display dates to API format if they come from props
      let startTime = this.computedDateFormatted;
      let endTime = this.dataFormatted;

      // If we have props with display format dates, convert them
      if (this.fromDate && this.fromDate.includes("/")) {
        startTime = this.parseDateFromDisplay(this.fromDate);
      }
      if (this.toDate && this.toDate.includes("/")) {
        endTime = this.parseDateFromDisplay(this.toDate);
      }

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_audit_logs, {
            input: {
              organization_id: data.organization.organization_id,
              nextToken: this.next_token,
              limit: 100,
              audit_type: this.selectStatusType,
              from_date: this.formatDate(startTime),
              to_date: this.formatDate(endTime),
              source: this.selectSourceType,
            },
          })
        );

        this.tableLoading = false;
        this.goLoading = true;
        var response = JSON.parse(result.data.list_all_audit_logs);

        if (response.Status == "ERROR") {
          this.tableLoading = false;
          this.goLoading = false;

          // Only clear data if this is the first load (no next_token) or filter reset
          if (!this.next_token && this.tableData.length === 0) {
            this.tableData = [];
          }
        } else {
          this.goLoading = false;
          this.next_token = response.nextToken;

          if (this.next_token) {
            // If we have more data, concatenate to existing array
            let array = this.tableData.concat(response.data);
            this.tableData = array;
          } else {
            // If no more data, concatenate what we have (don't replace)
            if (response.data && response.data.length > 0) {
              let array = this.tableData.concat(response.data);
              this.tableData = array;
            }
          }

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.audit_id === obj.audit_id)
          );
          this.tableData = uniqueArrayOfObjects;

          this.$store.commit("SetadministrationCheck", true);
          localStorage.setItem("auditLogs", JSON.stringify(this.tableData));
          this.tableLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;
        this.goLoading = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    get_audit_logs_Pagination() {
      if (this.next_token) {
        this.fetch_audit_logs();
      }
    },

    // Filter methods
    filter_todata() {
      this.tableData = [];
      this.next_token = null;
      this.currentPage = 1;
      this.goLoading = true;
      this.fetch_audit_logs();

      // Emit filter applied event
      this.$emit("filter-applied", {
        fromDate: this.computedDateDisplay,
        toDate: this.dataDisplayFormatted,
        statusType: this.selectStatusType,
        sourceType: this.selectSourceType,
      });
    },

    clearFiltersAndReset() {
      // Reset all data and pagination state
      this.tableData = [];
      this.next_token = null;
      this.currentPage = 1;
      this.goLoading = true;
      this.fetch_audit_logs();

      // Emit filter applied event with cleared filters
      this.$emit("filter-applied", {
        fromDate: this.computedDateDisplay,
        toDate: this.dataDisplayFormatted,
        statusType: this.selectStatusType,
        sourceType: this.selectSourceType,
      });
    },

    filter_data(val) {
      this.todate = new Date().toISOString().substr(0, 10);
      this.tableData = [];
      this.next_token = null;
      this.fetch_audit_logs();
    },

    // Sorting methods
    handleSortChange(value) {
      // Implement sorting logic here
      console.log("Sort changed:", value);
    },

    // Navigation methods
    back_action() {
      this.$emit("backAction", 0);
    },

    // Utility methods
    get_orgdate(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },

    fetch_audit_type(val) {
      var data = "";
      switch (val) {
        case "ALL":
          data = "All";
          break;
        case "WORKFLOW":
          data = "Workflow";
          break;
        case "FORM":
          data = "Form";
          break;
        case "SLOT_BOOKING":
          data = "Slot Booking";
          break;
        case "TASK":
          data = "Task";
          break;
        case "CHANNEL":
          data = "Channel";
          break;
        case "DIRECTORY":
          data = "Directory";
          break;
        case "TIMESHEET":
          data = "Timesheet";
          break;
        case "DASHBOARD":
          data = "Dashboard";
          break;
        case "TICKET_MANAGEMENT":
          data = "Ticket Management";
          break;
        case "CABINET":
          data = "Cabinet";
          break;
        case "STICHH":
          data = "Stichh";
          break;
        case "EXPENSE":
          data = "Expense";
          break;
        case "EVENTS":
          data = "Events";
          break;
        case "PRESENCE":
          data = "Presence";
          break;
        default:
          data = "";
          break;
      }
      return data;
    },

    fetch_value(val) {
      return formatedatetime(val);
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

.card-container {
  position: relative;
}

/* Table Footer Styles */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 12px 12px;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
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
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(219, 76, 119, 0.1) !important;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
  transition: all 0.2s ease;
}

.inactive-page:hover {
  background: rgba(219, 76, 119, 0.1) !important;
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

/* Responsive Design */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>
