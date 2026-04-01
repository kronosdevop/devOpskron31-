<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card-text>
      <v-row class="mt-3">
        <v-spacer />
        <v-spacer />
        <v-btn small @click="back_option()" class="white--text cardCss"
          >Back</v-btn
        >

        <v-btn small @click="next_option()" class="ml-2 white--text cardCss"
          >Next</v-btn
        >
      </v-row>
      <v-card class="mt-2" flat width="600px">
        <!-- <v-toolbar elevation="0" flat dense>
        <v-toolbar-title class="text--white ml-2">Create Flow</v-toolbar-title>
        <v-spacer />
      </v-toolbar> -->

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
            <div v-for="(item, index) in addedRecords" :key="index">
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
                </v-list-item-action>
              </v-list-item>
            </div>
          </v-list-item-group>
          <v-list-item>
            <v-list-item-avatar>
              <v-icon color="red" dark> mdi-cog </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="red-text">Stop </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <!-- <v-card-actions class="justify-start ml-7">
        <v-btn
          depressed
          :loading="loading"
          @click="save_data()"
          dark
          class="cardCss button-corner text-capitalize"
        >
          Save
        </v-btn>
      </v-card-actions> -->
      </v-card>
    </v-card-text>
    <v-dialog :model-value="addData" @update:model-value="$emit('update:addData', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Configure Steps</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-list>
            <v-list-item-group v-model="stepsSelected">
              <!-- <v-list-item @input="get_input(0)">
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
              </v-list-item> -->
              <!-- <v-list-item @input="get_input(1)">
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
                      >Initiator Reporting Manager</v-list-item-title
                    >
                  </v-list-item-content>
                </template>
              </v-list-item> -->

              <v-list-item @input="get_input(0)">
                <template>
                  <!-- <v-list-item-action>
                    <v-radio-group v-model="teamMember">
                      <v-radio value="member_team" color="primary"></v-radio>
                    </v-radio-group>
                  </v-list-item-action>
                  <v-list-item-content v-if="teamMember != 'member_team'">
                    <v-list-item-title>Team Member</v-list-item-title>
                  </v-list-item-content> -->

                  <v-row dense no-gutters>
                    <!-- <v-col class="mt-6" cols="4">
                      <v-list-item-title>Team Member</v-list-item-title>
                    </v-col> -->
                    <v-col cols="12">
                      <v-autocomplete
                        class="mt-3"
                        label="Select Team Member"
                        v-model="teamMemberSelected"
                        :items="userList"
                        :search-input.sync="search"
                        @input="search = ''"
                        item-text="full_user_name"
                        @change="get_input(0)"
                        item-value="user_id"
                        dense
                        outlined
                        return-object
                        :menu-props="{ offsetY: true, maxHeight: 200 }"
                      ></v-autocomplete>

                      <!-- <v-select
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
                      /> -->
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
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";

import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
// import { get_custom_forms } from "@/mixins/GetCustomForms.js";
export default {
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  components: {
    SnackBar,
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
      teamMember: null,
      teamMemberSelected: "",
      itemSelIndex: 0,
      stepsSelected: [],
      formElement: {},
      stepsCount: [],
      search: "",
    };
  },
  async created() {
    this.$store.commit("Setnamesearch", this.search);
    await this.get_all_org_users();
    if (this.params.currentFormSteps.length != 0) {
      this.addedRecords = this.params.currentFormSteps;
    } else {
      this.fetch_users();
    }
    // await this.get_custom_forms();
  },
  methods: {
    handleClick(item) {
      this.formDetails = item;
      this.componentCheck = 1;
      this.flowDialog = true;
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

    get_input(index) {
      var count = 0;
      var data = [];
      this.inputRecords = [];
      if (index == 0 && index != undefined) {
        this.inputRecords.push({
          name: `Team Member (${this.teamMemberSelected.full_user_name})`,
          value: this.teamMemberSelected.user_id,
          key: "team_member",
          formDetails: this.params.formSelected.form_template,
        });
        this.teamMember = "member_team";
        this.initiaorCheck = null;
        this.initiaorRM = null;
        this.rolesRM = false;
      } else if (index == 1 && index != undefined) {
        this.inputRecords.push({
          name: "'Initiator's' Reporting Manager",
          value: "initiator_reporting_manager",
          key: "initiator_reporting_manager",
          formDetails: this.params.formSelected.form_template,
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
          formDetails: this.params.formSelected.form_template,
        });
        this.teamMember = "member_team";
        this.initiaorCheck = null;
        this.initiaorRM = null;
        this.rolesRM = false;
      }

      this.finalArray = this.inputRecords;
    },
    delete_record(val) {
      this.addedRecords.splice(val, 1);
      this.stepsSelected = [];
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
    },
    back_data() {
      this.componentCheck = 1;
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
    close_dialog() {
      this.addData = false;
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
      this.teamMemberSelected = "";
      this.inputRecords = [];
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
        this.rolesRM = false;
        this.roleSelected = "";
        this.teamMemberSelected = "";
        this.teamMember = null;
        newArray.splice(this.itemSelIndex + 1, 0, this.finalArray[0]);

        this.addedRecords = newArray;

        this.stepsSelected = [];
      }
    },
    back_option() {
      var selectesData = this.params.formSelected;

      this.$emit("backACtion", "backdata");
    },

    next_option() {
      this.$emit("flowData", this.addedRecords);
      localStorage.setItem("flowStepsInfo", JSON.stringify(this.addedRecords));
    },
  },
};
</script>
