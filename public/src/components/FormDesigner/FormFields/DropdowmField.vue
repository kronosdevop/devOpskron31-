<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'" class="pa-1">
      <!-- <v-card-text> -->
      <v-select
        density="compact"
        variant="outlined"
        readonly
        class="ma-2"
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        :items="safeFieldOptions"
        @click="emit_edit_field(index)"
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
      >
        <!-- <template #append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      </v-select>
      <!-- <v-btn
          x-small
          color="red"
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
          fab
          dark
          absolute
          bottom
          right
          @click="emit_fields((Toggle = 1), index)"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn> -->
      <!-- </v-card-text> -->
    </v-card>
    <v-card flat v-else class="pa-2">
      <!-- tt -->
      <v-select
        v-if="index.is_displayed == true"
        density="compact"
        variant="outlined"
        :readonly="index.is_readonly"
        v-model="dropdownOption"
        class=""
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required === true ? [(v) => !!v || 'required'] : []"
        :items="safeItems"
        :item-title="index.value_label"
        :item-value="index.value"
        @update:modelValue="get_value(dropdownOption,index.display_label, index.key, index)"
      ></v-select>
      <!-- :item-text="index.value_label"
        :item-value="index.value" -->
      <!-- <v-select
        v-if="index.is_displayed == true && index.input_array_value == null"
        dense
        outlined
        :readonly="index.is_readonly"
        v-model="dropdownOption"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'Required '] : []"
        :items="itemsValue"
        @blur="get_value(dropdownOption, index.display_label, index.key)"
      >
      </v-select> -->
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import { get_sub_categories } from "@/mixins/GetMasterSubcategories.js";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import { get_all_users } from "@/mixins/GetAllUsers.js";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_designations_details } from "@/mixins/GetDesignations.js";
import { get_expense_groups_users } from "@/mixins/GetExpenseGroups.js";
import { get_expense_categories } from "@/mixins/ExpenseCategories.js";
import { get_asset_categories } from "@/mixins/GetAssetCategoryList.js";
import { get_asset_sub_categories } from "@/mixins/GetAssetSubCategories.js";
import UpdatedCountryList from "@/JsonFiles/UpdatedCountryList.json";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { get_asset_reatilers } from "@/mixins/GetAssetRetailers.js";
import { get_asset_sub_location } from "@/mixins/GetAssetLocations.js";
import { get_organization_untagged_assets } from "@/mixins/AllAssetList.js";
import { get_master_terittory } from "@/mixins/GetMasterTerritory";
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";
import { get_project_list } from "@/mixins/GetProjectList.js";
export default {
  mixins: [
    get_all_users,
    get_department_details,
    get_location_details,
    get_designations_details,
    get_expense_groups_users,
    get_expense_categories,
    get_asset_categories,
    get_asset_sub_categories,
    get_asset_distributors,
    get_asset_reatilers,
    get_asset_sub_location,
    get_organization_untagged_assets,
    get_master_terittory,
    get_all_org_suppliers,
    get_global_customers,
    get_sub_categories,
    get_project_list,
  ],

  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  computed: {
    shouldShowDeleteIcon() {
      // Check your conditions here
      if (
        this.formActionType !== "initiate" &&
        this.formActionType !== "preview"
      ) {
        return true; // Show the icon
      } else {
        return false; // Do not show the icon
      }
    },
    safeItems() {
      // Ensure items is always an array to prevent Symbol.iterator errors
      if (!this.items) {
        return [];
      }
      if (!Array.isArray(this.items)) {
        return [];
      }
      return this.items;
    },
    safeFieldOptions() {
      // Ensure fieldOptions is always an array to prevent Symbol.iterator errors
      if (!this.index.fieldOptions) {
        return [];
      }
      if (!Array.isArray(this.index.fieldOptions)) {
        return [];
      }
      return this.index.fieldOptions;
    },
  },

  data: () => ({
    Toggle: 0,
    dropdownOption: "",
    itemsValue: [],
    items: [],
    allUsers: [],
    allDesignations: [],
    allGroups: [],
    allLocations: [],
    countryList: "",
    countryitems: [],
    allGroupsNames: [],
    allCategories: [],
    allAssetCategories: [],
    allSubAssetCategories: [],
    allAssetDistributors: [],
    allAssetRetailers: [],
    allAssetLocations: [],
    allterittory: [],
    allAssetListItems: [],
    allcustomerlist: [],
    allsupplierslist: [],
    allProduct: [],
    allProject: [],
  }),
  created() {
    this.items = [];
    this.allUsers = [];
    this.allDesignations = [];
    this.allGroups = [];
    this.allLocations = [];
    this.allGroupsNames = [];
    this.allCategories = [];
    this.allAssetCategories = [];
    this.allSubAssetCategories = [];
    this.allAssetDistributors = [];
    this.allAssetRetailers = [];
    this.allAssetLocations = [];
    this.allterittory = [];
    this.allAssetListItems = [];
    this.allsupplierslist = [];
    this.allProduct = [];
    this.allcustomerlist = [];
    this.allProject = [];
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.dropdownOption =
            element.respectiveValue == "N/A" ? "" : element.respectiveValue;

          // this.itemsValue.push(element.respectiveValue);
        }
      });
    }
  },
  mounted() {
    if (this.formActionType != undefined) {
      this.update_items();
    }
  },
  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    async update_items() {
      // console.log(this.index.input_value,"this.index.input_value");
      if (this.index.input_value == null) {
        this.items = this.index.input_array_value || [];
        if (Array.isArray(this.items)) {
          this.items.forEach((obj) => {
            if (obj && obj.type) {
              obj.type = obj.type.trim();
            }
          });
        }
      } else if (this.index.input_value === "list_users") {
        const users = await this.fetch_users();
        this.items = users || [];
      } else if (this.index.input_value === "list_departments") {
        const departments = await this.fetch_departments();
        this.items = departments || [];
      } else if (this.index.input_value === "list_locations") {
        const locations = await this.fetch_locations();
        this.items = locations || [];
      } else if (this.index.input_value === "list_designations") {
        const designations = await this.fetch_designations();
        this.items = designations || [];
      } else if (this.index.input_value === "country_list") {
        this.items = this.fetch_country_details() || [];
      } else if (this.index.input_value === "list_expense_group") {
        this.items = await this.fetch_expense_groups() || [];
      } else if (this.index.input_value === "expense_details") {
        this.items = await this.fetch_categories_list() || [];
      } else if (this.index.input_value === "list_asset_categories") {
        this.items = await this.fetch_asset_categories_list() || [];
      } else if (this.index.input_value === "list_asset_sub_categories") {
        this.items = await this.fetch_asset_subcategories_list() || [];
      } else if (this.index.input_value === "list_asset_distributors") {
        this.items = await this.fetch_dirtributors() || [];
      } else if (this.index.input_value === "list_asset_retailers") {
        this.items = await this.fetch_retailers() || [];
      } else if (this.index.input_value === "list_all_asset_locations") {
        this.items = await this.fetch_locations() || [];
      } else if (this.index.input_value === "ListAllAssets") {
        this.items = await this.fetch_asset_list_data() || [];
      } else if (this.index.input_value === "list_all_territories") {
        this.items = await this.fetch_masterterittory() || [];
      } else if (this.index.input_value === "list_asset_supliers") {
        this.items = await this.fetch_mastersuppliers() || [];
      } else if (this.index.input_value === "list_all_sub_categories") {
        this.items = await this.fetch_masterproduct() || [];
      } else if (this.index.input_value === "list_all_customers") {
        this.items = await this.fetch_mastercustomers() || [];
      } else if (this.index.input_value === "list_organization_projects") {
        this.items = await this.fech_masterproject() || [];
      }
    },
    async fech_masterproject() {
      await this.get_project_list();
      let productList = [];
      if (this.ProjectList && Array.isArray(this.ProjectList)) {
        this.ProjectList.forEach((element) => {
          productList.push({
            project_name: element.project_name,
            project_id: element.project_id,
          });
        });
      }
      this.allProject = productList;

      return productList;
    },
    async fetch_masterproduct() {
      await this.get_sub_categories();
      let productList = [];
      if (this.MasterSubCategories && Array.isArray(this.MasterSubCategories)) {
        this.MasterSubCategories.forEach((element) => {
          productList.push({
            sub_category_name: element.sub_category_name,
            sub_category_id: element.sub_category_id,
          });
        });
      }
      this.allProduct = productList;

      return productList;
    },
    async fetch_mastercustomers() {
      await this.get_global_customers();
      let customerList = [];
      if (this.masterCustomers && Array.isArray(this.masterCustomers)) {
        this.masterCustomers.forEach((element) => {
          customerList.push({
            customer_name: element.customer_name,
            customer_id: element.customer_id,
          });
        });
      }
      this.allcustomerlist = customerList;

      return customerList;
    },
    async fetch_mastersuppliers() {
      await this.get_all_org_suppliers();
      let supplierslist = [];

      if (this.orgSupplier && Array.isArray(this.orgSupplier)) {
        this.orgSupplier.forEach((element) => {
          supplierslist.push({
            supplier_name: element.supplier_name,
            suppliers_id: element.suppliers_id,
          });
        });
      }
      this.allsupplierslist = supplierslist;

      return supplierslist;
    },
    async fetch_masterterittory() {
      await this.get_master_terittory();
      var terittory = [];

      if (this.orgTerittory && Array.isArray(this.orgTerittory)) {
        this.orgTerittory.forEach((element) => {
          terittory.push({
            territory_name: element.territory_name,
            territory_id: element.territory_id,
          });
        });
      }
      this.allterittory = terittory;

      return terittory;
    },
    async fetch_asset_list_data() {
      await this.get_organization_untagged_assets();
      var allAssetList = [];

      if (this.allUntaggedAssets && Array.isArray(this.allUntaggedAssets)) {
        this.allUntaggedAssets.forEach((element) => {
          allAssetList.push({
            asset_prefix: element.asset_prefix,
            asset_id: element.asset_id,
          });
        });
      }
      this.allAssetListItems = allAssetList;
      return allAssetList;
    },

    async fetch_asset_location_data() {
      await this.get_asset_sub_location();

      var assetLocation = [];

      if (this.assetMasterLocations && Array.isArray(this.assetMasterLocations)) {
        this.assetMasterLocations.forEach((element) => {
          assetLocation.push({
            location_name: element.location_name,
            location_id: element.location_id,
          });
        });
      }
      this.allAssetLocations = assetLocation;
      return assetLocation;
    },

    get_value(fieldvalue, fieldlabel, fieldKey, index) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == "" ? "N/A" : fieldvalue,
        key: fieldKey,
        text:
          fieldvalue == "" ? "N/A" : this.fetch_field_value(fieldvalue, index),
      };
      this.$emit("dropDownField", data);
    },

    fetch_field_value(value, indexObj) {
      if (indexObj.input_value == null) {
        return value;
      } else if (indexObj.input_value == "list_users") {
        return this.fetch_user_name(value);
      } else if (indexObj.input_value == "list_departments") {
        return value;
      } else if (indexObj.input_value == "list_locations") {
        return this.fetch_location_name(value);
      } else if (indexObj.input_value == "list_designations") {
        return this.fetch_designations_name(value);
      } else if (indexObj.input_value == "list_expense_group") {
        return this.fetch_groups_name(value);
      } else if (indexObj.input_value == "expense_details") {
        return this.fetch_categoory_name(value);
      } else if (indexObj.input_value == "list_asset_categories") {
        return this.fetch_asset_categoory_name(value);
      } else if (indexObj.input_value == "list_asset_sub_categories") {
        return this.fetch_asset_sub_name(value);
      } else if (indexObj.input_value == "list_asset_distributors") {
        return this.fetch_asset_distr_name(value);
      } else if (indexObj.input_value == "list_asset_retailers") {
        return this.fetch_asset_retiler_name(value);
      } else if (indexObj.input_value == "list_all_asset_locations") {
        return this.fetch_asset_Loc_name(value);
      } else if (indexObj.input_value == "ListAllAssets") {
        return this.fetch_asset_name(value);
      } else if (indexObj.input_value == "list_all_territories") {
        return this.fetch_territory_name(value);
      } else if (indexObj.input_value == "list_asset_supliers") {
        return this.fetch_supplier_name(value);
      } else if (this.index.input_value === "list_all_sub_categories") {
        return this.fetch_product_name(value);
      } else if (this.index.input_value === "list_all_customers") {
        return this.fetch_customer_name(value);
      } else if (this.index.input_value === "list_organization_projects") {
        return this.fetch_project_name(value);
      }

      //allAssetListItems
    },
    fetch_project_name(value) {
      var projectName = "";

      if (this.ProjectList && Array.isArray(this.ProjectList)) {
        this.ProjectList.forEach((element) => {
          if (value == element.project_id) {
            projectName = element.project_name;
          }
        });
      }
      return projectName;
    },
    fetch_asset_name(value) {
      var assetSelName = "";

      if (this.allAssetListItems && Array.isArray(this.allAssetListItems)) {
        this.allAssetListItems.forEach((element) => {
          if (value == element.asset_id) {
            assetSelName = element.asset_prefix;
          }
        });
      }
      return assetSelName;
    },
    fetch_supplier_name(value) {
      let supplierName = "";

      if (this.allsupplierslist && Array.isArray(this.allsupplierslist)) {
        this.allsupplierslist.forEach((element) => {
          if (value == element.suppliers_id) {
            supplierName = element.supplier_name;
          }
        });
      }
      return supplierName;
    },
    fetch_customer_name(value) {
      let customerName = "";

      if (this.allcustomerlist && Array.isArray(this.allcustomerlist)) {
        this.allcustomerlist.forEach((element) => {
          if (value == element.customer_id) {
            customerName = element.customer_name;
          }
        });
      }
      return customerName;
    },
    fetch_product_name(value) {
      let productName = "";

      if (this.allProduct && Array.isArray(this.allProduct)) {
        this.allProduct.forEach((element) => {
          if (value == element.sub_category_id) {
            productName = element.sub_category_name;
          }
        });
      }
      return productName;
    },
    fetch_territory_name(value) {
      var terittoryName = "";
      if (this.orgTerittory && Array.isArray(this.orgTerittory)) {
        this.orgTerittory.forEach((element) => {
          if (value == element.territory_id) {
            terittoryName = element.territory_name;
          }
        });
      }
      return terittoryName;
    },
    fetch_asset_Loc_name(value) {
      var assetLocName = "";
      if (this.allAssetLocations && Array.isArray(this.allAssetLocations)) {
        this.allAssetLocations.forEach((element) => {
          if (value == element.location_id) {
            assetLocName = element.location_name;
          }
        });
      }
      return assetLocName;
    },

    fetch_asset_categoory_name(value) {
      var categoryAssetName = "";

      if (this.allAssetCategories && Array.isArray(this.allAssetCategories)) {
        this.allAssetCategories.forEach((element) => {
          if (value == element.category_id) {
            categoryAssetName = element.categoryName;
          }
        });
      }
      return categoryAssetName;
    },

    fetch_asset_retiler_name(value) {
      var assetRetailName = "";
      if (this.allAssetRetailers && Array.isArray(this.allAssetRetailers)) {
        this.allAssetRetailers.forEach((element) => {
          if (value == element.asset_retailer_id) {
            assetRetailName = element.asset_retailer_name;
          }
        });
      }
      return assetRetailName;
    },

    fetch_asset_distr_name(value) {
      var assetDistName = "";

      if (this.allAssetDistributors && Array.isArray(this.allAssetDistributors)) {
        this.allAssetDistributors.forEach((element) => {
          if (value == element.asset_distributor_id) {
            assetDistName = element.asset_distributor_id;
          }
        });
      }
      return assetDistName;
    },

    fetch_asset_sub_name(value) {
      var categorySubName = "";

      if (this.allSubAssetCategories && Array.isArray(this.allSubAssetCategories)) {
        this.allSubAssetCategories.forEach((element) => {
          if (value == element.sub_category_id) {
            categorySubName = element.sub_category_name;
          }
        });
      }
      return categorySubName;
    },

    fetch_user_name(value) {
      var name = "";
      if (this.allUsers && Array.isArray(this.allUsers)) {
        this.allUsers.forEach((element) => {
          if (value == element.user_id) {
            name = element.full_user_name;
          }
        });
      }
      return name;
    },

    fetch_groups_name(value) {
      var groupName = "";

      if (this.allGroupsNames && Array.isArray(this.allGroupsNames)) {
        this.allGroupsNames.forEach((element) => {
          if (value == element.expense_group_id) {
            groupName = element.expense_group_name;
          }
        });
      }
      return groupName;
    },

    fetch_categoory_name(value) {
      var categoryName = "";

      if (this.allCategories && Array.isArray(this.allCategories)) {
        this.allCategories.forEach((element) => {
          if (value == element.category_id) {
            categoryName = element.categoryName;
          }
        });
      }
      return categoryName;
    },

    fetch_location_name(value) {
      var locName = "";
      if (this.allLocations && Array.isArray(this.allLocations)) {
        this.allLocations.forEach((element) => {
          if (value == element.location_id) {
            locName = element.location_name;
          }
        });
      }
      return locName;
    },

    fetch_designations_name(value) {
      var designName = "";
      if (this.allDesignations && Array.isArray(this.allDesignations)) {
        this.allDesignations.forEach((element) => {
          if (value == element.designation_id) {
            designName = element.designation_name;
          }
        });
      }
      return designName;
    },

    emit_edit_field(value) {
      this.$emit("dropdownEdit", value);
    },

    async fetch_users() {
      await this.get_all_users();

      var data = [];
      if (this.listUsers && Array.isArray(this.listUsers)) {
        data = this.listUsers
          .filter((element) => element.user_type !== "CHATBOT")
          .map((element) => ({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          }))
          .sort((a, b) => a.full_user_name.localeCompare(b.full_user_name));
      }
      this.allUsers = data;
      return data;
    },

    async fetch_departments() {
      await this.get_department_details();
      var depertmentItems = [];
      if (this.departmentList && Array.isArray(this.departmentList)) {
        this.departmentList.forEach((element) => {
          depertmentItems.push({
            department_name: element.department_name,
            department_name: element.department_name,
          });
        });
      }
      this.allGroups = depertmentItems;
      return depertmentItems;
    },

    async fetch_locations() {
      await this.get_location_details();
      var locationitems = [];
      if (this.locationList && Array.isArray(this.locationList)) {
        this.locationList.forEach((element) => {
          locationitems.push({
            location_name: element.location_name,
            location_id: element.location_id,
          });
        });
      }
      this.allLocations = locationitems;
      return locationitems;
    },

    async fetch_designations() {
      await this.get_designations_details();
      var designationitems = [];
      if (this.designationList && Array.isArray(this.designationList)) {
        this.designationList.forEach((element) => {
          designationitems.push({
            designation_name: element.designation_name,
            designation_id: element.designation_id,
          });
        });
      }
      this.allDesignations = designationitems;
      return designationitems;
    },

    fetch_country_details() {
      var countriesData = [];
      UpdatedCountryList.forEach((element) => {
        countriesData.push({
          name: element.name + "(" + element.code + ")",
          iso_code: element.iso_code,
        });
      });
      this.countryitems = countriesData;
      return countriesData;
    },

    async fetch_expense_groups() {
      await this.get_expense_groups_users();

      var expenseGroups = [];
      if (this.listExpense && Array.isArray(this.listExpense)) {
        this.listExpense.forEach((element) => {
          expenseGroups.push({
            expense_group_name: element.expense_group_name,
            expense_group_id: element.expense_group_id,
          });
        });
      }
      this.allGroupsNames = expenseGroups;
      return expenseGroups;
    },

    async fetch_categories_list() {
      await this.get_expense_categories();
      var catergories = [];
      // console.log(this.expenseCategoriesArray);
      if (this.expenseCategoriesArray && Array.isArray(this.expenseCategoriesArray)) {
        this.expenseCategoriesArray.forEach((element) => {
          catergories.push({
            expense_name: element.expense_name,
            category_id: element.category_id,
          });
        });
      }
      this.allCategories = catergories;
      return catergories;
    },

    async fetch_asset_categories_list() {
      await this.get_asset_categories();
      var assetList = [];
      if (this.assetCategories && Array.isArray(this.assetCategories)) {
        this.assetCategories.forEach((element) => {
          assetList.push({
            category_name: element.text,
            category_id: element.value,
          });
        });
      }
      this.allAssetCategories = this.assetList;

      return assetList;
    },

    async fetch_asset_subcategories_list() {
      await this.get_asset_sub_categories();
      var assetSubList = [];
      if (this.assetSubCategories && Array.isArray(this.assetSubCategories)) {
        this.assetSubCategories.forEach((element) => {
          assetSubList.push({
            sub_category_name: element.sub_category_name,
            sub_category_id: element.sub_category_id,
          });
        });
      }
      this.allSubAssetCategories = assetSubList;

      return assetSubList;
    },

    async fetch_dirtributors() {
      await this.get_asset_distributors();
      var distributorsList = [];

      if (this.masterAssetDistributors && Array.isArray(this.masterAssetDistributors)) {
        this.masterAssetDistributors.forEach((element) => {
          distributorsList.push({
            asset_distributor_name: element.asset_distributor_name,
            asset_distributor_id: element.asset_distributor_id,
          });
        });
      }
      this.allAssetDistributors = distributorsList;
      return distributorsList;
    },

    async fetch_retailers() {
      await this.get_asset_reatilers();
      var assetRetailers = [];

      if (this.masterAssetRetailers && Array.isArray(this.masterAssetRetailers)) {
        this.masterAssetRetailers.forEach((element) => {
          assetRetailers.push({
            asset_retailer_name: element.asset_retailer_name,
            asset_retailer_id: element.asset_retailer_id,
          });
        });
      }
      this.allAssetRetailers = assetRetailers;
      return assetRetailers;
    },
  },
};
</script>
