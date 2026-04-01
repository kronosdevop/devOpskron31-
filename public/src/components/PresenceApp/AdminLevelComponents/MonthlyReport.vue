<template>
  <div >
    <!--eslint-disable-->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat >
      <v-card-text class="pa-4">
        <v-data-table
          :headers="
            currentObject.week_off_settings == true &&
            currentObject.comp_off == true
              ? headersall
              : currentObject.week_off_settings == true
              ? headersweekoff
              : currentObject.comp_off == true
              ? headerscomoff
              : headersoff
          "
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :sort-by="['full_user_name']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
          :fixed-header="true"
          :height="windowHeight"
          @update:sort-by="handleSortChange"
          @click:row="handle_row_click"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-chart-line</v-icon
              >
              <div class="text-h6 text-grey mb-2">
                No Monthly Reports Found
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
                Loading monthly reports...
              </div>
            </div>
          </template>

          <!-- Member ID -->
          <template v-slot:[`item.member_id`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="primary" class="mr-2">mdi-identifier</v-icon> -->
              <span class="caption font-weight-medium">{{
                item.member_id == undefined ? "-" : item.member_id
              }}</span>
            </div>
          </template>

          <!-- Member Name -->
          <template v-slot:[`item.full_user_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="20" color="primary" class="mr-3">mdi-account</v-icon> -->
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.full_user_name }}
                </div>
              </div>
            </div>
          </template>

          <!-- Average Duration -->
          <template v-slot:[`item.average_monthly_worked_durations`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="blue" class="mr-2">mdi-clock-outline</v-icon> -->
              <span class="caption font-weight-medium">{{ item.average_monthly_worked_durations || '-' }}</span>
            </div>
          </template>

          <!-- Total Duration -->
          <template v-slot:[`item.total_monthly_worked_durations`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="green" class="mr-2">mdi-clock</v-icon> -->
              <span class="caption font-weight-medium">{{ item.total_monthly_worked_durations || '-' }}</span>
            </div>
          </template>

          <!-- Present Days -->
          <template v-slot:[`item.total_present_days`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="green" class="mr-2">mdi-check-circle</v-icon> -->
              <span class="caption font-weight-medium green--text">{{ item.total_present_days || '0' }}</span>
            </div>
          </template>

          <!-- Leave Days -->
          <template v-slot:[`item.total_leave_days`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="orange" class="mr-2">mdi-calendar-remove</v-icon> -->
              <span class="caption font-weight-medium orange--text">{{ item.total_leave_days || '0' }}</span>
            </div>
          </template>

          <!-- Absent Days -->
          <template v-slot:[`item.total_absent_days`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="red" class="mr-2">mdi-close-circle</v-icon> -->
              <span class="caption font-weight-medium red--text">{{ item.total_absent_days || '0' }}</span>
            </div>
          </template>

          <!-- Week Off -->
          <template v-slot:[`item.total_week_off`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="purple" class="mr-2">mdi-calendar-weekend</v-icon> -->
              <span class="caption font-weight-medium purple--text">{{ item.total_week_off || '0' }}</span>
            </div>
          </template>

          <!-- Comp Off -->
          <template v-slot:[`item.total_cum_off`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="indigo" class="mr-2">mdi-calendar-plus</v-icon> -->
              <span class="caption font-weight-medium indigo--text">{{ item.total_cum_off || '0' }}</span>
            </div>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.action`]="{ item }">
            <div class="d-flex align-center">
              <v-icon 
                size="small" 
                color="#DB4C77" 
                @click="view_item(item)"
                class="cursor-pointer"
                style="cursor: pointer;"
              >
                mdi-eye
              </v-icon>
            </div>
          </template>

          <!-- Graph -->
          <template v-slot:[`item.graph`]="{ item }">
            <v-progress-linear 
              color="amber" 
              :model-value="getProgressValue(item)" 
              height="25"
              class="rounded"
            >
              <template v-slot:default="{ value }">
                <strong>{{ Math.ceil(value) }}%</strong>
              </template>
            </v-progress-linear>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} monthly reports`
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
    <div v-if="componentCheck == 1">
      <CalenderView
        :rowInfo="rowInfo"
        :calendarPreview="calendarPreview"
        :selectedMmonth="selectedMmonth"
        @clicked="calendarPreview = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <MonthlyreportView
        :rowInfo="rowInfo"
        :reportDailog="reportDailog"
        @clicked="reportDailog = false"
      />
    </div>
  </div>
</template>
<script>
import moment from "moment";
import { get_current_details } from "@/mixins/GetCuurentUser.js";
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
// import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { monthly_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import CalenderView from "@/components/PresenceApp/PopUps/CalenderView.vue";
import MonthlyreportView from "@/components/PresenceApp/PopUps/MonthlyreportView.vue";
export default {
  props: {
    selectedYear: {
      type: Number,
      default: new Date().getFullYear()
    },
    selectedMonth: {
      type: String,
      default: ""
    },
    selectedUser: {
      type: String,
      default: "ALL"
    }
  },
  components: {
    SnackBar,
    CalenderView,
    MonthlyreportView,
  },
  // mixins: [get_all_org_users],
  mixins: [get_current_details],
  data() {
    return {
      search: "",
      searchQuery: "",
      sortBy: [{ key: "full_user_name", order: "asc" }],
      minmonth: "",
      selectedDate: "",
      SnackBarComponent: {},
      tableLoading: false,
      reportDailog: false,
      fixed: true,
      date: new Date().toISOString().substr(0, 7),
      menu: false,
      height: 0,
      windowHeight: 0,
      typeReportsitem: [
        { name: "Normalised", key: "name" },
        { name: "Present", key: "s" },
      ],
      reportlist: "",
      headersall: [
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
          title: "Average Duration",
          value: "average_monthly_worked_durations",
          sortable: true,
          align: "start",
        },
        {
          title: "Total Duration",
          value: "total_monthly_worked_durations",
          sortable: true,
          align: "start",
        },
        {
          title: "Present",
          value: "total_present_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Leave",
          value: "total_leave_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Absent",
          value: "total_absent_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Week Off",
          value: "total_week_off",
          sortable: true,
          align: "start",
        },
        {
          title: "Comp Off",
          value: "total_cum_off",
          sortable: true,
          align: "start",
        },
        {
          title: "Actions",
          value: "action",
          sortable: false,
          align: "center",
        },
      ],
      headersoff: [
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
          title: "Average Duration",
          value: "average_monthly_worked_durations",
          sortable: true,
          align: "start",
        },
        {
          title: "Total Duration",
          value: "total_monthly_worked_durations",
          sortable: true,
          align: "start",
        },
        {
          title: "Present",
          value: "total_present_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Leave",
          value: "total_leave_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Absent",
          value: "total_absent_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Actions",
          value: "action",
          sortable: false,
          align: "center",
        },
      ],
      headersweekoff: [
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
          title: "Average Duration",
          value: "average_monthly_worked_durations",
          sortable: true,
          align: "start",
        },
        {
          title: "Total Duration",
          value: "total_monthly_worked_durations",
          sortable: true,
          align: "start",
        },
        {
          title: "Present",
          value: "total_present_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Leave",
          value: "total_leave_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Absent",
          value: "total_absent_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Week Off",
          value: "total_week_off",
          sortable: true,
          align: "start",
        },
        {
          title: "Actions",
          value: "action",
          sortable: false,
          align: "center",
        },
      ],
      headerscomoff: [
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
          title: "Average Duration",
          value: "average_monthly_worked_durations",
          sortable: true,
          align: "start",
        },
        {
          title: "Total Duration",
          value: "total_monthly_worked_durations",
          sortable: true,
          align: "start",
        },
        {
          title: "Present",
          value: "total_present_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Leave",
          value: "total_leave_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Absent",
          value: "total_absent_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Comp Off",
          value: "total_cum_off",
          sortable: true,
          align: "start",
        },
        {
          title: "Actions",
          value: "action",
          sortable: false,
          align: "center",
        },
      ],
      tableData: [],
      componentCheck: 0,
      rowInfo: {},
      calendarPreview: false,
      next_token: null,
      selectedMmonth: "",
      goLoading: false,
      monthNames: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      formattedmonth: "",
      formattedyear: "",
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
    };
  },
  async mounted() {
    await this.get_current_details();
  },

  async created() {
    this.tableLoading = true;
    this.updateMonthValue();
    this.windowHeight = window.innerHeight - 290;
    this.selectedDate = this.get_orgdate(
      this.$store.getters.GetUserObj.organization.organization_created_on
    );

    this.minmonth = moment(this.selectedDate, "MM/DD/YYYY").format(
      "YYYY-MM-DD"
    );
    this.$store.commit("Setnamesearch", this.search);
    this.selectedMmonth = this.date;
  
    // Initialize totalItems
    this.totalItems = 0;
  },

  watch: {
    selectedYear() {
      this.updateMonthValue();
      this.get_submitted_workflow();
    },
    selectedMonth() {
      this.updateMonthValue();
      this.get_submitted_workflow();
    },
    selectedUser() {
      this.get_submitted_workflow();
    },
    currentPage(newVal, oldVal) {
      // When the page changes, check if we need to load more data
      if (newVal > oldVal && this.next_token) {
        // User is going to next page and we have more data to load
        this.get_submitted_workflow();
      } else {
        // Just scroll to top of table for same page or going back
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  },

  computed: {
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
    sortedAndPaginatedItems() {
      // First sort the paginated items
      const sortedItems = this.paginatedItems.slice().sort((a, b) => {
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
  },

  methods: {
    updateMonthValue() {
      this.formattedyear = this.selectedYear;
      const selectedMonthName = this.selectedMonth;
     
      const monthMapping = {
        Jan: "01",
        Feb: "02",
        Mar: "03",
        Apr: "04",
        May: "05",
        Jun: "06",
        Jul: "07",
        Aug: "08",
        Sep: "09",
        Oct: "10",
        Nov: "11",
        Dec: "12",
      };

      this.formattedmonth =
        monthMapping[selectedMonthName] ||
        new Date().toLocaleString("en", { month: "2-digit" });
     
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


    get_date(date) {
      this.$refs.menu.save(date);
    },

    get_swipe_pagination() {
      if (this.next_token) {
        this.get_submitted_workflow();
      }
    },

    handle_row_click(click, value) {
      // this.componentCheck = 1;
      this.rowInfo = value.item;
      // this.calendarPreview = true;
      this.componentCheck = 2;
      this.reportDailog = true;
    },

    view_item(value) {
      this.rowInfo = value;
      this.componentCheck = 2;
      this.reportDailog = true;
    },
    get_data(val) {
      this.selectedMmonth = this.date;
      this.next_token = null;
      this.tableData = [];
      this.currentPage = 1;
      this.totalItems = 0;
      this.goLoading = true;
      this.get_submitted_workflow();
      
      // Emit filter applied event
      this.$emit('filter-applied', {
        selectedYear: this.selectedYear,
        selectedMonth: this.selectedMonth,
        selectedUser: this.selectedUser
      });
    },



    async get_submitted_workflow() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(monthly_reports, {
            input: {
              user_id: this.selectedUser,
              year: `${this.formattedyear}`, // String interpolation for year inside double quotes
              month: `${this.formattedmonth}`,
              organization_id: data.organization.organization_id,

              limit: 50,
              nextToken: this.next_token,
            },
          })
        );
        this.tableLoading = false;
        this.goLoading = false;
        var response = JSON.parse(result.data.monthly_reports);
        this.next_token = response.nextToken;

        if (response.Status == "SUCCESS") {
          this.goLoading = false;

          if (this.next_token) {
            // If we have more data, concatenate to existing array
            let array = this.tableData.concat(response.data);
            this.tableData = array;
          } else {
            // If no more data, concatenate what we have (don't replace)
            if (response.data && response.data.length > 0) {
              let array = this.tableData.concat(response.data);
              this.tableData = array;
            }
          }

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.user_id === obj.user_id)
          );
          this.tableData = uniqueArrayOfObjects;
          
          // Update total items for pagination
          this.totalItems = this.tableData.length;
        } else {
          this.goLoading = false;
          // Only clear data if this is the first load (no next_token) or filter reset
          if (!this.next_token && this.tableData.length === 0) {
            this.tableData = [];
            this.totalItems = 0;
          }
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
    // Remove updatePageItems method as it's no longer needed with computed paginatedItems
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (key === "member_id" || key === "full_user_name") {
        return value.toLowerCase();
      }
      if (
        key === "average_monthly_worked_durations" ||
        key === "total_monthly_worked_durations" ||
        key === "total_present_days" ||
        key === "total_leave_days" ||
        key === "total_absent_days" ||
        key === "total_week_off" ||
        key === "total_cum_off"
      ) {
        return parseFloat(value) || 0;
      }
      return value;
    },
    getProgressValue(item) {
      // Calculate attendance percentage based on present days vs total working days
      const presentDays = parseInt(item.total_present_days) || 0;
      const leaveDays = parseInt(item.total_leave_days) || 0;
      const absentDays = parseInt(item.total_absent_days) || 0;
      const weekOff = parseInt(item.total_week_off) || 0;
      const compOff = parseInt(item.total_cum_off) || 0;
      
      const totalWorkingDays = presentDays + leaveDays + absentDays + weekOff + compOff;
      
      if (totalWorkingDays === 0) return 0;
      
      // Calculate percentage: (present + leave + week off + comp off) / total * 100
      const attendanceDays = presentDays + leaveDays + weekOff + compOff;
      return Math.round((attendanceDays / totalWorkingDays) * 100);
    },
  },
};
</script>

<style scoped>
.active-btn {
  background-color: #db4c77 !important;
  color: white !important;
  font-weight: bold;
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
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-weight: 500;
  text-transform: none;
  min-width: 80px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 6px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 6px;
  min-width: 32px;
}

.cursor-pointer {
  cursor: pointer;
}

/* Progress bar styling */
.modern-data-table :deep(.v-progress-linear) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-progress-linear__background) {
  background-color: #f0f0f0 !important;
}

.modern-data-table :deep(.v-progress-linear__determinate) {
  background-color: #ff9800 !important;
}
</style>