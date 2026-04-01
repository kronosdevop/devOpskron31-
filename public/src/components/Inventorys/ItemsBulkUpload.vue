<template>
  <div>
    <v-card flat>
      <v-toolbar density="compact" flat>
        <v-toolbar-title> Upload Items </v-toolbar-title>
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
              label="Item Name*"
              v-model="itemName"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Item Type"
              v-model="itemType"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              variant="outlined"
              label="Item Code"
              v-model="itemCode"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              variant="outlined"
              label="Item HSN"
              v-model="itemHsn"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              variant="outlined"
              label="Category Name*"
              v-model="castegoryName"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              variant="outlined"
              label="Sub Category Name"
              v-model="subCatName"
              :items="headerList"
              density="compact"
            />
            <v-autocomplete
              variant="outlined"
              label="Item Unit"
              v-model="itemUnit"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Tracking Type"
              v-model="trackingType"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Purchase Price"
              v-model="purchasePrice"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Sale Price"
              v-model="salePrice"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Wholesale Price"
              v-model="wholesalePrice"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Stock Quantity"
              v-model="stockQuantity"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Stock Value"
              v-model="stockValue"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Minimum Stock"
              v-model="minimumStock"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Discount Price"
              v-model="discountPrice"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Item Tax"
              v-model="itemTax"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Item Description"
              v-model="itemDescription"
              :items="headerList"
              density="compact"
              clearable
            />
            <v-autocomplete
              variant="outlined"
              label="Item Location*"
              v-model="itemLocation"
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
import { bulk_upload_items } from "@/graphql/mutations.js";
import { API, graphqlOperation, Auth } from "aws-amplify";
import * as XLSX from "xlsx";
import SnackBar from "@/components/SnackBar.vue";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

export default {
  components: { SnackBar },

  data() {
    return {
      itemName: "",
      itemType: "",
      itemCode: "",
      itemHsn: "",
      castegoryName: "",
      subCatName: "",
      itemUnit: "",
      trackingType: "",
      purchasePrice: "",
      salePrice: "",
      wholesalePrice: "",
      stockQuantity: "",
      stockValue: "",
      minimumStock: "",
      discountPrice: "",
      itemTax: "",
      itemDescription: "",
      itemLocation: "",

      headerList: [],
      validHeaders: [],
      InvalidHeaders: [],
      validInputData: [],
      UploadList: { valid: [], invalid: [] },
      dataTable: [],
      validInvalidTabs: 0,
      isLoadingUpload: false,
      selectedFile: null,
      SnackBarComponent: {},
    };
  },

  mounted() {
    this.dataTable = this.$store.getters.GetcustomerDetails.excelTableData;
    this.headerList = this.$store.getters.GetcustomerDetails.excelHeaders;
  },

  computed: {
  isPreviewButtonEnabled() {
    return (
      this.itemName &&
      this.itemName.trim() !== "" &&
      this.castegoryName &&
      this.castegoryName.trim() !== "" &&
      this.itemLocation &&
      this.itemLocation.trim() !== ""
    );
  },
},

  methods: {

    /* ================= PREVIEW ================= */

    construct_valid_invalid() {
      const allHeaders = [
        { title: "Item Name", key: this.itemName },
        { title: "Item Type", key: this.itemType },
        { title: "Item Code", key: this.itemCode },
        { title: "Item HSN", key: this.itemHsn },
        { title: "Category Name", key: this.castegoryName },
        { title: "Sub Category", key: this.subCatName },
        { title: "Unit", key: this.itemUnit },
        { title: "Tracking Type", key: this.trackingType },
        { title: "Purchase Price", key: this.purchasePrice },
        { title: "Sale Price", key: this.salePrice },
        { title: "Wholesale Price", key: this.wholesalePrice },
        { title: "Stock Quantity", key: this.stockQuantity },
        { title: "Stock Value", key: this.stockValue },
        { title: "Minimum Stock", key: this.minimumStock },
        { title: "Discount Price", key: this.discountPrice },
        { title: "Tax", key: this.itemTax },
        { title: "Description", key: this.itemDescription },
        { title: "Item Location", key: this.itemLocation },
      ];

      this.validHeaders = allHeaders
        .filter(h => h.key && h.key.trim() !== "")
        .map(h => ({ title: h.title, key: h.key }));

      this.InvalidHeaders = [...this.validHeaders];

      this.validInputData = this.dataTable;

      this.validate_mandatory_data();
    },

    /* ================= VALIDATION ================= */

    validate_mandatory_data() {
      this.UploadList = { valid: [], invalid: [] };

      this.validInputData.forEach(row => {
        let valid = true;

        const name = row[this.itemName];
        const category = row[this.castegoryName];
        const location = row[this.itemLocation];

        if (!name || String(name).trim() === "") valid = false;
        if (!category || String(category).trim() === "") valid = false;
        if (!location || String(location).trim() === "") valid = false;

        if (valid) {
          this.UploadList.valid.push(row);
        } else {
          this.UploadList.invalid.push(row);
        }
      });
    },

    /* ================= SAVE ================= */

    validate_data() {
      const worksheet = XLSX.utils.json_to_sheet(this.UploadList.valid);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], { type: "text/xlsx" });
      this.selectedFile = new File([blob], "records.xlsx");

      this.upload_new_func();
    },

    async upload_new_func() {
      await Auth.currentCredentials();
      const org = this.$store.getters.GetOrgDetails.organization.organization_id;

      const key = `Inventory-bulk-upload/${org}/${Date.now()}-${this.selectedFile.name}`;

      const s3 = { bucket_name: "stichh-medias", region: "us-east-1" };
      const fileUrl = await uploadToS3(this.selectedFile, s3, key);

      if (fileUrl) this.saveData(key);
    },

    async saveData(fileUrl) {
      this.isLoadingUpload = true;

      const headers = {
        item_name: this.itemName,
        item_type: this.itemType,
        item_code: this.itemCode,
        item_hsn: this.itemHsn,
        category_name: this.castegoryName,
        sub_category_name: this.subCatName,
        item_unit: this.itemUnit,
        tracking_type: this.trackingType,
        purchase_price: this.purchasePrice,
        sale_price: this.salePrice,
        whole_sale_price: this.wholesalePrice,
        stock_quantity: this.stockQuantity,
        stock_value: this.stockValue,
        minimum_stock: this.minimumStock,
        discount_price: this.discountPrice,
        item_tax: this.itemTax,
        item_description: this.itemDescription,
        item_location: this.itemLocation,
      };

      try {
        const res = await API.graphql(
          graphqlOperation(bulk_upload_items, {
            input: { fileKey: fileUrl, headers: JSON.stringify(headers) }
          })
        );

        const response = JSON.parse(res.data.bulk_upload_items);

        this.isLoadingUpload = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: response.Status === "SUCCESS" ? "green" : "red",
          SnackbarText: response.Message,
          timeout: 5000,
          Top: true,
        };

        if (response.Status === "SUCCESS") {
          setTimeout(() => this.$router.push("/home/Inventory"), 1500);
        }

      } catch (err) {
        this.isLoadingUpload = false;
      }
    },

    cancelAction() {
      this.$router.push("/home/Inventory");
    }
  }
};
</script>

<style>
</style>