<template>
  <div>
    <!--App Bar-->
    <v-app-bar class="modern-header-section">
      <!--Header and Icon-->
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24"
              >mdi-controller-classic-outline</v-icon
            >
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Splay</span>
          <span class="header-subtitle">Schedule Quizzes</span>
        </div>
      </div>

      <v-spacer></v-spacer>

      <!--Search-->
      <v-text-field
        v-model="search"
        label="Search"
        rounded="lg"
        density="compact"
        max-width="200"
        variant="outlined"
        class="mt-6 mr-3"
        prepend-inner-icon="mdi-magnify"
      />

      <!--Leaderboard Count-->
      <v-select
        v-if="ToggleExclusive === 'leaderboard'"
        v-model="status"
        :items="StatusItems"
        density="compact"
        label="Leaderboard Filter"
        variant="outlined"
        max-width="250"
        rounded="lg"
        class="mt-6 mr-2"
      />
    </v-app-bar>

    <!--Toggle Buttons-->
    <v-toolbar flat class="mt-2" style="background-color: white">
      <v-tabs
        v-model="ToggleExclusive"
        class="modern-tab-toggle"
        color="#DB4C77"
        slider-color="#DB4C77"
      >
        <v-tab value="leaderboard">Leaderboard</v-tab>
        <v-tab value="schedule">Scheduled Games</v-tab>
        <v-tab value="defautcategories" class="tab-btn"
          >Categories</v-tab
        >
        <!-- <v-tab value="customcategories" class="tab-btn"
          >Custom Categories</v-tab
        > -->
      </v-tabs>
    </v-toolbar>

    <!--Card Imports-->
    <ScheduledGames v-if="ToggleExclusive === 'schedule'" />
    <SplayCustomCategories v-if="ToggleExclusive === 'customcategories'" />
    <SplayDefaultCategories v-if="ToggleExclusive === 'defautcategories'" />
    <LeaderBoard v-if="ToggleExclusive === 'leaderboard'" :status="status" />
  </div>
</template>

<script>
import LeaderBoard from "./LeaderBoard.vue";
import ScheduledGames from "./ScheduledGames.vue";
import SplayCustomCategories from "./SplayCustomCategories.vue";
import SplayDefaultCategories from "./SplayDefaultCategories.vue";

export default {
  components: {
    LeaderBoard,
    ScheduledGames,
    SplayCustomCategories,
    SplayDefaultCategories,
  },

  data: () => ({
    ToggleExclusive: "customcategories",
    search: "",
    status: "ALLTIME",

    StatusItems: [
      { title: "Daily", value: "DAILY" },
      { title: "Monthly", value: "MONTHLY" },
      { title: "Yearly", value: "YEARLY" },
      { title: "All Time", value: "ALLTIME" },
    ],
  }),
};
</script>
