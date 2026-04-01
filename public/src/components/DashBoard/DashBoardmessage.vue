<template>
  <div>
    <v-card flat class="mt-2">
      <v-card-text>
        <v-row>
          <v-col
            :cols="
              $store.getters.GetdashboardDetails.dashboard_publish_type ==
                'DASHBOARD' &&
              $store.getters.GetdashboardDetails.dashboard_type == 'STANDARD'
                ? 12
                : $store.getters.GetdashboardDetails.dashboard_publish_type ==
                    'FEED' &&
                  $store.getters.GetdashboardDetails.dashboard_type == 'CUSTOM'
                ? 12
                : $store.getters.GetdashboardDetails.dashboard_created_by ==
                  $store.getters.GetUserObj.user?.user_email_id
                ? 6
                : 12
            "
          >
            <v-card flat outlined>
              <div v-if="datacheck.data[0].message_payload != undefined">
                <v-card-title v-show="dashboardtitle !== ''">{{
                  dashboardtitle
                }}</v-card-title>
                <v-img
                  v-if="imageurl != ''"
                  contain
                  max-height="150"
                  max-width="250"
                  v-show="imageurl !== ''"
                  content-class="mt-1"
                  :src="imageurl"
                  aspect-ratio="2"
                ></v-img>
                <!-- <div class="ml-3 mt-1 mr-4" v-html="decription"></div> -->
                <iframe
                  ref="myIframe"
                  :srcdoc="decription"
                  width="100%"
                  frameborder="0"
                  class="ml-2 mr-3"
                  scrolling="no"
                  @load="adjustIframeHeight"
                ></iframe>
                <v-card-subtitle>{{ dashboardSummary }}</v-card-subtitle>

                <a :href="dashboardinforurl" target="_blank" class="ml-4">{{
                  dashboardinforurl
                }}</a>
              </div>
              <div
                class="d-flex justify-center align-center pa-5"
                v-else
                style="height: 100%"
              >
                No Data Published
              </div>
            </v-card>
          </v-col>

          <v-col
            v-if="
              $store.getters.GetdashboardDetails.dashboard_publish_type ==
                'DASHBOARD' &&
              $store.getters.GetdashboardDetails.dashboard_type == 'CUSTOM' &&
              $store.getters.GetdashboardDetails.dashboard_created_by ==
                $store.getters.GetUserObj.user?.user_email_id
            "
            cols="6"
          >
            <v-card flat outlined>
              <v-card-text class="mt-4">
                <v-form ref="form">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        :rules="[(v) => !!v || 'Required']"
                        :counter="100"
                        outlined
                        dense
                        v-model="titleinput"
                        maxlength="100"
                        label="Title"
                      />
                      <v-textarea
                        outlined
                        dense
                        v-model="imageinputurl"
                        rows="0"
                        :rules="[
                          (v) =>
                            !v ||
                            (!!v && v.length > 0, this.validateURL(v)) ||
                            'Invalid URL format',
                        ]"
                        maxlength="1000"
                        label="Image URL (optional)"
                      ></v-textarea>
                      <v-row class="mt-n6">
                        <v-col cols="12">
                          <label>Description :</label>
                          <div id="editor8"></div>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn
                  depressed
                  :loading="loading"
                  @click="publish_view()"
                  dark
                  class="cardCss text-capitalize button-corner"
                >
                  Publish
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { Buffer } from "buffer";
import { API, graphqlOperation } from "aws-amplify";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { get_dashboard_details } from "@/graphql/queries.js";
import SnackBar from "@/components/SnackBar.vue";
var axios = require("axios");
export default {
  components: {
    SnackBar,
  },
  mixins: [get_Org_details],
  data() {
    return {
      dashboardtitle: "",
      windowheight: 0,
      loading: false,
      titleinput: "",
      Information_url: "",
      imageurl: "",
      imageinputurl: "",
      dashboardSummary: "",
      decription: "",
      dashboardinforurl: "",
      SnackBarComponent: {},
      datacheck: {},
      summary: "",
    };
  },
  async mounted() {
    this.windowheight = window.innerHeight - 260;
    await this.get_dashboard();
    await this.get_Org_details();
    ClassicEditor.create(document.querySelector("#editor8"), {
      toolbar: {
        items: [
          "undo",
          "redo",
          "|",
          "heading",
          "|",
          "fontfamily",
          "fontsize",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "bold",
          "italic",
          "strikethrough",
          "subscript",
          "superscript",
          "code",
          "|",
          "link",
          "insertTable",
          "blockQuote",
          "codeBlock",
          "|",
          "alignment",
          "|",
          "bulletedList",
          "numberedList",
          "todoList",
          "outdent",
          "indent",
        ],
        shouldNotGroupWhenFull: false,
      },
    })
      .then((editor8) => {
        this.editor8 = editor8;

        // Set the initial content
        editor8.setData("");
      })
      .catch((error) => {
        console.error(error);
      });
  },
  methods: {
    async get_dashboard() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_dashboard_details, {
            dashboard_id: this.$store.getters.GetdashboardDetails.dashboard_id,
          })
        );
        var response = JSON.parse(result.data.get_dashboard_details);
        this.datacheck = response;
        if (response.Status == "SUCCESS") {
          if (response.data[0].message_payload != undefined) {
            let xapikey = response.data[0].message_payload.data;
            if (xapikey == undefined) {
              this.decription = "";
            } else {
              const bufferData = Buffer.from(xapikey);

              const strData = bufferData.toString();

              const api = JSON.parse(strData);

              this.decription = api.description.replace(/^<p>|<\/p>$/g, "");
              this.decription = this.decription
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">");

              this.imageurl = api.image_url == undefined ? "" : api.image_url;
              this.dashboardtitle = api.title == undefined ? "" : api.title;
              this.dashboardSummary = api.summary;
              this.dashboardinforurl = api.information_url;
            }
          } else {
            this.decription = "";
            this.imageurl = "";
            this.dashboardtitle = "";
            this.dashboardSummary = "";
            this.dashboardinforurl = "";
          }
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
        //console.log(error);
        this.decription = "";
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    adjustIframeHeight() {
      this.$nextTick(() => {
        const iframe = this.$refs.myIframe;
        if (iframe && iframe.contentDocument) {
          const body = iframe.contentDocument.body;
          const height = body.scrollHeight + 30;
          iframe.style.height = height + "px";
        }
      });
    },
    publish_view() {
      if (this.$refs.form.validate()) {
        var descriptionDashboard = this.editor8.getData();
        descriptionDashboard = descriptionDashboard
          .replace(
            /<td>/g,
            "<td style='border: 1px solid black;  padding: 8px;text-align:center;'>"
          )
          .replace(
            /<th>/g,
            "<td style='border: 1px solid #555; padding: 8px; background-color:lightgrey'>"
          );
        this.loading = true;
        this.x_api_key = this.orgDetails.organization["x-api-key"];
        this.api_key =
          this.$store.getters.GetdashboardDetails.dashboard_api_key;
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
              title: this.titleinput,
              summary: this.summary,
              description: descriptionDashboard,
              image_url: this.imageinputurl,
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

              this.$refs.form.reset();
              this.editor8.setData("");
              this.get_dashboard();
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