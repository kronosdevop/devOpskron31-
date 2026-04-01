<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="changeManger"
      @update:model-value="$emit('update:changeManger', $event)"
      persistent
      max-width="600"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Change Reporting Manager
            </div></v-toolbar-title
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
                  class="mr-2"
                  readonly
                  variant="outlined"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  density="compact"
                  v-model="newreportingmanger"
                  label="New Reporting Manager"
                  :items="reportingmangeritems"
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
                  label="Reason for changing of Reporting Manger"
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
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
var axios = require("axios");
export default {
  props: {
    changeManger: Boolean,
    rowInfo: Object,
  },
  mixins: [
    get_Org_details,
    get_all_org_users,
    // update_audit_logs
  ],
  data() {
    return {
      employeelist: "",
      loading: false,
      reasonchange: "",
      search: "",
      newreportingmanger: "",
      reportingmangeritems: [],
    };
  },
  watch: {
    changeManger: {
      async handler() {
        if (this.changeManger == true) {
          this.$store.commit("Setnamesearch", this.search);
          this.reportingmangeritems = [];
          await this.get_all_org_users();
          await this.get_Org_details();
          this.fetch_details();
          this.employeelist = this.rowInfo.full_user_name;
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

    fetch_details() {
      this.reportingmangeritems = [];
      this.orgUsers.forEach((element) => {
        if (
          element.user_type != "CHATBOT" &&
          element.user_status != "DEACTIVE"
        ) {
          if (element.full_user_name != this.rowInfo.reporting_manager) {
            if (element.user_id != this.rowInfo.user_id) {
              this.reportingmangeritems.push({
                title: element.full_user_name,
                Value: element.user_id,
              });
            }
            // this.newreportingmanger = element.user_id;
          }
        }
      });
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.change_reporting();
      }
    },
    change_reporting() {
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
          user_email_id: this.rowInfo.user_email_id,
          reporting_manager_id: this.newreportingmanger,
          command: "customInitiatesWorkflows",
          action_type: "CHANGE_REPORTING_MANAGER",
          comments: this.reasonchange,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.$emit("successMsg", res.data.Message);
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
            // this.fetch_audit_message();
            this.loading = false;
          } else {
            this.$emit("errorMsg", res.data.Message);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        });
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WORKFLOW_ACTION",
        AuditAction: "CHANGE_REPORTING_MANAGER",
        AuditMessage: `The Change Reporting Manager Workflow for ${this.rowInfo.full_user_name} has been initiated by ${data.user.full_user_name}`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>