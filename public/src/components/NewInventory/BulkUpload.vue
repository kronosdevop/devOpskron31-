<template>
  <div>
    <v-card flat class="pa-3">

      <!-- HEADER -->
      <v-toolbar density="compact" color="transparent">
        <v-toolbar-title class="d-flex align-center">
          <v-icon color="primary" size="20" class="mr-2">
            mdi-cube-outline
          </v-icon>
          Upload Items
        </v-toolbar-title>

        <v-spacer />

        <v-btn
          v-if="headerList.length && validInputData.length"
          @click="validate_data"
          :loading="isLoadingUpload"
          size="small"
          color="primary"
        >
          Save
        </v-btn>

        <v-btn size="small" class="ml-2" @click="cancelAction">
          Cancel
        </v-btn>
      </v-toolbar>

      <v-divider class="mb-3" />

      <v-row>

        <!-- 🔹 LEFT SIDE (MAPPING UI) -->
    <v-col cols="3" class="left-panel">

  <v-card class="pa-2 section-card" flat>
    <div class="section-header">
      <v-icon size="18" color="primary">mdi-format-title</v-icon>
      <span>Product Name *</span>
    </div>
    <v-autocomplete
      v-model="productName"
      :items="headerList"
      density="compact"
      variant="outlined"
      class="input-field"
    />
  </v-card>

  <v-card class="pa-2 mt-3 section-card" flat>
    <div class="section-header">
      <v-icon size="18" color="primary">mdi-barcode</v-icon>
      <span>SKU</span>
    </div>
    <v-autocomplete v-model="productSKU" :items="headerList" density="compact" variant="outlined" class="input-field"/>
  </v-card>

  <v-card class="pa-2 mt-3 section-card" flat>
    <div class="section-header">
      <v-icon size="18" color="primary">mdi-currency-inr</v-icon>
      <span>Pricing *</span>
    </div>
    <v-autocomplete v-model="productPrice" :items="headerList" density="compact" variant="outlined" class="input-field"/>
  </v-card>

  <v-card class="pa-2 mt-3 section-card" flat>
    <div class="section-header">
      <v-icon size="18" color="primary">mdi-shape</v-icon>
      <span>Category *</span>
    </div>
    <v-autocomplete v-model="productCategory" :items="headerList" density="compact" variant="outlined" class="input-field"/>
  </v-card>

  <v-card class="pa-2 mt-3 section-card" flat>
    <div class="section-header">
      <v-icon size="18" color="primary">mdi-scale</v-icon>
      <span>Units *</span>
    </div>
    <v-autocomplete v-model="productUnit" :items="headerList" density="compact" variant="outlined" class="input-field"/>
  </v-card>

  <v-card class="pa-2 mt-3 section-card" flat>
    <div class="section-header">
      <v-icon size="18" color="primary">mdi-text</v-icon>
      <span>Description</span>
    </div>
    <v-autocomplete v-model="productDescription" :items="headerList" density="compact" variant="outlined" class="input-field"/>
  </v-card>

  <div >
    <v-btn
      block
      color="primary"
      class="preview-btn"
      :disabled="!isPreviewButtonEnabled"
      @click="construct_valid_invalid"
    >
      <v-icon left>mdi-eye</v-icon>
      Preview
    </v-btn>
  </div>

</v-col>
        <!-- 🔹 RIGHT SIDE (PREVIEW TABLE) -->
<v-col cols="9" class="right-panel">

  <div class="table-scroll">

    <v-card
      v-if="!validInputData.length"
      class="d-flex flex-column align-center justify-center pa-10 empty-state"
      height="400"
      flat
    >
      <v-icon size="60" color="grey-lighten-1">
        mdi-file-excel-outline
      </v-icon>

      <div class="mt-3 text-grey">
        Map fields and click Preview to see data
      </div>
    </v-card>

    <v-slide-y-transition>
      <v-card v-if="validInputData.length" class="pa-3 table-card" flat>

        <v-tabs v-model="validInvalidTabs" color="primary">
          <v-tab>
            <v-icon size="16" class="mr-1">mdi-check-circle</v-icon>
            Valid ({{ UploadList.valid.length }})
          </v-tab>
          <v-tab>
            <v-icon size="16" class="mr-1">mdi-alert-circle</v-icon>
            Invalid ({{ UploadList.invalid.length }})
          </v-tab>
        </v-tabs>

        <v-window v-model="validInvalidTabs">

          <v-window-item :value="0">
            <v-data-table
              :headers="validHeaders"
              :items="UploadList.valid"
              density="compact"
            />
          </v-window-item>

          <v-window-item :value="1">
            <v-data-table
              :headers="InvalidHeaders"
              :items="UploadList.invalid"
              density="compact"
            />
          </v-window-item>

        </v-window>

      </v-card>
    </v-slide-y-transition>

  </div>
</v-col>
      </v-row>
    </v-card>
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
      // 🔹 Mapping Fields (NEW UI)
      productName: "",
      productSKU: "",
      productPrice: "",
      productUnit: "",
      productCategory: "",
      productDescription: "",

      // 🔹 Excel Data
      headerList: [],
      dataTable: [],
      validInputData: [],

      // 🔹 Preview Data
      UploadList: { valid: [], invalid: [] },
      validHeaders: [],
      InvalidHeaders: [],
      validInvalidTabs: 0,

      // 🔹 Upload State
      isLoadingUpload: false,
      selectedFile: null,

      // 🔹 Snackbar
      SnackBarComponent: {},
    };
  },
// watch: {
//   productName: "autoPreview",
//   productCategory: "autoPreview",
//   productPrice: "autoPreview",
// },
  mounted() {
    this.dataTable =
      this.$store.getters.GetcustomerDetails?.excelTableData || [];

    this.headerList =
      this.$store.getters.GetcustomerDetails?.excelHeaders || [];
  },

  computed: {
    isPreviewButtonEnabled() {
      return (
        this.productName &&
        this.productCategory &&
        this.productPrice &&
         this.productUnit 
      );
    },
  },

  methods: {
  autoPreview() {
    if (this.isPreviewButtonEnabled) {
      this.construct_valid_invalid();
    }
  },
  construct_valid_invalid() {
  const headers = [
    { title: "Product Name", key: this.productName },
    { title: "SKU", key: this.productSKU },
    { title: "Price", key: this.productPrice },
    { title: "Category", key: this.productCategory },
    {title:"Unit" , key: this.productUnit},
    { title: "Description", key: this.productDescription },
  ];

  this.validHeaders = headers
    .filter(h => h.key)
    .map(h => ({ title: h.title, key: h.key }));

  this.InvalidHeaders = [...this.validHeaders];

  this.validInputData = [...this.dataTable]; 
  this.validate_mandatory_data();
},

    /* ================= VALIDATION ================= */

validate_mandatory_data() {
  this.UploadList = { valid: [], invalid: [] };

  this.validInputData.forEach(row => {
    let errors = [];

    const name = row[this.productName];
    const category = row[this.productCategory];
    const price = row[this.productPrice];
    const unit = row[this.productUnit]; // ✅ NEW

    if (!name || String(name).trim() === "") {
      errors.push("Missing Name");
    }

    if (!category || String(category).trim() === "") {
      errors.push("Missing Category");
    }

    if (!price || String(price).trim() === "") {
      errors.push("Missing Price");
    }

    if (price && isNaN(Number(price))) {
      errors.push("Price must be number");
    }

    // ✅ UNIT VALIDATION
    if (!unit || String(unit).trim() === "") {
      errors.push("Missing Unit");
    }

    if (errors.length === 0) {
      this.UploadList.valid.push(row);
    } else {
      this.UploadList.invalid.push({
        ...row,
        error: errors.join(", ")
      });
    }
  });

  this.InvalidHeaders = [
    ...this.validHeaders,
    { title: "Error", key: "error" }
  ];
},


    validate_data() {
      const worksheet = XLSX.utils.json_to_sheet(this.UploadList.valid);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
      const buffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
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

    async saveData(fileKey) {
      this.isLoadingUpload = true;

      const headers = {
        product_name: this.productName,
        sku: this.productSKU,
        price: this.productPrice,
        unit_name: this.productUnit,
        category_name: this.productCategory,
        product_description: this.productDescription,
      };

      try {
        const res = await API.graphql(
          graphqlOperation(bulk_upload_items, {
            input: {
              fileKey: fileKey,
                  headers: JSON.stringify(headers),
            },
          })
        );

        const response = JSON.parse(res.data.bulk_upload_items);

        this.isLoadingUpload = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor:
            response.Status === "SUCCESS" ? "green" : "red",
          SnackbarText: response.Message,
          timeout: 5000,
          Top: true,
        };

        if (response.Status === "SUCCESS") {
           this.$router.push("/home/Inventory_latest");

  // 🔥 trigger refresh
  this.$store.commit("REFRESH_ITEMS", true);
          setTimeout(() => {
            this.$router.push("/home/Inventory_latest");
          }, 1500);
        }

      } catch (err) {
        this.isLoadingUpload = false;
        console.error("API Error:", err);
      }
    },

    /* ================= NAVIGATION ================= */

    cancelAction() {
      this.$router.push("/home/Inventory_latest");
    },
  },
};
</script>
<style scoped>
.section-card {
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #eee;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color:pink;
  margin-bottom: 8px;
}
.gap-2 {
  gap: 8px;
}

.v-data-table {
  border-radius: 10px;
  border: 1px solid #eee;
}

.left-panel {
  height: calc(100vh - 110px);
  overflow-y: auto;
  padding-right: 6px;
}
/* ===================== LAYOUT ===================== */

.left-panel {
  height: calc(100vh - 110px);
  overflow-y: auto;
  padding: 10px 8px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
}

.right-panel {
  height: calc(100vh - 110px);
}

.table-scroll {
  height: 100%;
  overflow-y: auto;
  padding-right: 6px;
}

/* ===================== CARD ===================== */

.section-card {
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 10px 12px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.section-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

/* Reduce spacing between cards */
.section-card + .section-card {
  margin-top: 8px !important;
}

/* ===================== HEADER ===================== */

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

/* Icon badge */
.section-header .v-icon {
  background: #eef2ff;
  border-radius: 6px;
  padding: 3px;
}

/* ===================== INPUT ===================== */

.input-field .v-field {
  border-radius: 8px !important;
  border: 1px solid #e5e7eb !important;
  background: #fafafa !important;
  min-height: 34px !important;
  transition: all 0.2s ease;
}

/* Hover */
.input-field .v-field:hover {
  border-color: #cbd5e1 !important;
  background: #ffffff !important;
}

/* Focus */
.input-field .v-field--active {
  background: #ffffff !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
}

/* Compact input text */
.input-field .v-field__input {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  font-size: 13px;
}

/* ===================== TABLE ===================== */

.table-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 10px !important;
  background: #ffffff;
}

/* ===================== EMPTY STATE ===================== */

.empty-state {
  border-radius: 12px;
  border: 1px dashed #e5e7eb;
  background: #fafafa;
}

/* ===================== BUTTON ===================== */

.preview-btn {
  margin-top: 10px;
  border-radius: 10px;
  height: 38px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4px;
  color: white;

  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
  transition: all 0.2s ease; 
}

.preview-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(99, 102, 241, 0.35);
}

/* ===================== SCROLLBAR (CLEAN) ===================== */

.left-panel::-webkit-scrollbar,
.table-scroll::-webkit-scrollbar {
  width: 5px;
}

.left-panel::-webkit-scrollbar-thumb,
.table-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}
</style>
