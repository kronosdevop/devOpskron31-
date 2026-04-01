<template>
  <div class="task-management-container">
    <!-- Header Section -->
    <v-card flat class="header-card mb-4" elevation="0">
      <v-container fluid class="pa-0">
        <v-row align="center" class="ma-0">
          <v-col cols="12" class="pa-4">
            <div class="d-flex align-center justify-space-between flex-wrap">
              <!-- Title and Filter Tabs -->
              <div class="d-flex align-center">
                <h2 class="text-h5 font-weight-bold primary--text mb-0 mr-6">
                  Task Management
                </h2>
                <v-btn-toggle
                  @change="filter_data()"
                  v-model="selectStatusType"
                  color="primary"
                  mandatory
                  class="elevation-1"
                >
                  <v-btn
                    small
                    class="text-caption font-weight-medium"
                    value="ASSIGN_BY_ME"
                    :class="
                      selectStatusType === 'ASSIGN_BY_ME'
                        ? 'white--text'
                        : 'grey--text text--darken-1'
                    "
                  >
                    <v-icon left small class="mr-1"
                      >mdi-account-arrow-right</v-icon
                    >
                    Assigned by me
                  </v-btn>
                  <v-btn
                    small
                    class="text-caption font-weight-medium"
                    value="ASSIGN_TO_ME"
                    :class="
                      selectStatusType === 'ASSIGN_TO_ME'
                        ? 'white--text'
                        : 'grey--text text--darken-1'
                    "
                  >
                    <v-icon left small class="mr-1">mdi-account-check</v-icon>
                    Assigned to me
                  </v-btn>
                </v-btn-toggle>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex align-center">
                <v-btn
                  v-if="selectStatusType == 'ASSIGN_BY_ME'"
                  color="primary"
                  small
                  @click="assign_data()"
                  class="text-caption font-weight-medium mr-3 elevation-2"
                  elevation="2"
                >
                  <v-icon left small>mdi-plus</v-icon>
                  Assign Task
                </v-btn>
                <v-btn
                  outlined
                  color="grey darken-1"
                  class="text-caption font-weight-medium"
                  small
                  @click="back_call()"
                >
                  <v-icon left small>mdi-arrow-left</v-icon>
                  Back
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card>

    <!-- Main Content -->
    <v-card flat class="content-card" elevation="0">
      <v-container fluid class="pa-0">
        <v-row class="ma-0">
          <v-col cols="12" class="pa-4">
            <!-- Filter Section -->
            <div class="filter-section mb-4">
              <v-select
                outlined
                dense
                v-model="selectedStatus"
                label="Filter by Status"
                style="max-width: 250px"
                prepend-inner-icon="mdi-filter-variant"
                :items="[
                  { text: 'All Tasks', value: 'ALL' },
                  { text: 'Completed', value: 'COMPLETED' },
                  { text: 'In Progress', value: 'INPROGRESS' },
                  { text: 'On Hold', value: 'HOLD' },
                ]"
                @change="filter_data"
                class="status-filter"
              />
            </div>

            <!-- Data Table -->
            <v-card class="table-card elevation-2" rounded="lg">
              <v-data-table
                :headers="
                  selectStatusType == 'ASSIGN_BY_ME' ? headers : assignedHEaders
                "
                :items="tableData"
                :fixed-header="fixed"
                :loading="tableLoading"
                :footer-props="{
                  itemsPerPageOptions: [10, 20, 50],
                  showFirstLastPage: true,
                }"
                :items-per-page="20"
                dense
                :options.sync="pagination"
                @update:options="handle_pagination()"
                @click:row="handleRowClick"
                :sort-by="['task_created_on']"
                :sort-desc.sync="sortDesc"
                class="modern-table"
                :class="{ 'table-hover': true }"
                :height="cardHeight"
              >
                <!-- Task Name Column -->
                <template v-slot:[`item.task_name`]="{ item }">
                  <v-tooltip
                    bottom
                    v-if="item.task_name || item.task_description"
                  >
                    <template #activator="{ on }">
                      <div class="task-name-cell" v-on="on">
                        <div class="task-title font-weight-medium">
                          {{
                            item.task_description
                              ? item.task_description
                              : item.task_name
                          }}
                        </div>
                        <div class="task-subtitle text-caption grey--text">
                          {{
                            item.task_name && item.task_description
                              ? item.task_name
                              : ""
                          }}
                        </div>
                      </div>
                    </template>
                    <div class="text-wrap" style="max-width: 300px">
                      {{
                        item.task_description
                          ? item.task_description
                          : item.task_name
                      }}
                    </div>
                  </v-tooltip>
                </template>

                <!-- Assign To/By Column -->
                <template v-slot:[`item.task_assign_to_name`]="{ item }">
                  <div class="assignee-cell">
                    <v-avatar size="28" color="primary" class="mr-2">
                      <span class="white--text text-caption font-weight-medium">
                        {{ getInitials(item.task_assign_to_name) }}
                      </span>
                    </v-avatar>
                    <span class="font-weight-medium">{{
                      item.task_assign_to_name
                    }}</span>
                  </div>
                </template>

                <template v-slot:[`item.task_assign_by_name`]="{ item }">
                  <div class="assignee-cell">
                    <v-avatar size="28" color="secondary" class="mr-2">
                      <span class="white--text text-caption font-weight-medium">
                        {{ getInitials(item.task_assign_by_name) }}
                      </span>
                    </v-avatar>
                    <span class="font-weight-medium">{{
                      item.task_assign_by_name
                    }}</span>
                  </div>
                </template>

                <!-- Date Columns -->
                <template v-slot:[`item.task_created_on`]="{ item }">
                  <div class="date-cell">
                    <div class="font-weight-medium">
                      {{ fetch_value(item.task_created_on) }}
                    </div>
                    <div class="text-caption grey--text">Created</div>
                  </div>
                </template>

                <template v-slot:[`item.task_completion_date`]="{ item }">
                  <div class="date-cell">
                    <div class="font-weight-medium">
                      {{ get_date(item.task_completion_date) }}
                    </div>
                    <div class="text-caption grey--text">Due Date</div>
                  </div>
                </template>

                <!-- Status Column -->
                <template v-slot:[`item.task_progress_status`]="{ item }">
                  <v-chip
                    :color="getStatusColor(item.task_progress_status)"
                    :text-color="getStatusTextColor(item.task_progress_status)"
                    small
                    class="font-weight-medium status-chip"
                    :class="getStatusClass(item.task_progress_status)"
                  >
                    <v-icon left x-small class="mr-1">
                      {{ getStatusIcon(item.task_progress_status) }}
                    </v-icon>
                    {{ getStatusText(item.task_progress_status) }}
                  </v-chip>
                </template>

                <!-- Loading State -->
                <template v-slot:loading>
                  <v-skeleton-loader
                    v-for="n in 5"
                    :key="n"
                    type="table-row"
                    class="my-2"
                  />
                </template>

                <!-- Empty State -->
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey lighten-1" class="mb-4"
                      >mdi-clipboard-text-outline</v-icon
                    >
                    <div class="text-h6 grey--text mb-2">No tasks found</div>
                    <div class="text-body-2 grey--text">
                      {{
                        selectStatusType === "ASSIGN_BY_ME"
                          ? "You haven't assigned any tasks yet."
                          : "No tasks have been assigned to you."
                      }}
                    </div>
                    <v-btn
                      v-if="selectStatusType === 'ASSIGN_BY_ME'"
                      color="primary"
                      class="mt-4"
                      @click="assign_data()"
                    >
                      <v-icon left>mdi-plus</v-icon>
                      Assign Your First Task
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card>

    <!-- Snackbar -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <!-- Dialogs -->
    <div v-if="componentcheck == 1">
      <AssignTask
        :assignPopup="assignPopup"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="assignPopup = false"
      />
    </div>
    <div v-if="componentcheck == 2">
      <AssignByMe
        :assignByMeDialog="assignByMeDialog"
        :rowInfo="rowInfo"
        @clicked="assignByMeDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentcheck == 3">
      <AssignToMe
        :assignToMeDialog="assignToMeDialog"
        :rowInfo="rowInfo"
        @clicked="assignToMeDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

// Imports
import SnackBar from "@/components/SnackBar.vue";
import AssignTask from "@/components/TaskDetailsApp/TaskPopups/AssignTask.vue";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import AssignToMe from "@/components/TaskDetailsApp/TaskPopups/AssignToMe.vue";
import AssignByMe from "@/components/TaskDetailsApp/TaskPopups/AssignByMe.vue";
import { list_assign_task_or_completed } from "@/graphql/queries.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  // Components
  components: {
    SnackBar,
    AssignTask,
    AssignToMe,
    AssignByMe,
  },

  // Data
  data() {
    return {
      // Table properties
      tableLoading: false,
      tableData: [],
      fixed: true,
      cardHeight: 0,
      nextToken: null,
      sortDesc: true,

      // Table headers
      headers: [
        {
          text: "Task Details",
          value: "task_name",
          sortable: false,
          width: "35%",
        },
        {
          text: "Assigned To",
          value: "task_assign_to_name",
          sortable: false,
          width: "20%",
        },
        {
          text: "Created On",
          value: "task_created_on",
          sortable: true,
          width: "15%",
        },
        {
          text: "Due Date",
          value: "task_completion_date",
          sortable: true,
          width: "15%",
        },
        {
          text: "Status",
          value: "task_progress_status",
          sortable: false,
          width: "15%",
        },
      ],

      assignedHEaders: [
        {
          text: "Task Details",
          value: "task_name",
          sortable: false,
          width: "35%",
        },
        {
          text: "Assigned By",
          value: "task_assign_by_name",
          sortable: false,
          width: "20%",
        },
        {
          text: "Created On",
          value: "task_created_on",
          sortable: true,
          width: "15%",
        },
        {
          text: "Due Date",
          value: "task_completion_date",
          sortable: true,
          width: "15%",
        },
        {
          text: "Status",
          value: "task_progress_status",
          sortable: false,
          width: "15%",
        },
      ],

      // Dialog states
      componentcheck: 0,
      assignPopup: false,
      taskCompletionDialog: false,
      assignByMeDialog: false,
      assignToMeDialog: false,
      rowInfo: {},

      // Filter properties
      selectStatusType: "ASSIGN_BY_ME",
      selectedStatus: "ALL",

      // Pagination properties
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
    this.cardHeight = window.innerHeight - 200;
  },

  // Methods
  methods: {
    // Data fetching methods
    async list_my_tasks() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      
      try {
        let result = await API.graphql(
          graphqlOperation(list_assign_task_or_completed, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              actions: this.selectStatusType,
              limit: 500,
              nextToken: this.nextToken,
              task_progress_status:
                this.selectedStatus === "ALL" ? null : this.selectedStatus,
            },
          })
        );
        
        this.tableLoading = false;
        this.tableData = [];
        var response = result.data.list_assign_task_or_completed;
        this.nextToken = response.nextToken;
        let array = this.tableData.concat(response.details);

        this.tableData = array;

        const uniqueArrayOfObjects = this.tableData.filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o.task_id === obj.task_id)
        );
        this.tableData = uniqueArrayOfObjects;
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

    // Dialog management methods
    handleRowClick(item) {
      if (this.selectStatusType == "ASSIGN_BY_ME") {
        this.componentcheck = 2;
        this.rowInfo = item;
        this.assignByMeDialog = true;
      } else {
        this.componentcheck = 3;
        this.rowInfo = item;
        this.assignToMeDialog = true;
      }
    },

    assign_data() {
      this.componentcheck = 1;
      this.assignPopup = true;
    },

    // Filter methods
    filter_data() {
      this.list_my_tasks();
    },

    // Pagination methods
    handle_pagination() {
      if (this.nextToken) {
        this.list_my_tasks();
      }
    },

    // Navigation methods
    back_call() {
      this.$router.push("/DashboardView");
    },

    // Utility methods
    get_date(val) {
      return val;
    },

    fetch_value(val) {
      return format_Date(val / 1000);
    },

    // UI helper methods
    getInitials(name) {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    },

    // Styling methods
    getStatusColor(status) {
      const colors = {
        COMPLETED: "success",
        INPROGRESS: "warning",
        HOLD: "error",
        WITHDRAWN: "grey",
        WITHDRAW: "grey",
        ASSIGNED: "info",
      };
      return colors[status] || "grey";
    },

    getStatusTextColor(status) {
      return ["COMPLETED", "INPROGRESS", "HOLD"].includes(status)
        ? "white"
        : "white";
    },

    getStatusClass(status) {
      return `status-${status.toLowerCase()}`;
    },

    getStatusIcon(status) {
      const icons = {
        COMPLETED: "mdi-check-circle",
        INPROGRESS: "mdi-progress-clock",
        HOLD: "mdi-pause-circle",
        WITHDRAWN: "mdi-cancel",
        WITHDRAW: "mdi-cancel",
        ASSIGNED: "mdi-account-check",
      };
      return icons[status] || "mdi-help-circle";
    },

    getStatusText(status) {
      const texts = {
        COMPLETED: "Completed",
        INPROGRESS: "In Progress",
        HOLD: "On Hold",
        WITHDRAWN: "Withdrawn",
        WITHDRAW: "Withdrawn",
        ASSIGNED: "Assigned",
      };
      return texts[status] || status;
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
      this.assignToMeDialog = false;
      this.assignPopup = false;
      this.list_my_tasks();
    },
  },
};
</script>

<style scoped>
.task-management-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 16px;
}

.header-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.content-card {
  background: transparent !important;
}

.filter-section {
  background: rgba(255, 255, 255, 0.9);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.table-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  overflow: hidden;
}

.modern-table {
  border-radius: 16px;
}

.modern-table :deep(.v-data-table__wrapper) {
  border-radius: 16px;
}

.modern-table :deep(.v-data-table__wrapper table) {
  border-radius: 16px;
}

.modern-table :deep(.v-data-table__wrapper table thead th) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  border: none !important;
}

.modern-table :deep(.v-data-table__wrapper table tbody tr) {
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modern-table :deep(.v-data-table__wrapper table tbody tr:hover) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.modern-table :deep(.v-data-table__wrapper table tbody tr:hover td) {
  color: white !important;
}

.modern-table
  :deep(
    .v-data-table__wrapper
    table
    tbody
    tr:hover
    .status-chip
  ) {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.task-name-cell {
  padding: 8px 0;
}

.task-title {
  line-height: 1.4;
  margin-bottom: 4px;
}

.task-subtitle {
  line-height: 1.2;
}

.assignee-cell {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.date-cell {
  padding: 8px 0;
}

.status-chip {
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 20px !important;
  padding: 4px 12px !important;
  min-width: 100px;
  text-align: center;
}

.status-completed {
  background: linear-gradient(135deg, #4caf50, #45a049) !important;
}

.status-inprogress {
  background: linear-gradient(135deg, #ff9800, #f57c00) !important;
}

.status-hold {
  background: linear-gradient(135deg, #f44336, #d32f2f) !important;
}

.status-withdrawn,
.status-withdraw {
  background: linear-gradient(135deg, #9e9e9e, #757575) !important;
}

.status-assigned {
  background: linear-gradient(135deg, #2196f3, #1976d2) !important;
}

.text-wrap {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Responsive Design */
@media (max-width: 768px) {
  .task-management-container {
    padding: 8px;
  }

  .header-card .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .header-card .d-flex > div {
    margin-bottom: 16px;
    width: 100%;
  }

  .v-btn-toggle {
    width: 100%;
  }

  .status-filter {
    max-width: 100% !important;
  }
}

@media (max-width: 480px) {
  .modern-table :deep(.v-data-table__wrapper ){
    font-size: 0.875rem;
  }

  .status-chip {
    min-width: 80px;
    font-size: 0.7rem !important;
  }
}
</style>