<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="riseTicket" @update:model-value="$emit('update:riseTicket', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Initiate Ticket</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-3">
          <v-form ref="form">
            <v-row>
              <v-col cols="6">
                <v-select
                  outlined
                  dense
                  label="Select Product/Service"
                  v-model="selectproduct"
                  :rules="[(v) => !!v || 'Required']"
                  :items="itemsproduct"
                  item-text="categorie_name"
                  item-value="categorie_id"
                  @change="get_categories()"
                />
                <v-select
                  outlined
                  dense
                  label="Select Category"
                  v-model="selectservice"
                  :rules="[(v) => !!v || 'Required']"
                  :items="itemsService"
                  item-text="categorie_name"
                  item-value="categorie_id"
                />
                <!-- <v-checkbox
                  v-model="immedate"
                  class="mt-n4"
                  label=" Is it Immedate ?"
                ></v-checkbox> -->
                <v-textarea
                  outlined
                  dense
                  label="Description"
                  v-model="description"
                  :counter="300"
                  maxlength="300"
                  color="primaryColor"
                  :rules="[(v) => !!v || 'Required']"
                />
                <v-file-input
                  small-chips
                  outlined
                  dense
                  label="Upload Documents"
                  accept="image/*,application/pdf"
                  v-model="contentdocumentFiles"
                  @change="upload_S3(contentdocumentFiles)"
                ></v-file-input>
              </v-col>
              <v-col cols="6">
                <v-card
                  flat
                  :height="height"
                  class="overflow-auto overflow-x-hidden"
                >
                  <v-row>
                    <v-col
                      cols="4"
                      v-for="(
                        signimagesarrayurls, index
                      ) in signimagesarrayurls"
                      :key="index"
                    >
                      <v-card class="mt-5">
                        <v-img
                          max-height="80"
                          contain
                          :src="signimagesarrayurls"
                          v-if="signimagesarrayurls.length > 1"
                        >
                        </v-img>
                        <div
                          class="d-flex align-centers justify-centers h-100"
                          v-if="signimagesarrayurls.length == 0"
                        >
                          No Image
                        </div>
                        <v-btn
                          icon
                          @click="delete_item(signimagesarrayurls, index)"
                        >
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading1"
            class="text-capitalize cardCss button-corner"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ticket_rasie_from_internal } from "@/graphql/mutations.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { list_products } from "@/graphql/queries.js";
import { list_categories_products } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
export default {
  props: {
    riseTicket: Boolean,
  },
  mixins: [get_Org_details],
  data() {
    return {
      itemsproduct: [],
      height: 0,
      formattedData: [],
      contentdocumentFiles: [],
      tableData: [],
      selectservice: "",
      itemsService: [],
      selectproduct: "",
      immedate: false,
      description: "",
      timesloate: "",
      loading1: false,
      servicedata: [],
      signimagesarrayurls: [],
      urlsimage: [],
      urls: "",
      arrayurls: [],
      regularS3URLsnew: [],
    };
  },
  watch: {
    riseTicket: {
      async handler() {
        this.signimagesarrayurls = [];
        this.regularS3URLsnew = [];
        this.height = window.innerHeight - 350;
        await this.get_product();
        await this.get_Org_details();
      },
      immediate: true,
    },
  },
  methods: {
    validate_data() {
      if (this.$refs.form.validate()) {
        this.initiate_ticketraise();
      }
    },
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },
    async get_product() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_products, {
            organization_id: data.organization.organization_id,
            limit: 100,
            nextToken: null,
          })
        );

        var response = JSON.parse(result.data.list_products);

        this.tableData = response.items;
        this.tableData.forEach((element) => {
          this.itemsproduct.push({
            categorie_name: element.product_name,
            categorie_id: element.product_id,
          });
        });
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
    async get_categories() {
      try {
        let result = await API.graphql(
          graphqlOperation(list_categories_products, {
            input: {
              product_id: this.selectproduct,
            },
          })
        );

        this.servicedata = [];
        this.itemsService = [];

        var response = JSON.parse(result.data.list_categories_products);
        this.servicedata = response.data;
        this.servicedata.forEach((element) => {
          this.itemsService.push({
            categorie_name: element.categorie_name,
            categorie_id: element.categorie_id,
          });
        });
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
    async upload_S3(files) {
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = files;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

        baseData.push(newUrl);

        this.upload_S3_bucket(baseData[0], file);
      });
    },

    async upload_S3_bucket(baseData, file) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;

      var buf = Buffer.from(baseData, "base64");

      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;

      var params = {
        Bucket: bucketName,
        Key:
          "tickets" +
          "/" +
          "internals" +
          "/" +
          deatils.organization.organization_id +
          "/" +
          self.$store.getters.GetUserObj.user.user_id +
          "/" +
          Date.now() +
          "/" +
          file.name.split(" ").join(""),

        Body: buf,
        ContentType: file.type,
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
          bucketurl;
          var deatil = self.$store.getters.GetOrgDetails;
          self.urls = bucketurl;
          self.s3get(deatil);
        }

        self.contentdocumentFiles = [];
      });
    },

    convertToRegularS3URL(presignedURL) {
      // Use URL class to parse the pre-signed URL
      const url = new URL(presignedURL);

      // Get the base URL without query parameters
      const regularS3URL = url.origin + url.pathname;

      return regularS3URL;
    },

    convertArrayToRegularS3URLs(presignedURLs) {
      this.arrayurls = [];

      for (const presignedURL of presignedURLs) {
        const regularS3URL = this.convertToRegularS3URL(presignedURL);
        this.arrayurls.push(regularS3URL);
      }

      return this.arrayurls;
    },

    // Example usage:
    // const presignedURLs = [
    //   'https://example.s3.amazonaws.com/key1?query=param1',
    //   'https://example.s3.amazonaws.com/key2?query=param2',
    // ];

    //
    async delete_item(val, index) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;
      this.delLoading = true;
      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;

      var params = {
        Bucket: bucketName,
        Key: val,
      };

      await s3Bucket.deleteObject(params, function (err, data) {
        if (err) {
          console.log(err);
        } else if (data) {
          self.signimagesarrayurls.forEach((element) => {
            if (element == val) {
              self.signimagesarrayurls.splice(index, 1);
            }
          });
        }
      });
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
        Key: "tickets/" + this.urls.split("tickets/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      this.signimagesarrayurls.push(url);
      //   return url;
    },

    async initiate_ticketraise() {
      if (this.signimagesarrayurls.length != 0) {
        this.regularS3URLsnew = this.convertArrayToRegularS3URLs(
          this.signimagesarrayurls
        );
      }

      this.loading1 = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(ticket_rasie_from_internal, {
            input: {
              // team_name: this.broadcastName,
              user_id: data.user.user_id,
              product_id: this.selectproduct,
              categorie_id: this.selectservice,
              ticket_description: this.description,
              is_urgent: this.immedate,
              media_keys:
                this.regularS3URLsnew.length == 0
                  ? undefined
                  : this.regularS3URLsnew,
            },
          })
        );
        var response = JSON.parse(result.data.ticket_rasie_from_internal);
        this.loading1 = false;
        if (response.Status == "SUCCESS") {
          this.signimagesarrayurls = [];
          this.regularS3URLsnew = [];
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading1 = false;
      }
    },
  },
};
</script>

<style>
</style>