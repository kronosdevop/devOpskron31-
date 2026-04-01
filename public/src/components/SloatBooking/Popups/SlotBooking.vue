<template>
  <div>
    <OverlayComp :overlay="overlay" />

    <v-card flat >
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-toolbar flat  density="compact">
        <v-toolbar-title>{{ rowInfo.resource_name }}</v-toolbar-title>
        <v-spacer />

        <v-btn
          dark
          size="small"
          class="text-capitalize cardCss"
          @click="back_call()"
        >
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <v-card-text class="mt-n4">
        <v-row>
          <v-col cols="12" sm="6" md="6" class=" ">
            <v-card class="pa-4" flat>
              <div class="text-left mb-4">
                <span class="text-h6 font-weight-bold primary--text">
                  <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                  Resource Details
                </span>
              </div>
              <v-divider class="mb-4" />
              <v-row no-gutters class="justify-start">
                <v-col class="mt-2" cols="4">
                  <div
                    class="text-left font-weight-medium text-body-2 grey--text text--darken-2"
                  >
                    Name
                  </div>
                </v-col>
                <v-col class="mt-2" cols="8">
                  <div class="text-left ml-n8 text-body-2">
                    {{ resourceName }}
                  </div>
                </v-col>
                <v-col cols="4" class="mt-2">
                  <div
                    class="text-left font-weight-medium text-body-2 grey--text text--darken-2"
                  >
                    Description
                  </div>
                </v-col>
                <v-col cols="8" class="mt-2">
                  <div class="text-left ml-n8 text-body-2">
                    {{ resourceDescription }}
                  </div>
                </v-col>
                <v-col cols="4" class="mt-2">
                  <div
                    class="text-left font-weight-medium text-body-2 grey--text text--darken-2"
                  >
                    Available Timings
                  </div>
                </v-col>
                <v-col cols="8" class="mt-2">
                  <div class="text-left ml-n8 text-body-2">
                    {{ formTime }}
                  </div>
                </v-col>
                <v-col cols="4" class="mt-2">
                  <div
                    class="text-left font-weight-medium text-body-2 grey--text text--darken-2"
                  >
                    Booking Time Ahead
                  </div>
                </v-col>
                <v-col cols="8" class="mt-2">
                  <div class="text-left ml-n8 text-body-2">
                    {{ priorBooking }}
                  </div>
                </v-col>
                <v-col cols="4" class="mt-2">
                  <div
                    class="text-left font-weight-medium text-body-2 grey--text text--darken-2"
                  >
                    Slot Duration
                  </div>
                </v-col>
                <v-col cols="8" class="mt-2">
                  <div class="text-left ml-n8 text-body-2">
                    {{
                      slotDuration != "24_Hour"
                        ? slotDuration.replace("_", " ")
                        : "1 Day"
                    }}
                  </div>
                </v-col>
                <v-col cols="4" class="mt-2">
                  <div
                    class="text-left font-weight-medium text-body-2 grey--text text--darken-2"
                  >
                    Price/Slot
                  </div>
                </v-col>
                <v-col cols="8" class="mt-2">
                  <div class="text-left ml-n8 text-body-2">
                    {{
                      slotPayed == true ? paymentCost + " " + currency : "Free"
                    }}
                  </div>
                </v-col>
                <v-col cols="4" class="mt-2">
                  <div
                    class="text-left font-weight-medium text-body-2 grey--text text--darken-2"
                  >
                    Co-ordinator
                  </div>
                </v-col>
                <v-col cols="8" class="mt-2">
                  <div class="text-left ml-n8 text-body-2">
                    {{ cordinatoarMembers }}
                  </div>
                </v-col>
              </v-row>
              <v-divider class="mt-4 mb-4" />
              <div class="text-left mb-4">
                <span class="text-h6 font-weight-bold primary--text">
                  <v-icon class="mr-2" color="primary"
                    >mdi-image-multiple</v-icon
                  >
                  Attachments
                </span>
              </div>
              <v-card
                v-if="landingCheck == true"
                class="mt-2"
                flat
                :style="{ backgroundColor: '#f8f9fa' }"
                rounded="lg"
              >
                <v-row>
                  <v-col
                    v-for="n in imageUrls"
                    :key="n"
                    class="d-flex child-flex mt-2"
                    cols="4"
                  >
                    <v-img
                      :src="n"
                      aspect-ratio="1"
                      class="grey lighten-2 rounded-lg"
                      cover
                    />
                  </v-col>
                </v-row>
              </v-card>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="6" class="">
            <v-card class="pa-4" flat>
              <div class="text-left mb-4">
                <span class="text-h6 font-weight-bold primary--text">
                  <v-icon class="mr-2" color="primary"
                    >mdi-calendar-check</v-icon
                  >
                  Slots Availability
                </span>
              </div>
              <v-divider class="mb-4" />
              <v-row class="mt-2" justify="start">
                <v-chip-group
                  v-if="slotDuration != '24_Hour'"
                  v-model="selectedTime"
                  active-class="primary white--text"
                  mandatory
                >
                  <v-chip
                    v-for="(timeSlot, index) in currentDateInfo"
                    :key="index"
                    @click="selectTime(timeSlot)"
                    class="ma-1"
                    x-large
                    label
                    :color="selectedTime === index ? 'primary' : 'white'"
                    :text-color="selectedTime === index ? 'white' : 'white'"
                    :style="{
                      minWidth: '60px',
                      minHeight: '80px',
                      fontSize: '16px',
                    }"
                  >
                    <div class="time-slot">
                      <h6 class="font-weight-medium">
                        {{ timeSlot.currentMonth }}<br />
                        {{ timeSlot.currentDate }} <br />
                        {{ timeSlot.currentDay }}
                      </h6>
                    </div>
                  </v-chip>
                </v-chip-group>
              </v-row>
              <v-divider v-if="slotDuration != '24_Hour'" class="mt-4" />
              <v-card-text>
                <v-row
                  ><v-spacer />
                  <div v-if="slotDuration != '24_Hour'">
                    <v-icon @click="open_infodailog()" color="primary"
                      >mdi-information-variant-circle-outline</v-icon
                    >
                  </div></v-row
                >

                <v-row v-if="queryCheck == true" justify="start" class="mt-4">
                  <!-- <v-col cols="12"> -->
                  <v-card
                    flat
                    :height="heightCard"
                    style="overflow-y: auto"
                    :style="{ backgroundColor: '#f8f9fa' }"
                    rounded="lg"
                  >
                    <v-chip-group
                      v-if="slotDuration != '24_Hour'"
                      v-model="slotAvalibility"
                      multiple
                      active-class="primary white--text"
                      column
                    >
                      <v-card-text>
                        <v-chip
                          v-for="(slot, index) in availableSlots"
                          :key="index"
                          @click="selected_slot(slot)"
                          class="m-1 left-align"
                          x-large
                          :style="{
                            width: '180px',
                            height: '60px',
                            fontSize: '14px',
                          }"
                          :value="slot"
                          :disabled="!slot.availability"
                          :color="
                            slot.availability
                              ? 'grey lighten-4'
                              : 'red lighten-5'
                          "
                          :text-color="
                            slot.availability ? 'grey darken-2' : 'red darken-2'
                          "
                          label
                        >
                          <div class="text-left">
                            <h6 class="font-weight-medium">
                              {{
                                fetch_epoch_conversion(slot.start_epoch) +
                                " - " +
                                fetch_epoch_conversion(slot.end_epoch)
                              }}
                              <br />
                              <span v-if="!slot.availability" class="caption">
                                {{
                                  slot.booked_user.user_name != undefined
                                    ? "Booked By: " + slot.booked_user.user_name
                                    : "Blocked"
                                }}
                              </span>
                            </h6>
                          </div>
                        </v-chip>
                      </v-card-text>
                    </v-chip-group>
                  </v-card>
                  <v-card
                    v-if="slotDuration == '24_Hour'"
                    flat
                    :height="calenderCard"
                    style="overflow-y: auto"
                    rounded="lg"
                  >
                    <div>
                      <v-toolbar
                        dense
                        class="mb-4"
                        rounded="lg"
                        color="grey lighten-4"
                      >
                        <v-avatar class="mt-n0" color="green" size="12" />
                        <span class="ml-2 text-body-2 grey--text text--darken-2"
                          >Booked</span
                        >
                        <v-avatar class="mt-n0 ml-4" color="red" size="12" />
                        <span class="ml-2 text-body-2 grey--text text--darken-2"
                          >Blocked</span
                        >
                        <v-spacer />
                        <v-icon @click="get_booking_history()"
                          >mdi-information</v-icon
                        >
                      </v-toolbar>
                      <v-row no-gutters>
                        <v-col cols="12" sm="6">
                          <v-date-picker
                            v-model="dates"
                            full-width
                            range
                            :min="minDate"
                            :events="bookedDates"
                            :allowed-dates="allowDates"
                            :event-color="getEventColor"
                            class="mt-4"
                            @update:model-value="onDateChange"
                            @input="onDateChange"
                          ></v-date-picker>
                        </v-col>
                        <v-col cols="12" sm="5">
                          <v-text-field
                            v-model="dateRangeText"
                            label="Date Range"
                            prepend-icon="mdi-calendar"
                            readonly
                            class="mt-4"
                            variant="outlined"
                            density="compact"
                          ></v-text-field>
                          <v-btn
                            depressed
                            size="small"
                            :disabled="dates.length == 0"
                            :loading="loading1"
                            @click="book_slot()"
                            dark
                            class="cardCss ma-4"
                          >
                            Book Slot
                          </v-btn>
                        </v-col>
                      </v-row>
                    </div>
                  </v-card>
                </v-row>
              </v-card-text>

              <v-card-text> </v-card-text>
              <v-card-actions class="justify-end">
                <v-btn
                  v-if="slotDuration != '24_Hour'"
                  depressed
                  size="small"
                  :loading="loading1"
                  @click="book_slot()"
                  :disabled="!slotSelected"
                  dark
                  class="cardCss"
                >
                  Book Slot
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <ConfirmBooking
        :rowInfo="rowInfo"
        :slotInfo="slotInfo"
        :slotDuration="slotDuration"
        :bookSlotConfirm="bookSlotConfirm"
        :selectedValue="selectedValue"
        :selectedNewDate="selectedNewDate"
        :slotAvalibility="slotAvalibility"
        :selectedRange="selectedRange"
        @clicked="bookSlotConfirm = false"
        v-on:errorMsg="error_info"
        v-on:SuccessMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <BookedSlots
        :bookedByDialog="bookedByDialog"
        :allDates="allDates"
        @clicked="bookedByDialog = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <SloatBook
        :bookslotview="bookslotview"
        @clicked="bookslotview = false"
        :sloatitems="sloatitems"
        :selectedValue="selectedValue"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { edit_and_get_delete_resource } from "@/graphql/mutations.js";
import { booking_available_for_resource } from "@/graphql/queries.js";
import ConfirmBooking from "@/components/SloatBooking/Popups/ConfirmBooking.vue";
import SloatBook from "@/components/SloatBooking/Popups/SloatBook.vue";
import BookedSlots from "@/components/SloatBooking/Popups/BookedSlots.vue";

import { API, graphqlOperation } from "aws-amplify";
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";
var axios = require("axios");
var AWS = require("aws-sdk");
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  props: {
    rowInfo: Object,
  },

  components: {
    OverlayComp,
    ConfirmBooking,
    SnackBar,
    BookedSlots,
    SloatBook,
  },
  data() {
    return {
      SnackBarComponent: {},
      date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .substr(0, 10),
      pickerDate: null,
      selection: null,
      timeSlots: [],
      selectedTime: 0,
      resourceName: "",
      resourceDescription: "",
      formTime: "",
      toTime: "",
      slots: "",
      priorBooking: "",
      paymentCost: "",
      currency: "",
      cordinatoarMembers: "",
      slotPayed: "",
      overlay: false,
      imageUrls: [],
      currentDateInfo: [],
      slotDuration: "",
      selectedValue: "",
      availableSlots: [],
      slotAvalibility: [],
      queryCheck: false,
      heightCard: 0,
      slotAvialble: true,
      notAvalibale: false,
      loading1: false,
      bookSlotConfirm: false,
      componentCheck: 0,
      slotInfo: {},
      slotChange: false,
      slotSelected: false,
      attchmentHeight: 0,
      newSlot: "",
      landingCheck: false,
      dates: [],
      menu: false,
      minDate: this.getYesterday(),
      selectedRange: [],
      maxDate: this.getYesterday(),
      bookedDates: [],
      allDates: [],
      calenderCard: 0,
      bookedByDialog: false,
      bookslotview: false,
      sloatitems: [],
      selectedNewDate: "",
    };
  },
  computed: {
    dateRangeText() {
      // console.log(this.dates);
      return Array.isArray(this.dates) ? this.dates.join(" ~ ") : "";
    },
  },
  async created() {
    this.heightCard = window.innerHeight - 430;
    this.calenderCard = window.innerHeight - 270;
    // this.attchmentHeight = window.innerHeight - 100;
    this.fetch_time_slots();
    this.fecth_calender_days();
    this.slotChange = false;
    this.overlay = true;
    this.landingCheck = false;
    this.slotDuration = "";
    this.selectedNewDate = new Date().toISOString().split("T")[0];

    await this.get_resource_details();
    await this.fetch_available_slots();
    this.queryCheck = true;
    this.overlay = false;
  },

  methods: {
    getYesterday() {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() + 1);
      return yesterday.toISOString().split("T")[0];
    },
    open_infodailog() {
      this.componentCheck = 3;
      this.bookslotview = true;
    },
    get_booking_history() {
      this.componentCheck = 2;
      this.bookedByDialog = true;
    },

    onDateChange(newDates) {
      // Convert newDates to array and format dates to YYYY-MM-DD
      if (Array.isArray(newDates)) {
        this.selectedRange = newDates.map(date => {
          if (date instanceof Date) {
            return date.toISOString().split('T')[0];
          } else if (typeof date === 'string' && date.includes('T')) {
            return date.split('T')[0];
          }
          return date;
        });
      } else if (newDates) {
        // If it's a single date, convert to array
        let formattedDate;
        if (newDates instanceof Date) {
          formattedDate = newDates.toISOString().split('T')[0];
        } else if (typeof newDates === 'string' && newDates.includes('T')) {
          formattedDate = newDates.split('T')[0];
        } else {
          formattedDate = newDates;
        }
        this.selectedRange = [formattedDate];
      } else {
        this.selectedRange = [];
      }
    },

    isCurrentDate(timeSlot) {
      const currentDate = new Date();
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
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
      ];

      const timeSlotDate = new Date(
        currentDate.getFullYear(),
        months.indexOf(timeSlot.currentMonth),
        timeSlot.currentDate
      );
      return currentDate.toDateString() === timeSlotDate.toDateString();
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.dates = [];
      this.slotSelected = false;
      this.bookSlotConfirm = false;
      this.fetch_available_slots();
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

    selected_slot(slot) {
      this.slotSelected = true;
      // console.log(this.slotSelected);
      this.slotInfo = slot;
    },

    isSlotDisabled(selectedSlot, lastSelectedSlot) {
      if (!lastSelectedSlot) {
        return false;
      }

      const selectedSlotIndex = this.availableSlots.indexOf(selectedSlot);
      const lastSelectedIndex = this.availableSlots.indexOf(lastSelectedSlot);
      return Math.abs(selectedSlotIndex - lastSelectedIndex) > 1;
    },

    book_slot() {
      this.componentCheck = 1;
      this.bookSlotConfirm = true;
    },

    back_call() {
      this.$emit("backACtion", 0);
    },

    fecth_calender_days() {
      const currentDate = new Date();
      const nextMonthFirstDay = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
      const lastDayOfNextMonth = new Date(
        nextMonthFirstDay.getFullYear(),
        nextMonthFirstDay.getMonth() + 1,
        0
      );

      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 2,
        0
      );
      this.currentDateInfo = [];
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
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
      ];

      while (currentDate <= lastDayOfNextMonth) {
        const currentDayOfWeek = daysOfWeek[currentDate.getDay()];
        const currentDayOfMonth = currentDate.getDate();
        const currentMonth = months[currentDate.getMonth()];
        const formattedDate = currentDate.toISOString().split("T")[0];

        this.currentDateInfo.push({
          currentDate: currentDayOfMonth,
          currentMonth: currentMonth,
          currentDay: currentDayOfWeek,
          formattedDate: formattedDate,
        });

        currentDate.setDate(currentDate.getDate() + 1); // Increment date by one day
      }

      // Select the first time slot by default
      if (this.currentDateInfo.length > 0) {
        this.selectTime(this.currentDateInfo[0]);
      }
    },

    fetch_time_slots() {
      this.timeSlots = [];
      const selectedDate = new Date(this.date);
      const startTime = "09:30";
      const endTime = "24:00";
      const startDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        parseInt(startTime.split(":")[0]),
        parseInt(startTime.split(":")[1])
      );
      const endDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        parseInt(endTime.split(":")[0]),
        parseInt(endTime.split(":")[1])
      );
      while (startDate <= endDate) {
        // Format the time
        const formattedTime = startDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        // Add the formatted time to the array
        this.timeSlots.push(formattedTime);

        // Increment time by 30 minutes
        startDate.setMinutes(startDate.getMinutes() + 30);
      }
    },

    async fetch_url(response) {
      const rawUrl = response;
      const details = this.$store.getters.GetOrgDetails;
      // const s3_details =
      if (!rawUrl || !details || !details.s3_details) {
        // console.warn("Missing required data for signed URL");
        return;
      }
      const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
      if (signedUrl) {
        data.push(signedUrl);
        return data;
      }
      // var data = [];
      // var self = this;
      // var deatils = self.$store.getters.GetOrgDetails;
      // var s3Bucket = new AWS.S3({
      //   region: deatils.s3_details.region,
      //   accessKeyId: deatils.s3_details.access_key,
      //   secretAccessKey: deatils.s3_details.secret_key,
      //   signatureVersion: "v4",
      // });
      // this.signimagesarrayurls = [];
      // response.forEach((preSignedUrl) => {
      //   var params = {
      //     Bucket: deatils.s3_details.bucket_name,
      //     Key: "resources/" + preSignedUrl.split("resources/")[1],
      //     Expires: 60000 * 5,
      //   };

      //   var url = s3Bucket.getSignedUrl("getObject", params);
      //   data.push(url); // Push the normal URL into the array
      // });

      // return data;
    },

    async get_resource_details() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_and_get_delete_resource, {
            input: {
              action_type: "GET",
              organization_id: data.organization.organization_id,
              resource_id: this.rowInfo.resource_id,
            },
          })
        );

        var response = JSON.parse(result.data.edit_and_get_delete_resource);

        this.imageUrls = [];
        if (response.Status == "SUCCESS") {
          this.imageUrls = [];
          await this.check_private_public_urls(response.data.resource_images);
          this.landingCheck = true;
          this.resourceName = response.data.resource_name;
          this.resourceDescription = response.data.resource_description;
          this.formTime = response.data.resource_open_time;
          this.slotDuration = response.data.resource_slot_duration;
          this.slots = response.data.resource_slot_duration;
          this.priorBooking =
            response.data.resource_booking_time_ahead != undefined
              ? response.data.resource_booking_time_ahead.split("_").join(" ")
              : "";

          this.slotPayed = response.data.is_resource_slot_paid;
          this.paymentCost =
            response.data.is_resource_slot_paid == true
              ? response.data.resource_slot_price
              : "";
          this.currency =
            response.data.is_resource_slot_paid == true
              ? response.data.resource_amount_type
              : "";
          this.cordinatoarMembers =
            response.data.resource_slot_cordinators.length != 0
              ? response.data.resource_slot_cordinators[0].full_user_name
              : "";

          this.overlay = false;
        } else {
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

    async check_private_public_urls(dataUrls) {
      for (const url of dataUrls) {
        try {
          const response = await axios.head(url);

          if (response.status === 200) {
            this.imageUrls.push(url);
          }
        } catch (error) {
          if (error.response && error.response.status === 403) {
            this.fetch_presigned(url);
          } else {
          }
        }
      }
    },

    async fetch_presigned(url) {
      const rawUrl = url;
      const details = this.$store.getters.GetOrgDetails;
      // const s3_details =
      if (!rawUrl || !details || !details.s3_details) {
        // console.warn("Missing required data for signed URL");
        return;
      }
      const signedUrl = await getS3SignedUrl(rawUrl, details.s3_details);
      if (signedUrl) {
        this.imageUrls.push(signedUrl);
        return signedUrl;
      }
      // var self = this;
      // var response = self.$store.getters.GetOrgDetails;
      // var s3Bucket = new AWS.S3({
      //   region: response.s3_details.region,
      //   accessKeyId: response.s3_details.access_key,
      //   secretAccessKey: response.s3_details.secret_key,
      //   signatureVersion: "v4",
      // });

      // var params = {
      //   Bucket: response.s3_details.bucket_name,
      //   Key: "resources/" + url.split("resources/")[1],
      //   Expires: 60000 * 5,
      // };
      // var url = s3Bucket.getSignedUrl("getObject", params);

      // this.imageUrls.push(url);
    },

    async fetch_available_slots() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(booking_available_for_resource, {
            input: {
              current_time_date: this.fetch_current_date("all"),
              resource_id: this.rowInfo.resource_id,
              organization_id: data.organization.organization_id,
              selected_date:
                this.slotDuration != "24_Hour"
                  ? this.slotChange == true
                    ? this.newSlot
                    : this.selectedValue
                  : undefined,
              user_id: data.user.user_id,
              offset: new Date().getTimezoneOffset() * 60,
              year_month: this.fetch_current_month(),
            },
          })
        );

        var response = JSON.parse(result.data.booking_available_for_resource);

        this.availableSlots = [];
        this.allDates = [];
        if (response.Status == "SUCCESS") {
          if (this.slotDuration == "24_Hour") {
            this.allDates = response.data;
            this.sloatitems = response.data;

            this.fetch_booked_slots(response.data);
          } else {
            this.availableSlots = response.data;
            this.sloatitems = response.data;
          }
        } else {
          this.availableSlots = [];
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    fetch_booked_slots(value) {
      value.forEach((element) => {
        if (element.availability == false) {
          this.bookedDates.push(element.date);
        }
      });
    },

    allowDates(date) {
      // Convert the date to YYYY-MM-DD format for comparison
      const formattedDate = date;
      return !this.bookedDates.includes(formattedDate);
    },
    getEventColor(date) {
      const filteredArray = this.allDates.filter(
        (obj) => obj.booking_now == "BLOCKED" || obj.booking_now == "BOOKED"
      );
      const updatedArray = filteredArray.map((obj) => {
        let color;
        if (obj.booking_now === "BOOKED") {
          color = "green";
        } else if (obj.booking_now === "BLOCKED") {
          color = "red";
        } else {
          color = "gray";
        }
        return { ...obj, color };
      });

      const event = updatedArray.find((event) => event.date === date);
      if (event) {
        return event.color;
      }
    },
    fetch_epoch_conversion(value) {
      const timestamp = value; // Unix timestamp in seconds
      const date = new Date(timestamp * 1000); // Convert seconds to milliseconds

      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "pm" : "am";

      const formattedHours = hours % 12 || 12; // Convert midnight (0 hours) to 12 AM
      const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

      const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

      return formattedTime;
    },

    fetch_current_date(val) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
      const day = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      this.selectedValue = formattedDate;
      return formattedDate;
    },

    fetch_current_month() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
      const day = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}`;
      return formattedDate;
    },

    selectTime(val) {
      this.slotChange = true;
      this.newSlot = val.formattedDate;
      this.selectedNewDate = val.formattedDate;
      this.fetch_available_slots();
    },
  },
};
</script>
<style scoped>
.time-slot {
  width: 100%; /* Makes each div take up the full width of the chip */
  text-align: center; /* Centers the text within each div */
}
.left-align {
  text-align: left !important; /* Align text to the left */
}

/* Enhanced active button styling */
.v-chip-group .v-chip {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.v-chip-group .v-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.v-chip-group .v-chip.v-chip--active {
  box-shadow: #db4c77;
  font-weight: bold;
  color: white !important;
}

/* Selected slot highlighting */
.v-chip-group .v-chip.v-chip--selected {
  background: #db4c77 !important;
  color: white !important;
  transform: translateY(-3px);
  font-weight: bold;
}

/* Card styling improvements */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

/* Typography improvements */
.primary--text {
  color: #1976d2 !important;
}

.success--text {
  color: #4caf50 !important;
}

.font-weight-medium {
  font-weight: 500;
}

.font-weight-bold {
  font-weight: 700;
}

/* Better visual hierarchy */
.text-body-2 {
  line-height: 1.5;
}

.grey--text.text--darken-2 {
  color: #424242 !important;
}

/* Enhanced spacing and typography */
.v-divider {
  opacity: 0.3;
}

/* Improved card styling */
.v-card.rounded-lg {
  border-radius: 12px !important;
}

/* Slot availability styling */
.v-chip[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.v-chip:not([disabled]):hover {
  cursor: pointer;
}

/* Calendar toolbar improvements */
.v-toolbar {
  border-radius: 8px;
}

/* Image gallery improvements */
.v-img.rounded-lg {
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.v-img.rounded-lg:hover {
  transform: scale(1.05);
}

/* Enhanced chip sizing */
.v-chip.x-large {
  min-height: 60px !important;
  padding: 12px 16px !important;
}

/* Better slot selection feedback */
.v-chip-group .v-chip.v-chip--active .time-slot h6,
.v-chip-group .v-chip.v-chip--selected .time-slot h6 {
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
