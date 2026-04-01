<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="editItemDialog" @update:model-value="$emit('update:editItemDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Edit Item</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  outlined
                  dense
                  label="Item Name"
                  :rules="[(v) => !!v || 'Required']"
                  v-model="item_name"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Inner Length(mts)"
                  v-model="item_length"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Inner Width(mts)"
                  v-model="item_width"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Inner Height(mts)"
                  v-model="item_height"
                ></v-text-field>
                <v-text-field
                  outlined
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  label="Load(lb)"
                  v-model="max_load"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row class="mt-n12">
              <v-col cols="6">
                <v-checkbox v-model="fragile" label="Is Fragile"></v-checkbox>
              </v-col>
              <v-col cols="6">
                <v-checkbox
                  v-model="rotate_allowed"
                  :label="
                    rotate_allowed ? 'Enable Rotation' : 'Disable Rotation'
                  "
                  :true-value="false"
                  :false-value="true"
                ></v-checkbox>
              </v-col>
              <v-col cols="6" class="mt-n12">
                <v-checkbox
                  v-model="stack_allowed"
                  :label="stack_allowed ? 'Enable Stack' : 'Disable Stack'"
                  :true-value="false"
                  :false-value="true"
                ></v-checkbox>
              </v-col>
              <v-col cols="6" class="mt-n12">
                <v-checkbox
                  v-model="tilt_allowed"
                  :label="tilt_allowed ? 'Enable Tilt' : 'Disable Tilt'"
                  :true-value="false"
                  :false-value="true"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="save_Item()"
            dark
            class="cardCss mt-n4 button-corner text-capitalize"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template> 

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { create_edit_delete_cargo_items } from "@/graphql/mutations.js";

export default {
  props: {
    editItemDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      item_name: "",
      item_height: "",
      item_length: "",
      item_width: "",
      max_load: "",
      loading: false,
      fragile: null,
      rotate_allowed: null,
      stack_allowed: null,
      tilt_allowed: null,
    };
  },
  watch: {
    editItemDialog: {
      async handler() {
        this.item_name = this.rowInfo.cargo_item_name;
        this.item_height = this.rowInfo.height_in_mts;
        this.item_length = this.rowInfo.length_in_mts;
        this.item_width = this.rowInfo.width_in_mts;
        this.max_load = this.rowInfo.max_load_in_lb;
        this.fragile = this.rowInfo.is_fragile;
        this.rotate_allowed = this.rowInfo.is_rotate_allowed;
        this.stack_allowed = this.rowInfo.is_stack_allowed;
        this.tilt_allowed = this.rowInfo.is_tilt_allowed;
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    save_Item() {
      if (this.$refs.form.validate()) {
        this.save_Cargo_Item();
      }
    },

    async save_Cargo_Item() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_edit_delete_cargo_items, {
            input: {
              action_type: "UPDATE_CARGO_ITEM",
              cargo_item_id: this.rowInfo.cargo_item_id,
              cargo_item_name: this.item_name,
              height_in_mts: this.item_height,
              length_in_mts: this.item_length,
              width_in_mts: this.item_width,
              max_load_in_lb: this.max_load,
              is_fragile: this.fragile,
              is_rotate_allowed: this.rotate_allowed,
              is_stack_allowed: this.stack_allowed,
            },
          })
        );
        var response = JSON.parse(result.data.create_edit_delete_cargo_items);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>
<style>
</style>