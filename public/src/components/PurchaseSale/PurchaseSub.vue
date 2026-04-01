<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-list-box</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Purchase</span>
          <span class="header-subtitle">Track your purchases</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <!-- Filter Button -->
        <v-btn
          v-if="purchaseTabs === 'vendor_transaction'"
          :class="
            activeFiltersCount > 0
              ? 'action-btn filter-btn active'
              : 'action-btn filter-btn'
          "
          @click="showFilterDrawer = true"
          size="small"
        >
          <v-icon>mdi-filter-variant</v-icon>
          <span>Filter</span>
          <v-badge
            v-if="activeFiltersCount > 0"
            :content="activeFiltersCount"
            color="white"
            class="ml-2"
          />
        </v-btn>

        <!-- Add Payment-Out Button -->
        <v-btn
          v-if="purchaseTabs === 'purchaseout'"
          @click="addPaymentOut()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Payment-Out</span>
        </v-btn>

        <!-- Create Purchase Order Button -->
        <v-btn
          v-if="purchaseTabs === 'purchaseorder'"
          @click="createPurchaseOrder()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Purchase Order</span>
        </v-btn>

        <!-- Create Purchase Invoice Button -->
        <v-btn
          v-if="purchaseTabs === 'purchase-invoice'"
          @click="createPurchaseInvoice()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Purchase Invoice</span>
        </v-btn>

        <!-- Initiate Payment Button -->
        <v-btn
          v-if="purchaseTabs === 'vendor_transaction'"
          @click="add_category()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Initiate Payment</span>
        </v-btn>

        <!-- Actions Dropdown Menu -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="action-btn"
              size="small"
              v-if="purchaseTabs === 'vendors'"
            >
              <v-icon>mdi-dots-vertical</v-icon>
              <span>Actions</span>
            </v-btn>
          </template>

          <v-list density="compact">
            <!-- Add Vendor - Only show for Vendors tab -->
            <v-list-item
              v-if="purchaseTabs === 'vendors'"
              @click="add_vendor()"
              style="font-size: 12px"
            >
              <template #prepend>
                <v-icon size="small" color="green">mdi-account-plus</v-icon>
              </template>
              <v-list-item-title>Add Vendor</v-list-item-title>
            </v-list-item>

            <!-- Download Template - Only show for Vendors tab -->
            <v-list-item
              v-if="purchaseTabs === 'vendors'"
              @click="download_item()"
              style="font-size: 12px"
            >
              <template #prepend>
                <v-icon size="small" color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title>Download Template</v-list-item-title>
            </v-list-item>

            <!-- Bulk Import - Only show for Vendors tab -->
            <v-list-item
              v-if="purchaseTabs === 'vendors'"
              style="font-size: 12px"
            >
              <template #prepend>
                <v-icon size="small" color="primary">mdi-import</v-icon>
              </template>
              <BulkIndex
                :on-success="handleSuccessbusiness"
                :before-upload="beforeUpload"
              />
            </v-list-item>

            <!-- Export Data - Only show for Vendors tab -->
            <v-list-item
              v-if="purchaseTabs === 'vendors'"
              @click="export_data()"
              style="font-size: 12px"
            >
              <template #prepend>
                <v-icon size="small" color="primary">mdi-export</v-icon>
              </template>
              <v-list-item-title>Export</v-list-item-title>
            </v-list-item>

            <!-- Generate Report - Only show for Reports tab -->
            <v-list-item
              v-if="purchaseTabs === 'reports'"
              @click="generate_report()"
              style="font-size: 12px"
            >
              <template #prepend>
                <v-icon size="small" color="purple">mdi-file-chart</v-icon>
              </template>
              <v-list-item-title>Generate Report</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-toolbar color="transparent" class="mt-n10">
      <template #extension>
        <v-tabs
          v-model="purchaseTabs"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
        >
          <v-tab value="purchaseorder" class="tab-btn">Purchase Order</v-tab>
          <v-tab value="purchase-invoice" class="tab-btn"
            >Purchase Invoice</v-tab
          >
          <v-tab value="purchaseout" class="tab-btn">Payment Out</v-tab>
          <v-tab value="vendor_transaction" class="tab-btn"
            >Vendor Transaction</v-tab
          >
          <v-tab value="approvals" class="tab-btn">Approvals</v-tab>
          <v-tab value="reports" class="tab-btn">Reports</v-tab>
          <v-tab value="vendors" class="tab-btn">Vendors</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <!-- Filter Navigation Drawer -->
    <v-navigation-drawer
      :model-value="showFilterDrawer"
      @update:model-value="showFilterDrawer = $event"
      location="right"
      temporary
      :width="$vuetify.display.smAndDown ? '100%' : '400'"
      class="pa-0 filter-drawer"
      style="z-index: 1000"
    >
      <v-card flat>
        <v-toolbar elevation="1" density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">Filter Options</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-2" @click="closeFilterDrawer()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="filterForm">
            <div class="filter-content">
              <!-- From Date Filter -->
              <div class="filter-group">
                <label class="filter-label">From Date</label>
                <v-text-field
                  v-model="computedDateDisplay"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="openDatePicker"
                  class="filter-select"
                >
                  <v-dialog v-model="datePicker" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempDate"
                        :max="new Date().toISOString().substr(0, 10)"
                        color="#DB4C77"
                        class="primaryColor"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          text
                          color="primaryColor"
                          @click="datePicker = false"
                          >Cancel</v-btn
                        >
                        <v-btn text color="primaryColor" @click="saveDate"
                          >OK</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-text-field>
              </div>

              <!-- To Date Filter -->
              <div class="filter-group">
                <label class="filter-label">To Date</label>
                <v-text-field
                  v-model="dataDisplayFormatted"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="openDatePickerTo"
                  class="filter-select"
                >
                  <v-dialog v-model="datePickerTo" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempDateTo"
                        :max="new Date().toISOString().substr(0, 10)"
                        color="#DB4C77"
                        class="primaryColor"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          text
                          color="primaryColor"
                          @click="datePickerTo = false"
                          >Cancel</v-btn
                        >
                        <v-btn text color="primaryColor" @click="saveDateTo"
                          >OK</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-text-field>
              </div>

              <!-- Status Filter -->
              <div class="filter-group">
                <label class="filter-label">Filter By Status</label>
                <v-select
                  v-model="selectStatusType"
                  :items="[
                    { title: 'All', value: 'ALL' },
                    { title: 'Pending', value: 'PENDING' },
                    { title: 'Approved', value: 'APPROVED' },
                    { title: 'Withdrawn', value: 'WITHDRAWN' },
                    { title: 'Rejected', value: 'REJECTED' },
                  ]"
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
              </div>

              <!-- Action Buttons -->
              <div class="filter-actions">
                <v-btn
                  :loading="goLoading"
                  class="apply-filter-btn"
                  @click="applyFilterFromDrawer"
                  block
                >
                  <v-icon class="mr-2">mdi-filter</v-icon>
                  Apply Filter
                </v-btn>
                <v-btn
                  class="clear-filter-btn"
                  @click="clearFilters"
                  block
                  variant="outlined"
                >
                  <v-icon class="mr-2">mdi-close</v-icon>
                  Clear All
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <div v-if="purchaseTabs === 'purchaseout'">
      <PaymentOut ref="paymentOutComponent" />
    </div>
    <div v-if="purchaseTabs === 'purchase-invoice'">
      <PurchaseInvoice ref="purchaseInvoiceComponent" />
    </div>
    <div v-if="purchaseTabs === 'purchaseorder'">
      <PurchaseOrder ref="purchaseOrderComponent" />
    </div>
    <div v-if="purchaseTabs === 'vendor_transaction'">
      <VendorTransaction
        ref="vendorTransaction"
        :key="categoryKey"
        :fromDate="computedDateDisplay"
        :toDate="dataDisplayFormatted"
        :statusType="selectStatusType"
        @filter-applied="handleFilterApplied"
      />
    </div>
    <div v-if="purchaseTabs === 'approvals'">
      <VendorApproval />
    </div>
    <div v-if="purchaseTabs === 'reports'">
      <VendorReportsub />
    </div>
    <div v-if="purchaseTabs === 'vendors'">
      <AssetSuppliersList />
    </div>

    <!-- Initiate Transaction Dialog -->
    <div v-if="componentCheck == 2">
      <InitiateTransaction
        :vendorInitate="vendorInitate"
        @clicked="vendorInitate = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:categoeryRefresh="category_refresh"
      />
    </div>

    <!-- Add Vendor Dialog -->
    <div v-if="componentCheck == 3">
      <AddVendorCreation
        :supplierAddition="supplierAddition"
        @clicked="supplierAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import PaymentOut from "@/components/PurchaseSale/PaymentOut.vue";
import PurchaseOrder from "@/components/PurchaseSale/PurchaseOrder.vue";
import PurchaseInvoice from "@/components/PurchaseSale/PurchaseInvoice.vue";
import VendorTransaction from "@/components/VendorManagement/VendorTransaction.vue";
import VendorReportsub from "@/components/VendorManagement/VendorReportsub.vue";
import VendorApproval from "@/components/VendorManagement/VendorApproval.vue";
import AssetSuppliersList from "@/components/Asset/AdminApps/AssetSuppliersList.vue";
import BulkIndex from "@/components/TicketManagement/BulkIndex.vue";
import AddVendorCreation from "@/components/Asset/Popups/AddVendorCreation.vue";
import InitiateTransaction from "@/components/VendorManagement/VendorPopups/InitiateTransaction.vue";
import SnackBar from "@/components/SnackBar.vue";
import { export_vendor_data } from "@/graphql/queries";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import html2canvas from "html2canvas";
import CreateTicketDialog from "../Tickets/CreateTicketDialog.vue";
import { API, graphqlOperation } from "aws-amplify";
import * as XLSX from "xlsx";
const FileSaver = require("file-saver");
import axios from "axios";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    PaymentOut,
    PurchaseOrder,
    PurchaseInvoice,
    VendorTransaction,
    VendorReportsub,
    VendorApproval,
    AssetSuppliersList,
    BulkIndex,
    AddVendorCreation,
    InitiateTransaction,
    SnackBar,
    CreateExternalTicketDialog,
  },
  data: () => {
    // Set default dates (last month to today)
    let today = new Date();
    let lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    return {
      purchaseTabs: "purchaseorder",
      componentCheck: 0,
      SnackBarComponent: {},
      vendorInitate: false,
      categoryKey: 0,
      supplierAddition: false,

      // Filter related properties
      showFilterDrawer: false,
      goLoading: false,
      datePicker: false,
      datePickerTo: false,
      tempDate: lastMonth.toISOString().substr(0, 10),
      tempDateTo: today.toISOString().substr(0, 10),
      computedDateDisplay: "",
      dataDisplayFormatted: "",
      selectStatusType: "ALL",

      // Vendor management properties
      excelTableData: [],
      excelHeaders: [],

      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  created() {
    // Initialize display dates
    this.computedDateDisplay = this.formatDate(this.tempDate);
    this.dataDisplayFormatted = this.formatDate(this.tempDateTo);
  },

  computed: {
    activeFiltersCount() {
      let count = 0;

      // Count date filters
      if (this.computedDateDisplay && this.computedDateDisplay !== "") {
        count++;
      }
      if (this.dataDisplayFormatted && this.dataDisplayFormatted !== "") {
        count++;
      }

      // Count status filter (if not default)
      if (this.selectStatusType && this.selectStatusType !== "ALL") {
        count++;
      }

      return count;
    },
  },

  methods: {
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
    addPaymentOut() {
      // Emit event to child component to show payment-out dialog
      this.$refs.paymentOutComponent?.openPaymentOutDialog();
    },

    createPurchaseOrder() {
      // Emit event to child component to show purchase order dialog
      this.$refs.purchaseOrderComponent?.openPurchaseOrderDialog();
    },

    createPurchaseInvoice() {
      // Emit event to child component to show purchase invoice dialog
      this.$refs.purchaseInvoiceComponent?.openCreateDialog();
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    add_category() {
      this.componentCheck = 2;
      this.vendorInitate = true;
    },

    category_refresh() {
      this.categoryKey += 1;
    },

    add_vendor() {
      // Open add vendor dialog
      this.componentCheck = 3;
      this.supplierAddition = true;
    },

    export_data() {
      // Export functionality based on current tab
      if (this.purchaseTabs == "vendors") {
        this.export_vendor();
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText:
            "Export functionality will be implemented based on current tab.",
          timeout: 5000,
          Top: true,
        };
      }
    },

    generate_report() {
      // Generate report functionality
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: "Report generation functionality will be implemented.",
        timeout: 5000,
        Top: true,
      };
    },

    download_item() {
      const headers = [
        "Billing Name",
        "Address 1 *",
        "Address 2",
        "Primary Name",
        "Primary Country Code",
        "Primary Contact Number",
        "Primary Email",
        "Secondary Name",
        "Secondary Country Code",
        "Secondary Contact Number",
        "Secondary Email",
        "Beneficiary Name",
        "Bank and Branch Name",
        "Beneficiary Account Number",
        "IFSC Code",
        "GST Id",
        "PAN Id",
        "CIN Id",
      ];

      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id ||
        "";
      let fileName = firstName
        ? ` ${firstName}_Suppliers/Vendors Template.xlsx`
        : "Suppliers/Vendors Template.xlsx";
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, fileName);
    },

    async export_vendor() {
      try {
        let result = await API.graphql(
          graphqlOperation(export_vendor_data, {
            input: {
              organization_id:
                this.$store.getters.GetUserObj.organization.organization_id,
            },
          })
        );

        let response = JSON.parse(result.data.export_vendor_data);

        if (response.Status == "SUCCESS") {
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          if (signedUrl) {
            this.download_items(signedUrl);
          }
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Failed to export vendor data.",
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async download_items(url) {
      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id;
      let fileNames = firstName
        ? firstName + "_" + "Vendors" + ".xlsx"
        : "_" + "Vendors" + ".xlsx";
      try {
        const response = await axios({
          url: url,
          method: "GET",
          responseType: "blob",
        });
        if (!response.data) {
          throw new Error("No data received from the server.");
        }
        const fileName = fileNames;
        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "application/octet-stream",
        });

        FileSaver.saveAs(blob, fileName);
      } catch (error) {
        console.error("Error downloading the file:", error);
      }
    },

    handleSuccessbusiness({ results, header }) {
      this.excelTableData = results;
      this.$router.push("/home/SupplierUpload");

      this.excelHeaders = header;
      const customerData = {
        excelHeaders: this.excelHeaders,
        excelTableData: this.excelTableData,
      };
      this.$store.commit("SetcustomerDetails", customerData);
    },

    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 5;
      if (isLt1M) {
        return true;
      }
      return false;
    },

    // Filter drawer methods
    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },

    applyFilterFromDrawer() {
      this.goLoading = true;
      // Call the child component's filter method if available
      if (this.$refs.vendorTransaction) {
        this.$refs.vendorTransaction.getexpense_list();
      }
      this.closeFilterDrawer();
      this.goLoading = false;
    },

    clearFilters() {
      // Reset to default dates (last month to today)
      let today = new Date();
      let lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);

      this.tempDate = lastMonth.toISOString().substr(0, 10);
      this.tempDateTo = today.toISOString().substr(0, 10);
      this.computedDateDisplay = this.formatDate(this.tempDate);
      this.dataDisplayFormatted = this.formatDate(this.tempDateTo);
      this.selectStatusType = "ALL";

      // Refresh the vendor transaction list with cleared filters
      if (this.$refs.vendorTransaction) {
        this.$refs.vendorTransaction.getexpense_list();
      }
    },

    // Date picker methods
    saveDate() {
      if (this.tempDate) {
        this.computedDateDisplay = this.formatDate(this.tempDate);
      }
      this.datePicker = false;
    },

    saveDateTo() {
      if (this.tempDateTo) {
        this.dataDisplayFormatted = this.formatDate(this.tempDateTo);
      }
      this.datePickerTo = false;
    },

    // Method to open date picker and set temp date
    openDatePicker() {
      if (!this.tempDate) {
        let lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        this.tempDate = lastMonth.toISOString().substr(0, 10);
      }
      this.datePicker = true;
    },

    openDatePickerTo() {
      if (!this.tempDateTo) {
        this.tempDateTo = new Date().toISOString().substr(0, 10);
      }
      this.datePickerTo = true;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
    },

    handleFilterApplied(filterData) {
      // This method will be called when the child component applies the filter
      console.log("Filter applied:", filterData);
    },
  },
};
</script>

<style scoped>
/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Action Button Styles */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

/* Filter Button Styles */
.filter-btn {
  background: #e91e63 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3) !important;
  transition: all 0.3s ease !important;
}

.filter-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4) !important;
}

.filter-btn.active {
  background: #c2185b !important;
  box-shadow: 0 2px 8px rgba(194, 24, 91, 0.3) !important;
}

.filter-btn.active:hover {
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.4) !important;
}

/* Navigation Drawer Styles */
.navBar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.custom-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

/* Filter Content Styles */
.filter-content {
  padding: 16px 0;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.filter-select {
  width: 100%;
}

/* Filter Drawer Styles */
.filter-drawer {
  position: fixed !important;
  top: 0 !important; /* Starts from top */
  height: 100vh !important; /* Takes full height */
}
.filter-drawer .v-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.filter-drawer .v-card-text {
  flex: 1;
  overflow-y: auto; /* Makes content scrollable */
  padding: 16px;
  max-height: calc(100vh - 180px); /* Adjusted for desktop/laptop */
}

/* New filter action buttons styles */
.filter-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.apply-filter-btn {
  background: #db4c77 !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 40px !important;
  min-height: 40px !important;
}

.clear-filter-btn {
  background: #f5f5f5 !important;
  color: #666 !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 40px !important;
  min-height: 40px !important;
}

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  color: #666 !important;
}

.tab-btn:hover {
  color: #db4c77 !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 768px) {
  .header-left {
    gap: 12px;
  }

  .header-icon-bg {
    width: 40px;
    height: 40px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }

  .filter-drawer {
    width: 100% !important;
  }
}

/* Responsive styles for desktop/laptop */
@media (min-width: 768px) {
  .filter-drawer .v-card-text {
    max-height: calc(100vh - 160px);
  }
}

@media (min-width: 1024px) {
  .filter-drawer .v-card-text {
    max-height: calc(100vh - 150px);
  }
}
</style>
