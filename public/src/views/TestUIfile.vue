<template>
  <div class="dashboard-container">
    <OverlayComp :overlay="overlay" />
    <v-row dense>
      <!-- Left side: Workflow cards, Channels, Chat -->
      <v-col cols="12" md="7">
        <v-row class="ma-2" dense>
          <!-- Top workflow card: Pending & Submitted -->
          <v-row dense>
            <!-- Pending -->
            <v-col cols="12" md="6">
              <v-card
                class="pa-4"
                elevation="2"
                rounded="lg"
                height="100%"
                @click="pending_form()"
              >
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="font-weight-bold">Pending Workflows</span>
                  <v-icon color="red">mdi-file-clock-outline</v-icon>
                </div>
                <div class="display-1 font-weight-bold text-center mt-2">
                  {{ pedningData.pendingcount }}
                </div>
              </v-card>
            </v-col>
            <!-- Submitted & Participated as formal links with icons, only text is hyperlink -->
            <v-col cols="12" md="6">
              <v-card class="pa-4" elevation="2" rounded="lg" height="100%">
                <div
                  class="d-flex flex-column align-start justify-center"
                  style="height: 100%"
                >
                  <div class="d-flex align-center mb-3">
                    <v-icon class="mr-2" size="22"
                      >mdi-file-check-outline</v-icon
                    >
                    <a
                      href="#"
                      @click.prevent="submitted_form"
                      class="formal-link-bold"
                    >
                      Submitted Workflows
                    </a>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon class="mr-2" size="22"
                      >mdi-file-account-outline</v-icon
                    >
                    <a
                      href="#"
                      @click.prevent="participated_form"
                      class="formal-link-bold"
                    >
                      Participated Workflows
                    </a>
                  </div>
                </div>
              </v-card>
            </v-col>
            <!-- Initiate -->
            <v-col cols="12" md="6">
              <v-card
                class="pa-4"
                elevation="2"
                rounded="lg"
                height="100%"
                @click="initiate_form()"
                style="cursor: pointer"
              >
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="font-weight-bold">Initiate workflow</span>
                  <v-icon color="green">mdi-plus-box-outline</v-icon>
                </div>
                <div class="display-1 font-weight-bold text-center mt-2">
                  Forms
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card
                class="pa-4"
                elevation="2"
                rounded="lg"
                height="100%"
                @click="tasks_form()"
              >
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="font-weight-bold">Tasks</span>
                  <v-icon color="primary">mdi-clipboard-text-outline</v-icon>
                </div>
                <div class="display-1 font-weight-bold text-center mt-2">
                  {{ tasks.count }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-row>
        <!-- Channels & Chat row -->
        <v-row dense style="height: 60vh; align-items: stretch">
          <!-- Channels Card -->
          <v-col
            cols="12"
            md="6"
            class="d-flex flex-column"
            style="height: 100%"
          >
            <v-card
              class="dashboard-card"
              style="height: 100%; display: flex; flex-direction: column"
            >
              <v-card-title>Channels</v-card-title>
              <v-card-text
                class="dashboard-list"
                style="flex: 1; overflow-y: auto"
              >
                <!-- Channels list here -->
                <div v-if="recentChannels.length > 0" class="channels-list">
                  <div
                    v-for="(channel, index) in recentChannels"
                    :key="channel.team_id"
                    @click="selectChannel(channel)"
                    :class="{
                      'channel-item': true,
                      'channel-item--active':
                        selectedChannel &&
                        selectedChannel.team_id === channel.team_id,
                    }"
                  >
                    <div class="d-flex align-center">
                      <v-avatar
                        size="32"
                        :color="
                          channel.team_type === 'NOTIFICATION_CHAT'
                            ? 'green'
                            : 'primary'
                        "
                        class="mr-3"
                      >
                        <v-icon color="white" size="16">
                          {{
                            channel.team_type === "NOTIFICATION_CHAT"
                              ? "mdi-bell"
                              : "mdi-bullhorn-outline"
                          }}
                        </v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div
                          class="text-body-2 font-weight-medium text-truncate"
                        >
                          {{ channel.team_name }}
                        </div>
                        <div
                          class="text-caption text-grey-darken-1 text-truncate"
                        >
                          {{ channel.previous_message || "No messages yet" }}
                        </div>
                      </div>
                      <div class="channel-meta">
                        <v-badge
                          v-if="channel.newMessageCount > 0"
                          :content="channel.newMessageCount"
                          color="error"
                          inline
                          class="ml-2"
                        ></v-badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center grey--text py-10">
                  <v-icon size="48" color="grey-lighten-1" class="mb-2"
                    >mdi-chat-question-outline</v-icon
                  >
                  <p>No channels available</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <!-- Channel Messages Card -->
          <v-col
            cols="12"
            md="6"
            class="d-flex flex-column"
            style="height: 100%"
          >
            <v-card
              class="dashboard-card"
              style="height: 100%; display: flex; flex-direction: column"
            >
              <v-card-title>Channel Messages</v-card-title>
              <v-card-text
                class="dashboard-list"
                style="flex: 1; overflow-y: auto"
              >
                <!-- Channel messages here -->
                <div
                  v-if="selectedChannel && selectedChannelMessages.length > 0"
                  class="channel-messages"
                >
                  <div
                    v-for="message in selectedChannelMessages.slice(0, 3)"
                    :key="message.msg_id"
                    class="channel-message mb-3"
                  >
                    <v-card class="pa-3" elevation="1" rounded="sm">
                      <div class="text-body-2 font-weight-medium mb-1">
                        {{ message.msg_title }}
                      </div>
                      <div class="text-caption text-grey-darken-1 mb-2">
                        {{ message.msg_description }}
                      </div>
                      <div class="d-flex align-center text-caption text-grey">
                        <v-icon size="12" class="mr-1">mdi-account</v-icon>
                        <span class="mr-3">{{ message.msg_sent_by }}</span>
                        <v-icon size="12" class="mr-1"
                          >mdi-calendar-blank</v-icon
                        >
                        <span>{{ get_date(message.msg_created_on) }}</span>
                      </div>
                    </v-card>
                  </div>
                </div>
                <div v-else class="text-center">
                  <v-icon size="64" color="grey-lighten-2" class="mb-4"
                    >mdi-forum-outline</v-icon
                  >
                  <p class="grey--text">
                    {{
                      selectedChannel
                        ? "No messages in this channel yet."
                        : "Select a channel to view messages"
                    }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <!-- Recent Notifications Card -->
        </v-row>
      </v-col>
      <!-- Right side: Chats and Notifications only -->
      <v-col cols="12" md="5">
        <!-- Chats Card -->
        <v-card elevation="2" class="rounded-lg">
          <!-- Header -->
          <v-card-title
            class="d-flex align-center justify-space-between px-4 py-3"
          >
            <span class="text-h6 font-weight-bold">Chats</span>
            <v-btn
              variant="text"
              size="small"
              class="text-primary text-capitalize font-weight-medium"
              @click="navigate_routes('/home/Chats')"
            >
              See All
            </v-btn>
          </v-card-title>

          <!-- Chat List -->
          <v-divider></v-divider>
          <v-list density="compact" class="py-2">
            <template v-if="chatList && chatList.length">
              <template
                v-for="(chat, i) in chatListWithNames.slice(0, 5)"
                :key="chat.team_id || i"
              >
                <v-list-item class="px-4 py-2">
                  <!-- Avatar -->
                  <template #prepend>
                    <v-avatar color="pink-lighten-4" size="36">
                      <template v-if="getUserProfilePic(chat)">
                        <img
                          :src="getUserProfilePic(chat)"
                          alt="Profile"
                          style="width: 100%; height: 100%; object-fit: cover"
                        />
                      </template>
                      <template v-else>
                        <span class="text-body-2 font-weight-medium">
                          {{
                            (getUserName(chat) || "?").charAt(0).toUpperCase()
                          }}
                        </span>
                      </template>
                    </v-avatar>
                  </template>

                  <!-- Name & Message -->
                  <v-list-item-content>
                    <v-list-item-title
                      class="text-body-2 font-weight-medium"
                      style="
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                      "
                    >
                      {{ chat.displayName }}
                    </v-list-item-title>
                    <v-list-item-subtitle
                      class="text-caption text-grey"
                      style="
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                      "
                    >
                      {{ chat.previous_message }}
                    </v-list-item-subtitle>
                  </v-list-item-content>

                  <!-- Badge -->
                  <template #append>
                    <v-badge
                      v-if="chat.newMessageCount > 0"
                      :content="chat.newMessageCount"
                      color="blue"
                      inline
                      class="ml-2"
                      style="--v-badge-padding: 0 4px; font-size: 12px"
                    ></v-badge>
                  </template>
                </v-list-item>

                <!-- Divider between chats -->
                <v-divider
                  v-if="i < chatList.length - 1"
                  class="mx-4"
                ></v-divider>
              </template>
            </template>

            <template v-else>
              <v-list-item
                class="d-flex align-center justify-center"
                style="height: 120px"
              >
                <v-list-item-title class="text-grey"
                  >No chats available</v-list-item-title
                >
              </v-list-item>
            </template>
          </v-list>
        </v-card>

        <!-- Notifications -->
        <v-row dense class="dashboard-row" style="min-height: 400px">
          <v-col cols="12" md="12">
            <!-- <v-card elevation="2" rounded="lg" class="dashboard-card">
              <v-card-title>Recent Notifications</v-card-title>
              <v-card-text class="dashboard-list"> -->
            <NotificationList
              :notificationsData="notificationsData.slice(0, 5)"
            />
            <!-- </v-card-text>
            </v-card> -->
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
/*eslint-disable*/
import { get_org_dashboard_data } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";
// import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import OverlayComp from "@/components/OverlayComp.vue";
import { mapGetters } from "vuex";
import NotificationList from "@/components/NotificationList.vue";
import { format } from "date-fns";
import { get_all_users } from "@/mixins/GetAllUsers.js";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";

export default {
  components: {
    OverlayComp,
    NotificationList,
  },
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
  data() {
    return {
      pendingCount: "",
      submittedWorkflowsCount: 0,
      participatedWorkflowsCount: 0,
      myteamCount: "",
      overlay: false,
      listItems: [],
      storednotifications: [],
      tableData: [],
      tableLoading: false,
      componentCheck: 0,
      notificationTab: false,
      tasksTab: null,
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
      windowHeight: 0,
      lastNotification: null,

      // Channel related data
      selectedChannel: null,
    };
  },

  async created() {
    await this.get_all_users();
    // console.log("Loaded users:", this.listUsers);

    // var data = JSON.parse(localStorage.getItem("notoficationItems"));
    // this.listItems = data;
    this.windowHeight = window.innerHeight - 250;

    await this.fetch_dashboard_details();
  },
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
  },
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
      // console.log("pendign info", this.getPendingInfo);
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
  mounted() {
    this.$store.commit("SetappName", "Home");
    this.$store.commit("Setappicon", "mdi-home");
  },

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
        // console.log("Dashboard Data Response:", response.data); // Log the response data
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
        for (const email of participants) {
          const user = this.listUsers.find(
            (u) =>
              u.user_email_id && u.user_email_id.trim().toLowerCase() === email
          );
          if (user && user.full_user_name) {
            return user.full_user_name;
          }
        }
        // If no user found, fallback to showing the first participant's email
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
        for (const email of participants) {
          const user = this.listUsers.find(
            (u) =>
              u.user_email_id && u.user_email_id.trim().toLowerCase() === email
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
  },
  mixins: [get_all_users],
};
</script>

<style scoped>
.dashboard-container {
  padding: 18px 10px 10px 10px;
  background: #f4f6f8;
  min-height: 100vh;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.fill-height {
  height: 100%;
}
.right-tabs .v-tabs-bar {
  border-bottom: 1px solid #e0e0e0;
}
.tabs-items .v-list-item__content {
  padding: 8px 0;
}
.chat-list-item {
  min-height: 36px !important;
  height: 36px !important;
  padding-top: 3px !important;
  padding-bottom: 3px !important;
}

/* Channel styles */
.channels-list {
  max-height: 300px;
  overflow-y: auto;
  background: #f7f9fa;
  border-radius: 12px;
  box-shadow: 0 1px 4px 0 rgba(60, 60, 60, 0.04);
  padding-bottom: 10px;
}
.channel-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  border-radius: 10px;
  margin-bottom: 6px;
  background: #fff;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.channel-item:hover {
  background-color: #eaf3fb;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.06);
}
.channel-item--active {
  background-color: #e3f2fd !important;
  border-left: 3px solid #1976d2;
}
.channel-meta {
  display: flex;
  align-items: center;
}
.channel-messages {
  width: 100%;
}
.channel-message {
  border-left: 3px solid #e0e0e0;
  padding-left: 12px;
}
.formal-link-bold {
  color: #555;
  text-decoration: underline;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s;
  line-height: 1.5;
  text-align: left;
}
.formal-link-bold:hover {
  color: #333;
  text-decoration: underline;
}
.dashboard-row {
  display: flex;
  align-items: stretch;
  min-height: 400px;
  margin-bottom: 16px;
}
.dashboard-card {
  height: 100% !important;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
  border: none;
}
.dashboard-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px 24px 16px 24px;
  background: #f7f9fa;
  border-radius: 0 0 22px 22px;
}
.v-card-title,
.v-card-title span {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.v-card {
  margin-bottom: 18px;
}
</style>
