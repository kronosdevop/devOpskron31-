<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="editEntityDialog"
      @update:model-value="$emit('update:editEntityDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Entity</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-text-field
              variant="outlined"
              density="compact"
              label="Entity Name*"
              v-model="entity_name"
              :rules="[rules.required]"
            ></v-text-field>
            <v-row>
              <v-col cols="6">
                <v-autocomplete
                  label="Country Code*"
                  v-model="userCCcode"
                  :items="countryCodes"
                  :search-input.sync="search"
                  @input="search = ''"
                  item-value="value"
                  item-text="title"
                  density="compact"
                  :rules="[rules.required]"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                ></v-autocomplete>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  variant="outlined"
                  density="compact"
                  label="Contact Number*"
                  v-model="contact_number"
                  :maxlength="14"
                  :rules="[rules.required, rules.phone]"
                  @keypress="is_number($event, contact_number)"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-textarea
              density="compact"
              variant="outlined"
              label="Entity Address*"
              v-model="entity_address"
              rows="1"
              auto-grow
              :rules="[rules.required]"
            ></v-textarea>
            <v-text-field
              variant="outlined"
              density="compact"
              label="Tax ID*"
              v-model="tax_id"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              variant="outlined"
              density="compact"
              label="Entity Owner Name*"
              v-model="owner_name"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              variant="outlined"
              density="compact"
              label="Entity UPI Id*"
              v-model="upi_id"
              :rules="[rules.required]"
            ></v-text-field>
            <v-checkbox
              v-model="emailCheck"
              label="Email-ID"
              density="compact"
            ></v-checkbox>

            <v-text-field
              v-if="!emailCheck"
              variant="outlined"
              density="compact"
              label="Enter Email*"
              v-model="entity_email"
              :rules="[rules.required, rules.email]"
            ></v-text-field>
            <div class="file-upload">
              <template v-if="entity_logo">
                <span class="logo-header mr-6">Entity Logo :-</span>
                <v-row>
                  <v-col cols="4">
                    <v-img :src="entity_logo" class="preview"></v-img>
                  </v-col>
                  <v-col cols="2">
                    <v-icon class="delete-icon" small @click="clearFile('logo')"
                      >mdi-delete</v-icon
                    >
                  </v-col>
                </v-row>
              </template>
              <v-file-input
                v-else
                label="Entity Logo"
                variant="outlined"
                density="compact"
                accept="image/png, image/jpeg"
                v-model="entity_logo_file"
                @change="handleFileUpload($event, 'logo')"
                clearable
                @click:clear="clearFile('logo')"
                :rules="[rules.required]"
              ></v-file-input>
            </div>

            <div class="file-upload">
              <template v-if="entity_signature">
                <span class="logo-header mr-6">Entity Sign :-</span>
                <v-row>
                  <v-col cols="4">
                    <v-img :src="entity_signature" class="preview"></v-img>
                  </v-col>
                  <v-col cols="2">
                    <v-icon
                      class="delete-icon"
                      small
                      @click="clearFile('signature')"
                      >mdi-delete</v-icon
                    >
                  </v-col>
                </v-row>
              </template>
              <v-file-input
                v-else
                label="Entity Signature"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                accept="image/png, image/jpeg"
                v-model="entity_signature_file"
                @change="handleFileUpload($event, 'signature')"
                clearable
                @click:clear="clearFile('signature')"
              ></v-file-input>
            </div>

            <div class="file-upload">
              <template v-if="entity_seal">
                <span class="logo-header mr-4">Entity Seal:-</span>
                <br />
                <v-row>
                  <v-col cols="4">
                    <v-img :src="entity_seal" class="preview"></v-img>
                  </v-col>
                  <v-col cols="2">
                    <v-icon class="delete-icon" small @click="clearFile('seal')"
                      >mdi-delete</v-icon
                    >
                  </v-col>
                </v-row>
              </template>
              <v-file-input
                v-else
                label="Entity Seal"
                variant="outlined"
                density="compact"
                accept="image/png, image/jpeg"
                :rules="[rules.required]"
                v-model="entity_seal_file"
                @change="handleFileUpload($event, 'seal')"
                clearable
                @click:clear="clearFile('seal')"
              ></v-file-input>
            </div>

            <div class="file-upload">
              <template v-if="entity_qrcode">
                <span class="logo-header mr-4">Entity QRCode:-</span>
                <br />
                <v-row>
                  <v-col cols="4" class="ml-n4">
                    <v-img :src="entity_qrcode" class="preview"></v-img>
                  </v-col>
                  <v-col cols="2">
                    <v-icon
                      class="delete-icon"
                      small
                      @click="clearFile('qrcode')"
                      >mdi-delete</v-icon
                    >
                  </v-col>
                </v-row>
              </template>
              <v-file-input
                v-else
                label="Entity QRCode"
                variant="outlined"
                density="compact"
                accept="image/png, image/jpeg"
                :rules="[rules.required]"
                v-model="entity_qrcode_file"
                @change="handleFileUpload($event, 'qrcode')"
                clearable
                @click:clear="clearFile('qrcode')"
              ></v-file-input>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validateAndUpload()"
            dark
            :loading="loading"
            class="text-capitalize cardCss button-corner"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { quotation_billing_entities } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import CountryList from "@/JsonFiles/CountryList.json";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
export default {
  props: {
    editEntityDialog: Boolean,
    ViewEntityInfo: Object,
  },
  components: {
    CountryList,
  },
  data() {
    return {
      entity_name: "",
      contact_number: "",
      entity_address: "",
      tax_id: "",
      entity_logo: null,
      entity_logo_file: null,
      entity_signature: null,
      entity_signature_file: null,
      entity_seal: null,
      entity_seal_file: null,
      entity_qrcode_file: null,
      entity_qrcode: null,
      loading: false,
      bucketUrls: {},
      rules: {
        required: (val) => !!val || "This field is required",
        phone: (val) =>
          (val ? val.length >= 8 : false) ||
          "Phone number must be at least 8 digits",
        email: (val) =>
          (val ? /\S+@\S+\.\S+/.test(val) : false) || "Enter a valid email",
      },
      emailCheck: true,
      entity_email: "",
      countryCodes: [],
      userCCcode: "",
      search: "",
      owner_name: "",
      upi_id: "",
    };
  },
  created() {
    this.countries();
  },

  watch: {
    editEntityDialog: {
      async handler() {
        if (this.editEntityDialog == true) {
          this.entity_name = this.ViewEntityInfo.entity_name || "";
          this.entity_address = this.ViewEntityInfo.entity_address || "";
          this.tax_id = this.ViewEntityInfo.entity_gst || "";
          this.entity_logo = this.ViewEntityInfo.entity_logo || null;
          this.entity_signature = this.ViewEntityInfo.entity_signature || null;
          this.entity_seal = this.ViewEntityInfo.entity_seal || null;
          this.entity_qrcode = this.ViewEntityInfo.entity_qr_code || null;
          this.entity_logo_file = this.ViewEntityInfo.entity_logo
            ? this.getFilename(this.ViewEntityInfo.entity_logo)
            : null;
          this.entity_signature_file = this.ViewEntityInfo.entity_signature
            ? this.getFilename(this.ViewEntityInfo.entity_signature)
            : null;
          this.entity_seal_file = this.ViewEntityInfo.entity_seal
            ? this.getFilename(this.ViewEntityInfo.entity_seal)
            : null;
          this.emailCheck = this.ViewEntityInfo.default_email;
          this.entity_qrcode_file = this.ViewEntityInfo.entity_qr_code
            ? this.getFilename(this.ViewEntityInfo.entity_qr_code)
            : null;
          this.entity_email = this.ViewEntityInfo.entity_owner_email;
          this.upi_id = this.ViewEntityInfo.entity_upi_id;
          this.owner_name = this.ViewEntityInfo.entity_owner_name;
          this.userCCcode = this.ViewEntityInfo.owner_country_code || "";
          this.contact_number = this.ViewEntityInfo.owner_contact_no || "";
        }
      },
      immediate: true,
    },
  },

  methods: {
    getFilename(url) {
      if (!url) return null; // Prevent errors if URL is empty
      return url.split("/").pop(); // Extracts the filename from URL
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    is_number(evt, value) {
      evt = evt || window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
      if (value.length >= 14 && charCode >= 48 && charCode <= 57) {
        evt.preventDefault();
      }
    },

    countries() {
      var countryWithCc = [];
      this.countriesData = [];
      CountryList.forEach((element) => {
        countryWithCc.push({
          title: element.name + "(" + element.dial_code + ")",
          value: element.dial_code,
        });
        this.countriesData.push(element.name);
      });

      var countryListt = countryWithCc;
      this.countryCodes = countryListt;
    },

    handleFileUpload(file, type) {
      if (file && file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (type === "logo") this.entity_logo = e.target.result;
          else if (type === "signature")
            this.entity_signature = e.target.result;
          else if (type === "seal") this.entity_seal = e.target.result;
          else if (type === "qrcode") this.entity_qrcode = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // Clear the preview if no valid file is provided
        if (type === "logo") this.entity_logo = null;
        else if (type === "signature") this.entity_signature = null;
        else if (type === "seal") this.entity_seal = null;
        else if (type === "qrcode") this.entity_qrcode = null;
      }
    },

    clearFile(type) {
      if (type === "logo") {
        this.entity_logo = null;
        this.entity_logo_file = null;
        this.bucketUrls.logo = null;
      } else if (type === "signature") {
        this.entity_signature = null;
        this.entity_signature_file = null;
        this.bucketUrls.signature = null;
      } else if (type === "seal") {
        this.entity_seal = null;
        this.entity_seal_file = null;
        this.bucketUrls.seal = null;
      } else if (type === "qrcode") {
        this.entity_qrcode = null;
        this.entity_qrcode_file = null;
        this.bucketUrls.qrcode = null;
      }
    },

    convertToPngFormat(filename) {
      if (!filename) return "";
      return filename.replace(/\.[^.]+$/, ".jpg");
    },

    async upload_new_func(file, type) {
      let concertedfile = this.convertToPngFormat(file.name);
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      const s3_details = {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      };
      const key = [
        `quotations/${
          orgDetails.organization.organization_id
        }/${Date.now()}-${this.replaceSpecialCharacters(concertedfile)}`,
      ];
      try {
        const fileUrl = await uploadToS3(file, s3_details, key);
        if (fileUrl) {
          return (this.bucketUrls[type] = fileUrl);
        }
      } catch (err) {
        this.$emit("errorMsg", "Upload failed. Check console");
        this.loading = false;
      }
    },

    async get_file() {
      this.bucketUrls = {
        logo: this.entity_logo || null,
        signature: this.entity_signature || null,
        seal: this.entity_seal || null,
        qrcode: this.entity_qrcode || null,
      };

      let filesToUpload = [
        { file: this.entity_logo_file, type: "logo" },
        { file: this.entity_signature_file, type: "signature" },
        { file: this.entity_seal_file, type: "seal" },
        { file: this.entity_qrcode_file, type: "qrcode" },
      ].filter((item) => item.file && item.file instanceof File);

      if (filesToUpload.length === 0) {
        // No new files to upload, proceed with saving entity data
        this.saveEntityData();
        return;
      }

      let uploadPromises = filesToUpload.map(({ file, type }) => {
        return new Promise((resolve, reject) => {
          if (!file || !(file instanceof File)) {
            reject(new Error(`Invalid file for type: ${type}`));
            return;
          }

          const fr = new FileReader();
          fr.onload = (event) => {
            this.upload_new_func(file, type)
              .then((url) => {
                this.bucketUrls[type] = url;
                resolve(url);
              })
              .catch(reject);
          };
          fr.onerror = () => {
            reject(new Error(`Failed to read file for type: ${type}`));
          };
          fr.readAsDataURL(file);
        });
      });

      Promise.all(uploadPromises)
        .then(() => {
          this.saveEntityData();
        })
        .catch((error) => {
          console.error("Error uploading images:", error);
          this.loading = false;
          this.$emit("errorMsg", "Error uploading files. Please try again.");
        });
    },

    async validateAndUpload() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        this.get_file();
      } else {
        this.$emit("errorMsg", "Please fill in all required fields.");
      }
    },

    replaceSpecialCharacters(filename) {
      return filename.replace(/[^a-zA-Z0-9.]/g, "_");
    },

    async saveEntityData() {
      var imageDetails = this.bucketUrls;
      try {
        let result = await API.graphql(
          graphqlOperation(quotation_billing_entities, {
            input: {
              action_type: "UPDATE",
              entity_name: this.entity_name,
              entity_id: this.ViewEntityInfo.entity_id,
              entity_status: this.ViewEntityInfo.entity_status,
              entity_logo: imageDetails.logo,
              entity_signature: imageDetails.signature,
              entity_address: this.entity_address,
              owner_contact_no: this.contact_number,
              owner_country_code: this.userCCcode,
              entity_gst: this.tax_id,
              entity_seal: imageDetails.seal,
              entity_qr_code: imageDetails.qrcode,
              entity_owner_name: this.owner_name,
              entity_upi_id: this.upi_id,
              default_email: this.emailCheck,
              entity_owner_email: this.emailCheck
                ? undefined
                : this.entity_email,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.quotation_billing_entities);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.resetValidation();
          this.$refs.form.reset();
          this.loading = false;
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
      
        this.loading = false;
        this.$emit("errorMsg", "Error updating entity. Please try again.");
      }
    },
  },
};
</script>

<style scoped>
.file-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}
.preview {
  width: 150px;
  height: 80px;
  object-fit: contain;
  border-radius: 5px;
  margin-bottom: 10px;
}
.delete-icon {
  cursor: pointer;
  color: red;
  margin-left: -8px;
  margin-top: 30px;
}
.logo-header {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}
</style>
