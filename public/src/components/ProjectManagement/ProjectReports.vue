<template>
  <div style="padding-bottom: 70px">
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat >
      <v-row class="px-4 pt-4 pb-0" >
        <v-col cols="12" class="d-flex align-center">
          <v-select
            density="compact"
            variant="outlined"
            v-model="filteredBy"
            label="Filtered By"
            :items="filterCreatedby"
            item-title="text"
            item-value="value"
            @update:model-value="filter_data"
            style="min-width: 250px; max-width: 300px"
            class="mr-4"
          ></v-select>
          <v-spacer></v-spacer>
          <v-btn 
            @click="generate_report" 
            :loading="buttonLoading"
            color="primary"
            variant="elevated"
            size="small"
            class="text-capitalize"
          >
            Generate Report
          </v-btn>
        </v-col>
      </v-row>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="paginatedItems"
          :loading="tableLoading"
          :sort-by="['project_name']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg"
          density="compact"
          hover
          @click:row="handle_row_click"
        >
          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-file-document-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Reports Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your filter or check back later.
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
              <div class="text-body-2 grey--text">Loading reports...</div>
            </div>
          </template>
          <template #item.report_submitted_by="{ item }">
            <span>{{ fetch_name(item.report_submitted_by) }}</span>
          </template>
          <template #item.report_submitted_on="{ item }">
            <span>{{ fetch_value(item.report_submitted_on) }}</span>
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
    <div v-if="componentCheck == 1">
      <ViewProjectReports
        :viewProjectReport="viewProjectReport"
        :rowInfo="rowInfo"
        @clicked="viewProjectReport = false"
      />
    </div>
  </div>
</template>
<script>
import { API, graphqlOperation } from "aws-amplify";
import {
  list_all_project_reports,
  genrate_project_reports,
} from "@/graphql/queries.js";
import SnackBar from "@/components/SnackBar.vue";
import ViewProjectReports from "./ProjectDialogues/ViewProjectReports.vue";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { list_all_user_projects } from "@/graphql/queries.js";
const FileSaver = require("file-saver");
import axios from "axios";
export default {
  components: {
    SnackBar,
    ViewProjectReports,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      nextToken: null,
      SnackBarComponent: {},
      tableLoading: false,
      tableData: [],
      fixed: true,
      viewProjectReport: false,
      componentCheck: 0,
      headers: [
        { title: "Project Name", key: "project_name", align: "start" },
        { title: "Submitted By", key: "report_submitted_by", align: "start" },
        { title: "Created On", key: "report_submitted_on", align: "start" },
        {
          title: "Achieved Outcomes",
          key: "achieved_outcomes",
          align: "start",
        },
        {
          title: "Planned Aspirations",
          key: "planned_aspirations",
          align: "start",
        },
      ],
      rowInfo: {},
      projData: {},
      filterCreatedby: [],
      filteredBy: "ALL",
      currentPage: 1,
      itemsPerPage: 20,
      buttonLoading: false,
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
  async created() {
    this.projData = JSON.parse(localStorage.getItem("projectInfo"));
    await Promise.all([
      this.get_all_org_users(),
      this.get_project_reports(),
      this.fetch_project_members(),
    ]);
  },
  methods: {
    async generate_report() {
      try {
        this.buttonLoading = true;
        let result = await API.graphql(
          graphqlOperation(genrate_project_reports, {
            input: {
              project_id: this.projData.project_id,
            },
          })
        );
        let response = JSON.parse(result.data.genrate_project_reports);
        if (response.Status == "SUCCESS") {
          const url = response.data;
          // console.log(url, "url");
          
          // Download the file
          this.downloadFile(url);
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
          };
        }
        this.buttonLoading = false;
        } catch (error) {
        this.buttonLoading = false;
        console.log(error, "error");
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async fetch_project_members() {
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_user_projects, {
            input: {
              project_progress: "ALL",
            },
          })
        );

        let response = JSON.parse(result.data.list_all_user_projects);

        if (response.Status == "SUCCESS") {
          let members = null;

          let Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));

          response.data.forEach((element) => {
            if (element.project_id == Projecctdetails.project_id) {
              members = element.project_visible_members;
            }
          });
          members.forEach((element) => {
            this.filterCreatedby.push({
              text: element.name,
              value: element.email,
            });
          });

          this.filterCreatedby.sort((a, b) => a.value.localeCompare(b.value));
          this.filterCreatedby.unshift({
            text: "All",
            value: "ALL",
          });
        } else {
          this.filterCreatedby.unshift({
            text: "All",
            value: "ALL",
          });
        }
      } catch (error) {}
    },
    // fetch_user_list() {
    //   this.userProfiles = {};
    //   localStorage.setItem("allOrgUsers", JSON.stringify(this.orgUsers));
    //   this.orgUsers.forEach((element) => {
    //     if (element.user_status === "ACTIVE") {
    //       const email = element.user_email_id;
    //       const profilePicUrl = element.user_profile_pic_url || "";
    //       const name = element.full_user_name;
    //       if (profilePicUrl && profilePicUrl != "N/A") {
    //         this.$set(this.userProfiles, email, profilePicUrl);
    //       } else {
    //         const initials = this.getInitials(name);
    //         this.$set(this.userProfiles, email, initials);
    //       }
    //     }
    //   });
    // },
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
        if (element.user_email_id == value) {
          data = element.full_user_name;
        }
      });
      return data;
    },

    async get_project_reports() {
      this.tableLoading = true;
      var projectDetails = JSON.parse(localStorage.getItem("projectInfo"));
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_project_reports, {
            input: {
              nextToken: this.nextToken,
              limit: 100,

              user_email_id: this.filteredBy,

              project_id: projectDetails.project_id,
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_all_project_reports);
        if (response.Status === "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data.map((item) => ({
            project_name: item.project_name,
            report_submitted_by: item.report_submitted_by,
            report_submitted_on: item.report_submitted_on,
            achieved_outcomes: item.report_payload.achieved_outcomes,
            planned_aspirations: item.report_payload.planned_aspirations,
          }));
          this.nextToken = null;

          // const uniqueSubmitters = [
          //   ...new Set(this.tableData.map((item) => item.report_submitted_by)),
          // ];
          // this.filterCreatedby = uniqueSubmitters.map((submitter) => ({
          //   text: this.fetch_name(submitter),
          //   value: submitter,
          // }));

          // this.filterCreatedby.unshift({ text: "All", value: "All" });
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    filter_data() {
      if (this.filteredBy === "All") {
        this.get_project_reports();
      } else {
        this.tableData = this.tableData.filter(
          (item) => item.report_submitted_by === this.filteredBy
        );
        this.get_project_reports();
      }
    },

    fetch_value(val) {
      if (val == undefined) {
        return "-";
      } else {
        return format_Date(val);
      }
    },

    handle_row_click(value) {
      this.componentCheck = 1;
      this.viewProjectReport = true;
      this.rowInfo = value;
    },

    async downloadFile(url) {
      try {
        let firstName = this.$store.getters.GetUserObj?.organization?.organization_team_id;
        let fileName = firstName 
          ? `${firstName}_Project_Report.pdf`
          : `Project_Report.pdf`;

        const response = await axios({
          url: url,
          method: "GET",
          responseType: "blob",
        });

        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        FileSaver.saveAs(blob, fileName);
      } catch (error) {
        console.error("Error downloading the file:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to download the report",
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style scoped>
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