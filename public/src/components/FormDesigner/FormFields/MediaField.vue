<template>
  <div>
    <!-- <v-card
      :flat="formActionType != undefined"
      v-if="formActionType != 'initiate'"
    >
      <v-card-text>
        <v-text-field
          dense
          outlined
          readonly
          :label="index.displayLabel"
          rows="0"
          auto-grow
          @click="emit_edit_field(index)"
        ></v-text-field>
        <v-btn
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
          x-small
          color="red"
          fab
          dark
          absolute
          bottom
          right
          @click="emit_fields((Toggle = 1), index)"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>
    <v-card flat v-else>
      <v-text-field
        v-if="index.is_displayed == true"
        dense
        v-model="emailField"
        outlined
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [rules.email] : []"
        @blur="get_value(emailField, index.display_label, index.key)"
      ></v-text-field>
    </v-card> -->
    <v-card flat v-if="formActionType != 'initiate'" class="pa-1">
      <!-- <v-card-text> -->
      <v-textarea
        class="field_label_size FontSize"
        density="compact"
        variant="outlined"
        :label="index.displayLabel"
        row-height="10"
        rows="1"
        auto-grow
        @click="emit_edit_field(index)"
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
      >
        <!-- <template #append>
            <v-icon color="red">mdi-delete</v-icon>
          </template> -->
      </v-textarea>

      <!-- <v-btn
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
          x-small
          color="red"
          fab
          dark
          absolute
          bottom
          right
          @click="emit_fields((Toggle = 1), index)"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn> -->
      <!-- </v-card-text> -->
    </v-card>
    <v-card
      flat
      v-show="
        (formActionType == 'initiate' || formActionType == 'Pending') &&
        index.is_displayed == true &&
        (index.respectiveValue == undefined ||
          index.respectiveValue == '' ||
          index.respectiveValue == 'N/A')
      "
      class="pa-1"
    >
      <!-- class="no-icon-file-input field_label_size FontSize" -->
      <!-- <v-file-input label="File input" outlined dense></v-file-input> -->
      <v-file-input
        density="compact"
        variant="outlined"
        prepend-icon=""
        v-model="selectedFile"
        @click:clear="clearImage()"
        :readonly="index.is_readonly"
        :disabled="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="
          index.is_required == true &&
          (index.respectiveValue == undefined ||
            index.respectiveValue == '' ||
            index.respectiveValue == 'N/A')
            ? [fileIsRequired]
            : []
        "
        @change="upload_new_func(selectedFile)"
      >
        <!-- @change="upload_file(selectedFile)" -->
      </v-file-input>
      <v-card
        class="mt-5 rounded-lg elevation-1"
        v-for="(filterimage, index) in filterimage"
        :key="index"
      >
        <v-img
          max-height="80"
          contain
          :src="filterimage"
          v-if="filterimage.length > 1"
        >
        </v-img>
      </v-card>
    </v-card>
    <v-card
      flat
      v-if="
        index.is_displayed == true &&
        index.respectiveValue != '' &&
        index.respectiveValue != undefined &&
        index.respectiveValue != 'N/A'
      "
      class="pa-2"
    >
      <v-row>
        <v-col :cols="index.is_readonly == false ? 9 : 12">
          <v-text-field
            readonly
            density="compact"
            variant="outlined"
            v-model="index.respectiveValue"
            :value="displayFileName"
            :label="
              index.is_required == true
                ? index.display_label + '*'
                : index.display_label
            "
            class="field_label_size FontSize"
            append-icon="mdi-download"
            @click:append="downloadlist(index)"
          />
        </v-col>
        <v-col cols="3" v-show="index.is_readonly == false">
          <v-btn variant="text" icon @click="previewImage()" class="ml-n4 mr-1">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn variant="text" icon @click="clearFile()" class="ml-n4">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    
    <!-- File Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="900" max-height="80vh">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ getPreviewTitle() }}</span>
          <v-btn icon @click="previewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <!-- Image Preview -->
          <v-img
            v-if="fileType === 'image' && previewImageUrl"
            :src="previewImageUrl"
            max-height="600"
            contain
          ></v-img>
          
          <!-- PDF Preview -->
          <iframe
            v-else-if="fileType === 'pdf' && previewImageUrl"
            :src="previewImageUrl"
            width="100%"
            height="600"
            frameborder="0"
          ></iframe>
          
          <!-- Video Preview -->
          <video
            v-else-if="fileType === 'video' && previewImageUrl"
            :src="previewImageUrl"
            controls
            width="100%"
            max-height="600"
            style="max-height: 600px;"
          ></video>
          
          <!-- Audio Preview -->
          <div v-else-if="fileType === 'audio' && previewImageUrl" class="pa-8">
            <div class="text-center">
              <v-icon size="64" color="primary">mdi-music</v-icon>
              <p class="text-h6 mt-4">{{ displayFileName }}</p>
              <audio :src="previewImageUrl" controls class="mt-4" style="width: 100%;"></audio>
            </div>
          </div>
          
          <!-- Document Preview -->
          <div v-else-if="fileType === 'document' && previewImageUrl" class="pa-8">
            <div class="text-center">
              <v-icon size="64" color="primary">mdi-file-document</v-icon>
              <p class="text-h6 mt-4">{{ displayFileName }}</p>
              <p class="text-grey mt-2">This file type cannot be previewed inline</p>
              <v-btn color="primary" @click="downloadFile()" class="mt-4">
                <v-icon left>mdi-download</v-icon>
                Download File
              </v-btn>
            </div>
          </div>
          
          <!-- No file or error -->
          <div v-else class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-file-off</v-icon>
            <p class="text-grey mt-2">No file to preview</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="downloadFile()" v-if="previewImageUrl">
            <v-icon left>mdi-download</v-icon>
            Download
          </v-btn>
          <v-btn @click="previewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- @blur="send_file_data(selectedFile,index.display_label,index.key)" -->
    <!-- <v-card flat v-else>
      <v-file-input
        v-if="index.is_displayed == true && index.respectiveValue == ''"
        outlined
        accept="image/png, image/jpeg, image/bmp"
        v-model="selectedFile"
        dense
        class="no-icon-file-input"
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
      ></v-file-input>
      <div
        class="text-left mt-n2 mb-2"
        v-if="
          index.is_displayed == true &&
          index.respectiveValue != '' &&
          index.respectiveValue != undefined
        "
      >
        <b>
          {{
            index.is_required == true
              ? index.display_label + "*"
              : index.display_label
          }}</b
        >
        <v-icon
          @click="get_image_info(index.respectiveValue)"
          color="primaryColor"
          class="ml-2"
          >mdi-forward</v-icon
        >
      </div>
    </v-card> -->
  </div>
</template>
<script>
/*eslint-disable */
var AWS = require("aws-sdk");
import { Auth, Storage } from "aws-amplify";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { Buffer } from "buffer";
const FileSaver = require("file-saver");
import axios from "axios";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  // mixins:[uploadToS3],
  data: () => ({
    Toggle: 0,
    textValue: "",
    selectedFile: [],
    urls: "",
    valueArray: [],
    filterimage: [],
    previewDialog: false,
    previewImageUrl: "",
  }),
  computed: {
    shouldShowDeleteIcon() {
      // Check your conditions here
      if (
        this.formActionType !== "initiate" &&
        this.formActionType !== "preview"
      ) {
        return true; // Show the icon
      } else {
        return false; // Do not show the icon
      }
    },
    displayFileName() {
      if (this.index.respectiveValue && this.index.respectiveValue !== '' && this.index.respectiveValue !== 'N/A') {
        return this.index.respectiveValue.split('/').pop().split('?')[0];
      }
      return '';
    },
    fileType() {
      if (this.index.respectiveValue && this.index.respectiveValue !== '' && this.index.respectiveValue !== 'N/A') {
        const fileName = this.index.respectiveValue.split('/').pop().split('?')[0].toLowerCase();
        const extension = fileName.split('.').pop();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
          return 'image';
        } else if (extension === 'pdf') {
          return 'pdf';
        } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
          return 'video';
        } else if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension)) {
          return 'audio';
        } else {
          return 'document';
        }
      }
      return 'unknown';
    }
  },
  created() {
    this.filterimage = [];
    // alert(this.formActionType);
    // if (this.formAction == "Pending") {
    //   this.formTemplate.forEach((element) => {
    //     if (element.key == this.index.key) {
    //       this.selectedFile = element.respectiveValue;
    //     }
    //   });
    // }
    // console.log("hello");
  },
  methods: {
    async clearImage() {
      try {
        const baseIndex =
          this.urls.indexOf("amazonaws.com/") + "amazonaws.com/".length;
        const key = this.urls.substring(baseIndex);

        const result = await deleteS3SignedUrl(key);
        if (result) {
          this.urls = "";
          this.send_url("");
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    },
    // async handleClear() {
    //   var deatils = this.$store.getters.GetOrgDetails;
    //   const s3 = new S3Client({
    //     region: deatils.s3_details.region,
    //     credentials: {
    //       accessKeyId: deatils.s3_details.access_key,
    //       secretAccessKey: deatils.s3_details.secret_key,
    //     },
    //   });
    //   const baseIndex =
    //     this.urls.indexOf("amazonaws.com/") + "amazonaws.com/".length;
    //   const key = this.urls.substring(baseIndex);

    //   const params = {
    //     Bucket: deatils.s3_details.bucket_name,
    //     Key: key,
    //   };
    //   const command = new DeleteObjectCommand(params);
    //   s3.send(command)
    //     .then(() => {
    //       this.filterimage = [];
    //       this.selectedFile = [];
    //       this.urls = "";
    //       this.send_url("");
    //       // console.log("File deleted successfully.");
    //     })
    //     .catch((error) => {
    //       console.error("Error deleting file:", error);
    //     });
    // },
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    fileIsRequired(value) {
      if (Array.isArray(value) && value.length === 0) {
        return "File is required";
      }
      return true;

      // return !!value || 'File is required';
    },

    // get_value(fieldvalue, fieldlabel, fieldKey) {
    //   var data = {
    //     label: fieldlabel,
    //     value: fieldvalue == "" ? "N/A" : fieldvalue,
    //     key: fieldKey,
    //   };
    //   this.$emit("textinput", data);
    // },

    emit_edit_field(value) {
      this.$emit("mediaEdit", value);
    },
    get_image_info(value) {
      this.$emit("imageNavigation", value);
    },

    // upload_file(file) {
    //   var imageUrl = [];
    //   var newUrl = [];
    //   var baseData = [];
    //   var file = file;
    //   const fr = new FileReader();
    //   fr.readAsDataURL(file);
    //   fr.addEventListener("load", () => {
    //     imageUrl = fr.result;
    //     newUrl = imageUrl;
    //     newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

    //     baseData.push(newUrl);

    //     this.upload_S3_bucket(baseData[0], file);
    //   });
    // },
    async downloadlist(url) {
      const details = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(
        url.respectiveValue,
        details.s3_details
      );
      if (signedUrl) {
        this.dwonload_pdf(
          signedUrl,
          `${signedUrl.split("/").pop().split("?")[0]}`
        );
      }

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
      // // this.$emit("mediaurlExists", imageElement);
      // this.dwonload_pdf(
      //   imageElement,
      //   `${imageElement.split("/").pop().split("?")[0]}`
      // );
    },
    async upload_new_func(fileData) {
      if (!fileData) {
        // console.log("No fileData, exiting function");
        return;
      }
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user?.user_id;

      const key =
        "workflow" +
        "/" +
        orgDetails.organization.organization_id +
        "/" +
        userId +
        "/" +
        Date.now() +
        "/" +
        fileData.name.split(" ").join("");
      try {
        const fileUrl = await uploadToS3(fileData, orgDetails.s3_details, key);
        if (fileUrl) {
          this.send_url(fileUrl);
          this.urls = fileUrl;
        }
      } catch (err) {
        // console.log(err);
        this.loading = false;
      }
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

    // async upload_S3_bucket(baseData, file) {
    //   var self = this;
    //   var deatils = self.$store.getters.GetOrgDetails;

    //   var buf = Buffer.from(baseData, "base64");

    //   var s3Bucket = new AWS.S3({
    //     region: deatils.s3_details.region,
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });
    //   var bucketName = deatils.s3_details.bucket_name;

    //   var params = {
    //     Bucket: bucketName,
    //     Key:
    //       "workflow" +
    //       "/" +
    //       deatils.organization.organization_id +
    //       "/" +
    //       self.$store.getters.GetUserObj.user?.user_id +
    //       "/" +
    //       Date.now() +
    //       "/" +
    //       file.name.split(" ").join(""),

    //     Body: buf,
    //     ContentType: file.type,
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
    //       // console.log(err);
    //       this.loading1 = false;
    //     } else if (data) {
    //       bucketurl;
    //       var deatil = self.$store.getters.GetOrgDetails;
    //       self.urls = bucketurl;
    //       self.send_url(self.urls);
    //       self.s3get(deatil);
    //     }
    //   });
    // },
    // s3get(response) {
    //   var s3Bucket = new AWS.S3({
    //     region: response.s3_details.region,
    //     accessKeyId: response.s3_details.access_key,
    //     secretAccessKey: response.s3_details.secret_key,
    //     signatureVersion: "v4",
    //   });
    //   var params = {
    //     Bucket: response.s3_details.bucket_name,
    //     Key: "workflow/" + this.urls.split("workflow/")[1],
    //     Expires: 60000 * 5,
    //   };
    //   var url = s3Bucket.getSignedUrl("getObject", params);
    //   this.filterimage = [];
    //   if (this.isImageUrl(url)) {
    //     this.filterimage.unshift(url);
    //   } else {
    //     this.filterimage = [];
    //   }

    //   //   return url;
    // },
    isImageUrl(url) {
      const baseUrl = url.split("?")[0].toLowerCase();
      return /\.(jpg|jpeg|png)$/.test(baseUrl);
    },
    clearFile() {
      this.index.respectiveValue = "";
      this.selectedFile = [];
      this.send_url("");
    },
    send_url(url) {
      var data = {
        label: this.index.display_label,
        value: url == "" ? "N/A" : url,
        key: this.index.key,
      };

      this.$emit("mediaUploaded", data);
    },
    async previewImage() {
      if (this.index.respectiveValue && this.index.respectiveValue !== '' && this.index.respectiveValue !== 'N/A') {
        try {
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            this.index.respectiveValue,
            details.s3_details
          );
          if (signedUrl) {
            this.previewImageUrl = signedUrl;
            this.previewDialog = true;
          }
        } catch (error) {
          console.error("Error getting signed URL for preview:", error);
          // Fallback to direct URL if signed URL fails
          this.previewImageUrl = this.index.respectiveValue;
          this.previewDialog = true;
        }
      }
    },
    getPreviewTitle() {
      const type = this.fileType;
      const titles = {
        'image': 'Image Preview',
        'pdf': 'PDF Preview',
        'video': 'Video Preview',
        'audio': 'Audio Preview',
        'document': 'Document Preview',
        'unknown': 'File Preview'
      };
      return titles[type] || 'File Preview';
    },
    downloadFile() {
      this.downloadlist(this.index);
    },
  },
};
</script>
<style scoped>
</style>
<style >
/* Hide the file input icon */
.no-icon-file-input .v-input__control {
  padding-right: 0;
  margin-left: -7px;
  /* Remove padding on the right side of the input */
}

.no-icon-file-input .v-input__icon {
  display: none;
}

/* Adjust the width of the input to occupy the full space */
.no-icon-file-input input[type="file"] {
  width: 100%;
}
.field_label_size .v-field__input {
  color: #000000 !important;
  opacity: 1 !important;
}

.field_label_size .v-field__input input {
  color: #000000 !important;
  opacity: 1 !important;
}

.field_label_size .v-input__control .v-field__input {
  color: #000000 !important;
  opacity: 1 !important;
}
</style>