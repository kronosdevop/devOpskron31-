<template>
  <div>
    <v-card flat >
      <v-toolbar density="compact"  flat>
        <v-toolbar-title>Upload Supplier/ Vendors</v-toolbar-title>
        <v-spacer />
        <v-btn
          v-if="headerList.length != 0 && validInputData.length != 0"
          @click="validate_data()"
          :loading="isLoadingUpload"
          size="small"
          class="text-capitalize cardCss"
          dark
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
      <v-card-text>
        <v-row>
          <v-col cols="3">
            <v-select
              variant="outlined"
              label="Billing Name*"
              v-model="vendorBillingName"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Working Since"
              v-model="workingSince"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Firm Type"
              v-model="firmType"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Address 1(Billing)*"
              v-model="address1"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Address 2 (Mailling) "
              v-model="address2"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Primary Name*"
              v-model="primaryName"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Primary Email ID*"
              v-model="primaryEmail"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Primary Country Code*"
              v-model="primaryCode"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Primary Contact Number*"
              v-model="primaryNumber"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Secondary  Name"
              v-model="secondaryName"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Secondary Country Code"
              v-model="secondaryCode"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Secondary Contact Number"
              v-model="secondaryNumber"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Secondary Email ID"
              v-model="secondaryEmail"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Beneficiary Account Name"
              v-model="beneficiaryName"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Bank Name"
              v-model="branchName"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Account Number"
              v-model="accountNumber"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="Account Type"
              v-model="accountType"
              :items="headerList"
              density="compact"
            />
            <v-select
              variant="outlined"
              label="IFSC Code"
              v-model="ifscCode"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="CIN Number"
              v-model="cinNo"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="GST Number"
              v-model="gstId"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="GST State Code"
              v-model="gstCode"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-select
              variant="outlined"
              label="PAN Number"
              v-model="panID"
              :items="headerList"
              clearable
              density="compact"
            />
            <v-btn
              v-if="isPreviewButtonEnabled"
              @click="construct_valid_invalid()"
              class="cardCss white--text mt-2"
              color="primary"
              size="small"
              >Preview</v-btn
            >
          </v-col>
          <v-col cols="9">
            <v-card
              v-if="headerList.length != 0 && validInputData.length != 0"
              flat
            >
              <v-tabs v-model="validInvalidTabs" color="primary" grow>
                <v-tab value="0">Valid</v-tab>
                <v-tab value="1">Invalid</v-tab>
              </v-tabs>
              <v-window v-model="validInvalidTabs">
                <v-window-item value="0">
                  <v-data-table
                    :headers="validHeaders"
                    :items="UploadList.valid"
                    :items-per-page="100"
                    density="compact"
                  >
                    <template v-slot:no-data>
                      <v-alert type="info">No details are Valid</v-alert>
                    </template>
                  </v-data-table>
                </v-window-item>
                <v-window-item value="1">
                  <v-data-table
                    :headers="InvalidHeaders"
                    :items="UploadList.invalid"
                    density="compact"
                  >
                    <template v-slot:no-data>
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
import { bulk_upload_vendors } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
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
      vendorBillingName: "",
      workingSince: "",
      secondaryNumber: "",
      firmType: "",
      secondaryName: "",
      primaryNumber: "",
      primaryCode: "",
      secondaryCode: "",
      secondaryEmail: "",
      primaryEmail: "",
      gstCode: "",
      panID: "",
      gstId: "",
      cinNo: "",
      ifscCode: "",
      branchName: "",
      accountNumber: "",
      address2: "",
      address1: "",
      accountType: "",
      primaryName: "",
      beneficiaryName: "",
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
      const isFirstNameEmailFilled =
        this.vendorBillingName !== "" &&
        this.address1 !== "" &&
        this.primaryEmail !== "" &&
        this.primaryNumber !== "" &&
        this.primaryCode !== "" &&
        this.primaryName !== "";

      const isCountycodeAndContactNumberValid =
        (this.secondaryCode && this.secondaryNumber) ||
        (!this.secondaryCode && !this.secondaryNumber);

      return isFirstNameEmailFilled && isCountycodeAndContactNumberValid;
    },
  },
  async mounted() {
    this.headerList = [];
    this.dataTable = [];
    this.dataTable = this.$store.getters.GetcustomerDetails.excelTableData;
    this.headerList = this.$store.getters.GetcustomerDetails.excelHeaders;
    // console.log(this.$store.getters.GetcustomerDetails);
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
    async saveData(fileUrl) {
      this.isLoadingUpload = true;
      let headers = {
        supplier_name: this.vendorBillingName ?? "",
        working_since: this.workingSince ?? "",
        firm_type: this.firmType ?? "",
        suppliers_address: this.address1 ?? "",
        suppliers_address_2: this.address2 ?? "",
        suppliers_contact_name: this.primaryName ?? "",
        suppliers_email_id: this.primaryEmail ?? "",
        suppliers_country_code: this.primaryCode ?? "",
        suppliers_contact_number: this.primaryNumber ?? "",
        secondary_contact_name: this.secondaryName ?? "",
        secondary_country_code: this.secondaryCode ?? "",
        secondary_contact_no: this.secondaryNumber ?? "",
        secondary_email_id: this.secondaryEmail ?? "",
        account_holder_name: this.beneficiaryName ?? "",
        bank_branch_name: this.branchName ?? "",
        bank_account_no: this.accountNumber ?? "",
        account_type: this.accountType ?? "",
        ifsc_code: this.ifscCode ?? "",
        cin_code: this.cinNo ?? "",
        gst_no: this.gstId ?? "",
        pan_no: this.panID ?? "",
        gst_state_code: this.gstCode ?? "",
        // secondary_email_id: this.secondaryEmail ?? "",
        // secondary_country_code: this.secondaryCode ?? "",
        // secondary_contact_no: this.secondaryNumber ?? "",
      };
      try {
        let result = await API.graphql(
          graphqlOperation(bulk_upload_vendors, {
            input: {
              file_key: fileUrl,
              headers: JSON.stringify(headers),
            },
          })
        );
        let response = JSON.parse(result.data.bulk_upload_vendors);
        this.isLoadingUpload = false;
        if (response.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          setTimeout(() => {
            this.$store.commit("Setvendorbulkback", true);
            this.$router.push("/home/AdministrationPannel");
          }, 2000);
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.isLoadingUpload = false;
        // console.log(error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
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

      const key = `vendor-supplier-bulk-upload/${
        orgDetails1.organization.organization_id
      }/${Date.now()}-${this.selectedFile.name.split(" ").join("")}`;
      try {
        this.isLoadingUpload = false;
        const fileUrl = await uploadToS3(this.selectedFile, s3_details, key);
        if (fileUrl) {
          this.saveData(key);

          // return fileUrl;
        }
      } catch (err) {
        this.$emit("errorMsg", "Upload failed. Check console");
        this.loading = false;
      }
    },
    validate_data() {
      this.isLoadingUpload = true;
      const worksheet = XLSX.utils.json_to_sheet(this.UploadList.valid);
      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
      // Generate buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "csv",
        type: "array",
      });
      // 3. Create a Blob from the buffer
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // 4. Create a File (optional, if you want filename metadata)

      const file = new File([blob], "records.csv", {
        type: "text/csv",
      });
      this.selectedFile = file;

      this.isLoadingUpload = true;
      this.upload_new_func();
      // // Save as Excel file
      // const data = new Blob([excelBuffer], {
      //   type: "application/octet-stream",
      // });
      // saveAs(data, "records.xlsx");

      // To Change the excel headers

      // const headers = Object.keys(this.UploadList.valid[0]);
      // console.log(headers, "headers");
      // console.log(this.vendorBillingName, "this.vendorBillingName");
      // // Step 2: Create a header mapping
      // const headerMap = {};
      // headers.forEach((key) => {
      //   console.log(key);
      //   if (key == this.vendorBillingName) {
      //     headerMap[key] = "Legal Name";
      //   } else {
      //     headerMap[key] = key;
      //   }
      // });
      // console.log(headerMap, "headerMap");
      // // Step 3: Map records with renamed keys
      // const formattedRecords = this.UploadList.valid.map((record) => {
      //   const newRecord = {};
      //   for (const key in record) {
      //     newRecord[headerMap[key]] = record[key];
      //   }
      //   return newRecord;
      // });

      // // Step 4: Export as Excel
      // const worksheet = XLSX.utils.json_to_sheet(formattedRecords);
      // const workbook = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

      // const excelBuffer = XLSX.write(workbook, {
      //   bookType: "xlsx",
      //   type: "array",
      // });

      // const data = new Blob([excelBuffer], {
      //   type: "application/octet-stream",
      // });
      // saveAs(data, "records.xlsx");
    },
    formatDate(serialNumber) {
      const baseDate = new Date(Date.UTC(1900, 0, 1));
      const date = new Date(
        baseDate.getTime() + serialNumber * 24 * 60 * 60 * 1000
      );

      // Subtract 2 days
      date.setDate(date.getDate() - 2);

      const day = date.getDate().toString().padStart(2, "0"); // Ensure two-digit day
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensure two-digit month
      const year = date.getFullYear();

      return `${year}-${month}-${day}`;
    },

    construct_valid_invalid() {
      if (
        this.workingSince != "" ||
        this.workingSince != null ||
        this.workingSince != undefined
      ) {
        this.dataTable.forEach((item) => {
          item[this.workingSince] = this.formatDate(item[this.workingSince]);
        });
      }
      const allHeaders = [
        {
          title: "Billing Name",
          key: "customerlegalname",
          value: this.vendorBillingName,
        },
        {
          title: "Working Since",
          key: "workingSince",
          value: this.workingSince,
        },
        {
          title: "Firm Type",
          key: "firmType",
          value: this.firmType,
        },
        { title: "Address 1(Billing)", key: "address1", value: this.address1 },
        {
          title: "Address 2 (Mailling) ",
          key: "address2",
          value: this.address2,
        },
        {
          title: "Primary Name",
          key: "primaryName",
          value: this.primaryName,
        },
        {
          title: "Primary Email ID",
          key: "primaryEmail",
          value: this.primaryEmail,
        },
        {
          title: "Primary Country Code",
          key: "primaryCode",
          value: this.primaryCode,
        },
        {
          title: "Primary Contact Number",
          key: "primaryNumber",
          value: this.primaryNumber,
        },
        {
          title: "Secondary Name",
          key: "secondaryName",
          value: this.secondaryName,
        },
        {
          title: "Secondary Country Code",
          key: "secondaryCode",
          value: this.secondaryCode,
        },
        {
          title: "Secondary Contact Number",
          key: "secondaryNumber",
          value: this.secondaryNumber,
        },
        {
          title: "Secondary Email ID",
          key: "secondaryEmail",
          value: this.secondaryEmail,
        },
        {
          title: "Beneficiary Account Name",
          key: "beneficiaryName",
          value: this.beneficiaryName,
        },
        { title: "Bank Name", key: "branchName", value: this.branchName },
        {
          title: "Account Number",
          key: "accountNumber",
          value: this.accountNumber,
        },
        {
          title: "Account Type",
          key: "accountType",
          value: this.accountType,
        },

        { title: "IFSC Code", key: "ifscCode", value: this.ifscCode },

        { title: "CIN Number", key: "cinNo", value: this.cinNo },
        { title: "GST Id", key: "gstId", value: this.gstId },
        { title: "GST State Code", key: "gstCode", value: this.gstCode },
        { title: "PAN Id", key: "panID", value: this.panID },
      ];
      this.validHeaders = allHeaders
        .filter((header) => header.value && header.value.trim() !== "")
        .map((header) => ({ title: header.title, value: header.value }));

      this.InvalidHeaders = [
        ...this.validHeaders,
        // { text: "Actions", value: "actions" },
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
      this.validInputData.forEach((element, idx) => {
        var valid = true;

        if (element[this.vendorBillingName] == undefined) {
          valid = false;
        }

        if (element[this.primaryEmail] == undefined) {
          valid = false;
        }
        if (element[this.primaryEmail] !== undefined) {
          const emailPattern =
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

          if (!emailPattern.test(element[this.primaryEmail])) {
            
            valid = false;
          }
        }
      
        if (
          element[this.secondaryEmail] !== undefined &&
          element[this.secondaryEmail] !== "NaN-NaN-NaN"
        ) {
          const emailPattern =
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

          if (!emailPattern.test(element[this.secondaryEmail])) {
           
            valid = false;
          }
        }

        if (element[this.primaryNumber] != undefined) {
          if (element[this.primaryCode] == undefined) {
          
            valid = false;
          }
          let contactNumber = String(element[this.primaryNumber]).trim();

          const isValidNumber = /^\d+$/.test(contactNumber);

          if (
            !isValidNumber ||
            contactNumber.length < 8 ||
            contactNumber.length > 14
          ) {
            valid = false;
          }
        }

        if (element[this.primaryCode] != undefined) {
          if (element[this.primaryNumber] == undefined) {
           
            valid = false;
          }
          let contactcode = String(element[this.primaryCode]).trim();

          contactcode = contactcode.replace("+", "");
          const exists = this.countryitems.some(
            (country) => country.code === contactcode
          );

          if (exists == false) {
          
            element[this.primaryCode] = "";
            valid = false;
          } else {
            element[this.primaryCode] = String(
              element[this.primaryCode]
            ).trim();
          }
        }
        if (
          element[this.secondaryNumber] != undefined &&
          element[this.secondaryNumber] !== "NaN-NaN-NaN"
        ) {
          if (element[this.secondaryCode] == undefined) {
          
            valid = false;
          }
          let contactNumber = String(element[this.secondaryNumber]).trim();

          const isValidNumber = /^\d+$/.test(contactNumber);

          if (
            !isValidNumber ||
            contactNumber.length < 8 ||
            contactNumber.length > 14
          ) {
            valid = false;
          }
        }

        if (
          element[this.secondaryCode] != undefined &&
          element[this.secondaryCode] !== "NaN-NaN-NaN"
        ) {
          if (element[this.secondaryNumber] == undefined) {
          
            valid = false;
          }
          let contactcode = String(element[this.secondaryCode]).trim();

          contactcode = contactcode.replace("+", "");
          const exists = this.countryitems.some(
            (country) => country.code === contactcode
          );

          if (exists == false) {
           
            element[this.secondaryCode] = "";
            valid = false;
          } else {
            element[this.secondaryCode] = String(
              element[this.secondaryCode]
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
      this.$store.commit("Setvendorbulkback", true);
      this.$router.push("/home/AdministrationPannel");
    },
  },
};
</script>

<style>
</style>