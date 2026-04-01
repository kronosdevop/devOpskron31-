<template>
  <v-card-text>
    <v-data-table
      :height="windowHeight"
      :headers="TableHeaders"
      :items="ListLeaderBoard"
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
    </v-data-table>

    <!--Pagination-->
    <div class="table-footer">
      <div class="footer-info">
        {{
          totalItems === 0
            ? "No Results"
            : `Showing ${paginatedItems.length} of ${totalItems} created tickets`
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

import GoldBadge from "@/assets/GoldBadge.json";
import secondPosition from "@/assets/secondPosition.json";
import thirdPosition from "@/assets/thirdPosition.json";
import confetti from "canvas-confetti";

export default {
  props: { status: String },

  mixins: [GetLeaderBoard],

  components: { confetti, Vue3Lottie, GoldBadge },

  data: () => ({
    windowHeight: 0,
    currentPage: 1,
    itemsPerPage: 15,

    GoldBadge,
    secondPosition,
    thirdPosition,

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
      if (val) {
        this.GetLeaderBoardMethod();
      }
    },
  },

  computed: {
    totalItems() {
      return this.ListLeaderBoard.length;
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.ListLeaderBoard.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.ListLeaderBoard.length / this.itemsPerPage);
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
  },

  async mounted() {
    this.windowHeight = window.innerHeight - 240;
    await this.GetLeaderBoardMethod();
    this.launchConfetti();
  },

  methods: {
    ConvertMs(ms) {
      if (!ms && ms !== 0) return "-";
      return (ms / 1000).toFixed(2) + " s";
    },
    launchConfetti() {
      const duration = 2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 6,
          spread: 70,
          origin: { y: 0.1 },
        });

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
