<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="deleteCustomerDialog"
    persistent
    max-width="400"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="bg-white">
        <v-spacer />
        <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
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
        <div class="text-center">
          Are you sure you want to delete
          <b> {{ rowInfo.customer_name }}</b> ?
        </div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          depressed
          :loading="loading"
          @click="delete_mutation()"
          dark
          class="cardCss button-corner text-white"
        >
          Yes, Delete It!
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { customer_function } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    rowInfo: Object,
    deleteCustomerDialog: Boolean,
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
          graphqlOperation(customer_function, {
            input: {
              customer_id: this.rowInfo.customer_id,
              action_type: "DELETE_CUSTOMER",
            },
          })
        );
        var response = JSON.parse(result.data.customer_function);
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

<style></style>
