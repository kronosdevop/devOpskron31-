<template>
  <v-app>
    <v-main>
      <v-card class="elevation-0">
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--white">
            <div class="custom-title">Report An Issue</div>
          </v-toolbar-title>

          <v-spacer></v-spacer>
          <v-btn small dark class="cardCss mt-3" @click="goBack()">
            <v-icon class="mr-1">mdi-chevron-double-left</v-icon>
            Back
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" xs="12" sm="12" md="8">
              <div
                align="center"
                class="flexClass"
                v-if="mounted == true"
                style="padding-top: 40px"
              >
                <img
                  ref="imgRef"
                  width="100%"
                  height="350px"
                  class="flexClass"
                  :src="imageSRC"
                  @click="showMarkerArea"
                />
              </div>
              <v-card outlined width="100%" class="mx-2 mt-12 pa-2">
                <div class="font-weight-bold FontSize">
                  <u>Adding Annotation Instructions</u>
                </div>
                <div class="FontSize">
                  1. Click on the Image to enable adding annotation.
                </div>
                <div class="FontSize">
                  2. Select Any option from the toolbar.
                </div>
                <div class="FontSize">
                  3. After the changes are made click on the top right tick to
                  save the changes
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" xs="12" sm="12" md="4">
              <v-row no-gutters>
                <v-col cols="12" xs="12" sm="12" md="12">
                  <v-form ref="form">
                    <v-textarea
                      dense
                      outlined
                      rows="3"
                      :counter="1000"
                      class="FontSize field_height field_label_size"
                      label="Description"
                      v-model="report_issue.issue_description"
                      :rules="[
                        (v) => !!v || 'Required',
                        (v) =>
                          (v && v.length <= 1000) ||
                          'Description must be less than 1000 characters',
                      ]"
                    ></v-textarea>
                  </v-form>
                </v-col>
              </v-row>
              <v-card-actions class="pr-6 pb-4">
                <v-spacer></v-spacer>
                <v-btn small outlined dark class="cardCss" @click="goBack()"
                  >Cancel</v-btn
                >
                <v-btn
                  small
                  dark
                  class="cardCss"
                  :loading="loading"
                  @click="validateMethod()"
                  >Report</v-btn
                >
              </v-card-actions>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-main>
  </v-app>
</template>
  <script>
import { Buffer } from "buffer";
import * as markerjs2 from "markerjs2";
var axios = require("axios");
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: { SnackBar },
  data: () => ({
    msg: "",
    imageSRC: "",
    mounted: false,
    selectedFilesFromDrop: [],
    count: 0,
    overlayAttachments: false,
    report_issue: {
      issue_description: "",
    },
    loading: false,
    SnackBarComponent: {},
    selectedFiles: [],
    sub_systems: [],
    issue_attachments: [],
    loaderPercentage: 0,
    loaderPercentageDivider: 0,
  }),
  async mounted() {
    this.imageSRC = "";
    this.selectedFilesFromDrop =
      this.$store.getters.Getreporttracker.selectedFilesFromDrop;
    if (this.selectedFilesFromDrop && this.selectedFilesFromDrop.length != 0) {
      this.selectedFiles = this.selectedFilesFromDrop;
    }
    if (this.selectedFilesFromDrop.length == 1) {
      var fileReader = new FileReader();
      var self = this;
      self.mounted = false;
      fileReader.readAsDataURL(self.selectedFilesFromDrop[0]);
      fileReader.onload = async function (value) {
        self.imageSRC = value.target.result;
        self.mounted = true;
      };
    }
  },
  methods: {
    validateMethod() {
      if (this.$refs.form.validate()) {
        if (this.selectedFiles.length != 0) {
          this.count = 0;
          this.loaderPercentage = 0;
          this.loaderPercentageDivider = 100 / this.selectedFiles.length;
          this.uploadImageToS3();
        }
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: "Invalid Input(s)",
        };
      }
    },
    goBack() {
      this.$router.push(this.$store.getters.Getreporttracker.routeName);
    },
    handleLargeBase64(base64String, maxChunkSize = 50000) {
      const chunks = [];
      for (let i = 0; i < base64String.length; i += maxChunkSize) {
        chunks.push(base64String.substring(i, i + maxChunkSize));
      }
      return chunks;
    },
    async uploadImageToS3() {
      this.loading = true;
      this.overlayAttachments = true;
      var self = this;
      var base64FileContent = self.imageSRC.split(",");
      let Attachments = {
        file_data: Buffer.from(base64FileContent[1], "base64"),
        content_type: self.selectedFiles[0].type,
        file_extension: `.${self.selectedFiles[0].name.split(".").pop()}`,
      };
      self.issue_attachments.push(Attachments);

      self.loading = true;
      axios({
        method: "POST",
        url: "https://61fvl4pi50.execute-api.ap-southeast-1.amazonaws.com/dev/report_issue_for_other_projects",
        headers: {
          "content-type": "application/json",
          "x-api-key": "pBO4CvjwZWaZQpKERUVE56M1A48MQgn911zjrHZi",
        },
        data: {
          command: "reportIssueForOtherProjects",
          user_email_id: self.$store.getters.GetUserEmailTeam,
          project_api_key:
            "53544943484832342d31373230303031303232363635316931733070696d39",
          issue_description: self.report_issue.issue_description,
          issue_attachments: self.issue_attachments,
        },
      })
        .then((res) => {
          if (res.data.status == "success") {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: res.data.message,
              timeout: 5000,
              Top: true,
            };

            setTimeout(() => {
              self.goBack();
            }, 500);
          } else {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              Top: true,
              SnackbarText: res.errorMessage,
            };
          }
          self.loading = false;
        })
        .catch((error) => {
          // console.log(error);
          self.loading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: error.errors[0].message,
          };
        });
    },
    showMarkerArea() {
      const markerArea = new markerjs2.MarkerArea(this.$refs.imgRef);
      markerArea.addEventListener("render", (event) => {
        this.$refs.imgRef.src = event.dataUrl;
        this.imageSRC = event.dataUrl;
      });
      markerArea.show();
    },
  },
};
</script>
  <style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.flexClass {
  display: flex !important;
}
</style>