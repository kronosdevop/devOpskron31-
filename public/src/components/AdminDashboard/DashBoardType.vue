<template>
  <div>
    <v-card flat>
      <v-toolbar flat>
        <!-- <v-toolbar-title class="mr-8">Dashboard</v-toolbar-title> -->
        <v-btn-toggle
          class="ml-3"
          v-model="toggle_exclusive"
          color="grey"
          mandatory
        >
          <v-btn small class="black--text" text value="dashboard_view">
            Dashboard
          </v-btn>
          <v-btn small class="black--text" text value="dashboard_edit">
            About
          </v-btn>

          <v-btn
            small
            class="black--text"
            text
            value="dashbard_api"
            v-show="
              $store.getters.Getdashboarditems.dashboard_publish_type ==
              'DASHBOARD'
            "
          >
            Api
          </v-btn>
          <!-- v-show="rowInfo.dashboard_publish_type == 'DASHBOARD'" -->
        </v-btn-toggle>
        <v-spacer />
        <v-btn depressed @click="back_mutation()" dark class="cardCss"
          ><v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <div class="text-left" v-if="toggle_exclusive == 'dashboard_edit'">
        <EditDashboard />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'dashboard_view'">
        <DashboardView />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'dashbard_api'">
        <DashboardApi />
      </div>
    </v-card>
  </div>
</template>

<script>
import EditDashboard from "@/components/AdminDashboard/DashboardDialogs/EditDashboard.vue";
import DashboardApi from "@/components/AdminDashboard/DashboardDialogs/DashboardApi.vue";
import DashboardView from "@/components/AdminDashboard/DashboardDialogs/DashboardView.vue";
export default {
  components: {
    DashboardApi,
    EditDashboard,
    DashboardView,
  },
  data() {
    return {
      toggle_exclusive: "dashboard_view",
    };
  },
  created() {},
  methods: {
    back_mutation() {
      if (this.$store.getters.Getappitems.is_dashboard_admin == false) {
        this.$router.push("/Dashboarduser");
      } else {
        this.$router.push("/DashBoardTypeAdmin");
      }
    },
  },
};
</script>

<style>
</style>