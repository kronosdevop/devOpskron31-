<template>
  <div>
    <v-card flat class="mt-n4">
      <!-- <v-card-title>Timesheet Management</v-card-title> -->
      <v-toolbar flat class="mt-4 bg-white">
        <v-btn-toggle
          v-model="toggle_exclusive"
          class="text-black ml-4 dense-toggle"
          mandatory
          density="compact"
          variant="outlined"
          divided
        >
          <!-- <v-btn small :class="[
            'font-size-btn text-capitalize ',
            toggle_exclusive === 'assetReports' ? 'active-btn' : '',
          ]"  text value="projects">
            Categories/Projects</v-btn
          > -->
          <v-btn
            size="x-small"
            :class="[
              'font-size-btn text-capitalize dense-btn',
              toggle_exclusive === 'projects' ? 'active-btn' : '',
            ]"
            text
            value="projects"
          >
            Projects
          </v-btn>
          <v-btn
            size="x-small"
            :class="[
              'font-size-btn text-capitalize dense-btn',
              toggle_exclusive === 'activities' ? 'active-btn' : '',
            ]"
            text
            value="activities"
          >
            Activities
          </v-btn>
          <!-- <v-btn
            size="x-small"
            :class="[
              'font-size-btn text-capitalize dense-btn',
              toggle_exclusive === 'projects_reports' ? 'active-btn' : '',
            ]"
            text
            value="projects_reports"
          >
            Reports
          </v-btn> -->
          <!-- <v-btn small :class="[
            'font-size-btn text-capitalize ',
            toggle_exclusive === 'assetReports' ? 'active-btn' : '',
          ]"  text value="activites">
            Activites
          </v-btn> -->
          <v-btn
            size="x-small"
            :class="[
              'font-size-btn text-capitalize dense-btn',
              toggle_exclusive === 'configurationSettings' ? 'active-btn' : '',
            ]"
            text
            value="configurationSettings"
          >
            Configuration
          </v-btn>
        </v-btn-toggle>
        <!-- </v-row> -->
        <v-spacer />
        <v-btn
        size="small"
        class="text-capitalize text-white cardCss ml-3"
        v-if="adminAppExists"
        @click="back_call()"
      >
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
      </v-toolbar>
      <!-- <div class="text-left" v-if="toggle_exclusive == 'projects'">
        <ProjectHeads />
      </div> -->
      <div class="text-left" v-if="toggle_exclusive == 'projects_reports'">
        <ExportTimesheetreport />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'configurationSettings'">
        <ConfigurationSetting />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'activities'">
        <TimesheetActivities />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'projects'">
        <TimesheetProjects />
      </div>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable */
import ExportTimesheetreport from "@/components/TimeSheets/ExportTimesheetreport.vue";
import ProjectHeads from "@/components/TimeSheets/ProjectHeads.vue";
// import ProjectActivites from "@/components/TimeSheets/ProjectActivites.vue";
import ConfigurationSetting from "@/components/TimeSheets/ConfigurationSetting.vue";
import TimesheetActivities from "./PopUps/TimesheetActivities.vue";
import TimesheetProjects from "./PopUps/TimesheetProjects.vue";
export default {
  components: {
    ProjectHeads,
    TimesheetActivities,
    ConfigurationSetting,
    ExportTimesheetreport,
    TimesheetProjects,
  },
  data() {
    return {
      toggle_exclusive: "projects",
      adminAppExists: false,
    };
  },
  mounted() {
    this.fetch_admin_apps();
  },
  methods: {
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type == "TIMESHEET_USER"
      );
      // console.log(userapp, "userapp");
      if (userapp == undefined) {
        this.adminAppExists = false;
        return;
      }
      if(userapp.is_visible==false){
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
        (app) => app.dashboard_unique_type === "TIMESHEET_ADMINS"
      );

      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    back_call() {
      this.$router.push("/home/UserTimesheetTypes");
    },
  },
};
</script>

<style>
.theme-toggle {
  background-color: transparent;
  border-radius: 10px;
  padding: 4px;
  display: inline-flex;
}

.theme-btn {
  border-radius: px !important;
}

.theme-btn.v-btn--active {
  background-color: #1e3e5c !important;
  color: #1a202c !important;
}
.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}

/* Dense toggle styles */
.dense-toggle {
  padding: 2px !important;
}

.dense-toggle .v-btn {
  padding: 4px 8px !important;
  min-width: auto !important;
  font-size: 0.75rem !important;
  height: 32px !important;
}

.dense-btn {
  padding: 4px 8px !important;
  min-width: auto !important;
  font-size: 0.75rem !important;
  height: 32px !important;
}

.component-wrapper {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  /* or set a fixed height if needed */
}

.fixed-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-spacer {
  height: 48px; /* or match your toolbar height (56px, etc) */
}

.scrollable-content {
  overflow-y: auto;
  flex-grow: 1;
  padding: 12px;
}
</style>