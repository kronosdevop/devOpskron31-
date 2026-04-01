<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="deleteadmins" @update:model-value="$emit('update:deleteadmins', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Delete Admins</div></v-toolbar-title
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
            <b> {{ adminitems.user_email_id }}</b> ?
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
import { add_and_list_appadmins } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  props: {
    deleteadmins: Boolean,
    adminitems: Object,
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
      try {
        let result = await API.graphql(
          graphqlOperation(add_and_list_appadmins, {
            input: {
              action_type: "REMOVE",
              user_email_id: this.adminitems.user_email_id,
              app_id: this.rowInfo.admin_dashboard_id,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.add_and_list_appadmins);
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
      var datas = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WEB_ACTION",
        AuditAction: "ADD_APP_ADMIN",
        AuditMessage: ` ${datas.user.full_user_name} removed ${this.adminitems.user_email_id} as  Admin  of ${this.rowInfo.dashboard_name} App  `,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>