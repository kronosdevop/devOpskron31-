<template>
  <div>
    <v-card flat >
      <v-toolbar density="compact"  flat>
        <v-toolbar-title>
          Upload
          {{
            $store.getters.GetcustomerDetails.customerType == "BUSINESS"
              ? "Business"
              : "Individual"
          }}
          Customer
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
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Legal Name*"
              v-model="customerName"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Brand Name"
              v-model="customerBrand"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Industry/Sector"
              v-model="industrySector"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Company size"
              v-model="companySize"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Website"
              v-model="website"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Preferred Language"
              v-model="preferredLanguage"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              variant="outlined"
              label="Address 1 *"
              v-model="address1"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="City 1"
              v-model="city1"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Zipcode 1"
              v-model="zipcode1"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Country 1"
              v-model="country1"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="State 1"
              v-model="state1"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Address 2 "
              v-model="address2"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="City 2"
              v-model="city2"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Zipcode 2"
              v-model="zipcode2"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Country 2"
              v-model="country2"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="State 2"
              v-model="state2"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="GST Number"
              v-model="gstId"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="PAN Number"
              v-model="panID"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="CIN Number"
              v-model="cinNo"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Tax Excemption Code"
              v-model="taxExcemptioncode"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              :label="$store.getters.GetcustomerDetails.customerType == 'BUSINESS' ? 'Primary Name*' : 'Full Name*'"
              v-model="primaryName"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              :label="$store.getters.GetcustomerDetails.customerType == 'BUSINESS' ? 'Primary Email ID*' : 'Email ID*'"
              v-model="primaryEmail"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              :label="$store.getters.GetcustomerDetails.customerType == 'BUSINESS' ? 'Primary Country Code*' : 'Country Code*'"
              v-model="primaryCode"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              :label="$store.getters.GetcustomerDetails.customerType == 'BUSINESS' ? 'Primary Contact Number*' : 'Contact Number*'"
              v-model="primaryNumber"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Primary Designation*"
              v-model="primaryDesignation"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Secondary Name"
              v-model="secondaryName"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              :label="$store.getters.GetcustomerDetails.customerType == 'BUSINESS' ? 'Secondary Email ID' : 'Alternate Email ID'"
              v-model="secondaryEmail"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              :label="$store.getters.GetcustomerDetails.customerType == 'BUSINESS' ? 'Secondary Country Code' : 'Alternate Country Code'"
              v-model="secondaryCode"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              :label="$store.getters.GetcustomerDetails.customerType == 'BUSINESS' ? 'Secondary Contact Number' : 'Alternate Contact Number'"
              v-model="secondaryNumber"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Secondary Designation"
              v-model="secondaryDesignation"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Payment SLA"
              v-model="paymentSla"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Currency"
              v-model="currency"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType == 'BUSINESS'"
              variant="outlined"
              label="Sales Rep/Account Manager"
              v-model="salesManager"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Cutomer Status"
              v-model="customerStatus"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Working with us Since"
              v-model="wrkingSince"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType != 'BUSINESS'"
              variant="outlined"
              label="Preferred Language"
              v-model="preferredLanguage"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              v-if="$store.getters.GetcustomerDetails.customerType != 'BUSINESS'"
              variant="outlined"
              label="Date of Birth"
              v-model="dateOfbirth"
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
import { bulk_upload_customers } from "@/graphql/mutations.js";
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
      customerName: "",
      industrySector: "",
      secondaryNumber: "",
      secondaryDesignation: "",
      preferredLanguage: "",
      companySize: "",
      website: "",
      city1: "",
      city2: "",
      country2: "",
      zipcode2: "",
      zipcode1: "",
      state1: "",
      state2: "",
      country1: "",
      primaryNumber: "",
      salesManager: "",
      wrkingSince: "",
      currency: "",
      customerStatus: "",
      paymentSla: "",
      secondaryName: "",
      preferredLanguage: "",
      taxExcemptioncode: "",
      primaryCode: "",
      secondaryCode: "",
      dateOfbirth: "",
      secondaryEmail: "",
      primaryEmail: "",
      customersType: "",
      cinNo: "",
      panID: "",
      gstId: "",
      address2: "",
      address1: "",
      customerBrand: "",
      primaryName: "",
      primaryDesignation: "",
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
        this.customerName !== "" &&
        this.address1 !== "" &&
        this.primaryEmail !== "" &&
        this.primaryNumber !== "" &&
        this.primaryCode !== "" &&
        this.primaryName !== "" &&
        this.primaryDesignation !== "";
      const isNameEmailFilled =
        this.address1 !== "" &&
        this.primaryEmail !== "" &&
        this.primaryNumber !== "" &&
        this.primaryCode !== "" &&
        this.primaryName !== "";
      const isCountycodeAndContactNumberValid =
        (this.secondaryCode && this.secondaryNumber) ||
        (!this.secondaryCode && !this.secondaryNumber);
      if (this.$store.getters.GetcustomerDetails.customerType == "BUSINESS") {
        return isFirstNameEmailFilled && isCountycodeAndContactNumberValid;
      } else {
        return isNameEmailFilled && isCountycodeAndContactNumberValid;
      }
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
        legal_name: this.customerName ?? "",
        brand_name: this.customerBrand ?? "",
        industry_type: this.industrySector ?? "",
        company_size: this.companySize ?? "",
        website: this.website ?? "",
        preferred_language: this.preferredLanguage ?? "",
        city_1: this.city1 ?? "",
        address_line_1: this.address1 ?? "",
        zip_code_1: this.zipcode1 ?? "",
        country_1: this.country1 ?? "",
        state_1: this.state1 ?? "",
        address_line_2: this.address2 ?? "",
        city_2: this.city2 ?? "",
        zip_code_2: this.zipcode2 ?? "",
        country_2: this.country2 ?? "",
        state_2: this.state2 ?? "",
        gst_no: this.gstId ?? "",
        pan_no: this.panID ?? "",
        cin_no: this.cinNo ?? "",
        tax_exemption_code: this.taxExcemptioncode ?? "",
        primary_contact_name: this.primaryName ?? "",
        customer_email_id: this.primaryEmail ?? "",
        primary_country_code: this.primaryCode ?? "",
        primary_contact_no: this.primaryNumber ?? "",
        primary_designation: this.primaryDesignation ?? "",
        secondary_contact_name: this.secondaryName ?? "",
        secondary_email_id: this.secondaryEmail ?? "",
        secondary_country_code: this.secondaryCode ?? "",
        secondary_contact_no: this.secondaryNumber ?? "",
        secondary_designation: this.secondaryDesignation ?? "",
        payment_sla: this.paymentSla ?? "",
        currency: this.currency ?? "",
        account_manager: this.salesManager ?? "",
        customer_live_status: this.customerStatus ?? "",
        customer_since: this.wrkingSince ?? "",
        date_of_birth: this.dateOfbirth ?? "",
      };
      try {
        let result = await API.graphql(
          graphqlOperation(bulk_upload_customers, {
            input: {
              file_key: fileUrl,
              headers: JSON.stringify(headers),
              customer_type:
                this.$store.getters.GetcustomerDetails.customerType,
            },
          })
        );
        let response = JSON.parse(result.data.bulk_upload_customers);
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
            this.$router.push("/home/CustommerSub");
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

      const key = `customer-bulk-upload/${
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
      // console.log(this.customerName, "this.customerName");
      // // Step 2: Create a header mapping
      // const headerMap = {};
      // headers.forEach((key) => {
      //   console.log(key);
      //   if (key == this.customerName) {
      //     headerMap[key] = "Legal Name of Business";
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
        this.wrkingSince != "" ||
        this.wrkingSince != null ||
        this.wrkingSince != undefined
      ) {
        this.dataTable.forEach((item) => {
          item[this.wrkingSince] = this.formatDate(item[this.wrkingSince]);
        });
      }
      if (
        this.dateOfbirth != "" ||
        this.dateOfbirth != null ||
        this.dateOfbirth != undefined
      ) {
        this.dataTable.forEach((item) => {
          item[this.dateOfbirth] = this.formatDate(item[this.dateOfbirth]);
        });
      }

      const allHeaders =
        this.$store.getters.GetcustomerDetails.customerType == "BUSINESS"
          ? [
              {
                title: "Legal Name",

                key: this.customerName,
              },
              {
                title: "Brand Name",

                key: this.customerBrand,
              },
              {
                title: "Industry/Sector",

                key: this.industrySector,
              },
              {
                title: "Company size",

                key: this.companySize,
              },
              {
                title: "Website",

                key: this.website,
              },
              {
                title: "Preferred Language",

                key: this.preferredLanguage,
              },

              { title: "Address 1", key: this.address1 },
              { title: "City 1", key: this.city1 },
              { title: "Zipcode 1", key: this.zipcode1 },
              { title: "Country 1", key: this.country1 },
              { title: "State 1", key: this.state1 },
              { title: "Address 2", key: this.address2 },
              { title: "City 2", key: this.city2 },
              { title: "Zipcode 2", key: this.zipcode2 },
              { title: "Country 2", key: this.country2 },
              { title: "State 2", key: this.state2 },
              { title: "GST Number", key: this.gstId },
              { title: "PAN Number", key: this.panID },
              { title: "CIN Number", key: this.cinNo },
              {
                title: "Tax Excemption Code",

                key: this.taxExcemptioncode,
              },
              {
                title: "Primary Name",

                key: this.primaryName,
              },
              {
                title: "Primary Email ID",

                key: this.primaryEmail,
              },
              {
                title: "Primary Country Code",

                key: this.primaryCode,
              },
              {
                title: "Primary Contact Number",

                key: this.primaryNumber,
              },
              {
                title: "Primary Designation",

                key: this.primaryDesignation,
              },
              {
                title: "Secondary Name",

                key: this.secondaryName,
              },
              {
                title: "Secondary Email ID",

                key: this.secondaryEmail,
              },
              {
                title: "Secondary Country Code",

                key: this.secondaryCode,
              },
              {
                title: "Secondary Contact Number",

                key: this.secondaryNumber,
              },
              {
                title: "Secondary Designation",

                key: this.secondaryDesignation,
              },

              {
                title: "Payment SLA",

                key: this.paymentSla,
              },
              {
                title: "Currency",

                key: this.currency,
              },
              {
                title: "Sales Rep/Account Manager",

                key: this.salesManager,
              },
              {
                title: "Cutomer Status",

                key: this.customerStatus,
              },
              {
                title: "Working with us Since",

                key: this.wrkingSince,
              },
            ]
          : [
              { title: "Address 1", key: this.address1 },
              { title: "City 1", key: this.city1 },
              { title: "Zipcode 1", key: this.zipcode1 },
              { title: "Country 1", key: this.country1 },
              { title: "State 1", key: this.state1 },
              { title: "Address 2", key: this.address2 },
              { title: "City 2", key: this.city2 },
              { title: "Zipcode 2", key: this.zipcode2 },
              { title: "Country 2", key: this.country2 },
              { title: "State 2", key: this.state2 },
              { title: "PAN Id", key: this.panID },

              {
                title: "Full Name",

                key: this.primaryName,
              },
              {
                title: "Email ID",

                key: this.primaryEmail,
              },
              {
                title: "Country Code",

                key: this.primaryCode,
              },
              {
                title: "Contact Number",

                key: this.primaryNumber,
              },
              {
                title: "Alternate Country Code",

                key: this.secondaryCode,
              },
              {
                title: "Alternate Contact Number",

                key: this.secondaryNumber,
              },
              {
                title: "Payment SLA",

                key: this.paymentSla,
              },
              {
                title: "Currency",

                key: this.currency,
              },
              {
                title: "Cutomer Status",

                key: this.customerStatus,
              },
              {
                title: "Working with us Since",

                key: this.wrkingSince,
              },
              {
                title: "Preferred Language",

                key: this.preferredLanguage,
              },
              {
                title: "Date of Birth",

                key: this.dateOfbirth,
              },
            ];

      this.validHeaders = allHeaders
        .filter((header) => header.key && header.key.trim() !== "")
        .map((header) => ({ title: header.title, key: header.key }));

      this.InvalidHeaders = [
        ...this.validHeaders,
        // { text: "Actions", value: "actions" },
      ];

      this.validInputData = this.dataTable;
      // console.log(this.validInputData, "this.validInputData");
      this.validate_mandatory_data();
    },

    //  validate_mandatory_data() {
    //   var self = this;
    //   self.UploadList = {
    //     valid: [],
    //     invalid: [],
    //   };
    //   this.validInputData.forEach((element) => {
    //     var valid = true;
    //     if (this.$store.getters.GetcustomerDetails.customerType == "BUSINESS") {
    //       if (element[this.customerName] == undefined) {
    //         valid = false;
    //       }
    //     }

    //     if (element[this.primaryEmail] == undefined) {
    //       valid = false;
    //     }
    //     if (element[this.primaryEmail] !== undefined) {
    //       const emailPattern =
    //         /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    //       if (!emailPattern.test(element[this.primaryEmail])) {
    //         valid = false;
    //       }
    //     }
    //     if (element[this.secondaryEmail] !== undefined) {
    //       const emailPattern =
    //         /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    //       if (!emailPattern.test(element[this.secondaryEmail])) {
    //         valid = false;
    //       }
    //     }

    //     if (element[this.primaryNumber] != undefined) {
    //       if (element[this.primaryCode] == undefined) {
    //         valid = false;
    //       }
    //       let contactNumber = String(element[this.primaryNumber]).trim();

    //       const isValidNumber = /^\d+$/.test(contactNumber);

    //       if (
    //         !isValidNumber ||
    //         contactNumber.length < 8 ||
    //         contactNumber.length > 14
    //       ) {
    //         valid = false;
    //       }
    //     }

    //     if (element[this.primaryCode] != undefined) {
    //       if (element[this.primaryNumber] == undefined) {
    //         valid = false;
    //       }
    //       let contactcode = String(element[this.primaryCode]).trim();

    //       contactcode = contactcode.replace("+", "");
    //       const exists = this.countryitems.some(
    //         (country) => country.code === contactcode
    //       );

    //       if (exists == false) {
    //         element[this.primaryCode] = "";
    //         valid = false;
    //       } else {
    //         element[this.primaryCode] = String(
    //           element[this.primaryCode]
    //         ).trim();
    //       }
    //     }
    //     if (element[this.secondaryNumber] != undefined) {
    //       if (element[this.secondaryCode] == undefined) {
    //         valid = false;
    //       }
    //       let contactNumber = String(element[this.secondaryNumber]).trim();

    //       const isValidNumber = /^\d+$/.test(contactNumber);

    //       if (
    //         !isValidNumber ||
    //         contactNumber.length < 8 ||
    //         contactNumber.length > 14
    //       ) {
    //         valid = false;
    //       }
    //     }

    //     if (element[this.secondaryCode] != undefined) {
    //       if (element[this.secondaryNumber] == undefined) {
    //         valid = false;
    //       }
    //       let contactcode = String(element[this.secondaryCode]).trim();

    //       contactcode = contactcode.replace("+", "");
    //       const exists = this.countryitems.some(
    //         (country) => country.code === contactcode
    //       );

    //       if (exists == false) {
    //         element[this.secondaryCode] = "";
    //         valid = false;
    //       } else {
    //         element[this.secondaryCode] = String(
    //           element[this.secondaryCode]
    //         ).trim();
    //       }
    //     }
    //     if (valid) {
    //       this.UploadList.valid.push(element);
    //     } else {
    //       this.UploadList.invalid.push(element);
    //     }
    //   });
    // },
   validate_mandatory_data() {
  this.UploadList = {
    valid: [],
    invalid: [],
  };

  const isBusiness =
    this.$store.getters.GetcustomerDetails.customerType === "BUSINESS";

  this.validInputData.forEach((element) => {
    let valid = true;

    const getValue = (key) => {
      if (!key) return "";
      return element[key] !== undefined && element[key] !== null
        ? String(element[key]).trim()
        : "";
    };

    const legalName = getValue(this.customerName);
    const primaryEmail = getValue(this.primaryEmail);
    const secondaryEmail = getValue(this.secondaryEmail);
    const primaryNumber = getValue(this.primaryNumber);
    const primaryCode = getValue(this.primaryCode);
    const secondaryNumber = getValue(this.secondaryNumber);
    const secondaryCode = getValue(this.secondaryCode);
    const primaryName = getValue(this.primaryName);
    const primaryDesignation = getValue(this.primaryDesignation);
    const address1 = getValue(this.address1);

    // ✅ BUSINESS Required Field
    if (isBusiness && legalName === "") {
      valid = false;
    }

    // ✅ Required Common Fields
    if (
      primaryEmail === "" ||
      primaryNumber === "" ||
      primaryCode === "" ||
      primaryName === "" ||
      address1 === ""
    ) {
      valid = false;
    }

    if (isBusiness && primaryDesignation === "") {
      valid = false;
    }

    // ✅ Email Validation (Improved Regex)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (primaryEmail && !emailPattern.test(primaryEmail)) {
      valid = false;
    }

    if (secondaryEmail && !emailPattern.test(secondaryEmail)) {
      valid = false;
    }

    // ✅ Primary Number Validation
    if (primaryNumber) {
      const cleanNumber = primaryNumber.replace(/\D/g, "");
      if (cleanNumber.length < 8 || cleanNumber.length > 14) {
        valid = false;
      }
    }

    // ✅ Secondary Number Validation
    if (secondaryNumber) {
      const cleanNumber = secondaryNumber.replace(/\D/g, "");
      if (cleanNumber.length < 8 || cleanNumber.length > 14) {
        valid = false;
      }
    }

    // ✅ Primary Country Code Validation
    if (primaryCode) {
      let cleanCode = primaryCode
        .replace("+", "")
        .replace(".0", "")
        .trim();

      const exists = this.countryitems.some(
        (country) => country.code === cleanCode
      );

      if (!exists) {
        valid = false;
      } else {
        element[this.primaryCode] = cleanCode;
      }
    }

    // ✅ Secondary Country Code Validation
    if (secondaryCode) {
      let cleanCode = secondaryCode
        .replace("+", "")
        .replace(".0", "")
        .trim();

      const exists = this.countryitems.some(
        (country) => country.code === cleanCode
      );

      if (!exists) {
        valid = false;
      } else {
        element[this.secondaryCode] = cleanCode;
      }
    }

    // ✅ Push to respective list
    if (valid) {
      this.UploadList.valid.push(element);
    } else {
      this.UploadList.invalid.push(element);
    }
  });
},
    cancelAction() {
      this.$router.push("/home/CustommerSub");
    },
  },
};
</script>

<style>
</style>