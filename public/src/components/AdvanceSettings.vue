<template>
  <div>
    <!-- Card Grid View -->
    <div v-if="!selectedComponent">
      <v-card flat class="pa-4 mt-n10 overflow-y-auto" :height="windowHeight">
        <v-card-text class="pa-0">
          <!-- Card Grid Layout -->
          <v-row>
            <v-col
              v-for="(item, index) in settingsCards"
              :key="index"
              cols="12"
              sm="6"
              md="4"
              class="mb-4"
            >
              <v-card
                class="settings-card"
                elevation="2"
                @click="openComponent(item)"
              >
                <v-card-text class="pa-4">
                  <!-- Header with Icon -->
                  <div class="d-flex align-start mb-3">
                    <!-- Icon Container -->
                    <div class="icon-container">
                      <v-icon class="icon-outline" size="24">{{
                        item.icon
                      }}</v-icon>
                    </div>
                  </div>

                  <!-- Title -->
                  <div class="mb-2">
                    <h3 class="card-title">{{ item.title }}</h3>
                  </div>

                  <!-- Description -->
                  <p class="card-description">{{ item.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Component View with Back Button -->
    <div v-else>
      <v-card flat class="mt-n10">
        <!-- Component Content -->
        <v-card-text class="pa-0">
          <component
            :is="selectedComponent.component"
            v-if="selectedComponent.component"
            @backAction="goBack"
          />
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>
<script>
/* eslint-disable */

// Imports
import CategoryItemsub from "@/components/SettingsComponents/CategoryItemsub.vue";
import MasterLocations from "@/components/SettingsComponents/MasterLocations.vue";
import MasterDepartments from "@/components/SettingsComponents/MasterDepartments.vue";
import MasterDesignations from "@/components/SettingsComponents/MasterDesignations.vue";
import HolidayList from "@/components/SettingsComponents/HolidayList.vue";
import TeamDetails from "@/components/SettingsComponents/TeamDetails.vue";
import APISettings from "@/components/SettingsComponents/APISettings.vue";
import AppThemeInfo from "@/components/SettingsComponents/AppThemeInfo.vue";
import AdminsList from "@/components/SettingsComponents/AdminsList.vue";
import MemberManagement from "@/components/SettingsComponents/MemberManagement.vue";
import MasterRoles from "@/components/SettingsComponents/MasterRoles.vue";
import MasterTerritories from "@/components/SettingsComponents/MasterTerritories.vue";
import ProductServices from "@/components/SettingsComponents/ProductServices.vue";
import AssetSuppliersList from "@/components/Asset/AdminApps/AssetSuppliersList.vue";
import MaterialList from "@/components/MaterialManagement/MaterialList.vue";
// import MaterialUnit from "@/components/MaterialManagement/MaterialUnit.vue";
import CustomersMasters from "@/components/SettingsComponents/CustomersMasters.vue";
import OrganizationEntity from "./SettingsComponents/OrganizationEntity.vue";
import ApprovalsList from "@/components/SettingsDialogs/ApprovalsList.vue";
import PrefixManagement from "@/components/SettingsComponents/PrefixManagement.vue";

export default {
  // Components
  components: {
    MasterLocations,
    MasterDepartments,
    MasterDesignations,
    AdminsList,
    TeamDetails,
    APISettings,
    HolidayList,
    AppThemeInfo,
    MemberManagement,
    MasterRoles,
    MasterTerritories,
    ProductServices,
    AssetSuppliersList,
    MaterialList,
    // MaterialUnit,
    CustomersMasters,
    CategoryItemsub,
    OrganizationEntity,
    ApprovalsList,
    PrefixManagement,
  },

  // Data
  data() {
    return {
      // UI properties
      windowHeight: 0,
      settingsTab: "organization",
      selectedComponent: null,

      // Settings cards configuration
      settingsCards: [
        {
          title: "Organization Details",
          description: "Manage company information, logo, and basic settings",
          icon: "mdi-domain",
          value: "organization",
          component: "TeamDetails",
        },
        {
          title: "Designations",
          description: "Define and manage employee roles and positions",
          icon: "mdi-badge-account",
          value: "designations",
          component: "MasterDesignations",
        },
        {
          title: "Groups",
          description: "Create and organize team groups and departments",
          icon: "mdi-account-group",
          value: "groups",
          component: "MasterDepartments",
        },
        {
          title: "Locations",
          description: "Manage office locations and branch information",
          icon: "mdi-map-marker",
          value: "locations",
          component: "MasterLocations",
        },
        // {
        //   title: "Product/Services",
        //   description: "Define your products and service offerings",
        //   icon: "mdi-cube-outline",
        //   value: "products",
        //   component: "CategoryItemsub"
        // },
        // {
        //   title: "Suppliers/Vendors",
        //   description: "Manage vendor relationships and supplier information",
        //   icon: "mdi-truck-delivery",
        //   value: "suppliers",
        //   component: "AssetSuppliersList"
        // },
        // {
        //   title: "Unit",
        //   description: "Configure measurement units and standards",
        //   icon: "mdi-scale-balance",
        //   value: "unit",
        //   component: "MaterialUnit"
        // },
        {
          title: "Prefix Management",
          description: "Manage prefixes for different document types",
          icon: "mdi-file-document-outline",
          value: "prefixes",
          component: "PrefixManagement",
        },
      ],
    };
  },

  // Lifecycle hooks
  mounted() {
    this.windowHeight = window.innerHeight - 150;

    // Check if vendor bulk back is enabled and open suppliers component
    if (this.$store.getters.Getvendorbulkback == true) {
      this.openComponent(
        this.settingsCards.find((card) => card.value === "suppliers")
      );
    }
  },

  // Methods
  methods: {
    // Component navigation methods
    openComponent(item) {
      this.selectedComponent = item;
    },

    goBack() {
      this.selectedComponent = null;
    },
  },
};
</script>

<style scoped>
/* Page Header */
.page-title {
  font-size: 32px !important;
  font-weight: 700 !important;
  color: #2c3e50 !important;
  margin: 0 !important;
}

.page-subtitle {
  font-size: 16px !important;
  color: #6c757d !important;
  margin: 0 !important;
  font-weight: 400 !important;
}

/* Card Grid Layout */
.settings-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  height: 100% !important;
  min-height: 180px !important;
  background: white !important;
  border: 1px solid transparent !important;
}

.settings-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  background: linear-gradient(
    135deg,
    #ffe5f0 0%,
    #e8f4fd 50%,
    #f0e8ff 100%
  ) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}

/* Icon Container */
.icon-container {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #db4c77 0%, #9c27b0 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.3) !important;
}

/* Icon Outline Style */
.icon-outline {
  color: rgba(255, 255, 255, 0.85) !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) !important;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.6),
    0 0 4px rgba(255, 255, 255, 0.4), 0 0 6px rgba(255, 255, 255, 0.2) !important;
  opacity: 0.95 !important;
}

/* Card Title */
.card-title {
  font-size: 18px !important;
  font-weight: 500 !important;
  color: #2c3e50 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

/* Card Description */
.card-description {
  font-size: 14px !important;
  color: #6c757d !important;
  line-height: 1.4 !important;
  margin: 0 !important;
  font-weight: 400 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

/* Component Header */
.v-card-title {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
  border-bottom: 1px solid #dee2e6 !important;
  font-weight: 600 !important;
  color: #2c3e50 !important;
}

.back-link {
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
}

.back-link:hover {
  background-color: rgba(156, 39, 176, 0.1) !important;
  transform: translateX(-2px) !important;
}

.back-link .v-icon {
  margin-right: 8px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-card {
    min-height: 160px !important;
  }

  .card-title {
    font-size: 16px !important;
  }

  .card-description {
    font-size: 13px !important;
  }

  .icon-container {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>
