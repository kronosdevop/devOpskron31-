<template>
  <!-- eslint-disable -->

  <v-dialog
    :model-value="assetProcureDialog"
    @update:model-value="assetProcureDialog = $event"
    persistent
    max-width="500"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="navBar">
        <v-toolbar-title class="ml-2">
          <div class="custom-title">Create Categories</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row no-gutters class="">
            <v-col cols="12">
              <v-select
                v-model="categoriesName"
                :items="categoriesitems"
                label="Category Name*"
                :rules="[(v) => !!v || 'required ']"
                class=""
                density="compact"
                variant="outlined"
                item-text="text"
                item-value="value"
                @input="fetch_sub_data()"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                density="compact"
                variant="outlined"
                class=""
                v-model="subcategory"
                :items="assetSubCategoriesList"
                item-text="text"
                item-value="value"
                label="Sub Category"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                density="compact"
                variant="outlined"
                v-model="quantatityAsssets"
                :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                label="Quantity"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                @keypress="is_number($event)"
                v-on:paste="process($event)"
                v-model="assetvalue"
                :label="`${' Asset Value (' + organization_currency + ')'}`"
                density="compact"
                variant="outlined"
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
          class="text-capitalize cardCss button-corner text-white"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
/*eslint-disable*/
import { get_asset_categories } from "@/mixins/GetAssetCategoryList.js";
import { get_asset_sub_categories } from "@/mixins/GetAssetSubCategories.js";
import { initiate_asset_procure_request } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    assetProcureDialog: Boolean,
  },
  mixins: [get_asset_categories, get_asset_sub_categories],
  data() {
    return {
      categoriesName: "",
      categoriesitems: [],
      allSubCategories: [],
      assetSubCategoriesList: [],
      subcategory: "",
      commentField: "",
      loading: false,
      quantatityAsssets: 1,
      assetvalue: "",
    };
  },
  watch: {
    assetProcureDialog: {
      async handler() {
        if (this.assetProcureDialog == true) {
          this.organization_currency =
            this.$store.getters.GetUserObj.organization.organization_currency ==
            undefined
              ? ""
              : this.$store.getters.GetUserObj.organization
                  .organization_currency;
          await this.get_asset_categories();
          this.categoriesitems = this.assetCategories;

          await this.get_asset_sub_categories();
          this.allSubCategories = this.assetSubCategories;
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_sub_data() {
      var filteredArray = this.assetSubCategories.filter(
        (obj) => obj.category_id === this.categoriesName
      );

      this.assetSubCategoriesList = [];
      filteredArray.forEach((element) => {
        this.assetSubCategoriesList.push({
          title: element.sub_category_name,
          value: element.sub_category_id,
        });
      });
      //   console.log(this.assetSubCategoriesList);
    },

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

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        await this.request_added();
      }
    },

    async request_added() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(initiate_asset_procure_request, {
            input: {
              user_email_id: data.user.user_email_id,
              category_id: this.categoriesName,
              sub_category_id:
                this.subcategory == "" ? undefined : this.subcategory,
              asset_description:
                this.commentField == "" ? undefined : this.commentField,
              asset_value: this.assetvalue,
              asset_quantity: parseInt(this.quantatityAsssets),
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.initiate_asset_procure_request);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
          this.commentField = "";
          this.categoriesName = "";
          this.subcategory = "";
          this.quantatityAsssets = 1;
          this.assetvalue = "";

          // this.fetch_audit_message();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
      this.commentField = "";
      this.categoriesName = "";
      this.subcategory = "";
      this.quantatityAsssets = 1;
      this.assetvalue = "";
    },
  },
};
</script>