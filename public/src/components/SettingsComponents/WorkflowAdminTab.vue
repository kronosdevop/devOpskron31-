<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-toolbar flat dense>
      <v-spacer />
      <v-btn
        @click="add_action()"
        small
        class="elevation-0 cardCss"
        style="margin-top: -120px"
        fab
        dark
      >
        <v-icon dark> mdi-plus </v-icon>
      </v-btn>
    </v-toolbar>
    <v-card flat>
      <v-card-text class="mt-n4">
        <v-data-table
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="mt-n5 elevation-1 dtwidth"
        >
          <template v-slot:[`item.full_user_name`]="{ item }">
            <span class="caption">{{ item.full_user_name }}</span>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-icon small color="red" @click="delete_wrkflow_admin(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <AddWrkflowRoles
        :addWrkflowRole="addWrkflowRole"
        :userArray="userArray"
        :allUsers="allUsers"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="addWrkflowRole = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteWorflowAdmin
        :deleteWrkflowRoles="deleteWrkflowRoles"
        :rowInfo="rowInfo"
        @clicked="deleteWrkflowRoles = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import AddWrkflowRoles from "@/components/SettingsDialogs/AddWrkflowRoles.vue";
import DeleteWorflowAdmin from "@/components/SettingsDialogs/DeleteWorflowAdmin.vue";

import { list_workflow_roles } from "@/graphql/queries.js";
import { get_all_users } from "@/mixins/GetAllUsers.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
    AddWrkflowRoles,
    DeleteWorflowAdmin,
  },
  mixins: [get_all_users],
  data() {
    return {
      SnackBarComponent: {},
      tableData: [],

      headers: [
        { text: "User Name", value: "user_id", sortable: false },
        { text: "User Email", value: "user_email_id", sortable: false },

        {
          text: "Role",
          value: "workflow_role_name",
          sortable: false,
        },
        {
          text: "Action",
          value: "action",
          sortable: false,
        },
      ],
      tableLoading: false,
      componentCheck: 0,
      addWrkflowRole: false,
      userArray: [],
      allUsers: [],
      deleteWrkflowRoles: false,
      rowInfo: {},
    };
  },
  async created() {
    this.allUsers = [];
    await this.get_wrkflow_admins();
    await this.get_all_users();
  },
  methods: {
    add_action() {
      this.userArray = [];
      this.allUsers = this.listUsers;
      this.listUsers.forEach((element) => {
        if(element.user_type != "CHATBOT"){
        this.userArray.push({
          username: element.full_user_name,
          userId: element.user_id,
        });
      }
      });
      this.addWrkflowRole = true;
      this.componentCheck = 1;
    },
    delete_wrkflow_admin(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.deleteWrkflowRoles = true;
    },

    async get_wrkflow_admins() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_workflow_roles, {
            organization_id: data.organization.organization_id,
            workflow_role_status: "ACTIVE",
            limit: 500,
            next_token: null,
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var dataArray = [];
        var response = result.data.list_workflow_roles;
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
      this.addWrkflowRole = false;

      this.get_wrkflow_admins();
    },
  },
};
</script>