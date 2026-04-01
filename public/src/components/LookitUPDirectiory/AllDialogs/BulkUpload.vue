<template>
  <div>
    <v-card flat >
      <v-toolbar density="compact"  flat>
        <v-toolbar-title>Upload </v-toolbar-title>
        <v-spacer />
        <!-- <v-btn small dark color="green" class="text-capitalize" @click="Validate_Data">Save</v-btn> -->
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
            <v-form ref="form" @submit.prevent>
              <v-autocomplete
                v-for="(item, index) in formtemplate"
                :key="index"
                variant="outlined"
                :label="item.display_label"
                v-model="selectedItems[index]"
                :items="headerList"
                density="compact"
                clearable
                :rules="getValidationRules(item)"
              />

              <v-btn
                v-if="formtemplate.length != 0"
                @click="construct_valid_invalid()"
                class="cardCss white--text mt-2"
                color="primary"
                size="small"
              >
                Preview
              </v-btn>
            </v-form>
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
                    <template #no-data>
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
import { IMPORT_EXCEL_TO_DIRECTORY } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import * as XLSX from "xlsx";
import SnackBar from "@/components/SnackBar.vue";
import { saveAs } from "file-saver";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { Auth } from "aws-amplify";

export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      formtemplate: [],
      formInfo: {},
      selectedItems: [],
      coloumMapping: {},
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
  computed: {},
  async mounted() {
    this.headerList = [];
    this.dataTable = [];
    // Convert Vue 3 reactive Proxy objects to plain arrays
    this.dataTable = [...this.$store.getters.GetcustomerDetails.excelTableData];
    this.headerList = [...this.$store.getters.GetcustomerDetails.excelHeaders];
    // console.log(this.headerList, "headerList");
    this.formInfo = this.$store.getters.GetFormObject;

    this.formtemplate = this.formInfo.directory_template;
    this.formtemplate = this.formtemplate.filter((obj) => {
      if (obj.data_type === "single_choice") {
        return obj.input_value === null;
      }
      // Keep everything else except the excluded types
      return (
        obj.data_type !== "checkbox" &&
        obj.data_type !== "time" &&
        obj.data_type !== "boolean" &&
        obj.data_type !== "rating" &&
        obj.data_type !== "datetime" &&
        obj.data_type !== "gallery" &&
        obj.data_type !== "media" &&
        obj.data_type !== "multi_choice"
      );
    });

    // console.log(this.formtemplate);
  },
  methods: {
    getValidationRules(item) {
      // Define validation rules based on the mandatory property of the item
      if (item.is_required) {
        return [(v) => !!v || `Please select ${item.display_label}`];
      } else {
        return [];
      }
    },

    async saveData(fileUrl) {
      this.isLoadingUpload = true;

      try {
        let result = await API.graphql(
          graphqlOperation(IMPORT_EXCEL_TO_DIRECTORY, {
            input: {
              fileKey: fileUrl,
              sheetName: "Records",
              columnMappings: JSON.stringify(this.coloumMapping),
              bucketName: "stichh-medias",
              directory_id: this.formInfo.directory_id,
            },
          })
        );
        let response = JSON.parse(result.data.IMPORT_EXCEL_TO_DIRECTORY);
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
            this.$router.push("/home/DirectoryList");
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

      const key = `directory-bulk-upload/${
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
      //   this.isLoadingUpload = true;
      //   const worksheet = XLSX.utils.json_to_sheet(this.UploadList.valid);
      //   // Create a new workbook and append the worksheet
      //   const workbook = XLSX.utils.book_new();
      //   XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
      //   // Generate buffer
      //   const excelBuffer = XLSX.write(workbook, {
      //     bookType: "csv",
      //     type: "array",
      //   });
      //   // 3. Create a Blob from the buffer
      //   const blob = new Blob([excelBuffer], {
      //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      //   });

      //   // 4. Create a File (optional, if you want filename metadata)

      //   const file = new File([blob], "records.csv", {
      //     type: "text/csv",
      //   });
      //   this.selectedFile = file;

      //   this.isLoadingUpload = true;
      //   this.upload_new_func();
      // // Save as Excel file
      //   const data = new Blob([excelBuffer], {
      //     type: "application/octet-stream",
      //   });
      //   saveAs(data, "records.xlsx");

      //   To Change the excel headers

      //   const headers = Object.keys(this.UploadList.valid[0]);
      //   console.log(headers, "headers");

      //   //   // Step 2: Create a header mapping
      //   const headerMap = {};
      //   headers.forEach((key) => {
      //     // console.log(key);
      //     this.formtemplate.forEach((item, index) => {
      //         console.log(key,this.selectedItems[index])
      //       if (key == this.selectedItems[index]) {
      //         headerMap[key] = item.display_label;
      //       } else {
      //         headerMap[key] = key;
      //       }
      //     });
      //   });
      //   console.log(headerMap, "headerMap");
      const headers = Object.keys(this.UploadList.valid[0]);

      const headerMap = {};
      this.coloumMapping = {};
      headers.forEach((key) => {
        // Find index where selectedItems[index] === key
        const matchIndex = this.selectedItems.findIndex(
          (selected) => selected === key
        );

        if (matchIndex !== -1 && this.formtemplate[matchIndex]) {
          // console.log(this.formtemplate[matchIndex]);
          headerMap[key] =
            this.formtemplate[matchIndex].display_label.toLowerCase();
          this.coloumMapping[this.formtemplate[matchIndex].key] =
            this.formtemplate[matchIndex].display_label.toLowerCase();
        } else {
          headerMap[key] = key.toLowerCase(); // fallback to original key
        }
      });
      // console.log(this.coloumMapping, "coloumMapping");

      //   // Step 3: Map records with renamed keys
      const formattedRecords = this.UploadList.valid.map((record) => {
        const newRecord = {};
        for (const key in record) {
          newRecord[headerMap[key]] = record[key];
        }
        return newRecord;
      });

      //   // Step 4: Export as Excel
      const worksheet = XLSX.utils.json_to_sheet(formattedRecords);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const file = new File([blob], "records.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      this.selectedFile = file;

        this.upload_new_func();
      //   const data = new Blob([excelBuffer], {
      //     type: "application/octet-stream",
      //   });
      //   saveAs(data, "records.xlsx");
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
      if (this.$refs.form && this.$refs.form.validate()) {
        // Reset headers arrays
        this.validHeaders = [];
        this.InvalidHeaders = [];
        
        this.formtemplate.forEach((item, index) => {
          if (item.data_type == "date") {
            if (
              this.selectedItems[index] != "" ||
              this.selectedItems[index] != null ||
              this.selectedItems[index] != undefined
            ) {
              this.dataTable.forEach((item) => {
                item[this.selectedItems[index]] = this.formatDate(
                  item[this.selectedItems[index]]
                );
              });
            }
          }
        });

        this.formtemplate.forEach((item, index) => {
          const columnKey = this.selectedItems[index];
          this.validHeaders.push({
            title: item.display_label,
            key: columnKey,
          });
        });
        this.formtemplate.forEach((item, index) => {
          const columnKey = this.selectedItems[index];
          this.InvalidHeaders.push({
            title: item.display_label,
            key: columnKey,
          });
        });

        // console.log('Valid Headers:', this.validHeaders);  
        // console.log('Data Table Sample:', this.dataTable[0]);
        // console.log('Selected Items:', this.selectedItems);
        this.validInputData = this.dataTable;

        this.validate_mandatory_data();
      }
    },
    validate_mandatory_data() {
      var self = this;
      self.UploadList = {
        valid: [],
        invalid: [],
      };
      this.validInputData.forEach((element) => {
        var valid = true;
        this.formtemplate.forEach((item, index) => {
          if (item.is_required == true) {
            const selectedValues = this.selectedItems[index];
            if (element[selectedValues] == undefined) {
              valid = false;
            }
            if (item.data_type == "email") {
              const selectedValues = this.selectedItems[index];
              if (element[selectedValues] != undefined) {
                if (!/.+@.+\..+/.test(element[selectedValues])) {
                  valid = false;
                }
              }
            }
          } else {
            if (item.data_type == "email") {
              const selectedValues = this.selectedItems[index];
              if (this.selectedItems[index] != undefined) {
                if (!/.+@.+\..+/.test(element[selectedValues])) {
                  valid = false;
                }
              }
            }
          }
        });

        if (valid) {
          this.UploadList.valid.push(element);
        } else {
          this.UploadList.invalid.push(element);
        }
      });
    },
    cancelAction() {
      this.$router.push("/home/DirectoryList");
    },
  },
};
</script>

<style>
</style>