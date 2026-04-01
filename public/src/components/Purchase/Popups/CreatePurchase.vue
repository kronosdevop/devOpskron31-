<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="purchaseCreation" @update:model-value="$emit('update:purchaseCreation', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Generate Purchase</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="supplierName"
                  label="Supplier*"
                  outlined
                  :rules="[(v) => !!v || 'required ']"
                  item-text="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  placeholder="Min 3 Character"
                >
                </v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="materialName"
                  label="Material Name*"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="materialQuantity"
                  label="Material Quantity*"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="orderPrice"
                  label="Amount*"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="loationName"
                  label="Location"
                  :items="loactionitems"
                  :search-input.sync="searchloc"
                  @input="searchloc = ''"
                  :rules="[(v) => !!v || 'required ']"
                  hide-no-data
                  item-text="location_name"
                  item-value="location_id"
                  outlined
                />
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
            Generate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
        
      <script>
/*eslint-disable*/

import { get_location_details } from "@/mixins/GetLocations.js";
import { initiate_purchase_request } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";

export default {
  props: {
    purchaseCreation: Boolean,
  },
  mixins: [get_all_org_suppliers, get_location_details],
  data() {
    return {
      materialName: "",
      supplierName: "",
      searchF: "",
      userArray: [],
      loading: false,
      loationName: "",
      orderPrice: "",
      materialQuantity: "",
      searchloc: "",
      loactionitems: [],
    };
  },
  watch: {
    purchaseCreation: {
      async handler() {
        if (this.purchaseCreation == true) {
          await Promise.all([
            this.get_all_org_suppliers(),
            this.get_location_details(),
          ]);

          this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  computed: {},
  methods: {
    fetch_details() {
      this.orgSupplier.forEach((element) => {
        this.userArray.push({
          full_user_name: element.supplier_name,
          user_id: element.suppliers_id,
        });
      });
      this.locationList.forEach((element) => {
        this.loactionitems.push({
          location_name: element.location_name,
          location_id: element.location_id,
        });
      });
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
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(initiate_purchase_request, {
            input: {
              suppliers_id: this.supplierName,
              location_id: this.loationName,
              material_name: this.materialName,
              material_quantity: this.materialQuantity,
              purchase_order_price: this.orderPrice,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.initiate_purchase_request);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.$emit("updaterefesh", "update");
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