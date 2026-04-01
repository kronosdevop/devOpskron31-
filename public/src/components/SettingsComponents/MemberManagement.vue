<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-toolbar flat>
      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="teams"> Teams </v-btn>
          <v-btn small class="black--text" text value="approvals">
            Approvals
          </v-btn>
          <v-btn small class="black--text" text value="profile_config">
            Profile Configuration
          </v-btn>
          <v-btn small class="black--text" text value="member_config">
            Membership
          </v-btn>
          <v-btn small class="black--text" text value="team_visibility">
            Team Visibility
          </v-btn>
        </v-btn-toggle>
      </v-row>
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'approvals'">
      <ApprovalsList />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'profile_config'">
      <ProfileConfig />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'member_config'">
      <MemberConfig />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'team_visibility'">
      <TeamVisibility />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'teams'">
      <AllTeams />
    </div>
  </div>
</template>
<script>
/* eslint-disable */

import SnackBar from "@/components/SnackBar.vue";
import ApprovalsList from "@/components/SettingsDialogs/ApprovalsList.vue";
import ProfileConfig from "@/components/SettingsDialogs/ProfileConfig.vue";
import MemberConfig from "@/components/SettingsDialogs/MemberConfig.vue";
import TeamVisibility from "@/components/SettingsDialogs/TeamVisibility.vue";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import AllTeams from "@/components/Teams/AllTeams.vue";

export default {
  components: {
    ApprovalsList,
    ProfileConfig,
    SnackBar,
    MemberConfig,
    TeamVisibility,
    AllTeams,
  },
  mixins: [get_Org_details],
  data() {
    return {
      height: 0,
      fixed: true,
      tableLoading: false,
      tableData: [],
      headers: [
        { text: "Name", value: "name", sortable: false },
        { text: "Actions", value: "actions", sortable: false },
      ],
      approveDialog: false,
      componentCheck: 0,
      rowInfo: {},
      tableArray: [],
      SnackBarComponent: {},
      toggle_exclusive: "teams",
    };
  },
  async created() {
    // this.height = window.innerHeight - 290;
    // this.tableLoading = true;
    // await this.get_Org_details();
    // this.fetch_details();
    // this.tableLoading = false;
  },
  methods: {
    fetch_details() {
      this.tableData = [];
      this.tableArray = [];
      this.tableData = this.orgDetails.organization.member_management_settings;

      this.tableArray = this.orgDetails.organization.member_management_settings;
    },

    fetch_form_name(val) {
      var data = "";
      switch (val) {
        case "ADD_MEMBER":
          data = "Add Member";
          break;
        case "REMOVE_MEMBER":
          data = "Remove Member";
          break;
        case "CHANGE_DESIGNATION":
          data = "Change Designation";
          break;
        case "CHANGE_DEPARTMENT":
          data = "Change Group";
          break;
        case "CHANGE_LOCATION":
          data = "Change Location";
          break;

        case "EDIT_MEMBER":
          data = "Update Profile";
          break;
        case "CHANGE_REPORTING_MANAGER":
          data = "Change Reporting Maanger";
          break;
      }

      return data;
    },

    get_approvals(val) {
      this.componentCheck = 1;
      this.rowInfo = val;
      this.approveDialog = true;
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
      this.approveDialog = false;
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      await this.get_Org_details();
      this.fetch_details();
    },
  },
};
</script>