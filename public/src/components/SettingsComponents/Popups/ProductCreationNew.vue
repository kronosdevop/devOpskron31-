<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="ItemsAddition" @update:model-value="$emit('update:ItemsAddition', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Items</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="">
              <v-col cols="12">
                <v-radio-group
                  class=""
                  v-model="categoryType"
                  row
                  :rules="[(v) => !!v || 'required ']"
                  @change="clearAll()"
                >
                  <v-radio label="Product" value="PRODUCT"></v-radio>
                  <v-radio label="Services" value="SERVICE"></v-radio>
                </v-radio-group>
                <v-text-field
                  dense
                  v-model="ItemsName"
                  label="Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                  @input="discription = ItemsName"
                ></v-text-field>
                <v-textarea
                  dense
                  v-model="discription"
                  v-if="categoryType == 'PRODUCT'"
                  label="Description"
                  rows="1"
                  class="mr-2"
                  outlined
                ></v-textarea>
                <v-select
                  outlined
                  dense
                  label="Category*"
                  :rules="[(v) => !!v || 'required ']"
                  item-text="category_name"
                  item-value="category_id"
                  :items="masterGlobalCategories"
                  v-model="categorys"
                />
                <v-text-field
                  dense
                  v-model="categoriestax"
                  label="Tax Percentage*"
                  type="number"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                ></v-text-field>
                <v-text-field
                  dense
                  v-model="categoriesPrice"
                  label="Price*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                ></v-text-field>
                <!-- <v-text-field
                  dense
                  v-model="skuName"
                  v-if="categoryType == 'PRODUCT' "
                  label="SKU"
                  class="mr-2"
                  outlined
                ></v-text-field> -->
                <!-- <v-text-field
                  dense
                  v-model="quantity"
                  label="Quantity"
                  type="number"
                  v-if="categoryType == 'PRODUCT' "
                  class="mr-2"
                  outlined
                  @keypress="is_number($event)"
                ></v-text-field> -->
                <v-select
                  outlined
                  dense
                  multiple
                  v-if="categoryType == 'PRODUCT'"
                  label="Units"
                  item-text="material_unit_name"
                  item-value="material_unit_id"
                  :items="unitmaterials"
                  v-model="unitstype"
                  :rules="
                    categoryType == 'PRODUCT'
                      ? [(v) => v.length > 0 || 'required ']
                      : []
                  "
                />
                <v-select
                  outlined
                  dense
                  v-if="categoryType == 'PRODUCT'"
                  label="Suppliers"
                  item-text="supplier_name"
                  item-value="suppliers_id"
                  :items="orgSupplier"
                  v-model="suplierstype"
                />
                <v-checkbox
                  v-model="Reorder_Check"
                  label="Enable Reorder"
                  v-if="categoryType == 'PRODUCT'"
                  class="mt-n4"
                ></v-checkbox>
                <v-text-field
                  outlined
                  dense
                  v-if="Reorder_Check == true"
                  label="Restock Quantity"
                  v-model="reorderQuanity"
                  :rules="
                    Reorder_Check == true ? [(v) => !!v || 'required '] : []
                  "
                  @keypress="is_number($event)"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  v-if="categoryType == 'PRODUCT'"
                  label="Depletion Quantity"
                  v-model="depletionQuanity"
                  :rules="
                    categoryType == 'PRODUCT' ? [(v) => !!v || 'required '] : []
                  "
                  @keypress="is_number($event)"
                ></v-text-field>
                <v-col
                  cols="12"
                  class="mt-n6 ml-n2"
                  v-if="categoryType == 'PRODUCT'"
                >
                  <span><b>Upload Logo:</b></span>
                  <v-card
                    outlined
                    class="attachment-card d-flex align-center justify-center"
                    @click="triggerFileInput"
                  >
                    <v-icon v-if="!imageUrl" size="40">mdi-plus</v-icon>
                    <v-img
                      v-else
                      :src="imageUrl"
                      class="uploaded-image"
                    ></v-img>
                    <v-icon
                      v-if="imageUrl"
                      class="delete-icon"
                      small
                      @click.stop="removeImage"
                      >mdi-delete</v-icon
                    >
                  </v-card>
                  <input
                    type="file"
                    ref="fileInput"
                    accept="image/*"
                    hidden
                    @change="uploadImage"
                  />
                </v-col>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    
    <script>
/* eslint-disable */
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
import { quotation_sub_categories } from "@/graphql/mutations.js";
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";
import { API, graphqlOperation } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

var AWS = require("aws-sdk");
import { Buffer } from "buffer";

export default {
  mixins: [get_global_categories, get_material_unit, get_all_org_suppliers],
  props: {
    ItemsAddition: Boolean,
  },
  data() {
    return {
      ItemsName: "",
      loading: false,
      categoriesPrice: "",
      categorys: "",
      unitstype: [],
      categoriestax: "",
      categoryType: "PRODUCT",
      suplierstype: "",
      skuName: "",
      discription: "",
      quantity: "",
      s3ImageUrl: "",
      selectedFile: null,
      imageUrl: "",
      Reorder_Check: false,
      reorderQuanity: "",
      depletionQuanity: "",
      upload_file: false,
    };
  },
  watch: {
    ItemsAddition: {
      async handler() {
        await this.get_global_categories();
        await this.get_material_unit();
        await this.get_all_org_suppliers();
      },
      immediate: true,
    },
  },
  methods: {
    clearAll() {
      this.skuName = "";
      this.quantity = "";
      this.selectedFile = null;
      this.s3ImageUrl = "";
      this.discription = "";
      this.suplierstype = "";
      this.imageUrl = "";
      this.unitstype = [];
      this.Reorder_Check = false;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    uploadImage(e) {
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
            self.imageUrl = URL.createObjectURL(blob);
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
    // uploadImage(event) {
    //   const file = event.target.files[0];
    //   if (file && file.type.startsWith("image/")) {
    //     this.selectedFile = file;
    //     const reader = new FileReader();
    //     reader.onload = (e) => {
    //       this.imageUrl = e.target.result;
    //     };
    //     reader.readAsDataURL(file);
    //   } else {
    //     // alert("Please upload a valid image file.");
    //   }
    // },
    async uploadToS3() {
      if (!this.selectedFile) {
        return "";
      }

      const orgDetails = this.$store.getters.GetOrgDetails;
      const file = this.selectedFile;
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
          const base64String = event.target.result.split(",")[1];
          const byteCharacters = atob(base64String);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const fileBlob = new Blob([byteArray], { type: file.type });

          const s3 = new AWS.S3({
            region: "us-east-1",
            accessKeyId: orgDetails.s3_details.access_key,
            secretAccessKey: orgDetails.s3_details.secret_key,
          });

          const bucketName = "stichh-medias";
          const key = `products/${
            orgDetails.organization.organization_id
          }/${Date.now()}__${file.name}`;

          const params = {
            Bucket: bucketName,
            Key: key,
            ACL: "public-read",
            Body: fileBlob,
            ContentType: file.type,
          };

          try {
            await s3.upload(params).promise();
            const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
            this.s3ImageUrl = fileUrl;
            resolve(fileUrl);
          } catch (error) {
            console.error("Error uploading to S3:", error);
            reject(error);
          }
        };
        reader.readAsDataURL(file);
      });
    },

    removeImage() {
      this.imageUrl = "";
      this.selectedFile = null;
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },

    async validate_data() {
      if (this.$refs.form.validate()) {
        if (this.selectedFile != null) {
          // alert(4);
          this.upload_new_func();
          // await this.uploadToS3();
          // await this.add_mutation();
        } else {
          // await this.add_mutation();
        }
      }
    },

    async upload_new_func() {
      // console.log(this.selectedFile);
      // console.log(this.selectedFile);
      if (!this.selectedFile) return;
      // alert(3);
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
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },

    async add_mutation(url) {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(quotation_sub_categories, {
            input: {
              sub_category_type: this.categoryType,
              category_id: this.categorys,
              sub_category_name: this.ItemsName,
              sub_category_tax: this.categoriestax,
              sub_category_price: this.categoriesPrice,
              action_type: "CREATE",
              sub_category_Sku: this.skuName == "" ? undefined : this.skuName,
              sub_category_Quantity:
                this.quantity == "" ? undefined : this.quantity,
              sub_category_Image: url == undefined ? "N/A" : url,
              sub_category_Supplier:
                this.suplierstype == "" ? undefined : this.suplierstype,
              sub_category_unit: this.unitstype,
              sub_category_description:
                this.discription == "" ? undefined : this.discription,
              enable_reorder: this.Reorder_Check,
              restock_quantity:
                this.Reorder_Check == true
                  ? Number(this.reorderQuanity)
                  : undefined,
              depletion_quantity:
                this.Reorder_Check == true
                  ? Number(this.depletionQuanity)
                  : undefined,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.quotation_sub_categories);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error)
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
    
    <style scoped>
.attachment-card {
  width: 100px;
  height: 100px;
  cursor: pointer;
  position: relative;
}
.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.delete-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  cursor: pointer;
  color: red;
}
</style>