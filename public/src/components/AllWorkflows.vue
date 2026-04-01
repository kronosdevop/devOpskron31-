<template>
  <div>
    <!-- <v-toolbar flat>
      <v-toolbar-title>Workflows</v-toolbar-title>
      <v-spacer />
    </v-toolbar> -->
    <v-card class="" flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth"
          @click:row="handleClick"
        >
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="formCheck == 1">
      <MemberOnboard
        :onBoardDialog="onBoardDialog"
        :approvalType="approvalType"
        @clicked="onBoardDialog = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";

import { list_workflow } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      SnackBarComponent: {},
      onBoardDialog: false,
      headers: [
        { text: "Workflow Name", value: "workflow_name", sortable: false },
        {
          text: "Workflow Description",
          value: "workflow_description",
          sortable: false,
        },
        { text: "Process Speed", value: "workflow_speed", sortable: false },

        { text: "#Steps", value: "workflow_count_steps", sortable: false },
        { text: "#Txs", value: "total_counts_of_workflows", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      formCheck: 0,
      approvalType: "",
    };
  },
  created() {
    this.get_wrkflows();
  },
  methods: {
    async get_wrkflows() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_workflow, {
            organization_id: data.organization.organization_id,
            workflow_status: "ACTIVE",
            workflow_deploy_status: "DEPLOY",
            limit: 200,
            nextToken: null,
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var dataArray = [];
        var response = JSON.parse(result.data.list_workflow);

        this.tableData = response.details;
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

    handleClick(val) {
      switch (val.wrkFlow_name) {
        case "Member OnBoarding": {
          this.onBoardDialog = true;
          this.approvalType = "Initiate";
          return (this.formCheck = 1);
        }
        case "Change Department": {
          return (this.formCheck = 2);
        }
        case "Change Designation": {
          return (this.formCheck = 3);
        }
        case "Change Location": {
          return (this.formCheck = 4);
        }
        case "Member Relieving": {
          return (this.formCheck = 5);
        }
        case "Change Reporting Manager": {
          return (this.formCheck = 6);
        }
        default:
          this.formCheck = 0;
      }
    },
  },
};
</script>