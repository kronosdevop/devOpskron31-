<template>
  <div>
    <!-- :class="{ 'animated-card-right': isVisible }" -->
    <v-card  flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <v-toolbar flat >
        <v-text-field
          class=""
          label="Search"
          dense
          outlined
          style="max-width: 200px"
          v-model="tableSearch"
          append-icon="mdi-magnify"
        ></v-text-field>
      </v-toolbar>
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
          :search="tableSearch"
          class="elevation-1 mt-n2 dtwidth"
        >
          <template v-slot:[`item.directory_created_on`]="{ item }">
            <span>{{ get_date(item.directory_created_on) }}</span>
          </template>
          <template v-slot:[`item.directory_created_by`]="{ item }">
            <span>{{ fethc_names(item.directory_created_by) }}</span>
          </template>
          <template v-slot:[`item.Actions`]="{ item }">
            <v-btn
              dark
              @click="request_access(item)"
              color="primaryColor"
              class="text-capitalize"
              elevation="0"
              x-small
              >Request Access
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <RequestAccess
        :rowInfo="rowInfo"
        :requestAccessDialog="requestAccessDialog"
        @clicked="requestAccessDialog = false"
        v-on:successMsg="get_successs_toast"
        v-on:errorMsg="get_error"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { list_all_stichh_channels } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import RequestAccess from "@/components/Channels/AllDialogs/RequestAccess.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    RequestAccess,
    SnackBar,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      headers: [
        { text: "Name", value: "team_name", sortable: false },
        {
          text: "Description",
          value: "team_description",
          sortable: false,
        },

        // { text: "Created On", value: "directory_created_on", sortable: false },
        { text: "Created By", value: "team_created_by", sortable: false },
        { text: "Actions", value: "Actions", sortable: false },
      ],
      tableData: [],
      searchlist: "",
      tableSearch: "",
      tableLoading: false,
      allusers: [],
      componentCheck: 0,
      requestAccessDialog: false,
      rowInfo: {},
      SnackBarComponent: {},
      isVisible: false,
    };
  },

  async created() {
    this.isVisible = true;
    this.fetch_all_directories();
    await this.get_all_org_users();
    this.allusers = this.orgUsers;
  },

  methods: {
    async fetch_all_directories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_stichh_channels, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var self = this;
        var response = JSON.parse(result.data.list_all_stichh_channels);
        // console.log(response);
        let restrictedDirectories = [];
        let arraynew = [];
        if (response.Status == "SUCCESS") {
          restrictedDirectories = response.data;
          restrictedDirectories.forEach((element) => {
            if (
              element.team_visibility != undefined &&
              element.team_visibility == "RESTRICTED" &&
              element.team_created_by !=
                self.$store.getters.GetUserObj.user?.user_email_id
            ) {
              arraynew.push(element);
              // console.log(arraynew);
              this.tableData = arraynew.filter(
                (item) =>
                  !item.restricted_users.includes(
                    this.$store.getters.GetUserObj.user?.user_id
                  )
              );
            }
          });
          // this.tableData = response.Data;
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },

    request_access(item) {
      this.rowInfo = item;
      this.componentCheck = 1;
      this.requestAccessDialog = true;
    },

    get_successs_toast(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.requestAccessDialog = false;
    },

    get_error(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    fethc_names(value) {
      var name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },

    get_date(val) {
      return format_Date(val);
    },
  },
};
</script>