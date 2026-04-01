<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="cancelOrderDialig" @update:model-value="$emit('update:cancelOrderDialig', $event)"
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
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to Cancel Order of

            <b> {{ rowInfo.customer_name }} </b> ?
          </div>

          <v-form ref="form">
            <v-textarea
              label="Reason"
              variant="outlined"
              density="compact"
              rows="1"
              :rules="[(v) => !!v || 'Reason is required']"
              v-model="cancelReason"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_delete()"
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
/* eslint-disable */

import { edit_orders } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    cancelOrderDialig: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,
      cancelReason: "",
    };
  },
  watch: {
    cancelOrderDialig: {
      async handler() {},
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async validate_delete() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.delete_Entity();
      }
    },

    async delete_Entity() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_orders, {
            input: {
              order_id: this.rowInfo.order_id,
              order_delevery_status: "CANCELLED",
              cancel_reason: this.cancelReason,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.edit_orders);
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