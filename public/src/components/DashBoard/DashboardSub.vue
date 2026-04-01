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
            <v-icon color="white" size="24">mdi-view-dashboard</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Dashboard</span>
          <span class="header-subtitle"
            >Manage your dashboards and analytics</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Action Buttons -->
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-btn
          v-if="toggle_exclusive == 'dashboard_subcribed'"
          @click="add_dashboard()"
          class="action-btn mr-3"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create</span>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs v-model="toggle_exclusive" mandatory class="modern-tab-toggle">
          <!-- <v-tab value="my_dashboards" class="tab-btn">
            My Dashboards
          </v-tab> -->
          <v-tab value="dashboard_subcribed" class="tab-btn">
            Subscribed Dashboards
          </v-tab>
          <v-tab value="other_dashboard" class="tab-btn">
            Other Dashboards
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-card flat class="overflow-y-auto mt-2">
      <div class="text-left" v-if="toggle_exclusive === 'dashboard_subcribed'">
        <SubcribedDashboard :key="subcribedKey" />
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'other_dashboard'">
        <OtherDashboard />
      </div>
      <div class="text-left" v-if="toggle_exclusive === 'my_dashboards'">
        <MyDashboards :key="subcribedKey" />
      </div>
    </v-card>

    <div v-if="componentCheck == 1">
      <CreatDashboard
        :dashboardCreation="dashboardCreation"
        @clicked="dashboardCreation = false"
        v-on:updaterefesh="subcribedrefesh"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import CreatDashboard from "@/components/DashBoard/Popups/CreatDashboard.vue";
import OtherDashboard from "@/components/DashBoard/OtherDashboard.vue";
import SubcribedDashboard from "@/components/DashBoard/SubcribedDashboard.vue";
import MyDashboards from "@/components/DashBoard/MyDashboards.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

// import SubcribedDashboard from "@/components/DashBoard/SubcribedDashboard.vue";

export default {
  components: {
    SubcribedDashboard,
    OtherDashboard,
    CreatDashboard,
    SnackBar,
    MyDashboards,
    CreateExternalTicketDialog,
  },
  data: () => ({
    toggle_exclusive: "dashboard_subcribed",
    componentCheck: 0,
    dashboardCreation: false,
    subcribedKey: 0,
    SnackBarComponent: {},
    windowHeight: 0,

    // Screenshot Values
    DialogCreateExternalTicket: false,
    ScreenshotFile: null,
    orgDetails: {
      bucket_name: "stichh-medias",
      region: "us-east-1",
    },
  }),
  mounted() {
    this.capture_audit_logs();
    this.windowHeight = window.innerHeight - 200;
  },
  methods: {
    capture_audit_logs() {},
    add_dashboard() {
      this.componentCheck = 1;
      this.dashboardCreation = true;
    },
    subcribedrefesh() {
      this.subcribedKey += 1;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.dashboardCreation = false;
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

/* Action Button Styles */
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

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
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

  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
}
</style>
