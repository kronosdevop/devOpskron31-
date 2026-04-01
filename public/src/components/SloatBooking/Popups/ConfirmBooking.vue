<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="bookSlotConfirm"
      @update:model-value="$emit('update:bookSlotConfirm', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card class="rounded-xl">
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2 custom-title"
            >Confirm Booking</v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>

        <v-card-text class="">
          <v-text-field
            density="compact"
            class="mt-4"
            variant="outlined"
            v-model="comments"
            label="Comments"
          />
          <v-select
            variant="outlined"
            density="compact"
            label="Categories"
            v-model="CategoriesName"
            :items="categoriesRecords"
            item-title="title"
            item-value="value"
            return-object
          />
          <div class="text-left mt-1">Are you sure you want to book slot ?</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="booking_slot()"
            dark
            size="small"
            class="cardCss mr-4"
          >
            Yes
          </v-btn>
          <!-- <v-btn
            v-if="slotDuration == '24_Hour'"
            depressed
            :loading="loading"
            @click="booking_slot()"
            dark
            class="cardCss"
          >
            Book
          </v-btn> -->
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { slot_category } from "@/graphql/mutations.js";
import { slot_booking_resource } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    bookSlotConfirm: Boolean,
    slotInfo: Object,
    rowInfo: Object,
    selectedValue: String,
    slotDuration: String,
    slotAvalibility: Array,
    selectedRange: Array,
    selectedNewDate: String,
  },
  components: {},
  data() {
    return {
      loading: false,
      fromMenu: false,
      fromDate: "",
      toDate: "",
      toMenu: false,
      CategoriesName: "",
      categoriesRecords: [],
      minDate: new Date().toISOString().split("T")[0],
      datesInRange: [],
      comments: "",
    };
  },
  watch: {
    bookSlotConfirm: {
      async handler() {
        if (this.bookSlotConfirm == true) {
          await this.fetch_categories();
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.fromDate = "";
      this.toDate = "";
    },

    async fetch_categories() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(slot_category, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(result.data.slot_category);

        if (response.Status == "SUCCESS") {
          this.categoriesRecords = [];
          var array = response.data;
          array.forEach((element) => {
            if (element.slot_category_status == "ACTIVE") {
              this.categoriesRecords.push({
                title: element.slot_category_name,
                value: element.slot_category_id,
              });
            }
          });
        } else {
          this.categoriesRecords = [];
        }
      } catch (error) {
        this.categoriesRecords = [];

        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    fetch_date_range() {
      if (this.selectedRange.length === 2) {
        const startDate = new Date(this.selectedRange[0]);
        const endDate = new Date(this.selectedRange[1]);
        this.datesInRange = this.getDatesBetween(startDate, endDate);
        return JSON.stringify(this.datesInRange);
        // console.log("Dates in range:", this.datesInRange);
        // Handle the array of dates in the range as needed
      } else {
        return JSON.stringify(this.selectedRange);
      }
    },

    getDatesBetween(startDate, endDate) {
      const dates = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split("T")[0];
        dates.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    },

    async booking_slot() {
      var data = this.$store.getters.GetUserObj;
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(slot_booking_resource, {
            input: {
              // booked_slot: this.fetch_data(),
              booking_multiple_slots:
                this.slotDuration != "24_Hour" ? this.fetch_data() : undefined,
              organization_id: data.organization.organization_id,
              resource_id: this.rowInfo.resource_id,
              selected_date:
                this.slotDuration != "24_Hour"
                  ? this.selectedNewDate
                  : undefined,
              user_email_id: data.user.user_email_id,
              user_id: data.user.user_id,
              type_duration:
                this.slotDuration != "24_Hour"
                  ? this.slotInfo.type_duration
                  : "DAILY",
              current_time_date: this.fetch_current_date(),
              offset: new Date().getTimezoneOffset() * 60,
              booking_24hours_slots:
                this.slotDuration == "24_Hour"
                  ? this.fetch_date_range()
                  : undefined,
              booking_comments: this.comments == "" ? "N/A" : this.comments,
              slot_category_id: this.CategoriesName.value,
              slot_category_name: this.CategoriesName.text,
            },
          })
        );

        var response = JSON.parse(result.data.slot_booking_resource);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("SuccessMsg", response.Message);
          this.comments = "";
        } else {
          this.$emit("errorMsg", response.Message);
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    fetch_current_date() {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
      const day = String(currentDate.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      return formattedDate;
    },

    fetch_data() {
      var data = [];
      this.slotAvalibility.forEach((element) => {
        data.push({
          start_epoch: element.start_epoch,
          end_epoch: element.end_epoch,
        });
      });

      return JSON.stringify(data);
    },
  },
};
</script>
<style scss>
.v-dialog {
  border-radius: 30px !important;
  border-left: 8px solid #b0bec5;
  border-top: 8px solid #b0bec5;
}
</style>