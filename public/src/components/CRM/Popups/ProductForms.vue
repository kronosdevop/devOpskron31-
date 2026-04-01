<template>
  <div>
    <v-card flat>
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
          :options.sync="pagination"
          @update:options="handle_pagination()"
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.is_form_designed`]="{ item }">
            <span v-if="item.is_form_designed == true" class="">
              <v-btn small text class="white--text ml-n3" color="green"
                >Yes</v-btn
              >
            </span>
            <span v-else>
              <v-btn small text class="white--text ml-n3" color="red">No</v-btn>
            </span>
          </template>
          <template v-slot:[`item.is_flow_design`]="{ item }">
            <span v-if="item.is_flow_design == true" class="">
              <v-btn small text class="white--text ml-n3" color="green"
                >Yes</v-btn
              >
            </span>
            <span v-else>
              <v-btn small text class="white--text ml-n3" color="red">No</v-btn>
            </span>
          </template>
          <template v-slot:[`item.form_created_on`]="{ item }">
            <span class="caption">{{ fetch_value(item.form_created_on) }}</span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-menu bottom center>
              <template #activator="{ on, attrs }">
                <v-btn color="primaryColor" icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-format-list-bulleted-square</v-icon>
                </v-btn>
              </template>

              <v-list style="max-width: 220px" dense>
                <v-list-item @click="edit_form(item)">
                  <v-list-item-title> Edit </v-list-item-title>
                </v-list-item>
                <v-list-item @click="handle_row_click(item)">
                  <v-list-item-title> Design Form </v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="design_flow(item)"
                  v-if="item.is_form_designed == true"
                >
                  <v-list-item-title> Design Flow </v-list-item-title>
                </v-list-item>
                <v-list-item v-if="item.is_flow_design == true">
                  <v-list-item-title> Edit Flow </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <!-- <v-icon small @click.stop="edit_form(item)" color="primaryColor">
              mdi-pencil</v-icon
            > -->
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <div v-if="componentCheck == 2">
      <EditForms
        :editFormDialog="editFormDialog"
        :formInfo="formInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editFormDialog = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */

import FormCreation from "@/components/FormDesigner/FormDialogs/FormCreation.vue";
import EditForms from "@/components/FormDesigner/FormDialogs/EditForms.vue";
// import { list_crm_forms } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    FormCreation,
    EditForms,
    SnackBar,
  },
  data() {
    return {
      tableData: [],
      tableLoading: false,
      headers: [
        { text: "Form Name", value: "form_name", sortable: false },
        {
          text: "Form Description",
          value: "form_description",
          sortable: false,
        },
        { text: "Created On", value: "form_created_on", sortable: false },
        { text: "Created By", value: "form_deployed_by", sortable: false },
        { text: "Form Designed ", value: "is_form_designed", sortable: false },
        { text: "Flow Designed ", value: "is_flow_design", sortable: false },

        { text: "Action", value: "actions", sortable: false },
      ],
      componentCheck: 0,
      formCreationDialog: false,
      editFormDialog: false,
      nextToken: null,
      formInfo: {},
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
    };
  },
  created() {
    this.fetch_forms();
  },
  methods: {
    handle_pagination() {
      if (this.nextToken) {
        this.fetch_forms();
      }
    },
    create_form() {
      this.componentCheck = 1;
      this.formCreationDialog = true;
    },
    fetch_value(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;

      return dateValue;
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

    handle_row_click(value) {
      this.$store.commit("SetFormObj", value);
      this.$store.commit("Setpathinfo", "CRM");
      this.$router.push("/Forms");
    },

    design_flow(item) {
      this.$store.commit("SetCRMForm", item);
      this.$router.push("CRMFlowDesigner");
      localStorage.setItem("zeroStep", JSON.stringify(item.form_template));
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
      this.editFormDialog = false;
      this.fetch_forms();
    },
    edit_form(value) {
      this.componentCheck = 2;
      this.editFormDialog = true;
      this.formInfo = value;
    },

    async fetch_forms() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_crm_forms, {
            input: {
              organization_id: data.organization.organization_id,
              product_id: this.$store.getters.Getproductitems.product_id,
              // user_email_id: data.user.user_email_id,
              limit: 21,
              nextToken: this.nextToken,
            },
          })
        );

        this.tableData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_crm_forms);

        if (response.Status == "SUCCESS") {
          this.nextToken = response.nextToken;
          let array = this.tableData.concat(response.data);

          this.tableData = array;

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.form_id === obj.form_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.tableData.sort((a, b) =>
            a.form_name.localeCompare(b.form_name, undefined, {
              sensitivity: "base",
            })
          );
        } else {
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },
  },
};
</script>