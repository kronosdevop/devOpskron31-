<template>
  <div>
    <v-card>
      <v-card-actions class="mt-2 justify-end">
        <v-btn
          variant="flat"
          @click="backOptions()"
          dark
          class="cardCss text-capitalize button-corner ml-2"
        >
          Back
        </v-btn>
        <v-btn
          variant="flat"
          @click="validateNextRequest()"
          dark
          class="cardCss text-capitalize button-corner ml-2"
        >
          Next
        </v-btn>
      </v-card-actions>
      <v-card-text>
        <v-form ref="form">
          <v-row no-gutters class="mt-3">
            <v-col cols="4">
              <v-text-field
                density="compact"
                variant="outlined"
                v-model="projectManagerDisplay"
                readonly
                label="Project Manager"
              ></v-text-field>
            </v-col>
            <v-col cols="12"><b> Add Team Members</b></v-col>
            <v-row class="mt-3 pa-2 bg-white" align="center" justify="start" no-gutters>
              <v-col cols="2" class="pr-2">
                <v-select
                  density="compact"
                  variant="outlined"
                  label="Member Type"
                  v-model="memberType"
                  :items="[
                    { title: 'Internal', value: 'INTERNAL' },
                    { title: 'External', value: 'EXTERNAL' },
                  ]"
                ></v-select>
              </v-col>
              <v-col cols="4" v-if="memberType == 'INTERNAL'" class="pr-2">
                <v-autocomplete
                  density="compact"
                  v-model="internalTeamMember.full_user_name"
                  label="Team Members"
                  variant="outlined"
                  item-title="full_user_name"
                  item-value="user_email_id"
                  :items="userArray"
                  :rules="[rules.required]"
                  hide-no-data
                  return-object
                  placeholder="Min 3 Character"
                ></v-autocomplete>
              </v-col>
              <v-col cols="3" v-if="memberType == 'INTERNAL'" class="pr-2">
                <v-select
                  density="compact"
                  variant="outlined"
                  :rules="[rules.required]"
                  label="Role"
                  v-model="internalTeamMember.userRole"
                  :items="roleItems"
                />
              </v-col>
              <v-col cols="3" v-if="memberType == 'EXTERNAL'" class="pr-2">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  label="Name"
                  v-model="externalTeamMember.userName"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="3" v-if="memberType == 'EXTERNAL'" class="pr-2">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  label="Email"
                  v-model="externalTeamMember.userEmail"
                  :rules="[rules.required, rules.email]"
                ></v-text-field>
              </v-col>
              <v-col cols="2" v-if="memberType == 'EXTERNAL'" class="pr-2">
                <v-select
                  density="compact"
                  v-model="externalTeamMember.countryCode"
                  label="CC"
                  :items="countryitems"
                  item-title="name"
                  item-value="code"
                  variant="outlined"
                  :rules="[rules.required]"
                ></v-select>
              </v-col>
              <v-col cols="2" v-if="memberType == 'EXTERNAL'" class="pr-2">
                <v-text-field
                  density="compact"
                  v-model="externalTeamMember.contactNumber"
                  label="Contact Number"
                  maxlength="14"
                  variant="outlined"
                  :rules="[
                    (v) => (v ? v.length >= 8 : false) || 'Phone is required',
                  ]"
                  @keypress="is_number($event, externalTeamMember.contactNumber)"
                ></v-text-field>
              </v-col>
              <v-col cols="1" class="d-flex align-center justify-center mt-2">
                <v-icon
                  @click="addTeamMember()"
                  density="compact"
                  color="black"
                  style="cursor:pointer;"
                >mdi-plus</v-icon>
              </v-col>
            </v-row>
          
          </v-row>
          <v-row v-if="teamMembers.length != 0" class="mt-4">
              <v-col cols="12">
                <v-list density="compact" two-line variant="outlined">
                  <v-list-item v-for="(item, index) in teamMembers" :key="index">
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.userName }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        {{ item.userEmail }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle v-if="item.userRole">
                        {{ item.userRole }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle v-if="item.contactNumber">
                        {{ item.countryCode + " " + item.contactNumber }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-chip size="x-small" color="primary" text-color="white">
                        {{
                          item.memberType === "INTERNAL"
                            ? "Internal User"
                            : "External User"
                        }}
                      </v-chip>
                      <v-btn
                        class="mr-8"
                        color="red"
                        size="x-small"
                        icon
                        @click="deleteMember(index)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import CountryList from "@/JsonFiles/CountryList.json";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  mixins: [get_all_org_users],
  data() {
    return {
            roleItems: [ "Member", "Observer"],
      projectManagerDisplay: "",
      memberType: "INTERNAL",
      internalTeamMember: {
        full_user_name: "",
        userRole: "",
      },
      externalTeamMember: {
        userName: "",
        userEmail: "",
        countryCode: "+91",
        contactNumber: "",
      },
      teamMembers: [],
      userArray: [],
      countryitems: [],
      rules: {
        required: (v) => !!v || "Field is required",
        email: (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
        phoneNumber: (v) =>
          /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v) || "Phone number must be valid",
      },
    };
  },

  async mounted() {
    this.projectManagerDisplay =
      this.$store.getters.GetUserObj.user.full_user_name;
    await this.get_all_org_users();
    this.fetchDetails();
  },

  methods: {
    is_number(evt, value) {
      evt = evt || window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
      if (value.length >= 14 && charCode >= 48 && charCode <= 57) {
        evt.preventDefault();
      }
    },
    fetchDetails() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          if (
            element.user_email_id !=
            this.$store.getters.GetUserObj.user.user_email_id
          ) {
            this.userArray.push({
              full_user_name: element.full_user_name,
              user_email_id: element.user_email_id,
              user_country_code: element.user_country_code,
              user_contact_number: element.user_contact_number,
            });
          }
        }
      });
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.dial_code + "(" + element.name + ")",
          code: element.dial_code,
        });
      });
    },

    addTeamMember() {
      if (this.memberType === "INTERNAL" && this.validateInternalMember()) {
        let data = {
          userName: this.internalTeamMember.full_user_name.full_user_name,
          userEmail: this.internalTeamMember.full_user_name.user_email_id,
          userRole: this.internalTeamMember.userRole,
          memberType: "INTERNAL",
          countryCode:
            this.internalTeamMember.full_user_name.user_country_code == "N/A"
              ? ""
              : this.internalTeamMember.full_user_name.user_country_code,
          contactNumber:
            this.internalTeamMember.full_user_name.user_contact_number == "N/A"
              ? ""
              : this.internalTeamMember.full_user_name.user_contact_number,
        };
        const dataExisits = this.teamMembers.some(
          (currentdata) => currentdata.userEmail === data.userEmail
        );
        if (dataExisits) {
          this.$emit("errorMsg", "User already Exist");
          this.resetInternalMember();
        } else {
          this.teamMembers.push({
            userName: this.internalTeamMember.full_user_name.full_user_name,
            userEmail: this.internalTeamMember.full_user_name.user_email_id,
            userRole: this.internalTeamMember.userRole,
            memberType: "INTERNAL",
            countryCode:
              this.internalTeamMember.full_user_name.user_country_code == "N/A"
                ? ""
                : this.internalTeamMember.full_user_name.user_country_code,
            contactNumber:
              this.internalTeamMember.full_user_name.user_contact_number ==
              "N/A"
                ? ""
                : this.internalTeamMember.full_user_name.user_contact_number,
          });
          this.resetInternalMember();
        }
      } else if (
        this.memberType === "EXTERNAL" &&
        this.validateExternalMember()
      ) {
        let data = {
          userName: this.externalTeamMember.userName,
          userEmail: this.externalTeamMember.userEmail,
          userRole: "",
          memberType: "EXTERNAL",
          countryCode: this.externalTeamMember.countryCode,
          contactNumber: this.externalTeamMember.contactNumber,
        };
        const dataExisits = this.teamMembers.some(
          (currentdata) => currentdata.userEmail === data.userEmail
        );
        if (dataExisits) {
          this.$emit("errorMsg", "User already Exist");
          this.resetExternalMember();
        } else {
          this.teamMembers.push({
            userName: this.externalTeamMember.userName,
            userEmail: this.externalTeamMember.userEmail,
            userRole: "",
            memberType: "EXTERNAL",
            countryCode: this.externalTeamMember.countryCode,
            contactNumber: this.externalTeamMember.contactNumber,
          });
          this.resetExternalMember();
        }
      }
    },

    validateInternalMember() {
      const { full_user_name, userRole } = this.internalTeamMember;
      if (!full_user_name || !userRole) {
        this.$refs.form.validate();
        return false;
      }
      return true;
    },

    validateExternalMember() {
      const { userName, userEmail, countryCode, contactNumber } =
        this.externalTeamMember;
      if (!userName || !userEmail || !countryCode || !contactNumber) {
        this.$refs.form.validate();
        return false;
      }
      return true;
    },

    resetInternalMember() {
      this.internalTeamMember.full_user_name = "";
      this.internalTeamMember.userRole = "";
    },

    resetExternalMember() {
      this.externalTeamMember.userName = "";
      this.externalTeamMember.userEmail = "";
      this.externalTeamMember.countryCode = "+91";
      this.externalTeamMember.contactNumber = "";
    },

    deleteMember(index) {
      this.teamMembers.splice(index, 1);
    },

    backOptions() {
      this.$emit("ClickedBack");
    },

    validateNextRequest() {
      //   console.log(this.teamMembers);
      this.$emit("validateNext", this.teamMembers);
    },
  },
};
</script>

<style></style>
