<template>
  <div >
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card class="" flat >
      <!-- <v-toolbar dense class="bg-white" flat > -->
        <!-- <v-toolbar-title
          ><v-icon class="mr-3" color="primary" size="large"
            >mdi-cash-multiple</v-icon
          >
          <span class="font-weight-bold text-h6"
            >My Expenses ({{ tableData.length }})</span
          ></v-toolbar-title
        > -->
        <!-- <v-spacer />
      </v-toolbar> -->
      <!-- Data Table -->
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :sort-by="['transaction_created_on']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalItems"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
          :fixed-header="true"
          :height="windowHeight"
          @update:sort-by="handleSortChange"
          @click:row="handleRowClick"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-cash-remove</v-icon
              >
              <div class="text-h6 text-grey mb-2">No Expenses Found</div>
              <div class="text-body-2 text-grey">
                No expense records available for you at the moment.
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
              <div class="text-body-2 text-grey">Loading expenses...</div>
            </div>
          </template>

          <!-- Expense Name -->
          <template v-slot:[`item.category_id_text`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="20" color="primary" class="mr-3">mdi-tag</v-icon> -->
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.category_id_text }}
                </div>
              </div>
            </div>
          </template>

          <!-- Amount -->
          <template v-slot:[`item.amount`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="green" class="mr-2">mdi-currency-inr</v-icon> -->
              <span class="caption font-weight-medium">{{ item.amount }}</span>
            </div>
          </template>

          <!-- Created On -->
          <template v-slot:[`item.transaction_created_on`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2">mdi-calendar-clock</v-icon> -->
              <span class="caption font-weight-medium">{{
                get_date(item.transaction_created_on)
              }}</span>
            </div>
          </template>

          <!-- Status -->
          <template v-slot:[`item.transaction_status`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                size="16"
                class="mr-2"
                :color="
                  item.transaction_status == 'APPROVED'
                    ? 'green'
                    : item.transaction_status == 'PENDING' ||
                      item.transaction_status == 'INPROGRESS'
                    ? 'orange'
                    : item.transaction_status == 'WITHDRAWN'
                    ? 'blue'
                    : 'red'
                "
              >
                {{
                  item.transaction_status == "APPROVED"
                    ? "mdi-check-circle"
                    : item.transaction_status == "PENDING" ||
                      item.transaction_status == "INPROGRESS"
                    ? "mdi-clock"
                    : item.transaction_status == "WITHDRAWN"
                    ? "mdi-undo"
                    : "mdi-close-circle"
                }}
              </v-icon>
              <span
                class="caption font-weight-medium"
                :class="
                  item.transaction_status == 'APPROVED'
                    ? 'green--text'
                    : item.transaction_status == 'PENDING' ||
                      item.transaction_status == 'INPROGRESS'
                    ? 'orange--text'
                    : item.transaction_status == 'WITHDRAWN'
                    ? 'primary--text'
                    : 'red--text'
                "
              >
                {{ item.transaction_status }}
              </span>
            </div>
          </template>

          <!-- Documents -->
          <template v-slot:[`item.docs`]="{ item }">
            <span
              v-if="item.media_keys == 'N/A' || item.media_keys == undefined"
              class="caption text-grey"
              >N/A</span
            >
            <v-icon
              small
              @click.stop="show_file(item)"
              color="red"
              v-else
              class="cursor-pointer"
              >mdi-file-document</v-icon
            >
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
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

    <div v-if="componentCheck == 2">
      <ViewExpenses
        :rowInfo="rowInfo"
        :expenseView="expenseView"
        @clicked="expenseView = false"
      />
    </div>

    <!-- Expense Details Dialog -->
    <ExpenseDetailsDialog
      v-model:expenseDetailsDialog="expenseDetailsDialog"
      :expenseData="selectedExpenseData"
      @edit-expense="handleEditExpense"
      @view-document="handleViewDocument"
      @download-document="handleDownloadDocument"
    />
  </div>
</template>

<script>
/* eslint-disable */
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import SnackBar from "@/components/SnackBar.vue";
import { list_initiated_expense } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewExpenses from "./ExpensePopups/ViewExpenses.vue";
import AddExpense from "@/components/ExpensesManagement/ExpensePopups/AddExpense.vue";
import ExpenseDetailsDialog from "./ExpensePopups/ExpenseDetailsDialog.vue";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
export default {
  props: {
    searchValue: {
      type: String,
      default: "",
    },
  },
  components: {
    SnackBar,
    AddExpense,
    ViewExpenses,
    ExpenseDetailsDialog,
  },
  mixins: [get_Org_details],
  data() {
    return {
      SnackBarComponent: {},
      tableData: [],
      rowInfo: {},
      tableLoading: false,
      expenseView: false,
      componentCheck: 0,
      fixed: true,
      height: 0,
      expenseDetailsDialog: false,
      selectedExpenseData: null,
      headers: [
        { title: "Expense Name", value: "category_id_text", sortable: false },
        { title: "Amount", value: "amount", sortable: false },

        {
          title: "Created On",
          value: "transaction_created_on",
          sortable: false,
        },
        {
          title: "Status",
          value: "transaction_status",
          sortable: false,
        },
        {
          title: "Documents",
          value: "docs",
          sortable: false,
        },
      ],
      currentPage: 1,
      totalItems: 0,
      itemsPerPage: 20,
      windowHeight: 0,
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchValue) return this.tableData;
      const searchLower = this.searchValue.toLowerCase();
      return this.tableData.filter(
        (item) =>
          item.category_id_text.toLowerCase().includes(searchLower) ||
          item.amount.toString().includes(searchLower) ||
          item.transaction_status.toLowerCase().includes(searchLower)
      );
    },
    sortedAndPaginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        // Default sort by created date (newest first)
        const aValue = a.transaction_created_on ? a.transaction_created_on : 0;
        const bValue = b.transaction_created_on ? b.transaction_created_on : 0;
        return bValue - aValue;
      });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
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
    searchValue() {
      this.currentPage = 1;
      this.$emit('search-changed', this.searchValue);
    },
    currentPage() {
      // When the page changes, scroll to top of table (optional)
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
  mounted() {
    this.windowHeight = window.innerHeight - 280;
  },
  async created() {
    //  await this.get_Org_details();
    await this.get_initiated_expense();
  },
  methods: {
    show_file(item) {
      if (
        ["jpg", "jpeg", "img", "png"].indexOf(
          String(item.media_keys.split(".").pop())
        ) > -1
      ) {
        this.componentCheck = 2;
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
      // let a = new Date(date * 1000).toLocaleTimeString("en-In", {
      //   year: "numeric",
      //   month: "2-digit",
      //   day: "2-digit",
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   second: "2-digit",
      // });
      // return a.toUpperCase();
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
      this.get_initiated_expense();
    },

    async get_initiated_expense() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_initiated_expense, {
            input: {
              user_email_id: data.user.user_email_id,
              nextToken: null,
              limit: 100,
            },
          })
        );
        var response = JSON.parse(result.data.list_initiated_expense);
        // console.log(response)
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
          // console.log(this.tableData);
          this.totalItems = response.data.length;
        }
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
    handleSortChange(value) {
      // Implement sorting logic here
    },

    // Row click handler
    handleRowClick(event, item) {
      this.selectedExpenseData = item.item;
      this.expenseDetailsDialog = true;
    },

    // Dialog event handlers
    handleEditExpense(expenseData) {
      // Handle edit expense logic
      // console.log("Edit expense:", expenseData);
      this.expenseDetailsDialog = false;
      // You can implement edit functionality here
      // For example, open an edit dialog or navigate to edit page
    },

    handleViewDocument(expenseData) {
      // Handle view document logic
      console.log("View document:", expenseData);
      // You can implement document viewing logic here
      // For example, open a document viewer modal
    },

    handleDownloadDocument(expenseData) {
      // Handle download document logic
      console.log("Download document:", expenseData);
      // You can implement document download logic here
      // For example, trigger file download
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.footer-info {
  color: #666;
  font-size: 14px;
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
  min-width: 80px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 6px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 6px;
  min-width: 32px;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
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
</style>