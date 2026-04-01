<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="createPopup"
      @update:model-value="$emit('update:createPopup', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Create Directory</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-stepper v-model="directorySettings">
            <v-stepper-header>
              <v-stepper-step :complete="directorySettings > 1" step="1">
                Directory Settings
              </v-stepper-step>

              <v-divider></v-divider>

              <v-stepper-step :complete="directorySettings > 2" step="2">
                Entry Settings
              </v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <v-card v-if="directorySettings == 1" flat>
                  <v-card-text>
                    <v-form ref="forms">
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            @input="get_directory_name(directroyName)"
                            label="Directory Name"
                            density="compact"
                            class="mt-2"
                            variant="outlined"
                            :rules="[(v) => !!v || 'Required']"
                            v-model="directroyName"
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            rows="2"
                            auto-grow
                            density="compact"
                            variant="outlined"
                            :rules="[(v) => !!v || 'Required']"
                            label="Directory Description"
                            v-model="directoryDescription"
                          />
                        </v-col>

                        <v-col cols="12">
                          <div class="mt-n1"><b>Visible to -</b></div>
                          <v-radio-group
                            @change="clear_value()"
                            v-model="directoryVisbility"
                            class="ml-2"
                            :rules="[(v) => !!v || 'Required']"
                            row
                          >
                            <v-radio
                              label="All Members"
                              value="ALL_MEMBERS"
                            ></v-radio>
                            <v-radio
                              label="Restricted Users"
                              value="USERS"
                            ></v-radio>
                          </v-radio-group>
                        </v-col>
                        <!-- :rules="[
                              (v) =>
                                userDetails.length > 0 ||
                                'At least one user must be selected',
                            ]" -->
                        <v-col v-if="directoryVisbility == 'USERS'" cols="6">
                          <span>The user + any additional users if needed</span>
                          <v-autocomplete
                            density="compact"
                            v-model="userDetails"
                            label="Select Users"
                            :menu-props="{ maxHeight: '200' }"
                            variant="outlined"
                            multiple
                            :items="userList"
                            item-title="full_user_name"
                            item-value="user_id"
                            class="mt-2"
                            :search-input.sync="search"
                            @input="onuserinput"
                          >
                          </v-autocomplete>
                        </v-col>
                      </v-row>
                    </v-form>
                    <v-card-actions class="justify-end">
                      <v-btn color="primary" @click="validate_data()">
                        Continue
                      </v-btn>
                    </v-card-actions>
                  </v-card-text>
                </v-card>
              </v-stepper-content>
              <v-stepper-content step="2">
                <v-card v-if="directorySettings == 2" flat>
                  <v-card-text>
                    <v-form ref="form1">
                      <v-row no-gutters>
                        <v-col cols="6">
                          Entries in the directory are/can be -
                          <v-radio-group v-model="geoEntries" row>
                            <v-radio
                              label="Non Geo-tagged"
                              value="nongeoTagged"
                            ></v-radio>
                            <v-radio
                              label="Geo-tagged"
                              value="geotagged"
                            ></v-radio>
                          </v-radio-group>
                        </v-col>
                        <v-col cols="6">
                          Entries in the directory are sorted by -
                          <!-- style="max-width: 300px" -->
                          <v-select
                            label=""
                            class="mt-3"
                            v-model="sortOrderData"
                            :items="[
                              {
                                title: 'Title (alphabetical, ascending)',
                                value: 'title_alphabetical',
                              },
                              {
                                title: 'Title (alphabetical, descending)',
                                value: 'title_alphabetical_descending',
                              },

                              {
                                title: 'Created/Updated on (ascending)',
                                value: 'updated_on_ascending',
                              },

                              {
                                title: 'Created/Updated on (descending)',
                                value: 'updated_on_descending',
                              },
                            ]"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>

                        <!-- {
                              text: 'Updated On (ascending)',
                              value: 'updated_on_ascending',
                            }, -->
                        <v-col cols="6">
                          Entries require workflow approval -
                          <v-radio-group v-model="workflowApproval" row>
                            <v-radio label="Yes" value="yes"></v-radio>
                            <v-radio label="NO" value="no"></v-radio>
                          </v-radio-group>
                          <v-row no-gutters>
                            <v-col v-if="workflowApproval == 'yes'" cols="12">
                              <v-row no-gutters>
                                <v-col cols="4">
                                  <v-checkbox
                                    density="compact"
                                    v-model="newEntry"
                                    label="Adding New Entry"
                                    color="primary"
                                    hide-details
                                  ></v-checkbox>
                                </v-col>
                                <v-col cols="8">
                                  <v-autocomplete
                                    v-show="newEntry"
                                    class="mt-2"
                                    density="compact"
                                    label="Select Approval For Adding Entry"
                                    v-model="newEntryUSer"
                                    :menu-props="{ maxHeight: '200' }"
                                    variant="outlined"
                                    :items="userList"
                                    item-title="full_user_name"
                                    item-value="user_id"
                                    :search-input.sync="searchf"
                                    @input="searchf = ''"
                                  >
                                  </v-autocomplete>
                                </v-col>
                                <v-col cols="4">
                                  <v-checkbox
                                    density="compact"
                                    v-model="updateEntry"
                                    label="Updating Entry"
                                    color="primary"
                                    hide-details
                                  ></v-checkbox>
                                </v-col>
                                <v-col cols="8">
                                  <v-autocomplete
                                    v-show="updateEntry"
                                    class="mt-2"
                                    label="Select Approval for Updating Entry"
                                    v-model="updateUser"
                                    :menu-props="{ maxHeight: '200' }"
                                    variant="outlined"
                                    density="compact"
                                    :items="userList"
                                    item-title="full_user_name"
                                    item-value="user_id"
                                    :search-input.sync="searchg"
                                    @input="searchg = ''"
                                  >
                                  </v-autocomplete>
                                  <!-- <v-select
                                  v-show="updateEntry"
                                  class="mt-2"
                                  label="Select Approval"
                                  v-model="updateUser"
                                  density="compact"
                                  variant="outlined"
                                  :items="['dd']"
                                /> -->
                                </v-col>
                                <v-col cols="4">
                                  <v-checkbox
                                    density="compact"
                                    v-model="deleteEntry"
                                    label="Delete Entry"
                                    color="primary"
                                    hide-details
                                  ></v-checkbox>
                                </v-col>
                                <v-col cols="8">
                                  <v-autocomplete
                                    v-show="deleteEntry"
                                    class="mt-2"
                                    density="compact"
                                    label="Select Approval For Deleting Entry"
                                    v-model="deleteUser"
                                    :menu-props="{ maxHeight: '200' }"
                                    variant="outlined"
                                    :items="userList"
                                    item-title="full_user_name"
                                    item-value="user_id"
                                    :search-input.sync="searchh"
                                  >
                                  </v-autocomplete>
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-col cols="6">
                          Form Settings -
                          <v-checkbox
                            density="compact"
                            v-show="directoryVisbility == 'USERS'"
                            v-model="entryByAllMembers"
                            class="mt-2"
                            label="Allow entry creation by all internal members"
                          ></v-checkbox>
                          <v-checkbox
                            density="compact"
                            class=""
                            v-model="entryByExternalMembers"
                            label="Allow entry creation by all external members"
                          ></v-checkbox>
                          <v-text-field
                            v-show="entryByExternalMembers == true"
                            density="compact"
                            variant="outlined"
                            class="mt-n1"
                            :rules="
                              entryByExternalMembers == true
                                ? [(v) => !!v || 'Required']
                                : []
                            "
                            v-model="externalFormName"
                            label="External Form Name"
                          ></v-text-field>
                          <div style="font-size: 10px">
                            <i
                              >Note : By default, only directory subscribers can
                              add/modify/delete entries</i
                            >
                          </div>
                        </v-col>
                      </v-row>
                    </v-form>
                    <v-card-actions class="justify-end mt-1">
                      <v-btn color="primary" @click="back_action()">
                        Back
                      </v-btn>
                      <v-btn
                        color="primary"
                        :loading="loadingbtn"
                        class="ml-2"
                        @click="validate_final_submit()"
                      >
                        Confirm
                      </v-btn>
                    </v-card-actions>
                  </v-card-text>
                </v-card>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import {
  custom_directory_creation,
  subscribe_unsubscribe_from_directory,
} from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";

export default {
  props: {
    createPopup: Boolean,
  },
  mixins: [
    get_all_org_users,
    //  update_audit_logs
  ],

  data() {
    return {
      directorySettings: 1,
      directoryDescription: "",
      directroyName: "",
      geoEntries: "nongeoTagged",
      sortOrderData: "title_alphabetical",
      loadingbtn: false,
      directoryVisbility: false,
      userList: [],
      search: "",
      userDetails: [],
      entryApproval: null,
      workflowApproval: "no",
      newEntry: true,
      updateEntry: true,
      deleteEntry: true,
      selectUsers: [],
      deleteUser: "",
      updateUser: "",
      newEntryUSer: "",
      searchf: "",
      searchg: "",
      searchh: "",
      visibilityUsers: [],
      entryByAllMembers: false,
      entryByExternalMembers: false,
      externalFormName: "",
    };
  },
  watch: {
    createPopup: {
      async handler() {
        if (this.createPopup == true) {
          this.$store.commit("Setnamesearch", "");
          var data = this.$store.getters.GetUserObj;
          this.userList = [];
          // this.userDetails.push({
          //   full_user_name: data.user.full_user_name,
          //   user_id: data.user.user_id,
          // });
          await this.get_all_org_users();
          await this.fetch_details();
          this.deleteUser = data.user.user_id;
          this.updateUser = data.user.user_id;
          this.newEntryUSer = data.user.user_id;
        }
      },
      immediate: true,
    },

    newEntry: function (newValue) {
      if (!newValue && !this.updateEntry && !this.deleteEntry) {
        this.workflowApproval = "no";
      }
    },

    updateEntry: function (newValue) {
      if (!newValue && !this.newEntry && !this.deleteEntry) {
        this.workflowApproval = "no";
      }
    },
    deleteEntry: function (newValue) {
      if (!newValue && !this.newEntry && !this.updateEntry) {
        this.workflowApproval = "no";
      }
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      if (this.$refs.forms) {
        this.$refs.forms.reset();
      }
      if (this.$refs.form1) {
        this.$refs.form1.reset();
      }
      this.directorySettings = 1;
      this.userList = [];
    },

    onuserinput(value) {
      if (!value.includes(this.$store.getters.GetUserObj.user.user_id)) {
        value.push(this.$store.getters.GetUserObj.user.user_id);
      }
      this.userDetails = value;
      this.search = "";
    },

    clear_value() {
      var data = this.$store.getters.GetUserObj;
      if (this.directoryVisbility == "ALL_MEMBERS") {
        this.userDetails = [];
        // this.userDetails = data.user.user_id;
      } else {
        this.userDetails.push(data.user.user_id);
        // this.userList = data.user.user_id;
        // this.userList.forEach((element) => {
        //   // if (element.user_id != data.user.user_id) {
        //   this.visibilityUsers.push({
        //     full_user_name: element.full_user_name,
        //     user_id: element.user_id,
        //   });
        //   // }
        // });
      }
    },

    fetch_details() {
      var data = this.$store.getters.GetUserObj;
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    get_directory_name(value) {
      this.directoryDescription = value;
    },

    async validate_final_submit() {
      const { valid } = await this.$refs.form1.validate();
      if (valid) {
        this.save_mutation();
      }
    },

    async validate_data() {
      const { valid } = await this.$refs.forms.validate();
      if (valid) {
        this.directorySettings = 2;
      }
    },

    back_action() {
      this.directorySettings = 1;
    },

    async save_mutation() {
      this.loadingbtn = true;

      var data = this.$store.getters.GetUserObj;
      // if (this.entryByExternalMembers == true) {
      //   this.$store.commit("SetExternalForm", true);
      // }

      // this.userDetails.push(data.user.user_id);

      try {
        let result = await API.graphql(
          graphqlOperation(custom_directory_creation, {
            input: {
              directory_name: this.directroyName,
              directory_description: this.directoryDescription,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              is_geo_tagged: this.geoEntries == "geotagged" ? true : false,
              directory_sort_order: this.sortOrderData,
              directory_visibility_type: this.directoryVisbility,
              directory_visibility_users:
                this.directoryVisbility == "USERS"
                  ? this.userDetails
                  : undefined,
              directory_workflow_approval:
                this.workflowApproval == "yes" ? true : false,
              directory_addEntry_workflow_approval:
                this.workflowApproval == "yes" ? this.newEntry : false,
              directory_add_entry_admin:
                this.workflowApproval == "yes" && this.newEntry == true
                  ? this.newEntryUSer
                  : undefined,
              directory_editEntry_workflow_approval:
                this.workflowApproval == "yes" ? this.updateEntry : false,
              directory_edit_entry_admin:
                this.workflowApproval == "yes" && this.updateEntry == true
                  ? this.updateUser
                  : undefined,
              directory_deleteEntry_workflow_approval:
                this.workflowApproval == "yes" ? this.deleteEntry : false,
              directory_delete_entry_admin:
                this.workflowApproval == "yes" && this.deleteEntry == true
                  ? this.deleteUser
                  : undefined,
              is_directory_enabled_as_form: this.entryByAllMembers,
              is_directory_enabled_as_extrenal_form:
                this.entryByExternalMembers,
              external_form_name: this.externalFormName,
            },
          })
        );
        var response = JSON.parse(result.data.custom_directory_creation);
        this.loadingbtn = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.subscribe_to_directory(response.directory_id, data);
          // this.fetch_audit_message();
          var respponseData = {
            directory_name: this.directroyName,
            directory_id: response.directory_id,
            is_directory_designed: false,
          };
          if (this.entryByExternalMembers == true) {
            this.$store.commit("SetExternalForm", true);
          } else {
            this.$store.commit("SetExternalForm", false);
          }

          this.$emit("successResponse", respponseData);
        } else {
          this.loadingbtn = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error);
        this.$emit("errorMsg", error.errors[0].message);
        this.loadingbtn = false;
      }
    },

    async subscribe_to_directory(dirID, userId) {
      try {
        let result = await API.graphql(
          graphqlOperation(subscribe_unsubscribe_from_directory, {
            input: {
              directory_id: dirID,
              // user_id: userId.user_id,
              action_type: "SUBSCRIBE",
            },
          })
        );
        var response = JSON.parse(
          result.data.subscribe_unsubscribe_from_directory
        );
      } catch (error) {}
    },

    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "DIRECTORY_ACTION",
        AuditAction: "CREATE_DIRECTORY",
        AuditMessage: `${data.user.full_user_name} Created   ${this.directroyName} Directory`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>