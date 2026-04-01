<template>
  <div style="padding-bottom: 70px">
    <v-card flat >
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="4">
            <v-card
              :class="{ 'animated-card': isVisible }"
              v-if="isVisible"
              class="mr-2"
            >
              <h4 class="chart-title">Timesheet Activity</h4>
              <GChart
                type="PieChart"
                :data="chartData1"
                :options="chartOptions"
              />
            </v-card>
          </v-col>

          <v-col cols="8">
            <v-card :class="{ 'animated-card': isVisible }" v-if="isVisible">
              <h4 class="chart-title">Users Duration</h4>
              <div v-if="section_value.length != 0">
              <ColoumnChart
                :coloumndata="section_value"
                :chartId="'barContainer_'"
                :key="updatekey"
                :graphheight="graphheight"
              />
              </div>
            </v-card>
          </v-col>
        </v-row>
        <v-data-table
          :headers="headers"
          :items="paginatedItems"
          :loading="tableLoading"
          :sort-by="['activity_name']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg mt-4"
          density="compact"
          hover
        >
          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-clock-outline</v-icon>
              <div class="text-h6 grey--text mb-2">No Timesheet Data Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your filters or check back later.
              </div>
            </div>
          </template>
          <template #loading>
            <div class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="32"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-body-2 grey--text">Loading timesheet data...</div>
            </div>
          </template>
          <template #item.created_by="{ item }">
            <span>
              {{ fetch_name(item.created_by) }}
            </span>
          </template>
          <template #item.timesheet_date="{ item }">
            <span>
              {{
                get_updatedate(item.from_date) +
                " / " +
                get_updatedate(item.to_date)
              }}
            </span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <!-- Footer bar always rendered -->
    <div
      class="footer-bar d-flex align-center justify-space-between px-6 py-2"
      style="min-height: 56px; background: #f7f8fa"
    >
      <div class="text-caption ml-4" style="color: black; font-size: 14px">
        {{
          totalCount === 0
            ? "No Results"
            : (currentPage - 1) * itemsPerPage +
              1 +
              " to " +
              Math.min(currentPage * itemsPerPage, totalCount) +
              " of " +
              totalCount +
              " Results"
        }}
      </div>
      <div class="pagination-container d-flex align-center mr-4">
        <v-pagination
          v-model="currentPage"
          :length="pageCount"
          active-color="primary"
          density="comfortable"
          class="pagination-footer"
          :total-visible="5"
          next-icon="mdi-chevron-right"
          prev-icon="mdi-chevron-left"
        />
      </div>
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import ColoumnChart from "@/components/Graph/ColoumnChart.vue";
import { GChart } from "vue-google-charts";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import { list_project_management_timesheets } from "@/graphql/mutations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
export default {
  mixins: [get_all_org_users],
  components: {
    SnackBar,
    ColoumnChart,
    GChart,
  },
  data() {
    return {
      SnackBarComponent: {},
      tableData: [],
      updatekey: 0,
      section_value: [],
      graphheight:'185',
      isVisible: false,
      chartData1: [["labels", "Data"]],
      chartOptions: {
        // width:
        height: 200,
        // title: "Asset Categories",
        legend: {
          position: "bottom",
        },
        chartArea: {
          top: 10,
          height: "70%",
        },
      },
      tableLoading: false,
      fixed: true,
      nextToken: null,
      headers: [
        {
          title: "Activity Name",
          align: "start",
          key: "activity_name",
        },
        {
          title: "Created By",
          align: "start",
          key: "created_by",
        },
        {
          title: "Date",
          align: "start",
          key: "timesheet_date",
        },
        {
          title: "Time spent",
          align: "start",
          key: "work_duartion",
        },
      ],
      currentPage: 1,
      itemsPerPage: 20,
    };
  },

  computed: {
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.totalCount / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },
  },

  watch: {
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  async mounted() {
    var Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));
    this.rowInfo = Projecctdetails;
    await this.fetch_timesheet();
    await this.get_all_org_users();
    this.fetch_user_list();
  },

  methods: {
    get_updatedate(date) {
      if (date == undefined || date == "") {
        return "";
      }
      return formatdisplayDate(date);
    },
    error_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    fetch_user_list() {
      this.userProfiles = {};
      localStorage.setItem("allOrgUsers", JSON.stringify(this.orgUsers));
      this.orgUsers.forEach((element) => {
        if (element.user_status === "ACTIVE") {
          const email = element.user_email_id;
          const profilePicUrl = element.user_profile_pic_url || "";
          const name = element.full_user_name;
          if (profilePicUrl && profilePicUrl != "N/A") {
            this.userProfiles[email] = profilePicUrl;
          } else {
            const initials = this.getInitials(name);
            this.userProfiles[email] = initials;
          }
        }
      });
    },
    getInitials(name) {
      if (typeof name !== "string" || name.trim() === "") {
        return "N/A";
      }
      const initials = name.charAt(0).toUpperCase();
      return initials || "N/A";
    },
    fetch_name(value) {
      var data = "";
      this.orgUsers.forEach((element) => {
        if (element.user_id == value) {
          data = element.full_user_name;
        }
      });
      return data;
    },

    async fetch_timesheet() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_project_management_timesheets, {
            input: {
              project_id: this.rowInfo.project_id,
              nextToken: this.nextToken,
              limit: 100,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(
          result.data.list_project_management_timesheets
        );
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
          this.isVisible = true;
          let graphlist = response.graphData;
          for (let i = 0; i < graphlist.activity_graph.length; i++) {
            this.chartData1.push([
              graphlist.activity_graph[i].name,
              parseInt(graphlist.activity_graph[i].value.split("h")[0].trim()),
            ]);
          }
          this.section_value = [];
          this.updatekey++;
          let userdata = graphlist.users_graph;
          let combined = userdata.x.map((key, index) => ({
            key: key,
            value: parseInt(userdata.y[index], 10),
          }));

          combined.sort((a, b) => b.value - a.value);

          userdata.x = combined.map((item) => item.key);
          userdata.y = combined.map((item) => item.value.toString());


          this.section_value.push(userdata);
          this.tableLoading = false;
        }
      } catch (error) {
        this.isVisible = false;
        this.tableLoading = false;
      }
    },
  },
};
</script>
<style scoped>
.chart-title {
  text-align: center;
  margin-bottom: 5px; /* Add some spacing between the title and the chart */
}
.animated-card {
  animation: slideIn 0.9s ease forwards;
}

/* Footer bar always at the bottom, like MyDashboards.vue */
.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}
</style>