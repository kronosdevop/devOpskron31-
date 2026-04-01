<template>
  <div>
    <v-card flat >
      <!-- Form Controls -->
      <v-card-text class="pa-4">
        <v-form ref="form">
          <v-row>
            <v-col cols="2">
              <v-select
                v-model="selectedYear"
                :items="filteredYears"
                label="Select Year"
                density="compact"
                variant="outlined"
                @update:model-value="month_get"
              ></v-select>
            </v-col>
            <v-col cols="2">
              <v-select
                density="compact"
                variant="outlined"
                v-model="selectedMonth"
                label="Month"
                item-text="title"
                item-value="value"
                :items="formattedMonthItems"
              />
            </v-col>
            <v-col cols="2">
              <v-select
                density="compact"
                variant="outlined"
                v-model="listUser"
                :items="userArray"
                label="User"
                item-text="title"
                item-value="user_id"
              />
            </v-col>
            <v-col cols="2">
              <v-select
                v-model="timesheetProject"
                density="compact"
                variant="outlined"
                item-text="title"
                item-value="value"
                label="Select Project"
                :rules="[(v) => !!v || 'Required']"
                :items="timesheetitemsProject"
                @change="extractProjectActivities(timesheetProject)"
              />
            </v-col>
            <v-col cols="2">
              <v-btn
                depressed
                @click="generatereport()"
                dark
                size="small"
                :loading="buttonload"
                class="text-capitalize cardCss text-white"
                prepend-icon="mdi-file-chart"
              >
                Generate Report
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <!-- Data Table -->
        <v-data-table
          :headers="timeSheetHeaders"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalItems"
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg mt-4"
          density="compact"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-file-chart</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Reports Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or generate a new report.
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
              <div class="text-body-2 grey--text">Loading reports...</div>
            </div>
          </template>

          <!-- Project Name -->
          <template v-slot:[`item.project_name`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="20" color="primary" class="mr-3">mdi-folder</v-icon>
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.project_name || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <!-- Month -->
          <template v-slot:[`item.report_genrated_month`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
              <span class="caption">{{
                getMonthName(item.report_genrated_month)
              }}</span>
            </div>
          </template>

          <!-- Year -->
          <template v-slot:[`item.report_genrated_year`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2"
                >mdi-calendar-year</v-icon
              >
              <span class="caption">{{
                item.report_genrated_year || "N/A"
              }}</span>
            </div>
          </template>

          <!-- Generated on -->
          <template v-slot:[`item.report_created_on`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2">mdi-clock</v-icon>
              <span class="caption">{{
                get_dateformate(item.report_created_on)
              }}</span>
            </div>
          </template>

          <!-- Generated By -->
          <template v-slot:[`item.report_generated_by`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="24" color="primary" class="mr-2">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{
                    (item.report_generated_by || "U")
                      .substring(0, 1)
                      .toUpperCase()
                  }}
                </span>
              </v-avatar>
              <span class="caption">{{
                item.report_generated_by || "N/A"
              }}</span>
            </div>
          </template>

          <!-- Status -->
          <template v-slot:[`item.progressing_status`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                size="16"
                :color="
                  item.progressing_status === 'COMPLETED' ? 'green' : 'orange'
                "
                class="mr-2"
              >
                {{
                  item.progressing_status === "COMPLETED"
                    ? "mdi-check-circle"
                    : "mdi-clock"
                }}
              </v-icon>
              <span
                :class="
                  item.progressing_status === 'COMPLETED'
                    ? 'text-green'
                    : 'text-orange'
                "
                style="font-size: 12px"
              >
                {{ item.progressing_status }}
              </span>
            </div>
          </template>

          <!-- Report Download -->
          <template v-slot:[`item.generationreport_url`]="{ item }">
            <div class="d-flex align-center justify-center">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div
                    v-on="on"
                    v-show="item.generationreport_url != undefined"
                    @click="download_invoice(item)"
                    class="cursor-pointer"
                  >
                    <v-icon size="small" class="mr-1" color="#DB4C77">
                      mdi-download
                    </v-icon>
                  </div>
                  <span
                    v-show="item.generationreport_url == undefined"
                    class="ml-2"
                  >
                    -
                  </span>
                </template>
                <span
                  v-if="
                    item.generationreport_url != null ||
                    item.generationreport_url != undefined
                  "
                  class="white--text"
                >
                  Download
                </span>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Footer bar always rendered -->
    <div
      class="footer-bar d-flex align-center justify-space-between px-6 py-2"
      style="min-height: 56px; background: #f7f8fa"
    >
      <div class="text-caption ml-4" style="color: black; font-size: 14px">
        {{
          totalItems === 0
            ? "No Results"
            : (currentPage - 1) * itemsPerPage +
              1 +
              " to " +
              Math.min(currentPage * itemsPerPage, totalItems) +
              " of " +
              totalItems +
              " Results"
        }}
      </div>
      <div class="pagination-container d-flex align-center mr-4">
        <v-pagination
          v-model="currentPage"
          :length="pageCount"
          active-color="primary"
          density="comfortable"
          class="pagination-footer"
          :total-visible="5"
          next-icon="mdi-chevron-right"
          prev-icon="mdi-chevron-left"
        />
      </div>
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { timesheet_reports } from "@/graphql/mutations.js";
import { list_timesheet_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_projects } from "@/graphql/queries.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import SnackBar from "@/components/SnackBar.vue";
import axios from "axios";

const FileSaver = require("file-saver");
export default {
  components: {
    SnackBar,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      timeRecords: [],
      timesheetactivity: "ALL",
      timesheetitemsactivity: [],
      buttonload: false,
      tableLoading: false,
      SnackBarComponent: {},
      selectedYear: new Date().getFullYear(),
      fixed: true,
      listUser: "ALL",
      userArray: [],
      formattedMonthItems: [],
      timesheetitemsProject: [],
      monthitems: [],
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
      selectedMonth: "",
      selectedDate: "",
      timesheetProject: "ALL",
      timeSheetHeaders: [
        {
          title: "Project",
          key: "project_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Month",
          key: "report_genrated_month",
          sortable: true,
          align: "start",
        },
        {
          title: "Year",
          key: "report_genrated_year",
          sortable: true,
          align: "start",
        },
        {
          title: "Generated on",
          key: "report_created_on",
          sortable: true,
          align: "start",
        },
        {
          title: "Generated By",
          key: "report_generated_by",
          sortable: true,
          align: "start",
        },
        {
          title: "Status",
          key: "progressing_status",
          sortable: false,
          align: "center",
        },
        {
          title: "Report",
          key: "generationreport_url",
          sortable: false,
          align: "center",
        },
      ],
      searchQuery: "",
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: [{ key: "report_created_on", order: "desc" }],
    };
  },
  async mounted() {
    this.selectedDate = this.get_date(
      this.$store.getters.GetUserObj.organization.organization_created_on
    );
    await this.get_report();
    await this.month_get();
    await this.get_all_org_users();
    await this.fetch_details();
    await this.fetch_projectes();
  },
  computed: {
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
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.timeRecords;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.timeRecords.filter(
        (item) =>
          (item.project_name &&
            item.project_name.toLowerCase().includes(searchTerm)) ||
          (item.report_generated_by &&
            item.report_generated_by.toLowerCase().includes(searchTerm)) ||
          (item.progressing_status &&
            item.progressing_status.toLowerCase().includes(searchTerm)) ||
          (item.report_genrated_year &&
            item.report_genrated_year.toString().includes(searchTerm))
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
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
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
  },
  methods: {
    getMonthName(monthNumber) {
      const months = [
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
      ];

      monthNumber = parseInt(monthNumber, 10);

      return months[monthNumber - 1];
    },
    generatereport() {
      if (this.$refs.form.validate()) {
        this.get_monthlyreport();
      }
    },
    get_dateformate(val) {
      return formatedatetime(val);
    },
    async fetch_projectes() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_projects, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_projects);
        this.projectdata = response.data;
        this.projectdata.forEach((element) => {
          this.timesheetitemsProject.push({
            title: element.project_name,
            value: element.project_id,
          });
        });
        this.timesheetitemsProject.unshift({
          title: "All",
          value: "ALL",
        });
        this.timesheetitemsactivity.unshift({
          title: "All",
          value: "ALL",
        });
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    extractProjectActivities(projectId) {
      this.timesheetitemsactivity = [];

      this.projectdata.forEach((obj) => {
        if (obj.project_name === projectId.text) {
          this.timesheetitemsactivity.push(
            ...obj.project_activities.map((activity) => ({
              title: activity,
              value: activity,
            }))
          );

          this.timesheetitemsactivity.unshift({
            title: "All",
            value: "ALL",
          });
          this.timesheetactivity = "ALL";
        } else {
          this.timesheetitemsactivity.unshift({
            title: "All",
            value: "ALL",
          });
          this.timesheetactivity = "ALL";
        }
      });
    },
    month_get() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonthIndex = currentDate.getMonth();

      let newMonthItems = [];
      const month = this.selectedDate.match(/\/(\d{2})\//)[1];

      if (this.selectedYear < currentYear) {
        newMonthItems = this.monthNames.slice();
      } else if (this.selectedYear === currentYear) {
        newMonthItems = this.monthNames.slice(0, currentMonthIndex + 1);
      } else {
        newMonthItems = this.monthNames.slice();
      }

      this.monthItems = newMonthItems.slice();

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

        this.formattedMonthItems = [];
        this.formattedMonthItems = filteredArray;

        this.selectedMonth = month;
      }

      this.$forceUpdate();
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
      this.userArray.sort((a, b) => a.title.localeCompare(b.title));
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
    async get_monthlyreport() {
      this.buttonload = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(timesheet_reports, {
            input: {
              action_type: "MONTHLY",
              action_value: "PROJECTS",
              organization_id: data.organization.organization_id,
              user_id: this.listUser,
              month: this.selectedMonth,
              year: this.selectedYear,
              project_id: this.timesheetProject,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.buttonload = false;

        var response = JSON.parse(result.data.timesheet_reports);

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
        this.buttonload = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async get_report() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_timesheet_reports, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
            },
          })
        );
        this.tableLoading = false;
        var response = result.data.list_timesheet_reports.items;
        this.timeRecords = response;
        this.totalItems = response.length;
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
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (key === "report_genrated_year") {
        return parseInt(value, 10);
      } else if (key === "report_genrated_month") {
        return parseInt(value, 10);
      } else if (key === "report_created_on") {
        return new Date(value).getTime();
      } else if (key === "report_generated_by") {
        return value.toLowerCase();
      } else if (key === "progressing_status") {
        return value.toLowerCase();
      } else if (key === "project_name") {
        return value.toLowerCase();
      }
      return value;
    },
    updateTotalItems() {
      this.totalItems = this.filteredItems.length;
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
}

.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.pagination-container {
  min-width: 160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-footer {
  margin: 0;
  padding: 0;
  display: inline-flex;
}

.pagination-footer :deep(.v-pagination__list) {
  background: transparent;
  justify-content: flex-end;
}

.pagination-footer :deep(.v-pagination__item) {
  border-radius: 50%;
  margin: 0 2px;
}

.pagination-footer :deep(.v-pagination__item--is-active) {
  background-color: var(--v-primary-base);
  color: white;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
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