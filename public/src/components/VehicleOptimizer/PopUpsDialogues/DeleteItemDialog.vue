<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="deleteItemDialog"
      @update:model-value="$emit('update:deleteItemDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Delete Item</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to delete
            <b> {{ rowInfo.cargo_item_name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Yes
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
    rowInfo: Object,
    deleteItemDialog: Boolean,
  },

  data() {
    return {
      loading: false,
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_edit_delete_cargo_items, {
            input: {
              action_type: "DELETE_CARGO_ITEM",
              cargo_item_id: this.rowInfo.cargo_item_id,
              cargo_item_name: this.rowInfo.cargo_item_name,
              height_in_mts: this.rowInfo.height_in_mts,
              length_in_mts: this.rowInfo.length_in_mts,
              width_in_mts: this.rowInfo.width_in_mts,
              max_load_in_lb: this.rowInfo.max_load_in_lb,
              is_fragile: this.rowInfo.is_fragile,
              is_rotate_allowed: this.rowInfo.is_rotate_allowed,
              is_stack_allowed: this.rowInfo.is_stack_allowed,
            },
          })
        );
        var response = JSON.parse(result.data.create_edit_delete_cargo_items);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
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