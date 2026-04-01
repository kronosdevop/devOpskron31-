<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card class="" flat >
      <!-- <v-card-title class="d-flex align-center">
          <v-icon class="mr-3" color="primary">mdi-office-building</v-icon>
          Petty Cash Organization Approval Configuration
        </v-card-title> -->
      <v-card-text>
        <v-row no-gutters>
          <!-- <v-col cols="4">
              <v-card-text class="mt-n4" v-if="queryCheck == true">
                PettyCashOrgFormView :templateSteps="templateSteps" />
              </v-card-text>
            </v-col> -->
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
                      class="cardCss text-capitalize ml-2 text-white"
                    >
                      Next
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-stepper-content>
              <v-stepper-step step="2"> Configure Flow </v-stepper-step>
              <v-stepper-content step="2">
                <v-card class="mt-n4" v-if="step === 2" flat>
                  <FormConfiguration
                    :addedFlowSteps="addedFlowSteps"
                    :tableData="tableData"
                    :templete="templete"
                    :workflowType="'petty_cash_refill_vault'"
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

    <!-- Configure Steps Dialog -->
    <v-dialog
      v-model="addData"
      transition="dialog-bottom-transition"
      persistent
      max-width="500"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Configure Petty Cash Organization Steps
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="6">
                <v-radio-group
                  @update:modelValue="
                    fetch_selected_data(pettyCashOrgHead, 'initator')
                  "
                  v-model="initiator"
                  row
                  color="primary"
                >
                  <v-radio label="Initiator" value="initator"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
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
            <v-row no-gutters>
              <v-col cols="6">
                <v-radio-group
                  @change="
                    fetch_selected_data(
                      pettyCashOrgHead,
                      'pettycashorg'
                    )
                  "
                  v-model="pettyCashOrgHead"
                  row
                  color="primary"
                >
                  <v-radio
                    label="Group Head"
                    value="pettyCashOrgHeadNew"
                  ></v-radio>
                </v-radio-group>
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
import { list_petty_cash_workflows } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import OverlayComp from "@/components/OverlayComp.vue";
import FormConfiguration from "@/components/ExpensesManagement/ExpensePopups/FormConfiguration.vue";
//   import PettyCashOrgFormView from "@/components/Approvals/PettyCashOrgFormView.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  name: "PettyCashOrgApproval",
  mixins: [get_all_org_users],
  components: {
    SnackBar,
    OverlayComp,
    FormConfiguration,
    //   PettyCashOrgFormView,
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
      pettyCashOrgHead: null,
      startCheck: false,
    };
  },
  async created() {
    this.$store.commit("Setnamesearch", "");
    this.overlay = true;
    await this.get_all_org_users();
    await this.fetch_users();
    await this.get_initiated_petty_cash_org();
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
        "pettyCashOrgFlowSteps",
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
      this.get_initiated_petty_cash_org();
    },

    fetchclear() {
      this.pettyCashOrgHead = null;
      this.initiator = null;
    },

    add_dialog() {
      this.addData = true;
      this.initiator = null;
      this.radiobutton = null;
      this.pettyCashOrgHead = null;
      this.teamMemberSelected = "";
    },

    close_dialog() {
      this.addData = false;
      if (this.$refs.form) {
        this.$refs.form.reset();
        this.$refs.form.resetValidation && this.$refs.form.resetValidation();
      }
    },

    async add_items() {
      const { valid } = await this.$refs.form.validate();

      if (valid) {
        let selectedData = {};

        if (this.initiator === "initator") {
          selectedData = {
            step_no: this.addedRecords.length + 1,
            name: "Initiator",
            user_id: "N/A",
            user_type: "initiator",
            workflow_template: this.templete,
          };
        } else if (
          this.radiobutton === "teamMember" &&
          this.teamMemberSelected
        ) {
          selectedData = {
            step_no: this.addedRecords.length + 1,
            name: this.teamMemberSelected.title,
            user_id: this.teamMemberSelected.value,
            user_type: "team_member",
            workflow_template: this.templete,
          };
        } else if (this.pettyCashOrgHead === "pettyCashOrgHeadNew") {
          selectedData = {
            step_no: this.addedRecords.length + 1,
            name: "Group Head",
            user_id: "N/A",
            user_type: "expense_group",
            workflow_template: this.templete,
          };
        }

        if (
          Object.keys(selectedData).length > 0 &&
          !this.isNameAlreadyExists(selectedData.name)
        ) {
          this.addedRecords.push(selectedData);
          this.close_dialog();
        } else if (this.isNameAlreadyExists(selectedData.name)) {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Data Already Exists",
            timeout: 5000,
            Top: true,
          };
        }
      }
    },
    isNameAlreadyExists(exitsName) {
      // console.log(this.addedRecords.some((obj) => obj.name === exitsName));
      return this.addedRecords.some((obj) => obj.name === exitsName);
    },
    add_row(index) {
      this.itemSelIndex = index;
      this.add_dialog();
    },

    delete_record(index) {
      this.addedRecords.splice(index, 1);
    },

    previous_step() {
      this.step = 1;
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

    fetch_selected_data(type, action) {
      // console.log(type, action);
      // Handle different selection types for petty cash org
      if (action === "initator") {
        this.initiator = type;
        this.pettyCashOrgHead = null;
        this.radiobutton = null;
        this.teamMemberSelected = "";
      } else if (action === "teamMember") {
        this.teamMember = type;
        this.initiator = null;
        this.pettyCashOrgHead = null;
      } else if (action === "pettycashorg") {
        this.pettyCashOrgHead = type;
        this.initiator = null;
        this.radiobutton = null;
        this.teamMemberSelected = "";
      }
    },

    async get_initiated_petty_cash_org() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_petty_cash_workflows, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.list_petty_cash_workflows);
        this.overlay = false;
        this.tableData = {};

        if (response.Status == "SUCCESS") {
          // Find the workflow with form_unique_type "PETTY_CASH_ORG"
          const pettyCashOrgWorkflow = response.data.find(
            (workflow) => workflow.form_unique_type === "PETTY_CASH_REFILL_VAULT"
          );
          // console.log(pettyCashOrgWorkflow);

          if (pettyCashOrgWorkflow) {
            this.templete = pettyCashOrgWorkflow.workflow_template;
            this.templateSteps = pettyCashOrgWorkflow;
            this.tableData = pettyCashOrgWorkflow;
            this.addedRecords = this.tableData.workflow_approval_steps;
            this.queryCheck = true;
          } else {
            this.tableData = {};
            this.overlay = false;
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "orange",
              SnackbarText: "No PETTY_CASH_ORG workflow found",
              timeout: 5000,
              Top: true,
            };
          }
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
  
  <style scoped>
/* .cardCss {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    font-weight: 500;
  }
  
  .button-corner {
    border-radius: 8px;
  } */

/* .navBar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
   */
/* .custom-title {
    color: white;
    font-weight: 500;
  } */
</style> 