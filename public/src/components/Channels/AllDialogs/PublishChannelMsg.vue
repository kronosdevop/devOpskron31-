<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card variant="outlined" class="publish-channel-card">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon size="24" color="primary" class="mr-3">mdi-broadcast</v-icon>
        <span class="text-h6 font-weight-medium">Publish Channel Message</span>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <v-form ref="form">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                variant="outlined"
                density="compact"
                label="Title"
                :rules="[(v) => !!v || 'Title is required']"
                :counter="25"
                v-model="broadcastName"
                @input="fetch_message(broadcastName)"
                maxlength="25"
                prepend-inner-icon="mdi-format-title"
                placeholder="Enter broadcast title"
                class="mb-4"
              />
            </v-col>

            <!-- HTML Editor for Description -->
            <v-col cols="12">
              <div class="d-flex align-center mb-2">
                <v-icon size="20" color="primary" class="mr-2">mdi-text</v-icon>
                <span class="text-subtitle-2 font-weight-medium">Description</span>
              </div>
              <div class="toolbar mb-2">
                <v-btn-group variant="outlined" density="compact" class="mr-2">
                  <v-btn size="small" @click="formatText('bold')" prepend-icon="mdi-format-bold"></v-btn>
                  <v-btn size="small" @click="formatText('italic')" prepend-icon="mdi-format-italic"></v-btn>
                  <v-btn size="small" @click="formatText('underline')" prepend-icon="mdi-format-underline"></v-btn>
                </v-btn-group>
                <v-btn-group variant="outlined" density="compact" class="mr-2">
                  <v-btn size="small" @click="formatText('h1')">H1</v-btn>
                  <v-btn size="small" @click="formatText('h2')">H2</v-btn>
                  <v-btn size="small" @click="formatText('h3')">H3</v-btn>
                </v-btn-group>
                <v-btn-group variant="outlined" density="compact" class="mr-2">
                  <v-btn size="small" @click="formatText('insertUnorderedList')" prepend-icon="mdi-format-list-bulleted"></v-btn>
                  <v-btn size="small" @click="formatText('insertOrderedList')" prepend-icon="mdi-format-list-numbered"></v-btn>
                </v-btn-group>
                <v-btn-group variant="outlined" density="compact">
                  <v-btn size="small" @click="formatText('justifyLeft')" prepend-icon="mdi-format-align-left"></v-btn>
                  <v-btn size="small" @click="formatText('justifyCenter')" prepend-icon="mdi-format-align-center"></v-btn>
                  <v-btn size="small" @click="formatText('justifyRight')" prepend-icon="mdi-format-align-right"></v-btn>
                </v-btn-group>
              </div>
              <div
                ref="editor"
                class="html-editor"
                contenteditable="true"
                @input="updateContent"
                @paste="handlePaste"
                :placeholder="'Enter message description here...'"
                v-html="description"
              ></div>
            </v-col>

            <v-col cols="12" md="6">
              <v-textarea
                v-model="sourceInfo"
                density="compact"
                auto-grow
                rows="3"
                variant="outlined"
                :rules="[
                  (v) =>
                    !v ||
                    (!!v && v.length > 0, this.validateURL(v)) ||
                    'Invalid URL format',
                ]"
                label="Source Info (Optional)"
                maxlength="1000"
                prepend-inner-icon="mdi-link"
                placeholder="Enter source URL or information"
                class="mb-4"
              />
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" class="pa-4 mb-4">
                <div class="d-flex align-center mb-3">
                  <v-icon size="20" color="primary" class="mr-2"
                    >mdi-image</v-icon
                  >
                  <span class="text-subtitle-2 font-weight-medium"
                    >Broadcast Image</span
                  >
                </div>

                <v-file-input
                  label="Choose an image file"
                  density="compact"
                  variant="outlined"
                  prepend-icon="mdi-camera"
                  v-model="broadcastImage"
                  accept="image/*"
                  @change="get_files(broadcastImage)"
                  placeholder="Select an image for your broadcast"
                  class="mb-3"
                ></v-file-input>

                <v-card
                  v-show="cardCheck == 1"
                  variant="outlined"
                  class="image-preview-card"
                  max-width="200"
                >
                  <v-img :src="baseData[0]" height="120" cover class="rounded">
                    <template v-slot:placeholder>
                      <div
                        class="d-flex align-center justify-center fill-height"
                      >
                        <v-progress-circular
                          indeterminate
                          color="primary"
                        ></v-progress-circular>
                      </div>
                    </template>
                  </v-img>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 justify-end">
        <!-- <v-btn
          variant="text"
          @click="$emit('close')"
          class="mr-3"
        >
          Cancel
        </v-btn> -->
        <v-btn
          variant="elevated"
          :loading="loading"
          @click="validate_data()"
          color="primary"
          prepend-icon="mdi-send"
          class="text-capitalize"
        >
          Publish Message
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
      
      <script>
/* eslint-disable */
// import { VueEditor } from "vue2-editor";
// TODO: Replace with Vue 3 compatible rich text editor (e.g., @tinymce/tinymce-vue, quill)
import { Auth } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { publish_broadcast_messages } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// var AWS = require("aws-sdk");
// import { Buffer } from "buffer";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
export default {
  props: {
    selectedChat: Array,
  },
  components: {
    SnackBar,
    // VueEditor,
  },
  data() {
    return {
      loading: false,
      broadcastName: "",
      description: "",
      dashboard_type: "",
      Password: "",
      SnackBarComponent: {},
      customToolbar: [
        [{ header: [false, 1, 2, 3, 4, 5, 6] }],
        ["bold", "italic", "underline"],
        [{ align: "" }, { align: "center" }, { align: "justify" }],
        [{ color: [] }],
      ],
      sourceInfo: "",
      imageUrl: "",
      selectedFile: "",
      baseData: [],
      broadcastImage: [],
      cardCheck: 0,
      url: "",
    };
  },
  watch: {
    // Watcher to detect when broadcastImage is cleared
    broadcastImage(newValue) {
      if (!newValue) {
        this.baseData = [];
        this.cardCheck = 0;
      }
    },
  },
  created() {
    this.broadcastImage = [];
  },
  methods: {
    // close_dialog() {
    //   this.$refs.form.reset();

    //   this.$emit("clicked", 0);
    // },
    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },

    fetch_message(value) {
      this.description = value;
    },
    async upload_new_func() {
      if (!this.selectedFile) return;
      await Auth.currentCredentials();
      const orgDetails1 = this.$store.getters.GetOrgDetails;
      const userId = this.$store.getters.GetUserObj.user.user_id;

      // const userId = this.$store.getters.GetUserObj.user.user_id;

      const key = `broadcast/${
        orgDetails1.organization.organization_id
      }/${userId}/${Date.now()}-${this.selectedFile.name.split(" ").join("")}`;
      try {
        const fileUrl = await uploadToS3(
          this.selectedFile,
          orgDetails1.s3_details,
          key
        );
        if (fileUrl) {
          this.url = fileUrl;
          // console.log("✅ Uploaded file URL:", fileUrl);
          this.Create_broadcast_message();
        }
      } catch (err) {
        this.$emit("errorMsg", "Upload failed. Check console");
        this.loading = false;
      }
    },
    validate_data() {
      if (
        this.$refs.form.validate() &&
        this.broadcastImage != null &&
        this.broadcastImage.length != 0
      ) {
        this.loading = true;
        // this.upload_S3_bucket();
        this.upload_new_func();
        // this.Create_broadcast_message();
      } else {
        if (this.$refs.form.validate() && this.description != "") {
          this.Create_broadcast_message();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: "Please enter the channel content",
          };
        }
      }
    },
    // create_data() {
    //   alert(4);
    // },

    get_files(file) {
      this.selectedFile = file;
      this.upload_S3(file);
    },

    async upload_S3(files) {
      var imageUrl = [];
      var newUrl = [];
      this.baseData = [];
      var file = files;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        this.cardCheck = 1;
        this.baseData.push(newUrl);
      });
      // console.log(this.baseData);
    },

    async upload_S3_bucket() {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;
      var baseInfo = this.baseData[0].replace(
        "data:" + this.selectedFile.type + ";base64,",
        ""
      );
      var buf = Buffer.from(baseInfo, "base64");
      //  imageUrl.replace("data:" + file.type + ";base64,", "");
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
          self.$store.getters.GetUserObj.user.user_id +
          "/" +
          Date.now() +
          "/" +
          this.selectedFile.name.split(" ").join(""),

        Body: buf,
        ContentType: this.selectedFile.type,
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
          var deatil = self.$store.getters.GetOrgDetails;
          self.url = bucketurl;
          self.Create_broadcast_message(self.url);
          // self.s3get(deatil);
        }

        // self.contentdocumentFiles = [];
      });
    },

    async Create_broadcast_message() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      var channelInfo = this.selectedChat;

      try {
        let result = await API.graphql(
          graphqlOperation(publish_broadcast_messages, {
            input: {
              broadcast_title: this.broadcastName,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              broadcast_description: this.description,
              broadcast_media_url: this.url == "" ? "" : this.url,
              broadcast_source_url:
                this.sourceInfo == "" ? "N/A" : this.sourceInfo,
              broadcast_api_key: data.organization.team_api_key,
              team_topic_id: channelInfo.team_topic_id,
            },
          })
        );
        var response = JSON.parse(result.data.publish_broadcast_messages);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          // this.SnackBarComponent = {
          //   SnackbarVmodel: true,
          //   SnackbarColor: "green",
          //   Top: true,
          //   SnackbarText: response.Message,
          // };
          this.cardCheck = 0;
          this.baseData = [];
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
          this.broadcastImage = [];
          this.url = "";
        } else {
          // this.SnackBarComponent = {
          //   SnackbarVmodel: true,
          //   SnackbarColor: "red",
          //   Top: true,
          //   SnackbarText: response.Message,
          // };
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    formatText(command, value = null) {
      document.execCommand(command, false, value);
      this.$refs.editor.focus();
    },
    updateContent() {
      this.description = this.$refs.editor.innerHTML;
    },
    handlePaste(event) {
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
  },
};
</script>
      
      <style scoped>
.publish-channel-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.publish-channel-card .v-card-title {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px 12px 0 0;
}

.image-preview-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.v-text-field,
.v-textarea,
.v-file-input {
  transition: all 0.2s ease;
}

.v-text-field:focus-within,
.v-textarea:focus-within,
.v-file-input:focus-within {
  transform: translateY(-1px);
}

.v-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-card-actions {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 0 0 12px 12px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .publish-channel-card .v-card-text {
    padding: 16px;
  }

  .publish-channel-card .v-card-actions {
    padding: 16px;
  }

  .image-preview-card {
    max-width: 100% !important;
  }
}

/* Custom scrollbar for better UX */
.v-card-text::-webkit-scrollbar {
  width: 6px;
}

.v-card-text::-webkit-scrollbar-track {
  background: transparent;
}

.v-card-text::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.v-card-text::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.toolbar {
  background: #f5f5f5;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.html-editor {
  min-height: 120px;
  max-height: 300px;
  padding: 12px;
  outline: none;
  overflow-y: auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.html-editor:empty:before {
  content: attr(placeholder);
  color: #999;
  font-style: italic;
}

.html-editor:focus {
  border-color: #1976d2;
}
</style>