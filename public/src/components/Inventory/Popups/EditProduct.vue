<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="productEdition" @update:model-value="$emit('update:productEdition', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Edit Product</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="12">
              <v-checkbox label="Enable Reorder" v-model="reorder" />
              <v-text-field
                v-model="restockQuantity"
                outlined
                dense
                v-if="reorder"
                label="Restock Quantity"
                :rules="reorder == true ? [(v) => !!v || 'required '] : []"
              />
              <v-text-field
                v-model="depletionQuantity"
                outlined
                dense
                label="Depletion Quantity"
                :rules="[(v) => !!v || 'required ']"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
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
import { quotation_sub_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    productEdition: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,
      reorder: false,
      restockQuantity: "",
      depletionQuantity: "",
    };
  },
  watch: {
    productEdition: {
      async handler() {
        if (this.productEdition == true) {
          this.restockQuantity =
            this.rowInfo.restock_quantity == undefined
              ? "0"
              : this.rowInfo.restock_quantity;
          this.depletionQuantity =
            this.rowInfo.depletion_quantity == undefined
              ? "0"
              : this.rowInfo.depletion_quantity;
          this.reorder =
            this.rowInfo.enable_reorder == undefined
              ? false
              : this.rowInfo.enable_reorder;

          // console.log(this.rowInfo, "rowInfo");
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(quotation_sub_categories, {
            input: {
              sub_category_id: this.rowInfo.sub_category_id,
              category_id: this.rowInfo.category_id,
              sub_category_name: this.rowInfo.sub_category_name,
              sub_category_Sku: this.rowInfo.sub_category_Sku,
              sub_category_description: this.rowInfo.sub_category_description,
              sub_category_unit: this.rowInfo.sub_category_unit,
              currency:
                this.rowInfo.currency != undefined ? this.rowInfo.currency : "",
              sub_category_retail_price:
                this.rowInfo.sub_category_retail_price != undefined
                  ? this.rowInfo.sub_category_retail_price
                  : "",
              sub_category_selling_price:
                this.rowInfo.sub_category_selling_price != undefined
                  ? this.rowInfo.sub_category_selling_price
                  : "",
              sub_category_tax:
                this.rowInfo.sub_category_tax != undefined
                  ? this.rowInfo.sub_category_tax
                  : "",
              action_type: "UPDATE",
              sub_category_type: "PRODUCT",
              brand_name:
                this.rowInfo.brand_name != undefined
                  ? this.rowInfo.brand_name
                  : "N/A",
              enable_reorder: this.reorder,
              depletion_quantity: Number(this.depletionQuantity),
              restock_quantity: Number(this.restockQuantity),
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.quotation_sub_categories);
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