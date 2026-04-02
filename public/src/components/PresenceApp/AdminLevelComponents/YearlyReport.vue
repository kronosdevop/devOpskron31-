<template>
  <div>
    <!--eslint-disable-->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat class="pa-4">
        <v-data-table
          :headers="
            $store.getters.GetUserObj.organization.week_off_settings == true &&
            $store.getters.GetUserObj.organization.comp_off == true
              ? headersall
              : $store.getters.GetUserObj.organization.week_off_settings == true
              ? headersweekoff
              : $store.getters.GetUserObj.organization.comp_off == true
              ? headerscomoff
              : headersoff
          "
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
        class="elevation-2 dtwidth text-caption rounded-lg modern-data-table"
          density="compact"
          hover
          multi-sort
        :height="tableHeight"
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-chart-timeline-variant</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Yearly Reports Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or year selection.
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
                Loading yearly reports...
              </div>
            </div>
          </template>

          <template v-slot:[`item.member_id`]="{ item }">
            <span>{{
              item.member_id == undefined ? "-" : item.member_id
            }}</span>
          </template>
          
          <template v-slot:[`item.leave_dates`]="{ item }">
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <span v-bind="props" v-if="item.leave_dates">{{
                  item.leave_dates.length === 0
                    ? "-"
                    : formatDates(item.leave_dates.join()).length >= 50
                    ? formatDates(item.leave_dates.join()).substr(0, 50) + "..."
                    : formatDates(item.leave_dates.join())
                }}</span>
                <span v-else>-</span>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ formatDates(item.leave_dates.join()) }}
              </div>
            </v-tooltip>
          </template>

          <template v-slot:[`item.graph`]="{ item }">
            <v-progress-linear color="amber" :input="true" height="25">
              <template v-slot:default="{ value }">
                <strong>{{ Math.ceil(value) }}</strong>
              </template>
            </v-progress-linear>
          </template>
        </v-data-table>
      
      <!-- Modern Table Footer -->
      <div class="table-footer">
        <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
              : `Showing ${sortedAndPaginatedItems.length} of ${totalCount} yearly reports`
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
    </v-card>
  </div>
</template>
<script>
import moment from "moment";
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { yearly_admin_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
  },

  props: {
    selectedYear: {
      type: Number,
      default: () => new Date().getFullYear()
    },
    selectedUser: {
      type: String,
      default: "ALL"
    }
  },

  data() {
    return {
      search: "",
      searchQuery: "",
      sortBy: [{ key: "user_name", order: "asc" }],
      selectedDate: "",
      SnackBarComponent: {},

      tableLoading: false,
      tableHeight: 0,

      headersall: [
        {
          title: "Member Name",
          value: "user_name",
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
          title: "Applied Leave",
          value: "leave_dates",
          sortable: false,
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
          value: "total_week_off_days",
          sortable: true,
          align: "start",
        },
        {
          title: "Comp Off",
          value: "total_cump_off_days",
          sortable: true,
          align: "start",
        },
      ],
      headersoff: [
        {
          title: "Member Name",
          value: "user_name",
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
          title: "Applied Leave",
          value: "leave_dates",
          sortable: false,
          align: "start",
        },
        {
          title: "Absent",
          value: "total_absent_days",
          sortable: true,
          align: "start",
        },
      ],
      headersweekoff: [
        {
          title: "Member Name",
          value: "user_name",
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
          title: "Applied Leave",
          value: "leave_dates",
          sortable: false,
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
          value: "total_week_off_days",
          sortable: true,
          align: "start",
        },
      ],
      headerscomoff: [
        {
          title: "Member Name",
          value: "user_name",
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
          title: "Applied Leave",
          value: "leave_dates",
          sortable: false,
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
          value: "total_cump_off_days",
          sortable: true,
          align: "start",
        },
      ],
      tableData: [],
      next_token: null,
      itemsPerPage: 20,
      currentPage: 1,
    };
  },
  computed: {
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
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
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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
    sortBy: {
      get() {
        return this.$store.state.yearlyReport.sortBy;
      },
      set(value) {
        this.$store.dispatch("yearlyReport/updateSortBy", value);
      },
    },
  },
  async mounted() {
    this.tableHeight = window.innerHeight - 250;
    await this.get_data();
  },

  watch: {
    selectedYear() {
      this.get_data();
    },
    selectedUser() {
      this.get_data();
    },
    currentPage() {
      // This will trigger the computed paginatedItems to update
    },
  },

  methods: {
    formatDates(dateString) {
      const monthNames = [
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
      ];

      return dateString
        .split(",")
        .map((date) => {
          const [year, month, day] = date.split("-");
          return `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`;
        })
        .join(", ");
    },

    async get_data() {
      this.next_token = null;
      this.tableData = [];
      await this.get_submitted_workflow();
    },

    async get_submitted_workflow() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(yearly_admin_reports, {
            input: {
              organization_id: data.organization.organization_id,
              swipe_year: this.selectedYear.toString(),
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.yearly_admin_reports);
        this.next_token = response.nextToken;

        if (response.Status == "SUCCESS") {
          let array = this.tableData.concat(response.data || []);
          this.tableData = array;
          
          // Filter by user if selected
          if (this.selectedUser && this.selectedUser !== "ALL") {
            this.tableData = this.tableData.filter(item => item.user_id === this.selectedUser);
          }
          
          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.user_id === obj.user_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.currentPage = 1;
          
          // Emit filter applied event
          this.$emit('filter-applied', {
            year: this.selectedYear,
            user: this.selectedUser,
            totalCount: this.tableData.length
          });
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
    
    updatePageItems(newPage) {
      this.currentPage = newPage;
    },
    
    handleSortChange(value) {
      this.$store.dispatch("yearlyReport/updateSortBy", value);
    },
    
    getSortValue(value, key) {
      if (value === undefined || value === null) return "";
      // For string fields
      if (key === "user_name") {
        return value.toString().toLowerCase();
      }
      // For numeric fields
      if (
        key === "total_present_days" ||
        key === "total_leave_days" ||
        key === "total_absent_days" ||
        key === "total_week_off_days" ||
        key === "total_cump_off_days"
      ) {
        return parseFloat(value) || 0;
      }
      // For leave_dates, sort by length
      if (key === "leave_dates") {
        return Array.isArray(value) ? value.length : 0;
      }
      return value;
    },
  },
};
</script>

<style scoped>
/* Modern Data Table Styles */
.modern-data-table {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid #e0e0e0 !important;
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px !important;
}

.modern-data-table :deep(.v-data-table__thead) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.modern-data-table :deep(.v-data-table__thead th) {
  color: white !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  border-bottom: none !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: all 0.2s ease !important;
  border-bottom: 1px solid #f0f0f0 !important;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr:nth-child(even)) {
  background-color: #fafafa !important;
}

.modern-data-table :deep(.v-data-table__tbody tr:nth-child(even):hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%) !important;
}

.modern-data-table :deep(.v-data-table__tbody td) {
  padding: 16px !important;
  font-size: 14px !important;
  color: #333 !important;
  border-bottom: 1px solid #f0f0f0 !important;
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
</style>