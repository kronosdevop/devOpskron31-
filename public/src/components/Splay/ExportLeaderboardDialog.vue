<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogExportLeaderboard"
      max-width="400px"
      persistent
    >
      <v-card rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Export Leaderboard</span>
          <v-btn
            icon
            variant="text"
            @click="DialogExportLeaderboardEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Month and Year Picker-->
        <div class="d-flex justify-center">
          <v-menu v-model="menu" :close-on-content-click="false">
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                :model-value="formattedMonth"
                prepend-inner-icon="mdi-calendar"
                readonly
                rounded="lg"
                density="compact"
                variant="outlined"
                max-width="200"
                class="mt-6"
              />
            </template>

            <v-card width="260" class="pa-4">
              <!-- Year selector -->
              <v-select
                v-model="selectedYear"
                :items="yearOptions"
                density="compact"
                variant="outlined"
                hide-details
                class="mb-3"
              />
              <!-- Month grid -->
              <div class="month-grid">
                <v-btn
                  v-for="(month, i) in months"
                  :key="month.value"
                  size="small"
                  variant="text"
                  :disabled="i === 0"
                  @click="selectMonth(i)"
                >
                  {{ month.title }}
                </v-btn>
              </div>
            </v-card>
          </v-menu>
        </div>

        <!--Button-->
        <v-card-actions class="d-flex justify-center mt-n3">
          <v-btn
            variant="flat"
            size="small"
            rounded="lg"
            color="primary"
            :loading="loading"
            @click="exportLeaderboard"
          >
            Export
            <template #loader>
              <v-progress-circular indeterminate color="white" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SnackBar from "../SnackBar.vue";

import { export_leaderboard_by_month } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: { DialogExportLeaderboard: Boolean },

  data: () => ({
    loading: false,
    menu: false,

    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth(),

    SnackBarComponent: {},

    months: [
      { title: "Jan", value: "January" },
      { title: "Feb", value: "February" },
      { title: "Mar", value: "March" },
      { title: "Apr", value: "April" },
      { title: "May", value: "May" },
      { title: "Jun", value: "June" },
      { title: "Jul", value: "July" },
      { title: "Aug", value: "August" },
      { title: "Sept", value: "September" },
      { title: "Oct", value: "October" },
      { title: "Nov", value: "November" },
      { title: "Dec", value: "Dec" },
    ],
  }),

  computed: {
    formattedMonth() {
      if (this.selectedMonth === null) return "";
      return `${this.months[this.selectedMonth].title} ${this.selectedYear}`;
    },
    yearOptions() {
      return [2026];
    },
    currentUserEmail() {
      const userObj = this.$store.getters.GetUserObj;
      return userObj?.user?.user_email_id || "";
    },
  },

  methods: {
    async exportLeaderboard() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(export_leaderboard_by_month, {
            input: {
              user_email_id: this.currentUserEmail,
              month: this.months[this.selectedMonth].value,
              year: JSON.stringify(this.selectedYear),
            },
          }),
        );
        let resultObj = JSON.parse(result.data.export_leaderboard_by_month);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
        }
        this.DialogExportLeaderboardEmit(1);
        window.open(resultObj.URL);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to generate excel, please try again",
        };
      } finally {
        this.loading = false;
      }
    },
    DialogExportLeaderboardEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    selectMonth(index) {
      this.selectedMonth = index;
      this.menu = false;
    },
  },
};
</script>
