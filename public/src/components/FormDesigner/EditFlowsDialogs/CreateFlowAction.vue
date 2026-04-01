<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card-text>
      <v-row class="mt-3">
        <v-spacer />
        <v-btn size="small" @click="back_action()" class="text-white cardCss"
          >Back</v-btn
        >
        <v-btn
          :disabled="apicalledcheck == 0"
          size="small"
          @click="next_option()"
          class="ml-2 text-white cardCss"
          >Next</v-btn
        >
      </v-row>
      <v-card class="mt-2" flat width="700px">
        <span>
          <v-radio-group
            v-model="toggle_exclusive"
            inline
            @change="changeData()"
          >
            <v-radio label="Normal Flow" value="DEFAULT"></v-radio>
            <v-radio
              label="External API"
              value="EXTERNAL_API"
              :disabled="flowvisibilty == true"
            ></v-radio>
            <v-radio
              label="External Form"
              value="EXTERNAL_FORM"
              :disabled="flowvisibilty == true"
            ></v-radio>
          </v-radio-group>
          <span v-if="flowvisibilty == true">
            (The form contains system fields, so external APIs and external
            forms cannot be used.)</span
          >
        </span>
        <v-list dense>
          <v-list-item>
            <template v-slot:prepend>
              <v-list-item-avatar>
                <v-icon color="green" dark> mdi-cog </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="green-text">Start </v-list-item-title>
              </v-list-item-content>
            </template>
            <template v-slot:append>
              <v-list-item-group>
                <v-row no-gutters>
                  <v-col cols="6">
                    <v-btn
                      size="small"
                      class="white--text"
                      @click="add_row()"
                      color="green"
                    >
                      <v-icon size="small" color="white"> mdi-plus </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item-group>
            </template>
          </v-list-item>
          <v-list-item-group v-if="addedRecords.length != 0">
            <div v-for="(item, index) in addedRecords" :key="index">
              <v-list-item>
                <template v-slot:prepend>
                  <v-list-item-avatar>
                    <v-icon color="blue" dark> mdi-cog </v-icon>
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title
                      class=""
                      v-text="item.name"
                    ></v-list-item-title>
                  </v-list-item-content>
                </template>
                <template v-slot:append>
                  <v-list-item-icon>
                    <v-row no-gutters>
                      <v-col :cols="item.key == 'hook' ? '4' : '6'">
                        <v-btn
                          size="small"
                          class="white--text"
                          @click="add_row(index)"
                          color="primary"
                          style=""
                        >
                          Add
                          <!-- <v-icon size="small" color="white"> mdi-plus </v-icon> -->
                        </v-btn>
                      </v-col>

                      <v-col :cols="item.key == 'hook' ? '4' : '6'">
                        <v-btn
                          size="small"
                          class="white--text"
                          @click="delete_record(index)"
                          color="red"
                          >Delete
                          <!-- <v-icon size="small" color="white"> mdi-delete </v-icon> -->
                        </v-btn>
                      </v-col>
                      <v-col :cols="item.key == 'hook' ? '4' : '6'">
                        <v-btn
                          v-if="item.key == 'hook'"
                          size="small"
                          class="white--text"
                          @click="configure_record(item, index)"
                          color="green"
                          >Configure
                          <!-- <v-icon size="small" color="white"> mdi-delete </v-icon> -->
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-list-item-icon>
                </template>
              </v-list-item>
            </div>
          </v-list-item-group>
          <v-list-item>
            <template v-slot:prepend>
              <v-list-item-avatar>
                <v-icon color="red" dark> mdi-cog </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="red-text">Stop </v-list-item-title>
              </v-list-item-content>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-card-text>
    <v-dialog
      :model-value="addData"
      @update:model-value="$emit('update:addData', $event)"
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
            <v-row no-gutters v-if="toggle_exclusive == 'DEFAULT'">
              <v-col cols="6">
                <v-radio-group
                  @change="fetch_selected_data('initiator')"
                  v-model="initiatorRecord"
                  row
                >
                  <v-radio label="Initiator" value="initiator"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row
              class="mt-n3"
              no-gutters
              v-if="toggle_exclusive == 'DEFAULT'"
            >
              <v-col cols="6">
                <v-radio-group
                  @change="fetch_selected_data('group')"
                  v-model="initiatorgroup"
                  row
                >
                  <v-radio
                    label="Initiator Group Head"
                    value="initiator Group Head"
                  ></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row
              class="mt-n3"
              no-gutters
              v-if="toggle_exclusive == 'DEFAULT'"
            >
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
            <v-row
              no-gutters
              :class="toggle_exclusive == 'DEFAULT' ? 'mt-n3' : 'mt-4'"
            >
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
                  density="compact"
                  variant="outlined"
                  class="mt-3"
                  @update:focused="fetch_selected_data('member_team')"
                  v-model="teamMemberSelected"
                  :rules="[(v) => !!v || 'Required']"
                  :items="userList"
                  item-title="full_user_name"
                  item-value="user_id"
                  return-object
                  label="Select Member"
                />
              </v-col>
            </v-row>
            <v-row class="mt-n3" no-gutters>
              <v-col cols="12">
                <v-radio-group
                  @change="fetch_selected_data('hook')"
                  v-model="hookStep"
                  row
                >
                  <v-radio
                    label="Hook (Third Party System Integration )"
                    value="hook"
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
    <div v-if="configureCheck == 1">
      <ConfigureWebhook
        :selecctehookItem="selecctehookItem"
        :configureWebhookDialog="configureWebhookDialog"
        v-on:saveAction="webhook_data"
        @clicked="configureWebhookDialog = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import ConfigureWebhook from "@/components/FormDesigner/FormDialogs/ConfigureWebhook.vue";

import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  components: {
    SnackBar,
    ConfigureWebhook,
  },
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  mixins: [get_all_org_users],
  data() {
    return {
      SnackBarComponent: {},
      componentCheck: 0,
      formDetails: {},
      loading: false,
      inputRecords: [],
      initiaorCheck: null,
      initiaorRM: null,
      addData: false,
      userList: [],
      addedRecords: [],
      finalArray: [],
      itemSelIndex: 0,
      stepsSelected: [],
      formElement: {},
      stepsCount: [],
      search: "",
      toggle_exclusive: "DEFAULT",
      hookStep: null,
      initiatorReportingManager: null,
      initiatorRecord: null,
      initiatorgroup: null,
      teamMember: null,
      teamMemberSelected: "",
      startCheck: false,
      configureWebhookDialog: false,
      flowvisibilty: false,
      configureCheck: 0,
      selectedIndex: null,
      selecctehookItem: {},
      apicalledcheck: 0,
    };
  },

  async created() {
    this.$store.commit("Setnamesearch", this.search);
    await this.get_all_org_users();
    const targetKeys = [
      "multiple_user_picker",
      "designation",
      "location_id",
      "department",
      "user_id",
    ];
    const containsTargetKey =
      this.$store.getters.GetFlowItem.workflow_template.some((item) =>
        targetKeys.includes(item.key)
      );
    this.flowvisibilty = containsTargetKey;

    if (this.params.formType != "") {
      this.toggle_exclusive = this.params.formType;
    } else {
      this.toggle_exclusive =
        this.$store.getters.GetFlowItem.workflow_design_type == undefined
          ? "DEFAULT"
          : this.$store.getters.GetFlowItem.workflow_design_type;
    }
    // if (this.params.currentFormSteps.length != 0 ) {
    if (this.params.formType != "") {
      this.addedRecords = this.params.currentFormSteps;

      this.fetch_users();
    } else {
      this.fetch_current_steps();
      this.fetch_users();
    }
    this.apicalledcheck = 1;
  },
  methods: {
    changeData() {
      this.addedRecords = [];
    },
    fetch_current_steps() {
      var currentSteps = this.params.formSelected.workflow_approval_steps;

      currentSteps.forEach((element) => {
        this.addedRecords.push({
          name: this.fethc_name(element.user_type, element),
          value:
            element.user_type == "team_member"
              ? element.user_id
              : element.user_type,
          key: element.user_type,
          formDetails: element.workflow_template,
          index: element.step_no - 1,
          hooks_details:
            element.user_type == "hook" ? element.hooks_details : {},
          action_buttons:
            element.action_buttons != undefined
              ? element.action_buttons
              : "approveRejectForward",
          enable_attachments:
            element.enable_attachments != undefined
              ? element.enable_attachments
              : false,
          enable_geoLocation:
            element.enable_geoLocation != undefined
              ? element.enable_geoLocation
              : false,
        });
      });
      // console.log(this.addedRecords);
    },

    close_dialog() {
      this.addData = false;
      this.initiatorRecord = null;
      this.initiatorgroup = null;
      this.initiatorReportingManager = null;
      this.rolesRM = false;
      this.roleSelected = "";
      this.teamMemberSelected = "";
      this.teamMember = null;
      this.hookStep = null;
      this.startCheck = false;
      this.stepsSelected = [];

      this.initiaorRM = null;
      this.initiaorCheck = null;

      this.inputRecords = [];
    },

    configure_record(item, val) {
      // console.log(item);
      this.selecctehookItem = item;
      this.selectedIndex = val;
      this.configureCheck = 1;
      this.configureWebhookDialog = true;
    },

    webhook_data(val) {
      this.configureWebhookDialog = false;

      for (var i = 0; i < this.addedRecords.length; i++) {
        if (this.addedRecords[i].index == this.selectedIndex) {
          this.addedRecords[i].hooks_details = val;
        }
      }
      // console.log(this.addedRecords);
    },
    add_row(value) {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.itemSelIndex = value;
      this.addData = true;
    },

    fethc_name(value, obj) {
      if (value == "initiator") {
        return "Initiator";
      } else if (value == "initiator_reporting_manager") {
        return "Initiator's Reporting Manager";
      } else if (value == "team_member") {
        var name = this.get_name(obj.user_id);
        return `Team Member (${name})`;
      } else if (value == "hook") {
        return "Hook";
      } else if (value == "group_head") {
        return "Initiator's Group Head";
      }
    },
    get_name(value) {
      var name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
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

    delete_record(val) {
      this.addedRecords.splice(val, 1);
      for (let i = 0; i < this.addedRecords.length; i++) {
        this.addedRecords[i].index = i;
      }
      this.stepsSelected = [];
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
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

    fetch_selected_data(type) {
      this.inputRecords = [];
      if (type == "initiator") {
        this.inputRecords.push({
          name: "Initiator",
          value: "initiator",
          key: "initiator",
          formDetails: this.params.formSelected.workflow_template,
          index: this.addedRecords.length,
          action_buttons: "approveRejectForward",
          enable_attachments: false,
          enable_geoLocation: false,
        });
        this.initiatorReportingManager = null;
        this.teamMember = null;
        this.groupsHead = null;
        this.hookStep = null;
        this.initiatorgroup = null;
      } else if (type == "reportingmanager") {
        this.inputRecords.push({
          name: "Initiator's Reporting Manager",
          value: "initiator_reporting_manager",
          key: "initiator_reporting_manager",
          formDetails: this.params.formSelected.workflow_template,
          index: this.addedRecords.length,
          action_buttons: "approveRejectForward",
          enable_attachments: false,
          enable_geoLocation: false,
        });
        this.teamMember = null;
        this.groupsHead = null;
        this.initiatorRecord = null;
        this.initiatorgroup = null;
        this.hookStep = null;
      } else if (type == "member_team") {
        if (this.teamMemberSelected != "") {
          this.inputRecords.push({
            name: `Team Member (${this.teamMemberSelected.full_user_name})`,
            value: this.teamMemberSelected.user_id,
            key: "team_member",
            formDetails: this.params.formSelected.workflow_template,
            index: this.addedRecords.length,
            action_buttons: "approveRejectForward",
            enable_attachments: false,
            enable_geoLocation: false,
          });
          this.groupsHead = null;
          this.initiatorRecord = null;
          this.initiatorgroup = null;
          this.initiatorReportingManager = null;
          this.hookStep = null;
        } else {
          this.groupsHead = null;
          this.initiatorRecord = null;
          this.initiatorgroup = null;
          this.initiatorReportingManager = null;
          this.hookStep = null;
        }
      } else if (type == "group_head") {
        this.inputRecords.push({
          name: `Group (${this.teamMemberSelected.full_user_name})`,
          value: "N/A",
          key: "grouo_head",
          formDetails: this.params.formSelected.workflow_template,
          index: this.addedRecords.length,
          action_buttons: "approveRejectForward",
          enable_attachments: false,
          enable_geoLocation: false,
        });
        this.teamMember = null;
        this.initiatorRecord = null;
        this.initiatorgroup = null;
        this.initiatorReportingManager = null;
        this.hookStep = null;
      } else if (type == "hook") {
        this.inputRecords.push({
          name: "Hook (Third Party System Integration )",
          value: "N/A",
          key: "hook",
          formDetails: this.params.formSelected.workflow_template,
          hooks_details: {},
          index: this.addedRecords.length,
          action_buttons: "approveRejectForward",
          enable_attachments: false,
          enable_geoLocation: false,
        });
        this.teamMember = null;
        this.initiatorRecord = null;
        this.initiatorgroup = null;
        this.initiatorReportingManager = null;
      } else if (type == "group") {
        this.inputRecords.push({
          name: "Initiator's Group Head",
          value: "group_head",
          key: "group_head",
          formDetails: this.params.formSelected.workflow_template,
          index: this.addedRecords.length,
          action_buttons: "approveRejectForward",
          enable_attachments: false,
          enable_geoLocation: false,
        });
        this.initiatorReportingManager = null;
        this.teamMember = null;
        this.groupsHead = null;
        this.hookStep = null;
        this.initiatorRecord = null;
      }
      // console.log(this.params.formSelected.formTemplate);
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
        this.initiatorRecord = null;
        this.initiatorgroup = null;
        this.initiatorReportingManager = null;
        this.rolesRM = false;
        this.roleSelected = "";
        this.teamMemberSelected = "";
        this.teamMember = null;
        this.hookStep = null;
        if (this.startCheck == true) {
          this.addedRecords.unshift(this.inputRecords[0]);
        } else {
          newArray.splice(this.itemSelIndex + 1, 0, this.inputRecords[0]);

          this.addedRecords = newArray;
        }

        this.startCheck = false;
        this.stepsSelected = [];
      }
    },

    next_option() {
      let isHookDetailsEmpty = false;

      this.addedRecords.forEach((element) => {
        if (
          element.key === "hook" &&
          Object.keys(element.hooks_details).length === 0
        ) {
          isHookDetailsEmpty = true;
        }
      });

      if (isHookDetailsEmpty) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Configure Webhook For Hook",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.$emit("flowData", this.addedRecords);
        this.$emit("formflownext", this.toggle_exclusive);
        // console.log(this.addedRecords);
        // console.log(this.addedRecords);
        localStorage.setItem("editFlowData", JSON.stringify(this.addedRecords));
      }
      // console.log(this.addedRecords);
    },

    back_action() {
      this.$emit("firstBackAction", this.addedRecords);
    },
  },
};
</script>