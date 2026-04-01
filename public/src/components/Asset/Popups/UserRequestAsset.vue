<template>
  <!-- eslint-disable -->

  <v-dialog
    :model-value="requestDialog"
    @update:model-value="requestDialog = $event"
    persistent
    max-width="500"
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="bg-white">
        <v-toolbar-title class="ml-2">
          <div class="custom-title">Request Asset</div></v-toolbar-title
        >
        <v-spacer />
        <!-- <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon> -->
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
                item-title="text"
                item-value="value"
                @update:model-value="fetch_sub_data()"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-select
                density="compact"
                variant="outlined"
                :disabled="subCheck"
                class=""
                v-model="subcategory"
                :items="assetSubCategoriesList"
                item-title="text"
                item-value="value"
                label="Sub Category"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                density="compact"
                variant="outlined"
                v-model="selectedLocation"
                :items="locationList"
                item-title="location_name"
                item-value="location_id"
                label="Location"
                :rules="[(v) => !!v || 'required ']"
                clearable
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                density="compact"
                variant="outlined"
                label="Comments"
                v-model="commentField"
                rows="1"
                auto-grow
              />
            </v-col>
            <!-- <v-col cols="12">
              <v-select
                dense
                v-model="categoriesName"
                :items="categoriesitems"
                label="Category Name*"
                :rules="[(v) => !!v || 'required ']"
                class=""
                outlined
                item-text="text"
                item-value="value"
                @input="fetch_sub_data()"
              ></v-select>
                </v-col> -->
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end" style="border-top: 2px solid #eee">
        <v-btn text @click="close_dialog()">cancel</v-btn>
        <v-btn color="primary" @click="validate_data()" :loading="loading"
          >Submit</v-btn
        >
      </v-card-actions>
      <!-- <v-card-actions class="justify-end">
        <v-btn
          @click="validate_data()"
          :loading="loading"
          dark
          class="text-capitalize cardCss button-corner text-white"
        >
          Submit
        </v-btn>
      </v-card-actions> -->
    </v-card>
  </v-dialog>
</template>
<script>
/*eslint-disable*/
import { get_asset_categories } from "@/mixins/GetAssetCategoryList.js";
import { get_asset_sub_categories } from "@/mixins/GetAssetSubCategories.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { initiate_asset_request } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    requestDialog: Boolean,
  },
  mixins: [get_asset_categories, get_asset_sub_categories, get_location_details],
  data() {
    return {
      categoriesName: "",
      categoriesitems: [],
      allSubCategories: [],
      assetSubCategoriesList: [],
      subcategory: "",
      selectedLocation: "",
      commentField: "",
      loading: false,
      subCheck: false,
    };
  },
  watch: {
    requestDialog: {
      async handler() {
        if (this.requestDialog == true) {
          await this.get_asset_categories();
          this.categoriesitems = this.assetCategories;
          // console.log("categoriesitems", this.categoriesitems)
          this.subCheck = true;
          await this.get_asset_sub_categories();
          this.allSubCategories = this.assetSubCategories;
          this.subCheck = false;
          await this.get_location_details();
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
          text: element.sub_category_name,
          value: element.sub_category_id,
        });
      });
      this.subcategory = "";
    
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.request_added();
      }
    },

    async request_added() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(initiate_asset_request, {
            input: {
              user_email_id: data.user.user_email_id,
              category_id: this.categoriesName,
              sub_category_id:
                this.subcategory == "" ? undefined : this.subcategory,
                asset_location_id:
                this.selectedLocation == "" ? undefined : this.selectedLocation,
              asset_description:
                this.commentField == "" ? undefined : this.commentField,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.initiate_asset_request);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

          this.$refs.form.reset();
          this.commentField = "";
          this.categoriesName = "";
          this.subcategory = "";
          this.selectedLocation = "";

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
      this.selectedLocation = "";
    },
  },
};
</script>