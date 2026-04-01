<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="viewChangeDialog" @update:model-value="$emit('update:viewChangeDialog', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Change View
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to change to
            {{ viewAction == "CardView" ? "card" : "list" }} view?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="change_mutation()"
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
import { dashboard_view_edit } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    viewChangeDialog: Boolean,
    viewAction: String,
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

    async change_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(dashboard_view_edit, {
            user_id: this.rowInfo.user_id,
            dashboard_view:
              this.viewAction == "CardView" ? "CARD_VIEW" : "LIST_VIEW",
          })
        );
        this.loading = false;

        this.$emit("successMsg", "Updated Successfully");
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
