<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <div class="task-card-container" style="position: relative">
      <v-card flat class="ma-2" >
        <!-- Header Row -->
        <v-row
          class="align-center px-6 pt-6 pb-2"
        >
         
        </v-row>

        <!-- Data Table -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="headers"
            :items="paginatedTasks"
            :fixed-header="fixed"
            :loading="tableLoading"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            :items-per-page="itemsPerPage"
            density="comfortable"
            hide-default-footer
            class="modern-data-table"
            hover
            multi-sort
            :height="tableHeight"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4"
                  >mdi-format-list-checks</v-icon
                >
                <div class="text-h6 text-grey mb-2">No Tasks Found</div>
                <div class="text-body-2 text-grey">
                  Try adjusting your search criteria or filters.
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
                <div class="text-body-2 text-grey">Loading tasks...</div>
              </div>
            </template>

            <template v-slot:[`item.task_name`]="{ item }">
              <v-tooltip bottom v-if="item.task_name || item.task_description">
                <template v-slot:activator="{ on }">
                  <div
                    class="caption font-weight-medium task-name-wrap"
                    v-on="on"
                  >
                    {{
                      truncateText(
                        item.task_description
                          ? item.task_description
                          : item.task_name
                      )
                    }}
                  </div>
                </template>
                <div class="textWrap" style="max-width: 250px">
                  {{
                    item.task_description
                      ? item.task_description
                      : item.task_name
                  }}
                </div>
              </v-tooltip>
              <div v-else class="caption font-weight-medium task-name-wrap">
                {{ item.task_name }}
              </div>
            </template>

            <template v-slot:[`item.enabled_recursion`]="{ item }">
              <v-chip
                x-small
                :color="item.enabled_recursion === true ? 'orange' : 'blue'"
                text-color="white"
                class="font-weight-medium"
              >
                {{ item.enabled_recursion === true ? "Recurring" : "One time" }}
              </v-chip>
            </template>

            <template v-slot:[`item.task_assign_to`]="{ item }">
              <span
                v-if="item.task_type && item.task_type === 'ALL_MEMBERS'"
                style="font-weight: bold; color: blue"
              >
                All Members
              </span>
              <span v-else>
                {{ item.task_assign_to ? item.task_assign_to.join(", ") : "" }}
              </span>
            </template>

            <template v-slot:[`item.task_created_on`]="{ item }">
              <span class="caption">{{
                fetch_value(item.task_created_on)
              }}</span>
            </template>

            <template v-slot:[`item.task_completion_date`]="{ item }">
              <span class="caption">{{
                fetch_org_format(item.task_completion_date)
              }}</span>
            </template>

            <template v-slot:[`item.task_completion_percentage`]="{ item }">
              <span>{{ item.task_completion_percentage + "%" }}</span>
            </template>

            <template v-slot:[`item.task_progress_status`]="{ item }">
              <v-chip
                small
                :color="getStatusColor(item.task_progress_status)"
                text-color="white"
                class="font-weight-medium"
              >
                {{ item.task_progress_status }}
              </v-chip>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <span
                    class="action-icon-compact"
                    v-on="on"
                    @click="openAssignByMeDialog(item)"
                  >
                    <v-icon small color="primary">mdi-eye</v-icon>
                  </span>
                </template>
                <span>View Details</span>
              </v-tooltip>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                filteredTasks.length === 0
                  ? "No Results"
                  : `Showing ${paginatedTasks.length} of ${filteredTasks.length} tasks`
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
    <div v-if="componentcheck == 1">
      <AssignByMe
        :assignByMeDialog="assignByMeDialog"
        :rowInfo="rowInfo"
        @clicked="assignByMeDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <!-- Filter Drawer -->
    <v-navigation-drawer
      v-model="showFilterDrawer"
      location="right"
      temporary
      width="320"
      class="filter-drawer"
    >
      <v-card flat class="h-100">
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <span class="text-h6">Filter Tasks</span>
          <v-btn icon @click="showFilterDrawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <div class="mb-4">
            <h3 class="text-subtitle-1 mb-3">Filter by Status</h3>
            <v-radio-group
              v-model="localSelectedStatusFilter"
              @update:model-value="handleFilterChange"
              hide-details
            >
              <v-radio value="ALL" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">All</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ totalTaskCount }}
                    </v-chip>
                  </div>
                </template>
              </v-radio>

              <v-radio value="COMPLETED" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">Completed</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ completedTaskCount }}
                    </v-chip>
                  </div>
                </template>
              </v-radio>

              <v-radio value="INPROGRESS" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">In Progress</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ upcomingTaskCount + overdueTaskCount }}
                    </v-chip>
                  </div>
                </template>
              </v-radio>

              <v-radio value="HOLD" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">Hold</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ onholdTaskCount }}
                    </v-chip>
                  </div>
                </template>
              </v-radio>

              <v-radio value="WITHDRAWN" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">Withdrawn</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ withdrawnTaskCount }}
                    </v-chip>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </div>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="clearFilter">
            Clear Filter
          </v-btn>
          <v-btn color="primary" @click="applyFilter">
            Apply Filter
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
  </div>
</template>

<script>
/* eslint-disable */

// Imports
import { format_Date } from "@/JsonFiles/DateFormate.js";
import AssignByMe from "@/components/TaskDetailsApp/TaskPopups/AssignByMe.vue";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { list_assigned_tasks } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  // Components
  components: {
    AssignByMe,
  },

  // Props
  props: {
    selectedFilter: {
      type: String,
      default: "ALL",
    },
    searchValue: {
      type: String,
      default: "",
    },
    selectedStatusFilter: {
      type: String,
      default: "ALL",
    },
  },

  // Data
  data() {
    return {
      // Table properties
      fixed: true,
      tableLoading: false,
      tableData: [],
      tableHeight: 0,

      // Table headers
      headers: [
        { title: "Task Details", key: "task_name", sortable: false },
        { title: "Task Frequency", key: "enabled_recursion", sortable: false },
        { title: "Assign To", key: "task_assign_to", sortable: false },
        { title: "Assigned On", key: "task_created_on", sortable: false },
        {
          title: "Completion Date",
          key: "task_completion_date",
          sortable: false,
        },
        {
          title: "Task Progress",
          key: "task_completion_percentage",
          sortable: false,
        },
        { title: "Status", key: "task_progress_status", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ],

      // Dialog states
      componentcheck: 0,
      assignByMeDialog: false,
      rowInfo: {},

      // Data arrays
      masterData: [],
      selectedCard: null,

      // Pagination properties
      currentPage: 1,
      itemsPerPage: 20,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },

      // Filter properties
      filterMenu: false,
      showFilterDrawer: false,
      localSelectedStatusFilter: "ALL",
    };
  },

  // Lifecycle hooks
  created() {
    const storedData = localStorage.getItem("recurssionEnabled");
    this.list_task_assigned_by_me(storedData);
  },

  mounted() {
    this.tableHeight = window.innerHeight - 260;
    this.emitFilterCounts();
  },

  // Watchers
  watch: {
    searchValue() {
      this.currentPage = 1;
    },

    filteredTasks() {
      if (this.currentPage > this.pageCount) {
        this.currentPage = 1;
      }
    },

    selectedStatusFilter: {
      handler(newVal) {
        this.localSelectedStatusFilter = newVal;
        this.emitFilterCounts();
      },
      immediate: true
    },
  },

  // Computed properties
  computed: {
    overdueTaskCount() {
      if (!this.masterData || this.masterData.length === 0) return 0;
      const today = new Date().toISOString().split("T")[0];
      return this.masterData.filter(
        (task) =>
          task.task_completion_date &&
          this.formatedatedisplay(task.task_completion_date) < today &&
          task.task_progress_status === "INPROGRESS"
      ).length;
    },

    upcomingTaskCount() {
      if (!this.masterData || this.masterData.length === 0) return 0;
      const today = new Date().toISOString().split("T")[0];
      return this.masterData.filter(
        (task) =>
          task.task_completion_date &&
          this.formatedatedisplay(task.task_completion_date) >= today &&
          task.task_progress_status === "INPROGRESS"
      ).length;
    },

    onholdTaskCount() {
      if (!this.masterData || this.masterData.length === 0) return 0;
      return this.masterData.filter(
        (task) => task.task_progress_status === "HOLD"
      ).length;
    },

    completedTaskCount() {
      if (!this.masterData || this.masterData.length === 0) return 0;
      return this.masterData.filter(
        (task) => task.task_progress_status === "COMPLETED"
      ).length;
    },

    withdrawnTaskCount() {
      if (!this.masterData || this.masterData.length === 0) return 0;
      return this.masterData.filter(
        (task) => task.task_progress_status === "WITHDRAWN" || task.task_progress_status === "WITHDRAW"
      ).length;
    },

    totalTaskCount() {
      return this.masterData ? this.masterData.length : 0;
    },

    sortedTasks() {
      const today = new Date().toISOString().split("T")[0];
      let filtered = [...this.masterData];

      if (this.selectedFilter === "OVERDUE") {
        filtered = filtered.filter(
          (task) =>
            task.task_completion_date &&
            task.task_completion_date < today &&
            task.task_progress_status === "INPROGRESS"
        );
      } else if (this.selectedFilter === "UPCOMING") {
        filtered = filtered.filter(
          (task) =>
            task.task_completion_date &&
            task.task_completion_date >= today &&
            task.task_progress_status === "INPROGRESS"
        );
      } else if (this.selectedFilter === "COMPLETED") {
        filtered = filtered.filter(
          (task) => task.task_progress_status === "COMPLETED"
        );
      } else if (this.selectedFilter === "HOLD") {
        filtered = filtered.filter(
          (task) => task.task_progress_status === "HOLD"
        );
      }

      // Dynamic sort: current month first, then previous month, then others
      return filtered.sort((a, b) => {
        const getMonth = (dateStr) => {
          if (!dateStr) return 0;
          const parts = dateStr.split("-");
          return parseInt(parts[1], 10) || 0;
        };

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;

        const aMonth = getMonth(a.task_completion_date);
        const bMonth = getMonth(b.task_completion_date);

        // Current month first
        if (aMonth === currentMonth && bMonth !== currentMonth) return -1;
        if (aMonth !== currentMonth && bMonth === currentMonth) return 1;

        // Previous month next
        if (aMonth === previousMonth && bMonth !== previousMonth) return -1;
        if (aMonth !== previousMonth && bMonth === previousMonth) return 1;

        // Within the same month, sort by completion date in descending order
        if (aMonth === bMonth) {
          if (a.task_completion_date > b.task_completion_date) return -1;
          if (a.task_completion_date < b.task_completion_date) return 1;
        }

        // For different months, sort by date descending
        if (a.task_completion_date > b.task_completion_date) return -1;
        if (a.task_completion_date < b.task_completion_date) return 1;
        return 0;
      });
    },

    filteredTasks() {
      let tasks = this.sortedTasks;
      
      if (this.localSelectedStatusFilter !== "ALL") {
        tasks = tasks.filter(
          (t) => t.task_progress_status === this.localSelectedStatusFilter
        );
      }
      
      if (!this.searchValue) return tasks;
      
      const s = this.searchValue.toLowerCase();
      return tasks.filter(
        (item) =>
          (item.task_name && item.task_name.toLowerCase().includes(s)) ||
          (item.task_description &&
            item.task_description.toLowerCase().includes(s))
      );
    },

    pageCount() {
      return Math.ceil(this.filteredTasks.length / this.itemsPerPage);
    },

    paginatedTasks() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredTasks.slice(start, start + this.itemsPerPage);
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
    async list_task_assigned_by_me(value) {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      
      try {
        let result = await API.graphql(
          graphqlOperation(list_assigned_tasks, {
            input: {
              limit: 200,
              nextToken: null,
            },
          })
        );
        
        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.list_assigned_tasks);
        
        if (response.Status === "SUCCESS") {
          this.masterData = response.data;
          this.tableData = response.data;
          this.tableLoading = false;
        } else {
          this.masterData = [];
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.tableLoading = false;
        this.masterData = [];
        
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    // Pagination methods
    handle_pagination() {
      if (this.nextToken) {
        this.list_task_assigned_by_me();
      }
    },

    // Dialog management methods
    handleRowClick(item) {
      this.componentcheck = 1;
      this.rowInfo = item;
      this.assignByMeDialog = true;
    },

    openAssignByMeDialog(item) {
      this.componentcheck = 1;
      this.rowInfo = item;
      this.assignByMeDialog = true;
    },

    // Filter methods
    clearStatusFilter() {
      this.localSelectedStatusFilter = "ALL";
      this.filterMenu = false;
      this.emitFilterCounts();
    },

    handleFilterChange() {
      this.currentPage = 1;
      this.$emit("filter-changed", this.localSelectedStatusFilter);
      this.emitFilterCounts();
    },

    emitFilterCounts() {
      const activeFiltersCount = this.localSelectedStatusFilter !== "ALL" ? 1 : 0;
      this.$emit("active-filters-count", activeFiltersCount);
    },

    clearFilter() {
      this.localSelectedStatusFilter = "ALL";
      this.currentPage = 1;
      this.showFilterDrawer = false;
      this.emitFilterCounts();
    },

    applyFilter() {
      this.showFilterDrawer = false;
      this.currentPage = 1;
    },

    openFilterDrawer() {
      this.showFilterDrawer = true;
    },

    // Utility methods
    fetch_org_format(value) {
      if (value != undefined) {
        return formatdisplayDate(value);
      }
    },

    getdateformate(formatMap) {
      var check_date = "yyyy-MM-dd";
      return check_date.replace(
        /DD|MMM|YYYY|MM/gi,
        (matched) => formatMap[matched]
      );
    },

    formatedatedisplay(dateString) {
      if (dateString == "N/A") {
        return dateString;
      }
      
      const [year, month, day] = dateString.split("-");
      if (day == undefined) {
        return dateString;
      }

      const dayPadded = day.padStart(2, "0");
      const numericMonthPadded = month.padStart(2, "0");

      const fullMonthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const fullMonthName = fullMonthNames[parseInt(month, 10) - 1];

      const formatMap = {
        dd: dayPadded,
        MM: numericMonthPadded,
        yyyy: year,
        MMM: fullMonthName,
      };

      return this.getdateformate(formatMap);
    },

    fetch_value(val) {
      return format_Date(val / 1000);
    },

    // Styling methods
    getStatusColor(status) {
      switch (status) {
        case "COMPLETED":
          return "green";
        case "INPROGRESS":
          return "orange";
        case "HOLD":
          return "red";
        case "WITHDRAWN":
          return "primary";
        case "WITHDRAW":
          return "primary";
        case "ASSIGNED":
          return "brown";
        default:
          return "default";
      }
    },

    truncateText(text) {
      if (!text) return "";
      const maxLength = 40;
      if (text.length > maxLength) {
        return text.slice(0, maxLength) + "...";
      }
      return text;
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
      
      this.assignByMeDialog = false;
      this.list_task_assigned_by_me();
    },
  },
};
</script>

<style scoped>
.task-card {
  background-color: #e3f2fd; /* Light blue */
  border-radius: 8px;
  transition: transform 0.2s ease-in-out, background-color 0.3s ease;
  cursor: pointer;
}
.task-card:hover {
  transform: scale(1.05);
}
.selected-card {
  background-color: #bbdefb !important; /* Darker blue */
  border: 3px solid #1976d2 !important; /* Blue highlight */
}
.task-name-wrap {
  white-space: normal;
  word-break: break-word;
  max-width: 250px;
  display: inline-block;
}
.v-chip {
  font-weight: 500;
  border-radius: 16px;
  font-size: 0.97rem;
  height: 28px;
  display: flex;
  align-items: center;
}
.task-footer-bar {
  border-top: 1px solid #eee;
}
.action-icon-compact {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 50%;
  transition: background 0.15s, color 0.15s;
}
.action-icon-compact:hover {
  background: rgba(33, 150, 243, 0.08); /* subtle primary color on hover */
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

/* Filter Drawer */
.filter-drawer {
  z-index: 1000; /* Ensure it's above other content */
}
</style>