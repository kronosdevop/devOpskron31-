<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-dialog :model-value="ViewOrderDialog" @update:model-value="$emit('update:ViewOrderDialog', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">View Order Details</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4 scrollable-content">
          <v-row>
            <v-col cols="12" sm="6">
              <v-card class="" flat>
                <p>
                  Delivery Date: <b>{{ rowInfo.expected_delevery_date }}</b>
                </p>
                <p>
                  Order-ID: <b>{{ rowInfo.order_transaction_id }}</b>
                </p>
                <p>
                  Customer Name: <b>{{ rowInfo.customer_name }}</b>
                </p>
                <p>
                  Phone Number: <b>{{ rowInfo.customer_full_number }}</b>
                </p>
                <p>
                  Email-ID: <b>{{ rowInfo.customer_email }}</b>
                </p>
                <p>
                  Address: <b>{{ rowInfo.customer_address || "-" }}</b>
                </p>
                <p>
                  Total Amount: <b>{{ rowInfo.total_amount || "-" }}</b>
                </p>
                <p>
                  Advance Received: <b>{{ rowInfo.advance_recevied || "-" }}</b>
                </p>
                <p v-if="rowInfo.order_delevery_status != 'DELEVERED'">
                  Pending Amount to pay:
                  <b>{{ rowInfo.remaining_amount || rowInfo.total_amount }}</b>
                </p>
                <p v-if="rowInfo.order_delevery_status == 'DELEVERED'">
                  Final Payment Amount:
                  <b>{{ rowInfo.final_received_amount }}</b>
                </p>
                <p>
                  Order Status: <b>{{ rowInfo.order_delevery_status }}</b>
                </p>
                <p v-if="rowInfo.order_delevery_status == 'CANCELLED'">
                  Reason for Cancel: <b>{{ rowInfo.cancel_reason || "-" }}</b>
                </p>
              </v-card>
              <v-card
                outlined
                class="pa-2 mt-n2"
                v-if="
                  rowInfo.order_delevery_status === 'DISPATCHED' ||
                  rowInfo.order_delevery_status === 'DELEVERED'
                "
              >
                <p><b>Delivery Partner Info:</b></p>
                <p>
                  Name: <b>{{ rowInfo.order_deleverd_by.name }}</b>
                </p>
                <p>
                  Contact Number:
                  <b
                    >{{ rowInfo.order_deleverd_by.country_code }}
                    {{ rowInfo.order_deleverd_by.phone_no }}</b
                  >
                </p>
                <p>
                  Email-ID: <b>{{ rowInfo.order_deleverd_by.email_id }}</b>
                </p>
              </v-card>
              <v-card flat v-if="rowInfo.order_delevery_status == 'DISPATCHED'">
                <v-checkbox
                  v-model="pendingtoPay"
                  label="Do you want to close the Order?"
                ></v-checkbox>
                <v-form ref="form">
                  <v-text-field
                    v-if="pendingtoPay && rowInfo.remaining_amount > 0"
                    outlined
                    dense
                    v-model="finalAmount"
                    label="Final Payment Amount*"
                    @keypress="is_number($event, finalAmount)"
                  ></v-text-field>
                </v-form>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6">
              <v-card flat>
                <p><b>Product Info:</b></p>
                <v-row class="align-center">
                  <v-col cols="6" class="d-flex align-center">
                    <v-icon left class="mr-2" color="blue"
                      >mdi-package-variant</v-icon
                    >
                    <span class="font-weight-medium">Product</span>
                  </v-col>
                  <v-col cols="6" class="d-flex align-center">
                    <v-icon left class="mr-2" color="green"
                      >mdi-clipboard-list</v-icon
                    >
                    <span class="font-weight-medium">Quantity</span>
                  </v-col>
                </v-row>
                <v-row
                  v-for="(product, index) in rowInfo.products"
                  :key="index"
                  class="mt-n2"
                >
                  <v-col cols="6">
                    {{ product.product_name }}
                  </v-col>
                  <v-col cols="6">
                    {{ product.quantity }}
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions
          class="justify-end"
          v-if="
            pendingtoPay == true &&
            rowInfo.order_delevery_status == 'DISPATCHED'
          "
        >
          <v-btn
            class="cardCss text-capitalize mr-2"
            dark
            @click="verify_close"
            :loading="loading"
          >
            Close Order
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */

import { edit_orders } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    ViewOrderDialog: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      pendingtoPay: false,
      finalAmount: "",
      loading: false,
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.pendingtoPay = false;
    },
    is_number(evt, value) {
      evt = evt || window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
      if (value.length >= 14 && charCode >= 48 && charCode <= 57) {
        evt.preventDefault();
      }
    },

    verify_close() {
      const shouldShowTextField =
        this.pendingtoPay &&
        (this.rowInfo.remaining_amount !== 0 ||
          this.rowInfo.remaining_amount === undefined);

      if (shouldShowTextField) {
        if (this.$refs.form.validate()) {
          this.Close_Order();
        }
      } else {
        this.Close_Order();
      }
    },

    async Close_Order() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_orders, {
            input: {
              order_id: this.rowInfo.order_id,
              order_delevery_status: "DELEVERED",
              final_received_amount:
                this.pendingtoPay === true
                  ? this.finalAmount
                  : this.rowInfo.total_amount,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.edit_orders);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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