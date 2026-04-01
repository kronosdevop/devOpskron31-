<template>
  <div>
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
                    :disabled="localAddedRecords.length > 0"
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

          <v-list-item-group v-if="localAddedRecords.length != 0">
            <v-list-item
              v-for="(item, index) in localAddedRecords"
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
                      <v-icon size="small" color="white"> mdi-delete </v-icon>
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
    <v-dialog v-model="addData" persistent max-width="500">
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
import { configure_asset_workflows } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    assetTranferInfo: Object,
    assetTransferTemplate: Array,
    assetTransferRecords: Array,
    organizationUsers: Array,
  },
  emits: ["update:assetTransferRecords", "successMsg", "errorMsg"],
  data() {
    return {
      localAddedRecords: [],
      stepsSelected: [],
      initiaorRM: null,
      initiaorCheck: null,
      rolesRM: false,
      roleSelected: "",
      teamMember: null,
      itemSelIndex: null,
      addData: false,
      initiatorReportingManager: null,
      inputRecords: [],
      teamMemberSelected: null,
      userList: [],
      search: "",
      finalArray: [],
      loadingrec: false,
      initiatorRecord: null,
    };
  },
  created() {
    this.localAddedRecords = [...this.assetTransferRecords];
    this.fetch_users();
  },
  watch: {
    assetTransferRecords: {
      handler(newVal) {
        this.localAddedRecords = [...newVal];
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
    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
      this.inputRecords = [];
      this.initiatorRecord = null;
      this.teamMemberSelected = null;
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },
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
    delete_record(val) {
      this.localAddedRecords.splice(val, 1);
      this.$emit("update:assetTransferRecords", this.localAddedRecords);
      this.stepsSelected = [];
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
    },
    add_row(value) {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.itemSelIndex = value;
      this.addData = true;
    },
    fetch_selected_data(type) {
      this.inputRecords = [];
      if (type == "reportingmanager") {
        this.inputRecords.push({
          step_no: this.localAddedRecords.length + 1,
          name: "Initiator's Reporting Manager",
          user_type: "initiator_reporting_manager",
          workflow_template: this.assetTransferTemplate,
        });
        this.teamMember = null;
        this.initiatorRecord = null;
      } else if (type == "initiator") {
        this.inputRecords.push({
          step_no: this.localAddedRecords.length + 1,
          name: "Initiator",
          user_id: "N/A",
          user_type: "initiator",
          workflow_template: this.assetTransferTemplate,
        });
        this.initiatorReportingManager = null;
        this.teamMember = null;
      } else if (type == "member_team") {
        if (this.teamMemberSelected && this.teamMemberSelected.user_id) {
          this.inputRecords.push({
            step_no: this.localAddedRecords.length + 1,
            name: this.teamMemberSelected.title,
            user_id: this.teamMemberSelected.user_id,
            user_type: "team_member",
            workflow_template: this.assetTransferTemplate,
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
    add_items() {
      var newArray = this.localAddedRecords;

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

        this.localAddedRecords = newArray;
        this.$emit("update:assetTransferRecords", this.localAddedRecords);
        this.stepsSelected = [];
      }
    },
    add_dialog() {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.addData = true;
    },
    validate_approvals() {
      if (this.localAddedRecords.length == 0) {
        this.$emit("errorMsg", "Atleast add one approver user");
      } else {
        this.save_next_step();
      }
    },
    async save_next_step() {
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
              form_unique_type: "LOCATION_TRANSFER",
              workflow_approval_steps: JSON.stringify(this.localAddedRecords),
            },
          })
        );
        var response = JSON.parse(result.data.configure_asset_workflows);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

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