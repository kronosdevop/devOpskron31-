<template>
  <v-navigation-drawer
    :model-value="drawerVisible"
    location="right"
    app
    absolute
    width="800"
    class="overlay-profile-drawer"
  >
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- Profile Header -->
    <v-card flat class="pa-4 d-flex justify-space-between align-center">
      <div class="d-flex align-center">
        <v-avatar size="80">
          <v-img :src="profilePicUrl" />
        </v-avatar>
        <div class="ml-4">
          <h4 class="mb-1">{{ userDetails.full_user_name }}</h4>
          <div class="text-caption mt-1">
            <strong>Email:</strong> {{ userDetails.user_email_id }}<br />
            <strong>Phone:</strong> {{ userDetails.user_full_contact_number }}
          </div>
        </div>
      </div>
      <div class="d-flex flex-row align-end">
        <v-tooltip text="Edit Profile" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-if="showButtons == 1"
              icon
              variant="plain"
              v-bind="props"
              @click="onEdit"
            >
              <v-icon color="black">mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Logout" location="bottom">
          <template #activator="{ props }">
            <v-btn
              v-if="showButtons == 1"
              icon
              variant="plain"
              v-bind="props"
              @click="onLogout"
            >
              <v-icon color="black">mdi-logout</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Close" location="bottom">
          <template #activator="{ props }">
            <v-btn icon variant="plain" v-bind="props" @click="close_action">
              <v-icon color="red">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>
    </v-card>

    <v-divider />
    <template v-if="!isEditing">
      <v-expansion-panels v-model="activePanel" multiple>
        <v-expansion-panel value="personal">
          <v-expansion-panel-title> Personal Details </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card flat class="pa-4">
              <v-col cols="12">
                <div class="mb-3">
                  <b>Gender:</b>
                  <span class="ml-2">{{ userDetails.gender || "-" }}</span>
                </div>

                <div class="mb-3">
                  <b>Date Of Birth:</b>
                  <span class="ml-2">{{
                    userDetails.date_of_birth || "-"
                  }}</span>
                </div>

                <div class="mb-3">
                  <b>Blood Group:</b>
                  <span class="ml-2">{{ userDetails.blood_group || "-" }}</span>
                </div>

                <div class="mb-3">
                  <b>Alternate Contact Number:</b>
                  <span class="ml-2">{{
                    userDetails.alternative_contact_number || "-"
                  }}</span>
                </div>

                <div class="mb-3">
                  <b>Country:</b>
                  <span class="ml-2">{{ userDetails.country || "-" }}</span>
                </div>

                <div class="mb-3">
                  <b>City:</b>
                  <span class="ml-2">{{ userDetails.city || "-" }}</span>
                </div>

                <div class="mb-3">
                  <b>Address Line 1:</b>
                  <span class="ml-2">{{ userDetails.address_1 || "-" }}</span>
                </div>

                <div class="mb-3">
                  <b>Address Line 2:</b>
                  <span class="ml-2">{{ userDetails.address_2 || "-" }}</span>
                </div>

                <div class="mb-3">
                  <b>Permanent Address:</b>
                  <span class="ml-2">{{
                    userDetails.permanent_address || "-"
                  }}</span>
                </div>
              </v-col>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel value="work">
          <v-expansion-panel-title> Work Details </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card flat class="pa-4">
              <v-row>
                <v-col cols="6">
                  <div class="mb-3">
                    <b>Date Of Joining:</b>
                    <span class="ml-2">{{
                      userDetails.date_of_joining || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Date Of Confirmation:</b>
                    <span class="ml-2">{{
                      userDetails.date_of_confirmation || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Department:</b>
                    <span class="ml-2">{{
                      userDetails.department_name || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Designation:</b>
                    <span class="ml-2">{{
                      userDetails.designation_name || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Location:</b>
                    <span class="ml-2">{{ userDetails.location || "-" }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Member ID:</b>
                    <span class="ml-2">{{ userDetails.member_id || "-" }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Reporting Manager :</b>
                    <span class="ml-2">{{
                      userDetails.reporting_manager_name || "-"
                    }}</span>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel value="identity">
          <v-expansion-panel-title> Identity Details </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card flat class="pa-4">
              <v-row>
                <v-col cols="6">
                  <div class="mb-3">
                    <b>Nationality:</b>
                    <span class="ml-2">{{
                      userDetails.nationality || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Passport Number:</b>
                    <span class="ml-2">{{
                      userDetails.identity_number || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Passport Expiry Date:</b>
                    <span class="ml-2">{{
                      userDetails.identity_expiry_date || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Government ID Number:</b>
                    <span class="ml-2">{{
                      userDetails.government_id || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>PAN Number:</b>
                    <span class="ml-2">{{
                      userDetails.pan_number || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Bank Account Number:</b>
                    <span class="ml-2">{{
                      userDetails.bank_account_number || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>IFSC:</b>
                    <span class="ml-2">{{ userDetails.ifsc || "-" }}</span>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="mb-3">
                    <b>Aadhaar Number:</b>
                    <span class="ml-2">{{
                      userDetails.aadhaar_number || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Alternate Contact Number:</b>
                    <span class="ml-2">{{
                      userDetails.alternative_contact_number || "-"
                    }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Country:</b>
                    <span class="ml-2">{{ userDetails.country || "-" }}</span>
                  </div>

                  <div class="mb-3">
                    <b>City:</b>
                    <span class="ml-2">{{ userDetails.city || "-" }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Address Line 1:</b>
                    <span class="ml-2">{{ userDetails.address_1 || "-" }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Address Line 2:</b>
                    <span class="ml-2">{{ userDetails.address_2 || "-" }}</span>
                  </div>

                  <div class="mb-3">
                    <b>Permanent Address:</b>
                    <span class="ml-2">{{
                      userDetails.permanent_address || "-"
                    }}</span>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel value="notifications">
          <v-expansion-panel-title> Notifications </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card class="pa-4">
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title
                      >Workflow Email Notification</v-list-item-title
                    >
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-switch v-model="settings.workflowEmail" inset />
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title
                      >Show Organization Details</v-list-item-title
                    >
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-switch v-model="settings.showOrgDetails" inset />
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Delegate Workflows</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-switch v-model="settings.delegateWorkflows" inset />
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
    <template v-else>
      <UpdateFormDetials
        :selectedParticularData="selectedParticularData"
        v-on:backAction="back_action"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_info"
      >
      </UpdateFormDetials>
    </template>
  </v-navigation-drawer>
</template>
  
  <script>
/*eslint-disable*/
import { get_selected_user_details } from "@/mixins/GetUserDetails.js";
import UpdateFormDetials from "@/components/UserDialogs/UpdateFormDetials";
import SnackBar from "@/components/SnackBar.vue";
import axios from "axios";
import { Auth } from "aws-amplify";

import { API, graphqlOperation } from "aws-amplify";
export default {
  //   name: "ProfileDrawer",
  props: {
    drawerVisible: Boolean,
  },
  components: {
    UpdateFormDetials,
    SnackBar,
  },
  mixins: [get_selected_user_details],
  data() {
    return {
      activePanel: [],
      profilePicUrl: "",
      userDetails: {},
      reponseDetials: {},
      settings: {
        delegateWorkflows: false,
        showOrgDetails: false,
        workflowEmail: false,
      },
      selectedParticularData: {},
      isEditing: false,
      showButtons: 0,
      SnackBarComponent: {},
    };
  },
  watch: {
    drawerVisible: {
      async handler() {
        if (this.drawerVisible == true) {
          await this.get_selected_user_details();
          this.showButtons = 1;
          this.userDetails = this.fetchUserInfo;
          this.selectedParticularData = this.fetchUserInfo;
          // console.log(this.reponseDetials);
          this.profilePicUrl = this.userDetails.user_profile_pic_url;
          // this.userDetails = this.reponseDetials.user;
          // console.log(this.fetchUserInfo);
          // await this.get_member_details();
          //  console.log(this.custom_details.dashboard_created_by)   ;
          //  console.log( this.$store.getters.GetUserObj.user.user_email_id);
        }
      },
      immediate: true,
    },
  },
  methods: {
    onEdit() {
      this.isEditing = true;
    },
    back_action() {
      this.isEditing = false;
    },
    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.isEditing = false;
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
    close_action() {
      this.$emit("closeNav", 0);
    },
    async onLogout() {
      await Auth.signOut({ global: true });
      this.$store.commit("SetFirstSignup", false);
      this.$store.commit("Setappadmins", false);
      this.$store.commit("SetUserEmail", "");
      this.$store.commit("SetUserEmailTeam", "");
      this.$store.commit("SetOrgDetails", {});
      this.$store.commit("SetUserObj", {});
      localStorage.setItem("allMessages", []);
      this.$store.commit("SetAuth", false);
      localStorage.setItem("initiatedBy", "");
      this.$store.commit("Setlibraryformtype", "");
      this.$store.commit("SetappName", "");
      this.$store.commit("Setappicon", "");
      this.clear_store_values();
      this.$router.push("/");
    },

    clear_store_values() {
      this.$store.commit("SetadminAppsCheck", false);
      localStorage.setItem("adminApps", []);
      this.$store.commit("SetadministrationCheck", false);
      localStorage.setItem("activityList", []);
      localStorage.setItem("notoficationItems", []);
    },
    // success_msg(){
    //   this.
    // }
  },
  //   computed: {
  //     drawerVisible: {
  //       get() {
  //         return this.modelValue;
  //       },
  //       set(val) {
  //         this.$emit("update:modelValue", val);
  //       },
  //     },
  //     computedImage() {
  //       return this.profileUrl !== "N/A"
  //         ? this.profileUrl
  //         : require("@/assets/account.png");
  //     },
  //   },
};
</script>
<style scoped>
.v-btn {
  transition: background-color 0.2s;
}
.v-btn:hover {
  background-color: #f5f5f5;
}
</style>

  