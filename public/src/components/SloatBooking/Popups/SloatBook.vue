<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="bookslotview"
      @update:model-value="$emit('update:bookslotview', $event)"
      persistent
      max-width="650"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            Details for {{ formatDateToLongForm(selectedValue) }} Slot
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="d-flex justify-center mb-4">
            {{ filteredBookings.length == 0 ? "No Sloat booked " : "" }}
          </div>
          <v-row>
            <v-col
              v-for="(booking, index) in filteredBookings"
              :key="index"
              cols="6"
            >
              <v-card class="mb-2">
                <v-card-title class="title">{{
                  booking.user_name
                }}</v-card-title>

                <v-card-text>
                  <p>
                    <strong>Categories:</strong>
                    {{ booking.booking_category_name }}
                  </p>
                  <p>
                    <strong>Comments:</strong> {{ booking.booking_comments }}
                  </p>
                  <p><strong>Start Time:</strong> {{ booking.s_time }}</p>
                  <p><strong>End Time:</strong> {{ booking.e_time }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
export default {
  props: {
    bookslotview: Boolean,
    sloatitems: Array,
    selectedValue: String,
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    filteredBookings() {
      return this.sloatitems
        .filter(
          (booking) => booking.booked_user && booking.booked_user.user_name
        ) // Filter bookings with a booked user
        .map((booking) => ({
          booking_category_name: booking.booked_user.booking_category_name,
          user_name: booking.booked_user.user_name,
          booking_comments: booking.booked_user.booking_comments,
          s_time: booking.s_time,
          e_time: booking.e_time,
        }));
    },
  },
  watch: {
    bookslotview: {
      async handler() {},
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    formatDateToLongForm(dateString) {
      const date = new Date(dateString);

      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const weekday = date.toLocaleString("default", { weekday: "long" });

      return `${day} ${month} ${weekday}`;
    },
  },
};
</script>
<style scoped>
.navBar {
  background-color: #3f51b5; /* Change to your preferred color */
}

.custom-title {
  font-weight: bold;
}

.small-card {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
}

.title {
  font-weight: bold;
}

.subtitle {
  color: #757575;
}

.v-card-text p {
  margin: 0;
  font-size: 14px; /* Make text smaller */
}
</style>
