<template>
  <div>
    <!-- eslint-disable -->
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
          <template v-slot:[`item.form_name`]="{ item }">
            <span
              ><u
                style="text-decoration-color: blue"
                @click="handleClick(item)"
                >{{ item.form_name }}</u
              ></span
            >
          </template>
          <template v-slot:[`item.form_description`]="{ item }">
            <span>{{ item.form_description }}</span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              small
              class="mt-1 mb-1 ml-n1 white--text"
              color="green"
              @click="configure_form(item)"
              >Configure</v-btn
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <div v-if="componentCheck == 2">
      <PublishForm
        :masterArray="masterArray"
        :summaryArray="summaryArray"
        :selectedFormInfo="selectedFormInfo"
        :publish_form="publish_form"
        :selectedForm="selectedForm"
        :formDetails="formDetails"
        @clicked="close_dialog"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { list_all_forms } from "@/graphql/queries.js";
import FormDisplay from "@/components/FormFields/FormDisplay.vue";
import { API, graphqlOperation } from "aws-amplify";

import PublishForm from "@/components/FormsSelection/PublishForm.vue";
export default {
  components: {
    SnackBar,
    FormDisplay,

    PublishForm,
  },
  data() {
    return {
      selected: [],
      singleSelect: true,
      publish_form: false,
      componentCheck: 0,
      SnackBarComponent: {},
      formDetails: {},
      tableData: [],
      tableLoading: false,
      items: [{ title: "Configure Publish" }, { title: "View Forms" }],
      headers: [
        { text: "Form Name", value: "form_name", sortable: false },
        {
          text: "Form Description",
          value: "form_description",
          sortable: false,
        },
        { text: "Process Speed", value: "workflow_speed", sortable: false },

        { text: "#Txs", value: "total_counts_of_workflows", sortable: false },
        { text: "Actions", value: "actions", sortable: false },

        // { text: "Configure", value: "form_code", sortable: false },
        // { text: "Actions", value: "actions", sortable: false },
      ],
      formViewDailog: false,
      actionItem: "",
      masterArray: [],
      viewAction: "Deployed",
      selectedFormInfo: {},
      selectedForm: false,
      summaryArray: [],
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
        let result = await API.graphql(
          graphqlOperation(list_all_forms, {
            organization_id: data.organization.organization_id,
            form_status: "ACTIVE",
            form_type: "SYSTEM_FLOWS",
            limit: 1000,
            next_token: null,
          })
        );
        this.tableData = [];
        var response = JSON.parse(result.data.list_all_forms);
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

    close_dialog() {
      this.publish_form = false;
      this.fetch_static_forms();
    },

    checkItems(item, itemm) {
      if (itemm.title == "Configure Publish") {
      }
      if (itemm.title == "View Forms") {
        this.componentCheck = 1;
        this.formDetails = item;
        this.formViewDailog = true;
        this.actionItem = "None";
      }
    },

    configure_form(item) {
      this.componentCheck = 2;
      this.formDetails = item;
      this.publish_form = true;
      this.masterArray = [];
      this.summaryArray = [];
      localStorage.setItem("zeroStep", JSON.stringify(item.form_template));

      var array2 = item.form_template;

      array2.forEach((element) => {
        this.summaryArray.push({
          label: element.display_label,
          value: element.key,
        });
        if (
          element.data_type == "single_choice" &&
          element.input_array_value != null
        ) {
          // this.masterCheck = 1;
          this.masterArray.push({
            arrayValue: element.input_array_value,
            displayLabel: element.display_label,
          });
        }
      });

      this.selectedForm = true;
      this.selectedFormInfo = item;

      // this.formDialog = false;
    },

    handleClick(item) {
      this.componentCheck = 1;
      this.formDetails = item;
      this.formViewDailog = true;
      this.actionItem = "None";
    },
  },
};
</script>