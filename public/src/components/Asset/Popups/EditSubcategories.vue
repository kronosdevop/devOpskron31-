<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="categoriessubEddition"
      @update:model-value="categoriessubEddition = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Edit Sub Categories</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  v-model="categoriesName"
                  label="Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <!-- <v-col cols="12">
                <v-textarea
                  dense
                  v-model="categoriesdescription"
                  label="Description*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                ></v-textarea>
              </v-col> -->
              <v-col cols="12">
                <v-select
                  v-model="depreciationCode"
                  label="Sub Category Depreciation(%)"
                  class="mr-2"
                  density="compact"
                  variant="outlined"
                  :items="depreciationitems"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner text-white mt-n6 mr-4"
            size="small"
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
import { asset_sub_category } from "@/graphql/mutations.js";
import { asset_categories } from "@/graphql/mutations.js";
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
      depreciationCode: "",
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
          this.depreciationCode =
            this.categoriesItem.sub_category_depriciation == undefined
              ? this.rowInfo.category_depriciation
              : this.categoriesItem.sub_category_depriciation;
        }
      },
      immediate: true,
    },
  },

  methods: {
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
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_sub_category, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "UPDATE_SUBCATEGORY",
              category_id: this.rowInfo.category_id,
              sub_category_name: this.categoriesName,
              sub_category_depriciation: Number(this.depreciationCode),
              // sub_category_description: this.categoriesdescription,
              sub_category_id: this.categoriesItem.value,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.asset_sub_category);
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