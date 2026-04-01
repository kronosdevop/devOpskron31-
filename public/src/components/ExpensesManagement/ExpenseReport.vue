<template>
  <div >
    <v-card flat >
      <!-- <v-card-text> -->
      <v-toolbar
        flat
        
        class="pt-2 bg-white"
        density="compact"
      >
        <!-- <v-menu
          ref="menu"
          v-model="monthdailog"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="date1"
              label="Select a Month"
              readonly
              :disabled="tableLoading == true"
              dense
              v-bind="attrs"
              style="max-width: 200px"
              class="ml-2"
              outlined
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            :max="new Date().toISOString().substr(0, 10)"
            v-model="date"
            type="month"
            no-title
            color="primaryColor white--text"
            scrollable
          >
            <v-spacer></v-spacer>
            <v-btn text color="primaryColor" @click="monthdailog = false">
              Cancel
            </v-btn>
            <v-btn
              text
              color="primaryColor"
              @click="$refs.menu.save(date)"
              v-on:click="get_next()"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-menu> -->
        <v-spacer />
        <v-btn
          depressed
          @click="generatereport()"
          dark
          size="small"
          :loading="buttonload"
          class="text-capitalize cardCss ml-2"
        >
          Generate Report
        </v-btn></v-toolbar
      >
      <!-- <v-row> -->
      <!-- <v-col cols="5"> -->
      <!-- <div class="text-left d-flex">
            <h4>Expense for the Month</h4>
          </div> -->

      <!-- <v-divider class="mb-2 ml-4" />
          <div class="ml-6">
            <span><b>Expense for the Month</b></span
            ><br />
            <span style="font-size: smaller"
              ><b> Approved Amount : </b>
              <span class="green--text">{{
                total_amount_approved
              }}</span> </span
            ><br />
            <span style="font-size: smaller"
              ><b> Pending Amount : </b>
              <span class="green--text">{{ total_amount_pending }}</span></span
            ><br />
            <span style="font-size: smaller"
              ><b> Rejected Amount : </b>
              <span class="green--text">{{ total_amount_rejected }}</span></span
            ><br />
            <span style="font-size: smaller"
              ><b> Withdrawn Amount : </b>
              <span class="green--text">{{
                total_amount_withdrawn
              }}</span></span
            >
          </div>
          <GChart
            type="PieChart"
            :data="chartData1"
            :options="chartOptions"
            class="ml-n16"
          />
        </v-col> -->
      <!-- <v-col cols="7"> -->
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
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
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-file-chart</v-icon
              >
              <div class="text-h6 text-grey mb-2">No Reports Found</div>
              <div class="text-body-2 text-grey">
                Generate a new report to see data here.
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

          <!-- Month/Year -->
          <template v-slot:[`item.report_year`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="20" color="primary" class="mr-3"
                >mdi-calendar-month</v-icon
              > -->
              <div>
                <div class="font-weight-medium text-body-2">
                  <span v-if="item.report_year && item.report_month">{{
                    month_year(item.report_year, item.report_month)
                  }}</span>
                  <span v-else>All</span>
                </div>
              </div>
            </div>
          </template>

          <!-- Generated On -->
          <template v-slot:[`item.report_created_on`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2"
                >mdi-calendar-clock</v-icon
              > -->
              <span class="caption">
                {{ fetch_value(item.report_created_on) }}
              </span>
            </div>
          </template>

          <!-- Generated By -->
          <template v-slot:[`item.report_created_by`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-avatar size="24" color="primary" class="mr-2">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{
                    (item.report_created_by || "U")
                      .substring(0, 1)
                      .toUpperCase()
                  }}
                </span>
              </v-avatar> -->
              <span class="caption">
                {{ item.report_created_by || "N/A" }}
              </span>
            </div>
          </template>

          <!-- Status -->
          <template v-slot:[`item.report_generation_status`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                size="16"
                :color="getStatusColor(item.report_generation_status)"
                class="mr-2"
              >
                {{ getStatusIcon(item.report_generation_status) }}
              </v-icon>
              <span
                class="caption font-weight-medium"
                :class="getStatusTextColor(item.report_generation_status)"
              >
                {{
                  item.report_generation_status === "IN PROGRESS"
                    ? "IN PROGRESS"
                    : item.report_generation_status
                }}
              </span>
            </div>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex align-center justify-center">
              <span v-if="item.report_generation_status == 'COMPLETED'">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  @click="download_item(item)"
                  color="primary"
                  class="cursor-pointer"
                >
                  <v-icon size="18">mdi-download</v-icon>
                </v-btn>
              </span>
              <span v-else class="caption grey--text">-</span>
            </div>
          </template>
        </v-data-table>
        <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} reports`
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

              <!-- Modern Table Footer -->
             
      <!-- </v-col>
      </v-row> -->
      <!-- </v-card-text> -->
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="compenetCheck == 1">
      <ExpenseGenerate
        :reportexpense="reportexpense"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="reportexpense = false"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { GChart } from "vue-google-charts/legacy";
import { expense_reports_graph, list_all_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import ExpenseGenerate from "@/components/ExpensesManagement/ExpensePopups/ExpenseGenerate.vue";
const FileSaver = require("file-saver");
import axios from "axios";

export default {
  components: {
    GChart,
    SnackBar,
    ExpenseGenerate,
  },
  data: () => ({
    chartData1: [["labels", "Data"]],
    chartOptions: {
      // width:
      height: 250,
    },
    date1:
      [
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
      ][Number(new Date().toISOString().split("T")[0].split("-")[1]) - 1] +
      " " +
      new Date().toISOString().split("T")[0].split("-")[0],
    date: new Date().toISOString().substr(0, 7),
    height: 0,
    monthdailog: false,
    fixed: true,
    buttonload: false,
    tableData: [],
    SnackBarComponent: {},
    reportexpense: false,
    headers: [
      { title: "Month/Year", value: "report_year", sortable: false },
      { title: "Generated On", value: "report_created_on", sortable: false },
      {
        title: "Generated By",
        value: "report_created_by",
        sortable: false,
      },
      {
        title: "Status",
        value: "report_generation_status",
        sortable: false,
      },
      {
        title: "Actions",
        value: "actions",
        sortable: false,
      },
    ],
    tableLoading: false,
    formattedmonth: null,
    formattedyear: null,
    compenetCheck: 0,
    graphdata: [],
    total_amount_approved: "",
    total_amount_pending: "",
    total_amount_rejected: "",
    total_amount_withdrawn: "",
    currentPage: 1,
    itemsPerPage: 10,
  }),
  computed: {
    totalItems() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    sortedAndPaginatedItems() {
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
    this.height = window.innerHeight - 360;
    await this.fecth_date();
    // await this.get_initiated_expense();
    await this.list_reports();
  },
  watch: {
    date(val) {
      this.date1 =
        [
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
        ][Number(val.split("-")[1]) - 1] +
        " " +
        val.split("-")[0];
    },
  },
  methods: {
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.reportexpense = false;

      this.list_reports();
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

    async download_item(item) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileName = firstName
        ? firstName +
          "_" +
          (item.project_name == undefined
            ? item.group_name == undefined
              ? "All"
              : item.group_name
            : item.project_name) +
          "_" +
          (item.category_name == undefined ? "All" : item.category_name) +
          ".xlsx"
        : "_" +
          (item.project_name == undefined
            ? item.group_name == undefined
              ? "All"
              : item.group_name
            : item.project_name) +
          "_" +
          (item.category_name == undefined ? "All" : item.category_name) +
          ".xlsx";
      axios({
        url: item.report_url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },

    month_year(report_year, report_month) {
      const monthNames = [
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

      if (report_month >= 1 && report_month <= 12) {
        const formattedMonth = monthNames[report_month - 1];
        const formattedDate = `${formattedMonth}-${report_year}`;
        return formattedDate;
      } else {
        return "Invalid month";
      }
    },

    fetch_value(val) {
      return formatedatetime(val);
      // const d = new Date(parseInt(val * 1000));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
    },

    async get_next() {
      this.chartData1 = [];
      this.chartData1 = [["labels", "Data"]];
      await this.fecth_date();
      await this.get_initiated_expense();
    },

    fecth_date() {
      const [month, year] = this.date1.split(" ");

      const monthMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      };

      this.formattedmonth = `${monthMap[month]}`;
      this.formattedyear = `${year}`;
      this.formattedmonth = parseInt(this.formattedmonth, 10);
      this.formattedyear = parseInt(this.formattedyear, 10);
    },

    async list_reports() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_reports, {
            input: {
              organization_id: data.organization.organization_id,
              report_type: "EXPENSE",
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.list_all_reports);
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
        }
        // console.log(response.data);
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

    generatereport() {
      this.compenetCheck = 1;
      this.reportexpense = true;
    },

    async get_initiated_expense() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(expense_reports_graph, {
            input: {
              organization_id: data.organization.organization_id,
              year: this.formattedyear,
              month: this.formattedmonth,
            },
          })
        );

        var response = JSON.parse(result.data.expense_reports_graph).data;
        this.graphdata = response.expense_category_list;

        for (let i = 0; i < this.graphdata.length; i++) {
          this.chartData1.push([
            this.graphdata[i].expense_name,
            this.graphdata[i].total_amount,
          ]);
        }
        // console.log(this.chartData1, "this.chartData1");
        this.total_amount_approved = response.total_amount_approved;
        this.total_amount_pending = response.total_amount_pending;
        this.total_amount_rejected = response.total_amount_rejected;
        this.total_amount_withdrawn = response.total_amount_withdrawn;
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    handleSortChange() {
      // Implement sorting logic if needed
    },

    getStatusColor(status) {
      switch (status) {
        case "COMPLETED":
          return "green";
        case "IN PROGRESS":
          return "orange";
        default:
          return "grey";
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case "COMPLETED":
          return "mdi-check-circle";
        case "IN PROGRESS":
          return "mdi-clock-outline";
        default:
          return "mdi-help-circle";
      }
    },

    getStatusTextColor(status) {
      switch (status) {
        case "COMPLETED":
          return "green--text";
        case "IN PROGRESS":
          return "orange--text";
        default:
          return "grey--text";
      }
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