<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="deleteEntityDialog"
      @update:model-value="$emit('update:deleteEntityDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Delete Entity</div></v-toolbar-title
          >
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
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to delete

            <b> {{ ViewEntityInfo.entity_name }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_Entity()"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { quotation_billing_entities } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    deleteEntityDialog: Boolean,
    ViewEntityInfo: Object,
  },

  data() {
    return {
      loading: false,
    };
  },
  watch: {
    deleteEntityDialog: {
      async handler() {},
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_Entity() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(quotation_billing_entities, {
            input: {
              action_type: "DELETE",
              entity_id: this.ViewEntityInfo.entity_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.quotation_billing_entities);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
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