<template>
  <div>
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
                        <v-icon color="green" dark> mdi-cog </v-icon>
                        Start
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-col>
                  <v-col cols="6">
                    <v-list-item-action>
                      <v-btn
                        size="small"
                        :disabled="localAssetProcurmentRecords.length > 0"
                        class="white--text"
                        @click="add_dialog()"
                        color="green"
                      >
                        <v-icon size="small" color="white"> mdi-plus </v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-col>
                </v-row>
              </v-list-item>

              <v-list-item-group v-if="localAssetProcurmentRecords.length != 0">
                <v-list-item
                  v-for="(item, index) in localAssetProcurmentRecords"
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
                          <v-icon size="small" color="white"> mdi-plus </v-icon>
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
                :loading="loading"
                @click="validate_approvals()"
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
      <!-- <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon color="green" dark> mdi-cog </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="green-text">Start </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-row no-gutters>
              <v-col cols="6">
                <v-btn
                  small
                  :disabled="assetProcurmentRecords.length > 0"
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

        <v-list-item-group v-if="assetProcurmentRecords.length != 0">
          <template v-for="(item, index) in assetProcurmentRecords">
            <v-list-item :key="item.name">
              <v-list-item-avatar>
                <v-icon color="blue" dark> mdi-cog </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title class="">{{ item.name }}</v-list-item-title>
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
            <v-list-item-title class="red-text">Stop </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list> -->
      <!-- <v-card-actions class="justify-start">
        <v-btn
          depressed
          :loading="loadingrec"
          @click="validate_approvals()"
          dark
          class="cardCss text-capitalize button-corner ml-2"
        >
          save
        </v-btn>
      </v-card-actions> -->
    </v-card>
    <v-dialog
      v-model="addData"
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
            <v-row no-gutters class="mt-n3">
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
            </v-row>
            <v-row no-gutters class="mt-n3">
              <v-col cols="6">
                <v-radio-group v-model="teamMember" inline color="primary">
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
  </div>
</template>
<script>
/*eslint-disable*/
import { configure_asset_workflows } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import FormConfiguration from "@/components/Asset/Popups/FormConfiguration.vue";

export default {
  props: {
    assetproWrkTemplate: Array,
    assetProcurmentRecords: Array,
    assetProcureInfo: Object,
    organizationUsers: Array,
  },
  emits: ["update:assetProcurmentRecords", "successMsg", "errorMsg"],
  components: {
    FormConfiguration,
  },
  data() {
    return {
      addData: false,
      stepsSelected: [],
      finalArray: [],
      inputRecords: [],
      step: 1,
      retireWorkflowTemplate: [],
      initiatorRecord: null,
      teamMember: null,
      initiatorReportingManager: null,
      teamMemberSelected: "",
      loadingrec: false,
      search: "",
      addedFlowSteps: [],
      tableData: {},
      templete: [],
      loading: false,
      userList: [],
      localAssetProcurmentRecords: [],
    };
  },

  created() {
    this.tableData = this.assetProcureInfo;
    this.templete = this.assetproWrkTemplate;
    this.fetch_users();
    this.localAssetProcurmentRecords = [...this.assetProcurmentRecords];
  },

  watch: {
    assetProcurmentRecords: {
      handler(newVal) {
        this.localAssetProcurmentRecords = [...newVal];
      },
      immediate: true,
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
    fetch_users() {
      this.userList = [];
      this.organizationUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push({
            title: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      this.userList.sort((a, b) => a.title.localeCompare(b.title));
    },
    previous_step() {
      this.step = 1;
    },

    add_row(value) {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.itemSelIndex = value;
      this.addData = true;
    },
    save_mutation(value) {
      this.$emit("successMsg", value);
    },
    error_msg() {},

    delete_record(val) {
      this.localAssetProcurmentRecords.splice(val, 1);
      this.$emit(
        "update:assetProcurmentRecords",
        this.localAssetProcurmentRecords
      );
      this.stepsSelected = [];
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
    },
    close_dialog() {
      this.addData = false;
      this.initiatorReportingManager = null;
      this.teamMember = null;
      this.initiatorRecord = null;
      this.teamMemberSelected = null;
      this.inputRecords = [];
      this.$refs.form.resetValidation();
    },

    save_next_step() {
      this.addedFlowSteps = this.localAssetProcurmentRecords;
      localStorage.setItem(
        "flowSteps1Info",
        JSON.stringify(this.localAssetProcurmentRecords)
      );
      this.step = 2;
    },

    add_dialog() {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiatorReportingManager = null;
      this.initiatorRecord = null;
      this.addData = true;
    },

    fetch_selected_data(type) {
      this.inputRecords = [];
      if (type == "reportingmanager") {
        this.inputRecords.push({
          step_no: this.localAssetProcurmentRecords.length + 1,
          name: "Initiator's Reporting Manager",
          user_type: "initiator_reporting_manager",
          workflow_template: this.assetproWrkTemplate,
        });
        this.teamMember = null;
        this.initiatorRecord = null;
      } else if (type == "initiator") {
        this.inputRecords.push({
          step_no: this.localAssetProcurmentRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initiator",
          workflow_template: this.assetproWrkTemplate,
        });
        this.initiatorReportingManager = null;
        this.teamMember = null;
      } else if (type == "member_team") {
        if (this.teamMemberSelected && this.teamMemberSelected.user_id) {
          this.inputRecords.push({
            step_no: this.localAssetProcurmentRecords.length + 1,
            name: this.teamMemberSelected.title,
            user_id: this.teamMemberSelected.user_id,
            user_type: "team_member",
            workflow_template: this.assetproWrkTemplate,
          });

          this.initiatorReportingManager = null;
          this.teamMember = "member_team";
          this.initiatorRecord = null;
        } else {
          this.initiatorReportingManager = null;
          this.initiatorRecord = null;
        }
      }
      this.finalArray = this.inputRecords;
    },

    add_items() {
      var newArray = this.localAssetProcurmentRecords;
      var count = 0;
      if (this.inputRecords.length == 0) {
        this.$emit("errorMsg", "Select Atleast One Record");
      } else if (
        this.teamMember == "member_team" &&
        (!this.teamMemberSelected || !this.teamMemberSelected.user_id)
      ) {
        this.$emit("errorMsg", "Select Atleast One Member");
      } else {
        this.addData = false;
        this.initiaorRM = null;
        this.initiaorCheck = null;
        this.rolesRM = false;
        this.roleSelected = "";
        this.teamMemberSelected = null;
        this.teamMember = null;
        newArray.splice(this.itemSelIndex + 1, 0, this.finalArray[0]);
        this.localAssetProcurmentRecords = newArray;
        this.$emit(
          "update:assetProcurmentRecords",
          this.localAssetProcurmentRecords
        );
        this.stepsSelected = [];
      }
    },
    validate_approvals(value) {
      if (this.localAssetProcurmentRecords.length == 0) {
        this.$emit("errorMsg", "Atleast add one approver user");
        // this.SnackBarComponent = {
        //   SnackbarVmodel: true,
        //   SnackbarColor: "red", // Change color to indicate an error
        //   SnackbarText: "Atleast add one approver user",
        //   timeout: 5000,
        //   Top: true,
        // };
      } else {
        this.save_next_step();
      }
    },

    async save_asset_approval_asset() {
      // if (value == "RETIRE_ASSET") {
      //   this.loadingrec = true;
      // } else {
      //   this.loading = true;
      // }
      this.loadingrec = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(configure_asset_workflows, {
            input: {
              organization_id: data.organization.organization_id,
              form_unique_type: "PROCURE_ASSET_REQUEST",
              workflow_approval_steps: JSON.stringify(
                this.localAssetProcurmentRecords
              ),
            },
          })
        );
        var response = JSON.parse(result.data.configure_asset_workflows);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          // this.SnackBarComponent = {
          //   SnackbarVmodel: true,
          //   SnackbarColor: "green",
          //   SnackbarText: response.Message,
          //   timeout: 5000,
          //   Top: true,
          // };
          this.loadingrec = false;
        } else {
          this.loadingrec = false;
        }
      } catch (error) {
        this.loadingrec = false;
      }
    },
  },
};
</script>