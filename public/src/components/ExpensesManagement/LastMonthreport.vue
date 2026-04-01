<template>
  <div>
    <v-card flat >
      <v-card-text>
        <!-- <v-toolbar flat  class="pt-2 bg-white"> -->
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
                  dense
                  v-bind="attrs"
                  style="max-width: 200px"
                  class=""
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
          <!-- <v-spacer /> -->
          <!-- <v-btn
              depressed
              @click="exportreport()"
              dark
              class="text-capitalize cardCss ml-2 mt-n6"
            >
              Export
            </v-btn> -->
        <!-- </v-toolbar> -->
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
      ExportreportDialog: false,
      datevalue: "",
      SnackBarComponent: {},
      section_value: [],
      monthdailog: false,
      fixed: true,
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
          text: "Last 6 Months Expenses",
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
  mounted() {
    this.get_next();
  },
  methods: {
    exportreport() {
      // console.log("item", item)
      this.selectedData = "MyGroup";
      this.ExportreportDialog = true;
      this.datevalue = this.date1;
    },

    async download_item(url) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileNames = firstName
        ? firstName + "_" + "LastMonth" + ".xlsx"
        : "_" + "LastMonth" + ".xlsx";
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
              // year: this.formattedyear,
              // month: this.formattedmonth,
              action_type: "HalfYearTransactions",
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
          } else {
            this.section_value = [];
            this.updatekey++;
          }
        } else {
          this.section_value = [];
          this.updatekey++;
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors?.[0]?.message || "An error occurred",
          timeout: 5000,
          Top: true,
        };
        this.section_value = [];
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
</style>