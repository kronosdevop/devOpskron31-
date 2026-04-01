<template>
  <div>
    <div class="card-container" style="position: relative">
      <v-card class="mt-4" flat>
        <v-card-text>
          <v-data-table
            :search="searchQuery"
            :headers="timeSheetHeaders"
            :fixed-header="fixed"
            :height="adminAppExists? CommonVuetifyObj.height - 258:CommonVuetifyObj.height - 185"
            :items="paginatedItems"
            :loading="tableLoading"
            hide-default-footer
            density="comfortable"
            class="modern-data-table"
            hover
            multi-sort
            @click:row="handle_row_click"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4"
                  >mdi-clock-outline</v-icon
                >
                <div class="text-h6 grey--text mb-2">No Timesheets Found</div>
                <div class="text-body-2 grey--text">
                  Try adjusting your search criteria or create a new timesheet.
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
                <div class="text-body-2 grey--text">Loading timesheets...</div>
              </div>
            </template>

            <template v-slot:[`item.timesheet_from_date`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2"
                  >mdi-calendar-start</v-icon
                > -->
                <span class="caption">
                  {{ fetch_value(item.timesheet_from_date) }}
                </span>
              </div>
            </template>

            <template v-slot:[`item.timesheet_to_date`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2"
                  >mdi-calendar-end</v-icon
                > -->
                <span class="caption">
                  {{ fetch_value(item.timesheet_to_date) }}
                </span>
              </div>
            </template>

            <template v-slot:[`item.timesheet_approval_name`]="{ item }">
              <div
                class="d-flex align-center"
                v-if="item.timesheet_status == 'INPROGRESS'"
              >
                <!-- <v-icon size="16" color="orange" class="mr-2">mdi-clock</v-icon> -->
                <span class="caption">
                  {{ item.timesheet_approval_name || "Pending" }}
                </span>
              </div>
              <div v-else class="d-flex align-center">
                <!-- <v-icon size="16" color="grey" class="mr-2">mdi-minus</v-icon> -->
                <span class="caption">-</span>
              </div>
            </template>

            <template v-slot:[`item.timesheet_approved`]="{ item }">
              <div
                v-if="
                  item.timesheet_status == 'APPROVED' ||
                  item.timesheet_status == 'REJECTED'
                "
                class="d-flex align-center"
              >
                <!-- <v-icon size="16" color="primary" class="mr-2"
                  >mdi-account-check</v-icon
                > -->
                <span class="caption">
                  {{ item.timesheet_approval_name || "-" }}
                </span>
              </div>
              <div v-else class="d-flex align-center">
                <v-icon size="16" color="grey" class="mr-2">mdi-minus</v-icon>
                <span class="caption">-</span>
              </div>
            </template>

            <template v-slot:[`item.timesheet_status`]="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  size="16"
                  :color="getStatusColor(item.timesheet_status)"
                  class="mr-2"
                >
                  {{ getStatusIcon(item.timesheet_status) }}
                </v-icon>
                <span
                  class="caption font-weight-medium"
                  :class="getStatusTextColor(item.timesheet_status)"
                >
                  {{ item.timesheet_status }}
                </span>
              </div>
            </template>

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
                      @click.stop="edit_data(item)"
                      style="font-size: 12px"
                      v-if="item.timesheet_status == 'INPROGRESS'"
                      ><div class="d-flex align-center">
                        <v-icon size="small" color="blue">mdi-pencil</v-icon>
                        <v-list-item-title>Edit Timesheet</v-list-item-title>
                      </div>
                    </v-list-item>

                    <v-list-item
                      @click.stop="open_delete(item)"
                      style="font-size: 12px"
                      v-if="item.timesheet_status == 'INPROGRESS'"
                    >
                      <div class="d-flex align-center">
                        <v-icon size="small" color="red">mdi-delete</v-icon>
                        <v-list-item-title class="ml-2"
                          >Delete Timesheet</v-list-item-title
                        >
                      </div>
                    </v-list-item>

                    <v-list-item
                      @click.stop="view_timesheet(item)"
                      style="font-size: 12px"
                      v-if="item.timesheet_status != 'INPROGRESS'"
                    >
                      <div class="d-flex align-center">
                        <v-icon size="small" color="primary">mdi-eye</v-icon>
                        <v-list-item-title class="ml-2"
                          >View Timesheet</v-list-item-title
                        >
                      </div>
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
                  : `Showing ${paginatedItems.length} of ${totalItems} timesheets`
              }}
            </div>
            <div class="pagination-controls">
              <v-btn
                :disabled="currentPage === 1"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage - 1"
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
              >
                Next
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div v-if="componentCheck == 1">
      <FillTimeSheet
        :timesheetUpdate="timesheetUpdate"
        @clicked="timesheetUpdate = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:usertimesheet="timesheetUpdate = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteUsertimesheet
        :timesheetdeletion="timesheetdeletion"
        @clicked="timesheetdeletion = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :timesheetitems="timesheetitems"
      />
    </div>
    <div v-if="componentCheck == 3">
      <ViewTimesheet
        :displaytimesheet="displaytimesheet"
        @clicked="displaytimesheet = false"
        :timesheetitems="timesheetitems"
      />
    </div>
    <div v-if="componentCheck == 4">
      <EditTimesheet
        :timesheetEdition="timesheetEdition"
        @update:timesheetEdition="timesheetEdition = $event"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :timesheetitems="timesheetitems"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import EditTimesheet from "@/components/TimeSheets/PopUps/EditTimesheet.vue";
import ViewTimesheet from "@/components/TimeSheets/PopUps/ViewTimesheet.vue";
import DeleteUsertimesheet from "@/components/TimeSheets/PopUps/DeleteUsertimesheet.vue";
import SnackBar from "@/components/SnackBar.vue";
import FillTimeSheet from "@/components/TimeSheets/PopUps/FillTimeSheet.vue";
import { list_timesheet } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    searchValue: {
      type: String,
      default: "",
    },
  },
  components: {
    FillTimeSheet,
    SnackBar,
    ViewTimesheet,
    DeleteUsertimesheet,
    EditTimesheet,
  },
  data() {
    return {
      pagination: {
        itemsPerPage: 10,
        page: 1,
      },
      dates: [],
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      displaytimesheet: false,
      adminAppExists: false,
      menu: false,
      componentCheck: 0,
      height: 0,
      timesheetEdition: false,
      timesheetUpdate: false,
      timesheetitems: {},
      date: "",
      minDate: new Date().toISOString().split("T")[0],
      selectProject: "",
      selectActivity: "",
      workDuration: "",
      timeSheetHeaders: [
        {
          title: "From Date",
          key: "timesheet_from_date",
          sortable: false,
        },
        { title: "To Date", key: "timesheet_to_date", sortable: false },
        {
          title: "Pending On",
          key: "timesheet_approval_name",
          sortable: false,
        },
        {
          title: "Acted By",
          key: "timesheet_approved",
          sortable: false,
        },
        { title: "Status", key: "timesheet_status", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ],
      timeRecords: [],
      fixed: true,
      timesheetdeletion: false,
      interval: {},
      value: 50,
      tableLoading: false,
      nextToken: null,
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      totalItems: 0,
      windowHeight: 0,
    };
  },
  async created() {
    await this.fetch_admin_apps();
  

    await this.fetch_usertimelist();
  },
  computed: {
    searchQuery() {
      return this.searchValue;
    },
    dateRangeText() {
      return this.dates.join(" ~ ");
    },
    totalTaskCount() {
      return this.masterData ? this.masterData.length : 0;
    },
    totalCount() {
      return this.timeRecords.length;
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
    },
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.timeRecords;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.timeRecords.filter(
        (item) =>
          (item.timesheet_from_date &&
            item.timesheet_from_date.toLowerCase().includes(searchTerm)) ||
          (item.timesheet_to_date &&
            item.timesheet_to_date.toLowerCase().includes(searchTerm)) ||
          (item.timesheet_approval_name &&
            item.timesheet_approval_name.toLowerCase().includes(searchTerm)) ||
          (item.timesheet_status &&
            item.timesheet_status.toLowerCase().includes(searchTerm))
      );
    },
    paginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        // Default sort by from date (newest first)
        const aValue = a.timesheet_from_date ? a.timesheet_from_date : "";
        const bValue = b.timesheet_from_date ? b.timesheet_from_date : "";
        return bValue.localeCompare(aValue);
      });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
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
  mounted() {
    this.CommonVuetifyObj = useDisplay();
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
      this.updateTotalItems();
    },
    currentPage() {
      // When the page changes, scroll to top of table (optional)
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    timesheetEdition(newVal, oldVal) {
      // When dialog closes, refresh the data
      if (oldVal === true && newVal === false) {
        this.fetch_usertimelist();
      }
    },
  },
  methods: {
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type === "TIMESHEET_USER"
      );

      if (userapp == undefined) {
        this.adminAppExists = false;
        return;
      }

      if (userapp.is_visible == false) {
        this.adminAppExists = false;
        return;
      }

      if (
        !userObj ||
        !userObj.admin_apps ||
        !Array.isArray(userObj.admin_apps)
      ) {
        this.adminAppExists = false;
        return;
      }

      const adminExists = userObj.admin_apps.find(
        (app) => app.dashboard_unique_type === "TIMESHEET_ADMINS"
      );

      this.adminAppExists =
        (adminExists && adminExists.app_usage_level === "WEB_PHONE_ONLY") ||
        (adminExists.app_usage_level === "WEB_ONLY" &&
          adminExists.is_dashboard_admin === true);
    },
    async updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      // Check if we need more data from API
      if (end > this.timeRecords.length && this.next_token) {
        await this.fetch_usertimelist(true);
      }
      this.paginatedItems = this.timeRecords.slice(start, end);
      this.totalItems = this.timeRecords.length;
    },
    handle_pagination() {
      if (this.nextToken) {
        this.fetch_usertimelist();
      }
    },
    fetch_value(val) {
      return formatdisplayDate(val);
    },
    async updatemutation() {
      this.timesheetEdition = false;
      await this.fetch_usertimelist();
    },
    handle_row_click(click, val) {
      this.timesheetitems = val.item;
      if (val.timesheet_status != "INPROGRESS") {
        this.componentCheck = 3;
        this.displaytimesheet = true;
      }
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
      this.timeRecords = [];
      this.timesheetEdition = false;
      this.timesheetUpdate = false;
      this.timesheetdeletion = false;
      this.fetch_usertimelist();
    },
    open_delete(item) {
      this.componentCheck = 2;
      this.timesheetdeletion = true;
      this.timesheetitems = item;
    },
    Updatetime() {
      this.componentCheck = 1;
      this.timesheetUpdate = true;
    },
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    edit_data(item) {
      this.timesheetitems = item;
      this.componentCheck = 4;
      this.timesheetEdition = true;
    },
    getStatusColor(status) {
      switch (status) {
        case "APPROVED":
          return "green";
        case "INPROGRESS":
          return "orange";
        case "REJECTED":
          return "red";
        case "WITHDRAWN":
          return "blue";
        default:
          return "grey";
      }
    },
    getStatusIcon(status) {
      switch (status) {
        case "APPROVED":
          return "mdi-check-circle";
        case "INPROGRESS":
          return "mdi-clock";
        case "REJECTED":
          return "mdi-close-circle";
        case "WITHDRAWN":
          return "mdi-undo";
        default:
          return "mdi-help-circle";
      }
    },
    getStatusTextColor(status) {
      switch (status) {
        case "APPROVED":
          return "text-green";
        case "INPROGRESS":
          return "text-orange";
        case "REJECTED":
          return "text-red";
        case "WITHDRAWN":
          return "text-primary";
        default:
          return "";
      }
    },
    view_timesheet(item) {
      this.timesheetitems = item;
      this.componentCheck = 3;
      this.displaytimesheet = true;
    },
    handleSortChange() {
      // Implement sorting logic if needed
    },
    updateTotalItems() {
      this.totalItems = this.filteredItems.length;
    },
    async fetch_usertimelist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_timesheet, {
            input: {
              user_id: data.user.user_id,
              action_type: "MY_TIMESHEET",
              limit: 11,
              nextToken: this.nextToken,
            },
          })
        );
        var response = JSON.parse(result.data.list_timesheet);

        if (response.Status == "SUCCESS") {
          this.nextToken = response.nextToken;
          // this.timeRecords = response.data;
          this.tableLoading = false;
          let array = this.timeRecords.concat(response.data);
          this.timeRecords = array;
          const uniqueArrayOfObjects = this.timeRecords.filter(
            (obj, index, self) =>
              index ===
              self.findIndex((o) => o.timesheet_id === obj.timesheet_id)
          );

          this.timeRecords = uniqueArrayOfObjects;
          this.updatePageItems();
        } else {
          this.timeRecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        console.log(error)
        this.timeRecords = [];
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
  },
};
</script>

<style scoped>
.card-container {
  position: relative;
}

.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
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
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

/* Column width controls */
.modern-data-table :deep(.v-data-table__wrapper table) {
  table-layout: fixed;
  width: 100%;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(1)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(2)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(3)) {
  width: 20% !important;
  max-width: 20% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(4)) {
  width: 20% !important;
  max-width: 20% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(5)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(6)) {
  width: 15% !important;
  max-width: 15% !important;
  text-align: center;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(1)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(2)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(3)) {
  width: 20% !important;
  max-width: 20% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(4)) {
  width: 20% !important;
  max-width: 20% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(5)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(6)) {
  width: 15% !important;
  max-width: 15% !important;
  text-align: center;
}

/* Ensure the actions button container doesn't expand */
.modern-data-table :deep(.v-data-table__wrapper td:nth-child(6) .d-flex) {
  width: 100%;
  justify-content: center;
}

/* Override Vuetify's default column spacing */
.modern-data-table :deep(.v-data-table__wrapper th),
.modern-data-table :deep(.v-data-table__wrapper td) {
  padding: 8px 12px !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:last-child),
.modern-data-table :deep(.v-data-table__wrapper td:last-child) {
  padding-right: 8px !important;
  padding-left: 8px !important;
}
</style>
