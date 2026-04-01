<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="payslipDeletion" @update:model-value="$emit('update:payslipDeletion', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Delete Payslip</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to delete payslip of
            {{ rowInfo.employee_name }} ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="delete_event()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { edit_delete_payslips } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    payslipDeletion: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_event() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_delete_payslips, {
            input: {
              payslip_id: this.rowInfo.payslip_id,
              action_type: "DELETE_PAYSLIP",
            },
          })
        );
        var response = JSON.parse(result.data.edit_delete_payslips);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>