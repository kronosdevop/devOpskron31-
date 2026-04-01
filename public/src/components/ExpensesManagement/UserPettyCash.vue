<template>
  <div>
    <v-card class="" flat >
      <!-- <v-toolbar dense class="bg-white" flat > -->
        <!-- <v-toolbar-title>
          <v-icon class="mr-3" color="secondary" size="large"
            >mdi-wallet</v-icon
          >
          <span class="font-weight-bold text-h6"
            >My Petty Cash ({{ tableData.length }})</span
          >
        </v-toolbar-title> -->
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
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-wallet-outline</v-icon
              >
              <div class="text-h6 text-grey mb-2">
                No Petty Cash Records Found
              </div>
              <div class="text-body-2 text-grey">
                No petty cash records available for you at the moment.
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
              <div class="text-body-2 text-grey">
                Loading petty cash records...
              </div>
            </div>
          </template>

          <!-- Entry Type -->
          <template v-slot:[`item.entry_type`]="{ item }">
            <div class="d-flex align-center">
              <v-icon 
                size="16" 
                :color="item.entry_type === 'CREDIT' ? 'green' : 'red'" 
                class="mr-2"
              >
                {{ item.entry_type === 'CREDIT' ? 'mdi-plus-circle' : 'mdi-minus-circle' }}
              </v-icon>
              <span 
                class="caption font-weight-medium"
                :class="item.entry_type === 'CREDIT' ? 'green--text' : 'red--text'"
              >
                {{ item.entry_type === 'CREDIT' ? 'Advance' : 'Expense' }}
              </span>
            </div>
          </template>

          <!-- Expense Type -->
          <template v-slot:[`item.expense_type`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon 
                size="16" 
                :color="item.expense_type === 'GROUP' ? 'blue' : 'orange'" 
                class="mr-2"
              >
                {{ item.expense_type === 'GROUP' ? 'mdi-account-group' : 'mdi-briefcase' }}
              </v-icon> -->
              <span 
                class="caption font-weight-medium"
                :class="item.expense_type === 'GROUP' ? 'blue--text' : 'orange--text'"
              >
                {{ item.expense_type === 'GROUP' ? 'Group' : 'Project' }}
              </span>
            </div>
          </template>

          <!-- Group/Category -->
          <template v-slot:[`item.expense_group_id_text`]="{ item }">
            <div class="d-flex align-center">
              <v-icon 
                size="20" 
                :color="item.entry_type === 'CREDIT' ? 'secondary' : 'primary'" 
                class="mr-3"
              >
                {{ item.entry_type === 'CREDIT' ? 'mdi-wallet' : 'mdi-tag' }}
              </v-icon>
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.entry_type === 'CREDIT' ? item.expense_group_id_text : (item.category_id_text || item.expense_group_id_text) }}
                </div>
               
              </div>
            </div>
          </template>

          <!-- Amount -->
          <template v-slot:[`item.amount`]="{ item }">
            <div class="d-flex align-center">
              <v-icon 
                size="16" 
                :color="item.entry_type === 'CREDIT' ? 'green' : 'red'" 
                class="mr-2"
              >
                mdi-currency-inr
              </v-icon>
              <span class="caption font-weight-medium">
                {{ item.entry_type === 'CREDIT' ? (item.requested_amount || item.amount) : (item.amount || item.requested_amount) }}
              </span>
            </div>
          </template>

          <!-- Granted Amount -->
          <template v-slot:[`item.granted_amount`]="{ item }">
            <div v-if="item.entry_type === 'CREDIT'" class="d-flex align-center">
              <!-- <v-icon size="16" color="blue" class="mr-2">mdi-currency-inr</v-icon> -->
              <span class="caption font-weight-medium">{{ item.granted_amount || '-' }}</span>
            </div>
            <div v-else class="d-flex align-center">
              <span class="caption text-grey">-</span>
            </div>
          </template>

          <!-- Description -->
          <template v-slot:[`item.expense_description`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2">mdi-text</v-icon> -->
              <span class="caption">{{ item.expense_description || '-' }}</span>
            </div>
          </template>

          <!-- Created On -->
          <template v-slot:[`item.transaction_created_on`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2">mdi-calendar-plus</v-icon> -->
              <span class="caption font-weight-medium">{{ get_date(item.transaction_created_on) }}</span>
            </div>
          </template>

          <!-- Updated On -->
          <template v-slot:[`item.updated_on`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="grey" class="mr-2">mdi-calendar-check</v-icon> -->
              <span class="caption font-weight-medium">{{ item.updated_on ? get_date(item.updated_on) : "-" }}</span>
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
                    : item.transaction_status == 'REJECTED'
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
                    : item.transaction_status == "REJECTED"
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
                    : item.transaction_status == 'REJECTED'
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
              @click="show_file(item)"
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
                : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} petty cash records`
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

    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <div v-if="componentCheck == 2">
      <ViewExpenses
        :rowInfo="rowInfo"
        :expenseView="expenseView"
        @clicked="expenseView = false"
      />
    </div>
  </div>
</template>

<script>
// import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { list_user_pettycash_transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import RequestAdvanceDialog from "./RequestAdvanceDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import AddPettyCashDialog from './AddPettyCashDialog.vue';
import ViewExpenses from "./ExpensePopups/ViewExpenses.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
export default {
  name: "UserPettyCash",
  props: {
    currentBalance: {
      type: Number,
      default: 0,
    },
  },
  components: {
    RequestAdvanceDialog,
    SnackBar,
    AddPettyCashDialog,
    ViewExpenses,
  },
  mixins: [get_Org_details],
  data() {
    return {
      tableData: [],
      tableLoading: false,
      fixed: true,
      height: 0,
      windowHeight: 0,
      headers: [
        {
          title: "Entry Type",
          value: "entry_type",
          sortable: false,
          width: "120px",
        },
        {
          title: "Expense Type",
          value: "expense_type",
          sortable: false,
          width: "120px",
        },
        {
          title: "Transaction ID",
          value: "expense_transaction_id",
          sortable: false,
    
        },
        {
          title: "Category/Group",
          value: "expense_group_id_text",
          sortable: false,
        },
        {
          title: "Amount",
          value: "amount",
          sortable: false,
        },
        {
          title: "Granted Amount",
          value: "granted_amount",
          sortable: false,
        },
        {
          title: "Description",
          value: "expense_description",
          sortable: false,
        },
        {
          title: "Created On",
          value: "transaction_created_on",
          sortable: false,
        },
        {
          title: "Updated On",
          value: "updated_on",
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
      search: "",
      currentPage: 1,
      totalItems: 0,
      itemsPerPage: 20,
      SnackBarComponent: {},
      advanceForm: {
        group: "",
        amount: "",
        comments: "",
      },
      // Document viewing
      rowInfo: {},
      expenseView: false,
      componentCheck: 0,
    };
  },
  computed: {
    filteredItems() {
      if (!this.search) return this.tableData;
      const searchLower = this.search.toLowerCase();
      return this.tableData.filter(
        (item) =>
          (item.expense_group_id_text &&
            item.expense_group_id_text.toLowerCase().includes(searchLower)) ||
          (item.category_id_text &&
            item.category_id_text.toLowerCase().includes(searchLower)) ||
          (item.expense_description &&
            item.expense_description.toLowerCase().includes(searchLower)) ||
          (item.entry_type &&
            item.entry_type.toLowerCase().includes(searchLower)) ||
          (item.transaction_status &&
            item.transaction_status.toLowerCase().includes(searchLower)) ||
          (item.requested_amount &&
            item.requested_amount.toString().includes(searchLower)) ||
          (item.amount &&
            item.amount.toString().includes(searchLower)) ||
          (item.granted_amount &&
            item.granted_amount.toString().includes(searchLower))
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
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.pageCount, this.currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < this.pageCount) {
        if (endPage < this.pageCount - 1) {
          pages.push("...");
        }
        pages.push(this.pageCount);
      }
      return pages;
    },
    windowHeight() {
      return window.innerHeight - 280; // Adjust based on header/footer height
    },
    // currentBalance() {
    //   // Calculate the current balance from tableData or use a placeholder
    //   // Example: sum of all balances
    //   if (!this.tableData.length) return 0;
    //   return this.tableData.reduce((sum, item) => sum + (item.balance || 0), 0);
    // },
  },
  watch: {
    search() {
      this.currentPage = 1;
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
    // await this.get_Org_details();
    await this.get_petty_cash_transactions();
  },
  methods: {
    async show_file(item) {
      try {
        if (!item.media_keys || item.media_keys === 'N/A') {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "warning",
            SnackbarText: "No document attached to this entry",
            timeout: 3000,
            Top: true,
          };
          return;
        }

        // Check if it's an image file
        const fileExtension = item.media_keys.split(".").pop().toLowerCase();
        const isImage = ["jpg", "jpeg", "img", "png", "gif", "bmp", "webp"].includes(fileExtension);

        if (isImage) {
          // For images, open in dialog
          this.componentCheck = 2;
          this.rowInfo = item;
          this.expenseView = true;
        } else {
          // For PDFs and other documents, open in new window
          const details = this.$store.getters.GetOrgDetails;
          if (!details || !details.s3_details) {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "S3 configuration not available",
              timeout: 3000,
              Top: true,
            };
            return;
          }

          const signedUrl = await getS3SignedUrl(item.media_keys, details.s3_details);
          
          if (signedUrl) {
            window.open(signedUrl, '_blank');
          } else {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Failed to load document",
              timeout: 3000,
              Top: true,
            };
          }
        }
      } catch (error) {
        console.error('Error opening file:', error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error opening document",
          timeout: 3000,
          Top: true,
        };
      }
    },
    get_date(date) {
      return formatedatetime(date);
    },
    async get_petty_cash_transactions() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_user_pettycash_transactions, {
            input: {},
          })
        );
        var response = JSON.parse(result.data.list_user_pettycash_transactions);
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          const balance = response.wallet_balence;
          this.tableLoading = false;
          this.tableData = response.data;
          this.totalItems = response.data.length;
          
          // Emit balance update to parent
          this.$emit('balance-updated', balance);
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

    successMsg(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: msg,
        timeout: 5000,
        Top: true,
      };

      this.tableData = [];
      this.totalItems = 0;
      this.get_petty_cash_transactions();
      
      // Emit balance update to parent
      this.$emit('balance-updated', this.currentBalance);
    },
    errorMsg(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: msg,
        timeout: 5000,
        Top: true,
      };
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

/* Add subtle border for CREDIT entries */
.modern-data-table :deep(.v-data-table__tbody tr[data-entry-type="CREDIT"]) {
  border-left: 3px solid #4CAF50;
}

/* Add subtle border for DEBIT entries */
.modern-data-table :deep(.v-data-table__tbody tr[data-entry-type="DEBIT"]) {
  border-left: 3px solid #F44336;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}
</style> 