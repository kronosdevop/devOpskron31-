<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="displayDialog" @update:model-value="$emit('update:displayDialog', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black"
            >
            <div class="custom-title">  Change Visibility
              </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <!-- <v-select
            dense
            v-model="selectGroup"
            :items="[]"
            label="Select Group"
          /> -->
          <div v-if="rowInfo.info.is_visible == true" class="text-left">
            Are you sure you want to
            {{ rowInfo.info.dashboard_name }} disable ?
          </div>
          <div v-if="rowInfo.info.is_visible == false" class="text-left">
            Are you sure you want to
            {{ rowInfo.info.dashboard_name }} enable ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="save_data()"
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
import { edit_or_delete_dashboard_topic } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_department_details } from "@/mixins/GetDepartments.js";

export default {
  props: {
    rowInfo: Object,
    displayDialog: Boolean,
    teamInfo: Object,
  },
  mixins: [get_department_details],
  data() {
    return {
      loading: false,
      selectOptions: null,
      selectGroup: "",
    };
  },
  watch: {
    displayDialog: {
      async handler() {
        if (this.displayDialog == true) {
        }
        // this.get_department_details();
      },
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clciked", 0);
    },
    async save_data() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_or_delete_dashboard_topic, {
            input: {
              action_type: "EDIT",
              dashboard_id: this.rowInfo.info.dashboard_id,
              organization_id: data.organization.organization_id,
              is_visible: this.rowInfo.info.is_visible == true ? false : true,
              user_email_id: data.user.user_email_id,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.edit_or_delete_dashboard_topic);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    // fecth_data() {
    //   var teamArray = [];
    //   teamArray = this.tableData;

    //   teamArray.forEach((element) => {
    //     if (element.dashboard_name == this.rowInfo.info.dashboard_name) {
    //       element.is_display =
    //         this.rowInfo.displaytype == "Visible" ? false : true;
    //     }
    //   });

    //   return teamArray;
    // },
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