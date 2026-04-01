<template>
  <!-- eslint-disable -->
  <div>
    <v-navigation-drawer
      :model-value="addmember"
      @update:model-value="$emit('update:addmember', $event)"
      app
      location="right"
      temporary
      width="400"
      class="pa-0 add-member-drawer"
      :style="{ top: '64px', height: 'calc(100vh - 64px)' }"
    >
      <v-card flat>
        <v-toolbar elevation="1" density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">Add Member</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-2" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="firstName"
                  label="First Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="lastName"
                  label="Last Name"
                  class=""
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="emailId"
                  label="Email ID*"
                  class=""
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  v-model="memeberId"
                  label="Member ID"
                  class=""
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select
                  density="compact"
                  v-model="countryList"
                  label="Country"
                  :items="countryitems"
                  class=""
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="8">
                <v-text-field
                  density="compact"
                  v-model="contactNumber"
                  label="Contact Number"
                  class="ml-2"
                  maxlength="14"
                  @keypress="is_number($event, contactNumber)"
                  variant="outlined"
                  :rules="[rules.phone]"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="DesignationList"
                  label="Designation"
                  :items="Designationitems"
                  class=""
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                  clearable
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="DepartmentList"
                  label="Group"
                  :items="Departmenitems"
                  class=""
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                  clearable
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  label="Reporting Manager"
                  v-model="reportmanager"
                  :items="reportmanageritems"
                  item-text="title"
                  item-value="value"
                  density="compact"
                  v-model:search-input="search"
                  @input="search = ''"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                  clearable
                ></v-autocomplete>
              </v-col>
              <v-col cols="12">
                <v-autocomplete
                  density="compact"
                  v-model="loaction"
                  label="Location"
                  :items="loactionitems"
                  class=""
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                  clearable
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-start">
          <v-btn
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize ml-3 mt-n8 cardCss text-white"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>
  </div>
</template>
  <script>
/* eslint-disable */
import { get_master_terittory } from "@/mixins/GetMasterTerritory";
import CountryList from "@/JsonFiles/CountryList.json";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_designations_details } from "@/mixins/GetDesignations.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_member_id } from "@/graphql/queries.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
var axios = require("axios");
export default {
  props: {
    addmember: Boolean,
  },
  components: {
    CountryList,
  },
  mixins: [
    get_location_details,
    get_all_org_users,
    get_Org_details,
    get_designations_details,
    get_department_details,
    get_master_terittory,
    // update_audit_logs,
  ],

  data() {
    return {
      firstName: "",
      selectTerritory: "",
      lastName: "",
      countryList: "",
      searchT: "",
      emailId: "",
      memeberId: "",
      search: "",
      countryitems: [],
      contactNumber: "",
      DesignationList: "",
      Designationitems: [],
      territoryArray: [],
      DepartmentList: "",
      Departmenitems: [],
      reportmanager: "",
      reportmanageritems: [],
      loaction: "",
      loactionitems: [],
      loading: false,
      search: "",
      rules: {
        required: (value) => !!value || "Required.",
        phone: (val) =>
          !val || val.length >= 8 || "Phone number must be at least 8 digits",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid Email";
        },
      },
    };
  },
  watch: {
    addmember: {
      async handler() {
        if (this.addmember == true) {
          this.$store.commit("Setnamesearch", "");
          // console.log(this.$store.getters.GetUserObj)
          this.memeberId = this.$store.getters.GetUserObj.member==undefined?"":this.$store.getters.GetUserObj.member;
          await Promise.all([
            this.GetMemberID(),
            this.get_Org_details(),
            this.get_all_org_users(),
            this.get_location_details(),
            this.get_designations_details(),
            this.get_department_details(),
            this.get_master_terittory(),
          ]);

          this.fetch_details();
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
      this.$emit("clicked", 0);
    },

    async GetMemberID() {

      let result = await API.graphql(
        graphqlOperation(get_member_id, {
           organization_id: this.$store.getters.GetUserObj.organization.organization_id 
        })
      );
      if(result.data.get_member_id){
        this.memeberId = result.data.get_member_id;
      }
    },

      fetch_details() {
      // Clear all arrays first to prevent duplication
      this.territoryArray = [];
      this.reportmanageritems = [];
      this.loactionitems = [];
      this.Designationitems = [];
      this.Departmenitems = [];
      this.countryitems = [];

      // Populate territory array
      this.orgTerittory.forEach((element) => {
        this.territoryArray.push({
          title: element.territory_name,
          value: element.territory_id,
        });
      });

      // Populate reporting manager items
      this.orgUsers.forEach((element) => {
        if (
          element.user_type != "CHATBOT" &&
          element.user_status != "DEACTIVE"
        ) {
          this.reportmanageritems.push({
            title: element.full_user_name,
            value: element.user_id,
          });
        }
      });

      this.reportmanageritems.sort((a, b) => a.title.localeCompare(b.title));

      // Populate location items
      this.locationList.forEach((element) => {
        this.loactionitems.push({
          title: element.location_name,
          value: element.location_name,
        });
      });

      // Populate designation items
      this.designationList.forEach((element) => {
        this.Designationitems.push({
          title: element.designation_name,
          value: element.designation_name,
        });
      });

      // Populate department items
      this.departmentList.forEach((element) => {
        this.Departmenitems.push({
          title: element.department_name,
          value: element.department_name,
        });
      });

      // Populate country items
      CountryList.forEach((element) => {
        this.countryitems.push({
          title: element.name + "(" + element.dial_code + ")",
          value: element.dial_code,
        });
      });
    },

    async validate_data() {
      if (!this.contactNumber && this.countryList) {
        this.countryList = ""; // Clear the country code if no number is entered
      }

      if (this.contactNumber && !this.countryList) {
        this.$emit(
          "errorMsg",
          "Country code is required when entering a contact number."
        );
        return;
      }
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.add_members();
      }
    },
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

    add_members() {
      this.loading = true;
      axios({
        method: "post",
        maxBodyLength: Infinity,

        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/workflow_respective_initiate",
        headers: {
          "x-api-key": this.orgDetails.organization["x-api-key"],
          "Content-Type": "application/json",
        },
        data: {
          user_email_id: this.emailId,
          reporting_manager_id:
            this.reportmanager == "" || this.reportmanager == null
              ? undefined
              : this.reportmanager,
          department:
            this.DepartmentList == "" || this.DepartmentList == null
              ? undefined
              : this.DepartmentList,
          designation:
            this.DesignationList == "" || this.DesignationList == null
              ? undefined
              : this.DesignationList,
          first_name: this.firstName,
          last_name:
            this.lastName == "" || this.lastName == null
              ? undefined
              : this.lastName,
          location:
            this.loaction == "" || this.loaction == null
              ? undefined
              : this.loaction,
          member_id:
            this.memeberId == "" || this.memeberId == null
              ? undefined
              : this.memeberId,
          // social_media:
          command: "customInitiatesWorkflows",
          action_type: "MEMBER_ONBOARD",
          user_country_code:
            this.countryList == "" || this.countryList == null
              ? undefined
              : this.countryList,
          user_contact_number:
            this.contactNumber == "" || this.contactNumber == null
              ? undefined
              : this.contactNumber,
          current_user_email_id:
            this.$store.getters.GetUserObj.user.user_email_id,
          organization_id:
            this.$store.getters.GetUserObj.organization.organization_id,
          territory_id: this.selectTerritory,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.loading = false;
            this.$emit("successMsg", res.data.Message);
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
            // this.fetch_audit_message();
          } else {
            this.loading = false;

            this.$emit("errorMsg", res.data.Message);
          }
        })
        .catch(() => {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        });
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WORKFLOW_ACTION",
        AuditAction: "ADD_MEMBER",
        AuditMessage: `${data.user.full_user_name} initiated Add Member Workflow`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
  },
};
</script>

<style scoped>
.add-member-drawer {
  z-index: 1000 !important;
  position: fixed !important;
}

.add-member-drawer .v-navigation-drawer__content {
  height: 100% !important;
  overflow-y: auto !important;
}

/* Ensure the drawer content doesn't overflow */
.add-member-drawer .v-card {
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

.add-member-drawer .v-card-text {
  flex: 1 !important;
  overflow-y: auto !important;
}

.add-member-drawer .v-card-actions {
  flex-shrink: 0 !important;
  padding: 16px !important;
}
</style>