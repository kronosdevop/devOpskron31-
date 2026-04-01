<template>
  <div>
    <v-card class="mt-4" flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-data-table
        :headers="subscribers"
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
          <v-icon
            v-show="item.user_email_id != selectedChannelInfo.team_created_by"
            small
            color="red"
            dense
            class="ml-2"
            @click="delete_user(item)"
            >mdi-delete</v-icon
          >
        </template>
      </v-data-table>
    </v-card>
    <div v-if="componentCheck == 1">
      <AddDeleteMembers
        :addDeleteMember="addDeleteMember"
        :actionType="actionType"
        :rowInfo="rowInfo"
        v-on:successMsg="succes_info"
        v-on:errorMsg="error_info"
        @clicked="close_action"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */

import { get_particular_broadcast_details } from "@/graphql/queries.js";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import AddDeleteMembers from "@/components/Channels/AllDialogs/AddDeleteMembers.vue";

export default {
  components: {
    SnackBar,
    AddDeleteMembers,
  },
  data() {
    return {
      subscribers: [
        { text: "Name", value: "full_user_name", sortable: false },
        { text: "Email", value: "user_email_id", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      SnackBarComponent: {},
      addDeleteMember: false,
      componentCheck: 0,
      rowInfo: {},
      actionType: "",
      selectedChannelInfo: {},
    };
  },
  created() {
    var channelData = JSON.parse(localStorage.getItem("channelInfo"));
    // console.log(JSON.parse(localStorage.getItem("channelInfo")));
    this.selectedChannelInfo = channelData;
    this.fetch_subscribers_users();
  },
  methods: {
    async fetch_subscribers_users() {
      this.tableLoading = true;

      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_broadcast_details, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user.user_email_id,
              team_id: this.selectedChannelInfo.team_id,
            },
          })
        );

        this.tableData = [];
        var response = JSON.parse(result.data.get_particular_broadcast_details);
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.tableData = response.data[0].team_users_list;
          localStorage.setItem(
            "channelMembers",
            JSON.stringify(response.data[0].team_users_list)
          );
          //   console.log(this.tableData);
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

    delete_user(value) {
      this.actionType = "Delete";
      this.componentCheck = 1;
      this.addDeleteMember = true;
      this.rowInfo = value;
    },

    close_action() {
      this.addDeleteMember = false;
      this.actionType = "";
    },

    succes_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addDeleteMember = false;
      this.actionType = "";
      this.fetch_subscribers_users();
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addDeleteMember = true;
    },
  },
};
</script>