<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="stockcreation" @update:model-value="$emit('update:stockcreation', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Add Stock</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-select
                  dense
                  :items="materialitems"
                  v-model="materialName"
                  item-text="text"
                  item-value="value"
                  label="Material Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                  return-object
                  @change="updateunits"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  dense
                  :items="materialitemunits"
                  v-if="materialName"
                  v-model="materialUnit"
                  item-text="text"
                  item-value="value"
                  label="Material Unit*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  return-object
                  outlined
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="material_quntuty"
                  label="Material Quantity*"
                  :rules="[(v) => !!v || 'required ']"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  class="mr-2"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="amountPaid"
                  label="Amount Paid"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  class="mr-2"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="billdetails"
                  label="Bill Number"
                  class="mr-2"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="mt-n4">
                <v-radio-group
                  v-model="toggle_exclusive"
                  row
                  :rules="[(v) => !!v || 'required ']"
                  @change="changelocation(toggle_exclusive)"
                >
                  <v-radio label="Project Site" value="PROJECT SITE"></v-radio>
                  <v-radio label="Warehouse" value="WAREHOUSE"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="12">
                <v-select
                  outlined
                  dense
                  v-model="locations"
                  v-if="toggle_exclusive != null"
                  :rules="[(v) => !!v || 'required ']"
                  label="Location"
                  :items="locationitems"
                  item-text="text"
                  item-value="vlaue"
                  return-object
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
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
        
        <script>
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_material_list } from "@/mixins/GetMaterial";
import { add_update_material_to_stock } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    stockcreation: Boolean,
  },
  mixins: [get_material_list, get_location_details],
  data() {
    return {
      materialName: "",
      material_quntuty: "",
      materialitemunits: [],
      billdetails: "",
      amountPaid: "",
      toggle_exclusive: null,
      materialUnit: "",
      locationitems: [],
      locations: "",
      materialitems: [],
      loading: false,
    };
  },
  watch: {
    stockcreation: {
      async handler() {
        if (this.stockcreation == true) {
          await Promise.all([
            this.get_location_details(),
            this.get_material_list(),
          ]);

          this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  computed: {},
  methods: {
    updateunits() {
      this.materialitemunits = [];
      this.materialName.units.forEach((element) => {
        this.materialitemunits.push({
          text: element.material_unit_name,
          value: element.material_unit_id,
        });
      });
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
    fetch_details() {
      this.materialitems = [];

      this.materialList.forEach((element) => {
        this.materialitems.push({
          text: element.material_name,
          value: element.material_id,
          units: element.materialUnitKeyValuePairs,
        });
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    changelocation(val) {
      this.locations = "";
      this.locationitems = [];
      var loaction = this.locationList;
      loaction = loaction.filter((obj) => obj.location_type == val);
      loaction.forEach((element) => {
        this.locationitems.push({
          text: element.location_name,
          vlaue: element.location_id,
        });
      });
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
          graphqlOperation(add_update_material_to_stock, {
            input: {
              material_quantity: Number(this.material_quntuty),
              material_id: this.materialName.value,
              location_name: this.locations.text,
              location_id: this.locations.vlaue,
              material_unit_id: this.materialUnit.value,
              amount_paid: this.amountPaid,
              bill_details: this.billdetails,
              material_unit: this.materialUnit.text,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.add_update_material_to_stock);
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