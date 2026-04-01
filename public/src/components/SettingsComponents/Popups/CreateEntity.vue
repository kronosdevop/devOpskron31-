<template>
  <div>
    <!--  eslint-disable  -->
    <v-dialog
      :model-value="createEntityDialog"
      @update:model-value="$emit('update:createEntityDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Entity</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="">
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
              color="blue"
              :label="
                emailCheck
                  ? 'Enter Email ID'
                  : 'Default Email-ID(no-reply@stichh.com)'
              "
              density="compact"
            ></v-checkbox>

            <v-text-field
              v-if="emailCheck"
              variant="outlined"
              density="compact"
              label="Enter Email*"
              v-model="entity_email"
              :rules="[rules.required, rules.email]"
            ></v-text-field>
            <div class="file-upload">
              <v-file-input
                label="Entity Logo"
                variant="outlined"
                density="compact"
                accept="image/png, image/jpeg"
                v-model="entity_logo_file"
                @change="handleFileUpload($event, 'logo')"
                clearable
                @click:clear="clearFile('logo')"
                :rules="[rules.required, rules.images]"
              ></v-file-input>
              <v-img
                v-if="entity_logo"
                :src="entity_logo"
                class="preview"
              ></v-img>
            </div>

            <div class="file-upload">
              <v-file-input
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
              <v-img
                v-if="entity_signature"
                :src="entity_signature"
                class="preview"
              ></v-img>
            </div>
            <div class="file-upload">
              <v-file-input
                label="Entity Seal"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                v-model="entity_seal_file"
                @change="handleFileUpload($event, 'seal')"
                clearable
                @click:clear="clearFile('seal')"
                accept="image/png, image/jpeg"
              ></v-file-input>
              <v-img
                v-if="entity_seal"
                :src="entity_seal"
                class="preview"
              ></v-img>
            </div>
            <div class="file-upload">
              <v-file-input
                label="Entity QRcode"
                variant="outlined"
                density="compact"
                accept="image/png, image/jpeg"
                :rules="[rules.required]"
                v-model="entity_qrcode_file"
                @change="handleFileUpload($event, 'qrcode')"
                clearable
                @click:clear="clearFile('qrcode')"
              ></v-file-input>
              <v-img
                v-if="entity_qrcode"
                :src="entity_qrcode"
                class="preview"
              ></v-img>
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
    createEntityDialog: Boolean,
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
      owner_name: "",
      upi_id: "",
      entity_logo: null,
      entity_logo_file: null,
      entity_signature: null,
      entity_signature_file: null,
      entity_seal: null,
      entity_seal_file: null,
      entity_qrcode_file: null,
      entity_qrcode: null,
      loading: false,
      bucketUrls: null,
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
    };
  },
  watch: {
    createEntityDialog(newVal) {
      if (newVal) {
        this.emailCheck = true;
        this.entity_email = "";
        this.$nextTick(() => {
          this.$refs.form?.resetValidation();
        });
      }
    },
  },

  created() {
    this.countries();
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.clearFile("logo");
      this.clearFile("signature");
      this.clearFile("seal");
      this.clearFile("qrcode");
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
    convertToPngFormat(filename) {
      if (!filename) return "";
      return filename.replace(/\.[^.]+$/, ".jpg");
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

    // async upload_S3(baseData, file, type) {
    //     let concertedfile = this.convertToPngFormat(file.name);
    //     const deatils = this.$store.getters.GetOrgDetails;

    //     const buf = Buffer.from(baseData, "base64");

    //     const s3Bucket = new AWS.S3({
    //         region: "us-east-1",
    //         accessKeyId: deatils.s3_details.access_key,
    //         secretAccessKey: deatils.s3_details.secret_key,
    //     });

    //     const bucketName = "stichh-medias-dev";
    //     const params = {
    //         Bucket: bucketName,
    //         Key: `quotations/${deatils.organization.organization_id}-${deatils.organization.organization_name}/${Date.now()}-${this.replaceSpecialCharacters(concertedfile)}`,
    //         ACL: "public-read",
    //         Body: buf,
    //         ContentType: file.type,
    //     };

    //     const bucketUrl = `https://${bucketName}.s3.us-east-1.amazonaws.com/${params.Key}`;

    //     return new Promise((resolve, reject) => {
    //         s3Bucket.putObject(params, (err, data) => {
    //             if (err) {
    //                 reject(err);
    //             } else {
    //                 this.bucketUrls[type] = bucketUrl;
    //                 resolve(bucketUrl);
    //             }
    //         });
    //     });
    // },

    async upload_new_func(file, type) {
      let concertedfile = this.convertToPngFormat(file.name);
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      // const userId = this.$store.getters.GetUserObj.user.user_id;
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
        // this.uploadStatus = "❌ Upload failed. Check console.";
        // this.uploadStatusType = "error";
        this.loading = false;
      }
    },

    async get_file() {
      this.bucketUrls = {
        logo: null,
        signature: null,
        seal: null,
        qrcode: null,
      };

      let files = [
        { file: this.entity_logo_file, type: "logo" },
        { file: this.entity_signature_file, type: "signature" },
        { file: this.entity_seal_file, type: "seal" },
        { file: this.entity_qrcode_file, type: "qrcode" },
      ].filter((item) => item.file && item.file instanceof File);

      if (files.length === 0) {
        // No files to upload, proceed with saving entity data
        this.saveEntityData();
        return;
      }

      let uploadPromises = files.map(({ file, type }) => {
        return new Promise((resolve, reject) => {
          if (!file || !(file instanceof File)) {
            reject(new Error(`Invalid file for type: ${type}`));
            return;
          }

          const fr = new FileReader();
          fr.onload = (event) => {
            this.upload_new_func(file, type).then(resolve).catch(reject);
          };
          fr.onerror = () => {
            reject(new Error(`Failed to read file for type: ${type}`));
          };
          fr.readAsDataURL(file);
        });
      });

      Promise.all(uploadPromises)
        .then(() => {
          // console.log("Uploaded successfully:", this.bucketUrls);
          this.saveEntityData();
        })
        .catch((error) => {
          console.error("Error uploading images:", error);
          this.loading = false;
          this.$emit("errorMsg", "Error uploading files. Please try again.");
        });
    },

    async validateAndUpload() {
      // var abc = {
      //     default_email: this.emailCheck ? false : true,
      //             entity_owner_email: this.emailCheck ? this.entity_email : undefined,
      // }
      // console.log(abc)

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
              action_type: "CREATE",
              entity_name: this.entity_name,
              entity_status: "ACTIVE",
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
              default_email: this.emailCheck ? false : true,
              entity_owner_email: this.emailCheck
                ? this.entity_email
                : undefined,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.quotation_billing_entities);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.loading = false;
          this.$refs.form.resetValidation();
          this.$refs.form.reset();
          this.entity_signature = "";
          this.entity_logo = "";
          this.entity_seal = "";
          this.entity_qrcode = "";
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        console.log(error);
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
  width: 50px;
  height: 80px;
  object-fit: contain;
  border-radius: 5px;
  margin-bottom: 10px;
}
</style>
