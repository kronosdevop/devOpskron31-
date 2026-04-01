<template>
  <div class="calendar">
    <DeleteScheduledGameDialog
      :DialogDeleteScheduledGame="DialogDeleteScheduledGame"
      :StoreObj="StoreObj"
      @clicked="DialogDeleteScheduledGameEmit"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card
      rounded="lg"
      class="pa-5 mt-n4"
      height="77vh"
      style="overflow-y: auto"
    >
      <!-- Header -->
      <div class="header">
        <button @click="prevMonth">←</button>
        <div class="title">
          {{ monthYear }}
        </div>
        <button @click="nextMonth">→</button>
      </div>

      <!-- Weekdays -->
      <div class="weekdays">
        <div v-for="d in daysShort" :key="d">
          {{ d }}
        </div>
      </div>

      <!-- Grid -->
      <div class="grid">
        <div
          v-for="(day, i) in calendarDays"
          :key="i"
          class="cell"
          :class="{ today: isToday(day) }"
        >
          <div v-if="day">
            <!-- Date -->
            <div class="date">
              {{ day.date.getDate() }}
            </div>

            <!-- 🔄 Skeleton -->
            <template v-if="isLoading">
              <!-- <v-skeleton-loader
                v-for="i in 3"
                :key="i"
                type="list-item-avatar"
                class="mb-2"
              /> -->
              <div v-for="i in 3" :key="i" class="skeleton-event"></div>
            </template>

            <!-- ✅ Events -->
            <template v-else>
              <!-- ✅ If games exist -->
              <template v-if="(gamesByDate[day.key] || []).length">
                <div
                  v-for="game in (gamesByDate[day.key] || []).slice(0, 3)"
                  :key="game.game_session_id"
                  class="event"
                  :style="{
                    borderLeft:
                      '3px solid ' + getCategoryColor(game.category_name),
                  }"
                >
                  <img :src="game.splay_category_image" />

                  <div class="event-content">
                    <div class="name">{{ game.category_name }}</div>
                    <div class="time">{{ game.displayTime }}</div>
                  </div>

                  <v-btn
                    icon
                    size="20"
                    variant="text"
                    class="delete-btn"
                    @click.stop="OpenDialogDeleteScheduledGame(game)"
                  >
                    <v-icon size="14">mdi-delete</v-icon>
                  </v-btn>
                </div>

                <div
                  v-if="(gamesByDate[day.key] || []).length > 3"
                  class="more"
                >
                  +{{ (gamesByDate[day.key] || []).length - 3 }} more
                </div>
              </template>

              <!-- ❌ Empty state -->
              <div v-else class="empty-day">No games scheduled</div>
            </template>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { ListScheduledGames } from "@/mixins/ListScheduledGames";
import { getImgS3 } from "@/mixins/GetS3";

import DeleteScheduledGameDialog from "./DeleteScheduledGameDialog.vue";
import SnackBar from "../SnackBar.vue";

export default {
  mixins: [ListScheduledGames, getImgS3],

  components: { DeleteScheduledGameDialog },

  data() {
    return {
      currentDate: new Date(),

      isLoading: true,
      DialogDeleteScheduledGame: false,
    };
  },

  async mounted() {
    this.isLoading = true;

    const start = Date.now();

    await this.ListScheduledGamesMethod();

    const elapsed = Date.now() - start;

    setTimeout(() => {
      this.isLoading = false;
    }, Math.max(300 - elapsed, 0));
  },

  computed: {
    monthYear() {
      return this.currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },
    daysShort() {
      return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const start = firstDay.getDay();
      const total = lastDay.getDate();

      const days = [];

      for (let i = 0; i < start; i++) {
        days.push(null);
      }

      for (let i = 1; i <= total; i++) {
        const date = new Date(year, month, i);

        const key = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;

        days.push({
          date,
          key,
        });
      }

      return days;
    },
    gamesByDate() {
      const map = {};

      (this.ListScheduledGames || []).forEach((g) => {
        if (!g.game_scheduled_time) return;

        const date = new Date(g.game_scheduled_time * 1000);

        const key = `${date.getFullYear()}-${
          date.getMonth() + 1
        }-${date.getDate()}`;

        const displayTime = date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        if (!map[key]) map[key] = [];

        map[key].push({
          ...g,
          displayTime,
        });
      });

      return map;
    },
  },

  methods: {
    async DialogDeleteScheduledGameEmit(Toggle) {
      this.DialogDeleteScheduledGame = false;
      if (Toggle === 2) {
        await this.ListScheduledGamesMethod();
      }
    },
    prevMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.currentDate = new Date(this.currentDate);
    },
    nextMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.currentDate = new Date(this.currentDate);
    },
    isToday(day) {
      if (!day) return false;
      return new Date().toDateString() === day.date.toDateString();
    },
    OpenDialogDeleteScheduledGame(item) {
      this.StoreObj = item;
      this.DialogDeleteScheduledGame = true;
    },
    getCategoryColor(category) {
      const map = {
        Science: "#6366F1",
        Geography: "#10B981",
        Business: "#F59E0B",
        Sports: "#EF4444",
        Technology: "#3B82F6",
        English: "#8B5CF6",
        "General Knowledge": "#EC4899",
      };

      return map[category] || "#DB4C77";
    },
  },
};
</script>
