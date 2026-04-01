<template>
  <div>
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-calendar-clock</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Slot Booking</span>
          <span class="header-subtitle">Manage resources and categories</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <v-btn
          v-if="toggle_exclusive == 'resources_slot'"
          class="action-btn add-btn"
          @click="resource_Creation()"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create</span>
        </v-btn>
        <v-btn
          v-if="toggle_exclusive == 'resources_categories'"
          class="action-btn add-btn"
          @click="add_category()"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add</span>
        </v-btn>
        <v-btn
          v-if="adminAppExists"
          class="action-btn back-btn"
          @click="back_call()"
        >
          <v-icon>mdi-arrow-left</v-icon>
          <span>Back</span>
        </v-btn>
      </div>
    </v-app-bar>
    
    <v-toolbar flat class="mt-n10" style="background-color: white;">
      <template v-slot:extension>
        <v-tabs
          v-model="toggle_exclusive"
          mandatory
          class="modern-tab-toggle"
        >
          <v-tab value="resources_slot" class="tab-btn">
            Resources
          </v-tab>
          <v-tab value="resources_categories" class="tab-btn">
            Categories
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'resources_slot'">
      <v-card
        flat
        :height="cardHeight"
        class="overflow-auto mt-10"
        :style="{ backgroundColor: 'white' }"
      >
        <ResourcesList :key="resourcestKey" />
      </v-card>
    </div>

    <div class="text-left" v-if="toggle_exclusive == 'resources_categories'">
      <v-card
        flat
       
        class="overflow-auto mt-10"
        :style="{ backgroundColor: 'white' }"
      >
        <SlotCategories :key="categoryKey" />
      </v-card>
    </div>

    <div v-if="componentCheck == 1">
      <CreateResources
        :resourceCreation="resourceCreation"
        @clicked="resourceCreation = false"
        v-on:errorMsg="error_info"
        v-on:SuccessMsg="success_info"
        v-on:resourcelist="userresource_refresh"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddCategories
        :categoriesAddition="categoriesAddition"
        @clicked="categoriesAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:updaterefesh="categoryRefresh"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
              
<script>
import AddCategories from "@/components/SloatBooking/Popups/AddCategories.vue";
import SnackBar from "@/components/SnackBar.vue";
import CreateResources from "@/components/SloatBooking/Popups/CreateResources.vue";
import ResourcesList from "@/components/SloatBooking/ResourcesList.vue";
import SlotCategories from "@/components/SloatBooking/SlotCategories.vue";
export default {
  components: {
    CreateResources,
    ResourcesList,
    SnackBar,
    SlotCategories,
    AddCategories,
  },
  data: () => ({
    toggle_exclusive: "resources_slot",
    resourceCreation: false,
    categoriesAddition: false,
    componentCheck: 0,
    categoryKey: 0,
    resourcestKey: 0,
    SnackBarComponent: {},
    cardHeight: 0,
    adminAppExists: false,
  }),

  mounted() {
    this.cardHeight = window.innerHeight - 140;
    this.fetch_admin_apps();
  },
  methods: {
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type == "BOOKING_SLOT"
      );
      // console.log(userapp, "userapp");
      if (userapp == undefined) {
        this.adminAppExists = false;
        return;
      }
      if(userapp.is_visible==false){
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
        (app) => app.dashboard_unique_type === "BOOKING_SLOT_ADMINS"
      );

      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    back_call() {
      this.$router.push("/home/UserResources");
    },
    add_category() {
      this.componentCheck = 2;
      this.categoriesAddition = true;
    },
    categoryRefresh() {
      this.categoryKey += 1;
    },
    resource_Creation() {
      this.componentCheck = 1;
      this.resourceCreation = true;
    },
    userresource_refresh() {
      this.resourcestKey += 1;
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

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.resourceCreation = false;
      this.categoriesAddition = false;
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

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Action Button Styles */
.action-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.add-btn {
  background: #DB4C77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
}

.add-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
}

.back-btn {
  background: #6c757d !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3) !important;
}

.back-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px;
  }
}
</style>