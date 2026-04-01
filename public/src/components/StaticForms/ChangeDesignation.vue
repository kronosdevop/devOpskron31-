<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="designationChange"
      @update:model-value="$emit('update:designationChange', $event)"
      persistent
      max-width="600"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Change Designation</div></v-toolbar-title
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
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <!-- <v-text-field
                  dense
                  v-model="DesignationList"
                  label="Designation"
                  class="ml-2"
                  :rules="[(v) => !!v || 'required ']"
                  outlined
                ></v-text-field> -->
                <v-select
                  density="compact"
                  v-model="DesignationList"
                  label="Designation"
                  :items="Designationitems"
                  class="ml-2"
                  item-title="title"
                  item-value="Value"
                  :rules="[(v) => !!v || 'Designation is required']"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="reasonchange"
                  label="Reason for changing the Designation"
                  :rules="[(v) => !!v || 'Reason is required']"
                  variant="outlined"
                  required
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
import { get_designations_details } from "@/mixins/GetDesignations.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
var axios = require("axios");
export default {
  props: {
    designationChange: Boolean,
    rowInfo: Object,
  },
  mixins: [
    get_designations_details,
    get_Org_details,
    // update_audit_logs
  ],
  data() {
    return {
      employeelist: "",
      loading: false,
      reasonchange: "",

      DesignationList: "",
      Designationitems: [],
    };
  },
  watch: {
    designationChange: {
      async handler() {
        if (this.designationChange == true) {
          await this.get_designations_details();
          await this.get_Org_details();

          this.fetch_details();
          this.employeelist = this.rowInfo.full_user_name;
          // console.log(this.employeelist);
          // this.DesignationList = this.rowInfo.designation;
        }
      },
      immediate: true,
    },
  },
  mounted() {

  },
  methods: {
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.DesignationList = "";
      this.reasonchange = "";
      this.employeelist = "";
      this.$emit("clicked", 0);
    },
    fetch_details() {
      // Clear the array first to prevent duplicates
      this.Designationitems = [];
      const seenDesignationIds = new Set();
      this.designationList.forEach((element) => {
        if (
          element.designation_id != this.rowInfo.designation &&
          !seenDesignationIds.has(element.designation_id)
        ) {
          seenDesignationIds.add(element.designation_id);
          this.Designationitems.push({
            title: element.designation_name,
            Value: element.designation_id,
          });
        }
      });
    },
    async validate_data() {
      try {
        if (this.$refs.form) {
          const { valid } = await this.$refs.form.validate();
          if (valid) {
            this.change_desgination();
            return;
          }
        }
        if (!this.DesignationList) {
          return;
        }
        if (!this.reasonchange) {
          return;
        }

        this.change_desgination();
      } catch (error) {
        console.error("Validation error:", error);
        if (!this.DesignationList || !this.reasonchange) {
          return;
        }
        this.change_desgination();
      }
    },
    change_desgination() {
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
          designation: this.DesignationList,
          command: "customInitiatesWorkflows",
          action_type: "CHANGE_DESIGNATION",
          user_email_id: this.rowInfo.user_email_id,
          comments: this.reasonchange,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.$emit("successMsg", res.data.Message);
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
            this.DesignationList = "";
            this.reasonchange = "";
            this.employeelist = "";
            // this.fetch_audit_message();
            this.loading = false;
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
        AuditAction: "CHANGE_DESIGNATION",
        AuditMessage: `The Change Designation Workflow for ${this.rowInfo.full_user_name} has been initiated by ${data.user.full_user_name}`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>