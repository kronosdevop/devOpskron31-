<template>
  <div>
    <v-dialog
      :model-value="uploadAssetDialog"
      @update:model-value="uploadAssetDialog = $event"
      persistent
      max-width="1400"
      transition="dialog-top-transition"
      style="z-index: 1000"
    >
      <v-card>
        <v-toolbar density="compact" flat>
          <v-toolbar-title>Upload Asset</v-toolbar-title>
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
                label="Category Name*"
                v-model="categoriesName"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Sub Category Name"
                v-model="categoriessubName"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Supplier Name"
                v-model="assetsupplier"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Location Type*"
                v-model="assetLocationType"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Location*"
                v-model="assetLocation"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                :label="`Asset Value (${organization_currency})*`"
                v-model="assetvalue"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Purchased Date*"
                v-model="purchasedate"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Product Serial No"
                v-model="productnumber"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Description"
                v-model="assertdescriprtion"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Warranty Expiry Date"
                v-model="warrentydate"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Insurance Expiry Date"
                v-model="insurancedate"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Mortgaged Amount"
                v-model="mortageAmount"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Type"
                v-model="assetType"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Condition"
                v-model="assetCondition"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Brand Name"
                v-model="assetBrandName"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Product No"
                v-model="productNo"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Invoice No"
                v-model="invoiceNo"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Installation Date"
                v-model="installationdate"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Date of Supply"
                v-model="supplydate"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Shipment Status"
                v-model="assetShipmentStatus"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Handler Type*"
                v-model="assetManagedType"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset Assigned To*"
                v-model="assetassigned"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Asset External Handler Type"
                v-model="externalType"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Cost Deposited"
                v-model="costDepositedcheck"
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
                label="Distributor Email ID"
                v-model="distributorEmailId"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Territory Name"
                v-model="territoryName"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Distributor Name"
                v-model="distributorName"
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
              <v-autocomplete
                variant="outlined"
                label="Distributor Country Code"
                v-model="distributorCountryCode"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Distributor Contact Number"
                v-model="distributorContactNumber"
                :items="headerList"
                density="compact"
                clearable
              />
              <v-autocomplete
                variant="outlined"
                label="Distributor Contact Name"
                v-model="distributorContactName"
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
        </v-card-text>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import * as XLSX from "xlsx";
import SnackBar from "@/components/SnackBar.vue";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { Auth } from "aws-amplify";

export default {
  components: {
    SnackBar,
  },
  props: {
    uploadAssetDialog: Boolean,
    excelTableData: Array,
    excelHeaders: Array,
  },
  data() {
    return {
      organization_currency: "",
      categoriesName: "",
      categoriessubName: "",
      assetsupplier: "",
      assetLocationType: "",
      assetLocation: "",
      assetvalue: "",
      purchasedate: "",
      productnumber: "",
      assertdescriprtion: "",
      warrentydate: "",
      insurancedate: "",
      mortageAmount: "",
      assetType: "",
      assetCondition: "",
      assetBrandName: "",
      productNo: "",
      invoiceNo: "",
      installationdate: "",
      supplydate: "",
      assetShipmentStatus: "",
      assetManagedType: "",
      assetassigned: "",
      externalType: "",
      costDepositedcheck: "",
      distributorCode: "",
      distributorEmailId: "",
      territoryName: "",
      distributorName: "",
      businessType: "",
      distributorCountryCode: "",
      distributorContactNumber: "",
      distributorContactName: "",
      headerList: [],
      validHeaders: [],
      InvalidHeaders: [],
      validInputData: [],
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
      return (
        this.categoriesName !== "" &&
        this.assetvalue !== "" &&
        this.purchasedate !== "" &&
        this.assetLocationType !== "" &&
        this.assetManagedType !== "" &&
        this.assetassigned !== ""
      );
    },
  },
  async mounted() {
    this.headerList = [];
    this.dataTable = [];
    this.dataTable = this.excelTableData || [];
    this.headerList = this.excelHeaders || [];
    this.organization_currency =
      this.$store.getters.GetUserObj.organization.organization_currency ==
      undefined
        ? ""
        : this.$store.getters.GetUserObj.organization.organization_currency;
  },
  methods: {
    async upload_new_func() {
      if (!this.selectedFile) return;
      await Auth.currentCredentials();
      const orgDetails1 = this.$store.getters.GetOrgDetails;

      const s3_details = {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      };

      const key = `assets-bulk-upload/${
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
        console.log("sending to s3s")
        const fileUrl = await uploadToS3(this.selectedFile, s3_details, key, metadata);
        console.log("fileUrl", fileUrl)
        if (fileUrl) {
          this.isLoadingUpload = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "File uploaded successfully",
            timeout: 5000,
            Top: true,
          };
          this.$emit("updaterefesh", "update");
          setTimeout(() => {
            this.$emit("clicked", false);
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
      // Create a Blob from the buffer
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a File for upload
      const file = new File([blob], "assets_upload.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      this.selectedFile = file;

      // Upload the file to S3
      this.isLoadingUpload = true;
      this.upload_new_func();
    },
    formatDate(serialNumber) {
      const baseDate = new Date(Date.UTC(1900, 0, 1));
      const date = new Date(
        baseDate.getTime() + serialNumber * 24 * 60 * 60 * 1000
      );
      date.setDate(date.getDate() - 2);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    },
    construct_valid_invalid() {
      // Format dates if needed
      if (this.purchasedate != "" && this.purchasedate != null) {
        this.dataTable.forEach((item) => {
          if (item[this.purchasedate]) {
            item[this.purchasedate] = this.formatDate(item[this.purchasedate]);
          }
        });
      }
      if (this.installationdate != "" && this.installationdate != null) {
        this.dataTable.forEach((item) => {
          if (item[this.installationdate]) {
            item[this.installationdate] = this.formatDate(item[this.installationdate]);
          }
        });
      }
      if (this.supplydate != "" && this.supplydate != null) {
        this.dataTable.forEach((item) => {
          if (item[this.supplydate]) {
            item[this.supplydate] = this.formatDate(item[this.supplydate]);
          }
        });
      }
      if (this.warrentydate != "" && this.warrentydate != null) {
        this.dataTable.forEach((item) => {
          if (item[this.warrentydate]) {
            item[this.warrentydate] = this.formatDate(item[this.warrentydate]);
          }
        });
      }
      if (this.insurancedate != "" && this.insurancedate != null) {
        this.dataTable.forEach((item) => {
          if (item[this.insurancedate]) {
            item[this.insurancedate] = this.formatDate(item[this.insurancedate]);
          }
        });
      }

      const allHeaders = [
        { title: "Category Name", key: this.categoriesName },
        { title: "Sub Category Name", key: this.categoriessubName },
        { title: "Supplier Name", key: this.assetsupplier },
        { title: "Asset Location Type", key: this.assetLocationType },
        { title: "Asset Location", key: this.assetLocation },
        { title: "Asset Value", key: this.assetvalue },
        { title: "Asset Purchased Date", key: this.purchasedate },
        { title: "Asset Product Serial No", key: this.productnumber },
        { title: "Asset Description", key: this.assertdescriprtion },
        { title: "Asset Warranty Expiry Date", key: this.warrentydate },
        { title: "Asset Insurance Expiry Date", key: this.insurancedate },
        { title: "Asset Mortgaged Amount", key: this.mortageAmount },
        { title: "Asset Type", key: this.assetType },
        { title: "Asset Condition", key: this.assetCondition },
        { title: "Asset Brand Name", key: this.assetBrandName },
        { title: "Asset Product No", key: this.productNo },
        { title: "Asset Invoice No", key: this.invoiceNo },
        { title: "Asset Installation Date", key: this.installationdate },
        { title: "Asset Date of Supply", key: this.supplydate },
        { title: "Asset Shipment Status", key: this.assetShipmentStatus },
        { title: "Asset Handler Type", key: this.assetManagedType },
        { title: "Asset Assigned To", key: this.assetassigned },
        { title: "Asset External Handler Type", key: this.externalType },
        { title: "Cost Deposited", key: this.costDepositedcheck },
        { title: "Distributor Code", key: this.distributorCode },
        { title: "Distributor Email ID", key: this.distributorEmailId },
        { title: "Territory Name", key: this.territoryName },
        { title: "Distributor Name", key: this.distributorName },
        { title: "Business Type", key: this.businessType },
        { title: "Distributor Country Code", key: this.distributorCountryCode },
        { title: "Distributor Contact Number", key: this.distributorContactNumber },
        { title: "Distributor Contact Name", key: this.distributorContactName },
      ];

      this.validHeaders = allHeaders
        .filter((header) => header.key && header.key.trim() !== "")
        .map((header) => ({ title: header.title, key: header.key }));

      this.InvalidHeaders = [...this.validHeaders];

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
        
        // Required fields validation
        if (element[this.categoriesName] == undefined || element[this.categoriesName] == "") {
          valid = false;
        }
        if (element[this.assetvalue] == undefined || element[this.assetvalue] == "") {
          valid = false;
        }
        if (element[this.purchasedate] == undefined || element[this.purchasedate] == "") {
          valid = false;
        }
        if (element[this.assetLocationType] == undefined || element[this.assetLocationType] == "") {
          valid = false;
        }
        if (element[this.assetManagedType] == undefined || element[this.assetManagedType] == "") {
          valid = false;
        }
        if (element[this.assetassigned] == undefined || element[this.assetassigned] == "") {
          valid = false;
        }
        
        // Location validation - Asset Location is required for both INTERNAL and EXTERNAL
        if (element[this.assetLocation] == undefined || element[this.assetLocation] == "") {
          valid = false;
        }

        if (valid) {
          this.UploadList.valid.push(element);
        } else {
          this.UploadList.invalid.push(element);
        }
      });
    },
    cancelAction() {
      this.$emit("clicked", false);
    },
  },
};
</script>

<style>
</style>

