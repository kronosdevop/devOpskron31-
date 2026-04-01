<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="GuesthouseDetail" @update:model-value="$emit('update:GuesthouseDetail', $event)"
      persistent
      max-width="750
            "
      transition="dialog-top-transition"
    >
      <v-card v-if="component == 1">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="custom-title ml-2">
            {{ ViewInfo.name }}
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-2">
          <v-row>
            <v-col cols="12" sm="12" class="justify-center">
              <v-carousel
              v-if="items.length > 0"
              v-model="currentIndex"
              height="300px"
              :cycle = "cycle"
              :show-arrows="false"
              hide-delimiter-background
              delimiter-icon="mdi-minus" 
            >
              <v-carousel-item
                v-for="(item, index) in items"
                :key="index"
                @click="showAllImages = !showAllImages"
              >
                <v-img :src="item.imageUrl" height="300px" cover></v-img>
              </v-carousel-item>
            </v-carousel>

              <!-- <v-card
                v-if="items.length > 0"
                @click="showAllImages = !showAllImages"
              >
                <v-img
                  :src="items[currentIndex]?.imageUrl"
                  height="300px"
                  cover
                ></v-img>
              </v-card> -->
            </v-col>
          </v-row>
          <v-row v-if="showAllImages">
            <v-col v-for="(item, index) in items" :key="index" cols="12">
              <v-card>
                <v-img :src="item.imageUrl" height="150px" cover></v-img>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <span
            class="d-flex justify-space-between align-center mt-n4"
            style="font-size: large"
          >
            <b>Reservation Details</b>
          </span>
          <span class="d-flex align-center mt-2" style="font-size: small">
            {{
              ViewInfo.cost
                ? `₹${totalAmountFormatted} (for ${totalNights} nights)`
                : `${totalNights} Nights`
            }}
          </span>
          <v-row class="mt-2">
            <v-col cols="12">
              <div class="d-flex flex-wrap align-center gap-2">
                <v-text-field
                  label="Check In & Check Out"
                  outlined
                  dense
                  v-model="computedDateRange"
                  append-icon="mdi-calendar"
                  readonly
                  @click="datePicker = true"
                  :error="dateError"
                  :error-messages="
                    dateError ? 'Please select a date range' : ''
                  "
                ></v-text-field>

                <v-dialog :model-value="datePicker" @update:model-value="$emit('update:datePicker', $event)" persistent max-width="298">
                  <v-card>
                    <v-date-picker
                      v-model="selectedRange"
                      color="primaryColor"
                      range
                      :min="new Date().toISOString().substr(0, 10)"
                      :allowed-dates="isDateAllowed"
                      @update:picker-date="updatePickedMonth"
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
            </v-col>
          </v-row>
          <v-expansion-panels class="mt-n6">
            <v-expansion-panel>
              <v-expansion-panel-header>
                <div>
                  <span style="font-size: large">Guests</span>
                  <br />
                  <span style="font-size: small" class="mt-n4"
                    >{{ totalGuests }} Guests</span
                  >
                </div>
              </v-expansion-panel-header>

              <v-expansion-panel-content>
                <v-row align="center">
                  <div>
                    <span class="ml-3" style="font-size: large">Adults</span>
                    <br />
                    <span style="font-size: small" class="mt-n4 ml-3"
                      >Age 13+</span
                    >
                  </div>
                  <v-spacer />
                  <v-card flat class="d-flex align-center">
                    <v-btn
                      icon
                      small
                      outlined
                      @click="decreaseAdultCount"
                      :disabled="adultcount <= 1"
                    >
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                    <span class="mx-3" style="font-size: 16px">{{
                      adultcount
                    }}</span>
                    <v-btn small outlined icon @click="increaseAdultCount">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-card>
                </v-row>

                <v-row class="mt-4">
                  <div>
                    <span class="ml-3 mt-4" style="font-size: large"
                      >Children</span
                    >
                    <br />
                    <span style="font-size: small" class="mt-n4 ml-3"
                      >Ages 2-12</span
                    >
                  </div>
                  <v-spacer />
                  <v-card flat class="d-flex align-center mt-4">
                    <v-btn
                      icon
                      small
                      outlined
                      @click="decreaseChildrenCount"
                      :disabled="childrencount <= 0"
                    >
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                    <span class="mx-3" style="font-size: 16px">{{
                      childrencount
                    }}</span>
                    <v-btn small outlined icon @click="increaseChildrenCount">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-card>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions class="ma-2">
          <v-btn
            class="text-none mb-4"
            color="primaryColor"
            dark
            dense
            block
            @click="Continue_booking()"
          >
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-if="component == 2">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="custom-title ml-2">
            Fill Your Details
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_confirm()"
            >mdi-arrow-left-circle-outline</v-icon
          >
        </v-toolbar>
        <v-card-title>Please fill the following Details!</v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-text-field
              label="Name"
              outlined
              dense
              class="mt-2"
              v-model="user_name"
              :rules="[requiredRule]"
              required
            ></v-text-field>

            <v-text-field
              label="E-mail Id"
              outlined
              dense
              class="mt-2"
              v-model="email"
              :rules="[requiredRule, emailRules]"
              required
            ></v-text-field>

            <v-text-field
              label="Phone Number"
              outlined
              dense
              v-model="phone"
              :rules="[requiredRule, phoneRules]"
              prepend-inner="+91"
              type="tel"
              maxlength="10"
              class="mt-2"
              @keypress="onlyNumbers"
              required
            ></v-text-field>

            <div v-if="otpVisible == 1">
              <div class="text--left font-weight-medium mt-n2">
                Please enter the OTP sent to your WhatsApp
              </div>
              <v-otp-input v-model="otp" dense length="6"></v-otp-input>
            </div>

            <v-textarea
              label="Comment"
              outlined
              dense
              rows="1"
              class="mt-2"
              v-model="user_comment"
              auto-grow
              :rules="[requiredRule]"
              required
              maxlength="200"
            ></v-textarea>
            <div v-if="otpVisible == 0">
              <v-btn
                :loading="loading"
                class="text-none mt-2"
                color="primaryColor"
                dark
                block
                @click="Verify_number"
              >
                Verify Number
              </v-btn>
            </div>

            <div v-if="otpVisible == 1">
              <v-btn
                :loading="loading"
                class="text-none mt-2"
                color="primaryColor"
                dark
                block
                @click="Verify_otp"
                :disabled="!otp"
              >
                Verify OTP
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import axios from "axios";
import SnackBar from "@/components/SnackBar.vue";

export default {
  props: {
    GuesthouseDetail: Boolean,
    ViewInfo: Object,
  },

  components: {
    SnackBar,
  },

  data() {
    return {
      guest_details: { no_of_adults: "1", no_of_childrens: "0" },
      items: [],
      showAllImages: false,
      currentIndex: 0,
      intervalId: null,
      adultcount: 1,
      childrencount: 0,
      maxAdults: 1,
      maxChildren: 0,
      blockedDates: [],
      bookedDates: [],
      currentMonthYear: this.formatMonthYear(new Date()),
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getFullYear(),
      datePicker: false,
      computedDateFormatted: "",
      selectedRange: [],
      loading: false,
      component: 1,
      dateError: false,
      // form: null,
      user_name: "",
      email: "",
      phone: "",
      user_comment: "",
      isChecked: false,
      otp: "",
      otpVisible: 0,
      SnackBarComponent: {},
      formValid: false,
      // computedDateRange: null,
      cycle: false,
    };
  },

  mounted() {
    this.fetch_datedata();

    if (this.ViewInfo.image && Array.isArray(this.ViewInfo.image)) {
      this.items = this.ViewInfo.image.map((url) => ({ imageUrl: url }));
    }

    // this.intervalId = setInterval(this.goToNextImage, 3000);
    this.guest_details = this.ViewInfo.allowed_guests;
    this.maxAdults = parseInt(this.guest_details.no_of_adults) || 1;
    this.maxChildren = parseInt(this.guest_details.no_of_childrens) || 0;
    this.adultcount = Math.min(this.adultcount, this.maxAdults);
    this.childrencount = Math.min(this.childrencount, this.maxChildren);
  },

  // beforeDestroy() {
  //   clearInterval(this.intervalId);
  // },

  computed: {
    totalGuests() {
      return this.adultcount + this.childrencount;
    },

    computedDateRange() {
      if (Array.isArray(this.selectedRange) && this.selectedRange.length > 0) {
        const sortedDates = [...this.selectedRange].sort(
          (a, b) => new Date(a) - new Date(b)
        );
        return `${this.displayFormatDate(
          sortedDates[0]
        )} to ${this.displayFormatDate(sortedDates[sortedDates.length - 1])}`;
      }
      return "Select Date";
    },

    totalNights() {
      if (!Array.isArray(this.selectedRange) || this.selectedRange.length < 2) {
        return 1;
      }

      const sortedDates = [...this.selectedRange].sort(
        (a, b) => new Date(a) - new Date(b)
      );

      let validNights = 0;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        let currentDate = new Date(sortedDates[i]);
        let nextDate = new Date(sortedDates[i + 1]);

        if (this.isDateAllowed(currentDate) && this.isDateAllowed(nextDate)) {
          validNights += (nextDate - currentDate) / (1000 * 3600 * 24);
        }
      }

      return Math.max(1, Math.floor(validNights));
    },

    totalAmountRaw() {
      if (!Array.isArray(this.selectedRange) || this.selectedRange.length < 2) {
        return Math.round(this.ViewInfo.cost || 0);
      }

      const sortedDates = [...this.selectedRange].sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const checkInDate = new Date(sortedDates[0]);
      const checkOutDate = new Date(sortedDates[sortedDates.length - 1]);

      let nights = (checkOutDate - checkInDate) / (1000 * 3600 * 24);

      return Math.round(nights * (this.ViewInfo.cost || 0));
    },

    totalAmountFormatted() {
      return Math.floor(this.totalAmountRaw).toLocaleString("en-IN");
    },
  },

  methods: {
    displayFormatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${day}-${month}-${year}`;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.component = 1;

      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.reset(); // Reset Vuetify validation
        }
        this.totalGuests = "";
        this.adultcount = 1;
        this.childrencount = 0;
        this.selectedRange = [];
        this.computedDateRange = "";
      });
    },
    // goToNextImage() {
    //   if (this.items.length > 0) {
    //     this.currentIndex = (this.currentIndex + 1) % this.items.length;
    //   }
    // },

    increaseAdultCount() {
      if (this.adultcount < this.maxAdults) {
        this.adultcount++;
      }
    },
    decreaseAdultCount() {
      if (this.adultcount > 1) {
        this.adultcount--;
      }
    },
    increaseChildrenCount() {
      if (this.childrencount < this.maxChildren) {
        this.childrencount++;
      }
    },
    decreaseChildrenCount() {
      if (this.childrencount > 0) {
        this.childrencount--;
      }
    },

    updatePickedMonth(newMonth) {
      this.currentMonthYear = this.formatMonthYear(newMonth);
      this.fetch_datedata();
    },

    formatMonthYear(date) {
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${month}-${year}`;
    },

    async fetch_datedata() {
      try {
        const response = await axios.post(
          "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/guest_house_calender_details",
          {
            month_year: this.currentMonthYear,
            guest_house_no: this.ViewInfo.guest_house_no,
            command: "getGuestHouseCalenderDetails",
            organization_display_id: this.ViewInfo.organization_display_id,
          }
        );

        if (response.data.Status === "SUCCESS") {
          this.bookedDates = response.data.data
            .filter((day) => day.booking_details.length > 0)
            .map((day) => day.calender_date);

          this.blockedDates = response.data.data
            .filter((day) => day.is_blocked)
            .map((day) => day.calender_date);
        }
      } catch (error) {
        // console.error("Error fetching data:", error.response ? error.response.data : error.message);
      }
    },

    saveDate() {
      if (this.selectedRange && this.selectedRange.length === 2) {
        this.computedDateRange = `${this.selectedRange[0]} - ${this.selectedRange[1]}`;
        this.datePicker = false;
        this.dateError = false; // Reset error
      }
    },

    isDateAllowed(date) {
      const formattedDate = this.displayFormatDate(date);
      return !this.bookedDates.includes(formattedDate);
    },
    Continue_booking() {
      if (!this.selectedRange || this.selectedRange.length < 2) {
        this.dateError = true;
        return;
      }
      this.dateError = false;
      this.component = 2;
    },

    close_confirm() {
      this.component = 1;
      this.otpVisible = 0;
      this.otp = "";
      this.isChecked = false;
      this.user_comment = "";
      this.phone = "";
      this.email = "";
      this.user_name = "";
    },

    onlyNumbers(event) {
      if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
      }
    },

    requiredRule(value) {
      return !!value || "This field is required!";
    },
    emailRules(value) {
      const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return pattern.test(value) || "Invalid email format!";
    },

    phoneRules(value) {
      return /^\d{10}$/.test(value) || "Enter a valid 10-digit WhatsApp Number";
    },

    async Verify_number() {
      if (!this.$refs.form) {
        console.error("Form reference is missing.");
        return;
      }

      const isValid = this.$refs.form.validate();
      if (!isValid) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please fill all required fields correctly.",
          timeout: 5000,
          Top: true,
        };
        return;
      }

      this.loading = true;
      try {
        const result = await axios.post(
          "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/verify_external_user",
          {
            action_type: "GENRATE",
            contact_no: this.phone,
            command: "externalUserVerification",
          }
        );

        const response = result.data;
        this.loading = false;

        if (response.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.otpVisible = 1;
        } else {
          // console.log("API response did not return SUCCESS:", response);
        }
      } catch (error) {
        this.loading = false;
        // console.error("Error verifying number:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Unable to send OTP.!",
          timeout: 5000,
          Top: true,
        };
      }
    },

    async Verify_otp() {
      this.loading = true;
      try {
        const result = await axios.post(
          "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/verify_external_user",
          {
            action_type: "VERIFY",
            contact_no: this.phone,
            otp: this.otp,
            command: "externalUserVerification",
          }
        );

        var response = result.data;
        if (response.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          await this.confirmation_booking();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message || "Invalid OTP!",
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        // console.error("Error verifying OTP:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            error.response?.data?.Message ||
            "Something went wrong. Please try again!",
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.loading = false;
      }
    },

    async confirmation_booking() {
      try {
        if (
          Array.isArray(this.selectedRange) &&
          this.selectedRange.length > 0
        ) {
          const sortedDates = [...this.selectedRange]
            .map((date) => new Date(date))
            .sort((a, b) => a - b);

          const result = await axios.post(
            "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/book_guest_house_external",
            {
              month_year: this.currentMonthYear,
              from_date: this.displayFormatDate(sortedDates[0]),
              to_date: this.displayFormatDate(
                sortedDates[sortedDates.length - 1]
              ),
              no_of_guests: this.totalGuests,
              no_of_adults: this.adults,
              no_of_childrens: this.childrencount,
              no_of_nights: this.totalNights,
              user_details: {
                name: this.user_name,
                email: this.email,
                phone_no: Number(this.phone),
              },
              organization_display_id: this.ViewInfo.organization_display_id,
              guest_house_id: this.ViewInfo.guest_house_id,
              total_amount: this.totalAmountRaw,
              comments: this.user_comment,
              command: "bookGuestHouseExternal",
            }
          );

          const response = result.data;
          // console.log("Response:", response);

          if (response.Status === "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.component = 1;
            this.$nextTick(() => {
              if (this.$refs.form) {
                this.$refs.form.reset();
              }
              this.totalGuests = "";
              this.adultcount = 1;
              this.childrencount = 0;
              this.selectedRange = [];
              this.computedDateRange = "";
            });
          } else {
            this.$emit("errorMsg", response.Message);
            this.component = 1;
          }
        } else {
          // console.error("Error: selectedRange is empty or not an array");
          this.$emit("errorMsg", "Please select a valid date range.");
        }
      } catch (error) {
        this.$emit("errorMsg", "Booking failed. Please try again.");
      }
    },
  },
};
</script>
