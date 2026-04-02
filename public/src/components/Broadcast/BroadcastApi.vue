<template>
  <div>
    <v-card flat class="mt-n2 ml-4">
      <v-card-title>{{ $store.getters.GetMessageitems.team_name }}</v-card-title>
      <v-card-text class="">
        <v-row class="mt-n6">
          <v-col cols="6">
            <label class="font-weight-bold">Broadcast API key : </label>
            <span ref="textInputapi">{{ api_key }}</span>
            <v-btn x-small @click="copyToClipboard_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="6" class="mt-n3">
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
          <v-col cols="6" class="mt-n2 mb-5">
            <label class="font-weight-bold">X-API-Key :</label>
            <v-icon small color="green">mdi-key</v-icon><br />
            <span ref="mySpan">{{ x_api_key }}</span>
            <v-btn x-small @click="copyToClipboard_x_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="7" class="mt-n6">
            <label class="font-weight-bold">BODY raw</label>

            <v-textarea readonly v-model="content" outlined height="220px">
            </v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
  
  <script>
import { get_particular_broadcast_details } from "@/graphql/queries.js";

import { API, graphqlOperation } from "aws-amplify";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
export default {
  // props: {
  //   broadcast_info: Object,
  // },
  mixins: [get_Org_details],
  data: () => ({
    api_key: "",
    url: "",
    broadcastdetails: "",
    x_api_key: "",
    content: "",
    minWidth: 100,
    maxWidth: 800,
  }),
  async created() {
    await this.get_Org_details();
    await this.get_broadcastlist();
    this.x_api_key = this.orgDetails.organization["x-api-key"];
    this.api_key = this.broadcastdetails.api_details.broadcast_api_key;
    this.url = this.broadcastdetails.api_details.invoke_url;
    this.content = `{
      "broadcast_api_key": ${this.broadcastdetails.api_details.broadcast_api_key},
      "broadcast_message": {
          "title": "Hello Stichh",
          "summary": "This Text Is Shown As Sumamry Text Below dashboard Name In Dashboard List",
          "description": "This text is body of the message",
          "image_url": "https://thumbs.dreamstime.com/b/environment-earth-day-hands-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-nature-field-gra-130247647.jpg",
          "information_url": "www.google.com"
      },
      "team_api_key":${this.orgDetails.organization.team_api_key},
      "content_type": "JSON",
      "command": "groupCastMessagePublish"
  }`;
  },
  methods: {
    copyToClipboard_x_api_key() {
      const spanElement = this.$refs.mySpan;
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
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_broadcast_details, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user?.user_email_id,
              team_id: this.$store.getters.GetMessageitems.team_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_particular_broadcast_details);

        if (response.Status == "SUCCESS") {
          this.broadcastdetails = response.data[0];
          // console.log(this.broadcastdetails.api_details.broadcast_api_key);
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