<template>
  <div>
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-clock</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Scan Logs</span>
          <span class="header-subtitle">Review and manage scan logs</span>
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
              <!-- From Date Filter -->
              <div class="filter-group">
                <label class="filter-label">From Date</label>
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

              <!-- To Date Filter -->
              <div class="filter-group">
                <label class="filter-label">To Date</label>
                <v-text-field
                  v-model="dataDisplayFormatted"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="datePickerTo = true"
                  class="filter-select"
                />
                <v-dialog v-model="datePickerTo" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempDateTo"
                      :max="new Date().toISOString().substr(0, 10)"
                      :min="computedDateFormatted"
                      color="#DB4C77"
                      class="primaryColor"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        text
                        color="primaryColor"
                        @click="datePickerTo = false"
                        >Cancel</v-btn
                      >
                      <v-btn text color="primaryColor" @click="saveDateTo"
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
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="headers"
                :items="paginatedItems"
                :loading="tableLoading"
                :sort-by="['swiped_time']"
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
                      >mdi-account-clock-outline</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">
                      No Swipe Records Found
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
                      Loading swipe records...
                    </div>
                  </div>
                </template>

                <!-- Source Column -->
                <template v-slot:[`item.swipe_source`]="{ item }">
                  <div class="d-flex align-center">
                    <v-tooltip location="top">
                      <template #activator="{ props }">
                        <v-icon
                          v-bind="props"
                          size="20"
                          :color="
                            item.swipe_source == 'DATACORRECTION'
                              ? '#757575'
                              : item.swipe_source == 'PROXY'
                              ? '#757575'
                              : item.swipe_source == 'FACE'
                              ? '#757575'
                              : item.swipe_source == 'KIOSK'
                              ? '#757575'
                              : item.swipe_source == 'QR'
                              ? '#757575'
                              : item.swipe_source == 'RFID'
                              ? '#757575'
                              : item.swipe_source == 'WHATSAPP'
                              ? '#757575'
                              : '#757575'
                          "
                          class="mr-3"
                        >
                          {{
                            item.swipe_source == "DATACORRECTION"
                              ? "mdi-human-edit"
                              : item.swipe_source == "PROXY"
                              ? "mdi-odnoklassniki"
                              : item.swipe_source == "FACE"
                              ? "mdi-face-recognition"
                              : item.swipe_source == "KIOSK"
                              ? "mdi--alpha-k-circle-outline"
                              : item.swipe_source == "QR"
                              ? "mdi-qrcode-scan"
                              : item.swipe_source == "RFID"
                              ? "mdi-credit-card-scan"
                              : item.swipe_source == "WHATSAPP"
                              ? "mdi-whatsapp"
                              : "mdi-help-circle"
                          }}
                        </v-icon>
                      </template>
                      {{
                        item.swipe_source == "DATACORRECTION"
                          ? "Data Correction"
                          : item.swipe_source == "PROXY"
                          ? "Proxy"
                          : item.swipe_source == "FACE"
                          ? "Face Recognition"
                          : item.swipe_source == "KIOSK"
                          ? "Kiosk"
                          : item.swipe_source == "QR"
                          ? "QR Scan"
                          : item.swipe_source == "RFID"
                          ? "RFID"
                          : item.swipe_source == "WHATSAPP"
                          ? "WhatsApp"
                          : item.swipe_source || "N/A"
                      }}
                    </v-tooltip>
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{
                          item.swipe_source == "DATACORRECTION"
                            ? "Data Correction"
                            : item.swipe_source == "PROXY"
                            ? "Proxy"
                            : item.swipe_source == "FACE"
                            ? "Face Recognition"
                            : item.swipe_source == "KIOSK"
                            ? "Kiosk"
                            : item.swipe_source == "QR"
                            ? "QR Scan"
                            : item.swipe_source == "RFID"
                            ? "RFID"
                            : item.swipe_source == "WHATSAPP"
                            ? "WhatsApp"
                            : item.swipe_source || "N/A"
                        }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Member ID Column -->
                <template v-slot:[`item.member_id`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3"
                      >mdi-identifier</v-icon
                    > -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.member_id || "N/A" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Location Name Column -->
                <template v-slot:[`item.location_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3"
                      >mdi-map-marker</v-icon
                    > -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.location_name || "Unknown Location" }}
                      </div>
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
                        {{
                          (item.user_name || "U").substring(0, 1).toUpperCase()
                        }}
                      </span>
                    </v-avatar> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.user_name || "N/A" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Swipe Date/Time Column -->
                <template v-slot:[`item.swiped_time`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="grey" class="mr-2"
                      >mdi-clock</v-icon
                    > -->
                    <span class="caption">
                      {{ get_date(item.swiped_time) }}
                    </span>
                  </div>
                </template>

                <!-- Geo Column -->
                <template v-slot:[`item.swipe_lat`]="{ item }">
                  <div class="d-flex align-center justify-center">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="primary"
                      v-if="item.user_id != 'UNAUTHORIZED_USER'"
                      @click="get_location(item)"
                      class="cursor-pointer"
                    >
                      <v-icon size="18">mdi-map-marker-radius</v-icon>
                    </v-btn>
                    <v-icon
                      small
                      class=""
                      color="primary"
                      @click="edit_Rfid(item)"
                      v-else
                      >mdi-pencil</v-icon
                    >
                  </div>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalItems} swipe records`
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

    <div v-if="componentCheck == 1">
      <GeoSwipes
        :viewSwipeLocation="viewSwipeLocation"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="viewSwipeLocation = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <MapRfid
        :rfidMapping="rfidMapping"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="rfidMapping = false"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import MapRfid from "@/components/PresenceApp/PopUps/MapRfid.vue";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import moment from "moment";
import SnackBar from "@/components/SnackBar.vue";
import GeoSwipes from "@/components/PresenceApp/PopUps/GeoSwipes.vue";
import { list_all_organizations_swipes } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_location_details } from "@/mixins/GetLocations.js";

export default {
  components: {
    GeoSwipes,
    SnackBar,
    MapRfid,
  },
  mixins: [get_location_details],
  data() {
    return {
      search: "",
      searchQuery: "",
      tableLoading: false,
      viewSwipeLocation: false,
      rfidMapping: false,
      modal: false,
      endmodal: false,
      next_token: null,
      selectedDate: "",
      minmonth: "",
      tableData: [],
      componentCheck: 0,
      SnackBarComponent: {},
      rowInfo: {},
      fixed: true,
      sortBy: [{ key: "swiped_time", order: "desc" }],
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      headers: [
        {
          title: "Source",
          value: "swipe_source",
          sortable: true,
          align: "start",
        },
        {
          title: "Member ID",
          value: "member_id",
          sortable: true,
          align: "start",
        },
        {
          title: "Location Name",
          value: "location_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Member Name",
          value: "user_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Swipe Date/Time",
          value: "swiped_time",
          sortable: true,
          align: "start",
        },
        {
          title: "Geo",
          value: "swipe_lat",
          sortable: false,
          align: "center",
        },
      ],
      loaction: "ALL",
      loactionitems: [],
      goLoading: false,
      datePicker: false,
      datePickerTo: false,
      computedDateFormatted: this.formatDate(new Date()),
      dataFormatted: this.formatDate(new Date()),
      tempDate: null,
      tempDateTo: null,
      date: null,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,
      showFilterDrawer: false,
    };
  },
  computed: {
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },
    dataDisplayFormatted() {
      return this.displayFormatDate(this.dataFormatted);
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

      // Count from date filter (if not default)
      if (
        this.computedDateFormatted &&
        this.computedDateFormatted !== this.formatDate(new Date())
      ) {
        count++;
      }

      // Count to date filter (if not default)
      if (
        this.dataFormatted &&
        this.dataFormatted !== this.formatDate(new Date())
      ) {
        count++;
      }

      // Count location filter
      if (this.loaction && this.loaction !== "ALL") {
        count++;
      }

      return count;
    },
  },
  async created() {
    this.windowHeight = window.innerHeight - 250;
    this.selectedDate = this.get_orgdate(
      this.$store.getters.GetUserObj.organization.organization_created_on
    );
    this.minmonth = moment(this.selectedDate, "MM/DD/YYYY").format(
      "YYYY-MM-DD"
    );
    await this.get_location_details();
    await this.get_swipe_logs();

    this.fetch_details();
  },
  watch: {
    currentPage(newVal, oldVal) {
      // When the page changes, check if we need to load more data
      if (newVal > oldVal && this.next_token) {
        // User is going to next page and we have more data to load
        this.get_swipe_logs();
      } else {
        // Just scroll to top of table for same page or going back
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  },
  methods: {
    edit_Rfid(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.rfidMapping = true;
    },
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
    getMinDateForFromDate() {
      // Get the current date
      const now = new Date();
      // Create a date for the 8th of the current month
      const minDate = new Date(now.getFullYear(), now.getMonth(), 8);

      // If current date is before 8th of the month, use 8th of previous month
      if (now.getDate() < 8) {
        minDate.setMonth(minDate.getMonth() - 1);
      }

      return minDate.toISOString().split("T")[0];
    },
    saveDate() {
      this.date = this.tempDate;
      this.computedDateFormatted = this.tempDate
        ? this.formatDate(this.tempDate)
        : "";
      this.datePicker = false;

      // Reset To Date if it's before the new From Date
      if (
        this.dataFormatted &&
        this.computedDateFormatted > this.dataFormatted
      ) {
        this.dataFormatted = this.computedDateFormatted;
        this.tempDateTo = this.tempDate;
      }
    },
    saveDateTo() {
      // Ensure To Date is not before From Date
      if (
        this.computedDateFormatted &&
        this.tempDateTo < this.computedDateFormatted
      ) {
        this.error_info("To Date cannot be before From Date");
        return;
      }

      this.date = this.tempDateTo;
      this.dataFormatted = this.tempDateTo
        ? this.formatDate(this.tempDateTo)
        : "";
      this.datePickerTo = false;
    },
    check_from_date(date) {
      this.$refs.dialog1.save(date);
      this.todate = new Date().toISOString().substr(0, 10);
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
    get_scanlogs_pagination() {
      this.tableData = [];
      this.currentPage = 1;
      this.goLoading = true;
      this.get_swipe_logs();
    },
    getcal() {
      this.modal = true;
    },
    get_swipe_pagination() {
      if (this.next_token) {
        this.get_swipe_logs();
      }
    },
    get_date(date) {
      return formatedatetime(date / 1000);
      // let a = new Date(date).toLocaleTimeString("en-In", {
      //   year: "numeric",
      //   month: "2-digit",
      //   day: "2-digit",
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   second: "2-digit",
      // });
      // return a.toUpperCase();
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.next_token = null;
      this.tableData = [];
      this.rfidMapping = false;
      this.get_swipe_logs();
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
    get_location(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.viewSwipeLocation = true;
    },
    async get_swipe_logs() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_organizations_swipes, {
            input: {
              user_email_id: data.user.user_email_id,
              swipe_source: "QUERY",
              organization_id: data.organization.organization_id,
              from_date: this.computedDateFormatted,
              to_date: this.dataFormatted,
              limit: 100,
              nextToken: this.next_token,
              location_id: this.loaction,
            },
          })
        );
        this.tableLoading = false;
        this.goLoading = false;
        var response = result.data.list_all_organizations_swipes;

        if (response.Status == "ERROR") {
          this.tableLoading = false;
          this.goLoading = false;
        } else {
          this.next_token = result.data.list_all_organizations_swipes.nextToken;

          let array = this.tableData.concat(response.data);

          this.tableData = array;

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.swipe_id === obj.swipe_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.totalItems = this.tableData.length;
        }

        // } else {
        //   this.tableLoading = false;
        // }
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
    openFilterDrawer() {
      this.showFilterDrawer = true;
    },
    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },
    clear_data() {
      this.loaction = "ALL";
      this.computedDateFormatted = this.formatDate(new Date());
      this.dataFormatted = this.formatDate(new Date());
      this.get_scanlogs_pagination();
    },
    applyFilterFromDrawer() {
      this.get_scanlogs_pagination();
      this.showFilterDrawer = false;
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.paginateData();
    },
    getSortValue(value, key) {
      if (typeof value === "object" && key in value) {
        return value[key];
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
      this.loaction = "ALL";
      this.computedDateFormatted = this.formatDate(new Date());
      this.dataFormatted = this.formatDate(new Date());
      this.activeFiltersCount = 0;
      this.showFilterDrawer = false;
      this.get_scanlogs_pagination();
    },
    applyFilterFromDrawer() {
      this.get_scanlogs_pagination();
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
</style>
