<template>
  <div style="padding-bottom: 70px">
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2" >
        <!-- Top Controls: All in one row -->
        <!-- <v-row
          class="align-center px-6 pt-6 pb-2"
          
        >
          <v-col cols="auto" class="d-flex align-center">
            <v-icon class="mr-3" color="primary" size="large">mdi-view-dashboard</v-icon>
            <span class="font-weight-bold text-h6">Other Dashboards ({{ totalCount }})</span>
          </v-col>
          <v-spacer /> -->

          <!-- Search Field -->
          <!-- <v-col cols="auto" class="d-flex align-center">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search dashboards..."
              prepend-inner-icon="mdi-magnify"
              variant="solo"
              hide-details
              density="compact"
              class="search-pill mr-4"
              style="
                min-width: 280px;
                max-width: 280px;
                height: 32px;
                border-radius: 999px;
                background: #fff;
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
                font-size: 14px;
              "
              clearable
              @click:clear="searchQuery = ''"
            ></v-text-field>
          </v-col>
        </v-row> -->

        <!-- Data Table -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="dashboardHeaders"
            :items="paginatedItems"
            :loading="dashboardLoading"
            :sort-by="['dashboard_name']"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="totalCount"
            hide-default-footer
            class="modern-data-table"
            density="comfortable"
            hover
            :fixed-header="true"
            :height="windowHeight"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-view-dashboard</v-icon>
                <div class="text-h6 text-grey mb-2">No Dashboards Found</div>
                <div class="text-body-2 text-grey">
                  Try adjusting your search criteria or check back later for new dashboards.
                </div>
              </div>
            </template>

            <template v-slot:loading>
              <div class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-4"
                ></v-progress-circular>
                <div class="text-body-2 text-grey">Loading dashboards...</div>
              </div>
            </template>

            <!-- Dashboard Name -->
            <template v-slot:[`item.dashboard_name`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="red" class="mr-2">mdi-lock-outline</v-icon> -->
                <span class="caption font-weight-medium">{{ item.dashboard_name }}</span>
              </div>
            </template>

            <!-- Description -->
            <template v-slot:[`item.dashboard_description`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2">mdi-text</v-icon> -->
                <span class="caption font-weight-medium">{{ item.dashboard_description || '-' }}</span>
              </div>
            </template>

            <!-- Subscribe Count -->
            <template v-slot:[`item.subscribe_counts`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2">mdi-account-group</v-icon> -->
                <span class="caption font-weight-medium">{{ item.subscribe_counts || 0 }}</span>
              </div>
            </template>

            <!-- Created By -->
            <template v-slot:[`item.dashboard_created_by`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2">mdi-account</v-icon> -->  
                <span class="caption font-weight-medium">{{ fetch_user_name(item.dashboard_created_by) }}</span>
              </div>
            </template>

            <!-- Actions -->
            <template v-slot:[`item.Actions`]="{ item }">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    dark
                    @click.stop="dashboardaccess(item)"
                    color="primary"
                    class="text-capitalize"
                    elevation="0"
                    size="small"
                    variant="flat"
                  >
                    Request Access
                  </v-btn>
                </template>
                <span>Request access to this dashboard</span>
              </v-tooltip>
            </template>
          </v-data-table>


              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalCount === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalCount} dashboards`
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn
                    :disabled="currentPage === 1"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="currentPage = currentPage - 1"
                    style="color: #666 !important;"
                  >
                    Previous
                  </v-btn>
                  <div class="page-numbers">
                    <v-btn
                      v-for="page in visiblePages"
                      :key="page"
                      :variant="page === currentPage ? 'elevated' : 'text'"
                      size="small"
                      :class="page === currentPage ? 'active-page' : 'inactive-page'"
                      @click="currentPage = page"
                      :style="page === currentPage ? 'background: #DB4C77 !important; color: white !important;' : 'color: #666 !important;'"
                    >
                      {{ page }}
                    </v-btn>
                  </div>
                  <v-btn
                    :disabled="currentPage === pageCount"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="currentPage = currentPage + 1"
                    style="color: #666 !important;"
                  >
                    Next
                  </v-btn>
                </div>
              </div>
        </v-card-text>
      </v-card>

    </div>

    <div v-if="componentCheck == 1">
      <RequestAccess
        v-on:errorMsg="error_info"
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
        :accessingdashboard="accessingdashboard"
        @clicked="accessingdashboard = false"
      />
    </div>
  </div>
</template>
  
<script>
import SnackBar from "@/components/SnackBar.vue";
import RequestAccess from "@/components/DashBoard/Popups/RequestAccess.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { list_all_dashboards } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  mixins: [get_all_org_users],
  components: {
    RequestAccess,
    SnackBar,
  },
  data() {
    return {
      nextToken: null,
      searchQuery: "",
      accessingdashboard: false,
      SnackBarComponent: {},
      componentCheck: 0,
      dashboardLoading: false,
      dashboardHeaders: [
        { title: "Name", key: "dashboard_name", sortable: false },
        {
          title: "Description",
          key: "dashboard_description",
          sortable: false,
        },
        {
          title: "Subscribe Count",
          key: "subscribe_counts",
          sortable: false,
        },
        {
          title: "Created By",
          key: "dashboard_created_by",
          sortable: false,
        },
        { title: "Actions", key: "Actions", sortable: false },
      ],
      dashboardData: [],
      allUSersNames: [],
      rowInfo: {},
      totalCount: 0,
      currentPage: 1,
      itemsPerPage: 20,
      hasMoreData: true,
      pageCount: 0,
      windowHeight: 0,
    };
  },
  async mounted() {
    this.windowHeight = window.innerHeight - 280;
    await Promise.all([
      this.fetch_dashboard_details(),
      this.get_all_org_users(),
    ]);

    this.allUSersNames = this.orgUsers;
  },
  methods: {
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      // Reset pagination state
      this.nextToken = null;
      this.dashboardData = [];
      this.currentPage = 1;
      this.hasMoreData = true;
      this.accessingdashboard = false;
      // Fetch fresh data
      this.fetch_dashboard_details();
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
    dashboardaccess(item) {
      this.componentCheck = 1;
      this.accessingdashboard = true;
      this.rowInfo = item;
    },
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    filterDashboardData(data, userId) {
      return data.filter((dashboard) => {
        // console.log(dashboard.dashboard_visibility);
        const { visible_type, visible_members } =
          dashboard.dashboard_visibility || {};
        if (visible_type === "ALL_MEMBERS") {
          return false;
        } else if (
          visible_type === "RESTRICTED_MEMBERS" &&
          visible_members && visible_members.includes(userId)
        ) {
          return false;
        }
        return true;
      });
    },
    async fetch_dashboard_details() {
      this.dashboardLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        // Reset data when fetching fresh
        if (!this.nextToken) {
          this.dashboardData = [];
        }

        let result = await API.graphql(
          graphqlOperation(list_all_dashboards, {
            input: {
              limit: 50,
              nextToken: this.nextToken,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
            },
          })
        );

        var response = JSON.parse(result.data.list_all_dashboards);
        if (response.Status == "SUCCESS") {
          this.nextToken = response.nextToken;
          
          // Concatenate new items with existing data
          let array = this.dashboardData.concat(response.data);
          this.dashboardData = array;
          
          // Remove duplicates
          const uniqueArrayOfObjects = this.dashboardData.filter(
            (obj, index, self) =>
              index ===
              self.findIndex((o) => o.dashboard_id === obj.dashboard_id)
          );

          this.dashboardData = uniqueArrayOfObjects;

          // Sort by sort_range
          this.dashboardData.sort((a, b) => b.sort_range - a.sort_range);
          
          // Filter dashboards based on visibility
          this.dashboardData = this.filterDashboardData(
            this.dashboardData,
            this.$store.getters.GetUserObj.user.user_id
          );

          // If there's more data, fetch it recursively
          if (this.nextToken && response.data.length > 0) {
            await this.fetch_dashboard_details();
          } else {
            this.dashboardLoading = false;
            this.hasMoreData = false;
          }
        } else {
          this.dashboardLoading = false;
        }
      } catch (error) {
      
        this.dashboardData = [];
        this.dashboardLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.dashboardData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.dashboardData.filter(dashboard => 
        dashboard.dashboard_name?.toLowerCase().includes(searchTerm) ||
        dashboard.dashboard_description?.toLowerCase().includes(searchTerm) ||
        this.fetch_user_name(dashboard.dashboard_created_by)?.toLowerCase().includes(searchTerm) ||
        (dashboard.subscribe_counts ? String(dashboard.subscribe_counts).toLowerCase().includes(searchTerm) : false)
      );
    },
    totalCount() {
      return this.filteredItems.length;
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
    },
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.pageCount, this.currentPage + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
};
</script>
  
<style scoped>
.card-container {
  position: relative;
}

/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.footer-info {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-width: 80px !important;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.active-page {
  background: #DB4C77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
}

.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
}

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}
</style>