<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-data-table
          :headers="projectsiteHeaders"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 mt-n2 dtwidth"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="primaryColor"
              class="mr-2"
              small
              @click="edit_project(item)"
              >mdi-pencil</v-icon
            >
            <v-icon color="red" small @click="open_deletedailog(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <div v-if="componentCheck == 2">
      <EditProjectsite
        :projectsiteedition="projectsiteedition"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="projectsiteedition = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteProjectsite
        :projectsitedeletion="projectsitedeletion"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
        @clicked="projectsitedeletion = false"
      />
    </div>
  </div>
</template>
      <script>
/*eslint-disable*/

import EditProjectsite from "@/components/MaterialManagement/Popups/EditProjectsite.vue";
import DeleteProjectsite from "@/components/MaterialManagement/Popups/DeleteProjectsite.vue";
import { create_list_edit_delete_project_site } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    EditProjectsite,
    DeleteProjectsite,
  },
  data() {
    return {
      projectsiteHeaders: [
        { text: "Name", value: "project_site_name", sortable: false },
        { text: "Head", value: "project_site_head_name", sortable: false },
        { text: "Action", value: "actions", sortable: false },
      ],
      fixed: true,
      tableData: [],
      tableLoading: false,
      componentCheck: 0,

      SnackBarComponent: {},
      projectsiteedition: false,
      rowInfo: {},
      projectsitedeletion: false,
    };
  },
  created() {
    this.fetch_projectsite();
  },
  methods: {
    edit_project(value) {
      this.rowInfo = value;
      this.componentCheck = 2;
      this.projectsiteedition = true;
    },

    open_deletedailog(value) {
      this.rowInfo = value;
      this.componentCheck = 3;
      this.projectsitedeletion = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.tableData = [];
      this.projectsiteedition = false;
      this.projectsitedeletion = false;
      this.fetch_projectsite();
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

    async fetch_projectsite() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_project_site, {
            input: {
              action_type: "LIST_PROJECT_SITE",
              organization_id: data.organization.organization_id,
            },
            // product_name: "",
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(
          result.data.create_list_edit_delete_project_site
        );
        this.tableLoading = false;
        this.tableData = response.data;
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];
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