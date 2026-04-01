<template>
  <!-- eslint-disable -->
  <div class="">
    <v-dialog :model-value="viewProfilePic" @update:model-value="$emit('update:viewProfilePic', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              {{
                rowInfoData.key == "prfl_pic_s3_key"
                  ? "Profile Picture"
                  : "Attachments"
              }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text v-if="rowInfoData.key == 'prfl_pic_s3_key'" class="mt-4">
          <v-img
            height="200"
            contain
            :src="rowInfoData.respectiveValue"
          ></v-img>
        </v-card-text>
        <v-card-text v-else>
          <template v-if="checkImageExtension(rowInfoData.respectiveValue)">
            <v-img height="200" contain :src="getImageSrc('image')"></v-img>
          </template>
          <template v-else>
            <v-row class="mt-4">
              <v-col cols="6">
                {{
                  rowInfoData.respectiveValue
                    .substring(rowInfoData.respectiveValue.lastIndexOf("/") + 1)
                    .split("__")[1]
                }}
              </v-col>
              <v-col cols="6">
                <v-icon
                  class=""
                  @click="getImageSrc('file')"
                  color="primaryColor"
                  >mdi-download</v-icon
                >
              </v-col>
            </v-row>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

import AWS from "aws-sdk";
export default {
  props: {
    viewProfilePic: Boolean,
    rowInfoData: Object,
  },
  data() {
    return {
      presignedUrl: "",
    };
  },
  watch: {
    viewProfilePic: {
      async handler() {
        if (this.viewProfilePic == true) {
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    checkImageExtension(value) {
      return (
        value.endsWith(".img") ||
        value.endsWith(".png") ||
        value.endsWith(".jpeg") ||
        value.endsWith(".jpg")
      );
    },
    getImageSrc(val) {
      var data = this.$store.getters.GetOrgDetails;

      const s3 = new AWS.S3({
        region: data.s3_details.region,
        accessKeyId: data.s3_details.access_key,
        secretAccessKey: data.s3_details.secret_key,
      });
      const params = {
        Bucket: data.s3_details.bucket_name,
        Key:
          "workflow/" + this.rowInfoData.respectiveValue.split("workflow/")[1],
        Expires: 604800,
      };

      const presignedUrl = s3.getSignedUrl("getObject", params);
      if (val == "image") {
        return presignedUrl;
      } else {
        window.open(presignedUrl, "_blank");
      }
    },
    get_value(value) {
      const name = value.substring(value.lastIndexOf("/") + 1);

      return name.split("__")[1];
    },
  },
};
</script>