<template>
  <v-app :style="{ minHeight: '100vh' }">
    <!-- Loading Overlay -->
    <v-overlay
      v-model="isLoading"
      class="align-center justify-center"
      persistent
      opacity="0.9"
    >
      <v-card
        flat
        class="text-center pa-4"
        style="background: transparent !important"
      >
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
          class="mb-4"
        ></v-progress-circular>
        <div class="text-h6 text-white font-weight-medium">Loading .....</div>
        <div class="text-subtitle-2 text-white mt-2">
          Please wait while we connect
        </div>
      </v-card>
    </v-overlay>

    <!-- <v-app-bar
      v-if="signupwizard == false"
      app
      flat
      class="app-bar d-flex align-start px-2"
      height="50"
      elevation="2"
    >
      <v-img
        :src="StichhLogo"
        alt="Stichh Logo"
        max-width="150"
        height="42"
        class="ml-n4"
        contain
      />
      <v-img
        v-if="orgLogoUrl"
        :src="orgLogoUrl"
        alt="Org Logo"
        max-width="150"
        height="42"
        class="ml-n4"
        contain
      />
      <v-spacer></v-spacer>
   

      <v-btn icon class="ml-4">
        <v-avatar size="32" class="ml-4">
          <v-img
            :src="profileUrl ? profileUrl : require('@/assets/account.png')"
            alt="User Avatar"
          />
        </v-avatar>
      </v-btn>
      <div class="ml-2">
        <div class="text-left toolbar-headers font-weight-bold">
          <v-badge :color="$store.getters.GetmqqtColor" inline dot>
            {{ userEmail }}</v-badge
          >
        </div>

        <div class="text-left toolbar-headers">
          {{ userOrg }}
        </div>
      </div>
      <v-btn @click="sign_out_dailo()" icon>
        <v-icon color="primary">mdi-logout</v-icon>
      </v-btn>
    
    </v-app-bar> -->
    <!-- <UpdateProfileDetails
      :drawerVisible="drawerVisible"
      v-on:closeNav="drawerVisible = false"
      :profileUrl="profileUrl"
    /> -->
    <div class="layout-row d-flex">
      <v-navigation-drawer
        app
        permanent
        v-if="signupwizard == false"
        width="230"
        class="d-flex flex-column"
        style="background-color: #fafafa"
      >
        <!-- Fixed Logo Section -->
        <div class="logo-section">
          <v-img
            :src="orgLogoUrl || StichhLogo"
            :alt="orgLogoUrl ? 'Organization Logo' : 'Stichh Logo'"
            max-width="150"
            height="42"
            class="sidebar-logo"
            contain
          />
        </div>

        <!-- Scrollable Navigation List -->
        <div class="scrollable-nav-container">
          <v-list
            dense
            class="ml-n4 mr-2 pl-4"
            style="overflow-y: auto; height: 100%"
          >
            <div v-for="(item, index) in topNavList" :key="index">
              <v-list-item
                :class="{ 'active-nav-item': selectedNavItem === item }"
                :value="item"
                @click="navigate_routes(item)"
                link
                style="min-height: 44px; padding-top: 8px; padding-bottom: 8px"
                :active="selectedNavItem === item"
              >
                <div class="d-flex align-center">
                  <v-icon
                    size="20"
                    class="mr-4"
                    :color="
                      selectedNavItem === item ? 'white' : 'grey-darken-1'
                    "
                  >
                    {{ item.icon }}
                  </v-icon>
                  <v-list-item-title
                    :class="[
                      selectedNavItem === item
                        ? 'text-white font-weight-medium'
                        : 'text-grey-darken-2 font-weight-medium',
                      'text-no-wrap',
                    ]"
                    style="
                      font-size: 15px;
                      line-height: 1.4;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, sans-serif;
                      font-weight: 500;
                    "
                  >
                    <!-- {{ fetch_names(item.text, item) }} -->
                    {{ item.text }}
                  </v-list-item-title>
                </div>
              </v-list-item>
            </div>
            <!-- <div
            v-if="queryCheck != 1 && adminAppsList.length"
            class="mt-4 px-4 text-grey-darken-3 font-weight-bold text-subtitle-4 text-center"
            style="width: 100%"
          >
            Admin Apps
          </div>
          <template v-for="(item, index) in adminAppsList" :key="index">
            <v-list-item
              :class="{ 'active-nav-item': selectedNavItem === item }"
              :value="item"
              @click="navigate_routes(item)"
              link
              style="min-height: 44px; padding-top: 8px; padding-bottom: 8px"
            >
              <div class="d-flex align-center">
                <v-icon
                  size="22"
                  class="mr-4"
                  :color="
                    selectedNavItem === item ? 'white' : 'grey-darken-2'
                  "
                >
                  {{ item.icon }}
                </v-icon>
                <v-list-item-title
                  :class="[
                    selectedNavItem === item
                      ? 'text-white font-weight-medium'
                      : 'text-grey-darken-2 font-weight-medium',
                    'text-no-wrap',
                  ]"
                  style="font-size: 13px; line-height: 1.3"
                >
                  {{ fetch_names(item.text, item) }}
                </v-list-item-title>
              </div>
            </v-list-item>
          </template> -->
          </v-list>
        </div>
        <template v-slot:append>
          <div class="user-info-section">
            <div class="user-email" @click="sign_out()">
              <v-badge
                :color="$store.getters.GetmqqtColor"
                dot
                location="top right"
                :offset-x="-20"
                :offset-y="10"
              >
                <span class=""> {{ userEmail }}</span>
              </v-badge>
            </div>
            <div class="user-org">
              {{ userOrg }}
            </div>
            <v-btn
              block
              color="primary"
              variant="text"
              @click="sign_out_dailo()"
              class="logout-btn"
              size="small"
            >
              <v-icon left>mdi-logout</v-icon>
              Logout
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>

      <v-main class="main-content">
        <!-- <v-container style="background-color: #FFFFFF00; height: 100vh;" fluid> -->
        <router-view
          v-if="signupwizard == false"
          :chatList="chatList"
          :messageDataProp="messagedata"
          :channelDataProp="channelData"
          :notificationsData="notificationsData"
          v-on:publishsent="publishmessage"
        />
        <!-- </v-container> -->
        <!-- <v-container fluid>
        <v-card class="pa-4 rounded-xl elevation-2 fixed-card">
          <div class="scrollable-content">
            <router-view />
          </div>
        </v-card>
      </v-container> -->

        <div v-if="componentCheck == 1">
          <WizardNew
            :signupwizard="signupwizard"
            v-on:closeStep="close_wizard"
            v-on:completedStep="completed_vizard"
            @clicked="signupwizard = false"
          />
        </div>
        <div v-show="emailCheckText == true">
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

        <!-- Logout Confirmation Dialog -->
        <LogoutConfirmationDialog
          v-model="showLogoutDialog"
          @confirm="handleLogoutConfirm"
          @cancel="handleLogoutCancel"
        />
      </v-main>
    </div>
  </v-app>
</template>

<script>
/* eslint-disable */
// Imports
import WizardNew from "@/components/WizardComponents/WizardNew.vue";
import { get_current_details } from "@/mixins/GetCuurentUser.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import UpdateProfileDetails from "@/components/UserDialogs/UpdateProfileDetails";
import StichhLogo from "@/assets/StichhLogo_Hz_Blk.png";
import { openDB } from "idb";
import {} from "@/db.js";
import { connecttoMQTTMethod } from "@/mixins/MqttConnect.js";
import { initiateLocalCacheDB } from "@/db.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import LogoutPannel from "@/components/LogoutPannel.vue";
import LogoutConfirmationDialog from "@/components/LogoutConfirmationDialog.vue";
import { EventBus } from "@/main";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { Auth } from "aws-amplify";

export default {
  // Components
  components: {
    UpdateProfileDetails,
    StichhLogo,
    WizardNew,
    LogoutPannel,
    LogoutConfirmationDialog,
  },

  // Mixins
  mixins: [
    get_current_details,
    get_Org_details,
    connecttoMQTTMethod,
    initiateLocalCacheDB,
    get_all_org_users,
  ],

  // Data
  data() {
    return {
      // Boolean properties
      signupwizard: false,
      isLoading: true,
      emailCheckText: false,
      spinLoading: false,
      drawerVisible: false,
      showLogoutDialog: false,
      menuOpen: false,
      menuOpenAdmin: false,
      adminAppsExpanded: false,
      userAppsOpen: true,
      adminAppsOpen: true,

      // Number properties
      componentCheck: 0,
      queryCheck: 0,

      // Array properties
      notificationsData: [],
      chatList: [],
      currentNavList: [
        {
          icon: "mdi-home",
          text: "Home",
          router: "/home/DashboardView",
          abbreviation: "HOME",
          isActive: true,
        },
        {
          icon: "mdi-account-multiple-outline",
          text: "My Team",
          abbreviation: "TEAM",
          router: "/home/UserTeams",
          isActive: false,
        },
      ],
      adminAppsList: [],
      userAppsList: [],
      selectedNavList: [],

      // Object properties
      currentObject: {},
      rowInfo: {},
      userOrg: {},
      orgObject: {},

      // String properties
      userEmail: "",
      profileUrl: "",
      userName: "",
      orgLogoUrl: "",
      userProfile: "",
      StichhLogo,

      // Navigation properties
      navItem: null,
      usernavItem: null,
      adminNav: null,
      selectedNavItem: null,
    };
  },
  // Lifecycle hooks
  async created() {},

  async mounted() {
    this.isLoading = true;

    try {
      // Phase 1: Critical data fetching (must complete first)
      await this.loadCriticalData();

      // Phase 2: Hide loading and show UI immediately
      this.isLoading = false;

      // Phase 3: Defer non-essential operations
      this.loadNonEssentialData();
    } catch (error) {
      console.error("Error during initialization:", error);
      this.isLoading = false;
      // Handle error appropriately
    }
  },

  // Computed properties
  computed: {
    topNavList() {
      return [...this.currentNavList, ...this.userAppsList];
    },
  },
  // Methods
  methods: {
    // Dialog methods
    sign_out_dailo() {
      this.showLogoutDialog = true;
    },

    async handleLogoutConfirm() {
      this.disconnect();
      await Auth.signOut({ global: true });

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
      this.$store.commit("SetcustomerData", "");

      this.$router.push("/");
      this.$store.dispatch("logout");
    },

    handleLogoutCancel() {
      // Dialog will be closed automatically by the component
      console.log("Logout cancelled");
    },

    // Data loading methods
    async loadCriticalData() {
      // Load saved navigation state
      let savedNavItem = null;
      try {
        const raw = localStorage.getItem("selectedNavItem");
        if (raw) {
          savedNavItem = JSON.parse(raw);
        }
      } catch (e) {
        localStorage.removeItem("selectedNavItem");
      }

      // Initialize database and load essential cached data in parallel
      const [dbResult, notificationsData, chatList] = await Promise.all([
        this.ensureDatabaseInitialized(),
        this.getAllItems("STORE_NOTIFICATIONS_LIST"),
        this.getAllItems("STORE_CHAT_LIST"),
      ]);

      this.notificationsData = notificationsData;
      this.chatList = chatList;

      // Load critical user and org data in parallel
      await Promise.all([this.get_current_details(), this.get_Org_details()]);

      // Set up user data with proper error handling
      if (this.currentObject && this.currentObject.user) {
        this.profileUrl =
          this.currentObject.user.user_profile_pic_url == "N/A"
            ? null
            : this.currentObject.user.user_profile_pic_url;
        this.userName = this.currentObject.user.first_name;
        this.$store.commit("SetUserObj", this.currentObject);
      } else {
        console.warn("User data not available, redirecting to login");
        this.$router.push("/");
        return;
      }

      // Set up org data
      this.$store.commit("SetOrgDetails", this.orgDetails);
      this.orgObject = this.orgDetails;

      // Get organization logo signed URL
      await this.getOrgLogoUrl();

      // Process user permissions and navigation
      if (this.currentObject && this.currentObject.user) {
        await this.new_query_check(this.currentObject);
        await this.get_details();

        var data = this.currentObject;
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
          this.selectedNavList = this.currentNavList;
          this.queryCheck = 2;
        } else if (data.user.user_type == "MEMBER") {
          this.selectedNavList = this.currentNavList;
          this.queryCheck = 1;
        }

        // Set up navigation
        this.setupNavigation(savedNavItem);
      } else {
        console.warn("User data not available for navigation setup");
        this.$router.push("/");
        return;
      }
    },

    // Navigation setup methods
    setupNavigation(savedNavItem) {
      this.$store.commit("SetappName", "");

      const allNavItems = [
        ...this.currentNavList,
        ...this.userAppsList,
        ...this.adminAppsList,
      ];
      const currentPath = this.$route.path;
      let matchedItem = allNavItems.find((item) => item.router === currentPath);

      if (matchedItem) {
        this.selectedNavItem = matchedItem;
      } else if (savedNavItem) {
        this.selectedNavItem = savedNavItem;
        if (savedNavItem.router && savedNavItem.router !== currentPath) {
          this.$router.replace(savedNavItem.router);
        }
      } else {
        this.selectedNavItem = this.currentNavList[0];
        if (
          this.currentNavList[0] &&
          this.currentNavList[0].router !== currentPath
        ) {
          this.$router.replace(this.currentNavList[0].router);
        }
      }
    },

    // Non-essential data loading methods
    async loadNonEssentialData() {
      // Check if organization details are properly loaded
      if (!this.orgDetails || !this.orgDetails.organization) {
        return;
      }

      // Defer MQTT connection and other heavy operations
      setTimeout(async () => {
        try {
          await this.initializeMQTTConnection();
        } catch (error) {
          console.error("MQTT connection failed:", error);
        }
      }, 100);

      // Load org users in background
      // setTimeout(async () => {
      //   try {
      //     await this.get_all_org_users();
      //   } catch (error) {
      //     console.error('Failed to load org users:', error);
      //   }
      // }, 200);
    },

    // Initialize MQTT connection
    async initializeMQTTConnection() {
      // Check if currentObject and user data are available
      if (!this.currentObject || !this.currentObject.user) {
        console.warn("User data not available for MQTT connection");
        return;
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
        this.currentObject.organization.organization_display_id +
        "OPENCHANNELS";

      // Connect to MQTT
      await this.connecttoMQTTMethod(
        `wss://broker.stichh.com:9002/mqtt`,
        clientdata.user_name,
        clientdata.password,
        topicid
      );

      // Subscribe to topics
      this.subscribeToTopicMethod(notificationTopic);
      this.subscribeToTopicMethod(taskTopic);
      this.subscribeToTopicMethod(pendingTopic);
      this.subscribeToTopicMethod(logoutuser);
      this.subscribeToTopicMethod(restrictedChannels);
      this.subscribeToTopicMethod(openChannelTopic);

      // Subscribe to user-specific topics if org users are loaded

      await this.get_all_org_users();
      // console.log(this.orgUsers, 'this.orgUsers');
      setTimeout(() => {
        if (this.orgUsers && this.orgUsers.length > 0) {
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
          //  console.log(combinedArray, 'combinedArray');
          for (let i = 0; i < combinedArray.length; i++) {
            this.subscribeToTopicMethod(combinedArray[i]);
          }
        }
      }, 10000);
    },

    // Wizard methods
    completed_vizard() {
      this.componentCheck = 0;
      this.signupwizard = false;

      var path = this.$route.path;
      if (path !== "/home/DashboardView") {
        this.$router.push("/home/DashboardView").then(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    },

    close_wizard() {
      this.signupwizard = false;
    },

    // Authentication methods
    async sign_out() {
      this.emailCheckText = true;
      EventBus.$emit("toggleDrawer");
    },
    // Navigation and display methods
    fetch_names(value, value2) {
      if (value2.dashboard_unique_type == "QABM_USERS") {
        return "Quotation/Billing";
      } else if (value2.dashboard_unique_type == "SAIM_USERS") {
        return "Stock/Inventory";
      } else if (value2.dashboard_unique_type == "PREZENCE_ADMINS") {
        return "Attendance/Presence";
      } else if (value2.dashboard_unique_type == "BOOKING_SLOT_ADMINS") {
        return "Slot Booking";
      } else if (value2.dashboard_unique_type == "DIRECTORY_USER") {
        return "Directories";
      } else if (value2.dashboard_unique_type == "DASHBOARD_MANAGEMENT") {
        return "Dashboards";
      } else if (value2.dashboard_unique_type == "PROJECT_USER") {
        return "Projects";
      } else if (
        value2.dashboard_unique_type == "ASSETS_ADMIN" ||
        value2.dashboard_unique_type == "ASSETS_USER"
      ) {
        return "Assets";
      } else if (value2.dashboard_unique_type == "EXPENSE_ADMINS") {
        return "Expenses";
      } else if (value2.dashboard_unique_type == "FORMS_ADMINS") {
        return "Forms";
      } else if (value2.dashboard_unique_type == "TIMESHEET_ADMINS") {
        return "Timesheet";
      } else if (value == "Workflow Administration") {
        return "Workflows";
      } else if (value2.dashboard_unique_type == "GUESTHOUSE_ADMIN") {
        return "Guest House ";
      } else if (value2.dashboard_unique_type == "TICKET_MANAGEMENT") {
        return "Ticket";
      } else if (value2.dashboard_unique_type == "LOADOPT_USER") {
        return "Vehicle Optimizer";
      } else if (value2.dashboard_unique_type == "EVENTS_ADMINS") {
        return "Events";
      } else if (value2.dashboard_unique_type == "LOADOPT_ADMIN") {
        return "Tasks";
      } else if (
        value2.dashboard_unique_type == "TICKET_TECHNICIAN_MANAGEMENT_ADMINS"
      ) {
        return "Tickets Technician";
      } else if (value2.dashboard_unique_type == "TICKET_MANAGEMENT_ADMINS") {
        return "Tickets ";
      } else if (value2.dashboard_unique_type == "CUSTOMERS_ADMINS") {
        return "Customers";
      }
      // else if(value2.das)
      else {
        return value;
      }
    },
    // MQTT and communication methods
    publishmessage(val) {
      this.publishMethod(val.team_topic_id, val.message);
    },
    // Navigation routing methods
    setNav(index, type, item) {
      if (type === "main") {
        this.navItem = index;
        this.usernavItem = null;
        this.adminNav = null;
      } else if (type === "user") {
        this.navItem = null;
        this.usernavItem = index;
        this.adminNav = null;
      } else if (type === "admin") {
        this.navItem = null;
        this.usernavItem = null;
        this.adminNav = index;
      }
      this.navigate_routes(item);
    },

    navigate_routes(item) {
      this.menuOpen = false;
      this.menuOpenAdmin = false;
      this.emailCheckText = false;
      this.selectedNavItem = item;
      this.$router.push(item.router);
      localStorage.setItem("selectedNavItem", JSON.stringify(item));
      this.$store.commit("SetappName", item.text);
      localStorage.setItem("quotationToggle", "quotations");
      this.$store.commit("SetdragCheck", false);
      const existingItem = this.selectedNavList.find(
        (navItem) => navItem.text === item.text
      );
      if (!existingItem) {
        this.selectedNavList.forEach((navItem) => {
          navItem.isActive = navItem === item;
        });
      } else {
        this.selectedNavList.forEach((navItem) => {
          navItem.isActive = navItem === existingItem;
        });
      }
    },

    // App management and query methods
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
        dashboard_name: "Workflows",
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
      let settingsObj = {
        dashboard_name: "Settings",
        app_abbreviation: "Settings",
        dashboard_description: "Admin Settings",
        is_visible: true,
        dashboard_unique_type: "admin_settings",
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
          // teamObjadmins,
          approvalObjadmins,
          // customersCreation,
          settingsObj
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
      this.userAppsList = this.userAppsList.concat(this.adminAppsList);
      this.userAppsList = this.userAppsList.filter(Boolean).sort((a, b) => {
        // Move Settings to the end
        if (a.text === "Settings") return 1;
        if (b.text === "Settings") return -1;
        return a.text.localeCompare(b.text);
      });
    },

    // User details and management methods
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
      // this.profileUrl =
      //   data.user.user_profile_pic_url == "N/A"
      //     ? null
      //     : data.user.user_profile_pic_url;
      // this.componentCheck = 1;
      // this.signupwizard = true;
      var path = this.$route.path;
      if (data.user.is_portal_login == true) {
        this.componentCheck = 1;
        this.signupwizard = true;
      } else if (data.user.is_portal_login == undefined && path == "/home") {
        this.$router.push("/home/UserForms");
        // this.$router.push("UserForms");
        this.spinLoading = false;
      } else {
        this.spinLoading = false;
      }
    },

    // App fetching and processing methods
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
          dashboard_unique_type: element.dashboard_unique_type,
        });
      });
      if (this.userAppsList.length != 0) {
        const exist = this.userAppsList.find(
          (item) => item.dashboard_unique_type == "PREZENCE"
        );

        if (exist == undefined) {
          const userObj = this.currentObject;
          if (
            !userObj ||
            !userObj.admin_apps ||
            !Array.isArray(userObj.admin_apps)
          ) {
            return;
          }

          const adminExists = userObj.admin_apps.find(
            (app) => app.dashboard_unique_type === "PREZENCE_ADMINS"
          );

          const adminAppExists =
            adminExists &&
            (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
              adminExists.app_usage_level === "WEB_ONLY") &&
            adminExists.is_dashboard_admin === true &&
            adminExists.is_visible === true;
          if (adminAppExists) {
            // console.log(adminExists, "adminExists");
            this.userAppsList.push({
              icon: this.fecth_icons(adminExists),
              text: adminExists.dashboard_name,
              router: this.fecth_router(adminExists),
              abbreviation:
                adminExists.app_abbreviation === "N/A"
                  ? this.get_abbreviation(adminExists)
                  : adminExists.app_abbreviation,
              isActive: false,
              dashboard_unique_type: adminExists.dashboard_unique_type,
            });
          }
        }
        const exist2 = this.userAppsList.find(
          (item) => item.dashboard_unique_type == "ASSETS_USER"
        );
        if (exist2 == undefined) {
          const userObj = this.currentObject;
          if (
            !userObj ||
            !userObj.admin_apps ||
            !Array.isArray(userObj.admin_apps)
          ) {
            return;
          }
          const adminExists = userObj.admin_apps.find(
            (app) => app.dashboard_unique_type === "ASSETS_ADMIN"
          );
          const adminAppExists =
            adminExists &&
            (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
              adminExists.app_usage_level === "WEB_ONLY") &&
            adminExists.is_dashboard_admin === true &&
            adminExists.is_visible === true;
          if (adminAppExists) {
            this.userAppsList.push({
              icon: this.fecth_icons(adminExists),
              text: adminExists.dashboard_name,
              router: this.fecth_router(adminExists),
              abbreviation:
                adminExists.app_abbreviation === "N/A"
                  ? this.get_abbreviation(adminExists)
                  : adminExists.app_abbreviation,
              isActive: false,
              dashboard_unique_type: adminExists.dashboard_unique_type,
            });
          }
        }
        const exist3 = this.userAppsList.find(
          (item) => item.dashboard_unique_type == "EVENTS"
        );
        if (exist3 == undefined) {
          const userObj = this.currentObject;
          if (
            !userObj ||
            !userObj.admin_apps ||
            !Array.isArray(userObj.admin_apps)
          ) {
            return;
          }
          const adminExists = userObj.admin_apps.find(
            (app) => app.dashboard_unique_type === "EVENTS_ADMINS"
          );
          const adminAppExists =
            adminExists &&
            (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
              adminExists.app_usage_level === "WEB_ONLY") &&
            adminExists.is_dashboard_admin === true &&
            adminExists.is_visible === true;

          if (adminAppExists) {
            this.userAppsList.push({
              icon: this.fecth_icons(adminExists),
              text: adminExists.dashboard_name,
              router: this.fecth_router(adminExists),
              abbreviation:
                adminExists.app_abbreviation === "N/A"
                  ? this.get_abbreviation(adminExists)
                  : adminExists.app_abbreviation,
              isActive: false,
              dashboard_unique_type: adminExists.dashboard_unique_type,
            });
          }
        }
        const exist4 = this.userAppsList.find(
          (item) => item.dashboard_unique_type == "EXPENSE"
        );
        if (exist4 == undefined) {
          const userObj = this.currentObject;
          if (
            !userObj ||
            !userObj.admin_apps ||
            !Array.isArray(userObj.admin_apps)
          ) {
            return;
          }
          const adminExists = userObj.admin_apps.find(
            (app) => app.dashboard_unique_type === "EXPENSE_ADMINS"
          );
          const adminAppExists =
            adminExists &&
            (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
              adminExists.app_usage_level === "WEB_ONLY") &&
            adminExists.is_dashboard_admin === true &&
            adminExists.is_visible === true;
          if (adminAppExists) {
            this.userAppsList.push({
              icon: this.fecth_icons(adminExists),
              text: adminExists.dashboard_name,
              router: this.fecth_router(adminExists),
              abbreviation:
                adminExists.app_abbreviation === "N/A"
                  ? this.get_abbreviation(adminExists)
                  : adminExists.app_abbreviation,
              isActive: false,
              dashboard_unique_type: adminExists.dashboard_unique_type,
            });
          }
        }
        const exist5 = this.userAppsList.find(
          (item) => item.dashboard_unique_type == "BOOKING_SLOT"
        );
        if (exist5 == undefined) {
          const userObj = this.currentObject;
          if (
            !userObj ||
            !userObj.admin_apps ||
            !Array.isArray(userObj.admin_apps)
          ) {
            return;
          }
          const adminExists = userObj.admin_apps.find(
            (app) => app.dashboard_unique_type === "BOOKING_SLOT_ADMINS"
          );
          const adminAppExists =
            adminExists &&
            (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
              adminExists.app_usage_level === "WEB_ONLY") &&
            adminExists.is_dashboard_admin === true &&
            adminExists.is_visible === true;
          if (adminAppExists) {
            this.userAppsList.push({
              icon: this.fecth_icons(adminExists),
              text: adminExists.dashboard_name,
              router: this.fecth_router(adminExists),
              abbreviation:
                adminExists.app_abbreviation === "N/A"
                  ? this.get_abbreviation(adminExists)
                  : adminExists.app_abbreviation,
              isActive: false,
              dashboard_unique_type: adminExists.dashboard_unique_type,
            });
          }
        }
        const exist6 = this.userAppsList.find(
          (item) => item.dashboard_unique_type == "TIMESHEET_USER"
        );
        if (exist6 == undefined) {
          const userObj = this.currentObject;
          if (
            !userObj ||
            !userObj.admin_apps ||
            !Array.isArray(userObj.admin_apps)
          ) {
            return;
          }
          const adminExists = userObj.admin_apps.find(
            (app) => app.dashboard_unique_type === "TIMESHEET_ADMINS"
          );
          const adminAppExists =
            adminExists &&
            (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
              adminExists.app_usage_level === "WEB_ONLY") &&
            adminExists.is_dashboard_admin === true &&
            adminExists.is_visible === true;
          if (adminAppExists) {
            this.userAppsList.push({
              icon: this.fecth_icons(adminExists),
              text: adminExists.dashboard_name,
              router: this.fecth_router(adminExists),
              abbreviation:
                adminExists.app_abbreviation === "N/A"
                  ? this.get_abbreviation(adminExists)
                  : adminExists.app_abbreviation,
              isActive: false,
              dashboard_unique_type: adminExists.dashboard_unique_type,
            });
          }
        }
      }
      // console.log(this.userAppsList, "this.userAppsList");
      this.userAppsList = this.userAppsList
        .filter(Boolean)
        .sort((a, b) => a.text.localeCompare(b.text));
      this.selectedNavList = this.userAppsList;
    },

    // Admin app management methods
    fetch_admin_apps(value) {
      // console.log("adminAppsList",value);
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
          dashboard_unique_type: element.dashboard_unique_type,
        });
      });
      this.adminAppsList = this.adminAppsList.filter(Boolean).sort((a, b) => {
        // Move Settings to the end
        if (a.text === "Settings") return 1;
        if (b.text === "Settings") return -1;
        return a.text.localeCompare(b.text);
      });
      // console.log(this.adminAppsList,"this.adminAppsList");
      this.adminAppsList = this.adminAppsList.filter(
        (item) => item.dashboard_unique_type != "PREZENCE_ADMINS"
      );
      this.adminAppsList = this.adminAppsList.filter(
        (item) => item.dashboard_unique_type != "ASSETS_ADMIN"
      );
      this.adminAppsList = this.adminAppsList.filter(
        (item) => item.dashboard_unique_type != "EVENTS_ADMINS"
      );
      this.adminAppsList = this.adminAppsList.filter(
        (item) => item.dashboard_unique_type != "EXPENSE_ADMINS"
      );
      this.adminAppsList = this.adminAppsList.filter(
        (item) => item.dashboard_unique_type != "BOOKING_SLOT_ADMINS"
      );
      this.adminAppsList = this.adminAppsList.filter(
        (item) => item.dashboard_unique_type != "TIMESHEET_ADMINS"
      );
      this.selectedNavList = this.adminAppsList;
      // console.log(this.adminAppsList, "this.selectedNavList");
    },

    // open_profile_dialogue() {
    //   // alert(4);
    //   this.componentCheck = 1;
    //   this.drawerVisible = true;
    // },

    // Icon and abbreviation methods
    fecth_icons(element) {
      //    console.log(element.dashboard_unique_type,'element');
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
        case "REPORTS_ADMIN":
          return "mdi-chart-box";
        case "admin_settings":
          return "mdi-cog";
        case "CHECKLIST_ADMIN":
          return "mdi-format-list-checks";
        case "WEBBUILDER_ADMIN":
          return "mdi-web";
        case "REWARDS_MANAGEMENT_ADMINS":
          return "mdi-gift";
        case "CUSTOMERS_ADMINS":
          return "mdi-account-multiple";
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
        case "ORDMG_USERS":
          return "ORDER";
        case "REWARDS_MANAGEMENT_ADMINS":
          return "REWAR";
        case "CUSTOMERS_ADMINS":
          return "CUSTO";
        default:
          break;
      }
    },
    // Router and path methods
    fecth_router(element) {
      return `/home${this.getDashboardPath(element.dashboard_unique_type)}`;
    },
    getDashboardPath(dashboardType) {
      switch (dashboardType) {
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
          return "/UserTransaction";

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
          return "/SalesModule";
        case "QABM_USERS":
          return "/SalesModule";
        case "VNDR_USERS":
          return "/vendors";
        case "SAIM_USERS":
          return "/Inventory";
        case "ORDMG_USERS":
          return "/OrdersList";
        case "customer_repository":
          return "/CustomersList";
        case "admin_settings":
          return "/AdministrationPannel";
        case "CHECKLIST_ADMIN":
          return "/CheckList";
        case "WEBBUILDER_ADMIN":
          return "/WebSiteBuilder";
        case "REWARDS_MANAGEMENT_ADMINS":
          return "/RewardsManagement";
        case "CUSTOMERS_ADMINS":
          return "/CustomersList";
        default:
          break;
      }
    },

    // Utility methods
    disconnect() {
      this.disconnectmqqt();
    },

    close_func() {
      this.emailCheckText = false;
    },

    success_func() {
      this.emailCheckText = false;
      this.get_current_details();
    },

    unsubcribecall(val) {
      // this.unsubscribeToTopicMethod(val);
    },

    // Organization and asset methods
    async getOrgLogoUrl() {
      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        if (
          !orgDetails ||
          !orgDetails.organization ||
          !orgDetails.organization.organization_logo
        ) {
          // console.log("No organization logo found");
          this.orgLogoUrl = null;
          return;
        }

        const rawUrl = orgDetails.organization.organization_logo;
        // console.log("Organization Logo URL:", rawUrl);

        if (rawUrl === "N/A" || rawUrl === "" || rawUrl.includes("/N/A")) {
          // console.log("Organization logo is N/A or empty");
          this.orgLogoUrl = null;
          return;
        }

        const details = this.$store.getters.GetOrgDetails;
        if (!details || !details.s3_details) {
          // console.log("Missing S3 details");
          this.orgLogoUrl = null;
          return;
        }

        const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
        // console.log("Signed URL for org logo:", signedUrl);
        this.orgLogoUrl = signedUrl;
      } catch (error) {
        console.error("Error getting organization logo signed URL:", error);
        this.orgLogoUrl = null;
      }
    },
  },
};
</script>

<style scoped>
/* Logo Section Styles */
.logo-section {
  padding: 20px 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sidebar-logo {
  max-width: 150px;
  height: 42px;
}

.scrollable-nav-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.user-info-section {
  padding: 0;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
  flex-shrink: 0;
}

.user-email {
  margin-bottom: 2px;
  margin-left: 0 !important;
  padding-left: 0 !important;
  cursor: pointer;
  transition: opacity 0.2s ease;
  overflow-wrap: break-word;
  word-wrap: break-word;
  max-width: 100%;
  text-align: left;
  padding: 16px 16px 8px 16px !important;
}

.user-email:hover {
  opacity: 0.8;
}

.user-email .v-badge {
  font-size: 15px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
  word-break: break-all;
  white-space: normal;
  line-height: 1.4;
  text-align: left;
  justify-content: flex-start;
  display: flex;
  margin: 0 !important;
  padding: 0 !important;
}

.user-email .v-badge__content {
  margin: 0 !important;
  padding: 0 !important;
}

.user-org {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 400;
  color: #666;
  margin: 0 0 8px 0 !important;
  padding: 0 16px 8px 16px !important;
  text-align: left;
}

.logout-btn {
  font-size: 14px !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 32px !important;
  min-height: 32px !important;
  margin: 0 16px 16px 16px !important;
}

/* Navigation Styles */
.active-nav-item {
  background-color: #10559a;
  border-radius: 15px !important;
  transition: background-color 0.2s;
}

.drawer-item {
  display: flex;
  align-items: center;
}

.logo-style {
  font-size: 1.4rem;
  font-family: "Lucida Handwriting", cursive;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.v-list-item:not(.active-nav-item):hover {
  background-color: #f5f7fa !important;
  transition: background-color 0.2s;
  cursor: pointer;
}

/* Add loading overlay styles */
.v-overlay {
  z-index: 9999 !important;
}

.v-overlay__content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.v-card {
  backdrop-filter: blur(8px);
  border-radius: 16px !important;
}
</style>
