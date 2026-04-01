<!-- <template>
  <div>
    <div :id="chartId" style="height: 400px; width: 100%"></div>
  </div>
</template>
  
  <script>
import * as CanvasJS from "@canvasjs/charts";

export default {
  props: {
    linedata: Array,
    chartId: String,
  },
  name: "CanvasChart",
  mounted() {
    var chart = new CanvasJS.Chart(this.chartId, {
      animationEnabled: true,
      exportEnabled: false,
      title: {
        text: "",
      },
      axisY: {
        title: "",
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        itemclick: this.toggleDataSeries,
      },
      // data: [
      //   {
      //     type: "spline",
      //     name: "US",
      //     showInLegend: true,
      //     dataPoints: [
      //       { label: "Atlanta 1996", y: 44 },
      //       { label: "Sydney 2000", y: 37 },
      //       { label: "Athens 2004", y: 36 },
      //       { label: "Beijing 2008", y: 36 },
      //       { label: "London 2012", y: 46 },
      //       { label: "Rio 2016", y: 46 },
      //     ],
      //   },
      //   {
      //     type: "spline",
      //     name: "China",
      //     showInLegend: true,
      //     dataPoints: [
      //       { label: "Atlanta 1996", y: 16 },
      //       { label: "Sydney 2000", y: 28 },
      //       { label: "Athens 2004", y: 32 },
      //       { label: "Beijing 2008", y: 48 },
      //       { label: "London 2012", y: 38 },
      //       { label: "Rio 2016", y: 26 },
      //     ],
      //   },
      //   {
      //     type: "spline",
      //     name: "Britain",
      //     showInLegend: true,
      //     dataPoints: [
      //       { label: "Atlanta 1996", y: 1 },
      //       { label: "Sydney 2000", y: 11 },
      //       { label: "Athens 2004", y: 9 },
      //       { label: "Beijing 2008", y: 19 },
      //       { label: "London 2012", y: 29 },
      //       { label: "Rio 2016", y: 27 },
      //     ],
      //   },
      //   {
      //     type: "spline",
      //     name: "Russia",
      //     showInLegend: true,
      //     dataPoints: [
      //       { label: "Atlanta 1996", y: 26 },
      //       { label: "Sydney 2000", y: 32 },
      //       { label: "Athens 2004", y: 28 },
      //       { label: "Beijing 2008", y: 22 },
      //       { label: "London 2012", y: 20 },
      //       { label: "Rio 2016", y: 19 },
      //     ],
      //   },
      //   {
      //     type: "spline",
      //     name: "S Korea",
      //     showInLegend: true,
      //     dataPoints: [
      //       { label: "Atlanta 1996", y: 7 },
      //       { label: "Sydney 2000", y: 8 },
      //       { label: "Athens 2004", y: 9 },
      //       { label: "Beijing 2008", y: 13 },
      //       { label: "London 2012", y: 13 },
      //       { label: "Rio 2016", y: 9 },
      //     ],
      //   },
      //   {
      //     type: "spline",
      //     name: "Germany",
      //     showInLegend: true,
      //     dataPoints: [
      //       { label: "Atlanta 1996", y: 20 },
      //       { label: "Sydney 2000", y: 13 },
      //       { label: "Athens 2004", y: 13 },
      //       { label: "Beijing 2008", y: 16 },
      //       { label: "London 2012", y: 11 },
      //       { label: "Rio 2016", y: 17 },
      //     ],
      //   },
      // ],
      data: this.linedata,
    });

    // Render the chart
    chart.render();
  },
  methods: {
    toggleDataSeries(e) {
      if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      chart.render();
    },
  },
};
</script>
  
  <style scoped>
/* Add any chart-specific styles if needed */
</style>
   -->
   <template>
  <div :id="chartId">
    <apexchart
      type="line"
      height="350"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    linedata: Array,
    chartId: String,
  },
  mounted() {
    // console.log(this.linedata, "linedata");
  },
  data() {
    // Sample raw data
    const rawData = this.linedata;

    // Transform the raw data into series format
    const seriesData = rawData.map((item) => ({
      name: item.label,
      data: item.y.map((value) => parseInt(value, 10)), // Convert strings to numbers
    }));

    return {
      series: seriesData,
      chartOptions: {
        chart: {
          height: 350,
          type: "line",
          zoom: {
            enabled: false,
          },
          toolbar: {
            show: false, // Hide the toolbar including the download button
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
        },
        title: {
          text: "",
          align: "left",
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // Alternate row colors
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: rawData[0].x, // Use x values from the first dataset
        },
      },
    };
  },
};
</script>

<style>
/* Add any custom styles here */
</style>
