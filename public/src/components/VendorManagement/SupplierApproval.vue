<template>
  <div>
    <v-card class="" flat >
      <v-card-title>Vendor Approval</v-card-title>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12">
            <v-card outlined>
              <v-list>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon color="green" dark> mdi-cog </v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="green-text"
                      >Start
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-row no-gutters>
                      <v-col cols="6">
                        <v-btn
                          small
                          :disabled="addedRecords.length > 0"
                          class="white--text"
                          @click="add_dialog()"
                          color="green"
                        >
                          <v-icon small color="white"> mdi-plus </v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item-group v-if="addedRecords.length != 0">
                  <template v-for="(item, index) in addedRecords" :key="item.name">
        <v-list-item>
                      <v-list-item-avatar>
                        <v-icon color="blue" dark> mdi-cog </v-icon>
                      </v-list-item-avatar>

                      <v-list-item-content>
                        <v-list-item-title class="">{{
                          item.name
                        }}</v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-btn
                              small
                              class="white--text"
                              @click="add_row(index)"
                              color="primary"
                            >
                              <v-icon small color="white"> mdi-plus </v-icon>
                            </v-btn>
                          </v-col>
                          <v-col cols="6">
                            <v-btn
                              small
                              class="white--text ml-1"
                              @click="delete_record(index)"
                              color="red"
                            >
                              <v-icon small color="white"> mdi-delete </v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                      </v-list-item-action>
                    </v-list-item>
                  </template>
                </v-list-item-group>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon color="red" dark> mdi-cog </v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="red-text"
                      >Stop
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-card-actions class="justify-start">
                <v-btn
                  depressed
                  :loading="loadingrec"
                  @click="validate_approvals()"
                  dark
                  class="cardCss text-capitalize button-corner ml-2"
                >
                  save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-dialog :model-value="addData" @update:model-value="$emit('update:addData', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Configure Steps</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-n3">
              <v-col cols="12">
                <v-radio-group
                  @change="fetch_selected_data('initiator')"
                  v-model="initiatorRecord"
                  row
                >
                  <v-radio label="Initiator" value="initiator"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <!-- <v-row no-gutters class="mt-n3">
              <v-col cols="12">
                <v-radio-group
                  @change="fetch_selected_data('reportingmanager')"
                  v-model="initiatorReportingManager"
                  row
                >
                  <v-radio
                    label="Initiator's Reporting Manager"
                    value="reportingmanager"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-row> -->
            <v-row no-gutters class="mt-n3">
              <v-col cols="12">
                <v-radio-group
                  @change="fetch_selected_data('expensehead')"
                  v-model="expenseHead"
                  row
                >
                  <v-radio label="Group Head" value="expenseHeadNew"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-n3">
              <v-col cols="6">
                <v-radio-group v-model="teamMember" row>
                  <v-radio
                    @change="fetch_selected_data('member_team')"
                    label="Team Member"
                    value="member_team"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-if="teamMember == 'member_team'"
                  dense
                  outlined
                  class="mt-3"
                  @input="fetch_selected_data('member_team')"
                  v-model="teamMemberSelected"
                  :rules="[(v) => !!v || 'Required']"
                  :items="userList"
                  item-text="full_user_name"
                  :search-input.sync="search"
                  item-value="user_id"
                  return-object
                  label="Select Member"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn small @click="add_items()" class="white--text cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_vendor_workflows } from "@/graphql/queries.js";
import { update_vendor_workflows } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      addedRecords: [],
      userList: [],
      inputRecords: [],
      finalArray: [],
      loadingrec: false,
      addData: false,
      initiatorRecord: null,
      initiaorCheck: null,
      expenseHead: null,
      initiaorRM: null,
      approvaltemplate: [],
      rolesRM: null,
      initiatorReportingManager: null,
      teamMember: null,
      teamMemberSelected: "",
      search: "",
      SnackBarComponent: {},
      tableData: {},
    };
  },
  async mounted() {
    await this.get_initiated_vendor();
    await this.get_all_org_users();
    await this.fetch_users();
  },
  methods: {
    async get_initiated_vendor() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_vendor_workflows, {})
        );

        let response = JSON.parse(result.data.get_vendor_workflows);

        this.overlay = false;
        this.tableData = {};
        // console.log(response);
        if (response.Status == "SUCCESS") {
          let workfowData = response.data.find(
            (obj) => obj.form_unique_type === "SUPPLIER_CREATION_REQUEST"
          );

          this.tableData = workfowData;
          this.approvaltemplate = this.tableData.workflow_template;
          this.addedRecords = this.tableData.workflow_approval_steps;
        } else {
          this.tableData = {};
          this.overlay = false;
        }
      } catch (error) {
        this.overlay = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    fetch_users() {
      this.userList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      this.userList.sort((a, b) =>
        a.full_user_name.localeCompare(b.full_user_name)
      );
    },
    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.expenseHead = null;
      this.inputRecords = [];
      this.initiatorRecord = null;
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },

    add_row(value) {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.expenseHead = null;
      this.initiatorRecord = null;
      this.itemSelIndex = value;
      this.addData = true;
    },
    add_dialog() {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.expenseHead = null;
      this.addData = true;
    },

    async validate_approvals() {
      this.loadingrec = true;

      try {
        let result = await API.graphql(
          graphqlOperation(update_vendor_workflows, {
            input: {
              workflow_id: this.tableData.workflow_id,
              workflow_approval_steps: JSON.stringify(this.addedRecords),
              notifications: [],
              is_group_noftication_enabled: false,
              workflow_template: JSON.stringify(
                this.tableData.workflow_template
              ),

              // summary_field_1: this.summaryField1,
              // summary_field_2: this.summaryField2,
            },
          })
        );
        var response = JSON.parse(result.data.update_vendor_workflows);
        this.loadingrec = false;
        if (response.Status == "SUCCESS") {
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
        }
      } catch (error) {
        // console.log(error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };

        this.loadingrec = false;
      }
    },
    delete_record(val) {
      this.addedRecords.splice(val, 1);
      this.stepsSelected = [];
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.expenseHead = null;
      this.initiatorRecord = null;
    },

    fetch_selected_data(type) {
      this.inputRecords = [];
      if (type == "reportingmanager") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator's Reporting Manager",
          user_type: "initiator_reporting_manager",
          workflow_template: this.approvaltemplate,
        });
        this.teamMember = null;
        this.expenseHead = null;
        this.initiatorRecord = null;
      } else if (type == "initiator") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initiator",
          workflow_template: this.approvaltemplate,
        });
        this.initiatorReportingManager = null;
        this.teamMember = null;
        this.expenseHead = null;
      } else if (type == "expensehead") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Group Head",
          user_id: "N/A",
          user_type: "expense_group",
          workflow_template: this.approvaltemplate,
        });
        this.initiatorReportingManager = null;
        this.teamMember = null;
        this.initiatorRecord = null;
      } else if (type == "member_team") {
        if (this.teamMemberSelected != "") {
          this.inputRecords.push({
            step_no: this.addedRecords.length + 1,
            name: this.teamMemberSelected.full_user_name,
            user_id: this.teamMemberSelected.user_id,
            user_type: "team_member",
            workflow_template: this.approvaltemplate,
          });

          this.initiatorReportingManager = null;
          this.teamMember = "member_team";
          this.initiaorCheck = null;
          this.initiaorRM = null;
          this.rolesRM = false;
          this.initiatorRecord = null;
          this.expenseHead = null;
        } else {
          this.expenseHead = null;
          this.initiatorReportingManager = null;
          this.initiatorRecord = null;
        }
      }

      this.finalArray = this.inputRecords;
    },
    add_items() {
      let newArray = this.addedRecords;

      if (this.inputRecords.length == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Select Atleast One Record",
          timeout: 5000,
          Top: true,
        };
      } else if (this.teamMember != null && this.teamMemberSelected == "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Select Atleast One Member",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.addData = false;
        this.initiaorRM = null;
        this.initiaorCheck = null;
        this.rolesRM = false;
        this.initiatorRecord = null;
        this.expenseHead = null;
        this.teamMemberSelected = "";
        this.teamMember = null;
        newArray.splice(this.itemSelIndex + 1, 0, this.finalArray[0]);

        this.addedRecords = newArray;
        this.stepsSelected = [];
      }
    },
  },
};
</script>

<style>
</style>