<template>
  <div>
    <v-card flat>
      <v-toolbar density="compact" flat>
        <v-toolbar-title>
          Upload Distributors
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          v-if="headerList.length != 0 && validInputData.length != 0"
          @click="validate_data()"
          :loading="isLoadingUpload"
          size="small"
          class="text-capitalize cardCss"
        >
          Save
        </v-btn>
        <v-btn
          size="small"
          class="text-capitalize cardCss ml-2"
          @click="cancelAction"
        >
          Cancel
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col cols="3">
            <v-autocomplete
              variant="outlined"
              label="Distributor Name*"
              v-model="distributorName"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Distributor Code"
              v-model="distributorCode"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Territory"
              v-model="territory"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Business Type"
              v-model="businessType"
              :items="headerList"
              density="compact"
              clearable
            />
            <div class="font-weight-bold mt-2 mb-1">Contact Details</div>
            <v-autocomplete
              variant="outlined"
              label="Contact Name"
              v-model="contactName"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Email ID"
              v-model="emailId"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Country Code"
              v-model="countryCode"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Contact Number"
              v-model="contactNumber"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-btn
              v-if="isPreviewButtonEnabled"
              @click="construct_valid_invalid()"
              color="primary"
              size="small"
              class="text-capitalize mt-2"
            >
              Preview
            </v-btn>
          </v-col>
          <v-col cols="9">
            <v-card
              v-if="headerList.length != 0 && validInputData.length != 0"
              flat
            >
              <v-tabs
                v-model="validInvalidTabs"
                center-active
                color="primary"
                slider-color="primary"
              >
                <v-tab>Valid</v-tab>
                <v-tab>Invalid</v-tab>
              </v-tabs>
              <v-window v-model="validInvalidTabs">
                <v-window-item :value="0">
                  <v-data-table
                    :headers="validHeaders"
                    :items="UploadList.valid"
                    :items-per-page="100"
                    density="compact"
                  >
                    <template #no-data>
                      <v-alert type="info">No details are Valid</v-alert>
                    </template>
                  </v-data-table>
                </v-window-item>
                <v-window-item :value="1">
                  <v-data-table
                    :headers="InvalidHeaders"
                    :items="UploadList.invalid"
                    density="compact"
                  >
                    <template #no-data>
                      <v-alert type="info">No details are Invalid</v-alert>
                    </template>
                  </v-data-table>
                </v-window-item>
              </v-window>
            </v-card>
          </v-col>
        </v-row>
        <v-card-actions class="justify-center"> </v-card-actions>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import * as XLSX from "xlsx";
import SnackBar from "@/components/SnackBar.vue";
import { saveAs } from "file-saver";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { Auth } from "aws-amplify";
import CountryList from "@/JsonFiles/CountryList.json";
export default {
  components: {
    SnackBar,
    CountryList,
  },
  data() {
    return {
      distributorName: "",
      distributorCode: "",
      territory: "",
      businessType: "",
      contactName: "",
      emailId: "",
      countryCode: "",
      contactNumber: "",
      headerList: [],
      validHeaders: [],
      InvalidHeaders: [],
      validInputData: [],
      countryitems: [],
      UploadList: [],
      dataTable: [],
      validInvalidTabs: 0,
      isLoadingUpload: false,
      selectedFile: null,
      SnackBarComponent: {},
    };
  },
  computed: {
    isPreviewButtonEnabled() {
      const isRequiredFieldsFilled =
        this.distributorName !== "";
      const isCountycodeAndContactNumberValid =
        (this.countryCode && this.contactNumber) ||
        (!this.countryCode && !this.contactNumber);
      return isRequiredFieldsFilled && isCountycodeAndContactNumberValid;
    },
  },
  async mounted() {
    this.headerList = [];
    this.dataTable = [];
    this.dataTable = this.$store.getters.GetDistributorDetails.excelTableData;
    this.headerList = this.$store.getters.GetDistributorDetails.excelHeaders;
    this.fetch_details();
  },
  methods: {
    fetch_details() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.dial_code,
          code: element.dial_code,
        });
      });
      this.countryitems.forEach((obj) => {
        obj.code = obj.code.replace("+", ""); // Remove '+' from code
        obj.name = obj.name.replace("+", ""); // Remove '+' from name
      });
    },
    async upload_new_func() {
      if (!this.selectedFile) return;
      await Auth.currentCredentials();
      const orgDetails1 = this.$store.getters.GetOrgDetails;

      const s3_details = {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      };

      const key = `distributors-bulk-upload/${
        orgDetails1.organization.organization_id
      }_${Date.now()}-${this.selectedFile.name.split(" ").join("")}`;
      try {
        this.isLoadingUpload = true;
        // Get current user email for metadata
        const currentUser = this.$store.getters.GetUserObj;
        const userEmail = currentUser?.user?.user_email_id || "";
        
        const metadata = {
          email: userEmail
        };
        console.log(metadata, "metadata");
        
        const fileUrl = await uploadToS3(this.selectedFile, s3_details, key, metadata);
        if (fileUrl) {
          this.isLoadingUpload = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "File uploaded successfully",
            timeout: 5000,
            Top: true,
          };
          setTimeout(() => {
            this.$router.push({
              path: "/home/AssetTypes",
              query: { tab: "assetSettings", component: "distributors" }
            });
          }, 2000);
        }
      } catch (err) {
        this.isLoadingUpload = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Upload failed. Please try again.",
          timeout: 5000,
          Top: true,
        };
      }
    },
    validate_data() {
      this.isLoadingUpload = true;
      
      // Transform data to use label names as headers instead of original Excel headers
      const transformedData = this.UploadList.valid.map(record => {
        const newRecord = {};
        this.validHeaders.forEach(header => {
          // Use the label name (title) as the new key, and get value from original key
          if (header.key && record[header.key] !== undefined) {
            newRecord[header.title] = record[header.key];
          }
        });
        return newRecord;
      });

      // Create worksheet with transformed data
      const worksheet = XLSX.utils.json_to_sheet(transformedData);
      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
      // Generate buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      // 3. Create a Blob from the buffer
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // 4. Create a File for upload
      const file = new File([blob], "distributors_upload.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      this.selectedFile = file;

      // Upload the file to S3
      this.isLoadingUpload = true;
      this.upload_new_func();
    },
    construct_valid_invalid() {
      const allHeaders = [
        {
          title: "Distributor Name",
          key: this.distributorName,
        },
        {
          title: "Distributor Code",
          key: this.distributorCode,
        },
        {
          title: "Territory",
          key: this.territory,
        },
        {
          title: "Business Type",
          key: this.businessType,
        },
        {
          title: "Contact Name",
          key: this.contactName,
        },
        {
          title: "Email ID",
          key: this.emailId,
        },
        {
          title: "Country Code",
          key: this.countryCode,
        },
        {
          title: "Contact Number",
          key: this.contactNumber,
        },
      ];

      this.validHeaders = allHeaders
        .filter((header) => header.key && header.key.trim() !== "")
        .map((header) => ({ title: header.title, key: header.key }));

      this.InvalidHeaders = [
        ...this.validHeaders,
      ];

      this.validInputData = this.dataTable;
      this.validate_mandatory_data();
    },
    validate_mandatory_data() {
      var self = this;
      self.UploadList = {
        valid: [],
        invalid: [],
      };
      this.validInputData.forEach((element) => {
        var valid = true;

        if (element[this.distributorName] == undefined || element[this.distributorName] == "") {
          valid = false;
        }

        if (element[this.emailId] !== undefined && element[this.emailId] !== "") {
          const emailPattern =
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

          if (!emailPattern.test(element[this.emailId])) {
            valid = false;
          }
        }

        if (element[this.contactNumber] != undefined && element[this.contactNumber] != "") {
          if (element[this.countryCode] == undefined || element[this.countryCode] == "") {
            valid = false;
          }
          let contactNumber = String(element[this.contactNumber]).trim();

          const isValidNumber = /^\d+$/.test(contactNumber);

          if (
            !isValidNumber ||
            contactNumber.length < 8 ||
            contactNumber.length > 14
          ) {
            valid = false;
          }
        }

        if (element[this.countryCode] != undefined && element[this.countryCode] != "") {
          if (element[this.contactNumber] == undefined || element[this.contactNumber] == "") {
            valid = false;
          }
          let contactcode = String(element[this.countryCode]).trim();

          contactcode = contactcode.replace("+", "");
          const exists = this.countryitems.some(
            (country) => country.code === contactcode
          );

          if (exists == false) {
            element[this.countryCode] = "";
            valid = false;
          } else {
            element[this.countryCode] = String(
              element[this.countryCode]
            ).trim();
          }
        }
        if (valid) {
          this.UploadList.valid.push(element);
        } else {
          this.UploadList.invalid.push(element);
        }
      });
    },
    cancelAction() {
      this.$router.push({
        path: "/home/AssetTypes",
        query: { tab: "assetSettings", component: "distributors" }
      });
    },
  },
};
</script>

<style>
</style>

