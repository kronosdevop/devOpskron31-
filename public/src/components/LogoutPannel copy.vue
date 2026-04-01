<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-navigation-drawer
      v-model="drawer"
      app
      density="compact"
      permanent
      location="right"
      temporary
      width="300"
      class="pa-0"
    >
      <template v-slot:prepend>
        <div
          class="d-flex align-center justify-space-between pa-2"
          style="gap: 8px"
        >
          <!-- Avatar + Name -->
          <!-- <div class="d-flex align-center" style="gap: 8px">
            <v-avatar size="32">
              <template
                v-if="
                  currentObject.user_profile_pic_url !== 'N/A' &&
                  currentObject.user_profile_pic_url
                "
              >
                <v-img :src="userProfile" />
              </template>
              <template v-else>
                <v-icon color="primary">mdi-account-circle</v-icon>
              </template>
            </v-avatar>

            <div class="text-body-2 font-weight-medium">
              {{ currentObject.user.full_user_name }}
            </div>
          </div> -->

         
        </div>
      </template>
      <!-- <v-divider color="black"></v-divider> -->

      <v-list dense>
        <v-list-item>
          <v-list-item-content>
            <v-row no-gutters justify="space-between">
              <v-btn
                size="x-small"
                color="primary"
                :disabled="queryCheck == false"
                class="white--text"
                @click="update_profile()"
              >
                Update Profile
              </v-btn>
              <v-btn
                size="x-small"
                :disabled="queryCheck == false"
                color="primary"
                class="white--text"
                @click="sign_out()"
              >
                Logout
              </v-btn>
              <v-icon @click="close_dialog()" size="18">mdi-close</v-icon>
            </v-row>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <!-- <div style="font-size: 15px">Workflow Email Notification</div> -->
            <v-switch
              v-model="switch1"
              density="compact"
              color="blue"
              class="ml-2"
              label="Workflow Email Notification"
              @update:modelValue="enable_diable_notification()"
            ></v-switch>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <!-- <div style="font-size: 15px">Workflow Email Notification</div> -->
            <v-switch
              v-model="switch2"
              density="compact"
              color="blue"
              class="ml-2 mt-n3"
              label="Show Organization Details"
              @update:modelValue="enable_diable_notification()"
            ></v-switch>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <!-- <div style="font-size: 15px">Workflow Email Notification</div> -->
            <v-switch
              v-model="delegateOption"
              density="compact"
              color="blue"
              class="ml-2 mt-n3"
              label="Delegate Workflows"
              @update:modelValue="delegate_workflows()"
            ></v-switch>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-show="currentDelelegateAction == true">
          <v-list-item-content>
            <label style="font-size: 14px" class="font-weight-bold"
              >Delegated To
            </label>
            <div class="mt-1">
              {{ currentObject.user.delegated_email_id }}
              <v-icon
                @click="edit_delegate()"
                color="primary"
                class="ml-1"
                size="x-small"
                >mdi-pencil</v-icon
              >
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-divider color="black" />
        <v-list-item>
          <v-list-item-content>
            <label style="font-size: 14px" class="font-weight-bold"
              >Email
            </label>
            <div class="mt-1">{{ currentObject.user.user_email_id }}</div>
          </v-list-item-content>
        </v-list-item>

        <v-divider color="black" />
        <v-list-item>
          <v-list-item-content class="">
            <label style="font-size: 14px" class="font-weight-bold"
              >Contact Number
            </label>
            <div class="mt-1">
              {{
                currentObject.user.user_country_code != "N/A"
                  ? currentObject.user.user_country_code +
                    -+currentObject.user.user_contact_number
                  : "-"
              }}
            </div>

            <!-- <v-text-field
              dense
              readonly
              label="Mobile Number"
              :value="
                currentObject.user.user_country_code +
                -+currentObject.user.user_contact_number
              "
              outlined
            /> -->
          </v-list-item-content>
        </v-list-item>
        <v-divider color="black" />
        <v-list-item>
          <v-list-item-content class="">
            <label style="font-size: 14px" class="font-weight-bold"
              >Member ID
            </label>
            <div class="mt-1">
              {{ memberId == "" || memberId == undefined ? "N/A" : memberId }}
            </div>
            <!-- <v-text-field
              dense
              readonly
              label="Member ID"
              v-model="memberId"
              outlined
            /> -->
          </v-list-item-content>
        </v-list-item>
        <v-divider color="black" />
        <v-list-item>
          <v-list-item-content class="">
            <label style="font-size: 14px" class="font-weight-bold"
              >Designation
            </label>
            <div v-show="queryCheck == true" class="mt-1">
              {{
                designation == "" || designation == undefined
                  ? "N/A"
                  : designation
              }}
              <v-icon
                @click="open_dialogs('designation')"
                color="primary"
                class="ml-1"
                size="x-small"
                >mdi-pencil</v-icon
              >
            </div>
            <!-- <v-text-field
              dense
              readonly
              label="Designation"
              v-model="designation"
              outlined
            /> -->
          </v-list-item-content>
        </v-list-item>
        <v-divider color="black" />
        <v-list-item>
          <v-list-item-content class="">
            <label style="font-size: 14px" class="font-weight-bold"
              >Group
            </label>
            <div class="mt-1">
              {{
                department == "" || department == undefined ? "N/A" : department
              }}
              <v-icon
                @click="open_dialogs('departments')"
                v-show="queryCheck == true"
                color="primary"
                class="ml-1"
                size="x-small"
                >mdi-pencil</v-icon
              >
            </div>
            <!-- <v-text-field
              dense
              readonly
              label="Group"
              v-model="department"
              outlined
            /> -->
          </v-list-item-content>
        </v-list-item>
        <v-divider color="black" />
        <v-list-item>
          <v-list-item-content class="">
            <label style="font-size: 14px" class="font-weight-bold"
              >Reporting Manager
            </label>
            <div class="mt-1">
              {{
                reportingManger == "" || reportingManger == undefined
                  ? "N/A"
                  : reportingManger
              }}
              <v-icon
                v-show="queryCheck == true"
                @click="open_dialogs('reportingManager')"
                color="primary"
                class="ml-1"
                size="x-small"
                >mdi-pencil</v-icon
              >
            </div>
            <!-- <v-text-field
              dense
              readonly
              label="Reporting Manager"
              v-model="reportingManger"
              outlined
            /> -->
          </v-list-item-content>
        </v-list-item>
        <v-divider color="black" />
        <v-list-item>
          <v-list-item-content class="">
            <label style="font-size: 14px" class="font-weight-bold"
              >Location
            </label>
            <div class="mt-1">
              {{ location }}
              <v-icon
                v-show="queryCheck == true"
                color="primary"
                class="ml-1"
                @click="open_dialogs('locations')"
                size="x-small"
                >mdi-pencil</v-icon
              >
            </div>
            <!-- <v-text-field dense label="Location" v-model="location" outlined /> -->
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
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
      department: "",
      designation: "",
      reportingManger: "",
      location: "",
      drawer: null,
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
    EventBus.$on("toggleDrawer", this.toggleDrawer);
    this.$store.commit("SetUserEmailTeam", this.userEmail);
    this.queryCheck = false;
    await Promise.all([
      this.get_current_details(),
      this.get_selected_user_details(),
    ]);
    this.get_all_org_users();
    // console.log(this.fetchUserInfo, "fetchUserInfo");
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
      location: this.fetchUserInfo.location,
      department: this.currentObject.user.department,
      designation: this.fetchUserInfo.designation_name,
      full_user_name: this.currentObject.user.full_user_name,
    };
    this.rowInfo = data;
    this.department = this.currentObject.user.department;
    this.designation = this.fetchUserInfo.designation_name;
    this.reportingManger = this.fetchUserInfo.reporting_manager_name;
    this.location = this.currentObject.user.location;
    this.memberId = this.currentObject.user.member_id;
    // alert(4);
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
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
      this.drawer = false;
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
      this.$emit("endMqqt", 0);
      // this.clearAllStores();
      this.emailCheckCom = true;
      var data = {
        AuditType: "LOGOUT",
        AuditAction: "LOGOUT",
        AuditMessage: `${this.currentObject.user.full_user_name}  logged out`,
      };

      this.$store.commit("SetAuditActions", data);
      await Auth.signOut({ global: true });
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
        this.drawer = false;
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