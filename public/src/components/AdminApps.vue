<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2">
        <!-- Top Controls: All in one row -->

        <!-- Data Table -->
        <v-card-text class="pa-4">
          <!-- <div v-if="billingType == 'FREE_TIER'">
            <v-card class="free-trial-card" elevation="2">
              <v-card-text class="text-center pa-8">
                <v-icon size="64" color="orange" class="mb-4">mdi-star</v-icon>
                <h2
                  class="text-h4 font-weight-bold mb-4"
                  style="color: #db4c77"
                >
                  You're on Free Trial
                </h2>
                <p
                  class="text-body-1 mb-6"
                  style="color: #666; max-width: 500px; margin: 0 auto"
                >
                  You currently have access to basic apps. To unlock all premium
                  features and additional apps, please upgrade your
                  subscription.
                </p>
                <v-btn
                  color="primary"
                  size="large"
                  class="upgrade-btn"
                  @click="upgradeSubscription"
                  elevation="2"
                >
                  <v-icon left>mdi-arrow-up-circle</v-icon>
                  Upgrade Now
                </v-btn>
              </v-card-text>
            </v-card>
          </div> -->
          <div >
            <v-data-table
              :headers="userHeaders"
              :items="sortedAndPaginatedItems"
              :loading="teamLoading"
              :items-per-page="itemsPerPage"
              :height="windowHeight"
              :page="currentPage"
              :server-items-length="filteredItems.length"
              hide-default-footer
              class="modern-data-table"
              density="comfortable"
              hover
              multi-sort
              @update:sort-by="handleSortChange"
            >
              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey lighten-1" class="mb-4"
                    >mdi-apps</v-icon
                  >
                  <div class="text-h6 grey--text mb-2">No Apps Found</div>
                  <div class="text-body-2 grey--text">
                    Try switching between User Apps and Admin Apps.
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
                  <div class="text-body-2 grey--text">Loading apps...</div>
                </div>
              </template>

              <!-- App Name -->
              <template v-slot:[`item.dashboard_name`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon class="mr-3" :color="getIconColor(item)" size="20">{{
                    item.icon
                  }}</v-icon> -->
                  <div>
                    <div class="font-weight-medium text-body-1">
                      {{ item.dashboard_name }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Description -->

              <template v-slot:[`item.dashboard_description`]="{ item }">
                <v-tooltip location="top">
                  <template #activator="{ props }">
                    <div class="d-flex align-center" v-bind="props">
                      <!-- <v-icon size="16" color="grey" class="mr-2"
                        >mdi-information-outline</v-icon
                      > -->
                      <span
                        class="caption text-truncate"
                        style="max-width: 300px"
                      >
                        {{
                          item.dashboard_description ||
                          "No description available"
                        }}
                      </span>
                    </div>
                  </template>
                  <div
                    v-if="item.dashboard_description"
                    style="max-width: 300px"
                  >
                    <div class="font-weight-medium mb-1">
                      {{ item.dashboard_name }}
                    </div>
                    <div>{{ item.dashboard_description }}</div>
                  </div>
                  <div v-else>
                    <div class="font-weight-medium">
                      {{ item.dashboard_name }}
                    </div>
                    <div class="text-caption">No description available</div>
                  </div>
                </v-tooltip>
              </template>

              <!-- Subscribe Counts / Admin Counts -->
              <template v-slot:[`item.subscribe_counts`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="blue" class="mr-2"
                    >mdi-account-group</v-icon
                  > -->
                  <span class="caption font-weight-medium">
                    <span>
                      <span v-if="item.app_access == 'USERS'">
                      {{
                        item.user_restricted_app == false?'All ( ' + item.subscribe_counts + ')' :
                        item.subscribe_counts == 0 && item.app_access == "USERS"
                          ? "All ( " + item.subscribe_counts + ")"
                          : item.subscribe_counts == undefined ||
                            item.subscribe_counts == null
                          ? "-"
                          : item.app_access == "USERS"
                          ? item.subscribe_counts
                          : "-"
                      }}
                      </span>

                      <span
                        v-if="
                          item.app_access == 'ADMINS' || item.admin_app == true
                        "
                      >
                       <span v-if=" item.subscribe_counts ">/</span> 
                        {{
                          item.app_admins_counts == 0 &&
                            item.app_access == "ADMINS"
                            ? "All ( " + item.app_admins_counts + ")"
                            : item.app_admins_counts == undefined ||
                              item.app_admins_counts == null
                            ? "-"
                            : item.app_access == "ADMINS" ||
                              item.app_access == "USERS"
                            ? item.app_admins_counts
                            : "-"
                        }}
                      </span>
                    </span>
                  </span>
                </div>
                <!-- <div
                  class="d-flex align-center"
                  v-if="item.admin_app == true || item.app_access == 'ADMINS'"
                >
                  <v-icon size="16" color="blue" class="mr-2"
                    >mdi-account-group</v-icon
                  >
                  <span class="caption font-weight-medium">
                    {{
                      item.app_admins_counts == 0
                        ? "All"
                        : item.app_admins_counts
                    }}
                  </span>
                </div> -->
              </template>

              <template v-slot:[`item.app_admins_counts`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon size="16" color="green" class="mr-2"
                    >mdi-account-cog</v-icon
                  >
                  <span class="caption font-weight-medium">
                    {{
                      item.app_admins_counts == undefined
                        ? 0
                        : item.app_admins_counts
                    }}
                  </span>
                </div>
              </template>

              <!-- Visibility Level -->
              <template v-slot:[`item.app_visible_level`]="{ item }">
                <v-chip
                  :color="getVisibilityColor(item.app_visible_level)"
                  :text-color="getVisibilityTextColor(item.app_visible_level)"
                  size="small"
                  class="font-weight-medium"
                  variant="flat"
                >
                  {{ getVisibilityText(item.app_visible_level) }}
                </v-chip>
              </template>

              <!-- Status -->
              <template v-slot:[`item.status`]="{ item }">
                <div class="status-text-container">
                  <!-- User App Status -->
                  <span
                    v-if="item.app_access == 'USERS'"
                    :class="[
                      'status-text',
                      'font-weight-medium',
                      item.is_visible ? 'status-enabled' : 'status-disabled',
                    ]"
                  >
                    {{ item.is_visible ? "Enabled" : "Disabled" }}
                  </span>

                  <!-- Admin App Status -->
                  <span
                    v-if="item.app_access == 'ADMINS'"
                    :class="[
                      'status-text',
                      'font-weight-medium',
                      item.admin_is_visible
                        ? 'status-enabled'
                        : 'status-disabled',
                    ]"
                  >
                    {{ item.admin_is_visible ? "Enabled" : "Disabled" }}
                  </span>
                </div>
              </template>

              <!-- Actions -->
              <template #[`item.actions`]="{ item }">
                <v-menu
                  v-if="
                    ![
                      'user_approvals_ADMINS',
                      'user_team_ADMINS',
                      'FORMS',
                      'TASKS',
                    ].includes(item.dashboard_unique_type)
                  "
                >
                  <template #activator="{ props }">
                    <span v-bind="props">
                      <v-icon>mdi-dots-vertical</v-icon>
                    </span>
                  </template>

                  <v-list>
                    <v-list-item
                      v-if="item.is_visible"
                      @click.stop="handleItemClick2(item, 'user')"
                    >
                      Disable for Organization
                    </v-list-item>

                    <v-divider v-if="item.app_access == 'USERS'" />

                    <v-list-item
                      v-if="!item.is_visible"
                      @click.stop="handleItemClick2(item, 'user')"
                    >
                      Enable for Organization
                    </v-list-item>

                    <!-- <v-divider
                      v-if="
                        item.app_access == 'ADMINS' || item.admin_app == true
                      "
                    />
                    <v-list-item
                      v-if="
                        item.admin_is_visible &&
                        (item.app_access == 'ADMINS' || item.admin_app == true)
                      "
                      @click.stop="handleItemClick2(item, 'admin')"
                    >
                      Disable for Admin Organization
                    </v-list-item>

                    <v-divider
                      v-if="
                        item.app_access == 'ADMINS' || item.admin_app == true
                      "
                    />

                    <v-list-item
                      v-if="
                        !item.admin_is_visible &&
                        (item.app_access == 'ADMINS' || item.admin_app == true)
                      "
                      @click.stop="handleItemClick2(item, 'admin')"
                    >
                      Enable for Admin Organization
                    </v-list-item> -->

                    <v-divider v-if="item.app_access == 'USERS'" />
                    <v-list-item
                      v-if="
                        (item.app_access == 'USERS' || item.admin_app == false) && item.user_restricted_app == true
                      "
                      @click.stop="add_user_admins(item)"
                    >
                      Add User 
                    </v-list-item>
                    <v-divider
                      v-if="
                        item.app_access == 'ADMINS' || item.admin_app == true
                      "
                    />
                    <v-list-item
                      v-if="
                        item.admin_app == true || item.app_access == 'ADMINS'
                      "
                      @click.stop="add_admins(item)"
                    >
                      Add Admin 
                    </v-list-item>
                  </v-list>
                </v-menu>

                <div v-else class="ml-4">-</div>
              </template>
            </v-data-table>
            <!-- Modern Table Footer -->
            <div class="table-footer">
              <div class="footer-info">
                {{
                  filteredItems.length === 0
                    ? "No Results"
                    : `Showing ${Math.min(
                        itemsPerPage,
                        filteredItems.length - (currentPage - 1) * itemsPerPage
                      )} of ${
                        filteredItems.length
                      } apps (Page ${currentPage} of ${pageCount})`
                }}
              </div>
              <div class="pagination-controls">
                <v-btn
                  :disabled="currentPage <= 1"
                  variant="text"
                  size="small"
                  class="pagination-btn"
                  @click="goToPage(currentPage - 1)"
                  style="color: #666 !important"
                >
                  Previous
                </v-btn>
                <div class="page-numbers">
                  <v-btn
                    v-for="page in visiblePages"
                    :key="page"
                    :variant="page === currentPage ? 'elevated' : 'text'"
                    size="small"
                    :class="
                      page === currentPage ? 'active-page' : 'inactive-page'
                    "
                    @click="goToPage(page)"
                    :style="
                      page === currentPage
                        ? 'background: #DB4C77 !important; color: white !important;'
                        : 'color: #666 !important;'
                    "
                  >
                    {{ page }}
                  </v-btn>
                </div>
                <v-btn
                  :disabled="currentPage >= pageCount"
                  variant="text"
                  size="small"
                  class="pagination-btn"
                  @click="goToPage(currentPage + 1)"
                  style="color: #666 !important"
                >
                  Next
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <div v-if="componentCheck == 3">
      <DashboardSortvisibility
        :SortVisibility="SortVisibility"
        :rowInfo="rowInfo"
        :access_type="access_type"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="SortVisibility = false"
      />
    </div>
    <div v-if="componentCheck == 4">
      <GroupLevelVisibility
        :groupVisbility="groupVisbility"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="groupVisbility = false"
      />
    </div>
    <div v-if="componentCheck == 1">
      <AppAdminslist
        :adminList="adminList"
        @clicked="refresh_data"
        :rowInfo="rowInfo"
      />
    </div>
    <div v-if="componentCheck == 5">
      <UserAdmins
        :userappAdmins="userappAdmins"
        @clicked="refresh_userlist"
        :rowInfo="rowInfo"
      />
    </div>

    <!-- Upgrade Dialog -->
    <UpgradeDialog
      v-model="showUpgradeDialog"
      @upgrade-success="handleUpgradeSuccess"
      @show-snackbar="handleSnackBar"
    />
  </div>
</template>
  
<script>
/* eslint-disable */

// Imports
import UserAdmins from "@/components/DialogsList/UserAdmins.vue";
import DashboardSortvisibility from "@/components/AdminDashboard/DashboardDialogs/DashboardSortvisibility.vue";
import GroupLevelVisibility from "@/components/AdminDashboard/DashboardDialogs/GroupLevelVisibility.vue";
import SnackBar from "@/components/SnackBar.vue";
import { list_dashboard_channels, list_all_apps } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import AppAdminslist from "./DialogsList/AppAdminslist.vue";
import UpgradeDialog from "./AdminApps/UpgradeDialog.vue";

export default {
  // Components
  components: {
    SnackBar,
    DashboardSortvisibility,
    AppAdminslist,
    GroupLevelVisibility,
    UserAdmins,
    UpgradeDialog,
  },

  // Data
  data() {
    return {
      // Component data
      SnackBarComponent: {},
      rowInfo: {},
      teamInfo: {},
      access_type: "",
      // Table properties
      teamData: [],
      teamLoading: false,
      isIconDisabled: false,
      fixed: true,
      windowHeight: 0,

      // Search and pagination
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: [{ key: "dashboard_name", order: "asc" }],
      totalItems: 0,
      pageCount: 1,

      // Dialog states
      adminList: false,
      userappAdmins: false,
      SortVisibility: false,
      groupVisbility: false,
      componentCheck: 0,

      // App toggle and data
      toggle_exclusive: "apps",
      billingType: "MICRO",
      withAdmin: [],
      withoutAdmin: [],

      // Upgrade dialog data
      showUpgradeDialog: false,

      // Table headers
      adminHeaders: [
        {
          title: "Name",
          value: "dashboard_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Description",
          value: "dashboard_description",
          sortable: true,
          align: "start",
        },
        {
          title: " Admins Access",
          value: "app_admins_counts",
          sortable: true,
          align: "center",
        },
        {
          title: "Visibility",
          value: "app_visible_level",
          sortable: true,
          align: "center",
        },
        { title: "Status", value: "status", sortable: true, align: "center" },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
      userHeaders: [
        {
          title: "Name",
          value: "dashboard_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Description",
          value: "dashboard_description",
          sortable: true,
          align: "start",
        },
        {
          title: "Users / Admins Access",
          value: "subscribe_counts",
          sortable: true,
          align: "start",
        },
        { title: "Status", value: "status", sortable: true, align: "center" },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
    };
  },

  // Lifecycle hooks
  mounted() {
    this.billingType =
      this.$store.getters.GetOrgDetails.organization
        .organization_billing_type == undefined
        ? "MICRO"
        : this.$store.getters.GetOrgDetails.organization
            .organization_billing_type;
    this.windowHeight = window.innerHeight - 260;
    // this.fetch_dashboard_details();
    this.fetch_all_apps();
  },

  // Watchers
  watch: {
    currentPage(newVal) {
      // When the page changes, scroll to top of table (optional)
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },

    searchQuery() {
      // Reset to first page when searching
      this.currentPage = 1;
    },
  },

  // Computed properties
  computed: {
    filteredItems() {
      return this.teamData.filter(
        (item) =>
          item.dashboard_name
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          (item.dashboard_description &&
            item.dashboard_description
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()))
      );
    },

    sortedAndPaginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
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

  // Methods
  methods: {
    async fetch_all_apps() {
      try {
        this.teamLoading = true;
        let result = await API.graphql(graphqlOperation(list_all_apps, {}));
        let response = result.data.list_all_apps;
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.teamData = response.data;
          this.totalItems = this.teamData.length;
          this.pageCount = Math.ceil(this.totalItems / this.itemsPerPage);
        } else {
          this.teamData = [];
        }
        this.teamLoading = false;
      } catch (error) {
        console.log(error);
        this.teamLoading = false;
        this.teamData = [];
      }
    },
    // Navigation methods
    handleItemClick(item) {
      if (item.dashboard_unique_type == "TASKS") {
        this.$router.push("/MyTask");
      } else if (item.dashboard_unique_type == "EVENTS") {
        this.$router.push("/EventPlanner");
      } else if (item.dashboard_unique_type == "COLLATERALS") {
        this.$router.push("/Cabinet");
      } else if (item.dashboard_unique_type == "CHATGPT") {
        this.$router.push("/AdminChatgpt");
      } else if (item.dashboard_unique_type == "PREZENCE") {
        this.$router.push("/prezenceadmin");
      } else if (item.dashboard_unique_type == "VEDIO_CONFERENCE") {
        this.$router.push("/AdminZoom");
      } else if (item.dashboard_unique_type == "EXPENSE") {
        this.$router.push("/AdminExpensetype");
      } else if (item.dashboard_unique_type == "FORMS") {
        this.$router.push({
          name: "AdminFormTemplate",
          params: {
            formMethod: "test",
          },
        });
      }
    },

    async handleClick(click, value) {
      if (
        this.toggle_exclusive == "restrictedApps" &&
        value.item.dashboard_unique_type != "user_approvals_ADMINS" &&
        value.item.dashboard_unique_type != "user_team_ADMINS"
      ) {
        this.componentCheck = 1;
        this.rowInfo = value.item;
        this.adminList = true;
      } else if (
        this.toggle_exclusive == "apps" &&
        value.item.dashboard_unique_type != "FORMS" &&
        value.item.dashboard_unique_type != "TASKS"
      ) {
        this.componentCheck = 5;
        this.rowInfo = value.item;
        this.userappAdmins = true;
      }
    },

    back_action() {
      this.$emit("backAction", 0);
    },

    // App toggle methods
    restricted_apps() {
      this.teamData = [];
      this.fetch_dashboard_details();
    },

    async refresh_data() {
      this.adminList = false;
      this.toggle_exclusive = "restrictedApps";
      await this.fetch_all_apps();
    },

    async refresh_userlist() {
      this.userappAdmins = false;
      this.toggle_exclusive = "apps";
      await this.fetch_all_apps();
    },

    // Dialog management methods
    handleItemClick2(item, value) {
      this.access_type = value;
      this.componentCheck = 3;
      this.rowInfo = item;
      this.SortVisibility = true;
    },

    disable_groups(item) {
      this.componentCheck = 4;
      this.rowInfo = item;
      this.groupVisbility = true;
    },

    add_admins(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.adminList = true;
    },
    add_user_admins(item) {
      this.componentCheck = 5;
      this.rowInfo = item;
      this.userappAdmins = true;
    },

    // Data fetching methods
    async fetch_dashboard_details() {
      this.teamLoading = true;
      var data = this.$store.getters.GetUserObj;

      this.teamInfo = {};

      try {
        let result = await API.graphql(
          graphqlOperation(list_dashboard_channels, {
            limit: 500,
            nextToken: null,
            organization_id: data.organization.organization_id,
            dashboard_status: "ACTIVE",
            topic_type: "APP",
            app_access: this.toggle_exclusive == "apps" ? "USERS" : "ADMINS",
          })
        );

        var response = [];
        response = result.data.list_dashboard_channels;

        let approvalObjadmins = {
          dashboard_name: "Workflow Administration",
          dashboard_description:
            "Simplify approvals. Manage requests, track progress, and make timely decisions effortlessly.",
          is_visible: true,
          dashboard_unique_type: "user_approvals_ADMINS",
          app_visible_level: "WEB_ONLY",
          app_access: "ADMINS",
          is_dashboard_admin: true,
        };

        let teamObjadmins = {
          dashboard_name: "Team",
          dashboard_description:
            "Effortlessly manage user lists. Organize, track, and customize information for efficient user management",
          is_visible: true,
          dashboard_unique_type: "user_team_ADMINS",
          app_visible_level: "WEB_ONLY",
          app_access: "ADMINS",
          is_dashboard_admin: true,
        };

        this.teamInfo = response;
        this.teamData = [];
        this.withAdmin = [];
        this.withoutAdmin = [];

        if (this.toggle_exclusive == "restrictedApps") {
          response.items.push(teamObjadmins, approvalObjadmins);
        }

        this.teamData = response.items.map((item) => ({
          ...item,
          icon: this.getIconForDashboard(item),
        }));

        this.$store.commit("SetadministrationCheck", true);

        this.teamLoading = false;
        this.totalItems = response.items.length;
        this.pageCount = Math.ceil(this.totalItems / this.itemsPerPage);
      } catch (error) {
        this.teamLoading = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    // Icon and styling methods
    getIconForDashboard(item) {
      if (item.dashboard_unique_type === "TASKS") {
        return "mdi-calendar-check";
      } else if (item.dashboard_unique_type === "PREZENCE") {
        return "mdi-calendar-multiple";
      } else if (item.dashboard_unique_type === "COLLATERALS") {
        return "mdi-folder-open";
      } else if (item.dashboard_unique_type === "EXPENSE") {
        return "mdi-cash-multiple";
      } else if (item.dashboard_unique_type === "CHATGPT") {
        return "mdi-robot";
      } else if (item.dashboard_unique_type === "EVENTS") {
        return "mdi-calendar-text-outline";
      } else if (item.dashboard_unique_type === "VEDIO_CONFERENCE") {
        return "mdi-camera-metering-center";
      } else if (item.dashboard_unique_type === "DISCUSSION_ROOM_ACCESS") {
        return "mdi-account-multiple";
      } else if (item.dashboard_unique_type === "FORMS") {
        return "mdi-file";
      } else if (item.dashboard_unique_type === "APPROVALS") {
        return "mdi-timelapse";
      } else if (item.dashboard_unique_type === "TEAMS") {
        return "mdi-account-multiple-outline";
      } else if (item.dashboard_unique_type === "TICKET_MANAGEMENT") {
        return "mdi-ticket";
      } else if (item.dashboard_unique_type === "DASHBOARD_MANAGEMENT") {
        return "mdi-view-dashboard";
      } else if (item.dashboard_unique_type === "PAYROLL") {
        return "mdi-cash";
      } else if (item.dashboard_unique_type === "SURVEILLANCE") {
        return "mdi-camera";
      } else if (item.dashboard_unique_type === "PAYROLL_ADMINS") {
        return "mdi-cash";
      } else if (item.dashboard_unique_type === "SURVEILLANCE_ADMINS") {
        return "mdi-camera";
      } else if (item.dashboard_unique_type == "DASHBOARD_MANAGEMENT_ADMINS") {
        return "mdi-view-dashboard";
      } else if (item.dashboard_unique_type == "EVENTS_ADMINS") {
        return "mdi-calendar-text-outline";
      } else if (item.dashboard_unique_type == "EXPENSE_ADMINS") {
        return "mdi-cash-multiple";
      } else if (item.dashboard_unique_type == "FORMS_ADMINS") {
        return "mdi-file-document";
      } else if (item.dashboard_unique_type == "TICKET_MANAGEMENT_ADMINS") {
        return "mdi-ticket";
      } else if (item.dashboard_unique_type === "user_team_ADMINS") {
        return "mdi-account-multiple-outline";
      } else if (item.dashboard_unique_type === "user_messages_ADMINS") {
        return "mdi-broadcast";
      } else if (item.dashboard_unique_type === "user_approvals_ADMINS") {
        return "mdi-timelapse";
      } else if (
        item.dashboard_unique_type === "TICKET_TECHNICIAN_MANAGEMENT_ADMINS"
      ) {
        return "mdi-human-male-board";
      } else if (item.dashboard_unique_type === "user_team") {
        return "mdi-account-multiple-outline";
      } else if (item.dashboard_unique_type === "user_approvals") {
        return "mdi-timelapse";
      } else if (item.dashboard_unique_type === "FARM") {
        return "mdi-land-fields";
      } else if (item.dashboard_unique_type === "BOOKING_SLOT") {
        return "mdi-book-arrow-up-outline";
      } else if (item.dashboard_unique_type === "TIMESHEET_USER") {
        return "mdi-clipboard-text-clock-outline";
      } else if (item.dashboard_unique_type === "BOOKING_SLOT_ADMINS") {
        return "mdi-book-outline";
      } else if (item.dashboard_unique_type === "PREZENCE_ADMINS") {
        return "mdi-chart-box";
      } else if (item.dashboard_unique_type === "FARM_ADMINS") {
        return "mdi-land-fields";
      } else if (item.dashboard_unique_type === "TIMESHEET_ADMINS") {
        return "mdi-clipboard-text-clock-outline";
      } else if (item.dashboard_unique_type === "ASSETS_ADMIN") {
        return "mdi-dip-switch";
      } else if (item.dashboard_unique_type === "ASSETS_USER") {
        return "mdi-dip-switch";
      } else if (item.dashboard_unique_type === "DIRECTORY_USER") {
        return "mdi-file-key";
      } else if (item.dashboard_unique_type === "TVBOARD_ADMIN") {
        return "mdi-television";
      } else if (item.dashboard_unique_type === "VISIT_USERS") {
        return "mdi-account-group";
      } else if (item.dashboard_unique_type === "VISIT_ADMIN") {
        return "mdi-account-group";
      } else if (item.dashboard_unique_type === "MATERIAL_USER") {
        return "mdi-file-table-box-multiple-outline";
      } else if (item.dashboard_unique_type === "MATERIAL_ADMIN") {
        return "mdi-file-table-box-multiple-outline";
      } else if (item.dashboard_unique_type === "AP_AR_USER") {
        return "mdi-cash-plus";
      } else if (item.dashboard_unique_type === "GUESTHOUSE_USER") {
        return "mdi-home-city";
      } else if (item.dashboard_unique_type === "PROJECT_USER") {
        return "mdi-dip-switch";
      } else if (item.dashboard_unique_type === "QABM_USERS") {
        return "mdi-comment-quote-outline";
      } else {
        return "mdi-account-badge";
      }
    },

    getIconColor(item) {
      const colorMap = {
        "mdi-calendar-check": "#DB4C77",
        "mdi-calendar-multiple": "orange",
        "mdi-file-document": "red",
        "mdi-account-badge": "orange",
        "mdi-cash-multiple": "green",
        "mdi-robot": "black",
        "mdi-calendar-text-outline": "brown",
        "mdi-camera-metering-center": "#10559A",
        "mdi-account-multiple": "blue",
        "mdi-file": "red",
      };
      const iconColor = colorMap[item.icon] || "black";

      return iconColor;
    },

    getVisibilityColor(level) {
      const colorMap = {
        WEB_PHONE_ONLY: "primary",
        PHONE_ONLY: "primary",
        WEB_ONLY: "primary",
      };
      return colorMap[level] || "primary";
    },

    getVisibilityTextColor(level) {
      const colorMap = {
        WEB_PHONE_ONLY: "primary",
        PHONE_ONLY: "primary",
        WEB_ONLY: "primary",
      };
      return colorMap[level] || "primary";
    },

    getVisibilityIcon(level) {
      const iconMap = {
        WEB_PHONE_ONLY: "mdi-web",
        PHONE_ONLY: "mdi-phone",
        WEB_ONLY: "mdi-web",
      };
      return iconMap[level] || "mdi-web";
    },

    getVisibilityText(level) {
      const textMap = {
        WEB_PHONE_ONLY: "App and Web",
        PHONE_ONLY: "App",
        WEB_ONLY: "Web",
      };
      return textMap[level] || "App";
    },

    // Sorting and pagination methods
    getSortValue(value, key) {
      if (key === "dashboard_name") {
        return value.toLowerCase();
      } else if (key === "dashboard_description") {
        return value ? value.toLowerCase() : "";
      } else if (key === "subscribe_counts") {
        return value;
      } else if (key === "app_admins_counts") {
        return value;
      } else if (key === "app_visible_level") {
        return value;
      } else if (key === "status") {
        return value;
      } else {
        return value;
      }
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },

    handleSearchChange(value) {
      this.searchQuery = value;
      this.currentPage = 1; // Reset to first page when searching
    },

    handleToggleChange(value) {
      this.toggle_exclusive = value;
      this.restricted_apps();
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pageCount) {
        this.currentPage = page;
      }
    },

    // Notification methods
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.SortVisibility = false;
      this.fetch_all_apps();
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

    upgradeSubscription() {
      this.showUpgradeDialog = true;
    },

    handleUpgradeSuccess(selectedApps) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: "Upgrade request submitted successfully!",
        timeout: 5000,
        Top: true,
      };

      this.fetch_all_apps(); // Refresh the main data
    },

    handleSnackBar(snackbarConfig) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: snackbarConfig.color,
        SnackbarText: snackbarConfig.text,
        timeout: 5000,
        Top: true,
      };
    },

    getIconColor(appName) {
      switch (appName) {
        case "Assets":
          return "blue";
        case "Attendance/Presence":
          return "green";
        case "Cabinet":
          return "red";
        case "Dashboard":
          return "purple";
        case "Directory":
          return "blue";
        case "Events":
          return "green";
        case "Expenses":
          return "red";
        case "Tickets":
          return "purple";
        case "Project":
          return "blue";
        case "Slot Booking":
          return "green";
        case "Timesheet":
          return "purple";
        default:
          return "brown darken-3";
      }
    },
  },
};
</script>
  
<style scoped>
.font-weight-medium {
  font-weight: 500;
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
  background: #db4c77 !important;
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

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}

.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

/* Free Trial Card Styles */
.free-trial-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 2px solid #e9ecef;
  border-radius: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.free-trial-card .v-card-text {
  background: transparent;
}

.upgrade-btn {
  background: #db4c77 !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 12px 32px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.upgrade-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(219, 76, 119, 0.3) !important;
  background: #c2185b !important;
}

/* Status Text Styling */
.status-text-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  min-width: 120px;
}

.status-text {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  text-align: center;
  min-width: 80px;
}

.status-enabled {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.status-disabled {
  background-color: #ffebee;
  color: #c62828;
}

/* Responsive design for status text */
@media (max-width: 768px) {
  .status-text-container {
    min-width: 100px;
  }

  .status-text {
    font-size: 10px;
    padding: 3px 10px;
    min-width: 70px;
  }
}
</style>