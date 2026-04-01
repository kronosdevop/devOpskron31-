<template>
  <div>
    <!-- Card Grid View -->
    <div v-if="!selectedComponent">
      <v-card flat class="pa-4  overflow-y-auto" :height="windowHeight">
        <v-card-text class="pa-0">
          <!-- Card Grid Layout -->
          <v-row>
            <v-col 
              v-for="(item, index) in requestCards" 
              :key="index"
              cols="12"
              sm="6"
              md="4"
              class="mb-4"
            >
              <v-card 
                class="request-card"
                elevation="2"
                @click="openComponent(item)"
              >
                <v-card-text class="pa-4">
                  <!-- Header with Icon -->
                  <div class="d-flex align-start mb-3">
                    <!-- Icon Container -->
                    <div class="icon-container">
                      <v-icon class="icon-outline" size="24">{{ item.icon }}</v-icon>
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
  </div>
</template>
<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";

import { list_all_requested_assets } from "@/graphql/queries.js";
import PendingToDispatch from "@/components/Asset/AdminApps/PendingToDispatch.vue";
import RejectedAssets from "@/components/Asset/AdminApps/RejectedAssets.vue";
import AssetsDisptached from "@/components/Asset/AdminApps/AssetsDisptached.vue";
import AcknowledgedAssets from "@/components/Asset/AdminApps/AcknowledgedAssets.vue";
import DeliveryFailedAssets from "@/components/Asset/AdminApps/DeliveryFailedAssets.vue";

import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    PendingToDispatch,
    RejectedAssets,
    AssetsDisptached,
    AcknowledgedAssets,
    DeliveryFailedAssets,
  },
  data() {
    return {
      SnackBarComponent: {},
      selectedComponent: null,
      windowHeight: 0,
      
      // Request cards configuration
      requestCards: [
        {
          title: "Pending Dispatch",
          description: "View and manage assets waiting to be dispatched",
          icon: "mdi-clock-outline",
          value: "pending",
          component: "PendingToDispatch"
        },
        {
          title: "Dispatched",
          description: "Track assets that have been dispatched",
          icon: "mdi-truck-delivery",
          value: "dispatched",
          component: "AssetsDisptached"
        },
        {
          title: "Delivery Successful",
          description: "Assets that have been successfully delivered",
          icon: "mdi-check-circle",
          value: "successful",
          component: "AcknowledgedAssets"
        },
        {
          title: "Request Rejected",
          description: "Asset requests that have been rejected",
          icon: "mdi-close-circle",
          value: "rejected",
          component: "RejectedAssets"
        },
        {
          title: "Delivery Failed",
          description: "Assets with failed delivery attempts",
          icon: "mdi-alert-circle",
          value: "failed",
          component: "DeliveryFailedAssets"
        }
      ],
      
      headers: [
        { text: "Requested  By", value: "user_id_text", sortable: false },
        { text: "Category", value: "category_id_text", sortable: false },
        { text: "Subcategory", value: "sub_category_id_text", sortable: false },
        { text: "Status", value: "asset_dispatch_status", sortable: false },
        { text: "Action", value: "Action", sortable: false },
      ],
      tableLoading: false,
      tableData: [],
      fixed: true,
      componentCheck: 0,
      rowData: {},
      dispatchWorkflow: false,
    };
  },
  
  mounted() {
    this.windowHeight = window.innerHeight - 150;
  },
  
  methods: {
    // Component navigation methods
    openComponent(item) {
      this.selectedComponent = item;
    },

    goBack() {
      this.selectedComponent = null;
    },
    
    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.dispatchWorkflow = false;
    },
    error_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    async fetch_requested_asset() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_requested_assets, {
            input: {},
          })
        );
        var response = JSON.parse(result.data.list_all_requested_assets);
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          response.data.forEach((element) => {
            const newItem = {
              ...element.workflow_payload, // Spread the existing properties
              responeObj: element,
              asset_dispatch_status: element.asset_dispatch_status, // Add your new key-value pair here
            };
            this.tableData.push(newItem);
          });
        } else {
          this.tableLoading = false;
          this.tableData = [];
        }
      } catch (error) {
        this.tableLoading = false;
        // console.log(error);
        this.tableData = [];
      }
    },

    disptach_workflow(item) {
      this.componentCheck = 1;
      this.rowData = item;
      this.dispatchWorkflow = true;
    },
  },
};
</script>
<style scoped>
/* Card Grid Layout */
.request-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  height: 100% !important;
  min-height: 180px !important;
  background: white !important;
  border: 1px solid transparent !important;
}

.request-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  background: linear-gradient(135deg, #FFE5F0 0%, #E8F4FD 50%, #F0E8FF 100%) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}

/* Icon Container */
.icon-container {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
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
  font-size: 18px !important;
  font-weight: 500 !important;
  color: #2c3e50 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Card Description */
.card-description {
  font-size: 14px !important;
  color: #6c757d !important;
  line-height: 1.4 !important;
  margin: 0 !important;
  font-weight: 400 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .request-card {
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