<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="stockIndividual"
      @update:model-value="$emit('update:stockIndividual', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Add Stock</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="stockQuantity"
                  variant="outlined"
                  density="compact"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  label=" Quantity"
                  :rules="[(v) => !!v || 'required ']"
                />

                <v-text-field
                  v-model="amountPaid"
                  variant="outlined"
                  density="compact"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  label="Amount Paid"
                />
                <v-text-field
                  v-model="billDetails"
                  variant="outlined"
                  density="compact"
                  label="Bill Details"
                />
                <v-text-field
                  v-model="comments"
                  variant="outlined"
                  density="compact"
                  label="Comments"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            variant="flat"
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="cardCss"
          >
            save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
import { add_update_product_to_stock } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    stockIndividual: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,

      amountPaid: "",

      stockQuantity: "",

      billDetails: "",
      comments: "",
    };
  },
  watch: {
    stockIndividual: {
      async handler() {
        if (this.stockIndividual == true) {
          // console.log(this.rowInfo, "rowInfo");
        }
      },
      immediate: true,
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
    close_dialog() {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.$emit("clicked", 0);
    },

    async delete_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        let stockDetails = {
          sub_category_id: this.rowInfo.sub_category_id,
          sub_category_unit_id: this.rowInfo.sub_category_unit_id,
          sub_category_quantity: Number(this.stockQuantity),
          location_id: this.rowInfo.location_id,
          location_name: this.rowInfo.location_name,
          amount_paid: Number(this.amountPaid) || 0,
          bill_details: this.billDetails == null ? "" : this.billDetails,
          sub_category_consumption_comments:
            this.comments == null ? "" : this.comments,
          sub_category_unit_name: this.rowInfo.sub_category_unit_name,
        };
        let stockitems = [];

        stockitems.push(stockDetails);
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(add_update_product_to_stock, {
              input: {
                products: stockitems,
              },
            })
          );

          this.loading = false;
          var response = JSON.parse(result.data.add_update_product_to_stock);
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
      }
    },
  },
};
</script>