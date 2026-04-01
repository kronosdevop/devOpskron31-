<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="uploadFileDialog" @update:model-value="$emit('update:uploadFileDialog', $event)" persistent max-width="450" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Upload File</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-5">
              <v-col cols="12">
                <v-file-input
                  outlined
                  dense
                  v-model="inputFiles"
                  :rules="[(v) => !!v || 'File is required']"
                  label="Choose File"
                  @change="get_files(inputFiles)"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Upload</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
export default {
  props: {
    uploadFileDialog: Boolean,
    orgResponse: Object,
    primaryKey: String,
  },
  data() {
    return {
      inputFiles: null,
      loading: false,
      selectedFile: {},
      fileRules: [(v) => !!v || "File is required"],
    };
  },
  methods: {
    close_dialog() {
      this.inputFiles = null;
      this.$emit("clicked", 0);
      this.$refs.form.reset();
    },

    get_files(file) {
      this.selectedFile = file;
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.upload_file();
      }
    },
    upload_file() {
      this.loading = true;
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = this.selectedFile;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");
        baseData.push(newUrl);
        this.upload_S3(baseData[0], file);
      });
    },
    async upload_S3(baseData, file) {
      var self = this;

      var buf = Buffer.from(baseData, "base64");

      var s3Bucket = new AWS.S3({
        region: this.orgResponse.s3_details.region,
        accessKeyId: this.orgResponse.s3_details.access_key,
        secretAccessKey: this.orgResponse.s3_details.secret_key,
      });
      var bucketName = this.orgResponse.s3_details.bucket_name;
      var region1 = this.orgResponse.s3_details.region;
      var params = {
        Bucket: bucketName,
        Key:
          this.primaryKey != ""
            ? this.primaryKey + file.name
            : "Cabinet" +
              "/" +
              this.orgResponse.organization.organization_id +
              "/",
        Body: buf,
      };

      var bucketurl =
        "https://" +
        bucketName +
        ".s3." +
        region1 +
        ".amazonaws.com/" +
        params.Key +
        "/" +
        Math.floor(new Date().getTime()) +
        "/" +
        file.name;

      await s3Bucket.putObject(params, function (err, data) {
        if (err) {
          this.loading = false;
        } else if (data) {
          self.loading = false;

          self.$emit("fileSuccess", "Uploaded Successfully");
          self.inputFiles = null;
        }
      });
    },
  },
};
</script>