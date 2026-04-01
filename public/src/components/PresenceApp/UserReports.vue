<template>
  <div>
    <!-- eslint-disable -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat>
      <!-- <v-toolbar flat dense>
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="date1"
              label="Select a Month"
              readonly
              dense
              v-bind="attrs"
              style="max-width: 200px"
              class="mr-3"
              outlined
              v-on="on"
            ></v-text-field>
          </template>
<v-date-picker :max="new Date().toISOString().substr(0, 10)" v-model="date" type="month" no-title
  color="primary white--text" scrollable>
  <v-spacer></v-spacer>
  <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
  <v-btn text color="primary" v-on:click="get_data(date)" @click="$refs.menu.save(date)">
    OK
  </v-btn>
</v-date-picker>
</v-menu>
</v-toolbar> -->
      <v-card-text>
        <v-row>
          <v-col cols="3" class="text-left">
            <v-card flat>
              <h4 class="font-weight-medium ml-2">
                <b>Monthly Report :
                  {{
                    displaySelectedMonth + "(" + monthvalue.slice(0, 4) + ")"
                  }}</b>
                <v-icon icon size="small" class="ml-2" color="primary" @click="openMonthPicker">mdi-pencil</v-icon>


              </h4>

            </v-card>
            <v-card class="pt-4 pl-5 mt-2" :height="cardheight">
              <div class="mt-2">
                <b>Member Name : </b>{{
                  tableData.full_user_name == undefined
                    ? "N/A"
                    : tableData.full_user_name
                }}
              </div>
              <div class="mt-2">
                <b>Average Duration : </b>{{
                  tableData.average_monthly_worked_durations == undefined
                    ? "N/A"
                    : tableData.average_monthly_worked_durations
                }}
              </div>
              <div class="mt-2">
                <b>Total Duration : </b>{{
                  tableData.total_monthly_worked_durations == undefined
                    ? "N/A"
                    : tableData.total_monthly_worked_durations
                }}
              </div>
              <div class="mt-2">
                <b>Present : </b>{{
                  tableData.total_present_days == undefined
                    ? "N/A"
                    : tableData.total_present_days
                }}
              </div>
              <div class="mt-2">
                <b>Leave : </b>{{
                  tableData.total_leave_days == undefined
                    ? "N/A"
                    : tableData.total_leave_days
                }}
              </div>
              <div class="mt-2">
                <b>Absent : </b>{{
                  tableData.total_absent_days == undefined
                    ? "N/A"
                    : tableData.total_absent_days
                }}
              </div>
            </v-card>
          </v-col>
          <v-col cols="9" class="mt-n5">
            <!-- <div class="ma-4"> -->
            <div id="calendar-wrap">
              <!-- <header>
                <h2>
                  {{ displaySelectedMonth + "(" + currentYear + ")" }}
                </h2>
              </header> -->

              <div id="calendar">
                <ul class="weekdays">
                  <li v-for="day in currentMonthWeekdays" :key="day">
                    {{ day }}
                  </li>
                </ul>
                <ul class="days">
                  <li v-for="dayInfo in calendarDays" :class="[
                    'day',
                    dayInfo.isWeekend
                      ? 'date-weekoff'
                      : events.find(e => e.date === dayInfo.newDate)?.dateClass || 'date-default'
                  ]">

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
// const { format } = require("date-fns");

import { reactive } from "vue";
export default {
  components: {
    SnackBar,
  },
  props: {
    monthvalue: String,
  },

  data() {
    return {
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
      tableData: [],
      selectedMmonth: "",
      SnackBarComponent: {},
      displaySelectedMonth: "",
      events: [
        // {
        //   date: new Date("2023-07-10"),
        //   description: "Event 1",
        //   time: "10:00 AM - 12:00 PM",
        // },
        // {
      ],
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
    await this.get_userreport();

    await this.get_list();
  },
  computed: {
    currentMonthWeekdays() {
      this.selectedMmonth = this.monthvalue;
      // console.log(this.selectedMmonth);
      const data = new Date(this.selectedMmonth, 1).getDay();
      // console.log("ffff", data);
      const firstDayOfMonth = new Date(
        this.currentYear,
        this.currentMonth,
        1
      ).getDay();
      // alert(4);

      // Get the day of the week (0-6) for the first day of the month
      const weekdays = this.weekdays
        .slice(firstDayOfMonth)
        .concat(this.weekdays.slice(0, firstDayOfMonth));

      return weekdays;
    },
    calendarDays() {
      const timeZone =
        this.$store.getters.GetOrgDetails.organization.default_timezone; // Replace with the desired time zone
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
      const daysInWeek = 7; // Number of days in a week

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

    // calendarDays() {
    //   const inputYearMonth = this.selectedMmonth;

    //   console.log(this.$store.getters.GetOrgDetails); // The input year and month

    //   const [selectedYear, selectedMonth] = inputYearMonth
    //     .split("-")
    //     .map(Number);

    //   const currentDate = new Date();

    //   const currentDay = currentDate.getDate();

    //   const currentHours = currentDate.getHours();

    //   const currentMinutes = currentDate.getMinutes();
    //   const currentSeconds = currentDate.getSeconds();
    //   const formattedDate = new Date(
    //     selectedYear,
    //     selectedMonth - 1,
    //     currentDay,
    //     currentHours,
    //     currentMinutes,
    //     currentSeconds
    //   );

    //   formattedDate.setMinutes(formattedDate.getMinutes());

    //   const currentMonth = formattedDate;

    //   const year = currentMonth.getFullYear();
    //   const month = currentMonth.getMonth();

    //   const firstDayOfMonth = new Date(year, month, 1);
    //   const lastDayOfMonth = new Date(year, month + 1, 0);
    //   const daysInMonth = [];
    //   const daysInWeek = 7;

    //   const firstDayOfWeek = firstDayOfMonth.getDay();

    //   const lastDayOfWeek = lastDayOfMonth.getDay();

    //   const daysFromPrevMonth = (firstDayOfWeek + daysInWeek - 1) % daysInWeek;

    //   const daysFromNextMonth = (daysInWeek - lastDayOfWeek - 1) % daysInWeek;

    //   const firstDate = new Date(year, month, 1 - daysFromPrevMonth);

    //   const lastDate = new Date(year, month + 1, daysFromNextMonth);

    //   for (
    //     let currentDate = firstDate;
    //     currentDate <= lastDate;
    //     currentDate.setDate(currentDate.getDate() + 1)
    //   ) {
    //     const isCurrentMonth = currentDate.getMonth() === month;

    //     daysInMonth.push({
    //       date: new Date(currentDate),
    //       isCurrentMonth,
    //       newDate: new Date(currentDate).toLocaleDateString("en-us"),
    //     });
    //   }
    //   console.log(daysInMonth);
    //   return daysInMonth;
    // },

    // Define custom event props to style the events
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
    openMonthPicker() {
      this.$emit("open-month-picker");
    },
    get_list() {
      const displaySelected = this.selectedMmonth;
      // console.log(displaySelected);
      const [, displayMonth] = displaySelected.split("-"); // Extract the month part
      // console.log(displayMonth);
      // Convert the month number to a month name
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
      const currentMonth = new Date().toLocaleString("default", {
        displayMonth: "long",
      });
      // const currentMonth1 = new Date(
      //   Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth())
      // ).toLocaleString("default", {
      //   month: "long",
      // });
      // console.log("currentMonth", currentMonth, currentMonth1);
      this.currentMonth = currentMonth;
      // console.log(this.currentMonth);
      this.events = [];
      var data = this.tableData.monthReports;
      // console.log(data, "data");

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
            duartion:
              obj.attendence_type === "P" ? obj.total_duration : "",
          };
        });
      // console.log(this.events, " this.events");
    },

    fetch_date(value) {
      const date = parseISO(value);
      const formattedDate = format(date, "M/d/yyyy");
      return formattedDate;
      // const formattedDate = format(value, "M/d/yyyy");
      // console.log(value,formattedDate);
      // return formattedDate;
      // const dateStr = value;

      // // Split the date string into its components
      // const [year, month, day] = dateStr.split("-");

      // // Remove leading zeros from month and day
      // const formattedMonth = parseInt(month, 10); // Convert month to number
      // const formattedDay = parseInt(day, 10); // Convert day to number

      // // Reassemble the date in the desired format (D/M/YYYY)
      // const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;

      // console.log(formattedDate);
    },
    async get_data(val) {
      // console.log(val);
      if (val != undefined) {
        this.selectedMmonth = val;
      }
      // this.selectedMmonth=this.date;
      this.next_token = null;
      this.tableData = [];
      await this.get_userreport();
      await this.get_list();
    },
    async get_userreport() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(monthly_reports, {
            input: {
              user_id: data.user.user_id,
              year: this.monthvalue.slice(0, 4),
              month: this.monthvalue.substring(5),
              organization_id: data.organization.organization_id,

              limit: 22,
              nextToken: this.next_token,
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.monthly_reports);
        // console.log(response);
        this.next_token = response.nextToken;

        if (response.Status == "SUCCESS") {
          let array = this.tableData.concat(response.data);
          this.tableData = array;
          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.user_id === obj.user_id)
          );
          // console.log(this.tableData);
          this.tableData = uniqueArrayOfObjects[0];
          // console.log(this.tableData);
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
      // console.log(event, "s");
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
</style>
