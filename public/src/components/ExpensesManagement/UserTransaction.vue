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
          <span class="header-title">Expenses</span>
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

        <!-- Search Field -->
        <div v-if="activeTab === 'expense'" class="search-container">
          <v-text-field
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

        <!-- Action Buttons -->
        <v-btn
          v-if="activeTab === 'expense'"
          @click="add_expense()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Initiate</span>
        </v-btn>

        <v-btn
          v-if="activeTab === 'pettycash'"
          @click="log_petty_cash()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Log Petty Cash</span>
        </v-btn>

        <v-btn
          v-if="activeTab === 'pettycash'"
          @click="on_wallet_click()"
          class="action-btn wallet-btn"
          size="small"
        >
          <v-icon>mdi-wallet</v-icon>
          <span>Wallet: ₹{{ currentBalance }}</span>
          <v-icon size="16" class="ml-2">mdi-plus-circle</v-icon>
        </v-btn>

        <v-btn
          v-if="adminAppExists"
          @click="open_settings()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-cog</v-icon>
          <span>Administrator</span>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs v-model="activeTab" mandatory class="modern-tab-toggle">
          <v-tab value="expense" class="tab-btn">
            <!-- <v-icon left>mdi-cash</v-icon> -->
            Expenses
          </v-tab>
          <v-tab value="pettycash" class="tab-btn">
            <!-- <v-icon left>mdi-wallet</v-icon> -->
            Petty Cash
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-card flat class="overflow-y-auto">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <v-card class="" flat>
          <!-- Content -->
          <v-card-text class="pa-4">
            <v-window v-model="activeTab">
              <!-- Expense Tab -->
              <v-window-item value="expense">
                <UserExpense
                  :key="expenseKey"
                  :searchValue="searchValue"
                  v-on:search-changed="handleSearchChange"
                />
              </v-window-item>

              <!-- Petty Cash Tab -->
              <v-window-item value="pettycash">
                <UserPettyCash
                  :key="pettyCashKey"
                  :currentBalance="currentBalance"
                  v-on:balance-updated="handleBalanceUpdate"
                />
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>

        <!-- Add Transaction Dialog -->
        <div v-if="componentCheck == 1">
          <AddTransaction
            :transactionAdd="transactionAdd"
            :transactionType="activeTab"
            v-on:errorMsg="error_info"
            v-on:successMsg="success_info"
            @clicked="transactionAdd = false"
          />
        </div>

        <!-- Add Expense Dialog -->
        <div v-if="componentCheck == 2">
          <AddExpense
            :expenseAdd="expenseAdd"
            v-on:errorMsg="error_info"
            v-on:successMsg="success_info"
            @clicked="expenseAdd = false"
          />
        </div>

        <!-- Add Petty Cash Dialog -->
        <div v-if="componentCheck == 3">
          <AddPettyCashDialog
            :model-value="pettyCashAdd"
            @update:model-value="pettyCashAdd = $event"
            v-on:errorMsg="error_info"
            v-on:successMsg="success_info"
            @clicked="pettyCashAdd = false"
          />
        </div>

        <!-- Request Advance Dialog -->
        <div v-if="componentCheck == 4">
          <RequestAdvanceDialog
            :advanceDialog="requestAdvanceDialog"
            @clicked="requestAdvanceDialog = false"
            v-on:errorMsg="error_info"
            v-on:successMsg="success_info"
          />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import UserExpense from "./UserExpense.vue";
import UserPettyCash from "./UserPettyCash.vue";
import AddTransaction from "./ExpensePopups/AddTransaction.vue";
import AddExpense from "./ExpensePopups/AddExpense.vue";
import AddPettyCashDialog from "./AddPettyCashDialog.vue";
import RequestAdvanceDialog from "./RequestAdvanceDialog.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  name: "UserTransaction",
  components: {
    SnackBar,
    UserExpense,
    UserPettyCash,
    AddTransaction,
    AddExpense,
    AddPettyCashDialog,
    RequestAdvanceDialog,
    CreateExternalTicketDialog,
  },
  data() {
    return {
      SnackBarComponent: {},
      activeTab: "expense",
      transactionAdd: false,
      expenseAdd: false,
      pettyCashAdd: false,
      requestAdvanceDialog: false,
      adminAppExists: false,
      componentCheck: 0,
      windowHeight: 0,
      searchValue: "",
      expenseKey: 0,
      pettyCashKey: 0,
      currentBalance: 0,
      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
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
    handleSearchChange(value) {
      // console.log('Search changed:', value);
      this.searchValue = value;
      // The child component will handle the search through the prop watcher
    },

    add_expense() {
      this.componentCheck = 2;
      this.expenseAdd = true;
    },

    log_petty_cash() {
      this.componentCheck = 3;
      this.pettyCashAdd = true;
    },

    on_wallet_click() {
      this.componentCheck = 4;
      this.requestAdvanceDialog = true;
    },

    handleBalanceUpdate(balance) {
      this.currentBalance = balance;
    },

    open_settings() {
      this.$router.push("/home/AppadminExpenses");
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

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
      if (adminExists.is_visible == false) {
        this.adminAppExists = false;
        return;
      }
      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    add_transaction() {
      this.componentCheck = 1;
      this.transactionAdd = true;
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
      this.transactionAdd = false;
      this.expenseAdd = false;
      this.pettyCashAdd = false;
      this.requestAdvanceDialog = false;

      // Refresh the components by changing the keys
      this.expenseKey += 1;
      this.pettyCashKey += 1;
    },
  },
  created() {
    this.windowHeight = window.innerHeight - 200;
    this.fetch_admin_apps();
  },
};
</script>

<style scoped>
/* Modern Header Section */

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

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

/* Legacy Tab Styles (keeping for compatibility) */
.v-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
}

.v-tabs :deep(.v-tab--selected) {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* Search Container Styles */
.search-container {
  margin-right: 16px;
  min-width: 200px;
}

.search-field {
  width: 100%;
}

/* Wallet Button Styles */
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

  .search-container {
    min-width: 200px;
    margin-right: 8px;
  }
}
</style>
