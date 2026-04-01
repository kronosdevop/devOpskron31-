<template>
  <div class="mt-4">
    <OverlayComp :overlay="overlay" />
    <v-card
      flat
      v-if="$store.getters.GetTvdetails.tv_board_publish_type == 'FEED'"
    >
      <v-row no-gutters>
        <v-col cols="8" v-if="lastpublished.length !== 0">
          <v-toolbar flat dense>
            <v-toolbar-title style="font-size: 15px">{{
              "Last Published On" + " :" + " " + lastPublisedOn
            }}</v-toolbar-title>
          </v-toolbar>

          <div>
            <v-expansion-panels v-model="activePanel">
              <v-expansion-panel
                v-for="(section, Idx) in lastpublished"
                :key="Idx"
                class="mt-1"
              >
                <v-expansion-panel-header
                  :class="[
                    getHeaderClass(Idx) == true ? 'mininavbar' : 'primaryColor',
                    'fixed-header-height',
                  ]"
                >
                  <span class="white--text"> {{ section.section_name }}</span>
                  <template #actions>
                    <v-icon color="white"> mdi-chevron-down </v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="mt-3">
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
                      v-if="section.section_type == 'COLUMN_CHART'"
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
                </v-expansion-panel-content>
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
    <v-card flat v-else>
      <v-card-text>
        <v-row>
          <v-col cols="8"  v-if="lastpublished.length !== 0">
            <v-carousel
              cycle
              :show-arrows="false"
              hide-delimiters
              :interval="$store.getters.GetTvdetails.transition_frequency"
              style="border: 2px solid #000; border-radius: 8px"
            >
              <v-carousel-item
                v-for="(item, i) in lastpublished"
                :key="i"
                :src="item"
              ></v-carousel-item>
            </v-carousel>
          </v-col>
          <v-col cols="12" v-if="lastpublished.length === 0">
          <div class="centered-container">
            <v-card class="outlined-card">
              <v-card-text> <b>No message published</b></v-card-text>
            </v-card>
          </div>
        </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
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
import { API, graphqlOperation } from "aws-amplify";
import { get_tvboard_details } from "@/graphql/queries.js";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";

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
      imageitems: [
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/sky.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/bird.jpg",
        },
        {
          src: "https://cdn.vuetifyjs.com/images/carousel/planet.jpg",
        },
      ],
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
          graphqlOperation(get_tvboard_details, {
            input: {
              tv_board_id: this.$store.getters.GetTvdetails.tv_board_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_tvboard_details);

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
        // else if (
        //   section.section_type === "BAR_CHART" ||
        //   section.section_type === "COLUMN_CHART"
        // ) {
        //   return {
        //     ...section,
        //     section_value: section.section_value.map((item) => ({
        //       type: section.section_type === "BAR_CHART" ? "bar" : "column",
        //       name: item.label,
        //       color: this.getRandomColor(),
        //       legendText: item.label,
        //       showInLegend: true,
        //       dataPoints: item.x.map((label, index) => ({
        //         label,
        //         y: parseInt(item.y[index], 10), // Convert string to number
        //       })),
        //     })),
        //   };
        // }
        //  else if (section.section_type === "LINE_CHART") {
        //   return {
        //     ...section,
        //     section_value: section.section_value.map((series) => ({
        //       type: "spline",
        //       name: series.label,
        //       showInLegend: true,
        //       dataPoints: series.x.map((xDate, index) => ({
        //         label: xDate,
        //         y: parseInt(series.y[index], 10), // Convert y to a number
        //       })),
        //     })),
        //   };
        // }
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
</style>