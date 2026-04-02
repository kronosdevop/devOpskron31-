<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-bottom-sheet v-model="showSheet" content-class="right-sheet">
      <v-card
        style="max-width: 480px; min-width: 360px; width: 100%; border-radius: 18px; box-shadow: 0 8px 32px 0 rgba(60,60,60,0.10), 0 2px 8px 0 rgba(60,60,60,0.04); background: #f8fafc; padding: 0 0 24px 0; overflow: hidden; max-height: 90vh; display: flex; flex-direction: column;"
      >
        <div style="padding: 24px 24px 0 24px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
                      <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 48px; height: 48px; border-radius: 16px; background: linear-gradient(135deg, #5b86e5 0%, #36d1c4 100%); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #fff; font-weight: 700;">
                {{ currentObject?.user?.full_user_name?.charAt(0).toUpperCase() || '?' }}
              </div>
            <div>
              <div style="font-size: 1.35rem; font-weight: 600; color: #222;">Account Details</div>
              <div style="font-size: 1rem; color: #7b7b7b;">Manage your profile information</div>
            </div>
          </div>
          <v-btn icon variant="text" @click="close_dialog()"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <!-- Scrollable content area -->
        <div class="profile-scroll-content" style="flex: 1 1 auto; overflow-y: auto; padding-bottom: 8px;">
          <!-- Personal Information Card -->
          <v-card class="mt-6 mx-4" style="border-radius: 18px; box-shadow: 0 2px 8px 0 rgba(60,60,60,0.04); background: #fff;">
            <div style="padding: 20px 24px 8px 24px; display: flex; align-items: center; gap: 10px;">
              <v-icon color="primary">mdi-account</v-icon>
              <span style="font-size: 1.15rem; font-weight: 600; color: #222;">Personal Information</span>
              <v-spacer />
              <!-- <v-btn icon variant="text" size="small" @click="update_profile()"><v-icon size="18">mdi-pencil</v-icon></v-btn> -->
            </div>
            <div style="padding: 0 24px 16px 24px;">
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                <div style="background: #e3edff; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;"><v-icon color="primary">mdi-account-outline</v-icon></div>
                <div>
                  <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Full Name</div>
                  <div style="font-size: 1.08rem; font-weight: 500; color: #181818;">{{ currentObject?.user?.full_user_name || 'N/A' }}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                <div style="background: #e6fff6; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;"><v-icon color="#22c993">mdi-email-outline</v-icon></div>
                <div>
                  <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Email Address</div>
                  <div class="profile-info-value" style="font-size: 1.08rem; font-weight: 500; color: #181818;">{{ currentObject?.user?.user_email_id || 'N/A' }}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="background: #f3eaff; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;"><v-icon color="#a259e6">mdi-phone-outline</v-icon></div>
                <div>
                  <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Phone Number</div>
                  <div style="font-size: 1.08rem; font-weight: 500; color: #181818;">{{ currentObject?.user?.user_country_code != 'N/A' ? currentObject?.user?.user_country_code + '-' + currentObject?.user?.user_contact_number : '-' }}</div>
                </div>
              </div>
            </div>
          </v-card>

          <!-- Work Information Card -->
          <v-card class="mt-4 mx-4" style="border-radius: 18px; box-shadow: 0 2px 8px 0 rgba(60,60,60,0.04); background: #fff;">
            <div style="padding: 20px 24px 8px 24px; display: flex; align-items: center; gap: 10px;">
              <v-icon color="orange">mdi-briefcase-outline</v-icon>
              <span style="font-size: 1.15rem; font-weight: 600; color: #222;">Work Information</span>
              <v-spacer />
              <!-- <v-btn icon variant="text" size="small" @click="update_profile()"><v-icon size="18">mdi-pencil</v-icon></v-btn> -->
            </div>
            <div style="padding: 0 24px 16px 24px; display: flex; flex-wrap: wrap; gap: 24px 32px;">
              <div>
                <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Member ID</div>
                <div style="font-size: 1.08rem; font-weight: 500; color: #181818;">{{ memberId == '' || memberId == undefined ? 'N/A' : memberId }}</div>
              </div>
              <div>
                <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Designation</div>
                <div style="font-size: 1.08rem; font-weight: 500; color: #181818; display: flex; align-items: center; gap: 4px;">
                  {{ designation == '' || designation == undefined ? 'N/A' : designation }}
                  <v-icon size="16" color="primary" @click="open_dialogs('designation')" style="cursor:pointer;">mdi-pencil</v-icon>
                </div>
              </div>
              <div>
                <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Group</div>
                <div style="font-size: 1.08rem; font-weight: 500; color: #181818; display: flex; align-items: center; gap: 4px;">
                  {{ department == '' || department == undefined ? 'N/A' : department }}
                  <v-icon size="16" color="primary" @click="open_dialogs('departments')" style="cursor:pointer;">mdi-pencil</v-icon>
                </div>
              </div>
              <div>
                <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Reporting Manager</div>
                <div style="font-size: 1.08rem; font-weight: 500; color: #181818; display: flex; align-items: center; gap: 4px;">
                  {{ reportingManger == '' || reportingManger == undefined ? 'N/A' : reportingManger }}
                  <v-icon size="16" color="primary" @click="open_dialogs('reportingManager')" style="cursor:pointer;">mdi-pencil</v-icon>
                </div>
              </div>
              <div>
                <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Location</div>
                <div style="font-size: 1.08rem; font-weight: 500; color: #181818; display: flex; align-items: center; gap: 4px;">
                  {{ location }}
                  <v-icon size="16" color="primary" @click="open_dialogs('locations')" style="cursor:pointer;">mdi-pencil</v-icon>
                </div>
              </div>
            </div>
          </v-card>

          <!-- Preferences Card -->
          <v-card class="mt-4 mx-4" style="border-radius: 18px; box-shadow: 0 2px 8px 0 rgba(60,60,60,0.04); background: #fff;">
            <div style="padding: 20px 24px 8px 24px; display: flex; align-items: center; gap: 10px;">
              <v-icon color="teal">mdi-cog-outline</v-icon>
              <span style="font-size: 1.15rem; font-weight: 600; color: #222;">Preferences</span>
            </div>
            <div style="padding: 0 24px 16px 24px;">
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
                <div style="background: #fffbe6; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;"><v-icon color="#ffc107">mdi-bell-outline</v-icon></div>
                <div style="flex: 1;">
                  <div style="font-size: 1.08rem; font-weight: 500; color: #181818;">Email Notifications</div>
                  <div style="font-size: 0.98rem; color: #7b7b7b;">Receive updates via email</div>
                </div>
                <v-switch inset v-model="switch1" color="pink" hide-details density="compact" style="margin-left: auto;" @update:modelValue="enable_diable_notification()" />
              </div>
              <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px;">
                <div style="background: #e6fff6; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;"><v-icon color="#22c993">mdi-account-multiple-outline</v-icon></div>
                <div style="flex: 1;">
                  <div style="font-size: 1.08rem; font-weight: 500; color: #181818;">Show Organization Details</div>
                  <div style="font-size: 0.98rem; color: #7b7b7b;">Show organization details in profile</div>
                </div>
                <v-switch inset v-model="switch2" color="pink" hide-details density="compact" style="margin-left: auto;" @update:modelValue="enable_diable_notification()" />
              </div>
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="background: #f3eaff; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;"><v-icon color="#a259e6">mdi-account-arrow-right-outline</v-icon></div>
                <div style="flex: 1;">
                  <div style="font-size: 1.08rem; font-weight: 500; color: #181818;">Delegate Workflows</div>
                  <div style="font-size: 0.98rem; color: #7b7b7b;">Allow workflow delegation</div>
                </div>
                <v-switch inset v-model="delegateOption" color="pink" hide-details density="compact" style="margin-left: auto;" @update:modelValue="delegate_workflows()" />
              </div>

              <!-- Delegated To section -->
              <div v-if="currentDelelegateAction == true" style="display: flex; align-items: center; gap: 14px; margin-top: 10px; margin-bottom: 8px; padding-left: 52px;">
                <div style="background: #e3edff; border-radius: 12px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
                  <v-icon color="primary">mdi-account-arrow-right</v-icon>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 0.98rem; color: #7b7b7b; font-weight: 500;">Delegated To</div>
                  <div style="font-size: 1.08rem; font-weight: 500; color: #181818;">{{ currentObject?.user?.delegated_email_id || 'N/A' }}</div>
                </div>
                <v-icon @click="edit_delegate()" color="primary" class="ml-1" size="18" style="cursor:pointer;">mdi-pencil</v-icon>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 16px; justify-content: flex-end; margin: 32px 32px 0 32px; flex-shrink: 0;">
          <v-btn color="primary" variant="flat" style="border-radius: 8px; font-weight: 600; min-width: 120px;" :disabled="queryCheck == false" @click="update_profile()">Update Profile</v-btn>
          <!-- <v-btn color="pink" variant="flat" style="border-radius: 8px; font-weight: 600; min-width: 120px;" :disabled="queryCheck == false" @click="sign_out()">Logout</v-btn> -->
        </div>
      </v-card>
    </v-bottom-sheet>

    <!-- All your dialogs/components for editing, etc. remain outside the sheet -->
    <div v-if="componentCheck == 1">
      <ChangeDesignation
        :designationChange="designationChange"
        @clicked="designationChange = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <ChangeDepertment
        :depertmentchange="depertmentchange"
        @clicked="depertmentchange = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <ChangeRM
        :changeManger="changeManger"
        @clicked="changeManger = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <ChnageLocation
        :locationChange="locationChange"
        @clicked="locationChange = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
      />
    </div>
    <div v-if="componentCheck == 5">
      <EditUser
        :actionItem="actionItem"
        :editDialog="editDialog"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editDialog = false"
      />
    </div>
    <div v-if="componentCheck == 6">
      <DelegateWorkflowDialog
        :delegateDialog="delegateDialog"
        :userEmail="userEmail"
        :currentObject="currentObject"
        :rowInfo="rowInfo"
        :currentDelelegateAction="currentDelelegateAction"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:successValue="toggle_data"
        v-on:emitValue="toggle_drawer"
        :delegateEditAction="delegateEditAction"
        :showeditDialog="showeditDialog"
        @clicked="delegateDialog = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { get_current_details } from "@/mixins/GetCuurentUser.js";
import { initiateLocalCacheDB } from "@/db.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_selected_user_details } from "@/mixins/GetUserDetails.js";
import { Auth } from "aws-amplify";
import { email_notification_on_off } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { EventBus } from "@/main";
import ChangeDepertment from "@/components/StaticForms/ChangeDepertment.vue";
import ChnageLocation from "@/components/StaticForms/ChnageLocation.vue";
import ChangeRM from "@/components/StaticForms/ChangeRM.vue";
import ChangeDesignation from "@/components/StaticForms/ChangeDesignation.vue";
import EditUser from "@/components/UserDialogs/EditUser.vue";
import DelegateWorkflowDialog from "@/components/DialogsList/DelegateWorkflowDialog.vue";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";

export default {
  props: {
    userEmail: String,
    currentObject: Object,
    profileUrl: String,
    orgObject: Object,
    userProfile: String,
  },

  components: {
    SnackBar,
    ChangeDepertment,
    ChnageLocation,
    ChangeRM,
    ChangeDesignation,
    EditUser,
    DelegateWorkflowDialog,
  },

  mixins: [
    get_selected_user_details,
    get_all_org_users,
    initiateLocalCacheDB,
    get_current_details,
  ],
  data() {
    return {
      showSheet: false,
      darkMode: false, // for dark mode switch (not functional, just UI)
      department: "",
      designation: "",
      reportingManger: "",
      location: "",
      memberId: "",
      switch1: null,
      SnackBarComponent: {},
      queryCheck: false,
      componentCheck: 0,
      designationChange: false,
      locationChange: false,
      depertmentchange: false,
      changeManger: false,
      rowInfo: {},
      actionItem: "",
      editDialog: false,
      delegateOption: false,
      delegateDialog: false,
      currentDelelegateAction: null,
      delegateEditAction: "",
      showeditDialog: "",
      switch2: null,
    };
  },
  computed: {
    // switchLabel() {
    //   return this.switch1 ? " Workflow Email Notification" : "";
    // },
  },
  async created() {
    if (this.$root.EventBus) {
      this.$root.EventBus.$on("toggleDrawer", this.toggleDrawer);
    } else if (typeof EventBus !== 'undefined') {
      EventBus.$on("toggleDrawer", this.toggleDrawer);
    }
    await this.initializeProfileData();
  },
  watch: {
    showSheet(val) {
      if (val) {
        this.initializeProfileData();
      }
    },
  },
  beforeUnmount() {
    if (this.$root.EventBus) {
      this.$root.EventBus.$off("toggleDrawer", this.toggleDrawer);
    } else if (typeof EventBus !== 'undefined') {
      EventBus.$off("toggleDrawer", this.toggleDrawer);
    }
  },
  methods: {
    async initializeProfileData() {
      this.$store.commit("SetUserEmailTeam", this.userEmail);
      this.queryCheck = false;
      await Promise.all([
        this.get_current_details(),
        this.get_selected_user_details(),
      ]);
      this.get_all_org_users();
      
      // Check if currentObject and user data are available
      if (!this.currentObject || !this.currentObject.user) {
        console.warn("User data not available in LogoutPannel");
        this.queryCheck = true;
        return;
      }
      
      this.switch1 =
        this.currentObject.user.email_notification != undefined
          ? this.currentObject.user.email_notification
          : false;
      this.switch2 =
        this.currentObject.user.is_org_details_enabled != undefined
          ? this.currentObject.user.is_org_details_enabled
          : false;
      this.delegateOption =
        this.currentObject.user.delegated_workflow != undefined
          ? this.currentObject.user.delegated_workflow
          : false;
      this.currentDelelegateAction =
        this.currentObject.user.delegated_workflow != undefined
          ? this.currentObject.user.delegated_workflow
          : false;
      this.queryCheck = true;
      var data = {};
      data = {
        user_id: this.currentObject.user.user_id,
        user_email_id: this.currentObject.user.user_email_id,
        location: this.fetchUserInfo ? this.fetchUserInfo.location : '',
        department: this.currentObject.user.department,
        designation: this.fetchUserInfo ? this.fetchUserInfo.designation_name : '',
        full_user_name: this.currentObject.user.full_user_name,
      };
      this.rowInfo = data;
      this.department = this.currentObject.user.department;
      this.designation = this.fetchUserInfo ? this.fetchUserInfo.designation_name : '';
      this.reportingManger = this.fetchUserInfo ? this.fetchUserInfo.reporting_manager_name : '';
      this.location = this.currentObject.user.location;
      this.memberId = this.currentObject.user.member_id;
    },
    toggleDrawer() {
      this.showSheet = true;
    },

    toggle_drawer() {
      this.delegateDialog = false;
      this.delegateOption =
        this.currentObject.user.delegated_workflow != undefined
          ? this.currentObject.user.delegated_workflow
          : false;
      this.delegateEditAction = "";
      this.showeditDialog = "";
    },

    edit_delegate() {
      this.delegateDialog = true;
      this.componentCheck = 6;
      this.delegateEditAction = "edit";
      this.showeditDialog = "show";
    },

    close_dialog() {
      this.showSheet = false;
      this.$emit("closefunc", "closed");
    },

    async enable_diable_notification() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(email_notification_on_off, {
            input: {
              user_id: data.user.user_id,
              email_notification: this.switch1,
              is_org_details_enabled: this.switch2,
            },
          })
        );

        var response = JSON.parse(result.data.email_notification_on_off);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };

          //  this.$emit("successMsg", response.Message);
          setTimeout(() => {
            this.$emit("successValue", "success");
          }, 1000);
          this.get_current_details();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          //   this.loading = false;
          //   this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    delegate_workflows() {
      this.delegateDialog = true;
      this.componentCheck = 6;
      this.delegateEditAction = "newrecord";
    },

    update_profile() {
      this.$store.commit("SetUserEmailTeam", this.userEmail);
      this.actionItem = "Edit";
      this.componentCheck = 5;
      this.editDialog = true;
      this.rowInfo = this.currentObject.user;
    },

    open_dialogs(value) {
      // console.log(value)
      switch (value) {
        case "designation":
          this.componentCheck = 1;
          this.designationChange = true;
          break;
        case "departments":
          this.componentCheck = 2;
          this.depertmentchange = true;

          break;
        case "reportingManager":
          this.componentCheck = 3;
          this.changeManger = true;
          break;
        case "locations":
          this.componentCheck = 4;
          this.locationChange = true;
          break;

        default:
          break;
      }
    },

    async sign_out() {
      // Check if currentObject and user data are available
      if (!this.currentObject || !this.currentObject.user) {
        console.warn("User data not available for logout");
        // Still proceed with basic logout
        await Auth.signOut();
        this.$store.commit("SetAuth", false);
        this.$router.push("/");
        return;
      }
      
      const activeUsers = this.orgUsers
        .filter((user) => user.user_status === "ACTIVE")
        .map((user) => user.user_email_id);
      const updatedArray = activeUsers.filter(
        (email) => email !== this.currentObject.user.user_email_id
      );
      const emailcurrent = this.currentObject.user.user_email_id;
      const updatedEmailArray = updatedArray.sort();
      const beforeGeorge = updatedEmailArray.filter(
        (email) => email < emailcurrent
      );
      const afterGeorge = updatedEmailArray.filter(
        (email) => email > emailcurrent
      );

      // Pair the emails
      const combinedArray = [
        ...beforeGeorge.map((email) => `${email}~${emailcurrent}`),
        ...afterGeorge.map((email) => `${emailcurrent}~${email}`),
      ];
      for (let i = 0; i < combinedArray.length; i++) {
        this.$emit("unsubcribe", combinedArray[i]);
        // this.unsubscribeToTopicMethod(combinedArray[i]);
      }
      // this.$emit("endMqqt", 0);
      // this.clearAllStores();
      this.emailCheckCom = true;
      var data = {
        AuditType: "LOGOUT",
        AuditAction: "LOGOUT",
        AuditMessage: `${this.currentObject.user.full_user_name}  logged out`,
      };

      this.$store.commit("SetAuditActions", data);
      await Auth.signOut();
      // console.log("Signed out globally");
      // await Auth.signOut(this.currentObject.user.user_email_id);

      // this.update_audit_logs();
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
      this.$store.commit("SetcustomerData", "");
      this.clear_store_values();
      this.$router.push("/");
      this.$store.dispatch("logout");
      // this.$store.getters.GetMqttClient.disconnect();
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

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.locationChange = false;
      this.depertmentchange = false;
      this.designationChange = false;
      this.changeManger = false;
      this.delegateDialog = false;
      this.editDialog = false;
      setTimeout(() => {
        this.showSheet = false;
        this.$emit("closefunc", "closed");
      }, 1000);
    },

    toggle_data() {
      this.$emit("successValue", "success");
    },

    clear_store_values() {
      localStorage.removeItem("selectedNavItem");
      this.$store.commit("SetadminAppsCheck", false);
      localStorage.setItem("adminApps", []);
      this.$store.commit("SetadministrationCheck", false);
      localStorage.setItem("activityList", []);
      localStorage.setItem("notoficationItems", []);
      this.$store.commit("SetappName", "");
    },
  },
};
</script>
<style scoped>
.right-sheet {
  display: flex !important;
  justify-content: flex-end !important;
  position: fixed !important;
  right: 0;
  left: auto !important;
  bottom: 0;
  top: auto;
  /* width: 100vw; */ /* Removed to prevent left cropping */
  pointer-events: none;
}
.right-sheet > .v-card {
  pointer-events: auto;
}
.profile-info-value {
  word-break: break-all;
  white-space: normal;
}
.profile-scroll-content {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 0;
  max-height: calc(90vh - 160px); /* Adjust if needed for header/footer */
  padding-bottom: 8px;
}
</style>