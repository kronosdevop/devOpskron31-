<template>
  <div class="mt-4">
    <OverlayComp :overlay="overlay" />
    <v-card
      
      v-if="
        $store.getters.GetdashboardDetails.dashboard_publish_type ==
          'DASHBOARD' ||
        $store.getters.GetdashboardDetails.dashboard_publish_type == 'FEED'
      "
      flat
    >
      <v-row no-gutters>
        <v-col cols="8" v-if="lastpublished.length !== 0">
          <v-toolbar class="bg-white" flat>
            <v-toolbar-title style="font-size: 15px" class="el">{{
              "Last Published On" + " :" + " " + lastPublisedOn
            }}</v-toolbar-title>
          </v-toolbar>
          <div>
            <div class="text-left mt-3 ml-4">
              <i>{{ summaryField }}</i>
            </div>
            <v-expansion-panels v-model="activePanel">
              <v-expansion-panel
                v-for="(section, Idx) in lastpublished"
                :key="Idx"
                class="mt-1"
              >
                <v-expansion-panel-title
                  :class="[
                    getHeaderClass(Idx) == true ? 'mininavbar' : 'custom-primary-color',
                    'fixed-header-height',
                  ]"
                >
                  <span class="text-white"> {{ section.section_name }}</span>
                  <template v-slot:actions>
                    <v-icon color="white"> mdi-chevron-down </v-icon>
                  </template>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="mt-3">
                  <div class="chart-container">
                    <PieChart
                      :piedata="section.section_value"
                      :chartId="'pieContainer_' + Idx"
                      v-if="section.section_type == 'PIE_CHART'"
                    />

                    <DonutChart
                      :chartId="'doughnutContainer_' + Idx"
                      :doughnutdata="section.section_value"
                      v-if="section.section_type == 'DONUT_CHART'"
                    />
                    <BarChart
                      :bardata="section.section_value"
                      :chartId="'barContainer_' + Idx"
                      v-if="section.section_type == 'BAR_CHART'"
                    />
                    <ColoumnChart
                      :coloumndata="section.section_value"
                      :chartId="'coloumnContainer_' + Idx"
                      v-if="
                        section.section_type == 'COLUMN_CHART' ||
                        section.section_type == 'DAILY_CHART' ||
                        section.section_type == 'MONTHLY_CHART'
                      "
                    />
                    <LineChart
                      :linedata="section.section_value"
                      :chartId="'lineContainer_' + Idx"
                      v-if="section.section_type == 'LINE_CHART'"
                    />
                    <div v-else-if="section.section_type === 'TEXT'">
                      <div v-html="section.body"></div>
                    </div>

                    <div v-else-if="section.section_type === 'TABULAR'">
                      <table border="1">
                        <thead>
                          <tr>
                            <th
                              v-for="(header, index) in section.section_value[0]
                                .headers"
                              :key="index"
                            >
                              {{ header }}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(row, rowIndex) in section.section_value[0]
                              .rows"
                            :key="rowIndex"
                          >
                            <td
                              v-for="(cell, cellIndex) in row"
                              :key="cellIndex"
                            >
                              {{ cell }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-col>
        <v-col cols="12" v-if="lastpublished.length === 0">
          <div class="centered-container">
            <v-card class="outlined-card">
              <v-card-text> <b>No message published</b></v-card-text>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </v-card>
    <v-card
      flat
      v-if="$store.getters.GetdashboardDetails.dashboard_publish_type == 'TEXT'"
    >
      <div>
        <div class="text--left mt-3">
          <i>{{ summaryField }}</i>
        </div>
        <div v-if="lastpublished.length === 0" class="centered-container mt-2">
          <v-card class="outlined-card">
            <v-card-text> <b>No message published</b></v-card-text>
          </v-card>
        </div>
        <v-row no-gutters v-else>
          <v-col cols="8">
            <div class="html-container">
              <h2>
                <b>{{ lastpublished[0].section_name }}</b>
              </h2>

              <h4>{{ lastpublished[0].summary }}</h4>

              <div v-html="lastpublished[0].body"></div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>
  </div>
</template>

<script>
/*eslint-disable*/
import OverlayComp from "@/components/OverlayComp.vue";
import LineChart from "@/components/Graph/LineChart.vue";
import DonutChart from "@/components/Graph/DonutChart.vue";
import PieChart from "@/components/Graph/PieChart.vue";
import ColoumnChart from "@/components/Graph/ColoumnChart.vue";
import BarChart from "@/components/Graph/BarChart.vue";
import { Buffer } from "buffer";
import SnackBar from "@/components/SnackBar.vue";
import { get_dashboard_details } from "@/graphql/queries.js";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
    BarChart,
    ColoumnChart,
    PieChart,
    DonutChart,
    LineChart,
    OverlayComp,
  },
  data() {
    return {
      lastpublished: [],
      SnackBarComponent: {},
      overlay: false,
      activePanel: null,
      htmlContent: "",
      lastPublisedOn: "",
      summaryField: "",
    };
  },
  created() {
    this.get_dashboard();
  },
  methods: {
    getHeaderClass(panelIndex) {
      return this.activePanel === panelIndex ? false : true;
    },
    async get_dashboard() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_dashboard_details, {
            dashboard_id: this.$store.getters.GetdashboardDetails.dashboard_id,
          })
        );
        var response = JSON.parse(result.data.get_dashboard_details);

        if (response.Status == "SUCCESS") {
          this.overlay = false;
          if (response.data[0].message_payload != undefined) {
            this.overlay = false;
            let xapikey = response.data[0].message_payload.data;
            if (xapikey == undefined) {
              this.overlay = false;
              this.lastpublished = [];

              this.htmlContent = "";
            } else {
              this.overlay = false;
              const bufferData = Buffer.from(xapikey);
              const strData = bufferData.toString();
              const api = JSON.parse(strData);
              this.lastPublisedOn = this.fetch_value(
                response.data[0].last_published_on
              );
              this.summaryField =
                response.data[0].dashboard_summary == undefined
                  ? ""
                  : response.data[0].dashboard_summary;
              this.lastpublished = this.transformSectionData(api);
            }
          } else {
            this.overlay = false;
            this.lastpublished = [];
            this.htmlContent = "";
            this.overlay = false;
          }
        } else {
          this.overlay = false;
          this.lastpublished = [];
          this.htmlContent = "";
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.data.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.overlay = false;

        this.lastpublished = [];
        this.htmlContent = "";
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    fetch_value(val) {
      return formatedatetime(val / 1000);
    },
    transformSectionData(lastdata) {
      return lastdata.map((section) => {
        if (section.section_type === "PIE_CHART") {
          return {
            ...section,
            section_value: [
              {
                type: "pie",
                startAngle: 240,
                yValueFormatString: '##0.00"%"',
                indexLabel: "{label} {y}",
                dataPoints: section.section_value.map((item) => ({
                  y: Number(item.value),
                  label: item.label,
                })),
              },
            ],
          };
        } else if (section.section_type === "DONUT_CHART") {
          return {
            ...section,
            section_value: [
              {
                type: "doughnut",
                startAngle: 60,
                indexLabelFontSize: 17,
                indexLabel: "{label} - #percent%",
                toolTipContent: "<b>{label}:</b> {y} (#percent%)",
                dataPoints: section.section_value.map((item) => ({
                  y: Number(item.value),
                  label: item.label,
                })),
              },
            ],
          };
        }
        return section;
      });
    },
  },
};
</script>

<style  scoped>
.v-expansion-panel-content {
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
}
.centered-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
}
.bordered-container {
  border: 2px solid #000; /* Change this to your desired border style */
  padding: 16px; /* Optional: Add padding inside the border */
}

.outlined-card {
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
  text-align: center;
}
.html-container {
  border: 1px solid #000; /* Customize the border style as needed */
  padding: 10px; /* Optional: Add padding for better spacing */
}
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Space between charts */
}

.chart-container > * {
  max-width: 100%; /* Ensure charts don't exceed the column width */
  height: auto; /* Maintain aspect ratio */
  overflow: hidden; /* Prevent overflow issues */
}
.fixed-header-height {
  height: auto; /* Set a fixed height */
  min-height: 40px; /* Ensure minimum height is consistent */
  line-height: 20px; /* Vertically center the content */
  padding: 0 18px; /* Optional: adjust padding */
}

.custom-primary-color {
  background-color: #DB4C77 !important;
  color: white !important;
}
</style>