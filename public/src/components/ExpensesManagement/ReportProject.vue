<template>
  <div>
    <v-card flat >
      <v-card-text>
        <v-toolbar flat  class="pt-2 bg-white">
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
        <div v-if="section_value.length != 0">
          <ColoumnChart
            :key="'chart_' + updatekey"
            :coloumndata="section_value[0].data"
            :chartId="'coloumnContainer_' + updatekey"
          />
        </div>
        <div v-else class="center-container">
          <span>No Records</span>
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
      formattedmonth: "",
      formattedyear: "",
      selectedData: "",
      monthlyTotal: "0",
      ExportreportDialog: false,
      datevalue: "",
      SnackBarComponent: {},
      section_value: [],
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
      chartOptions: {
        chart: {
          type: "bar",
          height: 180,
        },
        series: [],
        xaxis: {
          categories: [],
        },
        yaxis: {
          title: {
            text: "Amount",
          },
        },
        title: {
          text: "Expenses by Project",
          align: "left",
          margin: 10,
          offsetX: 0,
          offsetY: 0,
          floating: false,
          style: {
            fontSize: "18px",
            fontWeight: "bold",
            color: "#263238",
          },
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          position: "right",
          offsetY: 40,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "55%",
            endingShape: "rounded",
          },
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "vertical",
            shadeIntensity: 0.25,
            gradientIntensity: 0.75,
            stops: [0, 100],
          },
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val;
            },
          },
        },
        grid: {
          row: {
            colors: ["transparent"],
            opacity: 0.5,
          },
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    };
  },
  mounted() {
    this.populateYearItems();
    this.setInitialFilters();
    this.get_next();
  },
  watch: {
    yearfilter() {
      this.monthfilter = "";
      this.updateMonthItems(this.yearfilter);
      this.updateDatedisplayMonth();
    },
    monthfilter() {
      this.updateDatedisplayMonth();
    },
  },
  methods: {
    exportreport() {
      this.selectedData = "PROJECT";
      this.ExportreportDialog = true;
      this.datevalue = this.datedisplay;
    },

    async download_item(url, types, MonthYear ) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileNames = firstName
        ? firstName + "_" +
          (types == "MonthlyReport" ? MonthYear + "_" : "") +
          "Project" +
          ".xlsx"
        : "_" +
          (types == "MonthlyReport" ? MonthYear + "_" : "") +
          "Project" +
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
              action_type: "PROJECT",
            },
          })
        );
        let resultdata = JSON.parse(result.data.expense_reports_graph);
        if (resultdata.Status == "SUCCESS") {
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
            this.monthlyTotal = resultdata.monthly_total || "0";
          } else {
            this.section_value = [];
            this.updatekey++;
            this.monthlyTotal = "0";
          }
        } else {
          this.section_value = [];
          this.updatekey++;
          this.monthlyTotal = "0";
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors?.[0]?.message || "An error occurred",
          timeout: 5000,
          Top: true,
        };
        this.monthlyTotal = "0";
        this.section_value = [];
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
      this.updateMonthItems(currentYear);
      this.monthfilter = this.monthNames[new Date().getMonth()] || "Jan";
      this.updateDatedisplayMonth();
      this.datedisplay =
        this.datedisplayMonth || `${this.monthfilter} ${this.yearfilter}`;
    },
    updateMonthItems(year) {
      const currentYear = new Date().getFullYear();
      if (year === currentYear) {
        this.monthitems = this.monthNames.slice(0, new Date().getMonth() + 1);
      } else {
        this.monthitems = [...this.monthNames];
      }
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
</style>