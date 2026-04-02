<template>
  <div>
    <v-card  flat class="mt-4 ml-4">
      <!-- <v-card-title>{{ channelName }}</v-card-title> -->
      <v-card-text class="">
        <v-row class="mt-n6">
          <v-col cols="12">
            <label class="font-weight-bold">Broadcast API key : </label>
            <span ref="textInputapi">{{ api_key }}</span>
            <v-btn x-small @click="copyToClipboard_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
            <v-tooltip bottom>
              <template #activator="{ on }">
                <v-btn v-on="on" x-small @click="regenrate_api_key()" text>
                  <v-icon> mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>Regenerate the API Key</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" class="mt-n3">
            <label class="font-weight-bold"
              ><label style="color: green">POST</label> Publish Message :</label
            >
            <v-icon small color="green" class="mt-n1">mdi-lock-outline</v-icon
            ><br />
            <span ref="textInputurl">{{ url }}</span>
            <v-btn x-small @click="copyToClipboard_url()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" class="mt-n2 mb-5">
            <label class="font-weight-bold">Team-API-Key :</label>
            <v-icon small color="green">mdi-key</v-icon><br />
            <span ref="mySpan">{{ teamApiKey }}</span>
            <v-btn x-small @click="copyToClipboard_x_api_key(teamApiKey)" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>

        <!-- <v-row class="">
          <v-col cols="12" class="mt-n8 mb-5">
            <label class="font-weight-bold">Command :</label>
            <v-icon small color="green">mdi-comment</v-icon><br />
            <span ref="mySpan">{{ commandKey }}</span>
            <v-btn x-small @click="copyToClipboard_x_api_key(commandKey)" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row> -->
        <v-row class="">
          <v-col cols="12" class="mt-n6">
            <label class="font-weight-bold">BODY raw</label>

            <v-textarea readonly v-model="content" outlined height="240px">
            </v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
  <script>
import SnackBar from "@/components/SnackBar.vue";
import { get_particular_broadcast_details } from "@/graphql/queries.js";
import { genrate_api_key } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
export default {
  // props: {
  //   broadcast_info: Object,
  // },
  components: {
    SnackBar,
  },
  mixins: [get_Org_details],
  data: () => ({
    api_key: "",
    url: "",
    broadcastdetails: "",
    x_api_key: "",
    content: "",
    minWidth: 100,
    maxWidth: 800,
    channelName: "",
    teamApiKey: "",
    commandKey: "",
    SnackBarComponent: {},
  }),
  async created() {
    var fetchName = JSON.parse(localStorage.getItem("channelInfo"));
    this.channelName = fetchName.team_name;
    await this.get_Org_details();
    await this.get_broadcastlist();
    this.x_api_key = this.orgDetails.organization["x-api-key"];
    this.api_key = this.broadcastdetails.api_details.broadcast_api_key;
    this.url = this.broadcastdetails.api_details.invoke_url;
    this.teamApiKey = this.orgDetails.organization.team_api_key;
    this.commandKey = "workflowInitateBroadCast";
    this.content = `{
         "team_topic_id": "${this.broadcastdetails.team_topic_id}",
          "broadcast_title": "Hello Stichh",
          "broadcast_description": "This text is body of the message",
          "broadcast_media_url": "https://thumbs.dreamstime.com/b/environment-earth-day-hands-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-nature-field-gra-130247647.jpg",
 
  }`;
  },
  //  "team_api_key":${this.orgDetails.organization.team_api_key},
  //     "content_type": "JSON",
  //     "command": "groupCastMessagePublish"
  methods: {
    async regenrate_api_key() {
      try {
        let result = await API.graphql(
          graphqlOperation(genrate_api_key, {
            input: {
              team_topic_id: this.broadcastdetails.team_topic_id,
            },
          })
        );

        var response = JSON.parse(result.data.genrate_api_key);

        if (response.Status === "SUCCESS") {
          await this.get_Org_details();
          await this.get_broadcastlist();
          this.api_key = this.broadcastdetails.api_details.broadcast_api_key;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.overlay = false;
        console.error(error);
      }
    },
    copyToClipboard_x_api_key(data) {
      // const spanElement = this.$refs.mySpan;
      const text = data;

      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.$emit("clicked", 0);
    },

    copyToClipboard_api_key() {
      const spanElement = this.$refs.textInputapi;
      const text = spanElement.innerText;

      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.$emit("clicked", 0);
    },

    copyToClipboard_url() {
      const spanElement = this.$refs.textInputurl;
      const text = spanElement.innerText;

      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.$emit("clicked", 0);
    },

    async get_broadcastlist() {
      var fetchName = JSON.parse(localStorage.getItem("channelInfo"));
      this.channelName = fetchName.team_name;
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_broadcast_details, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user?.user_email_id,
              team_id: fetchName.team_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_particular_broadcast_details);

        if (response.Status == "SUCCESS") {
          this.broadcastdetails = response.data[0];
        }
      } catch (error) {
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
</style>