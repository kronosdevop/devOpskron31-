<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="depertmentchange"
      @update:model-value="$emit('update:depertmentchange', $event)"
      persistent
      max-width="600"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Change Group</div></v-toolbar-title
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
                <v-select
                  density="compact"
                  v-model="depertmentlist"
                  label="Group"
                  :items="depertmentitems"
                  class="ml-2"
                  item-title="title"
                  item-value="Value"
                  :rules="[(v) => !!v || 'Group is required']"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>

              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="reasonchange"
                  label="Reason for changing the Group"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Reason is required']"
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
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
var axios = require("axios");
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  props: {
    depertmentchange: Boolean,
    rowInfo: Object,
  },
  mixins: [
    get_Org_details,
    get_department_details,
    //  update_audit_logs
  ],
  data() {
    return {
      employeelist: "",
      loading: false,
      reasonchange: "",

      depertmentlist: "",
      depertmentitems: [],
    };
  },
  watch: {
    depertmentchange: {
      async handler() {
        if (this.depertmentchange == true) {
          await this.get_department_details();
          await this.get_Org_details();
          this.fetch_details();

          this.employeelist = this.rowInfo.full_user_name;
          // this.depertmentlist = this.rowInfo.department;
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
      this.$emit("clicked", 0);
    },
    fetch_details() {
      this.departmentList.forEach((element) => {
        if (element.department_name != this.rowInfo.department) {
          this.depertmentitems.push({
            title: element.department_name,
            Value: element.department_name,
          });
        }
      });
    },
    async validate_data() {
      try {
    

        // Try form validation first
        if (this.$refs.form) {
          const { valid } = await this.$refs.form.validate();

          if (valid) {
            this.changedep();
            return;
          }
        }

        // Fallback manual validation
        if (!this.depertmentlist) {
          return;
        }
        if (!this.reasonchange) {
          return;
        }

        this.changedep();
      } catch (error) {
        // Fallback to manual validation
        if (!this.depertmentlist || !this.reasonchange) {
          return;
        }
        this.changedep();
      }
    },
    changedep() {
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
          department: this.depertmentlist,
          command: "customInitiatesWorkflows",
          action_type: "CHANGE_DEPARTMENT",
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
        .catch(() => {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        });
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WORKFLOW_ACTION",
        AuditAction: "CHANGE_GROUP",
        AuditMessage: `The Change Group Workflow for ${this.rowInfo.full_user_name} has been initiated by ${data.user.full_user_name}`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>