<template>
  <div>
    <v-card flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-toolbar flat>
        <v-toolbar-title>Discussion Rooms</v-toolbar-title>

        <v-spacer />
        <v-btn dark class="text-capitalize cardCss mr-2" @click="add_room()"
          >Add
        </v-btn>
        <v-btn dark class="text-capitalize cardCss" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn></v-toolbar
      >
      <v-card-text class="mt-n3">
        <v-data-table
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :height="height"
          :fixed-header="fixed"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth"
          @click:row="handleRowClick"
        >
          <template v-slot:[`item.team_name`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div v-if="item.team_action_type === 'BROAD_CAST'">
                  <v-icon color="primaryColor" class="mt-4 mr-2">
                    mdi-bullhorn-outline </v-icon
                  ><b>{{ item.team_name }}</b>
                  <div class="text-left ml-8 mt-n3" v-on="on">
                    {{
                      item.team_description.length >= 40
                        ? item.team_description.substr(0, 40) + "..."
                        : item.team_description
                    }}
                  </div>
                </div>
                <div v-else-if="item.team_action_type === 'CHAT_ROOM'">
                  <v-icon color="primaryColor" class="mt-4 mr-2">
                    mdi-account-multiple </v-icon
                  ><b>{{ item.team_name }}</b>
                  <div class="text-left ml-8 mt-n3" v-on="on">
                    {{
                      item.team_description.length >= 40
                        ? item.team_description.substr(0, 40) + "..."
                        : item.team_description
                    }}
                  </div>
                </div>
                <div v-else-if="item.team_action_type === 'GROUP_CAST'">
                  <v-icon color="primaryColor" class="mt-4 mr-2">
                    mdi-bell </v-icon
                  ><b>{{ item.team_name }}</b>
                  <div class="text-left ml-8 mt-n3" v-on="on">
                    {{
                      item.team_description.length >= 40
                        ? item.team_description.substr(0, 40) + "..."
                        : item.team_description
                    }}
                  </div>
                </div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.team_description }}
              </div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.team_created_on`]="{ item }">
            <span>{{ fetch_date(item.team_created_on) }} </span>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <span v-if="item.is_joined == false">
              <v-btn
                @click.stop="join_action(item)"
                small
                text
                class="white--text ml-n3"
                color="green"
                >Join</v-btn
              >
            </span>
            <span v-else>
              <v-btn small text class="white--text ml-n3" color="orange"
                >Joined</v-btn
              >
            </span>
          </template>
          <template v-slot:[`item.action_delete`]="{ item }">
            <v-icon color="red" small class="" @click.stop="delete_data(item)">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <UserTeamView
        :rowInfo="rowInfo"
        :teamRoom="teamRoom"
        @clicked="teamRoom = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <JoinGroup
        :rowInfo="rowInfo"
        :teamJoinDialog="teamJoinDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="teamJoinDialog = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AddDiscussion
        :discussionAdd="discussionAdd"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="discussionAdd = false"
      />
    </div>
    <div v-if="componentCheck == 4">
      <DeleteDiscussion
        :rowInfo="rowInfo"
        :deleteRoom="deleteRoom"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="deleteRoom = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { list_team_list } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import UserTeamView from "@/components/DiscussionRoom/PopUps/UserTeamView.vue";
import JoinGroup from "@/components/DiscussionRoom/PopUps/JoinGroup.vue";
import AddDiscussion from "./PopUps/AddDiscussion.vue";

import DeleteDiscussion from "./PopUps/DeleteDiscussion.vue";

export default {
  components: {
    SnackBar,
    UserTeamView,
    JoinGroup,
    AddDiscussion,
    DeleteDiscussion,
  },
  data() {
    return {
      tableLoading: false,
      tableData: [],
      height: 0,
      headers: [
        { text: "Name", value: "team_name", sortable: false },
        // { text: "Description", value: "team_description", sortable: false },
        { text: "Created By", value: "team_owner_name", sortable: false },
        { text: "Created On", value: "team_created_on", sortable: false },
        { text: "Action", value: "action", sortable: false },
        { text: "", value: "action_delete", sortable: false },
      ],
      fixed: true,
      SnackBarComponent: {},
      teamRoom: false,
      componentCheck: 0,
      rowInfo: {},
      teamJoinDialog: false,
      discussionAdd: false,
      deleteRoom: false,
    };
  },
  created() {
    this.height = window.innerHeight - 220;
    this.get_discussion_rooms();
  },
  methods: {
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    delete_data(item) {
      this.rowInfo = item;
      this.componentCheck = 4;
      this.deleteRoom = true;
    },
    add_room() {
      this.componentCheck = 3;
      this.discussionAdd = true;
    },
    async get_discussion_rooms() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_team_list, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              nextToken: null,
              limit: 100,
            },
          })
        );
        var response = JSON.parse(result.data.list_team_list);
        // console.log(response);
        this.tableLoading = false;
        this.tableData = response.data;
      } catch (error) {}
    },

    fetch_date(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "-" +
        (+month <= 9 ? "0" + month : month) +
        "-" +
        year
      );
    },

    handleRowClick(item) {
      this.rowInfo = item;
      this.componentCheck = 1;
      this.teamRoom = true;
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
      this.deleteRoom = false;
      this.teamJoinDialog = false;
      this.discussionAdd = false;
      this.get_discussion_rooms();
      // this.fetch_dashboard_details();
    },
    join_action(item) {
      this.rowInfo = item;
      this.componentCheck = 2;
      this.teamJoinDialog = true;
    },
  },
};
</script>