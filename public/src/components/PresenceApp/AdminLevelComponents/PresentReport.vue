<template>
  <div>
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-check</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Present Reports</span>
          <span class="header-subtitle">Review and manage present reports</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <v-btn color="primary" size="small" variant="outlined" class="mr-2 text-capitalize"
            @click="ChangeCard()">
            {{ cardComponent === 1 ? 'View Late Comers' : 'View Present Report' }}
          </v-btn>
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

              <!-- Location Filter -->
              <div class="filter-group">
                <label class="filter-label">Location</label>
                <v-select
                  v-model="loaction"
                  :items="loactionitems"
                  item-text="title"
                  item-value="location_id"
                  variant="outlined"
                  density="compact"
                  class="filter-select"
                />
              </div>

              <!-- User Search Filter -->
              <div class="filter-group">
                <label class="filter-label">Search User</label>
                <v-autocomplete
                  v-model="userselect"
                  item-text="title"
                  item-value="user_id"
                  :items="userArray"
                  v-model:search-input="searchF"
                  hide-no-data
                  variant="outlined"
                  density="compact"
                  class="filter-select"
                  placeholder="Min 3 Character"
                  hide-selected
                />
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

    <v-card flat class="overflow-y-auto mt-10" v-if="cardComponent == 1">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="headers"
                :items="paginatedItems"
                :loading="tableLoading"
                :sort-by="['user_name']"
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
                      >mdi-account-check</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">
                      No Present Reports Found
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
                      Loading present reports...
                    </div>
                  </div>
                </template>

                <!-- Member Name/ID Column -->
                <template v-slot:[`item.user_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-avatar size="24" color="primary" class="mr-3">
                      <span
                        class="white--text font-weight-medium"
                        style="font-size: 10px"
                      >
                        {{
                          (item.user_name || "U").substring(0, 1).toUpperCase()
                        }}
                      </span>
                    </v-avatar> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.user_name || "N/A" }}
                      </div>
                      <div class="caption text-medium-emphasis">
                        {{ item.member_id == undefined ? "-" : item.member_id }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Duration Column -->
                <template v-slot:[`item.total_duration`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3"
                      >mdi-clock-outline</v-icon
                    > -->
                    <div class="duration-container">
                      <v-progress-linear
                        :color="item.color_code"
                        :input="true"
                        height="22"
                        style="width: 340px"
                        :value="
                          (Math.floor(item.total_duration / 3600000) / 24) * 100
                        "
                        class="mb-1"
                      >
                        <template v-slot:default>
                          <span class="duration-text">
                            {{
                              hours_minutes_seconds(
                                Math.floor(item.total_duration / 1000)
                              )
                            }}
                          </span>
                        </template>
                      </v-progress-linear>
                    </div>
                  </div>
                </template>

                <!-- First/Last Swipe Column -->
                <template v-slot:[`item.first_swipe`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="grey" class="mr-2"
                      >mdi-calendar-clock</v-icon
                    > -->
                    <div>
                      <div class="caption font-weight-medium">
                        {{ get_date(item.first_swipe) }}
                      </div>
                      <div class="caption text-medium-emphasis">
                        {{ get_date(item.last_swipe) }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Location Column -->
                <template v-slot:[`item.last_swiped_location`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3"
                    >mdi-map-marker</v-icon
                  > -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.last_swiped_location || "Unknown Location" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Swipes Count Column -->
                <template v-slot:[`item.total_swipes`]="{ item }">
                  <div class="d-flex align-center justify-center">
                    <v-btn
                      variant="text"
                      color="primary"
                      size="small"
                      @click="get_location(item)"
                      class="cursor-pointer"
                    >
                      <v-icon size="18" class="mr-1">mdi-counter</v-icon>
                      <span class="font-weight-medium">{{
                        item.total_swipes
                      }}</span>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalItems} present reports`
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

    <v-card falt class="overflow-y-auto mt-10" v-if="cardComponent == 2">
      <v-card-text>
        <v-data-table
                :headers="lateComersHeader"
                :items="lateComersData"
                :loading="tableLoading2"
                :sort-by="['user_name']"
                :items-per-page="itemsPerPage"
                hide-default-footer
                class="modern-data-table"
                density="compact"
                hover
                :fixed-header="true"
                :height="windowHeight"
              >
              </v-data-table>
        </v-card-text>
      </v-card>

    <div v-if="componentCheck == 1">
      <PresentreportGeo
        :viewSwipeLocation="viewSwipeLocation"
        :rowInfo="rowInfo"
        @clicked="viewSwipeLocation = false"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { formatTime } from "@/JsonFiles/DateFormate.js";
import moment from "moment";
// import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { daily_present_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import PresentreportGeo from "../PopUps/PresentreportGeo.vue";
import { get_location_details } from "@/mixins/GetLocations.js";
import { all_users_of_organization } from "@/graphql/queries.js";
export default {
  components: {
    SnackBar,
    PresentreportGeo,
  },
  mixins: [get_location_details],
  // get_all_org_users
  data() {
    return {
      componentCheck: 0,
      searchF: null,
      userselect: "",
      rowInfo: {},
      viewSwipeLocation: false,
      SnackBarComponent: {},
      searchQuery: "",
      sortBy: [{ key: "user_name", order: "asc" }],
      pagination: {
        pageStart: 1,
        page: 1,
        rowsPerPage: 20,
        itemsPerPage: 20,
      },
      headers: [
        {
          title: "Member Name/ID",
          value: "user_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Duration(0-24hrs)",
          value: "total_duration",
          sortable: true,
          align: "start",
        },
        {
          title: "First/Last Swipe",
          value: "first_swipe",
          sortable: true,
          align: "start",
        },
        {
          title: "Location",
          value: "last_swiped_location",
          sortable: true,
          align: "start",
        },
        {
          title: "#Swipes",
          value: "total_swipes",
          sortable: true,
          align: "center",
        },
      ],
      lateComersHeader: [
         {
          title: "Member Name/ID",
          value: "user_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Duration(0-24hrs)",
          value: "total_duration",
          sortable: true,
          align: "start",
        },
        {
          title: "First/Last Swipe",
          value: "first_swipe",
          sortable: true,
          align: "start",
        },
        {
          title: "Location",
          value: "last_swiped_location",
          sortable: true,
          align: "start",
        },
        {
          title: "#Swipes",
          value: "total_swipes",
          sortable: true,
          align: "center",
        },
      ],
      lateComersData: [],
      height: 0,
      selectedDate: "",
      minmonth: "",
      fixed: true,
      endmodal: false,
      tableData: [],
      userArray: [],
      tableLoading: false,
      nextToken: null,
      loaction: "ALL",
      loactionitems: [],
      orgUsers: [],
      goLoading: false,
      computedDateFormatted: this.formatDate(new Date()),
      datePicker: false,
      tempDate: null,
      date: null,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,
      showFilterDrawer: false,
      cardComponent: 1,
    };
  },
  async created() {
    this.windowHeight = window.innerHeight - 250;
    this.selectedDate = this.get_orgdate(
      this.$store.getters.GetUserObj.organization.organization_created_on
    );
    this.minmonth = moment(this.selectedDate, "MM/DD/YYYY").format(
      "YYYY-MM-DD"
    );
    this.$store.commit("Setnamesearch", this.searchF);

    await this.get_submitted_workflow();
    await this.get_all_org_users();
    await this.get_location_details();
    await this.fetch_details();
    this.totalItems = this.tableData.length;
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

      // Count location filter
      if (this.loaction && this.loaction !== "ALL") {
        count++;
      }

      // Count user search
      if (this.userselect && this.userselect !== "") {
        count++;
      }

      return count;
    },
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.paginatedItems;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.paginatedItems.filter(
        (item) =>
          (item.user_name &&
            item.user_name.toLowerCase().includes(searchTerm)) ||
          (item.member_id &&
            item.member_id.toLowerCase().includes(searchTerm)) ||
          (item.last_swiped_location &&
            item.last_swiped_location.toLowerCase().includes(searchTerm)) ||
          (item.total_swipes &&
            item.total_swipes.toString().includes(searchTerm))
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

      return sortedItems;
    },
  },
  watch: {
    currentPage(newVal, oldVal) {
      // When the page changes, check if we need to load more data
      if (newVal > oldVal && this.nextToken) {
        // User is going to next page and we have more data to load
        this.get_submitted_workflow();
      } else {
        // Just scroll to top of table for same page or going back
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  },
  // watch: {
  //   searchF() {
  //     if (this.searchF != "" || this.searchF != null) {
  //       if (this.searchF.length >= 3) {
  //         this.get_all_org_users();
  //       }
  //     } else {
  //       this.get_all_org_users();
  //     }
  //   },

  // },
  methods: {
    back_action() {
      this.$store.commit("SetattendenceBack", true);
      this.$router.push("/home/UserLevel");
    },
    ChangeCard() {
      // Toggle cardComponent
      this.cardComponent = this.cardComponent === 1 ? 2 : 1;

      // Call the corresponding function based on the active card
      if (this.cardComponent === 2) {
        // this.getInvited_List();
      } else if (this.cardComponent === 1) {
         this.get_submitted_workflow();
     this.get_all_org_users();
     this.get_location_details();
     this.fetch_details();
      }
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
    handlePagination_check1() {
      if (this.nextToken) {
        this.get_submitted_workflow();
      }
    },
    openFilterDrawer() {
      this.showFilterDrawer = true;
    },
    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },
    clear_data() {
      this.loaction = "ALL";
      this.userselect = "";
      this.computedDateFormatted = this.formatDate(new Date());
      // Reset data and pagination state for filters
      this.nextToken = null;
      this.tableData = [];
      this.currentPage = 1;
      this.get_submitted_workflow();
    },
    applyFilterFromDrawer() {
      // Reset data and pagination state for filters
      this.nextToken = null;
      this.tableData = [];
      this.currentPage = 1;
      this.get_submitted_workflow();
      this.showFilterDrawer = false;
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.updatePageItems();
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "user_name" ||
        key === "member_id" ||
        key === "last_swiped_location"
      ) {
        return value.toLowerCase();
      }
      if (key === "total_duration" || key === "total_swipes") {
        return parseFloat(value) || 0;
      }
      if (key === "first_swipe") {
        return new Date(value).getTime();
      }
      return value;
    },
    go_action() {
      this.nextToken = null;
      this.tableData = [];
      this.currentPage = 1;
      this.goLoading = true;
      this.get_submitted_workflow();
    },
    get_location(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.viewSwipeLocation = true;
    },
    hours_minutes_seconds(seconds) {
      var h = Math.floor(seconds / (60 * 60));
      var divisor_for_minutes = seconds % (60 * 60);
      var m = Math.floor(divisor_for_minutes / 60);
      var divisor_for_seconds = divisor_for_minutes % 60;
      var s = Math.ceil(divisor_for_seconds);
      return `${h ? `${h}h ` : ""}${m ? `${m}m ${s}s` : `${s}s`}`;
    },
    get_date(date) {
      return formatTime(date / 1000);
    },
    gettimecal() {
      this.endmodal = true;
    },
    async get_submitted_workflow() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(daily_present_reports, {
            input: {
              organization_id: data.organization.organization_id,
              swipe_date: this.computedDateFormatted,
              user_id: this.userselect == "" ? "ALL" : this.userselect,
              limit: 21,
              nextToken: this.nextToken,
              location_id: this.loaction,
            },
          })
        );
        this.tableLoading = false;
        this.goLoading = false;
        var response = result.data.daily_present_reports;
        this.nextToken = response.nextToken;

        if (response.Status == "SUCCESS") {
          let array = this.tableData.concat(response.data);
          this.tableData = array;
          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.user_id === obj.user_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.totalItems = this.tableData.length;
          this.goLoading = false;
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
    async get_all_org_users() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(all_users_of_organization, {
            input: {
              organization_id: data.organization.organization_id,
              name_search: this.searchF,
            },
          })
        );
        this.orgUsers = [];

        var response = JSON.parse(result.data.all_users_of_organization);
        this.orgUsers = response.data == undefined ? [] : response.data;

        this.userArray = [];

        this.orgUsers.forEach((element) => {
          if (
            element.user_status == "ACTIVE" &&
            element.user_type != "CHATBOT"
          ) {
            this.userArray.push({
              title: element.full_user_name,
              user_id: element.user_id,
            });
          }
        });
      } catch (error) {
        // Error handling for user fetch
      }
    },
    fetch_details() {
      this.locationList.forEach((element) => {
        this.loactionitems.push({
          title: element.location_name,
          location_id: element.location_id,
        });
      });
      this.loactionitems.unshift({
        title: "All",
        location_id: "ALL",
      });
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

.duration-container {
  width: 100%;
}

.duration-text {
  font-size: 12px;
  font-weight: 500;
  color: black;
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