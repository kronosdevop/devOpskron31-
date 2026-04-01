<template>
  <div>
    <v-card
      :flat="formActionType != undefined"
      v-if="formActionType != 'initiate'"
      class="pa-2"
    >
      <v-card-text>
        <div class="text-left">{{ index.displayLabel }}</div>
        <div v-if="imageregularUrl.length === 0" class="text-center pa-4">
          <v-icon large color="grey">mdi-image-off</v-icon>
          <div class="text-grey">No images available</div>
        </div>
        <v-carousel
          v-model="model1"
          height="auto"
          hide-delimiters
          :show-arrows="false"
          v-else-if="imageregularUrl.length == 1"
        >
          <v-carousel-item
            v-for="images1 in imageregularUrl"
            :key="images1"
            @click="emit_edit_field(index)"
          >
            <v-img height="150" :src="images1" contain></v-img>
          </v-carousel-item>
        </v-carousel>
        <v-carousel v-model="model2" height="auto" hide-delimiters v-else>
          <v-carousel-item
            v-for="images1 in imageregularUrl"
            :key="images1"
            @click="emit_edit_field(index)"
          >
            <v-img height="150" :src="images1" contain></v-img>
          </v-carousel-item>
        </v-carousel>
        <v-btn
          x-small
          color="red"
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
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

    <v-card v-else flat class="mb-2">
      <div class="pa-2">
        <div v-if="imageregularUrl.length === 0" class="text-center pa-4">
          <v-icon large color="grey">mdi-image-off</v-icon>
          <div class="text-grey">No images available</div>
        </div>
        <v-carousel
          v-model="model3"
          height="auto"
          hide-delimiters
          :show-arrows="false"
          v-else-if="imageregularUrl.length == 1"
        >
          <v-carousel-item v-for="images1 in imageregularUrl" :key="images1">
            <v-img height="150" :src="images1" contain></v-img>
          </v-carousel-item>
        </v-carousel>
        <v-carousel v-model="model4" height="auto" hide-delimiters v-else>
          <v-carousel-item v-for="images1 in imageregularUrl" :key="images1">
            <v-img height="150" :src="images1" contain></v-img>
          </v-carousel-item>
        </v-carousel>
      </div>
    </v-card>
  </div>
</template>
  <script>
/* eslint-disable */

var AWS = require("aws-sdk");
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  data: () => ({
    Toggle: 0,
    dropdownOption: "",
    itemsValue: [],
    imageregularUrl: [],
    model1: false,
    model2: false,
    model3: false,
    model4: false,
  }),
  async created() {
    this.imageregularUrl = [];
    // console.log("ImageviewField created - index:", this.index);

    if (this.index.input_array_value != undefined) {
      // console.log("Using input_array_value:", this.index.input_array_value);
      if (this.index.input_array_value.length != 0) {
        for (let i = 0; i < this.index.input_array_value.length; i++) {
          const details = this.$store.getters.GetOrgDetails;
          // console.log("Processing image:", this.index.input_array_value[i].type);
          const signedUrl = await getS3SignedUrl(
            this.index.input_array_value[i].type,
            details.s3_details
          );
          if (signedUrl) {
            this.imageregularUrl.push(signedUrl);
            // console.log("Added signed URL:", signedUrl);
          } else {
            console.warn(
              "Failed to get signed URL for:",
              this.index.input_array_value[i].type
            );
          }
        }
      }
    } else {
      // console.log("Using fieldOptions:", this.index.fieldOptions);
      if (this.index.fieldOptions && this.index.fieldOptions.length != 0) {
        for (let i = 0; i < this.index.fieldOptions.length; i++) {
          const details = this.$store.getters.GetOrgDetails;
          // console.log("Processing fieldOption:", this.index.fieldOptions[i]);
          const signedUrl = await getS3SignedUrl(
            this.index.fieldOptions[i],
            details.s3_details
          );
          if (signedUrl) {
            this.imageregularUrl.push(signedUrl);
            // console.log("Added signed URL:", signedUrl);
          } else {
            console.warn(
              "Failed to get signed URL for:",
              this.index.fieldOptions[i]
            );
          }
        }
      }
    }
    // console.log("Final imageregularUrl array:", this.imageregularUrl);
  },
  methods: {
    async emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },
    // s3convert(urls) {
    //   // console.log(urls);
    //   var response = this.$store.getters.GetOrgDetails;
    //   var s3Bucket = new AWS.S3({
    //     region: response.s3_details.region,
    //     accessKeyId: response.s3_details.access_key,
    //     secretAccessKey: response.s3_details.secret_key,
    //     signatureVersion: "v4",
    //   });
    //   var params = {
    //     Bucket: response.s3_details.bucket_name,
    //     Key: "workflow/" + urls.split("workflow/")[1],
    //     Expires: 60000 * 5,
    //   };
    //   var url = s3Bucket.getSignedUrl("getObject", params);
    //   // var array = [];
    //   // array.unshift(url);
    //   // console.log(url);
    //   return url;
    // },
    // async delete_item(val) {
    //   var self = this;
    //   var deatils = self.$store.getters.GetOrgDetails;
    //   this.delLoading = true;
    //   var s3Bucket = new AWS.S3({
    //     region: deatils.s3_details.region,
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });
    //   var bucketName = deatils.s3_details.bucket_name;

    //   var params = {
    //     Bucket: bucketName,
    //     Key: val.fieldOptions[0],
    //   };

    //   await s3Bucket.deleteObject(params, function (err, data) {
    //     if (err) {
    //       // console.log(err);
    //     } else if (data) {
    //       if (self.index.fieldOptions[0] == val.fieldOptions[0]) {
    //         self.index.fieldOptions.splice(0, 1);
    //       }
    //     }
    //   });
    // },

    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == "" ? "N/A" : fieldvalue,
        key: fieldKey,
      };
      this.$emit("dropDownField", data);
    },

    emit_edit_field(value) {
      this.$emit("imageedit", value);
    },
  },
};
</script>
  