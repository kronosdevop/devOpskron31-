<template>
  <div>
    <v-toolbar color="transparent">
      <v-menu
        v-model="monthPicker"
        :close-on-content-click="false"
        persistent
        max-width="350"
        transition="scale-transition"
        scroll-strategy="none"
      >
        <template v-slot:activator="{ props }">
          <v-text-field
            v-model="datedisplay"
            label="Select a Month"
            readonly
            density="compact"
            variant="outlined"
            class="ml-4 mr-2 mt-4"
            style="max-width: 180px"
            v-bind="props"
          />
        </template>
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="7">
                <span class="ml-6" style="font-size: 19px"
                  ><b>{{ datedisplayMonth }}</b></span
                >
              </v-col>
              <v-col>
                <v-select
                  label="Select Year"
                  v-model="yearfilter"
                  :items="itemyears"
                  density="compact"
                  variant="outlined"
                  class="mt-1"
                  style="max-width: 100px"
                ></v-select>
              </v-col>
            </v-row>

            <v-row class="ml-n2" dense>
              <v-col
                v-for="(month, index) in monthNames"
                :key="index"
                cols="4"
                class="d-flex justify-center"
              >
                <v-btn
                  class="ma-1"
                  :class="{ 'active-btn': month === monthfilter }"
                  density="compact"
                  :disabled="isMonthDisabled(index)"
                  @click="selectMonth(month)"
                >
                  {{ month }}
                </v-btn>
              </v-col>
            </v-row>
            <v-row class="mt-4 justify-end">
              <v-btn text class="ma-1" density="compact" @click="closedialog()"
                >Cancel</v-btn
              >
              <v-btn
                color="primary"
                text
                class="ma-1 mr-8"
                density="compact"
                @click="saveSelection"
                >Save</v-btn
              >
            </v-row>
          </v-card-text>
        </v-card>
      </v-menu>

      
      <v-autocomplete
        v-model="userselect"
        label="Search User"
        item-title="full_user_name"
        item-value="user_id"
        :items="userArray"
        v-model:search="searchuser"
        hide-no-data
        variant="outlined"
        density="compact"
        class="mr-2 mt-4"
        style="min-width: 160px; max-width: 200px"
        placeholder="Min 3 Character"
        hide-selected
      />
      <v-autocomplete
        density="compact"
        v-model="visitselect"
        label="Search Visit"
        variant="outlined"
        item-title="full_user_name"
        item-value="user_id"
        :items="visitArray"
        v-model:search-input="searchvisit"
        hide-no-data
        class="mr-2 mt-4"
        style="min-width: 160px; max-width: 200px"
        @update:modelValue="searchvisit = ''"
        placeholder="Min 3 Character"
        hide-selected
      />
      <v-btn
        color="primary"
        class="text-capitalize rounded-lg mr-2 mb-2"
        :loading="goLoading"
        height="40"
        elevation="0"
        variant="flat"
        @click="get_data()"
      >
        Go
      </v-btn>
      <v-btn
        color="error"
        class="text-capitalize rounded-lg mb-2"
        :loading="clearData"
        elevation="0"
        variant="flat"
        height="40"
        @click="clear_data()"
      >
        Clear
      </v-btn>
    </v-toolbar>

    <v-card elevation="0">
      <v-card-text>
        <v-data-table
          :headers="headers"
          fixed-header
          outlined
          :items="paginatedItems"
          :loading="tableLoading"
          :search="search"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalItems"
          :height="CommonVuetifyObj.height - 280"
          hide-default-footer
          class="mt-n2 dtwidth modern-data-table"
          density="compact"
          hover
          @click:row="viewform"
        >
          <template v-slot:[`item.log_initiated_on`]="{ item }">
            <div class="d-flex align-center">
              <v-icon color="primary">mdi-clock-outline</v-icon>
              <div class="ml-2">{{ fetch_value(item.log_initiated_on) }}</div>
            </div>
          </template>

          <template v-slot:[`item.log_initiated_by`]="{ item }">
            <div class="d-flex align-center">
              <v-icon color="blue">mdi-email-outline</v-icon>
              <div class="ml-2">{{ item.log_initiated_by }}</div>
            </div>
          </template>

          <template v-slot:[`item.visit_type_id_text`]="{ item }">
            <div class="d-flex align-center">
              <v-icon color="green">mdi-account-box</v-icon>
              <div class="ml-2">{{ item.visit_type_id_text }}</div>
            </div>
          </template>

          <template #item.visit_loc="{ item }">
            <v-icon
              size="small"
              color="primaryColor"
              @click.stop="get_location(item)"
            >
              mdi-map-marker
            </v-icon>
          </template>
          <template #item.actions="{ item }">
            <v-icon
              size="small"
              @click.stop="viewform(item)"
              class="ml-2"
              color="primaryColor"
            >
              mdi-file-multiple
            </v-icon>
          </template>
        </v-data-table>

        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalItems} visit logs`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              class="pagination-btn"
              :disabled="currentPage === 1"
              variant="text"
              size="small"
              @click="currentPage = currentPage - 1"
              >Previous</v-btn
            >
            <div class="page-numbers">
              <v-btn
                v-for="page in visiblePages"
                :key="page"
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
                :variant="page === currentPage ? 'elevated' : ''"
                size="small"
                @click="currentPage = page"
                >{{ page }}</v-btn
              >
            </div>
            <v-btn
              class="pagination-btn"
              :disabled="currentPage === pageCount"
              size="small"
              variant="text"
              @click="currentPage = currentPage + 1"
              >Next</v-btn
            >
          </div>
        </div>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <LogLocation
        :locationlogged="locationlogged"
        :rowInfo="rowInfo"
        @clicked="locationlogged = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <LoggedForm
        :formlog="formlog"
        :rowInfo="rowInfo"
        @clicked="formlog = false"
      />
    </div>
  </div>
</template>

<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import LoggedForm from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/LoggedForm.vue";
import LogLocation from "@/components/VisitsManagementApp/AdminApp/AdminDialogues/LogLocation.vue";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { list_all_user_visit_logs } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_visittype_master } from "@/mixins/GetVisitMaster";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  mixins: [get_all_org_users, get_visittype_master],
  components: {
    LogLocation,
    LoggedForm,
  },
  data() {
    return {
      fixed: true,
      locationlogged: false,
      searchF: "",
      goLoading: false,
      clearData: false,
      userselect: "ALL",
      userArray: [],
      visitArray: [],
      searchvisit: "",
      visitselect: "ALL",
      monthPicker: false,
      datedisplay: "",
      datedisplayMonth: "",
      yearfilter: new Date().getFullYear(),
      monthfilter: "",
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
      itemyears: [],
      componentCheck: 0,
      height: 0,
      formlog: false,
      rowInfo: {},
      CommonVuetifyObj: {},
      tableData: [],
      tableLoading: false,
      headers: [
        { title: "Visited On", key: "log_initiated_on", sortable: false },
        { title: "Visited By", key: "log_initiated_by", sortable: false },
        { title: "Type Of Visit", key: "visit_type_id_text", sortable: false },
        { title: "Location", key: "visit_loc", sortable: false },
        { title: "Visit Details", key: "actions", sortable: false },
      ],
      itemsPerPage: 20,
      currentPage: 1,
      totalItems: 0,
      search: "",
    };
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
  },
  watch: {
    date(val) {
      this.date1 =
        [
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
        ][Number(val.split("-")[1]) - 1] +
        " " +
        val.split("-")[0];
    },
    tableData() {
      this.totalItems = this.tableData.length;
    },
    currentPage(newVal) {
      // Optional: scroll to top of table on page change
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
  async mounted() {
    this.CommonVuetifyObj = useDisplay();
    await Promise.all([
      this.fetch_visit(),
      this.get_all_org_users(),
      this.get_visittype_master(),
    ]);
    await this.fetch_details();
    this.populateYearItems();
    this.setInitialFilters();
  },
  methods: {
    fetch_details() {
      // Clear arrays before populating
      this.userArray = [];
      this.visitArray = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
      // Add 'All' only once at the start
      this.userArray.unshift({
        full_user_name: "All",
        user_id: "ALL",
      });
      this.Mastervisit.forEach((element) => {
        this.visitArray.push({
          full_user_name:
            element.workflow_name + " V " + element.workflow_version,
          user_id: element.workflow_id,
        });
      });
      // Add 'All' only once at the start
      this.visitArray.unshift({
        full_user_name: "All",
        user_id: "ALL",
      });
    },
    async get_data() {
      this.goLoading = true;
      this.tableData = [];
      this.fetch_visit();
    },
    async clear_data() {
      this.userselect = "ALL";
      this.visitselect = "ALL";
      this.date = new Date().toISOString().substr(0, 7);
      this.tableData = [];
      this.clearData = true;
      this.fetch_visit();
    },
    fetch_value(date) {
      return formatedatetime(date);
    },
    get_location(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.locationlogged = true;
    },
    viewform(item) {
      this.rowInfo = item;
      this.componentCheck = 2;
      this.formlog = true;
    },

    async fetch_visit() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_user_visit_logs, {
            input: {
              nextToken: null,
              limit: 100,
              workflow_id: this.visitselect,
              month_year: this.date,
              user_email_id: this.userselect,
            },
          })
        );

        this.tableLoading = false;
        this.goLoading = false;
        this.clearData = false;
        var response = JSON.parse(result.data.list_all_user_visit_logs);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.goLoading = false;
          this.clearData = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
          this.goLoading = false;
          this.clearData = false;
          this.tableData = [];
        }
      } catch (error) {
        this.goLoading = false;
        this.clearData = false;
        this.tableLoading = false;
        this.tableData = [];

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    populateYearItems() {
      const currentYear = new Date().getFullYear();
      this.itemyears = Array.from(
        { length: 10 },
        (_, index) => currentYear - index
      );
    },
    setInitialFilters() {
      const currentYear = new Date().getFullYear();
      this.yearfilter = currentYear;
      this.monthfilter = this.monthNames[new Date().getMonth()] || "Jan";
      this.updateDatedisplayMonth();
      this.datedisplay =
        this.datedisplayMonth || `${this.monthfilter} ${this.yearfilter}`;
    },
    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
      } else {
        const currentDate = new Date();
        this.datedisplayMonth = `${
          this.monthNames[currentDate.getMonth()]
        } ${currentDate.getFullYear()}`;
      }
    },
    selectMonth(month) {
      this.monthfilter = month;
    },
    closedialog() {
      this.monthPicker = false;
    },
    saveSelection() {
      this.datedisplay = this.monthfilter + " " + this.yearfilter;
      this.monthPicker = false;
      this.get_data();
    },
    isMonthDisabled(index) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      if (this.yearfilter === currentYear && index > currentMonth) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style scoped>
.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}
.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}
</style>
