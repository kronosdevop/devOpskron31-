<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="ViewBillingDialog" @update:model-value="$emit('update:ViewBillingDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Payment</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <p>Are you sure you want to proceed with this payment?</p>
            <v-radio-group v-model="selectedPaymentType" class="mt-3">
              <v-radio label="Full Payment" value="FULLY_PAID"></v-radio>
              <v-radio label="Partial Payment" value="PARTIALY_PAID"></v-radio>
            </v-radio-group>

            <v-text-field
              v-if="selectedPaymentType === 'PARTIALY_PAID'"
              v-model="amount"
              label="Enter Amount"
              :rules="amountRules"
              outlined
              dense
              @keypress="is_number($event)"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validateAndProceed"
            dark
            class="text-capitalize cardCss button-corner mt-n4"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { genrate_list_quotaions_bills } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    ViewBillingDialog: Boolean,
    ViewInfo: Object,
  },
  data() {
    return {
      selectedPaymentType: "FULLY_PAID",
      amount: "",
      loading: false,
      amountRules: [
        (v) => !!v || "Amount is required for partial payment.",
        (v) => /^\d+(\.\d{1,2})?$/.test(v) || "Only numbers are allowed.",
        (v) =>
          v <= this.ViewInfo.total_amount ||
          `Amount cannot exceed ${this.ViewInfo.total_amount}`,
      ],
    };
  },
  watch: {
    ViewBillingDialog(newVal) {
      if (newVal) {
        this.selectedPaymentType = "FULLY_PAID";
        this.amount = "";
      }
    },
    selectedPaymentType(newVal) {
      if (newVal === "FULLY_PAID") {
        this.amount = "";
      }
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
    },
    is_number(evt) {
      evt = evt || window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
      if (this.amount.length >= 14 && charCode >= 48 && charCode <= 57) {
        evt.preventDefault();
      }
    },
    async validateAndProceed() {
      const isValid = this.$refs.form.validate();

      if (
        this.selectedPaymentType === "PARTIALY_PAID" &&
        (!this.amount || this.amount > this.ViewInfo.total_amount)
      ) {
        return;
      }

      if (isValid) {
        await this.save_Pyment_method();
      }
    },

    async save_Pyment_method() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(genrate_list_quotaions_bills, {
            input: {
              report_id: this.ViewInfo.report_id,
              action_type: "UPDATE",
              payment_status: this.selectedPaymentType,
              paid_amount:
                this.selectedPaymentType === "FULLY_PAID"
                  ? undefined
                  : this.amount,
            },
          })
        );
        var response = JSON.parse(result.data.genrate_list_quotaions_bills);
        if (response.Status === "SUCCESS") {
          this.loading = false;
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>

<style scoped>
/* Add your styling here */
</style>
