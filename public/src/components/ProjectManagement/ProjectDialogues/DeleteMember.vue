<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog 
      :model-value="deleteMemberDialogue" 
      @update:model-value="$emit('update:deleteMemberDialogue', $event)"
      persistent 
      max-width="400" 
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Delete Member</div></v-toolbar-title
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
            <b> {{ currentData.email }}</b> ?
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
import { edit_project } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    deleteMemberDialogue: Boolean,
    rowInfo: Object,
    currentData: Object,
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
          graphqlOperation(edit_project, {
            input: {
              project_id: this.rowInfo.project_id,
              project_visible_members: this.fetch_users(),
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.edit_project);
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

    fetch_users() {
      var existing = this.rowInfo.project_visible_members;
      let emailToRemove = this.currentData.email;
      existing = existing.filter((obj) => obj.email !== emailToRemove);
      return JSON.stringify(existing);
    },
  },
};
</script>