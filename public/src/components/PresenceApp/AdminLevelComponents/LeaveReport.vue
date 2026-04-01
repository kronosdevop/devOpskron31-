<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <!-- Modern Header Section -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-calendar-remove</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Leave Reports</span>
          <span class="header-subtitle"
            >Review and manage leave reports ({{ totalCount }})</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Filter Button -->
        <v-btn
          :class="
            activeFiltersCount > 0
              ? 'action-btn filter-btn active'
              : 'action-btn filter-btn'
          "
          @click="openFilterDrawer()"
          style="margin-right: 16px"
        >
          <v-icon>mdi-filter-variant</v-icon>
          <span>Filter</span>
          <v-badge
            v-if="activeFiltersCount > 0"
            :content="activeFiltersCount"
            color="white"
            class="ml-2"
          />
        </v-btn>

        <v-btn
          color="primary"
          size="small"
          class="text-capitalize"
          @click="back_action()"
          prepend-icon="mdi-step-backward"
          style="background: #db4c77 !important; color: white !important"
        >
          Back
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Filter Navigation Drawer -->
    <v-navigation-drawer
      :model-value="showFilterDrawer"
      @update:model-value="showFilterDrawer = $event"
      location="right"
      temporary
      width="400"
      class="pa-0 filter-drawer"
      :style="{ top: '64px', height: 'calc(100vh - 64px)' }"
    >
      <v-card flat>
        <v-toolbar elevation="1" density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">Filter Options</div>
          </v-toolbar-title>
          <v-spacer />
          <v-btn
            variant="text"
            color="white"
            size="small"
            @click="clear_data()"
            class="mr-2"
          >
            <v-icon size="16">mdi-close-circle</v-icon>
            <span class="ml-1">Clear</span>
          </v-btn>
          <v-icon class="mr-2" @click="closeFilterDrawer()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="filterForm">
            <div class="filter-content">
              <!-- Leave Type Filter -->
              <div
                class="filter-group"
                v-if="
                  $store.getters.GetUserObj.organization.week_off_settings ==
                    true ||
                  $store.getters.GetUserObj.organization.comp_off == true
                "
              >
                <label class="filter-label">Leave Type</label>
                <v-select
                  v-model="leaveSub"
                  :items="
                    $store.getters.GetUserObj.organization.week_off_settings ==
                      true &&
                    $store.getters.GetUserObj.organization.comp_off == true
                      ? subleaveitemsall
                      : $store.getters.GetUserObj.organization
                          .week_off_settings == true
                      ? subleaveitemsweek
                      : subleaveitemscomp
                  "
                  variant="outlined"
                  density="compact"
                  class="filter-select"
                />
              </div>

              <!-- Date Filter -->
              <div class="filter-group">
                <label class="filter-label">Select Date</label>
                <v-text-field
                  v-model="computedDateDisplay"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="datePicker = true"
                  class="filter-select"
                />
                <v-dialog v-model="datePicker" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempDate"
                      class="primaryColor"
                      color="#DB4C77"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        variant="text"
                        color="#DB4C77"
                        @click="datePicker = false"
                        >Cancel</v-btn
                      >
                      <v-btn variant="text" color="#DB4C77" @click="saveDate"
                        >OK</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>

              <!-- Action Buttons -->
              <div class="filter-actions">
                <v-btn
                  :loading="goLoading"
                  class="apply-filter-btn"
                  @click="applyFilterFromDrawer()"
                  block
                  style="margin-bottom: 8px"
                >
                  <v-icon class="mr-2">mdi-filter</v-icon>
                  Apply Filters
                </v-btn>
                <v-btn
                  class="clear-filter-btn"
                  @click="clear_data()"
                  block
                  variant="outlined"
                >
                  <v-icon class="mr-2">mdi-close</v-icon>
                  Clear All
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <v-card flat class="overflow-y-auto mt-10">
      <div>
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="headers"
                :items="sortedAndPaginatedItems"
                :loading="tableLoading"
                :items-per-page="itemsPerPage"
                :page="currentPage"
                :server-items-length="totalCount"
                hide-default-footer
                class="modern-data-table"
                density="comfortable"
                hover
                :fixed-header="true"
                :height="windowHeight"
                multi-sort
                @update:sort-by="handleSortChange"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey lighten-1" class="mb-4"
                      >mdi-calendar-remove-outline</v-icon
                    >
                    <div class="text-h6 grey--text mb-2">
                      No Leave Reports Found
                    </div>
                    <div class="text-body-2 grey--text">
                      Try adjusting your search criteria or date range.
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
                    <div class="text-body-2 grey--text">
                      Loading leave reports...
                    </div>
                  </div>
                </template>

                <!-- Member Name Column -->
                <template v-slot:[`item.user_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-avatar size="24" color="primary" class="mr-3">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{ (item.user_name || "U").substring(0, 1).toUpperCase() }}
                </span>
              </v-avatar> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.user_name || "N/A" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Email ID Column -->
                <template v-slot:[`item.user_email_id`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3">mdi-email</v-icon> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.user_email_id || "N/A" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Leave Type Column -->
                <template v-slot:[`item.leave_type`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon
                      size="20"
                      :color="getLeaveTypeColor(item.leave_type)"
                      class="mr-3"
                    >
                      {{ getLeaveTypeIcon(item.leave_type) }}
                    </v-icon> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ getLeaveTypeDisplayName(item.leave_type) }}
                      </div>
                    </div>
                  </div>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalCount === 0
                      ? "No Results"
                      : `Showing ${sortedAndPaginatedItems.length} of ${totalCount} leave reports`
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
import moment from "moment";
import { get_current_details } from "@/mixins/GetCuurentUser.js";
import { daily_leave_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
  },
  mixins: [get_current_details],
  data() {
    return {
      SnackBarComponent: {},
      searchQuery: "",
      sortBy: [{ key: "user_name", order: "asc" }],
      goLoading: false,
      selectedDate: "",
      minmonth: "",
      leaveSub: "Leave",
      subleaveitemsall: ["Leave", "Comp Off", "Week Off"],
      subleaveitemscomp: ["Leave", "Comp Off"],
      subleaveitemsweek: ["Leave", "Week Off"],
      headers: [
        {
          title: "Member Name",
          value: "user_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Email ID",
          value: "user_email_id",
          sortable: true,
          align: "start",
        },
        {
          title: "Leave Type",
          value: "leave_type",
          sortable: true,
          align: "start",
        },
      ],
      height: 0,
      fixed: true,
      endmodal: false,
      tableData: [],
      tableLoading: false,
      computedDateFormatted: this.formatDate(new Date()),
      datePicker: false,
      tempDate: null,
      date: null,
      itemsPerPage: 10,
      currentPage: 1,
      pageCount: 0,
      startItem: 0,
      endItem: 0,
      totalCount: 0,
      next_token: null,
      windowHeight: 0,
      showFilterDrawer: false,
    };
  },
  async mounted() {
    this.windowHeight = window.innerHeight - 250;
    this.selectedDate = this.get_orgdate(
      this.$store.getters.GetUserObj.organization.organization_created_on
    );
    this.minmonth = moment(this.selectedDate, "MM/DD/YYYY").format(
      "YYYY-MM-DD"
    );
    this.tableLoading = true;
    await this.get_current_details();
    await this.absent_reportss();
  },
  async created() {},
  watch: {
    currentPage() {
      this.get_data();
    },
  },
  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter(
        (item) =>
          (item.user_name &&
            item.user_name.toLowerCase().includes(searchTerm)) ||
          (item.user_email_id &&
            item.user_email_id.toLowerCase().includes(searchTerm)) ||
          (item.leave_type &&
            item.leave_type.toLowerCase().includes(searchTerm))
      );
    },
    sortedAndPaginatedItems() {
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      return sortedItems;
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
    activeFiltersCount() {
      let count = 0;

      // Count date filter (if not default)
      if (
        this.computedDateFormatted &&
        this.computedDateFormatted !== this.formatDate(new Date())
      ) {
        count++;
      }

      // Count leave type filter (if not default)
      if (this.leaveSub && this.leaveSub !== "Leave") {
        count++;
      }

      return count;
    },
  },
  methods: {
    back_action() {
      this.$store.commit("SetattendenceBack", true);
      this.$router.push("/home/UserLevel");
    },
    displayFormatDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    saveDate() {
      this.date = this.tempDate;
      this.computedDateFormatted = this.tempDate
        ? this.formatDate(this.tempDate)
        : "";
      this.datePicker = false;
      this.tableData = [];
      const org = this.$store.getters.GetUserObj.organization;
      if (org.week_off_settings === false && org.comp_off === false) {
        this.get_data();
      }
    },
    get_orgdate(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    get_data() {
      this.next_token = null;
      this.tableData = [];
      this.goLoading = true;
      this.currentPage = 1;
      this.absent_reportss();
    },
    get_datanewfilter() {
      if (
        this.currentObject.week_off_settings == false &&
        this.currentObject.comp_off == false
      ) {
        this.next_token = null;
        this.tableData = [];
        this.currentPage = 1;
        this.absent_reportss();
      }
    },
    dateformating(CurrentDate) {
      if (!CurrentDate) return null;
      const [year, month, day] = CurrentDate.split("-");
      return `${day}/${month}/${year}`;
    },
    gettimecal() {
      this.endmodal = true;
    },
    async absent_reportss() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(daily_leave_reports, {
            input: {
              organization_id: data.organization.organization_id,
              swipe_date: this.computedDateFormatted,
              limit: this.itemsPerPage,
              nextToken: this.next_token,
              action_type:
                this.leaveSub == "Leave"
                  ? undefined
                  : this.leaveSub == "Comp Off"
                  ? "CUMPOFF"
                  : "WEEKOFF",
            },
          })
        );
        this.tableLoading = false;

        var response = result.data.daily_leave_reports;
        this.next_token = response.nextToken;
        this.goLoading = false;
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
          this.totalCount = response.totalCount || this.tableData.length;
          this.pageCount = Math.ceil(this.totalCount / this.itemsPerPage);
        } else {
          this.goLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;
        this.goLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    updatePageItems(newPage) {
      this.currentPage = newPage;
      this.absent_reportss();
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.updatePageItems(this.currentPage);
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "user_name" ||
        key === "user_email_id" ||
        key === "leave_type"
      ) {
        return value.toLowerCase();
      }
      return value;
    },
    getLeaveTypeColor(leaveType) {
      const colors = {
        LEAVE: "#FF9800",
        CUMPOFF: "#4CAF50",
        WEEKOFF: "#2196F3",
      };
      return colors[leaveType] || "#757575";
    },
    getLeaveTypeIcon(leaveType) {
      const icons = {
        LEAVE: "mdi-calendar-remove",
        CUMPOFF: "mdi-calendar-check",
        WEEKOFF: "mdi-calendar-weekend",
      };
      return icons[leaveType] || "mdi-calendar-question";
    },
    getLeaveTypeDisplayName(leaveType) {
      const names = {
        LEAVE: "Leave",
        CUMPOFF: "Comp Off",
        WEEKOFF: "Week Off",
      };
      return names[leaveType] || leaveType || "N/A";
    },
    openFilterDrawer() {
      this.showFilterDrawer = true;
    },
    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },
    clear_data() {
      this.leaveSub = "Leave";
      this.computedDateFormatted = this.formatDate(new Date());
      this.get_data();
    },
    applyFilterFromDrawer() {
      this.get_data();
      this.showFilterDrawer = false;
    },
  },
};
</script>
    
<style scoped>
.font-weight-medium {
  font-weight: 500;
}

.modern-header-section {
  background: white;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(219, 76, 119, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.header-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #db4c77;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.header-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: rgba(219, 76, 119, 0.1);
  color: #db4c77;
  font-weight: bold;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background-color: rgba(219, 76, 119, 0.2);
}

.action-btn.filter-btn.active {
  background-color: rgba(219, 76, 119, 0.2);
}

.filter-drawer {
  background-color: #f7f8fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.filter-drawer :deep(.v-navigation-drawer__content) {
  padding: 0;
}

.filter-drawer :deep(.v-card) {
  border-radius: 0;
}

.navBar {
  background: #db4c77;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.custom-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.filter-content {
  padding: 20px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.filter-select {
  width: 100%;
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  border-color: #db4c77;
  box-shadow: 0 0 0 2px #db4c77;
}

.filter-actions {
  margin-top: 20px;
}

.apply-filter-btn {
  background: #db4c77 !important;
  color: white !important;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.apply-filter-btn:hover {
  background: #c03965 !important;
}

.clear-filter-btn {
  border: 1px solid #db4c77;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #db4c77;
  transition: background-color 0.2s ease;
}

.clear-filter-btn:hover {
  background-color: #f7f8fa;
}

.card-container {
  padding: 0 24px 24px;
}

.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

.modern-data-table :deep(.v-data-table__thead th) {
  background-color: #f7f8fa;
  color: #333;
  font-weight: bold;
  font-size: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.modern-data-table :deep(.v-data-table__tbody td) {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
}

.modern-data-table :deep(.v-data-table__tbody tr:last-child td) {
  border-bottom: none;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f8fa;
  border-top: 1px solid #eee;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
}

.footer-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  font-size: 14px;
  color: #666;
  border: 1px solid #eee;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #db4c77;
  color: white;
}

.pagination-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
}

.page-numbers .v-btn {
  margin: 0 4px;
}

.page-numbers .v-btn--text {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  border: 1px solid #eee;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.page-numbers .v-btn--text:hover:not(:disabled) {
  background-color: #db4c77;
  color: white;
}

.page-numbers .v-btn--text.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.page-numbers .v-btn--text.inactive-page {
  color: #666 !important;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}
</style>