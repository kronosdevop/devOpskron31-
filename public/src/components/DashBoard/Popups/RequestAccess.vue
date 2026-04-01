<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="accessingdashboard" @update:model-value="$emit('update:accessingdashboard', $event)" persistent max-width="450" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Request Access</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to Request Access for
            <b> {{ rowInfo.dashboard_name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="request_mutation()"
            dark
            class="cardCss"
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
import { request_access_dashboard } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    accessingdashboard: Boolean,
    rowInfo: Object,
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

    async request_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(request_access_dashboard, {
            input: {
              organization_id: data.organization.organization_id,
              dashboard_id: this.rowInfo.dashboard_id,
              current_user_email: data.user.user_email_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.request_access_dashboard);
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