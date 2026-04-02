<template>
  <div>
    <ExportDialog
      :ExportDialog="ExportDialog"
      @clicked="ExportDialog = false"
      v-on:successMsg="success_info"
      v-on:errorMsg="error_info"
    />
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-clock-outline</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Timesheet </span>
          <span class="header-subtitle">View your time entries</span>
        </div>
      </div>
      <v-spacer></v-spacer>
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
          v-if="toggle_exclusive == 'userlevel'"
          v-model="searchValue"
          label="Search timesheets..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="header-search"
          clearable
          @update:model-value="handleSearchChange"
          width="200"
        />
        <v-menu
          v-if="toggle_exclusive == 'userlevel'"
          offset-y
          class="actions-menu"
          transition="scale-transition"
        >
          <template #activator="{ props }">
            <v-btn v-bind="props" class="action-btn mr-4" size="small">
              <v-icon>mdi-dots-vertical</v-icon>
              <span>Actions</span>
            </v-btn>
          </template>

          <v-list density="compact" class="actions-list">
            <!-- Export -->
            <v-list-item @click="open_Export_Dialog">
              <template #prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>

              <v-list-item-title> Export Timesheet </v-list-item-title>
            </v-list-item>

            <v-divider class="my-1" />

            <!-- Add -->
            <v-list-item @click="Updatetime()">
              <template #prepend>
                <v-icon color="primary">mdi-plus</v-icon>
              </template>

              <v-list-item-title> Add Timesheet </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>
    <v-card>
      <v-toolbar
        variant="flat"
        class="mt-n10"
        style="background-color: white"
        v-if="adminAppExists"
      >
        <template v-slot:extension>
          <v-tabs
            v-model="toggle_exclusive"
            mandatory
            class="modern-tab-toggle"
          >
            <v-tab value="userlevel" class="tab-btn">Timesheet</v-tab>
            <v-tab value="projects" class="tab-btn">Projects</v-tab>
            <v-tab value="activities" class="tab-btn">Activities</v-tab>
            <v-tab value="configurationSettings" class="tab-btn"
              >Configuration Settings</v-tab
            >
          </v-tabs>
        </template>
      </v-toolbar>
      <v-card class="mt-2">
        <div class="text-left" v-if="toggle_exclusive == 'projects_reports'">
          <ExportTimesheetreport />
        </div>
        <div
          class="text-left"
          v-if="toggle_exclusive == 'configurationSettings'"
        >
          <ConfigurationSetting />
        </div>
        <div class="text-left" v-if="toggle_exclusive == 'activities'">
          <TimesheetActivities />
        </div>
        <div class="text-left" v-if="toggle_exclusive == 'projects'">
          <TimesheetProjects />
        </div>
        <div class="text-left" v-if="toggle_exclusive == 'userlevel'">
          <UserLevelTimeSheet
            :key="usrtimesheetKey"
            :searchValue="searchValue"
            v-on:search-changed="handleSearchChange"
          />
        </div>
      </v-card>
    </v-card>
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
import FillTimeSheet from "@/components/TimeSheets/PopUps/FillTimeSheet.vue";
import SnackBar from "@/components/SnackBar.vue";
import ExportTimesheetreport from "@/components/TimeSheets/ExportTimesheetreport.vue";
import ProjectHeads from "@/components/TimeSheets/ProjectHeads.vue";
import ConfigurationSetting from "@/components/TimeSheets/ConfigurationSetting.vue";
import TimesheetActivities from "./PopUps/TimesheetActivities.vue";
import TimesheetProjects from "./PopUps/TimesheetProjects.vue";
import UserLevelTimeSheet from "@/components/TimeSheets/UserLevelTimeSheet.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";
import ExportDialog from "@/components/TimeSheets/ExportDialog.vue";

export default {
  components: {
    FillTimeSheet,
    ProjectHeads,
    SnackBar,
    TimesheetActivities,
    UserLevelTimeSheet,
    ConfigurationSetting,
    ExportTimesheetreport,
    TimesheetProjects,
    CreateExternalTicketDialog,
    ExportDialog,
  },
  data: () => ({
    toggle_exclusive: "userlevel",
    adminAppExists: false,
    timesheetUpdate: false,
    searchValue: "",
    componentCheck: 0,
    usrtimesheetKey: 0,
    SnackBarComponent: {},
    ExportDialog: false,
    actionsMenuOpen: false,
    exportLoad: false,
    addLoad: false,
    // Screenshot Values
    DialogCreateExternalTicket: false,
    ScreenshotFile: null,
    orgDetails: {
      bucket_name: "stichh-medias",
      region: "us-east-1",
    },
  }),
  mounted() {
    this.fetch_admin_apps();
  },
  methods: {
    async handleAdd() {
      if (this.addLoad) return;

      try {
        this.addLoad = true;

        this.componentCheck = 1;
        this.timesheetUpdate = true;

        this.actionsMenuOpen = false;
      } catch (error) {
        this.error_info("Unable to open timesheet form");
      } finally {
        setTimeout(() => {
          this.addLoad = false;
        }, 400);
      }
    },

    async handleExport() {
      if (this.exportLoad) return;

      try {
        this.exportLoad = true;

        this.ExportDialog = true;

        this.actionsMenuOpen = false;
      } catch (error) {
        this.error_info("Export failed");
      } finally {
        this.exportLoad = false;
      }
    },

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
    usertimesheet_refresh() {
      this.usrtimesheetKey += 1;
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
    handleSearchChange(value) {
      this.searchValue = value;
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type === "TIMESHEET_USER",
      );

      if (userapp == undefined) {
        this.adminAppExists = false;
        return;
      }

      if (userapp.is_visible == false) {
        this.adminAppExists = false;
        return;
      }

      if (
        !userObj ||
        !userObj.admin_apps ||
        !Array.isArray(userObj.admin_apps)
      ) {
        this.adminAppExists = false;
        return;
      }

      const adminExists = userObj.admin_apps.find(
        (app) => app.dashboard_unique_type === "TIMESHEET_ADMINS",
      );

      this.adminAppExists =
        (adminExists && adminExists.app_usage_level === "WEB_PHONE_ONLY") ||
        (adminExists.app_usage_level === "WEB_ONLY" &&
          adminExists.is_dashboard_admin === true);
    },
    back_call() {
      this.$router.push("/home/UserTimesheetTypes");
    },
    open_Export_Dialog() {
      this.ExportDialog = true;
    },
  },
};
</script>

<style>
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

.action-btn.secondary {
  background: #757575 !important;
  box-shadow: 0 2px 8px rgba(117, 117, 117, 0.3) !important;
}

.action-btn.secondary:hover {
  background: #616161 !important;
  box-shadow: 0 4px 12px rgba(117, 117, 117, 0.4) !important;
}

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
</style>

<!-- <v-icon class="mr-1">mdi-projector</v-icon> -->
<!-- <v-icon class="mr-1">mdi-account-convert</v-icon> -->
<!-- <v-icon class="mr-1">mdi-cog</v-icon> -->
