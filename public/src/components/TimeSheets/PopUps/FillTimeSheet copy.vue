<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="timesheetUpdate"
      @update:model-value="timesheetUpdate = $event"
      persistent
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Fill Timesheet</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="pa-4">
          <div class="text-h6 font-weight-bold mb-4">
            Choose the dates you worked on and fill out the timesheet for those
            days
          </div>

          <!-- Date Selection -->
          <v-row class="mb-4">
            <v-col cols="12" md="4">
              <v-text-field
                label="From Date"
                v-model="fromDateDisplay"
                variant="outlined"
                density="compact"
                @click="fromDatePicker = true"
                readonly
                append-inner-icon="mdi-calendar"
                style="max-width: 300px"
              >
                <v-dialog v-model="fromDatePicker" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempFromDate"
                      :min="minmonth"
                      :max="minDate"
                      color="#DB4C77"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn text @click="fromDatePicker = false">Cancel</v-btn>
                      <v-btn text color="primary" @click="saveFromDate"
                        >OK</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                label="To Date"
                v-model="toDateDisplay"
                variant="outlined"
                density="compact"
                @click="toDatePicker = true"
                readonly
                append-inner-icon="mdi-calendar"
                style="max-width: 300px"
              >
                <v-dialog v-model="toDatePicker" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempToDate"
                      :min="fromDate || minmonth"
                      :max="minDate"
                      color="#DB4C77"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn text @click="toDatePicker = false">Cancel</v-btn>
                      <v-btn text color="primary" @click="saveToDate">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Duration Information -->
          <div v-if="daterangeSelected == true" class="mb-4">
            <v-alert type="info" variant="tonal" class="mb-0">
              <div class="font-weight-medium mb-1">
                Work Duration Information
              </div>
              <div class="text-body-2">
                <strong>Organization Work Duration:</strong>
                {{ OrganisationDuartion }}
              </div>
              <div v-if="presenceenabled == true" class="text-body-2 mt-1">
                <strong>My Work Duration:</strong> {{ userWorkduration }}
              </div>
              <div
                v-if="
                  presenceenabled == true &&
                  timeSheetdate != '' &&
                  userdailyduartion != ''
                "
                class="text-body-2 mt-1"
              >
                <strong>Duration of {{ timeSheetdate }}:</strong>
                {{ userdailyduartion }}
              </div>
            </v-alert>
          </div>

          <!-- Timesheet Entry Form -->
          <div v-if="timeSheetdateitems.length != 0">
            <v-form ref="form">
              <v-row v-if="daterangeSelected == true" class="mb-4">
                <v-col cols="12" md="3" v-if="dailyCheck == true">
                  <v-select
                    v-model="timeSheetdate"
                    density="compact"
                    variant="outlined"
                    label="Select Date"
                    :rules="
                      dailyCheck == true ? [(v) => !!v || 'Required'] : []
                    "
                    :items="timeSheetdateitems"
                    @update:model-value="getdaily_duration()"
                  />
                </v-col>
                <v-col cols="12" :md="dailyCheck == false ? 4 : 3">
                  <v-select
                    v-model="timesheetProject"
                    density="compact"
                    variant="outlined"
                    item-title="text"
                    item-value="value"
                    label="Select Project"
                    :rules="[(v) => !!v || 'Required']"
                    :items="timesheetitemsProject"
                    return-object
                    @update:model-value="
                      extractProjectActivities(timesheetProject)
                    "
                  />
                </v-col>
                <v-col cols="12" :md="dailyCheck == false ? 4 : 3">
                  <v-select
                    v-model="timesheetactivity"
                    density="compact"
                    variant="outlined"
                    label="Select Activity"
                    :rules="[(v) => !!v || 'Required']"
                    :items="timesheetitemsactivity"
                  />
                </v-col>
                <v-col cols="12" :md="dailyCheck == false ? 4 : 3">
                  <v-textarea
                    density="compact"
                    variant="outlined"
                    auto-grow
                    v-model="commentstimesheet"
                    rows="1"
                    maxlength="500"
                    label="Comments"
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="2" v-if="dailyCheck == true">
                  <v-select
                    v-model="timesheethour"
                    density="compact"
                    variant="outlined"
                    label="Hours"
                    :rules="
                      dailyCheck == true
                        ? [
                            (v) =>
                              (v !== null && v !== undefined && v !== '') ||
                              'Required',
                          ]
                        : []
                    "
                    :items="timesheetitemshour"
                    @update:model-value="timesheetmin = ''"
                  />
                </v-col>
                <v-col cols="2" v-if="dailyCheck == false">
                  <v-text-field
                    variant="outlined"
                    density="compact"
                    v-model="timesheethour"
                    label="Total Hour"
                    :rules="[(v) => !!v || 'required ']"
                    @keypress="is_number($event)"
                    v-on:paste="process($event)"
                    class=""
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-select
                    v-model="timesheetmin"
                    density="compact"
                    variant="outlined"
                    label="Minutes"
                    :rules="[(v) => !!v || 'Required']"
                    :items="
                      timesheethour == '0' || timesheethour == 0
                        ? ['15', '30', '45']
                        : timesheetitemsmin
                    "
                  />
                </v-col>
                <v-col cols="12" md="2" class="">
                  <v-btn
                    color="primary"
                    @click="add_mutation()"
                    class="text-capitalize mt-auto"
                    :loading="loading"
                  >
                    Add Entry
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>

            <!-- Timesheet Records Table -->
            <div class="mb-4">
              <div class="text-h6 font-weight-medium mb-2">
                Timesheet Records ({{ timeRecords.length }} entries)
              </div>

              <v-data-table
                v-if="daterangeSelected == true"
                :headers="dailyCheck ? timeSheetHeaders : dailyTimeSheetHeaders"
                :fixed-header="fixed"
                :items="timeRecords"
                :footer-props="{
                  itemsPerPageOptions: [10, 20, 30, 40, 50],
                }"
                :items-per-page="0"
                density="compact"
                class="elevation-1"
              >
                <template v-slot:[`item.comments`]="{ item }">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <div
                        v-if="item.comments"
                        v-on="on"
                        class="text-truncate"
                        style="max-width: 200px"
                      >
                        {{
                          item.comments.length >= 20
                            ? item.comments.substr(0, 20) + "..."
                            : item.comments
                        }}
                      </div>
                      <div v-else>-</div>
                    </template>
                    <div class="caption" style="max-width: 250px">
                      {{ item.comments }}
                    </div>
                  </v-tooltip>
                </template>
                <template v-slot:[`item.timesheet_from_date`]="{ item }">
                  <span>{{ get_date(item.timesheet_from_date) }}</span>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon small @click="open_delete(item)" color="red"
                    >mdi-delete</v-icon
                  >
                </template>
              </v-data-table>
            </div>
          </div>

          <!-- No Data Message -->
          <div
            v-else-if="
              timeSheetdateitems.length == 0 && daterangeSelected == true
            "
            class="text-center py-8"
          >
            <v-icon size="48" color="grey" class="mb-2"
              >mdi-calendar-remove</v-icon
            >
            <div class="text-h6 grey--text mb-2">No Work Days Available</div>
            <div class="text-body-2 grey--text">
              During the selected dates, no work was done or timesheets filled
              out on those days.
            </div>
          </div>
        </v-card-text>

        <!-- Footer Actions -->
        <v-card-actions class="justify-end pa-4">
          <v-btn
            color="primary"
            @click="checkDatesInRecords()"
            v-if="timeRecords.length != 0"
            :loading="loading"
            class="text-capitalize"
          >
            Save Timesheet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
import moment from "moment";
import { get_total_work_duartion } from "@/graphql/queries.js";
import { create_timesheet } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_projects } from "@/graphql/queries.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";

export default {
  props: {
    timesheetUpdate: Boolean,
  },
  data() {
    return {
      minDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        .toISOString()
        .substr(0, 10),
      date: "",
      menu: false,
      loading: false,
      daterangeSelected: false,
      timeSheetdate: "",
      OrganisationDuartion: "",
      timesheetactivity: "",
      timesheetProject: "",
      timesheethour: "",
      timesheetmin: "",
      selectedDate: "",
      minmonth: "",
      commentstimesheet: "",
      userWorkduration: "0s",
      userdailyduartion: "",
      timeSheetdateitems: [],
      timesheetitemsProject: [],
      timesheetitemsactivity: [],
      timefilleditems: [],
      timesheetitemshour: [],
      timesheetitemsmin: ["00", "15", "30", "45"],
      fixed: true,
      timeRecords: [],
      presenceenabled: false,
      weekoffdata: [],
      attedencedata: [],
      timeRange: [],
      projectdata: [],
      filledtimesheetdates: [],
      isResettingForm: false,
      timeSheetHeaders: [
        {
          title: "Date",
          key: "timesheet_from_date",
          sortable: false,
        },
        {
          title: "Project Name",
          key: "project_name",
          sortable: false,
        },
        { title: "Activity", key: "activity_name", sortable: false },
        { title: "Time Spent", key: "work_duartion", sortable: false },
        { title: "Comments", key: "comments", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ],
      dailyTimeSheetHeaders: [
        {
          title: "Project Name",
          key: "project_name",
          sortable: false,
        },
        { title: "Activity", key: "activity_name", sortable: false },
        { title: "Time Spent", key: "work_duartion", sortable: false },
        { title: "Comments", key: "comments", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ],
      totalDuration: "",
      datePicker: false,
      dailyCheck: false,
      tempDate: null,
      fromDate: "",
      toDate: "",
      tempFromDate: null,
      tempToDate: null,
      fromDatePicker: false,
      toDatePicker: false,
      fromDateFormatted: "",
      toDateFormatted: "",
    };
  },
  computed: {
    fromDateDisplay() {
      return this.displayFormatDate(this.fromDateFormatted);
    },
    toDateDisplay() {
      return this.displayFormatDate(this.toDateFormatted);
    },
    filteredTimeSheetHeaders() {
      // console.log(
      //   "filteredTimeSheetHeaders computed called, dailyCheck:",
      //   this.dailyCheck
      // );
      const headers = this.dailyCheck
        ? this.dailyTimeSheetHeaders
        : this.timeSheetHeaders;
      // console.log("Selected headers:", headers);
      return headers;
    },
    tableKey() {
      return `timesheet-table-${
        this.dailyCheck ? "daily" : "weekly"
      }-${Date.now()}`;
    },
  },
  watch: {
    timesheetUpdate: {
      async handler() {
        this.selectedDate = this.get_orgdate(
          this.$store.getters.GetUserObj.organization.organization_created_on
        );
        this.minmonth = moment(this.selectedDate, "MM/DD/YYYY").format(
          "YYYY-MM-DD"
        );

        this.date = "";
        this.daterangeSelected = false;
        this.timeRecords = [];
        this.timesheetitemshour = Array.from({ length: 19 }, (_, i) => {
          return { title: i.toString(), value: i };
        });
        await this.fetch_projectes();
        this.dailyCheck =
          this.$store.getters.GetOrgDetails.organization
            .is_daily_timesheet_required == undefined
            ? true
            : this.$store.getters.GetOrgDetails.organization
                .is_daily_timesheet_required;
        // console.log(this.dailyCheck, "dailyCheck");
      },
      immediate: true,
    },
  },

  methods: {
    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },
    saveDate() {
      if (this.tempDate) {
        this.date = this.formatDate(this.tempDate); // Format and assign tempDate to billdate
      }
      this.datePicker = false; // Close the date picker
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
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
    get_date(val) {
      var data = formatdisplayDate(val);
      return data;
    },
    parseDuration(durationString) {
      const [hours, minutes] = durationString.split("h ");
      return parseInt(hours) * 60 + parseInt(minutes);
    },
    formatDuration(minutes) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    },
    addDataAndCheckDuration(existingData, newData, maxDuration) {
      const {
        work_duration: newWorkDuration,
        timesheet_from_date: newFromDate,
      } = newData;

      const totalDurationForDate = existingData.reduce((total, data) => {
        if (data.timesheet_from_date === newFromDate) {
          var newduration = data.work_duartion;
          total += this.parseDuration(newduration);
        }

        return total;
      }, 0);

      const newTotalDuration =
        totalDurationForDate + this.parseDuration(newData.work_duartion);

      const maxDurationInMinutes = this.parseDuration(maxDuration);

      if (newTotalDuration > maxDurationInMinutes) {
        return false;
      }

      existingData.push(newData);
      return true;
    },
    async get_duration(daterange) {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_total_work_duartion, {
            input: {
              organization_id: data.organization.organization_id,
              user_id: data.user.user_id,
              timesheet_from_date: daterange[0],
              timesheet_to_date: daterange[daterange.length - 1],
              action_type: "MONTHLY",
            },
          })
        );
        var response = JSON.parse(result.data.get_total_work_duartion);

        if (response.Status == "SUCCESS") {
          this.presenceenabled = response.data.is_attendance_management;
          var duration = response.data.user_worked_duration;

          if (duration != "0s" && this.presenceenabled == true) {
            this.totalDuration = this.removeSeconds(duration);
          }

          this.weekoffdata = response.data.week_off_details;
          this.attedencedata = response.data.userAttendenceData;
          this.filledtimesheetdates = response.data.timesheet_filled_dates;

          this.OrganisationDuartion = response.data.organization_duration_work;
          this.userWorkduration = response.data.user_worked_duration;
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async getdaily_duration() {
      // Don't call API if form is being reset
      if (this.isResettingForm) {
        return;
      }
      
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_total_work_duartion, {
            input: {
              organization_id: data.organization.organization_id,
              user_id: data.user.user_id,
              timesheet_from_date: this.timeSheetdate,
              action_type: "DAILY",
            },
          })
        );
        var response = JSON.parse(result.data.get_total_work_duartion);

        if (response.Status == "SUCCESS") {
          if (response.data.user_daily_worked_data != "0s") {
            this.userdailyduartion = this.removeSeconds(
              response.data.user_daily_worked_data
            );
          } else {
            this.userdailyduartion = "0h 00m";
          }
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    checkDatesInRecords() {
      if (this.dailyCheck == true) {
        const recordsDates = new Set();
        this.timeRecords.forEach((record) => {
          recordsDates.add(record.timesheet_from_date);
        });

        const missingDates = this.timeSheetdateitems.filter(
          (date) => !recordsDates.has(date)
        );

        if (missingDates.length === 0) {
          this.validate_data();
        } else {
          this.$emit(
            "errorMsg",

            ` The timesheet has not been entered for this date ${missingDates.join(
              ", "
            )}`
          );
        }
      } else {
        this.validate_data();
      }
    },
    removeSeconds(duration) {
      const [hours, minutes, seconds] = duration.split(" ");

      const newDuration = `${hours} ${minutes}`;

      return newDuration;
    },
    limitDateRange() {
      if (this.date.length === 2) {
        const startDate = new Date(this.date[0]);
        let endDate = new Date(this.date[1]);
        const differenceInTime = endDate.getTime() - startDate.getTime();
        let differenceInDays = differenceInTime / (1000 * 3600 * 24);
        if (differenceInDays > 6) {
          endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
          this.date[1] = endDate.toISOString().substr(0, 10);
        }
      }
    },
    async fetch_projectes() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_projects, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );

        if (result && result.data && result.data.get_projects) {
          var response = JSON.parse(result.data.get_projects);

          if (response && response.data) {
            this.projectdata = response.data;

            if (Array.isArray(this.projectdata)) {
              this.projectdata.forEach((element) => {
                this.timesheetitemsProject.push({
                  text: element.project_name,
                  value: element.project_id,
                });
              });
            }
          }
        }
      } catch (error) {
        let errorMessage = "An unexpected error occurred"; // Default message
        if (
          error &&
          error.errors &&
          error.errors[0] &&
          error.errors[0].message
        ) {
          errorMessage = error.errors[0].message;
        } else if (error && error.message) {
          errorMessage = error.message;
        }
        this.$emit("errorMsg", errorMessage);
      }
    },
    extractProjectActivities(projectId) {
      this.timesheetactivity = "";
      this.timesheetitemsactivity = [];

      if (!projectId || !projectId.text) {
        return;
      }
      this.timesheetitemsactivity = [];
      this.projectdata.forEach((obj) => {
        if (obj.project_name === projectId.text) {
          this.timesheetitemsactivity.push(...obj.project_activities);
        }
      });
      // console.log(this.timesheetitemsactivity, "timesheetitemsactivity");
    },
    generateDatesInRange(dateArray) {
      let startDate = new Date(dateArray[0]);
      let endDate = new Date(dateArray[1]);

      let generatedDates = [];

      for (
        let currentDate = startDate;
        currentDate <= endDate;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        generatedDates.push(currentDate.toISOString().slice(0, 10));
      }
      return generatedDates;
    },

    close_dialog() {
      this.date = "";
      this.daterangeSelected = false;

      this.timeRecords = [];
      this.$emit("clicked", 0);
    },
    async datebind(newArray) {
      if (newArray.length === 1) {
        this.timeSheetdateitems = newArray;
        if (this.attedencedata.length != 0) {
          this.attedencedata.forEach((item) => {
            if (this.timeSheetdateitems.includes(item.swipe_date)) {
              let index = this.timeSheetdateitems.indexOf(item.swipe_date);

              this.timeSheetdateitems.splice(index, 1);
            }
          });
        }
        if (this.weekoffdata.length != 0) {
          this.weekoffdata.forEach((item) => {
            if (this.timeSheetdateitems.includes(item.swipe_date)) {
              let index = this.timeSheetdateitems.indexOf(item.swipe_date);

              this.timeSheetdateitems.splice(index, 1);
            }
          });
        }
        if (this.filledtimesheetdates.length != 0) {
          this.filledtimesheetdates.forEach((item) => {
            if (this.timeSheetdateitems.includes(item)) {
              let index = this.timeSheetdateitems.indexOf(item);

              this.timeSheetdateitems.splice(index, 1);
            }
          });
        }
      } else {
        this.timeSheetdateitems = this.generateDatesInRange(newArray);
        if (this.attedencedata.length != 0) {
          this.attedencedata.forEach((item) => {
            if (this.timeSheetdateitems.includes(item.swipe_date)) {
              let index = this.timeSheetdateitems.indexOf(item.swipe_date);

              this.timeSheetdateitems.splice(index, 1);
            }
          });
        }
        if (this.weekoffdata.length != 0) {
          this.weekoffdata.forEach((item) => {
            if (this.timeSheetdateitems.includes(item.swipe_date)) {
              let index = this.timeSheetdateitems.indexOf(item.swipe_date);

              this.timeSheetdateitems.splice(index, 1);
            }
          });
        }
        if (this.filledtimesheetdates.length != 0) {
          this.filledtimesheetdates.forEach((item) => {
            if (this.timeSheetdateitems.includes(item)) {
              let index = this.timeSheetdateitems.indexOf(item);

              this.timeSheetdateitems.splice(index, 1);
            }
          });
        }
      }

      this.timeRecords = [];
      this.userdailyduartion = "";

      if (this.timeSheetdate != "") {
        this.isResettingForm = true;
        this.$refs.form.reset();
        this.isResettingForm = false;
      }
      this.timeSheetdate = "";
    },
    async updatedaterange() {
      if (this.tempDate != "") {
        this.daterangeSelected = true;

        // Ensure `this.date` is an array, even if it is a single value
        let newArray = Array.isArray(this.date) ? this.date : [this.date]; // Convert to an array if not already

        // Filter out empty strings if present in the array
        newArray = newArray.filter((item) => item !== "");

        // Ensure dates are in ascending order
        if (!this.areDatesIncreasing(newArray)) {
          let temp = newArray[0];
          newArray[0] = newArray[1];
          newArray[1] = temp;
        }

        // Perform further actions
        await this.get_duration(newArray);
        await this.datebind(newArray);
      }
    },

    // Check if dates are in ascending order
    areDatesIncreasing(datesArray) {
      for (let i = 0; i < datesArray.length - 1; i++) {
        if (new Date(datesArray[i]) > new Date(datesArray[i + 1])) {
          return false;
        }
      }
      return true;
    },
    open_delete(item) {
      const index = this.timeRecords.indexOf(item);
      if (index !== -1) {
        this.timeRecords.splice(index, 1);
      }
    },
    async add_mutation() {
      let data = {};
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        // console.log(this.dailyCheck);
        if (this.dailyCheck == true) {
          data = {
            project_id: this.timesheetProject.value,
            activity_name: this.timesheetactivity,
            project_name: this.timesheetProject.text,
            work_duartion:
              this.timesheethour + "h" + " " + this.timesheetmin + "m",
            timesheet_from_date: this.timeSheetdate,
            timesheet_to_date: this.timeSheetdate,
            comments:
              this.commentstimesheet == "" || this.commentstimesheet == null
                ? "N/A"
                : this.commentstimesheet,
          };
          if (this.presenceenabled == true) {
            const isDurationValid = this.addDataAndCheckDuration(
              this.timeRecords,
              data,
              this.userdailyduartion
            );
            if (isDurationValid) {
              this.timeSheetdate = "";
              this.userdailyduartion = "";
              this.isResettingForm = true;
              this.$refs.form.reset();
              this.isResettingForm = false;
            } else {
              this.$emit(
                "errorMsg",
                "The entered data exceeds the total duration you worked a day"
              );
            }
            this.isResettingForm = true;
            this.$refs.form.reset();
            this.isResettingForm = false;
          } else {
            this.timeRecords.push(data);
            this.isResettingForm = true;
            this.$refs.form.reset();
            this.isResettingForm = false;
            this.timeSheetdate = "";
            this.userdailyduartion = "";
          }
        } else {
          data = {
            project_id: this.timesheetProject.value,
            activity_name: this.timesheetactivity,
            project_name: this.timesheetProject.text,
            work_duartion:
              this.timesheethour + "h" + " " + this.timesheetmin + "m",
            timesheet_from_date: this.timeRange[0],
            timesheet_to_date:
              this.timeRange[1] == undefined
                ? this.timeRange[0]
                : this.timeRange[1],
            comments:
              this.commentstimesheet == "" || this.commentstimesheet == null
                ? "N/A"
                : this.commentstimesheet,
          };
          // console.log(this.presenceenabled,data);
          if (this.presenceenabled == true) {
            this.processTimesheetEntry(data, this.userWorkduration);
            this.isResettingForm = true;
            this.$refs.form.reset();
            this.isResettingForm = false;
            this.timeSheetdate = "";
            this.userdailyduartion = "";
          } else {
            this.timeRecords.push(data);
            this.timeSheetdate = "";
            this.userdailyduartion = "";
            this.isResettingForm = true;
            this.$refs.form.reset();
            this.isResettingForm = false;
          }
        }
      }
    
    },
    processTimesheetEntry(entry, organizationDuration) {
      // Convert durations to minutes for easier calculation

      const newEntryDurationMinutes = this.durationToMinutes(
        entry.work_duartion
      );
      const organizationDurationMinutes =
        this.durationToMinutes(organizationDuration);

      let totalExistingMinutes = 0;

      // Calculate the total existing duration in the timesheet
      if (this.timeRecords && this.timeRecords.length > 0) {
        this.timeRecords.forEach((existingEntry) => {
          totalExistingMinutes += this.durationToMinutes(
            existingEntry.work_duartion
          );
        });
      }

      // Check if adding the new entry exceeds the organization duration
      if (
        totalExistingMinutes + newEntryDurationMinutes <=
        organizationDurationMinutes
      ) {
        // Add the entry to the timesheet data

        this.timeRecords.push(entry);
        this.timeSheetdate = "";
        this.userdailyduartion = "";
        this.safeFormReset();
      } else {
        // Do not add the entry and return an error message
        this.$emit(
          "errorMsg",
          "Adding this entry exceeds the worked duration."
        );
      }
    },
    safeFormReset() {
      if (this.$refs.form && this.daterangeSelected) {
        this.isResettingForm = true;
        this.$refs.form.reset();
        this.isResettingForm = false;
      }
    },
    durationToMinutes(durationString) {
      const parts = durationString.split(" ");
      let hours = 0;
      let minutes = 0;

      parts.forEach((part) => {
        if (part.endsWith("h")) {
          hours = parseInt(part);
        } else if (part.endsWith("m")) {
          minutes = parseInt(part);
        }
      });

      return hours * 60 + minutes;
    },
    async validate_data() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_timesheet, {
            input: {
              organization_id: data.organization.organization_id,
              user_id: data.user.user_id,
              timesheet_details: this.timeRecords,
              timesheet_from_date: this.timeSheetdateitems[0],
              timesheet_to_date:
                this.timeSheetdateitems[this.timeSheetdateitems.length - 1],
              organization_working_duration: this.OrganisationDuartion,
            },
          })
        );
        var response = JSON.parse(result.data.create_timesheet);

        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("usertimesheet", "dataValue");
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    saveFromDate() {
      this.fromDate = this.tempFromDate;
      this.fromDateFormatted = this.tempFromDate
        ? this.formatDate(this.tempFromDate)
        : "";
      if (!this.toDate || this.toDate < this.fromDate) {
        this.toDate = this.fromDate;
        this.tempToDate = this.fromDate;
        this.toDateFormatted = this.fromDateFormatted;
      }
      this.updateTimeSheetDates();
      this.fromDatePicker = false;
    },
    saveToDate() {
      this.toDate = this.tempToDate;
      this.toDateFormatted = this.tempToDate
        ? this.formatDate(this.tempToDate)
        : "";
      this.updateTimeSheetDates();
      this.toDatePicker = false;
    },
    async updateTimeSheetDates() {
      if (this.fromDate && this.toDate && this.toDate >= this.fromDate) {
        this.timeSheetdateitems = this.getDatesInRange(
          this.fromDate,
          this.toDate
        );
        this.daterangeSelected = true;
        // Call the API with the new date range
        this.timeRange = this.timeSheetdateitems;
        await this.get_duration(this.timeSheetdateitems);
        await this.datebind(this.timeSheetdateitems);
      } else {
        this.timeSheetdateitems = [];
        this.daterangeSelected = false;
      }
    },
    getDatesInRange(start, end) {
      const arr = [];
      let dt = new Date(start);
      const endDt = new Date(end);
      while (dt <= endDt) {
        arr.push(this.formatDate(dt));
        dt.setDate(dt.getDate() + 1);
      }
      return arr;
    },
    formatDisplayDate(date) {
      const d = typeof date === "string" ? new Date(date) : date;
      return `${String(d.getDate()).padStart(2, "0")}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${d.getFullYear()}`;
    },
    displayFormatDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    forceTableRefresh() {
      // Force the table to re-render by updating the key
      this.$nextTick(() => {
        // Trigger reactivity by forcing a re-computation
        this.$forceUpdate();
      });
    },
  },
};
</script>

<style scoped>
/* Simple, clean styling */
.v-data-table {
  border-radius: 4px;
}

.v-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: #f5f5f5;
}
.btn-addentity {
  margin-top: -80px !important;
}
</style>
