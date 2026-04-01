<template>
  <div>
    <v-card>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-card outlined flat max-width="600">
              <v-card-title>Adhoc Approval</v-card-title>
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
              <v-icon class="icon-class" @click="close_dialog()"
                >mdi-close</v-icon
              >
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
                <v-row no-gutters class="mt-n3">
                  <v-col cols="12">
                    <v-radio-group
                      @change="fetch_selected_data('reportingmanager')"
                      v-model="initiatorReportingManager"
                      row
                    >
                      <v-radio
                        label="Initiator's - Reporting Manager"
                        value="reportingmanager"
                      ></v-radio>
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
                <v-row no-gutters>
                  <v-col cols="6">
                    <v-radio-group
                      @change="fetch_selected_data(territoryHead, 'territory')"
                      v-model="territoryHead"
                      row
                    >
                      <v-radio
                        label="Territory Head"
                        value="territoryhead"
                      ></v-radio>
                    </v-radio-group>
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
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import { configure_visit_workflows } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_visit_workflows } from "@/graphql/queries.js";
import SnackBar from "@/components/SnackBar.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  mixins: [get_all_org_users],
  components: {
    SnackBar,
  },
  data() {
    return {
      addData: false,
      territoryHead: null,
      userList: [],
      search: "",
      inputRecords: [],
      SnackBarComponent: {},
      teamMember: null,
      initiaorCheck: null,
      adockWorkflowTemplate: [],
      initiaorRM: null,
      itemSelIndex: 0,
      loadingrec: false,
      initiatorRecord: null,
      initiatorReportingManager: null,
      addedRecords: [],
      teamMemberSelected: "",
    };
  },
  async mounted() {
    this.$store.commit("Setnamesearch", "");
    await this.get_all_org_users();
    await this.get_adhoc_approval_details();
    await this.fetch_users();
  },
  methods: {
    validate_approvals() {
      if (this.addedRecords.length === 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red", // Change color to indicate an error
          SnackbarText: "Atleast add one approver user",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.save_adhoc_appro();
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
    add_dialog() {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.addData = true;
    },
    async get_adhoc_approval_details() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_visit_workflows, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_visit_workflows);
        // this.isApproved = true;

        if (response.Status == "SUCCESS") {
          this.addedRecords = response.data[0].workflow_approval_steps;
          this.adockWorkflowTemplate = response.data[0].workflow_template;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red", // Change color to indicate an error
            SnackbarText: response.Message,
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
    async save_adhoc_appro(value) {
      this.loadingrec = true;

      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(configure_visit_workflows, {
            input: {
              organization_id: data.organization.organization_id,
              form_unique_type: "ADHOCK_LOG",
              workflow_approval_steps: JSON.stringify(this.addedRecords),
            },
          })
        );
        var response = JSON.parse(result.data.configure_visit_workflows);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.loadingrec = false;

          await this.get_adhoc_approval_details();
        } else {
          this.loadingrec = false;
        }
      } catch (error) {
        this.loadingrec = false;
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
    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;

      this.inputRecords = [];
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },
    delete_record(val) {
      this.addedRecords.splice(val, 1);

      this.initiaorRM = null;
      this.initiaorCheck = null;
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

        this.teamMemberSelected = "";
        this.teamMember = null;
        newArray.splice(this.itemSelIndex + 1, 0, this.finalArray[0]);

        this.addedRecords = newArray;
      }
    },
    fetch_selected_data(type) {
      this.inputRecords = [];
      if (type == "reportingmanager") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator's Reporting Manager",
          user_type: "initiator_reporting_manager",
          workflow_template: this.adockWorkflowTemplate,
        });
        this.teamMember = null;
        this.territoryHead = null;
        this.initiatorRecord = null;
      } else if (type == "initiator") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initiator",
          workflow_template: this.adockWorkflowTemplate,
        });
        this.initiatorReportingManager = null;
        this.territoryHead = null;
        this.teamMember = null;
      } else if (type == "member_team") {
        if (this.teamMemberSelected != "") {
          this.inputRecords.push({
            step_no: this.addedRecords.length + 1,
            name: this.teamMemberSelected.full_user_name,
            user_id: this.teamMemberSelected.user_id,
            user_type: "team_member",
            workflow_template: this.adockWorkflowTemplate,
          });

          this.initiatorReportingManager = null;
          this.teamMember = "member_team";
          this.initiaorCheck = null;
          this.initiaorRM = null;
          this.territoryHead = null;
          this.initiatorRecord = null;
        } else {
          this.initiatorReportingManager = null;
          this.initiatorRecord = null;
          this.territoryHead = null;
        }
      } else if (type == "territoryhead") {
        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
          name: "Territory Head",
          user_id: "N/A",
          user_type: "territory_head",
          workflow_template: this.adockWorkflowTemplate,
        });
        this.initiatorReportingManager = null;
        this.teamMember = null;
        this.initiaorCheck = null;
        this.initiaorRM = null;

        this.initiatorRecord = null;
      }

      this.finalArray = this.inputRecords;
    },
  },
};
</script>

<style>
</style>