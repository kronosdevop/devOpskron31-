<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="approvalLocation" @update:model-value="$emit('update:approvalLocation', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Location Approve /Reject
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to Approve or Reject the

            <b> {{ rowInfo.location_name }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            :loading="loadingapprove"
            @click="delete_mutation('APPROVED')"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Yes
          </v-btn>
          <v-btn
            :loading="loading"
            @click="delete_mutation('REJECTED')"
            dark
            class="text-capitalize cardCss button-corner"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
              <script>
/* eslint-disable */
import { approve_rejct_unverified_loc } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    approvalLocation: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
      loadingapprove: false,
    };
  },
  watch: {
    approvalLocation: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_mutation(val) {
      if (val == "APPROVED") {
        this.loadingapprove = true;
      } else {
        this.loading = true;
      }

      try {
        let result = await API.graphql(
          graphqlOperation(approve_rejct_unverified_loc, {
            input: {
              location_id: this.rowInfo.location_id,
              approval_status: val,
              location_verification_status:
                val == "APPROVED" ? "VERIFIED" : "UNVERIFIED",
            },
          })
        );

        this.loading = false;
        this.loadingapprove = false;
        var response = JSON.parse(result.data.approve_rejct_unverified_loc);
        this.loading = false;
        this.loadingapprove = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.loadingapprove = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>