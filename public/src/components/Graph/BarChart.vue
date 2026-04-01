<!-- <template>
  <div>
    <div
      :id="chartId"
      style="height: 400px; width: 100%; overflow-x: auto"
    ></div>
  </div>
</template>
  
  <script>
import * as CanvasJS from "@canvasjs/charts";

export default {
  props: {
    bardata: Array,
    chartId: String,
  },
  name: "CanvasChart",
  mounted() {
    var chart = new CanvasJS.Chart(this.chartId, {
      animationEnabled: true,
      title: {
        text: "",
      },
      axisY: {
        title: "",
        includeZero: true,
      },
      axisX: {
        labelAngle: 0, 
        labelWrap: true,
        labelFontSize: 10, 
        interval: 1,
        margin: 10, 
      },
      legend: {
        cursor: "pointer",
        itemclick: this.toggleDataSeries,
      },
      toolTip: {
        shared: true,
        content: this.toolTipFormatter,
      },
      // data: [
      //   {
      //     type: "bar",
      //     showInLegend: true,
      //     name: "Gold",
      //     color: "gold",
      //     dataPoints: [
      //       { y: 243, label: "Italy" },
      //       { y: 236, label: "China" },
      //       { y: 243, label: "France" },
      //       { y: 273, label: "Great Britain" },
      //       { y: 269, label: "Germany" },
      //       { y: 196, label: "Russia" },
      //       { y: 1118, label: "USA" },
      //     ],
      //   },
      //   {
      //     type: "bar",
      //     showInLegend: true,
      //     name: "Silver",
      //     color: "silver",
      //     dataPoints: [
      //       { y: 212, label: "Italy" },
      //       { y: 186, label: "China" },
      //       { y: 272, label: "France" },
      //       { y: 299, label: "Great Britain" },
      //       { y: 270, label: "Germany" },
      //       { y: 165, label: "Russia" },
      //       { y: 896, label: "USA" },
      //     ],
      //   },
      //   {
      //     type: "bar",
      //     showInLegend: true,
      //     name: "Bronze",
      //     color: "#A57164",
      //     dataPoints: [
      //       { y: 236, label: "Italy" },
      //       { y: 172, label: "China" },
      //       { y: 309, label: "France" },
      //       { y: 302, label: "Great Britain" },
      //       { y: 285, label: "Germany" },
      //       { y: 188, label: "Russia" },
      //       { y: 788, label: "USA" },
      //     ],
      //   },
      // ],
      data: this.bardata,
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
    toolTipFormatter(e) {
      var str = "";
      var total = 0;
      var str3;
      var str2;
      for (var i = 0; i < e.entries.length; i++) {
        var str1 =
          '<span style= "color:' +
          e.entries[i].dataSeries.color +
          '">' +
          e.entries[i].dataSeries.name +
          "</span>: <strong>" +
          e.entries[i].dataPoint.y +
          "</strong> <br/>";
        total = e.entries[i].dataPoint.y + total;
        str = str.concat(str1);
      }
      str2 = "<strong>" + e.entries[0].dataPoint.label + "</strong> <br/>";
      str3 =
        '<span style = "color:Tomato">Total: </span><strong>' +
        total +
        "</strong><br/>";
      return str2.concat(str).concat(str3);
    },
  },
};
</script>
  
  <style scoped>
</style>
   -->
   <template>

      <div :id="chartId">
        <apexchart
          type="bar"
          height="430"
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
    bardata: Array,
    chartId: String,
  },
    data() {
      // Sample raw data
      const rawData =this.bardata;
  
      // Transform the raw data into series format
      const seriesData = rawData.map((item) => ({
        name: item.label,
        data: item.y.map((value, index) => ({
          x: item.x[index],
          y: parseInt(value, 10), // Convert string to number
        })),
      }));
  
      return {
        series: seriesData,
        chartOptions: {
          chart: {
            type: "bar",
            height: 430,
            toolbar: {
            show: false, // Hide the toolbar including the download button
          },
          },
          plotOptions: {
            bar: {
              horizontal: true,
              dataLabels: {
                position: "top",
              },
            },
          },
          dataLabels: {
            enabled: true,
            offsetX: -6,
            style: {
              fontSize: "12px",
              colors: ["#fff"],
            },
          },
          stroke: {
            show: true,
            width: 1,
            colors: ["#fff"],
          },
          tooltip: {
            shared: true,
            intersect: false,
          },
          xaxis: {
            categories: rawData[0].x, // Assuming x values are the same for all data entries
          },
        },
      };
    },
  };
  </script>
    
    <style>
  /* Add any custom styles here */
  </style>
    