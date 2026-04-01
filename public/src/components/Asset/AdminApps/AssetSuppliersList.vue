<template>
  <div>
    <div>
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <v-row class="mt-5">
        <v-col cols="4">
          <v-card class="ml-2" rounded="lg" elevation="0">
            <v-toolbar color="transparent">
              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                class="ml-2 mt-3"
                rounded="lg"
                density="compact"
                variant="outlined"
                max-width="190"
                placeholder="Search suppliers..."
                clearable
                @click:clear="searchQuery = ''"
              />
              <v-menu offset-y>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    class="action-btn ml-4 mt-n2"
                    size="small"
                    icon
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item @click="Add_prefix">
                    <template #prepend>
                      <v-icon color="primary">mdi-plus-circle-outline</v-icon>
                    </template>
                    <v-list-item-title>{{
                      prefix ? "Edit Prefix" : "Add Prefix"
                    }}</v-list-item-title>
                  </v-list-item>
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
                    <BulkIndex
                      :on-success="handleSuccessbusiness"
                      :before-upload="beforeUpload"
                    />
                  </v-list-item>
                  <v-list-item @click="export_vendor">
                    <template #prepend>
                      <v-icon color="primary">mdi-export</v-icon>
                    </template>
                    <v-list-item-title>Export</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn
                @click="add_supp()"
                class="action-btn ml-4 mt-n2"
                size="small"
                icon
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-toolbar>

            <v-data-table
              :headers="suppliereHeaders"
              :items="sortedAndPaginatedItems"
              :loading="tableLoading"
              :fixed-header="fixed"
              :height="windowHeight"
              :items-per-page="100"
              hide-default-footer
              density="comfortable"
              class="modern-data-table"
              hover
              multi-sort
              @update:sort-by="handleSortChange"
              @click:row="openDetails"
            >
              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey lighten-1" class="mb-4"
                    >mdi-account-tie-outline</v-icon
                  >
                  <div class="text-h6 grey--text mb-2">No Suppliers Found</div>
                  <div class="text-body-2 grey--text">
                    Try adjusting your search criteria or add a new supplier.
                  </div>
                </div>
              </template>

              <template v-slot:loading>
                <div class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="32"
                    class="mb-4"
                  ></v-progress-circular>
                  <div class="text-body-2 grey--text">Loading suppliers...</div>
                </div>
              </template>

              <!-- Display ID -->
              <template v-slot:[`item.vendor_display_id`]="{ item }">
                <div class="d-flex align-center">
                  <div>
                    <div class="font-weight-medium text-body-2">
                      {{ item.vendor_display_id }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Contact Name -->
              <template v-slot:[`item.suppliers_contact_name`]="{ item }">
                <div class="d-flex align-center">
                  <div>
                    <div class="font-weight-medium text-body-2">
                      {{ item.suppliers_contact_name || "N/A" }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Email ID -->
              <template v-slot:[`item.suppliers_email_id`]="{ item }">
                <div class="d-flex align-center">
                  <span class="caption text-truncate" style="max-width: 200px">
                    {{ item.suppliers_email_id || "N/A" }}
                  </span>
                </div>
              </template>

              <!-- Contact Number -->
              <template v-slot:[`item.suppliers_full_number`]="{ item }">
                <div class="d-flex align-center">
                  <span class="caption">
                    <span class="font-weight-medium">{{
                      getContactParts(item.suppliers_full_number).code
                    }}</span>
                    &nbsp;
                    <span>{{
                      getContactParts(item.suppliers_full_number).number
                    }}</span>
                  </span>
                </div>
              </template>

              <!-- Address -->
              <template v-slot:[`item.suppliers_address`]="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ on }">
                    <div class="d-flex align-center" v-on="on">
                      <span
                        class="caption text-truncate"
                        style="max-width: 200px"
                      >
                        {{ item.suppliers_address || "N/A" }}
                      </span>
                    </div>
                  </template>
                  <div style="max-width: 300px">
                    <div class="font-weight-medium mb-1">Address</div>
                    <div>
                      {{ item.suppliers_address || "No address available" }}
                    </div>
                  </div>
                </v-tooltip>
              </template>

              <!-- Actions -->
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex align-center justify-center">
                  <v-menu offset-y>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        v-bind="props"
                        class="cursor-pointer"
                      >
                        <v-icon size="18">mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list density="compact">
                      <v-list-item
                        @click.stop="View_Vendor(item)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="green">mdi-eye</v-icon>
                        </template>
                        <v-list-item-title>View Vendor</v-list-item-title>
                      </v-list-item>

                      <v-divider class="my-1" />

                      <v-list-item
                        @click.stop="open_editdailog(item)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="blue">mdi-pencil</v-icon>
                        </template>
                        <v-list-item-title>Edit Vendor</v-list-item-title>
                      </v-list-item>

                      <v-divider class="my-1" />

                      <v-list-item
                        @click.stop="open_deletedailog(item)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="red">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>Delete Vendor</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="8">
          <div v-if="selectedSupplier">
            <v-card height="60" rounded="lg" elevation="2" class="mr-2">
              <v-row>
                <v-col cols="3">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="ml-2 mt-3"
                      >mdi-account-tie</v-icon
                    >
                    <v-tooltip location="top">
                      <template #activator="{ props }">
                        <div
                          v-bind="props"
                          class="ml-2 mt-4 text-truncate"
                          style="max-width: 200px"
                        >
                          {{ selectedSupplier.supplier_name }}
                        </div>
                      </template>
                      <span>{{ selectedSupplier.supplier_name }}</span>
                    </v-tooltip>
                  </div>
                </v-col>
                <v-col cols="3">
                  <div class="d-flex align-center">
                    <v-icon color="orange" class="ml-n4 mt-4"
                      >mdi-id-card</v-icon
                    >
                    <div class="ml-1 mt-4">
                      {{ selectedSupplier.vendor_display_id }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="3">
                  <div class="d-flex align-center">
                    <v-icon color="blue" class="ml-n10 mt-4"
                      >mdi-email-outline</v-icon
                    >
                    <div class="ml-2 mt-4">
                      {{ selectedSupplier.suppliers_email_id }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="3">
                  <div class="d-flex align-center">
                    <v-icon color="green" class="ml-2 mt-4">mdi-phone</v-icon>
                    <div class="ml-1 mt-4">
                      {{
                        selectedSupplier.suppliers_full_number?.replaceAll(
                          "_",
                          " "
                        )
                      }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card>

            <v-data-table
              hide-default-footer
              fixed-header="true"
              :headers="supplierDetailsHeader"
              :height="windowHeight - 80"
              :items="paginatedSupplierTransactions"
              :loading="tableLoadingdata"
              class="modern-data-table mt-2"
            >
              <template #[`item.transaction_type`]="{ item }">
                <div>
                  {{ item.transaction_type?.replaceAll("_", " ") || "N/A" }}
                </div>
              </template>
              <template #loading>
                <div class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="32"
                    class="mb-2"
                  />
                  <div class="text-body-2 grey--text">
                    Loading transactions...
                  </div>
                </div>
              </template>
            </v-data-table>

            <div class="table-footer">
              <div class="footer-info">
                {{
                  !supplierTransactions || supplierTransactions.length === 0
                    ? "No Results"
                    : `Showing ${paginatedSupplierTransactions.length} of ${supplierTransactions.length}`
                }}
              </div>
              <div class="pagination-controls">
                <v-btn
                  :disabled="supplierCurrentPage === 1"
                  variant="text"
                  size="small"
                  class="pagination-btn"
                  @click="supplierCurrentPage = supplierCurrentPage - 1"
                  >Previous</v-btn
                >
                <div class="page-numbers">
                  <v-btn
                    v-for="page in supplierVisiblePages"
                    :key="page"
                    :variant="
                      page === supplierCurrentPage ? 'elevated' : 'text'
                    "
                    size="small"
                    :class="
                      page === supplierCurrentPage
                        ? 'active-page'
                        : 'inactive-page'
                    "
                    @click="supplierCurrentPage = page"
                    >{{ page }}</v-btn
                  >
                </div>
                <v-btn
                  :disabled="supplierCurrentPage === supplierPageCount"
                  variant="text"
                  size="small"
                  class="pagination-btn"
                  @click="supplierCurrentPage = supplierCurrentPage + 1"
                  >Next</v-btn
                >
              </div>
            </div>
          </div>

          <!-- No data state when no supplier is selected -->
          <div v-else class="no-data-container">
            <v-card class="no-data-card" elevation="2">
              <div class="text-center py-12">
                <v-icon size="80" color="grey lighten-2" class="mb-6"
                  >mdi-account-tie-outline</v-icon
                >
                <div class="text-h5 grey--text mb-4">No Supplier Selected</div>
                <div class="text-body-1 grey--text mb-6">
                  Select a supplier from the list to view their details and
                  transactions
                </div>
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="add_supp"
                  class="mt-4"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Add New Supplier
                </v-btn>
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <div v-if="componentCheck == 1">
        <DeleteSuppliers
          :supplierdeletion="supplierdeletion"
          @clicked="supplierdeletion = false"
          :supplierItem="supplierItem"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
        />
      </div>
      <div v-if="componentCheck == 2">
        <EditVendorOrSupplier
          :supplieredition="supplieredition"
          @clicked="supplieredition = false"
          :supplierItem="supplierItem"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
        />
      </div>
      <div v-if="componentCheck == 3">
        <AddVendorCreation
          :supplierAddition="supplierAddition"
          @clicked="supplierAddition = false"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
        />
      </div>
      <div v-if="componentCheck == 4">
        <ViewVendorOrSupplier
          :ViewSupplierDialog="ViewSupplierDialog"
          @clicked="ViewSupplierDialog = false"
          :supplierItem="supplierItem"
        />
      </div>
      <div v-if="componentCheck == 5">
        <AddVendorPrefix
          :addPrefixDialog="addPrefixDialog"
          @clicked="addPrefixDialog = false"
          v-on:errorMsg="error_info"
          :prefixData="prefixData"
          v-on:successMsg="success_info"
        />
      </div>
    </div>
  </div>
</template>
    <script>
/*eslint-disable*/

import * as XLSX from "xlsx";
import BulkIndex from "@/components/TicketManagement/BulkIndex.vue";
// import EditSuppliers from "@/components/Asset/Popups/EditSuppliers.vue";
import SnackBar from "@/components/SnackBar.vue";
import DeleteSuppliers from "@/components/Asset/Popups/DeleteSuppliers.vue";
// import AddSuppliers from "@/components/Asset/Popups/AddSuppliers.vue";
import AddVendorCreation from "../Popups/AddVendorCreation.vue";
import { aseet_suppliers } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import {
  export_vendor_data,
  get_supplier_transactions,
} from "@/graphql/queries";
const FileSaver = require("file-saver");
import axios from "axios";
import EditVendorOrSupplier from "../Popups/EditVendorOrSupplier.vue";
import ViewVendorOrSupplier from "../Popups/ViewVendorOrSupplier.vue";
import AddVendorPrefix from "../Popups/AddVendorPrefix.vue";

export default {
  components: {
    SnackBar,
    DeleteSuppliers,
    // EditSuppliers,
    ViewVendorOrSupplier,
    // AddSuppliers,
    AddVendorCreation,
    BulkIndex,
    EditVendorOrSupplier,
    AddVendorPrefix,
  },
  data() {
    return {
      SnackBarComponent: {},
      searchQuery: "",
      supplierdeletion: false,
      tableLoadingdata: false,
      supplieredition: false,
      tableLoading: false,
      componentCheck: 0,
      suppliereHeaders: [
        {
          title: "Display ID",
          value: "vendor_display_id",
          sortable: true,
          align: "start",
        },
        {
          title: "Vendor Name",
          value: "supplier_name",
          sortable: true,
          align: "start",
        },
        // {
        //   title: "Contact Name",
        //   value: "suppliers_contact_name",
        //   sortable: true,
        //   align: "start",
        // },
        // {
        //   title: "Email ID",
        //   value: "suppliers_email_id",
        //   sortable: true,
        //   align: "start",
        // },
        // {
        //   title: "Contact No",
        //   value: "suppliers_full_number",
        //   sortable: true,
        //   align: "start",
        // },
        // {
        //   title: "Address",
        //   value: "suppliers_address",
        //   sortable: true,
        //   align: "start",
        // },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
      suppliereRecords: [],
      fixed: true,
      supplierItem: {},
      supplierAddition: false,
      height: 0,
      ViewSupplierDialog: false,
      addPrefixDialog: false,
      currentPage: 1,
      itemsPerPage: 100,
      sortBy: [{ key: "vendor_display_id", order: "asc" }],
      windowHeight: 0,
      selectedSupplier: null,
      supplierTransactions: [],
      supplierCurrentPage: 1,
      supplierItemsPerPage: 10,
      supplierDetailsHeader: [
        { title: "Invoice No.", value: "invoice_no" },
        { title: "Transaction Type", value: "transaction_type" },
        { title: "Transaction Details", value: "transaction_details" },
        { title: "Transaction Date", value: "transaction_date" },
        { title: "Total Amount", value: "total_cost" },
        { title: "Balance Amount", value: "balance_cost" },
      ],
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.suppliereRecords;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.suppliereRecords.filter((item) => {
        // Search through all properties of the item object
        return Object.values(item).some((value) => {
          // Skip null, undefined, and non-string values
          if (
            value === null ||
            value === undefined ||
            typeof value !== "string"
          ) {
            return false;
          }
          return value.toLowerCase().includes(searchTerm);
        });
      });
    },
    sortedAndPaginatedItems() {
      // First sort the filtered items
      // const sortedItems = this.filteredItems.slice().sort((a, b) => {
      //   for (const sort of this.sortBy) {
      //     const aValue = this.getSortValue(a[sort.key], sort.key);
      //     const bValue = this.getSortValue(b[sort.key], sort.key);

      //     if (aValue < bValue) return sort.order === "desc" ? -1 : 1;
      //     if (aValue > bValue) return sort.order === "desc" ? 1 : -1;
      //   }
      //   return 0;
      // });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return  this.filteredItems.slice(start, end);
    },
    totalItems() {
      return this.filteredItems.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.pageCount, this.currentPage + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    // Pagination for supplier transactions
    supplierPageCount() {
      return Math.ceil(
        (this.supplierTransactions?.length || 0) / this.supplierItemsPerPage
      );
    },
    supplierVisiblePages() {
      const totalPages = this.supplierPageCount;
      const current = this.supplierCurrentPage;
      const delta = 2;
      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);
      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    // Paginated supplier transactions
    paginatedSupplierTransactions() {
      if (
        !this.supplierTransactions ||
        this.supplierTransactions.length === 0
      ) {
        return [];
      }
      const start = (this.supplierCurrentPage - 1) * this.supplierItemsPerPage;
      const end = start + this.supplierItemsPerPage;
      return this.supplierTransactions.slice(start, end);
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    currentPage(newVal) {
      // When the page changes, scroll to top of the card container
      this.$nextTick(() => {
        const cardContainer = document.querySelector(".card-container");
        if (cardContainer) {
          cardContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Fallback to scrolling to top of page
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    },
  },
  async created() {
    this.windowHeight = window.innerHeight - 250;
    this.$store.commit("Setvendorbulkback", false);
    await this.fetch_suppliers();
    // console.log(this.suppliereRecords[0],this.suppliereRecords,'this.selectedSupplier')
    if (this.suppliereRecords.length > 0) {
      this.selectedSupplier = { ...this.suppliereRecords[0] };
      await this.fetch_supplier_transactions(
        this.suppliereRecords[0].suppliers_id
      );
    }
  },
  methods: {
    getContactParts(contact) {
      if (!contact) return { code: "", number: "" };
      const separator = contact.includes("_")
        ? "_"
        : contact.includes("-")
        ? "-"
        : null;
      if (!separator) return { code: "", number: contact };

      const [code, number] = contact.split(separator);
      return { code, number };
    },
    async export_vendor() {
      let data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(export_vendor_data, {
            input: {
              organization_id: data.organization.organization_id,
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
            // console.log(signedUrl);
          }

          this.tableLoading = false;
          this.tableLoading = false;
        } else {
          this.suppliereRecords = [];

          this.tableLoading = false;
        }
      } catch (error) {
        this.suppliereRecords = [];

        this.tableLoading = false;
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
        // console.error("Error downloading the file:", error);
      }
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
    handleSuccessbusiness({ results, header }) {
      if (!this.prefix || this.prefix === "N/A") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "error", // set this to 'error', 'red', or any valid color
          SnackbarText: "Please add prefix", // set the actual message here
          timeout: 5000,
          Top: true,
        };
        return; // Stop execution
      }

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
      // this.$message({
      //   message: "Please do not upload files larger than 1m in size.",
      //   type: "warning",
      // });
      return false;
    },
    add_supp() {
      // this.$router.push("/AddVendor")
      this.componentCheck = 3;
      this.supplierAddition = true;
    },

    Add_prefix() {
      this.componentCheck = 5;
      this.addPrefixDialog = true;
      this.prefixData = this.prefix;

      // Send the prefix value (empty string if undefined)
      // this.prefix = item.customer_display_id || "";

      // console.log("prefix sent:", this.prefixData);
    },

    get_date(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },

    open_deletedailog(item) {
      this.componentCheck = 1;
      this.supplierdeletion = true;
      this.supplierItem = item;
    },

    open_editdailog(item) {
      // console.log("item", item);
      this.componentCheck = 2;
      this.supplieredition = true;
      this.supplierItem = item;
      // console.log("supplierItem", this.supplierItem);
    },

    View_Vendor(item) {
      this.componentCheck = 4;
      this.ViewSupplierDialog = true;
      this.supplierItem = item;
      this.selectedSupplier = item;
      this.fetch_supplier_transactions(item.suppliers_id);
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
      this.supplierdeletion = false;
      this.supplieredition = false;
      this.supplierAddition = false;
      this.addPrefixDialog = false;
      this.fetch_suppliers().then(() => {
        if (
          this.selectedSupplier &&
          this.supplierItem &&
          this.selectedSupplier.supplier_id === this.supplierItem.supplier_id
        ) {
          this.selectedSupplier =
            this.suppliereRecords.length > 0
              ? { ...this.suppliereRecords[0] }
              : null;
          if (this.selectedSupplier) {
            this.fetch_supplier_transactions(this.selectedSupplier.supplier_id);
          } else {
            this.supplierTransactions = [];
            this.supplierCurrentPage = 1;
          }
        }
      });
    },

    async fetch_S3_file(value) {
      let responseData = null;
      let data = null;

      try {
        const response = await fetch(value);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch the file: ${response.statusText} (Status Code: ${response.status})`
          );
        }

        if (
          !response.headers.get("Content-Type").includes("application/json")
        ) {
          throw new Error("The file is not in JSON format");
        }

        responseData = await response.text();

        try {
          data = JSON.parse(responseData);
        } catch (jsonError) {
          throw new Error("Error parsing JSON response: " + jsonError.message);
        }

        return data;
      } catch (error) {
        console.error("Error fetching file:", error);

        this.errorMessage = "Error fetching file: " + error.message;
      } finally {
      }
    },

    async fetch_suppliers() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(aseet_suppliers, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_SUPPLIER",
            },
          })
        );
        var response = JSON.parse(result.data.aseet_suppliers);
        this.suppliereRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          // console.log(response.url);
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          if (signedUrl) {
            let updatedCustomer = await this.fetch_S3_file(signedUrl);
            this.suppliereRecords = updatedCustomer || [];
          }
          // this.suppliereRecords = response.data || [];
          const prefixValue = response.vendor_display_id;
          this.prefix = prefixValue;
          this.tableLoading = false;
          // this.updateTotalItems(); // This line is removed as totalItems is now a computed property
        } else {
          this.suppliereRecords = [];
          const prefixValue = response.vendor_display_id;
          this.prefix = prefixValue;
          this.tableLoading = false;
          // this.updateTotalItems(); // This line is removed as totalItems is now a computed property
        }
      } catch (error) {
        this.suppliereRecords = [];
        this.tableLoading = false;
        // this.updateTotalItems(); // This line is removed as totalItems is now a computed property
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    // updateTotalItems() { // This method is removed as totalItems is now a computed property
    //   this.totalItems = this.filteredItems.length;
    // },

    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "vendor_display_id" ||
        key === "suppliers_contact_name" ||
        key === "suppliers_email_id" ||
        key === "suppliers_address"
      ) {
        return value.toLowerCase();
      }
      return value;
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },

    goBack() {
      this.$emit("backAction");
    },

    openDetails(event, { item }) {
      this.selectedSupplier = { ...item };
      this.supplierCurrentPage = 1; // Reset pagination when selecting new supplier
      this.fetch_supplier_transactions(item.suppliers_id);
    },

    async fetch_supplier_transactions(supplierId) {
      this.supplierTransactions = [];
      this.tableLoadingdata = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_supplier_transactions, { 
            input: {
            supplier_id: supplierId,
            organization_id:
              this.$store.getters.GetUserObj.organization.organization_id,
            nextToken: null,
            limit: 15,
            }
          })
        );
        this.tableLoadingdata = false;
        let response = JSON.parse(result.data.get_supplier_transactions);
        this.supplierTransactions = response.items || [];
      } catch (error) {
        this.supplierTransactions = [];
        this.tableLoadingdata = false;
        console.error("Error fetching supplier transactions:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error fetching supplier transactions",
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
}

.card-container {
  position: relative;
}

/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.footer-info {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-width: 80px !important;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.active-page {
  background: #db4c77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
}

.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}

.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

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

@media (max-width: 768px) {
  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
}

.no-data-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.no-data-card {
  width: 100%;
  max-width: 500px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.no-data-card .v-card__content {
  padding: 0;
}
</style>