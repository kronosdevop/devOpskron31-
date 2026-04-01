<template>
  <div>
    <v-app-bar class="modern-header-section" color="transparent">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-cog</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Configuration</span>
          <span class="header-subtitle">Configure your experience</span>
        </div>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        class="text-capitalize cardCss mr-6 text-white"
        :loading="goLoading"
        @click="back_action()"
        height="40"
      >
        <v-icon class="mr-1" color="white">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-app-bar>
    <v-card flat>
      <v-toolbar variant="flat" class="mt-n10" color="white">
        <template v-slot:extension>
          <v-tabs
            dense
            flat
            class="mt-n2 modern-tab-toggle"
            v-model="toggle_exclusive"
          >
            <v-tab value="dataCorrection" class="tab-btn">
              Data Correction
            </v-tab>
            <v-tab value="esaReport" class="tab-btn">ESA</v-tab>
            <v-tab value="holidayList" class="tab-btn"> Holiday List </v-tab>
            <v-tab value="kiosk" class="tab-btn"> Kiosk </v-tab>
            <v-tab value="leaveMarking" class="tab-btn"> Leave Marking </v-tab>
            <v-tab value="location" class="tab-btn"> Location </v-tab>
            <v-tab value="members" class="tab-btn"> Members </v-tab>
            <v-tab value="rfid" class="tab-btn"> RFID </v-tab>
            <v-tab value="shift" class="tab-btn"> Work Shifts</v-tab>
            <v-tab value="settings" class="tab-btn"> Settings </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>

      <div class="text-left" v-if="toggle_exclusive === 'esaReport'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <EsaSetting />
        </v-card>
      </div>

      <div class="text-left" v-if="toggle_exclusive === 'dataCorrection'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <DatacorrectionSettings />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'leaveMarking'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <LeaveSettings />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'holidayList'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <HolidayList />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'settings'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <PrezenceConfig />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'location'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <PrezenceLocation />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'members'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <MemberSetting />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'rfid'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <TheRfid />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'kiosk'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <KioskList />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'shift'">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <WorkShifts />
        </v-card>
      </div>
    </v-card>
  </div>
</template>

<script>
import EsaSetting from "@/components/PresenceApp/AdminLevelComponents/EsaSetting.vue";
import DatacorrectionSettings from "@/components/PresenceApp/AdminLevelComponents/DatacorrectionSettings.vue";
import LeaveSettings from "@/components/PresenceApp/AdminLevelComponents/LeaveSettings.vue";
import HolidayList from "@/components/SettingsComponents/HolidayList.vue";
import PrezenceConfig from "@/components/PresenceApp/AdminLevelComponents/PrezenceConfig.vue";
import MemberSetting from "@/components/PresenceApp/AdminLevelComponents/MemberSetting.vue";
import KioskList from "@/components/PresenceApp/AdminLevelComponents/KioskList.vue";
import PrezenceLocation from "@/components/PresenceApp/AdminLevelComponents/PrezenceLocation.vue";
import TheRfid from "@/components/PresenceApp/AdminLevelComponents/TheRfid.vue";
import WorkShifts from "@/components/PresenceApp/AdminLevelComponents/WorkShifts.vue";
export default {
  components: {
    EsaSetting,
    DatacorrectionSettings,
    LeaveSettings,
    HolidayList,
    PrezenceConfig,
    MemberSetting,
    KioskList,
    PrezenceLocation,
    TheRfid,
    WorkShifts,
  },
  data: () => ({
    toggle_exclusive: "dataCorrection",
    cardHeight: 0,
  }),
  mounted() {
    this.cardHeight = window.innerHeight - 125;
  },

  methods: {
    back_action() {
      this.$store.commit("SetattendenceBack", true);
      this.$router.push("/home/UserLevel");
    },
  },
};
</script>

<style scoped>
/* Modern Tabs Styles */
.modern-tabs {
  background-color: white !important;
}

.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
  text-transform: none !important;
  font-size: 14px !important;
  color: #666 !important;
}

.tab-btn:hover {
  color: #db4c77 !important;
}

/* Active tab styling */
.modern-tabs :deep(.v-tab--selected) {
  color: #db4c77 !important;
  font-weight: 600 !important;
}

.modern-tabs :deep(.v-tab--selected .v-tab__content) {
  color: #db4c77 !important;
}

/* Tab indicator */
.modern-tabs :deep(.v-tabs__bar) {
  background-color: white !important;
}

.modern-tabs :deep(.v-tabs__slider) {
  background-color: #db4c77 !important;
  height: 3px !important;
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
