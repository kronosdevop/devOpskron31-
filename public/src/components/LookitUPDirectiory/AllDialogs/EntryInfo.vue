<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="addEntryInfo"
      @update:model-value="$emit('update:addEntryInfo', $event)"
      persistent
      max-width="700"
      transition="dialog-top-transition"
    >
      <v-card class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              {{ $store.getters.GetFormObject.directory_name + " " + "Info" }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-carousel
            v-model="currentIndex"
            hide-delimiters
            :continuous="false"
            :cycle="updatedArray.length > 1 ? true : false"
            :interval="600000"
            height="100%"
            :show-arrows="updatedArray.length > 1 ? true : false"
          >
            <v-carousel-item
              v-for="(entry, index) in updatedArray"
              :key="index"
            >
              <v-card class="ml-16 mr-4" flat>
                <v-card-text>
                  <v-form ref="form1">
                    <v-row
                      v-for="(n, idx) in formTemplate"
                      :key="idx"
                      no-gutters
                      class="mt-2"
                    >
                      <v-col cols="12" v-if="n.data_type == 'label'">
                        <div class="text-left font-weight-bold">
                          {{ n.display_label }}
                        </div>
                      </v-col>
                      <v-col cols="12" v-else>
                        <v-row>
                          <v-col class="" cols="5">
                            <div
                              v-if="n.display_label != 'Attachment Media'"
                              class="text-left font-weight-bold"
                            >
                              {{ n.display_label }}
                            </div>
                          </v-col>
                          <v-col
                            v-show="
                              n.key !== 'prfl_pic_s3_key' &&
                              n.key !== 'media_keys'
                            "
                            cols="7"
                          >
                            <div
                              class="text-left"
                              v-if="n.data_type == 'media'"
                            >
                              <div v-show="n.respectiveValue == 'N/A'">
                                <b>
                                  {{
                                    n.key == "epoch"
                                      ? ":" +
                                        " " +
                                        fetch_time(n.respectiveValue)
                                      : ":" + " " + n.respectiveValue
                                  }}</b
                                >
                              </div>
                              <div>
                           
                                <v-tooltip bottom>
                                  <template #activator="{ on }">
                                      <div
                                        v-show="
                                          n.respectiveValue != 'N/A' &&
                                          n.respectiveValue != ''
                                        "
                                        v-on="on"
                                      >
                                      <!-- Show image if signedUrl is available -->
                                      <div
                                        v-if="n.signedUrl"
                                        class="d-flex align-center"
                                      >
                                        <b>:</b>
                                        <v-img
                                          :src="n.signedUrl"
                                          :alt="
                                            n.respectiveValue
                                              .split('/')
                                              .pop()
                                              .split('?')[0]
                                          "
                                          max-width="100"
                                          max-height="60"
                                          class="ml-2 rounded"
                                          contain
                                        ></v-img>
                                        <v-icon
                                          color="primaryColor"
                                          class="ml-1"
                                          @click="downloadlist(n)"
                                        >
                                          mdi-download
                                        </v-icon>
                                        <v-icon
                                          color="primaryColor"
                                          class="ml-1"
                                          @click="viewImage(n)"
                                        >
                                          mdi-eye
                                        </v-icon>
                                      </div>

                                      <!-- Fallback to filename if no signedUrl -->
                                      <div v-else class="d-flex align-center">
                                        <b>:</b>
                                        <span class="ml-2">
                                          {{
                                            +n.respectiveValue
                                              .split("/")
                                              .pop()
                                              .split("?")[0].length >= 20
                                              ? n.respectiveValue
                                                  .split("/")
                                                  .pop()
                                                  .split("?")[0]
                                                  .substr(0, 20) + "..."
                                              : n.respectiveValue
                                                  .split("/")
                                                  .pop()
                                                  .split("?")[0]
                                          }}
                                        </span>
                                        <v-icon
                                          color="primaryColor"
                                          class="ml-1"
                                          @click="downloadlist(n)"
                                        >
                                          mdi-download
                                        </v-icon>
                                        <v-icon
                                          color="primaryColor"
                                          class="ml-1"
                                          @click="viewImage(n)"
                                        >
                                          mdi-eye
                                        </v-icon>
                                      </div>
                                    </div>
                                    <div v-show="n.respectiveValue == ''">
                                      <b>: {{ "N/A" }}</b>
                                    </div>
                                  </template>
                                  <div
                                    class="textWrap"
                                    style="max-width: 250px"
                                  >
                                    {{
                                      n.respectiveValue
                                        .split("/")
                                        .pop()
                                        .split("?")[0]
                                    }}
                                  </div>
                                </v-tooltip>
                              </div>
                            </div>
                            <div v-if="n.data_type == 'gallery'">
                              <b> : </b>
                              <v-carousel
                                v-model="model1"
                                height="auto"
                                hide-delimiters
                                :show-arrows="false"
                                v-if="n.input_array_value.length == 1"
                              >
                                <v-carousel-item
                                  v-for="images1 in imageregularUrl"
                                  :key="images1"
                                >
                                  <v-img
                                    height="150"
                                    :src="images1"
                                    contain
                                  ></v-img>
                                </v-carousel-item>
                              </v-carousel>
                              <v-carousel
                                v-model="model2"
                                height="auto"
                                hide-delimiters
                                v-else
                              >
                                <v-carousel-item
                                  v-for="images1 in imageregularUrl"
                                  :key="images1"
                                >
                                  <v-img
                                    height="150"
                                    :src="images1"
                                    contain
                                  ></v-img>
                                </v-carousel-item>
                              </v-carousel>
                            </div>
                            <div
                              v-else-if="
                                n.data_type == 'url' || n.data_type == 'youtube'
                              "
                            >
                              <b>
                                :
                                <a :href="n.respectiveValue" target="_blank">{{
                                  n.respectiveValue
                                }}</a>
                              </b>
                            </div>
                            <div
                              class="text-left pre-line-style"
                              v-else-if="
                                n.data_type != 'gallery' &&
                                n.data_type != 'media'
                              "
                            >
                              <b v-if="n.key == 'epoch'"
                                >: {{ fetch_time(n.respectiveValue) }}</b
                              >
                              <b v-else>
                                :
                                <span
                                  v-html="formatText(n.respectiveValue)"
                                ></span
                              ></b>
                            </div>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-carousel-item>
          </v-carousel>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Image Preview Dialog -->
    <v-dialog
      v-model="showImagePreview"
      max-width="800"
      persistent
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Image Preview</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="closeImagePreview()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="pa-4">
          <div class="text-center">
            <v-img
              :src="previewImageUrl"
              :alt="previewImageAlt"
              max-height="600"
              contain
              class="rounded"
            ></v-img>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
const FileSaver = require("file-saver");
import axios from "axios";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
// var AWS = require("aws-sdk");

export default {
  data() {
    return {
      currentIndex: 0,
      formTemplate: [],
      imageregularUrl: [],
      workflowPayloadInfo: {},
      directoryFormArray: [],
      updatedArray: [],
      userData: null,
      model2: false,
      model1: false,
      showImagePreview: false,
      previewImageUrl: '',
      previewImageAlt: '',
    };
  },
  props: {
    addEntryInfo: Boolean,
    formDetails: Object,
    tableData: Array,
  },
  watch: {
    addEntryInfo: {
      async handler() {
        if (this.addEntryInfo == true) {
          this.workflowPayloadInfo = {};
          var newobj = localStorage.getItem("drectoryPayload");
          var checkObj = JSON.parse(newobj);
          // console.log(checkObj);
          this.workflowPayloadInfo = { ...checkObj }; // Create a fresh copy
          this.formTemplate = [];
          await this.fetch_pending_data();

          this.directoryFormArray = this.workflowPayloadInfo.directory_template;
          this.updatedArray = this.tableData;
          const index = this.updatedArray.indexOf(this.formDetails);
          if (index !== -1) {
            this.currentIndex = index; // Set the carousel to the correct index
          }
        }
      },
      immediate: true,
    },
    currentIndex(newIndex) {
      // Watch the `currentIndex` and call the method when it changes
      this.onCarouselChange(newIndex);
    },
  },

  methods: {
    async onCarouselChange(index) {
      // This method is triggered when the carousel item changes
      // console.log("Carousel changed to index: ", index);
      // Call your function here to return or compute any data based on the index
      this.userData = this.updatedArray[index];
      this.workflowPayloadInfo = { ...this.userData }; // Create a fresh copy
      this.formTemplate = [];
      await this.fetch_pending_data(); // Store the data for the current image
      // console.log(this.userData);
    },

    close_dialog() {
      // Reset all signedUrl properties when closing dialog
      if (this.formTemplate && this.formTemplate.length > 0) {
        this.formTemplate.forEach(item => {
          if (item.signedUrl) {
            item.signedUrl = null;
          }
        });
      }
      this.$emit("clicked", 0);
    },

    viewImage(item) {
      if (item.signedUrl) {
        this.previewImageUrl = item.signedUrl;
        this.previewImageAlt = item.respectiveValue
          .split('/')
          .pop()
          .split('?')[0];
        this.showImagePreview = true;
      }
    },

    closeImagePreview() {
      this.showImagePreview = false;
      this.previewImageUrl = '';
      this.previewImageAlt = '';
    },

    formatText(text) {
      if (!text) return "";
      return text.replace(/\n/g, "<br>");
    },

    async fetch_pending_data() {
      var array = [];
      this.formTemplate = [];
      this.imageregularUrl = [];
      array = this.workflowPayloadInfo.directory_template.map((obj) => ({ 
        ...obj, 
        respectiveValue: "", 
        signedUrl: null 
      }));
      // console.log(array);
      const obj = this.workflowPayloadInfo.responseObject.workflow_payload;

      const appendedValues = {};
      const otherValues = {};

      Object.keys(obj).forEach((key) => {
        if (key.endsWith("_text")) {
          const originalKey = key.slice(0, -5);
          if (obj.hasOwnProperty(originalKey)) {
            const appendedTextValue = obj[key];
            // console.log(appendedTextValue);
            appendedValues[originalKey] = appendedTextValue;
          }
        } else {
          otherValues[key] = obj[key];
        }
      });
      const concatenatedObject = Object.assign({}, otherValues, appendedValues);

      for (var i = 0; i < array.length; i++) {
        for (let data in concatenatedObject) {
          if (array[i].key == `${data}`) {
            array[i].respectiveValue = `${concatenatedObject[data]}`;
          }
        }
      }
      const replacedArray = array.map((obj) => ({
        ...obj,
        respectiveValue:
          obj.respectiveValue !== undefined ? obj.respectiveValue : "N/A",
        signedUrl: null, // Reset signedUrl for each item
      }));
      const details = this.$store.getters.GetOrgDetails;
      const updatedData = await Promise.all(
        replacedArray.map(async (row) => {
          if (row.data_type === "media") {
            const rawUrl = row.respectiveValue;
            const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
            return {
              ...row,
              signedUrl,
            };
          }
          if (row.data_type === "gallery") {
            // console.log(row);
            const details = this.$store.getters.GetOrgDetails;
            if (row.input_array_value.length != 0) {
              for (let i = 0; i < row.input_array_value.length; i++) {
                const urlupdate = await getS3SignedUrl(
                  row.input_array_value[i].type,
                  details.s3_details
                );
                this.imageregularUrl.push(urlupdate);
                // console.log(row.input_array_value[i].type);
              }
            }
            return {
              ...row,
              signedUrl: null,
            };
          }

          return {
            ...row,
            signedUrl: null, // Or leave it undefined
          };
        })
      );
      this.formTemplate = updatedData;
      this.formTemplate = this.formTemplate.filter(
        (obj) => obj.is_displayed == true
      );
    },
    //   this.formTemplate = replacedArray;
    // },
    fetch_time(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;
      var time = new Date(val);
      var timeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const concatDateTime = dateValue + " " + timeValue;
      return concatDateTime;
    },
    async downloadlist(url) {
      // var data = this.$store.getters.GetOrgDetails;

      // const s3 = new AWS.S3({
      //   region: data.s3_details.region,
      //   accessKeyId: data.s3_details.access_key,
      //   secretAccessKey: data.s3_details.secret_key,
      // });
      // const params = {
      //   Bucket: data.s3_details.bucket_name,
      //   Key:
      //     url.key == "broadcast_media_url"
      //       ? "broadcast/" + url.respectiveValue.split("broadcast/")[1]
      //       : "workflow/" + url.respectiveValue.split("workflow/")[1],
      //   Expires: 3600,
      // };

      // const imageElement = s3.getSignedUrl("getObject", params);
      const details = this.$store.getters.GetOrgDetails;
      // console.log("sss", url);
      const signedUrl = await getS3SignedUrl(
        url.respectiveValue,
        details.s3_details
      );
      // console.log(signedUrl, "sss");
      this.dwonload_pdf(
        signedUrl,
        `${signedUrl.split("/").pop().split("?")[0]}`
      );

      // this.dwonload_pdf(
      //   imageElement,
      //   `${imageElement.split("/").pop().split("?")[0]}`
      // );
    },

    async dwonload_pdf(url, fileName) {
      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          // Create a blob from the response
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
    s3convert(urls) {
      // console.log(urls);
      var response = this.$store.getters.GetOrgDetails;
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "workflow/" + urls.split("workflow/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      // var array = [];
      // array.unshift(url);
      // console.log(url);
      return url;
    },
  },
};
</script>