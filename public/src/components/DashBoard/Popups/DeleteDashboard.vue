<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="dashboardDeletion" @update:model-value="$emit('update:dashboardDeletion', $event)" persistent max-width="450" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Delete Dashboard</div></v-toolbar-title
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
            Are you sure you want to delete
            <b> {{ rowInfo.dashboard_name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_mutation()"
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
import { edit_or_delete_dashboard_topic } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    dashboardDeletion: Boolean,
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

    async delete_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_or_delete_dashboard_topic, {
            input: {
              action_type: "DELETE",
              dashboard_id: this.rowInfo.dashboard_id,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.edit_or_delete_dashboard_topic);
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