<template>
  <div>
    <v-card flat :height="height" class="ml-5" >
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-card-text class="mt-n3">
        <v-row>
          <v-col cols="6">
            <v-card>
              <v-card-text>
                <v-row class="justify-start" no-gutters>
                  <v-col cols="12">
                    <div
                      class="text-left font-weight-bold mt-2"
                      style="font-size: 15px"
                    >
                      Product Details
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Name</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + product_name }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">Description</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + product_description }}</b>
                    </div>
                  </v-col>

                  <v-col cols="4">
                    <div class="text-left mt-2">Domain Url</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b>
                        {{
                          ":" + " " + (domainUrl == undefined ? "N/A" : domainUrl)
                        }}</b
                      >
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">#Services</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + productServices }}</b>
                    </div>
                  </v-col>

                  <v-col cols="4">
                    <div class="text-left mt-2">#Admins</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + productAdmins }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">#Tickets</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b> {{ ":" + " " + product_ticket_raise }}</b>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-left mt-2">#OTP Required</div>
                  </v-col>
                  <v-col cols="8">
                    <div class="text-left ml-n6 mt-2">
                      <b :style="{ color: otpRequired ? 'green' : 'red' }">
                        {{ ":" + " " + otpRequired }}</b
                      >
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="justify-end mr-5">
                <v-btn
                  depressed
                  @click="edit_mutation()"
                  dark
                  class="cardCss button-corner text-capitalize"
                >
                  edit
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-btn
              small
              class="text-capitalize cardCss white--text"
              @click="handleUpload"
              :loading="loading1"
            >
              <input
                ref="uploader"
                class="d-none"
                type="file"
                accept="image/*"
                @change="handleClick"
              />
              Upload Logo
            </v-btn>
            <v-card class="mt-5" max-width="200" v-if="logurls != ''">
              <v-img max-height="200" max-width="200" contain :src="logurls">
              </v-img>
            </v-card>
            <v-card v-else max-width="200" height="100" class="mt-5">
              <div class="d-flex align-centers justify-centers h-100">
                No Image
              </div>
            </v-card>
            <v-btn
              small
              class="text-capitalize cardCss white--text mt-5"
              @click="handleUpload_image"
              :loading="loading2"
            >
              <input
                ref="uploaderimage"
                class="d-none"
                type="file"
                accept="image/*"
                @change="handleClick_image"
              />
              Upload Images
            </v-btn>
            <v-row>
              <v-col
                cols="3"
                v-for="(signimagesarrayurls, index) in signimagesarrayurls"
                :key="index"
              >
                <v-card class="mt-5" max-width="200">
                  <v-img
                    max-height="200"
                    max-width="200"
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
                  <v-btn icon @click="delete_item(signimagesarrayurls, index)">
                    <v-icon color="red">mdi-delete</v-icon>
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
            <!-- <v-col v-for="(url, index) in logurls" :key="index">
        <v-img max-height="200" max-width="200" contain :src="url"></v-img>
      </v-col> -->
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div v-if="componentcheck == 1">
      <EditProduct
        :producteditdetails="producteditdetails"
        @clicked="producteditdetails = false"
        :editdetails="editdetails"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { get_product_details } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import EditProduct from "@/components/TicketManagement/AllDialogs/EditProduct.vue";
import SnackBar from "@/components/SnackBar.vue";
import { edit_product } from "@/graphql/mutations.js";
import { Buffer } from "buffer";
import AWS from "aws-sdk";
export default {
  components: {
    EditProduct,
    SnackBar,
  },
  data() {
    return {
      product_name: "",
      producteditdetails: false,
      product_description: "",
      userselect: "",
      userArray: [],
      componentcheck: 0,
      loading1: false,
      loading2: false,
      contactnumber: "",
      SnackBarComponent: {},
      domainUrl: "",
      searchF: "",
      editdetails: {},
      height: 0,
      loading: false,
      adminemail: "",
      product_status: "",
      producttype: "",
      product_ticket_raise: "",
      productAdmins: "",
      productServices: "",
      urls: "",
      logurls: "",
      imagesurls: undefined,
      imagesarrayurls: [],
      signimagesarrayurls: [],
      count: 0,
      otpRequired: null,
    };
  },

  created() {
    this.height = window.innerHeight - 310;
    this.get_product();
  },
  methods: {
    handleUpload() {
      this.$refs.uploader.click();
    },
    handleUpload_image() {
      this.$refs.uploaderimage.click();
    },
    convertToRegularS3URL(presignedURL) {
      // Use URL class to parse the pre-signed URL
      const url = new URL(presignedURL);

      // Get the base URL without query parameters
      const regularS3URL = url.origin + url.pathname;

      return regularS3URL;
    },

    async delete_item(val, index) {
      const regularS3URL = this.convertToRegularS3URL(val);

      var deatils = this.$store.getters.GetOrgDetails;
      var self = this;

      this.delLoading = true;
      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;
      // console.log(val);
      var params = {
        Bucket: bucketName,
        Key: regularS3URL,
      };

      await s3Bucket.deleteObject(params, function (err, data) {
        if (err) {
        } else if (data) {
          self.imagesarrayurls.forEach((element) => {
            if (element == regularS3URL) {
              self.imagesarrayurls.splice(index, 1);

              self.edit_product_image();
            }
          });
        }
      });

      // console.log(self.imagesarrayurls, "after");
      // await this.s3get2(deatils);
    },
    handleClick_image(e) {
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = e.target.files[0];
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

        baseData.push(newUrl);

        this.upload_S3_image(baseData[0], file);
      });
    },
    async upload_S3_image(baseData, file) {
      this.count = 0;
      this.loading2 = true;
      var deatils = this.$store.getters.GetOrgDetails;
      var self = this;

      var buf = Buffer.from(baseData, "base64");

      // var data = this.$store.getters.GetUserObj;
      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;

      var params = {
        Bucket: bucketName,
        Key:
          "product" +
          "/" +
          deatils.organization.organization_id +
          "/" +
          self.$store.getters.Getproductitems.product_id +
          "/" +
          Date.now() +
          "__" +
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
          self.loading2 = false;
        } else if (data) {
          bucketurl;
          self.imagesurls = bucketurl;
        }
        self.count = 1;
        self.edit_product_image();

        self.loading2 = false;
      });
    },
    async edit_product_image() {
      if (this.count == 1) {
        this.imagesarrayurls.push(this.imagesurls);
      }

      try {
        let result = await API.graphql(
          graphqlOperation(edit_product, {
            input: {
              product_id: this.$store.getters.Getproductitems.product_id,
              product_medias: this.imagesarrayurls,
            },
          })
        );
        var response = JSON.parse(result.data.edit_product);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "Media Updated Successfully",
            timeout: 5000,
            Top: true,
          };
          this.imagesarrayurls = [];
          this.imagesurls = undefined;
          this.count = 0;
          this.get_product();
        } else {
          this.imagesurls = undefined;
          this.count = 0;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
        this.count = 0;
        this.loading = false;
      }
    },
    handleClick(e) {
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = e.target.files[0];
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
      this.loading1 = true;
      var deatils = this.$store.getters.GetOrgDetails;
      var self = this;

      var buf = Buffer.from(baseData, "base64");

      // var data = this.$store.getters.GetUserObj;
      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;

      var params = {
        Bucket: bucketName,
        Key:
          "product" +
          "/" +
          deatils.organization.organization_id +
          "/" +
          self.$store.getters.Getproductitems.product_id +
          "/" +
          Date.now() +
          "__" +
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
          self.loading1 = false;
        } else if (data) {
          bucketurl;
          self.urls = bucketurl;
        }
        self.edit_product_log();

        self.loading1 = false;
      });
    },
    async edit_product_log() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_product, {
            input: {
              product_id: this.$store.getters.Getproductitems.product_id,
              product_logo: this.urls,
            },
          })
        );
        var response = JSON.parse(result.data.edit_product);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "Log updated Successfully",
            timeout: 5000,
            Top: true,
          };

          this.urls = "";
          this.get_product();
        } else {
          this.urls = "";

          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };

        this.loading = false;
      }
    },

    async get_product() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_product_details, {
            input: {
              product_id: this.$store.getters.Getproductitems.product_id,
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.get_product_details);
        // console.log(response);
        this.product_name = response.product_name;
        this.product_description = response.product_description;
        this.product_ticket_raise = response.product_ticket_raise;
        this.productServices = response.no_of_service;
        this.productAdmins = response.no_of_admins;
        this.domainUrl = response.product_domain_url;
        this.logurls =
          response.product_logo == undefined ? "" : response.product_logo;
        this.otpRequired = response.is_otp_verification_required;
        var deatils = this.$store.getters.GetOrgDetails;
        if (this.logurls != "") {
          this.logurls = this.s3get(deatils);
        }

        this.imagesarrayurls = [];
        this.signimagesarrayurls = [];

        this.imagesarrayurls =
          response.product_medias == undefined ? [] : response.product_medias;

        if (this.imagesarrayurls.length != 0) {
          await this.s3get2(deatils);
        }

        // console.log(this.imagesarrayurls);
        // var admin = JSON.parse(
        //   result.data.get_product_details.items[0].admin_details
        // );
        this.editdetails = response;
        // this.product_name = response.product_name;
        // this.product_description = response.product_description;
        // this.producttype = response.product_type;
        // this.userselect = response.full_user_name;
        // this.product_status = response.product_status;
        // this.adminemail = response.user_email_id;
        // this.product_ticket_raise = response.product_ticket_raise;
        // this.domainUrl =
        //   response.product_domain_url == null
        //     ? ""
        //     : response.product_domain_url;
        // this.contactnumber = admin.user_full_contact_number;
        // this.noOfCampagins =
        //   response.no_of_campaigns == null ? 0 : response.no_of_campaigns;
        // this.noOfUpcomingCampaigns =
        //   response.no_upcoming_campaigns == null
        //     ? 0
        //     : response.no_upcoming_campaigns;
        // this.noOfLiveCampaigns =
        //   response.no_live_campaigns == null ? 0 : response.no_live_campaigns;
        // this.noOfCompletedCampaigns =
        //   response.no_completed_campaigns == null
        //     ? 0
        //     : response.no_completed_campaigns;
      } catch (error) {
        // console.log(error);
        this.tableLoading = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    s3get2(response) {
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      for (let i = 0; i < this.imagesarrayurls.length; i++) {
        var params = {
          Bucket: response.s3_details.bucket_name,
          Key: "product/" + this.imagesarrayurls[i].split("product/")[1],
          Expires: 60000 * 5,
        };
        var url = s3Bucket.getSignedUrl("getObject", params);
        this.signimagesarrayurls.push(url);
      }
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
        Key: "product/" + this.logurls.split("product/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      // console.log(url);
      return url;
    },
    edit_mutation() {
      this.editdetails;
      this.componentcheck = 1;
      this.producteditdetails = true;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.producteditdetails = false;
      this.get_product();
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>
<style>
.align-centers {
  align-items: center;
}

.justify-centers {
  justify-content: center;
}

.h-100 {
  height: 100%;
}
</style>