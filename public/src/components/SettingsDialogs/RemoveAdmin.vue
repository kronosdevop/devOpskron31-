<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="deleteAdmin" @update:model-value="$emit('update:deleteAdmin', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Delete Admin Access</div></v-toolbar-title
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
            Are you sure you want to delete admin access for
            <b> {{ rowInfo.full_user_name }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="cardCss button-corner text-capitalize"
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
import { add_or_remove_admin } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  // mixins: [update_audit_logs],
  props: {
    deleteAdmin: Boolean,
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
          graphqlOperation(add_or_remove_admin, {
            user_id: this.rowInfo.user_id,
            user_type: "MEMBER",
          })
        );
        this.loading = false;

        this.$emit("successMsg", "Admin Access Removed Successfully");
        // this.fetch_audit_message();
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async fetch_audit_message() {
      var datas = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WEB_ACTION",
        AuditAction: "REMOVE_ADMIN",
        AuditMessage: ` ${datas.user.full_user_name} removed ${this.rowInfo.full_user_name} Solution's admin access `,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>