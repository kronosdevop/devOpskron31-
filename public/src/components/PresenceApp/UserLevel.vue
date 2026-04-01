<template>
  <CreateExternalTicketDialog
    :DialogCreateExternalTicket="DialogCreateExternalTicket"
    :screenshot-file="ScreenshotFile"
    :org-details="orgDetails"
    @clicked="DialogCreateExternalTicketEmit"
  />
  <div class="presence-container">
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-clock-check</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Attendance</span>
          <span class="header-subtitle"
            >Track your attendance and swipe logs</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon size="30" color="primary">mdi-help-box</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <!-- Search Field - Only show for Scan Logs tab -->

        <!-- Single More Button with Dropdown -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
              class="action-btn menu-btn mr-3"
              v-bind="props"
              size="small"
              v-if="
                toggle_exclusive === 'logscan' 
              "
            >
              <v-icon>mdi-dots-vertical</v-icon>
              <span>Actions</span>
            </v-btn>
          </template>

          <v-list density="compact">
            <!-- Apply Leave - Only show for Scan Logs tab -->
            <v-list-item
              @click="request_leave"
              style="font-size: 12px"
              v-if="toggle_exclusive === 'logscan'"
            >
              <template #prepend>
                <v-icon size="small" color="green">mdi-calendar-plus</v-icon>
              </template>
              <v-list-item-title>Apply Leave</v-list-item-title>
            </v-list-item>

            <!-- Cancel Leave - Only show for Scan Logs tab -->
            <v-list-item
              v-if="
                check == 1 &&
                toggle_exclusive === 'logscan' &&
                leavesArray.length != 0 &&
                toggle_exclusive === 'logscan'
              "
              @click="cancel_leave"
              style="font-size: 12px"
            >
              <template #prepend>
                <v-icon size="small" color="red">mdi-calendar-remove</v-icon>
              </template>
              <v-list-item-title>Cancel Leave</v-list-item-title>
            </v-list-item>

            <!-- Request ESA -->
            <v-list-item
              @click="request_esa"
              style="font-size: 12px"
              v-if="is_early_salary_enabled && toggle_exclusive === 'logscan'"
            >
              <template #prepend>
                <v-icon size="small" color="orange">mdi-cash-fast</v-icon>
              </template>
              <v-list-item-title>Request ESA</v-list-item-title>
            </v-list-item>

            <!-- Scan - Only show for Scan Logs tab -->
            <v-list-item
              v-if="toggle_exclusive === 'logscan'"
              @click="openCamera()"
              style="font-size: 12px"
            >
              <template #prepend>
                <v-icon size="small" color="blue">mdi-account</v-icon>
              </template>
              <v-list-item-title>Scan</v-list-item-title>
            </v-list-item>

            <!-- Month Picker - Only show for Reports tab -->
            
            <!-- Admin Presence -->
            <!-- <v-list-item
              v-if="adminAppExists"
              @click="open_settings()"
              style="font-size: 12px"
            >
              <template #prepend>
                <v-icon size="small" color="grey">mdi-cog</v-icon>
              </template>
              <v-list-item-title>Administrator</v-list-item-title>
            </v-list-item> -->
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Month Picker Dialog -->
    <v-menu
      v-model="monthPicker"
      :close-on-content-click="false"
      persistent
      max-width="350"
      transition="scale-transition"
      scroll-strategy="none"
    >
      <v-card class="monthpicker ml-15">
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="7" class="">
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
                style="max-width: 100px"
                class=""
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
            <v-btn text class="ma-1" density="compact" @click="closedialog()">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              text
              class="ma-1 mr-8"
              density="compact"
              @click="saveSelection"
              v-on:click="get_data(date1)"
            >
              Save
            </v-btn>
          </v-row>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-toolbar flat class="mt-n8" style="background-color: white">
      <template v-slot:extension>
        <v-tabs v-model="toggle_exclusive" mandatory class="modern-tab-toggle">
          <v-tab value="logscan" class="tab-btn"> Scan Logs </v-tab>
          <v-tab value="reportuser" class="tab-btn"> My Reports </v-tab>
          <v-tab
            value="leavesummary"
            class="tab-btn"
            v-if="
              $store.getters.GetUserObj.organization &&
              $store.getters.GetUserObj.organization.organization_id ==
                '4a15f402-3e19-4d9b-83a5-429715785f72'
            "
          >
            Leave Summary
          </v-tab>
          <v-tab value="adminstration" class="tab-btn" v-if="adminAppExists">
            Administration
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <div class="text-left" v-if="toggle_exclusive === 'logscan'">
      <v-card flat class="overflow-y-auto">
        <div>
          <SnackBar :SnackBarComponent="SnackBarComponent" />

          <div class="card-container" style="position: relative">
            <v-card class="" flat>
              <v-card-text class="pa-4">
                <v-row no-gutters>
                  <!-- Table Column -->
                  <v-col cols="8">
                    <v-data-table
                      :headers="headers"
                      :items="sortedAndPaginatedItems"
                      :loading="tableLoading"
                      :items-per-page="200"
                      :page="currentPage"
                      :server-items-length="totalItems"
                      hide-default-footer
                      class="modern-data-table"
                      density="comfortable"
                      hover
                      multi-sort
                      fixed-header
                      :height="tableHeight"
                      @update:sort-by="handleSortChange"
                    >
                      <template v-slot:no-data>
                        <div class="text-center py-8">
                          <v-icon size="64" color="grey-lighten-1" class="mb-4"
                            >mdi-clock-outline</v-icon
                          >
                          <div class="text-h6 text-grey mb-2">
                            No Swipe Logs Found
                          </div>
                          <div class="text-body-2 text-grey">
                            No swipe records available for the selected period.
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
                            Loading swipe logs...
                          </div>
                        </div>
                      </template>

                      <!-- Source -->
                      <template v-slot:[`item.swipe_source`]="{ item }">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ props }">
                            <div class="d-flex align-center" v-bind="props">
                              <v-icon
                                :color="
                                  item.swipe_source == 'DATACORRECTION'
                                    ? '#757575'
                                    : item.swipe_source == 'PROXY'
                                    ? '#757575'
                                    : item.swipe_source == 'FACE'
                                    ? '#757575'
                                    : item.swipe_source == 'KIOSK'
                                    ? '#757575'
                                    : item.swipe_source == 'RFID'
                                    ? '#757575'
                                    : item.swipe_source == 'QR'
                                    ? '#757575'
                                    : item.swipe_source == 'WHATSAPP'
                                    ? '#757575'
                                    : ''
                                "
                                size="20"
                                class="mr-2"
                              >
                                {{
                                  item.swipe_source == "DATACORRECTION"
                                    ? "mdi-human-edit"
                                    : item.swipe_source == "PROXY"
                                    ? "mdi-odnoklassniki"
                                    : item.swipe_source == "FACE"
                                    ? "mdi-face-recognition"
                                    : item.swipe_source == "KIOSK"
                                    ? "mdi-alpha-k-circle-outline"
                                    : item.swipe_source == "RFID"
                                    ? "mdi-card-account-details"
                                    : item.swipe_source == "QR"
                                    ? "mdi-qrcode"
                                    : item.swipe_source == "WHATSAPP"
                                    ? "mdi-whatsapp"
                                    : ""
                                }}
                              </v-icon>
                              <span class="caption font-weight-medium">
                                {{
                                  item.swipe_source == "DATACORRECTION"
                                    ? "Data Correction"
                                    : item.swipe_source == "PROXY"
                                    ? "Proxy"
                                    : item.swipe_source == "FACE"
                                    ? "Face Recognition"
                                    : item.swipe_source == "KIOSK"
                                    ? "Kiosk"
                                    : item.swipe_source == "RFID"
                                    ? "Source: RFID"
                                    : item.swipe_source == "QR"
                                    ? "Source: QR"
                                    : item.swipe_source == "WHATSAPP"
                                    ? "Source: WhatsApp"
                                    : ""
                                }}
                              </span>
                            </div>
                          </template>
                          <div style="max-width: 300px">
                            <div class="font-weight-medium mb-1">
                              Scan Source
                            </div>
                            <div>
                              {{
                                item.swipe_source == "DATACORRECTION"
                                  ? "Source: Data Correction"
                                  : item.swipe_source == "PROXY"
                                  ? item.proxy_message || "Source: Proxy"
                                  : item.swipe_source == "FACE"
                                  ? "Source: FACE"
                                  : item.swipe_source == "KIOSK"
                                  ? "Source: KIOSK"
                                  : item.swipe_source == "WHATSAPP"
                                  ? "Source: WhatsApp"
                                  : "Source: " + item.swipe_source
                              }}
                            </div>
                          </div>
                        </v-tooltip>
                      </template>

                      <!-- Location Name -->
                      <template v-slot:[`item.location_name`]="{ item }">
                        <div class="d-flex align-center">
                          <!-- <v-icon size="16" color="grey" class="mr-2"
                            >mdi-map-marker</v-icon
                          > -->
                          <span class="caption font-weight-medium">
                            {{ item.location_name || "N/A" }}
                          </span>
                        </div>
                      </template>

                      <!-- Swipe Date -->
                      <template v-slot:[`item.swipe_date`]="{ item }">
                        <div class="d-flex align-center">
                          <!-- <v-icon size="16" color="grey" class="mr-2"
                              >mdi-calendar</v-icon
                            > -->
                          <span class="caption font-weight-medium">
                            {{ item.swipe_date }}
                          </span>
                        </div>
                      </template>

                      <!-- Swipe Time -->
                      <template v-slot:[`item.swiped_time`]="{ item }">
                        <div class="d-flex align-center">
                          <!-- <v-icon size="16" color="grey" class="mr-2"
                            >mdi-clock</v-icon
                          > -->
                          <span class="caption font-weight-medium">
                            {{ fetch_time(item.swiped_time) }}
                          </span>
                        </div>
                      </template>

                      <!-- Geo Location -->
                      <template v-slot:[`item.swipe_lat`]="{ item }">
                        <div class="d-flex align-center justify-center">
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            color="primary"
                            @click="get_location(item)"
                            class="cursor-pointer"
                          >
                            <v-icon size="18">mdi-map-marker</v-icon>
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
                            : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} swipe logs`
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
                            :variant="
                              page === currentPage ? 'elevated' : 'text'
                            "
                            size="small"
                            :class="
                              page === currentPage
                                ? 'active-page'
                                : 'inactive-page'
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
                  </v-col>

                  <!-- Calendar Column -->
                  <v-col v-if="check == 1" cols="4" class="pl-4">
                    <v-card flat class="calendar-container">
                      <v-card-text class="pa-2 mt-n4">
                        <v-row class="justify-center">
                          <v-col cols="12" class="my-1 px-1">
                            <v-date-picker
                              v-model="alldays"
                              width="100%"
                              @update:picker-date="updatePickedMonth"
                              color="#DB4C77"
                              :events="eventsFunction"
                              style="min-height: 380px; height: auto"
                              :event-color="eventColorFunction"
                            ></v-date-picker>
                          </v-col>

                          <!-- Attendance Summary Cards -->
                          <v-col cols="12" class="mt-2">
                            <v-row no-gutters class="justify-space-between">
                              <v-card flat class="summary-card" outlined>
                                <v-row no-gutters class="align-center pa-1">
                                  <v-col cols="auto">
                                    <v-avatar
                                      color="green"
                                      size="10"
                                      class="mr-1"
                                    ></v-avatar>
                                  </v-col>
                                  <v-col>
                                    <span class="text-caption">Present</span>
                                  </v-col>
                                  <v-col cols="auto">
                                    <span
                                      class="text-caption font-weight-bold"
                                      >{{ presentDays }}</span
                                    >
                                  </v-col>
                                </v-row>
                              </v-card>

                              <v-card flat class="summary-card" outlined>
                                <v-row no-gutters class="align-center pa-1">
                                  <v-col cols="auto">
                                    <v-avatar
                                      color="red"
                                      size="10"
                                      class="mr-1"
                                    ></v-avatar>
                                  </v-col>
                                  <v-col>
                                    <span class="text-caption">Absent</span>
                                  </v-col>
                                  <v-col cols="auto">
                                    <span
                                      class="text-caption font-weight-bold"
                                      >{{ absentDays }}</span
                                    >
                                  </v-col>
                                </v-row>
                              </v-card>
                            </v-row>
                          </v-col>

                          <v-col cols="12" class="mt-1">
                            <v-row no-gutters class="justify-space-between">
                              <v-card flat class="summary-card" outlined>
                                <v-row no-gutters class="align-center pa-1">
                                  <v-col cols="auto">
                                    <v-avatar
                                      color="orange"
                                      size="10"
                                      class="mr-1"
                                    ></v-avatar>
                                  </v-col>
                                  <v-col>
                                    <span class="text-caption">Holiday</span>
                                  </v-col>
                                  <v-col cols="auto">
                                    <span
                                      class="text-caption font-weight-bold"
                                      >{{ holidaysDays }}</span
                                    >
                                  </v-col>
                                </v-row>
                              </v-card>

                              <v-card flat class="summary-card" outlined>
                                <v-row no-gutters class="align-center pa-1">
                                  <v-col cols="auto">
                                    <v-avatar
                                      color="primary"
                                      size="10"
                                      class="mr-1"
                                    ></v-avatar>
                                  </v-col>
                                  <v-col>
                                    <span class="text-caption">Leaves</span>
                                  </v-col>
                                  <v-col cols="auto">
                                    <span
                                      class="text-caption font-weight-bold"
                                      >{{ leaveDays }}</span
                                    >
                                  </v-col>
                                </v-row>
                              </v-card>
                            </v-row>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card>
    </div>

    <div class="text-left" v-if="toggle_exclusive === 'reportuser'">
      <UserReports :key="monthpick" :monthvalue="monthvalue"   @open-month-picker="monthPicker = true" />
    </div>

    <div class="text-left" v-if="toggle_exclusive === 'leavesummary'">
      <LeaveSummary />
    </div>
    <div class="text-left" v-if="toggle_exclusive === 'adminstration'">
      <AppAdminprezence />
    </div>

    <div v-if="componentCheck == 1">
      <UserSwipeLoc
        :viewSwipeLocation="viewSwipeLocation"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="viewSwipeLocation = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <LeaveRequest
        :leaveRequestDialog="leaveRequestDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="leaveRequestDialog = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <EarlyAccessRequest
        :requestDialog="requestDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="requestDialog = false"
      />
    </div>
    <div v-if="componentCheck == 4">
      <UserScan
        :scanLog="scanLog"
        @clicked="scanLog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 5">
      <CancelLeave
        :leaveCancelation="leaveCancelation"
        :leavesArray="leavesArray"
        @clicked="leaveCancelation = false"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import AppAdminprezence from "@/components/PresenceApp/AppAdminprezence.vue";
import UserReports from "@/components/PresenceApp/UserReports.vue";
import LeaveRequest from "@/components/PresenceApp/PopUps/LeaveRequest.vue";
import EarlyAccessRequest from "@/components/PresenceApp/PopUps/EarlyAccessRequest.vue";
import UserScan from "@/components/PresenceApp/PopUps/UserScan.vue";
import UserSwipeLoc from "@/components/PresenceApp/PopUps/UserSwipeLoc.vue";
import CancelLeave from "@/components/PresenceApp/PopUps/CancelLeave.vue";
import LeaveSummary from "@/components/PresenceApp/AdminLevelComponents/LeaveSummary.vue";
import SnackBar from "@/components/SnackBar.vue";
import { get_early_salary_settings } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { getData } from "@/mixins/AllQueries.js";

import { list_all_swipes, get_presence_dashboard } from "@/graphql/queries.js";
// import Datepicker from "@vuepic/vue-datepicker";
// import "@vuepic/vue-datepicker/dist/main.css";

import axios from "axios";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    UserSwipeLoc,
    LeaveRequest,
    SnackBar,
    EarlyAccessRequest,
    UserScan,
    UserReports,
    CancelLeave,
    LeaveSummary,
    AppAdminprezence,
    CreateExternalTicketDialog,
  },
  mixins: [getData],
  data() {
    return {
      tableLoading: false,
      windowHeight: 0,
      toggle_exclusive: "logscan",
      tableData: [],
      headers: [
        {
          title: "Source",
          value: "swipe_source",
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
          title: "Swipe Date",
          value: "swipe_date",
          sortable: true,
          align: "start",
        },
        {
          title: "Swipe Time",
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
      arrayEvents: null,
      fixed: true,
      permissionESA: false,
      alldays: new Date(),
      componentCheck: 0,
      monthpick: 0,
      viewSwipeLocation: false,
      is_early_salary_enabled: false,
      rowInfo: {},
      check: 0,
      presentDays: "",
      absentDays: "",
      holidaysDays: "",
      leaveDays: "",
      dateElements: [],
      valueChange: false,
      adminAppExists: false,
      progressBar: false,
      SnackBarComponent: {},
      leaveRequestDialog: false,
      requestDialog: false,
      currentMonthCheck: "",
      queryCheck: false,
      monthPicker: false,
      leaveCancelation: false,
      tempDate: null,
      billdate: "",
      monthvalue: "",
      scanLog: false,
      menu: false,
      itemyears: [],
      yearfilter: new Date().getFullYear(),
      monthfilter: "",
      monthitems: [],
      date1: new Date().toISOString().substr(0, 7),
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
      datedisplay:
        [
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
        ][Number(new Date().toISOString().split("T")[0].split("-")[1]) - 1] +
        " " +
        new Date().toISOString().split("T")[0].split("-")[0],
      datedisplayMonth: "",
      leavesArray: [],
      searchQuery: "",
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: [{ key: "swiped_time", order: "desc" }],
      tableHeight: 0,

      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },
  async created() {
    // console.log(this.$store.getters.GetattendenceBack);
    if (this.$store.getters.GetattendenceBack) {
      this.toggle_exclusive = "adminstration";
    }
    this.windowHeight = window.innerHeight - 60;
    this.tableHeight = window.innerHeight - 250;
    this.tableLoading = true;
    this.monthvalue = this.date1;
    await this.fetch_attendance_list_v2("");
    await this.get_month();
    await this.get_datails();
    await this.fetch_swipes_v2();
    this.updateTotalItems();
  },
  mounted() {
    this.fetch_admin_apps();
    this.populateYearItems();
    this.setInitialFilters();
  },
  watch: {
    yearfilter() {
      this.monthfilter = "";
      this.updateMonthItems(this.yearfilter);
      this.updateDatedisplayMonth();
    },
    monthfilter() {
      this.updateDatedisplayMonth();
    },
    searchQuery() {
      this.currentPage = 1;
      this.updateTotalItems();
    },
    currentPage(newVal) {
      // When the page changes, scroll to top of table (optional)
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  methods: {
    open_settings() {
      this.$router.push("/home/AppAdminprezence");
    },

    handleSearchChange(value) {
      this.searchQuery = value;
      this.currentPage = 1;
      this.updateTotalItems();
    },

    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      // Check if userObj and admin_apps exist
      if (
        !userObj ||
        !userObj.admin_apps ||
        !Array.isArray(userObj.admin_apps)
      ) {
        this.adminAppExists = false;
        return;
      }

      const adminExists = userObj.admin_apps.find(
        (app) => app.dashboard_unique_type === "PREZENCE_ADMINS"
      );
      if (!adminExists || adminExists.is_visible == false) {
        this.adminAppExists = false;
        return;
      }
      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    selectMonth(month) {
      this.monthfilter = month;
    },
    closedialog() {
      this.monthPicker = false;
      this.monthfilter = "";
    },
    saveSelection() {
      this.monthPicker = false;
      this.updateMonthValue();
      this.datedisplay = this.datedisplayMonth;
    },
    populateYearItems() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      if (
        !orgDetails ||
        !orgDetails.organization ||
        !orgDetails.organization.organization_created_on
      ) {
        // Fallback to current year if organization data is not available
        const currentYear = new Date().getFullYear();
        this.itemyears = [currentYear];
        return;
      }

      const organizationTimestamp =
        orgDetails.organization.organization_created_on;
      const organizationYear = new Date(
        organizationTimestamp * 1000
      ).getFullYear();
      const currentYear = new Date().getFullYear();
      this.itemyears = Array.from(
        { length: currentYear - organizationYear + 1 },
        (_, index) => organizationYear + index
      );
    },
    setInitialFilters() {
      const currentYear = new Date().getFullYear();
      this.yearfilter = currentYear;
      this.updateMonthItems(currentYear);
      this.monthfilter = this.monthNames[new Date().getMonth()];
      this.updateDatedisplayMonth();
    },
    updateMonthItems(year) {
      const orgDetails = this.$store.getters.GetOrgDetails;
      if (
        !orgDetails ||
        !orgDetails.organization ||
        !orgDetails.organization.organization_created_on
      ) {
        // Fallback to current year months if organization data is not available
        if (year === new Date().getFullYear()) {
          this.monthitems = this.monthNames.slice(0, new Date().getMonth() + 1);
        } else {
          this.monthitems = [...this.monthNames];
        }
        return;
      }

      const organizationTimestamp =
        orgDetails.organization.organization_created_on;
      const organizationYear = new Date(
        organizationTimestamp * 1000
      ).getFullYear();
      const organizationMonth = new Date(
        organizationTimestamp * 1000
      ).getMonth();
      if (year === organizationYear) {
        this.monthitems = this.monthNames.slice(organizationMonth);
      } else if (year === new Date().getFullYear()) {
        this.monthitems = this.monthNames.slice(0, new Date().getMonth() + 1);
      } else {
        this.monthitems = [...this.monthNames];
      }
    },
    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
      }
    },
    updateMonthValue() {
      const selectedYear = this.yearfilter;
      const selectedMonthName = this.monthfilter;
      const selectedMonthIndex = this.monthNames.indexOf(selectedMonthName);

      if (selectedYear && selectedMonthIndex >= 0) {
        const formattedMonth = (selectedMonthIndex + 1)
          .toString()
          .padStart(2, "0");
        this.date1 = `${selectedYear}-${formattedMonth}`;
        this.updateDatedisplayMonth();
      } else {
        console.warn("Invalid year or month selected");
      }
    },
    isMonthDisabled(index) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      const orgDetails = this.$store.getters.GetOrgDetails;

      if (
        !orgDetails ||
        !orgDetails.organization ||
        !orgDetails.organization.organization_created_on
      ) {
        // If organization data is not available, only disable future months
        if (this.yearfilter === currentYear && index > currentMonth) {
          return true;
        }
        return false;
      }

      const organizationTimestamp =
        orgDetails.organization.organization_created_on;
      const organizationYear = new Date(
        organizationTimestamp * 1000
      ).getFullYear();
      const organizationMonth = new Date(
        organizationTimestamp * 1000
      ).getMonth();

      if (this.yearfilter === organizationYear && index < organizationMonth) {
        return true;
      }
      if (this.yearfilter === currentYear && index > currentMonth) {
        return true;
      }
      return false;
    },

    async fetch_swipes_v2() {
      this.tableLoading = true;
      const variables = {
        input: {
          swipe_date: this.get_current_date(),
          swipe_month: this.get_month(),
        },
      };

      await this.fetchData(list_all_swipes, variables)
        .then(() => {
          var response = JSON.parse(this.queryResponse.data.list_all_swipes);
          this.tableLoading = false;
          if (response.Status == "SUCCESS") {
            this.tableLoading = false;
            this.tableData = [];
            this.tableData = response.data;
            this.updateTotalItems();
          } else {
            this.tableLoading = false;
            this.tableData = [];
            this.updateTotalItems();
          }
        })

        .catch((error) => {
          this.tableLoading = false;
          this.tableData = [];
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: error.errors[0].message,
            timeout: 5000,
            Top: true,
          };
        });
    },
    async get_datails() {
      var data = this.$store.getters.GetUserObj;

      // Check if data and organization exist before proceeding
      if (!data || !data.organization || !data.organization.organization_id) {
        console.warn("User data or organization not available");
        return;
      }

      try {
        await API.graphql(
          graphqlOperation(get_early_salary_settings, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        ).then((res) => {
          this.overlay = false;
          var DataItems = JSON.parse(res.data.get_early_salary_settings).data;

          this.is_early_salary_enabled =
            DataItems.is_earlysalary_enabled == undefined
              ? false
              : DataItems.is_earlysalary_enabled;
        });
      } catch (error) {
        this.overlay = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    get_data(val) {
      this.monthpick++;
      this.monthvalue = val;
    },
    back_call() {
      this.$router.push({ name: "UserlevelApp" });
    },
    openCamera() {
      this.componentCheck = 4;
      this.scanLog = true;
    },
    request_leave() {
      this.componentCheck = 2;
      this.leaveRequestDialog = true;
    },

    request_esa() {
      this.componentCheck = 3;
      this.requestDialog = true;
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.requestDialog = false;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.scanLog = false;
      this.requestDialog = false;
      this.leaveRequestDialog = false;
      this.fetch_swipes_v2();
      this.updateTotalItems();
    },
    async fetch_attendance_list_v2(value) {
      this.progressBar = true;
      this.arrayEvents = [];
      this.dateElements = [];
      this.holidaysDays = "";
      this.absentDays = "";
      this.presentDays = "";
      this.leaveDays = "";
      const variables = {
        input: {
          swipe_date: this.get_current_date(),
          swipe_month: this.valueChange == true ? value : this.get_month(),
        },
      };
      await this.fetchData(get_presence_dashboard, variables)
        .then(() => {
          var response = JSON.parse(
            this.queryResponse.data.get_presence_dashboard
          );
          this.progressBar = false;
          this.check = 1;
          if (response.Status == "SUCCESS") {
            this.dateElements = response.data.all_dates_details;
            var result = response.data.all_dates_details;
            this.leavesArray =
              response.leave_dates != undefined ? response.leave_dates : [];
            this.arrayEvents = result
              .filter(
                (obj) =>
                  obj.attendence_type == "P" ||
                  obj.attendence_type == "H" ||
                  obj.attendence_type == "A" ||
                  obj.attendence_type == "L"
              )
              .map((obj) => obj.date);
            this.presentDays = response.data.total_present_days;
            this.holidaysDays = response.data.total_holidays;
            this.absentDays = response.data.total_absent_days;
            this.leaveDays = response.data.total_leaves;
          } else {
            this.tableData = [];
            this.dateLoading = false;
          }
        })
        .catch((error) => {
          this.progressBar = false;
          this.tableLoading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: error.errors[0].message,
            timeout: 5000,
            Top: true,
          };
        });
    },
    async updatePickedMonth(val) {
      this.queryCheck = false;
      if (val == this.currentMonthCheck) {
        this.queryCheck = true;
      }
      this.valueChange = true;

      await this.fetch_attendance_list_v2(val);
    },
    get_current_date() {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = String(currentDate.getFullYear());

      const formattedDate = `${day}-${month}-${year}`;
      return formattedDate;
    },
    get_month() {
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = String(currentDate.getFullYear());
      const currentMonth = `${year}-${month}`;
      this.currentMonthCheck = currentMonth;
      return currentMonth;
    },
    fetch_time(val) {
      const date = new Date(val);
      const localTime = date.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return localTime;
    },
    get_location(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.viewSwipeLocation = true;
    },
    cancel_leave() {
      this.componentCheck = 5;
      this.leaveCancelation = true;
    },
    updateTotalItems() {
      this.totalItems = this.filteredItems.length;
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (key === "swipe_source" || key === "location_name") {
        return value.toLowerCase();
      }
      if (key === "swiped_time") {
        return new Date(value).getTime();
      }
      return value;
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },
    handleMenuAction() {
      // This method is called when the "Download Report" option is clicked
      // You can add your download logic here
      // console.log("Download Report clicked!");
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: "Download Report functionality not yet implemented.",
        timeout: 5000,
        Top: true,
      };
    },
    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter(
        (item) =>
          (item.swipe_source &&
            item.swipe_source.toLowerCase().includes(searchTerm)) ||
          (item.location_name &&
            item.location_name.toLowerCase().includes(searchTerm)) ||
          (item.swiped_time &&
            this.fetch_time(item.swiped_time)
              .toLowerCase()
              .includes(searchTerm))
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

      // Then paginate
      const start = (this.currentPage - 1) * 200; // Use 200 instead of this.itemsPerPage
      const end = start + 200; // Use 200 instead of this.itemsPerPage
      return sortedItems.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.totalItems / 200); // Use 200 instead of this.itemsPerPage
    },
    visiblePages() {
      const pages = [];
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.pageCount, this.currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (endPage < this.pageCount) {
        if (endPage < this.pageCount - 1) {
          pages.push("...");
        }
        pages.push(this.pageCount);
      }
      return pages;
    },
    // Function-based events for date picker
    eventsFunction() {
      return (date) => {
        if (!this.dateElements || this.dateElements.length === 0) {
          return false;
        }
        const dateToCheck = new Date(date);
        const dateString = dateToCheck.toISOString().split("T")[0];
        const event = this.dateElements.find((obj) => {
          const eventDate = new Date(obj.date);
          const eventDateString = eventDate.toISOString().split("T")[0];
          return eventDateString === dateString;
        });
        const hasEvent = event ? true : false;
        if (hasEvent) {
          // console.log('Event found for date:', dateString, 'Type:', event.attendence_type);
        }
        return hasEvent;
      };
    },
    // Function-based event colors for date picker
    eventColorFunction() {
      return (date) => {
        if (!this.dateElements || this.dateElements.length === 0) {
          return null;
        }
        const dateToCheck = new Date(date);
        const dateString = dateToCheck.toISOString().split("T")[0];
        const event = this.dateElements.find((obj) => {
          const eventDate = new Date(obj.date);
          const eventDateString = eventDate.toISOString().split("T")[0];
          return eventDateString === dateString;
        });
        if (event) {
          switch (event.attendence_type) {
            case "P":
              return "green";
            case "A":
              return "red";
            case "L":
              return "primary";
            case "H":
              return "orange";
            default:
              return "gray";
          }
        }
        return null;
      };
    },
  },
};
</script>

<style scoped>
/* Main Container */
.presence-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* App Bar Styles */

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
}

/* Search Container Styles */
.search-container {
  margin-right: 16px;
  min-width: 250px;
}

.search-field {
  width: 100%;
}

/* Action Button Styles */
.action-btn {
  margin-left: 8px;
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.add-btn {
  background: #4caf50 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3) !important;
}

.add-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4) !important;
}

.cancel-btn {
  background: #f44336 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3) !important;
}

.cancel-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4) !important;
}

.request-btn {
  background: #ff9800 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3) !important;
}

.request-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4) !important;
}

.scan-btn {
  background: #2196f3 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3) !important;
}

.scan-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4) !important;
}

.month-btn {
  background: #9c27b0 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3) !important;
}

.month-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.4) !important;
}

.admin-btn {
  background: #607d8b !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(96, 125, 139, 0.3) !important;
}

.admin-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(96, 125, 139, 0.4) !important;
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

/* Card Container */
.card-container {
  position: relative;
}

/* Table Footer Styles */
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

/* Modern Data Table Styles */
.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(219, 76, 119, 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

/* Calendar Container Styles */
.calendar-container {
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: #fafafa;
  overflow: visible;
}

.calendar-container :deep(.v-date-picker) {
  border-radius: 8px;
  height: auto !important;
  min-height: 380px;
}

.calendar-container :deep(.v-date-picker__body) {
  height: auto !important;
  min-height: 310px;
}

.calendar-container :deep(.v-date-picker__header) {
  background: #db4c77;
  color: white;
  border-radius: 8px 8px 0 0;
}

.calendar-container :deep(.v-date-picker__header .v-btn) {
  color: white;
}

/* Summary Cards Styles */
.summary-card {
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: white;
  transition: all 0.2s ease;
  min-width: 100px;
  max-width: 110px;
}

.summary-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}
.monthpicker{
  margin-top: 60%;
  left:55%;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .calendar-container {
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .summary-card {
    min-width: 100px;
  }
}
</style>
