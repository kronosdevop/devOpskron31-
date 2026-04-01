<template>
  <div>
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
            >Overview of your workflows and activities</span
          >
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
    </v-app-bar>

    <v-card flat class="pa-2 overflow-y-auto" :height="windowHeight">
      <v-card-text class="pa-0">
        <v-toolbar flat class="mt-n10" style="background-color: white">
          <template v-slot:extension>
            <v-tabs
              v-model="adminToggle"
              mandatory
              class="modern-tab-toggle" 
              color="#DB4C77"
              slider-color="#DB4C77"
              
            >
              <v-tab value="pending" class="tab-btn"> Pending </v-tab>
              <v-tab value="submitted" class="tab-btn"> Submitted </v-tab>
              <v-tab value="participated" class="tab-btn"> Participated </v-tab>
              <v-tab value="userforms" class="tab-btn"> Initiate </v-tab>
              <v-tab value="tasks" class="tab-btn"> Tasks </v-tab>
              <v-tab value="channel" class="tab-btn"> Channel </v-tab>

            </v-tabs>
          </template>
        </v-toolbar>
        <div v-if="adminToggle === 'pending'">
          <PendingList />
        </div>
        <div v-if="adminToggle === 'submitted'">  
          <SubmitedList />
        </div>
        <div v-if="adminToggle === 'participated'">
          <ParticipatedList />
        </div>
        <div v-if="adminToggle === 'userforms'">
          <UserForms />
        </div>
        <!-- <div v-if="adminToggle === 'tasks'">
          <TasksList />
        </div> -->
        <!-- <div v-if="adminToggle === 'channel'">
          <ChannelList />
        </div> -->

        <!-- Dashboard Cards Grid Layout -->
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
import PendingList from "@/components/Approvals/PendingList.vue";
import SubmitedList from "@/components/Approvals/SubmitedList.vue";
import ParticipatedList from "@/components/Approvals/ParticipatedList.vue";
import UserForms from "@/components/UserLevelForms/UserForms.vue";
// import TasksList from "@/components/Approvals/TasksList.vue";
// import ChannelList from "@/components/Approvals/ChannelList.vue";

// Mixins
import { get_all_users } from "@/mixins/GetAllUsers.js";

export default {
  // Components
  components: {
    OverlayComp,
    NotificationList,
    UpgradeDialog,
    PendingList,
    SubmitedList,
    ParticipatedList,
    UserForms,
    // TasksList,
    // ChannelList,
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
      adminToggle: "pending",

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

      // Number properties
      submittedWorkflowsCount: 0,
      participatedWorkflowsCount: 0,
      componentCheck: 0,
      windowHeight: 0,
      cardContentHeight: 0,
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
  min-height: 200px !important;
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
  max-height: 140px;
  overflow-y: auto;
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
