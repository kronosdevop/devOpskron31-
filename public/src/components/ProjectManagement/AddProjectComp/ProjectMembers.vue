<template>
  <v-card class="pa-4" elevation="2">
    <!-- Header -->
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h6 font-weight-bold">Team Members</span>

      <div>
        <v-btn
          variant="outlined"
          class="mr-2"
          color="grey"
          @click="backOptions"
        >
          Back
        </v-btn>

        <v-btn color="primary" @click="validateNextRequest"> Next </v-btn>
      </div>
    </v-card-title>

    <v-divider class="mb-4"></v-divider>

    <v-card-text>
      <!-- Project Manager -->
      <v-row>
        <v-col cols="4">
          <v-text-field
            density="compact"
            variant="outlined"
            label="Project Manager"
            v-model="projectManagerDisplay"
            prepend-inner-icon="mdi-account-tie"
            readonly
          />
        </v-col>
      </v-row>

      <!-- Add Member Card -->
      <v-card class="pa-4 mt-4" variant="outlined">
        <div class="text-subtitle-1 font-weight-medium mb-2">
          Add Team Member
        </div>

        <v-row align="center">
          <v-col cols="2">
            <v-select
              density="compact"
              label="Member Type"
              variant="outlined"
              v-model="memberType"
              :items="[
                { title: 'Internal', value: 'INTERNAL' },
                { title: 'External', value: 'EXTERNAL' },
              ]"
            />
          </v-col>

          <!-- INTERNAL -->
          <template v-if="memberType == 'INTERNAL'">
            <v-col cols="4">
              <v-autocomplete
                density="compact"
                label="Team Member"
                variant="outlined"
                v-model="internalTeamMember.full_user_name"
                item-title="full_user_name"
                item-value="user_email_id"
                :items="userArray"
                :rules="[rules.required]"
                return-object
                prepend-inner-icon="mdi-account"
              />
            </v-col>

            <v-col cols="3">
              <v-select
                density="compact"
                label="Role"
                variant="outlined"
                v-model="internalTeamMember.userRole"
                :items="roleItems"
                :rules="[rules.required]"
              />
            </v-col>
          </template>

          <!-- EXTERNAL -->
          <template v-if="memberType == 'EXTERNAL'">
            <v-col cols="3">
              <v-text-field
                density="compact"
                label="Name"
                variant="outlined"
                v-model="externalTeamMember.userName"
                prepend-inner-icon="mdi-account"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="3">
              <v-text-field
                density="compact"
                label="Email"
                variant="outlined"
                v-model="externalTeamMember.userEmail"
                prepend-inner-icon="mdi-email"
                :rules="[rules.required, rules.email]"
              />
            </v-col>

            <v-col cols="2">
              <v-select
                density="compact"
                label="CC"
                variant="outlined"
                v-model="externalTeamMember.countryCode"
                :items="countryitems"
                item-title="name"
                item-value="code"
                :rules="[rules.required]"
              />
            </v-col>

            <v-col cols="2">
              <v-text-field
                density="compact"
                label="Phone"
                variant="outlined"
                v-model="externalTeamMember.contactNumber"
                :rules="[rules.required]"
              />
            </v-col>
          </template>

          <!-- ADD BUTTON -->
          <v-col cols="1" class="text-center mt-n4">
            <v-btn icon color="primary" size="small" @click="addTeamMember">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- Team Member List -->
      <v-card v-if="teamMembers.length" class="mt-6" variant="outlined">
        <v-card-title class="text-subtitle-1"> Added Members </v-card-title>

        <v-divider></v-divider>

        <v-list>
          <v-list-item v-for="(item, index) in teamMembers" :key="index">
            <template v-slot:prepend>
              <v-avatar color="primary">
                {{ item.userName.charAt(0) }}
              </v-avatar>
            </template>

            <v-list-item-title>
              {{ item.userName }}
            </v-list-item-title>

            <v-list-item-subtitle>
              {{ item.userEmail }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-chip
                size="small"
                class="mr-2"
                color="blue"
                v-if="item.userRole"
              >
                {{ item.userRole }}
              </v-chip>

              <v-chip size="small" color="green" class="mr-4">
                {{ item.memberType }}
              </v-chip>

              <v-btn icon color="red" size="small" @click="deleteMember(index)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
import CountryList from "@/JsonFiles/CountryList.json";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  mixins: [get_all_org_users],
  data() {
    return {
      roleItems: ["Member", "Observer", "Admin"],
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
      this.$store.getters.GetUserObj.user?.full_user_name;
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
            this.$store.getters.GetUserObj.user?.user_email_id
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
