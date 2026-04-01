<template>
  <div>
    <!--Dialog Imports-->
    <LeaderboardConfigDialog
      :DialogLeaderboardConfig="DialogLeaderboardConfig"
      @clicked="DialogLeaderboardConfigEmit"
    />
    <ExportLeaderboardDialog
      :DialogExportLeaderboard="DialogExportLeaderboard"
      @clicked="DialogExportLeaderboardEmit"
    />
    <RewardPolicyDialog
      :DialogRewardPolicy="DialogRewardPolicy"
      @clicked="DialogRewardPolicyEmit"
    />
    <ScheduleGameDialog
      :DialogScheduleGame="DialogScheduleGame"
      @clicked="DialogScheduleGameEmit"
    />
    <CreateCategoryDialog
      :DialogCreateCategory="DialogCreateCategory"
      @clicked="DialogCreateCategoryEmit"
    />
    <CreateQuestion
      :DialogCreateQuestion="DialogCreateQuestion"
      :StoreObj="CategoryObj"
      @clicked="DialogCreateQuestionEmit"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />

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
        v-if="ToggleExclusive === 'leaderboard'"
        v-model="search"
        label="Search"
        rounded="lg"
        density="compact"
        max-width="200"
        variant="outlined"
        class="mt-6 mr-3"
        prepend-inner-icon="mdi-magnify"
      />

      <!--Leaderboard Filter (Status)-->
      <v-select
        v-if="ToggleExclusive === 'leaderboard'"
        v-model="status"
        :items="StatusItems"
        density="compact"
        label="Leaderboard Filter"
        variant="outlined"
        max-width="200"
        rounded="lg"
        class="mt-6 mr-2"
      />

      <!--Leaderboard Count-->
      <v-tooltip text="Configure Leaderboard Count">
        <template #activator="{ props }">
          <v-btn
            v-if="ToggleExclusive === 'leaderboard'"
            v-bind="props"
            color="transparent"
            elevation="0"
            class="hover-elevate"
            @click="DialogLeaderboardConfig = true"
            icon
            flat
          >
            <v-icon color="primary">mdi-cog</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!--Reward Policy-->
      <v-tooltip text="Configure Reward Policy">
        <template #activator="{ props }">
          <v-btn
            v-if="ToggleExclusive === 'leaderboard'"
            v-bind="props"
            color="transparent"
            elevation="0"
            class="hover-elevate"
            @click="DialogRewardPolicy = true"
            icon
            flat
          >
            <v-icon color="primary">mdi-trophy</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!--Schedule Game-->
      <v-tooltip text="Schedule Game">
        <template #activator="{ props }">
          <v-btn
            v-if="ToggleExclusive === 'schedule'"
            v-bind="props"
            variant="flat"
            color="primary"
            rounded="lg"
            class="hover-elevate mr-4"
            elevation="0"
            @click="DialogScheduleGame = true"
            flat
          >
            <v-icon color="white" class="mr-2">mdi-clock-outline</v-icon>
            Schedule
          </v-btn>
        </template>
      </v-tooltip>

      <!--Create Custom Category-->
      <v-tooltip text="Create Category">
        <template #activator="{ props }">
          <v-btn
            v-if="ToggleExclusive === 'customcategories' && !isOnQuestionsPage"
            v-bind="props"
            variant="flat"
            rounded="lg"
            color="primary"
            class="text-start hover-elevate mr-5"
            @click="DialogCreateCategory = true"
          >
            <v-icon color="white" size="small">mdi-plus</v-icon>
            Create
          </v-btn>
        </template>
      </v-tooltip>

      <!--Create Question-->
      <v-tooltip text="Create Question">
        <template #activator="{ props }">
          <v-btn
            v-if="ToggleExclusive === 'customcategories' && isOnQuestionsPage"
            v-bind="props"
            variant="flat"
            rounded="lg"
            color="primary"
            class="text-start hover-elevate mr-5"
            @click="openCreateQuestionFromToolbar"
          >
            <v-icon color="white" size="small">mdi-plus</v-icon>
            Create Question
          </v-btn>
        </template>
      </v-tooltip>

      <!--Export Leaderboard Button-->
      <v-btn
        v-if="
          ToggleExclusive === 'leaderboard' &&
          status === 'MONTHLY' &&
          !isOnQuestionsPage
        "
        variant="flat"
        rounded="lg"
        color="primary"
        class="text-start hover-elevate mr-5"
        :loading="loading"
        @click="DialogExportLeaderboard = true"
      >
        <v-icon color="white" size="small" class="mr-2">mdi-export</v-icon>
        Export
      </v-btn>

      <!--Back Button-->
      <v-btn
        v-if="ToggleExclusive === 'customcategories' && isOnQuestionsPage"
        variant="flat"
        rounded="lg"
        color="primary"
        class="mr-4"
        @click="goBackToCategoriesFromToolbar"
      >
        Back
      </v-btn>
    </v-app-bar>

    <!--Toggle & Action Buttons-->
    <v-toolbar flat class="mt-2" style="background-color: white">
      <v-tabs
        v-model="ToggleExclusive"
        class="modern-tab-toggle"
        color="#DB4C77"
        slider-color="#DB4C77"
      >
        <v-tab value="leaderboard">Leaderboard</v-tab>
        <v-tab value="schedule">Scheduled Games</v-tab>
        <v-tab value="customcategories" class="tab-btn"
          >Custom Categories & Questions</v-tab
        >
      </v-tabs>
    </v-toolbar>

    <!--Component Imports-->
    <ScheduledGames
      v-if="ToggleExclusive === 'schedule'"
      :search="search"
      ref="scheduledGames"
    />
    <SplayCustomCategories
      v-if="ToggleExclusive === 'customcategories'"
      :search="search"
      ref="customCategories"
      @question-view="onQuestionView"
      @category-view="isOnQuestionsPage = false"
    />
    <LeaderBoard
      v-if="ToggleExclusive === 'leaderboard'"
      ref="leaderboardcount"
      :status="status"
      :search="search"
    />
  </div>
</template>

<script>
import LeaderBoard from "./LeaderBoard.vue";
import ScheduledGames from "./ScheduledGames.vue";
import SplayCustomCategories from "./SplayCustomCategories.vue";

import LeaderboardConfigDialog from "./LeaderboardConfigDialog.vue";
import ExportLeaderboardDialog from "./ExportLeaderboardDialog.vue";
import RewardPolicyDialog from "./RewardPolicyDialog.vue";
import ScheduleGameDialog from "./ScheduleGameDialog.vue";
import CreateCategoryDialog from "./CreateCategoryDialog.vue";
import CreateQuestion from "./CreateQuestion.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    LeaderBoard,
    ScheduledGames,
    SplayCustomCategories,

    ExportLeaderboardDialog,
    LeaderboardConfigDialog,
    RewardPolicyDialog,
    ScheduleGameDialog,
    CreateCategoryDialog,
    CreateQuestion,

    SnackBar,
  },

  data: () => ({
    ToggleExclusive: "leaderboard",
    status: "DAILY",
    viewMode: "months",
    search: "",

    CategoryObj: null,

    DialogLeaderboardConfig: false,
    DialogExportLeaderboard: false,
    DialogRewardPolicy: false,
    DialogScheduleGame: false,
    DialogCreateCategory: false,
    DialogCreateQuestion: false,
    isOnQuestionsPage: false,
    loading: false,
    menu: false,

    SnackBarComponent: {},

    StatusItems: [
      { title: "Daily", value: "DAILY" },
      { title: "Monthly", value: "MONTHLY" },
      { title: "Yearly", value: "YEARLY" },
      { title: "All Time", value: "ALLTIME" },
    ],
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

  methods: {
    DialogLeaderboardConfigEmit(Toggle) {
      this.DialogLeaderboardConfig = false;
      if (Toggle === 2) {
        this.DialogLeaderboardConfig = false;
      }
    },
    DialogExportLeaderboardEmit(Toggle) {
      this.DialogExportLeaderboard = false;
    },
    DialogRewardPolicyEmit(Toggle) {
      this.DialogRewardPolicy = false;
      if (Toggle === 2) {
        this.DialogRewardPolicy = false;
      }
    },
    DialogScheduleGameEmit(Toggle) {
      this.DialogScheduleGame = false;
      if (Toggle === 2 && this.ToggleExclusive === "schedule") {
        this.$nextTick(() => {
          this.$refs.scheduledGames?.ListScheduledGamesMethod();
        });
      }
    },
    DialogCreateCategoryEmit(Toggle) {
      this.DialogCreateCategory = false;
      if (Toggle === 2 && this.ToggleExclusive === "customcategories") {
        this.$nextTick(() => {
          this.$refs.customCategories?.GetAllCategoriesMethod();
        });
      }
    },
    DialogCreateQuestionEmit(Toggle) {
      this.DialogCreateQuestion = false;
      if (Toggle === 2) {
        this.$refs.customCategories?.refreshQuestions();
      }
    },
    openCreateQuestionFromToolbar() {
      this.DialogCreateQuestion = true;
    },
    goBackToCategoriesFromToolbar() {
      this.isOnQuestionsPage = false;
      this.$refs.customCategories?.goBackToCategories();
    },
    onQuestionView(category) {
      this.isOnQuestionsPage = true;
      this.CategoryObj = category;
    },
    selectMonth(index) {
      this.selectedMonth = index;
      this.menu = false;
    },
  },
};
</script>
