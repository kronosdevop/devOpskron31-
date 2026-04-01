<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card  class="mt-4" flat outlined>
      <v-card-text>
        <OverlayComp :overlay="overlay" />

        <v-row no-gutters>
          <v-col cols="6">
            <v-col cols="12">
              <div class="primary--text">
                <b>Channel Details</b>

                <v-icon
                  v-show="
                    queryCheck == 1 &&
                    channelocalData.team_created_by ==
                      $store.getters.GetUserObj.user.user_email_id &&
                    checkDefault == 'FALSE'
                  "
                  class="ml-4 mt-n2"
                  color="primaryColor"
                  @click="edit_channel_details(channelocalData)"
                  >mdi-pencil</v-icon
                >
              </div>
            </v-col>
            <v-divider />
            <v-col cols="12">
              <div>
                <b>Channel Name</b> :
                {{ channelName }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Channel Description</b> :
                {{ channelDescription }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>#Subscribers</b> :
                {{ channelSubscribeCount }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Visibility </b> :
                {{ checkDefault == "TRUE" ? "All Members" : channelVisibility }}
              </div>
            </v-col>

            <v-col cols="12">
              <div>
                <b>Created By</b> :
                {{ fetch_name_email(channelCreatedBy) }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Created On</b> :
                {{ get_date(channelCreatedOn) }}
              </div>
            </v-col>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <EditChannelnfo
        :editChannel="editChannel"
        :allUsers="allUsers"
        :rowInfo="rowInfo"
        @clicked="editChannel = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */

import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_particular_channel } from "@/graphql/queries.js";
import { update_audit_logs } from "@/mixins/AuditLogActions.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import OverlayComp from "@/components/OverlayComp.vue";
import EditChannelnfo from "@/components/Channels/AllDialogs/EditChannelnfo.vue";
import { format_Date } from "@/JsonFiles/DateFormate.js";

export default {
  mixins: [get_all_org_users, update_audit_logs],
  components: {
    SnackBar,
    OverlayComp,
    EditChannelnfo,
  },
  data() {
    return {
      channelCreatedOn: "",
      channelCreatedBy: "",
      channelVisibility: "",
      channelDescription: "",
      channelSubscribeCount: "",
      channelName: "",
      channelDescriptionDisplay: "",
      overlay: false,
      SnackBarComponent: {},
      loadingbtn: false,
      userList: [],
      channelocalData: "",
      editChannel: false,
      componentCheck: 0,
      rowInfo: {},
      allUsers: [],
      queryCheck: 0,
      checkDefault: null,
    };
  },

  async created() {
    this.overlay = true;
    var channelInfo = JSON.parse(localStorage.getItem("channelInfo"));
    this.channelocalData = channelInfo;

    this.$store.commit("Setnamesearch", "");
    await this.get_all_org_users();
    this.fetch_details();
    this.overlay = false;
    await this.fetch_channel_details();
    this.queryCheck = 1;
  },

  methods: {
    async fetch_channel_details() {
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_channel, {
            input: {
              organization_id: data.organization.organization_id,
              team_id: this.channelocalData.team_id,
            },
          })
        );
        this.overlay = false;
        this.orgUsers = [];
        var response = JSON.parse(result.data.get_particular_channel);
        this.checkDefault = response.data[0].is_default;
        // console.log(response);
        this.rowInfo = response.data[0];
        this.channelName = response.data[0].team_name;
        this.channelDescription = response.data[0].team_description;
        this.channelSubscribeCount = response.data[0].no_of_employees_in_team;
        this.channelCreatedOn = response.data[0].team_created_on;
        this.channelCreatedBy = response.data[0].team_created_by;
        this.channelVisibility =
          response.data[0].team_visibility == "OPEN"
            ? "ALL Members"
            : "Restricted Users" +
              " " +
              "(" +
              this.fetch_names(response.data[0].restricted_users) +
              ")";
      } catch (error) {}
    },

    fetch_names(ids) {
      var names = [];
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        for (var j = 0; j < this.allUsers.length; j++) {
          if (this.allUsers[j].user_id === id) {
            names.push(this.allUsers[j].full_user_name);
            break; // Break the inner loop once match is found
          }
        }
      }

      return names;
    },

    fetch_name_email(email) {
      var userName = "";
      for (var i = 0; i < this.allUsers.length; i++) {
        if (this.allUsers[i].user_email_id == email) {
          userName = this.allUsers[i].full_user_name;
        }
      }
      return userName;
    },

    get_date(val) {
      return format_Date(val);

      // const d = new Date(parseInt(val) * 1000);
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
    },

    fetch_details() {
      var data = this.$store.getters.GetUserObj;
      this.allUsers = this.orgUsers;
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      // this.userList.forEach((element) => {
      //   if (element.user_id != data.user.user_id) {
      //     this.visibilityUsers.push({
      //       full_user_name: element.full_user_name,
      //       user_id: element.user_id,
      //     });
      //   }
      // });
    },

    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.editChannel = false;
      this.fetch_channel_details();
    },

    error_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    edit_channel_details(value) {
      // this.rowInfo = value;
      this.editChannel = true;
      this.componentCheck = 1;
    },
  },
};
</script>