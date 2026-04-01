<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-toolbar density="compact" class="ml-4 mt-1" color="transparent">
      <v-toolbar-title class="ml-0">
        <v-icon color="primary">mdi-calendar</v-icon>
        Holiday List
      </v-toolbar-title>
      <v-spacer />
      <v-autocomplete
        density="compact"
        v-model="loaction"
        label="Select Location"
        v-if="checkholiday == false"
        :items="loactionitems"
        v-model:search="searchloc"
        hide-no-data
        hide-selected
        style="max-width: 250px"
        class="ml-2 mt-7"
        item-text="title"
        item-value="value"
        variant="outlined"
      />
      <v-select
        v-model="selectedYear"
        :items="filteredYears"
        label="Select Year"
        variant="outlined"
        density="compact"
        @change="month_get"
        @update:modelValue="checkholiday == true ? get_holiday_list() : ''"
        style="max-width: 250px"
        class="mt-7 mr-2"
      ></v-select>
      <v-btn
        v-if="checkholiday == false"
        dark
        size="small"
        class="text-capitalize cardCss ml-2"
        :loading="goLoading"
        @click="get_data()"
      >
        <v-icon>mdi-filter</v-icon>
        Apply Filter
      </v-btn>
      <v-btn
        @click="add_action()"
        small
        class="mt-1 elevation-0 cardCss mr-8"
        height="40"
      >
        <v-icon dark> mdi-plus </v-icon>
      </v-btn>
    </v-toolbar>
    <v-card elevation="0">
      <v-card-text>
        <v-data-table
          :headers="dynamicHeaders"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :sort-by="['holiday_date']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
          :fixed-header="true"
          :height="CommonVuetifyObj.height - 295"
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-calendar-remove</v-icon
              >
              <div class="text-h6 text-grey mb-2">No Holidays Found</div>
              <div class="text-body-2 text-grey">
                Try adjusting your year selection or add a new holiday.
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
              <div class="text-body-2 text-grey">Loading holidays...</div>
            </div>
          </template>

          <!-- Holiday Name -->
          <template v-slot:[`item.holiday_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="primary" class="mr-2"
                >mdi-calendar-star</v-icon
              > -->
              <span class="caption font-weight-medium">{{
                item.holiday_name
              }}</span>
            </div>
          </template>

          <!-- Holiday Date -->
          <template v-slot:[`item.holiday_date`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="success" class="mr-2"
                >mdi-calendar</v-icon
              > -->
              <span class="caption">{{
                get_updatedate(item.holiday_date)
              }}</span>
            </div>
          </template>

          <!-- Holiday Day -->
          <template v-slot:[`item.holiday_day`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="info" class="mr-2"
                >mdi-calendar-week</v-icon
              > -->
              <span class="caption font-weight-medium">{{
                item.holiday_day
              }}</span>
            </div>
          </template>

          <!-- Holiday Location -->
          <template v-slot:[`item.holiday_location_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="warning" class="mr-2"
                >mdi-map-marker</v-icon
              > -->
              <span class="caption">
                {{
                  item.holiday_location_name == undefined ||
                  item.holiday_location_name == ""
                    ? "-"
                    : item.holiday_location_name
                }}
              </span>
            </div>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              @click="delete_holiday(item)"
              class="action-btn"
            >
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" size="16">mdi-delete</v-icon>
                </template>
                <span>Delete Holiday</span>
              </v-tooltip>
            </v-btn>
          </template>
        </v-data-table>
        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${sortedAndPaginatedItems.length} of ${totalCount} holidays`
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
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
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
    <div v-if="componentCheck == 1">
      <AddHoliday
        :addDialog="addDialog"
        :actionType="actionType"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="addDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddHolidayloc
        :holidayadd="holidayadd"
        @clicked="holidayadd = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { useDisplay } from "vuetify/lib/framework.mjs";
import AddHolidayloc from "@/components/PresenceApp/PopUps/AddHolidayloc.vue";
import { formatdisplayDate, formatTime } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import { Get_holiday_list_portal_v1 } from "@/graphql/queries.js";
import AddHoliday from "@/components/SettingsDialogs/AddHoliday.vue";
import { API, graphqlOperation } from "aws-amplify";
import { get_location_details } from "@/mixins/GetLocations.js";
export default {
  components: {
    AddHoliday,
    SnackBar,
    AddHolidayloc,
  },
  mixins: [get_location_details],
  data() {
    return {
      tableLoading: false,
      holidayadd: false,
      tableData: [],
      height: 0,
      searchQuery: "",
      sortBy: [{ key: "holiday_date", order: "asc" }],
      headers: [
        {
          title: " Name",
          value: "holiday_name",
          sortable: true,
          align: "start",
        },
        {
          title: " Date",
          value: "holiday_date",
          sortable: true,
          align: "start",
        },
        { title: " Day", value: "holiday_day", sortable: true, align: "start" },
        {
          title: "Location",
          value: "holiday_location_name",
          sortable: true,
          align: "start",
        },
        { title: "Action", value: "actions", sortable: false, align: "center" },
      ],
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      fixed: true,
      componentCheck: 0,
      addDialog: false,
      deleteDialog: false,
      goLoading: false,
      actionType: "",
      selectedDate: "",
      selectedYear: new Date().getFullYear(),
      rowInfo: {},
      monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      loaction: "All",
      searchloc: "",
      loactionitems: [],
      checkholiday: null,
      filterhoilday: [],
      itemsPerPage: 10,
      currentPage: 1,
      totalCount: 0,
    };
  },
  computed: {
    dynamicHeaders() {
      const headers = [
        {
          title: "Name",
          value: "holiday_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Date",
          value: "holiday_date",
          sortable: true,
          align: "start",
        },
        { title: "Day", value: "holiday_day", sortable: true, align: "start" },
        { title: "Action", value: "actions", sortable: false, align: "center" },
      ];

      if (this.checkholiday == false) {
        headers.splice(3, 0, {
          title: "Location",
          value: "holiday_location_name",
          sortable: true,
          align: "start",
        });
      }

      return headers;
    },
    filteredYears() {
      const currentYear = new Date().getFullYear() + 1;
      // const selectedDateYear = new Date(this.selectedDate).getFullYear();
      var dateComponents = this.selectedDate.split(/[/,:\s]+/);

      var month = parseInt(dateComponents[1], 10) - 1;

      var date = new Date(
        dateComponents[2],
        month,
        dateComponents[0],
        dateComponents[3],
        dateComponents[4],
        dateComponents[5]
      );
      const selectedDateYear = date.getFullYear();
      const years = [];
      for (let year = selectedDateYear; year <= currentYear; year++) {
        years.push(year);
      }
      return years;
    },
    totalCount() {
      return this.tableData.length;
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
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
  mounted() {
    this.CommonVuetifyObj = useDisplay();
  },
  async created() {
    this.selectedDate = this.get_date(
      this.$store.getters.GetUserObj.organization.organization_created_on
    );
    this.checkholiday =
      this.$store.getters.GetOrgDetails.organization.default_holiday_list ==
      undefined
        ? true
        : this.$store.getters.GetOrgDetails.organization.default_holiday_list;
    this.height = window.innerHeight - 350;
    await this.get_location_details();
    await this.fetch_details();
    await this.month_get();
    await this.get_holiday_list();
  },
  methods: {
    async get_data() {
      this.goLoading = true;
      await this.get_holiday_list();
    },
    get_updatedate(date) {
      return formatdisplayDate(date);
    },
    fetch_details() {
      this.locationList.forEach((element) => {
        this.loactionitems.push({
          title: element.location_name,
          value: element.location_id,
        });
      });
      this.loactionitems.push({
        title: "All",
        value: "All",
      });
      this.loactionitems.push({
        title: "Default",
        value: "Default",
      });
    },
    get_date(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },

    async month_get() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonthIndex = currentDate.getMonth();
      let newMonthItems = [];
      const month = this.selectedDate.match(/\/(\d{2})\//)[1];
      if (this.selectedYear == new Date(this.selectedDate).getFullYear()) {
        newMonthItems = this.monthNames.slice();
      } else if (this.selectedYear < currentYear) {
        newMonthItems = this.monthNames.slice();
      } else if (this.selectedYear === currentYear) {
        newMonthItems = this.monthNames.slice(0, currentMonthIndex + 1);
      } else {
        newMonthItems = this.monthNames.slice();
      }

      // Assign the new array to monthItems
      this.monthItems = newMonthItems.slice();
      this.formattedMonthItems = this.monthItems.map((month, index) => ({
        text: month,
        value: (index + 1).toString().padStart(2, "0"),
      }));
      this.selectedMonth = (currentMonthIndex + 1).toString().padStart(2, "0");
      if (this.selectedYear == new Date(this.selectedDate).getFullYear()) {
        const startIndex = this.formattedMonthItems.findIndex(
          (item) => item.value === month
        );

        // If the value is found, create a new array starting from that index till the end
        const filteredArray =
          startIndex !== -1 ? this.formattedMonthItems.slice(startIndex) : [];

        this.formattedMonthItems = [];
        this.formattedMonthItems = filteredArray;
        this.selectedMonth = month;
      }
      this.$forceUpdate();
      if (this.checkholiday == true) {
        await this.get_holiday_list();
      }
    },
    async get_holiday_list() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(Get_holiday_list_portal_v1, {
            input: {
              organization_id: data.organization.organization_id,
              holiday_year: this.selectedYear,
            },
          })
        );
        this.tableLoading = false;
        this.goLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.Get_holiday_list_portal_v1);
        if (response.Status == "SUCCESS") {
          if (this.checkholiday == true) {
            this.tableData = response.Data;
            this.tableData = this.tableData.filter(
              (item) =>
                item.holiday_type === "DEFAULT" ||
                item.holiday_type === undefined
            );
          } else {
            this.tableData = [];
            this.filterhoilday = [];
            this.filterhoilday = response.Data;
            this.filterHolidays();
          }
        } else {
          this.tableData = [];
        }
      } catch (error) {
        // console.log(error);
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
    filterHolidays() {
      if (this.loaction === "All") {
        this.tableData = this.filterhoilday;
      } else if (this.loaction === "Default") {
        this.tableData = this.filterhoilday.filter(
          (holiday) =>
            holiday.holiday_location === "" ||
            holiday.holiday_location === undefined
        );
      } else {
        this.tableData = this.filterhoilday.filter(
          (holiday) => holiday.holiday_location === this.loaction
        );
      }
    },
    add_action() {
      var holidybit =
        this.$store.getters.GetOrgDetails.organization.default_holiday_list ==
        undefined
          ? true
          : this.$store.getters.GetOrgDetails.organization.default_holiday_list;

      if (holidybit == true) {
        this.componentCheck = 1;
        this.addDialog = true;
        this.actionType = "ADD";
      } else {
        this.componentCheck = 2;
        this.holidayadd = true;
      }

      // this.componentCheck = 1;
      // this.addDialog = true;

      // this.actionType = "ADD";
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
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.holidayadd = false;
      this.addDialog = false;
      this.loaction = "All";
      this.get_holiday_list();
    },
    delete_holiday(item) {
      this.rowInfo = item;
      this.actionType = "Delete";
      this.addDialog = true;
      this.componentCheck = 1;
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.updatePageItems();
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "holiday_name" ||
        key === "holiday_day" ||
        key === "holiday_location_name"
      ) {
        return value.toLowerCase();
      }
      if (key === "holiday_date") {
        return new Date(value).getTime();
      }
      return value;
    },
    updatePageItems() {
      // This method is called when pagination changes
      // The computed properties will handle the rest
    },
  },
};
</script>

<style scoped>
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

/* Action Button */
.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}
</style>
