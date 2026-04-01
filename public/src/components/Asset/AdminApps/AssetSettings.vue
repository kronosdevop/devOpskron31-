<template>
  <div>
    <!-- Card Grid View -->
    <div v-if="!selectedComponent">
      <v-card flat class="pa-4 overflow-y-auto" :height="windowHeight">
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
                <v-card-text class="pa-3">
                  <!-- Header with Icon -->
                  <div class="d-flex align-start mb-2">
                    <!-- Icon Container -->
                    <div class="icon-container">
                      <v-icon class="icon-outline" size="20">{{ item.icon }}</v-icon>
                    </div>
                  </div>

                  <!-- Title -->
                  <div class="mb-1">
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
      <v-card flat class="">
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
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/* eslint-disable */
// import AssetTerritories from "@/components/Asset/AdminApps/AssetTerritories.vue"
import AssetCategorieslist from "@/components/Asset/AdminApps/AssetCategorieslist.vue";
import AssetSuppliersList from "@/components/Asset/AdminApps/AssetSuppliersList.vue";
import AssetRetirelist from "@/components/Asset/AdminApps/AssetRetirelist.vue";
import LocationSettings from "@/components/Asset/AdminApps/LocationSettings.vue";

import AssetDistributors from "@/components/Asset/AdminApps/AssetDistributors.vue";
import AssetRetailers from "@/components/Asset/AdminApps/AssetRetailers.vue";
import AssetBusinessTypes from "@/components/Asset/AdminApps/AssetBusinessTypes.vue";
// import AssetLocations from "@/components/Asset/AdminApps/AssetLocations.vue";
import ApprovalsAssset from "@/components/Asset/AdminApps/ApprovalsAssset.vue";
import AssetTags from "@/components/Asset/AdminApps/AssetTags.vue";
import AssetNewTags from "@/components/Asset/AdminApps/AssetNewTags.vue";
import SnackBar from "@/components/SnackBar.vue";

// import { EventBus } from "@/EventBus";

export default {
  components: {
    AssetCategorieslist,
    AssetSuppliersList,
    AssetRetirelist,
    LocationSettings,

    AssetDistributors,
    AssetRetailers,
    AssetBusinessTypes,
    // AssetLocations,
    ApprovalsAssset,
    AssetTags,
    AssetNewTags,
    SnackBar,
    // AssetTerritories
  },
  data() {
    return {
      selectedComponent: null,
      windowHeight: 0,
      visible: false,
      tagTab: false,
      SnackBarComponent: {},
      
      // Settings cards configuration
      settingsCards: [
        {
          title: "Categories/Subcategories",
          description: "Manage asset categories and subcategories",
          icon: "mdi-folder-multiple",
          value: "categories",
          component: "AssetCategorieslist"
        },
        {
          title: "Distributors/Agents",
          description: "Configure asset distributors and agents",
          icon: "mdi-account-group",
          value: "distributors",
          component: "AssetDistributors",
          // showCondition: "visible"
        },
        {
          title: "Retailers",
          description: "Manage asset retailers and vendors",
          icon: "mdi-store",
          value: "retailers",
          component: "AssetRetailers",
          // showCondition: "visible"
        },
        {
          title: "Business Types",
          description: "Manage business types for assets",
          icon: "mdi-briefcase",
          value: "businessTypes",
          component: "AssetBusinessTypes",
          // showCondition: "visible"
        },
        {
          title: "Approvals",
          description: "Configure asset approval workflows",
          icon: "mdi-check-decagram",
          value: "approvals",
          component: "ApprovalsAssset"
        },
        {
          title: "Retiral Reasons",
          description: "Define reasons for asset retirement",
          icon: "mdi-delete-sweep",
          value: "retiral",
          component: "AssetRetirelist"
        },
        {
          title: "Advance Settings",
          description: "Advanced asset configuration options",
          icon: "mdi-cog",
          value: "advance",
          component: "LocationSettings"
        }
      ]
    };
  },
  
  mounted() {
    this.windowHeight = window.innerHeight - 150;
    
    var data = this.$store.getters.GetOrgDetails;
    this.visible = data.organization.is_asset_location_configured;
    this.tagTab = data.organization.enable_asset_tags;

    // Filter cards based on conditions
    this.settingsCards = this.settingsCards.filter(card => {
      if (card.showCondition === "visible") {
        return this.visible;
      }
      if (card.showCondition === "tagTab") {
        return this.tagTab;
      }
      return true;
    });

    // Check for query parameter to open specific component
    if (this.$route.query.component === "distributors") {
      const distributorCard = this.settingsCards.find(card => card.value === "distributors");
      if (distributorCard) {
        this.selectedComponent = distributorCard;
      }
    }

    // EventBus.$on("locationsetting", (eventData) => {
    //   this.visible = eventData.location === "customLocation" ? true : false;
    //   this.tagTab = eventData.tagSetting === "yes" ? true : false;
    // });
  },
  
  methods: {
    // Component navigation methods
    openComponent(item) {
      this.selectedComponent = item;
    },

    goBack() {
      this.selectedComponent = null;
    }
  },
  
  // beforeUnmount() {
  //   EventBus.$off("locationsetting"); // Clean up the event listener
  // },
};
</script>
<style scoped>
/* Card Grid Layout */
.settings-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  height: 100% !important;
  min-height: 140px !important;
  background: white !important;
  border: 1px solid transparent !important;
}

.settings-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  background: linear-gradient(135deg, #FFE5F0 0%, #E8F4FD 50%, #F0E8FF 100%) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}

/* Icon Container */
.icon-container {
  width: 40px !important;
  height: 40px !important;
  border-radius: 10px !important;
  background: linear-gradient(135deg, #DB4C77 0%, #9C27B0 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.3) !important;
}

/* Icon Outline Style */
.icon-outline {
  color: rgba(255, 255, 255, 0.85) !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) !important;
  text-shadow: 
    0 0 2px rgba(255, 255, 255, 0.6),
    0 0 4px rgba(255, 255, 255, 0.4),
    0 0 6px rgba(255, 255, 255, 0.2) !important;
  opacity: 0.95 !important;
}

/* Card Title */
.card-title {
  font-size: 16px !important;
  font-weight: 500 !important;
  color: #2c3e50 !important;
  margin: 0 !important;
  line-height: 1.3 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Card Description */
.card-description {
  font-size: 13px !important;
  color: #6c757d !important;
  line-height: 1.3 !important;
  margin: 0 !important;
  font-weight: 400 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-card {
    min-height: 120px !important;
  }
  
  .card-title {
    font-size: 15px !important;
  }
  
  .card-description {
    font-size: 12px !important;
  }
  
  .icon-container {
    width: 36px !important;
    height: 36px !important;
  }
}
</style>