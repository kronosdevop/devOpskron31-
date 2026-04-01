<template>
  <div>
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
          <span class="header-subtitle"
            >Overview of your workflows and activities
          </span>
        </div>
      </div>
      <v-spacer />
      
      <!-- <div class="header-actions">
        <div class="current-plan-card" @click="openUpgradeDialog">
          <div class="plan-info">
            <div class="plan-label">Current Plan</div>
            <div class="plan-name">{{ billingType }}</div>
          </div>
          <v-icon size="18" color="#DB4C77" class="upgrade-icon">mdi-chevron-right</v-icon>
        </div>
      </div> -->

      <!--Screenshot Button-->
      <v-tooltip text="Take a screenshot and raise a ticket">
        <template #activator="{ props }">
          <v-btn icon flat v-bind="props" @click="TakeScreenshot">
            <v-icon size="30" color="primary">mdi-help-box</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-app-bar>

    <v-card flat class="pa-3 mt-4 overflow-y-auto" :height="windowHeight">
      <v-card-text class="pa-0">
        <!-- Dashboard Cards Grid Layout -->
        <v-row class="dashboard-grid">
          <!-- Pending Workflows Card -->
          <v-col cols="12" sm="6" md="4" class="dashboard-col">
            <v-card class="dashboard-card" elevation="2" @click="pending_form">
              <v-card-text class="pa-3">
                <!-- Header with Icon -->
                <div class="d-flex align-start mb-2">
                  <div class="icon-container icon-bg-pinkorange">
                    <v-icon class="icon-outline" size="20"
                      >mdi-file-clock-outline</v-icon
                    >
                  </div>
                </div>

                <!-- Title -->
                <div class="mb-1">
                  <h3 class="card-title">Pending Workflows</h3>
                </div>

                <!-- Description -->
                <p class="card-description">Workflows awaiting your action</p>

                <!-- Count at bottom right -->
                <div class="card-count-bottom">
                  {{ pedningData.pendingcount ? pedningData.pendingcount : 0 }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Submitted Workflows Card -->
          <v-col cols="12" sm="6" md="4" class="dashboard-col">
            <v-card
              class="dashboard-card"
              elevation="2"
              @click="submitted_form"
            >
              <v-card-text class="pa-3">
                <!-- Header with Icon -->
                <div class="d-flex align-start mb-2">
                  <div class="icon-container icon-bg-yellow">
                    <v-icon class="icon-outline" size="20"
                      >mdi-file-check-outline</v-icon
                    >
                  </div>
                </div>

                <!-- Title -->
                <div class="mb-1">
                  <h3 class="card-title">Submitted Workflows</h3>
                </div>

                <!-- Description -->
                <p class="card-description">Your submitted workflow requests</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Participated Workflows Card -->
          <v-col cols="12" sm="6" md="4" class="dashboard-col">
            <v-card
              class="dashboard-card"
              elevation="2"
              @click="participated_form"
            >
              <v-card-text class="pa-3">
                <!-- Header with Icon -->
                <div class="d-flex align-start mb-2">
                  <div class="icon-container icon-bg-blue">
                    <v-icon class="icon-outline" size="20"
                      >mdi-file-document-multiple-outline</v-icon
                    >
                  </div>
                </div>

                <!-- Title -->
                <div class="mb-1">
                  <h3 class="card-title">Participated Workflows</h3>
                </div>

                <!-- Description -->
                <p class="card-description">Workflows you've participated in</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Initiate Workflow Card -->
          <v-col cols="12" sm="6" md="4" class="dashboard-col">
            <v-card class="dashboard-card" elevation="2" @click="initiate_form">
              <v-card-text class="pa-3">
                <!-- Header with Icon -->
                <div class="d-flex align-start mb-2">
                  <div class="icon-container icon-bg-green">
                    <v-icon class="icon-outline" size="20"
                      >mdi-plus-box-outline</v-icon
                    >
                  </div>
                </div>

                <!-- Title -->
                <div class="mb-1">
                  <h3 class="card-title">Initiate Workflow</h3>
                </div>

                <!-- Description -->
                <p class="card-description">Start a new workflow process</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Tasks Card -->
          <v-col cols="12" sm="6" md="4" class="dashboard-col">
            <v-card class="dashboard-card" elevation="2" @click="tasks_form">
              <v-card-text class="pa-3">
                <!-- Header with Icon -->
                <div class="d-flex align-start mb-2">
                  <div class="icon-container icon-bg-blue">
                    <v-icon class="icon-outline" size="20"
                      >mdi-clipboard-text-outline</v-icon
                    >
                  </div>
                </div>

                <!-- Title -->
                <div class="mb-1">
                  <h3 class="card-title">Tasks</h3>
                </div>

                <!-- Description -->
                <p class="card-description">
                  Your assigned tasks and activities
                </p>

                <!-- Count at bottom right -->
                <div class="card-count-bottom">
                  {{ tasks.count }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Channels Card -->
          <v-col cols="12" sm="6" md="4" class="dashboard-col">
            <v-card class="dashboard-card" elevation="2" @click="channels_form">
              <v-card-text class="pa-3">
                <!-- Header with Icon -->
                <div class="d-flex align-start mb-2">
                  <div class="icon-container icon-bg-purple">
                    <v-icon class="icon-outline" size="20"
                      >mdi-broadcast</v-icon
                    >
                  </div>
                </div>

                <!-- Title -->
                <div class="mb-1">
                  <h3 class="card-title">Channels</h3>
                </div>

                <!-- Recent Channel Info -->
                <div v-if="recentChannels.length > 0" class="recent-info">
                  <div class="recent-channel">
                    <span
                      class="channel-icon"
                      :class="
                        recentChannels[0].team_type === 'NOTIFICATION_CHAT'
                          ? 'bg-green'
                          : 'bg-pink'
                      "
                    >
                      <v-icon color="white" size="14">
                        {{
                          recentChannels[0].team_type === "NOTIFICATION_CHAT"
                            ? "mdi-bell"
                            : "mdi-chat"
                        }}
                      </v-icon>
                    </span>
                    <span class="channel-name">{{
                      recentChannels[0].team_name
                    }}</span>
                  </div>
                </div>

                <!-- Description -->
                <p class="card-description">
                  Communication channels and notifications
                </p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Quick Actions Card -->
          <v-col cols="12" md="6" class="dashboard-col">
            <v-card class="dashboard-card dashboard-card-large" elevation="2">
              <v-card-text class="pa-3">
                <!-- Header with Icon -->
                <!-- <div class="d-flex align-start mb-2">
                  <div class="icon-container icon-bg-pink">
                    <v-icon class="icon-outline" size="20">mdi-lightning-bolt</v-icon>
                  </div>
                </div> -->

                <!-- Title -->
                <div class="mb-2">
                  <h3 class="card-title">Quick Actions</h3>
                </div>

                <!-- Quick Actions Grid -->
                <div class="quick-actions-grid">
                  <div
                    v-for="action in quickActionsList"
                    :key="action.actionType"
                    class="quick-action-item"
                    @click="quickAction(action.actionType)"
                  >
                    <div :class="['quick-action-icon', action.color]">
                      <v-icon color="white" size="16">{{ action.icon }}</v-icon>
                    </div>
                    <div class="quick-action-text">{{ action.text }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Recent Activity Card -->
          <v-col cols="12" md="6" class="dashboard-col">
            <v-card class="dashboard-card dashboard-card-large" elevation="2">
              <v-card-text class="pa-3">
                <!-- Header with Icon -->
                <!-- <div class="d-flex align-start mb-2">
                  <div class="icon-container icon-bg-orange">
                    <v-icon class="icon-outline" size="20">mdi-clock-outline</v-icon>
                  </div>
                </div> -->

                <!-- Title -->
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="card-title">Recent Activity</h3>
                  <!-- <span class="view-all-link" @click="viewAllNotifications">View All</span> -->
                </div>

                <!-- Activity Content -->
                <div class="activity-content">
                  <NotificationList
                    :notificationsData="notificationsData"
                    :hideTitle="true"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Upgrade Dialog -->
    <UpgradeDialog v-model="showUpgradeDialog" @show-snackbar="showSnackbar" />
  </div>
</template>

<script>
/*eslint-disable*/
// Imports
import { get_org_dashboard_data } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
import OverlayComp from "@/components/OverlayComp.vue";
import { mapGetters } from "vuex";
import NotificationList from "@/components/NotificationList.vue";
import { format } from "date-fns";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import UpgradeDialog from "@/components/AdminApps/UpgradeDialog.vue";
import CreateExternalTicketDialog from "@/components/Tickets/CreateExternalTicketDialog.vue";
import html2canvas from "html2canvas";

// Mixins
import { get_all_users } from "@/mixins/GetAllUsers.js";

export default {
  // Components
  components: {
    OverlayComp,
    NotificationList,
    UpgradeDialog,
    CreateExternalTicketDialog,
  },

  // Mixins
  mixins: [get_all_users],

  // Props
  props: {
    notificationsData: Array,
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
    notificationsData: {
      handler(newData) {
        if (!Array.isArray(newData) || newData.length === 0) {
          this.lastnotification = null;
          return;
        }
      },
      deep: true,
      immediate: true, // Runs on component mount
    },
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
    tasks() {
      return {
        count: this.getTaskData[0]
          ? this.getTaskData[0].taskDetails.reduce(
              (sum, person) => sum + person.total_assigned_tasks,
              0
            )
          : 0,
        latestTask: this.getTaskData[0] ? this.getTaskData[0].taskDetails : [],
      };
    },
    channels() {
      return {
        count:
          this.getOpenRestChanel.length != 0
            ? this.getOpenRestChanel.length
            : 0, // Get the count of messages
        latestMessage:
          this.getOpenRestChanel.length != 0
            ? this.getOpenRestChanel[this.getOpenRestChanel.length - 1] // Get the last message
            : {},
      };
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

    channels_form() {
      this.$store.commit("SetappName", "Channels");
      this.$store.commit("Setappicon", "mdi-broadcast");
      this.$router.push("/home/channels");
    },

    tasks_form() {
      this.$store.commit("SetappName", "Tasks");
      this.$store.commit("Setappicon", "mdi-calendar-check");
      this.$router.push("/home/TaskUserlevel");
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
        this.notificationsData.length > 0 ||
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
/* Modern Header Styles */

/* Dashboard Cards */
.dashboard-card {
  border-radius: 16px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  height: 100% !important;
  min-height: 120px !important;
  background: white !important;
  border: 1px solid transparent !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  position: relative !important;
}

.dashboard-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12) !important;
  background: linear-gradient(
    135deg,
    #ffe5f0 0%,
    #e8f4fd 50%,
    #f0e8ff 100%
  ) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}

.dashboard-card-large {
  min-height: 150px !important;
}

/* Icon Container */
.icon-container {
  width: 44px !important;
  height: 44px !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12) !important;
}

.icon-bg-pinkorange {
  background: linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%) !important;
}

.icon-bg-yellow {
  background: linear-gradient(135deg, #ffb347 0%, #ffcc33 100%) !important;
}

.icon-bg-blue {
  background: linear-gradient(135deg, #36d1c4 0%, #5b86e5 100%) !important;
}

.icon-bg-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%) !important;
}

.icon-bg-purple {
  background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%) !important;
}

.icon-bg-orange {
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%) !important;
}

.icon-bg-pink {
  background: linear-gradient(135deg, #e91e63 0%, #f44336 100%) !important;
}

/* Icon Outline Style */
.icon-outline {
  color: rgba(255, 255, 255, 0.95) !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2)) !important;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.6),
    0 0 8px rgba(255, 255, 255, 0.4), 0 0 12px rgba(255, 255, 255, 0.2) !important;
  opacity: 0.98 !important;
}

/* Card Title */
.card-title {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #2c3e50 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

/* Card Count */
.card-count {
  font-size: 2rem !important;
  font-weight: 300 !important;
  color: #1a1a1a !important;
  margin: 6px 0 8px 0 !important;
  letter-spacing: -0.5px !important;
  line-height: 1 !important;
}

/* Card Count Bottom Right */
.card-count-bottom {
  position: absolute !important;
  bottom: 12px !important;
  right: 16px !important;
  font-size: 1.8rem !important;
  font-weight: 600 !important;
  color: #1976d2 !important;
  background: rgba(25, 118, 210, 0.1) !important;
  padding: 4px 8px !important;
  border-radius: 8px !important;
  min-width: 32px !important;
  text-align: center !important;
  line-height: 1 !important;
}

/* Card Description */
.card-description {
  font-size: 12px !important;
  color: #6c757d !important;
  line-height: 1.4 !important;
  margin: 0 !important;
  font-weight: 400 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

/* Recent Channel Info */
.recent-info {
  margin: 8px 0;
}

.recent-channel {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.03);
  padding: 6px 10px;
  border-radius: 6px;
}

.channel-icon {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.channel-icon.bg-green {
  background: #22c993 !important;
}

.channel-icon.bg-pink {
  background: #f75a7b !important;
}

.channel-name {
  font-size: 12px;
  font-weight: 500;
  color: #495057;
}

/* View All Link */
.view-all-link {
  font-size: 12px;
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 3px 6px;
  border-radius: 4px;
}

.view-all-link:hover {
  background-color: rgba(25, 118, 210, 0.1);
  color: #1565c0;
}

/* Chat List */
.chat-list {
  max-height: 140px;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.chat-item:hover {
  background: #f1f3f4;
  transform: translateX(2px);
}

.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 10px;
}

.chat-avatar.bg-pink {
  background: #f75a7b !important;
}

.chat-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.chat-avatar-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-message {
  font-size: 11px;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Empty State */
.empty-state {
  text-align: center;
  color: #adb5bd;
  font-size: 12px;
  margin-top: 15px;
  padding: 15px;
}

/* Activity Content */
.activity-content {
  max-height: 120px;
  overflow-y: auto;
  margin-top: 8px;
}

/* Quick Actions Grid */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  width: 100%;
  margin-top: 6px;
}

.quick-action-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60px;
}

.quick-action-item:hover {
  background: #f1f3f4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.quick-action-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 4px;
}

.quick-action-icon.bg-blue {
  background: #1976d2 !important;
}

.quick-action-icon.bg-green {
  background: #22c993 !important;
}

.quick-action-icon.bg-orange {
  background: #ff9800 !important;
}

.quick-action-icon.bg-purple {
  background: #9c27b0 !important;
}

.quick-action-icon.bg-red {
  background: #f44336 !important;
}

.quick-action-icon.bg-grey {
  background: #6c757d !important;
}

.quick-action-icon.bg-indigo {
  background: #3f51b5 !important;
}

.quick-action-icon.bg-brown {
  background: #795548 !important;
}

.quick-action-text {
  font-size: 11px;
  color: #2c3e50;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
}

/* Dashboard Grid Layout */
.dashboard-grid {
  margin: 0 !important;
}

.dashboard-col {
  padding: 12px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-card {
    min-height: 120px !important;
  }

  .card-title {
    font-size: 14px !important;
  }

  .card-description {
    font-size: 11px !important;
  }

  .icon-container {
    width: 36px !important;
    height: 36px !important;
  }

  .card-count {
    font-size: 1.6rem !important;
  }

  .dashboard-col {
    padding: 8px !important;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }

  .quick-action-item {
    padding: 12px 6px;
    min-height: 70px;
  }

  .quick-action-icon {
    width: 32px;
    height: 32px;
    margin-bottom: 6px;
  }

  .quick-action-text {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .dashboard-card {
    min-height: 100px !important;
  }

  .card-title {
    font-size: 13px !important;
  }

  .card-count {
    font-size: 1.4rem !important;
  }

  .dashboard-col {
    padding: 6px !important;
  }
}
</style>
