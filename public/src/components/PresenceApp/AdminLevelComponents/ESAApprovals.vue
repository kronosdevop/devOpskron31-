<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

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
          <template v-for="(item, index) in addedRecords" :key="item.name">
            <v-list-item>
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
      </v-list>
      <!-- <v-card-actions class="justify-start">
        <v-btn
          depressed
          :loading="loading"
          @click="save_expense_head()"
          dark
          class="cardCss text-capitalize button-corner ml-2"
        >
          save
        </v-btn>
      </v-card-actions> -->
    </v-card>
    <v-dialog v-model="addData" transition="dialog-bottom-transition" persistent max-width="500">
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
            <v-row>
              <v-col cols="12">
                <v-select
                  density="compact"
                  variant="outlined"
                  class="mt-3"
                  @change="get_input(2)"
                  v-model="teamMemberSelected"
                  v-model:search-input="search"
                  :rules="[(v) => !!v || 'Required']"
                  :items="userList"
                  item-text="label"
                  item-value="value"
                  return-object
                  label="Select Member"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn small @click="add_items()" class="text-white cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */

// import { get_expense_forms } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

// import { update_expense_forms } from "@/graphql/mutations.js";

import SnackBar from "@/components/SnackBar.vue";
export default {
  mixins: [get_all_org_users],
  components: {
    SnackBar,
  },
  data() {
    return {
      addData: false,
      stepsSelected: [],
      rolesRM: false,
      loading: false,
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
      tableData: [],
      templete: [],
      search: "",
    };
  },
  async created() {
    this.$store.commit("Setnamesearch", this.search);
    await this.get_all_org_users();
    await this.fetch_users();
    // await this.get_initiated_expense();
  },
  watch: {
    addData: {
      async handler() {
        // await this.get_all_org_users();
      },
    },
  },
  methods: {
    async save_expense_head() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(update_expense_forms, {
            input: {
              user_email_id: data.user.user_email_id,
              workflow_id: this.tableData.workflow_id,
              workflow_approval_steps: JSON.stringify(this.addedRecords),
            },
          })
        );
        var response = JSON.parse(result.data.update_expense_forms);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.get_initiated_expense();
          this.$refs.form.reset();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };

        this.loading = false;
      }
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
    delete_record(val) {
      this.addedRecords.splice(val, 1);
      this.stepsSelected = [];
      this.initiaorRM = null;
      this.initiaorCheck = null;
      this.rolesRM = false;
      this.roleSelected = "";
    },
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
      this.addData = true;
    },

    add_items() {
      var newArray = this.addedRecords;
      //   var count = 0;
      if (this.$refs.form.validate()) {
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
        // console.log(newArray);
        this.addedRecords = newArray;

        this.stepsSelected = [];
        this.$refs.form.reset();
        this.$refs.form.resetValidation();
      }
    },
    get_input(index) {
      this.inputRecords = [];
      if (index == 2 && index != undefined) {
        // this.inputRecords = this.tableData.workflow_approval_steps;
        // var count=

        this.inputRecords.push({
          step_no: this.addedRecords.length + 1,
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
    async get_initiated_expense() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_expense_forms, {
            input: {
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_expense_forms);

        if (response.Status == "SUCCESS") {
          this.templete = response.data[0].workflow_template;
          this.tableData = response.data[0];

          this.addedRecords = this.tableData.workflow_approval_steps;
          if (this.addedRecords.length > 0) {
            for (let s = 0; s < this.addedRecords.length; s++) {
              let name = this.orgUsers.filter(
                (x) => x.user_id == this.addedRecords[s].user_id
              );

              this.addedRecords[s].name =
                name.length > 0 ? name[0].full_user_name : "N/A";
            }
          }
        } else {
          this.tableData = [];
        }
      } catch (error) {
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