<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="verficationAsset"
      @update:model-value="verficationAsset = $event"
      persistent
      max-width="410"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Asset Verification</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">
            Would you like to verify the assets on the
            <b>{{ categoriesItem.category_name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="handover_mutations()"
            dark
            class="text-capitalize cardCss button-corner text-white"
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
import { handover_asset } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

// import { update_audit_logs } from "@/mixins/AuditLogActions.
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  props: {
    verficationAsset: Boolean,
    categoriesItem: Object,
  },
  // mixins: [ update_audit_logs],
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    verficationAsset: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async handover_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(handover_asset, {
            input: {
              organization_id: data.organization.organization_id,
              current_user_email: data.user.user_email_id,
              asset_id: this.categoriesItem.asset_id,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.handover_asset);
        this.loading = false;
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
        AuditType: "ASSET_ACTION",
        AuditAction: "ASSET_HANDOVER",
        AuditMessage: `${data.user.full_user_name} initiated Asset Handover Workflow`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>