<template>
  <div>
    <!-- ===== Toolbar (UNCHANGED) ===== -->
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />

    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-view-dashboard</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Home</span>
          <span class="header-subtitle">
            Overview of your workflows and activities
          </span>
        </div>
      </div>

      <v-spacer />

      <v-tooltip text="Take a screenshot and raise a ticket">
        <template #activator="{ props }">
          <v-btn icon flat v-bind="props" @click="TakeScreenshot">
            <v-icon size="30" color="primary">mdi-help-box</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-app-bar>

    <!-- ===== Dashboard Body ===== -->
    <v-card flat class="dashboard-root" :height="windowHeight">
      <v-card-text class="pa-0">
        <!-- ===== Welcome Banner ===== -->
        <v-card class="welcome-banner mb-8 mt-6" elevation="0">
          <div class="welcome-inner">
            <div>
              <h2 class="welcome-title">Welcome to Stichh</h2>
              <p class="welcome-subtitle">
                Manage your enterprise workflows with precision and ease.
              </p>
            </div>

            <!-- Right side -->
            <div class="banner-right">
              <v-img :src="StichhLogo" class="banner-logo mr-4" contain />

              <div class="store-buttons mt-4">
                <span variant="text" class="mr-4" rounded>
                  <v-icon left size="18">mdi-google-play</v-icon>
                  Play Store
                </span>

                <span variant="text" class="mr-2"  rounded>
                  <v-icon left size="18">mdi-apple</v-icon>
                  App Store
                </span>
              </div>
            </div>
          </div>
        </v-card>

        <!-- ===== Stats Cards ===== -->
        <v-row class="mt-4" dense>
          <!-- Pending -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="modern-card" @click="pending_form">
              <div class="card-top">
                <div class="icon-wrap pink">
                  <v-icon size="20">mdi-file-clock-outline</v-icon>
                </div>

                <!-- 🔥 COUNT TOP RIGHT -->
                <div class="count-badge">
                  {{ pedningData.pendingcount ? pedningData.pendingcount : 0 }}
                </div>
              </div>

              <div class="card-content">
                <h3>Pending Workflows</h3>
                <p>Workflows awaiting your action</p>
              </div>
            </v-card>
          </v-col>

          <!-- Submitted -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="modern-card" @click="submitted_form">
              <div class="card-top">
                <div class="icon-wrap yellow">
                  <v-icon size="20">mdi-file-check-outline</v-icon>
                </div>
              </div>

              <div class="card-content">
                <h3>Submitted Workflows</h3>
                <p>Your submitted workflow requests</p>
              </div>
            </v-card>
          </v-col>

          <!-- Participated -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="modern-card" @click="participated_form">
              <div class="card-top">
                <div class="icon-wrap blue">
                  <v-icon size="20">mdi-file-document-multiple-outline</v-icon>
                </div>
              </div>

              <div class="card-content">
                <h3>Participated Workflows</h3>
                <p>Workflows you've participated in</p>
              </div>
            </v-card>
          </v-col>

          <!-- Initiate -->
          <v-col cols="12" sm="6" md="3">
            <v-card class="modern-card" @click="initiate_form">
              <div class="card-top">
                <div class="icon-wrap green">
                  <v-icon size="20">mdi-plus-box-outline</v-icon>
                </div>
              </div>

              <div class="card-content">
                <h3>Initiate Workflow</h3>
                <p>Start a new workflow process</p>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <h3 class="section-title mt-6 ml-2">
          <v-icon size="18" color="secondary" class="mr-1">mdi-flash</v-icon>
          Quick Actions
        </h3>

        <!-- ===== Quick Actions ===== -->
        <v-card class="quick-actions-card mt-8" elevation="0">
          <div class="quick-actions-grid">
            <div
              v-for="action in quickActionsList"
              :key="action.actionType"
              class="quick-action-item soft-hover"
              @click="quickAction(action.actionType)"
            >
              <div :class="['qa-icon', action.color]">
                <v-icon color="white">{{ action.icon }}</v-icon>
              </div>
              <p class="qa-text">{{ action.text }}</p>
            </div>
          </div>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
// Imports
import { get_org_dashboard_data } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import OverlayComp from "@/components/OverlayComp.vue";
import { mapGetters } from "vuex";
import { format } from "date-fns";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import UpgradeDialog from "@/components/AdminApps/UpgradeDialog.vue";
import CreateExternalTicketDialog from "@/components/Tickets/CreateExternalTicketDialog.vue";
import html2canvas from "html2canvas";
import StichhLogo from "@/assets/stichhlog-white.png";

// Mixins
import { get_all_users } from "@/mixins/GetAllUsers.js";

export default {
  // Components
  components: {
    OverlayComp,
    UpgradeDialog,
    CreateExternalTicketDialog,
  },

  // Mixins
  mixins: [get_all_users],

  // Props
  props: {
    chatList: {
      type: Array,
      default: () => [], // set a default value here if needed
    },
    channelDataProp: {
      type: Array,
      default: () => [],
    },
    messageDataProp: {
      type: Array,
      default: () => [],
    },
  },

  // Data
  data() {
    return {
      // String properties
      pendingCount: "",
      myteamCount: "",
      billingType: "",

      // Object properties
      lastNotification: null,
      selectedChannel: null,
      tasksTab: null,

      // Array properties
      listItems: [],
      storednotifications: [],
      tableData: [],
      headers: [
        {
          text: "Initiated By",
          value: "body.data.msg_sent_by",
          sortable: false,
        },
        // { text: "User", value: "form_unique_type", sortable: false },
        {
          text: "Initiated On",
          value: "body.data.msg_created_on",
          sortable: false,
        },
        {
          text: "Message",
          value: "messageTitle",
          sortable: false,
        },
      ],

      // Boolean properties
      overlay: false,
      tableLoading: false,
      notificationTab: false,
      showLoaders: true,
      dataReady: false,
      showUpgradeDialog: false,
      DialogCreateTicket: false,

      // Null values
      ScreenshotFile: null,

      // Number properties
      submittedWorkflowsCount: 0,
      participatedWorkflowsCount: 0,
      componentCheck: 0,
      windowHeight: 0,
      cardContentHeight: 0,

      SnackBarComponent: {},
      StichhLogo,
      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  // Lifecycle hooks
  async created() {
    this.windowHeight = window.innerHeight - 80;
    await this.get_all_users();

    // var data = JSON.parse(localStorage.getItem("notoficationItems"));
    // this.listItems = data;

    // await this.fetch_dashboard_details();
  },

  mounted() {
    this.$store.commit("SetappName", "Home");
    this.$store.commit("Setappicon", "mdi-home");

    // Start fast loading check
    this.checkDataReady();

    // Set billing type with proper null checks
    this.setBillingType();
  },

  // Watchers
  watch: {
    // Watch for channel data changes to set default selected channel
    recentChannels: {
      handler(newChannels) {
        if (newChannels.length > 0 && !this.selectedChannel) {
          this.selectChannel(newChannels[0]);
        }
      },
      immediate: true,
    },
    // Watch for organization details to set billing type
    "$store.getters.GetOrgDetails": {
      handler(newOrgDetails) {
        if (newOrgDetails && newOrgDetails.organization) {
          this.setBillingType();
        }
      },
      deep: true,
      immediate: true,
    },
  },

  // Computed properties
  computed: {
    currentDate() {
      return format(new Date(), "dd-MM-yyyy"); // Returns current date in dd-MM-yyyy format
    },
    ...mapGetters([
      "getNotifications",
      "getTaskData",
      "getPendingInfo",
      "getOpenRestChanel",
      "getChatMsg",
    ]),
    notifications() {
      return {
        noticount:
          this.getNotifications.length != 0 ? this.getNotifications.length : 0, // Get the count of messages
        notificationmsg:
          this.getNotifications.length != 0
            ? this.getNotifications[this.getNotifications.length - 1] // Get the last message
            : {},
      };
    },

    pedningData() {
      return this.getPendingInfo.length != 0 ? this.getPendingInfo[0] : {};
    },

    totalNewMessages() {
      return this.chatList.reduce(
        (total, user) => total + (user.newMessageCount || 0),
        0
      );
    },
    totalChannelMessages() {
      return this.channelDataProp.reduce(
        (total, user) => total + (user.newMessageCount || 0),
        0
      );
    },

    chatListWithNames() {
      return this.chatList.map((chat) => {
        let displayName = this.getUserName(chat);
        return { ...chat, displayName };
      });
    },
    // Channel related computed properties
    recentChannels() {
      // Use the channelData prop and process it like in ChannelsMqqt
      if (!this.channelDataProp || this.channelDataProp.length === 0) {
        return [];
      }

      // Create a processed copy of channels with message data
      const processedChannels = this.channelDataProp.map((channel) => {
        const channelCopy = { ...channel };
        const messageData = this.messageDataProp.find(
          (item) => item.topic === channel.team_topic_id
        );

        // Initialize default values
        if (channelCopy.newMessageCount === undefined) {
          channelCopy.newMessageCount = 0;
        }

        if (messageData && messageData.data && messageData.data.length > 0) {
          const lastMessage = messageData.data[messageData.data.length - 1];
          channelCopy.last_message_on = lastMessage.msg_created_on;
          channelCopy.previous_message =
            lastMessage.msg_title || lastMessage.msg_payload || "";
          channelCopy.msg_type = lastMessage.msg_type || "TEXT";
        } else {
          // Set default values if no messages
          if (!channelCopy.last_message_on) {
            channelCopy.last_message_on = channelCopy.team_created_on;
          }
          if (!channelCopy.previous_message) {
            channelCopy.previous_message = "No messages yet";
          }
          if (!channelCopy.msg_type) {
            channelCopy.msg_type = "TEXT";
          }
        }

        return channelCopy;
      });

      // Sort by last message date or creation date (most recent first)
      processedChannels.sort((a, b) => {
        const aDate = a.last_message_on
          ? new Date(a.last_message_on)
          : new Date(a.team_created_on);
        const bDate = b.last_message_on
          ? new Date(b.last_message_on)
          : new Date(b.team_created_on);
        return bDate - aDate;
      });

      // Return the most recent 4 channels
      return processedChannels.slice(0, 4);
    },
    selectedChannelMessages() {
      if (!this.selectedChannel) return [];

      // Find messages for the selected channel from messageDataProp
      const channelMessages = this.messageDataProp.find(
        (item) => item.topic === this.selectedChannel.team_topic_id
      );

      if (channelMessages && channelMessages.data) {
        // Sort by creation date (newest first) and return unique messages
        const uniqueMessages = Array.from(
          new Map(
            channelMessages.data.map((item) => [item.msg_id, item])
          ).values()
        );
        return uniqueMessages.sort(
          (a, b) => new Date(b.msg_created_on) - new Date(a.msg_created_on)
        );
      }

      return [];
    },
    // Dynamic Quick Actions based on available apps
    quickActionsList() {
      const userObj = this.$store.getters.GetUserObj;
      if (!userObj) return [];

      const availableApps = [];

      // Add Chats as first action (always available)
      // availableApps.push({
      //   actionType: "chats",
      //   text: "Chats",
      //   icon: "mdi-chat-outline",
      //   color: "bg-blue",
      //   route: "/home/Chats",
      // });

      // Get user apps from store or build dynamically
      let userApps = [];

      // Check if userApps exist in user object
      if (userObj.user_apps && Array.isArray(userObj.user_apps)) {
        userApps = userObj.user_apps.filter(
          (item) =>
            item.is_visible &&
            (item.app_usage_level === "WEB_PHONE_ONLY" ||
              item.app_usage_level === "WEB_ONLY")
        );
      }

      // Add admin apps that should be available to users
      if (userObj.admin_apps && Array.isArray(userObj.admin_apps)) {
        const adminApps = userObj.admin_apps.filter(
          (item) =>
            item.is_visible &&
            item.is_dashboard_admin &&
            (item.app_usage_level === "WEB_PHONE_ONLY" ||
              item.app_usage_level === "WEB_ONLY")
        );

        // Add specific admin apps that should be in quick actions
        const quickActionTypes = [
          "EVENTS_ADMINS",
          "EXPENSE_ADMINS",
          "ASSETS_ADMIN",
          "TIMESHEET_ADMINS",
          "DIRECTORY_USER",
          "FORMS_ADMINS",
          "TICKET_MANAGEMENT_ADMINS",
          "BOOKING_SLOT_ADMINS",
          "PREZENCE_ADMINS",
          "PROJECT_USER",
          "COLLATERALS",
          "DASHBOARD_MANAGEMENT",
        ];

        quickActionTypes.forEach((type) => {
          const adminApp = adminApps.find(
            (app) => app.dashboard_unique_type === type
          );
          if (adminApp) {
            const actionConfig = this.getQuickActionConfig(
              adminApp.dashboard_unique_type
            );
            if (actionConfig) {
              availableApps.push(actionConfig);
            }
          }
        });
      }

      // Add user apps that should be in quick actions
      const userQuickActionTypes = [
        "EVENTS",
        "EXPENSE",
        "ASSETS_USER",
        "TIMESHEET_USER",
        "DIRECTORY_USER",
        "FORMS_ADMINS",
        "TICKET_MANAGEMENT",
        "BOOKING_SLOT",
        "PREZENCE",
        "PROJECT_USER",
        "COLLATERALS",
        "DASHBOARD_MANAGEMENT",
        "PAYROLL",
        "AP_AR_USER",
        "GUESTHOUSE_USER",
        "QABM_USERS",
        "SAIM_USERS",
        "VNDR_USERS",
        "ORDMG_USERS",
      ];

      userQuickActionTypes.forEach((type) => {
        const userApp = userApps.find(
          (app) => app.dashboard_unique_type === type
        );
        if (userApp) {
          const actionConfig = this.getQuickActionConfig(
            userApp.dashboard_unique_type
          );
          if (actionConfig) {
            availableApps.push(actionConfig);
          }
        }
      });

      // Remove duplicates and ensure minimum 5 items
      const uniqueApps = availableApps.filter(
        (app, index, self) =>
          index === self.findIndex((t) => t.actionType === app.actionType)
      );

      // Return exactly 5 items maximum (only apps user has access to)
      return uniqueApps.slice(0, 5);
    },
  },

  // Methods
  methods: {
    getTaskStatusColor(status) {
      if (status === "COMPLETED") return "green";
      if (status === "IN PROGRESS") return "orange";
      return "grey";
    },
    getBadgeSizeClass(count) {
      return count && count.toString().length === 1
        ? "fixed-badge small-badge"
        : "fixed-badge auto-badge";
    },
    fetch_channel(value) {
      // console.log(value);
      return value.replace(/<[^>]*>?/gm, "");
    },
    initiate_form() {
      this.$store.commit("SetappName", "Initiate");
      this.$store.commit("Setappicon", "mdi-timelapse");
      this.$router.push("/home/UserForms");
    },

    pending_form() {
      this.$store.commit("SetappName", "Pending");
      this.$store.commit("Setappicon", "mdi-timelapse");
      this.$router.push("/home/PendingList");
    },

    submitted_form() {
      this.$store.commit("SetappName", "Submitted");
      this.$store.commit("Setappicon", "mdi-timelapse");
      this.$router.push("/home/SubmitedList");
    },

    participated_form() {
      this.$store.commit("SetappName", "Participated");
      this.$store.commit("Setappicon", "mdi-timelapse");
      this.$router.push("/home/ParticipatedList");
    },

    myteam_form() {
      this.$router.push("/home/UserTeams");
    },

    navigate_routes(value) {
      this.$router.push(value);
    },

    async fetch_dashboard_details() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_org_dashboard_data, {})
        );
        var response = JSON.parse(result.data.get_org_dashboard_data);
        this.overlay = false;
        if (response.Status == "SUCCESS") {
          this.pendingCount = response.data.pending_workflows;
          this.submittedWorkflowsCount = response.data.submitted_workflows || 0;
          this.participatedWorkflowsCount =
            response.data.participated_workflows || 0;
          this.myteamCount =
            response.data.user_details[0].total_number_of_users;
        } else {
          this.overlay = false;
        }
      } catch (error) {
        console.error("Error fetching dashboard details:", error);
        this.overlay = false;
      }
    },
    getUserName(chat) {
      if (chat.team_type === "GROUP_CHAT") {
        return chat.team_name;
      }
      if (chat.team_type === "ONE_ON_ONE_MESSAGE") {
        if (!chat.team_topic_id || !this.listUsers || !this.listUsers.length) {
          return chat.team_id || "Unknown User";
        }
        const participants = chat.team_topic_id
          .split("~")
          .map((e) => e.trim().toLowerCase());
        const userObj = this.$store.getters.GetUserObj;
        const myEmail =
          userObj && userObj.user ? userObj.user.user_email_id : null;
        const otherEmail = participants.find((email) => email !== myEmail);

        if (otherEmail) {
          const user = this.listUsers.find(
            (u) =>
              u.user_email_id &&
              u.user_email_id.trim().toLowerCase() === otherEmail
          );
          if (user && user.full_user_name) {
            return user.full_user_name;
          }
        }
        return participants[0];
      }
      return chat.team_name;
    },
    getUserProfilePic(chat) {
      if (
        chat.team_type === "ONE_ON_ONE_MESSAGE" &&
        chat.team_topic_id &&
        this.listUsers &&
        this.listUsers.length
      ) {
        const participants = chat.team_topic_id
          .split("~")
          .map((e) => e.trim().toLowerCase());
        const userObj = this.$store.getters.GetUserObj;
        const myEmail =
          userObj && userObj.user ? userObj.user.user_email_id : null;
        const otherEmail = participants.find((email) => email !== myEmail);

        if (otherEmail) {
          const user = this.listUsers.find(
            (u) =>
              u.user_email_id &&
              u.user_email_id.trim().toLowerCase() === otherEmail
          );
          if (user && user.user_profile_pic_url) {
            return user.user_profile_pic_url;
          }
        }
      }
      return null;
    },
    showAllNotifications() {
      this.componentCheck = 1;
      this.notificationTab = true;
    },
    // Channel related methods
    selectChannel(channel) {
      this.selectedChannel = channel;
    },
    get_date(date) {
      return formatedatetime(date / 1000);
    },

    // Set billing type with proper null checks
    setBillingType() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      if (
        orgDetails &&
        orgDetails.organization &&
        orgDetails.organization.organization_billing_type
      ) {
        this.billingType = orgDetails.organization.organization_billing_type;
      } else {
        this.billingType = "MICRO"; // Default fallback
      }
    },

    // Fast loading method
    checkDataReady() {
      // Check if we have any data loaded
      const hasData =
        this.chatList.length > 0 ||
        this.channelDataProp.length > 0 ||
        this.pendingCount !== "";

      if (hasData) {
        this.showLoaders = false;
        this.dataReady = true;
      } else {
        // Wait a bit more for data to load
        setTimeout(() => {
          this.showLoaders = false;
          this.dataReady = true;
        }, 1500); // Show loaders for max 1.5 seconds
      }
    },

    // Upgrade Dialog Methods
    openUpgradeDialog() {
      this.showUpgradeDialog = true;
    },

    showSnackbar(config) {
      this.$SnackBar = {
        SnackbarVmodel: true,
        SnackbarColor: config.color || "success",
        SnackbarText: config.text,
        timeout: 5000,
        Top: true,
      };
    },

    // View All Notifications Method
    viewAllNotifications() {
      this.$store.commit("SetappName", "Notifications");
      this.$store.commit("Setappicon", "mdi-bell-outline");
      this.$router.push("/home/Notifications");
    },

    // Quick Action Methods
    quickAction(actionType) {
      switch (actionType) {
        case "chats":
          this.$store.commit("SetappName", "Chats");
          this.$store.commit("Setappicon", "mdi-chat-outline");
          this.$router.push("/home/Chats");
          break;
        case "events":
          this.$store.commit("SetappName", "Events");
          this.$store.commit("Setappicon", "mdi-calendar-text-outline");
          this.$router.push("/home/EventsUser");
          break;
        case "expense":
          this.$store.commit("SetappName", "Expenses");
          this.$store.commit("Setappicon", "mdi-cash-multiple");
          this.$router.push("/home/UserTransaction");
          break;
        case "assets":
          this.$store.commit("SetappName", "Assets");
          this.$store.commit("Setappicon", "mdi-dip-switch");
          this.$router.push("/home/AssetTypes");
          break;
        case "timesheet":
          this.$store.commit("SetappName", "Timesheet");
          this.$store.commit("Setappicon", "mdi-clock-outline");
          this.$router.push("/home/UserTimesheetTypes");
          break;
        case "directory":
          this.$store.commit("SetappName", "Directory");
          this.$store.commit("Setappicon", "mdi-account-group");
          this.$router.push("/home/DirectoryList");
          break;
        case "forms":
          this.$store.commit("SetappName", "Forms");
          this.$store.commit("Setappicon", "mdi-file-document-outline");
          this.$router.push("/home/UserForms");
          break;
        case "tickets":
          this.$store.commit("SetappName", "Tickets");
          this.$store.commit("Setappicon", "mdi-ticket");
          this.$router.push("/home/TicketsSub");
          break;
        case "booking":
          this.$store.commit("SetappName", "Booking");
          this.$store.commit("Setappicon", "mdi-calendar-clock");
          this.$router.push("/home/UserResources");
          break;
        case "presence":
          this.$store.commit("SetappName", "Attendance");
          this.$store.commit("Setappicon", "mdi-chart-box");
          this.$router.push("/home/UserLevel");
          break;
        case "projects":
          this.$store.commit("SetappName", "Projects");
          this.$store.commit("Setappicon", "mdi-briefcase-outline");
          this.$router.push("/home/ProjectListing");
          break;
        case "collaterals":
          this.$store.commit("SetappName", "Documents");
          this.$store.commit("Setappicon", "mdi-file-document-multiple");
          this.$router.push("/home/RootFolders");
          break;
        case "dashboard":
          this.$store.commit("SetappName", "Dashboard");
          this.$store.commit("Setappicon", "mdi-view-dashboard");
          this.$router.push("/home/DashBoard");
          break;
        case "payroll":
          this.$store.commit("SetappName", "Payroll");
          this.$store.commit("Setappicon", "mdi-cash");
          this.$router.push("/home/MyPayslip");
          break;
        case "ap_ar":
          this.$store.commit("SetappName", "AP/AR");
          this.$store.commit("Setappicon", "mdi-cash-plus");
          this.$router.push("/home/Arap");
          break;
        case "guesthouse":
          this.$store.commit("SetappName", "Guest House");
          this.$store.commit("Setappicon", "mdi-home-city");
          this.$router.push("/home/GuestHouseBookingList");
          break;
        case "sales":
          this.$store.commit("SetappName", "Sales");
          this.$store.commit("Setappicon", "mdi-chart-line");
          this.$router.push("/home/SalesModule");
          break;
        case "inventory":
          this.$store.commit("SetappName", "Inventory");
          this.$store.commit("Setappicon", "mdi-package-variant");
          this.$router.push("/home/Inventory");
          break;
        case "vendors":
          this.$store.commit("SetappName", "Vendors");
          this.$store.commit("Setappicon", "mdi-account-group");
          this.$router.push("/home/vendors");
          break;
        case "orders":
          this.$store.commit("SetappName", "Orders");
          this.$store.commit("Setappicon", "mdi-cart-arrow-right");
          this.$router.push("/home/OrdersList");
          break;
        default:
          this.$store.commit("SetappName", "Initiate");
          this.$store.commit("Setappicon", "mdi-timelapse");
          this.$router.push("/home/UserForms");
      }
    },

    // Get Quick Action Configuration
    getQuickActionConfig(dashboardType) {
      const configs = {
        EVENTS_ADMINS: {
          actionType: "events",
          text: "Events",
          icon: "mdi-calendar-text-outline",
          color: "bg-green",
          route: "/home/EventPlanner",
        },
        EVENTS: {
          actionType: "events",
          text: "Events",
          icon: "mdi-calendar-text-outline",
          color: "bg-green",
          route: "/home/EventsUser",
        },
        EXPENSE_ADMINS: {
          actionType: "expense",
          text: "Expenses",
          icon: "mdi-cash-multiple",
          color: "bg-orange",
          route: "/home/AppadminExpenses",
        },
        EXPENSE: {
          actionType: "expense",
          text: "Expenses",
          icon: "mdi-cash-multiple",
          color: "bg-orange",
          route: "/home/UserTransaction",
        },
        ASSETS_ADMIN: {
          actionType: "assets",
          text: "Assets",
          icon: "mdi-dip-switch",
          color: "bg-purple",
          route: "/home/AssetTypes",
        },
        ASSETS_USER: {
          actionType: "assets",
          text: "Assets",
          icon: "mdi-dip-switch",
          color: "bg-purple",
          route: "/home/UserAsset",
        },
        TIMESHEET_ADMINS: {
          actionType: "timesheet",
          text: "Timesheet",
          icon: "mdi-clock-outline",
          color: "bg-red",
          route: "/home/AdminTimesheet",
        },
        TIMESHEET_USER: {
          actionType: "timesheet",
          text: "Timesheet",
          icon: "mdi-clock-outline",
          color: "bg-red",
          route: "/home/UserTimesheetTypes",
        },
        DIRECTORY_USER: {
          actionType: "directory",
          text: "Directory",
          icon: "mdi-account-group",
          color: "bg-grey",
          route: "/home/DirectoryList",
        },
        FORMS_ADMINS: {
          actionType: "forms",
          text: "Forms",
          icon: "mdi-file-document-outline",
          color: "bg-grey",
          route: "/home/FormDesignerAdmin",
        },
        TICKET_MANAGEMENT_ADMINS: {
          actionType: "tickets",
          text: "Tickets",
          icon: "mdi-ticket",
          color: "bg-orange",
          route: "/home/TicketManagement",
        },
        TICKET_MANAGEMENT: {
          actionType: "tickets",
          text: "Tickets",
          icon: "mdi-ticket",
          color: "bg-orange",
          route: "/home/Usertickets",
        },
        BOOKING_SLOT_ADMINS: {
          actionType: "booking",
          text: "Booking",
          icon: "mdi-calendar-clock",
          color: "bg-blue",
          route: "/home/SlotSubitems",
        },
        BOOKING_SLOT: {
          actionType: "booking",
          text: "Booking",
          icon: "mdi-calendar-clock",
          color: "bg-blue",
          route: "/home/UserResources",
        },
        PREZENCE_ADMINS: {
          actionType: "presence",
          text: "Attendance",
          icon: "mdi-chart-box",
          color: "bg-green",
          route: "/home/AppAdminprezence",
        },
        PREZENCE: {
          actionType: "presence",
          text: "Attendance",
          icon: "mdi-chart-box",
          color: "bg-green",
          route: "/home/UserLevel",
        },
        PROJECT_USER: {
          actionType: "projects",
          text: "Projects",
          icon: "mdi-briefcase-outline",
          color: "bg-purple",
          route: "/home/ProjectListing",
        },
        COLLATERALS: {
          actionType: "collaterals",
          text: "Documents",
          icon: "mdi-file-document-multiple",
          color: "bg-blue",
          route: "/home/RootFolders",
        },
        DASHBOARD_MANAGEMENT: {
          actionType: "dashboard",
          text: "Dashboard",
          icon: "mdi-view-dashboard",
          color: "bg-indigo",
          route: "/home/DashBoard",
        },
        PAYROLL: {
          actionType: "payroll",
          text: "Payroll",
          icon: "mdi-cash",
          color: "bg-green",
          route: "/home/MyPayslip",
        },
        AP_AR_USER: {
          actionType: "ap_ar",
          text: "AP/AR",
          icon: "mdi-cash-plus",
          color: "bg-orange",
          route: "/home/Arap",
        },
        GUESTHOUSE_USER: {
          actionType: "guesthouse",
          text: "Guest House",
          icon: "mdi-home-city",
          color: "bg-brown",
          route: "/home/GuestHouseBookingList",
        },
        QABM_USERS: {
          actionType: "sales",
          text: "Sales",
          icon: "mdi-chart-line",
          color: "bg-green",
          route: "/home/SalesModule",
        },
        SAIM_USERS: {
          actionType: "inventory",
          text: "Inventory",
          icon: "mdi-package-variant",
          color: "bg-blue",
          route: "/home/Inventory",
        },
        VNDR_USERS: {
          actionType: "vendors",
          text: "Vendors",
          icon: "mdi-account-group",
          color: "bg-grey",
          route: "/home/vendors",
        },
        ORDMG_USERS: {
          actionType: "orders",
          text: "Orders",
          icon: "mdi-cart-arrow-right",
          color: "bg-orange",
          route: "/home/OrdersList",
        },
      };

      return configs[dashboardType] || null;
    },
    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
  },
};
</script>

<style scoped>
/* ===============================
   ROOT
================================= */
.dashboard-root {
  background: #f6f8fc;
  padding: clamp(18px, 3vw, 30px);
  min-height: calc(100vh - 80px);
}

/* ===============================
   WELCOME BANNER
================================= */
.welcome-banner {
  border-radius: 24px;
  padding: clamp(24px, 4vw, 44px);
  background: linear-gradient(135deg, #4c8edb, #d8698b);
  color: white;
  overflow: hidden;
  position: relative;
}

.welcome-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.welcome-title {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
}

.welcome-subtitle {
  font-size: 14px;
  opacity: 0.92;
  margin-top: 6px;
}

/* ===============================
   LOGO ANIMATION (ONCE ONLY)
================================= */
.banner-logo {
  width: clamp(110px, 18vw, 170px);
  height: auto;
  animation: logoReveal 1s ease forwards;
}

@keyframes logoReveal {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.banner-right {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.store-buttons {
  display: flex;
  gap: 14px;
  margin-top: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  opacity: 0.95;
}

/* ===============================
   WORKFLOW CARDS
================================= */
.modern-card {
  border-radius: 20px;
  padding: 22px;
  background: #ffffff;
  cursor: pointer;
  position: relative;
  min-height: 160px;

  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.35s ease;

  /* Elegant entrance animation */
  opacity: 0;
  transform: translateY(20px);
  animation: cardReveal 0.6s ease forwards;
}

.modern-card:nth-child(1) { animation-delay: 0.1s; }
.modern-card:nth-child(2) { animation-delay: 0.2s; }
.modern-card:nth-child(3) { animation-delay: 0.3s; }
.modern-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes cardReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth hover */
.modern-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08);
}

/* Subtle hover overlay */
.modern-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    rgba(76, 142, 219, 0.06),
    rgba(216, 105, 139, 0.06)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modern-card:hover::after {
  opacity: 1;
}

/* ===============================
   CARD TOP SECTION
================================= */
.card-top {
  display: flex;
  align-items: center;
}

/* ===============================
   ICON STYLING
================================= */
.icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s ease;
}

.modern-card:hover .icon-wrap {
  transform: scale(1.08);
}

.pink { background: linear-gradient(135deg, #ff6a7a, #ffc371); }
.yellow { background: linear-gradient(135deg, #ffb347, #ffcc33); }
.blue { background: linear-gradient(135deg, #36d1c4, #5b86e5); }
.green { background: linear-gradient(135deg, #43e97b, #38f9d7); }

/* ===============================
   FIXED BADGE (TOP RIGHT ALWAYS)
================================= */
.count-badge {
  position: absolute;
  top: 22px;
  right: 18px;

  background: #eef4ff;
  color: #1a4ed8;
  font-size: 20px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid #dbe7ff;
  min-width: 30px;
  text-align: center;
}

/* ===============================
   CARD TEXT
================================= */
.card-content h3 {
  margin-top: 20px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.card-content p {
  font-size: 13px;
  color: #6b7280;
  margin-top: 6px;
  line-height: 1.4;
}

/* ===============================
   QUICK ACTIONS (ELEGANT)
================================= */
.quick-actions-card {
  border-radius: 24px;
  padding: 28px;
  background: #ffffff;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.05);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 22px;
}

.quick-action-item {
  text-align: center;
  padding: 22px 16px;
  border-radius: 18px;
  background: #f9fbff;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #edf2ff;
}

.quick-action-item:hover {
  background: white;
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.06);
}

.qa-icon {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.qa-text {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

/* ===============================
   RESPONSIVE
================================= */
@media (max-width: 768px) {
  .welcome-inner {
    flex-direction: column;
    text-align: center;
  }

  .banner-right {
    margin-top: 20px;
  }

  .quick-actions-card {
    padding: 22px;
  }
}

@media (max-width: 480px) {
  .modern-card {
    padding: 18px;
  }

  .qa-icon {
    width: 44px;
    height: 44px;
  }

  .qa-text {
    font-size: 12px;
  }
}

</style>
