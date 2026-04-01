<template>
  <div class="chat-container">
    <CreateTicketDialog
      :DialogCreateTicket="DialogCreateTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateTicketEmit"
    />
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-bullhorn-outline</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Channels</span>
          <span class="header-subtitle"
            >Communicate and collaborate with your team</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <!-- Search Field -->
        <v-text-field
          v-model="searchQuery"
          placeholder="Search channels..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
          density="compact"
          class="search-pill mr-4"
          style="
            min-width: 260px;
            max-width: 260px;
            height: 32px;
            border-radius: 999px;
            background: #fff;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
            font-size: 14px;
          "
          clearable
          @click:clear="searchQuery = ''"
        />

        <!-- Action Buttons -->
        <v-btn @click="OtherChannels" class="action-btn" size="small">
          <v-icon>mdi-radar</v-icon>
          <span>{{
            showOtherChannels ? "My Channels" : "Other Channels"
          }}</span>
        </v-btn>
        <v-menu
          v-model="groupMenu"
          :close-on-content-click="false"
          location="bottom end"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              @click="groupCraete"
              class="action-btn add-btn"
              size="small"
            >
              <v-icon>mdi-plus</v-icon>
              <span>Create Channel</span>
            </v-btn>
          </template>
          <v-card>
            <CreateChannel
              :key="componetKey"
              @errorMsg="error_info"
              @successMsg="success_info"
            />
          </v-card>
        </v-menu>
        <v-btn
          color="primary"
          class="text-capitalize"
          @click="back_call()"
          prepend-icon="mdi-step-backward"
          style="background: #db4c77 !important; color: white !important"
        >
          Back
        </v-btn>
      </div>
    </v-app-bar>

    <v-row no-gutters class="chat-layout mt-4">
      <!-- Channels Sidebar -->
      <v-col cols="3" class="chat-sidebar">
        <!-- Sidebar Header -->
        <div class="sidebar-header d-flex align-center">
          <h3 class="text-h6 font-weight-medium">
            {{ showOtherChannels ? "Other Channels" : "My Channels" }}
          </h3>
        </div>

        <!-- Sidebar Content -->
        <div class="sidebar-content">
          <!-- My Channels List -->
          <v-list v-if="!showOtherChannels" nav class="py-0" density="compact">
            <div v-if="filteredChannels.length > 0">
              <v-list-item
                v-for="chat in filteredChannels"
                :key="chat.team_id"
                @click="selectChat(chat)"
                :class="{
                  'chat-list-item--active':
                    selectedChat && selectedChat.team_id === chat.team_id,
                }"
                class="chat-list-item"
                lines="two"
              >
                <template #prepend>
                  <v-avatar
                    size="40"
                    :color="
                      chat.team_type === 'NOTIFICATION_CHAT'
                        ? 'green'
                        : 'primary'
                    "
                  >
                    <v-icon color="white">{{
                      chat.team_type === "NOTIFICATION_CHAT"
                        ? "mdi-bell"
                        : "mdi-bullhorn-outline"
                    }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">{{
                  chat.team_name
                }}</v-list-item-title>
                <v-list-item-subtitle class="text-truncate">
                  <v-icon
                    v-if="chat.msg_type === 'IMAGE'"
                    size="16"
                    class="mr-1"
                    >mdi-image-outline</v-icon
                  >
                  <span v-else>{{ chat.previous_message }}</span>
                </v-list-item-subtitle>
                <template #append>
                  <div class="chat-list-append">
                    <span class="timestamp">{{
                      formatTimestampForList(chat.last_message_on)
                    }}</span>
                    <v-badge
                      color="error"
                      :content="chat.newMessageCount"
                      v-if="chat.newMessageCount > 0"
                      inline
                      class="unread-badge"
                    ></v-badge>
                  </div>
                </template>
              </v-list-item>
            </div>
            <div v-else class="empty-state text-center">
              <v-icon size="48" color="grey-lighten-1"
                >mdi-chat-question-outline</v-icon
              >
              <p class="text-body-2 mt-2">No channels found.</p>
            </div>
          </v-list>
          <!-- Other Channels List -->
          <v-list v-else nav class="py-0" density="compact">
            <div v-if="otherChannels.length > 0">
              <v-list-item
                v-for="chat in otherChannels"
                :key="chat.team_id"
                class="chat-list-item"
                lines="two"
              >
                <template #prepend>
                  <v-avatar size="40" color="primary">
                    <v-icon color="white">mdi-bullhorn-outline</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">{{
                  chat.team_name
                }}</v-list-item-title>
                <template #append>
                  <v-btn
                    size="small"
                    variant="text"
                    color="primary"
                    @click="request_access(chat)"
                    class="action-btn"
                    >Request</v-btn
                  >
                </template>
              </v-list-item>
            </div>
            <div v-else class="empty-state text-center">
              <v-icon size="48" color="grey-lighten-1">mdi-radar</v-icon>
              <p class="text-body-2 mt-2">No other channels available.</p>
            </div>
          </v-list>
        </div>
      </v-col>

      <v-divider vertical />

      <!-- Channel Window -->
      <v-col cols="9" class="chat-window">
        <v-card v-if="selectedChat" class="chat-card" flat>
          <!-- Header -->
          <v-toolbar density="compact" class="chat-header">
            <v-menu
              v-model="groupData"
              :close-on-content-click="false"
              location="bottom end"
            >
              <template #activator="{ props }">
                <div
                  v-bind="props"
                  @click="restgroupInformation()"
                  class="d-flex align-center"
                  style="cursor: pointer"
                >
                  <!-- <v-avatar size="40" color="primary">
                    <v-icon color="white">mdi-account-group</v-icon>
                  </v-avatar> -->
                  <v-list-item-title class="font-weight-bold ml-3">{{
                    selectedChat.team_name
                  }}</v-list-item-title>
                </div>
              </template>
              <ChannelInformation
                :key="componetgroupkey"
                :selectedChat="selectedChat"
                :allusers="allusers"
                @errorMsg="error_info"
                @successMsg="success_info"
                @rowupdate="updateInfo"
                @successMsgexit="selectedChat = null"
              />
            </v-menu>
            <v-spacer />
            <v-btn
              icon
              size="small"
              @click="Puclish_Message"
              v-if="selectedChat.team_type != 'NOTIFICATION_CHAT'"
              class="action-btn"
            >
              <v-tooltip activator="parent" location="top">{{
                showPublishMsg ? "View Messages" : "Publish Message"
              }}</v-tooltip>
              <v-icon>{{
                showPublishMsg
                  ? "mdi-backspace-outline"
                  : "mdi-email-fast-outline"
              }}</v-icon>
            </v-btn>
          </v-toolbar>

          <!-- Publish Message View -->
          <div v-if="showPublishMsg" class="publish-container">
            <PublishChannelMsg
              :key="publishMessageKey"
              :selectedChat="selectedChat"
              @successMsgexit="selectedChat = null"
              @errorMsg="error_info"
              @successMsg="success_info"
              @rowupdate="updateInfo"
            />
          </div>

          <!-- Messages Area -->
          <div v-else class="chat-messages" ref="scrollContainer">
            <div
              v-if="
                matchedChat && matchedChat.data && matchedChat.data.length > 0
              "
            >
              <div class="text-center loading-container" v-if="loadMessage">
                <v-progress-circular
                  :size="50"
                  color="primary"
                  indeterminate
                ></v-progress-circular>
              </div>
              <div
                v-for="message in matchedChat.data"
                :key="message.msg_id"
                class="channel-message-wrapper"
              >
                <v-card class="channel-message-card">
                  <img
                    v-if="message.msg_media"
                    :src="getCachedImageUrl(message.msg_media)"
                    class="channel-message-image"
                  />
                  <v-card-title>{{ message.msg_title }}</v-card-title>
                  <div
                    class="v-card-text pb-2"
                    v-html="formatText(message.msg_description)"
                  ></div>
                  <v-card-actions class="px-4 pb-3">
                    <v-icon size="x-small">mdi-account</v-icon>
                    <span class="text-caption ml-1 mr-4">{{
                      message.msg_sent_by
                    }}</span>
                    <v-icon size="x-small">mdi-calendar-blank</v-icon>
                    <span class="text-caption ml-1">{{
                      get_date(message.msg_created_on)
                    }}</span>
                  </v-card-actions>
                </v-card>
              </div>
            </div>
            <div v-else class="empty-state text-center">
              <v-icon size="64" color="grey-lighten-1"
                >mdi-message-text-outline</v-icon
              >
              <p class="text-body-1 mt-4">No messages in this channel yet.</p>
            </div>
          </div>
        </v-card>
        <v-card
          v-else
          class="empty-chat d-flex align-center justify-center"
          flat
        >
          <div class="text-center">
            <v-icon size="96" color="grey-lighten-2" class="mb-4"
              >mdi-forum-outline</v-icon
            >
            <h2 class="text-h5 font-weight-regular text-grey-darken-1">
              Select a channel to see messages
            </h2>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <OtherChannelRequestAccess
      :requestAccessDialog="requestAccessDialog"
      :rowInfo="rowInfo"
      @clicked="requestAccessDialog = false"
      @successMsg="get_successs_toast"
      @errorMsg="get_error"
    />
  </div>
</template>

<script>
/* eslint-disable */
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import ChannelInformation from "./AllDialogs/ChannelInformation.vue";
import SnackBar from "@/components/SnackBar.vue";
import CreateChannel from "@/components/Channels/CreateChannel.vue";
import { connecttoMQTTMethod } from "@/mixins/MqttConnect";
import { initiateLocalCacheDB } from "@/db.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { list_all_stichh_channels } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import OtherChannelRequestAccess from "./AllDialogs/OtherChannelRequestAccess.vue";
import PublishChannelMsg from "./AllDialogs/PublishChannelMsg.vue";
const FileSaver = require("file-saver");
import axios from "axios";
import CreateTicketDialog from "../Tickets/CreateTicketDialog.vue";
import html2canvas from "html2canvas";

export default {
  components: {
    CreateChannel,
    SnackBar,
    ChannelInformation,
    OtherChannelRequestAccess,
    PublishChannelMsg,
    CreateTicketDialog,
  },
  mixins: [get_all_org_users, initiateLocalCacheDB, connecttoMQTTMethod],
  props: {
    messageDataProp: { type: Array, default: () => [] },
    channelDataProp: { type: Array, default: () => [] },
  },
  data() {
    return {
      componetKey: 0,
      componetgroupkey: 0,
      publishMessageKey: 0,
      showOtherChannels: false,
      allUSersNames: [],
      SnackBarComponent: {},
      allusers: [],
      groupData: false,
      loadMessage: false,
      groupMenu: false,
      selectedChat: null,
      otherChannels: [],
      requestAccessDialog: false,
      rowInfo: {},
      showPublishMsg: false,
      firstIndex: true,
      searchQuery: "",
      imageUrlCache: {},
      localChannelData: [],

      //Screenshot Values
      DialogCreateTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },
  computed: {
    testChannels() {
      return this.channelDataProp;
    },
    filteredChannels() {
      // Remove duplicates based on team_id
      const uniqueChannels = Array.from(
        new Map(
          this.channelDataProp.map((chat) => [chat.team_id, chat])
        ).values()
      );

      if (!this.searchQuery.trim()) {
        return uniqueChannels;
      }
      return uniqueChannels.filter((chat) =>
        chat.team_name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    updatedChats() {
      // Create a deep copy of the prop to avoid mutating it
      const channelDataCopy = JSON.parse(JSON.stringify(this.channelDataProp));

      channelDataCopy.forEach((chatdata) => {
        const user = this.messageDataProp.find(
          (user) => user.topic === chatdata.team_topic_id
        );

        // Initialize default values if they don't exist
        if (chatdata.newMessageCount === undefined) {
          chatdata.newMessageCount = 0;
        }

        if (user && user.data && user.data.length > 0) {
          const lastmessagedata = user.data[user.data.length - 1];
          chatdata.last_message_on = lastmessagedata.msg_created_on;
          chatdata.previous_message =
            lastmessagedata.msg_title || lastmessagedata.msg_payload || "";
          chatdata.msg_type = lastmessagedata.msg_type || "TEXT";
        } else {
          // If no message data, set default values
          if (!chatdata.last_message_on) {
            chatdata.last_message_on = chatdata.team_created_on;
          }
          if (!chatdata.previous_message) {
            chatdata.previous_message = "No messages yet";
          }
          if (!chatdata.msg_type) {
            chatdata.msg_type = "TEXT";
          }
        }
      });

      channelDataCopy.sort((a, b) => {
        const aDate = a.last_message_on
          ? new Date(a.last_message_on)
          : new Date(a.team_created_on);
        const bDate = b.last_message_on
          ? new Date(b.last_message_on)
          : new Date(b.team_created_on);
        return bDate - aDate;
      });

      return channelDataCopy;
    },
    matchedChat() {
      if (!this.selectedChat) return { data: [] };
      const matchedObject = this.messageDataProp.find(
        (item) => item.topic === this.selectedChat.team_topic_id
      );
      if (matchedObject) {
        const uniqueMessages = Array.from(
          new Map(
            matchedObject.data.map((item) => [item.msg_id, item])
          ).values()
        );
        const sortedMessages = uniqueMessages.sort(
          (a, b) => b.msg_created_on - a.msg_created_on
        );

        // this.$nextTick(() => {
        //   if (this.$refs.scrollContainer) {
        //     const el = this.$refs.scrollContainer;
        //     el.scrollTop = el.scrollHeight;
        //   }
        // });

        return {
          ...matchedObject,
          data: sortedMessages,
        };
      }
      return { data: [] };
    },
  },
  methods: {
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
      this.DialogCreateTicket = true;
    },
    DialogCreateTicketEmit() {
      this.DialogCreateTicket = false;
    },
    back_call() {
      this.$router.push("/home/DashboardView");
    },
    async getImageUrl(key) {
      if (!key) return "";
      if (this.imageUrlCache[key]) return this.imageUrlCache[key];
      try {
        const details = this.$store.getters.GetOrgDetails;
        const signedUrl = await getS3SignedUrl(key, details.s3_details);
        this.imageUrlCache[key] = signedUrl;
        return signedUrl;
      } catch (error) {
        console.error("Error getting signed URL for channel media:", error);
        this.imageUrlCache[key] = ""; // Cache failure
        return "";
      }
    },
    getCachedImageUrl(key) {
      return this.imageUrlCache[key] || "";
    },
    async loadImageUrls(messages) {
      if (!messages) return;
      for (const message of messages) {
        if (message.msg_media && !this.imageUrlCache[message.msg_media]) {
          await this.getImageUrl(message.msg_media);
        }
      }
    },
    formatTimestampForList(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },
    OtherChannels() {
      this.showOtherChannels = !this.showOtherChannels;
      if (this.showOtherChannels) {
        this.get_otherChannels_Details();
        this.selectedChat = null;
      }
    },
    async get_otherChannels_Details() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_stichh_channels, {
            input: { organization_id: data.organization.organization_id },
          })
        );
        var response = JSON.parse(result.data.list_all_stichh_channels);
        if (response.Status === "SUCCESS") {
          const allDirs = response.data;
          this.otherChannels = allDirs.filter(
            (dir) =>
              dir.team_visibility === "RESTRICTED" &&
              dir.team_created_by !==
                this.$store.getters.GetUserObj.user.user_email_id &&
              (!Array.isArray(dir.restricted_users) ||
                !dir.restricted_users.includes(
                  this.$store.getters.GetUserObj.user.user_id
                ))
          );
        }
      } catch (error) {
        console.error("Error fetching other channels", error);
      }
    },
    request_access(item) {
      this.rowInfo = item;
      this.requestAccessDialog = true;
    },
    get_successs_toast(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
      };
      this.requestAccessDialog = false;
      this.showOtherChannels = false;
    },
    get_error(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
      };
    },
    Puclish_Message() {
      this.publishMessageKey++;
      this.showPublishMsg = !this.showPublishMsg;
    },
    get_date(date) {
      return formatedatetime(date / 1000);
    },
    formatText(text) {
      if (!text) return "";
      return text.replace(/\n/g, "<br>");
    },
    updateInfo() {
      this.showPublishMsg = false;
    },
    restgroupInformation() {
      this.componetgroupkey++;
      this.showPublishMsg = false;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
      };
      this.groupMenu = false;
      this.groupData = false;
      this.showOtherChannels = false;
      this.showPublishMsg = false;
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
      };
    },
    groupCraete() {
      this.componetKey++;
    },
    selectChat(chat) {
      const matchedObject = this.messageDataProp.find(
        (item) => item.topic === chat.team_topic_id
      );
      if (matchedObject !== undefined) {
        this.selectedChat = { ...chat, ...matchedObject };
      } else {
        this.selectedChat = { ...chat, data: [] };
      }
      this.showPublishMsg = false;
    },
    handleScroll() {},
  },
  async mounted() {
    await this.get_all_org_users();
    this.allusers = this.orgUsers;
    this.allUSersNames = this.orgUsers;
  },
};
</script>

<style scoped>
/* Copied and adapted from ChatView.vue */
.chat-container {
  height: calc(100vh - 64px); /* Subtract app bar height */
  background-color: #fff;
  overflow: hidden;
}
.chat-layout {
  height: 100%;
}
.chat-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #e0e0e0;
}
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff !important;
}
.search-bar {
  --v-field-padding-start: 12px;
}
.new-chat-btn {
  background-color: #4a90e2 !important;
  color: white !important;
  box-shadow: none;
}
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
.chat-list-item {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}
.chat-list-item--active {
  background-color: #e3f2fd !important;
}
.chat-list-append {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  text-align: right;
}
.timestamp {
  font-size: 12px;
  color: #757575;
}
.unread-badge .v-badge__badge {
  background-color: #f44336 !important;
  color: white !important;
  font-size: 12px;
  font-weight: bold;
}
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f7f9fa;
}
.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: transparent !important;
  min-height: 0;
}
.chat-header {
  background-color: #fff !important;
  border-bottom: 1px solid #e0e0e0;
}
.chat-header .action-btn {
  color: #757575 !important;
}
.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
.empty-chat {
  height: 100%;
  background-color: #fff !important;
}
.empty-state {
  padding: 24px;
  color: #757575;
}

/* Channel specific styles */
.publish-container {
  flex: 1;
  overflow-y: auto;
}
.channel-message-wrapper {
  margin-bottom: 16px;
}
.channel-message-card {
  max-width: 80%;
  margin: 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  border-radius: 8px !important;
}
.channel-message-image {
  width: 100%;
  max-height: 350px;
  object-fit: cover;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: block;
}
.loading-container {
  padding: 24px;
}

/* Scrollbar */
.sidebar-content::-webkit-scrollbar,
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.sidebar-content::-webkit-scrollbar-track,
.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-content::-webkit-scrollbar-thumb,
.chat-messages::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 3px;
}

.debug-info {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
</style>
