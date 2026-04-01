<template>
  <div>
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-group</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Customers</span>
          <span class="header-subtitle">Manage your customers</span>
        </div>
      </div>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" class="action-btn" size="small">
            <v-icon>mdi-dots-vertical</v-icon>
            <span>Actions</span>
          </v-btn>
        </template>
        <v-list density="compact">
          <v-list-item
            @click="
              downloadFile(b2btemplateurl, 'Customer_Business_Template.xlsx')
            "
          >
            <template #prepend>
              <v-icon color="primary">mdi-download</v-icon>
            </template>
            <v-list-item-title>Download Business Template</v-list-item-title>
          </v-list-item>
          <v-list-item
            @click="
              downloadFile(
                individualtemplateurl,
                'Customer_Individual_Template.xlsx'
              )
            "
          >
            <template #prepend>
              <v-icon color="primary">mdi-download</v-icon>
            </template>
            <v-list-item-title>Download Individual Template</v-list-item-title>
          </v-list-item>
          <v-divider class="my-1" />
          <v-list-item>
            <template #prepend>
              <v-icon color="primary">mdi-import</v-icon>
            </template>
            <BulkBusiness
              :on-success="handleSuccessbusiness"
              :before-upload="beforeUpload"
            />
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon color="primary">mdi-import</v-icon>
            </template>
            <BulkIndividual
              :on-success="handleSuccess"
              :before-upload="beforeUpload"
            />
          </v-list-item>
          <v-list-item @click="export_item">
            <template #prepend>
              <v-icon color="primary">mdi-download</v-icon>
            </template>
            <v-list-item-title>Export</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-row class="mt-5">
      <v-col cols="4">
        <v-card class="ml-2" rounded="lg" elevation="0">
          <v-toolbar color="transparent">
            <v-text-field
              v-model="searchlist"
              prepend-inner-icon="mdi-magnify"
              class="ml-2 mt-3"
              rounded="lg"
              density="compact"
              variant="outlined"
              max-width="190"
              placeholder="Search"
              clearable
            />
            <v-btn
              class="action-btn ml-4 mt-n2"
              size="small"
              @click="Add_customer"
            >
              <v-icon>mdi-plus</v-icon>
              <span>Add Customer</span>
            </v-btn>
          </v-toolbar>

          <v-data-table
            hide-default-footer
            :headers="TableHeaders"
            :height="CommonVuetifyObj.height - 163"
            :items="filteredCustomers"
            :loading="tableLoading"
            :items-per-page="itemsPerPage"
            :fixed-header="true"
            density="comfortable"
            class="modern-data-table"
            @click:row="openDetails"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4"
                  >mdi-account-group-outline</v-icon
                >
                <div class="text-h6 grey--text mb-2">No Customers Found</div>
                <div class="text-body-2 grey--text">
                  Try adjusting your search criteria or add a new customer.
                </div>
              </div>
            </template>

            <template #[`item.balance`]="{ item }">
              <div>{{ item.balance || "-" }}</div>
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

            <template v-slot:loading>
              <div class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-4"
                ></v-progress-circular>
                <div class="text-body-2 grey--text">Loading customers...</div>
              </div>
            </template>

            <template v-slot:[`item.legal_name`]="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="text-truncate"
                    style="max-width: 200px"
                  >
                    {{ item.legal_name }}
                  </div>
                </template>
                <span>{{ item.legal_name }}</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col cols="8">
        <div v-if="selectedCustomer">
          <v-card height="60" rounded="lg" elevation="2" class="mr-2">
            <v-row>
              <v-col cols="3">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="ml-2 mt-3">mdi-account</v-icon>
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <div
                        v-bind="props"
                        class="ml-2 mt-4 text-truncate"
                        style="max-width: 200px"
                      >
                        {{ selectedCustomer.legal_name }}
                      </div>
                    </template>
                    <span>{{ selectedCustomer.legal_name }}</span>
                  </v-tooltip>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="d-flex align-center">
                  <v-icon color="orange" class="ml-n4 mt-4">mdi-id-card</v-icon>
                  <div class="ml-1 mt-4">
                    {{ selectedCustomer.customer_display_id }}
                  </div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="d-flex align-center">
                  <v-icon color="blue" class="ml-n10 mt-4"
                    >mdi-email-outline</v-icon
                  >
                  <div class="ml-2 mt-4">
                    {{ selectedCustomer.customer_email_id }}
                  </div>
                </div>
              </v-col>
              <v-col cols="3">
                <div class="d-flex align-center">
                  <v-icon color="green" class="ml-2 mt-4">mdi-phone</v-icon>
                  <div class="ml-1 mt-4">
                    {{ selectedCustomer.primary_contact_no.replaceAll("_", " ") }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <v-data-table
            hide-default-footer
            fixed-header="true"
            :headers="customerDetailsHeader"
            :height="CommonVuetifyObj.height - 230"
            :items="customerTransactions"
            :loading="tableLoadingdata"
            class="modern-data-table mt-2"
          >
            <template #[`item.transaction_type`]="{ item }">
              <div>{{ item.transaction_type.replaceAll("_", " ") }}</div>
            </template>
            <template #loading>
              <div class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-2"
                />
                <div class="text-body-2 grey--text">Loading transactions...</div>
              </div>
            </template>
          </v-data-table>
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalItems === 0
                  ? "No Results"
                  : `Showing ${customerTransactions.length} of ${totalItems}`
              }}
            </div>
            <div class="pagination-controls">
              <v-btn
                :disabled="currentPage === 1"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage - 1"
                >Previous</v-btn
              >
              <div class="page-numbers">
                <v-btn
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === currentPage ? 'elevated' : 'text'"
                  size="small"
                  :class="page === currentPage ? 'active-page' : 'inactive-page'"
                  @click="currentPage = page"
                  >{{ page }}</v-btn
                >
              </div>
              <v-btn
                :disabled="currentPage === pageCount"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage + 1"
                >Next</v-btn
              >
            </div>
          </div>
        </div>
        
        <!-- No data state when no customer is selected -->
        <div v-else class="no-data-container">
          <v-card class="no-data-card" elevation="2">
            <div class="text-center py-12">
              <v-icon size="80" color="grey lighten-2" class="mb-6">mdi-account-group-outline</v-icon>
              <div class="text-h5 grey--text mb-4">No Customer Selected</div>
              <div class="text-body-1 grey--text mb-6">
                Select a customer from the list to view their details and transactions
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                @click="Add_customer"
                class="mt-4"
              >
                <v-icon left>mdi-plus</v-icon>
                Add New Customer
              </v-btn>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div>
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
import BulkBusiness from "@/components/CustomerManagement/Bulkupload/BulkBusiness.vue";
import BulkIndividual from "@/components/CustomerManagement/Bulkupload/BulkIndividual.vue";
import DeleteCustomer from "./DeleteCustomer.vue";
import { API, graphqlOperation } from "aws-amplify";
import { customer_function } from "@/graphql/mutations.js";
import { get_customer_transactions } from "@/graphql/queries";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { useDisplay } from "vuetify/lib/framework.mjs";
import SnackBar from "@/components/SnackBar.vue";
import * as XLSX from "xlsx";

export default {
  components: {
    SnackBar,
    BulkIndividual,
    DeleteCustomer,
    BulkBusiness,
  },
  data: () => ({
    height: 0,

    currentPage: 1,
    itemsPerPage: 50,
    searchlist: "",
    b2btemplateurl: "",
    individualtemplateurl: "",
    deleteCustomerDialog: false,
    tableLoading: false,
    tableLoadingdata: false,
    selectedCustomer: null,
    CommonVuetifyObj: {},
    SnackBarComponent: {},
    customerItem: {},
    customerRecords: [],
    customerTransactions: [],
    excelHeaders: [],
    excelTableData: [],
    rowInfo: null,
    TableHeaders: [
      { title: "Legal Name", value: "legal_name" },
      { title: "Amount", value: "balance" },
      { title: "Actions", value: "actions" },
    ],
    customerDetailsHeader: [
      { title: "Invoice No.", value: "invoice_no" },
      { title: "Transaction Type", value: "transaction_type" },
      {
        title: "Transaction Details",
        value: "transaction_details",
      },
      { title: "Transaction Date", value: "transaction_date" },
      { title: "Total Amount", value: "total_cost" },
      { title: "Balance Amount", value: "balance_cost" },
    ],
  }),
  computed: {
    filteredCustomers() {
      if (!this.searchlist) return this.customerRecords;
      const search = this.searchlist.toLowerCase();
      return this.customerRecords.filter((item) =>
        Object.values(item)
          .filter((v) => v !== null && v !== undefined)
          .join(" ")
          .toLowerCase()
          .includes(search)
      );
    },
    pageCount() {
      return Math.ceil(this.customerTransactions.length / this.itemsPerPage);
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
  async mounted() {
    this.CommonVuetifyObj = useDisplay();
    await this.fetch_customers();
    if (this.customerRecords.length > 0) {
      this.selectedCustomer = { ...this.customerRecords[0] };
      await this.fetch_customer_transactions(
        this.customerRecords[0].customer_id,
        this.customerRecords[0].organization_id
      );
    }
  },
  methods: {
    async downloadFile(url, fileName) {
      if (!url) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: `No URL provided for ${fileName}`,
          timeout: 5000,
          Top: true,
        };
        return;
      }
      try {
        const details = this.$store.getters.GetOrgDetails;
        const signedUrl = await getS3SignedUrl(url, details.s3_details);
        if (!signedUrl) {
          throw new Error("Failed to generate signed URL");
        }
        const response = await fetch(signedUrl);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: `${fileName} downloaded successfully`,
          timeout: 5000,
          Top: true,
        };
      } catch (error) {
        console.error("Error downloading the file:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: `Failed to download ${fileName}: ${error.message}`,
          timeout: 5000,
          Top: true,
        };
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
        if (response.Status === "SUCCESS") {
          this.b2btemplateurl = response.b2b_template_url;
          this.individualtemplateurl = response.indivisual_template_url;
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          // console.log(details.s3_details,'details.s3_detailsLisy');
          // console.log(signedUrl,'signedUrl');
          if (signedUrl) {
            let updatedCustomer = await this.fetch_S3_file(signedUrl);
            this.customerRecords = updatedCustomer.sort((a, b) =>
              a.legal_name.localeCompare(b.legal_name)
            );
          }
          this.tableLoading = false;
          
        } else {
          this.b2btemplateurl = response.b2b_template_url || "";
          this.individualtemplateurl = response.indivisual_template_url || "";
          this.customerRecords = [];
          this.tableLoading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Failed to fetch customers",
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.b2btemplateurl = "";
        this.individualtemplateurl = "";
        this.customerRecords = [];
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            error.errors?.[0]?.message || "Error fetching customers",
          timeout: 5000,
          Top: true,
        };
      }
    },
    async fetch_customer_transactions(customer_id, organization_id) {
      this.customerTransactions = [];
      this.tableLoadingdata = true;
      try {
        // console.log("Fetching transactions for:", {
        //   customer_id,
        //   organization_id,
        // });
        let result = await API.graphql(
          graphqlOperation(get_customer_transactions, {
            customer_id: customer_id,
            organization_id: organization_id,
            nextToken: null,
            limit: 15,
          })
        );
        this.tableLoadingdata = false;
        let response = JSON.parse(result.data.get_customer_transactions);
        this.customerTransactions = response.items || [];
        this.totalItems = this.customerTransactions.length;
        // console.log("Fetched customerTransactions:", this.customerTransactions);
      } catch (error) {
        this.customerTransactions = [];
        this.totalItems = 0;
        this.tableLoadingdata = false;
        console.error("Error fetching transactions:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error fetching transactions",
          timeout: 5000,
          Top: true,
        };
      }
    },
    async fetch_S3_file(value) {
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
        const responseData = await response.text();
        try {
          return JSON.parse(responseData);
        } catch (jsonError) {
          throw new Error("Error parsing JSON response: " + jsonError.message);
        }
      } catch (error) {
        console.error("Error fetching file:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error fetching file: " + error.message,
          timeout: 5000,
          Top: true,
        };
        return [];
      }
    },
    Add_customer() {
      this.$router.push("/home/CreateCustomer");
    },
    Edit_Customer(item) {
      this.$router.push("/home/EditCustomer");
      this.$store.commit("SetcustomerData", item);
    },
    View_Customer(item) {
      this.$router.push("/home/ViewCustomer");
      this.$store.commit("SetcustomerData", item);
    },
    Delete_customer(item) {
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
    handleSuccess({ results, header }) {
      this.excelTableData = results;
      this.$router.push("/home/UploadCustomer");
      this.excelHeaders = header;
      let customerData = {
        excelHeaders: this.excelHeaders,
        excelTableData: this.excelTableData,
        customerType: "INDIVISUAL",
      };
      this.$store.commit("SetcustomerDetails", customerData);
    },
    handleSuccessbusiness({ results, header }) {
      this.excelTableData = results;
      this.$router.push("/home/UploadCustomer");
      this.excelHeaders = header;
      let customerData = {
        excelHeaders: this.excelHeaders,
        excelTableData: this.excelTableData,
        customerType: "BUSINESS",
      };
      this.$store.commit("SetcustomerDetails", customerData);
    },
    openDetails(event, { item }) {
      // console.log("Row clicked, item:", item);
      this.selectedCustomer = { ...item };
      // console.log("Updated selectedCustomer:", this.selectedCustomer);
      this.fetch_customer_transactions(item.customer_id, item.organization_id);
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 5;
      if (isLt1M) {
        return true;
      }
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: "File size must be less than 5MB",
        timeout: 5000,
        Top: true,
      };
      return false;
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
      this.deleteCustomerDialog = false;
      this.fetch_customers().then(() => {
        if (
          this.selectedCustomer &&
          this.rowInfo &&
          this.selectedCustomer.customer_id === this.rowInfo.customer_id
        ) {
          this.selectedCustomer =
            this.customerRecords.length > 0
              ? { ...this.customerRecords[0] }
              : null;
          // console.log("Post-delete selectedCustomer:", this.selectedCustomer);
          if (this.selectedCustomer) {
            this.fetch_customer_transactions(
              this.selectedCustomer.customer_id,
              this.selectedCustomer.organization_id
            );
          } else {
            this.customerTransactions = [];
            this.totalItems = 0;
          }
        }
      });
    },
    async export_item() {
      try {
        const result = await API.graphql(
          graphqlOperation(export_customer_data, {
            input: {
              action_type: "EXPORT_CUSTOMER",
            },
          })
        );
        const response = JSON.parse(result.data.export_customer_data);
        if (response.Status === "SUCCESS" && response.url) {
          await this.downloadFile(response.url, "Exported_Customers.xlsx");
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Failed to export customers",
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.error("Error exporting customers:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error exporting customers",
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style scoped>
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

.action-btn {
  text-transform: none;
  font-weight: 500;
}

.modern-data-table {
  border-radius: 8px;
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
