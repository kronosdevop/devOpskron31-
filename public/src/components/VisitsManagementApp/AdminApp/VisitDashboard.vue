<template>
  <div>
    <v-card class="mt-n4" flat>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-card
              flat
              :class="{ 'animated-card': isVisible }"
              v-if="isVisible"
            >
              <h4 class="chart-title">Daily Report</h4>
              <GChart
                type="PieChart"
                :data="chartData2"
                :options="chartOptions2"
                class=""
              />
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              flat
              :class="{ 'animated-card': isVisible }"
              v-if="isVisible"
            >
              <h4 class="chart-title">Monthly Report</h4>
              <GChart
                type="PieChart"
                :data="chartData3"
                :options="chartOptions3"
                class=""
              />
            </v-card>
          </v-col>

          <v-col cols="12" v-if="section_value.length != 0">
            <ColoumnChart
              :coloumndata="section_value"
              :chartId="'barContainer_'"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_visits_dashboard_data } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { GChart } from "vue-google-charts";
import SnackBar from "@/components/SnackBar.vue";
import ColoumnChart from "@/components/Graph/ColoumnChart.vue";
export default {
  components: {
    SnackBar,
    GChart,
    ColoumnChart,
  },
  data() {
    return {
      isVisible: false,
      chartOptions2: {
        height: 350,
        legend: { position: "bottom" },
        chartArea: { top: 10, height: "70%" },
      },
      chartOptions3: {
        height: 350,
        legend: { position: "bottom" },
        chartArea: { top: 10, height: "70%" },
      },
      SnackBarComponent: {},
      section_value: [],
      chartData2: [["labels", "Data"]],
      chartData3: [["labels", "Data"]],
    };
  },
  async mounted() {
    this.isVisible = true;
    await this.fetch_locationtype();
  },
  methods: {
    async fetch_locationtype() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_visits_dashboard_data, {})
        );
        var response = JSON.parse(result.data.get_visits_dashboard_data);
        if (response.Status == "SUCCESS") {
          // Daily Pie Chart
          var graphdata1 = response.data.daily_pie_chart;
            this.chartData2 = [["labels", "Data"]];
          if (Array.isArray(graphdata1)) {
            for (let i = 0; i < graphdata1.length; i++) {
              this.chartData2.push([graphdata1[i].name, graphdata1[i].value]);
            }
          }
          // Monthly Pie Chart
          var graphdata2 = response.data.monthly_pie_chart;
          this.chartData3 = [["labels", "Data"]];
          if (Array.isArray(graphdata2)) {
          for (let i = 0; i < graphdata2.length; i++) {
            this.chartData3.push([graphdata2[i].name, graphdata2[i].value]);
            }
          }
          this.section_value = [];
          if (response.data.monthly_bar_chart && typeof response.data.monthly_bar_chart === 'object') {
          this.section_value.push(response.data.monthly_bar_chart);
          }
        } else {
          this.chartData2 = [["labels", "Data"]];
          this.chartData3 = [["labels", "Data"]];
        }
      } catch (error) {
        let message = "An error occurred";
        if (error && error.errors && error.errors[0] && error.errors[0].message) {
          message = error.errors[0].message;
        } else if (error && error.message) {
          message = error.message;
        } else if (typeof error === "string") {
          message = error;
        }
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style>
.chart-title {
  text-align: center;
  margin-bottom: 5px; /* Add some spacing between the title and the chart */
}
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translatex(0);
    opacity: 1;
  }
}

.animated-card {
  animation: slideIn 0.9s ease forwards;
}
</style>