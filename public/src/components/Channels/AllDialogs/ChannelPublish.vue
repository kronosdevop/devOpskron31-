<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card  flat>
      <v-card-text class="mt-4">
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
                @input="fetch_message(broadcastName)"
                maxlength="25"
              />
              <!-- <v-textarea
                outlined
                dense
                :rules="[(v) => !!v || 'Required']"
                height="250"
                :counter="500"
                label="Description"
                v-model="description"
                maxlength="500"
              /> -->
            </v-col>
            <v-col cols="6">
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
              <v-file-input
                label="File input"
                dense
                outlined
                prepend-icon="mdi-camera"
                v-model="broadcastImage"
                accept="image/*"
                @change="get_files(broadcastImage)"
              ></v-file-input>
              <v-card v-if="imagePreview && broadcastImage" height="80px">
                <img :src="imagePreview" height="80px" />
              </v-card>
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
            </v-col>
            <v-col cols="6"> </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          depressed
          :loading="loading"
          @click="validate_data()"
          dark
          class="cardCss text-capitalize button-corner"
        >
          Publish
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
    
    <script>
/* eslint-disable */
// import { VueEditor } from "vue2-editor";
// TODO: Replace with Vue 3 compatible rich text editor (e.g., @tinymce/tinymce-vue, quill)
import SnackBar from "@/components/SnackBar.vue";
import { publish_broadcast_messages } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
export default {
  // props: {
  //   broadcast_info: Object,
  // },
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
      selectedFile: null,
      baseData: [],
      broadcastImage: [],
      cardCheck: 0,
      url: "",
      actualUrl: "",
      imagePreview: null,
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

    async upload_new_func() {
      if (!this.selectedFile) return;

      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user?.user_id;

      const Key = [
        "broadcast",
        orgDetails.organization.organization_id,
        userId,
        Date.now(),
        this.selectedFile.name.split(" ").join(""),
      ].join("/");

      try {
        const fileUrl = await uploadToS3(
          this.selectedFile,
          orgDetails.s3_details,
          Key
        );
        if (fileUrl) {
          //  this.actualUrl = fileUrl

          this.Create_broadcast_message(fileUrl);
        }
      } catch (err) {
        this.loading = false;
      }
    },

    fetch_message(value) {
      this.description = value;
    },

    validate_data() {
      if (
        this.$refs.form.validate() &&
        this.broadcastImage != null &&
        this.broadcastImage.length != 0
      ) {
        this.loading = true;
        this.upload_new_func();
        // this.upload_S3_bucket();
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
      this.imagePreview = URL.createObjectURL(file);
      // console.log(this.imagePreview);
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

    // async upload_S3_bucket() {
    //   var self = this;
    //   var deatils = self.$store.getters.GetOrgDetails;
    //   var baseInfo = this.baseData[0].replace(
    //     "data:" + this.selectedFile.type + ";base64,",
    //     ""
    //   );
    //   var buf = Buffer.from(baseInfo, "base64");
    //   //  imageUrl.replace("data:" + file.type + ";base64,", "");
    //   var s3Bucket = new AWS.S3({
    //     region: deatils.s3_details.region,
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });
    //   var bucketName = deatils.s3_details.bucket_name;

    //   var params = {
    //     Bucket: bucketName,
    //     Key:
    //       "broadcast" +
    //       "/" +
    //       deatils.organization.organization_id +
    //       "/" +
    //       self.$store.getters.GetUserObj.user?.user_id +
    //       "/" +
    //       Date.now() +
    //       "/" +
    //       this.selectedFile.name.split(" ").join(""),

    //     Body: buf,
    //     ContentType: this.selectedFile.type,
    //   };

    //   var bucketurl =
    //     "https://" +
    //     bucketName +
    //     ".s3." +
    //     deatils.s3_details.region +
    //     ".amazonaws.com/" +
    //     params.Key;

    //   await s3Bucket.putObject(params, function (err, data) {
    //     if (err) {
    //       this.loading1 = false;
    //     } else if (data) {
    //       var deatil = self.$store.getters.GetOrgDetails;
    //       self.url = bucketurl;
    //       self.Create_broadcast_message(self.url);
    //       // self.s3get(deatil);
    //     }

    //     // self.contentdocumentFiles = [];
    //   });
    // },

    async Create_broadcast_message(url) {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      var channelInfo = JSON.parse(localStorage.getItem("channelInfo"));

      try {
        let result = await API.graphql(
          graphqlOperation(publish_broadcast_messages, {
            input: {
              broadcast_title: this.broadcastName,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              broadcast_description: this.description,
              broadcast_media_url: this.url == "" ? "" : this.url,
              broadcast_source_url: url == undefined ? "N/A" : url,
              broadcast_api_key: data.organization.team_api_key,
              team_topic_id: channelInfo.team_topic_id,
            },
          })
        );
        var response = JSON.parse(result.data.publish_broadcast_messages);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            Top: true,
            SnackbarText: response.Message,
          };
          this.cardCheck = 0;
          this.baseData = [];
          // this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
          this.broadcastImage = [];
          this.url = "";
          this.imagePreview = null;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: response.Message,
          };
          // this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
    
    <style>
</style>