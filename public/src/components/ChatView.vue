<template>
  <div class="chat-container">
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-chat-outline</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Chats</span>
          <span class="header-subtitle"
            >Connect and communicate with your team</span
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
          placeholder="Search chats..."
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          hide-details
          density="compact"
          class="search-pill mr-4"
          style="
            min-width: 280px;
            max-width: 280px;
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
        <v-btn @click="profileList" class="action-btn" size="small">
          <v-icon>mdi-account-multiple-outline</v-icon>
          <span>{{ profileBit ? "Chats" : "Users" }}</span>
        </v-btn>
        <v-menu
          v-model="groupMenu"
          :close-on-content-click="false"
          location="bottom end"
        >
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              @click="toggleGroupMenu"
              class="action-btn add-btn"
              size="small"
            >
              <v-icon>mdi-plus</v-icon>
              <span>Create Group</span>
            </v-btn>
          </template>
          <v-card>
            <CreateGroup
              :key="componetKey"
              @close="groupMenu = false"
              v-on:errorMsg="error_info"
              v-on:successMsg="success_info"
            />
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <v-row no-gutters class="chat-layout mt-4">
      <!-- Chat Sidebar -->
      <v-col cols="4" class="chat-sidebar">
        <!-- Sidebar Header -->
        <div class="sidebar-header d-flex align-center">
          <h3 class="text-h6 font-weight-medium">
            {{ profileBit ? "Users" : "Chats" }}
          </h3>
        </div>

        <!-- Sidebar Content -->
        <div class="sidebar-content">
          <v-list v-if="!profileBit" nav class="py-0" density="compact">
            <v-list-item
              v-for="chat in filteredChats"
              :key="chat.team_id"
              @click="selectChat(chat)"
              :class="{
                'chat-list-item--active':
                  selectedChat && selectedChat.team_id === chat.team_id,
              }"
              class="chat-list-item"
              lines="two"
            >
              <template v-slot:prepend>
                <v-avatar
                  v-if="chat.team_type == 'GROUP_CHAT'"
                  color="primary"
                  size="40"
                >
                  <v-icon color="white">mdi-account-group</v-icon>
                </v-avatar>
                <v-avatar v-else color="primary" size="40">
                  <v-img
                    v-if="fetch_user_profile(chat.team_name)"
                    :src="fetch_user_profilepic(chat.team_name)"
                    cover
                  />
                  <span v-else class="text-white font-weight-bold text-h6">{{
                    chat.team_name.substring(0, 1).toUpperCase()
                  }}</span>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">
                {{
                  chat.team_type == "GROUP_CHAT"
                    ? chat.team_name
                    : fetch_user_name(chat.team_name)
                }}
              </v-list-item-title>

              <v-list-item-subtitle>
                <v-icon v-if="chat.msg_type === 'IMAGE'" size="16" class="mr-1"
                  >mdi-image-outline</v-icon
                >
                <v-icon
                  v-else-if="chat.msg_type === 'VIDEO'"
                  size="16"
                  class="mr-1"
                  >mdi-video-outline</v-icon
                >
                <v-icon
                  v-else-if="chat.msg_type === 'DOC'"
                  size="16"
                  class="mr-1"
                  >mdi-file-document-outline</v-icon
                >
                <span class="text-truncate" v-else>{{
                  chat.previous_message
                }}</span>
              </v-list-item-subtitle>

              <template v-slot:append>
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
                  >
                  </v-badge>
                </div>
              </template>
            </v-list-item>
          </v-list>
          <v-list v-else nav class="py-0" density="compact">
            <v-list-item
              v-for="user in filteredUsers"
              :key="user.user_id"
              @click="selectChat(user)"
              class="chat-list-item"
              lines="two"
            >
              <template v-slot:prepend>
                <v-avatar color="primary" size="40">
                  <v-img
                    v-if="
                      user.user_profile_pic_url &&
                      user.user_profile_pic_url !== 'N/A' &&
                      user.user_profile_pic_url !== ''
                    "
                    :src="user.user_profile_pic_url"
                    cover
                  ></v-img>
                  <span v-else class="text-white font-weight-bold text-h6">
                    {{ user.full_user_name.substring(0, 1).toUpperCase() }}
                  </span>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">{{
                user.full_user_name
              }}</v-list-item-title>
              <v-list-item-subtitle>{{
                user.designation || "N/A"
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>
      </v-col>

      <!-- Chat Window -->
      <v-col cols="8" class="chat-window">
        <v-card v-if="selectedChat" class="chat-card" flat>
          <!-- Chat Header -->
          <v-toolbar density="compact" class="chat-header">
            <v-list-item lines="one" class="pa-0">
              <template v-slot:prepend>
                <v-avatar
                  v-if="selectedChat.team_type == 'GROUP_CHAT'"
                  color="primary"
                  size="40"
                >
                  <v-icon color="white">mdi-account-group</v-icon>
                </v-avatar>
                <v-avatar v-else color="primary" size="40">
                  <v-img
                    v-if="fetch_user_profile(selectedChat.team_email)"
                    :src="fetch_user_profilepic(selectedChat.team_email)"
                    cover
                  />
                  <span v-else class="text-white font-weight-bold">{{
                    selectedChat.team_name.substring(0, 1).toUpperCase()
                  }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">{{
                selectedChat.team_name
              }}</v-list-item-title>
            </v-list-item>
            <v-spacer />
            <!-- <v-btn icon variant="text" class="action-btn"><v-icon>mdi-clock-outline</v-icon></v-btn>
            <v-btn icon variant="text" class="action-btn"><v-icon>mdi-phone-outline</v-icon></v-btn> -->
            <v-menu location="bottom" offset-y>
              <template #activator="{ props }">
                <v-btn v-bind="props" icon variant="text" class="action-btn"
                  ><v-icon>mdi-dots-vertical</v-icon></v-btn
                >
              </template>
              <v-list>
                <v-list-item
                  @click="restgroupInformation()"
                  v-if="selectedChat.team_type === 'GROUP_CHAT'"
                >
                  <v-list-item-title>Group Info</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>Mute</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-dialog v-model="groupData" max-width="500px" persistent>
              <GroupInfo
                :key="componetgroupkey"
                @close="groupData = false"
                v-on:errorMsg="error_info"
                v-on:successMsg="success_info"
                v-on:rowupdate="updateInfo"
                v-on:successMsgexit="selectedChat = null"
                :selectedChat="selectedChat"
              />
            </v-dialog>
          </v-toolbar>

          <!-- Messages Area -->
          <div class="chat-messages" ref="scrollContainer">
            <div v-for="(group, date) in groupedMessages" :key="date">
              <div class="date-divider">{{ date }}</div>
              <div
                v-for="(message, index) in group"
                :key="message.msg_id"
                class="message-group"
                :class="{
                  sent:
                    message.msg_sent_by ===
                    $store.getters.GetUserObj.user?.user_email_id,
                  received:
                    message.msg_sent_by !==
                    $store.getters.GetUserObj.user?.user_email_id,
                }"
              >
                <!-- Avatar for received messages -->
                <v-avatar
                  v-if="shouldShowAvatar(group, index)"
                  class="sender-avatar"
                  size="32"
                >
                  <v-img
                    :src="fetch_user_profilepic(message.msg_sent_by)"
                    v-if="fetch_user_profile(message.msg_sent_by)"
                  ></v-img>
                  <span v-else class="text-white font-weight-bold text-h6">{{
                    fetch_user_name(message.msg_sent_by)
                      .substring(0, 1)
                      .toUpperCase()
                  }}</span>
                </v-avatar>
                <div class="message-content-wrapper">
                  <div class="message-bubble">
                    <!-- Text Message -->
                    <div v-if="message.msg_type === 'TEXT'">
                      {{ message.msg_payload }}
                    </div>
                    <!-- Image Message -->
                    <img
                      v-if="message.msg_type === 'IMAGE'"
                      :src="getCachedImageUrl(message.msg_payload)"
                      class="image-message"
                      style="
                        max-height: 150px;
                        border-radius: 16px;
                        max-width: 100%;
                        object-fit: contain;
                      "
                    />
                    <!-- Video Message -->
                    <video
                      v-if="message.msg_type === 'VIDEO'"
                      :src="getCachedImageUrl(message.msg_payload)"
                      controls
                      class="image-message"
                      style="
                        max-height: 150px;
                        border-radius: 16px;
                        max-width: 100%;
                      "
                    ></video>
                    <!-- Document Message -->
                    <div
                      v-if="message.msg_type === 'DOC'"
                      class="doc-message-content"
                    >
                      <v-icon class="doc-icon" size="32"
                        >mdi-file-document-outline</v-icon
                      >
                      <div class="doc-info">
                        <div class="doc-name">
                          {{
                            message.msg_payload
                              .split("/")
                              .pop()
                              .split("?")[0]
                              .replace(/^.*?__/, "")
                          }}
                        </div>
                        <div class="doc-size">PDF Document</div>
                      </div>
                      <v-btn
                        icon
                        variant="text"
                        @click="downloadlist(message.msg_payload)"
                      >
                        <v-icon>mdi-download-outline</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  <div class="message-timestamp">
                    {{ formatTimestampForMessage(message.msg_created_on) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="chat-input-area">
            <v-menu location="top">
              <template #activator="{ props }">
                <v-btn icon variant="text" size="small" v-bind="props"
                  ><v-icon>mdi-paperclip</v-icon></v-btn
                >
              </template>
              <v-list>
                <v-list-item @click="triggerimgaeInput('image')"
                  ><v-list-item-title>Image</v-list-item-title></v-list-item
                >
                <v-list-item @click="triggervideoInput('video')"
                  ><v-list-item-title>Video</v-list-item-title></v-list-item
                >
                <v-list-item @click="triggerFileInput('document')"
                  ><v-list-item-title>Document</v-list-item-title></v-list-item
                >
              </v-list>
            </v-menu>
            <input
              type="file"
              ref="filepdfInput"
              :accept="'application/pdf'"
              style="display: none"
              @change="upload_S3"
            />
            <input
              type="file"
              ref="filevideoInput"
              :accept="'video/*'"
              style="display: none"
              @change="upload_S3"
            />
            <input
              type="file"
              ref="fileInput"
              :accept="'image/*'"
              style="display: none"
              @change="upload_S3"
            />
            <!-- <v-btn icon variant="text"><v-icon>mdi-map-marker-outline</v-icon></v-btn> -->
            <v-text-field
              v-model="message"
              placeholder="Type a Message..."
              variant="solo"
              rounded
              density="compact"
              hide-details
              class="chat-input"
              @keyup.enter="sendMessage"
            ></v-text-field>
            <v-btn size="small" class="send-btn" @click="sendMessage"
              ><v-icon>mdi-send</v-icon></v-btn
            >
          </div>
        </v-card>
        <v-card
          v-else
          class="empty-chat d-flex align-center justify-center"
          flat
        >
          <div class="text-center">
            <v-icon size="96" color="grey-lighten-2" class="mb-4"
              >mdi-chat-outline</v-icon
            >
            <h2 class="text-h5 font-weight-regular text-grey-darken-1">
              Select a chat to start messaging
            </h2>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import GroupInfo from "@/components/DialogsList/GroupInfo.vue";
import SnackBar from "@/components/SnackBar.vue";
import CreateGroup from "@/components/DialogsList/CreateGroup.vue";
import { connecttoMQTTMethod } from "@/mixins/MqttConnect";
import { initiateLocalCacheDB } from "@/db.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
var AWS = require("aws-sdk");
import { Auth } from "aws-amplify";
import { Buffer } from "buffer";
const FileSaver = require("file-saver");
import axios from "axios";
import { googleApi } from "@/utils/google-maps.js";
import CreateExternalTicketDialog from "./Tickets/CreateExternalTicketDialog.vue";
import html2canvas from "html2canvas";

export default {
  components: {
    CreateGroup,
    SnackBar,
    GroupInfo,
    CreateExternalTicketDialog,
  },
  mixins: [get_all_org_users, initiateLocalCacheDB, connecttoMQTTMethod],
  props: {
    chatList: {
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
      componetKey: 0,
      componetgroupkey: 0,
      allusers: [],
      searchQuery: "",
      allUSersNames: [],
      replayData: {},
      SnackBarComponent: {},
      replayCheck: false,
      profileBit: false,
      groupData: false,
      loadMessage: false,
      groupMenu: false,
      selectedChat: null,
      message: "",
      uploadtype: "",
      imageUrlCache: {},

      //Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },
  computed: {
    filteredChats() {
      if (!this.searchQuery.trim()) {
        return this.updatedChats;
      }
      return this.updatedChats.filter((chat) => {
        const chatName =
          chat.team_type === "GROUP_CHAT"
            ? chat.team_name
            : this.fetch_user_name(chat.team_name);
        if (chatName) {
          return chatName
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase());
        }
        return false;
      });
    },
    groupedMessages() {
      if (!this.matchedChat || !this.matchedChat.data) {
        return {};
      }
      const groups = this.matchedChat.data.reduce((groups, message) => {
        const date = new Date(message.msg_created_on).toLocaleDateString(
          "en-US",
          { year: "numeric", month: "long", day: "numeric" }
        );
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      }, {});

      const sortedGroups = {};
      Object.keys(groups)
        .sort((a, b) => new Date(a) - new Date(b))
        .forEach((key) => {
          sortedGroups[key] = groups[key];
        });

      // Replace date with "TODAY", "YESTERDAY"
      const finalGroups = {};
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      );

      for (const date in sortedGroups) {
        if (date === today) {
          finalGroups["TODAY"] = sortedGroups[date];
        } else if (date === yesterday) {
          finalGroups["YESTERDAY"] = sortedGroups[date];
        } else {
          finalGroups[date] = sortedGroups[date];
        }
      }
      return finalGroups;
    },
    filteredUsers() {
      if (!this.searchQuery.trim()) {
        return this.allusers;
      }
      return this.allusers.filter((user) => {
        return user.full_user_name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      });
    },
    imageUrls() {
      const urls = {};
      if (this.matchedChat && this.matchedChat.data) {
        this.matchedChat.data.forEach((message) => {
          if (
            message.msg_type === "IMAGE" ||
            message.msg_type === "VIDEO" ||
            message.msg_type === "DOC"
          ) {
            const key = message.msg_payload;
            urls[key] = this.imageUrlCache[key] || "";
          }
          if (
            message.reply_source_msg_type === "IMAGE" ||
            message.reply_source_msg_type === "VIDEO" ||
            message.reply_source_msg_type === "DOC"
          ) {
            const key = message.reply_source_payload;
            urls[key] = this.imageUrlCache[key] || "";
          }
        });
      }
      if (this.replayData && this.replayData.msg_image) {
        urls[this.replayData.msg_image] =
          this.imageUrlCache[this.replayData.msg_image] || "";
      }
      return urls;
    },
    updatedChats() {
      const processedChats = this.chatList.map((chatdata) => {
        const newChatData = { ...chatdata };
        const user = this.messageDataProp.find(
          (user) => user.topic === newChatData.team_topic_id
        );

        if (user && user.data.length > 0) {
          const lastmessagedata = user.data[user.data.length - 1];
          const previous_sent_message =
            newChatData.last_message_on == undefined
              ? lastmessagedata.msg_created_on
              : newChatData.last_message_on;

          newChatData.last_message_on = lastmessagedata.msg_created_on;
          newChatData.previous_message = lastmessagedata.msg_payload;
          newChatData.msg_type = lastmessagedata.msg_type;

          if (newChatData.newMessageCount == undefined) {
            newChatData.newMessageCount = 0;
          }

          if (newChatData.last_message_on != previous_sent_message) {
            if (this.selectedChat == null) {
              newChatData.newMessageCount++;
            } else if (
              this.selectedChat.team_topic_id != newChatData.team_topic_id
            ) {
              newChatData.newMessageCount++;
            } else if (
              this.selectedChat.team_topic_id == newChatData.team_topic_id
            ) {
              newChatData.newMessageCount = 0;
            }
          } else if (this.selectedChat != null) {
            if (this.selectedChat.team_topic_id == newChatData.team_topic_id) {
              newChatData.newMessageCount = 0;
            }
          }
        }
        return newChatData;
      });

      processedChats.sort((a, b) => {
        const aLastMessageDate = a.last_message_on
          ? new Date(a.last_message_on)
          : new Date(a.team_created_on);
        const bLastMessageDate = b.last_message_on
          ? new Date(b.last_message_on)
          : new Date(b.team_created_on);

        return bLastMessageDate - aLastMessageDate;
      });
      return processedChats;
    },
    matchedChat() {
      if (!this.selectedChat) {
        return { data: [] };
      }
      const { team_topic_id } = this.selectedChat;
      const matchedObject = this.messageDataProp.find(
        (item) => item.topic === team_topic_id
      );

      let finalChatObject;

      if (matchedObject) {
        finalChatObject = {
          ...this.selectedChat,
          ...JSON.parse(JSON.stringify(matchedObject)),
        };
      } else {
        finalChatObject = {
          ...this.selectedChat,
          data: [],
        };
      }
      if (finalChatObject.data && finalChatObject.data.length > 0) {
        finalChatObject.data.forEach((member) => {
          if (
            member.msg_type === "IMAGE" ||
            member.msg_type === "VIDEO" ||
            member.msg_type === "DOC"
          ) {
            member.msg_image = member.msg_payload;
          }
        });

        finalChatObject.data = Array.from(
          new Map(
            finalChatObject.data.map((item) => [item.msg_id, item])
          ).values()
        );
      }

      this.scrollToBottom();

      return finalChatObject;
    },
  },
  watch: {
    "matchedChat.data": {
      handler(newData) {
        if (newData) {
          this.loadImageUrls(newData);
        }
      },
      deep: true,
      immediate: true,
    },
    imageUrlCache: {
      handler() {
        this.$forceUpdate();
      },
      deep: true,
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
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const element = this.$refs.scrollContainer;
        if (element) {
          element.scrollTop = element.scrollHeight;
        } else {
          setTimeout(() => {
            const el = this.$refs.scrollContainer;
            if (el) el.scrollTop = el.scrollHeight;
          }, 100);
        }
      });
    },
    shouldShowAvatar(group, index) {
      if (
        this.$store.getters.GetUserObj.user?.user_email_id ===
        group[index].msg_sent_by
      ) {
        return false; // Never show avatar for sent messages
      }
      if (index === group.length - 1) {
        return true; // Show for the last message in the group
      }
      // Show if the next message is from a different sender
      return group[index].msg_sent_by !== group[index + 1].msg_sent_by;
    },
    formatTimestampForList(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }
      // Check if it was within the last week
      if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString("en-US", { weekday: "short" });
      }
      return date.toLocaleDateString("en-US");
    },
    formatTimestampForMessage(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    },
    updateInfo() {
      setTimeout(() => {
        this.selectedChat = this.chatList.find(
          (item) => item.team_id === this.selectedChat.team_id
        );
      }, 2000);
    },
    restgroupInformation() {
      this.groupData = true;
      this.componetgroupkey++;
    },
    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.groupMenu = false;
      this.groupData = false;
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
    groupCraete() {
      this.componetKey++;
    },
    toggleGroupMenu() {
      this.groupMenu = !this.groupMenu;
      if (this.groupMenu) {
        this.groupCraete();
      }
    },
    replaymessage(val) {
      this.replayCheck = true;
      this.replayData = val;
    },
    closeReply() {
      this.replayCheck = false;
    },
    async downloadlist(url) {
      const details = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(url, details.s3_details);
      if (signedUrl) {
        this.dwonload_pdf(
          signedUrl,
          `${signedUrl.split("/").pop().split("?")[0]}`
        );
      }
    },
    async dwonload_pdf(url, fileName) {
      axios({
        url: url,
        method: "GET",
        responseType: "blob",
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
    triggerimgaeInput() {
      this.uploadtype = "IMAGE";
      this.$refs.fileInput.click();
    },
    triggervideoInput() {
      this.uploadtype = "VIDEO";
      this.$refs.filevideoInput.click();
    },
    triggerFileInput() {
      this.uploadtype = "DOC";
      this.$refs.filepdfInput.click();
    },
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },
    async upload_S3(event) {
      const files = event.target.files[0];
      if (!files) {
        return;
      }
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user?.user_id;
      const key =
        "chat" +
        "/" +
        orgDetails.organization.organization_id +
        "/" +
        this.selectedChat.team_topic_id +
        "/" +
        userId +
        "/" +
        Date.now() +
        "/" +
        files.name.split(" ").join("");
      try {
        const fileUrl = await uploadToS3(files, orgDetails.s3_details, key);
        if (fileUrl) {
          this.urls = fileUrl;
          let data = this.$store.getters.GetUserObj;
          let msg;
          if (this.replayCheck == false) {
            msg = {
              data_type: "JSON",
              message_type:
                this.selectedChat.team_type == "GROUP_CHAT"
                  ? "CHAT_MESSAGE"
                  : "ONE_ON_ONE_MESSAGE",
              topic: this.selectedChat.team_topic_id,
              data: {
                is_reply_msg: false,
                msg_created_on: Date.now(),
                msg_id: this.selectedChat.team_topic_id + "__" + Date.now(),
                msg_payload: this.urls,
                msg_sent_by: data.user.user_email_id,
                msg_status: "SENT",
                msg_topic: this.selectedChat.team_topic_id,
                msg_type: this.uploadtype,
              },
            };
          } else {
            msg = {
              data_type: "JSON",
              message_type:
                this.selectedChat.team_type == "GROUP_CHAT"
                  ? "CHAT_MESSAGE"
                  : "ONE_ON_ONE_MESSAGE",
              topic: this.selectedChat.team_topic_id,
              data: {
                is_reply_msg: true,
                msg_created_on: Date.now(),
                msg_id: this.selectedChat.team_topic_id + "__" + Date.now(),
                msg_payload: this.urls,
                msg_sent_by: data.user.user_email_id,
                msg_status: "SENT",
                msg_topic: this.selectedChat.team_topic_id,
                msg_type: this.uploadtype,
                reply_source_msg_id: this.replayData.msg_id,
                reply_source_msg_sent_by: this.replayData.msg_sent_by,
                reply_source_msg_type: this.replayData.msg_type,
                reply_source_payload: this.replayData.msg_payload,
              },
            };
          }
          this.replayCheck = false;
          this.urls = "";
          this.$emit("publishsent", {
            team_topic_id: this.selectedChat.team_topic_id,
            message: JSON.stringify(msg),
          });
        }
      } catch (err) {
        // console.log(err);
      }
    },
    getTimeFromTimestamp(timestamp) {
      const date = new Date(timestamp);
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    },
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    profileList() {
      this.searchQuery = "";
      if (this.profileBit == true) {
        this.profileBit = false;
      } else {
        this.profileBit = true;
      }
    },
    selectChat(chat) {
      if (chat.team_type == "GROUP_CHAT") {
        const matchedObject = this.messageDataProp.find(
          (item) => item.topic === chat.team_topic_id
        );
        if (matchedObject != undefined) {
          this.selectedChat = matchedObject;
          this.selectedChat.team_name = chat.team_name;
          this.selectedChat.team_topic_id = chat.team_topic_id;
          this.selectedChat.team_type = chat.team_type;
          this.selectedChat.team_id = chat.team_id;
          this.selectedChat.team_created_on = chat.team_created_on;
          this.selectedChat.team_created_by = chat.team_created_by;
          this.selectedChat.team_owner_id = chat.team_owner_id;
          this.selectedChat.restricted_users = chat.restricted_users;
        } else {
          this.selectedChat = [];
          this.selectedChat.data = [];
          this.selectedChat.team_name = chat.team_name;
          this.selectedChat.team_topic_id = chat.team_topic_id;
          this.selectedChat.team_type = chat.team_type;
          this.selectedChat.team_id = chat.team_id;
          this.selectedChat.team_created_on = chat.team_created_on;
          this.selectedChat.team_created_by = chat.team_created_by;
          this.selectedChat.team_owner_id = chat.team_owner_id;
          this.selectedChat.restricted_users = chat.restricted_users;
        }
      } else if (chat.team_type == "ONE_ON_ONE_MESSAGE") {
        const matchedObject = this.messageDataProp.find(
          (item) => item.topic === chat.team_topic_id
        );
        if (matchedObject != undefined) {
          this.selectedChat = matchedObject;
          this.selectedChat.team_name = this.fetch_user_name(chat.team_name);
          this.selectedChat.team_email = chat.team_name;
          this.selectedChat.team_topic_id = chat.team_topic_id;
          this.selectedChat.team_type = chat.team_type;
          this.selectedChat.team_id = chat.team_id;
        } else {
          this.selectedChat = [];
          this.selectedChat.data = [];
          this.selectedChat.team_email = chat.team_name;
          this.selectedChat.team_name = chat.team_name;
          this.selectedChat.team_topic_id = chat.team_topic_id;
          this.selectedChat.team_type = chat.team_type;
          this.selectedChat.team_id = chat.team_id;
        }
      } else {
        let topic = [
          chat.user_email_id,
          this.$store.getters.GetUserObj.user?.user_email_id,
        ]
          .sort()
          .join("~");

        const matchedObject = this.messagedata.find(
          (item) => item.topic === topic
        );
        if (matchedObject) {
          this.selectedChat = matchedObject;
          this.selectedChat.team_name = chat.full_user_name;
          this.selectedChat.team_topic_id = topic;
          this.selectedChat.team_type = "ONE_ON_ONE_MESSAGE";
          this.selectedChat.team_id = chat.user_email_id;
          this.selectedChat.team_email = chat.user_email_id;
        } else {
          this.selectedChat = [];
          this.selectedChat.data = [];
          this.selectedChat.team_name = chat.full_user_name;
          this.selectedChat.team_topic_id = topic;
          this.selectedChat.team_id = chat.user_email_id;
          this.selectedChat.team_email = chat.user_email_id;
          this.selectedChat.team_type = "ONE_ON_ONE_MESSAGE";
        }
      }
      this.groupData = false;
      this.replayCheck = false;
      this.profileBit = false;

      this.scrollToBottom();
    },
    handleScroll() {
      // Logic for infinite scroll can go here
    },
    fetch_user_profilepic(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          if (element.user_email_id == value) {
            if (
              element.user_profile_pic_url != undefined &&
              element.user_profile_pic_url != "N/A" &&
              element.user_profile_pic_url != " " &&
              element.user_profile_pic_url != ""
            );
            {
              name = element.user_profile_pic_url;
            }
          }
        }
      });

      return name;
    },
    fetch_user_profile(value) {
      var name = false;
      this.allUSersNames.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          if (element.user_email_id == value) {
            if (
              element.user_profile_pic_url != undefined &&
              element.user_profile_pic_url != "N/A" &&
              element.user_profile_pic_url != " " &&
              element.user_profile_pic_url != ""
            ) {
              name = true;
            }
          }
        }
      });
      return name;
    },
    sendMessage() {
      if (this.message.trim() && this.message.length > 0) {
        var data = this.$store.getters.GetUserObj;
        let msg;
        if (this.replayCheck == false) {
          msg = {
            data_type: "JSON",
            message_type:
              this.selectedChat.team_type == "GROUP_CHAT"
                ? "CHAT_MESSAGE"
                : "ONE_ON_ONE_MESSAGE",
            topic: this.selectedChat.team_topic_id,
            data: {
              is_reply_msg: false,
              msg_created_on: Date.now(),
              msg_id: this.selectedChat.team_topic_id + "__" + Date.now(),
              msg_payload: this.message,
              msg_sent_by: data.user.user_email_id,
              msg_status: "SENT",
              msg_topic: this.selectedChat.team_topic_id,
              msg_type: "TEXT",
            },
          };
        } else {
          msg = {
            data_type: "JSON",
            message_type:
              this.selectedChat.team_type == "GROUP_CHAT"
                ? "CHAT_MESSAGE"
                : "ONE_ON_ONE_MESSAGE",
            topic: this.selectedChat.team_topic_id,
            data: {
              is_reply_msg: true,
              msg_created_on: Date.now(),
              msg_id: this.selectedChat.team_topic_id + "__" + Date.now(),
              msg_payload: this.message,
              msg_sent_by: data.user.user_email_id,
              msg_status: "SENT",
              msg_topic: this.selectedChat.team_topic_id,
              msg_type: "TEXT",
              reply_source_msg_id: this.replayData.msg_id,
              reply_source_msg_sent_by: this.replayData.msg_sent_by,
              reply_source_msg_type: this.replayData.msg_type,
              reply_source_payload: this.replayData.msg_payload,
            },
          };
        }
        this.replayCheck = false;
        this.$emit("publishsent", {
          team_topic_id: this.selectedChat.team_topic_id,
          message: JSON.stringify(msg),
        });
        this.message = "";
        this.scrollToBottom();
      }
    },
    async getImageUrl(imageurl) {
      if (!imageurl) return "";
      if (this.imageUrlCache[imageurl]) {
        return this.imageUrlCache[imageurl];
      }
      try {
        const details = this.$store.getters.GetOrgDetails;
        let urlToProcess = imageurl;
        if (!imageurl.startsWith("http")) {
          urlToProcess = `https://${details.s3_details.bucket_name}.s3.${details.s3_details.region}.amazonaws.com/${imageurl}`;
        }
        const signedUrl = await getS3SignedUrl(
          urlToProcess,
          details.s3_details
        );
        if (!signedUrl) {
          this.imageUrlCache[imageurl] = "";
          return "";
        }
        this.imageUrlCache[imageurl] = signedUrl;
        return signedUrl;
      } catch (error) {
        console.error("Error getting signed URL:", error);
        this.imageUrlCache[imageurl] = "";
        return "";
      }
    },
    getCachedImageUrl(imageurl) {
      if (!imageurl) return "";
      return this.imageUrlCache[imageurl] || "";
    },
    async loadImageUrls(messages) {
      if (!messages) return;
      for (const message of messages) {
        if (
          message.msg_type === "IMAGE" ||
          message.msg_type === "VIDEO" ||
          message.msg_type === "DOC"
        ) {
          if (!this.imageUrlCache[message.msg_payload]) {
            await this.getImageUrl(message.msg_payload);
          }
        }
        if (
          message.reply_source_msg_type === "IMAGE" ||
          message.reply_source_msg_type === "VIDEO" ||
          message.reply_source_msg_type === "DOC"
        ) {
          if (!this.imageUrlCache[message.reply_source_payload]) {
            await this.getImageUrl(message.reply_source_payload);
          }
        }
      }
      if (
        this.replayData &&
        this.replayData.msg_image &&
        !this.imageUrlCache[this.replayData.msg_image]
      ) {
        await this.getImageUrl(this.replayData.msg_image);
      }
    },
    fetch_details() {
      var data = this.$store.getters.GetUserObj;

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          if (element.user_email_id != data.user.user_email_id) {
            this.allusers.push({
              full_user_name: element.full_user_name,
              user_email_id: element.user_email_id,
              user_id: element.user_id,
              user_profile_pic_url: element.user_profile_pic_url,
              designation: element.designation,
            });
          }
        }
      });
    },
  },
  async mounted() {
    await this.get_all_org_users();
    await this.fetch_details();
    this.allUSersNames = this.orgUsers;
  },
};
</script>

<style scoped>
/* General Layout */
.chat-container {
  height: calc(100vh - 64px); /* Subtract app bar height */
  background-color: #fff;
  overflow: hidden;
}

.chat-layout {
  height: 100%;
}

/* Sidebar */
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
  margin-left: 12px;
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
}

.chat-list-item--active {
  background-color: #fce4ec !important; /* A light pink/purple shade */
}

.chat-list-item .v-list-item-subtitle {
  display: flex;
  align-items: center;
  gap: 4px;
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
  background-color: #4a90e2 !important;
  color: white !important;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
}

/* Chat Window */
.chat-window {
  display: flex;
  flex-direction: column;
  height: 90%;
  background-color: #fff;
}

.chat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f7f9fa !important;
  min-height: 0;
}

.chat-header {
  background-color: #fff !important;
  border-bottom: 1px solid #e0e0e0;
}

.chat-header .v-list-item-title {
  font-weight: 600;
}

.chat-header .action-btn {
  color: #757575 !important;
}

/* Messages Area */
.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.date-divider {
  text-align: center;
  margin: 16px 0;
  font-size: 12px;
  font-weight: 600;
  color: #757575;
  text-transform: uppercase;
}

.message-group {
  display: flex;
  margin-bottom: 4px;
  align-items: flex-end;
  gap: 8px;
}

.message-group.sent {
  justify-content: flex-end;
}

.message-group.received {
  justify-content: flex-start;
}

.sender-avatar {
  margin-bottom: 18px; /* Align with last message line */
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 65%;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.5;
  position: relative;
  margin-bottom: 2px;
}

.message-group.sent .message-content-wrapper {
  align-items: flex-end;
}

.message-group.received .message-content-wrapper {
  align-items: flex-start;
}

.message-group.sent .message-bubble {
  background-color: #e1f5fe; /* Light blue for sent messages */
  border-bottom-right-radius: 4px;
  text-align: left;
}

.message-group.received .message-bubble {
  background-color: #fff;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-timestamp {
  font-size: 12px;
  color: #9e9e9e;
}

/* Document Message */
.doc-message-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background-color: #f5f5f5;
  min-width: 250px;
}
.doc-icon {
  color: #4a90e2;
}
.doc-info {
  flex: 1;
  overflow: hidden;
}
.doc-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.doc-size {
  font-size: 12px;
  color: #757575;
}

/* Image Message */
.image-message {
  border-radius: 16px;
  max-width: 100%;
}

/* Input Area */
.chat-input-area {
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-input {
  flex: 1;
}

.chat-input :deep(.v-field) {
  background-color: #f5f5f5;
  border-radius: 20px;
  box-shadow: none;
}

.send-btn {
  background-color: #4a90e2 !important;
  color: white !important;
  box-shadow: none !important;
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

.empty-chat {
  background-color: #fff !important;
}
</style>
