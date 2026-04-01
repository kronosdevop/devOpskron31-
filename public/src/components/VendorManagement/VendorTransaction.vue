<template>
  <div >
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2" >
        <!-- Header with title -->
       

        <!-- Data Table -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="headers"
            :items="paginatedItems"
            :loading="tableLoading"
            :sort-by="['transaction_created_on']"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="totalItems"
            hide-default-footer
            class="elevation-2 dtwidth text-caption rounded-lg"
            density="compact"
            hover
            multi-sort
            :fixed-header="true"
            :height="height"
            @update:sort-by="handleSortChange"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4"
                  >mdi-currency-rupee</v-icon
                >
                <div class="text-h6 grey--text mb-2">No Transactions Found</div>
                <div class="text-body-2 grey--text">
                  Try adjusting your filter criteria or date range.
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
                  Loading transactions...
                </div>
              </div>
            </template>

            <!-- Vendor -->
            <template v-slot:[`item.suppliers_id_text`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-avatar size="24" class="mr-2" color="primary">
                  <span
                    class="white--text font-weight-medium"
                    style="font-size: 12px"
                  >
                    {{
                      item.suppliers_id_text
                        ? item.suppliers_id_text.substring(0, 1).toUpperCase()
                        : "V"
                    }}
                  </span>
                </v-avatar> -->
                <span class="caption font-weight-medium">{{
                  item.suppliers_id_text || "-"
                }}</span>
              </div>
            </template>

            <!-- Member Name -->
            <template v-slot:[`item.user_id_text`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="grey" class="mr-2"
                  >mdi-account-outline</v-icon
                > -->
                <span class="caption font-weight-medium">{{
                  item.user_id_text || "-"
                }}</span>
              </div>
            </template>

            <!-- Amount -->
            <template v-slot:[`item.amount`]="{ item }">
              <span class="caption font-weight-bold primary--text">
                {{ item.amount || "0.00" }}
              </span>
            </template>

            <!-- Bill Date -->
            <template v-slot:[`item.bill_date`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="grey" class="mr-2"
                  >mdi-calendar</v-icon
                > -->
                <span class="caption">{{ get_date1(item.bill_date) }}</span>
              </div>
            </template>

            <!-- Initiated On -->
            <template v-slot:[`item.transaction_created_on`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="grey" class="mr-2"
                  >mdi-clock-outline</v-icon
                > -->
                <span class="caption">{{
                  get_date(item.transaction_created_on)
                }}</span>
              </div>
            </template>

            <!-- Status -->
            <template v-slot:[`item.transaction_status`]="{ item }">
              <v-chip
                :color="getStatusColor(item.transaction_status)"
                size="small"
                variant="flat"
                class="font-weight-medium"
              >
                {{ item.transaction_status }}
              </v-chip>
            </template>

            <!-- Documents -->
            <template v-slot:[`item.docs`]="{ item }">
              <v-btn
                v-if="item.media_keys && item.media_keys !== 'N/A'"
                icon="mdi-file"
                size="small"
                color="primary"
                variant="text"
                @click="show_file(item)"
              />
              <span v-else class="caption grey--text">N/A</span>
            </template>
          </v-data-table>
          <div class="table-footer">
        <div class="footer-info">
          {{
            totalItems === 0
              ? "No Results"
              : `Showing ${paginatedItems.length} of ${totalItems} transactions`
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
      
      <!-- Modern Table Footer -->
  
    </div>
    <div v-if="componentCheck == 1">
      <ViewExpenses
        :rowInfo="rowInfo"
        :expenseView="expenseView"
        @clicked="expenseView = false"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { list_vendor_transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewExpenses from "@/components/ExpensesManagement/ExpensePopups/ViewExpenses.vue";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";

import SnackBar from "@/components/SnackBar.vue";
export default {
  props: {
    fromDate: {
      type: String,
      default: ''
    },
    toDate: {
      type: String,
      default: ''
    },
    statusType: {
      type: String,
      default: 'ALL'
    }
  },
  components: {
    ViewExpenses,
    SnackBar,
  },
  mixins: [get_Org_details],
  emits: ['filter-applied'],
  data() {
    let today = new Date();
    let lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    return {
      fixed: true,
      expenseView: false,
      date: lastMonth.toISOString().substr(0, 10),
      todate: today.toISOString().substr(0, 10),
      goLoading: false,
      tableData: [],
      rowInfo: {},
      selectStatusType: this.statusType,
      SnackBarComponent: {},
      tableLoading: false,
      componentCheck: 0,
      height: 0,
      headers: [
        { title: "Vendor", key: "suppliers_id_text", sortable: false },
        { title: "Member Name", key: "user_id_text", sortable: false },
        { title: "Amount", key: "amount", sortable: false },
        { title: "Bill Date", key: "bill_date", sortable: false },
        {
          title: "Initiated On",
          key: "transaction_created_on",
          sortable: false,
        },
        { title: "Status", key: "transaction_status", sortable: false },
        { title: "Documents", key: "docs", sortable: false },
      ],
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 20,
      pageCount: 1,
    };
  },
  mounted() {
    this.height = window.innerHeight - 250;
  },
  async created() {
    await this.get_Org_details();
    await this.get_initiated_expense();
  },
  watch: {
    fromDate(newVal) {
      if (newVal) {
        this.date = this.parseDateFromDisplay(newVal);
        this.getexpense_list();
      }
    },
    toDate(newVal) {
      if (newVal) {
        this.todate = this.parseDateFromDisplay(newVal);
        this.getexpense_list();
      }
    },
    statusType(newVal) {
      this.selectStatusType = newVal;
      this.getexpense_list();
    }
  },
  computed: {
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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
  },
  watch: {
    currentPage(newVal, oldVal) {
      // When the page changes, scroll to top of table
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
  methods: {
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    formatDateForAPI(date) {
      // Ensure date is in yyyy-mm-dd format for API calls
      if (!date) return null;

      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    parseDateFromDisplay(displayDate) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      if (!displayDate) return '';
      const parts = displayDate.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return displayDate;
    },

    getStatusColor(status) {
      switch (status) {
        case "APPROVED":
          return "success";
        case "PENDING":
          return "warning";
        case "WITHDRAWN":
          return "info";
        case "REJECTED":
          return "error";
        default:
          return "grey";
      }
    },
    getexpense_list() {
      this.tableData = [];
      this.currentPage = 1;
      this.totalItems = 0;
      this.goLoading = true;
      this.get_initiated_expense();
      // Emit filter applied event
      this.$emit('filter-applied', {
        fromDate: this.computedDateDisplay,
        toDate: this.dataDisplayFormatted,
        statusType: this.selectStatusType
      });
    },
    get_date1(val) {
      var data = formatdisplayDate(val);
      return data;
    },
    show_file(item) {
      if (
        ["jpg", "jpeg", "img", "png"].indexOf(
          String(item.media_keys.split(".").pop())
        ) > -1
      ) {
        this.componentCheck = 1;
        this.rowInfo = item;
        this.expenseView = true;
      } else {
        this.pdf = this.s3get(item);
        window.open(this.pdf);
      }
    },
    s3get(item) {
      var s3Bucket = new AWS.S3({
        region: this.orgDetails.s3_details.region,
        accessKeyId: this.orgDetails.s3_details.access_key,
        secretAccessKey: this.orgDetails.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: this.orgDetails.s3_details.bucket_name,
        Key: "workflow/" + item.media_keys.split("workflow/")[1],
        Expires: 6000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);

      return url;
    },
    get_date(date) {
      return formatedatetime(date);
    },
    handleSortChange(value) {
      // Implement sorting logic here
    },
    async get_initiated_expense() {
      this.tableLoading = true;

      try {
        // Use props for date filtering if available
        let startDate = this.date ? this.formatDateForAPI(this.date) : null;
        let endDate = this.todate ? this.formatDateForAPI(this.todate) : null;
        
        // If we have props with display format dates, convert them
        if (this.fromDate && this.fromDate.includes('/')) {
          startDate = this.formatDateForAPI(this.parseDateFromDisplay(this.fromDate));
        }
        if (this.toDate && this.toDate.includes('/')) {
          endDate = this.formatDateForAPI(this.parseDateFromDisplay(this.toDate));
        }

        let result = await API.graphql(
          graphqlOperation(list_vendor_transactions, {
            input: {
              nextToken: null,
              limit: 100,
              start_time: startDate,
              end_time: endDate,
              transaction_status: this.selectStatusType,
            },
          })
        );
        var response = JSON.parse(result.data.list_vendor_transactions);
        this.tableLoading = false;
        this.goLoading = false;
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.goLoading = false;
          this.tableData = response.data;
          this.totalItems = this.tableData.length;
        } else {
          this.tableLoading = false;
          this.goLoading = false;
          this.tableData = [];
          this.totalItems = 0;
        }
      } catch (error) {
        this.tableLoading = false;
        this.goLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
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

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(219, 76, 119, 0.1) !important;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
  transition: all 0.2s ease;
}

.inactive-page:hover {
  background: rgba(219, 76, 119, 0.1) !important;
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

/* Responsive Design */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
  }
}
</style>