<template>
  <div>
    <v-app-bar class="modern-header-section" density="compact">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-multiple</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Visits</span>
          <div class="header-subtitle">Manage your visitors</div>
        </div>
      </div>
    </v-app-bar>

    <v-card>
      <v-toolbar color="transparent" class="mt-n10">
        <template v-slot:extension>
          <v-tabs
            v-model="toggle_exclusive"
            class="modern-tab-toggle"
            mandatory
          >
            <v-tab value="visitsDashboard" class="tab-btn">Dashboard</v-tab>
            <v-tab value="visitorsLogs" class="tab-btn">Visit Logs</v-tab>
            <v-tab value="visitReps" class="tab-btn">Visit Reps</v-tab>
            <v-tab value="visitLocations" class="tab-btn"
              >Unverified Locations</v-tab
            >
            <v-tab value="verifiedLocations" class="tab-btn"
              >Verified Locations</v-tab
            >
            <v-tab value="visit_types" class="tab-btn">Visit Types</v-tab>
            <v-tab value="territories" class="tab-btn">Territories</v-tab>
          </v-tabs>
          <v-spacer />
          <v-btn
            dark
            v-show="toggle_exclusive == 'visitorsLogs'"
            @click="export_logs()"
            class="text-capitalize cardCss button-corner mt-9 mr-3"
          >
            <v-icon color="white">mdi-export-variant</v-icon>
            Export
          </v-btn>
          <v-btn
            dark
            v-show="toggle_exclusive == 'visit_types'"
            @click="create_form()"
            class="text-capitalize cardCss button-corner mt-8 mr-1"
          >
            <v-icon color="white">mdi-plus</v-icon>
            Add
          </v-btn>
          <v-btn
            @click="provide_access()"
            v-show="toggle_exclusive == 'visitReps'"
            :loading="loading"
            dark
            class="text-capitalize cardCss button-corner mt-9 mr-3"
          >
            <v-icon color="white">mdi-plus</v-icon>
            Add
          </v-btn>
          <v-btn
            v-if="toggle_exclusive == 'territories'"
            dark
            @click="add_territory()"
            class="text-capitalize cardCss mr-3"
          >
            <v-icon color="white">mdi-plus</v-icon>
            Add
          </v-btn>
        </template>
      </v-toolbar>
    </v-card>

    <div class="text-left" v-if="toggle_exclusive == 'visitorsLogs'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <VisitLogs :key="exportkey" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'territories'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <MasterTerritories :key="territoryIncrement" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'visitLocations'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <LocationsList :key="loactionKey" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'visitConfigurations'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <ConfigurationsSettings />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'visitReps'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <VisitorRepresentative :key="userKey" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'visitsDashboard'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <VisitDashboard />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'visit_types'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <VisitTypesConfig :key="formkey" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'verifiedLocations'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <VerifiedLocations />
      </v-card>
    </div>
    <div v-if="componentCheck == 1">
      <AddingVisitorsLoc
        :addvisitorLocation="addvisitorLocation"
        @clicked="addvisitorLocation = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:loactionupdate="locationadd_refresh"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddingVisitorsDialogue
        :addPrermissionDialog="addPrermissionDialog"
        @clicked="addPrermissionDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:userupdate="user_refresh"
      />
    </div>
    <div v-if="componentCheck == 3">
      <CreateFormDialog
        :createFormDialogue="createFormDialogue"
        @clicked="createFormDialogue = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:formupdate="form_refresh"
      />
    </div>
    <div v-if="componentCheck == 4">
      <ExportLogs
        :logexport="logexport"
        @clicked="logexport = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:exportupdate="export_refresh"
      />
    </div>
    <div v-if="componentCheck == 5">
      <AddTerritory
        :createTerritoryDialog="createTerritoryDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:refresh="refresh_territory"
        @clicked="createTerritoryDialog = false"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/* eslint-disable */
import ExportLogs from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/ExportLogs.vue";
import CreateFormDialog from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/CreateFormDialog.vue";
import VisitTypesConfig from "@/components/VisitsManagementApp/AdminApp/VisitTypesConfig.vue";
import VisitDashboard from "@/components/VisitsManagementApp/AdminApp/VisitDashboard.vue";
import SnackBar from "@/components/SnackBar.vue";
import VisitLogs from "@/components/VisitsManagementApp/AdminApp/VisitLogs.vue";
import LocationsList from "@/components/VisitsManagementApp/AdminApp/LocationsList.vue";
import ConfigurationsSettings from "@/components/VisitsManagementApp/AdminApp/ConfigurationsSettings.vue";
import AddingVisitorsLoc from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/AddingVisitorsLoc.vue";
import VisitorRepresentative from "@/components/VisitsManagementApp/AdminApp/VisitorRepresentative.vue";
import AddingVisitorsDialogue from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/AddingVisitorsDialogue.vue";
import VerifiedLocations from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/VerifiedLocations.vue";
import MasterTerritories from "@/components/SettingsComponents/MasterTerritories.vue";
import AddTerritory from "@/components/SettingsDialogs/AddTerritory.vue";

export default {
  components: {
    LocationsList,
    ConfigurationsSettings,
    AddingVisitorsLoc,
    ExportLogs,
    VisitorRepresentative,
    AddingVisitorsDialogue,
    SnackBar,
    VisitLogs,
    VisitDashboard,
    VisitTypesConfig,
    CreateFormDialog,
    VerifiedLocations,
    MasterTerritories,
    AddTerritory,
  },
  data() {
    return {
      toggle_exclusive: "visitsDashboard",
      loading: false,
      SnackBarComponent: {},
      componentCheck: 0,
      loactionKey: 0,
      userKey: 0,
      exportkey: 0,
      formkey: 0,
      logexport: false,
      addvisitorLocation: false,
      addPrermissionDialog: false,
      createFormDialogue: false,
      cardHeight: 0,
      createTerritoryDialog: false,
      territroyIncrement: 0,
    };
  },
  mounted() {
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {
    add_territory() {
      this.componentCheck = 5;
      this.createTerritoryDialog = true;
    },
    export_logs() {
      this.componentCheck = 4;
      this.logexport = true;
    },
    create_form() {
      this.componentCheck = 3;
      this.createFormDialogue = true;
      this.$store.commit("SetVisitorFormEnabled", true);
      this.$store.commit("SetFormName", "");
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetFormObj", {});
      this.$store.commit("SetEditFormDetails", {});
      this.$store.commit("SetFormType", "CUSTOM");
      this.$store.commit("SetDirectoryForm", false);
      this.$store.commit("SetCustomFormDesign", false);
    },

    refresh_territory() {
      this.territoryIncrement += 1;
    },
    create_location() {
      this.componentCheck = 1;
      this.addvisitorLocation = true;
    },
    provide_access() {
      this.componentCheck = 2;
      this.addPrermissionDialog = true;
    },

    export_refresh() {
      this.exportkey += 1;
    },
    form_refresh() {
      this.formkey += 1;
    },
    locationadd_refresh() {
      this.loactionKey += 1;
    },
    user_refresh() {
      this.userKey += 1;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createFormDialogue = false;
      this.addPrermissionDialog = false;
      this.addvisitorLocation = false;
      this.logexport = false;
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
  },
};
</script>
<style scoped>
.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
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
