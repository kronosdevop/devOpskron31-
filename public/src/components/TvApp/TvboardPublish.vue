<template>
  <div>
    <OverlayComp :overlay="overlay" />
    <v-card
      flat
      class="mt-2"
      v-if="$store.getters.GetTvdetails.tv_board_publish_type == 'TV_SIGNAGE'"
    >
      <v-card-text>
        <v-row>
          <v-col cols="5" class="d-flex justify-center">
            <v-card
              class="centered-card mt-5"
              height="200"
              width="500"
              outlined
              v-show="image == null"
            >
              <input
                type="file"
                ref="fileInput"
                @change="onFileChange"
                style="display: none"
                accept="image/*"
              />
              <v-btn
                dark
                elevation="0"
                class="text-capitalize cardCss"
                @click="$refs.fileInput.click()"
                small
                :loading="uploadload"
              >
                Upload image
              </v-btn>
            </v-card>
            <v-card flat>
              <div v-if="image">
                <img
                  ref="image"
                  :src="image"
                  style="max-width: 100%"
                  height="auto"
                />
                <v-row>
                  <v-btn
                    @click="cropImage"
                    dark
                    elevation="0"
                    class="text-capitalize cardCss mt-5"
                    small
                    >Save</v-btn
                  >
                  <v-btn
                    @click="clearimage"
                    dark
                    elevation="0"
                    class="text-capitalize cardCss mt-5 ml-5"
                    small
                    >clear</v-btn
                  >
                </v-row>
              </div>
            </v-card>
          </v-col>
          <v-col cols="2" class="d-flex justify-center align-center">
            <v-divider vertical></v-divider>
          </v-col>
          <v-col cols="5" v-if="urls.length !== 0">
            <v-list class="scrollable-list">
              <!-- <draggable v-model="urls" @end="onDragEnd">
                <v-list-item v-for="(item, index) in urls" :key="item">
                  <v-list-item-content>
                    <v-row no-gutters>
                      <v-img
                        :src="item"
                        contain
                        max-height="150"
                        max-width="250"
                      ></v-img>
                      <v-list-item-action>
                        <v-icon @click="deleteImage(item, index)" color="red">
                          mdi-delete
                        </v-icon>
                      </v-list-item-action>
                    </v-row>
                  </v-list-item-content>
                </v-list-item>
              </draggable> -->
              <draggable v-model="urls" @end="onDragEnd" item-key="item">
                <v-row>
                  <v-col v-for="(item, index) in urls" :key="item" cols="6">
                    <v-list-item @mousedown.stop :draggable="true">
                      <v-list-item-content>
                        <v-img
                          :src="item"
                          contain
                          max-height="150"
                          max-width="200"
                        ></v-img>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-icon @click="deleteImage(item, index)" color="red">
                          mdi-delete
                        </v-icon>
                      </v-list-item-action>
                    </v-list-item>
                  </v-col>
                </v-row>
              </draggable>
            </v-list>
          </v-col>
          <v-col cols="5" v-if="urls.length === 0">
            <div class="centered-container">
              <v-card class="outlined-card">
                <v-card-text> <b>No message published</b></v-card-text>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card v-else flat class="mt-2"> </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/

import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { Buffer } from "buffer";
import { API, graphqlOperation } from "aws-amplify";
import { get_tvboard_details } from "@/graphql/queries.js";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import draggable from "vuedraggable";
var AWS = require("aws-sdk");

export default {
  components: {
    // draggable,
    OverlayComp,
    SnackBar,
  },
  data() {
    return {
      urls: [],
      SnackBarComponent: {},
      overlay: false,
      uploadload: false,
      image: null,
      croppedImage: null,
      cropper: null,
    };
  },
  beforeDestroy() {
    if (this.cropper) {
      this.cropper.destroy();
    }
  },
  mounted() {
    this.$store.commit("SetPublishMessage", []);
    this.get_dashboard();
  },
  methods: {
    async get_dashboard() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_tvboard_details, {
            input: {
              tv_board_id: this.$store.getters.GetTvdetails.tv_board_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_tvboard_details);

        if (response.Status == "SUCCESS") {
          this.overlay = false;
          if (response.data[0].message_payload != undefined) {
            this.overlay = false;
            let xapikey = response.data[0].message_payload.data;
            if (xapikey == undefined) {
              this.overlay = false;
              this.urls = [];

              this.htmlContent = "";
            } else {
              this.overlay = false;
              const bufferData = Buffer.from(xapikey);
              const strData = bufferData.toString();
              const api = JSON.parse(strData);

              this.urls = api;
              this.$store.commit("SetPublishMessage", this.urls);
            }
          } else {
            this.overlay = false;
            this.lastpublished = [];
            this.htmlContent = "";
            this.overlay = false;
          }
        } else {
          this.overlay = false;
          this.lastpublished = [];
          this.htmlContent = "";
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.data.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.overlay = false;

        this.lastpublished = [];
        this.htmlContent = "";
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    onFileChange(event) {
      if (this.urls.length < 200) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
              // Check if the image resolution is 4K or higher
              if (img.width >= 3840 || img.height >= 2160) {
                this.resizeImage(img, 3840, 2160);
              } else {
                this.image = img.src;
              }

              this.$nextTick(() => {
                if (this.$refs.image) {
                  this.initializeCropper();
                }
              });
            };
          };
          reader.readAsDataURL(file);
        }
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Max limit has been reached",
          timeout: 5000,
          Top: true,
        };
      }
    },
    resizeImage(img, maxWidth, maxHeight) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;

      if (width > height) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      this.image = canvas.toDataURL("image/jpeg", 0.8);
    },
    initializeCropper() {
      if (this.cropper) {
        this.cropper.destroy();
      }
      this.cropper = new Cropper(this.$refs.image, {
        aspectRatio: 16 / 9,
        viewMode: 1,
        autoCrop: true,
        autoCropArea: 0.8,
      });
    },
    async cropImage() {
      if (this.cropper) {
        const canvas = this.cropper.getCroppedCanvas();
        this.croppedImage = canvas.toDataURL();
        this.image = null;
        await this.upload_S3(this.croppedImage);
      }
    },
    clearimage() {
      this.image = null;
      this.croppedImage = null;
    },
    async deleteImage(val, index) {
      try {
        const deatils = this.$store.getters.GetOrgDetails;

        const s3 = new S3Client({
          region: "us-east-1",
          credentials: {
            accessKeyId: deatils.s3_details.access_key,
            secretAccessKey: deatils.s3_details.secret_key,
          },
        });

        const baseIndex =
          val.indexOf("amazonaws.com/") + "amazonaws.com/".length;
        const key = val.substring(baseIndex);

        const params = {
          Bucket: "stichh-medias",
          Key: key,
        };

        const command = new DeleteObjectCommand(params);
        await s3.send(command);

        this.urls.splice(index, 1);
        this.$store.commit("SetPublishMessage", this.urls);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },

    onDragEnd(event) {
      this.$store.commit("SetPublishMessage", this.urls);
    },
    async upload_S3(base64File) {
      this.uploadload = true;

      const [metadata, base64Data] = base64File.split(",");
      const contentType = metadata.match(/data:(.*);base64/)[1];

      await this.upload_S3_bucket(base64Data, contentType);

      this.uploadload = false;
    },

    async upload_S3_bucket(baseData, contentType) {
      this.uploadload = true;
      const self = this;
      const deatils = self.$store.getters.GetOrgDetails;

      const buf = Buffer.from(baseData, "base64");

      const s3Bucket = new AWS.S3({
        region: "us-east-1",
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });

      const bucketName = "stichh-medias";

      const params = {
        Bucket: bucketName,
        Key: `tvboard/${deatils.organization.organization_id}/${
          self.$store.getters.GetUserObj.user.user_id
        }/${Date.now()}/${self.replaceSpecialCharacters("image.png")}`, // Adjust the file name if needed
        ACL: "public-read",
        Body: buf,
        ContentType: contentType,
      };

      const bucketUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${params.Key}`;

      await new Promise((resolve, reject) => {
        s3Bucket.putObject(params, function (err, data) {
          if (err) {
            // console.log(err);
            reject(err);
          } else {
            self.urls.push(bucketUrl);
            self.$store.commit("SetPublishMessage", self.urls);
            resolve(data);
          }
        });
      });

      this.uploadload = false;
    },
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },
  },
};
</script>

<style scoped>
.centered-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.centered-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.outlined-card {
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 300px;
  text-align: center;
}
.scrollable-list {
  max-height: 65vh; /* Adjust as needed */
  overflow-y: auto;
  overflow-x: hidden;
}
</style>