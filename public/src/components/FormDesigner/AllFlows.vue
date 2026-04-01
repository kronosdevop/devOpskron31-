<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card flat class="">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="tableData"
          :height="height"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          :options.sync="pagination"
          @update:options="handle_pagination()"
          @click:row="edit_flow_data"
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.workflow_created_on`]="{ item }">
            <span>{{ fetch_value(item.workflow_created_on) }}</span>
          </template>
          <template v-slot:[`item.workflow_deploy_status`]="{ item }">
            <span
              v-if="item.workflow_deploy_status == 'DEPLOY'"
              class="caption"
            >
              <v-btn
                @click="get_deployed_form('deployed', item)"
                small
                text
                class="white--text ml-n3"
                color="green"
                >Deployed</v-btn
              >
            </span>
            <span v-else>
              <v-btn
                @click="get_deployed_form('undeployed', item)"
                small
                text
                class="white--text ml-n3"
                color="red"
                >Undeployed</v-btn
              >
            </span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-icon
                  v-on="on"
                  @click.stop="edit_flow_data(item)"
                  small
                  color="primaryColor"
                  >mdi-pencil</v-icon
                >
              </template>
              <span class="white--text">Edit Flow</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-icon
                  v-on="on"
                  @click.stop="edit_visibility(item)"
                  small
                  class="ml-1"
                  color="primaryColor"
                  >mdi-eye</v-icon
                >
              </template>
              <span class="white--text">Edit Visibility</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeployForms
        :formDeployed="formDeployed"
        :actionItem="actionItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="formDeployed = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditVisbility
        :editVisibilityDialog="editVisibilityDialog"
        :rowInfo="rowInfo"
        @clicked="editVisibilityDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import DeployForms from "@/components/FormDesigner/FormDialogs/DeployForms.vue";
// import EditFlows from "@/components/FormDesigner/EditFlows.vue";
import EditVisbility from "@/components/FormDesigner/EditFlowsDialogs/EditVisbility.vue";

import { list_workflow } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    DeployForms,
    SnackBar,
    EditVisbility,
  },
  data() {
    return {
      headers: [
        { text: "Name", value: "workflow_name", sortable: false },

        {
          text: "Description",
          value: "workflow_description",
          sortable: false,
        },
        {
          text: "Created On",
          value: "workflow_created_on",
          sortable: false,
        },
        {
          text: "Speed",
          value: "workflow_speed",
          sortable: false,
        },
        {
          text: "Status",
          value: "workflow_deploy_status",
          sortable: false,
        },
        // {
        //   text: "Visibility",
        //   value: "workflow_deploy_status",
        //   sortable: false,
        // },
        {
          text: "Action",
          value: "actions",
          sortable: false,
        },
      ],
      tableData: [],
      tableLoading: false,
      formDeployed: false,
      componentCheck: 0,
      actionItem: {},
      SnackBarComponent: {},
      editActionData: false,
      height: 0,
      editFlowStepper: {},
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      nextToken: null,
      editVisibilityDialog: false,
      rowInfo: {},
    };
  },
  created() {
    this.height = window.innerHeight - 220;
    localStorage.setItem("zeroStep", []);
    this.get_all_flows();
  },
  methods: {
    handle_pagination() {
      if (this.nextToken) {
        this.get_all_flows();
      }
    },

    async get_all_flows() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_workflow, {
            organization_id: data.organization.organization_id,
            limit: 50,
            nextToken: null,
          })
        );

        this.tableData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_workflow);

        this.nextToken = response.nextToken;
        let array = this.tableData.concat(response.details);

        this.tableData = array;

        const uniqueArrayOfObjects = this.tableData.filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o.workflow_id === obj.workflow_id)
        );

        // workflow_action_identifier_key

        this.tableData = uniqueArrayOfObjects;

        // this.tableData = response.details;
      } catch (error) {
        this.tableLoading = false;
      }
    },

    edit_visibility(value) {
      // console.log(value);
      this.componentCheck = 2;
      this.rowInfo = value;
      this.editVisibilityDialog = true;
    },

    edit_flow_data(data) {
              this.$store.commit("SetExternalForm", false);
      this.$router.push({ name: "EditFlows" });
      this.$store.commit("SetFlowItem", data);
      localStorage.setItem("zeroStep", JSON.stringify(data.workflow_template));
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

    get_deployed_form(value, info) {
      this.actionItem = {};
      this.formDeployed = true;
      this.componentCheck = 1;
      this.actionItem = {
        label: value,
        Info: info,
      };
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.formDeployed = false;
      this.editVisibilityDialog = false;
      this.get_all_flows();
    },
  },
};
</script>