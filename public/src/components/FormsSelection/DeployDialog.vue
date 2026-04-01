<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="deployFormDialog" @update:model-value="$emit('update:deployFormDialog', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >  <div class="custom-title">
            Deploy Form
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to deploy
            <b> {{ formDetails.form_name }}</b> form to your organization ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="deploay_form_action()"
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
import { forms_deploy_for_organization } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    deployFormDialog: Boolean,
    formDetails: Object,
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

    async deploay_form_action() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(forms_deploy_for_organization, {
            input: {
              form_id: this.formDetails.form_id,
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.forms_deploy_for_organization);
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
  },
};
</script>