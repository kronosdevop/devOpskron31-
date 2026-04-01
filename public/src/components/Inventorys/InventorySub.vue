<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <!-- Modern Header Section -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-package-variant</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Inventory</span>
          <span class="header-subtitle"
            >Manage products, services, categories and units</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Add any action buttons here if needed -->
        <!-- <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn
              v-if="inventoryToggle === 'product'"
              v-bind="props"
              class="text-capitalize cardCss white--text mr-2"
              size="small"
              elevation="2"
            >
              Actions
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="download_item">
              <template #prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title>Download Template</v-list-item-title>
            </v-list-item>

            <v-divider class="my-1" />

            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-import</v-icon>
              </template>
              <BulkItemImport
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
              />
            </v-list-item>
            <v-divider class="my-1" />
            <v-list-item @click="export_item()">
              <template #prepend>
                <v-icon color="primary">mdi-export</v-icon>
              </template>
              <v-list-item-title>Export</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu> -->
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </v-app-bar>

    <!-- Modern Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs
          v-model="inventoryToggle"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
        >
          <v-tab value="product" class="tab-btn"> Items </v-tab>
          <!-- <v-tab value="service" class="tab-btn"> Service </v-tab> -->
          <v-tab value="categories" class="tab-btn"> Categories </v-tab>
          <v-tab value="unit" class="tab-btn"> Unit </v-tab>
        </v-tabs>
        </template>
    </v-toolbar>

    <!-- Tab Content -->
    <div class="text-left">
      <!-- Product Tab -->
      <div v-if="inventoryToggle === 'product'">
        <Product
          @product-updated="handleProductUpdated"
        />
      </div>

      <!-- Service Tab -->
      <!-- <div v-if="inventoryToggle === 'service'">
        <Service />
      </div> -->

      <!-- Categories Tab -->
      <div v-if="inventoryToggle === 'categories'">
        <Categories @category-updated="handleCategoryUpdated" />
      </div>

      <!-- Unit Tab -->
      <div v-if="inventoryToggle === 'unit'">
        <Units
          @unit-updated="handleUnitUpdated"
          @conversion-updated="handleConversionUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script>
// import * as XLSX from "xlsx";
import Units from "./Units.vue";
import Categories from "./Categories.vue";
import Product from "./Product.vue";
// import Service from "./Service.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";
// import BulkItemImport from "./BulkItemImport.vue";
// import { export_inventory_items } from "@/graphql/mutations.js";
// import { API, graphqlOperation } from "aws-amplify";
// import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
// const FileSaver = require("file-saver");
// import axios from "axios";
export default {
  name: "InventorySub",
  components: {
    Units,
    Categories,
    Product,
    // Service,
    // BulkItemImport,
    CreateExternalTicketDialog,
  },
  data() {
    return {
      inventoryToggle: "product",
      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      dropExceldailog: false,
      globalSearch: "",
      excelHeaders: [],
      excelTableData: [],
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },
  methods: {
    // download_item() {
    //   const headers = [
    //     "item_name",
    //     "item_type",
    //     "item_code",
    //     "item_hsn",
    //     "category_name",
    //     "sub_category_name",
    //     "item_unit",
    //     "tracking_type",
    //     "purchase_price",
    //     "sale_price",
    //     "whole_sale_price",
    //     "stock_quantity",
    //     "stock_value",
    //     "minimum_stock",
    //     "discount_price",
    //     "item_tax",
    //     "item_description",
    //     "item_location",
    //   ];

    //   let firstName =
    //     this.$store.getters.GetUserObj?.organization?.organization_team_id ||
    //     "";
    //   let fileName = firstName
    //     ? ` ${firstName}_Inventory Template.xlsx`
    //     : "Inventory Template.xlsx";
    //   const ws = XLSX.utils.aoa_to_sheet([headers]);
    //   const wb = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    //   XLSX.writeFile(wb, fileName);
    // },
    // handleSuccess({ results, header }) {
    //   this.$router.push("/home/BulkUploadInventory");
    //   let customerData = {
    //     excelHeaders: header,
    //     excelTableData: results,
    //   };
    //   this.$store.commit("SetcustomerDetails", customerData);
    // },
    // beforeUpload(file) {
    //   const isLt1M = file.size / 1024 / 1024 < 5;
    //   return isLt1M;
    // },
    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
    handleUnitUpdated() {
      // Handle unit updates if needed
      console.log("Unit updated");
    },
    handleConversionUpdated() {
      // Handle conversion updates if needed
      console.log("Conversion updated");
    },
    handleCategoryUpdated() {
      // Handle category updates if needed
      console.log("Category updated");
    },
    handleProductUpdated() {
      // Handle product updates if needed
      console.log("Product updated");
    },

    // async export_item() {
    //   try {
    //     const data = this.$store.getters.GetUserObj;

    //     const result = await API.graphql(
    //       graphqlOperation(export_inventory_items, {
    //         input: {
    //           user_email_id: data.organization.organization_created_by,
    //           item_type: "ALL",
    //           category_id: "ALL",
    //         },
    //       })
    //     );

    //     // Parse stringified JSON
    //     const response = JSON.parse(result.data.export_inventory_items);

    //     if (response.Status === "SUCCESS" && response.URL) {
    //       // Download directly from signed S3 URL
    //       this.download_items(response.URL, response.FileName);
    //     } else {
    //       throw new Error(response.Message || "Export failed");
    //     }
    //   } catch (error) {
    //     this.SnackBarComponent = {
    //       SnackbarVmodel: true,
    //       SnackbarColor: "red",
    //       SnackbarText: error.message || error.errors?.[0]?.message,
    //       timeout: 5000,
    //       Top: true,
    //     };
    //   }
    // },

    // async download_items(url, fileNameFromApi) {
    //   let teamId =
    //     this.$store.getters.GetUserObj?.organization?.organization_team_id ||
    //     "";

    //   let fileName = fileNameFromApi
    //     ? `${teamId}_${fileNameFromApi}`
    //     : `${teamId}_Inventory.xlsx`;

    //   try {
    //     const response = await axios({
    //       url,
    //       method: "GET",
    //       responseType: "blob",
    //     });

    //     const blob = new Blob([response.data], {
    //       type: response.headers["content-type"] || "application/octet-stream",
    //     });

    //     FileSaver.saveAs(blob, fileName);
    //   } catch (error) {
    //     console.error("Download failed:", error);
    //   }
    // },
  },
};
</script>

<style scoped>
/* Component-specific styles only - using global styles for common elements */
</style>
