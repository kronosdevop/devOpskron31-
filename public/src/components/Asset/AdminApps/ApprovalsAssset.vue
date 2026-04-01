<template>
  <div>
    <!-- Back Button Header -->
    <v-card flat class="mb-4">
      <v-card-text class="pa-4">
        <v-btn
          variant="text"
          class="back-link"
          @click="$emit('backAction')"
        >
          <v-icon>mdi-arrow-left</v-icon>
          Back to Asset Settings
        </v-btn>
      </v-card-text>
    </v-card>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat >
      <v-row>
        <v-col cols="8">
          <v-expansion-panels focusable>
            <v-expansion-panel>
              <v-expansion-panel-title
                >Approval for Asset Dispatch</v-expansion-panel-title
              >
              <v-expansion-panel-text class="">
                <div class="mt-2">
                  <AssetProcurmentApproval
                    v-if="isApproved"
                    :assetproWrkTemplate="assetproWrkTemplate"
                    :assetProcurmentRecords="assetProcurmentRecords"
                    :organizationUsers="organizationUsers"
                    :assetProcureInfo="assetProcureInfo"
                    v-on:update:assetProcurmentRecords="
                      assetProcurmentRecords = $event
                    "
                    v-on:successMsg="success_msg"
                    v-on:errorMsg="error_msg"
                  />
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title
                >Approval for Asset Request</v-expansion-panel-title
              >
              <v-expansion-panel-text class="">
                <div class="mt-2">
                  <v-card outlined flat max-width="600">
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
                                  <v-list-item-content>
                                    <v-list-item-title class="green-text">
                                      <v-icon color="green" dark>
                                        mdi-cog
                                      </v-icon>
                                      Start
                                    </v-list-item-title>
                                  </v-list-item-content>
                                </v-col>
                                <v-col cols="6">
                                  <v-list-item-action>
                                    <v-btn
                                      size="small"
                                      :disabled="addAssetRecords.length > 0"
                                      class="text-white"
                                      @click="add_assetdialog()"
                                      color="green"
                                    >
                                      <v-icon size="small" color="white">
                                        mdi-plus
                                      </v-icon>
                                    </v-btn>
                                  </v-list-item-action>
                                </v-col>
                              </v-row>
                            </v-list-item>

                            <v-list-item-group
                              v-if="addAssetRecords.length != 0"
                            >
                              <v-list-item
                                v-for="(item, index) in addAssetRecords"
                                :key="item.name"
                              >
                                <v-row no-gutters>
                                  <v-col cols="6">
                                    <v-list-item-content>
                                      <v-list-item-title class="">
                                        <v-icon color="blue" dark>
                                          mdi-cog
                                        </v-icon>
                                        {{ item.name }}
                                      </v-list-item-title>
                                    </v-list-item-content>
                                  </v-col>
                                  <v-col cols="6">
                                    <v-list-item-action>
                                      <v-btn
                                        size="small"
                                        class="white--text"
                                        @click="add_assetrow(index)"
                                        color="primary"
                                      >
                                        <v-icon size="small" color="white">
                                          mdi-plus
                                        </v-icon>
                                      </v-btn>
                                      <v-btn
                                        size="small"
                                        class="white--text ml-4"
                                        @click="delete_assetrecord(index)"
                                        color="red"
                                      >
                                        <v-icon size="small" color="white">
                                          mdi-delete
                                        </v-icon>
                                      </v-btn>
                                    </v-list-item-action>
                                  </v-col>
                                </v-row>
                              </v-list-item>
                            </v-list-item-group>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title class="red-text">
                                  <v-icon color="red" dark> mdi-cog </v-icon>
                                  Stop
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                          <v-card-actions class="justify-start">
                            <v-btn
                              depressed
                              :loading="loading"
                              @click="validate_request()"
                              dark
                              size="small"
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
                          <FormConfiguration
                            :actionType="actionType"
                            :addedFlowSteps="addedFlowSteps"
                            :tableData="tableData"
                            :templete="templete"
                            v-on:backAction="previous_step"
                            v-on:successMsg="success_msg"
                            v-on:errorMsg="error_msg"
                          />
                        </v-card>
                      </v-stepper-content>
                    </v-stepper>
                  </v-card>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title
                >Approval for Asset Retiral</v-expansion-panel-title
              >
              <v-expansion-panel-text>
                <div class="mt-2">
                  <v-card outlined flat max-width="600">
                    <v-list>
                      <v-list-item>
                        <v-row no-gutters>
                          <v-col cols="6">
                            <v-list-item-content>
                              <v-list-item-title class="green-text">
                                <v-icon color="green" dark> mdi-cog </v-icon>
                                Start
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-col>
                          <v-col cols="6">
                            <v-list-item-action>
                              <v-btn
                                size="small"
                                :disabled="addedRecords.length > 0"
                                class="white--text"
                                @click="add_dialog()"
                                color="green"
                              >
                                <v-icon size="small" color="white">
                                  mdi-plus
                                </v-icon>
                              </v-btn>
                            </v-list-item-action>
                          </v-col>
                        </v-row>
                      </v-list-item>

                      <v-list-item-group v-if="addedRecords.length != 0">
                        <v-list-item
                          v-for="(item, index) in addedRecords"
                          :key="item.name"
                        >
                          <v-row no-gutters>
                            <v-col cols="6">
                              <v-list-item-content>
                                <v-list-item-title class="">
                                  <v-icon color="blue" dark> mdi-cog </v-icon>
                                  {{ item.name }}
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-col>
                            <v-col cols="6">
                              <v-list-item-action>
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
                                <v-btn
                                  size="small"
                                  class="white--text ml-4"
                                  @click="delete_record(index)"
                                  color="red"
                                >
                                  <v-icon size="small" color="white">
                                    mdi-delete
                                  </v-icon>
                                </v-btn>
                              </v-list-item-action>
                            </v-col>
                          </v-row>
                        </v-list-item>
                      </v-list-item-group>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title class="red-text">
                            <v-icon color="red" dark> mdi-cog </v-icon>
                            Stop
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-card-actions class="justify-start">
                      <v-btn
                        depressed
                        :loading="loadingrec"
                        @click="validate_approvals('RETIRE_ASSET')"
                        dark
                        size="small"
                        class="cardCss text-capitalize button-corner ml-2 text-white"
                      >
                        save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title
                >Approval for Return Asset</v-expansion-panel-title
              >
              <v-expansion-panel-text>
                <ReturnAssetApproval
                  v-if="isApproved"
                  :assetReturnInfo="assetReturnInfo"
                  :returnAssetTemplate="returnAssetTemplate"
                  :returnAssetRecords="returnAssetRecords"
                  :organizationUsers="organizationUsers"
                  v-on:successMsg="success_msg"
                  v-on:errorMsg="error_msg"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-title
                >Approval for Moving Asset</v-expansion-panel-title
              >
              <v-expansion-panel-text>
                <LocationTransferApproval
                  v-if="isApproved"
                  :assetTranferInfo="assetTranferInfo"
                  :assetTransferTemplate="assetTransferTemplate"
                  :assetTransferRecords="assetTransferRecords"
                  :organizationUsers="organizationUsers"
                  v-on:successMsg="success_msg"
                  v-on:errorMsg="error_msg"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog
      v-model="addData"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title>
            <div class="custom-title">Configure Steps</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-2" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <!-- <v-row no-gutters class="mt-n3">
              <v-col cols="12">
                <v-radio-group
                  @change="fetch_selected_data('initiator')"
                  v-model="initiatorRecord"
                  inline
                  color="primary"
                >
                  <v-radio label="Initiator" value="initiator"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-n3">
              <v-col cols="12">
                <v-radio-group
                  @change="fetch_selected_data('reportingmanager')"
                  v-model="initiatorReportingManager"
                  inline
                  color="primary"
                >
                  <v-radio
                    label="Initiator's Reporting Manager"
                    value="reportingmanager"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-row> -->
            <v-row no-gutters class="">
              <v-col cols="6">
                <v-radio-group v-model="teamMember" inline color="primary">
                  <v-radio label="Team Member" value="member_team"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-if="teamMember == 'member_team'"
                  density="compact"
                  variant="outlined"
                  class="mt-3"
                  v-model="teamMemberSelected"
                  :rules="[(v) => !!v || 'Required']"
                  :items="userList"
                  item-text="title"
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
          <v-btn size="small" @click="add_items()" class="text-white cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="addassetData"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text-white">
            <div class="custom-title">Configure Steps</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="text-white mr-2" @click="close_assetdialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-form ref="form2">
            <v-row no-gutters class="mt-n3">
              <v-col cols="12">
                <v-radio-group
                  @change="fetch_selected_assetdata('initiator')"
                  v-model="initiatorAssetRecord"
                  inline
                  color="primary"
                >
                  <v-radio label="Initiator" value="initiator"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-n3">
              <v-col cols="12">
                <v-radio-group
                  @change="fetch_selected_assetdata('reportingmanager')"
                  v-model="initiatorReportingassetManager"
                  inline
                  color="primary"
                >
                  <v-radio
                    label="Initiator's Reporting Manager"
                    value="reportingmanager"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row no-gutters class="mt-n3">
              <v-col cols="6">
                <v-radio-group v-model="teamassetMember" inline color="primary">
                  <v-radio
                    @change="fetch_selected_assetdata('member_team')"
                    label="Team Member"
                    value="member_team"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-if="teamassetMember == 'member_team'"
                  density="compact"
                  variant="outlined"
                  class="mt-3"
                  v-model="teamMemberassetSelected"
                  :rules="[(v) => !!v || 'Required']"
                  :items="userList"
                  item-text="title"
                  :search-input.sync="searchasset"
                  item-value="user_id"
                  return-object
                  label="Select Member"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            size="small"
            @click="add_assetitems()"
            class="text-white cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */

import { configure_asset_workflows } from "@/graphql/mutations.js";
import { get_asset_workflow_details } from "@/graphql/queries.js";
import AssetProcurmentApproval from "@/components/Asset/Popups/AssetProcurmentApproval.vue";
import { API, graphqlOperation } from "aws-amplify";

import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import SnackBar from "@/components/SnackBar.vue";
import FormConfiguration from "@/components/Asset/Popups/FormConfiguration.vue";
import ReturnAssetApproval from "@/components/Asset/Popups/ReturnAssetApproval.vue";
import LocationTransferApproval from "@/components/Asset/Popups/LocationTransferApproval.vue";

export default {
  mixins: [get_all_org_users, get_Org_details],
  components: {
    SnackBar,
    AssetProcurmentApproval,
    FormConfiguration,
    ReturnAssetApproval,
    LocationTransferApproval,
  },
  emits: ['backAction'],
  data() {
    return {
      addData: false,
      stepsSelected: [],
      rolesRM: false,
      loading: false,
      loadingrec: false,
      initiaorRM: null,
      initiaorCheck: null,
      teamMember: null,
      teamMemberSelected: "",
      SnackBarComponent: {},
      selectedData: [],
      initiatorReportingManager: null,
      isApproved: false,
      step: 1,
      loader: false,
      flowSteps: [
        // { selected: false, text: "Initiator" },
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
      workflowTemplate: [],
      search: "",
      addassetData: false,
      teamassetMember: null,
      teamMemberassetSelected: "",
      initiatorReportingassetManager: null,
      finalassetArray: [],
      addAssetRecords: [],
      itemSelassetIndex: 0,
      inputassetRecords: [],
      workflowassetTemplate: [],
      searchasset: "",
      retireWorkflowTemplate: [],
      initiatorRecord: null,
      initiatorAssetRecord: null,
      teamMemberSelected: "",
      assetProcurmentRequest: [],
      assetproWrkTemplate: [],
      assetProcureInfo: {},
      addedFlowSteps: [],
      actionType: "",
      organizationUsers: [],
      returnAssetRecords: [],
      returnAssetTemplate: [],
      assetReturnInfo: {},
      assetTranferInfo: {},
      assetTransferRecords: [],
      assetTransferTemplate: [],
    };
  },
  async created() {
    this.$store.commit("Setnamesearch", this.search);
    await this.get_asset_approval_details();
    await this.get_all_org_users();
    this.organizationUsers = this.orgUsers;
    this.isApproved = true;
    // await this.get_Org_details();
    await this.fetch_users();
  },

  watch: {
    teamMemberassetSelected: {
      handler(newValue) {
        if (newValue && this.teamassetMember === "member_team") {
          this.fetch_selected_assetdata("member_team");
        }
      },
    },
    teamMemberSelected: {
      handler(newValue) {
        if (newValue && this.teamMember === "member_team") {
          this.fetch_selected_data("member_team");
        }
      },
    },
  },

  methods: {
    previous_step() {
      this.step = 1;
    },
    async get_asset_approval_details() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_asset_workflow_details, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_asset_workflow_details);
        // this.isApproved = true;

        if (response.Status == "SUCCESS") {
          response.data.forEach((element) => {
            if (element.form_unique_type == "RETIRE_ASSET") {
              this.addedRecords = element.workflow_approval_steps;
              this.retireWorkflowTemplate = element.workflow_template;
            } else if (element.form_unique_type == "REQUEST_ASSET") {
              this.tableData = element;
              this.addAssetRecords = element.workflow_approval_steps;
              this.templete = element.workflow_template;
              this.workflowassetTemplate = element.workflow_template;
            }
            // else if (element.form_unique_type == "PROCURE_ASSET_REQUEST") {
            //   this.assetProcureInfo = element;
            //   this.assetProcurmentRecords = element.workflow_approval_steps;
            //   this.assetproWrkTemplate = element.workflow_template;
            // }
            else if (
              element.form_unique_type == "ASSET_DELIVERY_ACKNOWLEDGEMENT"
            ) {
              this.assetProcureInfo = element;
              this.isApproved = true;
              this.assetProcurmentRecords = element.workflow_approval_steps;
              this.assetproWrkTemplate = element.workflow_template;
            } else if (element.form_unique_type == "ASSET_HANDOVER") {
              this.assetReturnInfo = element;
              this.isApproved = true;
              this.returnAssetTemplate = element.workflow_template;
              this.returnAssetRecords = element.workflow_approval_steps;
            } else if (element.form_unique_type == "LOCATION_TRANSFER") {
              this.isApproved = true;
              this.assetTranferInfo = element;
              this.assetTransferTemplate = element.workflow_template;
              this.assetTransferRecords = element.workflow_approval_steps;
            }
          });

          //  if(response.Status == )
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red", // Change color to indicate an error
            Snackbartitle: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red", // Change color to indicate an error
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    save_mutation() {},

    validate_request() {
      if (this.addAssetRecords.length == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red", // Change color to indicate an error
          SnackbarText: "Atleast add one approver user",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.save_next_step();
      }
    },
    save_next_step() {
      this.addedFlowSteps = this.addAssetRecords;
      localStorage.setItem(
        "flowSteps1Info",
        JSON.stringify(this.addAssetRecords)
      );
      this.actionType = "requestData";
      this.step = 2;
    },
    async success_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green", // Change color to indicate an error
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.isApproved = false;
      this.step = 1;

      await this.get_asset_approval_details();
    },
    error_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red", // Change color to indicate an error
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    validate_approvals(value) {
      if (value == "RETIRE_ASSET" && this.addedRecords.length == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red", // Change color to indicate an error
          SnackbarText: "Atleast add one approver user",
          timeout: 5000,
          Top: true,
        };
      } else if (value == "REQUEST_ASSET" && this.addassetData.length == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red", // Change color to indicate an error
          SnackbarText: "Atleast add one approver user",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.save_asset_approval_asset(value);
      }
    },

    add_dialog() {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.addData = true;
    },
    add_row(value) {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.itemSelIndex = value;
      this.addData = true;
    },
    delete_record(val) {
      this.addedRecords.splice(val, 1);
      this.stepsSelected = [];
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
    },

    async save_asset_approval_asset(value) {
      if (value == "RETIRE_ASSET") {
        this.loadingrec = true;
      } else {
        this.loading = true;
      }

      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(configure_asset_workflows, {
            input: {
              organization_id: data.organization.organization_id,
              form_unique_type: value,
              workflow_approval_steps:
                value == "RETIRE_ASSET"
                  ? JSON.stringify(this.addedRecords)
                  : JSON.stringify(this.addAssetRecords),
            },
          })
        );
        var response = JSON.parse(result.data.configure_asset_workflows);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.loadingrec = false;
          this.loading = false;
          await this.get_asset_approval_details();
        } else {
          this.loadingrec = false;
          this.loading = false;
        }
      } catch (error) {
        this.loadingrec = false;
        this.loading = false;
      }
    },

    close_assetdialog() {
      this.addassetData = false;
      this.inputassetRecords = [];
      this.$refs.form2.reset();
      this.$refs.form2.resetValidation();
    },

    fetch_data() {
      const baseObject = {
        name: "RETIRE_ASSET",
        approvers_list: [],
        is_approval: false,
      };
      return JSON.stringify(baseObject);
    },
    createApprovalObject() {
      const baseObject = {
        name: "RETIRE_ASSET",
        approvers_list: this.addedRecords,
        is_approval: true,
      };
      return JSON.stringify(baseObject);
    },

    add_assetdialog() {
      this.inputassetRecords = [];
      this.teamassetMember = null;
      this.addassetData = true;
    },
    add_assetrow(value) {
      this.inputassetRecords = [];
      this.teamassetMember = null;
      this.itemSelassetIndex = value;
      this.addassetData = true;
    },

    delete_assetrecord(val) {
      this.addAssetRecords.splice(val, 1);
    },

    async save_expense_head() {},

    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
      this.inputRecords = [];
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },

    fetch_selected_assetdata(type) {
      this.inputassetRecords = [];
      if (type == "reportingmanager") {
        this.inputassetRecords.push({
          step_no: this.addAssetRecords.length + 1,
          name: "Initiator's Reporting Manager",
          user_type: "initiator_reporting_manager",
          workflow_template: this.workflowassetTemplate,
        });
        this.teamassetMember = null;
        this.initiatorAssetRecord = null;
      } else if (type == "initiator") {
        this.inputassetRecords.push({
          step_no: this.addAssetRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initiator",
          workflow_template: this.workflowassetTemplate,
        });
        this.initiatorReportingassetManager = null;
        this.teamassetMember = null;
      } else if (type == "member_team") {
        if (
          this.teamMemberassetSelected &&
          this.teamMemberassetSelected.user_id
        ) {
          this.inputassetRecords.push({
            step_no: this.addAssetRecords.length + 1,
            name: this.teamMemberassetSelected.title,
            user_id: this.teamMemberassetSelected.user_id,
            user_type: "team_member",
            workflow_template: this.workflowassetTemplate,
          });

          this.initiatorReportingassetManager = null;
          this.teamassetMember = "member_team";
          this.initiatorAssetRecord = null;
        } else {
          this.initiatorReportingassetManager = null;
          this.initiatorAssetRecord = null;
        }
      }
      this.finalassetArray = this.inputassetRecords;
    },

    add_assetitems() {
      var newArray = this.addAssetRecords;
      var count = 0;
      if (this.inputassetRecords.length == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Select Atleast One Record",
          timeout: 5000,
          Top: true,
        };
      } else if (
        this.teamassetMember == "member_team" &&
        (!this.teamMemberassetSelected || !this.teamMemberassetSelected.user_id)
      ) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Select Atleast One Member",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.addassetData = false;

        this.teamMemberassetSelected = null;
        this.teamassetMember = null;
        newArray.splice(this.itemSelassetIndex + 1, 0, this.finalassetArray[0]);
        this.addAssetRecords = newArray;
      }
    },

    fetch_users() {
      //   if (this.orgDetails.organization.asset_management_settings != undefined) {
      //     this.addedRecords = [];
      //     this.addedRecords =
      //       this.orgDetails.organization.asset_management_settings.approvers_list;
      //   }
      this.userList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push({
            title: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      this.userList.sort((a, b) => a.title.localeCompare(b.title));
    },

    add_items() {
      var newArray = this.addedRecords;
      var count = 0;
      if (this.inputRecords.length == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Select Atleast One Record",
          timeout: 5000,
          Top: true,
        };
      } else if (
        this.teamMember == "member_team" &&
        (!this.teamMemberSelected || !this.teamMemberSelected.user_id)
      ) {
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
        this.roleSelected = "";
        this.teamMemberSelected = null;
        this.teamMember = null;
        newArray.splice(this.itemSelIndex + 1, 0, this.finalArray[0]);

        this.addedRecords = newArray;
        this.stepsSelected = [];
      }
    },

    fetch_selected_data(type) {
      this.inputRecords = [];
      if (type == "reportingmanager") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator's Reporting Manager",
          user_type: "initiator_reporting_manager",
          workflow_template: this.retireWorkflowTemplate,
        });
        this.teamMember = null;

        this.initiatorRecord = null;
      } else if (type == "initiator") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initiator",
          workflow_template: this.retireWorkflowTemplate,
        });
        this.initiatorReportingManager = null;
        this.teamMember = null;
      } else if (type == "member_team") {
        if (this.teamMemberSelected && this.teamMemberSelected.user_id) {
          this.inputRecords.push({
            step_no: this.addedRecords.length + 1,
            name: this.teamMemberSelected.title,
            user_id: this.teamMemberSelected.user_id,
            user_type: "team_member",
            workflow_template: this.retireWorkflowTemplate,
          });

          this.initiatorReportingManager = null;
          this.teamMember = "member_team";
          this.initiaorCheck = null;
          this.initiaorRM = null;
          this.rolesRM = false;
          this.initiatorRecord = null;
        } else {
          this.initiatorReportingManager = null;
          this.initiatorRecord = null;
        }
      }
      this.finalArray = this.inputRecords;
    },
  },
};
</script>

<style>
/* Back Button */
.back-link {
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  color: #DB4C77 !important;
}

.back-link:hover {
  background-color: rgba(219, 76, 119, 0.1) !important;
  transform: translateX(-2px) !important;
}

.back-link .v-icon {
  margin-right: 8px !important;
}
</style>