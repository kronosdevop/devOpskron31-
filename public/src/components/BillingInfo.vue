<template>
  <div>
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-receipt-text</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Billing Info</span>
          <span class="header-subtitle">View your billing transactions</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <v-btn 
          color="primary" 
          size="small" 
          class="text-capitalize" 
          @click="back_action()" 
          prepend-icon="mdi-step-backward"
          style="background: #DB4C77 !important; color: white !important;"
        >
          Back
        </v-btn>
      </div>
    </v-app-bar>

    <v-card flat class="overflow-y-auto mt-10">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                :fixed-header="fixed"
                :headers="headers"
                :height="windowHeight"
                :items="paginatedItems"
                :loading="tableLoading"
                hide-default-footer
                density="comfortable"
                class="modern-data-table"
                hover
                multi-sort
                @click:row="handle_row_click"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey lighten-1" class="mb-4"
                      >mdi-receipt-text</v-icon
                    >
                    <div class="text-h6 grey--text mb-2">No Billing Records Found</div>
                    <div class="text-body-2 grey--text">
                      No billing transactions available at the moment.
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
                    <div class="text-body-2 grey--text">Loading billing records...</div>
                  </div>
                </template>

                <!-- Billing ID -->
                <template v-slot:[`item.billing_id`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="primary" class="mr-2">mdi-receipt</v-icon>
                    <span class="caption font-weight-medium">#{{ item.billing_id }}</span>
                  </div>
                </template>

                <!-- Amount -->
                <template v-slot:[`item.total_ammount_to_pay`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="green" class="mr-2">mdi-currency-usd</v-icon>
                    <span class="caption font-weight-medium">{{ item.total_ammount_to_pay + " $" }}</span>
                  </div>
                </template>

                <!-- Month -->
                <template v-slot:[`item.billing_month`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="grey" class="mr-2">mdi-calendar-month</v-icon>
                    <span class="caption">{{ item.billing_month }}</span>
                  </div>
                </template>

                <!-- Year -->
                <template v-slot:[`item.billing_year`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
                    <span class="caption">{{ item.billing_year }}</span>
                  </div>
                </template>

                <!-- Status -->
                <template v-slot:[`item.billing_due`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon
                      size="16"
                      :color="item.billing_due === 'PAID' ? 'green' : 'orange'"
                      class="mr-2"
                    >
                      {{ item.billing_due === 'PAID' ? 'mdi-check-circle' : 'mdi-clock' }}
                    </v-icon>
                    <span
                      class="caption font-weight-medium"
                      :class="item.billing_due === 'PAID' ? 'text-green' : 'text-orange'"
                    >
                      {{ item.billing_due }}
                    </span>
                  </div>
                </template>

                <!-- Actions -->
                <template v-slot:[`item.action`]="{ item }">
                  <div class="d-flex align-center justify-center">
                    <v-btn
                      v-if="item.billing_due == 'PAID'"
                      icon
                      size="small"
                      variant="text"
                      color="primary"
                      @click.stop="download_invoice(item)"
                      class="cursor-pointer"
                    >
                      <v-icon size="18">mdi-download</v-icon>
                    </v-btn>
                    <span v-else class="caption">-</span>
                  </div>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalCount === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalCount} billing records`
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn
                    :disabled="currentPage === 1"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="currentPage = currentPage - 1"
                    style="color: #666 !important;"
                  >
                    Previous
                  </v-btn>
                  <div class="page-numbers">
                    <v-btn
                      v-for="page in visiblePages"
                      :key="page"
                      :variant="page === currentPage ? 'elevated' : 'text'"
                      size="small"
                      :class="page === currentPage ? 'active-page' : 'inactive-page'"
                      @click="currentPage = page"
                      :style="page === currentPage ? 'background: #DB4C77 !important; color: white !important;' : 'color: #666 !important;'"
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
                    style="color: #666 !important;"
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
      <ViewBillingInfo
        :ViewbillingDialog="ViewbillingDialog"
        :rowInfo="rowInfo"
        @clicked="ViewbillingDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/* eslint-disable */

import { format_Date } from "@/JsonFiles/DateFormate.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import {
  list_billing_transactions,
  genrate_billing_invoice,
} from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewBillingInfo from "./ViewBillingInfo.vue";
import SnackBar from "@/components/SnackBar.vue";
const FileSaver = require("file-saver");
import axios from "axios";
export default {
  mixins: [get_Org_details],
  components: {
    ViewBillingInfo,
    SnackBar,
  },
  data() {
    return {
      tableData: [],
      SnackBarComponent: {},
      tableLoading: false,
      fixed: true,
      createdOn: "",
      billingRate: "",
      billingcurrency: "",
      headers: [
        { title: "Billing Id", value: "billing_id", sortable: false },
        { title: "Amount", value: "total_ammount_to_pay", sortable: false },
        { title: "Month", value: "billing_month", sortable: false },
        { title: "Year", value: "billing_year", sortable: false },
        { title: "Status", value: "billing_due", sortable: false },
        { title: "Actions", value: "action", sortable: false },
      ],
      rowInfo: {},
      componentCheck: 0,
      ViewbillingDialog: false,
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
    };
  },

  async created() {
    this.windowHeight = window.innerHeight - 200;

    await this.get_billing_details();
    await this.get_Org_details();
    this.get_details();
  },

  computed: {
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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

  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },

  methods: {
    async download_invoice(item) {
      try {
        let result = await API.graphql(
          graphqlOperation(genrate_billing_invoice, {
            input: {
              transaction_id: item.transaction_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.genrate_billing_invoice);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.dwonload_pdf(
            response.url,
            item.billing_month + "-" + item.billing_year
          );
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
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async dwonload_pdf(url, fileName) {
      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          // Create a blob from the response
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
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

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
    handle_row_click(value) {
      this.rowInfo = value;
      this.ViewbillingDialog = true;
      this.componentCheck = 1;
    },
    async get_billing_details() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_billing_transactions, {
            organization_id: data.organization.organization_id,
            billing_due: "ALL",

            limit: 200,
            next_token: null,
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var dataArray = [];
        var response = JSON.parse(result.data.list_billing_transactions);

        this.tableData = response.details;
        this.$store.commit("SetadministrationCheck", true);
        this.updatePageItems();
      } catch (error) {
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

    back_action() {
      this.$emit("backAction", 0);
    },

    get_details() {
      this.createdOn = this.orgDetails.organization.organization_created_on;
      this.billingRate = this.orgDetails.organization.billing_rate;
      this.billingcurrency =
        this.orgDetails.organization.billing_currency == "DOLLAR"
          ? "$"
          : " " + this.orgDetails.organization.billing_currency;
    },

    fetch_value(val) {
      return format_Date(val);
      // const d = new Date(parseInt(val * 1000));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
    },

    updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedItems = this.tableData.slice(start, end);
    },
  },
};
</script>

<style scoped>
/* Card Container */
.card-container {
  position: relative;
}

/* Modern Data Table */
.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Table Footer */
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
  background-color: #DB4C77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

/* Column width controls */
.modern-data-table :deep(.v-data-table__wrapper table) {
  table-layout: fixed;
  width: 100%;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(1)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(2)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(3)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(4)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(5)) {
  width: 20% !important;
  max-width: 20% !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:nth-child(6)) {
  width: 20% !important;
  max-width: 20% !important;
  text-align: center;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(1)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(2)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(3)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(4)) {
  width: 15% !important;
  max-width: 15% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(5)) {
  width: 20% !important;
  max-width: 20% !important;
}

.modern-data-table :deep(.v-data-table__wrapper td:nth-child(6)) {
  width: 20% !important;
  max-width: 20% !important;
  text-align: center;
}

/* Ensure the actions button container doesn't expand */
.modern-data-table :deep(.v-data-table__wrapper td:nth-child(6) .d-flex) {
  width: 100%;
  justify-content: center;
}

/* Override Vuetify's default column spacing */
.modern-data-table :deep(.v-data-table__wrapper th),
.modern-data-table :deep(.v-data-table__wrapper td) {
  padding: 8px 12px !important;
}

.modern-data-table :deep(.v-data-table__wrapper th:last-child),
.modern-data-table :deep(.v-data-table__wrapper td:last-child) {
  padding-right: 8px !important;
  padding-left: 8px !important;
}
</style>