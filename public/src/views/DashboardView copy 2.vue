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

    <v-card flat :height="windowHeight" class="overflow-y-auto mt-2">
      <div style="padding-bottom: 70px">
        <div class="dashboard-bg-exact">
          <v-container fluid class="pa-0 dashboard-container-exact">
            <v-responsive :height="windowHeight" class="overflow-y-auto">
              <v-row class="dashboard-row-1-exact" no-gutters>
                <v-col cols="12" md="4">
                  <v-card
                    class="dashboard-card-exact dashboard-card-pending-row-exact"
                    @click="pending_form"
                  >
                    <div class="dashboard-card-row-flex-exact">
                      <div class="dashboard-card-left-col-exact">
                        <span
                          class="icon-bg-exact icon-bg-pinkorange"
                          style="margin: 0"
                        >
                          <v-icon color="white" size="32"
                            >mdi-file-clock-outline</v-icon
                          >
                        </span>
                        <div class="dashboard-card-label-row-exact">
                          Pending Workflows
                        </div>
                      </div>
                      <div class="dashboard-card-number-row-exact">
                        {{
                          pedningData.pendingcount
                            ? pedningData.pendingcount
                            : 0
                        }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card
                    class="dashboard-card-exact dashboard-card-pending-row-exact"
                    @click="submitted_form"
                  >
                    <div class="dashboard-card-row-flex-exact">
                      <div class="dashboard-card-left-col-exact">
                        <span
                          class="icon-bg-exact icon-bg-yellow"
                          style="margin: 0"
                        >
                          <v-icon color="white" size="32"
                            >mdi-file-check-outline</v-icon
                          >
                        </span>
                        <div class="dashboard-card-label-row-exact">
                          Submitted Workflows
                        </div>
                      </div>
                      <!-- <div class="dashboard-card-number-row-exact">{{ submittedWorkflowsCount || 0 }}</div> -->
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card
                    class="dashboard-card-exact dashboard-card-pending-row-exact"
                    @click="participated_form"
                  >
                    <div class="dashboard-card-row-flex-exact">
                      <div class="dashboard-card-left-col-exact">
                        <span
                          class="icon-bg-exact icon-bg-blue"
                          style="margin: 0"
                        >
                          <v-icon color="white" size="32"
                            >mdi-file-document-multiple-outline</v-icon
                          >
                        </span>
                        <div class="dashboard-card-label-row-exact">
                          Participated Workflows
                        </div>
                      </div>
                      <!-- <div class="dashboard-card-number-row-exact">{{ participatedWorkflowsCount || 0 }}</div> -->
                    </div>
                  </v-card>
                </v-col>
              </v-row>
              <v-row class="dashboard-row-2-exact" no-gutters>
                <v-col cols="12" md="4">
                  <v-card
                    class="dashboard-card-exact dashboard-card-action-exact"
                    @click="initiate_form"
                  >
                    <div class="dashboard-card-action-flex-exact">
                      <div class="dashboard-card-action-left-exact">
                        <span class="icon-bg-exact icon-bg-green">
                          <v-icon color="white" size="32"
                            >mdi-plus-box-outline</v-icon
                          >
                        </span>
                        <div class="dashboard-card-action-content-exact">
                          <div class="dashboard-card-label-lg-exact">
                            Initiate Workflow
                          </div>
                          <!-- <div class="dashboard-card-sub-exact">Forms</div> -->
                        </div>
                      </div>
                      <!-- <span class="dashboard-card-plus-btn-exact">
                <v-icon color="#d1d5db" size="24">mdi-plus</v-icon>
              </span> -->
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card
                    class="dashboard-card-exact dashboard-card-action-exact"
                    @click="tasks_form"
                  >
                    <div class="dashboard-card-action-flex-exact">
                      <div class="dashboard-card-action-left-exact">
                        <span class="icon-bg-exact icon-bg-blue">
                          <v-icon color="white" size="32"
                            >mdi-clipboard-text-outline</v-icon
                          >
                        </span>
                        <div class="dashboard-card-action-content-exact">
                          <div class="dashboard-card-label-lg-exact">Tasks</div>
                        </div>
                      </div>
                      <!-- <span class="dashboard-card-plus-btn-exact">
                <v-icon color="#d1d5db" size="24">mdi-plus</v-icon>
              </span> -->
                      <div class="dashboard-card-number-exact">
                        {{ tasks.count }}
                      </div>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card
                    class="dashboard-card-exact dashboard-card-list-exact"
                  >
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="dashboard-card-list-title-exact"
                        >Channels</span
                      >
                      <a
                        class="dashboard-card-viewall-exact"
                        @click.prevent="channels_form"
                        >View All</a
                      >
                    </div>
                    <div class="dashboard-card-list-content-exact">
                      <div
                        v-for="channel in recentChannels.slice(0, 1)"
                        :key="channel.team_id"
                        class="dashboard-list-item-exact"
                      >
                        <span
                          class="dashboard-list-avatar-exact"
                          :class="
                            channel.team_type === 'NOTIFICATION_CHAT'
                              ? 'bg-green'
                              : 'bg-pink'
                          "
                        >
                          <v-icon color="white" size="22">
                            {{
                              channel.team_type === "NOTIFICATION_CHAT"
                                ? "mdi-bell"
                                : "mdi-chat"
                            }}
                          </v-icon>
                        </span>
                        <div class="dashboard-list-info-exact">
                          <div class="dashboard-list-title-exact">
                            {{ channel.team_name }}
                          </div>
                          <div class="dashboard-list-sub-exact">
                            {{ channel.previous_message || "No messages yet" }}
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="recentChannels.length === 0"
                        class="dashboard-list-empty-exact"
                      >
                        No channels available
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
              <v-row class="dashboard-row-3-exact" no-gutters>
                <v-col cols="12" md="6">
                  <v-card
                    class="dashboard-card-exact dashboard-card-list-exact dashboard-card-bottomrow-exact"
                  >
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="dashboard-card-list-title-exact"
                        >Recent Activity</span
                      >
                    </div>
                    <div class="dashboard-card-list-content-exact pa-0">
                      <NotificationList
                        :notificationsData="notificationsData"
                        :hideTitle="true"
                      />
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card
                    class="dashboard-card-exact dashboard-card-list-exact dashboard-card-bottomrow-exact"
                  >
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="dashboard-card-list-title-exact"
                        >Recent Chats</span
                      >
                      <a
                        class="dashboard-card-viewall-exact"
                        @click.prevent="navigate_routes('/home/Chats')"
                        >View All</a
                      >
                    </div>
                    <div class="dashboard-card-list-content-exact">
                      <div
                        v-for="chat in chatListWithNames.slice(0, 5)"
                        :key="chat.team_id"
                        class="dashboard-list-item-exact"
                      >
                        <span class="dashboard-list-avatar-exact bg-pink">
                          <span v-if="getUserProfilePic(chat)">
                            <img
                              :src="getUserProfilePic(chat)"
                              alt="Profile"
                              class="dashboard-list-img-exact"
                            />
                          </span>
                          <span
                            v-else
                            class="dashboard-list-avatar-text-exact"
                            >{{
                              (getUserName(chat) || "?").charAt(0).toUpperCase()
                            }}</span
                          >
                        </span>
                        <div class="dashboard-list-info-exact">
                          <div class="dashboard-list-title-exact">
                            {{ chat.displayName }}
                          </div>
                          <div class="dashboard-list-sub-exact">
                            {{ chat.previous_message }}
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="!chatListWithNames.length"
                        class="dashboard-list-empty-exact"
                      >
                        No chats available
                      </div>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-responsive>
          </v-container>
        </div>
      </div>
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

// Mixins
import { get_all_users } from "@/mixins/GetAllUsers.js";

export default {
  // Components
  components: {
    OverlayComp,
    NotificationList,
    UpgradeDialog,
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
.dashboard-bg-exact {
  padding: 12px 0 0 0;
}
.dashboard-container-exact {
  padding-left: 18px;
  padding-right: 18px;
}
.dashboard-row-1-exact,
.dashboard-row-2-exact,
.dashboard-row-3-exact {
  margin-bottom: 0px;
}
.dashboard-card-exact {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.04);
  margin: 24px 18px;
  min-height: 200px;
  height: 200px;
  max-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  border: none;
  transition: box-shadow 0.2s;
  padding: 0;
}
.dashboard-card-exact:hover {
  box-shadow: 0 12px 40px 0 rgba(60, 60, 60, 0.13),
    0 4px 16px 0 rgba(60, 60, 60, 0.09);
}
.icon-bg-exact {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  margin: 0;
}
.icon-bg-pinkorange {
  background: linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%);
}
.icon-bg-yellow {
  background: linear-gradient(135deg, #ffb347 0%, #ffcc33 100%);
}
.icon-bg-blue {
  background: linear-gradient(135deg, #36d1c4 0%, #5b86e5 100%);
}
.icon-bg-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
.dashboard-card-action-flex-exact {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  height: 100%;
  padding: 32px;
}
.dashboard-card-action-left-exact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}
.dashboard-card-action-content-exact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
}
.dashboard-card-plus-btn-exact {
  background: #f3f4f6;
  border-radius: 50%;
  min-width: 40px;
  min-height: 40px;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
}
.dashboard-card-plus-exact {
  min-width: 40px;
  min-height: 40px;
  margin: 24px 24px 0 0;
}
.dashboard-card-content-exact {
  margin: 0 0 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
}
.dashboard-card-number-exact {
  font-size: 2.5rem;
  font-weight: 200;
  color: #222;
  margin-bottom: 2px;
  letter-spacing: -0.5px;
  text-align: left;
}
.dashboard-card-label-exact {
  font-size: 1.18rem;
  font-weight: 400;
  color: #222;
  margin-bottom: 2px;
  text-align: left;
}
.dashboard-card-label-lg-exact {
  font-size: 1.35rem;
  font-weight: 400;
  margin-bottom: 2px;
  text-align: left;
}
.dashboard-card-sub-exact {
  font-size: 1.01rem;
  color: #7b7b7b;
  font-weight: 400;
  margin-bottom: 2px;
  text-align: left;
}
.dashboard-card-list-exact {
  min-height: 200px;
  height: 200px;
  max-height: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 0 0 0;
  margin-bottom: 24px;
}
.dashboard-card-list-title-exact {
  font-size: 1.15rem;
  font-weight: 400;
  color: #222;
  letter-spacing: 0.01em;
  margin: 24px 0 0 24px;
  text-align: left;
  flex-shrink: 0;
}
.dashboard-card-viewall-exact {
  font-size: 1rem;
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
  margin: 24px 24px 0 0;
}
.dashboard-card-list-content-exact {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 18px 0 24px 0;
  padding: 0 24px 24px 24px;
}
.dashboard-list-item-exact {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 16px;
  padding: 18px 24px 18px 24px;
  margin-bottom: 18px;
  box-shadow: 0 1px 4px 0 rgba(60, 60, 60, 0.04);
}
.dashboard-list-avatar-exact {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #f5f6fa;
  font-size: 1.2rem;
  font-weight: 400;
  flex-shrink: 0;
}
.dashboard-list-avatar-exact.bg-pink {
  background: #f75a7b;
}
.dashboard-list-avatar-exact.bg-green {
  background: #22c993;
}
.dashboard-list-avatar-exact.bg-blue {
  background: linear-gradient(135deg, #36d1c4 0%, #5b86e5 100%);
}
.dashboard-list-avatar-text-exact {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 400;
}
.dashboard-list-img-exact {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}
.dashboard-list-info-exact {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 18px;
}
.dashboard-list-title-exact {
  font-size: 1.08rem;
  font-weight: 700;
  color: #181818;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}
.dashboard-list-sub-exact {
  font-size: 0.99rem;
  color: #7b7b7b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  font-weight: 400;
}
.dashboard-list-empty-exact {
  text-align: center;
  color: #bdbdbd;
  font-size: 1rem;
  margin-top: 18px;
}
.dashboard-card-pending-exact {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.04);
  min-height: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  border: none;
  transition: box-shadow 0.2s;
  padding: 0;
}
.dashboard-card-flex-exact {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}
.icon-bg-exact.icon-bg-pinkorange {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  margin: 24px 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%);
}
.dashboard-card-bottom-group-exact {
  margin: 0 0 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
}
.dashboard-card-number-exact {
  font-size: 2.5rem;
  font-weight: 200;
  color: #181818;
  margin-bottom: 2px;
  letter-spacing: -0.5px;
  text-align: left;
}
.dashboard-card-label-exact {
  font-size: 1.18rem;
  font-weight: 700;
  color: #181818;
  margin-bottom: 2px;
  text-align: left;
}
.dashboard-card-pending-row-exact {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.04);
  min-height: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: box-shadow 0.2s;
  padding: 0;
}
.dashboard-card-row-flex-exact {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  justify-content: space-between;
  padding: 32px;
}
.dashboard-card-left-col-exact {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 12px;
  margin-left: 0;
}
.icon-bg-exact.icon-bg-pinkorange {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%);
}
.dashboard-card-label-row-exact {
  font-size: 1.18rem;
  font-weight: 100;
  color: #181818;
  margin: 0;
  text-align: left;
}
.dashboard-card-number-row-exact {
  font-size: 2.3rem;
  font-weight: 500;
  color: #181818;
  text-align: right;
  letter-spacing: -1px;
}
.dashboard-card-bottomrow-exact {
  min-height: 650px;
  height: 650px;
  max-height: 650px;
}

.current-plan-card {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-width: 140px;
}

.current-plan-card:hover {
  border-color: #db4c77;
  box-shadow: 0 4px 16px rgba(219, 76, 119, 0.15);
  transform: translateY(-1px);
}

.plan-info {
  display: flex;
  flex-direction: column;
  margin-right: 8px;
}

.plan-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-name {
  font-size: 0.9rem;
  color: #db4c77;
  font-weight: 600;
  margin-top: 2px;
}

.upgrade-icon {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.current-plan-card:hover .upgrade-icon {
  opacity: 1;
  transform: translateX(2px);
}
</style>
