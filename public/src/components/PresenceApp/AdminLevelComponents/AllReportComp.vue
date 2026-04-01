<template>
  <div style="background-color: white">
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-chart-line</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Reports</span>
          <span class="header-subtitle">Attendance reports and analytics</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Filter Button for Monthly, Yearly, and ESA Reports -->
        <v-btn v-if="
          toggle_exclusive === 'monthlyReport' ||
          toggle_exclusive === 'yearlyReport' ||
          toggle_exclusive === 'esaReport' ||
          toggle_exclusive === 'proofofwork'
        " :class="activeFiltersCount > 0
              ? 'action-btn filter-btn active'
              : 'action-btn filter-btn'
            " @click="showFilterDrawer = true" size="small">
          <v-icon>mdi-filter-variant</v-icon>
          <span>Filter</span>
          <v-badge v-if="activeFiltersCount > 0" :content="activeFiltersCount" color="white" class="ml-2" />
        </v-btn>

        <!-- Generate Report Button for ESA Reports -->
        <v-btn v-if="toggle_exclusive === 'esaReport'" @click="generateESAReport()" :loading="esaReportLoading"
          size="small" class="action-btn generate-btn ml-2">
          <v-icon>mdi-file-excel</v-icon>
          <span>Generate Report</span>
        </v-btn>

        <v-btn class="action-btn back-btn mr-4" @click="back_action()">
          <v-icon>mdi-arrow-left</v-icon>
          <span>Back</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs v-model="toggle_exclusive" mandatory class="modern-tab-toggle">
          <v-tab value="monthlyReport" class="tab-btn"> Monthly </v-tab>
          <v-tab value="yearlyReport" class="tab-btn"> Yearly </v-tab>
          <v-tab value="exportReport" class="tab-btn"> Export </v-tab>
          <v-tab value="esaReport" class="tab-btn"> ESA </v-tab>
          <v-tab value="proofofwork" class="tab-btn">
            Proof of Work
          </v-tab> </v-tabs>
      </template>
    </v-toolbar>

    <!-- Filter Navigation Drawer -->
    <v-navigation-drawer :model-value="showFilterDrawer" @update:model-value="showFilterDrawer = $event"
      location="right" temporary width="400" class="pa-0 filter-drawer" style="z-index: 1000; margin-top: 64px">
      <v-card flat>
        <v-toolbar elevation="1" density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">Filter Options</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-2" @click="closeFilterDrawer()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="filterForm">
            <div class="filter-content">
              <!-- Month Picker (for Monthly Reports) -->
              <div v-if="toggle_exclusive === 'monthlyReport'" class="filter-group">
                <label class="filter-label">Select Month</label>
                <v-text-field v-model="datedisplay" label="Select a Month" readonly density="compact" variant="outlined"
                  @click="monthPicker = true" class="filter-select cursor-pointer"></v-text-field>

                <!-- Month Picker Dialog -->
                <v-dialog v-model="monthPicker" max-width="350" persistent content-class="month-picker-dialog">
                  <v-card>
                    <v-card-text class="pa-4">
                      <v-row>
                        <v-col cols="12" sm="7">
                          <span class="ml-6" style="font-size: 19px">
                            <b>{{ datedisplayMonth }}</b>
                          </span>
                        </v-col>
                        <v-col>
                          <v-select label="Select Year" v-model="yearfilter" :items="itemyears" density="compact"
                            variant="outlined" style="max-width: 100px"></v-select>
                        </v-col>
                      </v-row>
                      <v-row class="ml-n2" dense>
                        <v-col v-for="(month, index) in monthNames" :key="index" cols="4" class="d-flex justify-center">
                          <v-btn class="ma-1" :class="{ 'active-btn': month === monthfilter }" density="compact"
                            :disabled="isMonthDisabled(index)" @click="selectMonth(month)">
                            {{ month }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row class="mt-4 justify-end">
                        <v-btn variant="text" class="ma-1" color="#DB4C77" density="compact" @click="closedialog()">
                          Cancel
                        </v-btn>
                        <v-btn color="#DB4C77" variant="text" density="compact" @click="saveSelection">
                          Save
                        </v-btn>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </div>

              <!-- Year Selection (for Yearly Reports) -->
              <div v-if="toggle_exclusive === 'yearlyReport'" class="filter-group">
                <label class="filter-label">Select Year</label>
                <v-select v-model="yearlyYearFilter" label="Select Year" density="compact" variant="outlined"
                  :items="itemyears" class="filter-select"></v-select>
              </div>

              <!-- Month Selection (for ESA Reports) -->
              <div v-if="toggle_exclusive === 'esaReport'" class="filter-group">
                <label class="filter-label">Select Month</label>
                <v-text-field v-model="esaDateDisplay" label="Select a Month" readonly density="compact"
                  variant="outlined" @click="esaMonthPicker = true" class="filter-select cursor-pointer"></v-text-field>

                <!-- ESA Month Picker Dialog -->
                <v-dialog v-model="esaMonthPicker" max-width="350" persistent content-class="month-picker-dialog">
                  <v-card>
                    <v-card-text class="pa-4">
                      <v-row>
                        <v-col cols="12" sm="7">
                          <span class="ml-6" style="font-size: 19px">
                            <b>{{ esaDateDisplayMonth }}</b>
                          </span>
                        </v-col>
                        <v-col>
                          <v-select label="Select Year" v-model="esaYearFilter" :items="itemyears" density="compact"
                            variant="outlined" style="max-width: 100px"></v-select>
                        </v-col>
                      </v-row>
                      <v-row class="ml-n2" dense>
                        <v-col v-for="(month, index) in monthNames" :key="index" cols="4" class="d-flex justify-center">
                          <v-btn class="ma-1" :class="{ 'active-btn': month === esaMonthFilter }" density="compact"
                            :disabled="isESAMonthDisabled(index)" @click="selectESAMonth(month)">
                            {{ month }}
                          </v-btn>
                        </v-col>
                      </v-row>
                      <v-row class="mt-4 justify-end">
                        <v-btn variant="text" class="ma-1" color="#DB4C77" density="compact" @click="closeESADialog()">
                          Cancel
                        </v-btn>
                        <v-btn color="#DB4C77" variant="text" density="compact" @click="saveESASelection">
                          Save
                        </v-btn>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </div>

              <!-- User Selection -->
              <div class="filter-group">
                <label class="filter-label">Search User</label>
                <v-autocomplete v-model="userselect" label="Search User" density="compact" variant="outlined"
                  item-text="title" item-value="user_id" :items="userArray" hide-no-data placeholder="Min 3 Character"
                  hide-selected class="filter-select">
                </v-autocomplete>
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn variant="outlined" size="small" @click="clearFilters" class="text-capitalize">
            <v-icon class="mr-2">mdi-close</v-icon>
            Clear All
          </v-btn>
          <v-btn dark size="small" @click="applyFilterFromDrawer" :loading="goLoading"
            class="text-capitalize cardCss text-white">
            <v-icon class="mr-2">mdi-filter</v-icon>
            Apply Filter
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-navigation-drawer>

    <div class="text-left" v-if="toggle_exclusive === 'monthlyReport'">
      <v-card flat class="overflow-auto" :style="{ backgroundColor: 'white' }">
        <MonthlyReport ref="monthlyReportRef" :selectedYear="yearfilter" :selectedMonth="monthfilter"
          :selectedUser="userselect" @filter-applied="handleFilterApplied" />
      </v-card>
    </div>

    <div class="text-left" v-if="toggle_exclusive === 'exportReport'">
      <v-card flat :height="cardHeight" class="overflow-auto" :style="{ backgroundColor: 'white' }">
        <ExportReport />
      </v-card>
    </div>

    <div class="text-left" v-if="toggle_exclusive === 'esaReport'">
      <v-card flat :height="cardHeight" class="overflow-auto" :style="{ backgroundColor: 'white' }">
        <ESAReports ref="esaReportRef" :selectedYear="esaYearFilter" :selectedMonth="esaMonthFilter"
          @filter-applied="handleFilterApplied" />
      </v-card>
    </div>

    <div class="text-left" v-if="toggle_exclusive === 'yearlyReport'">
      <v-card flat :height="cardHeight" class="overflow-auto" :style="{ backgroundColor: 'white' }">
        <YearlyReport ref="yearlyReportRef" :selectedYear="yearlyYearFilter" :selectedUser="userselect"
          @filter-applied="handleFilterApplied" />
      </v-card>
    </div>

    <div class="text-left" v-if="toggle_exclusive === 'proofofwork'">
      <v-card flat :height="cardHeight" class="overflow-auto" :style="{ backgroundColor: 'white' }">
        <PowReport />
      </v-card>
    </div>
  </div>
</template>

<script>
import MonthlyReport from "@/components/PresenceApp/AdminLevelComponents/MonthlyReport.vue";
import ExportReport from "@/components/PresenceApp/AdminLevelComponents/ExportReport.vue";
import ESAReports from "@/components/PresenceApp/AdminLevelComponents/ESAReports.vue";
import YearlyReport from "@/components/PresenceApp/AdminLevelComponents/YearlyReport.vue";
import PowReport from "@/components/PresenceApp/AdminLevelComponents/PowReport.vue";

import { all_users_of_organization } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    MonthlyReport,
    ExportReport,
    ESAReports,
    YearlyReport, PowReport
  },
  data: () => ({
    toggle_exclusive: "monthlyReport",
    cardHeight: 0,

    // Filter related properties
    showFilterDrawer: false,
    goLoading: false,
    monthPicker: false,
    yearfilter: new Date().getFullYear(),
    yearlyYearFilter: new Date().getFullYear(),
    monthfilter: "",
    monthNames: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datedisplay: "",
    datedisplayMonth: "",
    userselect: "ALL",
    userArray: [],
    itemyears: [],
    monthitems: [],

    // ESA Report filters
    esaMonthPicker: false,
    esaDateDisplay: "",
    esaDateDisplayMonth: "",
    esaYearFilter: new Date().getFullYear(),
    esaMonthFilter: "",
    esaReportLoading: false,
  }),
  mounted() {
    this.cardHeight = window.innerHeight - 140;
    this.populateYearItems();
    this.setInitialFilters();
    this.get_all_org_users();
  },
  computed: {
    activeFiltersCount() {
      let count = 0;

      if (this.toggle_exclusive === "monthlyReport") {
        // Count month filter
        if (this.monthfilter && this.monthfilter !== "") {
          count++;
        }

        // Count year filter (if not current year)
        if (this.yearfilter && this.yearfilter !== new Date().getFullYear()) {
          count++;
        }
      } else if (this.toggle_exclusive === "yearlyReport") {
        // Count year filter (if not current year)
        if (
          this.yearlyYearFilter &&
          this.yearlyYearFilter !== new Date().getFullYear()
        ) {
          count++;
        }
      } else if (this.toggle_exclusive === "esaReport") {
        // Count month filter
        if (this.esaMonthFilter && this.esaMonthFilter !== "") {
          count++;
        }

        // Count year filter (if not current year)
        if (
          this.esaYearFilter &&
          this.esaYearFilter !== new Date().getFullYear()
        ) {
          count++;
        }
      }

      // Count user filter (if not ALL)
      if (this.userselect && this.userselect !== "ALL") {
        count++;
      }

      return count;
    },
  },
  watch: {
    yearfilter() {
      this.monthfilter = "";
      this.updateMonthItems(this.yearfilter);
      this.updateDatedisplayMonth();
    },
    yearlyYearFilter() {
      // Trigger yearly report refresh when year changes
      if (this.$refs.yearlyReportRef) {
        this.$refs.yearlyReportRef.get_data();
      }
    },
    esaYearFilter() {
      this.esaMonthFilter = "";
      this.updateESADatedisplayMonth();
    },
    esaMonthFilter() {
      this.updateESADatedisplayMonth();
    },
    monthfilter() {
      this.updateDatedisplayMonth();
    },
    datedisplayMonth() {
      // Update the display when the month display changes
      if (this.datedisplayMonth) {
        this.datedisplay = this.datedisplayMonth;
      }
    },
    esaDateDisplayMonth() {
      // Update the display when the ESA month display changes
      if (this.esaDateDisplayMonth) {
        this.esaDateDisplay = this.esaDateDisplayMonth;
      }
    },
  },
  methods: {
    back_action() {
      this.$store.commit("SetattendenceBack", true);
      this.$router.push("/home/UserLevel");
    },

    // Filter drawer methods
    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },

    applyFilterFromDrawer() {
      this.goLoading = true;

      // Call the appropriate child component's filter method
      if (
        this.toggle_exclusive === "monthlyReport" &&
        this.$refs.monthlyReportRef
      ) {
        this.$refs.monthlyReportRef.get_data();
      } else if (
        this.toggle_exclusive === "yearlyReport" &&
        this.$refs.yearlyReportRef
      ) {
        this.$refs.yearlyReportRef.get_data();
      } else if (
        this.toggle_exclusive === "esaReport" &&
        this.$refs.esaReportRef
      ) {
        this.$refs.esaReportRef.get_data();
      }

      this.closeFilterDrawer();
      this.goLoading = false;
    },

    clearFilters() {
      const currentYear = new Date().getFullYear();

      if (this.toggle_exclusive === "monthlyReport") {
        this.yearfilter = currentYear;
        this.updateMonthItems(currentYear);
        this.monthfilter = this.monthNames[new Date().getMonth()];
        this.updateDatedisplayMonth();
        this.datedisplay = this.datedisplayMonth;

        // Refresh the monthly report with cleared filters
        if (this.$refs.monthlyReportRef) {
          this.$refs.monthlyReportRef.get_data();
        }
      } else if (this.toggle_exclusive === "yearlyReport") {
        this.yearlyYearFilter = currentYear;

        // Refresh the yearly report with cleared filters
        if (this.$refs.yearlyReportRef) {
          this.$refs.yearlyReportRef.get_data();
        }
      } else if (this.toggle_exclusive === "esaReport") {
        this.esaYearFilter = currentYear;
        this.esaMonthFilter = this.monthNames[new Date().getMonth()];
        this.updateESADatedisplayMonth();
        this.esaDateDisplay = this.esaDateDisplayMonth;

        // Refresh the ESA report with cleared filters
        if (this.$refs.esaReportRef) {
          this.$refs.esaReportRef.get_data();
        }
      }

      this.userselect = "ALL";
    },

    // Month picker methods
    selectMonth(month) {
      this.monthfilter = month;
    },

    closedialog() {
      this.monthPicker = false;
      this.monthfilter = "";
    },

    saveSelection() {
      this.monthPicker = false;
      this.updateDatedisplayMonth();
      this.datedisplay = this.datedisplayMonth;
      this.updateMonthValue();
    },

    populateYearItems() {
      const organizationTimestamp =
        this.$store.getters.GetOrgDetails?.organization
          ?.organization_created_on;
      if (!organizationTimestamp) return;

      const organizationYear = new Date(
        organizationTimestamp * 1000
      ).getFullYear();
      const currentYear = new Date().getFullYear();
      this.itemyears = Array.from(
        { length: currentYear - organizationYear + 1 },
        (_, index) => organizationYear + index
      );
    },

    setInitialFilters() {
      const currentYear = new Date().getFullYear();
      this.yearfilter = currentYear;
      this.updateMonthItems(currentYear);
      this.monthfilter = this.monthNames[new Date().getMonth()];
      this.updateDatedisplayMonth();
      this.datedisplay = this.datedisplayMonth;

      // Set ESA filters
      this.esaYearFilter = currentYear;
      this.esaMonthFilter = this.monthNames[new Date().getMonth()];
      this.updateESADatedisplayMonth();
      this.esaDateDisplay = this.esaDateDisplayMonth;
    },

    updateMonthItems(year) {
      const organizationTimestamp =
        this.$store.getters.GetOrgDetails?.organization
          ?.organization_created_on;
      if (!organizationTimestamp) return;

      const organizationYear = new Date(
        organizationTimestamp * 1000
      ).getFullYear();
      const organizationMonth = new Date(
        organizationTimestamp * 1000
      ).getMonth();

      if (year === organizationYear) {
        this.monthitems = this.monthNames.slice(organizationMonth);
      } else if (year === new Date().getFullYear()) {
        this.monthitems = this.monthNames.slice(0, new Date().getMonth() + 1);
      } else {
        this.monthitems = [...this.monthNames];
      }
    },

    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
      }
    },

    updateESADatedisplayMonth() {
      if (this.esaYearFilter && this.esaMonthFilter) {
        this.esaDateDisplayMonth = `${this.esaMonthFilter} ${this.esaYearFilter}`;
      }
    },

    selectESAMonth(month) {
      this.esaMonthFilter = month;
    },

    closeESADialog() {
      this.esaMonthPicker = false;
      this.esaMonthFilter = "";
    },

    saveESASelection() {
      this.esaMonthPicker = false;
      this.updateESADatedisplayMonth();
      this.esaDateDisplay = this.esaDateDisplayMonth;
    },

    isESAMonthDisabled(index) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      if (this.esaYearFilter === currentYear && index > currentMonth) {
        return true;
      }
      return false;
    },

    async generateESAReport() {
      this.esaReportLoading = true;
      try {
        if (this.$refs.esaReportRef) {
          await this.$refs.esaReportRef.generate_report();
        }
      } finally {
        this.esaReportLoading = false;
      }
    },

    updateMonthValue() {
      // This method is called to update the month value when filters change
      // It will trigger the child component to refresh data
      if (this.$refs.monthlyReportRef) {
        this.$refs.monthlyReportRef.get_data();
      }
    },

    isMonthDisabled(index) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const organizationTimestamp =
        this.$store.getters.GetOrgDetails?.organization
          ?.organization_created_on;

      if (!organizationTimestamp) return false;

      const organizationYear = new Date(
        organizationTimestamp * 1000
      ).getFullYear();
      const organizationMonth = new Date(
        organizationTimestamp * 1000
      ).getMonth();

      if (this.yearfilter === organizationYear && index < organizationMonth) {
        return true; // Disable months before organization creation
      }
      if (this.yearfilter === currentYear && index > currentMonth) {
        return true; // Disable months after the current month
      }
      return false; // Enable other months
    },

    async get_all_org_users() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(all_users_of_organization, {
            input: {
              organization_id: data.organization.organization_id,
              name_search: "",
            },
          })
        );

        var response = JSON.parse(result.data.all_users_of_organization);
        const orgUsers = response.data == undefined ? [] : response.data;

        this.userArray = [];
        orgUsers.forEach((element) => {
          if (
            element.user_status == "ACTIVE" &&
            element.user_type != "CHATBOT"
          ) {
            this.userArray.push({
              title: element.full_user_name,
              user_id: element.user_id,
            });
          }
        });

        this.userArray.sort((a, b) => a.title.localeCompare(b.title));
        this.userArray.unshift({
          title: "All",
          user_id: "ALL",
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    handleFilterApplied(filterData) {
      // This method will be called when the child component applies the filter
      console.log("Filter applied:", filterData);
    },
  },
};
</script>

<style scoped>
/* Main Container Styles */
div {
  background-color: white !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
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

.generate-btn {
  background: #4caf50 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3) !important;
  transition: all 0.3s ease !important;
}

.generate-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4) !important;
}

.generate-btn:disabled {
  background: #9e9e9e !important;
  box-shadow: none !important;
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

/* Filter Drawer Styles */
.filter-drawer {
  position: fixed !important;
  top: 64px !important;
  height: calc(100vh - 64px) !important;
}

.active-btn {
  background-color: #db4c77 !important;
  color: white !important;
  font-weight: bold;
}

/* Month Picker Dialog Styles */
.month-picker-dialog {
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e0e0e0 !important;
}

/* Override v-dialog overlay styles */
:deep(.v-overlay) {
  background: rgba(0, 0, 0, 0.3) !important;
}

:deep(.v-dialog) {
  background: transparent !important;
}

:deep(.v-dialog__content) {
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e0e0e0 !important;
}

/* Prevent white background on dialog open */
:deep(.v-dialog__content .v-card) {
  background: white !important;
}

:deep(.v-dialog__content .v-card-text) {
  background: white !important;
}

/* Ensure proper z-index for dialog */
.filter-drawer .v-dialog {
  z-index: 10001 !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
