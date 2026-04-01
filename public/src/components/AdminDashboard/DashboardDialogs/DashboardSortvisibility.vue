<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="SortVisibility"
      @update:model-value="$emit('update:SortVisibility', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              App Visibility for {{ rowInfo.dashboard_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <!-- <v-form ref="form">
            <v-text-field
              :value="sort_number[0]"
              @change="$set(sort_number, 0, $event)"
              dense
              outlined
              :rules="number_rules"
              style="max-width: 150px"
              :max="max"
              :min="min"
              label="Sort Weightage"
              :items="servicecharge"
              v-model="sort_number"
              type="number"
              class="mt-5"
            >
            </v-text-field>
            <div class="d-flex justify-start text-left">
              <i>
                Note :Lower the weightage, higher up in the order of the
                sections in the Dashboard page on the mobile app.</i
              >
            </div>
          </v-form> -->
          <!-- <div class="text-left mt-2"> -->
          <!-- <label class="font-weight-bold">App Visibility</label><br /> -->
          <div class="text-left">
            Are you sure you want to
            {{ rowInfo.is_visible == true ? "Disable" : "Enable" }}
            {{ rowInfo.dashboard_name }}
          </div>
          <!-- <v-btn-toggle
              v-model="toggle_exclusive"
              color="grey"
              mandatory
              class="mt-2"
            >
              <v-btn small class="black--text" text value="enabel_dahboard">
                Enabled
              </v-btn>
              <v-btn small class="black--text" text value="disabel_dahboard">
                Disabled
              </v-btn>
            </v-btn-toggle> -->
          <!-- </div> -->
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Yes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
  <script>
/* eslint-disable */
import { edit_or_delete_dashboard_topic } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  props: {
    SortVisibility: Boolean,
    rowInfo: Object,
    access_type: String,
  },
  // mixins: [update_audit_logs],
  data() {
    return {
      max: 999,
      min: 1,
      servicecharge: [],
      sort_number: 1,
      loading: false,
      toggle_exclusive: "",
      number_rules: [(v) => /^[0-9]{1,3}$/.test(v) || " Number must be valid"],
    };
  },
  watch: {
    SortVisibility: {
      async handler() {
        if (this.SortVisibility == true) {
          this.sort_number =
            this.rowInfo.sort_range == undefined ? 1 : this.rowInfo.sort_range;
          this.toggle_exclusive =
            this.rowInfo.is_visible == true
              ? "enabel_dahboard"
              : "disabel_dahboard";
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async validate_data() {
      // if (this.$refs.form.validate()) {
      let app_details = [];
      if (this.rowInfo.dashboard_id) {
        app_details.push({
          dashboard_id: this.rowInfo.dashboard_id,
          is_visible: this.rowInfo.is_visible == true ? false : true,
        });
      }
      if (this.rowInfo.admin_dashboard_id) {
        app_details.push({
          dashboard_id: this.rowInfo.admin_dashboard_id,
          is_visible: this.rowInfo.is_visible
            ? this.rowInfo.is_visible == true
              ? false
              : true
            : this.rowInfo.admin_is_visible == true
            ? false
            : true,
        });
      }

      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_or_delete_dashboard_topic, {
            input: {
              app_details: JSON.stringify(app_details),
              action_type: "EDIT",
              dashboard_id:
                this.access_type == "user"
                  ? this.rowInfo.dashboard_id
                  : this.rowInfo.admin_dashboard_id,
              organization_id: data.organization.organization_id,
              is_visible:
                this.access_type == "user"
                  ? this.rowInfo.is_visible == true
                    ? false
                    : true
                  : this.access_type == "admin"
                  ? this.rowInfo.admin_is_visible == true
                    ? false
                    : true
                  : false,
              // sort_range: parseInt(this.sort_number),
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.edit_or_delete_dashboard_topic);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.fetch_audit_message();
          // this.$refs.form.reset();
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
        AuditAction: "APP_VISIBILTY",
        AuditMessage: ` ${datas.user.full_user_name}   ${
          this.rowInfo.is_visible == true ? "Disabled" : "Enabled"
        } ${this.rowInfo.dashboard_name}  App  `,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
  // },
};
</script>
  
  <style>
</style>