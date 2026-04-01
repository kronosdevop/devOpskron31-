<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-dialog :model-value="viewStockDialog" @update:model-value="$emit('update:viewStockDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Product Consumption</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text style="color: black" class="mt-4">
          <p>
            Product Name: <b>{{ rowInfo.sub_category_name || "N/A" }}</b>
          </p>
          <p>
            Location Name: <b>{{ rowInfo.location_name || "N/A" }}</b>
          </p>
          <p>
            Available Quantity: <b>{{ rowInfo.sub_category_quantity || 0 }}</b>
          </p>
          <div>
            <label>Quantity of Product you want to Consume</label>
            <v-text-field
              variant="outlined"
              density="compact"
              v-model="consumedProduct"
              @keypress="is_number($event)"
              class="mt-4"
            />
            <!-- <v-select
              outlined
              dense
              v-model="consumedProduct"
              :items="quantityOptions"
              clearable
              class="mt-4"
            ></v-select> -->
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="fetch_StockDetails()"
            :loading="loading"
            :disabled="!consumedProduct || consumedProduct === 0"
            dark
            class="text-capitalize cardCss button-corner mt-n4"
          >
            Consume
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */

import { Consume_Products } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    viewStockDialog: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      ViewStockData: {},
      consumedProduct: "",
      loading: false,
    };
  },

  computed: {
    quantityOptions() {
      let maxQuantity = this.rowInfo?.sub_category_quantity || 0;
      return Array.from({ length: maxQuantity }, (_, i) => i + 1);
    },
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
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async fetch_StockDetails() {
      if (
        Number(this.consumedProduct) > this.rowInfo?.sub_category_quantity ||
        0
      ) {
        return this.$emit(
          "errorMsg",
          "Consumption is greater than the available quantity."
        );
      }
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(Consume_Products, {
            input: {
              sub_category_stock_id: this.rowInfo.sub_category_stock_id,
              location_id: this.rowInfo.location_id,
              location_name: this.rowInfo.location_name,
              sub_category_quantity: Number(this.consumedProduct),
              dispatch_documents: this.rowInfo.dispatch_documents || "",
              sub_category_consumption_comments:
                this.rowInfo.sub_category_consumption_comments || "",
              // sub_category_unit_id: this.rowInfo.sub_category_unit_id,
              // sub_category_id: this.rowInfo.sub_category_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.Consume_Products);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.consumedProduct = "";
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.message || "An error occurred");
      }
    },
  },
};
</script>