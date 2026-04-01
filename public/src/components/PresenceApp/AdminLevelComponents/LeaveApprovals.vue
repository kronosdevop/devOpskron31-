<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card flat max-width="600">
      <v-list>
        <v-list-item>
          <v-row no-gutters>
            <v-col cols="6">
              <v-list-item-title class="green-text">
                <v-icon color="green" dark> mdi-cog </v-icon>
                Start
              </v-list-item-title>
            </v-col>
            <v-list-item-action>
              <v-col cols="6">
                <v-btn
                  size="small"
                  :disabled="addedRecords.length > 0"
                  class="text-white mt-n2"
                  @click="add_dialog()"
                  color="green"
                >
                  <v-icon size="small" color="white"> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-list-item-action>
          </v-row>
        </v-list-item>

        <v-list-item-group v-if="addedRecords.length != 0">
          <v-list-item v-for="(item, index) in addedRecords" :key="item.name">
            <v-row no-gutters>
              <v-col cols="6">
                <v-list-item-title class="">
                  <v-icon color="blue" dark> mdi-cog </v-icon>
                  {{ item.name }}
                </v-list-item-title>
              </v-col>
              <v-list-item-action>
                <v-col cols="6">
                  <v-btn
                    size="small"
                    class="text-white mt-n4"
                    @click="add_row(index)"
                    color="primary"
                  >
                    <v-icon size="small" color="white"> mdi-plus </v-icon>
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn
                    size="small"
                    class="text-white mt-n4 ml-1"
                    @click="delete_record(index)"
                    color="red"
                  >
                    <v-icon size="small" color="white"> mdi-delete </v-icon>
                  </v-btn>
                </v-col>
              </v-list-item-action>
            </v-row>
          </v-list-item>
        </v-list-item-group>
        <v-list-item>
          <v-list-item-title class="red-text">
            <v-icon color="red" dark> mdi-cog </v-icon>
            Stop
          </v-list-item-title>
        </v-list-item>
      </v-list>
      <span class=""
        >Notification (You will be notified by email and by app
        notification)</span
      >
      <v-card-text>
        <v-autocomplete
          v-model="selectTeam"
          label="Select User"
          density="compact"
          variant="outlined"
          item-text="title"
          item-value="user_id"
          :items="userArray"
          :search-input.sync="searchF"
          hide-no-data
          hide-selected
          placeholder="Min 3 Character"
          multiple
          class="ml-n4"
        />
        <v-checkbox
          color="primary"
          class="mt-n4 ml-n6 font-weight-medium"
          v-model="groupheadNotification"
          label="Group Head will be notified by email and by app
              notification"
        />
      </v-card-text>
      <v-card-actions class="justify-start">
        <v-btn
          depressed
          :loading="loading"
          @click="save_expense_head()"
          height="35"
          class="cardCss text-capitalize button-corner text-white"
        >
          save
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="addData"
      transition="dialog-bottom-transition"
      persistent
      max-width="500"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title>
            <div class="custom-title">Configure Steps</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-radio-group v-model="stepType" column color="blue">
            <v-radio
              label="Initiator's - Reporting Manager"
              value="repotingManager"
            />
            <v-radio label="Team Member" value="member_team" />
          </v-radio-group>
          <div v-if="stepType === 'member_team'" class="mt-4">
            <v-select
              v-model="teamMemberSelected"
              :items="userList"
              item-text="title"
              item-value="user_id"
              label="Select Team Member"
              density="compact"
              variant="outlined"
              return-object
            />
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn size="small" @click="add_items()" class="text-white cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */

import { edit_get_leave_approvals } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

import SnackBar from "@/components/SnackBar.vue";
export default {
  mixins: [
    get_all_org_users,
    // update_audit_logs
  ],
  components: {
    SnackBar,
  },
  data() {
    return {
      addData: false,
      stepType: null,
      rolesRM: false,
      loading: false,
      initiaorRM: null,
      initiaorCheck: null,
      teamMember: null,
      teamMemberSelected: "",
      selectTeam: [],
      userArray: [],
      searchF: "",
      SnackBarComponent: {},
      selectedData: [],
      flowSteps: [
        { selected: false, text: "Initiator" },
        { selected: false, text: "Initiator's Reporting Manager" },
        { selected: false, text: "Roles" },
      ],
      finalArray: [],
      addedRecords: [],
      listSelected: [],
      roleSelected: "",
      itemSelIndex: 0,
      userList: [],
      workflowList: [],
      formObject: {},
      inputRecords: [],
      tableData: [],
      templete: [],
      workflowTemplate: [],
      search: "",
      groupheadNotification: false,
      dialogSteps: [
        {
          label: "Initiator's Reporting Manager",
          value: "repotingManager",
          model: "initiaorRM",
        },
        { label: "Team Member", value: "member_team", model: "teamMember" },
      ],
    };
  },
  async created() {
    this.$store.commit("Setnamesearch", this.search);
    await this.get_all_org_users();
    await this.fetch_users();
    await this.get_initiated_expense();
  },
  watch: {
    addData: {
      async handler() {
        // await this.get_all_org_users();
      },
    },
    teamMemberSelected(newVal) {},
  },
  methods: {
    async save_expense_head() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_get_leave_approvals, {
            input: {
              is_group_noftication_enabled: this.groupheadNotification,
              notifications: this.selectTeam,
              action_type: "CREATE",
              organization_id: data.organization.organization_id,
              workflow_approval_steps: JSON.stringify(this.addedRecords),
            },
          })
        );

        var response = JSON.parse(result.data.edit_get_leave_approvals);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.get_initiated_expense();
          // this.fetch_audit_message();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };

        this.loading = false;
      }
    },
    fetch_users() {
      this.userList = [];

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userList.push({
            title: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            title: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
      this.userList.sort((a, b) => a.title.localeCompare(b.title));
    },

    delete_record(val) {
      this.addedRecords.splice(val, 1);
      this.stepType = null;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
    },

    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
      this.inputRecords = [];
    },

    add_row(value) {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.itemSelIndex = value;
      this.addData = true;
    },

    add_dialog() {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.addData = true;
    },

    add_items() {
      if (!this.stepType) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please select a step type",
          timeout: 5000,
          Top: true,
        };
        return;
      }
      if (this.stepType === "member_team" && !this.teamMemberSelected) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please select a team member",
          timeout: 5000,
          Top: true,
        };
        return;
      }

      let newStep;
      if (this.stepType === "repotingManager") {
        newStep = {
          step_no: this.addedRecords.length + 1,
          name: "Initiator's Reporting Manager",
          user_type: "initiator_reporting_manager",
          workflow_template: this.workflowTemplate,
        };
      } else if (this.stepType === "member_team") {
        if (!this.teamMemberSelected || !this.teamMemberSelected.user_id) {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Selected team member has no user_id!",
            timeout: 5000,
            Top: true,
          };
          return;
        }
        newStep = {
          step_no: this.addedRecords.length + 1,
          name: this.teamMemberSelected.title,
          user_id: this.teamMemberSelected.user_id,
          user_type: "team_member",
          workflow_template: this.workflowTemplate,
        };
      }

      this.addedRecords.push(newStep);
      this.addData = false;
      this.stepType = null;
      this.teamMemberSelected = null;
    },

    get_input(index) {
      var count = 0;
      var data = [];
      this.inputRecords = [];
      if (index == 0 && index != undefined) {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator's Reporting Manager",
          // user_id: undefined,
          user_type: "initiator_reporting_manager",
          workflow_template: this.workflowTemplate,
          // workflow_template: this.workflowTemplate,
          // name: "Initiator Reporting Manager",
          // value: "initiator_reporting_manager",
          // key: "initiator_reporting_manager",
          // formDetails: this.workflowTemplate,
        });
        this.initiaorRM = "repotingManager";
        this.initiaorCheck = null;
        this.rolesRM = false;
        this.teamMember = null;
      } else if (index == 1 && index != undefined) {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: this.teamMemberSelected.full_user_name,
          user_id: this.teamMemberSelected.user_id,
          user_type: "team_member",
          workflow_template: this.workflowTemplate,
        });
        this.teamMember = "member_team";
        this.initiaorCheck = null;
        this.initiaorRM = null;
        this.rolesRM = false;
      }

      this.finalArray = this.inputRecords;
    },

    async get_initiated_expense() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_get_leave_approvals, {
            input: {
              action_type: "GET",

              // workflow_approval_steps:
              // user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
            },
          })
        );

        var response = JSON.parse(result.data.edit_get_leave_approvals);

        if (response.Status == "SUCCESS") {
          this.groupheadNotification =
            response.data.is_group_noftication_enabled == undefined
              ? false
              : (this.groupheadNotification =
                  response.data.is_group_noftication_enabled);
          this.selectTeam =
            response.data.notifications == undefined
              ? []
              : response.data.notifications;
          this.workflowTemplate = response.data.workflow_template;
          this.tableData = response.data;
          this.addedRecords = this.tableData.workflow_approval_steps;
          // console.log( this.addedRecords);
          if (this.addedRecords.length > 0) {
            for (let s = 0; s < this.addedRecords.length; s++) {
              let name = this.orgUsers.filter(
                (x) => x.user_id == this.addedRecords[s].user_id
              );

              this.addedRecords[s].name =
                name.length > 0
                  ? name[0].full_user_name
                  : "Initiator's Reporting Manager";
            }
          }
        } else {
          this.tableData = [];
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
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "PREZENCE",
        AuditAction: "PREZENCE_LEAVE_APPROVAL",
        AuditMessage: `${data.user.full_user_name} Updated Presence Leave Approval`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>

<style>
</style>