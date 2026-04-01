<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="supplierAddition"
      persistent
      fullscreen
      transition="dialog-top-transition"
    >
      <v-card flat >
        <v-toolbar
          density="compact"
          
          flat
        >
          <v-toolbar-title>Add Suppliers/Vendor</v-toolbar-title>
          <v-spacer />
          <v-btn
            size="small"
            dark
            style="background-color: green; color: white"
            class="text-capitalize"
            :loading="loading"
            @click="Validate_Data"
            >Save</v-btn
          >
          <v-btn
            size="small"
            dark
            class="text-capitalize cardCss ml-2"
            @click="cancelAction"
            >Cancel</v-btn
          >
        </v-toolbar>
        <v-card-text class="fullscrollable-content">
          <v-form ref="form">
            <!-- <span style="font-size: larger; color: black"
              ><b>Basic Information</b></span
            > -->
            <v-row class="mt-2">
              <v-col cols="12"><h3>Basic Information</h3></v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="billingName"
                  :rules="[rules.required]"
                  label="Billing Name*"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formattedDate"
                  density="compact"
                  variant="outlined"
                  class="ml-2"
                  persistent-hint
                  label="Working With Us Since*"
                  color="primaryColor"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="menu = true"
                ></v-text-field>
                <v-dialog
                  v-model="menu"
                  color="primaryColor"
                  persistent
                  width="320px"
                >
                  <v-card>
                    <v-date-picker
                      v-model="date"
                      :max="minDate"
                      color="primary"
                      scrollable
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text color="primaryColor" @click="menu = false">
                        Cancel
                      </v-btn>
                      <v-btn text color="primaryColor" @click="menu = false">
                        OK
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
            <v-row class="mt-n8">
              <v-col cols="12" sm="6">
                <v-select
                  v-model="selectedFirmType"
                  :items="firmTypes"
                  label="Firm Type"
                  density="compact"
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>

            <!-- <span style="font-size: larger; color: black"
              ><b>Address Details</b></span
            > -->
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Address Details</h3></v-col>
              <v-col cols="5" class="">
                <v-textarea
                  v-model="address1"
                  label="Address1(Billing)*"
                  :rules="[rules.required]"
                  density="compact"
                  variant="outlined"
                ></v-textarea>
              </v-col>
              <v-col cols="1">
                <!-- <v-icon
                  color="blue"
                  style="margin-top: 30px"
                  @click="add_geolocation('ADDRESS_1')"
                  >mdi-map-marker-plus-outline</v-icon
                > -->
              </v-col>

              <v-col cols="5" class="">
                <v-textarea
                  v-model="address2"
                  label="Address2(Mailing)"
                  density="compact"
                  variant="outlined"
                ></v-textarea>
              </v-col>
              <v-col cols="1">
                <!-- <v-icon
                  color="blue"
                  style="margin-top: 30px"
                  @click="add_geolocation('ADDRESS_2')"
                  >mdi-map-marker-plus-outline</v-icon
                > -->
              </v-col>
            </v-row>

            <!-- <span style="font-size: larger; color: black"
              ><b>Contact Details</b></span
            > -->
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Contact Details</h3></v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="PrimaryName"
                  :rules="[rules.required]"
                  label="Primary Name*"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-autocomplete
                  label="Country Code*"
                  v-model="userCCcode"
                  :items="countryCodes"
                  :search-input.sync="search"
                  @input="search = ''"
                  item-value="value"
                  item-text="title"
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                  class="ml-2"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="PrimaryContact"
                  :maxlength="14"
                  :rules="[rules.required, rules.phone]"
                  @keypress="is_number($event, PrimaryContact)"
                  label="Contact Number*"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="PrimaryEmail"
                  label="Primary Email ID*"
                  :rules="[rules.required, rules.email]"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            <v-row class="mt-n6">
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="SecondaryName"
                  label="Secondary Name"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-autocomplete
                  label="Country Code"
                  v-model="SecondaryuserCCcode"
                  :items="SecondarycountryCodes"
                  :search-input.sync="searchA"
                  @input="searchA = ''"
                  item-value="value"
                  item-text="title"
                  density="compact"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                  class="ml-2"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="SecondaryContact"
                  :maxlength="14"
                  @keypress="is_number($event, SecondaryContact)"
                  label="Contact Number"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="SecondaryEmail"
                  label="Secondary Email ID"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <!-- <span style="font-size: larger; color: black"
              ><b>Banking Details</b></span
            > -->
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Banking Details</h3></v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="accountName"
                  label="Beneficiary Account Name"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="branchName"
                  label="Bank & Branch Name"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="accountNumber"
                  label="Beneficiary Account Number"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="accountType"
                  :items="[
                    { title: 'Savings Account ', value: 'savingAcc' },
                    { title: 'Current Account', value: 'currentAcc' },
                    { title: 'Overdraft Account', value: 'overdraftAcc' },
                  ]"
                  label="Account Type"
                  item-title="title"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            <v-row class="mt-n6">
              <v-col cols="12" sm="3">
                <v-text-field
                  v-model="ifscCode"
                  label="IFSC Code"
                  density="compact"
                  variant="outlined"
                  :rules="[ifscRule]"
                  @input="ifscCode = ifscCode.toUpperCase()"
                />
              </v-col>
            </v-row>

            <!-- <span style="font-size: larger; color: black"
              ><b>Tax & Compliance</b></span
            > -->
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Tax & Compliance</h3></v-col>
              <v-col md="6" class="">
                <v-text-field
                  label="GST Number"
                  v-model="gstin"
                  density="compact"
                  variant="outlined"
                  :rules="[gstinRule]"
                  @input="gstin = gstin.toUpperCase()"
                />
              </v-col>
              <v-col cols="12" sm="6" class="">
                <v-select
                  v-model="gststateCode"
                  :items="gstCodelist"
                  label="GST State Code"
                  item-title="title"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                />
              </v-col>
              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="PAN Number"
                  v-model="pan"
                  density="compact"
                  variant="outlined"
                  :rules="[panRule]"
                  @input="pan = pan.toUpperCase()"
                />
              </v-col>

              <v-col md="6" class="mt-n4">
                <v-text-field
                  label="CIN Number"
                  v-model="cinId"
                  density="compact"
                  variant="outlined"
                  :rules="[cinRule]"
                  @input="cinId = cinId.toUpperCase()"
                />
              </v-col>
            </v-row>
            <!-- <span style="font-size: larger; color: black"
              ><b>Document Details</b></span
            > -->
            <v-row class="mt-n8">
              <v-col cols="12"><h3>Attachments</h3></v-col>
              <v-col cols="12" sm="3">
                <v-text-field
                  class="cursor-pointer"
                  @click="triggerFileInput('gst')"
                  label="GST Certificate"
                  v-model="gstFileName"
                  prepend-icon="mdi-paperclip"
                  density="compact"
                  variant="outlined"
                  readonly
                ></v-text-field>

                <input
                  type="file"
                  ref="gstInput"
                  accept="image/*,.pdf"
                  hidden
                  @change="uploadImage('gst', $event)"
                />

                <div v-if="gstImageUrl || gstIsPdf" class="mt-2">
                  <div class="preview-container">
                    <template v-if="gstIsPdf">
                      <div class="pdf-preview">
                        <v-icon large color="red">mdi-file-pdf-box</v-icon>
                        <div class="pdf-info">
                          <span class="pdf-name">{{ gstFileName }}</span>
                          <a
                            :href="gstPreviewUrl"
                            target="_blank"
                            class="pdf-link"
                            >View PDF</a
                          >
                        </div>
                      </div>
                    </template>

                    <v-img
                      v-else
                      :src="gstImageUrl"
                      height="80"
                      width="80"
                      class="rounded elevation-2"
                    />
                    <v-icon
                      size="small"
                      class="delete-icon"
                      @click="removeImage('gst')"
                      >mdi-delete</v-icon
                    >
                  </div>
                </div>
              </v-col>

              <v-col cols="12" sm="3">
                <v-text-field
                  class="cursor-pointer"
                  @click="triggerFileInput('pan')"
                  label="PAN Document"
                  v-model="panFileName"
                  prepend-icon="mdi-paperclip"
                  density="compact"
                  variant="outlined"
                  readonly
                ></v-text-field>

                <input
                  type="file"
                  ref="panInput"
                  accept="image/*,.pdf"
                  hidden
                  @change="uploadImage('pan', $event)"
                />

                <div v-if="panImageUrl || panIsPdf" class="mt-2">
                  <div class="preview-container">
                    <template v-if="panIsPdf">
                      <div class="pdf-preview">
                        <v-icon large color="red">mdi-file-pdf-box</v-icon>
                        <div class="pdf-info">
                          <span class="pdf-name">{{ panFileName }}</span>
                          <a
                            :href="panPreviewUrl"
                            target="_blank"
                            class="pdf-link"
                            >View PDF</a
                          >
                        </div>
                      </div>
                    </template>

                    <v-img
                      v-else
                      :src="panImageUrl"
                      height="80"
                      width="80"
                      class="rounded elevation-2"
                    />
                    <v-icon
                      size="small"
                      class="delete-icon"
                      @click="removeImage('pan')"
                      >mdi-delete</v-icon
                    >
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <AddGeoLocation
        :addGeoLocationDialog="addGeoLocationDialog"
        :location_type="location_type"
        @clicked="addGeoLocationDialog = false"
        v-on:savelocation="handleLocationSave"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import GSTStatecodeList from "@/JsonFiles/GSTStatecodeList.json";
import CountryList from "@/JsonFiles/CountryList.json";
import { Auth } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { aseet_suppliers } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// import AddGeoLocation from "./AddGeoLocation.vue";
export default {
  props: {
    supplierAddition: Boolean,
  },
  components: {
    GSTStatecodeList,
    CountryList,
    // AddGeoLocation,
  },
  data() {
    return {
      rules: {
        required: (value) => !!value || "This field is required",
        phone: (val) =>
          (val ? val.length >= 8 : false) ||
          "Phone number must be at least 8 digits",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid Email";
        },
      },
      billingName: "",
      billingAddress: "",
      mailingAddress: "",
      minDate: new Date().toISOString().substr(0, 10),
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      address1: "",
      address2: "",
      PrimaryName: "",
      PrimaryContact: "",
      PrimaryEmail: "",
      SecondaryName: "",
      SecondaryuserCCcode: "+91",
      SecondarycountryCodes: [],
      SecondaryContact: "",
      SecondaryEmail: "",
      gstin: "",
      pan: "",
      cinId: "",
      gstIsPdf: false,
      gstPreviewUrl: null,
      gstFileName: "",
      gstImageUrl: null,
      panFileName: "",
      panImageUrl: null,
      panIsPdf: false,
      panPreviewUrl: null,
      selectedFirmType: "",
      firmTypes: [
        { title: "Proprietorship", value: "proprietorship" },
        { title: "Un-Registered Vendor", value: "unregisted_vendor" },
        { title: "Private Limited (Pvt Ltd)", value: "private_limited" },
        { title: "Partnership", value: "partnership" },
        { title: "Limited Liability Partnership (LLP)", value: "llp" },
        { title: "OPC Private Limited", value: "opc" },
        { title: "Public Limited", value: "public_limited" },
        { title: "NGO/Charity", value: "ngo" },
        { title: "Labour", value: "labour" },
      ],
      gstCodelist: [],
      gststateCode: "",
      headers: [
        {
          title: "Contact Name",
          value: "contact_Name",
          sortable: true,
        },
        {
          title: "Phone Number",
          value: "contact_number",
          sortable: true,
        },
        {
          title: "Email ID",
          value: "email_id",
          sortable: true,
        },
        {
          title: "Actions",
          value: "actions",
          sortable: true,
        },
      ],
      tableData: [],
      countryCodes: [],
      search: "",
      searchA: "",
      userCCcode: "+91",
      addAdditionalDialog: false,
      componentCheck: 0,
      accountName: "",
      branchName: "",
      accountNumber: "",
      accountType: "",
      ifscCode: "",
      tableLoading: false,
      fixed: true,
      addGeoLocationDialog: false,
      location_type: "",
      loading: false,
    };
  },
  computed: {
    formattedDate() {
      if (!this.date) return "";
      const d = new Date(this.date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },
  created() {
    this.countries();
    this.gstStates();
  },
  methods: {
    gstinRule(value) {
      if (!value) return true; // Not mandatory
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      return gstRegex.test(value) || "Enter a valid GSTIN";
    },
    panRule(value) {
      if (!value) return true; // Optional
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      return panRegex.test(value) || "Enter a valid PAN (e.g., ABCDE1234F)";
    },
    cinRule(value) {
      if (!value) return true; // Optional
      const cinRegex = /^L[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
      return cinRegex.test(value) || "Enter a valid CIN (21-character format)";
    },
    ifscRule(value) {
      if (!value) return true; // Optional
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      return ifscRegex.test(value) || "Enter a valid IFSC (e.g., HDFC0001234)";
    },
    countries() {
      var countryWithCc = [];
      this.countriesData = [];
      CountryList.forEach((element) => {
        countryWithCc.push({
          title: element.dial_code,
          value: element.dial_code,
        });
        this.countriesData.push(element.name);
      });

      var countryListt = countryWithCc;
      this.countryCodes = countryListt;
      this.SecondarycountryCodes = countryListt;
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

    add_geolocation(item) {
      this.location_type = item;
      this.addGeoLocationDialog = true;
      this.componentCheck = 1;
    },
    handleLocationSave(value) {
      // console.log(value);
      if (value.location_type === "ADDRESS_1") {
        this.address1 = value.address_Detail;
        this.addGeoLocationDialog = false;
      } else if (value.location_type === "ADDRESS_2") {
        this.address2 = value.address_Detail;
        this.addGeoLocationDialog = false;
      }
    },

    gstStates() {
      this.gstCodelist = GSTStatecodeList.map((item) => ({
        ...item,
        title: `${item.text} (${item.value})`,
      }));
    },
    add_address() {
      this.addAdditionalDialog = true;
      this.componentCheck = 1;
    },
    async Validate_Data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        const hasPanOrgst = this.panImageUrl || this.gstImageUrl;

        if (hasPanOrgst) {
          this.loading = true;
          this.get_file();
        } else {
          this.loading = true;
          this.create_supplier();
        }
      }
    },

    async get_file() {
      let files = [];

      if (this.panImageUrl) {
        files.push({ file: this.panImageUrl, type: "pan" });
      }

      if (this.gstImageUrl) {
        files.push({ file: this.gstImageUrl, type: "gst" });
      }

      const uploadPromises = files.map(({ file, type }) =>
        this.upload_new_func(file, type)
      );

      try {
        await Promise.all(uploadPromises);
        this.create_supplier();
      } catch (error) {
        console.error("Error uploading images:", error);
        this.$emit("errorMsg", "PAN/gst upload failed.");
      }
    },

    async upload_new_func(fileUrl, type) {
      try {
        // Convert base64 data URL to Blob
        const response = await fetch(fileUrl);
        const blob = await response.blob();

        // Determine file extension from MIME type
        const mimeType = blob.type;
        const extension = mimeType.split("/")[1]; // e.g., 'png', 'jpeg', 'pdf'
        const fileName = `${type}.${extension}`;

        // AWS auth
        await Auth.currentCredentials();
        const orgDetails = this.$store.getters.GetOrgDetails;

        const s3_details = {
          bucket_name: "stichh-medias",
          region: "us-east-1",
        };

        const key = [
          `customers/${
            orgDetails.organization.organization_id
          }/${Date.now()}-${fileName}`,
        ];

        const fileUrlFromS3 = await uploadToS3(blob, s3_details, key);

        if (fileUrlFromS3) {
          if (type === "pan") this.panImageUrl = fileUrlFromS3;
          if (type === "gst") this.gstImageUrl = fileUrlFromS3;
        }
      } catch (err) {
        throw new Error(`Upload failed for ${type}: ${err.message}`);
      }
    },

    cancelAction() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    triggerFileInput(type) {
      if (type === "gst") {
        this.$refs.gstInput.click();
      } else if (type === "pan") {
        this.$refs.panInput.click();
      }
    },
    uploadImage(type, event) {
      const file = event.target.files[0];
      if (file) {
        const isPdf = file.type === "application/pdf";
        const reader = new FileReader();
        reader.onload = (e) => {
          if (type === "gst") {
            this.gstFileName = file.name;
            this.gstIsPdf = isPdf;
            this.gstPreviewUrl = e.target.result;

            this.gstImageUrl = e.target.result;
          } else if (type === "pan") {
            this.panFileName = file.name;
            this.panIsPdf = isPdf;
            this.panPreviewUrl = e.target.result;
            this.panImageUrl = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    },
    removeImage(type) {
      if (type === "gst") {
        this.gstImageUrl = null;
        this.gstFileName = "";
        this.gstIsPdf = false;
        this.gstPreviewUrl = null;
      } else if (type === "pan") {
        this.panFileName = "";
        this.panImageUrl = null;
        this.panIsPdf = false;
        this.panPreviewUrl = null;
      }
    },

    async create_supplier() {
      // let abc = this.panImageUrl;
      // console.log("aaa",abc)
      this.loading = true;
      const fullNumber = `${this.userCCcode}_${this.PrimaryContact}`;
      const SecondaryFullNumber = `${this.SecondaryuserCCcode}_${this.SecondaryContact}`;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(aseet_suppliers, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "CREATE_SUPPLIER",
              supplier_name:
                this.billingName == "" ? undefined : this.billingName,
              suppliers_contact_name:
                this.PrimaryName == "" ? undefined : this.PrimaryName,
              suppliers_full_number: fullNumber,
              suppliers_email_id:
                this.PrimaryEmail == "" ? undefined : this.PrimaryEmail,
              suppliers_address:
                this.address1 == "" ? undefined : this.address1,
              suppliers_address_2:
                this.address2 == "" ? undefined : this.address2,
              bank_account_no:
                this.accountNumber == "" ? undefined : this.accountNumber,
              gst_no: this.gstin == "" ? undefined : this.gstin,
              ifsc_code: this.ifscCode == "" ? undefined : this.ifscCode,
              account_holder_name:
                this.accountName == "" ? undefined : this.accountName,
              account_type:
                this.accountType == "" ? undefined : this.accountType,
              bank_branch_name:
                this.branchName == "" ? undefined : this.branchName,
              secondary_contact_name:
                this.SecondaryName == "" ? undefined : this.SecondaryName,
              secondary_contact_no:
                this.SecondaryContact == "" ? undefined : SecondaryFullNumber,
              secondary_email_id:
                this.SecondaryEmail == "" ? undefined : this.SecondaryEmail,
              gst_state_code:
                this.gststateCode == "" ? undefined : this.gststateCode,
              pan_no: this.pan == "" ? undefined : this.pan,
              pan_doccument: this.panImageUrl ? this.panImageUrl : undefined,
              gst_certificate_doccument: this.gstImageUrl
                ? this.gstImageUrl
                : undefined,
              firm_type:
                this.selectedFirmType == "" ? undefined : this.selectedFirmType,
              cin_code: this.cinId == "" ? undefined : this.cinId,
              working_since: this.date,
            },
          })
        );
        var response = JSON.parse(result.data.aseet_suppliers);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
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

<style scoped>
.cursor-pointer {
  cursor: pointer;
  margin-left: -10px;
  margin-top: 5px;
  color: #434374;
}
.preview-container {
  position: relative;
  display: inline-block;
  margin-top: 8px;
}

.attachment-card {
  width: 100px;
  height: 100px;
  cursor: pointer;
  position: relative;
}

.delete-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  color: red;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pdf-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-width: 200px;
}

.pdf-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pdf-name {
  font-size: 12px;
  color: #666;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pdf-link {
  color: #1976d2;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
}

.pdf-link:hover {
  text-decoration: underline;
}

.custom-prefix .v-input__prefix {
  font-size: 10px; /* Adjust to your desired font size */
}
.fullscrollable-content {
  max-height: 700px !important;
  overflow-y: auto !important;
}
</style>
    