<template>
  <div >
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <div class="task-card-container" style="position: relative">
      <v-card flat class="ma-2" >
        <!-- Top Controls: Title only -->
        <v-row
          class="align-center px-6 pt-6 pb-2"
        >
         
        </v-row>

        <!-- Data Table -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="assignedHEaders"
            :items="paginatedItems"
            :loading="tableLoading"
            :sort-by="['task_created_on']"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="totalItems"
            hide-default-footer
            density="comfortable"
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

            <!-- Task Details -->
            <template v-slot:[`item.task_name`]="{ item }">
              <v-tooltip bottom v-if="item.task_name || item.task_description">
                <template v-slot:activator="{ on }">
                  <div
                    class="caption font-weight-medium task-name-wrap"
                    v-on="on"
                  >
                    {{ item.task_name }}
                  </div>
                </template>
                <div class="textWrap" style="max-width: 250px">
                  {{ item.task_name }}
                </div>
              </v-tooltip>
              <div v-else class="caption font-weight-medium task-name-wrap">
                {{ item.task_name }}
              </div>
            </template>

            <!-- Task Source -->
            <template v-slot:[`item.task_source`]="{ item }">
              <div
                v-if="
                  item.task_source === 'PROJECT_MANAGEMENT' ||
                  item.task_source === 'CHECKLIST'
                "
              >
                <v-chip
                  small
                  :color="getSourceColor(item.task_source)"
                  text-color="white"
                  class="font-weight-medium"
                >
                  <v-icon left x-small class="mr-1">{{
                    getSourceIcon(item.task_source)
                  }}</v-icon>
                  {{
                    item.task_source == "PROJECT_MANAGEMENT"
                      ? item.project_name != null
                        ? "Project" + "-" + item.project_name
                        : "Project"
                      : "Checklist"
                  }}
                </v-chip>
              </div>
              <div v-else class="text-body-2">
                {{ item.task_source == "INTERNAL" ? "Task" : "-" }}
              </div>
            </template>

            <!-- Assigned By -->
            <template v-slot:[`item.task_assign_by_name`]="{ item }">
              <span class="caption">{{ item.task_assign_by_name }}</span>
            </template>

            <!-- Assigned On -->
            <template v-slot:[`item.task_created_on`]="{ item }">
              <span class="caption">{{
                fetch_value(item.task_created_on)
              }}</span>
            </template>

            <!-- Target Completion Date -->
            <template v-slot:[`item.task_completion_date`]="{ item }">
              <span class="caption">{{
                fetch_org_format(item.task_completion_date)
              }}</span>
            </template>

            <!-- Status -->
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

            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <span
                    class="action-icon-compact"
                    v-on="on"
                    @click="updateStatus(item)"
                  >
                    <v-icon small color="warning">mdi-update</v-icon>
                  </span>
                </template>
                <span>Update Status</span>
              </v-tooltip>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalItems === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${totalItems} tasks`
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
      <AssignToMe
        :assignToMeDialog="assignToMeDialog"
        :rowInfo="rowInfo"
        @clicked="assignToMeDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="checklistDialog">
      <ChecklistDialog
        :checklistDialog="checklistDialog"
        :checklistData="checklistDialogData"
        @update:checklistDialog="checklistDialog = $event"
        @clicked="checklistDialog = false"
        v-on:errorMsg="error_info"
        v-on:updateChecklistProgress="handleChecklistProgressUpdate"
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
            <h3 class="text-subtitle-1 mb-3">Filter by Source</h3>
            <v-radio-group
              v-model="selectedSourceFilter"
              @update:model-value="handleFilterChange"
              hide-details
            >
              <v-radio value="ALL" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">All Tasks</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ totalTaskCount }}
                    </v-chip>
                  </div>
                </template>
              </v-radio>

              <v-radio value="CHECKLIST" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">Checklist</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ checklistTaskCount }}
                    </v-chip>
                  </div>
                </template>
              </v-radio>

              <v-radio value="PROJECT" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">Projects</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ projectTaskCount }}
                    </v-chip>
                  </div>
                </template>
              </v-radio>

              <v-radio value="INTERNAL" class="mb-3">
                <template v-slot:label>
                  <div class="d-flex align-center justify-space-between w-100">
                    <span class="text-body-1">My Tasks</span>
                    <v-chip x-small color="primary" text-color="white">
                      {{ internalTaskCount }}
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
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import AssignToMe from "@/components/TaskDetailsApp/TaskPopups/AssignToMe.vue";
import ChecklistDialog from "@/components/TaskDetailsApp/TaskPopups/ChecklistDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import {
  list_assign_task_or_completed,
  list_user_checklists,
} from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  // Component name
  name: "AssignedToMe",

  // Components
  components: {
    AssignToMe,
    ChecklistDialog,
    SnackBar,
  },

  // Props
  props: {
    selectedSourceFilter: {
      type: String,
      default: "ALL",
    },
    searchValue: {
      type: String,
      default: "",
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
      assignedHEaders: [
        { title: "Task Details", key: "task_name", sortable: false },
        { title: "Task Source", key: "task_source", sortable: false },
        {
          title: "Assigned By",
          key: "task_assign_by_name",
          sortable: false,
        },
        {
          title: "Assigned On",
          key: "task_created_on",
          sortable: false,
        },
        {
          title: "Target Completion Date",
          key: "task_completion_date",
          sortable: false,
        },
        {
          title: "Status",
          key: "task_progress_status",
          sortable: false,
        },
        {
          title: "Actions",
          key: "actions",
          sortable: false,
        },
      ],

      // Dialog states
      componentcheck: 0,
      assignToMeDialog: false,
      checklistDialog: false,
      rowInfo: {},
      checklistDialogData: {},

      // Data arrays
      masterData: [],
      checklistData: [],

      // Filter properties
      selectedStatus: "ALL",
      selectedSourceFilter: "ALL",
      showFilterDrawer: false,

      // Pagination properties
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },

      // Component data
      SnackBarComponent: {},
    };
  },

  // Lifecycle hooks
  created() {
    this.list_my_tasks();
    this.tableHeight = window.innerHeight - 260;
  },

  mounted() {
    this.$nextTick(() => {
      this.emitFilterCounts();
    });
  },
  // Watchers
  watch: {
    searchValue() {
      this.currentPage = 1;
      this.filterTasks();
    },

    selectedSourceFilter() {
      this.currentPage = 1;
      this.filterTasks();
    },

    currentPage(newVal) {
      const table = document.querySelector(".task-table-container");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },

    totalTaskCount() {
      this.emitFilterCounts();
    },

    projectTaskCount() {
      this.emitFilterCounts();
    },

    internalTaskCount() {
      this.emitFilterCounts();
    },

    checklistTaskCount() {
      this.emitFilterCounts();
    },

    filteredTableData: {
      handler(newVal) {
        this.totalItems = newVal.length;
      },
      deep: true
    },
  },

  // Computed properties
  computed: {
    totalTaskCount() {
      return this.tableData ? this.tableData.length : 0;
    },

    projectTaskCount() {
      return this.tableData.filter(
        (task) => task.task_source === "PROJECT_MANAGEMENT"
      ).length;
    },

    internalTaskCount() {
      return this.tableData.filter(
        (task) =>
          task.task_source === "INTERNAL" ||
          !task.task_source ||
          task.task_source === "" ||
          (task.task_source !== "PROJECT_MANAGEMENT" &&
            task.task_source !== "CHECKLIST")
      ).length;
    },

    checklistTaskCount() {
      return this.tableData.filter((task) => task.task_source === "CHECKLIST")
        .length;
    },

    sourceFilterOptionsWithCounts() {
      return [
        { text: "All Sources", value: "ALL", count: this.totalTaskCount },
        { text: "Project", value: "PROJECT", count: this.projectTaskCount },
        { text: "Task", value: "INTERNAL", count: this.internalTaskCount },
        {
          text: "Checklist",
          value: "CHECKLIST",
          count: this.checklistTaskCount,
        },
      ];
    },

    filteredTableData() {
      let filtered = this.tableData;
      
      // Apply source filter
      if (this.selectedSourceFilter === "ALL") {
        filtered = this.tableData;
      } else if (this.selectedSourceFilter === "PROJECT") {
        filtered = this.tableData.filter(
          (task) => task.task_source === "PROJECT_MANAGEMENT"
        );
      } else if (this.selectedSourceFilter === "INTERNAL") {
        filtered = this.tableData.filter(
          (task) =>
            task.task_source === "INTERNAL" ||
            !task.task_source ||
            task.task_source === "" ||
            (task.task_source !== "PROJECT_MANAGEMENT" &&
              task.task_source !== "CHECKLIST")
        );
      } else if (this.selectedSourceFilter === "CHECKLIST") {
        filtered = this.tableData.filter(
          (task) => task.task_source === "CHECKLIST"
        );
      }
      
      // Apply search filter if search term exists
      if (this.searchValue && this.searchValue.trim() !== "") {
        const searchTerm = this.searchValue.toLowerCase().trim();
        filtered = filtered.filter((task) => {
          // Search in task name
          if (task.task_name && task.task_name.toLowerCase().includes(searchTerm)) {
            return true;
          }
          
          // Search in task description
          if (task.task_description && task.task_description.toLowerCase().includes(searchTerm)) {
            return true;
          }
          
          // Search in assigned by name
          if (task.task_assign_by_name && task.task_assign_by_name.toLowerCase().includes(searchTerm)) {
            return true;
          }
          
          // Search in task source (including project name for projects)
          if (task.task_source === "PROJECT_MANAGEMENT" && task.project_name) {
            if (task.project_name.toLowerCase().includes(searchTerm)) {
              return true;
            }
          }
          
          // Search in status
          if (task.task_progress_status && task.task_progress_status.toLowerCase().includes(searchTerm)) {
            return true;
          }
          
          // Search in formatted dates
          const assignedDate = this.fetch_value(task.task_created_on);
          if (assignedDate && assignedDate.toLowerCase().includes(searchTerm)) {
            return true;
          }
          
          const completionDate = this.fetch_org_format(task.task_completion_date);
          if (completionDate && completionDate.toLowerCase().includes(searchTerm)) {
            return true;
          }
          
          // Search in checklist-specific fields
          if (task.is_checklist) {
            if (task.checklist_data && task.checklist_data.master_checklist_name) {
              if (task.checklist_data.master_checklist_name.toLowerCase().includes(searchTerm)) {
                return true;
              }
            }
          }
          
          return false;
        });
      }
      
      return filtered;
    },

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredTableData.slice(start, start + this.itemsPerPage);
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

  // Methods
  methods: {
    // Data fetching methods
    async list_my_tasks() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      
      try {
        // Fetch tasks
        let taskResult = await API.graphql(
          graphqlOperation(list_assign_task_or_completed, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              actions: "ASSIGN_TO_ME",
              limit: 500,
              nextToken: null,
              task_progress_status:
                this.selectedStatus === "ALL" ? null : this.selectedStatus,
            },
          })
        );

        // Fetch checklists
        let checklistResult = await API.graphql(
          graphqlOperation(list_user_checklists, {
            input: {
              limit: 500,
              nextToken: null,
            },
          })
        );

        this.tableLoading = false;
        this.tableData = [];

        // Process tasks
        var taskResponse = taskResult.data.list_assign_task_or_completed;
        this.masterData = taskResponse.details;

        // Process checklists
        var checklistResponse = JSON.parse(
          checklistResult.data.list_user_checklists
        );

        if (checklistResponse.Status === "SUCCESS") {
          this.checklistData = checklistResponse.data || [];
        } else {
          this.checklistData = [];
        }

        // Combine tasks and checklists
        const combinedData = this.combineTasksAndChecklists(
          this.masterData,
          this.checklistData
        );

        // Sort tasks in the specified order: overdue, upcoming, on hold, completed
        this.tableData = this.sortTasksByPriority(combinedData);

        // Set total items for pagination - use filtered data length
        this.totalItems = this.filteredTableData.length;
        
        // Emit initial filter counts
        this.emitFilterCounts();
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

    // Filter methods
    filterTasks() {
      this.currentPage = 1;
      this.totalItems = this.filteredTableData.length;
      this.emitFilterCounts();
    },

    emitFilterCounts() {
      this.$emit("total-task-count", this.totalTaskCount);
      this.$emit("project-task-count", this.projectTaskCount);
      this.$emit("internal-task-count", this.internalTaskCount);
      this.$emit("checklist-task-count", this.checklistTaskCount);
      
      const activeFiltersCount = this.selectedSourceFilter !== "ALL" ? 1 : 0;
      this.$emit("active-filters-count", activeFiltersCount);
    },

    handleFilterChange() {
      this.currentPage = 1;
      this.filterTasks();
    },

    clearFilter() {
      this.selectedSourceFilter = "ALL";
      this.currentPage = 1;
      this.filterTasks();
      this.showFilterDrawer = false;
    },

    openFilterDrawer() {
      this.showFilterDrawer = true;
    },

    applyFilter() {
      this.showFilterDrawer = false;
      this.currentPage = 1;
      this.filterTasks();
    },

    // Dialog management methods
    handleRowClick(item) {
      this.componentcheck = 1;
      this.rowInfo = item;
      this.assignToMeDialog = true;
    },

    updateStatus(item) {
      if (item.is_checklist == undefined) {
        this.handleRowClick(item);
      }
      if (item.is_checklist) {
        this.checklistDialogData = item.checklist_data;
        this.checklistDialog = true;
      } else {
        this.$emit("updateTaskStatus", item);
      }
    },

    handleChecklistProgressUpdate(updateData) {
      const checklistIndex = this.tableData.findIndex(
        (item) => item.task_id === updateData.checklistId
      );

      if (checklistIndex !== -1) {
        this.tableData[checklistIndex].completion_percentage =
          updateData.completionPercentage;
        this.tableData[checklistIndex].checklist_data.completion_percentage =
          updateData.completionPercentage;

        if (updateData.completionPercentage === 100) {
          this.tableData[checklistIndex].task_progress_status = "COMPLETED";
        } else if (updateData.completionPercentage > 0) {
          this.tableData[checklistIndex].task_progress_status = "INPROGRESS";
        }
      }

      this.$emit("checklistProgressUpdated", updateData);
    },

    // Pagination methods
    handle_pagination() {
      if (this.nextToken) {
        this.list_my_tasks();
      }
    },

    // Utility methods
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

    fetch_org_format(value) {
      if (value != undefined) {
        return formatdisplayDate(value);
      }
    },

    formatTimestampToDate(timestamp) {
      const date = new Date(timestamp);
      return date.toISOString().split("T")[0];
    },

    fetch_value(val) {
      return formatedatetime(val / 1000);
    },

    // Data processing methods
    combineTasksAndChecklists(tasks, checklists) {
      const checklistTasks = checklists.map((checklist) => {
        const mappedTask = {
          task_id: checklist.checklist_id,
          task_name: checklist.checklist_name,
          task_description: checklist.master_checklist_name,
          task_source: "CHECKLIST",
          task_assign_by_name: checklist.checklist_created_by_name,
          task_created_on: checklist.checklist_created_on
            ? checklist.checklist_created_on * 1000
            : Date.now(),
          task_completion_date: checklist.checklist_end_date
            ? checklist.checklist_end_date
            : this.formatTimestampToDate(checklist.checklist_created_on * 1000),
          task_progress_status:
            checklist.completion_percentage === 100
              ? "COMPLETED"
              : "INPROGRESS",
          is_checklist: true,
          checklist_data: checklist,
          completion_percentage: checklist.completion_percentage || 0,
          checklist_visibility: checklist.checklist_visiblity,
          master_checklist_id: checklist.master_checklist_id,
          checklist_created_by: checklist.checklist_created_by,
        };
        return mappedTask;
      });

      const combined = [...tasks, ...checklistTasks];
      return combined;
    },

    sortTasksByPriority(tasks) {
      const today = new Date().toISOString().split("T")[0];

      // Separate tasks into categories
      const overdueTasks = tasks.filter(
        (task) =>
          task.task_completion_date &&
          this.formatedatedisplay(task.task_completion_date) < today &&
          task.task_progress_status === "INPROGRESS"
      );

      const upcomingTasks = tasks.filter(
        (task) =>
          task.task_completion_date &&
          this.formatedatedisplay(task.task_completion_date) >= today &&
          task.task_progress_status === "INPROGRESS"
      );

      const onHoldTasks = tasks.filter(
        (task) => task.task_progress_status === "HOLD"
      );

      const completedTasks = tasks.filter(
        (task) => task.task_progress_status === "COMPLETED"
      );

      const otherTasks = tasks.filter(
        (task) =>
          !overdueTasks.includes(task) &&
          !upcomingTasks.includes(task) &&
          !onHoldTasks.includes(task) &&
          !completedTasks.includes(task)
      );

      // Sort each category by completion date
      overdueTasks.sort(
        (a, b) =>
          new Date(a.task_completion_date) - new Date(b.task_completion_date)
      );
      upcomingTasks.sort(
        (a, b) =>
          new Date(a.task_completion_date) - new Date(b.task_completion_date)
      );
      onHoldTasks.sort(
        (a, b) =>
          new Date(b.task_completion_date) - new Date(a.task_completion_date)
      );
      completedTasks.sort(
        (a, b) =>
          new Date(b.task_completion_date) - new Date(a.task_completion_date)
      );

      // Combine all categories in the specified order
      const result = [
        ...overdueTasks,
        ...upcomingTasks,
        ...onHoldTasks,
        ...completedTasks,
        ...otherTasks,
      ];

      return result;
    },

    // Styling methods
    getSourceColor(source) {
      if (source === "PROJECT_MANAGEMENT") {
        return "primary";
      } else if (source === "INTERNAL") {
        return "success";
      } else if (source === "CHECKLIST") {
        return "info";
      }
      return "grey";
    },

    getSourceIcon(source) {
      if (source === "PROJECT_MANAGEMENT") {
        return "mdi-briefcase";
      } else if (source === "INTERNAL") {
        return "mdi-apps";
      } else if (source === "CHECKLIST") {
        return "mdi-format-list-checks";
      }
      return "mdi-view-list";
    },

    getStatusColor(status) {
      if (status === "COMPLETED") {
        return "green";
      } else if (status === "INPROGRESS") {
        return "orange";
      } else if (status === "HOLD") {
        return "amber";
      } else if (status === "WITHDRAWN") {
        return "red";
      } else if (status === "WITHDRAW") {
        return "red";
      } else if (status === "ASSIGNED") {
        return "brown";
      }
      return "grey";
    },

    // Text formatting methods
    truncateTaskName(taskName) {
      if (!taskName) return "";

      const maxLength = 35;
      if (taskName.length > maxLength) {
        return taskName.slice(0, maxLength) + "...";
      }
      return taskName;
    },

    smartTruncateTaskName(taskName) {
      if (!taskName) return "";

      const maxLength = 40;
      if (taskName.length <= maxLength) {
        return taskName;
      }

      const truncated = taskName.slice(0, maxLength);
      const lastSpaceIndex = truncated.lastIndexOf(" ");

      if (lastSpaceIndex > maxLength * 0.7) {
        return truncated.slice(0, lastSpaceIndex) + "...";
      }

      return truncated + "...";
    },

    getActiveFilterCount() {
      return this.sourceFilterOptionsWithCounts.filter(
        (option) => option.value === this.selectedSourceFilter
      ).length;
    },

    getFilterLabel(value) {
      const labels = {
        ALL: "All Tasks",
        CHECKLIST: "Checklist",
        PROJECT: "Projects",
        INTERNAL: "My Tasks",
      };
      return labels[value] || "All Tasks";
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
      
      this.assignToMeDialog = false;
      this.list_my_tasks();
    },
  },
};
</script>

<style scoped>
.action-icon-compact {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 50%;
  transition: background 0.15s, color 0.15s;
}
.action-icon-compact:hover {
  background: rgba(255, 193, 7, 0.08); /* subtle warning color on hover */
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

/* Task name wrapping */
.task-name-wrap {
  max-width: 200px;
  word-wrap: break-word;
  line-height: 1.4;
}

/* Filter Drawer */
.filter-drawer {
  z-index: 1000; /* Ensure it's above other content */
}
</style>