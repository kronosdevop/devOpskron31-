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
            :coloumndata="section_value"
            :chartId="'barContainer_'"
            :key="updatekey"
          />
        </div>
        <div v-else class="center-container">
          <span>No Records</span>
        </div>
      </v-card-text>
    </v-card>
    <VendorExport
      :ExportreportDialog="ExportreportDialog"
      :datevalue="datevalue"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
      v-on:SuccessURL="download_item"
      @clicked="ExportreportDialog = false"
      :reportType="reportType"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { get_vendor_reports_graph } from "@/graphql/queries.js";
import ColoumnChart from "@/components/Graph/ColoumnChart.vue";
import VendorExport from "@/components/VendorManagement/VendorPopups/VendorExport.vue";
import SnackBar from "@/components/SnackBar.vue";
const FileSaver = require("file-saver");
import axios from "axios";

export default {
  components: {
    ColoumnChart,
    VendorExport,
    SnackBar,
  },
  data() {
    return {
      formattedmonth: "",
      formattedyear: "",
      reportType: "",
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
      this.updateDatedisplayMonth();
    },
    monthfilter() {
      this.updateDatedisplayMonth();
    },
    datedisplay() {
      this.datedisplayMonth = this.datedisplay;
    },
  },
  methods: {
    exportreport() {
      // console.log("item", item)
      this.reportType = "GROUP";
      this.ExportreportDialog = true;
      this.datevalue = this.datedisplay;
    },

    async download_item(url) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileNames = firstName
        ? firstName + "_" + "Vendors" + ".xlsx"
        : "_" + "Vendors" + ".xlsx";
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

      // Ensure monthfilter is a valid month name
      if (!monthMap[this.monthfilter]) {
        const currentDate = new Date();
        this.monthfilter = this.monthNames[currentDate.getMonth()];
      }

      this.formattedmonth = parseInt(monthMap[this.monthfilter], 10);
      this.formattedyear = parseInt(this.yearfilter, 10);
    },
    async get_next() {
      await this.fecth_date();
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_vendor_reports_graph, {
            input: {
              year: this.formattedyear,
              month: this.formattedmonth,
              action_type: "GROUP",
            },
          })
        );

        let resultdata = JSON.parse(result.data.get_vendor_reports_graph);
        if (resultdata.Status == "SUCCESS") {
          let response = resultdata.data;
          let combined = response.x.map((key, index) => ({
            key: key,
            value: parseInt(response.y[index], 10),
          }));

          combined.sort((a, b) => b.value - a.value);

          response.x = combined.map((item) => item.key);
          response.y = combined.map((item) => item.value.toString());

          this.section_value = [];
          this.updatekey++;
          this.section_value.push(response);
        } else {
          this.section_value = [];
          this.updatekey++;
        }
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
      const currentMonth = new Date().getMonth();
      
      this.yearfilter = currentYear;
      this.monthfilter = this.monthNames[currentMonth];
      this.updateDatedisplayMonth();
      this.datedisplay = this.datedisplayMonth;
    },
    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
        this.datedisplay = this.datedisplayMonth;
      } else {
        const currentDate = new Date();
        this.datedisplayMonth = `${
          this.monthNames[currentDate.getMonth()]
        } ${currentDate.getFullYear()}`;
        this.datedisplay = this.datedisplayMonth;
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