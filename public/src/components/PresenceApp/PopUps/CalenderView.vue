<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="calendarPreview"
      @update:model-value="calendarPreview = $event"
      persistent
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card class="overflow-hidden">
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              View Details of {{ rowInfo.full_user_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <!-- <div class="ma-4"> -->
          <div id="calendar-wrap">
            <header>
              <h2>
                {{ displaySelectedMonth + "(" + currentYear + ")" }}
              </h2>
            </header>

            <div id="calendar">
              <ul class="weekdays">
                <li v-for="day in currentMonthWeekdays" :key="day">
                  {{ day }}
                </li>
              </ul>
              <ul class="days">
                <li v-for="dayInfo in calendarDays" :class="{ day: true }">
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
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
export default {
  props: {
    calendarPreview: Boolean,
    rowInfo: Object,
    selectedMmonth: String,
  },
  data() {
    return {
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

      // eventMoreText: "+ {0} more",
      //   today: "2019-01-10",
    };
  },
  computed: {
    currentMonthWeekdays() {
      const data = new Date(this.selectedMmonth, 1).getDay();
      // console.log("ffff", data);
      const firstDayOfMonth = new Date(
        this.currentYear,
        this.currentMonth,
        1
      ).getDay();
      // Get the day of the week (0-6) for the first day of the month
      const weekdays = this.weekdays
        .slice(firstDayOfMonth)
        .concat(this.weekdays.slice(0, firstDayOfMonth));

      return weekdays;
    },

    calendarDays() {
      const inputYearMonth = this.selectedMmonth; // The input year and month
      const timeZoneOffset = "+0530"; // India Standard Time offset
      const [selectedYear, selectedMonth] = inputYearMonth
        .split("-")
        .map(Number);
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentHours = currentDate.getHours();
      const currentMinutes = currentDate.getMinutes();
      const currentSeconds = currentDate.getSeconds();
      const formattedDate = new Date(
        selectedYear,
        selectedMonth - 1,
        currentDay,
        currentHours,
        currentMinutes,
        currentSeconds
      );
      formattedDate.setMinutes(formattedDate.getMinutes() - timeZoneOffset);

      const currentMonth = formattedDate;

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = [];
      const daysInWeek = 7; // Number of days in a week

      const firstDayOfWeek = firstDayOfMonth.getDay();

      const lastDayOfWeek = lastDayOfMonth.getDay();

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

        daysInMonth.push({
          date: new Date(currentDate),
          isCurrentMonth,
          newDate: new Date(currentDate).toLocaleDateString(),
        });
      }

      return daysInMonth;
    },

    // Define custom event props to style the events
  },
  watch: {
    calendarPreview: {
      async handler() {
        const displaySelected = this.selectedMmonth;
        const [, displayMonth] = displaySelected.split("-"); // Extract the month part

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

        this.currentMonth = currentMonth;

        if (this.calendarPreview == true) {
          this.events = [];
          var data = this.rowInfo.monthReports;

          this.events = data
            .filter(
              (obj) =>
                obj.attendence_type == "P" ||
                obj.attendence_type == "H" ||
                obj.attendence_type == "A" ||
                obj.attendence_type == "W/O" ||
                obj.attendence_type == "N/A" ||
                obj.attendence_type == "L"
            )
            .map((obj) => {
              return {
                date: new Date(obj.date).toLocaleDateString(),
                new_date: obj.date,
                description: this.get_type(obj.attendence_type),
                time:
                  obj.attendence_type == "P"
                    ? this.fetch_time(obj.first_swipe, obj.last_swipe)
                    : "",
                duartion: obj.attendence_type == "P" ? obj.total_duration : "",
              };
            });
        }
      },
      immediate: true,
    },
  },

  created() {},
  methods: {
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
      var data;
      switch (value) {
        case "P":
          data = "Present";
          break;
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
  background: #10559a;
  color: #fff;
  width: 30px;
  border-radius: 50%;
  float: right;
}

#calendar .event {
  clear: both;
  // display: block;
  font-size: 13px;
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
  color: #666;
  // margin: 3px 0 7px 0;
  text-decoration: none;
}

#calendar .other-month {
  background: #f5f5f5;
  color: #666;
}
</style>
