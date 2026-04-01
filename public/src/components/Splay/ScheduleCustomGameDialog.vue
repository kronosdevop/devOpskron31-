<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogScheduleCustomGame" max-width="475px" persistent>
      <v-card rounded="lg">
        <!--Toolbar/Header-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Schedule Game </span>
          <v-btn
            icon
            variant="text"
            @click="DialogScheduleCustomGameEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Content-->
        <div class="pa-4">
          <div class="d-flex justify-center font-weight-bold">
            You are about to schedule a game for category -
            {{ StoreObj.splay_category_name }} 🚨
          </div>
          <!--Date Picker and Time Picker-->
          <v-row class="mt-3">
            <!--Switch-->
            <v-col cols="12" class="mt-n10">
              <div class="d-flex align-center">
                <div class="font-weight-bold">
                  Would you like this game to recur 🎮?
                </div>
                <v-switch
                  v-model="recurring"
                  color="primary"
                  class="mt-6 ml-4"
                  :label="recurring ? 'No' : 'Yes'"
                />
              </div>
            </v-col>

            <!--Date-->
            <v-col cols="6" class="mt-n10">
              <div class="font-weight-bold">
                Date<span class="text-error ml-2">*</span>
              </div>
              <v-menu v-model="dateMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    variant="outlined"
                    rounded="lg"
                    density="compact"
                    prepend-inner-icon="mdi-calendar"
                    class="mt-2"
                    width="200"
                    :model-value="formattedDate"
                  />
                </template>
                <v-date-picker
                  v-model="selectedDate"
                  header-color="primary"
                  :min="new Date()"
                  :allowed-dates="allowedDatesByDay"
                >
                  <template #actions>
                    <v-btn
                      color="transparent"
                      rounded="xl"
                      class="text-primary"
                      @click="dateMenu = false"
                      >Close</v-btn
                    >
                  </template>
                </v-date-picker>
              </v-menu>
            </v-col>

            <!--Time-->
            <v-col cols="6" class="mt-n10">
              <div class="font-weight-bold">
                Time<span class="text-error ml-2">*</span>
              </div>
              <v-menu v-model="timeMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    v-bind="props"
                    variant="outlined"
                    rounded="lg"
                    density="compact"
                    prepend-inner-icon="mdi-clock-outline"
                    class="mt-2"
                    width="200"
                    :model-value="formattedTime"
                  />
                </template>
                <v-time-picker
                  v-model="selectedTime"
                  color="primary"
                  format="24hr"
                  width="400"
                >
                  <template #actions>
                    <v-btn
                      color="transparent"
                      class="text-primary"
                      rounded="xl"
                      @click="timeMenu = false"
                      >Close</v-btn
                    >
                  </template>
                </v-time-picker>
              </v-menu>
            </v-col>

            <!--Leaderboard Count-->
            <v-col cols="12" class="mt-n5">
              <div class="font-weight-bold">
                Leaderboard Count<span class="text-error ml-2">*</span>
              </div>
              <v-select
                v-model="count"
                variant="outlined"
                rounded="lg"
                density="compact"
                class="mt-2"
                :items="CountItems"
                :rules="[(v = !!v || 'Required')]"
              />
            </v-col>

            <!--Frequency-->
            <v-col cols="6" v-if="recurring" class="mt-n6">
              <div class="font-weight-bold">
                Frequency <span class="text-error">*</span>
              </div>
              <v-select
                v-model="frequency"
                variant="outlined"
                rounded="lg"
                density="compact"
                class="mt-2"
                width="200"
                :items="FrequencyItems"
                :rules="[(v = !!v || 'Required')]"
              />
            </v-col>

            <!--Days of the week-->
            <v-col cols="6" v-if="recurring" class="mt-n6">
              <div class="font-weight-bold">
                Days<span class="text-error ml-1">*</span>
              </div>
              <v-select
                v-model="days"
                variant="outlined"
                rounded="lg"
                density="compact"
                class="mt-2"
                width="200"
                :items="DayItems"
                :rules="[(v = !!v || 'Required')]"
              />
            </v-col>
          </v-row>

          <!--Button-->
          <v-card-actions class="d-flex justify-center mt-n6">
            <v-btn
              variant="flat"
              color="primary"
              rounded="lg"
              size="small"
              :loading="loading"
              @click="ScheduleGame"
            >
              Update
              <template #loader>
                <v-progress-circular indeterminate color="white" />
              </template>
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { schedule_game } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogScheduleCustomGame: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    frequency: "WEEKLY",
    days: "MONDAY",
    count: "3",

    dateMenu: false,
    timeMenu: false,
    loading: false,
    recurring: false,

    selectedDate: new Date(),
    selectedTime: new Date().toTimeString().slice(0, 5),

    SnackBarComponent: {},

    FrequencyItems: [
      { title: "Weekly", value: "WEEKLY" },
      { title: "Monthly", value: "MONTHLY" },
      { title: "Daily", value: "DAILY" },
    ],
    DayItems: [
      { title: "Monday", value: "MONDAY" },
      { title: "Tuesday", value: "TUESDAY" },
      { title: "Wednesday", value: "WEDNESDAY" },
      { title: "Thursday", value: "THURSDAY" },
      { title: "Friday", value: "FRIDAY" },
      { title: "Saturday", value: "SATURDAY" },
      { title: "Sunday", value: "SUNDAY" },
    ],
    CountItems: [
      { title: "3", value: "3" },
      { title: "5", value: "5" },
      { title: "10", value: "10" },
      { title: "20", value: "20" },
      { title: "50", value: "50" },
    ],
  }),

  computed: {
    formattedDate() {
      if (!this.selectedDate) return "";
      return this.formatDate(this.selectedDate);
    },
    formattedTime() {
      if (!this.selectedTime) return "";
      const [h, m] = this.selectedTime.split(":");
      return new Date(0, 0, 0, h, m).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    gameScheduledEpoch() {
      const [hours, minutes] = this.selectedTime.split(":").map(Number);
      const date = new Date(this.selectedDate);
      date.setHours(hours, minutes, 0, 0);
      return Math.floor(date.getTime() / 1000);
    },
    recurringScheduleTime() {
      if (!this.recurring || !this.selectedTime) return null;
      const [hour24, minute] = this.selectedTime.split(":").map(Number);
      const timeStr = `${String(hour24).padStart(2, "0")}:${String(
        minute,
      ).padStart(2, "0")}`;
      return timeStr;
    },
  },

  methods: {
    async ScheduleGame() {
      this.loading = true;
      try {
        const input = {
          splay_category_id: this.StoreObj.splay_category_id,
          game_scheduled_time: this.gameScheduledEpoch,
          leaderboard_count: parseInt(this.count),
        };
        if (this.recurring) {
          input.reccuring_game = true;
          input.reccuring_schedule = this.frequency;
          input.reccuring_day = this.days;
          input.reccuring_schedule_time = this.recurringScheduleTime;
        }
        const result = await API.graphql(
          graphqlOperation(schedule_game, { input }),
        );
        const resultObj = JSON.parse(result.data.schedule_game);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.message,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: resultObj.Message,
          };
        }
        this.DialogScheduleCustomGameEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to schedule game, try again",
        };
      } finally {
        this.loading = false;
      }
    },
    DialogScheduleCustomGameEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    formatDate(selectedDate) {
      const date = new Date(selectedDate);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    allowedDatesByDay(date) {
      if (!this.recurring) return true;
      const dayMap = {
        SUNDAY: 0,
        MONDAY: 1,
        TUESDAY: 2,
        WEDNESDAY: 3,
        THURSDAY: 4,
        FRIDAY: 5,
        SATURDAY: 6,
      };
      const selectedDayNumber = dayMap[this.days];
      const dateObj = new Date(date);
      return dateObj.getDay() === selectedDayNumber;
    },
  },
};
</script>
