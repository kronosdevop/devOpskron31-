<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="createProductDialog" @update:model-value="$emit('update:createProductDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Add Product/Services</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="productName"
                  label=" Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  outlined
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  dense
                  v-model="productDescription"
                  label="Description*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  outlined
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="productUrl"
                  label="URL"
                  class=""
                  outlined
                ></v-text-field>
              </v-col>
              <v-col class="mt-3" cols="12">
                Product Logo
                <v-card
                  width="120px"
                  height="100px"
                  @click="checkImagePresent()"
                >
                  <v-fab-transition v-if="imgSrc != ''">
                    <v-btn
                      absolute
                      icon
                      top
                      right
                      dark
                      x-small
                      fab
                      color="red"
                      class="mt-3 mr-n5"
                      @click.stop="imgSrc = ''"
                    >
                      <v-icon>mdi-close-circle</v-icon>
                    </v-btn>
                  </v-fab-transition>
                  <v-img
                    contain
                    v-if="imgSrc && imgSrc != ''"
                    :src="imgSrc"
                    :lazy-src="imgSrc"
                    max-width="120px"
                    class="mt-2"
                    max-height="100px"
                  ></v-img>
                  <div class="mt-2" v-else>
                    <input
                      ref="image-upload-input"
                      accept="image/*"
                      capture="user"
                      class="image-upload-input mt-1"
                      type="file"
                      @change="handleClick"
                    />
                    <v-icon class="mt-8">mdi-upload</v-icon>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_data()"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { create_list_edit_delete_products } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

export default {
  props: {
    createProductDialog: Boolean,
  },
  mixins: [get_all_org_users],

  data() {
    return {
      loading: false,
      productName: "",
      searchF: "",
      territoryCity: "",
      terriotoryManager: "",
      userArray: [],
      productDescription: "",
      imgSrc: "",
      selectedFile: null,
      upload_file: false,
      productUrl: "",
    };
  },
  watch: {
    createProductDialog: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    checkImagePresent() {
      if (this.imgSrc || this.imgSrc == "") {
        this.$refs["image-upload-input"].click();
      }
    },
    // handleClick(e) {
    //   var self = this;
    //   var fileReader = new FileReader();
    //   const MAX_WIDTH = 400;
    //   const MAX_HEIGHT = 400;
    //   const MIME_TYPE = "image/jpeg";
    //   const QUALITY = 0.1;

    //   fileReader.readAsDataURL(e.target.files[0]);
    //   fileReader.onload = async function (val) {
    //     self.imgSrc = val.target.result;
    //     var img = new Image();
    //     img.src = val.target.result;
    //     img.onload = function (value) {
    //       const [newWidth, newHeight] = self.calculateSize(
    //         img,
    //         MAX_WIDTH,
    //         MAX_HEIGHT
    //       );
    //       const canvas = document.createElement("canvas");
    //       const ctx = canvas.getContext("2d");
    //       canvas.width = newWidth;
    //       canvas.height = newHeight;
    //       ctx.drawImage(img, 0, 0, newWidth, newHeight);
    //       self.selectedFile = e.target.files[0];

    //       self.upload_file = true;
    //     };
    //   };
    // },

    handleClick(e) {
      const self = this;
      const file = e.target.files[0];
      if (!file) return;

      self.selectedFile = file;

      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      const MIME_TYPE = "image/jpeg";
      const QUALITY = 0.1;

      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = function () {
        const [newWidth, newHeight] = self.calculateSize(
          img,
          MAX_WIDTH,
          MAX_HEIGHT
        );

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            self.compressedFile = blob;
            self.imgSrc = URL.createObjectURL(blob);
            self.upload_file = true;
          },
          MIME_TYPE,
          QUALITY
        );
      };
    },
    calculateSize(img, maxWidth, maxHeight) {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      return [width, height];
    },
    async validate_data() {
      if (this.upload_file == true) {
        this.loading = true;
        this.upload_new_func();
        // add_mutation
        // this.get_file();
      } else {
        this.loading = true;
        this.add_mutation();
      }
    },
    async upload_new_func() {
      // console.log(this.selectedFile);
      if (!this.selectedFile) return;
      this.loading = true;
      const orgDetails = this.$store.getters.GetOrgDetails;
      let s3_details = {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      };

      const Key = [
        "products",
        orgDetails.organization.organization_id,
        Math.floor(new Date().getTime()),
        this.replaceSpecialCharacters(this.selectedFile.name),
      ].join("/");

      try {
        const fileUrl = await uploadToS3(this.selectedFile, s3_details, Key);
        if (fileUrl) {
          this.add_mutation(fileUrl);
          // this.actualURLs.push(fileUrl);
        }
      } catch (err) {
        this.loading = false;
      }
    },
    async get_file() {
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = this.selectedFile;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;

        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");

        baseData.push(newUrl);
        // this.imgSrc = newUrl;

        this.upload_S3(baseData[0], file);
      });
    },

    // async upload_S3(baseData, file) {
    //   const self = this;
    //   const deatils = this.$store.getters.GetOrgDetails;

    //   const buf = Buffer.from(baseData, "base64");

    //   const s3Bucket = new AWS.S3({
    //     region: "us-east-1",
    //     accessKeyId: deatils.s3_details.access_key,
    //     secretAccessKey: deatils.s3_details.secret_key,
    //   });

    //   const bucketName = "stichh-medias";

    //   const params = {
    //     Bucket: bucketName,
    //     Key: `products/${
    //       deatils.organization.organization_id
    //     }/${Date.now()}/${self.replaceSpecialCharacters("image.png")}`, // Adjust the file name if needed
    //     ACL: "public-read",
    //     Body: buf,
    //     ContentType: file.type,
    //   };

    //   const bucketUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${params.Key}`;

    //   await new Promise((resolve, reject) => {
    //     s3Bucket.putObject(params, function (err, data) {
    //       if (err) {
    //         // console.log(err);
    //         reject(err);
    //       } else {
    //         // self.urls.push(bucketUrl);
    //         self.add_mutation(bucketUrl);
    //       }
    //     });
    //   });

    //   this.uploadload = false;
    // },

    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },

    async add_mutation(bucketUrl) {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_products, {
            input: {
              action_type: "CREATE_PRODUCT",
              product_name: this.productName,
              product_description: this.productDescription,
              product_link: this.productUrl,
              product_logo_url: bucketUrl == undefined ? undefined : bucketUrl,
              user_email_id: data.user.user_email_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_edit_delete_products);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.loading = false;
          this.$refs.form.reset();
          this.imgSrc = "";
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>