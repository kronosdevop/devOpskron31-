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
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="mt-n5 elevation-1 dtwidth"
        >
          <template v-slot:[`item.full_user_name`]="{ item }">
            <span class="caption">{{ item.full_user_name }}</span>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-icon
              v-if="
                item.user_type != 'OWNER' &&
                $store.getters.GetUserObj.organization.user_id != item.user_id
              "
              small
              color="red"
              @click="delete_admin(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <AdminAccess
        :adminAccess="adminAccess"
        :userArray="userArray"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="close_dialogs"
      />
    </div>
    <div v-if="componentCheck == 2">
      <RemoveAdmin
        :deleteAdmin="deleteAdmin"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="close_dialogs"
        :rowInfo="rowInfo"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import AdminAccess from "@/components/SettingsDialogs/AdminAccess.vue";
import RemoveAdmin from "@/components/SettingsDialogs/RemoveAdmin.vue";
import { list_users } from "@/graphql/queries.js";
import { get_all_users } from "@/mixins/GetAllUsers.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    AdminAccess,
    RemoveAdmin,
    SnackBar,
  },
  mixins: [get_all_users],
  data() {
    return {
      SnackBarComponent: {},
      tableData: [],
      headers: [
        { text: "User Name", value: "full_user_name", sortable: false },
        { text: "User Email", value: "user_email_id", sortable: false },

        {
          text: "Role",
          value: "user_type",
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
      adminAccess: false,
      SnackBarComponent: {},
      userArray: [],
      deleteAdmin: false,
      rowInfo: {},
    };
  },
  async created() {
    await this.get_admins();
    await this.get_all_users();
  },
  methods: {
    add_action() {
      this.userArray = [];
      this.listUsers.forEach((element) => {
        if (element.user_type != "CHATBOT") {
          this.userArray.push({
            username: element.full_user_name,
            userId: element.user_id,
          });
        }
      });
      this.componentCheck = 1;
      this.adminAccess = true;
    },

    async get_admins() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_users, {
            organization_id: data.organization.organization_id,
            user_status: "ACTIVE",
            user_type: "ADMIN",
            limit: 1000,
            next_token: null,
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var dataArray = [];
        var response = result.data.list_users;
        response.details.forEach((element) => {
          if (element.user_type != "CHATBOT") {
            this.tableData.push({
              full_user_name: element.full_user_name,
              organization_id: element.organization_id,
              user_contact_number: element.user_contact_number,
              user_country_code: element.user_country_code,
              user_created_on: element.user_created_on,
              user_email_id: element.user_email_id,
              user_id: element.user_id,
              user_status: element.user_status,
              user_type: element.user_type,
              department: element.work_details.department,
              designation: element.work_details.designation,
              location: element.work_details.location,
              reporting_manager: element.work_details.reporting_manager,
              date_of_joining: element.work_details.date_of_joining,
            });
          }
        });
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
    delete_admin(item) {
      this.componentCheck = 2;
      this.deleteAdmin = true;
      this.rowInfo = item;
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
      this.adminAccess = false;
      this.deleteAdmin = false;
      this.get_admins();
    },
    close_dialogs(val) {
      if (val == 0) {
        this.adminAccess = false;
        this.deleteAdmin = false;
      }
    },
  },
};
</script>