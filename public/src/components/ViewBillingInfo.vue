<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="ViewbillingDialog" @update:model-value="$emit('update:ViewbillingDialog', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card class="overflow-hidden">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Billing App Details</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog">mdi-close</v-icon>
        </v-toolbar>
        <!-- <v-card-text class="scrollable-content">
          <v-container>
            <v-row>
              <v-col v-for="(app, index) in appsall" :key="index" cols="3">
                <v-card
                  class="d-flex flex-column justify-center align-center card-style pa-3"
                  outlined
                >
                  <v-icon :color="getDefaultColor(app.appName)" size="36px">
                    {{ fecth_icons(app.appName) }}
                  </v-icon>
                  <div class="text-center mt-2">
                    <strong style="font-size: 12px">{{
                      fecth_name(app.appName)
                    }}</strong>
                  </div>
                  <div style="font-size: 11px" class="mt-n1">
                    {{ app.cost }}$/User
                  </div>
                  <div style="font-size: 11px" class="mt-n1">
                    Total Users-{{ app.users }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text> -->
        <v-toolbar flat>
          <div>Total Amount to Pay- {{ total }} $</div>
          <v-spacer />
          <v-btn
            depressed
            :loading="loading"
            v-if="rowInfo.billing_due == 'DUE'"
            @click="app_Payment()"
            dark
            small
            class="cardCss text-capitalize"
          >
            Pay
          </v-btn></v-toolbar
        >
        <v-card-text class="text-left">
          <v-data-table
            :headers="headers"
            :items="appsall"
            :loading="tableLoading"
            :fixed-header="fixed"
            hide-default-footer
            :items-per-page="100"
            dense
            class="elevation-1 dtwidth mt-2"
          ></v-data-table>
          <!-- :height="height" -->
        </v-card-text>
        <!-- <v-card-actions>
          <div>Total Amount to Pay- {{ total }}</div>
          <v-spacer />
          <v-btn
            depressed
            :loading="loading"
            @click="app_Payment()"
            dark
            small
            class="cardCss mt-6 mr-12 button-corner text-capitalize"
          >
            Pay
          </v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
var axios = require("axios");
// import { loadStripe } from "@stripe/stripe-js";

export default {
  props: {
    ViewbillingDialog: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      stripe: null,
      appsall: [],
      defaultApp: {},
      loading: false,
      height: 0,
      total: "",
      tableLoading: false,
      fixed: true,
      headers: [
        { text: "Description", value: "appName", sortable: false },
        {
          text: " Unit Cost (Per Day/User)",
          value: "cost",
          sortable: false,
        },
        {
          text: "Usage Quantity",
          value: "users",
          sortable: false,
        },
        {
          text: "Amount (in USD)",
          value: "total_cost",
          sortable: false,
        },
      ],
    };
  },
  watch: {
    ViewbillingDialog: {
      async handler() {
        if (this.ViewbillingDialog == true) {
          this.height = window.innerHeight - 390;
          this.total = this.rowInfo.total_ammount_to_pay;
          this.appsall = [];
          this.rowInfo.app_cost_details.forEach((app) => {
            if (app.dashboard_unique_type != "DEFAULT_APPS") {
              this.appsall.push({
                appName: app.app_name,
                cost: app.app_cost_day,
                users: app.total_users_count,
                total_cost: app.total_cost,
              });
            } else {
              this.defaultApp = app;
            }
          });

          this.appsall.sort((a, b) => a.appName.localeCompare(b.appName));
          this.appsall.unshift({
            appName: this.defaultApp.app_name,
            cost: this.defaultApp.app_cost_day,
            users: this.defaultApp.total_users_count,
            total_cost: this.defaultApp.total_cost,
          });
        }
      },
      immediate: true,
    },
  },
  // watch: {
  //   ViewbillingDialog: {
  //     async handler(newVal) {
  //       console.log(this.rowInfo);
  //       this.height = window.innerHeight - 390;
  //       this.total = this.rowInfo.total_ammount_to_pay;
  //       // this.stripe = await loadStripe(
  //       //   "pk_test_51HzecNGxjS65sNlr4rKGgnZdcsuNLGHwAAdYGMmp7sMdV5NgtWDI1ganLct5pF7jxe5drs62Pjdw9pTIUHavUUd7002qK6UDcW"
  //       // );
  //       this.appsall = [];
  //       if (newVal && this.rowInfo?.app_cost_details?.length) {
  //         this.appsall = [];
  //         this.rowInfo.app_cost_details.forEach((app) => {
  //           if (app.dashboard_unique_type != "DEFAULT_APPS") {
  //             this.appsall.push({
  //               appName: app.app_name,
  //               cost: app.app_cost,
  //               users: app.total_users_count,
  //               total_cost: app.total_cost,
  //             });
  //           } else {
  //             this.defaultApp = app;
  //           }
  //         });
  //         this.appsall.sort((a, b) => a.appName.localeCompare(b.appName));
  //         this.appsall.unshift({
  //           appName: this.defaultApp.app_name,
  //           cost: this.defaultApp.app_cost,
  //           users: this.defaultApp.total_users_count,
  //           total_cost: this.defaultApp.total_cost,
  //         });
  //       }
  //     },
  //     immediate: true,
  //   },
  // },

  mounted() {},

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    app_Payment() {
      this.loading = true;
      axios({
        method: "POST",
        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/initiate_payment_request",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "EgnUv9Owyt8KacFkfnB44as9uqCT8ZaF9FZ1cVU6",
        },
        data: {
          command: "createPaymentRequest",
          transaction_id: this.rowInfo.transaction_id,
          cancel_url: "http://192.168.1.109:8082/#/BillingInfo",
          success_url: "http://192.168.1.109:8082/#/BillingInfo",
        },
      })
        .then((res) => {
          this.loading = false;
          if (res.data.Status == "SUCCESS") {
            // window.open(res.data.data.url, '_blank');
            window.open(res.data.data.url);
          } else {
            this.loading = false;
            this.$emit("errorMsg", res.data.Message);
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    fecth_name(appName) {
      switch (appName) {
        case "Attendance/Presence":
          return "Presence";
        case "Ticket Management":
          return "Tickets";
        default:
          return appName;
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
        case "Payroll":
          return "mdi-account-credit-card-outline";
        case "Farm":
          return "mdi-focus-field";
        case "DEFAULT APPS":
          return "mdi-apps";
        case "Surveillance":
          return "mdi-cctv";
        default:
          return "mdi-help";
      }
    },
    getDefaultColor(appName) {
      switch (appName) {
        case "Assests":
          return "blue";
        case "Assets":
          return "blue";
        case "Attendance/Presence":
          return "red";
        case "Cabinet":
          return "brown";
        case "Dashboard":
          return "green";
        case "Directory":
          return "purple";
        case "Events":
          return "blue";
        case "Expenses":
          return "red";
        case "Tickets":
          return "green";
        case "Project":
          return "pink";
        case "Slot Booking":
          return "purple";
        case "Timesheet":
          return "purple";
        case "Ticket Management":
          return "pink";
        case "Visits":
          return "indigo";
        case "Channels":
          return "teal";
        case "Forms":
          return "amber";
        case "Tasks":
          return "indigo";
        case "Teams":
          return "teal";
        case "Payroll":
          return "brown";
        case "Farm":
          return "blue";
        case "DEFAULT APPS":
          return "indigo";
        case "Surveillance":
          return "teal";
        default:
          return "grey";
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  text-align: center;
}
.card-style {
  width: 120px;
  height: 120px;
  background-color: #f5f5f5;
  border-radius: 16px;
  text-align: center;
  padding: 10px;
}
</style>
