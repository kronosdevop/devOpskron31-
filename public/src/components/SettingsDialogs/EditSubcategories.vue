<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="categoriessubEddition" @update:model-value="$emit('update:categoriessubEddition', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Items</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="categoriesName"
                  label="Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="categoriestax"
                  label="Tax Percentage*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                   type="number"
                  outlined
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="categoriesPrice"
                  label="Price*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
      
      <script>
/*eslint-disable*/
import { quotation_sub_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    categoriessubEddition: Boolean,
    categoriesItem: Object,
    rowInfo: Object,
  },
  data() {
    return {
      categoriesName: "",
      categoriestax: "",
      categoriesPrice: "",
      categoryitems: [],
      maincategories: "",
      loading: false,
      categoriesdescription: "",
      depreciationitems: Array.from({ length: 100 }, (_, i) => i + 1),
    };
  },
  watch: {
    categoriessubEddition: {
      async handler() {
        if (this.categoriessubEddition == true) {
          this.categoriesName = this.categoriesItem.text;
          this.categoriestax = this.categoriesItem.sub_category_tax;
          this.categoriesPrice = this.categoriesItem.sub_category_price;
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
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.add_mutation();
      }
    },

    async add_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(quotation_sub_categories, {
            input: {
              category_id: this.rowInfo.category_id,
              sub_category_name: this.categoriesName,
              sub_category_id: this.categoriesItem.value,
              sub_category_price: this.categoriesPrice,
              sub_category_tax: this.categoriestax,
              action_type: "UPDATE",
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
      
      <style>
</style>