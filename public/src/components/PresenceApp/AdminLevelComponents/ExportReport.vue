<template>
  <div>
    <!-- Main Content -->
    <div class="main-content">
      <!-- Report Configuration Card -->
      <v-card class="configuration-card mb-4">
        <v-card-title class="card-title">
          <v-icon class="mr-2" color="#DB4C77">mdi-cog</v-icon>
          Report Configuration
        </v-card-title>
        <v-card-text class="card-title">
          <v-row>
            <v-col cols="12" sm="6" md="2">
              <v-select
                density="compact"
                variant="outlined"
                v-model="duration"
                :items="durationitems"
                item-title="name"
                item-value="value"
                label="Duration"
                class="modern-select"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="2"
              v-show="duration == 'Monthly' || duration == 'Yearly'"
            >
              <v-select
                density="compact"
                variant="outlined"
                v-model="userStatus"
                @change="listUser = 'ALL'"
                :items="statusitems"
                item-title="name"
                item-value="value"
                label="Status"
                class="modern-select"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2" v-show="duration == 'Daily'">
              <v-text-field
                label="Select Date"
                variant="outlined"
                density="compact"
                v-model="computedDateDisplay"
                append-inner-icon="mdi-calendar"
                color="primaryColor"
                persistent-hint
                readonly
                @click="datePicker = true"
                class="modern-select"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="2"
              v-show="duration == 'Monthly' || duration == 'Yearly'"
            >
              <v-select
                density="compact"
                variant="outlined"
                v-model="listUser"
                v-if="userStatus == 'ACTIVE'"
                :items="userArray"
                label="User"
                item-title="title"
                item-value="user_id"
                class="modern-select"
              />
              <v-select
                density="compact"
                variant="outlined"
                v-model="listUser"
                :items="userArray2"
                v-else
                label="User"
                item-title="title"
                item-value="user_id"
                class="modern-select"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2" v-show="duration == 'Daily'">
              <v-select
                density="compact"
                variant="outlined"
                v-model="absentpresent"
                label="Daily status"
                item-title="name"
                item-value="value"
                :items="absentpresentitems"
                class="modern-select"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="2"
              v-show="duration == 'Monthly' || duration == 'Yearly'"
            >
              <v-select
                v-model="selectedYear"
                :items="filteredYears"
                label="Select Year"
                density="compact"
                variant="outlined"
                @update:model-value="month_get"
                class="modern-select"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2" v-show="duration == 'Monthly'">
              <v-select
                density="compact"
                variant="outlined"
                v-model="selectedMonth"
                label="Month"
                item-title="title"
                item-value="value"
                :items="formattedMonthItems"
                class="modern-select"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2" v-show="duration == 'Monthly'">
              <v-select
                density="compact"
                variant="outlined"
                v-model="reporttype"
                label="Reports"
                item-title="text"
                item-value="value"
                :items="reporttypeitems"
                class="modern-select"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-select
                density="compact"
                variant="outlined"
                v-model="selectedGroup"
                label="Select Group"
                item-title="department_name"
                item-value="department_name"
                :items="groupItems"
                class="modern-select"
              />
            </v-col>
            <v-col cols="12" sm="6" md="2">
              <v-btn
                @click="generatereport()"
                size="small"
                :loading="buttonload"
                class="generate-btn"
                prepend-icon="mdi-file-export"
              >
                Generate Report
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Reports Table -->
      <v-card class="table-card">
        <v-card-title class="card-title d-flex align-center">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="#DB4C77">mdi-table</v-icon>
            <span>Generated Reports</span>
          </div>
          <v-spacer />
          <v-btn
            @click="get_report()"
            size="small"
            :loading="tableLoading"
            class="generate-btn"
            prepend-icon="mdi-file-export"
          >
            Refresh
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-data-table
            :headers="headers"
            :fixed-header="fixed"
            :items="paginatedItems"
            :height="tableHeight"
            :search="search"
            :loading="tableLoading"
            :items-per-page="itemsPerPage"
            density="comfortable"
            class="modern-data-table"
            hide-default-footer
            hover
            multi-sort
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4"
                  >mdi-file-document-outline</v-icon
                >
                <div class="text-h6 text-grey mb-2">No Reports Found</div>
                <div class="text-body-2 text-grey">
                  Try adjusting your filters or generate a new report.
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
                <div class="text-body-2 text-grey">Loading reports...</div>
              </div>
            </template>

            <template v-slot:[`item.report_type`]="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  size="16"
                  :color="getReportTypeColor(item.report_type)"
                  class="mr-2"
                >
                  {{ getReportTypeIcon(item.report_type) }}
                </v-icon>
                <span class="caption font-weight-medium">{{
                  getReportTypeLabel(item.report_type)
                }}</span>
              </div>
            </template>

            <template v-slot:[`item.user_type`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2"
                  >mdi-account</v-icon
                > -->
                <span class="caption font-weight-medium">{{
                  item.user_type == null ? "All" : item.user_type
                }}</span>
              </div>
            </template>

            <template v-slot:[`item.progressing_status`]="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  size="16"
                  :color="
                    item.progressing_status == 'COMPLETED'
                      ? 'success'
                      : 'warning'
                  "
                  class="mr-2"
                >
                  {{
                    item.progressing_status == "COMPLETED"
                      ? "mdi-check-circle"
                      : "mdi-clock-outline"
                  }}
                </v-icon>
                <span class="caption font-weight-medium">{{
                  item.progressing_status
                }}</span>
              </div>
            </template>

            <template v-slot:[`item.report_created_on`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                > -->
                <span class="caption">{{
                  get_displaydate(item.report_created_on)
                }}</span>
              </div>
            </template>

            <template v-slot:[`item.generationreport_url`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div
                    v-on="on"
                    v-show="item.generationreport_url != undefined"
                    @click="download_invoice(item)"
                  >
                    <v-btn
                      icon="mdi-download"
                      size="small"
                      color="primary"
                      variant="text"
                      class="download-btn"
                    />
                  </div>
                  <span
                    v-show="item.generationreport_url == undefined"
                    class="caption text-grey"
                    >-</span
                  >
                </template>
                <span
                  v-if="
                    item.generationreport_url != null ||
                    item.generationreport_url != undefined
                  "
                  class="white--text"
                >
                  Download Report
                </span>
              </v-tooltip>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalCount === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${totalCount} reports`
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

    <!-- Date Picker Dialog -->
    <v-dialog v-model="datePicker" persistent max-width="325">
      <v-card>
        <v-date-picker
          v-model="tempDate"
          :max="new Date().toISOString().substr(0, 10)"
          color="#DB4C77"
          class="primaryColor"
        />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="#DB4C77" @click="datePicker = false"
            >Cancel</v-btn
          >
          <v-btn variant="text" color="#DB4C77" @click="saveDate">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { presence_reports } from "@/graphql/mutations.js";
import { group_presence_reports } from "@/graphql/mutations.js";
import { list_presence_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_department_details } from "@/mixins/GetDepartments.js";

import SnackBar from "@/components/SnackBar.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
const FileSaver = require("file-saver");
import axios from "axios";

export default {
  components: {
    SnackBar,
  },
  mixins: [get_all_org_users, get_department_details],
  data() {
    return {
      userStatus: "ACTIVE",
      duration: "Daily",
      SnackBarComponent: {},
      reporttype: "DURATION_MONTHLY",
      endmodal: false,
      userArray: [],
      formattedMonthItems: [],
      userArray2: [],
      CurrentDate: new Date().toISOString().substr(0, 10),
      durationitems: [
        { name: "Daily", value: "Daily" },
        { name: "Monthly", value: "Monthly" },
        { name: "Yearly", value: "Yearly" },
      ],
      statusitems: [
        { name: "Active", value: "ACTIVE" },
        { name: "Inactive", value: "DEACTIVE" },
      ],
      absentpresentitems: [
        { name: "All", value: "ALL" },
        { name: "Present", value: "PRESENT" },
        { name: "Absent", value: "ABSENT" },
        { name: "Leave", value: "LEAVE" },
        { name: "Comp Off", value: "CUMPOFF" },
        { name: "Week Off", value: "WEEKOFF" },
      ],
      reporttypeitems: [
        { text: "Duration", value: "DURATION_MONTHLY" },
        { text: "Present-Absent-Leave", value: "PRESENT_AND_ABSENT_MONTHLY" },
      ],
      listUser: "ALL",
      absentpresent: "ALL",
      selectedMonth: "",
      tableLoading: false,
      search: "",
      fixed: true,
      buttonload: false,
      tableHeight: 0,
      monthitems: [],
      tableData: [],
      selectedDate: "",
      selectedYear: new Date().getFullYear(),
      headers: [
        { title: "Report Type", key: "report_type", sortable: true },
        { title: "User Type", key: "user_type", sortable: true },
        { title: "Generated on", key: "report_created_on", sortable: true },
        { title: "Generated By", key: "report_generated_by", sortable: true },
        { title: "Status", key: "progressing_status", sortable: true },
        { title: "Report", key: "generationreport_url", sortable: false },
      ],
      monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      computedDateFormatted: this.formatDate(new Date()),
      datePicker: false,
      tempDate: null,
      date: null,
      itemsPerPage: 20,
      currentPage: 1,
      selectedGroup: "",
      groupItems: [],
    };
  },

  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },
    filteredYears() {
      const currentYear = new Date().getFullYear();
      var dateComponents = this.selectedDate.split(/[/,:\s]+/);
      var month = parseInt(dateComponents[1], 10) - 1;
      var date = new Date(
        dateComponents[2],
        month,
        dateComponents[0],
        dateComponents[3],
        dateComponents[4],
        dateComponents[5]
      );
      const selectedDateYear = date.getFullYear();
      const years = [];
      for (let year = selectedDateYear; year <= currentYear; year++) {
        years.push(year);
      }
      return years;
    },
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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

  async created() {
    try {
      this.tableHeight = window.innerHeight - 400;
      this.selectedDate = this.get_date(
        this.$store.getters.GetUserObj.organization.organization_created_on
      );
      this.month_get();
      this.$store.commit("Setnamesearch", this.search);
      await this.get_all_org_users();
      await this.get_report();
      await this.get_department_details();

      this.groupItems = [
        {
          department_name: "All",
          department_id: "ALL",
        },
        ...this.departmentList,
      ];

      this.selectedGroup = "ALL";
      this.fetch_details();
    } catch (error) {
      console.error("Error in created lifecycle:", error);
    }
  },

  methods: {
    back_action() {
      this.$router.go(-1);
    },

    getReportTypeColor(reportType) {
      const colors = {
        DAILY_PRESENT: "success",
        DAILY_ABSENT: "error",
        DAILY_LEAVE: "warning",
        PRESENT_AND_ABSENT_MONTHLY: "primary",
        DURATION_MONTHLY: "info",
        YEARLY_REPORT: "secondary",
        DAILY_WEEKOFF: "purple",
        DAILY_CUMPOFF: "orange",
      };
      return colors[reportType] || "grey";
    },

    getReportTypeIcon(reportType) {
      const icons = {
        DAILY_PRESENT: "mdi-check-circle",
        DAILY_ABSENT: "mdi-close-circle",
        DAILY_LEAVE: "mdi-calendar-remove",
        PRESENT_AND_ABSENT_MONTHLY: "mdi-calendar-month",
        DURATION_MONTHLY: "mdi-clock-outline",
        YEARLY_REPORT: "mdi-calendar-year",
        DAILY_WEEKOFF: "mdi-calendar-weekend",
        DAILY_CUMPOFF: "mdi-calendar-clock",
      };
      return icons[reportType] || "mdi-file-document";
    },

    getReportTypeLabel(reportType) {
      const labels = {
        DAILY_PRESENT: "Daily Present",
        DAILY_ABSENT: "Daily Absent",
        DAILY_LEAVE: "Daily Leave",
        PRESENT_AND_ABSENT_MONTHLY: "Monthly Present,Absent and Leave",
        DURATION_MONTHLY: "Monthly Duration",
        YEARLY_REPORT: "Yearly",
        DAILY_WEEKOFF: "Daily WeekOff",
        DAILY_CUMPOFF: "Daily CompOff",
      };
      return labels[reportType] || reportType;
    },

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

    saveDate() {
      this.date = this.tempDate;
      this.computedDateFormatted = this.tempDate
        ? this.formatDate(this.tempDate)
        : "";
      this.datePicker = false;
    },

    generatereport() {
      // If "All" selected → existing functions
      if (this.selectedGroup === "ALL" || !this.selectedGroup) {
        if (this.duration === "Daily") {
          this.get_dailyreport();
        } else if (this.duration === "Monthly") {
          this.get_monthlyreport();
        } else {
          this.get_yearlyreport();
        }
      } else {
        // If specific group selected → group APIs
        if (this.duration === "Daily") {
          this.get_dailyreport_group();
        } else if (this.duration === "Monthly") {
          this.get_monthlyreport_group();
        } else {
          this.get_yearlyreport_group();
        }
      }
    },

    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            title: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      this.userArray.unshift({
        title: "All",
        user_id: "ALL",
      });
      this.userArray2.unshift({
        title: "All",
        user_id: "ALL",
      });
      this.orgUsers.forEach((element) => {
        if (element.user_status == "DEACTIVE") {
          this.userArray2.push({
            title: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      this.userArray.sort((a, b) => a.title.localeCompare(b.title));
      this.userArray2.sort((a, b) => a.title.localeCompare(b.title));
    },

    month_get() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonthIndex = currentDate.getMonth();
      let newMonthItems = [];

      if (!this.selectedDate) {
        this.monthItems = [];
        this.formattedMonthItems = [];
        return;
      }

      const month = this.selectedDate.match(/\/(\d{2})\//)?.[1];
      if (!month) {
        this.monthItems = [];
        this.formattedMonthItems = [];
        return;
      }

      if (this.selectedYear < currentYear) {
        newMonthItems = this.monthNames.slice();
      } else if (this.selectedYear === currentYear) {
        newMonthItems = this.monthNames.slice(0, currentMonthIndex + 1);
      } else {
        newMonthItems = this.monthNames.slice();
      }

      this.monthItems = [...newMonthItems];
      this.formattedMonthItems = this.monthItems.map((month, index) => ({
        title: month,
        value: (index + 1).toString().padStart(2, "0"),
      }));

      this.selectedMonth = (currentMonthIndex + 1).toString().padStart(2, "0");

      if (this.selectedYear == new Date(this.selectedDate).getFullYear()) {
        const startIndex = this.formattedMonthItems.findIndex(
          (item) => item.value === month
        );
        const filteredArray =
          startIndex !== -1 ? this.formattedMonthItems.slice(startIndex) : [];
        this.formattedMonthItems = [...filteredArray];
        this.selectedMonth = month;
      }
    },

    gettimecal() {
      this.endmodal = true;
    },

    dateformating(CurrentDate) {
      if (!CurrentDate) return null;
      const [year, month, day] = CurrentDate.split("-");
      return `${day}/${month}/${year}`;
    },

    get_date(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },

    get_displaydate(val) {
      return formatedatetime(val);
    },

    async download_invoice(url) {
      var fileName = url.report_type + ".xlsx";
      axios({
        url: url.generationreport_url,
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },

    async get_report() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_presence_reports, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
            },
          })
        );
        this.tableLoading = false;
        var response = result.data.list_presence_reports.items;
        this.tableData = response;
        this.currentPage = 1;
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

    async get_dailyreport() {
      this.buttonload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(presence_reports, {
            input: {
              action_type: "DAILY",
              action_value: this.absentpresent,
              organization_id: data.organization.organization_id,
              user_id: this.listUser,
              swipe_date: this.computedDateFormatted,
              user_status: this.userStatus,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.buttonload = false;

        var response = JSON.parse(result.data.presence_reports);

        if (response.Status == "SUCCESS") {
          this.buttonload = false;
          this.get_report();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.buttonload = false;
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
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async get_monthlyreport() {
      this.buttonload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(presence_reports, {
            input: {
              action_type: "MONTHLY",
              action_value: this.reporttype,
              organization_id: data.organization.organization_id,
              user_id: this.listUser,
              user_status: this.userStatus,
              swipe_year: this.selectedYear,
              swipe_month: this.selectedMonth,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.buttonload = false;

        var response = JSON.parse(result.data.presence_reports);

        if (response.Status == "SUCCESS") {
          this.buttonload = false;
          this.get_report();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.buttonload = false;
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
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async get_yearlyreport() {
      this.buttonload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(presence_reports, {
            input: {
              action_type: "YEARLY",
              action_value: "YEAR_BOTH",
              organization_id: data.organization.organization_id,
              user_id: this.listUser,
              user_status: this.userStatus,
              swipe_year: this.selectedYear,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.buttonload = false;

        var response = JSON.parse(result.data.presence_reports);

        if (response.Status == "SUCCESS") {
          this.buttonload = false;
          this.get_report();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.buttonload = false;
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
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async get_dailyreport_group() {
      this.buttonload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(group_presence_reports, {
            input: {
              action_type: "DAILY",
              action_value: this.absentpresent,
              organization_id: data.organization.organization_id,
              group_name: this.selectedGroup,
              user_id: this.listUser,
              swipe_date: this.computedDateFormatted,
              user_status: this.userStatus,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.buttonload = false;

        var response = JSON.parse(result.data.group_presence_reports);

        if (response.Status == "SUCCESS") {
          this.buttonload = false;
          this.get_report();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.buttonload = false;
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
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async get_monthlyreport_group() {
      this.buttonload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(group_presence_reports, {
            input: {
              action_type: "MONTHLY",
              action_value: this.reporttype,
              organization_id: data.organization.organization_id,
              group_name: this.selectedGroup,
              user_id: this.listUser,
              user_status: this.userStatus,
              swipe_year: this.selectedYear,
              swipe_month: this.selectedMonth,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.buttonload = false;

        var response = JSON.parse(result.data.group_presence_reports);

        if (response.Status == "SUCCESS") {
          this.buttonload = false;
          this.get_report();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.buttonload = false;
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
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async get_yearlyreport_group() {
      this.buttonload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(group_presence_reports, {
            input: {
              action_type: "YEARLY",
              action_value: "YEAR_BOTH",
              organization_id: data.organization.organization_id,
              group_name: this.selectedGroup,
              user_id: this.listUser,
              user_status: this.userStatus,
              swipe_year: this.selectedYear,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.buttonload = false;

        var response = JSON.parse(result.data.group_presence_reports);

        if (response.Status == "SUCCESS") {
          this.buttonload = false;
          this.get_report();
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.buttonload = false;
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
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    updatePageItems() {
      // Implement the logic to update items based on the selected page
    },
  },
};
</script>

<style scoped>
/* Main Content */
.main-content {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Card Styles */
.configuration-card,
.table-card {
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  background: white !important;
}

.card-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #2c3e50 !important;
  padding: 20px 24px 16px 24px !important;
  border-bottom: 1px solid #e9ecef !important;
  background: #f8f9fa !important;
}

/* Modern Select Styles */
.modern-select {
  border-radius: 8px !important;
}

.modern-select :deep(.v-field) {
  border-radius: 8px !important;
  background: #f8f9fa !important;
}

.modern-select :deep(.v-field--focused) {
  background: white !important;
  box-shadow: 0 0 0 2px rgba(219, 76, 119, 0.2) !important;
}

/* Generate Button */
.generate-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3) !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  text-transform: none !important;
  height: 40px !important;
}

.generate-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4) !important;
}

.generate-btn:disabled {
  background: #9e9e9e !important;
  box-shadow: none !important;
  transform: none !important;
}

/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px !important;
}

.modern-data-table :deep(.v-data-table__thead) {
  background: #f8f9fa !important;
}

.modern-data-table :deep(.v-data-table__thead th) {
  font-weight: 600 !important;
  color: #2c3e50 !important;
  font-size: 14px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease !important;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(219, 76, 119, 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody td) {
  font-size: 14px !important;
  color: #2c3e50 !important;
}

/* Download Button */
.download-btn {
  transition: all 0.2s ease !important;
}

.download-btn:hover {
  transform: scale(1.1) !important;
  color: #db4c77 !important;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
  background: #db4c77 !important;
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
  .main-content {
    padding: 16px;
  }

  .table-footer {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>