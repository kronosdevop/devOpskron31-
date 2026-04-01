<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-row class="no-gutters">
          <v-col
            cols="12"
            sm="4"
            class="flex-grow-1 flex-shrink-0"
            style="border-right: 1px solid #0000001f"
          >
            <v-responsive
              :height="userListHeight"
              class="overflow-y-auto fill-height"
            >
              <v-toolbar dense>
                <v-avatar
                  v-if="userProfile != 'N/A'"
                  size="32"
                  class="mt-1 mb-1"
                >
                  <v-img :src="userProfile" />
                </v-avatar>
                <v-avatar
                  class="ml-1"
                  :color="connectedCheck == 0 ? 'red' : 'green'"
                  size="13"
                />
                <v-spacer> </v-spacer>
                <v-icon @click="initiate_chat()" color="black"
                  >mdi-plus-thick</v-icon
                >
              </v-toolbar>
              <!-- <v-toolbar dense> -->
              <!-- <v-text-field
                class="mt-2"
                dense
                placeholder="Search For Chats"
                outlined
              /> -->
              <div v-if="initiateCheck == 1">
                <v-list v-for="(user, index) in userList" :key="index">
                  <v-list-item @click="initiate_chat_item(user)">
                    <v-list-item-avatar>
                      <div
                        v-if="user.user_profile_pic_url != 'N/A'"
                        class="caption"
                      >
                        <v-avatar size="32" class="mt-1 mb-1">
                          <v-img :src="user.user_profile_pic_url" />
                        </v-avatar>
                      </div>
                      <div v-else>
                        <v-avatar
                          size="34"
                          class="mt-1 mb-1"
                          color="primaryColor"
                        >
                          <span class="white--text">
                            {{ user.full_user_name.substring(0, 1) }}</span
                          >
                        </v-avatar>
                      </div>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{
                        user.full_user_name
                      }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider v-if="index !== userList.length - 1"></v-divider>
                </v-list>
              </div>
              <!-- </v-toolbar> -->
              <div
                class="mt-n3"
                v-if="chatContacts.length != 0 && initiateCheck == 0"
              >
                <v-list v-for="(contact, index) in chatContacts" :key="index">
                  <v-list-item @click="fetch_clicked_item(contact)">
                    <v-list-item-avatar>
                      <div
                        v-if="
                          contact.userDetails == undefined
                            ? ''
                            : contact.userDetails.user_profile_pic_url != 'N/A'
                        "
                        class="caption"
                      >
                        <v-avatar size="32" class="mt-1 mb-1">
                          <v-img
                            :src="
                              contact.userDetails == undefined
                                ? ''
                                : contact.userDetails.user_profile_pic_url
                            "
                          />
                        </v-avatar>
                      </div>
                      <div v-else>
                        <v-avatar
                          size="34"
                          class="mt-1 mb-1"
                          color="primaryColor"
                        >
                          <span class="white--text">
                            {{
                              contact.userDetails == undefined
                                ? ""
                                : contact.userDetails.full_user_name.substring(
                                    0,
                                    1
                                  )
                            }}</span
                          >
                        </v-avatar>
                      </div>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title>{{
                        contact.userDetails.full_user_name
                      }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider
                    v-if="index !== chatContacts.length - 1"
                  ></v-divider>
                </v-list>
              </div>
            </v-responsive>
          </v-col>
          <v-col
            v-if="selectedUser.userDetails != undefined"
            cols="auto"
            class="flex-grow-1 flex-shrink-0"
          >
            <v-responsive
              class="overflow-y-hidden fill-height"
              :height="userListHeight"
            >
              <v-card flat class="d-flex flex-column fill-height">
                <v-system-bar height="40" dark>
                  <div
                    v-if="
                      selectedUser.userDetails.user_profile_pic_url != 'N/A'
                    "
                    class="caption"
                  >
                    <v-avatar size="32" class="mt-1 mb-1">
                      <v-img
                        :src="selectedUser.userDetails.user_profile_pic_url"
                      />
                    </v-avatar>
                  </div>
                  <div v-else>
                    <v-avatar size="34" class="mt-1 mb-1" color="primaryColor">
                      <span class="white--text">
                        {{
                          selectedUser.userDetails.full_user_name.substring(
                            0,
                            1
                          )
                        }}</span
                      >
                    </v-avatar>
                  </div>
                  <div class="white--text ml-2">
                    {{ selectedUser.userDetails.full_user_name }}
                  </div>
                </v-system-bar>
                <v-card-text class="flex-grow-1 overflow-y-auto">
                  <template v-for="(msg, i) in messages" :key="i">
        <div class="d-flex flex-row-reverse">
                      <!-- :class="{ 'd-flex flex-row-reverse': msg.me }" -->
                      <v-menu offset-y>
                        <template #activator="{ on }">
                          <v-hover #default="{ hover }">
                            <!-- :color="msg.me ? 'primary' : ''" -->
                            <v-chip
                              color="primary"
                              dark
                              style="height: auto; white-space: normal"
                              class="pa-4 mb-2"
                              v-on="on"
                            >
                              {{ msg.data.msg_payload }}
                              <sub class="ml-2" style="font-size: 0.5rem">{{
                                get_time(msg.data.msg_created_on)
                              }}</sub>
                              <v-icon v-if="hover" small> </v-icon>
                            </v-chip>
                          </v-hover>
                        </template>
                        <v-list>
                          <v-list-item>
                            <v-list-item-title>delete</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </template>
                </v-card-text>
                <v-card-text class="flex-shrink-1">
                  <div class="d-flex flex-row">
                    <v-text-field
                      v-model="newMessage"
                      dense
                      outlined
                      placeholder="Type Something"
                      @keyup.enter="send_msg()"
                    ></v-text-field>
                    <v-btn icon class="ml-4" @click="send_msg()"
                      ><v-icon>mdi-send</v-icon></v-btn
                    >
                  </div>
                </v-card-text>
              </v-card>
            </v-responsive>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
// import Paho from "paho-mqtt";
// import mqtt, { connect } from "mqtt";
import mqttDtata from "@/mixins/MqttConnection.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { elements } from "chart.js";

export default {
  data() {
    return {
      newMessage: "",
      messages: [],
      client: null,
      userListHeight: 0,
      receviedMessages: [],
      userList: [],
      chatContacts: [],
      getUser: "",
      selectedUser: "",
      listHeight: 0,
      currentUserDetails: [],
      userProfile: "",
      initiateCheck: 0,
      connectedCheck: 0,
    };
  },

  mixins: [get_all_org_users],
  async mounted() {
    // localStorage.setItem("allMessages", []);
    this.userProfile = this.$store.getters.GetUserObj.user.user_profile_pic_url;
    this.userListHeight = window.innerHeight - 90;
    this.listHeight = window.innerHeight - 200;
    await this.get_all_org_users();
    this.fetch_users();
    this.fetch_list_onconnect();
    // this.fetch_users_list("initial");
    await this.connect();
  },
  methods: {
    initiate_chat() {
      this.initiateCheck = 1;
    },
    async connect() {
      var data = this.$store.getters.GetUserObj;
      // console.log(this.client);
      this.client = await mqttDtata.connect(data, this.onMQTTConnect);
      // console.log(this.client);
      this.$store.commit("SetMqttClient", this.client);
      this.client.onConnectionLost = this.onConnectionLost;
      this.client.onMessageArrived = this.onMessageArrived;
    },

    onConnectionLost(responseObject) {
      // console.log("connection lost");
      // this.connect();
      if (responseObject.errorCode !== 0) {
        // console.log("Connection lost:", responseObject.errorMessage);
      }
    },
    get_time(value) {
      var time = new Date(value);
      var timeValue = time.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return timeValue;
    },
    initiate_chat_item(value) {
      this.messages = [];
      var data = {
        userName: value.user_email_id,
        userDetails: value,
        msgType: "TEXT",
        topic: this.generate_topic(value),
      };
      this.selectedUser = data;
      this.initiateCheck = 0;
    },

    generate_topic(value) {
      var currentUserEmail = this.$store.getters.GetUserObj.user.user_email_id;
      const emails = [currentUserEmail, value.user_email_id].sort();
      const topic = emails.join("~");
      return topic;
    },

    fetch_clicked_item(item) {
      // console.log(item, "ssssssssssssss");
      this.messages = [];
      this.selectedUser = item;
      const storedData = localStorage.getItem("allMessages");
      // console.log(storedData);
      const allText = JSON.parse(storedData);
      // console.log(allText);
      allText.forEach((element) => {
        if (element.topic === item.topic) {
          this.messages.push(element);
        }
      });
    },

    onMQTTConnect() {
      var data = this.$store.getters.GetUserObj;
      this.connectedCheck = 1;
      // console.log("connected");
      this.subscribe_all_topics(data);

      // this.client.subscribe("mohankumar@mobil80.com~radhika@mobil80.com");
      // this.fetch_message();
    },

    subscribe_all_topics(data) {
      var currentUserEmail = data.user.user_email_id;

      this.userList.forEach((user) => {
        if (user.user_email_id !== currentUserEmail) {
          const emails = [currentUserEmail, user.user_email_id].sort();
          const topic = emails.join("~");
          this.client.subscribe(topic);
        }
      });
    },

    fetch_users() {
      this.userList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push(element);
        }
      });
    },

    fetch_list_onconnect() {
      this.chatContacts = [];
      var currentUser = this.$store.getters.GetUserObj.user.user_email_id;
      const storedData = localStorage.getItem("allMessages");

      if (storedData != "") {
        const retrievedArray = JSON.parse(storedData);
        for (var i = 0; i < retrievedArray.length; i++) {
          if (retrievedArray[i].message_type == "ONE_ON_ONE_MESSAGE") {
            this.chatContacts.push({
              userName: this.fetch_user_name(
                retrievedArray[i].topic,
                currentUser
              ),
              userDetails: this.fetch_user_details(this.getUser),
              msgType: retrievedArray[i].data.msg_type,
              msgSentOn: retrievedArray[i].data.msg_created_on,
              topic: retrievedArray[i].topic,
            });
          }
        }
      }
      const uniqueArrayOfObjects = this.chatContacts.filter(
        (obj, index, self) =>
          index === self.findIndex((o) => o.userName === obj.userName)
      );
      this.chatContacts = uniqueArrayOfObjects;
      this.selectedUser =
        this.chatContacts.length != 0 ? this.chatContacts[0] : "";
    },

    onMessageArrived(messgae) {
      var data = JSON.parse(messgae.payloadString);

      this.initiateCheck = 0;
      // console.log(JSON.parse(messgae.payloadString));
      this.receviedMessages.push(data);

      // console.log(this.receviedMessages);
      localStorage.setItem(
        "allMessages",
        JSON.stringify(this.receviedMessages)
      );
      this.push_messsages_to_respective_user(data);
      // this.fetch_users_list("onmessages");
    },

    push_messsages_to_respective_user(data) {
      var currentUser = this.$store.getters.GetUserObj.user.user_email_id;

      let topicMatchFound = false;
      if (this.chatContacts.length != 0) {
        let topi_index = this.chatContacts
          .map((s) => s.topic)
          .indexOf(data.topic);
        if (topi_index > -1) {
          this.messages.push(data);
          topicMatchFound = true;
        }
      }
      if (!topicMatchFound) {
        this.chatContacts.push({
          userName: this.fetch_user_name(data.topic, currentUser),
          userDetails: this.fetch_user_details(this.getUser),
          msgType: data.data.msg_type,
          // msgSentOn: data.data.msg_created_on,
          topic: data.topic,
        });
        if (data.topic == this.selectedUser.topic) {
          this.messages.push(data);
        }
      }
      if (this.selectedUser != "") {
        for (let i = 0; i < this.messages.length; i++) {
          if (this.messages[i].topic != this.selectedUser.topic) {
            delete this.messages[i];
          }
        }
        this.messages = this.messages.filter(Boolean);
      }
    },

    fetch_users_list(value) {
      var currentUser = this.$store.getters.GetUserObj.user.user_email_id;
      const storedData = localStorage.getItem("allMessages");

      const retrievedArray = JSON.parse(storedData);
      for (var a = 0; a < retrievedArray.length; a++) {
        var messageMatched = false;

        for (var b = 0; b < this.chatContacts.length; b++) {
          if (
            retrievedArray[a].message_type === "ONE_ON_ONE_MESSAGE" &&
            retrievedArray[a].topic === this.chatContacts[b].topic
          ) {
            messageMatched = true;
            break; // Exit loop since message is matched
          }
        }

        if (
          retrievedArray[a].message_type === "ONE_ON_ONE_MESSAGE" &&
          !messageMatched
        ) {
          this.chatContacts.push({
            userName: this.fetch_user_name(
              retrievedArray[a].topic,
              currentUser
            ),
            userDetails: this.fetch_user_details(this.getUser),
            msgType: retrievedArray[a].data.msg_type,
            // msgSentOn: retrievedArray[a].data.msg_created_on,
            topic: retrievedArray[a].topic,
          });

          // this.messages.push(retrievedArray[a].data.msg_payload);
        }
      }
    },

    fetch_user_name(topic, currentUserEmail) {
      const users = topic.split("~");
      const otherUser = users.find((user) => user !== currentUserEmail);
      this.getUser = otherUser;
      return otherUser;
    },

    fetch_user_details(value) {
      var data = "";
      this.userList.forEach((element) => {
        if (element.user_email_id == value) {
          data = element;
        }
      });
      return data;
    },

    send_msg() {
      var received = {
        data_type: "JSON",
        data: {
          msg_id: this.selectedUser.topic + "_" + Date.now(),
          msg_topic: this.selectedUser.topic,
          msg_sent_by: this.$store.getters.GetUserObj.user.user_email_id,
          device_id: this.$store.getters.GetUserObj.user.device_id,
          msg_payload: this.newMessage,
          msg_created_on: Date.now(),
          msg_type: "TEXT",
        },
        message_type: "ONE_ON_ONE_MESSAGE",
        topic: this.selectedUser.topic,
      };
      this.client.send(this.selectedUser.topic, JSON.stringify(received), 1);
      this.newMessage = ""; // Clear the input field
    },
  },
};
</script>
<style>
.chat-messages {
  overflow-y: auto; /* Enable scrolling for overflow */
}

.messages-container {
  scroll-behavior: smooth; /* For smooth scrolling */
}

.chat-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px; /* Adjust margin as needed */
}
</style>