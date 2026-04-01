<template>
  <v-dialog v-model="showDialog" max-width="1000px" persistent>
    <v-card>
      <v-card-title class="text-h5 font-weight-bold" style="color: #db4c77">
        <v-icon left color="#DB4C77">mdi-star</v-icon>
        Upgrade Your Subscription
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="#DB4C77"
            size="64"
          ></v-progress-circular>
          <div class="mt-4 text-body-1">Loading available apps...</div>
        </div>
        <div v-else>
          <!-- Billing Configuration Section -->
          <div class="mb-6">
            <h4 class="text-subtitle-1 font-weight-medium mb-3">
              Select Billing Plan
            </h4>
            <v-row>
              <v-col
                v-for="(plan, index) in billingPlans"
                :key="'plan-' + index"
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  outlined
                  class="billing-plan-card"
                  :class="{ 'selected-plan': selectedPlan === plan }"
                  @click="selectPlan(plan)"
                >
                  <v-card-text class="text-center pa-4">
                    <v-icon
                      :color="selectedPlan === plan ? '#DB4C77' : '#666'"
                      size="32"
                      class="mb-2"
                    >
                      mdi-credit-card
                    </v-icon>
                    <div class="text-body-2 font-weight-medium mb-2">
                      {{ plan.type || `Plan ${index + 1}` }}
                    </div>
                    <div class="text-caption text-grey-600 mb-2">
                      {{ plan.benifits || "Billing plan" }}
                    </div>
                    <!-- <div
                      class="text-h6 font-weight-bold"
                      style="color: #db4c77"
                    >
                      <v-icon size="20" color="#DB4C77" class="mr-1"
                        >mdi-currency-inr</v-icon
                      >
                      {{ plan.monthly_price || "0" }}
                    </div> -->
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <div class="mb-6">
            <p class="text-body-1">
              This are the apps that are available for your subscription.
            </p>
          </div>

          <!-- Combined Apps Section -->
          <div>
            <h4 class="text-subtitle-1 font-weight-medium mb-3">
              Available Apps
            </h4>
            <v-row>
              <v-col
                v-for="(app, index) in displayApps"
                :key="'app-' + index"
                cols="12"
                sm="6"
                md="3"
              >
                <v-card outlined class="app-card">
                  <v-card-text class="text-center pa-4">
                    <v-icon
                      :color="
                        app.isIncluded
                          ? getDefaultColor(app.dashboard_unique_type)
                          : getIconColor(app.dashboard_unique_type)
                      "
                      size="32"
                      class="mb-2"
                    >
                      {{ fecth_icons(app) }}
                    </v-icon>
                    <div class="text-body-2 font-weight-medium">
                      {{ app.dashboard_name }}
                    </div>
                    <!-- <div class="text-caption text-grey-600">
                      {{ app.isIncluded ? 'Included' : app.cost + '$/User' }}
                    </div> -->
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="pa-6">
        <v-spacer></v-spacer>
        <v-btn variant="outlined" @click="closeDialog" class="mr-3"
          >Cancel</v-btn
        >
        <v-btn
          color="#DB4C77"
          @click="proceedWithUpgrade"
          :loading="processing"
          :disabled="!selectedPlan"
        >
          <v-icon left>mdi-arrow-up-circle</v-icon>
          Upgrade Now
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { update_apps_details_organization } from "@/graphql/mutations.js";
import { get_all_apps_list } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  name: "UpgradeDialog",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      processing: false,
      userApplist: [],
      defaultAppList: [],
      adminApps: [],
      combinedApps: [],
      displayApps: [],
      billingPlans: [],
      selectedPlan: null,
    };
  },
  computed: {
    showDialog: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
  watch: {
    showDialog: {
      async handler(newVal) {
        // console.log("Dialog visibility changed:", newVal);
        if (newVal) {
          this.loadBillingPlans();
          await this.loadUpgradeApps();
        } else {
          this.resetDialog();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async loadUpgradeApps() {
      this.loading = true;
      try {
        const response = await API.graphql(
          graphqlOperation(get_all_apps_list, {
            input: {},
          })
        );

        const result = response.data.get_all_apps_list;
        const data = JSON.parse(result);

        if (data.Status === "SUCCESS") {
          const adminApps = data.data.admin_apps;
          const userApps = data.data.user_apps;
          this.combinedApps = userApps.concat(adminApps);

          // Sort by dashboard_name
          this.combinedApps.sort((a, b) => {
            const nameA = a.dashboard_name
              ? a.dashboard_name.toLowerCase()
              : "";
            const nameB = b.dashboard_name
              ? b.dashboard_name.toLowerCase()
              : "";
            return nameA.localeCompare(nameB);
          });
          this.displayApps = this.combinedApps;
          this.displayApps = this.displayApps.filter(
            (app) =>
              app.dashboard_unique_type !== "PREZENCE_ADMINS" &&
              app.dashboard_unique_type !== "ASSETS_ADMIN" &&
              app.dashboard_unique_type !== "TIMESHEET_ADMINS" &&
              app.dashboard_unique_type !== "BOOKING_SLOT_ADMINS" &&
              app.dashboard_unique_type !== "REWARDS_MANAGEMENT_ADMINS" &&
              app.dashboard_unique_type !== "EXPENSE_ADMINS" &&
              app.dashboard_unique_type !== "FORMS_ADMINS"
          );

          // console.log("combinedApps", this.combinedApps);

          // Filter out default apps from user apps

          // Process apps
          //   this.fetch_admin_apps(filteredUserApps, adminApps);
          //   this.fethc_default_apps(userApps, adminApps);
        } else {
          console.error("API returned non-success status:", data);
        }
      } catch (error) {
        console.error("Error loading upgrade apps:", error);
        this.$emit("show-snackbar", {
          text: "Failed to load available apps. Please try again.",
          color: "error",
        });
      } finally {
        this.loading = false;
      }
    },

    // fetch_admin_apps(userApps, adminAllApps) {
    //   console.log("userApps", userApps);
    //   console.log("adminAllApps", adminAllApps);
    //   this.userApplist = [];
    //   const data = userApps;
    //   const adminApps = adminAllApps;
    //   const typeMapping = {
    //     ASSETS_ADMIN: "ASSETS_USER",
    //     TIMESHEET_ADMINS: "TIMESHEET_USER",
    //     EXPENSE_ADMINS: "EXPENSE",
    //     EVENTS_ADMINS: "EVENTS",
    //     PREZENCE_ADMINS: "PREZENCE",
    //     BOOKING_SLOT_ADMINS: "BOOKING_SLOT",
    //     VISIT_ADMIN: "VISIT_USERS",
    //     GUESTHOUSE_ADMIN: "GUESTHOUSE_USER",
    //   };

    //   for (let i = 0; i < data.length; i++) {
    //     const matchingAdminApp = adminApps.find(
    //       (adminApp) =>
    //         typeMapping[adminApp.dashboard_unique_type] ===
    //         data[i].dashboard_unique_type
    //     );

    //     if (
    //       data[i].dashboard_unique_type === "COLLATERALS" ||
    //       data[i].dashboard_unique_type === "PROJECT_USER" ||
    //       data[i].dashboard_unique_type === "DIRECTORY_USER" ||
    //       data[i].dashboard_unique_type == "DASHBOARD_MANAGEMENT" ||
    //       data[i].dashboard_unique_type == "QABM_USERS" ||
    //       data[i].dashboard_unique_type == "SAIM_USERS" ||
    //       data[i].dashboard_unique_type == "VNDR_USERS" ||
    //       data[i].dashboard_unique_type == "AP_AR_USER" ||
    //       data[i].dashboard_unique_type == "ORDMG_USERS"
    //     ) {
    //       this.userApplist.push({
    //         appName: data[i].dashboard_name,
    //         userappID: data[i].dashboard_id,
    //         cost: data[i].app_cost,
    //       });
    //     } else if (matchingAdminApp) {
    //       this.userApplist.push({
    //         appName: data[i].dashboard_name,
    //         userappID: data[i].dashboard_id,
    //         adminAppId: matchingAdminApp.dashboard_id,
    //         cost: data[i].app_cost,
    //       });
    //     }
    //   }
    // },

    // fethc_default_apps(userApps, adminApps) {
    //   this.defaultAppList = [];

    //   // Find default apps (those with dashboard_id === "DEFAULT_APPS")
    //   const defaultApps = userApps.filter(app => app.dashboard_id === "DEFAULT_APPS");

    //   defaultApps.forEach(app => {
    //     this.defaultAppList.push({
    //       appName: app.dashboard_name,
    //       userappID: app.dashboard_id,
    //       cost: app.app_cost || 0,
    //     });
    //   });
    // },

    closeDialog() {
      this.showDialog = false;
    },

    async proceedWithUpgrade() {
        // console.log("selectedPlan", this.selectedPlan);
        // console.log("displayApps", this.combinedApps);
        let selectedApps = this.combinedApps.map(app => app.dashboard_id);
        // console.log("selectedApps", selectedApps);
      this.processing = true;

      try {
        let result = await API.graphql(
          graphqlOperation(update_apps_details_organization, {
            input: {
              enabled_apps: selectedApps,
              organization_billing_type:this.selectedPlan.type
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.update_apps_details_organization);
        if (response.Status == "SUCCESS") {
          this.$emit("show-snackbar", {
            text: "Upgrade successful! Your subscription has been updated.",
            color: "success",
          });
          this.closeDialog();
          window.location.reload();
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

    loadBillingPlans() {
      try {
        const orgDetails = this.$store.getters.GetOrgDetails;
        if (!orgDetails || !orgDetails.organization) {
          console.warn("Organization details not available");
          this.billingPlans = [];
          return;
        }

        const billingConfig = orgDetails.organization.billing_config;
        if (billingConfig && Array.isArray(billingConfig)) {
          this.billingPlans = billingConfig;
          // Auto-select first plan if available
          if (this.billingPlans.length > 0) {
            this.selectedPlan = this.billingPlans[0];
          }
        } else {
          console.warn("Billing config is not an array or is empty");
          this.billingPlans = [];
        }
      } catch (error) {
        console.error("Error loading billing plans:", error);
        this.billingPlans = [];
      }
    },

    selectPlan(plan) {
      this.selectedPlan = plan;
    },

    resetDialog() {
      this.userApplist = [];
      this.defaultAppList = [];
      this.selectedPlan = null;
    },

    // Helper methods for icons and colors
    fecth_icons(element) {
      //    console.log(element.dashboard_unique_type,'element');
      switch (element.dashboard_unique_type) {
        case "TASKS":
          return "mdi-calendar-check";

        case "EVENTS":
          return "mdi-calendar-text-outline";

        case "COLLATERALS":
          return "mdi-folder-open";

        case "DASHBOARD_MANAGEMENT":
          return "mdi-view-dashboard";

        case "PREZENCE":
          return "mdi-calendar-multiple";

        case "TICKET_MANAGEMENT":
          return "mdi-ticket";

        case "EXPENSE":
          return "mdi-cash-multiple";

        case "BOOKING_SLOT":
          return "mdi-book-outline";

        case "DIRECTORY_USER":
          return "mdi-file-key";

        case "TIMESHEET_USER":
          return "mdi-clipboard-text-clock-outline";

        case "PAYROLL":
          return "mdi-cash";

        case "ASSETS_USER":
          return "mdi-dip-switch";

        case "PROJECT_USER":
          return "mdi-dip-switch";

        case "PAYROLL_ADMINS":
          return "mdi-cash";

        case "EVENTS_ADMINS":
          return "mdi-calendar-text-outline";

        case "EXPENSE_ADMINS":
          return "mdi-cash-multiple";

        case "FORMS_ADMINS":
          return "mdi-file-document";

        case "TICKET_MANAGEMENT_ADMINS":
          return "mdi-ticket";

        case "user_team_ADMINS":
          return "mdi-account-multiple-outline";

        case "TICKET_TECHNICIAN_MANAGEMENT_ADMINS":
          return "mdi-human-male-board";

        case "BOOKING_SLOT_ADMINS":
          return "mdi-book-outline";

        case "PREZENCE_ADMINS":
          return "mdi-chart-box";

        case "TIMESHEET_ADMINS":
          return "mdi-clipboard-text-clock-outline";

        case "ASSETS_ADMIN":
          return "mdi-dip-switch";

        case "VISIT_ADMIN":
          return "mdi-account-group";
        case "MATERIAL_ADMIN":
          return "mdi-file-table-box-multiple-outline";
        case "user_approvals_ADMINS":
          return "mdi-timelapse";
        case "GUESTHOUSE_ADMIN":
          return "mdi-home-city";
        case "BILLING_ADMIN":
          return "mdi-cash-fast";
        case "GUESTHOUSE_USER":
          return "mdi-home-city";
        case "AP_AR_USER":
          return "mdi-cash-plus";
        case "TVBOARD_ADMIN":
          return "mdi-television";
        case "SURVEILLANCE_ADMINS":
          return "mdi-cctv";
        case "FARM_ADMINS":
          return "mdi-tractor";
        case "PURCHASE_ADMIN":
          return "mdi-file-chart-outline";
        case "LOADOPT_USER":
          return "mdi-truck-outline";
        case "DASHBOARD_MANAGEMENT_ADMINS":
          return "mdi-view-dashboard";
        case "QABM_ADMINS":
          return "mdi-comment-quote-outline";
        case "QABM_USERS":
          return "mdi-comment-quote-outline";
        case "LOADOPT_ADMIN":
          return "mdi-truck-outline";
        case "VNDR_USERS":
          return "mdi-cash";
        case "SAIM_USERS":
          return "mdi-ballot-outline";
        case "ORDMG_USERS":
          return "mdi-cart-arrow-right";
        case "customer_repository":
          return "mdi-database";
        case "REPORTS_ADMIN":
          return "mdi-chart-box";
        case "admin_settings":
          return "mdi-cog";
        case "CHECKLIST_ADMIN":
          return "mdi-format-list-checks";
        case "WEBBUILDER_ADMIN":
          return "mdi-web";
        case "REWARDS_MANAGEMENT_ADMINS":
          return "mdi-gift";
        // Additional dashboard types that might appear
        case "DEFAULT_APPS":
          return "mdi-apps";
        case "TEAMS":
          return "mdi-account-group";
        case "CUSTOMERS_ADMINS":
          return "mdi-account-multiple";
        case "CALLCENTRAL_ADMIN":
          return "mdi-phone";
        case "CUSTOMER_MANAGEMENT":
          return "mdi-account-multiple";
        case "FORMS":
          return "mdi-file-document";
        case "MATERIAL_MANAGEMENT_ADMINS":
          return "mdi-truck";
        case "REWARDS_RECOGNITION_USERS":
          return "mdi-gift";
        case "ORDERS":
          return "mdi-cart";
        case "ORG_GPT_COMPONENTS":
          return "mdi-robot";
        case "PRESENCE_APP":
          return "mdi-account-check";
        case "PURCHASE":
          return "mdi-shopping";
        case "QUOTATION_BUILDER":
          return "mdi-file-chart";
        case "SETTINGS_COMPONENTS":
          return "mdi-cog";
        case "SLOT_BOOKING":
          return "mdi-calendar-clock";
        case "SURVEILLANCE_APP":
          return "mdi-cctv";
        case "TASK_DETAILS_APP":
          return "mdi-clipboard-list";
        case "TIME_SHEETS":
          return "mdi-clock";
        case "TV_APP":
          return "mdi-television";
        case "VEHICLE_OPTIMIZER":
          return "mdi-car";
        case "VENDOR_MANAGEMENT":
          return "mdi-account-tie";
        case "VISITS_MANAGEMENT_APP":
          return "mdi-map-marker";
        case "WEBSITE_BUILDER_APP":
          return "mdi-web";
        case "WORKFLOW_REPORTS":
          return "mdi-chart-line";
        case "BROADCAST":
          return "mdi-broadcast";
        case "CHANNELS":
          return "mdi-message-text";
        case "CHECKLIST":
          return "mdi-format-list-checks";
        case "DISCUSSION_ROOM":
          return "mdi-chat";
        case "FARM_APP":
          return "mdi-sprout";
        case "FORM_DESIGNER":
          return "mdi-form-select";
        case "GUEST_HOUSE_BOOKING":
          return "mdi-home";
        case "LOOKITUP_DIRECTORY":
          return "mdi-account-search";
        case "NEW_CABINET":
          return "mdi-folder";
        case "PRESENCE_APP":
          return "mdi-account-check";
        case "PROJECT_MANAGEMENT":
          return "mdi-briefcase";
        case "REWARDS_MANAGEMENT":
          return "mdi-trophy";
        case "SLOT_BOOKING":
          return "mdi-calendar-clock";
        case "SURVEILLANCE_APP":
          return "mdi-cctv";
        case "TASK_DETAILS_APP":
          return "mdi-clipboard-list";
        case "TICKET_MANAGEMENT":
          return "mdi-ticket";
        case "TIMESHEETS":
          return "mdi-clock";
        case "TV_APP":
          return "mdi-television";
        case "VEHICLE_OPTIMIZER":
          return "mdi-car";
        case "VISITS_MANAGEMENT_APP":
          return "mdi-map-marker";
        case "WEBSITE_BUILDER_APP":
          return "mdi-web";
        case "WORKFLOW_REPORTS":
          return "mdi-chart-line";
        default:
          return "mdi-help";
      }
    },

    getDefaultColor(dashboardUniqueType) {
      return "#4CAF50"; // Green for included apps
    },

    getIconColor(dashboardUniqueType) {
      const colorMap = {
        TASKS: "#4CAF50",
        EVENTS: "#FFC107",
        COLLATERALS: "#9C27B0",
        DASHBOARD_MANAGEMENT: "#795548",
        PREZENCE: "#2196F3",
        TICKET_MANAGEMENT: "#FF9800",
        EXPENSE: "#8BC34A",
        BOOKING_SLOT: "#E91E63",
        DIRECTORY_USER: "#607D8B",
        TIMESHEET_USER: "#00BCD4",
        PAYROLL: "#4CAF50",
        ASSETS_USER: "#FF9800",
        PROJECT_USER: "#FF9800",
        PAYROLL_ADMINS: "#4CAF50",
        EVENTS_ADMINS: "#FFC107",
        EXPENSE_ADMINS: "#8BC34A",
        FORMS_ADMINS: "#3F51B5",
        TICKET_MANAGEMENT_ADMINS: "#FF9800",
        user_team_ADMINS: "#2196F3",
        TICKET_TECHNICIAN_MANAGEMENT_ADMINS: "#607D8B",
        BOOKING_SLOT_ADMINS: "#E91E63",
        PREZENCE_ADMINS: "#2196F3",
        TIMESHEET_ADMINS: "#00BCD4",
        ASSETS_ADMIN: "#FF9800",
        VISIT_ADMIN: "#2196F3",
        MATERIAL_ADMIN: "#795548",
        user_approvals_ADMINS: "#FFC107",
        GUESTHOUSE_ADMIN: "#FF9800",
        BILLING_ADMIN: "#4CAF50",
        GUESTHOUSE_USER: "#FF9800",
        AP_AR_USER: "#4CAF50",
        TVBOARD_ADMIN: "#00BCD4",
        SURVEILLANCE_ADMINS: "#FF5722",
        FARM_ADMINS: "#4CAF50",
        PURCHASE_ADMIN: "#3F51B5",
        LOADOPT_USER: "#795548",
        DASHBOARD_MANAGEMENT_ADMINS: "#795548",
        QABM_ADMINS: "#607D8B",
        QABM_USERS: "#607D8B",
        LOADOPT_ADMIN: "#795548",
        VNDR_USERS: "#4CAF50",
        SAIM_USERS: "#9C27B0",
        ORDMG_USERS: "#FF9800",
        customer_repository: "#607D8B",
        REPORTS_ADMIN: "#2196F3",
        admin_settings: "#607D8B",
        CHECKLIST_ADMIN: "#4CAF50",
        WEBBUILDER_ADMIN: "#3F51B5",
        REWARDS_MANAGEMENT_ADMINS: "#FFC107",
        // Additional colors for new dashboard types
        DEFAULT_APPS: "#4CAF50",
        TEAMS: "#2196F3",
        CRM: "#FF5722",
        CUSTOMER_MANAGEMENT: "#607D8B",
        INVENTORY: "#795548",
        MATERIAL_MANAGEMENT: "#FF5722",
        NEW_CABINET: "#9C27B0",
        ORDERS: "#E91E63",
        ORG_GPT_COMPONENTS: "#00BCD4",
        PRESENCE_APP: "#2196F3",
        PURCHASE: "#8BC34A",
        QUOTATION_BUILDER: "#3F51B5",
        SETTINGS_COMPONENTS: "#607D8B",
        SLOT_BOOKING: "#E91E63",
        SURVEILLANCE_APP: "#FF5722",
        TASK_DETAILS_APP: "#4CAF50",
        TIME_SHEETS: "#9C27B0",
        TV_APP: "#00BCD4",
        VEHICLE_OPTIMIZER: "#795548",
        VENDOR_MANAGEMENT: "#607D8B",
        VISITS_MANAGEMENT_APP: "#8BC34A",
        WEBSITE_BUILDER_APP: "#3F51B5",
        WORKFLOW_REPORTS: "#FFC107",
        BROADCAST: "#E91E63",
        CHANNELS: "#2196F3",
        CHECKLIST: "#4CAF50",
        DISCUSSION_ROOM: "#00BCD4",
        FARM_APP: "#4CAF50",
        FORM_DESIGNER: "#3F51B5",
        GUEST_HOUSE_BOOKING: "#FF9800",
        LOOKITUP_DIRECTORY: "#607D8B",
        PROJECT_MANAGEMENT: "#FF9800",
        REWARDS_MANAGEMENT: "#FFC107",
        TIMESHEETS: "#9C27B0",
      };
      return colorMap[dashboardUniqueType] || "#DB4C77";
    },
  },
};
</script>

<style scoped>
.app-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  height: 120px; /* Fixed height for app cards */
  display: flex;
  flex-direction: column;
}

.app-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.app-card .v-card-text {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.billing-plan-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
}

.billing-plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.billing-plan-card.selected-plan {
  border-color: #db4c77;
  background-color: rgba(219, 76, 119, 0.05);
}

.billing-plan-card.selected-plan .v-card-text {
  background-color: rgba(219, 76, 119, 0.05);
}

.billing-plan-card .v-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style> 