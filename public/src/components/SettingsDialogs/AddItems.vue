<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="ItemsAddition"
      @update:model-value="$emit('update:ItemsAddition', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Product</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="scrollable-content">
          <v-form ref="form">
            <v-row class="mt-2" dense>
              <v-col cols="6">
                <v-select
                  variant="outlined"
                  density="compact"
                  label="Item Type"
                  item-title="title"
                  item-value="value"
                  :items="[
                    { title: 'Product', value: 'PRODUCT' },
                    { title: 'Service', value: 'SERVICE' },
                  ]"
                  v-model="itemType"
                />
              </v-col>
            </v-row>

            <div v-if="itemType == 'PRODUCT'">
              <v-row dense>
                <v-col cols="12"><h3 class="mb-2">Basic Information</h3></v-col>
                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="Name*"
                    v-model="productName"
                    :rules="[rules.required]"
                /></v-col>
                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="Code / SKU*"
                    v-model="supplierItemsku"
                    :rules="[rules.required]"
                /></v-col>
                <v-col md="6"
                  ><v-autocomplete
                    variant="outlined"
                    density="compact"
                    label="Category*"
                    item-title="category_name"
                    item-value="category_id"
                    :items="masterGlobalCategories"
                    v-model="categorys"
                    :rules="[rules.required]"
                /></v-col>
                <v-col cols="6">
                  <v-autocomplete
                    item-title="material_unit_name"
                    item-value="material_unit_id"
                    :items="unitmaterials"
                    v-model="unitstype"
                    variant="outlined"
                    density="compact"
                    label="Unit of Measure*"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="Brand"
                    v-model="supplierItembrand"
                /></v-col>
                <v-col cols="6">
                  <v-textarea
                    variant="outlined"
                    density="compact"
                    label="Description"
                    auto-grow
                    v-model="supplierItemdescription"
                    rows="0"
                  />
                </v-col>
              </v-row>

              <!-- Pricing & Tax -->
              <v-row dense>
                <v-col cols="12"
                  ><h3 class="mb-2 mt-4">Pricing & Tax</h3></v-col
                >
                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="MRP / Retail Price"
                    v-model="supplierItemmrp"
                    type="number"
                    @keypress="onlyNumbers"
                /></v-col>
                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="Selling Price"
                    v-model="supplierItemsellingPrice"
                    type="number"
                    @keypress="onlyNumbers"
                /></v-col>
                <v-col md="6">
                  <v-autocomplete
                    v-model="currency"
                    label="Currency"
                    variant="outlined"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    :items="currencyItems"
                    @keypress="onlyNumbers"
                  />
                </v-col>
                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="Tax Rate (%)"
                    v-model="supplierItemtaxRate"
                    type="number"
                    @keypress="onlyNumbers"
                /></v-col>
              </v-row>
            </div>
            <div v-if="itemType == 'SERVICE'">
              <v-row dense>
                <v-col cols="12"><h3 class="mb-2">Basic Information</h3></v-col>
                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="Name*"
                    :rules="[rules.required]"
                    v-model="productName"
                /></v-col>
                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="Cost"
                    @keypress="onlyNumbers"
                    v-model="supplierItemmrp"
                /></v-col>
                <v-col md="6"
                  ><v-text-field
                    variant="outlined"
                    density="compact"
                    label="Code"
                    v-model="supplierItemsku"
                /></v-col>
                <v-col cols="6">
                  <v-textarea
                    variant="outlined"
                    density="compact"
                    label="Description"
                    v-model="supplierItemdescription"
                    rows="1"
                    auto-grow
                  />
                </v-col>
              </v-row>
            </div>
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
/* eslint-disable */
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
import { quotation_sub_categories } from "@/graphql/mutations.js";
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";
import { API, graphqlOperation } from "aws-amplify";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import CurrencyList from "@/JsonFiles/CurrencyList.json";

var AWS = require("aws-sdk");
import { Buffer } from "buffer";

export default {
  mixins: [get_global_categories, get_material_unit, get_all_org_suppliers],
  props: {
    ItemsAddition: Boolean,
  },
  data() {
    return {
      itemType: "PRODUCT",
      productName: "",
      supplierItemsku: "",
      categorys: "",
      supplierItembrand: "",
      supplierItemdescription: "",
      unitstype: [],
      supplierItemmrp: "",
      supplierItemsellingPrice: "",
      currency: "",
      currencyItems: [],
      supplierItemtaxRate: "",
      supplierItemproductName: "",
      servicecost: "",
      loading: false,
      rules: {
        required: (value) => !!value || "This field is required",
      },
    };
  },
  watch: {
    ItemsAddition: {
      async handler() {
        if (this.ItemsAddition == true) {
          this.itemType = "PRODUCT";
          this.currency = "";
          await this.get_global_categories();
          await this.get_material_unit();
          // await this.get_all_org_suppliers();
        }
      },
      immediate: true,
    },
  },
  created() {
    this.currencyItems = CurrencyList.map((item) => ({
      title: `${item.currency_code} - ${item.country}`,
      value: item.currency_code,
    }));
  },
  methods: {
    onlyNumbers(event) {
      if (!/[0-9]/.test(event.key)) {
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
        await this.add_mutation();
      } else {
        // await this.add_mutation();
      }
    },

    async add_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(quotation_sub_categories, {
            input: {
              category_id: !this.categorys ? undefined : this.categorys,
              sub_category_name: !this.productName
                ? undefined
                : this.productName,
              sub_category_Sku: !this.supplierItemsku
                ? undefined
                : this.supplierItemsku,
              sub_category_description: !this.supplierItemdescription
                ? undefined
                : this.supplierItemdescription,
              sub_category_unit:
                this.unitstype.length == 0 ? undefined : this.unitstype,
              currency: !this.currency ? undefined : this.currency,
              sub_category_retail_price: !this.supplierItemmrp
                ? undefined
                : this.supplierItemmrp,
              sub_category_selling_price: !this.supplierItemsellingPrice
                ? undefined
                : this.supplierItemsellingPrice,
              sub_category_tax: !this.supplierItemtaxRate
                ? undefined
                : this.supplierItemtaxRate,
              action_type: "CREATE",
              sub_category_type: this.itemType,
              brand_name: !this.supplierItembrand
                ? undefined
                : this.supplierItembrand,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.quotation_sub_categories);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
          // console.log(response.Message);
        }
      } catch (error) {
        // console.log(error)
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
    
    <style scoped>
h3 {
  font-weight: 600;
  font-size: 16px;
}
.attachment-card {
  width: 100px;
  height: 100px;
  cursor: pointer;
  position: relative;
}
.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.delete-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  cursor: pointer;
  color: red;
}
</style>
