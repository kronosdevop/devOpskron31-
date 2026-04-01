<template>
  <!--  eslint-disable 
   -->
  <div>
    <v-card>
      <v-toolbar elevation="0" density="compact" class="bg-white">
        <v-toolbar-title class="text-black ml-2">
          <div class="custom-title">Add Entry</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text>
        <v-form ref="form">
          <span v-if="Give_Got_Type === 'You_Gave'">
            <b>You Gave {{ itemValue.customer.customer_name }} ₹
              {{ amount || 0 }}
            </b>
          </span>
          <span v-else-if="Give_Got_Type === 'You_Got'">
            <b>
              {{ itemValue.customer.customer_name }} Gave you ₹
              {{ amount || 0 }}</b>
          </span>
          <v-row>
            <v-col cols="12" sm="6" class="mt-2">
              <v-text-field variant="outlined" density="compact" label="Amount" v-model="amount" prepend-inner-icon="mdi-currency-rupee"
                :rules="[rules.required, rules.positiveNumber]"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="mt-2">
              <v-text-field
                label="Choose Date"
                v-model="computedDateDisplay"
                variant="outlined"
                density="compact"
                @click="datePicker = true"
                readonly
                append-inner-icon="mdi-calendar"
                persistent-hint
                class="mr-2"
                style="min-width: 180px; max-width: 200px"
              >
                <v-dialog v-model="datePicker" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempDate"
                      :max="new Date().toISOString().substr(0, 10)"
                      color="#DB4C77"
                      class="primaryColor"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn variant="text" color="primaryColor" @click="datePicker = false">
                        Cancel
                      </v-btn>
                      <v-btn variant="text" color="primaryColor" @click="saveDate">
                        OK
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-text-field>
            </v-col>
            <v-col cols="12" class="mt-n6">
              <v-text-field variant="outlined" v-model="invoiceNo" density="compact" label="Invoice/Bill No."></v-text-field>
            </v-col>
            <v-col cols="12" class="mt-n6">
              <v-text-field variant="outlined" density="compact" v-model="comments" label="Comments"></v-text-field>
            </v-col>
            <v-col cols="12" class="mt-n8">
              <span><b>Attachments:</b></span>

              <!-- Show card only if imageCheck is true -->
              <template v-if="imageCheck">
                <!-- Card for images only -->
                <v-card v-if="!isPdf(imageUrl)" variant="outlined" class="attachment-card d-flex align-center justify-center"
                  @click="triggerFileInput">
                  <!-- Show plus icon if there's no image -->
                  <v-icon v-if="!imageUrl" size="40">mdi-plus</v-icon>

                  <!-- Image preview -->
                  <v-img v-else :src="imageUrl" class="uploaded-image"></v-img>

                  <!-- Delete icon for image -->
                  <v-icon v-if="imageUrl" class="delete-icon" size="small" @click.stop="removeImage">
                    mdi-delete
                  </v-icon>
                </v-card>

                <!-- PDF Preview shown outside the card -->
                <div v-else class="pdf-preview-wrapper">
                  <iframe :src="pdfDataUrl(imageUrl)" type="application/pdf" class="pdf-frame"></iframe>
                  <v-icon class="delete-icon" size="small" @click.stop="removeImage">
                    mdi-delete
                  </v-icon>
                </div>
              </template>


              <input type="file" ref="fileInput" accept="image/*,.pdf" hidden @change="uploadImage" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="red" class="mr-2 mt-n7" style="color: white" :loading="loading" @click="processAndSave()">
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable */

import { initiate_customer_transaction } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

export default {
  props: {
    giveGotTransaction: Boolean,
    itemValue: Object,
    Give_Got_Type: String,
  },

  data() {
    return {
      minDate: new Date().toISOString().substr(0, 10),
      date: new Date().toISOString().substr(0, 10),
      datePicker: false,
      tempDate: null,
      computedDateFormatted: this.formatDate(new Date()),
      amount: "",
      invoiceNo: "",
      comments: "",
      imageUrl: "",
      selectedFile: null,
      imageCheck: true,
      loading: false,
      s3ImageUrl: "",
      rules: {
        required: (value) => !!value || "This field is required",
        positiveNumber: (value) =>
          (value && parseFloat(value) > 0) || "Amount must be greater than 0",
      },
    };
  },
  watch: {
    giveGotTransaction: {
      async handler() {
        if (this.giveGotTransaction == true) {
          this.imageUrl = "";
        }
      },
      immediate: true,
    },
  },
  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },
  },
  methods: {
    isPdf(dataUrl) {
      return dataUrl.startsWith("data:application/pdf");
    },
    pdfDataUrl(base64) {
      // For safety: if already a full data URL, return as-is
      if (base64.startsWith("data:application/pdf")) return base64;
      return `data:application/pdf;base64,${base64}`;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    uploadImage(event) {
      const file = event.target.files[0];
      if (
        file &&
        (file.type.startsWith("image/") || file.type === "application/pdf")
      ) {
        this.selectedFile = file;
        const reader = new FileReader();

        reader.onload = (e) => {
          this.imageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // alert("Please upload a valid image file.");
      }
    },
    removeImage() {
      this.imageUrl = "";
      this.selectedFile = null;
    },

    async upload_new_func() {
      if (!this.selectedFile) return;
      await Auth.currentCredentials();
      const orgDetails1 = this.$store.getters.GetOrgDetails;

      const s3_details = {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      };
      // const userId = this.$store.getters.GetUserObj.user.user_id;

      const key = `workflow/${orgDetails1.organization.organization_id}-${this.itemValue.customer.customer_id
        }/${Date.now()}-${this.selectedFile.name.split(" ").join("")}`;
      try {
        const fileUrl = await uploadToS3(this.selectedFile, s3_details, key);
        if (fileUrl) {
          // console.log("✅ Uploaded file URL:", fileUrl);
          return fileUrl;
        }
      } catch (err) {
        this.$emit("errorMsg", "Upload failed. Check console");
        this.loading = false;
      }
    },
    // async uploadToS3() {
    //   if (!this.selectedFile) {
    //     return "";
    //   }

    //   const orgDetails = this.$store.getters.GetOrgDetails;
    //   const file = this.selectedFile;
    //   const reader = new FileReader();

    //   return new Promise((resolve, reject) => {
    //     reader.onload = async (event) => {
    //       const base64String = event.target.result.split(",")[1];
    //       const byteCharacters = atob(base64String);
    //       const byteNumbers = new Array(byteCharacters.length);

    //       for (let i = 0; i < byteCharacters.length; i++) {
    //         byteNumbers[i] = byteCharacters.charCodeAt(i);
    //       }

    //       const byteArray = new Uint8Array(byteNumbers);
    //       const fileBlob = new Blob([byteArray], { type: file.type });

    //       const s3 = new AWS.S3({
    //         region: "us-east-1",
    //         accessKeyId: orgDetails.s3_details.access_key,
    //         secretAccessKey: orgDetails.s3_details.secret_key,
    //       });

    //       const bucketName = "stichh-medias";
    //       const key = `workflow/${orgDetails.organization.organization_id}-${
    //         this.itemValue.customer.customer_id
    //       }/${Date.now()}-${file.name}`;

    //       const params = {
    //         Bucket: bucketName,
    //         Key: key,
    //         ACL: "public-read",
    //         Body: fileBlob,
    //         ContentType: file.type,
    //       };

    //       try {
    //         await s3.upload(params).promise();
    //         const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
    //         this.s3ImageUrl = fileUrl;
    //         resolve(fileUrl);
    //       } catch (error) {
    //         // console.error("Error uploading to S3:", error);
    //         reject(error);
    //       }
    //     };

    //     reader.readAsDataURL(file);
    //   });
    // },

    async processAndSave() {
      const validation = await this.$refs.form.validate(); // Validate form before saving
      // console.log(validation);
      if (!validation.valid) {
        this.$emit("errorMsg", "Please fill all required fields correctly.");
        return;
      }

      this.loading = true;
      try {
        this.s3ImageUrl = this.selectedFile ? await this.upload_new_func() : "";
        // console.log(this.s3ImageUrl)
        await this.saveData();
      } catch (error) {
        console.error("Error in processAndSave:", error);
        this.$emit("errorMsg", "Error uploading image or saving data.");
      } finally {
        this.loading = false;
      }
    },

    async saveData(fileUrl) {
      try {
        let result = await API.graphql(
          graphqlOperation(initiate_customer_transaction, {
            input: {
              customer_id: this.itemValue.customer.customer_id,
              invoice_number: this.invoiceNo,
              amount: this.amount,
              comments: this.comments,
              transaction_date: this.date,
              attachments: this.s3ImageUrl,
              bill_settling_type:
                this.Give_Got_Type === "You_Gave" ? "PAID" : "RECEIVED",
            },
          })
        );
        let response = JSON.parse(result.data.initiate_customer_transaction);
        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.resetValidation();
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit(
          "errorMsg",
          error.errors[0]?.message || "Error saving data."
        );
      }
    },
    displayFormatDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    saveDate() {
      this.date = this.tempDate;
      this.computedDateFormatted = this.tempDate
        ? this.formatDate(this.tempDate)
        : "";
      this.datePicker = false;
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
.pdf-preview-wrapper {
  position: relative;
  margin-top: 16px;
}

.pdf-frame {
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.delete-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

</style>
