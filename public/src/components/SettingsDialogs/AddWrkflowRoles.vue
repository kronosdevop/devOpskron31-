<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="addWrkflowRole" @update:model-value="$emit('update:addWrkflowRole', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
            Add Roles
          </div></v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-select
                  dense
                  v-model="selectTeam"
                  label="Select User"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                  item-text="username"
                  item-value="userId"
                  :items="userArray"
                ></v-select>
              </v-col>
            </v-row>
            <v-row no-gutters class="">
              <v-col cols="12">
                <v-text-field
                  :rules="[(v) => !!v || 'required ']"
                  dense
                  outlined
                  label="Role"
                  v-model="userRole"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss"
            >Confirm</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

import { create_workflow_roles } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    addWrkflowRole: Boolean,
    userArray: Array,
    allUsers: Array,
  },
  data() {
    return {
      selectTeam: "",
      loading: false,
      userRole: "",
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.selectTeam = "";
      this.userRole = "";
    },
    validate_data() {
      if (this.$refs.form.validate()) {
        this.grant_role_access();
      }
    },
    async grant_role_access() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_workflow_roles, {
            input: {
              workflow_role_name: this.userRole,
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              user_id: this.selectTeam,
              admin_user_email_id: this.get_email(this.selectTeam),
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.create_workflow_roles);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    get_email(val) {
      var email = "";
      this.allUsers.forEach((element) => {
        if (element.user_id == val) {
          email = element.user_email_id;
        }
      });
      return email;
    },
  },
};
</script>