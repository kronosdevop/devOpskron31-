<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="apiDocs" @update:model-value="$emit('update:apiDocs', $event)" persistent max-width="800" transition="dialog-top-transition">
      <v-card flat class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">  API Configuration
              </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <!-- <v-card-title>{{ dashboarditems.dashboard_name }}</v-card-title> -->
        <v-card-text class="text-left">
          <v-row class="ml-2 mt-5">
            <v-col cols="12">
              <label class="font-weight-bold">Dashboard API key : </label>
              <span ref="textInputapi">{{ api_key }}</span>
              <v-btn x-small @click="copyToClipboard_api_key()" text
                ><v-icon small>mdi-content-copy</v-icon></v-btn
              >
            </v-col>
          </v-row>
          <v-row class="ml-2">
            <v-col cols="12" class="mt-n3">
              <label class="font-weight-bold"
                ><label style="color: green">POST</label> Publish Message
                :</label
              >
              <v-icon small color="green" class="mt-n1">mdi-lock-outline</v-icon
              ><br />
              <span ref="textInputurl">{{ url }}</span>
              <v-btn x-small @click="copyToClipboard_url()" text
                ><v-icon small>mdi-content-copy</v-icon></v-btn
              >
            </v-col>
          </v-row>
          <v-row class="ml-2">
            <v-col cols="12" class="mt-n2 mb-5">
              <label class="font-weight-bold">X-API-Key :</label>
              <v-icon small color="green">mdi-key</v-icon><br />
              <span ref="mySpan">{{ x_api_key }}</span>
              <v-btn x-small @click="copyToClipboard_x_api_key()" text
                ><v-icon small>mdi-content-copy</v-icon></v-btn
              >
            </v-col>
          </v-row>
          <v-row class="ml-2">
            <v-col cols="12" class="mt-n6">
              <label class="font-weight-bold">BODY raw</label>

              <v-textarea readonly v-model="content" outlined height="220px">
              </v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
export default {
  props: {
    dashboarditems: Object,
    apiDocs: Boolean,
  },
  mixins: [get_Org_details],
  data: () => ({
    api_key: "",
    url: "",
    x_api_key: "",
    content: "",
    minWidth: 100,
    maxWidth: 800,
  }),

  async created() {
    await this.get_Org_details();

    this.x_api_key = this.orgDetails.organization["x-api-key"];
    this.api_key = this.dashboarditems.dashboard_api_key;
    this.url = this.orgDetails.organization.invoke_url;
    this.content = `{
      "dashboard_api_key": "${this.dashboarditems.dashboard_api_key}",
      "dashboard_message": {
          "title": "Hello Stichh",
          "summary": "This Text Is Shown As Sumamry Text Below dashboard Name In Dashboard List",
          "description": "This text is body of the message",
          "image_url": "https://thumbs.dreamstime.com/b/environment-earth-day-hands-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-nature-field-gra-130247647.jpg",
          "information_url": "www.google.com"
      },
      "team_api_key":  "${this.orgDetails.organization.team_api_key}",
      "content_type": "JSON",
      "command": "dashboardMessagePublish"
  }`;
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    copyToClipboard_x_api_key() {
      const spanElement = this.$refs.mySpan;
      const text = spanElement.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
            this.$emit("clicked", 1);
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },

    copyToClipboard_api_key() {
      const spanElement = this.$refs.textInputapi;
      const text = spanElement.innerText;

      // Use the Clipboard API to copy text to the clipboard
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
            this.$emit("clicked", 1);
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        // console.error("Clipboard API not supported in this browser.");
      }
    },

    copyToClipboard_url() {
      const spanElement = this.$refs.textInputurl;
      const text = spanElement.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
            this.$emit("clicked", 1);
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },
  },
};
</script>
  
  <style>
</style>