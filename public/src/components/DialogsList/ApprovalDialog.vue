<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="approveDialog" @update:model-value="$emit('update:approveDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              Approvals for {{ fetch_form_name(rowInfo.name) }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <div class="text-left">Approval Required</div></v-col
              >
              <v-col cols="12">
                <v-radio-group class="" v-model="approvalAction" inline>
                  <v-radio label="Yes" value="yes"></v-radio>
                  <v-radio label="No" value="no"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col v-if="approvalAction == 'yes'" cols="12">
                <v-select
                  density="compact"
                  variant="outlined"
                  label="Select Whom to Pend On"
                  :items="['Team Member', 'Location Admin', 'Group Admin']"
                  v-model="selectMemberType"
                />
              </v-col>
              <v-col
                v-if="
                  approvalAction == 'yes' && selectMemberType == 'Team Member'
                "
                cols="12"
              >
                <v-autocomplete
                  :rules="
                    approvalAction == 'yes' && selectMemberType == 'Team Member'
                      ? [(v) => !!v || 'required ']
                      : []
                  "
                  label="Select Member"
                  v-model="selectedMember"
                  :items="userList"
                  :search-input.sync="search"
                  @input="search = ''"
                  item-title="label"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                ></v-autocomplete>
              </v-col>
              <!-- <v-col
                v-if="
                  approvalAction == 'yes' &&
                  selectMemberType == 'Location Admin'
                "
                cols="12"
              >
                <v-autocomplete
                  :rules="
                    approvalAction == 'yes' &&
                    selectMemberType == 'Location Admin'
                      ? [(v) => !!v || 'required ']
                      : []
                  "
                  label="Select "
                  v-model="selectLocAdmin"
                  :items="locationData"
                  item-text="label"
                  item-value="value"
                    :search-input.sync="search"
                  @input="search = ''"
                  density="compact"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                ></v-autocomplete>
              </v-col>
              <v-col
                v-if="
                  approvalAction == 'yes' &&
                  selectMemberType == 'Group Admin'
                "
                cols="12"
              >
                <v-autocomplete
                  :rules="
                    approvalAction == 'yes' &&
                    selectMemberType == 'Group Admin'
                      ? [(v) => !!v || 'required ']
                      : []
                  "
                  label="Select "
                  v-model="selectDepartmentAdmin"
                  :items="departList"
                  item-title="label"
                    :search-input.sync="search"
                  @input="search = ''"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                ></v-autocomplete>
              </v-col> -->
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="validate_data()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { edit_organization } from "@/graphql/mutations.js";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  mixins: [
    get_all_org_users,
    get_department_details,
    get_location_details,
    // update_audit_logs,
  ],
  props: {
    approveDialog: Boolean,
    rowInfo: Object,
    tableArray: Array,
  },
  watch: {
    approveDialog: {
      async handler() {
        if (this.approveDialog == true) {
          this.selectedMember = "";

          this.approvalAction = this.rowInfo.is_approval == true ? "yes" : "no";
          this.selectMemberType =
            this.rowInfo.is_approval == true
              ? this.fetch_type(this.rowInfo.approvers_list[0].user_email_id)
              : "";
          // this.selectedMember =
          //   this.rowInfo.is_approval == true
          //     ? this.rowInfo.approvers_list[0].user_email_id
          //     : "";
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          // await this.get_location_details();
          // await this.get_department_details();
          this.fetch_users();
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      approvalAction: "yes",
      selectedMember: "",
      loading: false,
      userList: [],
      search: "",
      selectMemberType: "",
      departList: [],
      selectDepartmentAdmin: "",
      selectLocAdmin: "",
      locationData: [],
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_form_name(val) {
      var data = "";
      switch (val) {
        case "ADD_MEMBER":
          data = "Add Member";
          break;
        case "REMOVE_MEMBER":
          data = "Remove Member";
          break;
        case "CHANGE_DESIGNATION":
          data = "Change Designation";
          break;
        case "CHANGE_DEPARTMENT":
          data = "Change Group";
          break;
        case "CHANGE_LOCATION":
          data = "Change Location";
          break;
        case "EDIT_MEMBER":
          data = "Update Profile Details";
          break;
        case "CHANGE_REPORTING_MANAGER":
          data = "Change Reporting Manager";
          break;
        case "UPDATE_PROFILE_PIC":
          data = "Update Profile Picture";
          break;
        case "BROADCAST_MESSAGE":
          data = "Broadcast Message";
          break;
        case "DATA_CORRECTION":
          data = "Data Correction";
          break;
        case "SUPPLIER_CREATION_REQUEST":
          data = "Supplier/Vendors Creation Request";
          break;
        default:
          data = val;
      }

      return data;
    },
    fetch_type(value) {
      var type = "";
      if (value == "LOCATION_HEAD") {
        type = "Location Admin";
      } else if (value == "DEPARTMENT_HEAD") {
        type = "Group Admin";
      } else {
        type = "Team Member";
        this.selectedMember = value;
      }
      return type;
    },

    fetch_users() {
      this.userList = [];

      this.locationData = [];
      this.departList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userList.push({
            label: element.full_user_name,
            value: element.user_email_id,
          });
        }
      });
      this.userList.sort((a, b) => a.label.localeCompare(b.label));
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        await this.approval_actions();
      }
    },
    async approval_actions() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              member_management_settings: await this.fecth_updated_list(),
            },
          })
        );
        var response = JSON.parse(result.data.edit_organization);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", "Updated Successfully");
          // this.fetch_audit_message();
          this.loading = false;
        } else {
          this.$emit("errorMsg", response.Message);
          this.loading = false;
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
        AuditAction: "WORKFLOW_APPROVAL",
        AuditMessage: ` ${
          datas.user.full_user_name
        } Updated  ${this.fetch_form_name(this.rowInfo.name)}  Approval `,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
    fecth_updated_list() {
      var data = [];

      this.tableArray.forEach((element) => {
        if (element.name == this.rowInfo.name) {
          if (
            this.approvalAction == "yes" &&
            element.approvers_list.length != 0
          ) {
            element.approvers_list[0].user_email_id = this.get_member_methods();
            element.is_approval = true;
          } else if (
            this.approvalAction == "yes" &&
            element.approvers_list.length == 0
          ) {
            element.approvers_list = [
              { step_no: 1, user_email_id: this.get_member_methods() },
            ];
            element.is_approval = true;
          } else {
            element.approvers_list = [];
            element.is_approval = false;
          }
        }
      });
      return JSON.stringify(this.tableArray);
    },
    get_member_methods() {
      var data = "";

      if (this.selectMemberType == "Team Member") {
        data = this.selectedMember;
      } else if (this.selectMemberType == "Location Admin") {
        data = "LOCATION_HEAD";
      } else if (this.selectMemberType == "Group Admin") {
        data = "DEPARTMENT_HEAD";
      }

      return data;
    },
  },
};
</script>