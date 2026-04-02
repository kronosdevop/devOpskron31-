<template>
  <div>
    <v-card flat :height="windowHeight" class="overflow-y-auto">
      <div class="presence-dashboard-container">
        <!-- Header Section -->
        <v-card flat class="header-section" elevation="0">
          <v-container fluid class="pa-0">
            <v-row align="center" class="ma-0">
              <v-col cols="12" class="pa-4">
                <div
                  class="d-flex align-center justify-space-between flex-wrap"
                >
                  <div class="d-flex align-center">
                    <h2
                      class="text-h5 font-weight-bold primary--text mb-0 mr-6"
                    >
                      Presence Dashboard
                    </h2>
                    <v-chip color="primary" outlined class="font-weight-medium">
                      <v-icon left small>mdi-calendar-today</v-icon>
                      {{ formattedDate }}
                    </v-chip>
                  </div>

                  <!-- Quick Stats -->
                  <div class="d-flex align-center">
                    <v-chip
                      color="success"
                      outlined
                      class="mr-3 font-weight-medium"
                    >
                      <v-icon left small>mdi-account-check</v-icon>
                      {{ getTotalPresent() }} Present
                    </v-chip>
                    <v-chip
                      color="error"
                      outlined
                      class="mr-3 font-weight-medium"
                    >
                      <v-icon left small>mdi-account-remove</v-icon>
                      {{ getTotalAbsent() }} Absent
                    </v-chip>
                    <v-chip color="info" outlined class="font-weight-medium">
                      <v-icon left small>mdi-account-clock</v-icon>
                      {{ getTotalLeave() }} Leave
                    </v-chip>
                    <!-- <v-btn
                      size="small"
                      class="text-capitalize text-white cardCss ml-3"
                      v-if="adminAppExists"
                      @click="back_call()"
                    >
                      <v-icon class="mr-2">mdi-step-backward</v-icon>
                      Back
                    </v-btn> -->
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card>

        <!-- Main Content -->
        <v-card flat class="content-section" elevation="0">
          <v-container fluid class="pa-0">
            <v-row class="ma-0">
              <!-- Left Column - Chart and Stats Cards -->
              <v-col cols="12" lg="8" class="pa-4">
                <!-- Chart Section -->
                <v-card class="chart-card mb-6" elevation="2" rounded="lg">
                  <div class="chart-header pa-4">
                    <div class="d-flex align-center justify-space-between">
                      <div>
                        <h3
                          class="text-h6 font-weight-bold grey--text text--darken-2 mb-1"
                        >
                          Daily Attendance Overview
                        </h3>
                        <p class="text-body-2 grey--text mb-0">
                          Attendance distribution across departments
                        </p>
                      </div>
                      <!-- <div class="chart-legend">
                    <div class="legend-item">
                      <div class="legend-color present"></div>
                      <span class="legend-text">Present</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color absent"></div>
                      <span class="legend-text">Absent</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color leave"></div>
                      <span class="legend-text">Leave</span>
                    </div>
                  </div> -->
                    </div>
                  </div>

                  <div class="chart-container pa-4">
                    <apexchart
                      type="bar"
                      height="300"
                      :options="chartOptions"
                      :series="chartSeries"
                    />
                  </div>
                </v-card>

                <!-- Stats Cards Grid -->
                <div class="stats-cards-grid">
                  <v-card
                    v-for="(card, index) in leftCards"
                    :key="index"
                    class="stats-card"
                    :class="`stats-card-${card.label.toLowerCase()}`"
                    elevation="2"
                    rounded="lg"
                    @click="handleCardClick(card.label)"
                  >
                    <div class="card-content">
                      <div class="card-icon">
                        <v-icon size="32" :color="card.color">{{
                          card.icon
                        }}</v-icon>
                      </div>
                      <div class="card-info">
                        <h3 class="card-title">{{ card.label }}</h3>
                        <div class="card-count">
                          <span class="count-number">{{ card.value }}</span>
                          <span class="count-label">Employees</span>
                        </div>
                        <div class="card-subtitle">
                          {{ getCardSubtitle(card.label) }}
                        </div>
                      </div>
                      <div class="card-action">
                        <v-icon color="grey lighten-1">mdi-arrow-right</v-icon>
                      </div>
                    </div>
                  </v-card>
                </div>
              </v-col>

              <!-- Right Column - Action Cards -->
              <v-col cols="12" lg="4" class="pa-4">
                <v-card class="actions-section" elevation="2" rounded="lg">
                  <div class="actions-header pa-4">
                    <h3
                      class="text-h6 font-weight-bold grey--text text--darken-2 mb-1"
                    >
                      Quick Actions
                    </h3>
                    <p class="text-body-2 grey--text mb-0">
                      Manage attendance and presence data
                    </p>
                  </div>

                  <div class="actions-list pa-4">
                    <v-card
                      v-for="(action, index) in rightCards"
                      :key="index"
                      class="action-card mb-3"
                      elevation="1"
                      rounded="lg"
                      @click="handleRightCardClick(action.route)"
                    >
                      <div class="action-content">
                        <div class="action-icon">
                          <v-icon size="24" :color="action.color">{{
                            action.icon
                          }}</v-icon>
                        </div>
                        <div class="action-info">
                          <h4 class="action-title">{{ action.label }}</h4>
                          <p class="action-subtitle">{{ action.subtitle }}</p>
                        </div>
                        <div class="action-arrow">
                          <v-icon color="grey lighten-1"
                            >mdi-chevron-right</v-icon
                          >
                        </div>
                      </div>
                    </v-card>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>

        <!-- Loading Overlay -->
        <v-overlay :value="tableLoading" absolute>
          <v-card class="loading-card pa-6" rounded="lg">
            <div class="text-center">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              />
              <div class="text-h6 font-weight-medium">
                Loading Presence Data...
              </div>
              <div class="text-body-2 grey--text mt-2">
                Please wait while we fetch the latest attendance information
              </div>
            </div>
          </v-card>
        </v-overlay>
      </div>
    </v-card>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import { prezence_daily_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  name: "PresenceDashboard",
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;
    const isoFormattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return {
      formattedDate,
      isoFormattedDate,
      adminAppExists: false,
      tableLoading: false,
      windowHeight: 0,
      resenceData: [],
      leftCards: [], // initially empty, will be filled from API
      rightCards: [
        {
          label: "Configuration",
          icon: "mdi-cog-box",
          subtitle: "Configure attendance rules and presence settings.",
          route: "/home/Configuration",
          color: "#45B7D1",
        },
        {
          label: "Data Correction",
          icon: "mdi-pencil-box",
          subtitle: "Update and correct attendance records for accuracy.",
          route: "/home/DataCorrection",
          color: "#FF6B6B",
        },
             {
          label: "Proof of Work",
          icon:"mdi-shield-check",
          subtitle :"Track, verify, and manage all work activities efficiently",
          route :"/home/ProofofWork",
          color:"#F8C304"
        },
        {
          label: "Reports",
          icon: "mdi-chart-box",
          subtitle:
            "Comprehensive reports for attendance and presence analysis.",
          route: "/home/AllReport",
          color: "#4ECDC4",
        },
   
        
        // {
        //   label: "Visitor Logs",
        //   icon: "mdi-clipboard-list",
        //   subtitle: "View and manage visitor entry and exit logs.",
        //   route: "/home/VisitLogs",
        //   color: "#45B7D1",
        // },
        {
          label: "Visitor",
          icon: "mdi-account-plus",
          subtitle: "Register and manage visitor entries and permissions.",
          route: "/home/VisitorSub",
          color: "#45B7D1",
        },
      ],
      chartOptions: {
        chart: {
          type: "bar",
          toolbar: {
            show: false,
          },
          fontFamily: "Inter, sans-serif",
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "60%",
            endingShape: "rounded",
            borderRadius: 8,
            distributed: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ["transparent"],
        },
        xaxis: {
          categories: [], // Will be populated dynamically
          labels: {
            style: {
              colors: "#666",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          title: {
            text: "Number of Employees",
            style: {
              color: "#666",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            },
          },
          labels: {
            style: {
              colors: "#666",
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
            },
          },
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          fontSize: "14px",
          fontFamily: "Inter, sans-serif",
          markers: {
            radius: 12,
          },
          itemMargin: {
            horizontal: 10,
          },
        },
        colors: ["#4CAF50", "#F44336", "#2196F3"],
        grid: {
          borderColor: "#f1f1f1",
          strokeDashArray: 4,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " employees";
            },
          },
          theme: "dark",
          style: {
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          },
        },
        responsive: [
          {
            breakpoint: 768,
            options: {
              plotOptions: {
                bar: {
                  columnWidth: "80%",
                },
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
      chartSeries: [], // Will be populated dynamically
    };
  },

  created() {
    this.$store.commit("SetattendenceBack", false);
    this.windowHeight = window.innerHeight - 10;
    this.fetch_admin_apps();
    this.presence_reports();
  },

  methods: {
    back_call() {
      this.$router.push("/home/UserLevel");
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type == "PREZENCE"
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
        (app) => app.dashboard_unique_type === "PREZENCE_ADMINS"
      );

      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    getTotalPresent() {
      return (
        this.leftCards.find((card) => card.label === "Present")?.value || 0
      );
    },

    getTotalAbsent() {
      return this.leftCards.find((card) => card.label === "Absent")?.value || 0;
    },

    getTotalLeave() {
      return this.leftCards.find((card) => card.label === "Leave")?.value || 0;
    },

    getCardSubtitle(label) {
      const subtitles = {
        All: "Total employees tracked",
        Present: "Employees present today",
        Absent: "Employees absent today",
        Leave: "Employees on leave today",
      };
      return subtitles[label] || "";
    },

    handleCardClick(label) {
      const routeMap = {
        All: "/home/SwipeLogs",
        Present: "/home/PresentReport",
        Absent: "/home/AbsentReport",
        Leave: "/home/LeaveReport",
      };
      const route = routeMap[label];
      if (route) this.$router.push(route);
      else console.warn(`No route defined for label: ${label}`);
    },

    handleRightCardClick(route) {
      if (route) this.$router.push(route);
      else console.warn("No route defined for this card");
    },

    async presence_reports() {
      this.tableLoading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(prezence_daily_reports, {
            input: {
              swipe_date: this.isoFormattedDate,
              action_type: "ALL",
            },
          })
        );

        this.tableLoading = false;
        const response = JSON.parse(result.data.prezence_daily_reports);
        if (response.Status === "SUCCESS") {
          const data = response.graph_data;

          // Dynamic values for cards
          const total = data.total || { P: 0, A: 0, L: 0 };
          const present = total.P || 0;
          const absent = total.A || 0;
          const leave = total.L || 0;
          const all = present + absent + leave;

          this.resenceData = total;

          this.leftCards = [
            {
              label: "All",
              value: all,
              icon: "mdi-account-group",
              color: "#3F51B5",
            },
            {
              label: "Present",
              value: present,
              icon: "mdi-account-check",
              color: "#4CAF50",
            },
            {
              label: "Absent",
              value: absent,
              icon: "mdi-account-remove",
              color: "#F44336",
            },
            {
              label: "Leave",
              value: leave,
              icon: "mdi-account-clock",
              color: "#2196F3",
            },
          ];

          // Build chart
          const labels = [];
          const presentData = [];
          const absentData = [];
          const leaveData = [];

          for (const [key, value] of Object.entries(data)) {
            if (key === "total") continue;
            labels.push(value.name || key); // Use value.name for custom labels
            presentData.push(value.P || 0);
            absentData.push(value.A || 0);
            leaveData.push(value.L || 0);
          }

          // Update chartOptions and chartSeries
          this.chartOptions = {
            ...this.chartOptions,
            xaxis: {
              ...this.chartOptions.xaxis,
              categories: labels, // Set dynamic labels
            },
          };

          this.chartSeries = [
            { name: "Present", data: presentData },
            { name: "Absent", data: absentData },
            { name: "Leave", data: leaveData },
          ];
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors?.[0]?.message || "Something went wrong",
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style scoped>
.presence-dashboard-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 16px;
}

.header-section {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-section:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.content-section {
  background: transparent !important;
  margin-top: -2px;
  margin-left: -5px;
    margin-right: -5px;

}

.chart-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.chart-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.present {
  background: #4caf50;
}

.legend-color.absent {
  background: #f44336;
}

.legend-color.leave {
  background: #2196f3;
}

.legend-text {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.chart-container {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0 0 16px 16px;
}

.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s;
}

.stats-card:hover::before {
  left: 100%;
}

.stats-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stats-card-all {
  border-left: 4px solid #3f51b5;
}

.stats-card-present {
  border-left: 4px solid #4caf50;
}

.stats-card-absent {
  border-left: 4px solid #f44336;
}

.stats-card-leave {
  border-left: 4px solid #2196f3;
}

.card-content {
  display: flex;
  align-items: center;
  padding: 24px;
  position: relative;
}

.card-icon {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stats-card:hover .card-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #37474f;
}

.card-count {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.count-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1976d2;
  margin-right: 8px;
}

.count-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #888;
  font-weight: 400;
}

.card-action {
  opacity: 0;
  transition: all 0.3s ease;
}

.stats-card:hover .card-action {
  opacity: 1;
  transform: translateX(4px);
}

.actions-section {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.actions-section:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.actions-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.action-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.6s;
}

.action-card:hover::before {
  left: 100%;
}

.action-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-content {
  display: flex;
  align-items: center;
  padding: 20px;
  position: relative;
}

.action-icon {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.action-card:hover .action-icon {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.action-info {
  flex: 1;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #37474f;
}

.action-subtitle {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.action-arrow {
  opacity: 0;
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.loading-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .presence-dashboard-container {
    padding: 8px;
  }

  .header-section .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .header-section .d-flex > div {
    margin-bottom: 16px;
    width: 100%;
  }

  .stats-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-content {
    padding: 20px;
  }

  .card-icon {
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }

  .count-number {
    font-size: 1.5rem;
  }

  .chart-legend {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .chart-container {
    padding: 16px;
  }

  .action-content {
    padding: 16px;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
}
</style>
