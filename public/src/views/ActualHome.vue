<template>
  <div>
    <v-app>
      <!-- <div class="loading-container" v-if="responseCheck == ''">
        <LoadingNew :animation-duration="1500" :size="65" color="#DB4C77" />
      </div> -->
      <OverlayComp :overlay="overlay" />
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <v-app-bar class="appBar" dense elevation="0" app clipped-left>
        <v-app-bar-nav-icon
          @click.stop="drawer = !drawer"
          color=""
          class="mr-2"
          v-show="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
        ></v-app-bar-nav-icon>
        <v-img
          max-height="48"
          max-width="160"
          contain
          class="mx-5 ml-n10"
          src="@/assets/stichhdigitize.png"
        ></v-img>

        <div v-if="$store.getters.GetimageCheck == true">
          <v-img
            class="pl-n16 pr-1 ml-n8"
            contain
            v-if="$store.getters.GetOrgLogo != 'N/A'"
            height="40"
            max-width="100"
            :src="logoUrl"
          ></v-img>
        </div>

     
        <v-btn
          v-if="$store.getters.GetappName.length != 0"
          text
          outlined
          dense
          small
          color="black"
          class="text-capitalize pl-n6 ml-1"
          style="border: 1px solid black; border-radius: 7px"
          >{{ $store.getters.GetappName }}</v-btn
        >
        <v-spacer />
        <!-- <v-badge
          class="mt-2 mr-2"
          :value="getNotificationCount"
          color="deep-purple accent-4"
          :content="getNotificationCount > 0 ? getNotificationCount : ''"
          right
          transition="slide-x-transition"
        >
          <v-icon @click="notificatin_list()" dense> mdi-bell </v-icon>
        </v-badge> -->
        <!-- <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              icon
              @click="report_issue()"
              color=""
              class="mr-2"
            >
              <v-icon dense>mdi-information</v-icon>
            </v-btn>
          </template>
          <span>Facing Issues Using Stichh ? Click To Report</span>
        </v-tooltip> -->
        <div v-show="queryCheck == 2">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                icon
                @click="open_dialog()"
                color=""
                class="ml-2"
              >
                <v-icon dense>mdi-cog</v-icon>
              </v-btn>
            </template>
            <span>Admin Settings</span>
          </v-tooltip>
        </div>
        <div class="ml-2">
          <div class="text-left toolbar-headers font-weight-bold">
            <v-badge :color="$store.getters.GetmqqtColor" inline dot>
              {{ userEmail }}</v-badge
            >
          </div>
          <!-- {{ userEmail }} -->
          <!-- </div> -->
          <div class="text-left toolbar-headers">
            {{ userOrg }}
          </div>
        </div>
        <v-btn @click="sign_out()" icon>
          <v-icon color="primaryColor">mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>
      <v-navigation-drawer
        clipped
        v-model="drawer"
        dense
        width="215px"
        app
        v-if="componentCheck == 0"
        style="background-color: #1e3e5c"
      >
        <v-list dense class="ml-n4 mr-2">
          <v-list-item-group
            v-model="selectedNavItem"
            active-class="my-active-class"
          >
            <template v-for="(item, index) in topNavList">
              <!-- Insert divider before the 3rd item -->
              <!-- <v-divider
                v-if="index === 2"
                :key="'divider-' + index"
                style="border-color: white"
                class="my-2"
              /> -->

              <!-- Navigation item -->
              <v-list-item
                :key="index"
                :value="item"
                @click="navigate_routes(item)"
                link
              >
                <v-list-item-icon>
                  <v-icon color="white" class="ml-2" small>{{
                    item.icon
                  }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content class="ml-n7">
                  <v-list-item-title
                    class="white--text"
                    style="font-size: 12px"
                  >
                    {{ fetch_names(item.text) }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list-item-group>

          <!-- Top-level nav list -->
          <!-- <v-list-item-group
            v-model="selectedNavItem"
            active-class="my-active-class"
          >
            <v-list-item
              v-for="(item, index) in topNavList"
              :key="index"
              :value="item"
              @click="navigate_routes(item)"
              link
            >
              <v-list-item-icon>
                <v-icon color="white" class="ml-2" small>{{
                  item.icon
                }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n7">
                <v-list-item-title
                  class="white--text"
                  style="font-size: 12px"
                  >{{ fetch_names(item.text) }}</v-list-item-title
                >
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group> -->

          <!-- <v-divider color="white" class="mt-2 mb-2" /> -->

          <!-- User Apps Section -->
          <!-- <v-list-group v-model="userAppsExpanded" no-action>
            <template #activator>
              <v-list-item-content>
                <v-list-item-title class="white--text ml-2"
                  >User Apps</v-list-item-title
                >
              </v-list-item-content>
            </template>

            <v-list-item-group
              v-model="selectedNavItem"
              active-class="my-active-class"
            >
              <v-list-item
                v-for="(item, index) in userAppsList"
                :key="index"
                :value="item"
                @click="navigate_routes(item)"
                link
              >
                <v-list-item-icon>
                  <v-icon color="white" class="ml-2" small>{{
                    item.icon
                  }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content class="white--text ml-n7">
                  <v-list-item-title style="font-size: 12px">
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list-group> -->

          <!-- Admin Apps Section -->
          <v-divider
            v-show="queryCheck != 1"
            class="mt-2 mb-2"
            style="border-color: white"
          />
          <v-list-group
            v-if="queryCheck != 1"
            v-model="adminAppsExpanded"
            no-action
          >
            <template #activator>
              <v-list-item-content>
                <v-list-item-title
                  v-if="queryCheck != 1"
                  class="white--text ml-2"
                  >Admin
                </v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item-group
              v-model="selectedNavItem"
              active-class="my-active-class"
            >
              <v-list-item
                v-for="(item, index) in adminAppsList"
                :key="index"
                :value="item"
                @click="navigate_routes(item)"
                link
              >
                <v-list-item-icon>
                  <v-icon color="white" class="ml-2" small>{{
                    item.icon
                  }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content class="white--text ml-n7">
                  <v-list-item-title style="font-size: 12px">
                    {{ fetch_names(item.text) }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list-group>
        </v-list>

        <!-- <v-list dense class="ml-n4 mr-2">
          <v-list-item-group
            v-model="navItem"
            color="#FFFFFF"
            active-class="my-active-class"
          >
            <v-list-item
              v-for="(item, index) in currentNavList"
              :key="index"
              :value="item"
              :input-value="selectedNavItem === item"
              @click="navigate_routes(item)"
              link
            >
              <v-list-item-icon>
                <v-icon color="white" small>{{ item.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="ml-n7">
                <v-list-item-title
                  class="white--text"
                  style="font-size: 12px"
                  v-text="item.text"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
          <v-divider color="white" class="mt-2 mb-2" />

          <v-list-group v-model="userAppsExpanded" no-action>
            <template #activator>
              <v-list-item-content>
                <v-list-item-title class="white--text ml-2"
                  >User Apps</v-list-item-title
                >
              </v-list-item-content>
            </template>

            <v-list-item-group
              v-model="usernavItem"
              active-class="my-active-class"
            >
              <v-list-item
                v-for="(item, index) in userAppsList"
                :key="index"
                :value="item"
                :input-value="selectedNavItem === item"
                @click="navigate_routes(item)"
                link
              >
                <v-list-item-icon>
                  <v-icon color="white" small>{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content class="white--text ml-n7">
                  <v-list-item-title style="font-size: 12px">
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list-group>

          <v-divider v-show="queryCheck != 1" class="mt-2 mb-2" />
          <v-list-group
            v-show="queryCheck != 1"
            v-model="adminAppsExpanded"
            no-action
          >
            <template #activator>
              <v-list-item-content>
                <v-list-item-title class="white--text ml-2"
                  >Admin Apps</v-list-item-title
                >
              </v-list-item-content>
            </template>

            <v-list-item-group
              v-model="adminNav"
              active-class="my-active-class"
            >
              <v-list-item
                v-for="(item, index) in adminAppsList"
                :key="index"
                :value="item"
                :input-value="selectedNavItem === item"
                @click="navigate_routes(item)"
                link
              >
                <v-list-item-icon>
                  <v-icon color="white" small>{{ item.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content class="white--text ml-n7">
                  <v-list-item-title style="font-size: 12px">
                    {{ item.text }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list-group>
        </v-list> -->
        <template #append>
          <div
            class="pa-2 mt-2 mr-2"
            style="font-size: small; color: white; text-align: center"
          >
            <b>V-4.4.8</b>
          </div>
          <!-- <div class="pa-2" style="font-size: small; color: white">
            <b>V-4.4.8</b>
          </div> -->
        </template>
      </v-navigation-drawer>

      <div v-if="viewCheck == true">
        <ViewSelection
          :viewAction="viewAction"
          :rowInfo="rowInfo"
          :viewChangeDialog="viewChangeDialog"
          v-on:successMsg="success_info"
          v-on:errorMsg="error_info"
          @clicked="viewChangeDialog = false"
        />
      </div>
      <div v-if="updateCheck == true">
        <EditUser
          :actionItem="actionItem"
          :editDialog="editDialog"
          :rowInfo="rowInfo"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @clicked="editDialog = false"
        />
      </div>
      <div v-if="dialogueCheck == true">
        <WizardNew
          :signupwizard="signupwizard"
          v-on:closeStep="close_wizard"
          @clicked="signupwizard = false"
        />
      </div>

      <v-content :style="{ backgroundColor: backgroundColor }">
        <div v-if="componentCheck == 1">
          <WizardNew
            :signupwizard="signupwizard"
            v-on:closeStep="close_wizard"
            v-on:completedStep="completed_vizard"
            @clicked="signupwizard = false"
          />
        </div>
        <div v-if="componentChecknew == 2">
          <ReportDialog
            :trackReport="trackReport"
            @clicked="trackReport = false"
          />
        </div>
        <div v-if="emailCheckText == true">
          <LogoutPannel
            :userEmail="userEmail"
            :profileUrl="profileUrl"
            :userProfile="userProfile"
            :currentObject="currentObject"
            v-on:closefunc="close_func"
            v-on:successValue="success_func"
            v-on:unsubcribe="unsubcribecall"
            v-on:endMqqt="disconnect"
            :orgObject="orgObject"
          />
        </div>
        <!-- <div v-if="otherDialogues == 1">
          <NotificationList
            :notificationsData="notificationsData"
            :notificationTab="notificationTab"
            @clicked="notificationTab = false"
          />
        </div> -->
        <router-view
          :chatList="chatList"
          :messagedata="messagedata"
          :channelData="channelData"
          :notificationsData="notificationsData"
          v-on:publishsent="publishmessage"
        />
      </v-content>
    </v-app>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import ReportDialog from "@/components/DialogsList/ReportDialog.vue";
import LoadingNew from "@/components/LoadingNew.vue";
import WizardDialog from "@/components/WizardDialog.vue";
import WizardNew from "@/components/WizardComponents/WizardNew.vue";
import EmailNotificationAction from "@/components/EmailNotificationAction.vue";
import AdminToolBar from "@/views/AdminToolBar.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import EditUser from "@/components/UserDialogs/EditUser.vue";
import LogoutPannel from "@/components/LogoutPannel.vue";
import ViewSelection from "@/components/DialogsList/ViewSelection.vue";
import SnackBar from "@/components/SnackBar.vue";
import sessionTimeoutMixin from "@/mixins/SessionTimeout";
import { get_current_details } from "@/mixins/GetCuurentUser.js";
import { get_current_user_web_portal } from "@/graphql/queries.js";
import { getData } from "@/mixins/AllQueries.js";
import { Auth } from "aws-amplify";
import { EventBus } from "@/main";
import * as htmlToImage from "html-to-image";
import AWS from "aws-sdk";
import { openDB } from "idb";
import { initiateLocalCacheDB } from "@/db.js";
import { connecttoMQTTMethod } from "@/mixins/MqttConnect.js";
import NotificationList from "@/components/NotificationList.vue";
import { mapGetters, mapActions } from "vuex";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

import OverlayComp from "@/components/OverlayComp.vue";

export default {
  mixins: [
    get_current_details,
    get_Org_details,
    getData,
    sessionTimeoutMixin,
    connecttoMQTTMethod,
    get_all_org_users,
    initiateLocalCacheDB,
  ],

  components: {
    LoadingNew,
    WizardDialog,
    EditUser,
    ViewSelection,
    SnackBar,
    AdminToolBar,
    EmailNotificationAction,
    LogoutPannel,
    ReportDialog,
    WizardNew,
    NotificationList,
    OverlayComp,
  },

  data() {
    return {
      backgroundColor: "#EEEEEE",
      userEmail: "",
      selectedItemGroup1: null,
      userOrg: "",
      drawer: true,
      mini: true,
      navItem: 0,
      adminNav: 0,
      userDetail: {},
      logoUrl: "",
      userType: "",
      overlay: false,
      componentCheck: 0,
      switch1: false,
      spinLoading: false,
      usernavItem: 0,
      adminNav: 0,
      signupwizard: false,
      userAppsExpanded: true,
      adminAppsExpanded: false,
      adminPanel: false,
      SnackBarComponent: {},
      userProfile: "",
      profileUrl: "",
      actionItem: "",
      editDialog: false,
      updateCheck: false,
      viewChangeDialog: false,
      viewCheck: false,
      viewAction: false,
      sessionTimer: null,
      sessionTimeoutDuration: 15 * 60 * 1000,
      queryCheck: 0,
      componentChecknew: 0,
      selectedNavList: [],
      screenshotInfo: {},
      responseCheck: "",
      emailCheckText: false,
      enableDisbaleNotification: false,
      orgObject: {},
      trackReport: false,
      currentObject: {},
      adminApps: [],
      userApps: [],
      userAppsList: [],
      adminAppsList: [],
      dialogueCheck: false,
      chatList: [],
      otherDialogues: 0,
      notificationTab: false,
      notificationsData: [],
      logoCheck: 0,
      selectedNavItem: null,
      currentNavList: [
        {
          icon: "mdi-home",
          text: "Home",
          router: "/DashboardView",
          abbreviation: "HOME",
          isActive: true,
        },
        {
          icon: "mdi-account-multiple-outline",
          text: "My Team",
          abbreviation: "TEAM",
          router: "/UserTeams",
          isActive: false,
        },
      ],
      hasRestored: false,
    };
  },
  computed: {
    topNavList() {
      return [...this.currentNavList, ...this.userAppsList];
    },
  },
  async mounted() {
    let savedNavItem = null;

    try {
      const raw = localStorage.getItem("selectedNavItem");
      if (raw) {
        savedNavItem = JSON.parse(raw);
      }
    } catch (e) {
      localStorage.removeItem("selectedNavItem");
    }

    if (savedNavItem) {
      this.selectedNavItem = savedNavItem;
    } else {
      this.selectedNavItem = this.topNavList[0];
    }

    this.$store.commit("Setappicon", "");
    await this.ensureDatabaseInitialized();
    this.notificationsData = await this.getAllItems("STORE_NOTIFICATIONS_LIST");
    this.overlay = true;
    await this.get_current_details();
    if (Object.keys(this.currentObject).length === 0) {
      this.$router.push("/");
    }
    this.$store.commit("SetUserObj", this.currentObject);
    await this.new_query_check(this.currentObject);

    if (this.currentObject.user == undefined) {
      this.$router.push("/");
    }

    await this.get_details();

    await this.get_Org_details();
    this.$store.commit("SetOrgDetails", this.orgDetails);
    this.orgObject = this.orgDetails;

    var data = this.currentObject;
    this.responseCheck = data.user.user_email_id;

    if (
      data.user.is_root_app_admin == true &&
      data.user.user_type == "MEMBER"
    ) {
      this.selectedNavList = this.currentNavList;
      this.queryCheck = 3;
    } else if (
      data.user.user_type == "ADMIN" ||
      data.user.user_type == "OWNER"
    ) {
      // this.componentCheck = 1;
      this.selectedNavList = this.currentNavList;
      this.queryCheck = 2;
    } else if (data.user.user_type == "MEMBER") {
      this.selectedNavList = this.currentNavList;
      this.queryCheck = 1;
    }
    if (this.orgDetails.organization.organization_logo != undefined) {
      var response = this.orgDetails;

      this.logoUrl = await this.s3get(response);
    }
    let clientdata = this.currentObject.user.mqtt_web_configure;
    let topicid =
      this.currentObject.organization.organization_display_id +
      "_" +
      this.currentObject.user.user_email_id +
      "_" +
      "RESTRICTEDGROUPCHATS";
    let notificationTopic = this.currentObject.user.user_id + "NOTIFICATION";

    let taskTopic =
      this.currentObject.organization.organization_display_id +
      "_" +
      this.currentObject.user.user_email_id +
      "_" +
      "TASK";
    let pendingTopic =
      this.currentObject.organization.organization_display_id +
      "_" +
      this.currentObject.user.user_email_id +
      "_" +
      "PENDINGWORKFLOW";
    let restrictedChannels =
      this.currentObject.organization.organization_display_id +
      "_" +
      this.currentObject.user.user_email_id +
      "_" +
      "RESTRICTEDCHANNELS";
    let logoutuser = this.currentObject.user.user_email_id + "WEBLOGOUT";
    let openChannelTopic =
      this.currentObject.organization.organization_display_id + "OPENCHANNELS";

    // let applist =
    //   this.currentObject.organization.organization_display_id + "APPSLIST";
    await this.get_all_org_users();
    const activeUsers = this.orgUsers
      .filter((user) => user.user_status === "ACTIVE")
      .map((user) => user.user_email_id);

    const updatedArray = activeUsers.filter(
      (email) => email !== this.currentObject.user.user_email_id
    );
    const emailcurrent = this.currentObject.user.user_email_id;
    const updatedEmailArray = updatedArray.sort();

    const beforeGeorge = updatedEmailArray.filter(
      (email) => email < emailcurrent
    );
    const afterGeorge = updatedEmailArray.filter(
      (email) => email > emailcurrent
    );

    const combinedArray = [
      ...beforeGeorge.map((email) => `${email}~${emailcurrent}`),
      ...afterGeorge.map((email) => `${emailcurrent}~${email}`),
    ];
    // `ws://${clientdata.host}:9001/mqtt`,
    // clientdata.user_name,

    //  clientdata.password,
    //
    await this.connecttoMQTTMethod(
      `wss://broker.stichh.com:9002/mqtt`,
      clientdata.user_name,
      clientdata.password,
      topicid
    );
    this.subscribeToTopicMethod(notificationTopic);
    this.subscribeToTopicMethod(taskTopic);
    this.subscribeToTopicMethod(pendingTopic);

    this.subscribeToTopicMethod(logoutuser);
    // this.fetch_app_list();
    for (let i = 0; i < combinedArray.length; i++) {
      this.subscribeToTopicMethod(combinedArray[i]);
    }

    this.subscribeToTopicMethod(restrictedChannels);
    this.subscribeToTopicMethod(openChannelTopic);

    // this.chatList = await this.getAllItems("STORE_CHAT_LIST");
    this.overlay = false;
    // this.$router.push("/DashboardView");
  },

  methods: {
    fetch_names(value) {
      if (value == "Quotation and Billing Management") {
        return "Quotation and Billing";
      } else if (value == "Stock and Inventory Management") {
        return "Stock and Inventory";
      } else if (value == "Attendance/Presence Administration") {
        return "Attendance/Presence";
      } else if (value == "Slot Booking Administartion") {
        return "Slot Booking";
      } else {
        return value;
      }
    },

    // fetch_app_list() {
    //   const appData = this.fetchAppList;
    //   let userApps = [];
    //   let adminApps = [];
    //   appData.appusers.forEach((element) => {
    //     if (element.section_app_access_to == "USERS_APP") {
    //       userApps.push(element);
    //     }
    //     if (element.section_app_access_to == "ADMINS_APP") {
    //       adminApps.push(element);
    //     }
    //   });

    //   console.log("appData", appData);
    // },
    disconnect() {
      this.disconnectmqqt();
    },
    unsubcribecall(val) {
      // this.unsubscribeToTopicMethod(val);
    },

    publishmessage(val) {
      this.publishMethod(val.team_topic_id, val.message);
    },

    notificatin_list() {
      this.otherDialogues = 1;
      this.notificationTab = true;
    },

    async new_query_check(value) {
      this.currentObject = value;
      let visibileAdminApps = [];
      let visibleUserItems;
      if (value.user_apps != undefined) {
        visibleUserItems = value.user_apps.filter(
          (item) =>
            item.is_visible &&
            (item.app_usage_level === "WEB_PHONE_ONLY" ||
              item.app_usage_level === "WEB_ONLY")
        );
      }

      let approvalObjadmins = {
        dashboard_name: "Workflow Administration",
        app_abbreviation: "WRKFL",
        dashboard_description:
          "Simplify approvals. Manage requests, track progress, and make timely decisions effortlessly.",
        is_visible: true,
        dashboard_unique_type: "user_approvals_ADMINS",
        app_usage_level: "WEB_ONLY",
        app_access: "ADMINS",
        is_dashboard_admin: true,
      };

      let customersCreation = {
        dashboard_name: "Customers",
        app_abbreviation: "CUSTM",
        dashboard_description: "Customers Repository.",
        is_visible: true,
        dashboard_unique_type: "customer_repository",
        app_usage_level: "WEB_ONLY",
        app_access: "ADMINS",
        is_dashboard_admin: true,
      };

      let teamObjadmins = {
        dashboard_name: "Team",
        app_abbreviation: "TEAMS",
        dashboard_description:
          "Effortlessly manage user lists. Organize, track, and customize information for efficient user management",
        is_visible: true,
        dashboard_unique_type: "user_team_ADMINS",
        app_usage_level: "WEB_ONLY",
        app_access: "ADMINS",
        is_dashboard_admin: true,
      };

      if (value.admin_apps != undefined) {
        visibileAdminApps = value.admin_apps.filter(
          (item) =>
            item.is_visible &&
            item.is_dashboard_admin &&
            (item.app_usage_level === "WEB_PHONE_ONLY" ||
              item.app_usage_level === "WEB_ONLY")
        );
      }

      if (
        this.currentObject.user.user_type == "ADMIN" ||
        this.currentObject.user.user_type == "OWNER"
      ) {
        visibileAdminApps.push(
          teamObjadmins,
          approvalObjadmins,
          customersCreation
        );
      }
      if (value.user_apps != undefined) {
        this.fetch_user_level_apps(visibleUserItems);
      }
      if (value.admin_apps != undefined) {
        this.fetch_admin_apps(visibileAdminApps);
      }
      if (value.admin_apps == undefined) {
        // visibileAdminApps.push(approvalObjadmins);
        this.fetch_admin_apps(visibileAdminApps);
      }
    },

    open_dialog() {
      this.$store.commit("SetappName", "Admin Settings");
      this.$store.commit("Setappicon", " ");
      this.$router.push("/AdministrationPannel");
      // this.componentCheck = 1;
      // this.signupwizard = true;
      // this.dialogueCheck = true;
    },

    report_issue() {
      const self = this;
      this.selectedFilesFromDrop = [];
      const targetElement = document.body;
      htmlToImage
        .toBlob(targetElement, {
          filter: (node) => {
            if (node.tagName === "LINK" && node.rel === "stylesheet") {
              try {
                const cssRules = node.sheet.cssRules; // Attempt to access cssRules
              } catch (e) {
                return false; // Ignore cross-origin stylesheets
              }
            }
            return true;
          },
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          },
          width: targetElement.scrollWidth,
          height: targetElement.scrollHeight,
        })
        .then(function (blob) {
          blob.name = `ScreenShot${new Date().getTime()}.png`;
          self.selectedFilesFromDrop.push(blob);
          let object = {
            selectedFilesFromDrop: self.selectedFilesFromDrop,
            routeName: self.$route.name,
          };
          self.$store.commit("Setreporttracker", object);
          self.loading = false;
          self.componentChecknew = 2;
          self.trackReport = true;
        });
    },

    async s3get(response) {
      const signedUrl = await getS3SignedUrl(
        response.organization.organization_logo,
        response.s3_details
      );
      // console.log(response.organization.organization_logo);
      if (signedUrl) {
        // console.log(signedUrl);
        // this.$store.commit("SetimageCheck", true);
        //  console.log(signedUrl);
        return signedUrl;
      }

      // var s3Bucket = new AWS.S3({
      //   region: response.s3_details.region,
      //   accessKeyId: response.s3_details.access_key,
      //   secretAccessKey: response.s3_details.secret_key,
      //   signatureVersion: "v4",
      // });
      // var params = {
      //   Bucket: response.s3_details.bucket_name,
      //   Key:
      //     "AllorganizationLogos/" +
      //     response.organization.organization_logo.split(
      //       "AllorganizationLogos/"
      //     )[1],
      //   Expires: 60000 * 5,
      // };
      // var url = s3Bucket.getSignedUrl("getObject", params);
      // return url;
    },

    getColor(name) {
      if (name === "Administration") {
        return "cardCss white--text";
      }

      return "white--text";
    },

    getColor2(name) {
      if (name === "Back") {
        return "mininavbar white--text";
      }

      return "white--text";
    },

    completed_vizard() {
      this.componentCheck = 0;
      this.dialogueCheck = false;

      var path = this.$router.history.current.path;
      if (path == "/home") {
        this.$router.push("/DashboardView");
      } else {
        this.$router.push(path);
      }
      window.location.reload();
    },

    update_profile() {
      this.$store.commit("SetUserEmailTeam", this.userEmail);
      this.actionItem = "Edit";
      this.updateCheck = true;
      this.editDialog = true;
      this.rowInfo = this.userDetail.user;
    },

    async get_details() {
      var data = this.currentObject;
      this.userDetail = this.currentObject;

      this.rowInfo = this.userDetail.user;
      this.$store.commit("SetUserObj", this.currentObject);

      this.userEmail = data.user.user_email_id;
      this.userOrg = data.organization.organization_team_id;
      this.userType = data.user.user_type;
      this.$store.commit("SetUserEmailTeam", this.userEmail);
      this.userProfile = data.user.user_profile_pic_url;
      this.profileUrl =
        data.user.user_profile_pic_url == "N/A"
          ? data.user.full_user_name.substring(0, 1)
          : data.user.user_profile_pic_url;
      var path = this.$router.history.current.path;
      if (data.user.is_portal_login == true) {
        this.componentCheck = 1;
        this.signupwizard = true;
        // this.spinLoading = false;
      } else if (data.user.is_portal_login == undefined && path == "/home") {
        this.$router.push("/DashboardView");
        // this.spinLoading = false;
      } else {
        this.$router.push(path);
        this.get_active_item(this.$router.history.current.path);
        // this.spinLoading = false;
      }
    },

    fetch_user_level_apps(value) {
      this.userAppsList = [];
      value.forEach((element) => {
        this.userAppsList.push({
          icon: this.fecth_icons(element),
          text: element.dashboard_name,
          router: this.fecth_router(element),
          abbreviation:
            element.app_abbreviation === "N/A"
              ? this.get_abbreviation(element)
              : element.app_abbreviation,
          isActive: false,
        });
      });
      this.userAppsList = this.userAppsList
        .filter(Boolean)
        .sort((a, b) => a.text.localeCompare(b.text));
      this.selectedNavList = this.userAppsList;
    },

    fetch_admin_apps(value) {
      // console.log("adminAppsList", value);
      this.adminAppsList = [];
      value.forEach((element) => {
        this.adminAppsList.push({
          icon: this.fecth_icons(element),
          text: element.dashboard_name,
          router: this.fecth_router(element),
          abbreviation:
            element.app_abbreviation === "N/A"
              ? this.get_abbreviation(element)
              : element.app_abbreviation,
          isActive: false,
        });
      });
      this.adminAppsList = this.adminAppsList
        .filter(Boolean)
        .sort((a, b) => a.text.localeCompare(b.text));
      this.selectedNavList = this.adminAppsList;
    },

    fecth_icons(element) {
      // console.log(
      //   element.dashboard_unique_type,
      //   "element.dashboard_unique_type"
      // );
      switch (element.dashboard_unique_type) {
        case "TASKS":
          return "mdi-calendar-check";

        case "EVENTS":
          return "mdi-calendar-text-outline";

        case "COLLATERALS":
          return "mdi-folder-open";

        case "DASHBOARD_MANAGEMENT":
          return "mdi-view-dashboard";

        case "PREZENCE":
          return "mdi-calendar-multiple";

        case "TICKET_MANAGEMENT":
          return "mdi-ticket";

        case "EXPENSE":
          return "mdi-cash-multiple";

        case "BOOKING_SLOT":
          return "mdi-book-outline";

        case "DIRECTORY_USER":
          return "mdi-file-key";

        case "TIMESHEET_USER":
          return "mdi-clipboard-text-clock-outline";

        case "PAYROLL":
          return "mdi-cash";

        case "ASSETS_USER":
          return "mdi-dip-switch";

        case "PROJECT_USER":
          return "mdi-dip-switch";

        case "PAYROLL_ADMINS":
          return "mdi-cash";

        case "EVENTS_ADMINS":
          return "mdi-calendar-text-outline";

        case "EXPENSE_ADMINS":
          return "mdi-cash-multiple";

        case "FORMS_ADMINS":
          return "mdi-file-document";

        case "TICKET_MANAGEMENT_ADMINS":
          return "mdi-ticket";

        case "user_team_ADMINS":
          return "mdi-account-multiple-outline";

        case "TICKET_TECHNICIAN_MANAGEMENT_ADMINS":
          return "mdi-human-male-board";

        case "BOOKING_SLOT_ADMINS":
          return "mdi-book-outline";

        case "PREZENCE_ADMINS":
          return "mdi-chart-box";

        case "TIMESHEET_ADMINS":
          return "mdi-clipboard-text-clock-outline";

        case "ASSETS_ADMIN":
          return "mdi-dip-switch";

        case "VISIT_ADMIN":
          return "mdi-account-group";
        case "MATERIAL_ADMIN":
          return "mdi-file-table-box-multiple-outline";
        case "user_approvals_ADMINS":
          return "mdi-timelapse";
        case "GUESTHOUSE_ADMIN":
          return "mdi-home-city";
        case "BILLING_ADMIN":
          return "mdi-cash-fast";
        case "GUESTHOUSE_USER":
          return "mdi-home-city";
        case "AP_AR_USER":
          return "mdi-cash-plus";
        case "TVBOARD_ADMIN":
          return "mdi-television";
        case "SURVEILLANCE_ADMINS":
          return "mdi-cctv";
        case "FARM_ADMINS":
          return "mdi-tractor";
        case "PURCHASE_ADMIN":
          return "mdi-file-chart-outline";
        case "LOADOPT_USER":
          return "mdi-truck-outline";
        case "DASHBOARD_MANAGEMENT_ADMINS":
          return "mdi-view-dashboard";
        case "QABM_ADMINS":
          return "mdi-comment-quote-outline";
        case "QABM_USERS":
          return "mdi-comment-quote-outline";
        case "LOADOPT_ADMIN":
          return "mdi-truck-outline";
        case "VNDR_USERS":
          return "mdi-cash";
        case "SAIM_USERS":
          return "mdi-ballot-outline";
        case "ORDMG_USERS":
          return "mdi-cart-arrow-right";
        case "customer_repository":
          return "mdi-database";
        default:
          return "mdi-help";
      }
    },

    get_abbreviation(element) {
      switch (element.dashboard_unique_type) {
        case "TASKS":
          return "TASKS";

        case "EVENTS":
          return "EVENT";

        case "COLLATERALS":
          return "CABIN";

        case "DASHBOARD_MANAGEMENT":
          return "DASHB";

        case "PREZENCE":
          return "ATTEN";

        case "TICKET_MANAGEMENT":
          return "TICKT";

        case "EXPENSE":
          return "EXPNS";

        case "BOOKING_SLOT":
          return "SLOTS";

        case "DIRECTORY_USER":
          return "DIRCT";

        case "TIMESHEET_USER":
          return "TIMES";

        case "PAYROLL":
          return "MYPAY";

        case "ASSETS_USER":
          return "ASSET";

        case "PROJECT_USER":
          return "PROJE";

        case "PAYROLL_ADMINS":
          return "PAYRO";

        case "EVENTS_ADMINS":
          return "EVENT";

        case "EXPENSE_ADMINS":
          return "EXPNS";

        case "FORMS_ADMINS":
          return "FORMS";

        case "TICKET_MANAGEMENT_ADMINS":
          return "ADTICK";

        case "user_team_ADMINS":
          return "TEAMS";

        case "TICKET_TECHNICIAN_MANAGEMENT_ADMINS":
          return "TICKT";

        case "BOOKING_SLOT_ADMINS":
          return "SLOTS";

        case "PREZENCE_ADMINS":
          return "ATTEN";

        case "TIMESHEET_ADMINS":
          return "TIMES";

        case "ASSETS_ADMIN":
          return "ASSET";

        case "VISIT_ADMIN":
          return "VISIT";

        case "MATERIAL_ADMIN":
          return "MATER";

        case "user_approvals_ADMINS":
          return "APPRO";

        case "GUESTHOUSE_ADMIN":
          return "GSTAD";
        case "GUESTHOUSE_USER":
          return "GSTAD";
        case "BILLING_ADMIN":
          return "BILL";
        case "AP_AR_USER":
          return "AP/AR";
        case "DASHBOARD_MANAGEMENT_ADMINS":
          return "DASHB";
        case "LOADOPT_USER":
          return "VLOAD";
        case "PURCHASE_ADMIN":
          return "PURCH";
        case "FARM_ADMINS":
          return "FARM";
        case "SURVEILLANCE_ADMINS":
          return "SURVL";
        case "TVBOARD_ADMIN":
          return "TVBOD";
        case "LOADOPT_ADMIN":
          return "VLOAD";
        case "VNDR_USERS":
          return "VNDR";
        case "SAIM_USERS":
          return "INVT";
        case "ORDMG_USERS":
          return "ORDER";
        default:
          break;
      }
    },

    fecth_router(element) {
      switch (element.dashboard_unique_type) {
        case "TASKS":
          return "/TaskUserlevel";

        case "EVENTS":
          return "/EventsUser";

        case "COLLATERALS":
          return "/RootFolders";

        case "DASHBOARD_MANAGEMENT":
          return "/DashBoard";

        case "PREZENCE":
          return "/UserLevel";

        case "TICKET_MANAGEMENT":
          return "/Usertickets";

        case "EXPENSE":
          return "/UserExpense";

        case "BOOKING_SLOT":
          return "/UserResources";

        case "DIRECTORY_USER":
          return "/DirectoryList";

        case "TIMESHEET_USER":
          return "/UserTimesheetTypes";

        case "PAYROLL":
          return "/MyPayslip";

        case "ASSETS_USER":
          return "/UserAsset";

        case "PROJECT_USER":
          return "/ProjectListing";

        case "PAYROLL_ADMINS":
          return "/PayslipAdmintypes";

        case "EVENTS_ADMINS":
          return "/EventPlanner";

        case "EXPENSE_ADMINS":
          return "/AppadminExpenses";

        case "FORMS_ADMINS":
          return "/FormDesignerAdmin";

        case "TICKET_MANAGEMENT_ADMINS":
          return "/TicketManagement";

        case "user_team_ADMINS":
          return "/AdminTeam";

        case "TICKET_TECHNICIAN_MANAGEMENT_ADMINS":
          return "/TicketTypes";

        case "BOOKING_SLOT_ADMINS":
          return "/SlotSubitems";

        case "PREZENCE_ADMINS":
          return "/AppAdminprezence";

        case "TIMESHEET_ADMINS":
          return "/AdminTimesheet";

        case "ASSETS_ADMIN":
          return "/AssetTypes";

        case "VISIT_ADMIN":
          return "/AdminTabs";

        case "MATERIAL_ADMIN":
          return "/MaterialManagement";

        case "user_approvals_ADMINS":
          return "/AllTransactions";

        case "LOADOPT_ADMIN":
          return "/VehicalMasters";

        case "GUESTHOUSE_ADMIN":
          return "/GuestHouseList";

        case "BILLING_ADMIN":
          return "/BillingInfo";
        case "AP_AR_USER":
          return "/Arap";
        case "GUESTHOUSE_USER":
          return "/GuestHouseBookingList";
        case "QABM_ADMINS":
          return "/Quotations";
        case "QABM_USERS":
          return "/Quotations";
        case "VNDR_USERS":
          return "/vendors";
        case "SAIM_USERS":
          return "/Inventory";
        case "ORDMG_USERS":
          return "/OrdersList";
        case "customer_repository":
          return "/CustomersList";
        default:
          break;
      }
    },

    get_active_item(val) {
      var data;
      switch (val) {
        case "/UserForms":
          data = 0;
          break;
        case "/PendingList":
          data = 1;
          break;
        case "/SubmitedList":
          data = 2;
          break;
        case "/ParticipatedList":
          data = 3;
          break;
        case "/UserTeams":
          data = 4;
          break;
        case "/BroadcastList":
          data = 5;
          break;
        case "/UserlevelApp":
          data = 6;
          break;
        case "/AdminLevelApps":
          data = 7;
          break;
        case "/AdministrationPannel":
          data = 8;
          break;
      }
      return (this.navItem = data);
    },

    update_email() {
      this.emailCheckText = true;
      this.enableDisbaleNotification = true;
    },

    close_wizard() {
      this.signupwizard = false;
    },

    close_func() {
      this.emailCheckText = false;
    },

    success_func() {
      this.emailCheckText = false;
      this.get_current_details();
    },

    success_data(val) {
      this.switch1 = val;
    },

    navigate_routes(item) {
      this.selectedNavItem = item;
      this.emailCheckText = false;
      this.$router.push(item.router);
      localStorage.setItem("selectedNavItem", JSON.stringify(item));
      this.$store.commit("SetappName", item.text);
      this.$store.commit("Setappicon", item.icon);
      localStorage.setItem("quotationToggle", "quotations");
      this.$store.commit("SetdragCheck", false);
      // const existingItem = this.selectedNavList.find(
      //   (navItem) => navItem.text === item.text
      // );
      // if (!existingItem) {
      //   this.selectedNavList.forEach((navItem) => {
      //     navItem.isActive = navItem === item;
      //   });
      // } else {
      //   this.selectedNavList.forEach((navItem) => {
      //     navItem.isActive = navItem === existingItem;
      //   });
      // }
    },

    navigate_to_views(value) {
      this.viewCheck = true;
      this.viewChangeDialog = true;
      this.viewAction = value;
    },

    async sign_out() {
      this.emailCheckText = true;
      EventBus.$emit("toggleDrawer");
    },
    clear_store_values() {
      this.$store.commit("SetadminAppsCheck", false);
      localStorage.setItem("adminApps", []);
      this.$store.commit("SetadministrationCheck", false);
      localStorage.setItem("activityList", []);
      localStorage.setItem("notoficationItems", []);
    },
    async signing_out(val) {
      await Auth.signOut(val);

      // this.update_audit_logs();
      this.$store.commit("SetFirstSignup", false);
      this.$store.commit("Setappadmins", false);
      this.$store.commit("SetUserEmail", "");
      this.$store.commit("SetUserEmailTeam", "");
      this.$store.commit("SetOrgDetails", {});
      this.$store.commit("SetUserObj", {});
      localStorage.setItem("allMessages", []);
      this.$store.commit("SetAuth", false);
      localStorage.setItem("initiatedBy", "");
      this.$store.commit("Setlibraryformtype", "");
      this.$store.commit("SetappName", "");
      this.$store.commit("Setappicon", "");
      this.clear_store_values();
      this.$router.push("/");
      this.$store.dispatch("logout");
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

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.editDialog = false;
      this.viewChangeDialog = false;
      this.enableDisbaleNotification = false;
      await this.get_current_details();
      this.get_details();
    },
  },
};
</script>
<style scoped>
.my-active-class {
  background-color: #db4c77 !important;
  color: #faf9f9 !important;
  border-radius: 8px;
}
.icon-transition-enter-active,
.icon-transition-leave-active {
  transition: all 0.3s ease;
}

.icon-transition-enter,
.icon-transition-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
.v-icon {
  transition: transform 0.2s ease, background-color 0.3s ease;
}

/* .v-icon:hover {
  transform: scale(1.1);
  background-color: #ff4081;
} */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Ensure it appears on top of other elements */
}
.v-application--is-ltr
  .v-list-group--no-action
  > .v-list-group__items
  > .v-list-item {
  padding-left: 13px;
}
.selected-item {
  background-color: #db4c77;
}
.divider-color {
  background-color: #fff;
}
.v-application--is-ltr .v-divider--inset:not(.v-divider--vertical) {
  margin-left: 1px;
}
.v-divider--inset:not(.v-divider--vertical) {
  max-width: calc(100% - 0px);
}
.custom-app-bar .v-app-bar__content {
  border-radius: 10px !important;
}
.textWrapnav {
  white-space: normal;
  word-break: break-word;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

html {
  scrollbar-width: thin !important;
  scrollbar-color: #888 #f1f1f1 !important ;
}
.fixed-width-card {
  width: 45px !important;
  max-width: 45px !important;
  min-width: 45px !important;
}
</style>
