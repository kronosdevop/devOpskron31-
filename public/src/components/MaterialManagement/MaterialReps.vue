<template>
  <div>
    <v-card flat>
      <v-toolbar class="" flat dense>
        <v-spacer />
        <v-btn dark @click="createreps()" class="text-capitalize cardCss">
          Add
        </v-btn>
      </v-toolbar>
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <v-card-text>
        <v-data-table
          :headers="headers"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 mt-n3 dtwidth"
        >
          <template v-slot:[`item.user_email_id`]="{ item }">
            <span>{{ fetch_user_name(item.user_email_id) }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="primaryColor" small @click="edit_visitorrep(item)"
              >mdi-pencil</v-icon
            >
            <v-icon
              color="red"
              class="ml-2"
              small
              @click="delete_visitorrep(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <EditProjectreps
        :vistrepedition="vistrepedition"
        @clicked="vistrepedition = false"
        v-on:errorMsg="error_info"
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteMaterialrep
        :vistrepdeletion="vistrepdeletion"
        @clicked="vistrepdeletion = false"
        v-on:errorMsg="error_info"
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <CreateProjectrep
        :repcreation="repcreation"
        @clicked="repcreation = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
  <script>
/*eslint-disable*/
import CreateProjectrep from "@/components/MaterialManagement/Popups/CreateProjectrep.vue";
import EditProjectreps from "@/components/MaterialManagement/Popups/EditProjectreps.vue";
import DeleteMaterialrep from "@/components/MaterialManagement/Popups/DeleteMaterialrep.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import SnackBar from "@/components/SnackBar.vue";
import { list_all_project_site_users } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
    DeleteMaterialrep,
    EditProjectreps,
    CreateProjectrep,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      headers: [
        { text: "User", value: "user_email_id", sortable: false },

        { text: "Project Site", value: "project_site_names", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      tableData: [],
      allUSersNames: [],
      tableLoading: false,
      fixed: true,
      componentCheck: 0,
      vistrepdeletion: false,
      vistrepedition: false,
      visitTypeDialog: false,
      repcreation: false,
      SnackBarComponent: {},
      rowInfo: {},
    };
  },
  async mounted() {
    await this.get_all_org_users();
    await this.fetch_userrep();

    this.allUSersNames = this.orgUsers;
  },
  methods: {
    createreps() {
      this.componentCheck = 3;
      this.repcreation = true;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.repcreation = false;
      this.vistrepdeletion = false;
      this.vistrepedition = false;
      this.tableData = [];
      this.fetch_userrep();
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
    edit_visitorrep(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.vistrepedition = true;
    },
    delete_visitorrep(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.vistrepdeletion = true;
    },
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      if (value == "SYSTEM") {
        name = value;
      }
      return name;
    },
    async fetch_userrep() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_project_site_users, {})
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_all_project_site_users);

        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
          this.tableData = [];
        }
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