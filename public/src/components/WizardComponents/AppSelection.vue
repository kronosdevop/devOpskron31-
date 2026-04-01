<template>
  <div>
    <v-card class="" flat>
      <v-form ref="form">
        <v-row class="" no-gutters>
          <v-col
            cols="12"
            class="d-flex flex-column align-center justify-center"
          >
            <b>We're providing the apps for your application</b><br />
            <!-- <div style="font-size: 10px">
              These are the apps we provide for your free trial.
            </div> -->
          </v-col>

          <v-col cols="12">
            <v-row no-gutters>
              <!-- <v-col cols="2" class="d-flex align-center justify-center">
                <v-card
                  outlined
                  class="side-btn"
                  style="
                    transform: rotate(-90deg);
                    width: 200px;
                    height: 40px;
                    display: flex;
                    font-size: 10px;
                    justify-content: center;
                    align-items: center;
                    background-color: #e0e0e0;
                  "
                >
                  Must have Apps
                </v-card>
              </v-col> -->

              <v-col cols="12">
                <v-row justify="space-around" class="mt-2">
                  <v-card
                    v-for="(app, index) in defaultAppList"
                    :key="index"
                    class="d-flex flex-column justify-center align-center card-style ma-1 "
                    outlined
                  >
                    <v-icon :color="getDefaultColor(app.appName)" size="36px">
                      {{ fecth_icons(app.appName) }}
                    </v-icon>
                    <div class="text-center mt-2">{{ app.appName }}</div>
                  </v-card>
                </v-row>
              </v-col>
            </v-row>
            <!-- <div style="font-size: 13px; margin-left: 120px; margin-top: 20px">
              {{ defaultappcost }}$/User for all must-have apps.
            </div> -->
            <!-- <v-divider class="mt-4 mb-2" /> -->
            <!-- <v-row no-gutters>
              <v-col cols="2" class="d-flex align-center justify-center">
                <v-card
                  outlined
                  class="side-btn"
                  style="
                    transform: rotate(-90deg);
                    width: 200px;
                    height: 40px;
                    display: flex;
                    font-size: 10px;
                    justify-content: center;
                    align-items: center;
                    background-color: #e0e0e0;
                  "
                >
                  More Apps
                </v-card>
              </v-col>
              <v-col cols="10">
                <v-row justify="space-around" class="mt-2">
                  <v-card
                    v-for="(app, index) in userApplist"
                    :key="index"
                    class="d-flex flex-column justify-center align-center card-style ma-1"
                    outlined
                    :class="{ 'selected-card': selectedAppList.includes(app) }"
                    @click="selected_app(app)"
                  >
                    <v-icon :color="getIconColor(app.appName)" size="36px">
                      {{ fecth_icons(app.appName) }}
                    </v-icon>
                    <div class="text-center mt-2">
                      {{ fecth_name(app.appName) }}
                    </div>
                    <div style="font-size: 11px">{{ app.cost }}$/User</div>
                  </v-card>
                </v-row>
              </v-col>
            </v-row> -->
          </v-col>
        </v-row>
      </v-form>
      <v-card-actions class="justify-center mt-4">
        <v-btn
          depressed
          :loading="loading"
          @click="back_step()"
          dark
          color="primary"
        >
          Back
        </v-btn>
        <v-btn
          depressed
          :loading="loading"
          @click="next_step()"
          dark
          class="cardCss"
        >
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_all_apps_list } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  data() {
    return {
      loading: false,
      userApplist: [],
      defaultAppList: [],
      selectedAppList: [],
      adminApps: [],
      defaultappcost: null,
    };
  },
  async created() {
    // this.fethc_default_apps();
    await this.fethc_all_aps();
  },
  methods: {
    async fethc_all_aps() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_all_apps_list, {
            input: {},
          })
        );
        var response = JSON.parse(result.data.get_all_apps_list);
        // console.log(response);
        if (response.Status == "SUCCESS") {
          // console.log(response.data);
          var adminApps = response.data.admin_apps;
          var userApps = response.data.user_apps;
          this.adminApps = response.data.admin_apps;
          userApps = userApps.filter(
            (app) => app.dashboard_id !== "DEFAULT_APPS"
          );
          // console.log(userApps)
          var DefaultAppscost = response.data.user_apps;
          let defaultApp = DefaultAppscost.find(
            (app) => app.dashboard_id === "DEFAULT_APPS"
          );
          this.defaultappcost = defaultApp ? defaultApp.app_cost : 0;

          this.fetch_admin_apps(userApps, adminApps);
          this.fethc_default_apps(userApps, adminApps);
        } else {
        }
      } catch (error) {}
    },
    fetch_admin_apps(userApps, adminAllApps) {
      this.userApplist = [];
      const data = userApps;
      const adminApps = adminAllApps;
      const typeMapping = {
        ASSETS_ADMIN: "ASSETS_USER",
        TIMESHEET_ADMINS: "TIMESHEET_USER",
        // TICKET_MANAGEMENT_ADMINS: "TICKET_MANAGEMENT",
        EXPENSE_ADMINS: "EXPENSE",
        EVENTS_ADMINS: "EVENTS",
        PREZENCE_ADMINS: "PREZENCE",
        BOOKING_SLOT_ADMINS: "BOOKING_SLOT",
        VISIT_ADMIN: "VISIT_USERS",
        GUESTHOUSE_ADMIN: "GUESTHOUSE_USER",
      };

      for (let i = 0; i < data.length; i++) {
        const matchingAdminApp = adminApps.find(
          (adminApp) =>
            typeMapping[adminApp.dashboard_unique_type] ===
            data[i].dashboard_unique_type
        );

        if (
          data[i].dashboard_unique_type === "COLLATERALS" ||
          data[i].dashboard_unique_type === "PROJECT_USER" ||
          data[i].dashboard_unique_type === "DIRECTORY_USER" ||
          data[i].dashboard_unique_type == "DASHBOARD_MANAGEMENT" ||
          data[i].dashboard_unique_type == "QABM_USERS" ||
          data[i].dashboard_unique_type == "SAIM_USERS" ||
          data[i].dashboard_unique_type == "VNDR_USERS" ||
          data[i].dashboard_unique_type == "AP_AR_USER" ||
          data[i].dashboard_unique_type == "ORDMG_USERS"
        ) {
          this.userApplist.push({
            appName: data[i].dashboard_name,
            userappID: data[i].dashboard_id,
            cost: data[i].app_cost,
          });
        } else if (matchingAdminApp) {
          this.userApplist.push({
            appName: data[i].dashboard_name,
            userappID: data[i].dashboard_id,
            adminAppId: matchingAdminApp.dashboard_id,
            cost: data[i].app_cost,
          });
        }
        // console.log(this.userApplist);
        this.userApplist.sort((a, b) => a.appName.localeCompare(b.appName));
      }
    },

    selected_app(value) {
      const index = this.selectedAppList.indexOf(value);
      if (index === -1) {
        this.selectedAppList.push(value);
      } else {
        this.selectedAppList.splice(index, 1);
      }
    },
    fethc_default_apps(defaultUserApps, defaultAdminApps) {
      this.defaultAppList = [];
      // const defaultUserApps = this.$store.getters.GetUserObj.user_apps;
      // console.log(defaultUserApps);
      // const defaultAdminApps = this.$store.getters.GetUserObj.admin_apps;
      const typeMapping = {
        FORMS_ADMINS: "FORMS",
      };
      for (let i = 0; i < defaultUserApps.length; i++) {
        const matchAdminApp = defaultAdminApps.find(
          (adminApp) =>
            typeMapping[adminApp.dashboard_unique_type] ===
            defaultUserApps[i].dashboard_unique_type
        );

        if (defaultUserApps[i].dashboard_unique_type === "TASKS") {
          this.defaultAppList.push({
            appName: defaultUserApps[i].dashboard_name,
            userappID: defaultUserApps[i].dashboard_id,
            cost: defaultUserApps[i].app_cost,
          });
        } else if (matchAdminApp) {
          this.defaultAppList.push({
            appName: defaultUserApps[i].dashboard_name,
            userappID: defaultUserApps[i].dashboard_id,
            adminAppId: matchAdminApp.dashboard_id,
            cost: defaultUserApps[i].app_cost,
          });
        }
      }
      const additionalApps = [
        { appName: "Teams", userappID: null },
        { appName: "Channels", userappID: null },
      ];

      this.defaultAppList.unshift(...additionalApps);
      // console.log(this.defaultAppList);
      // this.defaultAppList.sort((a, b) => a.appName.localeCompare(b.appName));
    },

    getRandomDarkColor() {
      let color = "#";
      const letters = "0123456789ABCDEF";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 8)];
      }
      return color;
    },

    getDefaultColor(appName) {
      switch (appName) {
        case "Teams":
          return "blue";
        case "Channels":
          return "teal darken-2";
        case "Tasks":
          return "red";
        case "Forms":
          return "green";
      }
    },

    fecth_icons(appName) {
      switch (appName) {
        case "Assests":
          return "mdi-dip-switch";
        case "Assets":
          return "mdi-dip-switch";
        case "Attendance/Presence":
          return "mdi-calendar-text-outline";
        case "Cabinet":
          return "mdi-folder-open";
        case "Dashboard":
          return "mdi-view-dashboard";
        case "Directory":
          return "mdi-calendar-multiple";
        case "Events":
          return "mdi-chart-box";
        case "Expenses":
          return "mdi-cash-multiple";
        case "Tickets":
          return "mdi-ticket";
        case "Project":
          return "mdi-dip-switch";
        case "Slot Booking":
          return "mdi-book-outline";
        case "Timesheet":
          return "mdi-clipboard-text-clock-outline";
        case "Ticket Management":
          return "mdi-human-male-board";
        case "Visits":
          return "mdi-account-group";
        case "Channels":
          return "mdi-broadcast";
        case "Forms":
          return "mdi-form-select";
        case "Tasks":
          return "mdi-calendar-check";
        case "Teams":
          return "mdi-account-group";
        case "Quotation and Billing Management":
          return "mdi-comment-quote-outline";
        case "Guest House":
          return "mdi-home-city";
        case "Vendor Management":
          return "mdi-cash";
        case "Stock and Inventory Management":
          return "mdi-ballot-outline";
        case "AP/AR":
          return "mdi-cash-plus";
          case "Order Management":
          return "mdi-cart-arrow-right";
        default:
          return "mdi-help";
      }
    },

    fecth_name(appName) {
      switch (appName) {
        case "Attendance/Presence":
          return "Presence";
        case "Ticket Management":
          return "Tickets";
        case "Quotation and Billing Management":
          return "Quotation";
        case "Stock and Inventory Management":
          return "Inventory";
          case "Order Management":
          return "Order Track";
        default:
          return appName;
      }
    },

    getIconColor(appName) {
      switch (appName) {
        case "Assets":
          return "blue";
        case "Attendance/Presence":
          return "green";
        case "Cabinet":
          return "red";
        case "Dashboard":
          return "purple";
        case "Directory":
          return "blue";
        case "Events":
          return "green";
        case "Expenses":
          return "red";
        case "Tickets":
          return "purple";
        case "Project":
          return "blue";
        case "Slot Booking":
          return "green";
        case "Timesheet":
          return "purple";
        default:
          return "brown darken-3";
      }
    },

    next_step() {
      this.fetch_ids_selected();
      this.$emit("emitToFourth", 0);
    },

    fetch_ids_selected() {
      var defaultIds = [];
      var adminApps = [];
      this.defaultAppList.forEach((element) => {
        if (element.userappID != null) {
          defaultIds.push(element.userappID);
        }
      });

      this.selectedAppList.forEach((element) => {
        if (element.userappID != null) {
          defaultIds.push(element.userappID);
        }
        if (element.adminAppId != undefined) {
          adminApps.push(element.adminAppId);
        }
      });
      const formAdminsDashboardIds = this.filterByUniqueType(this.adminApps, [
        "FORMS_ADMINS",
        "BILLING_ADMIN",
      ]);
      const concatenatedArray = [
        ...defaultIds,
        ...adminApps,
        ...formAdminsDashboardIds,
      ];

      // Output the result to the console

      this.$emit("selectedApps", concatenatedArray);
    },
    filterByUniqueType(dashboards, uniqueTypes) {
      return dashboards
        .filter((dashboard) =>
          uniqueTypes.includes(dashboard.dashboard_unique_type)
        ) // Filter by the multiple types
        .map((dashboard) => dashboard.dashboard_id); // Extract the 'dashboard_id'
    },
    back_step() {
      this.$emit("prevsecondStep", 3);
    },
  },
};
</script>
<style scoped>
.side-btn {
  height: 100%;
  border-radius: 12px;
  text-transform: none;
  font-weight: normal;
  font-size: 14px;
}
.card-style {
  width: 120px;
  height: 100px;
  background-color: #f5f5f5;
  border-radius: 16px;
  text-align: center;
  padding: 10px;
}
.selected-card {
  border: 2px solid #42a5f5 !important;
  background-color: #e3f2fd !important;
  color: black !important;
  position: relative;
}
.selected-card::after {
  content: "✓";
  color: white;
  font-size: 16px;
  font-weight: bold;
  position: absolute;
  top: 4px;
  right: 6px;
  background-color: #42a5f5 !important;
  border-radius: 0%;
  width: 15px;
  height: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.badge_left {
  position: absolute;
  top: 20px;
  left: 5px;
  font-size: 3px !important;
}
</style>