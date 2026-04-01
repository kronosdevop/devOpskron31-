<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="locationChange"
      @update:model-value="$emit('update:locationChange', $event)"
      persistent
      max-width="600"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Change Location</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="6">
                <v-text-field
                  density="compact"
                  v-model="employeelist"
                  label="Employee Name"
                  readonly
                  class="mr-2"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  density="compact"
                  v-model="loaction"
                  label="Location"
                  :items="loactionitems"
                  class="ml-2"
                  item-text="title"
                  item-value="Value"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="reasonchange"
                  label="Comments"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
      <script>
/* eslint-disable */
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { get_location_details } from "@/mixins/GetLocations.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
var axios = require("axios");

export default {
  props: {
    locationChange: Boolean,
    rowInfo: Object,
  },
  mixins: [
    get_location_details,
    get_Org_details,
    // update_audit_logs
  ],
  data() {
    return {
      employeelist: "",

      reasonchange: "",

      loading: false,
      loaction: "",
      loactionitems: [],
    };
  },
  watch: {
    locationChange: {
      async handler() {
        if (this.locationChange == true) {
          await this.get_location_details();
          await this.get_Org_details();
          this.fetch_details();
          this.employeelist = this.rowInfo.full_user_name;
          // this.loaction = this.rowInfo.location;
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.location_change();
      }
    },
    fetch_details() {
      this.locationList.forEach((element) => {
        if (element.location_name != this.rowInfo.location) {
          this.loactionitems.push({
            title: element.location_name,
            Value: element.location_name,
          });
        }
      });
    },
    location_change() {
      this.loading = true;
      axios({
        method: "post",
        maxBodyLength: Infinity,

        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/workflow_respective_initiate",
        headers: {
          "x-api-key": this.orgDetails.organization["x-api-key"],
          "Content-Type": "application/json",
        },
        data: {
          organization_id:
            this.$store.getters.GetUserObj.organization.organization_id,
          current_user_email_id:
            this.$store.getters.GetUserObj.user.user_email_id,
          location: this.loaction,
          user_email_id: this.rowInfo.user_email_id,
          command: "customInitiatesWorkflows",
          action_type: "CHANGE_LOCATION",
          comments: this.reasonchange,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.$emit("successMsg", res.data.Message);
            this.loading = false;
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
            // this.fetch_audit_message();
          } else {
            this.loading = false;
            this.$emit("errorMsg", res.data.Message);
          }
        })
        .catch(() => {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        });
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WORKFLOW_ACTION",
        AuditAction: "CHANGE_LOCATION",
        AuditMessage: `The Change Loaction Workflow for ${this.rowInfo.full_user_name} has been initiated by ${data.user.full_user_name}`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>