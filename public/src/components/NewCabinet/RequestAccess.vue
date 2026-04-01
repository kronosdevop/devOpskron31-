<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="requestAccessDialog"
      @update:model-value="$emit('update:requestAccessDialog', $event)"
      persistent
      max-width="450"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Request Access</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">
            Initiate a workflow to request access to this cabinet folder
            <b> {{ rowInfo.Key }}</b> .
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            size="small"
            :loading="loading"
            @click="request_access()"
            dark
            class="cardCss mr-2"
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
import { request_folder_access } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { update_audit_logs } from "@/mixins/AuditLogActions.js";

export default {
  props: {
    requestAccessDialog: Boolean,
    rowInfo: Object,
  },
  mixins: [update_audit_logs],
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async request_access() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(request_folder_access, {
            input: {
              folder_id: this.rowInfo.folder_id,
              organization_id: data.organization.organization_id,
              current_user_email: data.user.user_email_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.request_folder_access);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>