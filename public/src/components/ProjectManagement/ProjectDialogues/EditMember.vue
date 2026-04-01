<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="editMemberDialogue"
      @update:model-value="$emit('update:editMemberDialogue', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Edit Member
              {{ memberType == "INTERNAL" ? externalUserName : "" }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row>
              <v-col cols="12" v-if="memberType == 'INTERNAL'">
                <v-select
                  v-model="role"
                  label="Role"
                  :rules="memberType == 'INTERNAL' ? [(v) => !!v || 'required '] : []"
                  :items="roleItems"
                  variant="outlined"
                  density="compact"
                />
                <!-- <v-text-field
                  v-model="role"
                  outlined
                  dense
                  label="Role"
                  :rules="
                    memberType == 'INTERNAL' ? [(v) => !!v || 'required '] : []
                  "
                /> -->
                <!-- <v-checkbox
                  class="mt-n5"
                  v-if="reportEnabled"
                  :label="
                    reportCheck
                      ? 'Report trigger enabled'
                      : 'Report trigger disabled'
                  "
                  v-model="reportCheck"
                /> -->
              </v-col>
              <v-col cols="12" v-if="memberType == 'EXTERNAL'">
                <v-text-field
                  v-model="externalUserName"
                  label="Name"
                  :rules="memberType == 'EXTERNAL' ? [(v) => !!v || 'required '] : []"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
                <v-text-field
                  v-model="externalEmail"
                  label="Email"
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
              <v-col cols="6" class="mt-n5" v-if="memberType == 'EXTERNAL'">
                <v-select
                  v-model="countrycode"
                  label="CC"
                  :rules="memberType == 'EXTERNAL' ? [(v) => !!v || 'required '] : []"
                  :items="countryitems"
                  style="max-width: 140px"
                  item-title="name"
                  item-value="code"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="6" class="mt-n5" v-if="memberType == 'EXTERNAL'">
                <v-text-field
                  v-model="contactNumber"
                  label="Contact Number"
                  class="ml-2"
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
            depressed
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="cardCss"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
import { edit_project } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import CountryList from "@/JsonFiles/CountryList.json";
export default {
  props: {
    editMemberDialogue: Boolean,
    rowInfo: Object,
    currentData: Object,
  },

  data() {
    return {
      loading: false,
      reportCheck: false,
      externalUserName: "",
      externalEmail: "",
      countrycode: "",
      contactNumber: "",
      role: "",
      memberType: "",
      countryitems: [],
      roleItems: [ "Member", "Observer"],
      reportEnabled: false,
      visibleMembers: [],
    };
  },
  watch: {
    editMemberDialogue: {
      async handler() {
        if (this.editMemberDialogue == true) {
          this.fetchDetails();
          this.reportEnabled =
            this.rowInfo.project_status_report.enabled_member_report;

          this.externalUserName = this.currentData.name;
          this.reportCheck =
            this.currentData.is_report == undefined
              ? false
              : this.currentData.is_report;
          this.externalEmail = this.currentData.email;
          this.role = this.currentData.role;
          this.countrycode = this.currentData.countryCode;
          this.contactNumber = this.currentData.contactNumber;
          this.memberType = this.currentData.member_type;

          this.visibleMembers = [...this.rowInfo.project_visible_members];

          const index = this.visibleMembers.findIndex(
            (user) =>
              user.name === this.currentData.name &&
              user.email === this.currentData.email
          );

          // If found, remove it
          if (index !== -1) {
            this.visibleMembers.splice(index, 1);
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
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
    fetchDetails() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(edit_project, {
              input: {
                project_id: this.rowInfo.project_id,
                project_visible_members: this.fetch_users(),
              },
            })
          );

          this.loading = false;
          var response = JSON.parse(result.data.edit_project);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },

    fetch_users() {
      if (this.memberType == "EXTERNAL") {
        let userUpdate = {
          contactNumber: this.contactNumber,
          countryCode: this.countrycode,
          email: this.externalEmail,
          member_type: "EXTERNAL",
          name: this.externalUserName,
          role: "",
          is_report: false,
        };
        this.visibleMembers.push(userUpdate);
        let existing = this.visibleMembers;

        return JSON.stringify(existing);
      } else {
        let userUpdate = {
          contactNumber: this.contactNumber,
          countryCode: this.countrycode,
          email: this.externalEmail,
          member_type: "INTERNAL",
          name: this.externalUserName,
          role: this.role,
          is_report: this.reportCheck,
        };
        this.visibleMembers.push(userUpdate);
        let existing = this.visibleMembers;
        return JSON.stringify(existing);
      }
    },
  },
};
</script>