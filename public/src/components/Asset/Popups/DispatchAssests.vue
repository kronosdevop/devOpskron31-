<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="dispatchWorkflow"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Dispatch Asset</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-select
                  density="compact"
                  variant="outlined"
                  :items="locationTypse"
                  v-model="warehouseLocation"
                  :rules="[(v) => !!v || 'required ']"
                  label="Select Location"
                  item-title="asset_location_name"
                  item-value="asset_location_id"
                  @update:modelValue="fetch_selected_warehouse_assets()"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  density="compact"
                  variant="outlined"
                  :items="assetListItems"
                  v-model="selectedAsset"
                  :rules="[(v) => !!v || 'required ']"
                  label="Select Asset"
                  item-title="asset_prefix"
                  item-value="asset_id"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  density="compact"
                  variant="outlined"
                  v-model="additionalDetails"
                  label="Additional Info"
                />
              </v-col>

              <v-col cols="12">
                <v-file-input
                  small-chips
                  density="compact"
                  variant="outlined"
                  label="Document*"
                  accept="image/*,application/pdf"
                  class=""
                  :rules="[(v) => !!v || 'required ']"
                  v-model="documentFiles"
                  @change="get_files(documentFiles)"
                ></v-file-input>
              </v-col>
              <!-- <v-col cols="12">
                <iframe
                  ref="myIframe"
                  v-if="baseImage"
                  :srcdoc="baseImage"
                  width="100%"
                  frameborder="0"
                  class="ml-2 mr-3"
                  scrolling="no"
                  height="100"
                ></iframe>
              </v-col> -->
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Dispatch</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_organization_untagged_assets } from "@/mixins/AllAssetList.js";
import { get_asset_sub_location } from "@/mixins/GetAssetLocations.js";
import { initiate_dispatch_request } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { Buffer } from "buffer";
var AWS = require("aws-sdk");
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

export default {
  mixins: [get_organization_untagged_assets, get_asset_sub_location],
  props: {
    dispatchWorkflow: Boolean,
    rowData: Object,
  },
  data() {
    return {
      assetListItems: [],
      selectedAsset: "",
      additionalDetails: "",
      documentFiles: null,
      uploadedFiles: [],
      loading: false,
      urls: [],
      baseImage: "",
      isImage: false,
      isPdf: false,
      warehouseLocation: "",
      locationTypse: [],
    };
  },
  watch: {
    dispatchWorkflow: {
      async handler() {
        if (this.dispatchWorkflow == true) {
          await this.get_organization_untagged_assets();
          await this.get_asset_sub_location();
          this.locationTypse = this.assetMasterLocations.filter(
            (element) => element.asset_location_type === "WAREHOUSE"
          );
          

          // this.assetListItems = this.allUntaggedAssets;
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.urls = [];
      this.$refs.form.reset();
    },

    fetch_selected_warehouse_assets() {
      const validTypes = [this.warehouseLocation];
      this.assetListItems = this.allUntaggedAssets.filter(
        (element) =>
         
          element.asset_shipment_status === "INSTOCK"
      );
      // console.log(this.allUntaggedAssets);
      // console.log(this.assetListItems);
      //  this.assetListItems = this.allUntaggedAssets.filter(
      //       (element) => element.asset_location_type === "WAREHOUSE"
      //     );
    },

    get_files(files) {
      this.uploadedFiles = files;
    },

    async convert_to_base(files) {
      var imageUrl = [];
      var newUrl = [];
      var NewbaseData = [];
      var file = files;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

        this.baseImage = imageUrl;
      });
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;

        this.add_documents_upload();
      }
    },

    add_documents_upload() {
      this.fileloding = true;
      let self = this;
      self.upload_new_func(this.uploadedFiles);
    },

    // async upload_S3(files) {
    //   var imageUrl = [];
    //   var newUrl = [];
    //   var baseData = [];
    //   var file = files;
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

    // async upload_S3_bucket(baseData, file) {
    //   var self = this;
    //   var deatils = self.$store.getters.GetOrgDetails;
    //   // var data = this.$store.getters.GetUserObj;
    //   var buf = Buffer.from(baseData, "base64");

    //   var s3Bucket = new AWS.S3({
    //     region: deatils.s3_details.region,
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });
    //   var bucketName = deatils.s3_details.bucket_name;

    //   var params = {
    //     Bucket: bucketName,

    //     // workflow/organization_id/uniqui_id/user_id/timestmap__filename
    //     Key:
    //       "workflow" +
    //       "/" +
    //       deatils.organization.organization_id +
    //       "/" +
    //       "DISPATCH_WORKFLOW" +
    //       "/" +
    //       Date.now() +
    //       "__" +
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
    //       self.loading1 = false;
    //     } else if (data) {
    //       bucketurl;
    //       self.urls.push(bucketurl);
    //     }
    //     self.displatch_workflow(bucketurl);
    //   });
    // },

    async upload_new_func() {
      if (!this.documentFiles) return;
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user.user_id;

      const key = [
        "workflow" +
          "/" +
          orgDetails.organization.organization_id +
          "/" +
          "DISPATCH_WORKFLOW" +
          "/" +
          Date.now() +
          "__" +
          this.documentFiles.name.split(" ").join(""),
      ];
      try {
        const fileUrl = await uploadToS3(
          this.documentFiles,
          orgDetails.s3_details,
          key
        );
        if (fileUrl) {
          // console.log(fileUrl)
          await this.displatch_workflow(fileUrl);
          // this.documentFiles = null;
        }
      } catch (err) {
        this.$emit("errorMsg", "Upload failed. Check console");
        // this.uploadStatus = "❌ Upload failed. Check console.";
        // this.uploadStatusType = "error";
        this.loading = false;
      }
    },

    async displatch_workflow(url) {
      try {
        let result = await API.graphql(
          graphqlOperation(initiate_dispatch_request, {
            input: {
              initiate_id: this.rowData.responeObj.initiate_id,
              asset_id: this.selectedAsset,
              description: this.additionalDetails,
              media_keys: url,
            },
          })
        );
        var response = JSON.parse(result.data.initiate_dispatch_request);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

          this.uploadedFiles = [];
          this.$refs.form.reset();
        } else {
          this.uploadedFiles = [];
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>