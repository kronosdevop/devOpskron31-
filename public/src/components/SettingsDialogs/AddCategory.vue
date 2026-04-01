<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="categoriesAddition"
      @update:model-value="$emit('update:categoriesAddition', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Categories</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="categoriesName"
                  label="Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <!-- <v-col cols="12">
                <v-text-field
                  dense
                  v-model="categoriestax"
                  label="Tax Percentage*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                  type="number"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                ></v-text-field>
              </v-col> -->
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
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
import { items_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    categoriesAddition: Boolean,
  },
  data() {
    return {
      categoriesName: "",
      categoriestax: "",
      loading: false,
    };
  },
  watch: {
    categoriesAddition: {
      async handler() {},
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
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.add_mutation();
      }
    },
    async add_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(items_categories, {
            input: {
              action_type: "CREATE",
              category_name: this.categoriesName,
              category_tax: undefined,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.items_categories);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
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
  
  <style>
</style>