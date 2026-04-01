<template>
  <div>
    <!-- eslint-disable -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-row class="" no-gutters>
      <div class="text-h6 mt-n3 text-left"><b>Configure Flow</b></div>

      <v-spacer />

      <v-btn small @click="back_step()" class="mt-n4 white--text cardCss"
        >Back</v-btn
      >

      <v-btn small @click="next_option()" class="mt-n4 ml-2 white--text cardCss"
        >Next</v-btn
      >
    </v-row>
    <!-- <v-row class="" no-gutters>
      <div class="text-left ml-2 mt-2">
        <b>Configure Flow</b>
      </div>
    </v-row> -->
    <v-card flat max-width="600">
      <v-list>
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
          <template v-for="(item, index) in addedRecords">
            <v-list-item>
              <v-list-item-avatar>
                <v-icon color="blue" dark> mdi-cog </v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title
                  class=""
                  v-text="item.name"
                ></v-list-item-title>
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
                <!-- <v-icon
                    @click="delete_record(index)"
                    small
                    class="mr-n2"
                    color="red"
                  >
                    mdi-delete
                  </v-icon> -->
              </v-list-item-action>

              <!-- <v-divider
              v-if="index < addedRecords.length - 1"
              :key="index"
            ></v-divider> -->
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
          <!-- <v-list-item-action>
            <v-btn small color="green"> Add </v-btn>
          </v-list-item-action> -->
        </v-list-item>
      </v-list>
    </v-card>
    <v-dialog :model-value="addData" @update:model-value="$emit('update:addData', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
            Configure Steps
          </div></v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-list>
            <v-list-item-group v-model="stepsSelected">
              <v-list-item @input="get_input(stepsSelected)">
                <template>
                  <v-list-item-action>
                    <v-radio-group v-model="initiaorCheck">
                      <v-radio value="initiator" color="primary"></v-radio>
                    </v-radio-group>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title>Initiator</v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>
              <v-list-item @input="get_input(stepsSelected)">
                <template>
                  <v-list-item-action>
                    <v-radio-group v-model="initiaorRM">
                      <v-radio
                        value="repotingManager"
                        color="primary"
                      ></v-radio>
                    </v-radio-group>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title
                      >Initiator's - Reporting Manager</v-list-item-title
                    >
                  </v-list-item-content>
                </template>
              </v-list-item>

              <v-list-item @input="get_input(stepsSelected)">
                <template>
                  <v-list-item-action>
                    <v-radio-group v-model="teamMember">
                      <v-radio value="member_team" color="primary"></v-radio>
                    </v-radio-group>
                  </v-list-item-action>
                  <v-list-item-content v-if="teamMember != 'member_team'">
                    <v-list-item-title>Team Member</v-list-item-title>
                  </v-list-item-content>
                  <!--  <v-list-item-content v-if="teamMember == true"> -->
                  <v-row dense no-gutters v-if="teamMember == 'member_team'">
                    <v-col class="mt-6" cols="4">
                      <v-list-item-title>Team Member</v-list-item-title>
                    </v-col>
                    <v-col cols="8">
                      <v-select
                        dense
                        outlined
                        class="mt-3"
                        @change="get_input(2)"
                        v-model="teamMemberSelected"
                        :items="userList"
                        item-text="full_user_name"
                        item-value="user_id"
                        return-object
                        label="Select"
                      />
                    </v-col>
                  </v-row>
                  <!-- </v-list-item-content> -->
                </template>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn small @click="add_items()" class="white--text cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { get_workflow_roles } from "@/mixins/GetWorkflowRoles.js";
import { get_all_users } from "@/mixins/GetAllUsers.js";
import SnackBar from "@/components/SnackBar.vue";
export default {
  props: {
    formInfo: Object,
    currentFormSteps: Array,
    masterArray: Array,
    primaryField: String,
  },
  mixins: [get_workflow_roles, get_all_users],
  components: {
    SnackBar,
  },
  data() {
    return {
      addData: false,
      stepsSelected: [],
      rolesRM: false,
      initiaorRM: null,
      initiaorCheck: null,
      teamMember: null,
      teamMemberSelected: "",
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
    };
  },
  async created() {
    if (this.currentFormSteps.length > 0) {
      this.addedRecords = this.currentFormSteps;
    }
    // console.log(this.formInfo.form_template);
    this.formObject = this.formInfo.form_template;
    await this.get_workflow_roles();
    await this.get_all_users();
    this.fetch_details();
  },
  methods: {
    fetch_details() {
      this.userList = [];
      this.workflowList = [];
      this.worflowRoles.forEach((element) => {
        this.workflowList.push({
          workflow_role_name: element.workflow_role_name,
          workflow_role_id: element.workflow_role_id,
        });
      });

      this.listUsers.forEach((element) => {
        if (element.user_type != "CHATBOT") {
          this.userList.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    back_step() {
      this.$emit("backStep", this.formInfo);
      this.$emit("summary_data", this.primaryField);
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
      } else if (this.stepsSelected == 2 && this.teamMemberSelected == "") {
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
        this.teamMemberSelected = "";
        this.teamMember = null;
        newArray.splice(this.itemSelIndex + 1, 0, this.finalArray[0]);
        // var array3 = newArray.push({
        //   stepCount: count++,
        // });
        // this.addedRecords = [...newArray, ...this.finalArray];
        this.addedRecords = newArray;

        this.stepsSelected = [];
      }
    },

    get_input(index) {
      var count = 0;
      var data = [];
      this.inputRecords = [];
      if (index == 0 && index != undefined) {
        this.inputRecords.push({
          name: "Initiator",
          value: "initiator",
          key: "initiator",
          formDetails: this.formObject,
        });
        this.initiaorCheck = "initiator";
        this.initiaorRM = null;
        this.rolesRM = false;
        this.teamMember = null;
      } else if (index == 1 && index != undefined) {
        this.inputRecords.push({
          name: "Initiator's Reporting Manager",
          value: "initiator_reporting_manager",
          key: "initiator_reporting_manager",
          formDetails: this.formObject,
        });
        this.initiaorRM = "repotingManager";
        this.initiaorCheck = null;
        this.rolesRM = false;
        this.teamMember = null;
      } else if (index == 2 && index != undefined) {
        this.inputRecords.push({
          name: `Team Member (${this.teamMemberSelected.full_user_name})`,
          value: this.teamMemberSelected.user_id,
          key: "team_member",
          formDetails: this.formObject,
        });
        this.teamMember = "member_team";
        this.initiaorCheck = null;
        this.initiaorRM = null;
        this.rolesRM = false;
      }

      this.finalArray = this.inputRecords;
    },

    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
      this.inputRecords = [];
    },

    next_option() {
      var data = [];
      // console.log(this.addedRecords);
      this.$emit("flowData", this.addedRecords);

      localStorage.setItem("flowStepsInfo", JSON.stringify(this.addedRecords));
    },
  },
};
</script>