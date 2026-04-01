<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="deleteDirectoryDialog"
      @update:model-value="$emit('update:deleteDirectoryDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
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
        <v-card-text class="mt-6">
          <div class="text-center">
            Are you sure you want to delete
            <b> {{ rowInfo.directory_name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            v-if="
              rowInfo.directory_created_by ==
              $store.getters.GetUserObj.user.user_email_id
            "
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Yes, Delete It!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { delete_directory } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";

export default {
  props: {
    deleteDirectoryDialog: Boolean,
    rowInfo: Object,
  },
  // mixins: [update_audit_logs],
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
          graphqlOperation(delete_directory, {
            input: {
              directory_id: this.rowInfo.directory_id,
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.delete_directory);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.fetch_audit_message();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "DIRECTORY_ACTION",
        AuditAction: "DELETE_DIRECTORY",
        AuditMessage: `${data.user.full_user_name} Dleted   ${this.rowInfo.directory_name} Directory`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>