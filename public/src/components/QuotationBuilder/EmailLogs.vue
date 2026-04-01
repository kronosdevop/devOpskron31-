<template>
  <div style="padding-bottom: 70px">
    <v-card class="mt-4" flat >
      <v-card-text>
        <v-data-table
          :fixed-header="fixed"
          :headers="headers"
          :items="paginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg"
          density="compact"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-email-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Email Logs Found</div>
              <div class="text-body-2 grey--text">
                No email logs have been generated yet.
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
              <div class="text-body-2 grey--text">Loading email logs...</div>
            </div>
          </template>

          <template v-slot:[`item.log_created_on`]="{ item }">
            <span>{{ get_updatedate(item.log_created_on) }}</span>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn icon color="red" size="x-small" @click="view_details(item)">
              <v-icon>mdi-alert-circle-outline</v-icon>
            </v-btn>
          </template>
        </v-data-table>

        <!-- Footer bar always rendered -->
        <div
          class="footer-bar d-flex align-center justify-space-between px-6 py-2"
          style="min-height: 56px; background: #f7f8fa"
        >
          <div class="text-caption ml-4" style="color: black; font-size: 14px">
            {{
              totalCount === 0
                ? "No Results"
                : (currentPage - 1) * itemsPerPage +
                  1 +
                  " to " +
                  Math.min(currentPage * itemsPerPage, totalCount) +
                  " of " +
                  totalCount +
                  " Results"
            }}
          </div>
          <div class="pagination-container d-flex align-center mr-4">
            <v-pagination
              v-model="currentPage"
              :length="pageCount"
              active-color="primary"
              density="comfortable"
              class="pagination-footer"
              :total-visible="5"
              next-icon="mdi-chevron-right"
              prev-icon="mdi-chevron-left"
              @update:modelValue="updatePageItems"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <ViewEmailLogs
        :viewEmailInfoDialog="viewEmailInfoDialog"
        :ViewInfo="ViewInfo"
        @clicked="viewEmailInfoDialog = false"
      />
    </div>
  </div>
</template>

<script>
import { list_email_logs } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import ViewEmailLogs from "./ViewEmailLogs.vue";
import { format_Date } from "@/JsonFiles/DateFormate.js";

export default {
  components: {
    ViewEmailLogs,
    SnackBar,
  },
  data() {
    return {
      tableData: [],
      tableLoading: false,
      fixed: true,
      headers: [
        { title: "No.", value: "ref_no", sortable: false },
        { title: "Sent To", value: "email_sent_to", sortable: false },
        { title: "Created On", value: "log_created_on", sortable: false },
        { title: "View", value: "action", sortable: false },
      ],
      SnackBarComponent: {},
      componentCheck: 0,
      ViewInfo: {},
      viewEmailInfoDialog: false,
      // Pagination properties
      paginatedItems: [],
      itemsPerPage: 20,
      currentPage: 1,
      sortBy: [{ key: "ref_no", order: "asc" }],
    };
  },
  computed: {
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.totalCount / this.itemsPerPage);
    },
    sortedAndPaginatedItems() {
      // First sort the filtered items
      const sortedItems = this.tableData.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      return sortedItems;
    },
  },
  mounted() {
    this.list_email_logs();
    this.updatePageItems(); // Initialize paginated items
  },

  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },

  methods: {
    view_details(item) {
      this.componentCheck = 1;
      this.viewEmailInfoDialog = true;
      this.ViewInfo = item;
    },
    get_updatedate(date) {
      if (date != "" && date != undefined) {
        return format_Date(date);
      }
    },
    updatePageItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedItems = this.sortedAndPaginatedItems.slice(
        startIndex,
        endIndex
      );
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.updatePageItems();
    },

    getSortValue(value, key) {
      if (!value) return "";
      if (key === "ref_no" || key === "email_sent_to") {
        return value.toLowerCase();
      }
      return value;
    },

    async list_email_logs() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(graphqlOperation(list_email_logs, {}));

        this.tableLoading = false;
        var response = JSON.parse(result.data.list_email_logs);

        if (response.Status === "SUCCESS") {
          this.tableData = response.data;
          this.updatePageItems(); // Update paginated items after data is loaded
          // console.log(this.tableData)
        } else {
          this.tableLoading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.tableLoading = false;
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.pagination-container {
  min-width: 160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-footer {
  margin: 0;
  padding: 0;
  display: inline-flex;
}

.pagination-footer :deep(.v-pagination__list) {
  background: transparent;
  justify-content: flex-end;
}

.pagination-footer :deep(.v-pagination__item) {
  border-radius: 50%;
  margin: 0 2px;
}

.pagination-footer :deep(.v-pagination__item--is-active) {
  background-color: var(--v-primary-base);
  color: white;
}

.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}

.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}
</style>