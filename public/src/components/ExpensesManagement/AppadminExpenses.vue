<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-cash-multiple</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Expenses </span>
          <span class="header-subtitle"
            >Manage your expenses and petty cash</span
          >
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

        <div v-if="toggle_exclusive === 'expense'">
          <v-text-field
            width="250"
            v-model="searchValue"
            placeholder="Search expenses..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
            clearable
            @update:model-value="handleSearchChange"
          />
        </div>
        <v-btn
          v-if="toggle_exclusive === 'expense'"
          @click="add_expense()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Initiate</span>
        </v-btn>
        <v-btn
          v-if="toggle_exclusive === 'pettycash'"
          @click="log_petty_cash()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Log Petty Cash</span>
        </v-btn>
        <v-btn
          v-if="toggle_exclusive === 'pettycash'"
          @click="on_wallet_click_user()"
          class="action-btn wallet-btn"
          size="small"
        >
          <v-icon>mdi-wallet</v-icon>
          <span>Wallet: ₹{{ currentuserBalance }}</span>
          <v-icon size="16" class="ml-2">mdi-plus-circle</v-icon>
        </v-btn>

        <v-btn
          v-if="toggle_exclusive == 'petty_cash_transaction'"
          @click="on_wallet_click()"
          class="action-btn wallet-btn"
          size="small"
        >
          <v-icon>mdi-wallet</v-icon>
          <span>Wallet: ₹{{ currentBalance }}</span>
          <v-icon size="16" class="ml-2">mdi-plus-circle</v-icon>
        </v-btn>
        <!-- Filter Button -->
        <v-btn
          v-if="
            toggle_exclusive == 'expense_list' ||
            toggle_exclusive == 'petty_cash_transaction'
          "
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
        <!-- Action Buttons -->
        <v-btn
          v-if="toggle_exclusive == 'expense_category'"
          @click="add_category()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Category</span>
        </v-btn>
        <!-- <v-btn
          v-if="adminAppExists"
          @click="back_call()"
          class="action-btn secondary"
          size="small"
        >
          <v-icon>mdi-step-backward</v-icon>
          <span>Back</span>
        </v-btn> -->
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs
          v-model="toggle_exclusive"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
        >
          <v-tab value="expense" class="tab-btn"> Expense </v-tab>
          <v-tab value="pettycash" class="tab-btn"> Petty Cash </v-tab>
          <v-tab value="expense_list" class="tab-btn" v-if="adminAppExists">
            Expense Transaction
          </v-tab>
          <v-tab
            value="petty_cash_transaction"
            class="tab-btn"
            v-if="adminAppExists"
          >
            Petty Cash Transaction
          </v-tab>
          <v-tab value="expense_category" class="tab-btn" v-if="adminAppExists">
            Category
          </v-tab>
          <v-tab value="expense_config" class="tab-btn" v-if="adminAppExists">
            Configuration
          </v-tab>
          <v-tab value="expense_approval" class="tab-btn" v-if="adminAppExists">
            Approvals
          </v-tab>
          <v-tab value="expense_report" class="tab-btn" v-if="adminAppExists">
            Reports
          </v-tab>
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
                <label class="filter-label">Filter By</label>
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

              <!-- Transaction Type Filter -->
              <!-- <div class="filter-group">
                <label class="filter-label">Transaction Type</label>
                <v-select
                  v-model="selectTransactionType"
                  :items="[
                    { title: 'Expense', value: 'EXPENSE' },
                    { title: 'Petty Cash', value: 'PETTY_CASH' },
                    { title: 'All', value: 'ALL' },
                  ]"
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
              </div> -->

              <!-- User Filter -->
              <div class="filter-group">
                <label class="filter-label">Filter By User</label>
                <v-autocomplete
                  v-model="selectedUser"
                  :items="userArray"
                  item-text="title"
                  item-value="user_id"
                  v-model:search-input="searchUser"
                  hide-no-data
                  placeholder="Search users..."
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                  clearable
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

    <v-card flat class="overflow-y-auto">
      <div class="text-left" v-if="toggle_exclusive == 'expense_approval'">
        <ApprovalManagement />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'pettycash'">
        <UserPettyCash
          :key="pettyCashKey"
          :currentBalance="currentuserBalance"
          v-on:balance-updated="handleBalanceuserUpdate"
        />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'expense'">
        <UserExpense
          :key="expenseKey"
          :searchValue="searchValue"
          v-on:search-changed="handleSearchChange"
        />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'expense_list'">
        <AdminExpenselist
          ref="adminExpenseList"
          :fromDate="computedDateDisplay"
          :toDate="dataDisplayFormatted"
          :statusType="selectStatusType"
          :transactionType="selectTransactionType"
          :selectedUser="selectedUser"
          @filter-applied="handleFilterApplied"
          :currentBalance="currentBalance"
          v-on:balance-updated="handleBalanceUpdate"
        />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'expense_category'">
        <ExpenseConfiguration :key="categoryKey" />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'expense_config'">
        <ExpenseNewConfig />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'expense_report'">
        <ExpenseReportsub />
      </div>
      <div
        class="text-left"
        v-if="toggle_exclusive == 'petty_cash_transaction'"
      >
        <PettyCashTransaction
          ref="pettyCashTransaction"
          :fromDate="computedDateDisplay"
          :toDate="dataDisplayFormatted"
          :statusType="selectStatusType"
          :selectedUser="selectedUser"
          :currentBalance="currentBalance"
          v-on:balance-updated="handleBalanceUpdate"
        />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'expense_groups'">
        <ExpenseGroups :key="groupKey" />
      </div>
    </v-card>

    <div v-if="componentCheck == 1">
      <AddExpense
        :expenseAdd="expenseAdd"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:myexpense="initiate_expense"
        @clicked="expenseAdd = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddExpenseconfi
        :addConfiguration="addConfiguration"
        @clicked="addConfiguration = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:categoeryRefresh="category_refresh"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AddGroups
        :createGroupDialog="createGroupDialog"
        @clicked="createGroupDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:addGroups="group_rfresh"
      />
    </div>
    <div v-if="componentCheck == 4">
      <AddPettyCashDialog
        :model-value="pettyCashAdd"
        @update:model-value="pettyCashAdd = $event"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="pettyCashAdd = false"
      />
    </div>
    <div v-if="componentCheck == 5">
      <RequestAdvanceDialog
        :advanceDialog="requestAdvanceDialog"
        @clicked="requestAdvanceDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <WalletDialog
      :walletDialog="walletDialog"
      @clicked="walletDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import UserPettyCash from "./UserPettyCash.vue";
import UserExpense from "./UserExpense.vue";
import AddPettyCashDialog from "./AddPettyCashDialog.vue";
import ExpenseApproval from "@/components/ExpensesManagement/ExpenseApproval.vue";
import AdminExpenselist from "@/components/ExpensesManagement/AdminExpenselist.vue";
import ExpenseConfiguration from "@/components/ExpensesManagement/ExpenseConfiguration.vue";
// import ExpenseReport from "@/components/ExpensesManagement/ExpenseReport.vue";
import ExpenseGroups from "@/components/ExpensesManagement/ExpenseGroups.vue";
import AddExpense from "@/components/ExpensesManagement/ExpensePopups/AddExpense.vue";
import AddGroups from "@/components/ExpensesManagement/ExpensePopups/AddGroups.vue";
import AddExpenseconfi from "./ExpensePopups/AddExpenseconfi.vue";
import ExpenseReportsub from "@/components/ExpensesManagement/ExpenseReportsub.vue";
import ExpenseNewConfig from "@/components/ExpensesManagement/ExpenseNewConfig.vue";
import ApprovalManagement from "@/components/ExpensesManagement/ApprovalManagement.vue";
import SnackBar from "@/components/SnackBar.vue";
import WalletDialog from "@/components/ExpensesManagement/WalletDialog.vue";
import PettyCashTransaction from "@/components/ExpensesManagement/PettyCashTransaction.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import RequestAdvanceDialog from "./RequestAdvanceDialog.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";
export default {
  components: {
    AdminExpenselist,
    ExpenseConfiguration,
    ExpenseApproval,
    // ExpenseReport,
    AddPettyCashDialog,
    ExpenseGroups,
    AddExpense,
    SnackBar,
    AddExpenseconfi,
    AddGroups,
    ExpenseReportsub,
    ExpenseNewConfig,
    ApprovalManagement,
    WalletDialog,
    PettyCashTransaction,
    UserExpense,
    UserPettyCash,
    RequestAdvanceDialog,
    CreateExternalTicketDialog,
  },
  mixins: [get_all_org_users],
  data: () => {
    // Set default dates (last month to today)
    let today = new Date();
    let lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    return {
      toggle_exclusive: "expense",
      componentCheck: 0,
      SnackBarComponent: {},
      addConfiguration: false,
      categoryKey: 0,
      groupKey: 0,
      createGroupDialog: false,
      adminAppExists: false,
      pettyCashAdd: false,
      windowHeight: 0,
      expenseAdd: false,
      // Filter related properties
      showFilterDrawer: false,
      goLoading: false,
      datePicker: false,
      datePickerTo: false,
      tempDate: lastMonth.toISOString().substr(0, 10),
      tempDateTo: today.toISOString().substr(0, 10),
      computedDateDisplay: "",
      dataDisplayFormatted: "",
      searchValue: "",
      selectStatusType: "ALL",
      selectTransactionType: "ALL",
      selectedUser: "ALL",
      searchUser: "",
      userArray: [],
      currentBalance: 0,
      currentuserBalance: 0,
      pettyCashKey: 0,
      currentBalance: 0,
      expenseKey: 0,
      walletDialog: false,
      requestAdvanceDialog: false,
      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },
  async created() {
    this.fetch_admin_apps();
    await this.get_all_org_users();
    this.populateUserArray();
    // Initialize display dates
    this.computedDateDisplay = this.formatDate(this.tempDate);
    this.dataDisplayFormatted = this.formatDate(this.tempDateTo);
  },
  mounted() {
    this.windowHeight = window.innerHeight - 220;
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

      // Count transaction type filter (if not default)
      if (this.selectTransactionType && this.selectTransactionType !== "ALL") {
        count++;
      }

      // Count user filter (if selected)
      if (this.selectedUser && this.selectedUser !== "ALL") {
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
    log_petty_cash() {
      this.componentCheck = 4;
      this.pettyCashAdd = true;
    },
    handleBalanceuserUpdate(balance) {
      this.currentuserBalance = balance;
    },
    handleSearchChange(value) {
      // console.log('Search changed:', value);
      this.searchValue = value;
      // The child component will handle the search through the prop watcher
    },
    add_expense() {
      this.componentCheck = 1;
      this.expenseAdd = true;
    },
    handleBalanceUpdate(balance) {
      this.currentBalance = balance;
    },
    on_wallet_click_user() {
      this.componentCheck = 5;
      this.requestAdvanceDialog = true;
    },
    on_wallet_click() {
      this.walletDialog = true;
    },
    back_call() {
      this.$router.push("/home/UserTransaction");
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type == "EXPENSE"
      );

      if (userapp == undefined) {
        this.adminAppExists = false;
        return;
      }
      if (userapp.is_visible == false) {
        this.adminAppExists = false;
        return;
      }
      // Check if userObj and admin_apps exist
      if (
        !userObj ||
        !userObj.admin_apps ||
        !Array.isArray(userObj.admin_apps)
      ) {
        this.adminAppExists = false;
        return;
      }

      const adminExists = userObj.admin_apps.find(
        (app) => app.dashboard_unique_type === "EXPENSE_ADMINS"
      );

      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
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
      this.addConfiguration = false;
      this.createGroupDialog = false;
      this.expenseAdd = false;
      this.pettyCashAdd = false;
      this.requestAdvanceDialog = false;
      this.expenseKey += 1;
      this.pettyCashKey += 1;
    },

    category_refresh() {
      this.categoryKey += 1;
    },
    group_rfresh() {
      this.groupKey += 1;
    },

    add_category() {
      this.componentCheck = 2;
      this.addConfiguration = true;
    },
    create_group() {
      this.componentCheck = 3;
      this.createGroupDialog = true;
    },

    // Filter drawer methods
    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },

    populateUserArray() {
      this.userArray = [];
      this.userArray.push({
        title: "All Users",
        user_id: "ALL",
      });

      // Get users from the mixin
      if (this.orgUsers && this.orgUsers.length > 0) {
        this.orgUsers.forEach((user) => {
          if (user.user_status === "ACTIVE" && user.user_type !== "CHATBOT") {
            this.userArray.push({
              title: user.full_user_name,
              user_id: user.user_email_id,
            });
          }
        });
      }
    },

    applyFilterFromDrawer() {
      this.goLoading = true;
      // Call the child component's filter method based on active tab
      if (
        this.toggle_exclusive === "expense_list" &&
        this.$refs.adminExpenseList
      ) {
        this.$refs.adminExpenseList.getexpense_list();
      } else if (
        this.toggle_exclusive === "petty_cash_transaction" &&
        this.$refs.pettyCashTransaction
      ) {
        this.$refs.pettyCashTransaction.getexpense_list();
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
      this.selectTransactionType = "ALL";
      this.selectedUser = "ALL";
      this.searchUser = "";

      // Refresh the expense list with cleared filters based on active tab
      if (
        this.toggle_exclusive === "expense_list" &&
        this.$refs.adminExpenseList
      ) {
        this.$refs.adminExpenseList.getexpense_list();
      } else if (
        this.toggle_exclusive === "petty_cash_transaction" &&
        this.$refs.pettyCashTransaction
      ) {
        this.$refs.pettyCashTransaction.getexpense_list();
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
/* Modern Header Section */

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
  padding: 8px 16px !important;
  min-height: 36px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
}

.action-btn.secondary {
  background: #757575 !important;
  box-shadow: 0 2px 8px rgba(117, 117, 117, 0.3) !important;
}

.action-btn.secondary:hover {
  background: #616161 !important;
  box-shadow: 0 4px 12px rgba(117, 117, 117, 0.4) !important;
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

/* Filter Button Styles */
.filter-btn {
  background: #db4c77 !important;
}

.filter-btn:hover {
  background: #c2185b !important;
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
.wallet-btn {
  background: #4caf50 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3) !important;
  transition: all 0.3s ease !important;
}

.wallet-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4) !important;
  background: #388e3c !important;
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

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px;
  }

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
