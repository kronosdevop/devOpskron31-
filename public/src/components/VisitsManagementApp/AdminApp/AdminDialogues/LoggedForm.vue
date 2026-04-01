<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="formlog" @update:model-value="$emit('update:formlog', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Visit Log of {{ rowInfo.visit_type_id_text }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-row
            v-for="(n, idx) in formTemplate"
            :key="idx"
            no-gutters
            class="mt-2"
          >
            <v-col cols="12" v-if="n.data_type == 'label'">
              <div class="text-left font-weight-bold FontSize">
                {{ n.display_label }}
              </div>
            </v-col>
            <v-col cols="12" v-else>
              <v-row>
                <v-col class="" cols="5">
                  <div
                    v-if="n.display_label != 'Attachment Media'"
                    class="text-left font-weight-bold FontSize"
                  >
                    {{ n.display_label }}
                  </div>
                </v-col>
                <v-col
                  v-show="n.key !== 'prfl_pic_s3_key' && n.key !== 'media_keys'"
                  cols="7"
                >
                  <div class="text-left FontSize" v-if="n.data_type == 'media'">
                    <div v-show="n.respectiveValue == 'N/A'">
                      <b>
                        {{
                          n.key == "epoch"
                            ? ":" + " " + fetch_time(n.respectiveValue)
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
                            <b
                              >:
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
                            </b>
                            <v-icon
                              dense
                              v-show="
                                n.respectiveValue != 'N/A' &&
                                n.respectiveValue != ''
                              "
                              color="primaryColor"
                              class="ml-1"
                              @click="downloadlist(n)"
                            >
                              mdi-download</v-icon
                            >
                          </div>
                          <div
                            class="FontSize"
                            v-show="n.respectiveValue == ''"
                          >
                            <b>: {{ "N/A" }}</b>
                          </div>
                        </template>
                        <div class="textWrap FontSize" style="max-width: 250px">
                          {{ n.respectiveValue.split("/").pop().split("?")[0] }}
                        </div>
                      </v-tooltip>

                      <!-- {{
                            n.respectiveValue == "N/A"
                              ? n.respectiveValue
                              : n.respectiveValue == ""
                              ? "N/A"
                              : n.respectiveValue.split("/").pop().split("?")[0]
                          }}</b
                        > -->
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
                        v-for="images1 in n.input_array_value"
                        :key="images1"
                      >
                        <v-img
                          height="150"
                          :src="s3convert(images1.type)"
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
                        v-for="images1 in n.input_array_value"
                        :key="images1"
                      >
                        <v-img
                          height="150"
                          :src="s3convert(images1.type)"
                          contain
                        ></v-img>
                      </v-carousel-item>
                    </v-carousel>
                  </div>
                  <div
                    class="text-left FontSize"
                    v-else-if="
                      n.data_type != 'gallery' && n.data_type != 'media'
                    "
                  >
                    <b>
                      {{
                        n.key == "epoch"
                          ? ":" + " " + fetch_time(n.respectiveValue)
                          : n.respectiveValue == ""
                          ? ":" + " " + "N/A"
                          : ":" + " " + n.respectiveValue
                      }}</b
                    >
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
              <script>
/* eslint-disable */
import axios from "axios";
import { Buffer } from "buffer";
var AWS = require("aws-sdk");
export default {
  props: {
    formlog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      model2: false,
      model1: false,
      formTemplate: [],
    };
  },
  watch: {
    formlog: {
      async handler() {
        if (this.formlog == true) {
          // console.log(this.rowInfo, "rowInfo");
          this.formTemplate = [];
          await this.fetch_pending_data();
        }
      },
      immediate: true,
    },
  },
  methods: {
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
    async downloadlist(url) {
      var data = this.$store.getters.GetOrgDetails;

      const s3 = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });
      const params = {
        Bucket: data.s3_details.bucket_name,
        Key:
          url.key == "broadcast_media_url"
            ? "broadcast/" + url.respectiveValue.split("broadcast/")[1]
            : "workflow/" + url.respectiveValue.split("workflow/")[1],
        Expires: 3600,
      };

      const imageElement = s3.getSignedUrl("getObject", params);

      this.dwonload_pdf(
        imageElement,
        `${imageElement.split("/").pop().split("?")[0]}`
      );
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

    fetch_pending_data() {
      var array = [];

      array = this.rowInfo.workflow_template;
      array.map((obj) => ({ ...obj, respectiveValue: "" }));

      const obj = this.rowInfo.workflow_payload;

      const appendedValues = {};
      const otherValues = {};

      Object.keys(obj).forEach((key) => {
        if (key.endsWith("_text")) {
          const originalKey = key.slice(0, -5);

          if (obj.hasOwnProperty(originalKey)) {
            const appendedTextValue = obj[key];
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
      }));

      this.formTemplate = replacedArray;

      // console.log(this.formTemplate);
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>