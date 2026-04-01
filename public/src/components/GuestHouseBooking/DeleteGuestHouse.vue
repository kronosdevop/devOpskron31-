<template>
  <div>
    <!-- eslint-disable 
 -->
    <v-dialog :model-value="deleteguestDialog" @update:model-value="$emit('update:deleteguestDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="custom-title ml-2"
            >Delete GuestHouse</v-toolbar-title
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
        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to delete <b>{{ ViewInfo.name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_dailog()"
            dark
            color="red"
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

import { update_guest_house_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    deleteguestDialog: Boolean,
    ViewInfo: Object,
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

    async delete_dailog() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(update_guest_house_details, {
            input: {
              guest_house_status: "DEACTIVE",
              guest_house_id: this.ViewInfo.guest_house_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.update_guest_house_details);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("error_info", response.Message);
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