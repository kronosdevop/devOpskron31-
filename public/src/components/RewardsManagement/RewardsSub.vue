<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-trophy</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Rewards</span>
          <span class="header-subtitle"
            >Manage your rewards and recognition system</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-btn
          v-if="toggle_exclusive == 'leaderboard'"
          @click="nominateUser()"
          class="action-btn"
          size="small"
        >
          <!-- <v-icon>mdi-plus</v-icon> -->
          <span>Nominate User</span>
        </v-btn>

        <v-btn
          v-if="toggle_exclusive == 'leaderboard'"
          @click="nominateTeam()"
          class="action-btn"
          size="small"
        >
          <!-- <v-icon>mdi-plus</v-icon> -->
          <span>Nominate Team</span>
        </v-btn>
        <!-- Action Buttons can be added here if needed -->
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar
      flat
      class="mt-n10"
      style="background-color: white"
      v-if="adminAppExists"
    >
      <template v-slot:extension>
        <v-tabs v-model="toggle_exclusive" mandatory class="modern-tab-toggle">
          <v-tab value="leaderboard" class="tab-btn"> Leaderboard </v-tab>
          <v-tab value="configuration" class="tab-btn">
            Configuration Settings
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-card flat class="mt-2">
      <div
        class="text-left"
        v-if="toggle_exclusive === 'leaderboard'"
        :class="!adminAppExists ? 'mt-10' : ''"
      >
        <LeaderBoardList />
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'nominees'">
        <NomineesList />
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'awards'">
        <AwardsList />
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'approvals'">
        <ApprovalRewards />
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'configuration'">
        <ConfigurationSettings />
      </div>
    </v-card>
    <div>
      <NominateUser
        :userNomination="userNomination"
        @clicked="userNomination = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div>
      <NominateTeam
        :teamNomination="teamNomination"
        @clicked="teamNomination = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import NominateTeam from "@/components/RewardsManagement/NominateTeam.vue";
import NominateUser from "@/components/RewardsManagement/NominateUser.vue";
import SnackBar from "@/components/SnackBar.vue";
import NomineesList from "./NomineesList.vue";
import AwardsList from "./AwardsList.vue";
import ApprovalRewards from "./ApprovalRewards.vue";
import LeaderBoardList from "./LeaderBoardList.vue";
import ConfigurationSettings from "./ConfigurationSettings.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    NomineesList,
    AwardsList,
    ApprovalRewards,
    LeaderBoardList,
    ConfigurationSettings,
    SnackBar,
    NominateUser,
    NominateTeam,
    CreateExternalTicketDialog,
  },
  data() {
    return {
      toggle_exclusive: "leaderboard",
      SnackBarComponent: {},

      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },

      userNomination: false,
      teamNomination: false,
      adminAppExists: false,
    };
  },
  mounted() {
    this.fetch_admin_apps();
  },
  methods: {
    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type == "REWARDS_RECOGNITION_USERS"
      );

      if (userapp == undefined) {
        this.adminAppExists = false;
        return;
      }
      if (userapp.is_visible == false) {
        this.adminAppExists = false;
        return;
      }
      // Check if userObj and admin_apps exist
      if (
        !userObj ||
        !userObj.admin_apps ||
        !Array.isArray(userObj.admin_apps)
      ) {
        this.adminAppExists = false;
        return;
      }

      const adminExists = userObj.admin_apps.find(
        (app) => app.dashboard_unique_type === "REWARDS_MANAGEMENT_ADMINS"
      );

      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    nominateUser() {
      this.userNomination = true;
    },
    nominateTeam() {
      this.teamNomination = true;
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

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.userNomination = false;
      this.teamNomination = false;
    },
  },
};
</script>

<style scoped>
/* Modern Header Section */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  color: #666 !important;
}

.tab-btn:hover {
  color: #db4c77 !important;
}
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}
/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Legacy Styles (keeping for compatibility) */
.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .header-left {
    gap: 12px;
  }

  .header-icon-bg {
    width: 40px;
    height: 40px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
