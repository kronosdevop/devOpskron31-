<template>
  <div>
    <v-card class="mt-n4" flat :height="CommonVuetifyObj.height - 130">
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-card>
              <v-card-text>
                <label
                  >Would you like to use the duration from Attendance Management
                  ?</label
                >
                <v-radio-group v-model="prezenceEnable" inline color="primary">
                  <v-radio label="Yes" value="true"></v-radio>
                  <v-radio label="No" value="false"></v-radio>
                </v-radio-group>
                <label>Time Sheet Approval Required ?</label>
                <v-radio-group
                  v-model="approvalEnable"
                  inline
                  color="primary"
                  class="mt-4"
                >
                  <v-radio label="Yes" value="true"></v-radio>
                  <v-radio label="No" value="false"></v-radio>
                </v-radio-group>
                <label
                  >Do you need to set the granularity of the timesheet to one
                  day?
                </label>
                <v-radio-group
                  v-model="dailyfillEnable"
                  inline
                  color="primary"
                  class="mt-4"
                >
                  <v-radio label="Yes" value="true"></v-radio>
                  <v-radio label="No" value="false"></v-radio>
                </v-radio-group>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn
                  @click="validate_user()"
                  :loading="loading"
                  height="40"
                  class="text-capitalize cardCss button-corner"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import { edit_timesheet_manegement_settings } from "@/graphql/mutations.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
  },
  mixins: [get_Org_details],
  data() {
    return {
      height: 0,
      prezenceEnable: null,
      approvalEnable: null,
      dailyfillEnable: null,
      loading: false,
      SnackBarComponent: {},
      CommonVuetifyObj: {},
    };
  },
  created() {
    this.prezenceEnable =
      this.$store.getters.GetOrgDetails.organization.is_attendance_management ==
        undefined ||
      this.$store.getters.GetOrgDetails.organization.is_attendance_management ==
        false
        ? "false"
        : "true";
    this.approvalEnable =
      this.$store.getters.GetOrgDetails.organization
        .timesheet_approval_required == undefined ||
      this.$store.getters.GetOrgDetails.organization
        .timesheet_approval_required == false
        ? "false"
        : "true";
    this.dailyfillEnable =
      this.$store.getters.GetOrgDetails.organization
        .is_daily_timesheet_required == undefined ||
      this.$store.getters.GetOrgDetails.organization
        .is_daily_timesheet_required == true
        ? "true"
        : "false";
  },
  mounted() {
    this.CommonVuetifyObj = useDisplay();
  },
  methods: {
    async validate_user() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_timesheet_manegement_settings, {
            input: {
              organization_id: data.organization.organization_id,
              is_attendance_management:
                this.prezenceEnable == "true" ? true : false,
              timesheet_approval_required:
                this.approvalEnable == "true" ? true : false,
              is_daily_timesheet_required:
                this.dailyfillEnable == "true" ? true : false,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(
          result.data.edit_timesheet_manegement_settings
        );
        if (response.Status == "SUCCESS") {
          await this.get_Org_details();
          this.prezenceEnable =
            this.$store.getters.GetOrgDetails.organization
              .is_attendance_management == undefined ||
            this.$store.getters.GetOrgDetails.organization
              .is_attendance_management == false
              ? "false"
              : "true";
          this.approvalEnable =
            this.$store.getters.GetOrgDetails.organization
              .timesheet_approval_required == undefined ||
            this.$store.getters.GetOrgDetails.organization
              .timesheet_approval_required == false
              ? "false"
              : "true";
          this.dailyfillEnable =
            this.$store.getters.GetOrgDetails.organization
              .is_daily_timesheet_required == undefined ||
            this.$store.getters.GetOrgDetails.organization
              .is_daily_timesheet_required == false
              ? "false"
              : "true";

          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          await this.get_Org_details();
          this.prezenceEnable =
            this.$store.getters.GetOrgDetails.organization
              .is_attendance_management == undefined ||
            this.$store.getters.GetOrgDetails.organization
              .is_attendance_management == false
              ? "false"
              : "true";
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style></style>

