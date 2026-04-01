<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-toolbar flat class="pt-2 bg-white">
          <v-menu
            v-model="monthPicker"
            :close-on-content-click="false"
            persistent
            max-width="350"
            transition="scale-transition"
            scroll-strategy="none"
          >
            <template #activator="{ props }">
              <v-text-field
                v-model="datedisplay"
                label="Select a Month"
                readonly
                density="compact"
                variant="outlined"
                class="mt-4"
                style="max-width: 200px"
                v-bind="props"
              />
            </template>

            <v-card>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="7" class="">
                    <span class="ml-6" style="font-size: 19px"
                      ><b>{{ datedisplayMonth }}</b></span
                    >
                  </v-col>
                  <v-col>
                    <v-select
                      label="Select Year"
                      v-model="yearfilter"
                      :items="itemyears"
                      density="compact"
                      variant="outlined"
                      style="max-width: 100px"
                      class=""
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row class="ml-n2" dense>
                  <v-col
                    v-for="(month, index) in monthNames"
                    :key="index"
                    cols="4"
                    class="d-flex justify-center"
                  >
                    <v-btn
                      class="ma-1"
                      :class="{ 'active-btn': month === monthfilter }"
                      density="compact"
                      :disabled="isMonthDisabled(index)"
                      @click="selectMonth(month)"
                    >
                      {{ month }}
                    </v-btn>
                  </v-col>
                </v-row>

                <v-row class="mt-4 justify-end">
                  <v-btn
                    text
                    class="ma-1"
                    density="compact"
                    @click="closedialog()"
                  >
                    Cancel
                  </v-btn>
                  <v-btn
                    color="primary"
                    text
                    class="ma-1 mr-8"
                    density="compact"
                    @click="saveSelection"
                  >
                    Save
                  </v-btn>
                </v-row>
              </v-card-text>
            </v-card>
          </v-menu>
          <span class="ml-2 mt-n1"
            ><strong>Total : </strong>{{ monthlyTotal }}</span
          >
          <v-spacer />
          <v-btn
            variant="flat"
            @click="exportreport()"
            color="primary"
            class="text-capitalize cardCss ml-2 mt-n6"
          >
            Export
          </v-btn>
        </v-toolbar>

<div>          <!-- <apexchart
            :series="section_value"
            :options="chartOptions"
            :key="updatekey"
          /> -->
          <!-- <ColoumnChart

            :key="'chart_' + updatekey"
            :coloumndata="section_value[0].data"
            :chartId="'coloumnContainer_' + updatekey"
          /> -->
<div class="table-wrapper">
  <v-data-table
    :headers="headers"
    :items="paginatedItems"
    :loading="tableLoading"
    hide-default-footer
      fixed-header
  height="320"
    class="modern-data-table"
  >
<template #body.prepend>
  <tr v-if="tableLoading">
    <td :colspan="headers.length" class="loader-td">
      <div class="loader-center">
        <v-progress-circular
          indeterminate
          size="42"
          width="3"
          color="primary"
        />
        <div class="loader-text">Loading Groups…</div>
      </div>
    </td>
  </tr>
</template>
  </v-data-table>

  <div class="table-footer">
    <div class="footer-info">
      {{
        totalItems === 0
          ? "No Results"
          : `Showing ${paginatedItems.length} of ${totalItems} records`
      }}
    </div>

    <div class="pagination-controls">
      <v-btn
        :disabled="currentPage === 1"
        variant="text"
        size="small"
        class="pagination-btn"
        @click="currentPage--"
      >
        Previous
      </v-btn>

      <div class="page-numbers">
        <v-btn
          v-for="page in visiblePages"
          :key="page"
          size="small"
          :class="page === currentPage ? 'active-page' : 'inactive-page'"
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
        @click="currentPage++"
      >
        Next
      </v-btn>
    </div>
  </div>
</div>
        </div>
       
      </v-card-text>
    </v-card>
    <ExportGroupAndCat
      :selectedData="selectedData"
      :ExportreportDialog="ExportreportDialog"
      :datevalue="datevalue"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
      v-on:SuccessURL="download_item"
      @clicked="ExportreportDialog = false"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { expense_reports_graph } from "@/graphql/queries.js";
import VueApexCharts from "vue3-apexcharts";
import ColoumnChart from "@/components/Graph/ColoumnChart.vue";
import ExportGroupAndCat from "@/components/ExpensesManagement/ExpensePopups/ExportGroupAndCat.vue";
import SnackBar from "@/components/SnackBar.vue";
const FileSaver = require("file-saver");
import axios from "axios";

export default {
  components: {
    apexchart: VueApexCharts,
    ExportGroupAndCat,
    SnackBar,
    ColoumnChart,
  },
  data() {
    return {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,

      formattedmonth: "",
      formattedyear: "",
      selectedData: "",
      monthlyTotal: "0",
      ExportreportDialog: false,
      datevalue: "",
      SnackBarComponent: {},  
      section_value: [
        // {
        //   x: ["a", "b", "c"],
        //   y: ["10", "20", "30"],
        // },
      ],
      monthPicker: false,
      datedisplay: "",
      datedisplayMonth: "",
      yearfilter: new Date().getFullYear(),
      monthfilter: "",
      monthNames: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      itemyears: [],
      updatekey: 0,
    headers:[
      {title:"Group name", value:"group_name"},
      {title:"Expense", value:"expense"},
      {title:"Petty Cash" , value:"pettycash"},
      {title:"Total" , value:"total"}
    ],
        tableLoading: false,
    tableItems: [],  

    };
  },
    watch: {
      currentPage(newVal) {
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      tableData: {
        handler(newVal) {
          const maxPage = Math.ceil(this.totalItems / this.itemsPerPage);
          if (this.currentPage > maxPage && maxPage > 0) {
            this.currentPage = 1;
          }
        },
        deep: true,
      },
    },
  mounted() {
    this.populateYearItems();
    this.setInitialFilters();
    this.get_next();
  },
  watch: {
    yearfilter() {
      this.monthfilter = "";
      this.updateDatedisplayMonth();
    },
    monthfilter() {
      this.updateDatedisplayMonth();
    },
  },
computed: {
  paginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.tableItems.slice(start, end);
  },

  pageCount() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  },

  visiblePages() {
    const delta = 2;
    let start = Math.max(1, this.currentPage - delta);
    let end = Math.min(this.pageCount, this.currentPage + delta);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  },
},
  methods: {
    exportreport() {
      // console.log("item", item)
      this.selectedData = "MyGroup";
      this.ExportreportDialog = true;
      this.datevalue = this.datedisplay;
    },

    async download_item(url, types, MonthYear) {
      // console.log(types);
      // console.log(MonthYear);
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileNames = firstName
        ? firstName +
          "_" +
          (types == "MonthlyReport" ? MonthYear + "_" : "") +
          "Group" +
          ".xlsx"
        : "_" +
          (types == "MonthlyReport" ? MonthYear + "_" : "") +
          "Group" +
          ".xlsx";
      try {
        const response = await axios({
          url: url,
          method: "GET",
          responseType: "blob",
        });
        if (!response.data) {
          throw new Error("No data received from the server.");
        }
        const fileName = fileNames;
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        FileSaver.saveAs(blob, fileName);
      } catch (error) {
        // console.error("Error downloading the file:", error);
      }
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.ExportreportDialog = false;

      this.get_next();
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
    fecth_date() {
      const monthMap = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };

      // Add null checks and default values
      if (!this.monthfilter || !this.yearfilter) {
        const currentDate = new Date();
        this.monthfilter = this.monthNames[currentDate.getMonth()];
        this.yearfilter = currentDate.getFullYear();
      }

      this.formattedmonth = parseInt(monthMap[this.monthfilter], 10);
      this.formattedyear = parseInt(this.yearfilter, 10);
    },
    async get_next() {
        this.tableLoading = true; 
      await this.fecth_date();
      var data = this.$store.getters.GetUserObj;

      // Add null check for user data
      if (!data || !data.organization || !data.organization.organization_id) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "User data not available",
          timeout: 5000,
          Top: true,
        };
        return;
      }

      try {
        let result = await API.graphql(
          graphqlOperation(expense_reports_graph, {
            input: {
              organization_id: data.organization.organization_id,
              year: this.formattedyear,
              month: this.formattedmonth,
              action_type: "GROUP",
            },
          })
        );
        let resultdata = JSON.parse(result.data.expense_reports_graph);
        if (resultdata.Status == "SUCCESS") {
           this.tableItems = resultdata.data || [];
  this.tableItems = resultdata.data || [];
this.totalItems = this.tableItems.length;
this.currentPage = 1;// reset page
          let response = resultdata.data;
          if (resultdata.data.length > 0) {
            this.section_value = [];
            this.section_value = [
              {
                name: "Expenses",
                data: response,
              },
            ];
          
            this.updatekey++;
                      this.tableItems = resultdata.data

            this.monthlyTotal = resultdata.monthly_total || "0";
            // console.log("Chart data updated:", this.section_value);
          } else {
            this.section_value = [];
            this.updatekey++;
            this.monthlyTotal = "0";
            // console.log("No data found, clearing chart");
          }
        } else {
          this.section_value = [];
          this.updatekey++;
          this.monthlyTotal = "0";
          // console.log("API returned error status");
        }
      } catch (error) {
          this.tableItems = [];

        console.log("error", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors?.[0]?.message || "An error occurred",
          timeout: 5000,
          Top: true,
        };
        this.monthlyTotal = "0";
        this.section_value = [];
      }finally {
    this.tableLoading = false;
  }
    },
    selectMonth(month) {
      this.monthfilter = month;
    },
    closedialog() {
      this.monthPicker = false;
    },
    saveSelection() {
      this.datedisplay = this.monthfilter + " " + this.yearfilter;
      this.monthPicker = false;
      this.get_next();
    },
    isMonthDisabled(index) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      if (this.yearfilter === currentYear && index > currentMonth) {
        return true;
      }
      return false;
    },
    populateYearItems() {
      const currentYear = new Date().getFullYear();
      this.itemyears = Array.from(
        { length: 10 },
        (_, index) => currentYear - index
      );
    },
    setInitialFilters() {
      const currentYear = new Date().getFullYear();
      this.yearfilter = currentYear;
      this.monthfilter = this.monthNames[new Date().getMonth()] || "Jan";
      this.updateDatedisplayMonth();
      this.datedisplay =
        this.datedisplayMonth || `${this.monthfilter} ${this.yearfilter}`;
    },
    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
      } else {
        const currentDate = new Date();
        this.datedisplayMonth = `${
          this.monthNames[currentDate.getMonth()]
        } ${currentDate.getFullYear()}`;
      }
    },
  },
};
</script>

<style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
  width: 100%;
  text-align: center;
  font-size: 20px;
}

.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}
.table-wrapper {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Table itself */
.modern-data-table {
  background: white;
}

/* Header */
.modern-data-table thead th {
  background: #ffffff;
  font-weight: 600;
  font-size: 14px;
  color: #222;
  border-bottom: 1.5px solid #e0e0e0;
  padding: 14px 12px;
}

.modern-data-table tbody tr {
  height: 56px;
  border-bottom: 1px solid #e6e6e6;
}

.modern-data-table tbody tr:last-child {
  border-bottom: none;
}

/* Cells */
.modern-data-table tbody td {
  font-size: 14px;
  color: #222;
  padding: 12px;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #e0e0e0;
  background: #ffffff;
}

.footer-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-btn {
  text-transform: none;
  font-size: 14px;
}

.active-page {
  background: #db4c77 !important;
  color: white !important;
  min-width: 36px;
  height: 36px;
}

.inactive-page {
  color: #666;
  min-width: 36px;
  height: 36px;
}
.modern-data-table thead {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;
}
.loader-td {
  padding: 0 !important;
  text-align: center;
}

.loader-center {
  height: 300px;
  display: flex;
    /* margin-top: -5%; */
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}
</style>