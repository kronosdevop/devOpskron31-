<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="requestDialog"
      @update:model-value="requestDialog = $event"
      persistent
      max-width="600"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">ESA Request</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text v-if="queryCheck == true">
          <v-card class="mt-8">
            <v-row class="justify-between">
              <v-col>
                <div
                  style="color: #db4c77"
                  class="text-left font-weight-bold ml-2"
                >
                  <strong> {{ currentMonth + "   " + currentYear }}</strong>
                </div>
              </v-col>
              <v-col>
                <div
                  v-if="checkElgibility == true"
                  style="color: green"
                  class="text-left font-weight-bold"
                >
                  Eligible
                </div>
                <div
                  v-else
                  style="color: red"
                  class="text-left font-weight-bold"
                >
                  Not Elgible
                </div>
              </v-col>
            </v-row>
            <v-divider class="mt-2 mb-2" />
            <v-row class="justify-between">
              <v-col>
                <div class="text-left font-weight-bold ml-2">
                  Eligible Amount
                </div>
              </v-col>
              <v-col>
                <div class="text-left">
                  <b> {{ orgCurrency + " " + totalAmountEligible }}</b>
                </div>
              </v-col>
            </v-row>

            <v-row class="justify-between">
              <v-col>
                <div class="text-left font-weight-bold ml-2">
                  Total Withdrawn Amount
                </div>
              </v-col>
              <v-col>
                <div class="text-left">
                  <b> {{ orgCurrency + " " + totalwithdrwanAmount }}</b>
                </div>
              </v-col>
            </v-row>
            <v-row class="justify-between">
              <v-col>
                <div class="text-left font-weight-bold ml-2">
                  Remaining Amount
                </div>
              </v-col>
              <v-col>
                <div class="text-left">
                  <b> {{ orgCurrency + " " + remainingAmount }}</b>
                </div>
              </v-col>
            </v-row>
            <v-row class="justify-between">
              <v-col>
                <div class="text-left font-weight-bold ml-2">
                  Eligible Worked Duration
                </div>
              </v-col>
              <v-col>
                <div class="text-left">
                  <b>{{ totalWorkDuration }}</b>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <v-card v-if="checkElgibility == true" class="mt-4">
            <v-row class="justify-between">
              <v-col>
                <div
                  style="color: #db4c77"
                  class="text-left font-weight-bold mt-2 ml-2"
                >
                  <b>Request Amount</b>
                </div>
              </v-col>
            </v-row>
            <v-row class="justify-start">
              <v-col>
                <div class="text-left font-weight-bold ml-2">
                  Choose from options based on your eligibility if you wish to
                  request for an Early Salary Access
                </div>
              </v-col>
            </v-row>
            <v-form ref="form1">
              <v-row class="justify-start">
                <v-col cols="12">
                  <v-select
                    :items="amountEligible"
                    :rules="[(v) => !!v || 'Required ']"
                    density="compact"
                    variant="outlined"
                    class="ml-2 mr-2"
                    v-model="selectAmount"
                    :menu-props="{ contentClass: 'select-items' }"
                    @input="get_value(selectAmount)"
                    :hint="hintText"
                  >
                  </v-select>
                </v-col>
                <v-col
                  v-if="selectAmount.length != 0 && amountCheck == false"
                  class="mt-n12"
                  cols="12"
                >
                  <v-checkbox
                    class="ml-2"
                    v-model="agreeActions"
                    :label="labelWithTransactionFee"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <!-- <v-row class="justify-start">
               
              </v-row> -->
            </v-form>

            <v-card-actions class="justify-start">
              <v-btn
                :disabled="agreeActions == false"
                @click="validate_data()"
                :loading="loading"
                class="text-white cardCss ml-2 mt-2 button-corner"
                >Request
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-card-text>
      </v-card>
      <v-overlay :value="overlay">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { user_early_salary_access } from "@/graphql/queries.js";
import { request_early_salary } from "@/graphql/mutations.js";

import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    requestDialog: Boolean,
  },
  data() {
    return {
      selectAmount: "",
      currentMonth: "",
      currentYear: "",
      totalWorkDuration: "",
      totalAmountEligible: "",
      totalwithdrwanAmount: "",
      checkElgibility: false,
      amountEligible: [],
      loading: false,
      overlay: false,
      agreeActions: false,
      transactionFee: "",
      remainingAmount: "",
      amountCheck: false,
      queryCheck: false,
      orgCurrency: "",
    };
  },
  computed: {
    labelWithTransactionFee() {
      return `Are you sure you want to request for ESA ?  Transaction fee is:  ${this.transactionFee} / transaction`;
    },
    hintText() {
      if (this.amountCheck == true) {
        return "Your Eligilbe Amount Range is Exceeded";
      } else {
        return ""; // No hint if transactionFee is zero
      }
    },
  },
  watch: {
    requestDialog: {
      async handler() {
        if (this.requestDialog == true) {
          this.overlay = true;
          this.queryCheck = false;
          await this.get_request_details();
          this.overlay = false;
          this.queryCheck = true;
          const currentDate = new Date();
          this.currentMonth = currentDate.toLocaleString("default", {
            month: "long",
          });
          this.currentYear = currentDate.getFullYear();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.queryCheck = false;
    },
    async get_request_details() {
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(user_early_salary_access, {
            input: {
              organization_id: data.organization.organization_id,
              user_id: data.user.user_id,
              swipe_month: await this.fetch_swipe_month(),
              swipe_date: await this.get_current_date(),
            },
          })
        );
        this.amountEligible = [];
        var response = JSON.parse(result.data.user_early_salary_access);
        this.orgCurrency = response.data.org_setting.currency;

        this.totalWorkDuration = response.data.user.eligible_worked_duration;
        this.totalAmountEligible = response.data.user.amount_total_eligible;
        this.totalwithdrwanAmount = response.data.user.previous_total_amount;
        this.checkElgibility = response.data.user.is_eligible;
        this.transactionFee = response.data.org_setting.service_fee_per_trans;
        const minAmount = response.data.org_setting.min_amount_per_trans;
        const maxAmount = response.data.org_setting.max_amount_per_trans;
        this.remainingAmount =
          this.totalAmountEligible - this.totalwithdrwanAmount;
        // const maxAmount = this.totalAmountEligible - this.totalwithdrwanAmount;
        const increment = 500;
        for (let amount = minAmount; amount <= maxAmount; amount += increment) {
          this.amountEligible.push(amount);
        }
      } catch (error) {}
    },

    get_value(value) {
      this.amountCheck = false;
      this.agreeActions = false;
      if (value > this.remainingAmount) {
        this.amountCheck = true;
      }
    },

    fetch_swipe_month() {
      const currentDate = new Date();
      const currentMonth = `${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${currentDate.getFullYear()}`;

      return currentMonth;
    },

    get_current_date() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const day = currentDate.getDate().toString().padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    },

    validate_data() {
      if (this.$refs.form1.validate()) {
        this.request_early_acces();
      }
    },

    async request_early_acces() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(request_early_salary, {
            input: {
              organization_id: data.organization.organization_id,
              user_id: data.user.user_id,
              swipe_month: await this.fetch_swipe_month(),
              swipe_date: await this.get_current_date(),
              user_email_id: data.user.user_email_id,
              amount_requested: this.selectAmount,
            },
          })
        );

        var response = JSON.parse(result.data.request_early_salary);
        if (response.Status == "SUCCESS") {
          this.selectAmount = "";
          this.$emit("successMsg", response.Message);
          this.loading = false;
          // console.log(response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
          this.loading = false;
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].Message);
        this.loading = false;
      }
    },
  },
};
</script>
