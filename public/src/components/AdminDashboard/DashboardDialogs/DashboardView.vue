<template>
  <div>
    <v-card flat class="mt-n2">
      <!-- <v-card flat> -->
      <v-toolbar flat dense class="ml-3">
        <v-toolbar-title>{{
          $store.getters.Getdashboarditems.dashboard_name
        }}</v-toolbar-title>
        <v-spacer />
        <v-toolbar-title class="ml-n12">Description</v-toolbar-title>

        <v-spacer />
      </v-toolbar>
      <!-- <v-card-title > </v-card-title> -->
      <v-card-text>
        <v-form ref="form">
          <v-row class="ml-1">
            <v-col
              cols="6"
              v-if="
                isUserReadOnly == false &&
                $store.getters.Getdashboarditems.dashboard_publish_type ==
                  'DASHBOARD'
              "
            >
              <v-card :height="height" class="overflow-auto">
                <v-card-text>
                  <v-text-field
                    :rules="[(v) => !!v || 'Required']"
                    :counter="100"
                    outlined
                    dense
                    :readonly="isUserReadOnly"
                    v-model="title"
                    label="Title"
                  />
                  <v-textarea
                    outlined
                    :readonly="isUserReadOnly"
                    dense
                    v-model="imageurl"
                    rows="0"
                    :rules="[
                      (v) =>
                        !v ||
                        (!!v && v.length > 0, this.validateURL2(v)) ||
                        'Invalid URL format',
                    ]"
                    maxlength="1000"
                    label="Image URL (optional)"
                  ></v-textarea>
                  <v-textarea
                    :counter="500"
                    outlined
                    dense
                    class="mt-2"
                    height="150px"
                    v-model="decription"
                    :readonly="isUserReadOnly"
                    maxlength="500"
                    label="Description"
                  />
                  <v-textarea
                    :counter="200"
                    outlined
                    dense
                    class="mt-2"
                    height="50px"
                    v-model="summary"
                    :readonly="isUserReadOnly"
                    maxlength="500"
                    label="Summary(optional)"
                  />

                  <v-text-field
                    outlined
                    dense
                    class="mt-2"
                    :rules="[
                      (v) =>
                        !v ||
                        (!!v && v.length > 0, this.validateURL(v)) ||
                        'Invalid URL format',
                    ]"
                    v-model="Information_url"
                    maxlength="1000"
                    label="Information URL(optional)"
                  />
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    class="cardCss text-capitalize white--text"
                    :loading="loading"
                    @click="publish_view()"
                    v-show="
                      $store.getters.Getdashboarditems.dashboard_created_by ==
                        $store.getters.GetUserObj.user.user_email_id &&
                      $store.getters.Getdashboarditems.dashboard_publish_type ==
                        'DASHBOARD'
                    "
                    >Publish</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="6" v-else>
              <v-card :height="height" class="overflow-auto">
                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <label class="font-weight-bold">Title : </label>
                      <br />
                      <span>{{ title }}</span>
                    </v-col>
                    <!-- <v-col cols="12">
                      <label class="font-weight-bold">imageurl : </label>
                      <br />
                      <v-img
                        v-if="imageurl != ''"
                        contain
                        :src="imageurl"
                        aspect-ratio="2"
                      ></v-img>
                      <span v-else>{{ imageurl }}</span>
                    </v-col> -->
                    <v-col cols="12">
                      <label class="font-weight-bold">summary : </label>
                      <br />
                      <span>{{ summary }}</span>
                    </v-col>
                    <v-col cols="12">
                      <label class="font-weight-bold">Information_url : </label>
                      <br />
                      <span>{{ Information_url }}</span>
                    </v-col>
                    <v-col cols="12">
                      <label class="font-weight-bold">Decription : </label>
                      <br />
                      <span>{{ decription }}</span>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card :height="height" class="overflow-auto">
                <v-card-text>
                  <v-img
                    v-if="imageurl != ''"
                    contain
                    max-height="150"
                    max-width="250"
                    :src="imageurl"
                    aspect-ratio="2"
                  ></v-img>
                  <div v-html="decription"></div>
                </v-card-text>
              </v-card>
              <!-- <v-textarea
                  class=""
                  outlined
                  :height="height"
                  v-model="decription"
                  :readonly="isUserReadOnly"
                  maxlength="500"
                  label="Description"
                >
                </v-textarea> -->
            </v-col>
            <!-- <v-row>
                <v-col cols="12">
                  <v-card>
                    <v-card-title>HTML Structure</v-card-title>
                    <v-card-text>
                      <pre>{{ htmlStructure }}</pre>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row> -->
            <!-- <v-col cols="6">
                <div >{{extractContent(decription)}}</div>
              </v-col> -->
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
    <!-- </v-card> -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
  <script>
/*eslint-disable*/

import { Buffer } from "buffer";
import SnackBar from "@/components/SnackBar.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { get_dashboard_details } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
var axios = require("axios");
export default {
  components: {
    SnackBar,
  },
  // props: {
  //   rowInfo: Object,
  // },
  data: () => ({
    x_api_key: "",
    imageurl: "",
    loading: false,
    cardHeight: 0,
    height: 0,
    Description: "",
    api_key: "",
    summary: "",
    decription: "",
    convert_dta: "",
    Information_url: "",
    title: "",
    url: "",
    SnackBarComponent: {},
    isUserReadOnly: false,
    htmlStructure: "",
    htmlData: "",
  }),

  created() {
    this.cardHeight = window.innerHeight - 120;
    this.height = window.innerHeight - 230;
    this.get_Org_details();
    this.get_dashboard();
    if (
      this.$store.getters.Getdashboarditems.dashboard_created_by ==
      this.$store.getters.GetUserObj.user.user_email_id
    ) {
      if (
        this.$store.getters.Getdashboarditems.dashboard_publish_type == "FEED"
      ) {
        this.isUserReadOnly = true;
      }
    }
    if (
      this.$store.getters.Getdashboarditems.dashboard_created_by !=
      this.$store.getters.GetUserObj.user.user_email_id
    ) {
      this.isUserReadOnly = true;
    }
  },
  mixins: [get_Org_details],
  methods: {
    validateURL(Information_url) {
      if (Information_url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(Information_url);
      }
    },
    validateURL2(imageurl) {
      if (imageurl != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(imageurl);
      }
    },
    getHtmlStructure() {
      const $ = cheerio.load(this.htmlData);
      this.htmlStructure = $.html();
    },
    removeHtmlTags() {
      // const tempElement = document.createElement("div");
      // tempElement.innerHTML = this.convert_dta;
      // return tempElement.innerText.trim();\
      const tempElement = document.createElement("div");
      tempElement.innerHTML = this.convert_dta;
      const textNodes = tempElement.childNodes;

      let result = "";
      for (let i = 0; i < textNodes.length; i++) {
        const node = textNodes[i];

        if (node.nodeType === Node.TEXT_NODE) {
          result += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName.toLowerCase();

          if (tagName === "b") {
            result += `${node.textContent}`;
          } else if (tagName === "br") {
            result += "\n";
          }
        }
      }
      return result;
    },

    extractContent(html) {
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = html;

      // Traverse the DOM to extract the text nodes
      const walker = document.createTreeWalker(
        tempContainer,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let content = "";
      while (walker.nextNode()) {
        content += walker.currentNode.textContent;
      }

      return content;
    },
    async get_dashboard() {
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_dashboard_details, {
            dashboard_id: this.$store.getters.Getdashboarditems.dashboard_id,
          })
        );
        var response = JSON.parse(result.data.get_dashboard_details);

        if (response.Status == "SUCCESS") {
          let xapikey = response.data[0].message_payload.data;
          const bufferData = Buffer.from(xapikey);

          const strData = bufferData.toString();

          const api = JSON.parse(strData);

          this.decription = api.description;

          this.summary = api.summary;
          this.title = api.title;
          this.imageurl = api.image_url;
          this.Information_url = api.information_url;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.data.Message,
            timeout: 5000,
            Top: true,
          };
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

    publish_view() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        this.x_api_key = this.orgDetails.organization["x-api-key"];
        this.api_key = this.$store.getters.Getdashboarditems.dashboard_api_key;
        this.url = this.orgDetails.organization.invoke_url;
        axios({
          method: "post",
          maxBodyLength: Infinity,
          url: this.url,
          headers: {
            "x-api-key": this.x_api_key,
            "Content-Type": "application/json",
          },
          data: {
            dashboard_api_key: this.api_key,
            dashboard_message: {
              title: this.title,
              summary: this.summary,
              description: this.decription,
              image_url: this.imageurl,
              information_url: this.Information_url,
            },
            team_api_key: this.orgDetails.organization.team_api_key,
            content_type: "JSON",
            command: "dashboardMessagePublish",
          },
        })
          .then((res) => {
            if (res.data.Status == "SUCCESS") {
              this.loading = false;
              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "green",
                SnackbarText: res.data.Message,
                timeout: 5000,
                Top: true,
              };
            } else {
              this.loading = false;
              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "red",
                SnackbarText: res.data.Message,
                timeout: 5000,
                Top: true,
              };
            }
          })
          .catch((err) => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: err.errors[0].message,
              timeout: 5000,
              Top: true,
            };
          });
      }
    },
  },
};
</script>
  
  <style>
</style>