<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="materialcreation" @update:model-value="$emit('update:materialcreation', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Material</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="materialName"
                  label="Material Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class="mr-2"
                  outlined
                ></v-text-field>
              </v-col>
              <!-- <v-col cols="12">
                <v-combobox
                  v-model="materialunit"
                  chips
                  clearable
                  multiple
                  dense
                  outlined
                  :rules="[
                    (v) => !!v.length || 'At least one Units is required',
                  ]"
                  label="Units"
                  hint="Press the Enter key after entering each units"
                  hide-selected
                  append-icon=""
                  class=""
                >
                  <template
                    #selection="{ attrs, item, select, selected }"
                  >
                    <v-chip
                      x-small
                      v-bind="attrs"
                      :input-value="selected"
                      close
                      @click="select"
                      @click:close="removecc(item)"
                    >
                      <strong>{{ item }}</strong
                      >&nbsp;
                    </v-chip>
                  </template>
                </v-combobox>
              </v-col> -->
              <v-col cols="12">
                <v-select
                  outlined
                  dense
                  :rules="[(v) => v.length > 0 || 'required ']"
                  label="Unit"
                  v-model="unitName"
                  :items="unititems"
                  multiple
                  item-text="text"
                  item-value="value"
                />
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  dense
                  v-model="supplierName"
                  label="Supplier"
                  outlined
                  item-text="full_user_name"
                  item-value="user_id"
                  :items="userArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  multiple
                  placeholder="Min 3 Character"
                  return-object
                >
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
          <v-card
            v-if="supplierName.length > 0"
            outlined
            v-for="item in supplierName"
            :key="item.suppliers_id"
            class="pa-2 ma-2"
          >
            <div><b> Supplier: </b>{{ item.full_user_name }}</div>
            <div><b> Supplier Name :</b>{{ item.suppliers_contact_name }}</div>
            <div>
              <b>Supplier Contact Number :</b
              >{{ item.suppliers_contact_number }}
            </div>
            <div><b>Supplier Email ID :</b>{{ item.suppliers_email_id }}</div>
            <div><b>Supplier Address :</b>{{ item.suppliers_address }}</div>
          </v-card>
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
import { create_list_edit_delete_material } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_suppliers } from "@/mixins/GetSuppliers.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
export default {
  props: {
    materialcreation: Boolean,
  },
  mixins: [get_all_org_suppliers, get_material_unit],
  data() {
    return {
      materialName: "",
      materialunit: [],
      supplierName: [],
      searchF: "",
      userArray: [],
      loading: false,
      unititems: [],
      unitName: [],
    };
  },
  watch: {
    materialcreation: {
      async handler() {
        if (this.materialcreation == true) {
          await Promise.all([
            this.get_material_unit(),
            this.get_all_org_suppliers(),
          ]);

          this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  computed: {},
  methods: {
    removecc(item) {
      this.materialunit.splice(this.materialunit.indexOf(item), 1);
    },
    fetch_details() {
      this.unitmaterials.forEach((element) => {
        this.unititems.push({
          text: element.material_unit_name,
          value: element.material_unit_id,
        });
      });
      this.orgSupplier.forEach((element) => {
        this.userArray.push({
          full_user_name: element.supplier_name,
          user_id: element.suppliers_id,
          suppliers_contact_number: element.suppliers_full_number,
          suppliers_contact_name: element.suppliers_contact_name,
          suppliers_email_id: element.suppliers_email_id,
          suppliers_address: element.suppliers_address,
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
          graphqlOperation(create_list_edit_delete_material, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "CREATE_MATERIAL",
              material_name: this.materialName,
              material_unit_id: this.unitName,
              supplier_name:
                this.supplierName == null
                  ? []
                  : this.supplierName.map((supplier) => supplier.user_id),
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_edit_delete_material);
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