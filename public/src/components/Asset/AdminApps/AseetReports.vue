<template>
  <div>
  <OverlayComp :overlay="overlay"/>
    <v-card flat >
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="4">
            <v-card :class="{ 'animated-card': isVisible }" v-if="isVisible">
              <h4 class="chart-title">Asset Categories</h4>
              <GChart
                type="PieChart"
                :data="chartData2"
                :options="chartOptions2"
                class=""
              />
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card :class="{ 'animated-card': isVisible }" v-if="isVisible">
              <h4 class="chart-title">Asset Location</h4>
              <GChart
                type="PieChart"
                :data="chartData3"
                :options="chartOptions3"
                class=""
              />
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card :class="{ 'animated-card': isVisible }" v-if="isVisible">
              <h4 class="chart-title">Tagged Status</h4>
              <GChart
                type="PieChart"
                :data="chartData1"
                :options="chartOptions"
              />
            </v-card>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col cols="12">
            <v-card-title class="ml-n3 font-size:18px"
              >Recently Added Assets</v-card-title
            >
            <v-data-table
              :headers="adminassetHeaders"
              :fixed-header="fixed"
              :items="adminassetRecords"
              :loading="tableLoading"
              hide-default-footer
              :items-per-page="20"
              density="compact"
              class="elevation-1 dtwidth"
            >
              <template v-slot:[`item.sub_category_id_text`]="{ item }">
                <span>{{
                  item.sub_category_id_text == null ||
                  item.sub_category_id_text == undefined ||
                  item.sub_category_id_text == ""
                    ? "-"
                    : item.sub_category_id_text
                }}</span>
              </template>
              <template v-slot:[`item.asset_verified_on`]="{ item }">
                <span>{{ formate_date(item.asset_verified_on) }}</span>
              </template>
              <template v-slot:[`item.asset_tagged_status`]="{ item }">
                <div v-if="item.asset_tagged_status == 'UNTAGGED'">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon size="small" color="red" v-bind="attrs" v-on="on"
                        >mdi-alpha-x-circle</v-icon
                      >
                    </template>
                    <span>Untagged</span>
                  </v-tooltip>
                </div>
                <div v-else>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        color="green"
                        size="small"
                        v-bind="attrs"
                        v-on="on"
                        >mdi-check-circle</v-icon
                      >
                    </template>
                    <span>Tagged</span>
                  </v-tooltip>
                </div>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
/*eslint-disable*/
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import { asset_dashboard_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { GChart } from "vue-google-charts";
import OverlayComp from "@/components/OverlayComp.vue";

export default {
  components: {
    GChart,
    SnackBar,
    OverlayComp,

  },
  data() {
    return {
            overlay: false,
      chartData1: [["labels", "Data"]],
      chartData2: [["labels", "Data"]],
      chartData3: [["labels", "Data"]],
      chartOptions: {
        height: 350,
        legend: {
          position: "bottom",
        },
        chartArea: {
          top: 10, // Reduce space at the top
          height: "70%", // Adjust the chart area height
        },
      },
      chartOptions2: {
        // width:
        height: 350,
        // title: "Asset Categories",
        legend: {
          position: "bottom",
        },
        chartArea: {
          top: 10,
          height: "70%",
        },
      },
      chartOptions3: {
        // width:
        height: 350,
        title: "Asset Location",
        legend: {
          position: "bottom",
        },
        chartArea: {
          top: 10,
          height: "70%",
        },
      },
      graphdata: [],
      SnackBarComponent: {},
      loading: false,
      adminassetRecords: [],
      fixed: true,
      tableLoading: false,
      isVisible: false,
      adminassetHeaders: [
        { title: "Asset ID", key: "asset_prefix", sortable: false },
        { title: "Category", key: "category_id_text", sortable: false },
        {
          title: "Sub Category",
          key: "sub_category_id_text",
          sortable: false,
        },

        { title: "Location", key: "asset_location", sortable: false },
        {
          title: "Assigned To",
          key: "asset_assined_to_name",
          sortable: false,
        },
        {
          title: "Verified On",
          key: "asset_verified_on",
          sortable: false,
        },

        {
          title: "QR Tagged",
          key: "asset_tagged_status",
          sortable: false,
        },
      ],
      
    };
  },
  async mounted() {
    this.isVisible = true;
    await this.get_asset_graph();
  },
  methods: {
    formate_date(value) {
      var data = formatdisplayDate(value);
      return data;
    },
    async get_asset_graph() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_dashboard_reports, {
            input: {
              action_type: "ALL",
            },
          })
        );

        var response = JSON.parse(result.data.asset_dashboard_reports).data;
        // console.log(response);
      this.overlay = false;
        this.graphdata = response.asset_details;
        this.adminassetRecords = response.recently_added_assets;

        for (let i = 0; i < this.graphdata.length; i++) {
          this.chartData1.push([
            this.graphdata[i].name,
            this.graphdata[i].value,
          ]);
        }
        var graphdata1 = response.asset_category_details;
        for (let i = 0; i < graphdata1.length; i++) {
          this.chartData2.push([
            graphdata1[i].category_name,
            graphdata1[i].asset_count,
          ]);
        }
        var graphdata2 = response.assets_by_location;
        for (let i = 0; i < graphdata2.length; i++) {
          this.chartData3.push([graphdata2[i].name, graphdata2[i].value]);
        }

        // console.log(this.chartData1);
      } catch (error) {
      this.overlay = false;
        console.log(error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
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