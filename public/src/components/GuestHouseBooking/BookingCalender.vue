<template>
  <div>
    <v-card  flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-toolbar  dense flat>
        <v-spacer />
        <v-btn dark class="text-capitalize cardCss ml-1" @click="block_date()">
          <v-icon class="mr-2">mdi-calendar</v-icon>
          Block Date
        </v-btn>    
        <v-dialog :model-value="datePicker" @update:model-value="$emit('update:datePicker', $event)"
          color="primaryColor"
          :return-value.sync="SelectedDate"
          persistent
          width="298px"
        >
          <!-- <template #activator="{ on, attrs }">
            <v-text-field
              v-model="computedDateFormatted"
              dense
              outlined
              persistent-hint
              class="mt-7"
              label="Block Date"
              color="pimaryColor"
              style="max-width: 200px;"
              :rules="[(v) => !!v || 'required ']"
              append-icon="mdi-calendar"
              v-bind="attrs"
              v-on="on"
              readonly
            >
            </v-text-field>
          </template> -->
          <v-date-picker
            v-model="SelectedDate"
            color="primaryColor"
            scrollable
            :min="new Date().toISOString().substr(0, 10)"
            :allowed-dates="isDateAllowed"
            @update:picker-date="updatePickedMonth"
            >
          <v-spacer></v-spacer>
            <v-btn text color="primaryColor" @click="datePicker = false">
              Cancel
            </v-btn>
            <v-btn
              text
              color="primaryColor"
              @click="handleDateSelection"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-dialog>
        <v-btn dark class="text-capitalize cardCss ml-1" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <div ref="calendar" class="calendar-fullscreen"></div>
      </v-card-text>
    </v-card>
    <div v-if="componenetCheck == 1">
    <EditBlockDate
      :editBlockDate = "editBlockDate"
      :ViewInfo = "ViewInfo"
      @clicked="editBlockDate = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />
    </div>
  </div>
</template>

<script>
/*eslint-disable*/
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import { parse, format } from "date-fns";
import axios from "axios";
import { create_update_calender } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import EditBlockDate from "./AllPopups/EditBlockDate.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    EditBlockDate,
    SnackBar,
  },
  data() {
    return {
      calendar: null,
      bookedEvents: [],
      selectedRange: [],
      datePicker: false,
      SelectedDate: new Date().toISOString().substr(0, 10),
      is_blocked: true,
      currentMonthYear: this.formatMonthYear(new Date()),
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      componenetCheck: 0,
      editBlockDate: false,
      ViewInfo: {},
      SnackBarComponent: {},
    };
  },
  created() {
    const data = JSON.parse(localStorage.getItem("calenderinfo"));
    // console.log("data", data)
    this.fetch_booked_events(data);
  },
  mounted() {
    this.initCalendar();
  },
  computed: {
    computedDateFormatted() {
      return this.displayFormatDate(this.SelectedDate);
    },
  },

  methods: {
    block_date() {
      this.datePicker=true;
    },
    displayFormatDate(date) {
      const d = new Date(date);
      if (isNaN(d)) return "Invalid Date";

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${day}-${month}-${year}`;
    },

    handleDateSelection() {
      this.datePicker = false;
      const data = JSON.parse(localStorage.getItem("calenderinfo"));
      if (data) {
        this.Block_Selected_date(data);
      } else {
        console.error("Calendar info not found in localStorage");
      }
    },

    updatePickedMonth(newMonth) {
      this.currentMonthYear = this.formatMonthYear(newMonth);
      // console.log("Updated Month-Year from DatePicker:", this.currentMonthYear);
      const data = JSON.parse(localStorage.getItem("calenderinfo"));
      this.fetch_booked_events(data);
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

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.editBlockDate = false;
      const data = JSON.parse(localStorage.getItem("calenderinfo"));
      this.Block_Selected_date(data);
      this.fetch_booked_events(data);
      this.updateCalendar();
    },

    async Block_Selected_date(data) {
      try {
        let result = await API.graphql(
          graphqlOperation(create_update_calender, {
            input: {
              guest_house_id: data.guest_house_id,
              calender_date: this.displayFormatDate(this.SelectedDate),
              day_price: data.cost,
              is_blocked: this.is_blocked,
            },
          })
        );

        // console.log("GraphQL Response:", result);
        var response = JSON.parse(result.data.create_update_calender);

        if (response.Status === "SUCCESS") {
          this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
          this.datePicker = false;
          this.fetch_booked_events(data);
          this.updateCalendar();
        } else {
          this.datePicker = false;
        }
      } catch (error) {
        console.error("Error blocking date:", error);
      }
    },

    async fetch_booked_events(data) {
      try {
        const res = await axios.post(
          "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/guest_house_calender_details",
          {
            month_year: this.currentMonthYear,
            guest_house_no: data.item.guest_house_no,
            command: "getGuestHouseCalenderDetails",
            organization_display_id:
              this.$store.getters.GetUserObj.organization.organization_display_id,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        if (res.data.Status === "SUCCESS") {
          const response = res.data.data;
          // console.log("response", response);

          this.bookedEvents = response
            .filter((item) => item.calender_date) 
            .map((item) => {
              const formattedDate = this.convert_date_format(item.calender_date);
              if (!formattedDate) return null;

              if (item.is_blocked) {
                const price = item.day_price;
                return {
                  title: `Blocked Date`,
                  start: formattedDate,
                  backgroundColor: "#DB4C77",
                  borderColor: "#DB4C77",
                  display: "background",
                  extendedProps: {
                    price: price,
                    items: item,
                  },
                };
              } else if (item.booking_details.length > 0) {
                const bookedBy = item.booking_details[0]?.user_details?.name;
                const phoneNo = item.booking_details[0]?.user_details?.phone_no;
                const price = item.day_price;
                return {
                  title: `${bookedBy}`,
                    start: formattedDate,
                    backgroundColor: "#10559A",
                    borderColor: "#10559A",
                    display: "background",
                    extendedProps: {
                      phoneNo: phoneNo,
                      price: price,
                    },
                };
              }
              return null;
            })
            .filter((event) => event !== null);

          // console.log("Blocked Dates:", this.bookedEvents);
          this.updateCalendar();
        }
      } catch (err) {
        console.error("Error fetching calendar data:", err);
      }
    },

    isDateAllowed(date) {
      const formattedDate = this.displayFormatDate(date);
      const bookedDates = this.bookedEvents.map(event => this.displayFormatDate(event.start));
      return !bookedDates.includes(formattedDate);
    },
  
    convert_date_format(dateStr) {
      if (!dateStr) return null;

      try {
        const parsedDate = parse(dateStr, "dd-MM-yyyy", new Date());
        return format(parsedDate, "yyyy-MM-dd"); // Convert to FullCalendar format
      } catch (error) {
        console.error("Date parsing error:", dateStr, error);
        return null; // Return null to prevent app crash
      }
      // if (!dateStr) return null;

      // try {
      //   const parsedDate = parse(dateStr, "MM-dd-yyyy", new Date());
      //   return format(parsedDate, "yyyy-MM-dd");
      // } catch (error) {
      //   console.error("Date parsing error:", dateStr, error);
      //   return null;
      // }
    },

    // convert_date_format(dateStr) {
    //   return format(parse(dateStr, "MM-dd-yyyy", new Date()), "yyyy-MM-dd");
    // },

    initCalendar() {
  this.calendar = new Calendar(this.$refs.calendar, {
    plugins: [dayGridPlugin],
    initialView: "dayGridMonth",
    events: this.bookedEvents,
    eventContent: this.renderEventContent,
    viewDidMount: (viewInfo) => {
      this.updateCurrentMonthYear(viewInfo);
    },
    datesSet: (viewInfo) => {
      this.updateCurrentMonthYear(viewInfo);
    },
    eventClick: (info) => {
      this.handleEventClick(info);
    },
  });
  this.calendar.render();
},

handleEventClick(info) {
  const event = info.event;
  if (event.extendedProps.items) {
    this.ViewInfo = event.extendedProps; // Pass the whole event data
    this.editBlockDate = true;
    this.componenetCheck = 1;
  }
},


    formatMonthYear(date) {
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${month}-${year}`;
    }, 

    updateCurrentMonthYear(viewInfo) {
      const currentDate = viewInfo.view.currentStart;
      const newMonthYear = this.formatMonthYear(currentDate);

      if (this.currentMonthYear !== newMonthYear) { 
        this.currentMonthYear = newMonthYear; 
        // console.log("Updated Month-Year:", this.currentMonthYear);

        const data = JSON.parse(localStorage.getItem("calenderinfo"));
        if (data) {
          this.fetch_booked_events(data);
        }
      }
    },

    renderEventContent(arg) {
      const iconAccount = document.createElement("span");
      iconAccount.className = "mdi mdi-account";
      iconAccount.style.marginRight = "5px";
      iconAccount.style.marginLeft = "5px";
      iconAccount.style.color = "white";

      const bookedTitle = document.createElement("span");
      bookedTitle.innerHTML = arg.event.title;
      bookedTitle.style.fontWeight = "bold";
      bookedTitle.style.color = "white";

      const iconPhone = document.createElement("span");
      iconPhone.className = "mdi mdi-phone";
      iconPhone.style.marginRight = "5px";
      iconPhone.style.marginLeft = "5px";
      iconPhone.style.color = "white";

      const phoneNo = document.createElement("span");
      phoneNo.innerHTML = arg.event.extendedProps.phoneNo || "N/A";
      phoneNo.style.fontSize = "12px";
      phoneNo.style.color = "white";

      const cost = document.createElement("div");
      cost.innerHTML = `₹ - ${arg.event.extendedProps.price || "N/A"}`;
      cost.style.fontSize = "12px";
      cost.style.color = "white";
      cost.style.marginRight = "5px";
      cost.style.marginLeft = "5px";
      cost.style.marginTop = "-2px";

      const titleContainer = document.createElement("div");
      titleContainer.style.display = "flex";
      titleContainer.style.alignItems = "center";
      titleContainer.appendChild(iconAccount);
      titleContainer.appendChild(bookedTitle);

      const phoneContainer = document.createElement("div");
      phoneContainer.style.display = "flex";
      phoneContainer.style.alignItems = "center";
      phoneContainer.style.fontSize = "12px";
      phoneContainer.appendChild(iconPhone);
      phoneContainer.appendChild(phoneNo);

      const wrapper = document.createElement("div");
      wrapper.appendChild(titleContainer);
      wrapper.appendChild(phoneContainer);
      wrapper.appendChild(cost);

      return { domNodes: [wrapper] };
    },

    updateCalendar() {
      if (this.calendar) {
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(this.bookedEvents);
      }
    },

    back_call() {
      this.$router.push("/GuestHouseList");
    },
  },
};
</script>

<style scoped>
.calendar-fullscreen {
  width: 100%;
  height: calc(100vh - 64px);
}
</style>
