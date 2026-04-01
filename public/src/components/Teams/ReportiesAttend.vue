<template>
  <div class="main-container" style="background-color: white">
    <v-app-bar class="modern-header-section mt-n2">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-group</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">My Team</span>
          <span class="header-subtitle">Manage your team members</span>
        </div>
      </div>
      <v-spacer />

      <v-btn class="action-btn back-btn mr-4" @click="goBackToReporties()">
        <v-icon>mdi-arrow-left</v-icon>
        <span>Back</span>
      </v-btn>

      <div class="header-actions"></div>
    </v-app-bar>
  </div>
  <div class="table">
    <!-- eslint-disable -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card flat>
      <v-card-text>
        <v-row>
          <v-col cols="3" class="text-left">
            <v-card flat>
              <h4 class="font-weight-medium ml-2">
                <b>
                  Monthly Report : {{ displaySelectedMonth }} ({{
                    selectedYear
                  }})
                </b>
                <v-icon
                  icon
                  size="small"
                  class="ml-2"
                  color="primary"
                  @click="openMonthPicker"
                  >mdi-pencil</v-icon
                >
              </h4>
            </v-card>
            <!-- Month Picker Dialog -->
            <v-menu
              v-model="monthPicker"
              :close-on-content-click="false"
              persistent
              max-width="350"
              class="dialog"
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
                        style="width: 100px"
                        class="year"
                      ></v-select>
                    </v-col>
                  </v-row>

                  <v-row class="ml-n2" dense>
                    <v-col
                      v-for="(month, index) in monthitems"
                      :key="index"
                      cols="4"
                      class="d-flex justify-center"
                    >
                      <v-btn
                        class="ma-1"
                        :class="{ 'active-btn': month === monthfilter }"
                        density="compact"
                        :disabled="isMonthDisabled(index)"
                        @click="selectMonth(month, index)"
                      >
                        {{ month }}
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-row class="mt-4 justify-end">
                    <v-btn
                      text
                      class="ma-1"
                      density="compact"
                      @click="closedialog()"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      color="primary"
                      text
                      class="ma-1 mr-8"
                      density="compact"
                      @click="saveSelection"
                      v-on:click="get_data(monthvalue)"
                    >
                      Save
                    </v-btn>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-menu>

            <v-card class="pt-4 pl-5 mt-2" :height="cardheight">
              <div class="mt-2">
                <b>Member Name : </b
                >{{
                  tableData.full_user_name == undefined
                    ? "N/A"
                    : tableData.full_user_name
                }}
              </div>
              <div class="mt-2">
                <b>Average Duration : </b
                >{{
                  tableData.average_monthly_worked_durations == undefined
                    ? "N/A"
                    : tableData.average_monthly_worked_durations
                }}
              </div>
              <div class="mt-2">
                <b>Total Duration : </b
                >{{
                  tableData.total_monthly_worked_durations == undefined
                    ? "N/A"
                    : tableData.total_monthly_worked_durations
                }}
              </div>
              <div class="mt-2">
                <b>Present : </b
                >{{
                  tableData.total_present_days == undefined
                    ? "N/A"
                    : tableData.total_present_days
                }}
              </div>
              <div class="mt-2">
                <b>Leave : </b
                >{{
                  tableData.total_leave_days == undefined
                    ? "N/A"
                    : tableData.total_leave_days
                }}
              </div>
              <div class="mt-2">
                <b>Absent : </b
                >{{
                  tableData.total_absent_days == undefined
                    ? "N/A"
                    : tableData.total_absent_days
                }}
              </div>
            </v-card>
          </v-col>
          <v-col cols="9" class="mt-n5">
            <div id="calendar-wrap">
              <div id="calendar">
                <ul class="weekdays">
                  <li v-for="day in currentMonthWeekdays" :key="day">
                    {{ day }}
                  </li>
                </ul>
                <ul class="days">
                  <li
                    v-for="dayInfo in calendarDays"
                    :class="[
                      'day',
                      dayInfo.isWeekend
                        ? 'date-weekoff'
                        : events.find((e) => e.date === dayInfo.newDate)
                            ?.dateClass || 'date-default',
                    ]"
                  >
                    <div class="date">
                      {{ dayInfo.date.getDate() }}
                    </div>
                    <!-- style="get_colors(item)" -->
                    <div class="event-desc text-left">
                      <b> {{ getEventDescription(dayInfo.newDate) }}</b>
                    </div>
                    <div class="event-time text-left">
                      {{ getEventTime(dayInfo.newDate) }}
                    </div>
                    <div class="event-duratin text-left">
                      {{ getEventDuration(dayInfo.newDate) }}
                    </div>
                  </li>
                </ul>
              </div>
              <!-- /. calendar -->
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { monthly_reports } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { parse, format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { reactive } from "vue";
export default {
  components: {
    SnackBar,
  },
  props: {
    monthvalue: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      monthitems: [],
      yearfilter: new Date().getFullYear(),
      monthfilter: "",
      selectedYear: new Date().getFullYear(),

      itemyears: [],
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

      datedisplayMonth: "",
      monthPicker: false,
      cardheight: 0,
      date1:
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
        ][Number(new Date().toISOString().split("T")[0].split("-")[1]) - 1] +
        " " +
        new Date().toISOString().split("T")[0].split("-")[0],
      date: new Date().toISOString().substr(0, 7),
      menu: false,
      tableData: {},
      selectedMonth: "",
      selectedMmonth: "",
      SnackBarComponent: {},
      displaySelectedMonth: "",
      events: [],
      currentMonth: new Date().getMonth(), // Get the current month (0-11)
      currentYear: new Date().getFullYear(),
      weekdays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      dataDisplay: false,
      selectedDates: null,
      displayMonth: "",
    };
  },
  async created() {
    this.$store.commit("SetattendenceBack", false);
    this.cardheight = window.innerHeight - 230;

    // fallback if route prop is late
    const month = this.monthvalue || new Date().toISOString().slice(0, 7);
    this.populateYearItems();
    this.selectedMmonth = month;
    await this.get_data(month);
  },
  computed: {
    currentMonthWeekdays() {
      // console.log(this.selectedMmonth);
      const data = new Date(this.selectedMmonth, 1).getDay();
      // console.log("ffff", data);
      const firstDayOfMonth = new Date(
        this.currentYear,
        this.currentMonth,
        1
      ).getDay();

      const weekdays = this.weekdays
        .slice(firstDayOfMonth)
        .concat(this.weekdays.slice(0, firstDayOfMonth));

      return weekdays;
    },
    calendarDays() {
      const orgDetails = this.$store.getters.GetOrgDetails;

      if (!orgDetails || !orgDetails.organization) {
        return [];
      }

      const timeZone = orgDetails.organization.default_timezone || "UTC";
      const inputYearMonth = this.selectedMmonth;

      const [selectedYear, selectedMonth] = inputYearMonth
        .split("-")
        .map(Number);
      const currentDate = new Date();

      // Construct a date in the selected month with the current date
      const formattedDate = new Date(
        selectedYear,
        selectedMonth - 1,
        currentDate.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes(),
        currentDate.getSeconds()
      );

      // Convert to the zoned time
      const zonedDate = toZonedTime(formattedDate, timeZone);

      const year = zonedDate.getFullYear();
      const month = zonedDate.getMonth();

      // Get the first and last day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      // Convert to zoned time
      const zonedFirstDay = toZonedTime(firstDayOfMonth, timeZone);
      const zonedLastDay = toZonedTime(lastDayOfMonth, timeZone);

      const daysInMonth = [];
      const daysInWeek = 7;

      const firstDayOfWeek = zonedFirstDay.getDay();
      const lastDayOfWeek = zonedLastDay.getDay();

      const daysFromPrevMonth = (firstDayOfWeek + daysInWeek - 1) % daysInWeek;
      const daysFromNextMonth = (daysInWeek - lastDayOfWeek - 1) % daysInWeek;

      const firstDate = new Date(year, month, 1 - daysFromPrevMonth);
      const lastDate = new Date(year, month + 1, daysFromNextMonth);

      for (
        let currentDate = firstDate;
        currentDate <= lastDate;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        const isCurrentMonth = currentDate.getMonth() === month;
        const zonedCurrentDate = toZonedTime(currentDate, timeZone);
        daysInMonth.push({
          date: zonedCurrentDate,
          isCurrentMonth,
          newDate: format(zonedCurrentDate, "M/d/yyyy", { timeZone }),
        });
      }

      return daysInMonth;
    },
  },
  watch: {
    yearfilter(newYear) {
      this.monthfilter = "";
      this.selectedMonthIndex = null;
      this.updateMonthItems(newYear);
    },

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
    searchF() {
      if (this.searchF != null) {
        if (this.searchF.length >= 3) {
          this.get_all_org_users();
        }
      } else {
        this.get_all_org_users();
      }
    },
  },
  methods: {
    goBackToReporties() {
      this.$router.push({
        path: "/home/AdminTeam",
        query: { tab: "reporties_list" },
      });
    },
    selectMonth(month, index) {
      this.monthfilter = month;
      this.selectedMonthIndex = index;
    },

    populateYearItems() {
      const currentYear = new Date().getFullYear();

      // example: show last 3 years + current
      this.itemyears = [currentYear - 2, currentYear - 1, currentYear];

      // ensure default is current year
      this.yearfilter = currentYear;

      this.updateMonthItems(currentYear); // 🔥 important
    },
    saveSelection() {
      this.updateMonthValue(); // sets date1 = YYYY-MM
      this.$emit("update:monthvalue", this.date1);
      this.monthPicker = false;
    },
    openMonthPicker() {
      const now = new Date();

      this.yearfilter = now.getFullYear();
      this.updateMonthItems(this.yearfilter);

      this.selectedMonthIndex = now.getMonth();
      this.monthfilter = this.monthNames[this.selectedMonthIndex];

      this.monthPicker = true;
    },
    get_list() {
      const displaySelected = this.selectedMmonth;
      const [, displayMonth] = displaySelected.split("-");

      const monthNames = [
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
      ];
      const monthName = monthNames[Number(displayMonth) - 1];
      this.displaySelectedMonth = monthName;
      this.displayMonth = new Date().toLocaleString("default", {
        month: "long",
      });

      this.events = [];
      const data = this.tableData.monthReports || [];
      this.events = data
        .filter(
          (obj) =>
            obj.attendence_type == "P" ||
            obj.attendence_type == "H" ||
            obj.attendence_type == "A" ||
            obj.attendence_type == "W/O" ||
            obj.attendence_type == "L"
        )
        .map((obj) => {
          const typeObj = this.get_type(obj.attendence_type);

          return {
            date: this.fetch_date(obj.date),
            new_date: obj.date,
            description: typeObj.label,
            dateClass: typeObj.class,
            time:
              obj.attendence_type === "P"
                ? this.fetch_time(obj.first_swipe, obj.last_swipe)
                : "",
            duartion: obj.attendence_type === "P" ? obj.total_duration : "",
          };
        });
    },

    fetch_date(value) {
      const date = parseISO(value);
      const formattedDate = format(date, "M/d/yyyy");
      return formattedDate;
    },
    async get_data(val) {
      if (val != undefined) {
        this.selectedMmonth = val;
      }
      this.next_token = null;
      this.tableData = {};
      await this.get_userreport();
      await this.get_list();
    },

    async get_userreport() {
      this.tableLoading = true;
      var reporties = this.$store.getters.GetReporties;
      const data = this.$store.getters.GetUserObj;

      try {
        const result = await API.graphql(
          graphqlOperation(monthly_reports, {
            input: {
              user_id: reporties.user_id,
              year: this.selectedMmonth.slice(0, 4),
              month: this.selectedMmonth.substring(5),
              organization_id: data.organization.organization_id,
              limit: 22,
              nextToken: this.next_token,
            },
          })
        );

        const response = JSON.parse(result.data.monthly_reports);
        this.next_token = response.nextToken;

        if (response.Status === "SUCCESS") {
          this.tableData = response.data?.[0] || {};
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            error?.graphQLErrors?.[0]?.message ||
            error?.message ||
            "Something went wrong",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.tableLoading = false;
      }
    },
    get_attendence_type(value) {
      var data = "";
      switch (value) {
        case "H":
          data = "Holiday";
          break;
        case "A":
          data = "Absent";
          break;
        case "W/O":
          data = "Week Off";
          break;
        case "N/A":
          data = "-";
          break;
        case "L":
          data = "Leave";
          break;

        default:
          data = "-";
          break;
      }
      return data;
    },
    getEventDescription(date) {
      const event = this.events.find((event) => event.date == date);
      return event ? event.description : "";
    },

    getEventTime(date) {
      const event = this.events.find((event) => event.date == date);

      return event ? event.time : "";
    },

    getEventDuration(date) {
      const event = this.events.find((event) => event.date == date);
      return event ? event.duartion : "";
    },

    fetch_time(first, last) {
      const d = new Date(first);

      var firstWipeValue = d.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const f = new Date(last);
      var lastSwipeValue = f.toLocaleString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const concatDateTime = firstWipeValue + "-" + lastSwipeValue;
      return concatDateTime;
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },

    get_type(value) {
      switch (value) {
        case "P":
          return { label: "Present", class: "date-present" };

        case "H":
          return { label: "Holiday", class: "date-holiday" };

        case "A":
          return { label: "Absent", class: "date-absent" };

        case "L":
          return { label: "Leave", class: "date-leave" };

        case "W/O":
          return { label: "Week Off", class: "date-weekoff" };

        default:
          return { label: "-", class: "date-default" };
      }
    },
    closedialog() {
      this.monthPicker = false;
      this.monthfilter = "";
    },
    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
      }
    },
    setInitialFilters() {
      const currentYear = new Date().getFullYear();
      this.yearfilter = currentYear;
      this.updateMonthItems(currentYear);
      this.monthfilter = this.monthNames[new Date().getMonth()];
      this.updateDatedisplayMonth();
    },
    updateDatedisplayMonth() {
      if (this.yearfilter && this.monthfilter) {
        this.datedisplayMonth = `${this.monthfilter} ${this.yearfilter}`;
      }
    },
    updateMonthValue() {
      if (this.selectedMonthIndex === undefined) return;

      const monthNumber = String(this.selectedMonthIndex + 1).padStart(2, "0");

      // YYYY-MM
      this.date1 = `${this.yearfilter}-${monthNumber}`;
      this.selectedMmonth = this.date1;

      // ✅ update year shown in UI
      this.selectedYear = this.yearfilter;

      // ✅ update month shown in UI
      this.displaySelectedMonth = [
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
      ][this.selectedMonthIndex];
    },
    updateMonthItems(year) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0-based

      if (year < currentYear) {
        // past year → show all months
        this.monthitems = [...this.monthNames];
      } else if (year === currentYear) {
        // current year → show all months
        this.monthitems = [...this.monthNames];
      } else {
        // future year (ex: 2026) → show all months
        this.monthitems = [...this.monthNames];
      }
    },
    isMonthDisabled(index) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0-based

      // Disable future months ONLY for current year
      if (this.yearfilter === currentYear && index > currentMonth) {
        return true;
      }

      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
header {
  text-align: left;
  margin-top: 12px;
}

#calendar {
  width: 100%;
  margin-top: 20px;
}

#calendar a {
  color: #db4c77;
  text-decoration: none;
}

#calendar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

#calendar li {
  display: block;
  float: left;
  width: 14.342%;
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  margin-right: -1px;
  margin-bottom: -1px;
}

#calendar ul.weekdays {
  height: 40px;
  background: #db4c77;
}

#calendar ul.weekdays li {
  text-align: left;
  text-transform: uppercase;
  line-height: 20px;
  border: none !important;
  padding: 10px 6px;
  color: #fff;

  // font-size: 13px;
}

#calendar .days li {
  height: 95px;
}

#calendar .days li:hover {
  background: #d3d3d3;
}

#calendar .date {
  text-align: center;
  margin-bottom: 5px;
  padding: 4px;
  color: #fff;
  width: 30px;
  border-radius: 50%;
  float: right;
}

#calendar .event {
  clear: both;
  // display: block;
  font-size: 1px;
  border-radius: 4px;
  padding: 5px;
  margin-top: 40px;
  // margin-bottom: 5px;
  line-height: 14px;
  background: #e4f2f2;
  border: 1px solid #b5dbdc;
  color: #009aaf;
  text-decoration: none;
}

#calendar .event-desc {
  // margin: 3px 0 7px 0;
  text-decoration: none;
}

#calendar .other-month {
  background: #f5f5f5;
}

#calendar .event-desc {
  font-size: 12px;
  font-weight: 600;
}

#calendar .event-time {
  font-size: 9px;
  margin-top: 2px;
  color: #777;
}

#calendar .event-duratin {
  font-size: 12px;
  margin-top: 2px;
  color: #3f3f3f;
}

.date-default .date {
  background: black;
}

.date-holiday .date {
  background: #8e44ad;
}

.date-absent .date {
  background: #e74c3c;
}

.date-leave .date {
  background: #5dade2;
}

.date-weekoff .date {
  background: #7f8c8d;
}

.date-default .event-desc {
  color: blue;
}

.date-present .date {
  background: green;
}

.date-present .event-desc {
  color: green;
}

.date-holiday .event-desc {
  color: #8e44ad;
}

.date-absent .event-desc {
  color: #e74c3c;
}

.date-leave .event-desc {
  color: #3498db;
}

.date-weekoff .event-desc {
  color: #7f8c8d;
}

.table {
  margin-top: 3%;
}

.dialog {
  margin-top: 11%;
  margin-left: 12%;
}

.year {
  margin-top: -15%;
  margin-left: 50%;
}

.back {
  margin-left: 95%;
}
</style>
