<template>
  <v-dialog :model-value="walletDialog" max-width="420">
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">Top Up Business Wallet</span>
        <v-btn icon variant="text" @click="closeDialog" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-6 py-5">
        <v-form ref="form1">
          <!-- <v-select
            density="compact"
            v-model="formGroup"
            label="Group Name"
            :items="expenseGroupHead"
            item-title="title"
            item-value="value"
            :rules="[(v) => !!v || 'Group is required']"
            variant="outlined"
            class="mb-4"
          /> -->
          <v-text-field
            v-model="formAmount"
            label="Amount"
            type="number"
            @keypress="is_number($event)"
            v-on:paste="process($event)"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[(v) => !!v || 'Amount is required']"
          ></v-text-field>
          <v-textarea
            v-model="formComments"
            label="Comments"
            variant="outlined"
            density="comfortable"
            rows="2"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :loading="loading"
          @click="submitWalletRequest"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { initiate_org_refill_vault_request } from "@/graphql/mutations.js";
import { get_expense_groups_users } from "@/mixins/GetExpenseGroups.js";

export default {
  name: "WalletDialog",
  mixins: [get_expense_groups_users],
  props: {
    walletDialog: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      expenseGroupHead: [],
      formGroup: "",
      formAmount: "",
      formComments: "",
    };
  },
  async mounted() {
    await this.get_expense_groups_users();
    this.expenseGroupHead = [];
    if (this.listExpense && this.listExpense.length > 0) {
      this.listExpense.forEach((element) => {
        this.expenseGroupHead.push({
          title: element.expense_group_name,
          value: String(element.expense_group_id),
        });
      });
      if (!this.formGroup) {
        this.formGroup = this.expenseGroupHead[0].value;
      }
    } else {
      this.expenseGroupHead.push({ title: "DEFAULT", value: "DEFAULT" });
      this.formGroup = "DEFAULT";
    }
  },
  methods: {
    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },
    async submitWalletRequest() {
      const { valid } = await this.$refs.form1.validate();
      // console.log(valid);
      if (valid) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(initiate_org_refill_vault_request, {
              input: {
                
                
                requested_amount: Number(this.formAmount),
                expense_description: this.formComments,
              },
            })
          );
          this.loading = false;
          var response = JSON.parse(result.data.initiate_org_refill_vault_request);
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.resetForm();
            this.$emit("clicked");
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          console.log(error);
          this.loading = false;
          this.$emit("errorMsg", error.errors?.[0]?.message || error.message);
        }
      }
    },
    closeDialog() {
      this.resetForm();
      this.$emit("clicked");
    },
    resetForm() {
      this.formAmount = "";
      this.formGroup = "";
      this.formComments = "";
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
}
.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.v-btn[variant="text"] {
  color: #888;
}
</style> 