<template>
  <div>
    <v-card flat>
      <!-- <v-toolbar flat>
        <v-spacer />
        <v-btn dark @click="createGroup()" class="text-capitalize cardCss"
          >Create</v-btn
        >
      </v-toolbar> -->
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :search="search"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="elevation-1 dtwidth mt-n2"
        >
          <template v-slot:[`item.action`]="{ item }">
            <v-icon
              small
              @click.stop="edit_group(item)"
              class="ml-5"
              color="primaryColor"
            >
              mdi-pencil
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateGroupchat
        :groupDialog="groupDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="groupDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditGroupchat
        :editchat="editchat"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editchat = false"
        :groupinfo="groupinfo"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { user_team_and_particular_details } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import CreateGroupchat from "./BroadcastPopups/CreateGroupchat.vue";
import EditGroupchat from "./BroadcastPopups/EditGroupchat.vue";
export default {
  components: {
    SnackBar,
    CreateGroupchat,
    EditGroupchat,
  },
  data() {
    return {
      height: 0,
      fixed: true,
      tableData: [],
      tableLoading: false,
      groupDialog: false,
      search: "",
      headers: [
        {
          text: "Team Name",
          value: "team_name",
          sortable: false,
        },
        {
          text: "Description",
          value: "team_description",
          sortable: false,
        },

        {
          text: "Action",
          value: "action",
          sortable: false,
        },
      ],
      componentCheck: 0,
      SnackBarComponent: {},
      editchat: false,
      groupinfo: {},
    };
  },
  created() {
    this.height = window.innerHeight - 220;
    this.get_grouplist();
  },
  methods: {
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
    createGroup() {
      this.componentCheck = 1;
      this.groupDialog = true;
    },
    edit_group(item) {
      this.groupinfo = item;
      this.componentCheck = 2;
      this.editchat = true;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.editchat = false;
      this.groupDialog = false;

      this.get_grouplist();
    },
    async get_grouplist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(user_team_and_particular_details, {
            input: {
              user_email_id: data.user.user_email_id,
              limit: 100,
              nextToken: null,
            },
          })
        );

        this.tableLoading = false;

        var response = JSON.parse(result.data.user_team_and_particular_details);

        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.team;
        } else {
          this.tableLoading = false;
        }
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
  },
};
</script>

<style>
</style>