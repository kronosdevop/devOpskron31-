<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-cog</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title"> Settings</span>
          <span class="header-subtitle"
            >Manage system settings and configurations</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Search Field -->
        <div v-if="adminToggle === 'admins'" class="search-container">
          <v-text-field
            v-model="searchValue"
            placeholder="Search admins..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
            clearable
            @update:model-value="handleSearchChange"
          />
        </div>

        <!-- Apps Search and Filter -->
        <div v-if="adminToggle === 'apps'" class="apps-controls">
          <!-- Search Field -->
          <div class="search-container">
            <v-text-field
              v-model="appsSearchQuery"
              placeholder="Search apps..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              v-if="billingType !== 'FREE_TIER'"
              hide-details
              class="search-field"
              clearable
              @update:model-value="handleAppsSearchChange"
            />
          </div>

          <!-- App Type Filter -->
          <!-- <v-radio-group
            v-model="appsToggleExclusive"
            inline
            color="primary"
            class="apps-radio-group"
            v-if="billingType !== 'FREE_TIER'"
          >
            <v-radio label="User Apps" value="apps"></v-radio>
            <v-radio label="Admin Apps" value="restrictedApps"></v-radio>
          </v-radio-group> -->
        </div>

        <!-- Audit Trail Filter Controls -->
        <div v-if="adminToggle === 'audit'" class="audit-controls">
          <v-btn class="action-btn mr-n1" @click="openExportDialog = true">
            <v-icon>mdi-download</v-icon>
            Export
          </v-btn>

          <!-- Filter Button -->
          <v-btn
            :class="
              auditActiveFiltersCount > 0
                ? 'action-btn filter-btn active'
                : 'action-btn filter-btn'
            "
            @click="showAuditFilterDrawer = true"
            size="small"
          >
            <v-icon>mdi-filter-variant</v-icon>
            <span>Filter</span>
            <v-badge
              v-if="auditActiveFiltersCount > 0"
              :content="auditActiveFiltersCount"
              color="white"
              class="ml-2"
            />
          </v-btn>
        </div>

        <!-- Settings Controls -->
        <!-- <div v-if="adminToggle === 'settings'" class="settings-controls">
          <div class="current-plan-card" @click="openUpgradeDialog">
            <div class="plan-info">
              <div class="plan-label">Current Plan</div>
              <div class="plan-name">{{ billingType }}</div>
            </div>
            <v-icon size="18" color="#DB4C77" class="upgrade-icon"
              >mdi-chevron-right</v-icon
            >
          </div>
        </div> -->

        <v-btn
          v-if="adminToggle === 'admins'"
          class="action-btn add-btn"
          @click="addAdmin()"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Admin</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs
          v-model="adminToggle"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
        >
          <v-tab value="settings" class="tab-btn"> General </v-tab>
          <v-tab value="apps" class="tab-btn"> Apps </v-tab>
          <v-tab value="audit" class="tab-btn"> Audit Trail </v-tab>
          <v-tab value="admins" class="tab-btn"> Admins </v-tab>
          <v-tab value="apiSettings" class="tab-btn"> API Settings </v-tab>
          <v-tab value="territory" class="tab-btn"> Territory </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <div class="text-left" v-if="adminToggle === 'apps'">
      <AdminApps ref="adminAppsRef" v-on:backAction="back_info" />
    </div>
    <div class="text-left" v-if="adminToggle === 'audit'">
      <AuditTrail
        ref="auditTrailRef"
        :fromDate="auditComputedDateDisplay"
        :toDate="auditDataDisplayFormatted"
        :statusType="auditSelectStatusType"
        :sourceType="auditSelectSourceType"
        @filter-applied="handleAuditFilterApplied"
        v-on:backAction="back_info"
        :openExportDialog="openExportDialog"
        @clicked="AuditTrialEmit"
      />
    </div>
    <div class="text-left" v-if="adminToggle === 'admins'">
      <AdminsList
        ref="adminsListRef"
        :searchValue="searchValue"
        v-on:backAction="back_info"
      />
    </div>
    <div class="text-left" v-if="adminToggle === 'apiSettings'">
      <APISettings v-on:backAction="back_info" />
    </div>
    <div class="text-left" v-if="adminToggle === 'territory'">
      <AssetTerritories v-on:backAction="back_info" />
    </div>
    <div class="text-left mt-10" v-if="adminToggle === 'settings'">
      <AdvanceSettings v-on:backAction="back_info" />
    </div>

    <!-- Audit Trail Filter Navigation Drawer -->
    <v-navigation-drawer
      :model-value="showAuditFilterDrawer"
      @update:model-value="showAuditFilterDrawer = $event"
      location="right"
      temporary
      :width="$vuetify.display.smAndDown ? '100%' : '400'"
      class="pa-0 filter-drawer"
      style="z-index: 1000"
    >
      <v-card flat>
        <v-toolbar elevation="1" density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">Audit Trail Filter Options</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-2" @click="closeAuditFilterDrawer()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text>
          <v-form ref="auditFilterForm">
            <div class="filter-content">
              <!-- From Date Filter -->
              <div class="filter-group">
                <label class="filter-label">From Date</label>
                <v-text-field
                  v-model="auditComputedDateDisplay"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="openAuditDatePicker"
                  class="filter-select"
                >
                  <v-dialog
                    v-model="auditDatePicker"
                    persistent
                    max-width="325"
                  >
                    <v-card>
                      <v-date-picker
                        v-model="auditTempDate"
                        :max="new Date().toISOString().substr(0, 10)"
                        color="#DB4C77"
                        class="primaryColor"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          text
                          color="primaryColor"
                          @click="auditDatePicker = false"
                          >Cancel</v-btn
                        >
                        <v-btn text color="primaryColor" @click="saveAuditDate"
                          >OK</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-text-field>
              </div>

              <!-- To Date Filter -->
              <div class="filter-group">
                <label class="filter-label">To Date</label>
                <v-text-field
                  v-model="auditDataDisplayFormatted"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="openAuditDatePickerTo"
                  class="filter-select"
                >
                  <v-dialog
                    v-model="auditDatePickerTo"
                    persistent
                    max-width="325"
                  >
                    <v-card>
                      <v-date-picker
                        v-model="auditTempDateTo"
                        :max="new Date().toISOString().substr(0, 10)"
                        color="#DB4C77"
                        class="primaryColor"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          text
                          color="primaryColor"
                          @click="auditDatePickerTo = false"
                          >Cancel</v-btn
                        >
                        <v-btn
                          text
                          color="primaryColor"
                          @click="saveAuditDateTo"
                          >OK</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-text-field>
              </div>

              <!-- App Filter -->
              <div class="filter-group">
                <label class="filter-label">Filter By App</label>
                <v-select
                  v-model="auditSelectStatusType"
                  :items="[
                    { title: 'All', value: 'ALL' },
                    { title: 'Cabinet', value: 'CABINET' },
                    { title: 'Channel', value: 'CHANNEL' },
                    { title: 'Dashboard', value: 'DASHBOARD' },
                    { title: 'Directory', value: 'DIRECTORY' },
                    { title: 'Events', value: 'EVENTS' },
                    { title: 'Expense', value: 'EXPENSE' },
                    { title: 'Form', value: 'FORM' },
                    { title: 'Presence', value: 'PRESENCE' },
                    { title: 'Slot Booking', value: 'SLOT_BOOKING' },
                    { title: 'Stichh', value: 'STICHH' },
                    { title: 'Task', value: 'TASK' },
                    { title: 'Ticket Management', value: 'TICKET_MANAGEMENT' },
                    { title: 'Timesheet', value: 'TIMESHEET' },
                    { title: 'Workflow', value: 'WORKFLOW' },
                  ]"
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
              </div>

              <!-- Source Filter -->
              <div class="filter-group">
                <label class="filter-label">Filter By Source</label>
                <v-select
                  v-model="auditSelectSourceType"
                  :items="[
                    { title: 'All', value: '0' },
                    { title: 'Web', value: '1' },
                    { title: 'Phone', value: '2' },
                  ]"
                  item-text="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
              </div>

              <!-- Action Buttons -->
              <div class="filter-actions">
                <v-btn
                  :loading="auditGoLoading"
                  class="apply-filter-btn"
                  @click="applyAuditFilterFromDrawer()"
                  block
                >
                  <v-icon class="mr-2">mdi-filter</v-icon>
                  Apply Filters
                </v-btn>
                <v-btn
                  class="clear-filter-btn"
                  @click="clearAuditFilters()"
                  block
                  variant="outlined"
                >
                  <v-icon class="mr-2">mdi-close</v-icon>
                  Clear All
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <ExportAuditTrailDialog
      :DialogExportAuditTrail="DialogExportAuditTrail"
      @clicked="DialogExportAuditTrailEmit()"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Upgrade Dialog -->
    <UpgradeDialog v-model="showUpgradeDialog" @show-snackbar="showSnackbar" />
  </div>
</template>
<script>
/* eslint-disable */

// Imports
import AdminApps from "@/components/AdminApps.vue";
import AuditTrail from "@/components/AuditTrail.vue";
import AdminsList from "@/components/SettingsComponents/AdminsList.vue";
import AdvanceSettings from "@/components/AdvanceSettings.vue";
import APISettings from "@/components/SettingsComponents/APISettings.vue";
import UpgradeDialog from "@/components/AdminApps/UpgradeDialog.vue";
import ExportAuditTrailDialog from "@/components/ExportAuditTrailDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import AssetTerritories from "@/components/Asset/AdminApps/AssetTerritories.vue";

export default {
  // Components
  components: {
    AdminApps,
    AuditTrail,
    AdminsList,
    AdvanceSettings,
    APISettings,
    UpgradeDialog,
    ExportAuditTrailDialog,
    SnackBar,
    AssetTerritories,
  },

  // Data
  data() {
    return {
      openExportDialog: false,
      // Tab and navigation properties
      activeTabs: [0],
      adminToggle: "settings",
      cardVisibility: 0,

      // Component keys for re-rendering
      appsKey: 0,
      auditKey: 0,
      adminsKey: 0,
      billingKey: 0,
      settingsKey: 0,

      // Search and filter properties
      searchValue: "",
      appsSearchQuery: "",
      appsToggleExclusive: "apps",
      billingType: "MICRO",

      // Audit Trail Filter Properties
      showAuditFilterDrawer: false,
      auditGoLoading: false,
      auditDatePicker: false,
      auditDatePickerTo: false,
      auditTempDate: new Date().toISOString().substr(0, 10),
      auditTempDateTo: new Date().toISOString().substr(0, 10),
      auditComputedDateDisplay: "",
      auditDataDisplayFormatted: "",
      auditSelectStatusType: "ALL",
      auditSelectSourceType: "0",

      // Upgrade Dialog Properties
      showUpgradeDialog: false,

      // Export Audit Trail Dialog
      DialogExportAuditTrail: false,

      SnackBarComponent: {},
    };
  },

  // Lifecycle hooks
  created() {
    // Initialize audit trail filter display dates
    this.auditComputedDateDisplay = this.formatAuditDate(this.auditTempDate);
    this.auditDataDisplayFormatted = this.formatAuditDate(this.auditTempDateTo);
  },

  mounted() {
    // Initialize audit trail filter display dates
    this.auditComputedDateDisplay = this.formatAuditDate(this.auditTempDate);
    this.auditDataDisplayFormatted = this.formatAuditDate(this.auditTempDateTo);
    this.billingType =
      this.$store.getters.GetOrgDetails.organization
        .organization_billing_type == undefined
        ? "MICRO"
        : this.$store.getters.GetOrgDetails.organization
            .organization_billing_type;
    // console.log("billingType", this.billingType);
  },

  // Computed properties
  computed: {
    auditActiveFiltersCount() {
      let count = 0;

      // Get today's date in the same format as the display
      const today = new Date().toISOString().substr(0, 10);
      const todayFormatted = this.formatAuditDate(today);

      // Count date filters only if they differ from today's date
      if (
        this.auditComputedDateDisplay &&
        this.auditComputedDateDisplay !== "" &&
        this.auditComputedDateDisplay !== todayFormatted
      ) {
        count++;
      }
      if (
        this.auditDataDisplayFormatted &&
        this.auditDataDisplayFormatted !== "" &&
        this.auditDataDisplayFormatted !== todayFormatted
      ) {
        count++;
      }

      // Count status filter (if not default)
      if (this.auditSelectStatusType && this.auditSelectStatusType !== "ALL") {
        count++;
      }

      // Count source filter (if not default)
      if (this.auditSelectSourceType && this.auditSelectSourceType !== "0") {
        count++;
      }

      return count;
    },
  },

  // Watchers
  watch: {
    adminToggle(newValue, oldValue) {
      // console.log("adminToggle changed from", oldValue, "to", newValue);
    },
    appsToggleExclusive(newValue, oldValue) {
      // Handle apps toggle change
      if (newValue !== oldValue) {
        this.handleAppsToggleChange(newValue);
      }
    },
  },

  // Methods
  methods: {
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
    },
    // Tab and navigation methods
    change_tab(index) {
      this.activeTabs = [index];
    },

    get_changes_data(value) {
      this.$store.commit("SetadministrationCheck", false);
    },

    navigate_to_respective(value) {
      this.cardVisibility = 1;
      this.adminToggle = value;
    },

    back_info() {
      this.cardVisibility = 0;
      this.adminToggle = "settings";
    },

    // Admin management methods
    handleSearchChange(value) {
      this.searchValue = value;
      // Emit the search value to the AdminsList component
      this.$refs.adminsListRef &&
        this.$refs.adminsListRef.handleSearchChange(value);
    },

    addAdmin() {
      // Emit the add admin action to the AdminsList component
      this.$refs.adminsListRef && this.$refs.adminsListRef.add_action();
    },

    // Apps management methods
    handleAppsSearchChange(value) {
      this.appsSearchQuery = value;
      // Emit the search value to the AdminApps component
      this.$refs.adminAppsRef &&
        this.$refs.adminAppsRef.handleSearchChange(value);
    },

    handleAppsToggleChange(value) {
      // Emit the toggle value to the AdminApps component
      if (this.$refs.adminAppsRef) {
        this.$refs.adminAppsRef.handleToggleChange(value);
      }
    },

    // Audit Trail Filter Methods
    closeAuditFilterDrawer() {
      this.showAuditFilterDrawer = false;
    },

    applyAuditFilterFromDrawer() {
      this.auditGoLoading = true;

      if (this.$refs.auditTrailRef) {
        this.$refs.auditTrailRef.filter_todata();
      }
      this.closeAuditFilterDrawer();
      this.auditGoLoading = false;
    },

    clearAuditFilters() {
      // Reset to current date
      const currentDate = new Date().toISOString().substr(0, 10);
      this.auditTempDate = currentDate;
      this.auditTempDateTo = currentDate;
      this.auditComputedDateDisplay = this.formatAuditDate(this.auditTempDate);
      this.auditDataDisplayFormatted = this.formatAuditDate(
        this.auditTempDateTo
      );
      this.auditSelectStatusType = "ALL";
      this.auditSelectSourceType = "0";

      // Refresh the audit trail with cleared filters and reset pagination
      if (this.$refs.auditTrailRef) {
        this.$refs.auditTrailRef.clearFiltersAndReset();
      }
    },

    // Date picker methods
    saveAuditDate() {
      if (this.auditTempDate) {
        this.auditComputedDateDisplay = this.formatAuditDate(
          this.auditTempDate
        );
      }
      this.auditDatePicker = false;
    },

    saveAuditDateTo() {
      if (this.auditTempDateTo) {
        this.auditDataDisplayFormatted = this.formatAuditDate(
          this.auditTempDateTo
        );
      }
      this.auditDatePickerTo = false;
    },

    openAuditDatePicker() {
      if (!this.auditTempDate) {
        this.auditTempDate = new Date().toISOString().substr(0, 10);
      }
      this.auditDatePicker = true;
    },

    openAuditDatePickerTo() {
      if (!this.auditTempDateTo) {
        this.auditTempDateTo = new Date().toISOString().substr(0, 10);
      }
      this.auditDatePickerTo = true;
    },

    formatAuditDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
    },

    handleAuditFilterApplied(filterData) {
      // This method will be called when the child component applies the filter
      console.log("Audit filter applied:", filterData);
    },

    // Upgrade Dialog Methods
    openUpgradeDialog() {
      this.showUpgradeDialog = true;
    },

    showSnackbar(config) {
      this.$SnackBar = {
        SnackbarVmodel: true,
        SnackbarColor: config.color || "success",
        SnackbarText: config.text,
        timeout: 5000,
        Top: true,
      };
    },

    DialogExportAuditTrailEmit() {
      this.DialogExportAuditTrail = false;
    },
    AuditTrialEmit(Toggle) {
      if (Toggle) {
        this.openExportDialog = false;
      }
    },
  },
};
</script>

<style scoped>
/* Modern Header Section */

/* Main Container Styles */
div {
  background-color: white !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Search Container Styles */
.search-container {
  margin-right: 16px;
  min-width: 200px;
}

.search-field {
  width: 100%;
}

/* Apps Controls Styles */
.apps-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.apps-radio-group {
  margin: 0;
}

.apps-radio-group :deep(.v-radio) {
  margin-right: 16px;
}

.apps-radio-group :deep(.v-radio:last-child) {
  margin-right: 0;
}

/* Audit Controls Styles */
.audit-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Settings Controls Styles */
.settings-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-plan-card {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-width: 140px;
}

.current-plan-card:hover {
  border-color: #db4c77;
  box-shadow: 0 4px 16px rgba(219, 76, 119, 0.15);
  transform: translateY(-1px);
}

.plan-info {
  display: flex;
  flex-direction: column;
  margin-right: 8px;
}

.plan-label {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-name {
  font-size: 0.9rem;
  color: #db4c77;
  font-weight: 600;
  margin-top: 2px;
}

.upgrade-icon {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.current-plan-card:hover .upgrade-icon {
  opacity: 1;
  transform: translateX(2px);
}

/* Action Button Styles */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  min-height: 36px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
}

.add-btn {
  background: #db4c77 !important;
}

.add-btn:hover {
  background: #c2185b !important;
}

/* Filter Button Styles */
.filter-btn {
  background: #e91e63 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3) !important;
  transition: all 0.3s ease !important;
}

.filter-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4) !important;
}

.filter-btn.active {
  background: #c2185b !important;
  box-shadow: 0 2px 8px rgba(194, 24, 91, 0.3) !important;
}

.filter-btn.active:hover {
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.4) !important;
}

/* Filter Drawer Styles */
.filter-drawer {
  position: fixed !important;
  top: 0 !important;
  height: 100vh !important;
}

.filter-drawer .v-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-drawer .v-card-text {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  max-height: calc(100vh - 180px);
}

/* Navigation Drawer Styles */
.navBar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.custom-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

/* Filter Content Styles */
.filter-content {
  padding: 16px 0;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.filter-select {
  width: 100%;
}

.filter-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.apply-filter-btn {
  background: #db4c77 !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 40px !important;
  min-height: 40px !important;
}

.clear-filter-btn {
  background: #f5f5f5 !important;
  color: #666 !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 40px !important;
  min-height: 40px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px;
  }

  .search-container {
    min-width: 200px;
    margin-right: 8px;
  }

  .filter-drawer {
    width: 100% !important;
  }
}

@media (min-width: 768px) {
  .filter-drawer .v-card-text {
    max-height: calc(100vh - 160px);
  }
}

@media (min-width: 1024px) {
  .filter-drawer .v-card-text {
    max-height: calc(100vh - 150px);
  }
}
</style>
