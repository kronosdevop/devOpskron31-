<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="expenseView" @update:model-value="$emit('update:expenseView', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              Media for {{ rowInfo.category_id_text }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon
            @click="download_image('file', images[0])"
            color="primaryColor"
            class="mr-2"
            left
          >
            mdi-download</v-icon
          >
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-carousel
            v-model="model"
            height="auto"
            hide-delimiters
            :show-arrows="false"
            class="mt-5"
          >
            <v-carousel-item
              v-for="images1 in images"
              :key="images1"
              :src="images1"
            >
            </v-carousel-item>
          </v-carousel>
          <!-- <template>
            <v-toolbar dense flat>
              <v-btn
                @click="zoom_in"
                x-small
                class="ml-n4"
                fab
                dark
                color="primary"
              >
                <v-icon dark> mdi-plus </v-icon>
              </v-btn>
              <v-btn
                @click="zoom_out"
                x-small
                class="ml-1"
                fab
                dark
                color="primary"
              >
                <v-icon dark> mdi-minus </v-icon>
              </v-btn>
            </v-toolbar>
            <v-img
              height="300"
              ref="printImage"
              :style="{ width: zoomLevel + 'px', height: 'auto' }"
              contain
              :src="images[0]"
            ></v-img>
            <v-row no-gutters>
              <div class="text-left">
                <v-icon
                  @click="download_image('file', images[0])"
                  color="primaryColor"
                  class="mt-2"
                  left
                >
                  mdi-download</v-icon
                >
                <v-icon
                  color="primaryColor"
                  @click="print_image()"
                  class="mt-2"
                  left
                  >mdi-printer</v-icon
                >
              </div>
            </v-row>
          </template> -->
        </v-card-text>
      </v-card>
      <v-overlay :value="overlay">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { Storage, Auth } from "aws-amplify";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import axios from "axios";
const FileSaver = require("file-saver");

export default {
  props: {
    expenseView: Boolean,
    rowInfo: Object,
  },
  mixins: [get_Org_details],
  data() {
    return {
      model: 0,
      overlay: false,
      images: "",
      zoomLevel: 200,
    };
  },
  watch: {
    expenseView: {
      async handler() {
        this.images = "";
        this.overlay = true;
        await this.get_s3_storage();
        // alert(4);
        // await this.get_Org_details();
        // var response = this.orgDetails;

        // this.images = [this.s3get(response)];
        this.overlay = false;
      },
      immediate: true,
    },
  },
  methods: {
    zoom_in() {
      // Increase the zoom level (you can adjust the step size)
      this.zoomLevel += 20; // Adjust the step size as needed
    },
    zoom_out() {
      // Decrease the zoom level (you can adjust the step size)
    },
    print_image() {
      // window.print();
      const imageElement = this.$refs.printImage;
      // console.log(imageElement);
      var data = imageElement.image;
      const printWindow = window.open("", "", "width=600,height=600");
      printWindow.document.open();
      printWindow.document.write(
        "<html><head><title>Print Image</title></head><body>"
      );
      printWindow.document.write(
        '<img src="' + data.currentSrc + '" style="width: 100%;" />'
      );
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    },

    async get_s3_storage() {
      const rawUrl = this.rowInfo?.media_keys;
      const details = this.$store.getters.GetOrgDetails;
      // console.log(details.s3_details);
      if (!rawUrl || !details || !details.s3_details) {
        // console.warn("Missing required data for signed URL");
        return;
      }
      // const rawUrl = this.rowInfo.media_keys;
      // const details = this.$store.getters.GetOrgDetails;
      const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);

      if (signedUrl) {
        // Use the signed URL as needed
        this.images = [signedUrl];
        return signedUrl;
      }
      // const rawUrl = this.rowInfo.media_keys;

      // const url = new URL(rawUrl);
      // const key = url.pathname.slice(1);
      // const details = this.$store.getters.GetOrgDetails;
      // const bucket = details.s3_details.bucket_name;
      // const region = details.s3_details.region;
      // try {
      //   const signedUrl = await Storage.get(key, {
      //     level: "public",
      //     customPrefix: { public: "" },
      //     bucket,
      //     region,
      //     expires: 900,
      //     // validateObjectExistence: true,
      //   });
      //   console.log("✅ Signed URL:", signedUrl);
      // } catch (err) {
      //   console.error("❌ Failed to get signed URL:", err);
      //   if (err.response) console.error("📄 Error Response:", err.response);
      //   if (err.message) console.error("📄 Error Message:", err.message);
      // }
    },

    async download_image(val ,signedUrl) {
    const fileName = signedUrl.split("/").pop().split("?")[0];
      try {
    const response = await axios({
      url: signedUrl,
      method: "GET",
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    FileSaver.saveAs(blob, fileName);
  } catch (err) {
    this.$emit("errorMsg", "Download failed. Please try again.");
    console.error("Download error:", err);
  }
      // console.log(url)
      // const details = this.$store.getters.GetOrgDetails;
      // const signedUrl = await getS3SignedUrl(url, details.s3_details);

      // const fileName = signedUrl.split("/").pop().split("?")[0];
      // this.download_func(signedUrl, fileName);
    },
//     async download_func(signedUrl, fileName) {
//   try {
//     const response = await axios({
//       url: signedUrl,
//       method: "GET",
//       responseType: "blob",
//     });

//     const blob = new Blob([response.data]);
//     FileSaver.saveAs(blob, fileName);
//   } catch (err) {
//     this.$emit("errorMsg", "Download failed. Please try again.");
//     console.error("Download error:", err);
//   }
// },
    close_dialog() {
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
        Key: "workflow/" + this.rowInfo.media_keys.split("workflow/")[1],
        Expires: 6000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);

      return url;
    },
  },
};
</script>