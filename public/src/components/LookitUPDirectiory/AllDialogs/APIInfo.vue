<template>
  <div>
    <v-card class="mt-4" flat>
      <v-card-text class="text-left">
        <v-row class="ml-2 mt-5">
          <v-col cols="12">
            <label class="font-weight-bold">API key : </label>
            <span ref="textInputapi">{{ apiKey }}</span>
            <v-btn x-small @click="copyToClipboard_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="12" class="mt-n3">
            <label class="font-weight-bold"
              ><label style="color: green">POST</label> Publish :</label
            >
            <v-icon small color="green" class="mt-n1">mdi-lock-outline</v-icon
            ><br />
            <span ref="textInputurl">{{ url }}</span>
            <v-btn x-small @click="copyToClipboard_x_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="12" class="mt-n2 mb-5">
            <label class="font-weight-bold">X-API-Key :</label>
            <v-icon small color="green">mdi-key</v-icon><br />
            <span ref="mySpan">{{ xApiKey }}</span>
            <v-btn x-small @click="copyToClipboard_x_api_key()" text
              ><v-icon small>mdi-content-copy</v-icon></v-btn
            >
          </v-col>
        </v-row>
        <v-row class="ml-2">
          <v-col cols="12" class="mt-n6">
            <label class="font-weight-bold">BODY raw</label>

            <v-textarea readonly v-model="content" outlined> </v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */

import { get_dirDetails_for_webhook } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";

export default {
  data() {
    return {
      xApiKey: "",
      url: "",
      apiKey: "",
      content: "",
    };
  },
  mixins: [get_Org_details],
  async created() {
    await this.get_Org_details();
    this.api_info();
  },
  methods: {
    // api_info(){

    // },
    async api_info() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(get_dirDetails_for_webhook, {
            input: {
              directory_id: this.$store.getters.GetFormObject.directory_id,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.get_dirDetails_for_webhook);
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.xApiKey = response.directoryDetails.x_api_key;
          this.apiKey = response.directoryDetails.directory_api_key;
          var bodyObj = response.paramsForWebhook[2].params;
          // console.log(response.paramsForWebhook[2].params);
          this.content = `{
      "directory_api_key": "${response.directoryDetails.directory_api_key}",
      "workflow_payload": "${bodyObj}",
      "team_api_key":  "${this.orgDetails.organization.team_api_key}",
      "content_type": "JSON",
      "command": "EntryForDirectory"
  }`;
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
  },
};
</script>