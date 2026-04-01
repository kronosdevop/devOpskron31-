<!-- <template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card class="" flat>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="8">
            <v-stepper v-model="step" vertical>
              <v-stepper-step :complete="step > 1" step="1">
                Flow Steps
              </v-stepper-step>

              <v-stepper-content step="1">
                <v-card v-if="step === 1" flat>
                  <v-list>
                    <v-list-item>
                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-list-item-title class="text-green">
                            <v-icon color="green" dark> mdi-cog </v-icon>
                            Start
                          </v-list-item-title>
                        </v-col>
                        <v-list-item-action class="justify-end">
                          <v-col cols="6"></v-col>
                          <v-col cols="6">
                            <v-btn
                              size="small"
                              class="white--text ml-5"
                              @click="add_dialog()"
                              color="green"
                            >
                              <v-icon size="small" color="white">
                                mdi-plus
                              </v-icon>
                            </v-btn>
                          </v-col>
                        </v-list-item-action>
                      </v-row>
                    </v-list-item>

                    <v-list-item-group v-if="addedRecords.length != 0">
                      <v-list-item
                        v-for="(item, index) in addedRecords"
                        :key="`item-${index}`"
                      >
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
                                class="white--text"
                                @click="add_row(index)"
                                color="primary"
                              >
                                <v-icon size="small" color="white">
                                  mdi-plus
                                </v-icon>
                              </v-btn>
                            </v-col>
                            <v-col cols="6">
                              <v-btn
                                size="small"
                                class="white--text ml-1"
                                @click="delete_record(index)"
                                color="red"
                              >
                                <v-icon size="small" color="white">
                                  mdi-delete
                                </v-icon>
                              </v-btn>
                            </v-col>
                          </v-list-item-action>
                        </v-row>
                      </v-list-item>
                    </v-list-item-group>
                    <v-list-item>
                      <v-list-item-title class="text-red">
                        <v-icon color="red" dark> mdi-cog </v-icon>
                        Stop
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <v-card-actions class="justify-start">
                    <v-btn
                      depressed
                      :loading="loading"
                      @click="save_next_step()"
                      dark
                      class="cardCss text-capitalize button-corner ml-2 text-white"
                    >
                      Next
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-stepper-content>

              <v-stepper-step step="2"> Configure Flow </v-stepper-step>
              <v-stepper-content step="2">
                <v-card class="mt-n4" v-if="step === 2" flat>
                  <TeamFormConfiguration
                    :addedFlowSteps="addedFlowSteps"
                    :tableData="tableData"
                    :templete="templete"
                    :workflowType="'team_approval'"
                    v-on:backAction="previous_step"
                    v-on:successMsg="save_mutation"
                    v-on:errorMsg="error_msg"
                  />
                </v-card>
              </v-stepper-content>
            </v-stepper>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card-text> </v-card-text>
    <v-dialog
      v-model="addData"
      transition="dialog-bottom-transition"
      persistent
      max-width="500"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Configure Steps</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row class="mt-n4">
              <v-col cols="6">
                <v-radio-group
                  v-model="radiobutton"
                  row
                  @update:modelValue="fetchclear()"
                  color="primary"
                >
                  <v-radio label="Team Member" value="teamMember"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-if="radiobutton == 'teamMember'"
                  density="compact"
                  variant="outlined"
                  class="mt-3"
                  v-model="teamMemberSelected"
                  :rules="[(v) => !!v || 'Required']"
                  :items="userList"
                  item-text="title"
                  item-value="value"
                  return-object
                  label="Select Member"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn size="small" @click="add_items()" class="text-white cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <OverlayComp :overlay="overlay" />
  </div>
</template>

<script>
/*eslint-disable*/
import { get_team_awards_workflows } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

import OverlayComp from "@/components/OverlayComp.vue";
import TeamFormConfiguration from "@/components/RewardsManagement/TeamFormConfiguration.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  mixins: [get_all_org_users],
  components: {
    SnackBar,
    OverlayComp,
    TeamFormConfiguration,
  },
  data() {
    return {
      addData: false,
      stepsSelected: [],
      rolesRM: false,
      loading: false,
      initiaorRM: null,
      initiaorCheck: null,
      initiator: null,
      teamMember: null,
      teamMemberSelected: "",
      SnackBarComponent: {},
      overlay: false,
      selectedData: [],
      flowSteps: [
        { selected: false, title: "Initiator" },
        { selected: false, title: "Initiator's Reporting Manager" },
        { selected: false, title: "Roles" },
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
      tableData: {},
      templete: [],
      search: "",
      step: 1,
      addedFlowSteps: [],
      queryCheck: false,
      templateSteps: {},
      radiobutton: null,
      expenseHead: null,
      startCheck: false,
    };
  },
  async created() {
    this.$store.commit("Setnamesearch", "");
    this.overlay = true;
    await this.get_all_org_users();
    await this.fetch_users();
    await this.get_initiated_expense();
  },
  watch: {
    addData: {
      async handler() {
        await this.get_all_org_users();
      },
    },
    teamMemberSelected: {
      handler(newValue) {
        if (newValue && this.radiobutton === "teamMember") {
          this.fetch_selected_data(newValue, "teamMember");
        }
      },
    },
  },
  methods: {
    save_next_step() {
      this.addedFlowSteps = this.addedRecords;
      localStorage.setItem("flowSteps1Info", JSON.stringify(this.addedRecords));
      this.step = 2;
    },
    fetch_users() {
      this.userList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userList.push({
            title: element.full_user_name,
            value: element.user_id,
          });
        }
      });
      this.userList.sort((a, b) => a.title.localeCompare(b.title));
    },
    save_mutation(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.step = 1;
      this.get_initiated_expense();
    },
    fetchclear() {
      this.expenseHead = null;
      this.initiator = null;
    },
    fetch_selected_data(value, type) {
      this.inputRecords = [];
      if (type == "teamMember") {
        if (value && value.title) {
          this.inputRecords.push({
            step_no: this.addedRecords.length + 1,
            name: value.title,
            user_id: value.value,
            user_type: "team_member",
            workflow_template: this.templete,
          });
        }
        this.expenseHead = null;
        this.initiator = null;
      } else if (type == "expense") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Group Head",
          user_id: "N/A",
          user_type: "expense_group",
          workflow_template: this.templete,
        });
        this.radiobutton = null;
        this.teamMemberSelected = "";
        this.initiator = null;
      } else if (type == "initator") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initator",
          workflow_template: this.templete,
        });
        this.radiobutton = null;
        this.teamMemberSelected = "";
        this.expenseHead = null;
      }
    },
    error_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },
    previous_step() {
      this.step = 1;
    },
    delete_record(val) {
      this.addedRecords.splice(val, 1);
      let transformedArray = this.addedRecords.map((item, index) => {
        return { ...item, step_no: index + 1 };
      });
      this.addedRecords = transformedArray;
      this.stepsSelected = [];
      this.radiobutton = null;
      this.expenseHead = null;
      this.teamMemberSelected = "";
    },
    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
      this.inputRecords = [];
      if (this.$refs.form) {
        this.$refs.form.reset();
        this.$refs.form.resetValidation && this.$refs.form.resetValidation();
      }
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
      this.startCheck = true;
      this.addData = true;
    },
    async add_items() {
      var newArray = this.addedRecords;
      const { valid } = await this.$refs.form.validate();
      if (
        valid &&
        (this.radiobutton != null ||
          this.expenseHead != null ||
          this.initiator != null) &&
        this.inputRecords.length > 0 &&
        !this.isNameAlreadyExists(this.inputRecords[0].name)
      ) {
        if (this.startCheck == true) {
          this.addedRecords.unshift(this.inputRecords[0]);
        } else {
          newArray.splice(this.itemSelIndex + 1, 0, this.inputRecords[0]);
          this.addedRecords = newArray;
        }
        let transformedArray = this.addedRecords.map((item, index) => {
          return { ...item, step_no: index + 1 };
        });
        this.addedRecords = transformedArray;
        this.addData = false;
        this.radiobutton = null;
        this.expenseHead = null;
        this.startCheck = false;
        this.initiator = null;
        this.teamMemberSelected = "";
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            this.inputRecords.length === 0
              ? "Please select a valid option"
              : "Data Already Exists",
          timeout: 5000,
          Top: true,
        };
      }
    },
    isNameAlreadyExists(exitsName) {
      return this.addedRecords.some((obj) => obj.name === exitsName);
    },
    get_input(index) {
      this.inputRecords = [];
      if (index == 2 && index != undefined) {
        if (this.teamMemberSelected && this.teamMemberSelected.title) {
          this.inputRecords.push({
            step_no: this.addedRecords.length + 1,
            name: this.teamMemberSelected.title,
            user_id: this.teamMemberSelected.value,
            user_type: "team_member",
            workflow_template: this.templete,
          });
        }
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
          graphqlOperation(get_team_awards_workflows, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_team_awards_workflows);
        this.overlay = false;
        this.tableData = {};
        if (response.Status == "SUCCESS") {
          this.templete = response.data[0].workflow_template;
          this.templateSteps = response.data[0];
          this.tableData = response.data[0];
          this.addedRecords = this.tableData.workflow_approval_steps;
          this.queryCheck = true;
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
  },
};
</script> -->

<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card class="" flat>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="8">
            <v-stepper v-model="step" vertical>
              <v-stepper-step :complete="step > 1" step="1">
                Flow Steps
              </v-stepper-step>
              <v-stepper-content step="1">
                <v-card v-if="step === 1" flat>
                  <v-list>
                    <v-list-item>
                      <v-row no-gutters>
                        <v-col cols="6">
                          <v-list-item-title class="text-green">
                            <v-icon color="green" dark> mdi-cog </v-icon>
                            Start
                          </v-list-item-title>
                        </v-col>
                        <v-list-item-action class="justify-end">
                          <v-col cols="6">
                            <v-btn
                              size="small"
                              class="white--text ml-7"
                              @click="add_dialog()"
                              color="green"
                            >
                              <v-icon size="small" color="white">
                                mdi-plus
                              </v-icon>
                            </v-btn>
                          </v-col>
                        </v-list-item-action>
                      </v-row>
                    </v-list-item>

                    <v-list-item-group v-if="addedRecords.length != 0">
                      <v-list-item
                        v-for="(item, index) in addedRecords"
                        :key="`item-${index}`"
                      >
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
                                class="white--text"
                                @click="add_row(index)"
                                color="primary"
                              >
                                <v-icon size="small" color="white">
                                  mdi-plus
                                </v-icon>
                              </v-btn>
                            </v-col>
                            <v-col cols="6">
                              <v-btn
                                size="small"
                                class="white--text ml-1"
                                @click="delete_record(index)"
                                color="red"
                              >
                                <v-icon size="small" color="white">
                                  mdi-delete
                                </v-icon>
                              </v-btn>
                            </v-col>
                          </v-list-item-action>
                        </v-row>
                      </v-list-item>
                    </v-list-item-group>
                    <v-list-item>
                      <v-list-item-title class="text-red">
                        <v-icon color="red" dark> mdi-cog </v-icon>
                        Stop
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <v-card-actions class="justify-start">
                    <v-btn
                      depressed
                      :loading="loading"
                      @click="save_next_step()"
                      dark
                      class="cardCss text-capitalize button-corner ml-2 text-white"
                    >
                      Next
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-stepper-content>

              <v-stepper-step step="2"> Configure Flow </v-stepper-step>
              <v-stepper-content step="2">
                <v-card class="mt-n4" v-if="step === 2" flat>
                  <TeamFormConfiguration
                    :addedFlowSteps="addedFlowSteps"
                    :tableData="tableData"
                    :templete="templete"
                    :workflowType="'team_approval'"
                    v-on:backAction="previous_step"
                    v-on:successMsg="save_mutation"
                    v-on:errorMsg="error_msg"
                  />
                </v-card>
              </v-stepper-content>
            </v-stepper>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card-text> </v-card-text>
    <v-dialog
      v-model="addData"
      transition="dialog-bottom-transition"
      persistent
      max-width="500"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Configure Steps</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row class="mt-n4">
              <v-col cols="6">
                <v-radio-group
                  v-model="radiobutton"
                  row
                  @update:modelValue="fetchclear()"
                  color="primary"
                >
                  <v-radio label="Team Member" value="teamMember"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-if="radiobutton == 'teamMember'"
                  density="compact"
                  variant="outlined"
                  class="mt-3"
                  v-model="teamMemberSelected"
                  :rules="[(v) => !!v || 'Required']"
                  :items="userList"
                  item-text="title"
                  item-value="value"
                  return-object
                  label="Select Member"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn size="small" @click="add_items()" class="text-white cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <OverlayComp :overlay="overlay" />
  </div>
</template>

<script>
/*eslint-disable*/
import { get_team_awards_workflows } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import OverlayComp from "@/components/OverlayComp.vue";
import TeamFormConfiguration from "@/components/RewardsManagement/TeamFormConfiguration.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  mixins: [get_all_org_users],
  components: {
    SnackBar,
    OverlayComp,
    TeamFormConfiguration,
  },
  data() {
    return {
      addData: false,
      stepsSelected: [],
      rolesRM: false,
      loading: false,
      initiaorRM: null,
      initiaorCheck: null,
      initiator: null,
      teamMember: null,
      teamMemberSelected: "",
      SnackBarComponent: {},
      overlay: false,
      selectedData: [],
      flowSteps: [
        { selected: false, title: "Initiator" },
        { selected: false, title: "Initiator's Reporting Manager" },
        { selected: false, title: "Roles" },
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
      tableData: {},
      templete: [],
      search: "",
      step: 1,
      addedFlowSteps: [],
      queryCheck: false,
      templateSteps: {},
      radiobutton: null,
      expenseHead: null,
      startCheck: false,
    };
  },
  async created() {
    this.$store.commit("Setnamesearch", "");
    this.overlay = true;
    await this.get_all_org_users();
    await this.fetch_users();
    await this.get_initiated_expense();
  },
  watch: {
    addData: {
      async handler() {
        await this.get_all_org_users();
      },
    },
    teamMemberSelected: {
      handler(newValue) {
        if (newValue && this.radiobutton === "teamMember") {
          this.fetch_selected_data(newValue, "teamMember");
        }
      },
    },
  },
  methods: {
    save_next_step() {
      this.addedFlowSteps = this.addedRecords;
      localStorage.setItem(
        "teamApprovalFlowSteps",
        JSON.stringify(this.addedRecords)
      );
      this.step = 2;
    },
    fetch_users() {
      this.userList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userList.push({
            title: element.full_user_name,
            value: element.user_id,
          });
        }
      });
      this.userList.sort((a, b) => a.title.localeCompare(b.title));
    },
    save_mutation(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.step = 1;
      this.get_initiated_expense();
    },
    fetchclear() {
      this.expenseHead = null;
      this.initiator = null;
    },
    fetch_selected_data(value, type) {
      this.inputRecords = [];
      if (type == "teamMember") {
        if (value && value.title) {
          this.inputRecords.push({
            step_no: this.addedRecords.length + 1,
            name: value.title,
            user_id: value.value,
            user_type: "team_member",
            workflow_template: this.templete,
          });
        }
        this.expenseHead = null;
        this.initiator = null;
      } else if (type == "expense") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Group Head",
          user_id: "N/A",
          user_type: "expense_group",
          workflow_template: this.templete,
        });
        this.radiobutton = null;
        this.teamMemberSelected = "";
        this.initiator = null;
      } else if (type == "initiator") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initiator",
          workflow_template: this.templete,
        });
        this.radiobutton = null;
        this.teamMemberSelected = "";
        this.expenseHead = null;
      }
    },
    error_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },
    previous_step() {
      this.step = 1;
    },
    delete_record(val) {
      this.addedRecords.splice(val, 1);
      let transformedArray = this.addedRecords.map((item, index) => {
        return { ...item, step_no: index + 1 };
      });
      this.addedRecords = transformedArray;
      this.stepsSelected = [];
      this.radiobutton = null;
      this.expenseHead = null;
      this.teamMemberSelected = "";
    },
    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
      this.inputRecords = [];
      if (this.$refs.form) {
        this.$refs.form.reset();
        this.$refs.form.resetValidation && this.$refs.form.resetValidation();
      }
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
      this.startCheck = true;
      this.addData = true;
    },
    async add_items() {
      var newArray = this.addedRecords;
      const { valid } = await this.$refs.form.validate();
      if (
        valid &&
        (this.radiobutton != null ||
          this.expenseHead != null ||
          this.initiator != null) &&
        this.inputRecords.length > 0 &&
        !this.isNameAlreadyExists(this.inputRecords[0].name)
      ) {
        if (this.startCheck == true) {
          this.addedRecords.unshift(this.inputRecords[0]);
        } else {
          newArray.splice(this.itemSelIndex + 1, 0, this.inputRecords[0]);
          this.addedRecords = newArray;
        }
        let transformedArray = this.addedRecords.map((item, index) => {
          return { ...item, step_no: index + 1 };
        });
        this.addedRecords = transformedArray;
        this.addData = false;
        this.radiobutton = null;
        this.expenseHead = null;
        this.startCheck = false;
        this.initiator = null;
        this.teamMemberSelected = "";
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            this.inputRecords.length === 0
              ? "Please select a valid option"
              : "Data Already Exists",
          timeout: 5000,
          Top: true,
        };
      }
    },
    isNameAlreadyExists(exitsName) {
      return this.addedRecords.some((obj) => obj.name === exitsName);
    },
    get_input(index) {
      this.inputRecords = [];
      if (index == 2 && index != undefined) {
        if (this.teamMemberSelected && this.teamMemberSelected.title) {
          this.inputRecords.push({
            step_no: this.addedRecords.length + 1,
            name: this.teamMemberSelected.title,
            user_id: this.teamMemberSelected.value,
            user_type: "team_member",
            workflow_template: this.templete,
          });
        }
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
          graphqlOperation(get_team_awards_workflows, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_team_awards_workflows);
        this.overlay = false;
        this.tableData = {};
        if (response.Status == "SUCCESS") {
          this.templete = response.data[0].workflow_template;
          this.templateSteps = response.data[0];
          this.tableData = response.data[0];
          this.addedRecords = this.tableData.workflow_approval_steps;
          this.queryCheck = true;
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
  },
};
</script>
