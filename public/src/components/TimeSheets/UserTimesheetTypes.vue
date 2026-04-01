<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <OverlayComp :overlay="overlay" />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-clock-outline</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Timesheet</span>
          <span class="header-subtitle">View your time entries</span>
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

        <v-text-field
          v-model="searchValue"
          placeholder="Search timesheets..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="header-search"
          clearable
          @update:model-value="handleSearchChange"
          width="250"
        />
        <v-btn
          v-if="toggle_exclusive == 'userlevel'"
          height="40"
          class="cardCss"
          @click="Updatetime()"
        >
          <v-icon start color="white">mdi-plus</v-icon>
          <span color="white" class="FontVariant1">Add</span>
        </v-btn>
        <v-btn
          v-if="adminAppExists"
          height="40"
          class="cardCss mr-4"
          @click="open_settings()"
        >
          <v-icon color="white" class="mr-2">mdi-cog</v-icon>
          <span class="FontVariant1" color="white">Administrator</span>
        </v-btn>
      </div>
    </v-app-bar>
    <div class="text-left" v-if="toggle_exclusive == 'userlevel'">
      <UserLevelTimeSheet
        :key="usrtimesheetKey"
        :searchValue="searchValue"
        v-on:search-changed="handleSearchChange"
      />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'reportylevel'">
      <ApprovalReport />
    </div>
    <div v-if="componentCheck == 1">
      <FillTimeSheet
        :timesheetUpdate="timesheetUpdate"
        @clicked="timesheetUpdate = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:usertimesheet="usertimesheet_refresh"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";
import { get_current_details } from "@/mixins/GetCuurentUser.js";
import FillTimeSheet from "@/components/TimeSheets/PopUps/FillTimeSheet.vue";
import UserLevelTimeSheet from "@/components/TimeSheets/UserLevelTimeSheet.vue";
import ApprovalReport from "@/components/TimeSheets/ApprovalReport.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  mixins: [get_current_details],
  components: {
    FillTimeSheet,
    UserLevelTimeSheet,
    SnackBar,
    OverlayComp,
    ApprovalReport,
    CreateExternalTicketDialog,
  },
  data: () => ({
    toggle_exclusive: "userlevel",
    timesheetUpdate: false,
    componentCheck: 0,
    overlay: false,
    usrtimesheetKey: 0,
    SnackBarComponent: {},
    adminAppExists: false,
    searchValue: "",

    // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
  }),
  async mounted() {
    this.overlay = true;

    // await this.get_current_details();
    this.overlay = false;
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
        (app) => app.dashboard_unique_type === "TIMESHEET_ADMINS"
      );
      if (adminExists.is_visible == false) {
        this.adminAppExists = false;
        return;
      }
      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    open_settings() {
      this.$router.push("/home/AdminTimesheet");
    },
    back_call() {
      this.$router.push({ name: "UserlevelApp" });
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
      this.timesheetUpdate = false;
    },
    Updatetime() {
      this.componentCheck = 1;
      this.timesheetUpdate = true;
    },
    usertimesheet_refresh() {
      this.usrtimesheetKey += 1;
    },
    handleSearchChange(value) {
      this.searchValue = value;
    },
  },
};
</script>

<style>
/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-search {
  background: white !important;
  border-radius: 8px !important;
}
.header-search :deep(.v-field) {
  background: white !important;
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
}
.header-search :deep(.v-field__input) {
  color: #333 !important;
}
.header-search :deep(.v-field__input::placeholder) {
  color: #666 !important;
}
.header-search :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.3) !important;
}
</style>
