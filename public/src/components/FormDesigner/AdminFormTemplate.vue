<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-toolbar flat>
      <!-- <v-toolbar-title>Forms Designer</v-toolbar-title> -->

      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="form_designer">
            Forms
          </v-btn>
          <v-btn small class="black--text" text value="flow_designer">
            Flow Designer
          </v-btn>
          <v-btn small class="black--text" text value="all_flows">
            Current Flows
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-spacer />

      <v-btn dark class="text-capitalize cardCss ml-2" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <!-- <v-card-text>
      <AdminFormDesigner />
    </v-card-text> -->

    <!-- <v-card-text>
        <v-data-table
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          dense
          class="elevation-1 dtwidth"
          @click:row="handleRowClick"
        >
          <template v-slot:[`item.is_form_designed`]="{ item }">
            <span v-if="item.is_form_designed == true" class="caption">
              <v-btn small text class="white--text ml-n3" color="green"
                >Yes</v-btn
              >
            </span>
            <span v-else>
              <v-btn small text class="white--text ml-n3" color="red">No</v-btn>
            </span>
          </template>
        </v-data-table>
      </v-card-text> -->

    <!-- <div v-if="componentCheck == 1">
      <FormCreation
        :formCreationDialog="formCreationDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="formCreationDialog = false"
      />
    </div> -->
    <div v-if="toggle_exclusive == 'form_designer'">
      <AllForms />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'flow_designer'">
      <AdminFlowDesigner v-on:flowMethod="get_method" />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'all_flows'">
      <AllFlows />
    </div>
  </div>
</template>
<script>
/* eslint-disable */

import FormCreation from "@/components/FormDesigner/FormDialogs/FormCreation.vue";
import AllForms from "@/components/FormDesigner/AllForms.vue";
import AdminFlowDesigner from "@/components/FormDesigner/AdminFlowDesigner.vue";
import AllFlows from "@/components/FormDesigner/AllFlows.vue";
import { list_forms_customs } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    FormCreation,
    AdminFlowDesigner,
    SnackBar,
    AllFlows,
    AllForms,
  },
  data() {
    return {
      SnackBarComponent: {},
      toggle_exclusive: "form_designer",
      tableData: [],
      tableLoading: false,
      headers: [
        { text: "Form Name", value: "form_name", sortable: false },
        {
          text: "Form Description",
          value: "form_description",
          sortable: false,
        },
        { text: "Form Designed ", value: "is_form_designed", sortable: false },

        // { text: "Speed", value: "workflow_speed", sortable: false },
        // {
        //   text: "Action",
        //   value: "actions",
        //   sortable: false,
        // },
      ],
      formCreationDialog: false,
      componentCheck: 0,
      formData: {},
    };
  },
  created() {
    // if (this.$router.history.current.params.formMethod == "AllFlows") {
    //   this.toggle_exclusive = "all_flows";
    // }
    this.fetch_forms();
    localStorage.setItem("flowStepsInfo", []);
    localStorage.setItem("zeroStep", []);
  },
  methods: {
    back_call() {
      this.$router.push("/AppList");
    },
    get_method(value) {
      this.toggle_exclusive = "all_flows";
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.formCreationDialog = false;
      this.fetch_forms();
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

    async fetch_forms() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_forms_customs, {
            input: {
              organization_id: data.organization.organization_id,
              // user_email_id: data.user.user_email_id,
              limit: 50,
              nextToken: null,
            },
          })
        );

        this.tableData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_forms_customs);
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
        } else {
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },

    handleRowClick(value) {
      this.$store.commit("SetFormObj", value);
      this.$store.commit("SetDirectoryForm", false);
      this.$store.commit("SetExternalForm", false);
      this.$router.push("/home/Forms");
    },

    create_form() {
      this.componentCheck = 1;
      this.formCreationDialog = true;
    },
  },
};
</script>