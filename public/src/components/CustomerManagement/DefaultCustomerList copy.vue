<template>
  <div>
    <v-card flat class="overflow-y-auto">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text>
              <v-data-table
                :headers="suppliereHeaders"
                :fixed-header="fixed"
                :items="paginatedItems"
                :loading="tableLoading"
                :height="tableHeight"
                hide-default-footer
                density="comfortable"
                class="modern-data-table"
                hover
                multi-sort
                @update:sort-by="handleSortChange"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey lighten-1" class="mb-4"
                      >mdi-account-group-outline</v-icon
                    >
                    <div class="text-h6 grey--text mb-2">
                      No Customers Found
                    </div>
                    <div class="text-body-2 grey--text">
                      Try adjusting your search criteria or add a new customer.
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
                    <div class="text-body-2 grey--text">
                      Loading customers...
                    </div>
                  </div>
                </template>

                <template v-slot:[`item.timesheet_created_on`]="{ item }">
                  <span
                    v-text="get_date(item.timesheet_created_on * 1000)"
                  ></span>
                </template>

                <template v-slot:[`item.customer_contact_number`]="{ item }">
                  <span>{{
                    item.customer_contact_number == null
                      ? "N/A"
                      : item.customer_country_code +
                        " " +
                        item.customer_contact_number
                  }}</span>
                </template>

                <template v-slot:[`item.customer_email_id`]="{ item }">
                  <span>{{
                    item.customer_email_id == null ||
                    item.customer_email_id == undefined
                      ? "N/A"
                      : item.customer_email_id
                  }}</span>
                </template>

                <template v-slot:[`item.primary_contact_no`]="{ item }">
                  <span>{{
                    getContactParts(item.primary_contact_no).code
                  }}</span
                  >&nbsp;
                  <span>{{
                    getContactParts(item.primary_contact_no).number
                  }}</span>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                  <v-menu offset-y>
                    <template #activator="{ props }">
                      <v-icon v-bind="props">mdi-dots-vertical</v-icon>
                    </template>

                    <v-list density="compact">
                      <v-list-item
                        @click.stop="View_Customer(item)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="green">mdi-eye</v-icon>
                        </template>
                        <v-list-item-title>View Customer</v-list-item-title>
                      </v-list-item>

                      <v-divider class="my-1" />

                      <v-list-item
                        @click.stop="Edit_Customer(item)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="blue">mdi-pencil</v-icon>
                        </template>
                        <v-list-item-title>Edit Customer</v-list-item-title>
                      </v-list-item>

                      <v-divider class="my-1" />

                      <v-list-item
                        @click.stop="Delete_customer(item)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="red">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>Delete Customer</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>

                <template v-slot:[`item.customer_type`]="{ item }">
                  <span
                    :style="{
                      color:
                        item.customer_type === 'BUSINESS'
                          ? '#10559A'
                          : item.customer_type === 'INDIVISUAL'
                          ? '#DB4C77'
                          : item.customer_type === 'UNREGISTERED'
                          ? 'orange'
                          : 'grey',
                      fontWeight: '500',
                    }"
                  >
                    {{
                      item.customer_type === "BUSINESS"
                        ? "Business"
                        : item.customer_type === "INDIVISUAL"
                        ? "Individual"
                        : item.customer_type === "UNREGISTERED"
                        ? "Unregistered"
                        : item.customer_type
                    }}
                  </span>
                </template>

                <template v-slot:[`item.address_line_1`]="{ item }">
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <div v-on="on">
                        {{
                          item.address_line_1 &&
                          item.address_line_1.length >= 10
                            ? item.address_line_1.substr(0, 10) + "..."
                            : item.address_line_1 || "N/A"
                        }}
                      </div>
                    </template>
                    <div class="textWrap" style="max-width: 250px">
                      {{ item.address_line_1 || "N/A" }}
                    </div>
                  </v-tooltip>
                </template>
                <template v-slot:[`item.item_details_names`]="{ item }">
                  <span
                    v-if="
                      item.item_details_names &&
                      item.item_details_names.length > 0
                    "
                    >{{ item.item_details_names.join(", ") }}</span
                  >
                  <span v-else>N/A</span>
                </template>

                <template v-slot:[`item.legal_name`]="{ item }">
                  <span>{{
                    item.customer_type == "BUSINESS"
                      ? item.legal_name
                      : item.customer_name
                  }}</span>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalItems} customers`
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn
                    :disabled="currentPage === 1"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="currentPage = currentPage - 1"
                  >
                    Previous
                  </v-btn>
                  <div class="page-numbers">
                    <v-btn
                      v-for="page in visiblePages"
                      :key="page"
                      :variant="page === currentPage ? 'elevated' : 'text'"
                      size="small"
                      :class="
                        page === currentPage ? 'active-page' : 'inactive-page'
                      "
                      @click="currentPage = page"
                    >
                      {{ page }}
                    </v-btn>
                  </div>
                  <v-btn
                    :disabled="currentPage === pageCount"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="currentPage = currentPage + 1"
                  >
                    Next
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card>

    <div v-if="componentCheck == 1">
      <AddPrefix
        :addPrefixDialog="addPrefixDialog"
        @clicked="addPrefixDialog = false"
        v-on:errorMsg="error_info"
        :prefixData="prefixData"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteCustomer
        :deleteCustomerDialog="deleteCustomerDialog"
        :rowInfo="rowInfo"
        @clicked="deleteCustomerDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import AddPrefix from "./AddPrefix.vue";
import { customer_function } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import DeleteCustomer from "./DeleteCustomer.vue";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
export default {
  components: {
    SnackBar,
    AddPrefix,
    DeleteCustomer,
  },
  props: {
    searchValue: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      SnackBarComponent: {},
      tableLoading: false,
      componentCheck: 0,
      suppliereHeaders: [
        {
          title: "Reference ID",
          value: "customer_display_id",
          sortable: false,
        },
        {
          title: "Legal Name",
          value: "legal_name",
          sortable: false,
        },
        {
          title: "Business Type",
          value: "customer_type",
          sortable: false,
        },
        {
          title: "Product Name",
          value: "item_details_names",
          sortable: false,
        },
        {
          title: "Contact Name",
          value: "primary_contact_name",
          sortable: false,
        },
        {
          title: "Email ID",
          value: "customer_email_id",
          sortable: false,
        },
        {
          title: "Contact No",
          value: "primary_contact_no",
          sortable: false,
        },
        {
          title: "Address",
          value: "address_line_1",
          sortable: false,
        },

        {
          title: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
      customerRecords: [],
      fixed: false,
      customerItem: {},
      addPrefixDialog: false,
      deleteCustomerDialog: false,
      rowInfo: {},
      prefix: "",
      prefixData: "",
      // Pagination properties
      itemsPerPage: 10,
      currentPage: 1,
      sortBy: [{ key: "customer_display_id", order: "asc" }],
      windowHeight: 0,
      tableHeight: 0,
    };
  },
  computed: {
    filteredSuppliers() {
      if (!this.searchValue) return this.customerRecords;

      const search = this.searchValue.toLowerCase();
      return this.customerRecords.filter((item) => {
        return Object.values(item)
          .filter((v) => v !== null && v !== undefined)
          .join(" ")
          .toLowerCase()
          .includes(search);
      });
    },
    totalItems() {
      return this.filteredSuppliers.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    paginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredSuppliers.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
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
  },
  async created() {
    this.windowHeight = window.innerHeight - 120;
    this.tableHeight = this.windowHeight - 120;
    await this.fetch_customers();
  },
  watch: {
    searchValue() {
      this.currentPage = 1; // Reset to first page when search changes
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
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
    Add_customer() {
      this.$router.push("/home/CreateCustomer");
    },
    Add_prefix() {
      this.componentCheck = 1;
      this.addPrefixDialog = true;
      this.prefixData = this.prefix;

      // Send the prefix value (empty string if undefined)
      // this.prefix = item.customer_display_id || "";

      // console.log("prefix sent:", this.prefixData);
    },

    Edit_Customer(item) {
      this.$router.push("/home/EditCustomer");
      this.$store.commit("SetcustomerData", item);
      // console.log("item", item)
    },
    View_Customer(item) {
      this.$router.push("/home/ViewCustomer");
      this.$store.commit("SetcustomerData", item);
      // console.log("item", item)
    },
    Delete_customer(item) {
      this.componentCheck = 2;
      this.deleteCustomerDialog = true;
      this.rowInfo = item;
    },
    download_item() {
      const headers = [
        "Legal Name of Business*",
        "Brand Name",
        "Address 1 *",
        "Address 2",
        "GST Id",
        "PAN Id",
        "CIN Number",
        "Primary Name*",
        "Primary Email ID*",
        "Primary Country Code*",
        "Primary Contact Number*",
        "Primary Designation*",
      ];

      let firstName =
        this.$store.getters.GetUserObj?.organization?.organization_team_id ||
        "";
      let fileName = firstName
        ? ` ${firstName}_Members Template.xlsx`
        : "Members Template.xlsx";
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, fileName);
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
      this.addPrefixDialog = false;
      this.deleteCustomerDialog = false;
      this.fetch_customers();
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
    async fetch_customers() {
      this.customerRecords = [];
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(customer_function, {
            input: {
              action_type: "LIST_CUSTOMER",
            },
          })
        );
        var response = JSON.parse(result.data.customer_function);

        if (response.Status == "SUCCESS") {
          const details = this.$store.getters.GetOrgDetails;
          // console.log(details.s3_details,'details.s3_details');
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          // console.log(signedUrl,'signedUrl');
          if (signedUrl) {
            let updatedCustomer = await this.fetch_S3_file(signedUrl);
            this.customerRecords = updatedCustomer;
          }
          // console.log(" this.customerRecords",  this.customerRecords);
          const prefixValue = response.customer_display_id;
          this.prefix = prefixValue;
          this.tableLoading = false;
        } else {
          this.customerRecords = [];
          const prefixValue = response.customer_display_id;
          this.prefix = prefixValue;
          this.tableLoading = false;
        }
      } catch (error) {
        this.customerRecords = [];

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
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
    },
    getSortValue(value, key) {
      if (!value) return "";

      if (key === "customer_display_id") {
        const str = String(value);

        const prefix = str.match(/^[A-Za-z]+/)?.[0] || "";

        const number = parseInt(str.match(/\d+/)?.[0] || "0", 10);

        return [prefix.toLowerCase(), number];
      }

      if (
        key === "legal_name" ||
        key === "primary_contact_name" ||
        key === "customer_type"
      ) {
        return value.toLowerCase();
      }

      return value;
    },
  },
};
</script>

<style scoped>
.card-container {
  position: relative;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-field {
  max-width: 320px;
}

.header-actions :deep(.v-field) {
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.header-actions :deep(.v-field__input) {
  color: #333 !important;
  font-size: 14px !important;
}

.header-actions :deep(.v-field__label) {
  color: #666 !important;
  font-size: 12px !important;
}

.header-actions :deep(.v-field__prepend-inner) {
  color: #666 !important;
}

.header-actions :deep(.v-field__append-inner) {
  color: #666 !important;
}

.header-actions :deep(.v-field__outline) {
  color: #e0e0e0 !important;
}

.header-actions :deep(.v-field--focused .v-field__outline) {
  color: #db4c77 !important;
}

.header-actions :deep(.v-text-field input::placeholder) {
  color: #999 !important;
}

.header-actions :deep(.v-select__selection) {
  color: #333 !important;
  font-size: 14px !important;
}

/* Ensure fields are visible */
.header-actions .v-text-field,
.header-actions .v-select {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
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

/* Responsive Design for Action Buttons */
@media (max-width: 768px) {
  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
}
</style>
