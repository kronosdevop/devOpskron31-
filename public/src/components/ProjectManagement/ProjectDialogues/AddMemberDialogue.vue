<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="addProjectMemberDialogue"
      @update:model-value="$emit('update:addProjectMemberDialogue', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Add Project Members
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-select
                  v-model="memberType"
                  label="Member Type"
                  class="mt-4"
                  :items="[
                    { title: 'Internal', value: 'INTERNAL' },
                    { title: 'External', value: 'EXTERNAL' },
                  ]"
                  variant="outlined"
                  density="compact"
                  @update:model-value="cleardata()"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  v-if="memberType == 'INTERNAL'"
                  v-model="teamMembers"
                  label="Add Team Members"
                  class="mt-2"
                  :rules="memberType == 'INTERNAL' ? [(v) => !!v || 'required '] : []"
                  item-title="full_user_name"
                  item-value="user_email_id"
                  :items="userArray"
                  v-model:search="searchF"
                  hide-no-data
                  return-object
                  placeholder="Min 3 Character"
                  variant="outlined"
                  density="compact"
                  @update:model-value="searchF = ''"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-show="memberType == 'INTERNAL'"
                  v-model="userRole"
                  label="Role"
                  :rules="memberType == 'INTERNAL' ? [(v) => !!v || 'required '] : []"
                  :items="roleItems"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-show="memberType == 'EXTERNAL'"
                  v-model="externalUserName"
                  label="Name"
                  class="mt-2"
                  :rules="memberType == 'EXTERNAL' ? [(v) => !!v || 'required '] : []"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-show="memberType == 'EXTERNAL'"
                  v-model="externalEmail"
                  label="Email"
                  class="mt-2"
                  :rules="memberType == 'EXTERNAL'
                    ? [
                        (v) => !!v || 'Required',
                        (v) => /.+@.+\..+/.test(v) || 'Please enter a valid email address',
                      ]
                    : []"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-show="memberType == 'EXTERNAL'"
                  v-model="countrycode"
                  label="CC"
                  :rules="memberType == 'EXTERNAL' ? [(v) => !!v || 'required '] : []"
                  :items="countryitems"
                  style="max-width: 140px"
                  class="mt-2"
                  item-title="name"
                  item-value="code"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-show="memberType == 'EXTERNAL'"
                  v-model="contactNumber"
                  label="Contact Number"
                  class="mt-2 ml-2"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  maxlength="14"
                  :rules="memberType == 'EXTERNAL' ? [(v) => !!v || 'required '] : []"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data()"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { edit_project } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import CountryList from "@/JsonFiles/CountryList.json";
import { list_all_user_projects } from "@/graphql/queries.js";
export default {
  props: {
    addProjectMemberDialogue: Boolean,
    projData: Object,
  },
  mixins: [get_all_org_users],

  data() {
    return {
      teamMembers: "",
      searchF: "",
      userArray: [],
      userRole: "",
      loading: false,
      memberType: "",
      countryitems: [],
      projectMembers: [],
      roleItems: ["Member", "Observer"],
      contactNumber: "",
      countrycode: "+91",
      externalEmail: "",
      externalUserName: "",
    };
  },
  watch: {
    addProjectMemberDialogue: {
      async handler() {
        if (this.addProjectMemberDialogue == true) {
          this.$store.commit("Setnamesearch", "");
          this.memberType = "";
          await this.get_all_org_users();
          this.fetch_project_list();
          this.fetch_details();
        }
      },
      immediate: true,
    },
  },

  methods: {
    async fetch_project_list() {
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_user_projects, {
            input: {
              project_progress: "ALL",
            },
          })
        );

        var response = JSON.parse(result.data.list_all_user_projects);

        if (response.Status == "SUCCESS") {
          this.projectMembers = [];

          response.data.forEach((element) => {
            if (element.project_id == this.projData.project_id) {
              this.projectMembers = element.project_visible_members;
            }
          });
        } else {
          this.projectMembers = [];
        }
      } catch (error) {
        console.log(error);
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
    cleardata() {
      this.teamMembers = "";
      this.userRole = "";
      this.externalUserName = "";
      this.externalEmail = "";
      this.contactNumber = "";
    },
    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_email_id: element.user_email_id,
            user_country_code: element.user_country_code,
            user_contact_number: element.user_contact_number,
          });
        }
      });

      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid && this.memberType != "") {
        let existing = this.projectMembers;
        let data = {
          name:
            this.memberType == "INTERNAL"
              ? this.teamMembers.full_user_name
              : this.externalUserName,
          email:
            this.memberType == "INTERNAL"
              ? this.teamMembers.user_email_id
              : this.externalEmail,
          role: this.memberType == "INTERNAL" ? this.userRole : "",
          member_type: this.memberType,
          countryCode:
            this.memberType == "EXTERNAL"
              ? this.countrycode
              : this.teamMembers.user_country_code == "N/A"
              ? ""
              : this.teamMembers.user_country_code,
          contactNumber:
            this.memberType == "EXTERNAL"
              ? this.contactNumber
              : this.teamMembers.user_contact_number == "N/A"
              ? ""
              : this.teamMembers.user_contact_number,
        };
        const dataExisits = existing.some(
          (currentdata) => currentdata.email === data.email
        );
        if (dataExisits) {
          this.$emit("errorMsg", "User already Exist");
        } else {
          this.add_users_team();
        }
      }
    },

    async add_users_team() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_project, {
            input: {
              project_id: this.projData.project_id,
              project_visible_members: this.fetch_users(),
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.edit_project);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.teamMembers = [];
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    fetch_users() {
      let allMembers = [];
      let data = {
        name:
          this.memberType == "INTERNAL"
            ? this.teamMembers.full_user_name
            : this.externalUserName,
        email:
          this.memberType == "INTERNAL"
            ? this.teamMembers.user_email_id
            : this.externalEmail,
        role: this.memberType == "INTERNAL" ? this.userRole : "",
        member_type: this.memberType,
        countryCode:
          this.memberType == "EXTERNAL"
            ? this.countrycode
            : this.teamMembers.user_country_code == "N/A"
            ? ""
            : this.teamMembers.user_country_code,
        contactNumber:
          this.memberType == "EXTERNAL"
            ? this.contactNumber
            : this.teamMembers.user_contact_number == "N/A"
            ? ""
            : this.teamMembers.user_contact_number,
      };

      allMembers.push(data);
      var existing = this.projectMembers;
      var newData = allMembers;
      var final = existing.concat(newData);
      return JSON.stringify(final);
    },
  },
};
</script>