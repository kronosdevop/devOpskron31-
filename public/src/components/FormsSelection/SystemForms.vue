<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card class="" flat>
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
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small @click="handleClick(item)" color="green"
              >mdi-eye</v-icon
            >
            <v-btn x-small class="ma-1" @click="deploay_form(item)"
              >Publish</v-btn
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <!-- <ViewForm
        :viewAction="viewAction"
        :formViewDailog="formViewDailog"
        :formDetails="formDetails"
        :actionItem="actionItem"
        @clicked="formViewDailog = false"
      /> -->
    </div>
    <div v-if="componentCheck == 2">
      <DeployDialog
        :deployFormDialog="deployFormDialog"
        :formDetails="formDetails"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="deployFormDialog = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { list_master_forms } from "@/graphql/queries.js";
import FormDisplay from "@/components/FormFields/FormDisplay.vue";
import DeployDialog from "@/components/FormsSelection/DeployDialog.vue";
import { API, graphqlOperation } from "aws-amplify";
// import ViewForm from "@/components/FormFields/ViewForm.vue";
export default {
  components: {
    SnackBar,
    FormDisplay,
    // ViewForm,
    DeployDialog,
  },
  data() {
    return {
      selected: [],
      singleSelect: true,
      componentCheck: 0,
      SnackBarComponent: {},
      formDetails: {},
      tableData: [],
      tableLoading: false,
      headers: [
        { text: "Form Name", value: "form_name", sortable: false },
        {
          text: "Form Description",
          value: "form_description",
          sortable: false,
        },

        // { text: "Configure", value: "form_code", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      formViewDailog: false,
      actionItem: "",
      deployFormDialog: false,
      viewAction: "Deployed",
    };
  },
  created() {
    this.fetch_static_forms();
  },
  methods: {
    async fetch_static_forms() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(graphqlOperation(list_master_forms, {}));
        this.tableData = [];
        var response = JSON.parse(result.data.list_master_forms);
        this.tableData = response.details;

        this.tableLoading = false;
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
      this.deployFormDialog = false;
      this.fetch_static_forms();
    },
    handleClick(item) {
      this.componentCheck = 1;
      this.formDetails = item;
      this.formViewDailog = true;
      this.actionItem = "None";
    },
    deploay_form(item) {
      this.componentCheck = 2;
      this.deployFormDialog = true;
      this.formDetails = item;
    },
  },
};
</script>