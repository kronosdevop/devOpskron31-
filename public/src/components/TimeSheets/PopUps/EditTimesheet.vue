<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="timesheetEdition"
      @update:model-value="timesheetEdition = $event"
      persistent
      fullscreen
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Fill Timesheet</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-row class="mt-5 mb-2">
            <div>
              The Timesheet of the Range
              <b>
                {{
                  date[0] == date[date.length - 1]
                    ? date[0]
                    : date[0] + " / " + date[date.length - 1]
                }}
              </b>
            </div>
            <div
              class="ml-5"
              v-if="
                date.length != 0 &&
                presenceenabled == true &&
                timeSheetdate != '' &&
                userdailyduartion != ''
              "
            >
              Duration of <b> {{ timeSheetdate }} </b> :
              <b>{{ userdailyduartion }}</b>
            </div>
          </v-row>

          <!-- <div class="font-weight-bold mt-2">
            Choose the dates you worked on and fill out the timesheet for those
            days
          </div>
          <v-row>
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  label="Choose Date "
                  prepend-icon="mdi-calendar"
                  readonly
                  outlined
                  class="mt-8 ml-3"
                  style="max-width: 310px"
                  dense
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                :max="minDate"
                :min="null"
                range
                v-model="date"
                no-title
                scrollable
                @change="limitDateRange()"
              >
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="menu = false">
                  Cancel
                </v-btn>
                <v-btn
                  text
                  color="primary"
                  @click="$refs.menu.save(date)"
                  v-on:click="updatedaterange()"
                >
                  OK
                </v-btn>
              </v-date-picker>
            </v-menu>
            <div class="mt-10 ml-5" v-if="daterangeSelected == true">
              Organization Work Duartion : <b> {{ OrganisationDuartion }}</b>
            </div>
            <div class="mt-10 ml-5" v-if="daterangeSelected == true">
              My Work Duartion : <b> {{ userWorkduration }}</b>
            </div>
          </v-row> -->
          <v-form ref="form">
            <v-row v-if="daterangeSelected == true">
              <v-col cols="3" v-if="dailyCheck == true">
                <v-select
                  v-model="timeSheetdate"
                  density="compact"
                  variant="outlined"
                  label="Select Date"
                  :rules="dailyCheck == true ? [(v) => !!v || 'Required'] : []"
                  :items="timeSheetdateitems"
                  @update:model-value="getdaily_duration($event)"
                />
              </v-col>
              <v-col :cols="dailyCheck == true ? 3 : 4">
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
                  @update:model-value="handleProjectChange"
                />
              </v-col>
              <v-col :cols="dailyCheck == true ? 3 : 4">
                <v-select
                  v-model="timesheetactivity"
                  density="compact"
                  variant="outlined"
                  label="Select Activity"
                  :rules="[(v) => !!v || 'Required']"
                  :items="timesheetitemsactivity"
                />
              </v-col>
              <v-col :cols="dailyCheck == true ? 3 : 4">
                <v-textarea
                  variant="outlined"
                  density="compact"
                  class=""
                  auto-grow
                  v-model="commentstimesheet"
                  rows="1"
                  maxlength="500"
                  label="Comments"
                ></v-textarea>
              </v-col>
              <v-col cols="2" v-if="dailyCheck == true">
                <v-select
                  v-model="timesheethour"
                  density="compact"
                  variant="outlined"
                  label="Total Hour"
                  class="mt-n4"
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
                  class="mt-n4"
                />
              </v-col>
              <v-col cols="2">
                <v-select
                  v-model="timesheetmin"
                  density="compact"
                  variant="outlined"
                  class="mt-n4"
                  label="Total Minutes"
                  :rules="[(v) => !!v || 'Required']"
                  :items="
                    timesheethour == '0' || timesheethour == 0
                      ? ['15', '30', '45']
                      : timesheetitemsmin
                  "
                />
              </v-col>
              <v-col cols="4">
                <v-file-input
                  v-model="attachments"
                  label="Upload Files (Max 3)"
                  variant="outlined"
                  density="compact"
                  multiple
                  class="mt-n4"
                  accept="image/*,.pdf,.doc,.docx"
                >
                  <template v-slot:selection>
                    <div class="d-flex flex-wrap">
                      <v-chip
                        v-for="(file, index) in attachments"
                        :key="file.name"
                        class="ma-1"
                        closable
                        size="small"
                        @click:close="removeAttachment(file)"
                      >
                        <v-icon start size="16">
                          {{ getFileIcon(file.name) }}
                        </v-icon>
                        {{ file.name }}
                      </v-chip>
                    </div>
                  </template>
                </v-file-input>
              </v-col>

              <v-col cols="2">
                <v-btn
                  variant="flat"
                  @click="add_mutation()"
                  :loading="addLoading"
                  color="primary"
                  size="small"
                  class="text-capitalize ml-2 mt-n4 cardCss"
                >
                  Add
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
          <v-data-table
            v-if="daterangeSelected == true"
            :headers="timeSheetHeaders"
            :fixed-header="fixed"
            :items="timefilleditems"
            :footer-props="{
              itemsPerPageOptions: [10, 20, 30, 40, 50],
            }"
            :items-per-page="0"
            density="compact"
            class="elevation-1 mt-2 dtwidth"
          >
            <template v-slot:[`item.comments`]="{ item }">
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <div v-if="item.comments" v-bind="props">
                    {{
                      item.comments.length >= 10
                        ? item.comments.substr(0, 10) + "..."
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

            <template v-slot:[`item.actions`]="{ item }">
              <v-icon size="small" @click="open_delete(item)" color="red"
                >mdi-delete</v-icon
              >
            </template>
            <template v-slot:[`item.timesheet_images`]="{ item }">
              <div class="d-flex flex-wrap">
                <v-chip
                  v-for="(img, index) in (item.timesheet_images || []).filter(
                    (i) => i
                  )"
                  :key="index"
                  size="x-small"
                  class="ma-1"
                  color="primary"
                  variant="tonal"
                  @click="openAttachment(img)"
                >
                  <v-icon start size="14">mdi-paperclip</v-icon>
                  File {{ index + 1 }}
                </v-chip>

                <span
                  v-if="
                    !item.timesheet_images || item.timesheet_images.length === 0
                  "
                  class="text-grey"
                >
                  -
                </span>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            @click="validate_data('SUBMIT_DRAFT')"
            :loading="draftLoading"
            v-if="timefilleditems.length != 0"
            class="text-capitalize cardBtn button-corner text-white"
          >
            Save As Draft
          </v-btn>

          <v-btn
            @click="validate_data('UPDATE_DETAILS')"
            :loading="submitLoading"
            v-if="timefilleditems.length != 0"
            class="text-capitalize cardCss button-corner text-white"
          >
            Submit Timesheet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
    <script>
/* eslint-disable */
import { get_total_work_duartion } from "@/graphql/queries.js";
import { update_timesheet } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_projects } from "@/graphql/queries.js";
import { get_project_list } from "@/mixins/GetProjectList.js";
import { uploadToS3 } from "@/mixins/TicketsS3Upload.js";
export default {
  mixins: [get_project_list],
  props: {
    timesheetEdition: Boolean,
    timesheetitems: Object,
  },
  data() {
    return {
      minDate: new Date().toISOString().substr(0, 10),
      date: "",
      menu: false,
      daterangeSelected: false,
      dailyCheck: false,
      timeSheetdate: "",
      OrganisationDuartion: "",
      timesheetactivity: "",
      timesheetProject: "",
      timesheethour: "",
      timesheetmin: "",
      commentstimesheet: "",
      userWorkduration: "",
      userdailyduartion: "",
      timeSheetdateitems: [],
      timesheetitemsProject: [],
      timesheetitemsactivity: [],
      timesheetitemshour: [],
      timesheetitemsmin: ["00", "15", "30", "45"],
      fixed: true,
      timefilleditems: [],
      presenceenabled: false,
      weekoffdata: [],
      attedencedata: [],
      projectdata: [],
      attachments: [],
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
      timeSheetHeaders: [
        // {
        //   text: "Date",
        //   value: "timesheet_from_date",
        //   sortable: false,
        // },
        // {
        //   text: "Project Name",
        //   value: "project_name",
        //   sortable: false,
        // },
        // { text: "Activity", value: "activity_name", sortable: false },
        // { text: "Time Spent", value: "work_duartion", sortable: false },
        // { text: "Comments", value: "comments", sortable: false },
        // { text: "Actions", value: "actions", sortable: false },
      ],
      totalDuration: "",
      addLoading: false,
      draftLoading: false,
      submitLoading: false,
    };
  },
 watch: {
  timesheetEdition: {
    async handler() {
      if (this.timesheetEdition == true) {
        this.dailyCheck =
          this.$store.getters.GetOrgDetails.organization
            .is_daily_timesheet_required == undefined
            ? true
            : this.$store.getters.GetOrgDetails.organization
                .is_daily_timesheet_required;

        this.getTimesheetHeaders(this.dailyCheck);

        this.date = [];
        this.daterangeSelected = false;
        this.timefilleditems = [];

        this.date.push(this.timesheetitems.timesheet_from_date);
        this.date.push(this.timesheetitems.timesheet_to_date);

        await this.limitDateRange();
        await this.updatedaterange(); // <-- get_duration called inside this

        var recored = this.timesheetitems.timesheet_details;
        this.timefilleditems = [...recored];

        await this.get_project_list();

        this.timesheetitemsProject = this.ProjectList.slice()
          .sort((a, b) => a.project_name.localeCompare(b.project_name))
          .map((element) => ({
            text: element.project_name,
            value: element.project_id,
          }));
      } else {
        await this.fetch_projectes();
      }

      this.timesheetitemshour = Array.from({ length: 19 }, (_, i) => {
        return { title: i.toString(), value: i };
      });
    },
    immediate: true, // ✅ MUST be here
  },

  timesheetProject: {
    handler(newVal) {
      if (!newVal || !newVal.text) {
        this.timesheetactivity = "";
        this.timesheetitemsactivity = [];
      }
    },
  },
},
  timesheetProject: {
    handler(newVal, oldVal) {
      // Reset activity when project changes or becomes null
      if (!newVal || !newVal.text) {
        this.timesheetactivity = "";
        this.timesheetitemsactivity = [];
      }
    },
    immediate: false,
  },

  methods: {
    removeAttachment(file) {
      this.attachments = this.attachments.filter((f) => f !== file);
    },

    openAttachment(url) {
      window.open(url, "_blank");
    },

    getFileIcon(name) {
      const ext = name.split(".").pop().toLowerCase();

      if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext))
        return "mdi-image";
      if (ext === "pdf") return "mdi-file-pdf-box";
      if (["doc", "docx"].includes(ext)) return "mdi-file-word";

      return "mdi-file";
    },
    safeFormReset() {
      if (this.$refs.form && this.daterangeSelected) {
        this.$refs.form.reset();
      }
    },
    handleProjectChange(project) {
      // Safely handle project change
      if (project && project.text) {
        this.extractProjectActivities(project);
      } else {
        // Reset activity when no project is selected
        this.timesheetactivity = "";
        this.timesheetitemsactivity = [];
      }
    },
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
    getTimesheetHeaders(dailyCheck) {
      this.timeSheetHeaders = [
        {
          title: "Project Name",
          key: "project_name",
          sortable: false,
        },
        { title: "Activity", key: "activity_name", sortable: false },
        { title: "Time Spent", key: "work_duartion", sortable: false },
        { title: "Comments", key: "comments", sortable: false },
        { title: "Attachments", key: "timesheet_images" }, // important
        { title: "Actions", key: "actions", sortable: false },
      ];

      if (dailyCheck) {
        this.timeSheetHeaders.unshift({
          title: "Date",
          key: "timesheet_from_date",
          sortable: false,
        });
      }
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
      // Extract relevant information from new data
      const {
        work_duration: newWorkDuration,
        timesheet_from_date: newFromDate,
      } = newData;

      // Calculate total work duration for the given date
      const totalDurationForDate = existingData.reduce((total, data) => {
        if (data.timesheet_from_date === newFromDate) {
          var newduration = data.work_duartion;

          total += this.parseDuration(newduration);
        }

        return total;
      }, 0);

      // Add the duration of the new data
      const newTotalDuration =
        totalDurationForDate + this.parseDuration(newData.work_duartion);

      // Convert maxDuration to minutes
      const maxDurationInMinutes = this.parseDuration(maxDuration);

      // Check if the new total duration exceeds the maximum duration
      if (newTotalDuration > maxDurationInMinutes) {
        return false; // Duration exceeds maximum
      }

      // If duration is within limits, add the new data
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
          this.totalDuration = this.removeSeconds(duration);
          this.weekoffdata = response.data.week_off_details;
          this.attedencedata = response.data.userAttendenceData;
          this.OrganisationDuartion = response.data.organization_duration_work;
          this.userWorkduration = response.data.user_worked_duration;
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async getdaily_duration(date) {
      if (!date) return;

      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(get_total_work_duartion, {
            input: {
              organization_id: data.organization.organization_id,
              user_id: data.user.user_id,
              timesheet_from_date: date,
              action_type: "DAILY",
            },
          })
        );

        var response = JSON.parse(result.data.get_total_work_duartion);

        if (response.Status == "SUCCESS") {
          this.userdailyduartion = this.removeSeconds(
            response.data.user_daily_worked_data
          );
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    removeSeconds(duration) {
      // Split the duration string into hours, minutes, and seconds
      const [hours, minutes, seconds] = duration.split(" ");

      // Remove the seconds portion
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

        var response = JSON.parse(result.data.get_projects);
        this.projectdata = response.data;
        if (this.projectdata.length > 0) {
          this.timesheetitemsProject = this.projectdata
            .filter(
              (element) =>
                !element.project_source ||
                element.project_source === "TIMESHEET"
            )
            .map((element) => ({
              text: element.project_name,
              value: element.project_id,
            }));
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    extractProjectActivities(projectId) {
      this.timesheetactivity = "";
      this.timesheetitemsactivity = [];

      // Check if projectId is null or undefined
      if (!projectId || !projectId.text) {
        console.warn("Project ID is null or invalid");
        return;
      }

      const sourceData =
        this.ProjectList && this.ProjectList.length > 0
          ? this.ProjectList
          : this.projectdata;

      // Check if sourceData exists and is an array
      if (!sourceData || !Array.isArray(sourceData)) {
        console.warn("Source data is not available or not an array");
        return;
      }

      sourceData.forEach((obj) => {
        if (obj && obj.project_name === projectId.text) {
          if (obj.project_activities && Array.isArray(obj.project_activities)) {
            const sortedActivities = obj.project_activities
              .slice()
              .sort((a, b) => a.localeCompare(b));

            this.timesheetitemsactivity.push(...sortedActivities);
          }
        }
      });
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
      this.safeFormReset();
      this.timefilleditems = [];
      this.$emit("update:timesheetEdition", false);
    },
    async updatedaterange() {
      this.daterangeSelected = true;

      let newArray = [];

      newArray = this.date.filter((item) => item !== "");

      if (!this.areDatesIncreasing(newArray)) {
        let temp = newArray[0];
        newArray[0] = newArray[1];
        newArray[1] = temp;
      }

      await this.get_duration(newArray);
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
      }
      this.safeFormReset();
    },
    areDatesIncreasing(datesArray) {
      for (let i = 0; i < datesArray.length - 1; i++) {
        if (datesArray[i] > datesArray[i + 1]) {
          return false;
        }
      }
      return true;
    },
    open_delete(item) {
      const index = this.timefilleditems.indexOf(item);
      if (index !== -1) {
        this.timefilleditems.splice(index, 1);
      }
    },
    async add_mutation() {
      if (!this.$refs.form || !this.daterangeSelected) return;

      const { valid } = await this.$refs.form.validate();
      if (!valid) return;

      this.addLoading = true;

      try {
        // Upload files
        let uploadedImages = [];

        if (this.attachments && this.attachments.length > 0) {
          for (let i = 0; i < this.attachments.length && i < 3; i++) {
            const file = this.attachments[i];

            const key = `timesheets/${crypto.randomUUID()}_${file.name}`;

            const uploadedUrl = await uploadToS3(file, this.orgDetails, key);

            uploadedImages.push(uploadedUrl);
          }
        }

        // ✅ store only actual images
        const timesheet_images = uploadedImages;

        let data = {
          project_id: this.timesheetProject.value,
          activity_name: this.timesheetactivity,
          project_name: this.timesheetProject.text,
          work_duartion: this.timesheethour + "h " + this.timesheetmin + "m",
          timesheet_from_date: this.timeSheetdate || this.date[0],
          timesheet_to_date:
            this.timeSheetdate || this.date[this.date.length - 1],
          comments:
            this.commentstimesheet == "" || this.commentstimesheet == null
              ? "N/A"
              : this.commentstimesheet,
          timesheet_images,
        };

        this.timefilleditems.push(data);

        this.safeFormReset();
        this.attachments = [];

        this.addLoading = false;
      } catch (error) {
        this.addLoading = false;
        this.$emit("errorMsg", "File upload failed");
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
      if (this.timefilleditems && this.timefilleditems.length > 0) {
        this.timefilleditems.forEach((existingEntry) => {
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

        this.timefilleditems.push(entry);
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
    async validate_data(actionType) {
      if (actionType === "SUBMIT_DRAFT") {
        this.draftLoading = true;
      }

      if (actionType === "UPDATE_DETAILS") {
        this.submitLoading = true;
      }

      // determine draft flag
      const isDraft = actionType === "SUBMIT_DRAFT";

      // ✅ Check only when final save
      if (actionType === "UPDATE_DETAILS" && this.dailyCheck === true) {
        const recordsDates = new Set();

        this.timefilleditems.forEach((record) => {
          recordsDates.add(record.timesheet_from_date);
        });

        const missingDates = this.timeSheetdateitems.filter(
          (date) => !recordsDates.has(date)
        );

        if (missingDates.length > 0) {
          this.$emit(
            "errorMsg",
            `The timesheet has not been entered for this date ${missingDates.join(
              ", "
            )}`
          );

          this.draftLoading = false;
          this.submitLoading = false;
          return;
        }
      }

      try {
        let result = await API.graphql(
          graphqlOperation(update_timesheet, {
            input: {
              timesheet_id: this.timesheetitems.timesheet_id,
              action_type: actionType,
              timesheet_details: this.timefilleditems,
              is_draft: isDraft, // ✅ added here
            },
          })
        );

        var response = JSON.parse(result.data.update_timesheet);

        this.draftLoading = false;
        this.submitLoading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("usertimesheet", "dataValue");
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.draftLoading = false;
        this.submitLoading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>