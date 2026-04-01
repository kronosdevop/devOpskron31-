<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="publishDailog" @update:model-value="$emit('update:publishDailog', $event)"
    persistent
    :max-width="broadcastType == null ? '500' : '800'"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">Publish Message</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text>
        <v-select
          label="Select the Channel"
          outlined
          dense
          class="mt-4"
          item-text="name"
          item-value="value"
          :items="channelListitems"
          v-model="channels"
          @change="get_broadcastlist"
        />
        <v-radio-group
          :rules="[(v) => !!v || 'Required']"
          v-model="broadcastType"
          v-show="channels != ''"
          row
          class="mt-n4"
        >
          <v-radio label="Api" value="API"></v-radio>
          <v-radio label="Publish" value="PUBLISH"></v-radio>
        </v-radio-group>
        <v-card-text
          class="text-left"
          v-if="broadcastType == 'API' && channels != ''"
        >
          <v-row class="">
            <v-col cols="12">
              <label class="font-weight-bold">Broadcast API key : </label>
              <span ref="textInputapi">{{ api_key }}</span>
              <v-btn x-small @click="copyToClipboard_api_key()" text
                ><v-icon small>mdi-content-copy</v-icon></v-btn
              >
            </v-col>
          </v-row>
          <v-row class="">
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
          <v-row class="">
            <v-col cols="12" class="mt-n2 mb-5">
              <label class="font-weight-bold">X-API-Key :</label>
              <v-icon small color="green">mdi-key</v-icon><br />
              <span ref="mySpan">{{ x_api_key }}</span>
              <v-btn x-small @click="copyToClipboard_x_api_key()" text
                ><v-icon small>mdi-content-copy</v-icon></v-btn
              >
            </v-col>
          </v-row>
          <v-row class="">
            <v-col cols="12" class="mt-n6">
              <label class="font-weight-bold">BODY raw</label>

              <v-textarea readonly v-model="content" outlined height="210px">
              </v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text v-if="broadcastType == 'PUBLISH' && channels != ''">
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  outlined
                  dense
                  label="Title"
                  :rules="[(v) => !!v || 'Required']"
                  :counter="25"
                  v-model="broadcastName"
                  maxlength="25"
                />
                <v-textarea
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  height="250"
                  :counter="500"
                  label="Description"
                  v-model="description"
                  maxlength="500"
                />
              </v-col>
              <v-col cols="6">
                <!-- <v-textarea
                  v-model="imageUrl"
                  rows="0"
                  auto-grow
                  dense
                  outlined
                  :rules="[
                    (v) =>
                      !v ||
                      (!!v && v.length > 0, this.validateURL(v)) ||
                      'Invalid URL format',
                  ]"
                  label="Image Url"
                  maxlength="1000"
                /> -->
                <v-file-input
                  small-chips
                  outlined
                  dense
                  label="Upload Documents"
                  accept="image/*"
                  v-model="contentdocumentFiles"
                  @change="upload_S3(contentdocumentFiles)"
                  :disabled="signimagesarrayurls.length != 0"
                ></v-file-input>
                <v-textarea
                  v-model="sourceInfo"
                  dense
                  auto-grow
                  rows="0"
                  outlined
                  :rules="[
                    (v) =>
                      !v ||
                      (!!v && v.length > 0, this.validateURL(v)) ||
                      'Invalid URL format',
                  ]"
                  label="Source Info"
                  maxlength="1000"
                />
                <v-card
                  flat
                  :height="height"
                  class="overflow-auto overflow-x-hidden"
                >
                  <v-row>
                    <v-col
                      cols="12"
                      v-for="(
                        signimagesarrayurls, index
                      ) in signimagesarrayurls"
                      :key="index"
                    >
                      <v-card class="mt-5">
                        <v-img
                          max-height="100"
                          contain
                          :src="signimagesarrayurls"
                          v-if="signimagesarrayurls.length > 1"
                        >
                        </v-img>
                        <div
                          class="d-flex align-centers justify-centers h-100"
                          v-if="signimagesarrayurls.length == 0"
                        >
                          No Image
                        </div>
                        <v-btn
                          icon
                          @click="delete_item(signimagesarrayurls, index)"
                        >
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            v-if="broadcastType == 'PUBLISH' && channels != ''"
            :loading="loading"
            @click="validate_data()"
            dark
            class="cardCss text-capitalize button-corner"
          >
            Publish
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
/*eslint-disable*/
import { publish_broadcast_messages } from "@/graphql/mutations.js";
import { list_broadcast_channels } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_particular_broadcast_details } from "@/graphql/queries.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
export default {
  props: {
    publishDailog: Boolean,
  },
  mixins: [get_Org_details],
  data() {
    return {
      channelListitems: [],
      channels: "",
      broadcastType: null,
      broadcastdetails: {},
      api_key: "",
      url: "",
      broadcastdetails: "",
      x_api_key: "",
      content: "",
      loading: false,
      broadcastName: "",
      description: "",
      dashboard_type: "",
      Password: "",
      SnackBarComponent: {},
      sourceInfo: "",
      imageUrl: "",
      contentdocumentFiles: [],
      signimagesarrayurls: [],
      urls: "",
      arrayurls: [],
      regularS3URLsnew: [],
    };
  },
  watch: {
    publishDailog: {
      async handler() {
        this.broadcastType = null;
        await this.fetch_broadcast();
        await this.get_Org_details();
        this.signimagesarrayurls = [];
        this.regularS3URLsnew = [];
        this.height = window.innerHeight - 520;
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.channels = "";
      this.$emit("clicked", 0);
    },
    s3get(response) {
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "broadcast/" + this.urls.split("broadcast/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      this.signimagesarrayurls.push(url);
      // console.log(this.signimagesarrayurls);
      //   return url;
    },

    async delete_item(val, index) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;
      this.delLoading = true;
      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;

      var params = {
        Bucket: bucketName,
        Key: val,
      };

      await s3Bucket.deleteObject(params, function (err, data) {
        if (err) {
          // console.log(err);
        } else if (data) {
          self.signimagesarrayurls.forEach((element) => {
            if (element == val) {
              self.signimagesarrayurls.splice(index, 1);
            }
          });
        }
      });
    },
    async upload_S3(files) {
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = files;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

        baseData.push(newUrl);

        this.upload_S3_bucket(baseData[0], file);
      });
    },

    async upload_S3_bucket(baseData, file) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;

      var buf = Buffer.from(baseData, "base64");

      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;

      var params = {
        Bucket: bucketName,
        Key:
          "broadcast" +
          "/" +
          deatils.organization.organization_id +
          "/" +
          self.$store.getters.GetUserObj.user?.user_id +
          "/" +
          Date.now() +
          "/" +
          file.name.split(" ").join(""),

        Body: buf,
        ContentType: file.type,
      };

      var bucketurl =
        "https://" +
        bucketName +
        ".s3." +
        deatils.s3_details.region +
        ".amazonaws.com/" +
        params.Key;

      await s3Bucket.putObject(params, function (err, data) {
        if (err) {
          this.loading1 = false;
        } else if (data) {
          bucketurl;
          var deatil = self.$store.getters.GetOrgDetails;
          self.urls = bucketurl;
          self.s3get(deatil);
        }

        self.contentdocumentFiles = [];
      });
    },
    convertToRegularS3URL(presignedURL) {
      // Use URL class to parse the pre-signed URL
      const url = new URL(presignedURL);

      // Get the base URL without query parameters
      const regularS3URL = url.origin + url.pathname;

      return regularS3URL;
    },

    convertArrayToRegularS3URLs(presignedURLs) {
      this.arrayurls = [];

      for (const presignedURL of presignedURLs) {
        const regularS3URL = this.convertToRegularS3URL(presignedURL);
        this.arrayurls.push(regularS3URL);
      }

      return this.arrayurls;
    },

    async Create_broadcast_message() {
      this.regularS3URLsnew = [];
      if (this.signimagesarrayurls.length != 0) {
        this.regularS3URLsnew = this.convertArrayToRegularS3URLs(
          this.signimagesarrayurls
        );
      }
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(publish_broadcast_messages, {
            input: {
              broadcast_title: this.broadcastName,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              broadcast_description: this.description,
              broadcast_media_url:
                this.regularS3URLsnew == [] ? "N/A" : this.regularS3URLsnew[0],
              broadcast_source_url:
                this.sourceInfo == "" ? "N/A" : this.sourceInfo,

              broadcast_api_key: data.organization.team_api_key,
              team_topic_id: this.broadcastdetails.team_topic_id,
            },
          })
        );
        var response = JSON.parse(result.data.publish_broadcast_messages);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          //   this.SnackBarComponent = {
          //     SnackbarVmodel: true,
          //     SnackbarColor: "green",
          //     Top: true,
          //     SnackbarText: response.Message,
          //   };
          this.$emit("successMsg", response.Message);
          this.regularS3URLsnew = [];
          this.$refs.form.reset();
        } else {
          //   this.SnackBarComponent = {
          //     SnackbarVmodel: true,
          //     SnackbarColor: "red",
          //     Top: true,
          //     SnackbarText: response.Message,
          //   };
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.Create_broadcast_message();
      }
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
    async fetch_broadcast() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_broadcast_channels, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user?.user_email_id,
            },
          })
        );

        this.tableLoading = false;

        var response = result.data.list_broadcast_channels;

        if (response.Status == "SUCCESS") {
          var bordcasttableData = response.data;

          bordcasttableData.forEach((element) => {
            if (element.team_action_type == "BROAD_CAST") {
              this.channelListitems.push({
                name: element.team_name,
                value: element.team_id,
              });
            }
          });
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
    async get_broadcastlist() {
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_broadcast_details, {
            input: {
              user_email_id: this.$store.getters.GetUserObj.user?.user_email_id,
              team_id: this.channels,
            },
          })
        );

        var response = JSON.parse(result.data.get_particular_broadcast_details);
        if (response.Status == "SUCCESS") {
          this.broadcastdetails = response.data[0];
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
          this.broadcastType = "API";
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