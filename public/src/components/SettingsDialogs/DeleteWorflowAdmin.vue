<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="deleteWrkflowRoles" @update:model-value="$emit('update:deleteWrkflowRoles', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Delete Workflow Admins
            </div></v-toolbar-title
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
            Are you sure you want to delete workflow admin
            <b> {{ rowInfo.user_email_id }}</b> ?
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
import { delete_workflow_roles } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    deleteWrkflowRoles: Boolean,
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
      try {
        let result = await API.graphql(
          graphqlOperation(delete_workflow_roles, {
            workflow_role_id: this.rowInfo.workflow_role_id,
            workflow_role_status: "ACTIVE",
          })
        );
        this.loading = false;
        var response = result.data.delete_workflow_roles;

        // this.$emit("successMsg", "Admin Access Removed Successfully");
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>