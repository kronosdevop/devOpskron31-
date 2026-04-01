<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card class="" flat >
      <v-card-title>Vendor Pending Approval</v-card-title>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12">
            <v-stepper v-model="vendorstep" vertical>
              <v-stepper-step :complete="vendorstep > 1" step="1">
                Flow Steps
              </v-stepper-step>

              <v-stepper-content step="1">
                <v-card v-if="vendorstep === 1" flat>
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
                              @click="add_vendordialog()"
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

                    <v-list-item-group v-if="vendorRecords.length != 0">
                      <template v-for="(item, index) in vendorRecords" :key="item.name">
                        <v-list-item>
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
                      </template>
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
                <v-card class="mt-n4" v-if="vendorstep === 2" flat>
                  <VendorFormConf
                    :addedFlowSteps="addedFlowSteps"
                    :tableData="tableData"
                    :templete="templete"
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
    <!-- <FormConfiguration :addedFlowSteps="addedFlowSteps" /> -->
    <v-card-text> </v-card-text>
    <v-dialog :model-value="addData" @update:model-value="$emit('update:addData', $event)"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
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
            <v-row no-gutters class="mt-4">
              <v-col cols="6">
                <v-radio-group
                  @change="fetch_selected_data(expenseHead, 'initator')"
                  v-model="initiator"
                  row
                  color="primary"
                >
                  <v-radio label="Initator" value="initator"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row class="mt-n4">
              <v-col cols="6">
                <v-radio-group v-model="radiobutton" row @change="fetchclear()" color="primary">
                  <v-radio label="Team Member" value="teamMember"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-if="radiobutton == 'teamMember'"
                  density="compact"
                  variant="outlined"
                  class="mt-3"
                  @input="fetch_selected_data(teamMemberSelected, 'teamMember')"
                  v-model="teamMemberSelected"
                  :rules="[(v) => !!v || 'Required']"
                  :items="userList"
                  item-title="label"
                  v-model:search-input="search"
                  item-value="value"
                  return-object
                  label="Select Member"
                />
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="6">
                <v-radio-group
                  @change="fetch_selected_data(expenseHead, 'expense')"
                  v-model="expenseHead"
                  row
                  color="primary"
                >
                  <v-radio label="Group Head" value="expenseHeadNew"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn size="small" @click="addvendor_items()" class="text-white cardCss"
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
import { get_vendor_workflows } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import OverlayComp from "@/components/OverlayComp.vue";
import VendorFormConf from "@/components/VendorManagement/VendorFormConf.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  mixins: [get_all_org_users],
  components: {
    SnackBar,
    OverlayComp,
    VendorFormConf,
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
        { selected: false, text: "Initiator" },
        { selected: false, text: "Initiator's Reporting Manager" },
        { selected: false, text: "Roles" },
      ],
      finalArray: [],
      vendorRecords: [],
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
      vendorstep: 1,
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
    await this.get_initiated_vendor();
  },
  watch: {
    addData: {
      async handler() {
        await this.get_all_org_users();
      },
    },
  },
  methods: {
    save_next_step() {
      this.addedFlowSteps = this.vendorRecords;
      // console.log(this.vendorRecords);
      localStorage.setItem(
        "flowSteps1Info",
        JSON.stringify(this.vendorRecords)
      );
      this.vendorstep = 2;
    },

    fetch_users() {
      this.userList = [];

      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userList.push({
            label: element.full_user_name,
            value: element.user_id,
          });
        }
      });

      this.userList.sort((a, b) => a.label.localeCompare(b.label));
    },

    save_mutation(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.vendorstep = 1;
      this.get_initiated_vendor();
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },
    fetchclear() {
      this.expenseHead = null;
      this.initiator = null;
    },
    fetch_selected_data(value, type) {
      this.inputRecords = [];

      if (type == "teamMember") {
        this.inputRecords.push({
          step_no: this.vendorRecords.length + 1,
          name: this.teamMemberSelected.label,
          user_id: this.teamMemberSelected.value,
          user_type: "team_member",
          workflow_template: this.templete,
        });

        this.expenseHead = null;
        this.initiator = null;
      } else if (type == "expense") {
        this.inputRecords.push({
          step_no: this.vendorRecords.length + 1,
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
          step_no: this.vendorRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initiator",
          workflow_template: this.templete,
        });
        this.radiobutton = null;
        this.teamMemberSelected = "";
        this.expenseHead = null;
      }
      // console.log(value);
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
      this.vendorstep = 1;
    },

    delete_record(val) {
      this.vendorRecords.splice(val, 1);
      let transformedArray = this.vendorRecords.map((item, index) => {
        return { ...item, step_no: index + 1 };
      });
      this.vendorRecords = transformedArray;
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
        this.$refs.form.resetValidation();
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

    add_vendordialog() {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.startCheck = true;
      this.addData = true;
    },

    async addvendor_items() {
      var newArray = this.vendorRecords;
      const { valid } = await this.$refs.form.validate();

      if (
        valid &&
        (this.radiobutton != null ||
          this.expenseHead != null ||
          this.initiator != null) &&
        !this.isNameAlreadyExists(this.inputRecords[0].name)
      ) {
        if (this.startCheck == true) {
          this.vendorRecords.unshift(this.inputRecords[0]);
        } else {
          newArray.splice(this.itemSelIndex + 1, 0, this.inputRecords[0]);

          this.vendorRecords = newArray;
        }

        let transformedArray = this.vendorRecords.map((item, index) => {
          return { ...item, step_no: index + 1 };
        });

        this.vendorRecords = transformedArray;
        this.addData = false;
        this.radiobutton = null;
        this.expenseHead = null;
        this.startCheck = false;
        this.initiator = null;
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Data Already Exists",
          timeout: 5000,
          Top: true,
        };
      }
    },

    isNameAlreadyExists(exitsName) {
      return this.vendorRecords.some((obj) => obj.name === exitsName);
    },

    get_input(index) {
      this.inputRecords = [];
      if (index == 2 && index != undefined) {
        this.inputRecords.push({
          step_no: this.vendorRecords.length + 1,
          name: this.teamMemberSelected.label,
          user_id: this.teamMemberSelected.value,
          user_type: "team_member",
          workflow_template: this.templete,
        });
        this.teamMember = "member_team";
        this.initiaorCheck = null;
        this.initiaorRM = null;
        this.rolesRM = false;
      }

      this.finalArray = this.inputRecords;
    },

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
            (obj) => obj.form_unique_type === "VENDOR_REIMBURSEMENT"
          );
          this.templete = workfowData.workflow_template;
          this.templateSteps = workfowData;
          this.tableData = workfowData;
          this.vendorRecords = this.tableData.workflow_approval_steps;
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
  
<style>
</style>
