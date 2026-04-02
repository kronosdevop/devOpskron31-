<template>
  <div>
    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2 leaderboard-card">
        <!-- <v-row class="align-center px-6 pt-6 pb-2" >
          <v-col cols="auto" class="d-flex align-center">
            <v-icon class="mr-3" color="primary" size="large">mdi-podium</v-icon>
            <span class="font-weight-bold text-h6">Leaderboard</span>
          </v-col>
          <v-spacer />
          <v-col cols="auto" class="d-flex align-center">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search leaderboard..."
              prepend-inner-icon="mdi-magnify"
              variant="solo"
              hide-details
              density="compact"
              class="search-pill mr-4"
              style="min-width: 220px; max-width: 220px; height: 32px; border-radius: 999px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); font-size: 14px;"
              clearable
              @click:clear="searchQuery = ''"
            ></v-text-field>
          </v-col>
        </v-row> -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="headers"
            :items="paginatedItems"
            :loading="tableLoading"
            :fixed-header="true"
            :height="windowHeight"
            hide-default-footer
            density="comfortable"
            class="modern-data-table"
            hover
            @click:row="showRecentAwards"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4"
                  >mdi-podium</v-icon
                >
                <div class="text-h6 text-grey mb-2">
                  No Leaderboard Data Found
                </div>
                <div class="text-body-2 text-grey">
                  No leaderboard data available at the moment.
                </div>
              </div>
            </template>

            <template v-slot:loading>
              <div class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-4"
                ></v-progress-circular>
                <div class="text-body-2 text-grey">Loading leaderboard...</div>
              </div>
            </template>

            <!-- Rank -->
            <template v-slot:[`item.rank`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon
                  size="20"
                  :color="
                    item.rank === 1
                      ? 'amber'
                      : item.rank === 2
                      ? 'grey'
                      : item.rank === 3
                      ? 'orange'
                      : 'primary'
                  "
                  class="mr-3"
                >
                  {{
                    item.rank === 1
                      ? "mdi-trophy"
                      : item.rank === 2
                      ? "mdi-medal"
                      : item.rank === 3
                      ? "mdi-medal"
                      : "mdi-numeric-" + item.rank + "-circle"
                  }}
                </v-icon> -->
                <span class="font-weight-medium text-body-2"
                  >#{{ item.rank }}</span
                >
              </div>
            </template>

            <!-- Employee Name -->
            <template v-slot:[`item.winner_user_id`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2"
                  >mdi-account</v-icon
                > -->
                <span class="caption font-weight-medium">{{
                  item.winner_user_id
                }}</span>
              </div>
            </template>

            <!-- Total Awards -->
            <template v-slot:[`item.total_awards`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="success" class="mr-2">mdi-star</v-icon> -->
                <span class="caption font-weight-medium">{{
                  item.total_awards
                }}</span>
              </div>
            </template>
          </v-data-table>
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalCount === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${totalCount} leaderboard entries`
              }}
            </div>
            <div class="pagination-controls">
              <v-btn
                :disabled="currentPage === 1"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage - 1"
              >
                Previous
              </v-btn>
              <div class="page-numbers">
                <v-btn
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === currentPage ? 'elevated' : 'text'"
                  size="small"
                  :class="
                    page === currentPage ? 'active-page' : 'inactive-page'
                  "
                  @click="currentPage = page"
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
              >
                Next
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Modern Table Footer -->
    </div>

    <!-- Recent Awards Dialog -->
    <!-- <v-dialog v-model="showDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-3" color="primary">mdi-trophy</v-icon>
          Recent Awards - {{ selectedEmployee }}
        </v-card-title>
        <v-card-text>
          <v-list v-if="recentAwards.length > 0">
            <v-list-item
              v-for="(award, index) in recentAwards"
              :key="index"
              class="mb-2"
            >
              <template v-slot:prepend>
                <v-icon color="primary" size="small">mdi-medal</v-icon>
              </template>
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-list-item-title class="font-weight-medium" v-bind="props">
                    {{ award.award_title || "Award" }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-bind="props">
                    {{ award.award_date || "Date not available" }}
                  </v-list-item-subtitle>
               
                </template>
                   <span class="caption text-truncate" style="max-width: 300px">
                    {{
                      award.award_reason || "No Reason available"
                    }}
                  </span>
              </v-tooltip> -->
              <!-- <template v-slot:append>
                <v-chip color="success" variant="outlined" size="small">
                  {{ award.award_reason || "Category" }}
                </v-chip>
              </template> -->
            <!-- </v-list-item>
          </v-list>
          <div v-else class="text-center py-8">
            <v-icon size="48" color="grey lighten-1" class="mb-4"
              >mdi-trophy-outline</v-icon
            >
            <div class="text-h6 grey--text">No Recent Awards</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
    <AwardDialog :recentAward="recentAward" @close="recentAward = false" :items="selectedItem"/>
  </div>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { get_awards_and_leaderboard } from "@/graphql/mutations";
import AwardDialog from "@/components/RewardsManagement/ConfigurationComponents/AwardDialog.vue";

export default {
  components: {
    AwardDialog,
  },
  data() {
    return {
      selectedItem: null,
      searchQuery: "",
      recentAward: false,
      showDialog: false,
      selectedEmployee: "",
      recentAwards: [],
      headers: [
        { title: "Rank", key: "rank" },
        { title: "Employee Name", key: "winner_name" },
        { title: "Total Awards", key: "total_awards" },
      ],
      items: [],
      tableLoading: false,
      currentPage: 1,
      itemsPerPage: 10,
      windowHeight: 0,
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery) return this.items;
      const q = this.searchQuery.toLowerCase();
      return this.items.filter((item) =>
        item.winner_user_id.toLowerCase().includes(q)
      );
    },
    totalCount() {
      return this.filteredItems.length;
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
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
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
  async mounted() {
    this.windowHeight = window.innerHeight - 260;
    await this.fetchLeaderboard();
  },
  methods: {
    showRecentAwards(click, value) {
  this.selectedItem = value.item;   
  this.recentAward = true;
},
    async fetchLeaderboard() {
      try {
        this.tableLoading = true;
        const input = {
          action_type: "GET_AWARDS_AND_LEADERBOARD",
        };
        const result = await API.graphql(
          graphqlOperation(get_awards_and_leaderboard, { input })
        );
        let response = JSON.parse(result.data.get_awards_and_leaderboard);
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.items = response.data.leaderboard || [];
        } else {
          this.items = [];
        }
        this.tableLoading = false;
      } catch (error) {
        this.tableLoading = false;
        console.error("Failed to fetch leaderboard:", error);
      }
    },
 
  },
};
</script>

<style scoped>
.card-container {
  position: relative;
}

.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

.leaderboard-card {
  min-height: 400px;
}
</style> 