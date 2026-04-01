<template>
  <div>
    <OverlayComp :overlay="overlay" />
    <v-toolbar flat >
      <v-toolbar-title>Payslip</v-toolbar-title>
      <v-spacer />
      <!-- <v-btn dark class="text-capitalize cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn> -->
    </v-toolbar>
    <v-card flat >
      <v-card-text class="text-left">
        <div v-if="payslipRecords.length!=0">
          <v-row>
          <v-col v-for="(month, index) in payslipRecords" :key="index" cols="4">
            <v-card class="pa-3" @click="pay_view(month)">
              <v-icon :color="primaryColor">mdi-cash</v-icon>
              <div>Month : {{ getMonthName(month.month_year) }}</div>
            </v-card>
          </v-col>
        </v-row>
        </div>
        <div v-else justify="center" align="center" style="font-size: medium;">
        <b>  No payslip has been generated </b>
        </div>
       
      </v-card-text>
    </v-card>
    <div v-if="componentcheck == 1">
      <ViewPayslip
        :paySlipview="paySlipview"
        @clicked="paySlipview = false"
        :payslipitem="payslipitem"
      />
    </div>
  </div>
</template>

<script>
import OverlayComp from "@/components/OverlayComp.vue";
import { get_user_payslips } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewPayslip from "@/components/Payroll/PayrollPopus/ViewPayslip.vue";

export default {
  components: {
    ViewPayslip,
    OverlayComp,
  },
  data() {
    return {
      componentcheck: 0,
      paySlipview: false,
      primaryColor: "primaryColor",
      overlay: false,
      payslipRecords: [],
      payslipitem: {},
      months: [
        { name: "January", date: "1/01/2023 - 31/01/2023" },
        { name: "February", date: "1/01/2023 - 28/02/2023" },
        { name: "March", date: "1/01/2023 - 31/03/2023" },
        { name: "April", date: "1/04/2023 - 30/04/2023" },
        { name: "May", date: "1/05/2023 - 31/05/2023" },
        { name: "June", date: "1/06/2023 - 30/06/2023" },
        { name: "July", date: "1/07/2023 - 31/07/2023" },
        { name: "August", date: "1/08/2023 - 31/08/2023" },
        { name: "September", date: "1/09/2023 - 30/09/2023" },
        { name: "October", date: "1/10/2023 - 31/10/2023" },
        { name: "November", date: "1/11/2023 - 30/11/2023" },
        { name: "December", date: "1/12/2023 - 31/12/2023" },
      ],
    };
  },
  async created() {
    await this.fetch_userpayslip();
  },
  methods: {
    getMonthName(monthYear) {
      const [month] = monthYear.split("-");
      const monthIndex = parseInt(month, 10) - 1;
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      if (monthIndex >= 0 && monthIndex <= 11) {
        return monthNames[monthIndex];
      } else {
        return "Invalid Month";
      }
    },
    back_call() {
      this.$router.push("/UserlevelApp");
    },
    pay_view(item) {
      this.payslipitem = item;
      this.componentcheck = 1;
      this.paySlipview = true;
    },
    async fetch_userpayslip() {
      this.overlay = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_user_payslips, {
            input: {
              user_email_id: data.user.user_email_id,
              year: "2024",
            },
          })
        );
        var response = JSON.parse(result.data.get_user_payslips);
        this.payslipRecords = [];
        if (response.Status == "SUCCESS") {
          this.payslipRecords = response.data;
          this.overlay = false;
        } else {
          this.payslipRecords = [];
          this.overlay = false;
        }
      } catch (error) {
        this.payslipRecords = [];
        this.overlay = false;
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

<style>
</style>