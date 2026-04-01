<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="previewPopup"
      @update:model-value="previewPopup = $event"
      persistent
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              {{
                apptype == "Dashboard"
                  ? $store.getters.GetdashboardDetails.dashboard_name
                  : "Tv Board Preview"
              }}
              <!-- {{ apptype == "TVBoard" }} Tv Board Preview -->
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-btn
            size="small"
            depressed
            :loading="loading"
            @click="publish_data"
            dark
            class="cardCss button-corner ml-4 mt-7 text-capitalize"
          >
            Publish
          </v-btn>
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-8">
          <v-row no-gutters>
            <v-col cols="8">
              <div class="text--left">{{ summaryField }}</div>
              <!-- class="bordered-container" -->
              <div>
                <v-expansion-panels v-model="activePanel">
                  <v-expansion-panel
                    class="mt-1"
                    v-for="(section, Idx) in previewmodifiedarray"
                    :key="Idx"
                    v-model="openedPanels"
                  >
                    <v-expansion-panel-title
                      :class="[
                        getHeaderClass(Idx) == true
                          ? 'mininavbar'
                          : 'cardCss',
                        'fixed-header-height',
                      ]"
                    >
                      <span class="text-white">
                        {{ section.section_name }}</span
                      >
                      <template v-slot:actions>
                        <v-icon color="white"> mdi-chevron-down </v-icon>
                      </template>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="mt-3">
                      <div v-if="section.section_type === 'TABULAR'">
                        <table border="1">
                          <thead>
                            <tr>
                              <th
                                v-for="(header, index) in section
                                  .section_value[0].headers"
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
                      <div v-else-if="section.section_type === 'TEXT'">
                        <div v-html="section.body"></div>
                      </div>
                      <div v-else-if="section.section_type === 'PIE_CHART'">
                        <PieChart
                          :piedata="section.section_value"
                          :chartId="'pieContainer_' + Idx"
                          :key="componentKey"
                        />
                      </div>
                      <div v-else-if="section.section_type === 'BAR_CHART'">
                        <BarChart
                          :bardata="section.section_value"
                          :chartId="'barContainer_' + Idx"
                          :key="componentKey"
                        />
                      </div>
                      <div
                        v-else-if="
                          section.section_type === 'COLUMN_CHART' ||
                          section.section_type == 'DAILY_CHART' ||
                          section.section_type == 'MONTHLY_CHART'
                        "
                      >
                        <ColoumnChart
                          :coloumndata="section.section_value"
                          :chartId="'coloumnContainer_' + Idx"
                          :key="componentKey"
                        />
                      </div>
                      <div v-else-if="section.section_type === 'DONUT_CHART'">
                        <DonutChart
                          :chartId="'doughnutContainer_' + Idx"
                          :doughnutdata="section.section_value"
                          :key="componentKey"
                        />
                      </div>
                      <div v-else-if="section.section_type === 'LINE_CHART'">
                        <LineChart
                          :linedata="section.section_value"
                          :chartId="'lineContainer_' + Idx"
                          v-if="section.section_type == 'LINE_CHART'"
                          :key="componentKey"
                        />
                      </div>

                      <!-- <div>{{section.section_type}}</div> -->
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-col>
            <v-col cols="5"> </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import LineChart from "@/components/Graph/LineChart.vue";
import DonutChart from "@/components/Graph/DonutChart.vue";
import PieChart from "@/components/Graph/PieChart.vue";
import ColoumnChart from "@/components/Graph/ColoumnChart.vue";
import BarChart from "@/components/Graph/BarChart.vue";
var axios = require("axios");

export default {
  props: {
    finalPublishData: Array,
    previewPopup: Boolean,
    summaryField: String,
    apptype: String,
  },
  components: {
    BarChart,
    ColoumnChart,
    PieChart,
    DonutChart,
    LineChart,
  },
  data() {
    return {
      previewmodifiedarray: [],
      openedPanels: [],
      loading: false,
      componentKey: 0,
      activePanel: null,
    };
  },
  watch: {
    previewPopup: {
      async handler() {
        this.previewmodifiedarray = await this.transformSectionData(
          this.finalPublishData
        );
        this.componentKey += 1;
        // console.log(this.previewmodifiedarray, "  this.previewmodifiedarray");
      },
      immediate: true,
    },
  },

  methods: {
    getHeaderClass(panelIndex) {
      return this.activePanel === panelIndex ? false : true;
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },

    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },

    publish_data() {
      this.loading = true;

      axios({
        method: "post",
        maxBodyLength: Infinity,
        url: this.$store.getters.GetOrgDetails.organization.invoke_url,
        headers: {
          "x-api-key":
            this.$store.getters.GetOrgDetails.organization["x-api-key"],
          "Content-Type": "application/json",
        },
        data: {
          tv_board_api_key:
            this.apptype == "TVBoard"
              ? this.$store.getters.GetTvdetails.tv_board_api_key
              : undefined,
          dashboard_api_key:
            this.apptype != "TVBoard"
              ? this.$store.getters.GetdashboardDetails.dashboard_api_key
              : undefined,
          section_data: this.finalPublishData,
          dashboard_summary: this.summaryField,
          team_api_key:
            this.$store.getters.GetOrgDetails.organization.team_api_key,
          content_type: "JSON",
          command:
            this.apptype == "TVBoard"
              ? "tvboardMessagePublish"
              : "dashboardMessagePublish",
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.loading = false;
            this.$emit("successMsg", res.data.Message);
            // this.SnackBarComponent = {
            //   SnackbarVmodel: true,
            //   SnackbarColor: "green",
            //   SnackbarText: res.data.Message,
            //   timeout: 5000,
            //   Top: true,
            // };

            //   this.$refs.form.reset();
            //   this.editor8.setData("");
            // this.get_dashboard();
          } else {
            this.loading = false;
            this.$emit("erroMsg", res.data.Message);

            // this.SnackBarComponent = {
            //   SnackbarVmodel: true,
            //   SnackbarColor: "red",
            //   SnackbarText: res.data.Message,
            //   timeout: 5000,
            //   Top: true,
            // };
          }
        })
        .catch((err) => {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: err.errors[0].message,
            timeout: 5000,
            Top: true,
          };
        });
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
        // else if (section.section_type === "LINE_CHART") {
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
.bordered-container {
  border: 2px solid #000; /* Change this to your desired border style */
  padding: 16px; /* Optional: Add padding inside the border */
}
.fixed-header-height {
  height: auto; /* Set a fixed height */
  min-height: 40px; /* Ensure minimum height is consistent */
  line-height: 20px; /* Vertically center the content */
  padding: 0 18px; /* Optional: adjust padding */
}
</style>