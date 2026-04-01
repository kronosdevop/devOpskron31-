<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="locationDailog" @update:model-value="$emit('update:locationDailog', $event)"
      persistent
      max-width="550"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Location Update</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <div class="font-weight-bold mt-4 ml-1">
            Are you sure you want to set this location for the inventory ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="bulk_location()"
            :loading="loading"
            color="#ef3f6e"
            class="text-capitalize"
            >Yes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */

import { update_location_Stock_space } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    locationDailog: Boolean,
    allselecctedRecords: Array,
  },

  data() {
    return {
      approvalComments: "",

      loading: false,
    };
  },
  watch: {
    locationDailog: {
      async handler() {
        if (this.locationDailog == true) {

        }
      },

      immediate: true,
    },
  },
  methods: {


    async bulk_location() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(update_location_Stock_space, {
            input: {
              location_obj: this.allselecctedRecords,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.update_location_Stock_space);
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.$emit("successMsg", response.Message);
          // this.$refs.form1.reset();
        } else {
          this.loading = false;

          // this.formCheck = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);

    },
  },
};
</script>