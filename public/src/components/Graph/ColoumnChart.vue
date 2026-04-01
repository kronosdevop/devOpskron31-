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
    coloumndata: Array,
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
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
      },
      axisY2: {
        title: "",
        titleFontColor: "#C0504E",
        lineColor: "#C0504E",
        labelFontColor: "#C0504E",
        tickColor: "#C0504E",
      },
      axisX: {
        labelAngle: 0, // Keep labels horizontal
        labelWrap: true, // Allow wrapping of labels
        labelFontSize: 10, // Adjust font size for better readability
        interval: 1, // Force all labels to be displayed
      },
      toolTip: {
        shared: true,
      },
      legend: {
        cursor: "pointer",
        itemclick: this.toggleDataSeries,
      },
      //   data: [
      //     {
      //       type: "column",
      //       name: "Proven Oil Reserves (bn)",
      //       legendText: "Proven Oil Reserves",
      //       showInLegend: true,
      //       dataPoints: [
      //         { label: "Saudi", y: 266.21 },
      //         { label: "Venezuela", y: 302.25 },
      //         { label: "Iran", y: 157.2 },
      //         { label: "Iraq", y: 148.77 },
      //         { label: "Kuwait", y: 101.5 },
      //         { label: "UAE", y: 97.8 },
      //       ],
      //     },
      //     {
      //       type: "column",
      //       name: "Oil Production (million/day)",
      //       legendText: "Oil Production",
      //       axisYType: "secondary",
      //       showInLegend: true,
      //       dataPoints: [
      //         { label: "Saudi", y: 10.46 },
      //         { label: "Venezuela", y: 2.27 },
      //         { label: "Iran", y: 3.99 },
      //         { label: "Iraq", y: 4.45 },
      //         { label: "Kuwait", y: 2.92 },
      //         { label: "UAE", y: 3.1 },
      //       ],
      //     },
      //   ],
      data: this.coloumndata,
    });
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
</style>
   -->
   <template>

      <div :id="chartId">
        <apexchart
          type="bar"
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
    coloumndata: Array,
    chartId: String,
  },
    data() {
      return {
        series: [],
        chartOptions: {
          chart: {
            type: 'bar',
            height: 350,
            toolbar: {
            show: false, // Hide the toolbar including the download button
          },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '55%',
              endingShape: 'rounded',
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
          },
          xaxis: {
            categories: [],
          },
          yaxis: {
            title: {
              text: '',
            },
          },
          fill: {
            opacity: 1,
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return  val ;
              },
            },
          },
        },
      };
    },
    watch: {
      coloumndata: {
        handler(newData) {
          // console.log("ColoumnChart received new data:", newData);
          if (newData && newData.length > 0) {
            this.transformData();
          } else {
            this.series = [];
            this.chartOptions.xaxis.categories = [];
          }
        },
        immediate: true,
        deep: true
      }
    },
    methods: {
      transformData() {
        // console.log("Transforming data:", this.coloumndata);  
        if (!this.coloumndata || this.coloumndata.length === 0) {
          this.series = [];
          this.chartOptions.xaxis.categories = [];
          // console.log("No data to transform, clearing chart");
          return;
        }

        const rawData = this.coloumndata;
        
        // Transform the raw data into series format
        const seriesData = rawData.map(item => ({
          name: item.label,
          data: item.y.map(value => parseInt(value, 10)), // Convert strings to numbers
        }));

        this.series = seriesData;
        this.chartOptions.xaxis.categories = rawData[0]?.x || [];
        // console.log("Transformed series data:", this.series); 
        // console.log("Chart categories:", this.chartOptions.xaxis.categories);
      }
    },
    mounted() {
      this.transformData();
    }
  };
  </script>
  
  <style>
  /* Add any custom styles here */
  </style>
  