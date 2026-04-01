<template>
  <div>
    <v-toolbar
      flat
      v-show="$store.getters.Getappitems.is_dashboard_admin == false"
    >
      <v-spacer />
      <v-btn dark class="text-capitalize cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn></v-toolbar
    >
    <v-toolbar dense>
      <v-spacer />
      <v-toolbar-title class="justify-center">ChatGPT</v-toolbar-title>
      <v-spacer />
    </v-toolbar>
    <v-responsive class="overflow-y-auto mt-2" :height="height">
      <v-card
        v-if="checkResponse == 1"
        class="mx-auto"
        max-width="400"
        outlined
      >
        <v-card-title>{{ errorMsg }}</v-card-title>
      </v-card>

      <!-- <v-toolbar dark v-if="checkResponse == 1" dense flat>
        <v-toolbar-title>{{ errorMsg }}</v-toolbar-title>
      </v-toolbar> -->
      <div v-if="checkResponse == 0" class="chat-container">
        <div
          class="chat-message"
          v-for="(message, index) in chatMSG"
          :key="index"
        >
          <div class="chat-bubble">
            <div class="chat-content text-left ml-2">
              {{ get_date(message.time) }} by <b>{{ fullname }}</b>
            </div>
            <br />
            <div class="chat-content text-left ml-2">
              <b>{{ username }} </b>: {{ message.qmsg }} ?
            </div>
            <br />
            <div class="chat-content text-left ml-2">
              <b>Yo@{{ team_id }} : </b> {{ message.msg }}
            </div>
            <br />
          </div>
        </div>
      </div>
    </v-responsive>

    <!-- <v-app app> -->
    <!-- <v-app-bar color="blue" app>
        <v-app-bar-nav-icon>
          <v-icon color="white">mdi-arrow-left</v-icon>
        </v-app-bar-nav-icon>
        <v-toolbar-title class="white--text"> </v-toolbar-title>
      </v-app-bar> -->

    <!-- <v-container class="fill-height"> -->
    <!-- <v-row class="fill-height typing-container" align="end">
        <v-col> -->
    <!-- <div
      v-for="(item, index) in chatMSG"
      :key="index"
      class="ma-4 typing-container pageBreak"
    >
      <p class="black--text pageBreak ma-3">
        {{ item.msg }}
      </p>
    </div> -->
    <!-- <v-card
      class="ma-4 pageBreak"
      v-for="(item, index) in chatMSG"
      :key="index"
    >
      <v-card-text class="black--text pageBreak">
        <div class="text-left">{{ item.msg }}</div>
      </v-card-text>
    </v-card> -->
    <!-- </v-col>
      </v-row> -->
    <!-- </v-container> -->

    <v-footer fixed>
      <v-container class="elevation-0 ml-12 pa-0">
        <v-row no-gutters>
          <v-col cols="12">
            <div class="d-flex flex-row align-center">
              <v-text-field
                v-model="textInfo"
                dense
                outlined
                placeholder="Type Something"
                @keyup.enter="send_msg()"
              ></v-text-field>
              <v-btn
                :loading="loading"
                icon
                class="ml-4 mt-n6"
                @click="send_msg()"
                ><v-icon>mdi-send</v-icon></v-btn
              >
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
    <!-- </v-app> -->
  </div>
</template>

<script>
/* eslint-disable */
import { get_session_messages } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
var axios = require("axios");
export default {
  mixins: [get_Org_details],
  data() {
    return {
      textInfo: "",
      chatMSG: [],
      userEmail: "",
      username: "",
      fullname: "",
      orgApiKey: "",
      height: 0,
      team_id: "",
      session_id: "",
      loading: false,
      checkResponse: 0,
      errorMsg: "",
    };
  },
  async created() {
    this.height = window.innerHeight - 280;
    this.chatMSG = [];
    await this.get_Org_details();

    this.username = this.$store.getters.GetUserObj.user.first_name;
    this.orgApiKey = this.orgDetails.organization.team_api_key;
    this.userEmail = this.$store.getters.GetUserObj.user.user_email_id;
    this.team_id = this.orgDetails.organization.organization_team_id;
    this.fullname = this.$store.getters.GetUserObj.user.full_user_name;
    this.session_id = this.$store.getters.GetUserObj.session_id;
    this.list_gpt();
  },
  methods: {
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    // send_msg() {
    //   this.chat.push({
    //     msg: this.textInfo,
    //   });
    //   this.msg = null;

    //   // this.addReply();
    // },

    get_date(date) {
      let a = new Date(date).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    addReply() {
      this.chatMSG.push({
        msg: "Royal Challengers Bangalore is a franchise cricket team based in Bangalore, India, which plays in the Indian  Premier League (IPL). The team is owned by United Spirits Limited, a subsidiary of the United Breweries Group. The team plays its home matches at the M. Chinnaswamy Stadium in Bangalore. The team is currently captained by Virat Kohli, and coached by Daniel Vettori",
        qmsg: "Rcb Team",
      });
      this.textInfo = "";
      this.loading = false;
    },
    async send_msg() {
      this.loading = true;
      axios({
        method: "POST",
        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/chatgpt_search",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
        },
        data: {
          user_email_id: this.userEmail,
          prompt_message: this.textInfo,
          organization_api_key: this.orgApiKey,
          session_id: this.session_id,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.loading = false;
            this.chatMSG.push({
              msg: res.data.payload,
              qmsg: res.data.prompt_message,
              time: res.data.timeStamp,
            });

            this.textInfo = "";
          } else {
            this.checkResponse = 1;
            this.loading = false;
            this.errorMsg = res.data.Message;
            this.textInfo = "";
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    async list_gpt() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_session_messages, {
            input: {
              session_id: this.session_id,
            },
          })
        );
        this.tableData = [];
        var dataArray = [];
        var response = JSON.parse(result.data.get_session_messages);

        if (response.Status == "SUCCESS") {
          if (response.payload.length > 0) {
            for (let i = 0; i < response.payload.length; i++) {
              this.chatMSG.push({
                msg: response.payload[i].payload,
                qmsg: response.payload[i].prompt_message,
                time: response.payload[i].timeStamp,
              }); //8f3bb4e8-5df9-4957-a995-b704a40849b3
            }
          } else {
            this.chatMSG.concat(response.payload);
          }
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>
<style>
p {
  /* border-right: 3px solid #000; */
  display: block;
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* white-space: nowrap; */
  overflow: hidden;
  margin: 0 left;
  letter-spacing: 0.15em;
  /* animation: typing 3s steps(40, end); */
  /* width: 100%; */
  /* width: 100%; */

  /* word-break: break-all; */
}
.typing-container {
  width: 100%;
  /* white-space: nowrap;
  display: block;
  word-break: break-all; */
}
.pageBreak {
  page-break-before: auto;
  page-break-after: auto;
  page-break-inside: avoid;
  position: relative;
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 80px;
}
.chat-message {
  display: flex;
  margin-bottom: 20px;
}
.chat-bubble {
  /* display: flex; */
  /* flex-direction: column; */
  justify-content: left;
  align-content: center;
  width: 100%;
  padding: 2px;
  border-radius: 10px;
  background-color: #f1f0f0;
}
.chat-content {
  white-space: pre-wrap;
}
.fixed-bar {
  position: sticky;
  position: -webkit-sticky; /* for Safari */
  top: 6em;
  z-index: 2;
}
</style>


