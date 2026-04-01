<template>
  <div>
    <!-- Modern App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-view-dashboard</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">{{
            dashboardDetails.dashboard_name
          }}</span>
          <span class="header-subtitle"
            >Dashboard management and configuration</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Add Members Button -->
        <v-btn
          v-show="
            visibleTabs[currentTab]?.name === 'Members' &&
            isUserDashboardCreator
          "
          class="action-btn add-btn"
          @click="add_members()"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Members</span>
        </v-btn>

        <!-- Back Button -->
        <v-btn class="action-btn back-btn" @click="back_call()">
          <v-icon>mdi-step-backward</v-icon>
          <span>Back</span>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Modern Tabs Toolbar -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs
          v-model="currentTab"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
         
        >
          <v-tab
            v-for="(tab, index) in visibleTabs"
            :key="index"
            :value="index"
            class="tab-btn"
          >
            <i>{{ tab.name }}</i>
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <!-- Content Area -->
    <v-card flat class="overflow-y-auto mt-2" :height="windowHeight">
      <v-card-text>
        <component :is="currentComponent" :key="componentKey" />
      </v-card-text>
    </v-card>

    <div v-if="componentCheck === 1">
      <AddMember
        :memberaddition="memberaddition"
        @clicked="memberaddition = false"
        @updaterefesh="memberedrefesh"
        @errorMsg="error_info"
        @successMsg="success_info"
      />
    </div>

    <!-- SnackBar component -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
import PublishedMessage from "@/components/DashBoard/PublishedMessage.vue";
import DashboardInformation from "@/components/DashBoard/DashboardInformation.vue";
import DashboardApi from "@/components/DashBoard/DashboardApi.vue";
import AddMember from "@/components/DashBoard/Popups/AddMember.vue";
import SnackBar from "@/components/SnackBar.vue";
import DashBaordMemberslist from "@/components/DashBoard/DashBaordMemberslist.vue";
import DashboardTypeStructure from "@/components/DashBoard/Popups/DashboardTypeStructure.vue";

export default {
  components: {
    DashBaordMemberslist,
    SnackBar,
    AddMember,
    DashboardApi,
    DashboardInformation,
    DashboardTypeStructure,
    PublishedMessage,
  },
  data() {
    return {
      currentTab: 0,
      componentCheck: 0,
      memberaddition: false,
      SnackBarComponent: {},
      componentKey: 0,
      windowHeight: 0,
    };
  },
  computed: {
    dashboardDetails() {
      return this.$store.getters.GetdashboardDetails;
    },
    isUserDashboardCreator() {
      return (
        this.dashboardDetails.dashboard_created_by ===
        this.$store.getters.GetUserObj.user?.user_email_id
      );
    },
    visibleTabs() {
      return [
        {
          name: this.dashboardDetails.dashboard_name,
          component: "PublishedMessage",
          condition: true,
        },
        {
          name: "Properties",
          component: "DashboardInformation",
          condition: true,
        },
        {
          name: "Publish Message",
          component: "DashboardTypeStructure",
          condition:
            this.dashboardDetails.dashboard_publish_type !== "FEED" &&
            this.dashboardDetails.dashboard_created_by ===
              this.$store.getters.GetUserObj.user?.user_email_id,
        },
        { name: "API", component: "DashboardApi", condition: true },

        {
          name: "Members",
          component: "DashBaordMemberslist",
          condition:
            this.dashboardDetails.dashboard_visibility?.visible_type ===
            "RESTRICTED_MEMBERS",
        },
      ].filter((tab) => tab.condition);
    },
    currentComponent() {
      return this.visibleTabs[this.currentTab]?.component || "div";
    },
  },
  watch: {
    visibleTabs() {
      if (this.currentTab >= this.visibleTabs.length) {
        this.currentTab = 0; // Reset to default if out of range
      }
    },
  },
  created() {
    this.windowHeight = window.innerHeight - 120;
  },
  methods: {
    back_call() {
      this.$router.push("/home/Dashboard");
    },
    add_members() {
      this.componentCheck = 1;
      this.memberaddition = true;
    },
    memberedrefesh() {
      this.componentKey += 1;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.memberaddition = false;
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
/* Modern Header Section */

/* Header Actions */
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

.back-btn {
  background: #757575 !important;
}

.back-btn:hover {
  background: #616161 !important;
}

/* Main Container Styles */
div {
  background-color: white !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px !important;
    min-height: 32px !important;
    font-size: 12px !important;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: 12px;
  }

  .header-icon-bg {
    width: 32px;
    height: 32px;
  }

  .header-title {
    font-size: 16px;
  }

  .header-subtitle {
    font-size: 11px;
  }

  .action-btn {
    padding: 4px 8px !important;
    min-height: 28px !important;
    font-size: 11px !important;
  }

  .action-btn span {
    display: none;
  }
}
</style>

