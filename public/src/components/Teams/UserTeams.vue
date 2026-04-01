<template>
  <div>
    <v-card flat class="">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="headers"
                :items="searchReadyItems"
                :loading="tableLoading"
                :sort-by="['full_user_name']"
                :items-per-page="itemsPerPage"
                :page="currentPage"
                :server-items-length="totalItems"
                hide-default-footer
                class="modern-data-table"
                density="default"
                hover
                :fixed-header="true"
                :height="windowHeight"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4"
                      >mdi-account-group-outline</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">
                      No Team Members Found
                    </div>
                    <div class="text-body-2 text-grey">
                      Try adjusting your search criteria or filters.
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
                    <div class="text-body-2 text-grey">
                      Loading team members...
                    </div>
                  </div>
                </template>

                <!-- User (Avatar, Name, Role, Email) -->
                <template v-slot:[`item.user_profile_pic_url`]="{ item }">
                  <div class="user-profile-cell">
                    <div class="user-avatar">
                      <div
                        v-if="
                          item.user_profile_pic_url != undefined &&
                          item.user_profile_pic_url != 'N/A' &&
                          item.user_profile_pic_url != ''
                        "
                      >
                        <v-avatar size="40" class="user-avatar-img">
                          <v-img :src="item.user_profile_pic_url" />
                        </v-avatar>
                      </div>
                      <div v-else>
                        <v-avatar size="40" class="user-avatar-fallback">
                          <span class="avatar-text">
                            {{
                              (item.full_user_name || "U")
                                .substring(0, 1)
                                .toUpperCase()
                            }}
                          </span>
                        </v-avatar>
                      </div>
                    </div>
                    <div class="user-info">
                      <div class="user-name">
                        {{ item.full_user_name || "N/A" }}
                      </div>
                      <div class="user-id">
                        {{ item.user_email_id || "N/A" }}
                      </div>
                      <v-icon
                        v-if="
                          item.user_type == 'ADMIN' || item.user_type == 'OWNER'
                        "
                        size="16"
                        color="primary"
                        class="admin-icon"
                      >
                        mdi-account
                      </v-icon>
                    </div>
                  </div>
                </template>

                <!-- Member ID -->
                <template v-slot:[`item.member_id`]="{ item }">
                  <span class="custom-cell">{{ item.member_id || "N/A" }}</span>
                </template>

                <!-- Phone -->
                <template v-slot:[`item.user_contact_number`]="{ item }">
                  <div class="contact-cell">
                    <!-- <div class="contact-icon">
                      <v-icon size="16" color="grey">mdi-phone</v-icon>
                    </div> -->
                    <div class="contact-info">
                      <div class="contact-phone">
                        {{ item.user_contact_number || "N/A" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Location -->
                <template v-slot:[`item.location`]="{ item }">
                  <div class="location-cell">
                    <!-- <div class="location-icon">
                      <v-icon size="16" color="grey">mdi-map-marker</v-icon>
                    </div> -->
                    <div class="location-text">
                      {{ item.location == "N/A" ? "-" : item.location }}
                    </div>
                  </div>
                </template>

                <!-- Group -->
                <template v-slot:[`item.department`]="{ item }">
                  <div class="department-cell">
                    <!-- <div class="department-icon">
                      <v-icon size="16" color="grey">mdi-account-group</v-icon>
                    </div> -->
                    <div>
                      {{ item.department == "N/A" ? "-" : item.department }}
                    </div>
                  </div>
                </template>

                <!-- Reporting Manager -->
             <template v-slot:[`item.reporting_manager`]="{ item }">
  <span class="custom-cell">
    {{ getReportingManagerName(item.reporting_manager) }}
  </span>
</template>


                <!-- Actions -->
                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="mr-1"
                    @click="copyToClipboard_x_api_key(item.card_profile_url)"
                  >
                    <v-icon color="#1976D2">mdi-card-account-details</v-icon>
                  </v-btn>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} members`
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn
                    :disabled="currentPage === 1"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="currentPage = currentPage - 1"
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
                      @click="currentPage = page"
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
                    :disabled="currentPage === pageCount"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="currentPage = currentPage + 1"
                    style="color: #666 !important"
                  >
                    Next
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
// Imports
import SnackBar from "@/components/SnackBar.vue";
import LoadingNew from "@/components/LoadingNew.vue";
import { my_team_user_list } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  // Components
  components: {
    SnackBar,
    LoadingNew,
  },

  //Props
  props: { searchValue: String },

  // Data
  data() {
    return {
      // Array properties
      headers: [
        { title: "User", key: "user_profile_pic_url", sortable: false },
        { title: "Member ID", key: "member_id", sortable: false },
        { title: "Phone", key: "user_contact_number", sortable: false },
        { title: "Location", key: "location", sortable: false },
        { title: "Group", key: "department", sortable: false },
        {
          title: "Reporting Manager",
          key: "reporting_manager",
          sortable: false,
        },
        { title: "Actions", key: "actions", sortable: false },
      ],
      tableData: [],
      fullTableData: [],
      originalTableData: [],
      roles: [],
      statuses: [],

      // Object properties
      SnackBarComponent: {},

      // String properties
      search: "",

      // Boolean properties
      tableLoading: false,
      fixed: true,
      isReporteesFilterActive: false,
      adminAppExists: false,

      // Number properties

      componentCheck: 0,
      currentPage: 1,
      height: 0,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,

      // Null properties
      selectedRole: null,
      selectedStatus: null,
      next_token: null,
    };
  },

  // Lifecycle hooks
  async created() {
    this.isVisible = true;
    this.windowHeight = window.innerHeight - 240;
  },

  mounted() {
    this.fetch_admin_apps();
    this.get_my_team();
  },

  // Watchers
  watch: {
    currentPage(newVal) {
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    tableData: {
      handler(newVal) {
        const maxPage = Math.ceil(this.totalItems / this.itemsPerPage);
        if (this.currentPage > maxPage && maxPage > 0) {
          this.currentPage = 1;
        }
      },
      deep: true,
    },
  },

  // Computed properties
  computed: {
    filteredItems() {
  if (!this.searchValue) return this.tableData;

  const text = this.searchValue.toLowerCase();

  return this.tableData.filter((item) => {
    return (
      item.full_user_name?.toLowerCase().includes(text) ||
      item.user_email_id?.toLowerCase().includes(text) ||
      item.member_id?.toLowerCase().includes(text) ||
      item.location?.toLowerCase().includes(text) ||
      item.department?.toLowerCase().includes(text) ||
      item.reporting_manager?.toLowerCase().includes(text)
    );
  });
},
   searchReadyItems() {
  if (!this.searchValue) {
    return this.sortedAndPaginatedItems;
  }

  const text = this.searchValue.toLowerCase();

  // ✅ STEP 1: FILTER FULL DATA
  const filtered = this.tableData.filter((item) => {
    return (
      item.full_user_name?.toLowerCase().includes(text) ||
      item.user_email_id?.toLowerCase().includes(text) ||
      item.member_id?.toLowerCase().includes(text) ||
      item.location?.toLowerCase().includes(text) ||
      item.department?.toLowerCase().includes(text) ||
      item.reporting_manager?.toLowerCase().includes(text)
    );
  });

  // ✅ STEP 2: RESET PAGE
  this.currentPage = 1;

  // ✅ STEP 3: APPLY PAGINATION AFTER FILTER
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;

  return filtered.slice(start, end);
},
    sortedAndPaginatedItems() {
      const sortedItems = this.tableData.slice().sort((a, b) => {
        const aValue = a.full_user_name ? a.full_user_name : "";
        const bValue = b.full_user_name ? b.full_user_name : "";
        return aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
      });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  // Methods
  methods: {
    getReportingManagerName(email) {
 if(!email || email === "N/A") return "_";
 const manager = this.originalTableData.find((u) => u.user_email_id === email);
 return manager?.full_user_name || email;
}
,
    // Admin methods
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;
      if (
        userObj.user.user_type == "ADMIN" ||
        userObj.user.user_type == "OWNER"
      ) {
        this.adminAppExists = true;
      }
    },

    open_settings() {
      this.$router.push("/home/AdminTeam");
    },

    // Data fetching methods
    async get_my_team() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(my_team_user_list, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              limit: 1000,
              name_search: "",
              nextToken: null,
            },
          }),
        );

        var dataArray = [];
        var response = JSON.parse(result.data.my_team_user_list);

        if (response.Status == "SUCCESS") {
          dataArray = await this.fetch_S3_file(response.s3_team_url);

          if (dataArray && Array.isArray(dataArray)) {
            await this.filter_based_on_visibility(dataArray);
            const validItems = this.tableData.filter(
              (item) =>
                item &&
                item.full_user_name &&
                item.full_user_name.trim() !== "",
            );
            if (validItems.length !== this.tableData.length) {
              console.warn("Some items have missing or empty names!");
              this.tableData.forEach((item, index) => {
                if (!item.full_user_name || item.full_user_name.trim() === "") {
                  console.warn(
                    `Item at index ${index} has missing name:`,
                    item,
                  );
                }
              });
            }
            this.originalTableData = [...this.tableData];
          } else {
            console.warn("No valid data received from S3 file");
            this.tableData = [];
            this.totalItems = 0;
            this.originalTableData = [];
          }

          this.tableLoading = false;
        } else {
          this.tableLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;
        console.error("Error in get_my_team:", error);
        let errorMessage = "An error occurred while fetching team data";
        if (error && error.errors && error.errors.length > 0) {
          errorMessage = error.errors[0].message;
        } else if (error && error.message) {
          errorMessage = error.message;
        }

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: errorMessage,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async fetch_S3_file(value) {
      var responseData = null;
      let data = null;

      try {
        const response = await fetch(value);
        if (!response.ok) {
          throw new Error("Failed to fetch the file");
        }
        responseData = await response.text();
        data = JSON.parse(responseData);

        if (
          data &&
          data.message &&
          data.message.data &&
          Array.isArray(data.message.data)
        ) {
          return data.message.data;
        } else {
          console.warn("Invalid data structure received from S3 file");
          return [];
        }
      } catch (error) {
        console.error("Error fetching S3 file:", error);
        this.errorMessage = "Error fetching file: " + error.message;
        return [];
      }
    },

    // Filtering methods
    filter_based_on_visibility(response) {
      var resposnearray = [];
      var teamVisbility = this.$store.getters.GetOrgDetails;
      let currentUser = this.$store.getters.GetUserObj.user;

      if (!response || !Array.isArray(response)) {
        console.warn("Invalid response data received");
        this.tableData = [];
        this.totalItems = 0;
        return;
      }

      if (!teamVisbility || !teamVisbility.organization) {
        console.warn("Organization details not available, showing all users");
        resposnearray = response;
        const sorted = resposnearray.sort((a, b) =>
          a.full_user_name.localeCompare(b.full_user_name, undefined, {
            sensitivity: "base",
          }),
        );
        this.totalItems = resposnearray.length;
        return (this.tableData = sorted);
      }

      let currentEmail = this.$store.getters.GetUserObj.user.user_email_id;
      let currentLocation = this.$store.getters.GetUserObj.user.location;
      let currentDepartment = this.$store.getters.GetUserObj.user.department;

      if (teamVisbility.organization.team_visibilty == "ALL_USERS") {
        resposnearray = response;
      } else if (
        teamVisbility.organization.team_visibilty == "USER_REPORTES_ONLY"
      ) {
        resposnearray = response.filter(
          (user) =>
            user.reporting_manager !== "N/A" &&
            user.reporting_manager.includes(currentEmail),
        );
      } else if (
        teamVisbility.organization.team_visibilty ==
        "USER_REPORTIES_AND_REPORTING_MANAGER"
      ) {
        resposnearray = response.filter((user) => {
          let isReportee =
            user.reporting_manager &&
            user.reporting_manager !== "N/A" &&
            user.reporting_manager.includes(currentEmail);

          let isManager =
            user.user_email_id ===
              this.$store.getters.GetUserObj.user.reporting_manager &&
            this.$store.getters.GetUserObj.user.reporting_manager !== "N/A";

          return isReportee || isManager;
        });
      } else if (
        teamVisbility.organization.team_visibilty == "USER_COMMON_LOCATION"
      ) {
        resposnearray = response.filter(
          (user) =>
            user.location !== "N/A" && user.location.includes(currentLocation),
        );
      } else if (
        teamVisbility.organization.team_visibilty == "USER_COMMON_DEPARTMENT"
      ) {
        resposnearray = response.filter(
          (user) =>
            user.department !== "N/A" &&
            user.department.includes(currentDepartment),
        );
      } else if (
        teamVisbility.organization.team_visibilty ==
        "USER_REPORTEES_AND_REPORTING_HIERARCHY"
      ) {
        // alert(4);
        let emailSet = new Set();

        emailSet.add(currentEmail);

        response.forEach((user) => {
          if (
            user.reporting_manager &&
            user.reporting_manager !== "N/A" &&
            user.reporting_manager.includes(currentEmail)
          ) {
            emailSet.add(user.user_email_id);
          }
        });

        let currentRM = currentUser.reporting_manager_email;

        while (currentRM && currentRM !== "N/A") {
          emailSet.add(currentRM);
          let rmUser = response.find(
            (user) => user.user_email_id === currentRM,
          );
          if (
            !rmUser ||
            !rmUser.reporting_manager ||
            rmUser.reporting_manager === "N/A"
          ) {
            break;
          }
          currentRM = rmUser.reporting_manager;
        }

        resposnearray = response.filter((user) =>
          emailSet.has(user.user_email_id),
        );
      } else if (
        teamVisbility.organization.team_visibilty == "USER_REPORTEES_AND_PEERS"
      ) {
        let peerManager = currentUser.reporting_manager_email;
        let emailSet = new Set();

        emailSet.add(currentEmail);

        response.forEach((user) => {
          if (
            user.reporting_manager &&
            user.reporting_manager !== "N/A" &&
            user.reporting_manager.includes(currentEmail)
          ) {
            emailSet.add(user.user_email_id);
          }
        });

        response.forEach((user) => {
          if (
            peerManager &&
            peerManager !== "N/A" &&
            user.reporting_manager &&
            user.reporting_manager.includes(peerManager)
          ) {
            emailSet.add(user.user_email_id);
          }
        });

        resposnearray = response.filter((user) =>
          emailSet.has(user.user_email_id),
        );
      }

      const sorted = resposnearray.sort((a, b) =>
        a.full_user_name.localeCompare(b.full_user_name, undefined, {
          sensitivity: "base",
        }),
      );
      this.tableData = sorted;
      this.totalItems = this.tableData.length;
      return this.tableData;
    },

    filterByReportees() {
      this.isReporteesFilterActive = !this.isReporteesFilterActive;

      if (this.isReporteesFilterActive) {
        if (this.originalTableData.length === 0) {
          this.originalTableData = [...this.tableData];
        }

        const currentEmail = this.$store.getters.GetUserObj.user.user_email_id;
        this.tableData = this.originalTableData.filter(
          (user) =>
            user.reporting_manager !== "N/A" &&
            user.reporting_manager.includes(currentEmail),
        );
      } else {
        this.tableData = [...this.originalTableData];
      }

      this.totalItems = this.tableData.length;
      // Reset to first page when filtering
      this.currentPage = 1;
    },

    // Utility methods
    copyToClipboard_x_api_key(value) {
      const text = value;
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: "Copied Successfully",
        timeout: 5000,
        Top: true,
      };
      window.open(value, "_blank");
    },

    fetch_value(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();
      var dateValue =
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year;

      return dateValue;
    },

    // Navigation methods
    back_call() {
      this.$router.push("/UserlevelApp");
    },

    // UI interaction methods
    handle_row_click(value) {
      this.formInfo = value;
      this.componentCheck = 1;
      this.formDialog = true;
    },

    screen_refresh() {
      this.tableData = [];
      this.get_my_team();
    },

    get_myteam_Pagination() {
      if (this.next_token) {
        this.get_my_team();
      }
    },

    // Notification methods
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.formDialog = false;
    },

    // Reset and utility methods
    resetAll() {
      this.search = "";
      this.selectedRole = null;
      this.selectedStatus = null;
      this.isReporteesFilterActive = false;
      if (this.originalTableData.length > 0) {
        this.tableData = [...this.originalTableData];
        this.totalItems = this.tableData.length;
      } else {
        this.get_my_team();
      }
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
}

.card-container {
  position: relative;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-search {
  background: white !important;
  border-radius: 8px !important;
}

.header-search :deep(.v-field) {
  background: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.header-search :deep(.v-field__input) {
  color: #333 !important;
}

.header-search :deep(.v-field__input::placeholder) {
  color: #666 !important;
}

.header-search :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.3) !important;
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

.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.pagination-container {
  min-width: 160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-footer {
  margin: 0;
  padding: 0;
  display: inline-flex;
}

.pagination-footer :deep(.v-pagination__list) {
  background: transparent;
  justify-content: flex-end;
}

.pagination-footer :deep(.v-pagination__item) {
  border-radius: 50%;
  margin: 0 2px;
}

.pagination-footer :deep(.v-pagination__item--is-active) {
  background-color: var(--v-primary-base);
  color: white;
}

.custom-table {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.custom-th {
  background: #f8f9fb !important;
  font-weight: bold;
  font-size: 15px;
  color: #222;
  padding: 16px 12px !important;
  border-bottom: 1.5px solid #e0e0e0 !important;
  text-align: left;
}
.custom-th-text {
  font-weight: bold;
  letter-spacing: 0.01em;
}
.custom-cell {
  font-size: 14px;
  color: #222;
  font-weight: 500;
  padding: 12px 8px;
  text-align: left;
}
.user-info-stack {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.user-name {
  font-weight: bold;
  font-size: 15px;
  color: #222;
}
.user-role {
  font-size: 13px;
  color: #888;
  margin-top: 2px;
}
.user-email {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}
.custom-chip {
  border-radius: 8px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  padding: 0 12px !important;
  min-width: 70px;
  justify-content: center;
}
.v-data-table__tbody tr {
  border-bottom: 1.5px solid #f0f0f0 !important;
  background: #fff;
  height: 56px;
}
.v-data-table__tbody tr:last-child {
  border-bottom: none !important;
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

/* Responsive Design for Action Buttons */
@media (max-width: 768px) {
  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
}
</style>
