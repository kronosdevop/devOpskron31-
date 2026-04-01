<template>
  <div>
    <v-card flat>
      <!-- Top Controls: All in one row -->
      <!-- <v-row
        class="align-center px-6 pt-6 pb-2"
        
      >
        <v-col cols="auto" class="d-flex align-center">
          <v-icon class="mr-3" color="primary" size="large"
            >mdi-format-list-bulleted</v-icon
          >
          <span class="font-weight-bold text-h6"
            >Expenses ({{ totalItems }})</span
          >
        </v-col>
        <v-spacer />

        <v-col cols="auto" class="d-flex align-center">
          <v-text-field
            v-model="searchQuery"
            placeholder="Search expenses..."
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            hide-details
            density="compact"
            class="search-pill mr-4"
            style="
              min-width: 280px;
              max-width: 280px;
              height: 32px;
              border-radius: 999px;
              background: #fff;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
              font-size: 14px;
            "
            clearable
            @click:clear="searchQuery = ''"
          ></v-text-field>
        </v-col>
      </v-row> -->

      <!-- Data Table -->
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
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
                >mdi-file-document-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Expenses Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or date filters.
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
              <div class="text-body-2 grey--text">Loading expenses...</div>
            </div>
          </template>

          <!-- Expense Name -->
          <template v-slot:[`item.category_id_text`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="20" color="primary" class="mr-3"
                >mdi-format-list-bulleted</v-icon
              > -->
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.category_id_text || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <!-- Group Name -->
          <template v-slot:[`item.expense_group_id_text`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2"
                >mdi-account-group</v-icon
              > -->
              <span class="caption">
                {{ item.expense_group_id_text || "N/A" }}
              </span>
            </div>
          </template>

          <!-- Project Name -->
          <template v-slot:[`item.project_id_text`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2">mdi-briefcase</v-icon> -->
              <span class="caption">
                {{ item.project_id_text || "N/A" }}
              </span>
            </div>
          </template>

          <!-- Member Name -->
          <template v-slot:[`item.user_id_text`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-avatar size="24" color="primary" class="mr-2">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{ (item.user_id_text || "U").substring(0, 1).toUpperCase() }}
                </span>
              </v-avatar> -->
              <span class="caption">
                {{ item.user_id_text || "N/A" }}
              </span>
            </div>
          </template>

          <!-- Transaction Type -->
          <template v-slot:[`item.transaction_type`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="blue" class="mr-2"
                >mdi-swap-horizontal</v-icon
              > -->
              <span class="caption font-weight-medium">
                {{
                  item.transaction_type == "EXPENSE" ? "Expense" : "Petty Cash"
                }}
              </span>
            </div>
          </template>

          <!-- Amount -->
          <template v-slot:[`item.amount`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="green" class="mr-2"
                >mdi-currency-rupee</v-icon
              > -->
              <span class="caption font-weight-medium">
                {{ item.amount || "0.00" }}
              </span>
            </div>
          </template>

          <!-- Bill Date -->
          <template v-slot:[`item.bill_date`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon> -->
              <span class="caption">
                {{ get_date1(item.bill_date) }}
              </span>
            </div>
          </template>

          <!-- Initiated On -->
          <template v-slot:[`item.transaction_created_on`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2"
                >mdi-calendar-clock</v-icon
              > -->
              <span class="caption">
                {{ get_date(item.transaction_created_on) }}
              </span>
            </div>
          </template>

          <!-- Status -->
          <template v-slot:[`item.transaction_status`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                size="16"
                :color="getStatusColor(item.transaction_status)"
                class="mr-2"
              >
                {{ getStatusIcon(item.transaction_status) }}
              </v-icon>
              <span
                class="caption font-weight-medium"
                :class="getStatusTextColor(item.transaction_status)"
              >
                {{ item.transaction_status }}
              </span>
            </div>
          </template>
          <!-- Pending On -->
          <template v-slot:[`item.pending_on`]="{ item }">
            <div class="d-flex align-center">
              <span class="caption">{{
                getFirstInProgressUser(item.approval_user_list)
              }}</span>
            </div>
          </template>

          <!-- Documents -->
          <template v-slot:[`item.docs`]="{ item }">
            <div class="d-flex align-center justify-center">
              <span
                v-if="item.media_keys == 'N/A' || item.media_keys == undefined"
                class="caption grey--text"
              >
                N/A
              </span>
              <v-btn
                v-else
                icon
                size="small"
                variant="text"
                @click="show_file(item)"
                color="primary"
                class="cursor-pointer"
              >
                <v-icon size="18">mdi-file</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} expenses`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage === 1"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage = currentPage - 1"
              style="color: #666 !important"
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
                :style="
                  page === currentPage
                    ? 'background: #DB4C77 !important; color: white !important;'
                    : 'color: #666 !important;'
                "
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
              style="color: #666 !important"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Modern Table Footer -->

    <div v-if="componentCheck == 1">
      <ViewExpenses
        :rowInfo="rowInfo"
        :expenseView="expenseView"
        @clicked="expenseView = false"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { list_expense_transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewExpenses from "./ExpensePopups/ViewExpenses.vue";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import SnackBar from "@/components/SnackBar.vue";
export default {
  props: {
    currentBalance: {
      type: Number,
      default: 0,
    },
    fromDate: {
      type: String,
      default: "",
    },
    toDate: {
      type: String,
      default: "",
    },
    statusType: {
      type: String,
      default: "ALL",
    },
    transactionType: {
      type: String,
      default: "ALL",
    },
    selectedUser: {
      type: String,
      default: "ALL",
    },
  },
  components: {
    ViewExpenses,
    SnackBar,
  },
  mixins: [get_Org_details, get_all_org_users],
  emits: ["filter-applied"],
  data() {
    let today = new Date();
    let lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    return {
      fixed: true,
      expenseView: false,
      modal: false,
      endmodal: false,
      date: lastMonth.toISOString().substr(0, 10),
      todate: today.toISOString().substr(0, 10),
      tableData: [],
      rowInfo: {},
      selectStatusType: this.statusType,
      selectTransactionType: this.transactionType,
      SnackBarComponent: {},
      tableLoading: false,
      componentCheck: 0,
      height: 0,
      headers: [
        { title: "Category", value: "category_id_text", sortable: false },
        {
          title: "Group Name",
          value: "expense_group_id_text",
          sortable: false,
        },
        { title: "Project Name", value: "project_id_text", sortable: false },

        { title: "Member Name ", value: "user_id_text", sortable: false },

        // {
        //   title: "Transaction Type",
        //   value: "transaction_type",
        //   sortable: false,
        // },
        {
          title: "Amount",
          value: "amount",
          sortable: false,
        },
        {
          title: "Bill Date",
          value: "bill_date",
          sortable: false,
        },
        {
          title: "Initiated On",
          value: "transaction_created_on",
          sortable: false,
        },

        {
          title: "Status",
          value: "transaction_status",
          sortable: false,
        },
        {
          title: "Pending On",
          value: "pending_on",
          sortable: false,
        },
        {
          title: "Documents",
          value: "docs",
          sortable: false,
        },
      ],
      goLoading: false,
      datePicker: false,
      datePickerTo: false,
      tempDate: lastMonth.toISOString().substr(0, 10),
      tempDateTo: today.toISOString().substr(0, 10),
      searchQuery: "",
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 10,
      pageCount: 0,
      allUSersNames: [],
    };
  },
  async created() {
    this.height = window.innerHeight - 250;
    this.tableLoading = true;
    await this.get_Org_details();
    await this.get_initiated_expense();
    await this.get_all_org_users();
    this.allUSersNames = this.orgUsers;
  },
  computed: {
    computedDateDisplay() {
      return this.dateformating(this.date);
    },
    dataDisplayFormatted() {
      return this.dateformating(this.todate);
    },
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter(
        (item) =>
          (item.category_id_text &&
            item.category_id_text.toLowerCase().includes(searchTerm)) ||
          (item.expense_group_id_text &&
            item.expense_group_id_text.toLowerCase().includes(searchTerm)) ||
          (item.project_id_text &&
            item.project_id_text.toLowerCase().includes(searchTerm)) ||
          (item.user_id_text &&
            item.user_id_text.toLowerCase().includes(searchTerm)) ||
          (item.transaction_type &&
            item.transaction_type.toLowerCase().includes(searchTerm)) ||
          (item.transaction_status &&
            item.transaction_status.toLowerCase().includes(searchTerm))
      );
    },
    sortedAndPaginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
    totalItems() {
      return this.filteredItems.length;
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
    searchQuery() {
      this.currentPage = 1;
    },
    // Watch for prop changes
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
    },
    transactionType(newVal) {
      this.selectTransactionType = newVal;
      this.getexpense_list();
    },
  },
  methods: {
    getFirstInProgressUser(data) {
      // Sort based on step_no in ascending order
      data.sort((a, b) => a.step_no - b.step_no);

      // Iterate over sorted data to find the first step with 'INPROGRESS' status
      for (let i = 0; i < data.length; i++) {
        if (data[i].approval_status === "INPROGRESS") {
          return this.fetch_user_name(data[i].user_email_id); // Return the user_email_id of the first 'INPROGRESS' step
        }
      }

      // If no step with 'INPROGRESS', return null
      return '-';
    },
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      if (value == "SYSTEM") {
        name = value;
      }
      return name;
    },
    displayFormatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
      return `${day}/${month}/${year}`;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    parseDateFromDisplay(displayDate) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      if (!displayDate) return "";
      const parts = displayDate.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return displayDate;
    },
    saveDate() {
      this.date = this.tempDate;
      this.datePicker = false;
    },
    saveDateTo() {
      this.todate = this.tempDateTo;
      this.datePickerTo = false;
    },
    getexpense_list() {
      this.tableData = [];
      this.goLoading = true;
      this.get_initiated_expense();
      // Emit filter applied event
      this.$emit("filter-applied", {
        fromDate: this.computedDateDisplay,
        toDate: this.dataDisplayFormatted,
        statusType: this.selectStatusType,
        transactionType: this.selectTransactionType,
        selectedUser: this.selectedUser,
      });
    },

    // Method to handle filter changes from parent component
    handleFilterChange(filterData) {
      if (filterData.fromDate) {
        this.date = this.parseDateFromDisplay(filterData.fromDate);
      }
      if (filterData.toDate) {
        this.todate = this.parseDateFromDisplay(filterData.toDate);
      }
      if (filterData.statusType) {
        this.selectStatusType = filterData.statusType;
      }
      if (filterData.transactionType) {
        this.selectTransactionType = filterData.transactionType;
      }
      if (filterData.selectedUser) {
        this.selectedUser = filterData.selectedUser;
      }
      this.getexpense_list();
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
    dateformating(todate) {
      if (!todate) return "";
      const d = new Date(todate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    getcal() {
      this.modal = true;
    },
    async get_initiated_expense() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      // Convert display dates to API format if they come from props
      let startTime = this.date;
      let endTime = this.todate;

      // If we have props with display format dates, convert them
      if (this.fromDate && this.fromDate.includes("/")) {
        startTime = this.parseDateFromDisplay(this.fromDate);
      }
      if (this.toDate && this.toDate.includes("/")) {
        endTime = this.parseDateFromDisplay(this.toDate);
      }

      try {
        let result = await API.graphql(
          graphqlOperation(list_expense_transactions, {
            input: {
              transaction_by:
                this.selectedUser == "ALL" ? undefined : this.selectedUser,
              user_email_id: data.user.user_email_id,
              nextToken: null,
              limit: 100,
              organization_id: data.organization.organization_id,
              start_time: this.formatDate(startTime),
              end_time: this.formatDate(endTime),
              transaction_status:
                this.selectStatusType == "ALL"
                  ? undefined
                  : this.selectStatusType,
              transaction_type: "EXPENSE",
            },
          })
        );
        var response = JSON.parse(result.data.list_expense_transactions);
        this.tableLoading = false;
        this.goLoading = false;
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.goLoading = false;
          this.tableData = response.data;
          // console.log(response);
          this.$emit("balance-updated", response.org_wallet);
          this.totalItems = response.data.length;
          this.pageCount = Math.ceil(this.totalItems / this.itemsPerPage);
        } else {
          this.tableLoading = false;
          this.goLoading = false;
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
    handleSortChange(value) {
      // Implement sorting logic here
    },
    getStatusColor(status) {
      switch (status) {
        case "APPROVED":
          return "green";
        case "PENDING":
          return "orange";
        case "WITHDRAWN":
          return "blue";
        case "REJECTED":
          return "red";
        default:
          return "grey";
      }
    },
    getStatusIcon(status) {
      switch (status) {
        case "APPROVED":
          return "mdi-check-circle";
        case "PENDING":
          return "mdi-clock-outline";
        case "WITHDRAWN":
          return "mdi-undo";
        case "REJECTED":
          return "mdi-close-circle";
        default:
          return "mdi-help-circle";
      }
    },
    getStatusTextColor(status) {
      switch (status) {
        case "APPROVED":
          return "green--text";
        case "PENDING":
          return "orange--text";
        case "WITHDRAWN":
          return "primary--text";
        case "REJECTED":
          return "red--text";
        default:
          return "grey--text";
      }
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
}

/* Table Footer Styles */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 12px 12px;
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