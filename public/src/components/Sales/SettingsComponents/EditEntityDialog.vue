<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
        <span>Edit Entity</span>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-form ref="form" @submit.prevent="validateAndUpload">
          <!-- Basic Details Section -->
          <div class="mb-6">
            <div class="d-flex align-center mb-4">
              <div class="blue-line mr-3"></div>
              <h3 class="text-h6 blue--text">Basic Details</h3>
            </div>
            
            <v-row>
              <!-- Logo Upload -->
              <v-col cols="12" md="4">
                <div class="logo-upload-container">
                  <v-file-input
                    label="Entity Logo"
                    variant="outlined"
                    density="compact"
                    accept="image/png, image/jpeg"
                    v-model="entityForm.logoFile"
                    clearable
                    @click:clear="clearFile('logo')"
                  ></v-file-input>
                  <v-img
                    v-if="entityForm.logo"
                    :src="entityForm.logo"
                    width="120"
                    height="120"
                    class="rounded-lg mt-2"
                    contain
                  />
                </div>
              </v-col>
              
              <!-- Basic Details Fields -->
              <v-col cols="12" md="8">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="entityForm.name"
                      label="Entity Name"
                      variant="outlined"
                      density="compact"
                      :rules="[v => !!v || 'Entity Name is required']"
                      required
                      class="mb-3"
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entityForm.gstNo"
                      label="GST No"
                      variant="outlined"
                      density="compact"
                      :rules="gstRules"
                      class="mb-3"
                    />
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="entityForm.phoneNo"
                      label="Phone No"
                      variant="outlined"
                      density="compact"
                      :rules="phoneRules"
                      class="mb-3"
                    />
                  </v-col>
                  
                  <v-col cols="12">
                    <v-text-field
                      v-model="entityForm.emailId"
                      label="Email ID"
                      variant="outlined"
                      density="compact"
                      :rules="emailRules"
                      type="email"
                      class="mb-3"
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>
          
          <!-- Business Details Toggle -->
          <div class="mb-4">
            <v-divider class="mb-4"></v-divider>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <div class="blue-line mr-3"></div>
                <h3 class="text-h6 blue--text">Business Details</h3>
              </div>
              <v-switch
                v-model="showBusinessDetails"
                color="#DB4C77"
                hide-details
                inset
                :label="showBusinessDetails ? 'Enabled' : 'Enable Business Details'"
              ></v-switch>
            </div>
          </div>
          
          <!-- Business Details Section -->
          <div v-if="showBusinessDetails" class="mb-6">
            <v-row>
              <!-- Left Column -->
              <v-col cols="12" md="6">
                <v-textarea
                  v-model="entityForm.businessAddress"
                  label="Business Address"
                  variant="outlined"
                  density="compact"
                  rows="4"
                  class="mb-3"
                />
                
                <v-text-field
                  v-model="entityForm.pincode"
                  label="Pincode"
                  variant="outlined"
                  density="compact"
                  :rules="pincodeRules"
                  class="mb-3"
                />
                
                <v-select
                  v-model="entityForm.state"
                  :items="indianStates"
                  label="State"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                />
                
                <v-text-field
                  v-model="entityForm.businessDescription"
                  label="Business Description"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !v || v.length <= 160 || 'Maximum 160 characters']"
                  counter="160"
                  class="mb-3"
                />
              </v-col>
              
              <!-- Right Column -->
              <v-col cols="12" md="6">
                <v-select
                  v-model="entityForm.businessType"
                  :items="businessTypes"
                  label="Business Type"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                />
                
                <v-text-field
                  v-model="entityForm.businessCategory"
                  label="Business Category"
                  variant="outlined"
                  density="compact"
                  class="mb-3"
                />
                
                <!-- Signature Upload -->
                <div class="signature-upload-container">
                  <v-file-input
                    label="Entity seal and signature"
                    variant="outlined"
                    density="compact"
                    accept="image/png, image/jpeg"
                    v-model="entityForm.signatureFile"
                    clearable
                    @click:clear="clearFile('signature')"
                  ></v-file-input>
                  <v-img
                    v-if="entityForm.signature"
                    :src="entityForm.signature"
                    width="200"
                    height="100"
                    class="rounded-lg mt-2"
                    contain
                  />
                </div>

                <!-- QR Code Upload -->
                <div class="qr-upload-container">
                  <v-file-input
                    label="QR Code"
                    variant="outlined"
                    density="compact"
                    accept="image/png, image/jpeg"
                    v-model="entityForm.qrCodeFile"
                    clearable
                    @click:clear="clearFile('qrCode')"
                  ></v-file-input>
                  <v-img
                    v-if="entityForm.qrCode"
                    :src="entityForm.qrCode"
                    width="200"
                    height="100"
                    class="rounded-lg mt-2"
                    contain
                  />
                </div>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          variant="outlined"
          @click="closeDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="#DB4C77"
          @click="validateAndUpload"
          :loading="saving"
          :disabled="!entityForm.name"
        >
          Update Entity
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { quotation_billing_entities } from "@/graphql/mutations.js";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

export default {
  name: 'EditEntityDialog',
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    editingEntity: {
      type: Object,
      default: null
    }
  },
  
  emits: ['update:modelValue', 'save', 'successMsg', 'errorMsg'],
  
  data() {
    return {
      saving: false,
      showBusinessDetails: false,
      bucketUrls: {
        logo: null,
        signature: null,
        qrCode: null,
      },
      entityForm: {
        name: '',
        gstNo: '',
        phoneNo: '',
        emailId: '',
        logo: null,
        logoFile: null,
        qrCode: null,
        qrCodeFile: null,
        businessAddress: '',
        pincode: '',
        state: '',
        businessType: '',
        businessCategory: '',
        businessDescription: '',
        signature: null,
        signatureFile: null,
      },
      
      businessTypes: [
        { title: 'Retail', value: 'retail' },
        { title: 'Wholesale', value: 'wholesale' },
        { title: 'Distributor', value: 'distributor' },
        { title: 'Other', value: 'other' },
        { title: 'Service', value: 'service' },
        { title: 'Manufacturer', value: 'manufacturer' }
      ],
      
      indianStates: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh'
      ],
      
      // Validation rules
      gstRules: [
        v => !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v) || 'Invalid GST number format'
      ],
      
      phoneRules: [
        v => !v || /^[6-9]\d{9}$/.test(v) || 'Invalid phone number (10 digits starting with 6-9)'
      ],
      
      emailRules: [
        v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email format'
      ],
      
      pincodeRules: [
        v => !v || /^[1-9][0-9]{5}$/.test(v) || 'Invalid pincode (6 digits)'
      ]
    }
  },
  
  computed: {
    dialog: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  
  watch: {
    modelValue(newVal) {
      if (newVal && this.editingEntity) {
        this.loadEntityData()
      }
    },
    "entityForm.logoFile": {
      handler(newFile) {
        if (newFile) {
          this.handleFileUpload(newFile, "logo");
        } else {
          this.entityForm.logo = null;
        }
      },
      immediate: false,
    },
    "entityForm.signatureFile": {
      handler(newFile) {
        if (newFile) {
          this.handleFileUpload(newFile, "signature");
        } else {
          this.entityForm.signature = null;
        }
      },
      immediate: false,
    },
    "entityForm.qrCodeFile": {
      handler(newFile) {
        if (newFile) {
          this.handleFileUpload(newFile, "qrCode");
        } else {
          this.entityForm.qrCode = null;
        }
      },
      immediate: false,
    },
  },
  
  methods: {
    loadEntityData() {
      if (this.editingEntity) {
        this.entityForm = {
          name: this.editingEntity.name || '',
          gstNo: this.editingEntity.gstNo || this.editingEntity.entity_gst || '',
          phoneNo: this.editingEntity.phoneNo || this.editingEntity.entity_contact_no || '',
          emailId: this.editingEntity.emailId || this.editingEntity.entity_owner_email || '',
          logo: this.editingEntity.logo || this.editingEntity.entity_logo || null,
          logoFile: null,
          qrCode: this.editingEntity.qrCode || this.editingEntity.entity_qr_code || null,
          qrCodeFile: null,
          businessAddress: this.editingEntity.businessAddress || this.editingEntity.entity_address || '',
          pincode: this.editingEntity.pincode || this.editingEntity.entity_pincode || '',
          state: this.editingEntity.state || this.editingEntity.entity_state || '',
          businessType: this.editingEntity.businessType || this.editingEntity.entity_type || '',
          businessCategory: this.editingEntity.businessCategory || this.editingEntity.enitity_category || '',
          businessDescription: this.editingEntity.businessDescription || this.editingEntity.entity_description || '',
          signature: this.editingEntity.signature || this.editingEntity.entity_seal_signature || null,
          signatureFile: null,
        }
        // console.log(this.entityForm)
        // Show business details if any business data exists
        this.showBusinessDetails = this.hasBusinessData()
      }
    },
    
    hasBusinessData() {
      return !!(this.entityForm.businessAddress || 
                this.entityForm.pincode || 
                this.entityForm.state || 
                this.entityForm.businessType || 
                this.entityForm.businessCategory || 
                this.entityForm.businessDescription || 
                this.entityForm.signature ||
                this.entityForm.qrCode)
    },
    
    closeDialog() {
      this.dialog = false
      this.resetForm()
    },

    resetForm() {
      this.entityForm = {
        name: '',
        gstNo: '',
        phoneNo: '',
        emailId: '',
        logo: null,
        logoFile: null,
        qrCode: null,
        qrCodeFile: null,
        businessAddress: '',
        pincode: '',
        state: '',
        businessType: '',
        businessCategory: '',
        businessDescription: '',
        signature: null,
        signatureFile: null,
      };
      this.showBusinessDetails = false;
      this.bucketUrls = {
        logo: null,
        signature: null,
        qrCode: null,
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },

    handleFileUpload(file, type) {
      // console.log("handleFileUpload called:", file, type);
      if (
        file &&
        typeof file === "object" &&
        file.type &&
        file.type.startsWith("image/")
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // console.log("FileReader result:", e.target.result);
          this.entityForm[type] = e.target.result;
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
        };
        reader.readAsDataURL(file);
      } else {
        // Clear the preview if no valid file is provided
        this.entityForm[type] = null;
      }
    },

    clearFile(type) {
      this.entityForm[`${type}File`] = null;
      this.entityForm[type] = null;
      this.bucketUrls[type] = null;
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
        this.saving = false;
      }
    },

    async get_file() {
      this.bucketUrls = {
        logo: null,
        signature: null,
        qrCode: null,
      };

      let files = [
        { file: this.entityForm.logoFile, type: "logo" },
        { file: this.entityForm.signatureFile, type: "signature" },
        { file: this.entityForm.qrCodeFile, type: "qrCode" },
      ].filter(
        (item) =>
          item.file &&
          typeof item.file === "object" &&
          item.file.type &&
          item.file.type.startsWith("image/")
      );

      if (files.length === 0) {
        // No files to upload, proceed with saving entity data
        this.saveEntityData();
        return;
      }

      let uploadPromises = files.map(({ file, type }) => {
        return new Promise((resolve, reject) => {
          if (
            !file ||
            typeof file !== "object" ||
            !file.type ||
            !file.type.startsWith("image/")
          ) {
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
          this.saveEntityData();
        })
        .catch((error) => {
          console.error("Error uploading images:", error);
          this.saving = false;
          this.$emit("errorMsg", "Error uploading files. Please try again.");
        });
    },

    async validateAndUpload() {
      const { valid } = await this.$refs.form.validate();

      if (valid) {
        this.saving = true;
        this.get_file();
      } else {
        this.$emit(
          "errorMsg",
          "Please fill in all required fields."
        );
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
              entity_id: this.editingEntity.id || this.editingEntity.entity_id,
              entity_name: this.entityForm.name,
              entity_type: this.entityForm.businessType || "",
              enitity_category: this.entityForm.businessCategory || "",
              entity_description: this.entityForm.businessDescription || "",
              entity_status: "ACTIVE",
              entity_logo: imageDetails.logo || this.entityForm.logo,
              entity_seal_signature: imageDetails.signature || this.entityForm.signature,
              entity_qr_code: imageDetails.qrCode || this.entityForm.qrCode,
              entity_address: this.entityForm.businessAddress || "",
              entity_contact_no: this.entityForm.phoneNo || "",
              entity_gst: this.entityForm.gstNo || "",
              entity_owner_email: this.entityForm.emailId || "",
              entity_pincode: this.entityForm.pincode || "",
              entity_state: this.entityForm.state || "",
            },
          })
        );
        this.saving = false;
        var response = JSON.parse(result.data.quotation_billing_entities);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.saving = false;
          this.$refs.form.resetValidation();
          this.$refs.form.reset();
          this.entityForm.logo = "";
          this.entityForm.signature = "";
          this.entityForm.qrCode = "";
          this.closeDialog();
        } else {
          this.saving = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        console.log(error);
        this.saving = false;
        this.$emit("errorMsg", error.errors[0].message || "Error updating entity. Please try again.");
      }
    },
  }
}
</script>

<style scoped>
.blue-line {
  width: 4px;
  height: 24px;
  background: #1976d2;
  border-radius: 2px;
}

.logo-upload-container {
  text-align: center;
}

.logo-upload-area {
  width: 120px;
  height: 120px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
}

.logo-upload-area:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #757575;
}

.qr-upload-container {
  margin-top: 8px;
}

.qr-upload-area {
  width: 200px;
  height: 100px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qr-upload-area:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #757575;
}

.signature-upload-container {
  margin-top: 8px;
}

.signature-upload-area {
  width: 200px;
  height: 100px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.signature-upload-area:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

.signature-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #757575;
}
</style>
