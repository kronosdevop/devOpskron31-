<template>
  <v-card-text>
    <DeleteScheduledGameDialog
      :DialogDeleteScheduledGame="DialogDeleteScheduledGame"
      :StoreObj="StoreObj"
      @clicked="DialogDeleteScheduledGameEmit"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-data-table
      :height="windowHeight"
      :headers="TableHeaders"
      :items="ListScheduledGames"
      :loading="loading"
      hide-default-footer
      class="modern-data-table mt-n2"
    >
      <!--Category-->
      <template #[`item.category_name`]="{ item }">
        <div class="d-flex align-center">
          <v-avatar>
            <v-img :src="item.splay_category_image" />
          </v-avatar>
          <div class="ml-2">{{ item.category_name }}</div>
        </div>
      </template>
      <!--Game Schedule Time-->
      <template #[`item.game_scheduled_time`]="{ item }">
        {{ convert(item.game_scheduled_time) }}
      </template>

      <!--Frequency-->
      <template #[`item.reccuring_schedule`]="{ item }">
        {{ item.reccuring_schedule || "One-time" }} at
        {{
          item.reccuring_schedule_time === null
            ? convert(item.game_scheduled_time)
            : convert(item.reccuring_schedule_time)
        }}
      </template>

      <!-- Actions -->
      <template #[`item.action`]="{ item }">
        <v-tooltip text="Delete">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              flat
              elevation="0"
              size="30"
              color="transparent"
              class="button_animate"
              @click="OpenDialogDeleteScheduledGame(item)"
            >
              <v-icon color="red" size="17">mdi-delete </v-icon></v-btn
            >
          </template>
        </v-tooltip>
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
import { ListScheduledGames } from "@/mixins/ListScheduledGames";

import DeleteScheduledGameDialog from "./DeleteScheduledGameDialog.vue";
import SnackBar from "../SnackBar.vue";

export default {
  mixins: [ListScheduledGames],

  components: { DeleteScheduledGameDialog, SnackBar },

  data: () => ({
    windowHeight: 0,
    currentPage: 1,
    itemsPerPage: 15,

    loading: false,
    DialogDeleteScheduledGame: false,

    SnackBarComponent: {},

    ListScheduledGames: [],
    TableHeaders: [
      { title: "Category", value: "category_name" },
      { title: "Scheduled On", value: "game_scheduled_time" },
      { title: "Frequency", value: "reccuring_schedule" },
      { title: "Action", value: "action" },
    ],
  }),

  async mounted() {
    this.windowHeight = window.innerHeight - 240;
    await this.ListScheduledGamesMethod();
  },

  computed: {
    totalItems() {
      return this.ListScheduledGames.length;
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.ListScheduledGames.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.ListScheduledGames.length / this.itemsPerPage);
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

  methods: {
    convert(value) {
      if (!value) return "N/A";

      const date = new Date(value * 1000);
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      return `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}-${date.getFullYear()}, ${hours}:${minutes}:${ampm}`;
    },
    OpenDialogDeleteScheduledGame(item) {
      this.StoreObj = item;
      this.DialogDeleteScheduledGame = true;
    },
    DialogDeleteScheduledGameEmit(Toggle) {
      this.DialogDeleteScheduledGame = false;
      if (Toggle === 2) {
        this.ListScheduledGamesMethod();
      }
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
</style>
