<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-dialog
      :model-value="addStockDialog"
      @update:model-value="$emit('update:addStockDialog', $event)"
      persistent
      fullscreen
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Add Stock</div>
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            @click="create_StockInvertory()"
            :loading="loading"
            dark
            small
            v-if="stockItems.length > 0"
            class="text-capitalize cardCss button-corner mr-2 mt-6"
          >
            Save
          </v-btn>
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="4">
              <div class="font-weight-bold mb-4">Enter stock details</div>
              <v-select
                variant="outlined"
                density="compact"
                label="Location*"
                item-title="location_name"
                item-value="location_id"
                :items="filteredLocationItems"
                :rules="[(v) => !!v || 'required ']"
                v-model="stockLocation"
                return-object
                @update:model-value="
                  stockItems.length > 0 ? (locationConfirm = true) : ''
                "
              /><v-form ref="form">
                <v-select
                  variant="outlined"
                  density="compact"
                  label="Product*"
                  :rules="[(v) => !!v || 'required ']"
                  item-title="sub_category_name"
                  item-value="sub_category_id"
                  :items="filteredSubMasterList"
                  v-model="stockProduct"
                  return-object
                  @update:model-value="updateUnits()"
                />
                <v-text-field
                  density="compact"
                  variant="outlined"
                  v-model="stockQuantity"
                  label="Quantity*"
                  :rules="[(v) => !!v || 'required ']"
                  @keypress="is_number($event)"
                ></v-text-field>
                <v-select
                  variant="outlined"
                  density="compact"
                  label="Units*"
                  item-title="material_unit_name"
                  item-value="material_unit_id"
                  :items="updatedUnits"
                  v-model="unitstype"
                  return-object
                  :rules="[(v) => !!v || 'required ']"
                />
                <v-text-field
                  density="compact"
                  variant="outlined"
                  v-model="amountPaid"
                  label="Amount Paid"
                  @keypress="is_number($event)"
                ></v-text-field>
                <v-text-field
                  density="compact"
                  variant="outlined"
                  v-model="billDetails"
                  label="Bill Details"
                ></v-text-field>
                <v-textarea
                  variant="outlined"
                  density="compact"
                  v-model="comments"
                  label="Comments"
                  auto-grow
                  rows="1"
                ></v-textarea>
              </v-form>
              <v-btn
                @click="validate_data()"
                dark
                class="text-capitalize cardCss"
              >
                Add
              </v-btn>
            </v-col>
            <v-col cols="8">
              <div class="font-weight-bold">Stock details</div>
              <v-data-table
                :headers="supplierHeaders"
                :fixed-header="fixed"
                :items="stockItems"
                :footer-props="{
                  itemsPerPageOptions: [10, 20],
                }"
                :items-per-page="20"
                density="compact"
                class="elevation-1 dtwidth mt-6"
              >
                <template v-slot:[`item.sub_category_id`]="{ item }">
                  <span>{{ fetch_name(item.sub_category_id) }}</span>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon small @click="open_delete(item)" color="red"
                    >mdi-delete</v-icon
                  >
                </template>
              </v-data-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog
      :model-value="locationConfirm"
      @update:model-value="$emit('update:locationConfirm', $event)"
      persistent
      width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-card-text class="pa-5"
          >Changing the location will clear the stock records in the list. Would
          you like to change the location?
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            variant="flat"
            @click="
              locationConfirm = false;
              stockItems = [];
            "
            dark
            class="cardCss mr-2"
          >
            Yes
          </v-btn>
          <v-btn
            variant="flat"
            @click="locationConfirm = false"
            dark
            class="cardCss"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */

import { get_sub_categories } from "@/mixins/GetMasterSubcategories.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { add_update_product_to_stock } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";

export default {
  props: {
    addStockDialog: Boolean,
  },

  mixins: [get_sub_categories, get_location_details, get_material_unit],

  data() {
    return {
      stockProduct: "",
      stockLocation: "",
      stockQuantity: "",
      subMasterList: [],
      stockItems: [],
      loading: false,
      locationConfirm: false,
      LocationItems: [],
      updatedUnits: [],
      unitstype: "",
      amountPaid: "",
      billDetails: "",
      comments: "",
      fixed: true,

      supplierHeaders: [
        { title: "Product", key: "sub_category_id", sortable: false },
        {
          title: "Quantity",
          key: "sub_category_quantity",
          sortable: false,
        },
        { title: "Units", key: "sub_category_unit_name", sortable: false },
        {
          title: "Amount Paid",
          key: "amount_paid",
          sortable: false,
        },
        {
          title: "Bill Details",
          key: "bill_details",
          sortable: false,
        },
        {
          title: "Comments",
          key: "sub_category_consumption_comments",
          sortable: false,
        },
        {
          title: "Actions",
          key: "actions",
          sortable: false,
        },
      ],
    };
  },
  watch: {
    addStockDialog: {
      async handler() {
        if (this.addStockDialog == true) {
          this.stockLocation = "";
          await this.get_location_details();
          this.LocationItems = this.locationList;
          this.stockLocation = this.LocationItems[0];
          await this.get_sub_categories();
          this.subMasterList = this.MasterSubCategories;

          await this.get_material_unit();
        }
      },
      immediate: true,
    },
  },
  async created() {},

  computed: {
    filteredSubMasterList() {
      return this.subMasterList.filter(
        (item) => item.sub_category_type === "PRODUCT"
      );
    },

    filteredLocationItems() {
      return this.LocationItems.filter(
        (item) =>
          item.location_type != "SCAN_ANYWHERE" &&
          (item.is_product_inventory_space == null ||
            item.is_product_inventory_space == true)
      );
    },
  },

  methods: {
    fetch_name(item) {
      let name = "";
      this.filteredSubMasterList.forEach((element) => {
        if (element.sub_category_id == item) {
          name = element.sub_category_name;
        }
      });
      return name;
    },
    open_delete(item) {
      const index = this.stockItems.indexOf(item);
      if (index !== -1) {
        this.stockItems.splice(index, 1);
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.stockItems = [];
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
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
    updateUnits() {
      this.unitstype = "";
      if (!this.stockProduct) return;

      let unitslist = this.unitmaterials;
      this.updatedUnits = unitslist.filter((obj) =>
        this.stockProduct.sub_category_unit.includes(obj.material_unit_id)
      );
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (!this.stockProduct || !this.unitstype) {
          this.$emit("errorMsg", "Please select both Product and Units");
          return;
        }

        const duplicate = this.stockItems.find(
          (item) =>
            item.sub_category_id === this.stockProduct.sub_category_id &&
            item.sub_category_unit_id === this.unitstype.material_unit_id
        );
        if (duplicate) {
          this.$emit("errorMsg", "Stock with the same unit exists");

          return;
        }

        let inputdata = {
          sub_category_id: this.stockProduct.sub_category_id,
          sub_category_unit_id: this.unitstype.material_unit_id,
          sub_category_quantity: Number(this.stockQuantity),
          location_id: this.stockLocation.location_id,
          location_name: this.stockLocation.location_name,
          amount_paid: Number(this.amountPaid) || 0,
          bill_details: this.billDetails == null ? "" : this.billDetails,
          sub_category_consumption_comments:
            this.comments == null ? "" : this.comments,
          sub_category_unit_name: this.unitstype.material_unit_name,
        };
        this.stockItems.push(inputdata);
        this.$refs.form.reset();
        this.$refs.form.resetValidation();
      }
    },

    async create_StockInvertory() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(add_update_product_to_stock, {
            input: {
              products: this.stockItems,
              // sub_category_id: this.stockProduct,
              // sub_category_unit_id: this.unitstype.material_unit_id,
              // sub_category_unit_name: this.unitstype.material_unit_name,
              // sub_category_quantity: Number(this.stockQuantity),
              // location_id: this.stockLocation.location_id,
              // location_name: this.stockLocation.location_name,
              // amount_paid: Number(this.amountPaid) || 0,
              // bill_details: this.billDetails,
              // sub_category_consumption_comments: this.comments,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.add_update_product_to_stock);
        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
          this.stockItems = [];
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        console.error("GraphQL Error:", error);
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message || "An error occurred");
      }
    },
  },
};
</script>