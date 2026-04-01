<template>
  <div :id="chartId">
    <apexchart
      v-if="isReady && series.length > 0"
      type="pie"
      height="350"
      :options="chartOptions"
      :series="series"
    ></apexchart>
    <div v-else class="chart-loading">
      <v-progress-circular indeterminate size="32" color="primary"></v-progress-circular>
      <span class="ml-2">Loading chart...</span>
    </div>
  </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'

export default {
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    piedata: Array,
    chartId: String,
  },
  data() {
    return {
      isReady: false,
      series: [],
      chartOptions: {
        chart: {
          type: 'pie',
          height: 350,
          toolbar: {
            show: false,
          },
        },
        labels: [],
        colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8'],
        plotOptions: {
          pie: {
            startAngle: 0,
            endAngle: 360,
            expandOnClick: true,
            offsetX: 0,
            offsetY: 0,
            customScale: 1,
            dataLabels: {
              offset: 0,
              minAngleToShowLabel: 10
            },
            donut: {
              size: '65%',
              background: 'transparent',
              labels: {
                show: false,
                name: {
                  show: true,
                  fontSize: '22px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 600,
                  color: undefined,
                  offsetY: -10
                },
                value: {
                  show: true,
                  fontSize: '16px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 400,
                  color: undefined,
                  offsetY: 16,
                  formatter: function (val) {
                    return val
                  }
                },
                total: {
                  show: false,
                  label: 'Total',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#263238',
                  formatter: function (w) {
                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                  }
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val, opts) {
            return opts.w.globals.labels[opts.seriesIndex] + ': ' + val + '%'
          }
        },
        legend: {
          position: 'bottom',
          horizontalAlign: 'center',
          fontSize: '14px',
          markers: {
            width: 12,
            height: 12,
            strokeWidth: 0,
            strokeColor: '#fff',
            radius: 12,
            offsetX: 0,
            offsetY: 0
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      }
    }
  },
  watch: {
    piedata: {
      handler(newData) {
        if (newData && newData.length > 0) {
          this.transformData();
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.isReady = true;
      if (this.piedata && this.piedata.length > 0) {
        this.transformData();
      }
    });
  },
  methods: {
    transformData() {
      try {
        if (!this.piedata || !this.piedata.length) {
          this.series = [];
          this.chartOptions.labels = [];
          return;
        }

        const chartData = this.piedata[0];
        if (!chartData || !chartData.dataPoints) {
          this.series = [];
          this.chartOptions.labels = [];
          return;
        }

        const dataPoints = chartData.dataPoints;
        const series = [];
        const labels = [];

        dataPoints.forEach(point => {
          if (point && typeof point.y !== 'undefined' && point.label) {
            series.push(point.y);
            labels.push(point.label);
          }
        });

        this.series = series;
        this.chartOptions.labels = labels;

      } catch (error) {
        console.error('Error transforming pie chart data:', error);
        this.series = [];
        this.chartOptions.labels = [];
      }
    }
  }
}
</script>

<style scoped>
.chart-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
  color: #666;
}
</style>
  