<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    
    <!-- Card Grid View -->
    <div v-if="!selectedComponent">
      <v-card flat class="pa-4 overflow-y-auto" :height="windowHeight">
        <v-card-text class="pa-0">
          <!-- Card Grid Layout -->
          <v-row>
            <v-col 
              v-for="(item, index) in approvalCards" 
              :key="index"
              cols="12"
              sm="6"
              md="4"
              class="mb-4"
            >
              <v-card 
                class="approval-card"
                elevation="2"
                @click="openComponent(item)"
              >
                <v-card-text class="pa-4">
                  <!-- Header with Icon -->
                  <div class="d-flex align-start mb-3">
                    <!-- Icon Container -->
                    <div class="icon-container">
                      <v-icon class="icon-outline" size="24">{{ item.icon }}</v-icon>
                    </div>
                  </div>

                  <!-- Title -->
                  <div class="mb-2">
                    <h3 class="card-title">{{ item.title }}</h3>
                  </div>

                  <!-- Description -->
                  <p class="card-description">{{ item.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Component View with Back Button -->
    <div v-else>
      <v-card flat class="">
        <!-- Back Button -->
        <v-toolbar flat class="mb-2 bg-white">
          <v-btn
           color="primary"
            variant="text"
            @click="goBack"
            class="mr-2 text-capitalize"
          >
          <v-icon>mdi-arrow-left</v-icon>
          Back
          </v-btn>
          <v-toolbar-title class="text-h6">{{ selectedComponent.title }}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        
        <!-- Component Content -->
        <v-card-text class="pa-0">
          <component 
            :is="selectedComponent.component" 
            v-if="selectedComponent.component"
            @backAction="goBack"
          />
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
  
  <script>
  /* eslint-disable */
  import SnackBar from "@/components/SnackBar.vue";
import ExpenseApproval from "@/components/ExpensesManagement/ExpenseApproval.vue";
import PettyCashLogApproval from "@/components/ExpensesManagement/PettyCashLogApproval.vue";
import PettyCashRequestApproval from "@/components/ExpensesManagement/PettyCashRequestApproval.vue";
import PettyCashOrgApproval from "@/components/ExpensesManagement/PettyCashOrgApproval.vue";
  
  export default {
    name: "ApprovalManagement",
      components: {
    SnackBar,
    ExpenseApproval,
    PettyCashLogApproval,
    PettyCashRequestApproval,
    PettyCashOrgApproval,
  },
  data() {
    return {
      selectedComponent: null,
      SnackBarComponent: {},
      windowHeight: window.innerHeight - 150,
      
      // Approval cards configuration
      approvalCards: [
        {
          title: "Petty Cash Log Approval",
          description: "Review and approve petty cash log entries",
          icon: "mdi-cash-register",
          value: "petty_cash_log",
          component: "PettyCashLogApproval"
        },
        {
          title: "Petty Cash Request Approval",
          description: "Approve petty cash requests from employees",
          icon: "mdi-cash-plus",
          value: "petty_cash_request",
          component: "PettyCashRequestApproval"
        },
        {
          title: "Expense Approval",
          description: "Review and approve employee expense reports",
          icon: "mdi-receipt",
          value: "expense_approval",
          component: "ExpenseApproval"
        },
        {
          title: "Petty Cash Organization Approval",
          description: "Manage organization-level petty cash approvals",
          icon: "mdi-office-building",
          value: "petty_cash_org_approval",
          component: "PettyCashOrgApproval"
        }
      ]
    };
  },
  mounted() {
    this.windowHeight = window.innerHeight - 150;
    
    // Add window resize listener for dynamic height
    window.addEventListener('resize', this.handleResize);
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  
  methods: {
    // Component navigation methods
    openComponent(item) {
      this.selectedComponent = item;
    },

    goBack() {
      this.selectedComponent = null;
    },
    
    refreshData() {
      // Show refresh notification
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "blue",
        SnackbarText: "Refreshing approval data...",
        timeout: 2000,
        Top: true,
      };
      
      // Emit refresh event to child components
      this.$nextTick(() => {
        this.$emit('refresh-data');
      });
    },
    
    handleResize() {
      this.windowHeight = window.innerHeight - 150;
    },
  },
  };
  </script>
  
<style scoped>
/* Card Grid Layout */
.approval-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  height: 100% !important;
  min-height: 180px !important;
  background: white !important;
  border: 1px solid transparent !important;
}

.approval-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  background: linear-gradient(135deg, #FFE5F0 0%, #E8F4FD 50%, #F0E8FF 100%) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}

/* Icon Container */
.icon-container {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #DB4C77 0%, #9C27B0 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.3) !important;
}

/* Icon Outline Style */
.icon-outline {
  color: rgba(255, 255, 255, 0.85) !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) !important;
  text-shadow: 
    0 0 2px rgba(255, 255, 255, 0.6),
    0 0 4px rgba(255, 255, 255, 0.4),
    0 0 6px rgba(255, 255, 255, 0.2) !important;
  opacity: 0.95 !important;
}

/* Card Title */
.card-title {
  font-size: 18px !important;
  font-weight: 500 !important;
  color: #2c3e50 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Card Description */
.card-description {
  font-size: 14px !important;
  color: #6c757d !important;
  line-height: 1.4 !important;
  margin: 0 !important;
  font-weight: 400 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .approval-card {
    min-height: 160px !important;
  }
  
  .card-title {
    font-size: 16px !important;
  }
  
  .card-description {
    font-size: 13px !important;
  }
  
  .icon-container {
    width: 40px !important;
    height: 40px !important;
  }
}
</style> 