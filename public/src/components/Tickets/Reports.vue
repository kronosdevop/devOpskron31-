<template>
  <div>
    <TicketsDataTableDialog
      :DialogTicketsDataTable="DialogTicketsDataTable"
      :TableItems="filteredTickets"
      @clicked="DialogTicketsDataTableEmit"
    />
    <!--Card for Filters-->
    <v-container class="pa-3">
      <v-card rounded="xl" height="70" flat width="650">
        <!--Filters Text & Icon-->
        <div class="d-flex align-center ms-3">
          <!--From Date Picker-->
          <v-menu v-model="FromDateMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="FormattedFromDate"
                label="From"
                rounded="lg"
                variant="outlined"
                max-width="160"
                density="compact"
                prepend-inner-icon="mdi-calendar-outline"
                class="ml-2 mt-4"
              />
            </template>
            <v-date-picker v-model="EnteredFromDate" header-color="primary">
              <template #actions>
                <v-btn variant="text" @click="FromDateMenu = false">
                  Close
                </v-btn>
              </template>
            </v-date-picker>
          </v-menu>

          <!--To Date Picker-->
          <v-menu v-model="ToDateMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="FormattedToDate"
                label="To"
                rounded="lg"
                variant="outlined"
                max-width="160"
                density="compact"
                prepend-inner-icon="mdi-calendar-outline"
                class="ml-2 mt-4"
              />
            </template>
            <v-date-picker
              v-model="EnteredToDate"
              header-color="primary"
              :min="new Date()"
            >
              <template #actions>
                <v-btn variant="text" @click="ToDateMenu = false">
                  Close
                </v-btn>
              </template>
            </v-date-picker>
          </v-menu>

          <!--Filter By Org user-->
          <v-select
            v-model="OrgMembers"
            :items="OrgUsersList"
            item-title="title"
            item-value="value"
            label="Org members"
            variant="outlined"
            density="compact"
            rounded="lg"
            class="ml-2 mt-4"
            max-width="250"
            prepend-inner-icon="mdi-account"
          />

          <!--Filter/Search Button-->
          <v-tooltip text="Filter">
            <template #activator="{ props }">
              <v-btn
                icon
                flat
                color="transparent"
                v-bind="props"
                @click="GetReportData"
                :loading="loading"
              >
                <v-icon color="primary" size="30" flat> mdi-magnify </v-icon>
                <template #loader>
                  <v-progress-circular indeterminate color="primary" />
                </template>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </v-card>
    </v-container>

    <!-- Reports Content -->
    <v-container fluid class="pa-4 mt-n3">
      <v-card
        height="66vh"
        class="pa-4 overflow-y-auto mt-n3"
        rounded="lg"
        flat
      >
        <!-- Overview Metrics -->
        <v-row v-if="reportData.analytics" class="mb-6">
          <v-col
            v-for="(metric, index) in overviewMetrics"
            :key="index"
            cols="6"
            sm="4"
            md="3"
            lg="2"
          >
            <v-card
              class="pa-1 text-center metric-float"
              color="primary"
              rounded="lg"
              elevation="1"
              min-height="60"
              @click="openTicketsDialog(metric.label)"
              style="cursor: pointer"
            >
              <div class="d-flex align-center">
                <v-card-title class="text-body-2 font-weight-medium">
                  {{ metric.label }}
                </v-card-title>
                <v-card-text class="text-h6 font-weight-bold mt-4">
                  {{ metric.formattedValue }}
                </v-card-text>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts Row -->
        <v-row class="mb-6 mt-n6">
          <!-- Tickets by Status (Pie Chart) -->
          <v-col cols="12" md="6">
            <v-card class="pa-4 card" elevation="2" rounded="xl">
              <v-card-title class="text-h6">Tickets by Status</v-card-title>

              <!--Chart-->
              <apexchart
                v-if="statusBarSeries && statusBarSeries[0].data.length > 0"
                type="bar"
                height="250"
                :options="statusBarOptions"
                :series="statusBarSeries"
                @dataPointSelection="
                  (event, chartContext, { dataPointIndex }) =>
                    openTicketsByStatus(
                      statusBarOptions.xaxis.categories[dataPointIndex]
                    )
                "
              />

              <!--No Data Text-->
              <div v-else class="text-center py-6">
                <v-icon size="64" color="grey-lighten-1" class="mb-3"
                  >mdi-chart-pie</v-icon
                >
                <div class="text-h6 text-grey-darken-1">No data available</div>
                <div class="text-caption text-medium-emphasis">
                  No ticket status data found
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Tickets by Category (Pie Chart) -->
          <v-col cols="12" md="6">
            <v-card class="pa-4 card" elevation="2" rounded="xl">
              <v-card-title class="text-h6">Tickets by Category</v-card-title>
              <!--Chart-->
              <apexchart
                v-if="categoryBarSeries && categoryBarSeries[0].data.length > 0"
                type="bar"
                height="250"
                :options="categoryBarOptions"
                :series="categoryBarSeries"
                @dataPointSelection="
                  (event, chartContext, { dataPointIndex }) =>
                    openTicketsByCategory(
                      categoryBarOptions.xaxis.categories[dataPointIndex]
                    )
                "
              />

              <!--No Data Text-->
              <div v-else class="text-center py-6">
                <v-icon size="64" color="grey-lighten-1" class="mb-3"
                  >mdi-shape</v-icon
                >
                <div class="text-h6 text-grey-darken-1">No data available</div>
                <div class="text-caption text-medium-emphasis">
                  No category information found
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tickets by Ticket Type (Bar Chart) -->
        <v-row class="mb-6">
          <v-col cols="12" md="6">
            <v-card class="pa-4 card" elevation="2" rounded="xl">
              <!--Chart-->
              <v-card-title class="text-h6">Tickets by Type</v-card-title>
              <apexchart
                v-if="ticketTypeSeries.length > 0"
                type="bar"
                height="250"
                :options="ticketTypeChartOptions"
                :series="ticketTypeSeries"
                @dataPointSelection="
                  (event, chartContext, { dataPointIndex }) =>
                    openTicketsByType(
                      ticketTypeChartOptions.xaxis.categories[dataPointIndex]
                    )
                "
              />

              <!--No Data Text-->
              <div v-else class="text-center py-6">
                <v-icon size="64" color="grey-lighten-1" class="mb-3"
                  >mdi-ticket</v-icon
                >
                <div class="text-h6 text-grey-darken-1">No data available</div>
                <div class="text-caption text-medium-emphasis">
                  No ticket type data found
                </div>
              </div>
            </v-card>
          </v-col>

          <!-- Top Performers Table-->
          <v-col cols="12" lg="6">
            <v-card class="pa-4 card" elevation="2" rounded="xl">
              <v-card-title class="text-h6 mb-4">Top Performers</v-card-title>
              <v-data-table
                v-if="filteredTopPerformers.length > 0"
                :headers="performerHeaders"
                :items="filteredTopPerformers"
                :items-per-page="5"
                height="250"
                class="elevation-1"
                hide-default-footer
              >
                <template #item.resolution_rate="{ item }">
                  <span class="text-success font-weight-medium">{{
                    item.resolution_rate
                  }}</span>
                </template>
              </v-data-table>

              <!--No Data text-->
              <v-card-text v-else class="text-center py-6">
                <v-icon size="64" color="grey-lighten-1" class="mb-3"
                  >mdi-account-group-outline</v-icon
                >
                <div class="text-h6 text-grey-darken-1">No data available</div>
                <div class="text-caption text-medium-emphasis">
                  No top performers during this period
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recently Resolved Tickets -->
        <v-row v-if="recentlyResolved.length > 0">
          <v-col cols="12">
            <v-card class="pa-4 card" elevation="2" rounded="xl">
              <v-card-title class="text-h6 mb-4"
                >Recently Resolved Tickets</v-card-title
              >
              <v-data-table
                :headers="resolvedHeaders"
                :items="recentlyResolved"
                class="elevation-1"
                :items-per-page="5"
              >
                <template #item.resolution_time_hours="{ item }">
                  <span class="text-primary font-weight-medium"
                    >{{ item.resolution_time_hours }} hrs</span
                  >
                </template>
                <template #item.resolved_at="{ item }">
                  <span class="text-caption">{{
                    formatTimestamp(item.resolved_at)
                  }}</span>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>

        <!--No Data Text-->
        <v-row v-else class="mt-4">
          <v-col cols="12">
            <v-card class="pa-4 text-center card" elevation="1" rounded="xl">
              <v-icon size="64" color="grey-lighten-1" class="mb-3"
                >mdi-check-decagram</v-icon
              >
              <div class="text-h6 text-grey-darken-1">
                No recently resolved tickets
              </div>
              <div class="text-caption text-medium-emphasis">
                None of the tickets were resolved in the selected time range.
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import TicketsDataTableDialog from "./TicketsDataTableDialog.vue";

import { GetAllListReportsData } from "@/mixins/GetAllListReportsData";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  components: {
    apexchart: VueApexCharts,
    TicketsDataTableDialog,
  },

  mixins: [GetAllListReportsData, get_all_org_users],

  data: () => ({
    OrgMembers: "",

    EnteredFromDate: new Date(new Date().setDate(new Date().getDate() - 15)),

    EnteredToDate: new Date(),

    FromDateMenu: false,
    ToDateMenu: false,
    loading: false,
    DialogTicketsDataTable: false,

    selectedMetric: null,
    selectedFilterType: null,

    ListAllReportsData: [],
    OrgUsersList: [],
  }),

  created() {
    this.fetchOrgUsers();
  },

  computed: {
    filteredTickets() {
      const tickets = this.reportData.tickets || [];
      if (
        ["Total", "Unclaimed", "Claimed", "Resolved"].includes(
          this.selectedMetric
        )
      ) {
        switch (this.selectedMetric) {
          case "Unclaimed":
            return tickets.filter((t) => t.claim_status === "UNCLAIMED");
          case "Claimed":
            return tickets.filter((t) => t.claim_status === "CLAIMED");
          case "Resolved":
            return tickets.filter((t) => t.status === "RESOLVED");
          case "Total":
          default:
            return tickets;
        }
      }
      if (this.selectedFilterType === "category") {
        return tickets.filter((t) => t.category === this.selectedMetric);
      }
      if (this.selectedFilterType === "status") {
        return tickets.filter((t) => t.status === this.selectedMetric);
      }
      if (this.selectedFilterType === "ticket_type") {
        return tickets.filter((t) => t.ticket_type === this.selectedMetric);
      }
      return [];
    },
    filteredTopPerformers() {
      return (this.performance.top_performers || []).filter(
        (performer) => performer.name && performer.name !== "Unknown"
      );
    },
    reportData() {
      return this.ListAllReportsData || {};
    },
    analytics() {
      return this.reportData.analytics || {};
    },
    performance() {
      return this.reportData.performance || {};
    },
    breakdowns() {
      return this.reportData.breakdowns || {};
    },
    overviewMetrics() {
      const { total_tickets, unclaimed_tickets, claimed_tickets } =
        this.analytics;
      return [
        {
          label: "Total",
          formattedValue: total_tickets || 0,
        },
        {
          label: "Unclaimed",
          formattedValue: unclaimed_tickets || 0,
        },
        {
          label: "Claimed",
          formattedValue: claimed_tickets || 0,
        },
      ];
    },
    topPerformers() {
      return this.performance.top_performers || [];
    },
    departmentPerformance() {
      return this.performance.department_performance || [];
    },
    bottlenecks() {
      return this.performance.bottlenecks || [];
    },
    overdueTickets() {
      return this.reportData.overdue_tickets || [];
    },
    recentlyResolved() {
      return this.reportData.recently_resolved || [];
    },
    statusBarSeries() {
      if (!this.breakdowns || !this.breakdowns.by_status) {
        return [{ name: "Tickets", data: [] }];
      }
      return [
        {
          name: "Tickets",
          data: Object.values(this.breakdowns.by_status),
        },
      ];
    },
    statusBarOptions() {
      return {
        chart: {
          type: "bar",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: { horizontal: false, borderRadius: 4 },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: Object.keys(this.breakdowns.by_status || {}),
        },
        colors: ["#2196F3"],
        legend: { show: false },
      };
    },
    categoryBarSeries() {
      if (!this.breakdowns || !this.breakdowns.by_category) {
        return [{ name: "Tickets", data: [] }];
      }
      return [
        {
          name: "Tickets",
          data: Object.values(this.breakdowns.by_category),
        },
      ];
    },
    categoryBarOptions() {
      return {
        chart: {
          type: "bar",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: { horizontal: false, borderRadius: 4 },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: Object.keys(this.breakdowns.by_category || {}),
        },
        colors: ["#9C27B0"],
        legend: { show: false },
      };
    },
    ticketTypeSeries() {
      return [
        {
          name: "Tickets",
          data: Object.values(this.breakdowns.by_ticket_type || {}),
        },
      ];
    },
    ticketTypeChartOptions() {
      return {
        chart: {
          type: "bar",
          toolbar: { show: false },
        },
        plotOptions: {
          bar: { horizontal: true, borderRadius: 4 },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: Object.keys(this.breakdowns.by_ticket_type || {}),
        },
        colors: ["#673AB7"],
        legend: { show: false },
      };
    },
    departmentSeries() {
      return Object.values(this.breakdowns.by_department || {});
    },
    departmentChartOptions() {
      return {
        labels: Object.keys(this.breakdowns.by_department || {}),
        chart: {
          type: "polarArea",
          toolbar: { show: false },
        },
        colors: ["#E91E63", "#3F51B5", "#009688", "#FFC107"],
        legend: { position: "bottom" },
        responsive: [
          { breakpoint: 480, options: { legend: { position: "bottom" } } },
        ],
      };
    },
    performerHeaders() {
      return [
        { title: "Name", key: "name", sortable: false },
        { title: "Department", key: "department", sortable: false },
        { title: "Total Tickets", key: "total_tickets", sortable: false },
        { title: "Resolved", key: "resolved_tickets", sortable: false },
        { title: "Resolution Rate", key: "resolution_rate", sortable: false },
      ];
    },
    departmentHeaders() {
      return [
        { title: "Department", key: "department", sortable: false },
        { title: "Ticket Count", key: "ticket_count", sortable: false },
        { title: "Percentage", key: "percentage", sortable: false },
        { title: "Users", key: "user_count", sortable: false },
      ];
    },
    resolvedHeaders() {
      return [
        { title: "Ticket Number", key: "ticket_number", sortable: false },
        { title: "Title", key: "title", sortable: false },
        { title: "Assigned To", key: "assigned_to", sortable: false },
        {
          title: "Resolution Time",
          key: "resolution_time_hours",
          sortable: false,
        },
        { title: "Resolved At", key: "resolved_at", sortable: false },
      ];
    },
    FormattedFromDate() {
      return this.EnteredFromDate
        ? this.ConvertFromDate(this.EnteredFromDate)
        : "";
    },
    FormattedToDate() {
      return this.EnteredToDate ? this.ConvertToDate(this.EnteredToDate) : "";
    },
  },

  async mounted() {
    await this.GetAllListReportsDataMethod();
  },

  methods: {
    async GetReportData() {
      await this.GetAllListReportsDataMethod();
    },
    async fetchOrgUsers() {
      await this.get_all_org_users();
      this.OrgUsersList = [{ title: "All", value: "" }];
      this.orgUsers
        .filter((user) => user.user_status === "ACTIVE")
        .forEach((user) => {
          this.OrgUsersList.push({
            title: user.user_email_id,
            value: user.user_email_id,
          });
        });
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    ConvertFromDate(EnteredFromDate) {
      const date = new Date(EnteredFromDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    ConvertToDate(EnteredToDate) {
      const date = new Date(EnteredToDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    openTicketsDialog(metric) {
      this.selectedMetric = metric;
      this.DialogTicketsDataTable = true;
    },
    openTicketsByCategory(category) {
      this.selectedMetric = category;
      this.selectedFilterType = "category";
      this.DialogTicketsDataTable = true;
    },
    openTicketsByStatus(status) {
      this.selectedMetric = status;
      this.selectedFilterType = "status";
      this.DialogTicketsDataTable = true;
    },
    openTicketsByType(type) {
      this.selectedMetric = type;
      this.selectedFilterType = "ticket_type";
      this.DialogTicketsDataTable = true;
    },
    DialogTicketsDataTableEmit() {
      this.DialogTicketsDataTable = false;
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  background: white !important;
  border: 1px solid transparent !important;
}
.card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}
.metric-float {
  transform: translateY(-10px) !important;
}
</style>
