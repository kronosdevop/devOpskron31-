<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="uploadFileDialog"
      @update:model-value="$emit('update:uploadFileDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              {{
                subFileType == "folderCreation"
                  ? "Create Folder"
                  : "Upload File"
              }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text v-show="subFileType == 'fileUpload'">
          <v-form ref="form">
            <v-row no-gutters class="mt-5">
              <v-col cols="12">
                <v-file-input
                  variant="outlined"
                  density="compact"
                  v-model="inputFiles"
                  :rules="[(v) => !!v || 'File is required']"
                  label="Choose File"
                  @change="get_files(inputFiles)"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-text v-show="subFileType == 'folderCreation'">
          <v-form ref="form1">
            <v-row no-gutters class="mt-5">
              <v-col cols="12">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  :rules="[(v) => !!v || 'Required']"
                  v-model="folderName"
                  label="Folder Name"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            size="small"
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            > {{ subFileType == "folderCreation" ? "Save" : "Upload" }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { upload_file_s3 } from "@/graphql/mutations.js";
import { get_presigned_url_to_upload_files } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
export default {
  props: {
    uploadFileDialog: Boolean,
    subFileType: String,
    rowInfo: Object,
    selectedPath: String,
  },
  data() {
    return {
      inputFiles: null,
      loading: false,
      selectedFile: {},
      fileRules: [(v) => !!v || "File is required"],
      baseData: [],
      folderName: "",
      presignedUrl: "",
    };
  },
  watch: {
    uploadFileDialog: {
      async handler() {
        // console.log(this.rowInfo);
        // this.get_signed_url();
        if (this.subFileType == "fileUpload") {
        }
        // console.log(this.subFileType);
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.inputFiles = null;
      this.$emit("clicked", 0);
      this.$refs.form.reset();
      this.$refs.form1.reset();
    },

    async get_signed_url() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_presigned_url_to_upload_files, {
            input: {
              folder_name:
                this.subFileType == "folderCreation"
                  ? this.selectedPath + "/" + this.folderName.trim()
                  : this.selectedPath,
              file_name: this.selectedFile.name,
            },
          })
        );

        var response = JSON.parse(
          result.data.get_presigned_url_to_upload_files
        );
        this.presignedUrl = response.data;
        this.loading = false;
        this.inputFiles = null;
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

    get_files(file) {
      this.selectedFile = file;
    },

    async create_folder(basedata, file) {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(upload_file_s3, {
            input: {
              organization_id: data.organization.organization_id,
              file_name:
                this.subFileType == "fileUpload" ? file.name : undefined,
              folder_name:
                this.subFileType == "folderCreation"
                  ? this.selectedPath + "/" + this.folderName.trim()
                  : this.selectedPath,
              content_type:
                this.subFileType == "fileUpload" ? file.type : undefined,
              file_content:
                this.subFileType == "fileUpload" ? basedata : undefined,
            },
          })
        );
        var response = JSON.parse(result.data.upload_file_s3);

        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("sucessmsg", response.Message);
          this.$refs.form.reset();
          this.$refs.form1.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }

        // this.$refs.form.reset();
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    async validate_data() {
      if (this.subFileType === "fileUpload") {
        const { valid } = await this.$refs.form.validate();
        if (valid) {
          this.upload_file();
        }
      }
      if (this.subFileType === "folderCreation") {
        const { valid } = await this.$refs.form1.validate();
        if (valid) {
          this.create_folder();
        }
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
        this.uplod_file_to_url();
        // imageUrl = fr.result;
        // newUrl = imageUrl;
        // newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");
        // baseData.push(newUrl);
        // this.create_folder(baseData[0], file);
      });
    },

    async uplod_file_to_url() {
      var file = this.selectedFile;

      await this.get_signed_url();
      const uploadResponse = await fetch(this.presignedUrl, {
        method: "PUT",
        body: file,
        // headers: {
        //   "Content-Type": file.type, // Set content type to match the file
        // },
      });

      if (uploadResponse.ok) {
        this.loading = false;
        this.$emit("sucessmsg", "File uploaded successfully!");
        this.$refs.form.reset();
        this.$refs.form1.reset();
      } else {
        this.$emit("errorMsg", "Upload failed.");
        throw new Error("Upload failed.");
      }
    },
  },
};
</script>