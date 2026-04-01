<template>
  <div>
    <OverlayComp :overlay="overlay" />
    <!-- :class="{ 'animated-card1': isVisible }" -->
    <v-app style="background-color: #f2f2f2">
      <v-card class="ma-2 mt-5" v-show="arraycheck == true">
        <v-card-text class="mx-auto">
          <div><h3>No app access is available to you</h3></div>
        </v-card-text>
      </v-card>
      <v-card
        v-show="tableData.length != 0"
        style="background-color: #f2f2f2"
        flat
        class="ma-2"
      >
        <!-- <v-toolbar style="background-color: #f2f2f2" flat dense>
          <v-toolbar-title>Apps</v-toolbar-title>
        </v-toolbar> -->
        <v-card-text class="mt-n2">
          <!-- <v-toolbar dense flat> -->
          <!-- <v-row class="" no-gutters>
            <v-spacer />
            <v-btn
              class="mx-2 mt-n7"
              @click="screen_refresh()"
              fab
              dark
              x-small
              color="primary"
            >
              <v-icon dark> mdi-refresh </v-icon>
            </v-btn>
          </v-row> -->
          <!-- </v-toolbar> -->
          <v-row no-gutters>
            <v-col
              cols="12"
              sm="6"
              md="3"
              lg="3"
              v-for="item in items"
              :key="item.dashboard_name"
            >
              <div
                v-if="
                  item.is_visible == true &&
                  (item.app_visible_level == 'WEB_PHONE_ONLY' ||
                    item.app_visible_level == 'WEB_ONLY')
                "
              >
                <v-card
                  flat
                  class="ma-2 responsive-card card-content"
                  @click="handleItemClick(item)"
                >
                  <v-list-item class="mt-1">
                    <v-list-item-content class="mt-n2">
                      <v-list-item-title
                        class="d-flex align-center justify-space-between"
                      >
                        <v-spacer />
                        <v-badge
                          :color="item.counts == 0 ? 'white' : 'green'"
                          :content="item.counts"
                          class="mr-8"
                          style="font-size: -10px"
                        >
                        </v-badge>
                        <v-menu offset-y>
                          <template #activator="{ on, attrs }">
                            <v-icon small v-bind="attrs" v-on="on" class="mt-2"
                              >mdi-information-outline</v-icon
                            >
                          </template>
                          <v-card width="500px">
                            <div class="pa-2">
                              {{ item.dashboard_description }}
                            </div>
                          </v-card>
                        </v-menu>
                      </v-list-item-title>
                      <v-list-item-icon
                        class="d-flex align-center justify-center"
                      >
                        <v-icon
                          class="ma-3 mt-n6"
                          style="font-size: 45px"
                          color="#e26a8e"
                          >{{ item.icon }}</v-icon
                        >
                      </v-list-item-icon>
                      <v-list-item-title
                        class="d-flex align-center justify-center mt-2 ml-2 font-weight-bold"
                        style="font-size: 13.5px"
                        >{{ item.dashboard_name }}</v-list-item-title
                      >
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-app>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import {
  list_dashboard_channels,
  user_level_dashboaord_counts,
} from "@/graphql/queries.js";
import { dashboard_view_edit } from "@/graphql/mutations.js";
import { get_current_details } from "@/mixins/GetCuurentUser.js";
import UserAppslToolbar from "@/components/UserAppslToolbar.vue";

import { EventBus } from "@/main";

export default {
  components: {
    SnackBar,
    OverlayComp,
    UserAppslToolbar,
  },
  mixins: [get_current_details],
  data() {
    return {
      items: [],
      SnackBarComponent: {},
      heights: 0,
      headers: [
        { text: "App Name", value: "dashboard_name", sortable: false },

        {
          text: "App Description",
          value: "dashboard_description",
          sortable: false,
        },
      ],
      height: 0,
      tableData: [],
      overlay: false,
      fixed: true,
      tableLoading: false,
      view_apps: false,
      countarray: [],
      withAdmin: [],
      withoutAdmin: [],
      userAdminLevel: false,
      toogleCheck: false,
      appsListAccess: [],
      arraycheck: null,
      isVisible: false,
    };
  },
  computed: {
    computedClass() {
      return this.appsListAccess.length === 0 ? "mt-n12" : "mt-8";
    },
  },

  async created() {
    await this.fetch_dashboard_details();
    this.height = window.innerHeight - 225;
    this.$store.commit("SetappName", "");
    this.$store.commit("Setappicon", "");
    // await this.fetch_admin_user_apps();
    this.heights = window.innerHeight - 80;
  },

  mounted() {
    this.isVisible = true;
  },
  methods: {
    // screen_refresh() {
    //   this.items = [];
    //   this.fetch_dashboard_details();
    // },
    async change_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(dashboard_view_edit, {
            user_id: this.$store.getters.GetUserObj.user?.user_id,
            dashboard_view: this.view_apps == true ? "CARD_VIEW" : "LIST_VIEW",
          })
        );
        this.loading = false;
        this.view_apps =
          JSON.parse(result.data.dashboard_view_edit).dashboard_view ==
          "CARD_VIEW"
            ? true
            : false;

        // await this.get_current_details();
        // this.$store.commit("SetUserObj", this.currentObject);
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    fetch_admin_user_apps(val) {
      if (val == true) {
        this.items = this.withAdmin
          .filter(Boolean)
          .sort((a, b) => a.dashboard_name.localeCompare(b.dashboard_name));
        this.tableData = this.items;
      } else {
        this.$store.commit("Setappadmins", false);
        this.items = this.withoutAdmin
          .filter(Boolean)
          .sort((a, b) => a.dashboard_name.localeCompare(b.dashboard_name));
        this.tableData = this.items;
      }
    },

    handleItemClick(item) {
      // console.log(item);
      this.fetch_item(item);
      this.$store.commit("Setappitems", item);

      if (item.dashboard_unique_type == "TASKS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-calendar-check");
        this.$router.push("/TaskUserlevel");
      } else if (item.dashboard_unique_type == "EVENTS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-calendar-text-outline");
        this.$router.push("/EventsUser");
      } else if (item.dashboard_unique_type == "COLLATERALS") {
        // this.$router.push("/UserCollaterals");
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-folder-open");
        this.$router.push("/RootFolders");
      } else if (item.dashboard_unique_type == "PREZENCE") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-calendar-multiple");
        this.$router.push("/UserLevel");
      } else if (item.dashboard_unique_type == "EXPENSE") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-cash-multiple");
        this.$router.push("/UserExpense");
      } else if (item.dashboard_unique_type == "user_team") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-account-multiple-outline");
        this.$router.push("/UserTeams");
      } else if (item.dashboard_unique_type == "user_messages") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-broadcast");
        this.$router.push("/MessageTypes");
      } else if (item.dashboard_unique_type == "user_approvals") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-timelapse");
        this.$router.push("/ApprovalForms");
      } else if (item.dashboard_unique_type == "DASHBOARD_MANAGEMENT") {
        // this.$router.push("/UserDashboard");
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-view-dashboard");
        this.$router.push("/DashBoard");
      } else if (item.dashboard_unique_type == "TICKET_MANAGEMENT") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-ticket");
        this.$router.push("/Usertickets");
      } else if (item.dashboard_unique_type == "FORMS") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-file-document");
        this.$router.push("/UserForms");
      } else if (item.dashboard_unique_type == "BOOKING_SLOT") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-book-outline");
        this.$router.push("/UserResources");
      } else if (item.dashboard_unique_type == "DIRECTORY_USER") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-file-key");
        this.$router.push("/DirectoryList");
      } else if (item.dashboard_unique_type == "TIMESHEET_USER") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-clipboard-text-clock-outline");
        // this.$router.push("/UserLevelTimeSheet");
        this.$router.push("/UserTimesheetTypes");
      } else if (item.dashboard_unique_type == "FARM") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-land-fields");
        this.$router.push("/FarmsUser");
      } else if (item.dashboard_unique_type == "PAYROLL") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-cash");
        this.$router.push("/MyPayslip");
      } else if (item.dashboard_unique_type == "ASSETS_USER") {
        this.$store.commit("SetappName", item.dashboard_name);
        this.$store.commit("Setappicon", "mdi-dip-switch");
        this.$router.push("/UserAsset");
      } else if (item.dashboard_unique_type == "PROJECT_USER") {
        this.$store.commit("Setappicon", "mdi-dip-switch");
        this.$store.commit("SetappName", item.dashboard_name);
        this.$router.push("/ProjectListing");
      }
    },

    fetch_item(value) {
      this.appsListAccess.push(value);
    },

    getIconForDashboard(item) {
      if (item.dashboard_unique_type === "TASKS") {
        return "mdi-calendar-check";
      } else if (item.dashboard_unique_type === "PREZENCE") {
        return "mdi-calendar-multiple";
      } else if (item.dashboard_unique_type === "COLLATERALS") {
        return "mdi-folder-open";
      } else if (item.dashboard_unique_type === "EXPENSE") {
        return "mdi-cash-multiple";
      } else if (item.dashboard_unique_type === "CHATGPT") {
        return "mdi-robot";
      } else if (item.dashboard_unique_type === "EVENTS") {
        return "mdi-calendar-text-outline";
      } else if (item.dashboard_unique_type === "VEDIO_CONFERENCE") {
        return "mdi-camera-metering-center";
      } else if (item.dashboard_unique_type === "DISCUSSION_ROOM_ACCESS") {
        return "mdi-account-multiple";
      } else if (item.dashboard_unique_type === "FORMS") {
        return "mdi-file-document";
      } else if (item.dashboard_unique_type === "user_team") {
        return "mdi-account-multiple-outline";
      } else if (item.dashboard_unique_type === "user_messages") {
        return "mdi-broadcast";
      } else if (item.dashboard_unique_type === "DASHBOARD_MANAGEMENT") {
        return "mdi-view-dashboard";
      } else if (item.dashboard_unique_type === "user_approvals") {
        return "mdi-timelapse";
      } else if (item.dashboard_unique_type === "administration") {
        return "mdi-account";
      } else if (item.dashboard_unique_type === "CRM_MANAGEMENT") {
        return "mdi-handshake";
      } else if (item.dashboard_unique_type === "TICKET_MANAGEMENT") {
        return "mdi-ticket";
      } else if (item.dashboard_unique_type === "PAYROLL") {
        return "mdi-cash";
      } else if (item.dashboard_unique_type === "SURVEILLANCE") {
        return "mdi-camera";
      } else if (item.dashboard_unique_type == "PREZENCE_ADMINS") {
        return "mdi-calendar-multiple";
      } else if (item.dashboard_unique_type == "DASHBOARD_MANAGEMENT_ADMINS") {
        return "mdi-view-dashboard";
      } else if (item.dashboard_unique_type == "EVENTS_ADMINS") {
        return "mdi-calendar-text-outline";
      } else if (item.dashboard_unique_type == "EXPENSE_ADMINS") {
        return "mdi-cash-multiple";
      } else if (item.dashboard_unique_type == "FORMS_ADMINS") {
        return "mdi-file-document";
      } else if (item.dashboard_unique_type == "TICKET_MANAGEMENT_ADMINS") {
        return "mdi-ticket";
      } else if (item.dashboard_unique_type === "user_team_ADMINS") {
        return "mdi-account-multiple-outline";
      } else if (item.dashboard_unique_type === "user_messages_ADMINS") {
        return "mdi-broadcast";
      } else if (item.dashboard_unique_type === "user_approvals_ADMINS") {
        return "mdi-timelapse";
      } else if (item.dashboard_unique_type === "PAYROLL_ADMINS") {
        return "mdi-cash";
      } else if (item.dashboard_unique_type === "SURVEILLANCE_ADMINS") {
        return "mdi-camera";
      } else if (
        item.dashboard_unique_type === "TICKET_TECHNICIAN_MANAGEMENT_ADMINS"
      ) {
        return "mdi-human-male-board";
      } else if (item.dashboard_unique_type === "BOOKING_SLOT_ADMINS") {
        return "mdi-book-outline";
      } else if (item.dashboard_unique_type === "user_chat") {
        return "mdi-chat";
      } else if (item.dashboard_unique_type === "FARM") {
        return "mdi-land-fields";
      } else if (item.dashboard_unique_type === "BOOKING_SLOT") {
        return "mdi-book-arrow-up-outline";
      } else if (item.dashboard_unique_type === "TIMESHEET_USER") {
        return "mdi-clipboard-text-clock-outline";
      } else if (item.dashboard_unique_type === "DIRECTORY_USER") {
        return "mdi-file-key";
      } else if (item.dashboard_unique_type === "ASSETS_USER") {
        return "mdi-dip-switch";
      } else if (item.dashboard_unique_type === "VISIT_USERS") {
        return "mdi-account-group";
      } else {
        return "mdi-account-badge";
      }
    },

    getIconStyles(item) {
      const colorMap = {
        "mdi-calendar-check": "#98DFD6",
        "mdi-calendar-multiple": "#45CFDD",
        "mdi-file-document": "#A7EDE7",
        "mdi-account-badge": "orange",
        "mdi-cash-multiple": "#00235B",
        "mdi-robot": "#0E2954",
        "mdi-calendar-text-outline": "#84A7A1",
        "mdi-camera-metering-center": "#10559A",
        "mdi-account-multiple": "#2E8A99",
        "mdi-file": "#E21818",
        "mdi-account": "#6527BE",
        "mdi-timelapse": "#9681EB",
        "mdi-view-dashboard": "#1F6E8C",
        "mdi-account-multiple-outline": "#8D6E63",
        "mdi-broadcast": "#FFDD83",
      };
      const iconColor = colorMap[item.icon] || "black";

      return {
        color: iconColor,
      };
    },

    async fetch_dashboard_details() {
      this.overlay = true;
      this.teamLoading = true;
      var data = this.$store.getters.GetUserObj;

      this.teamData = [];
      this.countarray = [];
      try {
        let result = await API.graphql(
          graphqlOperation(list_dashboard_channels, {
            limit: 500,
            nextToken: null,
            organization_id: data.organization.organization_id,
            dashboard_status: "ACTIVE",
            topic_type: "APP",
            user_email_id: data.user.user_email_id,
            app_access: "USERS",
          })
        );
        this.tableData = [];
        this.withAdmin = [];
        this.withoutAdmin = [];
        this.teamLoading = false;
        this.overlay = false;

        var data = this.$store.getters.GetUserObj;
        var response = result.data.list_dashboard_channels;
        this.countarray = response.data;
        // let assetWrk = {
        //   dashboard_name: "My Asset",
        //   dashboard_description: "Asset ",
        //   is_visible: true,
        //   dashboard_unique_type: "ASSETS_USER",
        //   app_visible_level: "WEB_ONLY",
        //   app_access: "ADMINS",
        //   is_dashboard_admin: true,
        // };
        // response.items.push(assetWrk);
        // let directoryUserLevel = {
        //   dashboard_name: "Directory",
        //   dashboard_description: "",
        //   is_visible: true,
        //   dashboard_unique_type: "DIRECTORY_USER",
        //   app_visible_level: "WEB_ONLY",
        //   app_access: "USERS",
        //   is_dashboard_admin: true,
        // };
        // console.log(data.user.user_type);
        // if (data.user.user_type == "MEMBER") {
        //   response.items.push(teamObj, messageObj, approvalObj);
        // } else if (
        //   data.user.user_type == "ADMIN" ||
        //   data.user.user_type == "OWNER"
        // ) {
        //   response.items.push(teamObj, messageObj, approvalObj);
        // }
        // response.items.push(directoryUserLevel);
        for (let i = 0; i < response.items.length; i++) {
          response.items[i].counts = this.countarray[
            response.items[i].dashboard_name
          ]
            ? this.countarray[response.items[i].dashboard_name]
            : 0;
          if (response.items[i].is_visible) {
            response.items[i].icon = this.getIconForDashboard(
              response.items[i]
            );
          } else {
            delete response.items[i];
          }
        }

        this.items = response.items
          .filter(Boolean)
          .sort((a, b) => a.dashboard_name.localeCompare(b.dashboard_name));
        this.items = this.items.filter(
          (obj) => obj.app_visible_level !== "PHONE_ONLY"
        );

        this.tableData = this.items;

        this.arraycheck = this.tableData.length == 0 ? true : false;
      } catch (error) {
        this.teamLoading = false;
        this.overlay = false;
        // console.log(error);
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

<style scoped>
.wrap-textarea {
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
}
.responsive-card {
  min-height: 125px; /* Set a minimum height for the card */
  max-height: 350px;
  height: 100px;
  overflow: auto; /* Set the desired height */
}
.card-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure the container takes up full height */
}
.card-content {
  overflow: auto; /* Add overflow property to handle content overflow */
}
</style>