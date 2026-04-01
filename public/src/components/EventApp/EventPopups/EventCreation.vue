<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="createEvent"
      @update:model-value="createEvent = $event"
      persistent
      max-width="600"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Create Event</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="">
              <v-col cols="12">
                <v-text-field
                  v-model="eventName"
                  label="Event Name"
                  :rules="[(v) => !!v || 'Required ']"
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="eventDescription"
                  label="Event Description"
                  :rules="[(v) => !!v || 'Required ']"
                  density="compact"
                  variant="outlined"
                  rows="1"
                ></v-textarea>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="fromDate"
                  :rules="[(v) => !!v || 'Required ']"
                  label="From Date"
                  readonly
                  density="compact"
                  variant="outlined"
                  @click="datePicker = true"
                >
                  <v-dialog v-model="datePicker" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempDate"
                        :min="minDate"
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
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="startTime"
                  :active="startMenu"
                  :focused="startMenu"
                  :rules="[(v) => !!v || 'Required ']"
                  density="compact"
                  variant="outlined"
                  class="ml-2"
                  label="Start Time"
                  readonly
                >
                  <v-dialog v-model="startMenu" activator="parent" width="auto">
                    <v-time-picker
                      v-if="startMenu"
                      v-model="startTime"
                      format="24hr"
                      full-width
                      color="#DB4C77"
                      v-on:click="cleartime()"
                      @click:minute="save(startTime)"
                    ></v-time-picker>
                  </v-dialog>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  label="To Date"
                  variant="outlined"
                  density="compact"
                  v-model="toDate"
                  @click="datePickerTo = true"
                  :rules="[(v) => !!v || 'Required ']"
                  readonly
                >
                  <v-dialog v-model="datePickerTo" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempDateTo"
                        :min="fromDate"
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
                </v-text-field>
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="endTime"
                  :active="endTimeMenu"
                  :focused="endTimeMenu"
                  :rules="[(v) => !!v || 'Required ']"
                  density="compact"
                  variant="outlined"
                  class="ml-2"
                  label="End Time"
                  readonly
                >
                  <v-dialog
                    v-model="endTimeMenu"
                    activator="parent"
                    width="auto"
                  >
                    <v-time-picker
                      v-if="endTimeMenu"
                      v-model="endTime"
                      format="24hr"
                      full-width
                      :min="fromDate == toDate ? startTime : ''"
                      color="#DB4C77"
                      @click:minute="save(endTime)"
                    ></v-time-picker>
                  </v-dialog>
                </v-text-field>
              </v-col>
              <v-col class="mt-n1 ml-n1" cols="12">
                <div class="text-left mt-n2 ml-2" style="font-size: 15px">
                  <span>Event Visibilty</span>
                </div>
                <v-row class="ml-1">
                  <v-radio-group
                    :rules="[(v) => !!v || 'Required ']"
                    v-model="locationupdate"
                    @change="locationCheck()"
                    inline
                    color="primary"
                    class="mt-3"
                  >
                    <v-radio label="All Members" value="ALL_MEMBERS"></v-radio>
                    <v-radio
                      label="Based on location"
                      value="RESTRICTED_LOCATIONS"
                    ></v-radio>
                  </v-radio-group>
                </v-row>

                <v-autocomplete
                  v-model="loaction"
                  multiple
                  rows="1"
                  v-if="locationupdate == 'RESTRICTED_LOCATIONS'"
                  label="Location"
                  :items="loactionitems"
                  :search-input.sync="searchloc"
                  :rules="
                    locationupdate == 'RESTRICTED_LOCATIONS'
                      ? [
                          (v) =>
                            v.length > 0 || 'At least one location is required',
                        ]
                      : []
                  "
                  hide-no-data
                  style="max-width: 240px"
                  class="mt-1"
                  item-text="title"
                  item-value="location_id"
                  density="compact"
                  row="1"
                  variant="outlined"
                />
              </v-col>
              <v-col class="mt-1" cols="6">
                <div class="text-left mt-1" style="font-size: 15px">
                  <span>Location</span>
                </div>
                <v-radio-group
                  :rules="[(v) => !!v || 'Required ']"
                  v-model="locationSelection"
                  inline
                  color="primary"
                  class=""
                >
                  <v-radio label="Physical " value="physicalLoc"></v-radio>
                  <v-radio label="Virtual " value="virtualLoc"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col class="mt-1" cols="6">
                <div class="text-left mt-1 ml-2" style="font-size: 15px">
                  <span>Event Registration</span>
                </div>
                <v-radio-group
                  :rules="[(v) => !!v || 'Required ']"
                  v-model="eventRegestrition"
                  class="ml-1"
                  inline
                  color="primary"
                >
                  <v-radio label="Enable" value="enable"></v-radio>
                  <v-radio label="Disable" value="disable"></v-radio>
                </v-radio-group>
              </v-col>

              <v-col v-if="locationSelection == 'physicalLoc'" cols="6">
                <v-textarea
                  v-model="physicalAddress"
                  density="compact"
                  variant="outlined"
                  :rules="
                    locationSelection == 'physicalLoc'
                      ? [(v) => !!v || 'Required ']
                      : []
                  "
                  auto-grow
                  rows="1"
                  label="Address"
                />
              </v-col>
              <v-col v-if="locationSelection == 'virtualLoc'" cols="6">
                <v-textarea
                  v-model="virtualAddress"
                  :rules="
                    locationSelection == 'virtualLoc'
                      ? [(v) => !!v || 'Required ']
                      : []
                  "
                  density="compact"
                  variant="outlined"
                  auto-grow
                  rows="1"
                  label="URL"
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-if="eventRegestrition == 'enable'"
                  v-model="eventCapacity"
                  :rules="
                    eventRegestrition == 'enable'
                      ? [(v) => !!v || 'Required ']
                      : []
                  "
                  class="ml-2"
                  density="compact"
                  variant="outlined"
                  hint="100 Registrations Open"
                  v-on:keypress="is_Number($event)"
                  maxlength="7"
                  label="Event Capacity"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss text-white mt-n5 mr-3"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { create_events } from "@/graphql/mutations.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { API, graphqlOperation } from "aws-amplify";
import { VTimePicker } from 'vuetify/components'


export default {
  components: {
    VTimePicker,
  },
  props: {
    createEvent: Boolean,
  },
  mixins: [get_location_details],
  data() {
    return {
      eventDescription: "",
      eventName: "",
      loaction: [],
      searchloc: "",
      loactionitems: [],
      visibilityobject: {},
      locationupdate: null,
      loading: false,
      fromMenu: false,
      fromDate: "",
      toDate: "",
      toMenu: false,
      locationSelection: null,
      virtualAddress: "",
      physicalAddress: "",
      startMenu: false,
      startTime: "",
      endTimeMenu: false,
      endTime: "",
      eventRegestrition: null,
      eventCapacity: null,
      minDate: new Date().toISOString().split("T")[0],
      datePicker: false,
      date: "",
      datePickerTo: false,
      tempDate: null,
      tempDateTo: null,
      time: null,
    };
  },
  watch: {
    createEvent: {
      async handler() {
        if (this.createEvent == true) {
          await this.get_location_details();
          // await this.fetch_details();
        }
      },
      immediate: true,
    },
  },

  methods: {
    saveDate() {
      if (this.tempDate) {
        this.fromDate = this.formatDate(this.tempDate); // Format and assign tempDate to billdate
      }
      this.datePicker = false; // Close the date picker
    },
    saveDateTo() {
      if (this.tempDateTo) {
        this.toDate = this.formatDate(this.tempDateTo);
      }
      this.datePickerTo = false;
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    fetch_details() {
      this.locationList.forEach((element) => {
        this.loactionitems.push({
          title: element.location_name,
          location_id: element.location_id,
        });
      });
    },
    locationCheck() {
      if (this.locationupdate == "ALL_MEMBERS") {
        this.loaction = [];
      } else {
        this.loaction = [];
        this.loactionitems = [];
        this.locationList.forEach((element) => {
          this.loactionitems.push({
            title: element.location_name,
            location_id: element.location_id,
          });
        });
      }
    },
    cleardata() {
      this.toDate = "";
      this.endTime = "";
    },
    cleartime() {
      this.endTime = "";
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.create_event_info();
      }
    },

    async create_event_info() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      this.visibilityobject = {
        visible_type: this.locationupdate,
        visible_locations: this.loaction,
      };
      try {
        let result = await API.graphql(
          graphqlOperation(create_events, {
            input: {
              event_visibility: this.visibilityobject,
              user_email_id: data.user.user_email_id,
              organization_id: data.organization.organization_id,
              to_date: this.toDate,
              from_date: this.fromDate,
              event_start_time: this.startTime,
              event_end_time: this.endTime,
              event_description: this.eventDescription,
              event_name: this.eventName,
              is_physical:
                this.locationSelection != null &&
                this.locationSelection == "physicalLoc"
                  ? true
                  : false,
              address_or_url:
                this.locationSelection != null &&
                this.locationSelection == "physicalLoc"
                  ? this.physicalAddress != ""
                    ? this.physicalAddress
                    : undefined
                  : this.virtualAddress != ""
                  ? this.virtualAddress
                  : undefined,
              is_register: this.eventRegestrition == "enable" ? true : false,
              event_capcity:
                this.eventRegestrition == "enable"
                  ? parseInt(this.eventCapacity)
                  : 0,
            },
          }),
        );
        var response = JSON.parse(result.data.create_events);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },

    is_Number(evt) {
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
  },
};
</script>
