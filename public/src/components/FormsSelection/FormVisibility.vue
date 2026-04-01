<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="formVisibilityPopup" @update:model-value="$emit('update:formVisibilityPopup', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--white"
            >  <div class="custom-title">
            Change Visibility
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div v-if="rowInfo.RowValue.is_visbile == true" class="text-left">
            Are you sure you want to disable
            {{ rowInfo.RowValue.form_name }} ?
          </div>
          <div v-if="rowInfo.RowValue.is_visbile == false" class="text-left">
            Are you sure you want to enable
            {{ rowInfo.RowValue.form_name }} ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_form()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
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
import {
  forms_deploy_for_organization,
  enable_forms,
} from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    rowInfo: Object,
    formVisibilityPopup: Boolean,
  },
  data() {
    return {
      loading: false,
    };
  },

  methods: {
    close_dialog() {
      this.$emit("clciked", 0);
    },
    async validate_form() {
      if (
        this.rowInfo.RowValue.is_visbile == true ||
        this.rowInfo.RowValue.is_visbile == false
      ) {
        this.disbale_form();
      } else if (this.rowInfo.RowValue.is_deployed == false) {
        this.deploay_form_action();
      }
    },
    async disbale_form() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(enable_forms, {
            input: {
              form_id: this.rowInfo.RowValue.master_form_id,
              is_visbile:
                this.rowInfo.RowValue.is_visbile == true ? false : true,
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.enable_forms);

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

    async deploay_form_action() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(forms_deploy_for_organization, {
            input: {
              form_id: this.rowInfo.master_form_id,
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.forms_deploy_for_organization);
        if (response.Status == "SUCCESS") {
          await this.enable_form();
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async enable_form() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(enable_forms, {
            input: {
              form_id: this.rowInfo.RowValue.form_id,
              is_visbile: true,
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.enable_forms);

        if (response.Status == "SUCCESS") {
        } else {
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    fecth_data() {
      var teamArray = [];
      teamArray = this.tableData;

      teamArray.forEach((element) => {
        if (element.dashboard_name == this.rowInfo.info.dashboard_name) {
          element.is_display =
            this.rowInfo.displaytype == "Visible" ? false : true;
        }
      });

      return teamArray;
    },
    // fetch_user_changes() {
    //   var response = [];
    //   response = this.OrgInfo.organization.dashboard_visibilty.user_dashboard;
    //   response.forEach((element) => {
    //     if (element.key == this.rowInfo.info.dasboardtype) {
    //       element.is_display =
    //         this.rowInfo.displaytype == "Visible" ? false : true;
    //     }
    //   });

    //   return response;
    // },
    // fetch_admin_changes() {
    //   var response = [];
    //   response = this.OrgInfo.organization.dashboard_visibilty.admin_dashboard;
    //   response.forEach((element) => {
    //     if (element.key == this.rowInfo.info.dasboardtype) {
    //       element.is_display =
    //         this.rowInfo.displaytype == "Visible" ? false : true;
    //     }
    //   });

    //   return response;
    // },
  },
};
</script>