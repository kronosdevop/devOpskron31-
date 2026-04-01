<template>
  <div>
    <div v-for="(section, Idx) in graphdata" :key="Idx">
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
    </div>
  </div>
</template>

<script>
import LineChart from "@/components/Graph/LineChart.vue";
import DonutChart from "@/components/Graph/DonutChart.vue";
import PieChart from "@/components/Graph/PieChart.vue";
import ColoumnChart from "@/components/Graph/ColoumnChart.vue";
import BarChart from "@/components/Graph/BarChart.vue";
export default {
  components: {
    BarChart,
    ColoumnChart,
    PieChart,
    DonutChart,
    LineChart,
  },
  data() {
    return {
      graphdata: null,
      bardata: [
        {
          type: "bar",
          showInLegend: true,
          name: "Gold",
          color: "gold",
          dataPoints: [
            { y: 243, label: "Italy" },
            { y: 236, label: "China" },
            { y: 243, label: "France" },
            { y: 273, label: "Great Britain" },
            { y: 269, label: "Germany" },
            { y: 196, label: "Russia" },
            { y: 1118, label: "USA" },
          ],
        },
        {
          type: "bar",
          showInLegend: true,
          name: "Silver",
          color: "silver",
          dataPoints: [
            { y: 212, label: "Italy" },
            { y: 186, label: "China" },
            { y: 272, label: "France" },
            { y: 299, label: "Great Britain" },
            { y: 270, label: "Germany" },
            { y: 165, label: "Russia" },
            { y: 896, label: "USA" },
          ],
        },
        {
          type: "bar",
          showInLegend: true,
          name: "Bronze",
          color: "#A57164",
          dataPoints: [
            { y: 236, label: "Italy" },
            { y: 172, label: "China" },
            { y: 309, label: "France" },
            { y: 302, label: "Great Britain" },
            { y: 285, label: "Germany" },
            { y: 188, label: "Russia" },
            { y: 788, label: "USA" },
          ],
        },
      ],
      coloumndata: [
        {
          type: "column",
          name: "Proven Oil Reserves (bn)",
          legendText: "Proven Oil Reserves",
          showInLegend: true,
          dataPoints: [
            { label: "Saudi", y: 266.21 },
            { label: "Venezuela", y: 302.25 },
            { label: "Iran", y: 157.2 },
            { label: "Iraq", y: 148.77 },
            { label: "Kuwait", y: 101.5 },
            { label: "UAE", y: 97.8 },
          ],
        },
        {
          type: "column",
          name: "Oil Production (million/day)",
          legendText: "Oil Production",
          axisYType: "secondary",
          showInLegend: true,
          dataPoints: [
            { label: "Saudi", y: 10.46 },
            { label: "Venezuela", y: 2.27 },
            { label: "Iran", y: 3.99 },
            { label: "Iraq", y: 4.45 },
            { label: "Kuwait", y: 2.92 },
            { label: "UAE", y: 3.1 },
          ],
        },
      ],
      piedata: [
        {
          type: "pie",
          startAngle: 240,
          yValueFormatString: '##0.00"%"',
          indexLabel: "{label} {y}",
          dataPoints: [
            { y: 79.45, label: "Google" },
            { y: 7.31, label: "Bing" },
            { y: 7.06, label: "Baidu" },
            { y: 4.91, label: "Yahoo" },
            { y: 1.26, label: "Others" },
          ],
        },
      ],
      doughnutdata: [
        {
          type: "doughnut",
          startAngle: 60,
          //innerRadius: 60,
          indexLabelFontSize: 17,
          indexLabel: "{label} - #percent%",
          toolTipContent: "<b>{label}:</b> {y} (#percent%)",
          dataPoints: [
            { y: 67, label: "Inbox" },
            { y: 28, label: "Archives" },
            { y: 10, label: "Labels" },
            { y: 7, label: "Drafts" },
            { y: 15, label: "Trash" },
            { y: 6, label: "Spam" },
          ],
        },
      ],
      linedata: [
        {
          type: "spline",
          name: "US",
          showInLegend: true,
          dataPoints: [
            { label: "Atlanta 1996", y: 44 },
            { label: "Sydney 2000", y: 37 },
            { label: "Athens 2004", y: 36 },
            { label: "Beijing 2008", y: 36 },
            { label: "London 2012", y: 46 },
            { label: "Rio 2016", y: 46 },
          ],
        },
        {
          type: "spline",
          name: "China",
          showInLegend: true,
          dataPoints: [
            { label: "Atlanta 1996", y: 16 },
            { label: "Sydney 2000", y: 28 },
            { label: "Athens 2004", y: 32 },
            { label: "Beijing 2008", y: 48 },
            { label: "London 2012", y: 38 },
            { label: "Rio 2016", y: 26 },
          ],
        },
        {
          type: "spline",
          name: "Britain",
          showInLegend: true,
          dataPoints: [
            { label: "Atlanta 1996", y: 1 },
            { label: "Sydney 2000", y: 11 },
            { label: "Athens 2004", y: 9 },
            { label: "Beijing 2008", y: 19 },
            { label: "London 2012", y: 29 },
            { label: "Rio 2016", y: 27 },
          ],
        },
        {
          type: "spline",
          name: "Russia",
          showInLegend: true,
          dataPoints: [
            { label: "Atlanta 1996", y: 26 },
            { label: "Sydney 2000", y: 32 },
            { label: "Athens 2004", y: 28 },
            { label: "Beijing 2008", y: 22 },
            { label: "London 2012", y: 20 },
            { label: "Rio 2016", y: 19 },
          ],
        },
        {
          type: "spline",
          name: "S Korea",
          showInLegend: true,
          dataPoints: [
            { label: "Atlanta 1996", y: 7 },
            { label: "Sydney 2000", y: 8 },
            { label: "Athens 2004", y: 9 },
            { label: "Beijing 2008", y: 13 },
            { label: "London 2012", y: 13 },
            { label: "Rio 2016", y: 9 },
          ],
        },
        {
          type: "spline",
          name: "Germany",
          showInLegend: true,
          dataPoints: [
            { label: "Atlanta 1996", y: 20 },
            { label: "Sydney 2000", y: 13 },
            { label: "Athens 2004", y: 13 },
            { label: "Beijing 2008", y: 16 },
            { label: "London 2012", y: 11 },
            { label: "Rio 2016", y: 17 },
          ],
        },
      ],
      section_data: [
        {
          section_name: "Pie chart",
          section_type: "PIE_CHART",
          section_value: [
            {
              label: "abc",
              value: 40,
            },
            {
              label: "anb",
              value: 99,
            },
            {
              label: "hrf",
              value: 55,
            },
          ],
        },
        {
          section_name: "Don chart",
          section_type: "DONUT_CHART",
          section_value: [
            {
              label: "xyz",
              value: 40,
            },
            {
              label: "pqr",
              value: 99,
            },
            {
              label: "rcb",
              value: 55,
            },
          ],
        },
        {
          section_name: "SALES REPORT",
          section_type: "BAR_CHART",
          section_value: [
            {
              label: "Series 1",
              x: ["12 Sep 2024", "15 Sep 2024", "17 Sep 2024"],
              y: ["50", "45", "65"],
            },
            {
              label: "Series 2",
              x: ["12 Sep 2024", "15 Sep 2024", "17 Sep 2024"],
              y: ["5", "15", "45"],
            },
          ],
        },
        {
          section_name: "SALES REPORT",
          section_type: "COLUMN_CHART",
          section_value: [
            {
              label: "Series 3",
              x: ["12 Sep 2024", "15 Sep 2024", "17 Sep 2024"],
              y: ["50", "45", "65"],
            },
            {
              label: "Series 4",
              x: ["12 Sep 2024", "15 Sep 2024", "17 Sep 2024"],
              y: ["5", "15", "45"],
            },
          ],
        },
        {
          section_name: "SALES REPORT",
          section_type: "LINE_CHART",
          section_value: [
            {
              label: "Series 6",
              x: ["12 Sep 2024", "15 Sep 2024", "17 Sep 2024"],
              y: ["50", "45", "65"],
            },
            {
              label: "Series 5",
              x: ["12 Sep 2024", "15 Sep 2024", "17 Sep 2024"],
              y: ["5", "15", "45"],
            },
          ],
        },
      ],
    };
  },
  created() {
    this.graphdata = this.transformSectionData();
  },
  methods: {
    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    transformSectionData() {
      return this.section_data.map((section) => {
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
                  y: item.value,
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
                  y: item.value,
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
        //     section_value: section.section_value[0].x.map((date, index) => ({
        //       type: section.section_type === "BAR_CHART" ? "bar" : "column",
        //       showInLegend: true,
        //       name: date,
        //       color: this.getRandomColor(),
        //       dataPoints: section.section_value.map((series) => ({
        //         y: parseInt(series.y[index], 10),
        //         label: series.label,
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

<style>
</style>