<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="adminAccess"
      @update:model-value="$emit('update:adminAccess', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Grant Access</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="selectTeam"
                  label="Select User"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                  item-title="username"
                  item-value="userId"
                  :items="userArray"
                  :search-input.sync="searchF"
                  hide-no-data
                  hide-selected
                  return-object
                >
                </v-autocomplete>
                <!-- <v-select
                  dense
                  v-model="selectTeam"
                  label="Select User"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                  item-text="username"
                  item-value="userId"
                  :items="userArray"
                ></v-select> -->
              </v-col>
            </v-row>
            <!-- <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-select
                  dense
                  v-model="selectTeam"
                  label="Select Type"
                  outlined
                  :items="['Organization Admin', 'Workflow Admin']"
                ></v-select>
              </v-col>
            </v-row> -->
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Confirm</v-btn
          >
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
  props: {
    adminAccess: Boolean,
    userArray: Array,
  },
  // mixins: [update_audit_logs],
  data() {
    return {
      selectTeam: "",
      loading: false,
      searchF: null,
    };
  },
  watch: {
    adminAccess: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.selectTeam = "";
      this.$refs.form.resetValidation();
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
     
      if (valid) {
        this.grant_admin_access();
      }
    },
    async grant_admin_access() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(add_or_remove_admin, {
            user_id: this.selectTeam.userId,
            user_type: "ADMIN",
          })
        );
        this.loading = false;

        // var response = JSON.parse(result.data.create_locations);
        // this.loading = false;
        // if (response.Status == "SUCCESS") {
        this.$emit("successMsg", "Granted Admin Access Successfully");
        // this.fetch_audit_message();
        this.selectTeam = "";
        this.$refs.form.resetValidation();

        //   this.$refs.form.reset();
        // } else {
        //   this.$emit("errorMsg", response.Message);
        // }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    async fetch_audit_message() {
      var datas = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WEB_ACTION",
        AuditAction: "ADD_ADMIN",
        AuditMessage: ` ${datas.user.full_user_name} added ${this.selectTeam.username} as Solution's Admin  `,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>