<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="categoriessubAddition"
      @update:model-value="categoriessubAddition = $event"
      persistent
      max-width="800"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text-white ml-2">
            <div class="custom-title text-white">
              Add Sub Categories for {{ rowInfo.category_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="">
          <v-form ref="form">
            <v-row no-gutters>
              <v-text-field
                v-model="categoriesName"
                label="Name*"
                :rules="[(v) => !!v || 'required ']"
                class="mr-2"
                style="max-width: 250px"
                density="compact"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                label="Sub Category Prefix*"
                maxlength="3"
                hint="Max 3 characters"
                :rules="[(v) => !!v || 'required ']"
                v-model="categoryPrefix"
                style="max-width: 200px"
                density="compact"
                variant="outlined"
                @input="convert_to_uppercase(categoryPrefix)"
              />
              <v-select
                v-model="depreciationCode"
                label="Sub Category Depreciation(%)*"
                density="compact"
                variant="outlined"
                style="max-width: 200px"
                class="ml-2"
                :items="depreciationitems"
              ></v-select>
              <v-btn
                @click="validate_data()"
                class="mx-2 mt-2 text-white cardCss"
                :loading="loading"
                dark
                size="small"
              >
                Add
              </v-btn>
            </v-row>
          </v-form>
          <!-- <v-list dense>
            <v-list-item-group>
              <v-list-item
                v-for="(item, index) in selectedSubCategory"
                :key="index"
                class="outlined-list-item"
              >
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon @click="delete_data(item)">
                    <v-icon small dense color="red">mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list> -->
          <v-data-table
            :headers="headers"
            :fixed-header="fixed"
            :items="selectedSubCategory"
            :loading="tableLoading"
            :items-per-page="500"
            hide-default-footer
            density="compact"
            class="my-custom-table elevation-1 dtwidth"
          >
            <!-- @click:row="handle_row_click" -->
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon
                color="colorPrimary"
                size="small"
                @click="open_edit_dailog(item)"
                >mdi-pencil</v-icon
              >
              <v-icon
                color="red"
                class="ml-2"
                size="small"
                @click="delete_data(item)"
                >mdi-delete</v-icon
              >
            </template>
          </v-data-table>
          <!-- <v-simple-table dense>
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Name</th>
                  <th class="text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedSubCategory" :key="item.text">
                  <td>{{ item.text }}</td>
                  <td>
                    <v-icon
                      color="red"
                      dense
                      :loading="loading2"
                      small
                      @click="delete_data(item)"
                    >
                      > mdi-delete</v-icon
                    >
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table> -->
          <!-- <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-col cols="12">
                 
                </v-col>
                <v-select
                  dense
                  v-model="maincategories"
                  label="Category*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                  :items="categoryitems"
                  item-text="text"
                  item-value="value"
                ></v-select>
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
          <!-- <v-col cols="12">
                <v-select
                  dense
                  v-model="depreciationCode"
                  label="Category Depreciation(%)*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                  :items="depreciationitems"
                ></v-select>
              </v-col> -->
        </v-card-text>
        <!-- <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Add
          </v-btn>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <EditSubcategories
        :categoriessubEddition="categoriessubEddition"
        @clicked="categoriessubEddition = false"
        :categoriesItem="categoriesItem"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
  
  <script>
/*eslint-disable*/
import { asset_sub_category } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import { get_asset_sub_categories } from "@/mixins/GetAssetSubCategories.js";
import EditSubcategories from "@/components/Asset/Popups/EditSubcategories.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  props: {
    categoriessubAddition: Boolean,
    rowInfo: Object,
  },
  components: {
    EditSubcategories,
    SnackBar,
  },
  mixins: [get_asset_sub_categories],

  data() {
    return {
      categoriesName: "",
      depreciationCode: "",
      loading: false,
      categoriesdescription: "",
      categoryitems: [],
      maincategories: "",
      depreciationitems: Array.from({ length: 100 }, (_, i) => i + 1),
      categoryPrefix: "",
      selectedSubCategory: [],
      selectsub: "",
      loading2: false,
      headers: [
        { title: "Name", key: "text", sortable: false },
        { title: "Prefix", key: "sub_category_prefix", sortable: false },
        {
          title: "Description",
          key: "sub_category_depriciation",
          sortable: false,
        },

        { title: "Actions", key: "actions", sortable: false },
      ],
      tableLoading: false,
      fixed: true,
      componentCheck: 0,
      categoriessubEddition: false,
      categoriesItem: {},
      SnackBarComponent: {},
    };
  },

  watch: {
    categoriessubAddition: {
      async handler() {
        if (this.categoriessubAddition == true) {
          this.selectedSubCategory = [];
          this.tableLoading = true;
          this.depreciationCode = this.rowInfo.category_depriciation;
          // console.log(this.rowInfo, "rowInfo");

          await this.get_asset_sub_categories();
          this.tableLoading = false;
          this.fetch_sub_data();
        }
      },
      immediate: true,
    },
  },

  methods: {
    fetch_sub_data() {
      // console.log(this.assetSubCategories);
      var filteredArray = this.assetSubCategories.filter(
        (obj) => obj.category_id === this.rowInfo.category_id
      );
      filteredArray.forEach((element) => {
        this.selectedSubCategory.push({
          text: element.sub_category_name,
          value: element.sub_category_id,
          sub_category_prefix: element.sub_category_prefix,
          sub_category_depriciation: element.sub_category_depriciation,
        });
      });
    },

    open_edit_dailog(item) {
      this.componentCheck = 1;
      this.categoriessubEddition = true;
      this.categoriesItem = item;
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.selectedSubCategory = [];
      this.categoriessubEddition = false;
      await this.get_asset_sub_categories();
      this.tableLoading = false;
      this.fetch_sub_data();
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    delete_data(item) {
      this.selectsub = item.value;
      this.loading2 = true;
      this.add_mutation("DELETE_SUBCATEGORY");
    },

    convert_to_uppercase(value) {
      if (value != null || value != "") {
        this.categoryPrefix = value.toUpperCase();
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.categoryPrefix = "";
      this.categoriesName = "";
      // this.$refs.form.reset();
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        this.add_mutation("CREATE_SUBCATEGORY");
      }
    },

    async add_mutation(value) {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_sub_category, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: value,
              category_id:
                value == "CREATE_SUBCATEGORY"
                  ? this.rowInfo.category_id
                  : undefined,
              sub_category_name:
                value == "CREATE_SUBCATEGORY" ? this.categoriesName : undefined,
              sub_category_depriciation: Number(this.depreciationCode),
              sub_category_prefix:
                value == "CREATE_SUBCATEGORY" ? this.categoryPrefix : undefined,

              sub_category_id:
                value == "DELETE_SUBCATEGORY" ? this.selectsub : undefined,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.asset_sub_category);
        this.loading2 = false;
        if (response.Status == "SUCCESS") {
          this.selectedSubCategory = [];
          this.tableLoading = true;
          await this.get_asset_sub_categories();
          this.tableLoading = false;
          this.fetch_sub_data();
          this.$emit("successMsg", response.Message);

          // this.$refs.form.reset();
          // this.categoryPrefix = "";
          this.categoryPrefix = "";
          this.categoriesName = "";
          this.$refs.form.resetValidation();
          this.depreciationCode = this.rowInfo.category_depriciation;

          // this.$emit("updaterefesh", "update");
        } else {
          this.loading = false;
          this.loading2 = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.loading2 = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
  
  
<style scoped>
.my-custom-table .v-data-table__wrapper > table > thead > tr > th {
  font-size: 12px !important; /* Custom font size */
  color: rgb(0, 0, 0) !important; /* Custom color */
  background-color: #ffff !important; /* Optional: Make background transparent */
}

.my-custom-table .v-data-table__wrapper > table > tbody > tr {
  border: 1px solid #e0e0e0; /* Example row border */
}
</style>