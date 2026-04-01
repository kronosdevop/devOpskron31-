<template>
  <div>
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-group</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Visitors</span>
          <span class="header-subtitle">Manage visitors and view visitor logs</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <v-btn 
          color="primary" 
           
          class="text-capitalize" 
          @click="back_call()" 
          prepend-icon="mdi-step-backward"
          style="background: #DB4C77 !important; color: white !important;"
        >
          Back
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white;">
      <template v-slot:extension>
        <v-tabs
          v-model="adminToggle"
          mandatory
          class="modern-tab-toggle"
        >
          <v-tab value="visitor" class="tab-btn">
            Visitor
          </v-tab>
          <v-tab value="visitor-logs" class="tab-btn">
            Visitor Logs
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-card flat class="overflow-y-auto mt-10">
      <div v-if="adminToggle == 'visitor'">
        <VisitorsList />
      </div>
      <div v-if="adminToggle == 'visitor-logs'">
        <VisitLogs />
      </div>
    </v-card>
  </div>
</template>

<script>
import VisitorsList from './VisitorsList.vue';
import VisitLogs from './VisitLogs.vue';

export default {
  components: {
    VisitorsList,
    VisitLogs,
  },
  data() {
    return {
      adminToggle: "visitor",
    };
  },
  methods: {
    back_call() {
        this.$store.commit('SetattendenceBack',true)
        this.$router.push("/home/UserLevel");
    },
  },
};
</script>

<style scoped>
/* Container */


/* Modern Header Section */


.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Action Button Styles */
.action-btn {
  background: #DB4C77 !important;
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
  color: #DB4C77 !important;
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