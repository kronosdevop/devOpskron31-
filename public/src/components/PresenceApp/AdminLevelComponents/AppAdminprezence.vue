<template>
  <div>
    <v-card flat >
      <!-- <v-card-title class="mt-n4">Presence Reports</v-card-title> -->
      <v-toolbar
        dense
        class="mt-4"
        flat
        
      >
        <!-- <v-row class="ml-4"> -->
        <v-btn-toggle
          v-model="toggle_exclusive"
          color="grey"
          mandatory
          class=""
        >
          <v-btn small class="black--text" text value="swipelogs">
            Team Scans</v-btn
          >
          <v-btn small class="black--text" text value="visitorlogs">
            Visitor Logs</v-btn
          >
          <v-btn small class="black--text" text value="visitors">
            Visitors</v-btn
          >
          <v-btn
            small
            class="black--text"
            text
            :value="initailcheck == false ? 'datacorrection' : 'newcheck'"
          >
            Data correction
          </v-btn>
          <v-btn small class="black--text" text value="reports">
            Reports
          </v-btn>
          <v-btn small class="black--text" text value="configuration">
            Configuration
          </v-btn>
          <!-- <v-btn small class="black--text" text value="new_report">
            New Report
          </v-btn> -->
        </v-btn-toggle>
        <!-- </v-row> -->
        <v-spacer />
        <v-btn
          class="cardCss mr-2"
          @click="openCamera()"
          v-if="toggle_exclusive == 'scanlogs'"
          ><v-icon color="white">mdi-account</v-icon></v-btn
        >
        <v-btn
          v-if="toggle_exclusive == 'datacorrection'"
          dark
          @click="add_data_correction()"
          class="text-capitalize cardCss"
          >Add Data Correction</v-btn
        >
        <!-- <v-btn dark class="text-capitalize cardCss ml-1" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn> -->
      </v-toolbar>
      <v-card-text v-if="toggle_exclusive == 'configuration'">
        <v-tabs align="left" class="mt-n5 my-tabs" v-model="settingsTab">
          <v-tabs-slider class="navBar"></v-tabs-slider>
          <v-tab>Data Correction</v-tab>
          <v-tab>ESA</v-tab>
          <v-tab>Holiday List</v-tab>
          <v-tab>Kiosk</v-tab>
          <v-tab>Leave Marking</v-tab>
          <v-tab>Location</v-tab>
          <v-tab>Members</v-tab>
          <v-tab>RFID</v-tab>
          <v-tab>Settings</v-tab>
        </v-tabs>
        <v-card flat v-if="settingsTab == 0">
          <DatacorrectionSettings />
        </v-card>
        <v-card
          flat
          v-if="settingsTab == 1"
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <EsaSetting />
        </v-card>
        <v-card flat v-if="settingsTab == 2">
          <HolidayList />
        </v-card>
        <v-card flat v-if="settingsTab == 3">
          <KioskList />
        </v-card>
        <v-card
          flat
          v-if="settingsTab == 4"
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <LeaveSettings />
        </v-card>
        <v-card flat v-if="settingsTab == 5">
          <PrezenceLocation />
        </v-card>
        <v-card flat v-if="settingsTab == 6">
          <MemberSetting />
        </v-card>
        <v-card flat v-if="settingsTab == 7">
          <TheRfid />
        </v-card>
        <v-card flat v-if="settingsTab == 8">
          <PrezenceConfig />
        </v-card>
      </v-card-text>
      <v-card-text v-if="toggle_exclusive == 'reports'">
        <v-tabs align="left" class="mt-n2 my-tabs" v-model="reportTab">
          <v-tabs-slider class="navBar"></v-tabs-slider>
          <v-tab>Present</v-tab>
          <v-tab>Absent</v-tab>
          <v-tab>Leave</v-tab>
          <v-tab>Monthly</v-tab>
          <v-tab>Yearly</v-tab>
          <v-tab>Export</v-tab>
          <v-tab>ESA</v-tab>
        </v-tabs>

        <v-card flat v-if="reportTab == 0">
          <PresentReport />
        </v-card>
        <v-card flat v-if="reportTab == 1">
          <AbsentReport />
        </v-card>
        <v-card flat v-if="reportTab == 2">
          <LeaveReport />
        </v-card>
        <v-card flat v-if="reportTab == 3">
          <MonthlyReport />
        </v-card>
        <v-card flat v-if="reportTab == 4">
          <YearlyReport />
        </v-card>
        <v-card flat v-if="reportTab == 5">
          <ExportReport />
        </v-card>
        <v-card flat v-if="reportTab == 6">
          <ESAReports />
        </v-card>
      </v-card-text>
    </v-card>
    <!-- <component :is="componentName" /> -->

    <div v-if="toggle_exclusive === 'swipelogs'" class="text-left">
      <SwipeLogs />
    </div>
    <div v-if="toggle_exclusive === 'visitors'" class="text-left">
      <VisitorsList />
    </div>
    <div v-if="toggle_exclusive === 'visitorlogs'" class="text-left">
      <VisitLogs />
    </div>

    <div v-if="toggle_exclusive === 'datacorrection'" class="text-left">
      <DataCorrection :key="dataCorrectionKey" />
    </div>
    <!-- <div v-if="toggle_exclusive === 'new_report'" class="text-left">
      <NewReport />
    </div> -->

    <div v-if="componentCheck == 2">
      <AddDatacorrection
        :datacorrectionDialog="datacorrectionDialog"
        @clicked="datacorrectionDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:dataCorrection="data_correction_refresh"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
  <script>
/*eslint-disable*/
import YearlyReport from "@/components/PresenceApp/AdminLevelComponents/YearlyReport.vue";
import VisitLogs from "@/components/PresenceApp/AdminLevelComponents/VisitLogs.vue";
import VisitorsList from "@/components/PresenceApp/AdminLevelComponents/VisitorsList.vue";
import TheRfid from "@/components/PresenceApp/AdminLevelComponents/TheRfid.vue";
import KioskList from "@/components/PresenceApp/AdminLevelComponents/KioskList.vue";
import MemberSetting from "@/components/PresenceApp/AdminLevelComponents/MemberSetting.vue";
import AddDatacorrection from "@/components/PresenceApp/PopUps/AddDatacorrection.vue";
import UserLevel from "@/components/PresenceApp/UserLevel.vue";
import HolidayList from "@/components/SettingsComponents/HolidayList.vue";
import LeaveSettings from "./AdminLevelComponents/LeaveSettings.vue";
import MonthlyReport from "@/components/PresenceApp/AdminLevelComponents/MonthlyReport.vue";
import PrezenceConfig from "@/components/PresenceApp/AdminLevelComponents/PrezenceConfig.vue";
import DataCorrection from "@/components/PresenceApp/AdminLevelComponents/DataCorrection.vue";
import EsaSetting from "@/components/PresenceApp/AdminLevelComponents/EsaSetting.vue";
import DatacorrectionSettings from "@/components/PresenceApp/AdminLevelComponents/DatacorrectionSettings.vue";
import SwipeLogs from "@/components/PresenceApp/AdminLevelComponents/SwipeLogs.vue";
import PresentReport from "@/components/PresenceApp/AdminLevelComponents/PresentReport.vue";
import AbsentReport from "@/components/PresenceApp/AdminLevelComponents/AbsentReport.vue";
import ESAReports from "@/components/PresenceApp/AdminLevelComponents/ESAReports.vue";
import LeaveReport from "@/components/PresenceApp/AdminLevelComponents/LeaveReport.vue";
import PrezenceLocation from "@/components/PresenceApp/AdminLevelComponents/PrezenceLocation.vue";
import { Chart, registerables } from "chart.js";
import ExportReport from "./AdminLevelComponents/ExportReport.vue";
// import NewReport from "@/components/PresenceApp/NewReport.vue";
import SnackBar from "@/components/SnackBar.vue";
Chart.register(...registerables);

export default {
  components: {
    MonthlyReport,
    YearlyReport,
    ExportReport,
    PrezenceConfig,
    HolidayList,
    SwipeLogs,
    DataCorrection,
    UserLevel,
    EsaSetting,
    DatacorrectionSettings,
    LeaveSettings,
    PresentReport,
    AbsentReport,
    ESAReports,
    LeaveReport,
    VisitorsList,
    VisitLogs,
    // NewReport,
    SnackBar,
    AddDatacorrection,
    MemberSetting,
    KioskList,
    PrezenceLocation,
    TheRfid,
  },
  data() {
    return {
      search: "",
      loading: false,
      scanLog: false,
      componentCheck: 0,
      toggle_exclusive: "",
      settingsTab: null,
      reportTab: null,
      datacorrectionDialog: false,
      SnackBarComponent: {},
      dataCheck: false,
      initailcheck: false,
      dataCorrectionKey: 0,
      userLevelKey: 0,
      cardHeight: 0,
    };
  },
  mounted() {},
  watch: {
    toggle_exclusive(value) {
      // console.log(1, value);
      // this.initailcheck = false;
      this.dataCheck = false;

      if (value == "configuration") {
        this.settingsTab--;
        this.reportTab = null;
      } else if (value == "reports") {
        this.reportTab--;
        this.settingsTab = null;
      } else if (value == "datacorrection") {
        this.dataCheck = true;
      } else if (value == "newcheck") {
        this.dataCheck = true;
      }
      return;
    },
    // initailcheck(val) {
    //   this.dataCheck = true;

    //   console.log(val);
    // },
    // toggle_exclusive(value) {
    //   console.log(value);

    //   this.dataCheck = false;
    //   if (value == "configuration") {
    //     this.settingsTab--;
    //     this.reportTab = null;
    //   } else if (value == "reports") {
    //     this.reportTab--;
    //     this.settingsTab = null;
    //   } else if (value == "datacorrection") {
    //     this.dataCheck = true;
    //     console.log(this.dataCheck);
    //   }
    // },
  },
  // computed: {
  //   // Destructure the component name and parameters based on the flowSteps value
  //   DataCorrection() {
  //     if (this.toggle_exclusive == "datacorrection")
  //       // const { component } = this.getComponentInfo(this.toggle_exclusive);

  //       // this.componentParams = parameters;

  //       return DataCorrection;
  //   },
  // },

  mounted() {
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {
    back_call() {
      this.$router.push("/AdminLevelApps");
    },

    openCamera() {
      this.componentCheck = 1;
      this.scanLog = true;
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.requestDialog = false;
    },

    success_info(val) {
      // console.log(val);
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.scanLog = false;
      this.datacorrectionDialog = false;
    },

    async data_correction_refresh() {
      this.dataCorrectionKey += 1;
    },

    user_scan_refresh() {
      this.userLevelKey += 1;
    },

    add_data_correction() {
      this.componentCheck = 2;
      this.datacorrectionDialog = true;
    },
  },
};
</script>

  
  <style>
</style>