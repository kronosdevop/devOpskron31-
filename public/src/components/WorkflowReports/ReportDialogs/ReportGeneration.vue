<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="reportBuilderDialog" @update:model-value="reportBuilderDialog = $event" persistent
      max-width="1200" transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Generate Reports</div>
          </v-toolbar-title>
          <v-spacer />
          <v-text-field v-model="search" label="Search" clearable density="compact" variant="outlined" hide-details
            prepend-inner-icon="mdi-magnify" class="mr-4" style="max-width: 250px" />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-data-table :headers="headers" :height="height" :search="search" :fixed-header="fixed" :items="tableData"
            :loading="tableLoading" :footer-props="{
              itemsPerPageOptions: [10, 20, 30, 40, 50],
            }" :items-per-page="20" density="compact" class="elevation-1 dtwidth mt-4">
            <template v-slot:[`item.workflow_created_on`]="{ item }">
              <span>{{ fetch_value(item.workflow_created_on) }}</span>
            </template>
            <template v-slot:[`item.workflow_description`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div v-on="on">
                    {{
                      item.workflow_description.length >= 30
                        ? item.workflow_description.substr(0, 30) + "..."
                        : item.workflow_description
                    }}
                  </div>
                </template>
                <div class="textWrap" style="max-width: 250px">
                  {{ item.workflow_description }}
                </div>
              </v-tooltip>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn depressed @click="generate_report(item)" dark size="x-small" class="text-capitalize cardCss">
                Generate Report
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <GenerateSelectedReport :rowInfo="rowInfo" :genrateSelectedReport="genrateSelectedReport"
        v-on:successMsg="success_info" v-on:errorMsg="error_info" @clicked="genrateSelectedReport = false" />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { get_all_workflows_of_organizations_v1 } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

import GenerateSelectedReport from "@/components/WorkflowReports/ReportDialogs/GenerateSelectedReport.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  props: {
    reportBuilderDialog: Boolean,
  },
  components: {
    GenerateSelectedReport,
    SnackBar,
  },
  data() {
    return {
      headers: [
        {
          title: "Transaction ID",
          key: "workflow_display_id",
          sortable: false,
        },
        {
          title: "Workflow Name",
          key: "workflow_name",
          sortable: false,
        },
        {
          title: "Workflow Description",
          key: "workflow_description",
          sortable: false,
        },

        {
          title: "Created  On",
          key: "workflow_created_on",
          sortable: false,
        },
        // {
        //   text: "Version",
        //   key: "workflow_version",
        //   sortable: false,
        // },

        { title: "Process Speed", key: "workflow_speed", sortable: false },
        {
          title: "Actions",
          key: "actions",
          sortable: false,
        },
      ],
      height: 0,
      tableData: [],
      tableLoading: false,
      fixed: true,
      rowInfo: {},
      genrateSelectedReport: false,
      componentCheck: 0,
      SnackBarComponent: {},
      search: ""
    };
  },
  created() {
    this.height = window.innerHeight - 249;
  },

  watch: {
    reportBuilderDialog: {
      async handler() {
        if (this.reportBuilderDialog == true) {
          await this.fetch_all_workflows();
        }
      },

      immediate: true,
    },
  },


  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async fetch_all_workflows() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_all_workflows_of_organizations_v1, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        // this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(
          result.data.get_all_workflows_of_organizations_v1
        );
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },
    success_info(val) {
      this.$emit("sucessMsg", val);

      this.genrateSelectedReport = false;
    },
    error_info(val) {
      this.$emit("errorMsg", val);
    },
    generate_report(item) {
      this.componentCheck = 1;
      this.genrateSelectedReport = true;
      this.rowInfo = item;
    },

    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },
  },
};
</script>