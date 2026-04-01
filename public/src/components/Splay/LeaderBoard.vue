<template>
  <v-card-text>
    <!--Data Table-->
    <v-data-table
      :height="windowHeight"
      :headers="TableHeaders"
      :items="paginatedItems"
      :loading="loading"
      class="modern-data-table mt-n2"
      hide-default-footer
    >
      <!--Miliseconds-->
      <template #[`item.avg_response_time`]="{ item }">
        {{ ConvertMs(item.avg_response_time) }}
      </template>

      <!-- Rank with Gold Badge -->
      <template #[`item.rank`]="{ item }">
        <div class="rank-cell">
          <span class="rank-number">{{ item.rank }}</span>
          <!-- Gold animation only for #1 -->
          <Vue3Lottie
            v-if="item.rank === 1"
            :animationData="GoldBadge"
            :height="40"
            :width="40"
            loop
            autoplay
            class="gold-badge ml-6"
          />
          <Vue3Lottie
            v-if="item.rank === 2"
            :animationData="secondPosition"
            :height="40"
            :width="40"
            loop
            autoplay
            class="gold-badge ml-6"
          />
          <Vue3Lottie
            v-if="item.rank === 3"
            :animationData="thirdPosition"
            :height="40"
            :width="40"
            loop
            autoplay
            class="gold-badge ml-6"
          />
        </div>
      </template>

      <!--Users-->
      <template #[`item.user_email_id`]="{ item }">
        <div class="d-flex align-center">
          <v-avatar>
            <v-img :src="item.profile_pic" />
          </v-avatar>

          <div class="ml-3">
            <div class="font-weight-medium">
              {{ item.full_name }}
            </div>
            <div class="text-caption" style="color: #888">
              {{ item.user_email_id }}
            </div>
          </div>
        </div>
      </template>
    </v-data-table>

    <!--Pagination-->
    <div class="table-footer">
      <div class="footer-info">
        {{
          totalItems === 0
            ? "No Results"
            : `Showing ${paginatedItems.length} of ${totalItems} members`
        }}
      </div>
      <div class="pagination-controls">
        <v-btn
          :disabled="currentPage === 1"
          variant="text"
          size="small"
          class="pagination-btn"
          @click="currentPage = currentPage - 1"
          style="color: #666 !important"
        >
          Previous
        </v-btn>
        <div class="page-numbers">
          <v-btn
            v-for="page in visiblePages"
            :key="page"
            :variant="page === currentPage ? 'elevated' : 'text'"
            size="small"
            :class="page === currentPage ? 'active-page' : 'inactive-page'"
            @click="currentPage = page"
            :style="
              page === currentPage
                ? 'background: #DB4C77 !important; color: white !important;'
                : 'color: #666 !important;'
            "
          >
            {{ page }}
          </v-btn>
        </div>
        <v-btn
          :disabled="currentPage === pageCount"
          variant="text"
          size="small"
          class="pagination-btn"
          @click="currentPage = currentPage + 1"
          style="color: #666 !important"
        >
          Next
        </v-btn>
      </div>
    </div>
  </v-card-text>
</template>

<script>
import { GetLeaderBoard } from "@/mixins/GetLeaderBoard";
import { Vue3Lottie } from "vue3-lottie";
import { my_team_user_list } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

import GoldBadge from "@/assets/GoldBadge.json";
import secondPosition from "@/assets/secondPosition.json";
import thirdPosition from "@/assets/thirdPosition.json";
import confetti from "canvas-confetti";

export default {
  props: { status: String, search: String },

  mixins: [GetLeaderBoard],

  components: { confetti, Vue3Lottie, GoldBadge },

  data: () => ({
    windowHeight: 0,
    currentPage: 1,
    itemsPerPage: 15,

    GoldBadge,
    secondPosition,
    thirdPosition,

    // ListLeaderBoard: [],
    TeamsList: [],
    TableHeaders: [
      { title: "Rank", value: "rank" },
      { title: "Email", value: "user_email_id" },
      { title: "Games", value: "games_played" },
      { title: "Cups", value: "cups_won" },
      { title: "Response Time(Avg.)", value: "avg_response_time" },
      { title: "Points", value: "total_points" },
    ],
  }),

  watch: {
    status(val) {
      if (val) this.GetLeaderBoardMethod();
    },
    search() {
      this.currentPage = 1;
    },
  },

  computed: {
    searchItems() {
      const text = (this.search || "").toLowerCase();
      return this.mergedLeaderboard.filter((item) =>
        item.user_email_id?.toLowerCase().includes(text),
      );
    },
    paginatedItems() {
      const filtered = this.searchItems;

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      return filtered.slice(start, end);
    },
    totalItems() {
      return this.searchItems.length;
    },
    pageCount() {
      return Math.ceil(this.searchItems.length / this.itemsPerPage);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;
      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);
      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    mergedLeaderboard() {
      const teamMap = Object.fromEntries(
        (this.TeamsList || []).map((user) => [
          user.user_email_id,
          {
            profile_pic: user.user_profile_pic_url || null,
            full_name: user.full_user_name || user.first_name || "",
          },
        ]),
      );
      return (this.ListLeaderBoard || []).map((item) => ({
        ...item,
        profile_pic: teamMap[item.user_email_id]?.profile_pic || null,
        full_name: teamMap[item.user_email_id]?.full_name || item.user_email_id,
      }));
    },
  },

  async mounted() {
    this.windowHeight = window.innerHeight - 240;

    await this.GetLeaderBoardMethod();
    await this.GetTeams();

    this.launchConfetti();
  },

  methods: {
    async GetTeams() {
      try {
        const data = this.$store.getters.GetUserObj;
        const result = await API.graphql(
          graphqlOperation(my_team_user_list, {
            input: {
              name_search: "",
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              nextToken: null,
              limit: 1000,
            },
          }),
        );
        const resultObj = JSON.parse(result.data.my_team_user_list);
        this.TeamsList =
          resultObj.Status === "SUCCESS" ? resultObj.user || [] : [];
      } catch (error) {
        this.TeamsList = [];
      }
    },
    ConvertMs(ms) {
      if (!ms && ms !== 0) return "-";
      return (ms / 1000).toFixed(2) + " s";
    },
    launchConfetti() {
      const duration = 2 * 1000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 6, spread: 70, origin: { y: 0.1 } });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    },
  },
};
</script>

<style scoped>
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.modern-data-table >>> tbody tr:hover {
  background-color: #f5f5f5 !important;
  transform: translateY(-3px);
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.footer-info {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pagination-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-width: 80px !important;
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.active-page {
  background: #db4c77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
}
.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
}
.rank-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rank-number {
  font-weight: 600;
}
.gold-badge {
  margin-top: -2px;
}
</style>
