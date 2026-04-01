<!-- <template>
  <div>
    <v-card class="">
      <v-container class="fill-height" fluid>
        <Bar :data="data_graph" :options="options" :height="height" />
      </v-container>
    </v-card>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export default {
  components: {
    Bar,
  },
  data() {
    

    return {
      height: 0,
      data_graph: {
        // labels: ["January", "February", "March"],
        labels: [],
        datasets: [
          {
            backgroundColor: [
              "#f87979", // color for the first data point
              "#7fc97f", // color for the second data point
              "#beaed4",
              "#beaed2",
              "#beaed3",
              "#beaed2",
              "#beaed1",
              "#beaed0",
              "#beaed4",
            ],

            borderColor: "rgb(0, 136, 204)",

            borderWidth: 3,
            borderSkipped: false,
            data: [9, 10, 24, 14, 9, 13, 12, 9, 15.3, 22.5, 15, 9, 18, 17, 16],
            // borderWidth: 1,
            // barPercentage: 0.5,
            // barThickness: 20,
            // maxBarThickness: 50,
            // minBarLength: 56,
          },
        ],
      },
      options: {
        indexAxis: "y",
        width: 180,
        scales: {
          x: {
            position: "top",
            stacked: true,
            barPercentage: 0.1,
            grid: {
              display: false,
              width: 5,
            },

            ticks: {
              precision: 3,
              stepSize: 2,
              beginAtZero: false,
              min: 9,
              callback: function (value, index, values) {
                return value + " hrs";
              },
              
            },
          },
          y: {
            stacked: true,
            barPercentage: 0.1,
            grid: {
              display: true,
              width: 5,
            },

            ticks: {
              precision: 0,
            },
          },
        },

        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "",
          },
        },
      },
    };
  },
  created() {
    this.height = window.innerHeight - 2800;
    for (let i = 1; i < 31; i++) {
      this.data_graph.labels.push(`${i + "-01-2024"}`);
    }
  },
};
</script>

<style>
</style> -->

<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th v-for="percent in percentages" :key="percent">{{ percent }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="data in dataList" :key="data.name">
          <td>{{ data.name }}</td>
          <td :colspan="percentages.length">
            <div class="graph-container">
              <div
                class="bar"
                :style="{ width: getBarWidth(data.percentage) }"
              ></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataList: [
        { name: "Darshan", percentage: 9 },
        { name: "Darshan", percentage: 10 },
        { name: "Darshan", percentage: 12 },
        { name: "Darshan", percentage: 85 },
        { name: "Darshan ", percentage: 15 },
        { name: "Darshan ", percentage: 14 },
        { name: "Darshan ", percentage: 20 },
        // Add more data as needed
      ],
      percentages: Array.from({ length: 10 }, (_, index) => index + 9),
    };
  },
  methods: {
    getBarWidth(percentage) {
      const index = this.percentages.indexOf(percentage);
      if (index === -1) return "0"; // If percentage not found, bar width is 0
      return (index + 1) * (100 / this.percentages.length) + "%";
    },
  },
};
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}

.graph-container {
  background-color: #f2f2f2;
  height: 20px;
  position: relative;
  overflow: hidden;
}

.bar {
  height: 100%;
  background-color: #4caf50;
  width: 0;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
