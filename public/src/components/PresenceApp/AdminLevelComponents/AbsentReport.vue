<template>
  <div>
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-off</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Absent Reports</span>
          <span class="header-subtitle">Review and manage absent reports</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Date Filter Button -->
        <v-btn
          :class="
            activeFiltersCount > 0
              ? 'action-btn filter-btn active'
              : 'action-btn filter-btn'
          "
          @click="openFilterDrawer()"
          style="margin-right: 16px"
        >
          <v-icon>mdi-calendar</v-icon>
          <span>Date</span>
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
                      :max="new Date().toISOString().substr(0, 10)"
                      color="#DB4C77"
                      class="primaryColor"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        text
                        color="primaryColor"
                        @click="datePicker = false"
                        >Cancel</v-btn
                      >
                      <v-btn text color="primaryColor" @click="saveDate"
                        >OK</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>

              <!-- Action Buttons -->
              <div class="filter-actions">
                <v-btn
                  :loading="tableLoading"
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
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="headers"
                :items="paginatedItems"
                :loading="tableLoading"
                :sort-by="['full_user_name']"
                :items-per-page="itemsPerPage"
                :page="currentPage"
                :server-items-length="totalItems"
                hide-default-footer
                class="modern-data-table"
                density="comfortable"
                hover
                :fixed-header="true"
                :height="windowHeight"
                @update:sort-by="handleSortChange"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4"
                      >mdi-account-off-outline</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">
                      No Absent Reports Found
                    </div>
                    <div class="text-body-2 text-grey">
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
                    <div class="text-body-2 text-grey">
                      Loading absent reports...
                    </div>
                  </div>
                </template>

                <!-- Member ID Column -->
                <template v-slot:[`item.member_id`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3">mdi-identifier</v-icon> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.member_id == undefined ? "-" : item.member_id }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Member Name Column -->
                <template v-slot:[`item.full_user_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-avatar size="24" color="primary" class="mr-3">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{
                    (item.full_user_name || "U").substring(0, 1).toUpperCase()
                  }}
                </span>
              </v-avatar> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.full_user_name || "N/A" }}
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
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalItems} absent reports`
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
import { daily_absent_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      SnackBarComponent: {},
      searchQuery: "",
      sortBy: [{ key: "full_user_name", order: "asc" }],
      selectedDate: "",
      minmonth: "",
      headers: [
        {
          title: "Member ID",
          value: "member_id",
          sortable: true,
          align: "start",
        },
        {
          title: "Member Name",
          value: "full_user_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Email ID",
          value: "user_email_id",
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
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,
      showFilterDrawer: false,
    };
  },
  created() {
    this.windowHeight = window.innerHeight - 250;
    this.selectedDate = this.get_orgdate(
      this.$store.getters.GetUserObj.organization.organization_created_on
    );
    this.minmonth = moment(this.selectedDate, "MM/DD/YYYY").format(
      "YYYY-MM-DD"
    );

    this.absent_reportss();
  },
  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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
    activeFiltersCount() {
      let count = 0;

      // Count date filter (if not default)
      if (
        this.computedDateFormatted &&
        this.computedDateFormatted !== this.formatDate(new Date())
      ) {
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
      this.absent_reportss();
    },
    gettimecal() {
      this.endmodal = true;
    },
    async absent_reportss() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(daily_absent_reports, {
            input: {
              organization_id: data.organization.organization_id,
              swipe_date: this.computedDateFormatted,
              // limit: 100,
              // nextToken: this.next_token,
            },
          })
        );
        this.tableLoading = false;
        // console.log(response);
        var response = result.data.daily_absent_reports;
        this.next_token = response.nextToken;

        if (response.Status == "SUCCESS") {
          let array = this.tableData.concat(response.data);
          this.tableData = array;
          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.user_id === obj.user_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.totalItems = this.tableData.length;
        } else {
          // this.SnackBarComponent = {
          //   SnackbarVmodel: true,
          //   SnackbarColor: "red",
          //   SnackbarText: response.Message,
          //   timeout: 5000,
          //   Top: true,
          // };
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "member_id" ||
        key === "full_user_name" ||
        key === "user_email_id"
      ) {
        return value.toLowerCase();
      }
      return value;
    },
    openFilterDrawer() {
      this.showFilterDrawer = true;
    },
    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },
    clear_data() {
      this.computedDateFormatted = this.formatDate(new Date());
      this.tempDate = null;
      this.currentPage = 1;
      this.totalItems = 0;
      this.absent_reportss();
    },
    applyFilterFromDrawer() {
      this.currentPage = 1;
      this.totalItems = 0;
      this.absent_reportss();
      this.showFilterDrawer = false;
    },
  },
};
</script>
  
<style scoped>
.font-weight-medium {
  font-weight: 500;
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

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
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

/* Modern Header Section */
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

/* Filter Drawer Styles */
.filter-drawer {
  background-color: #f7f8fa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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
</style>