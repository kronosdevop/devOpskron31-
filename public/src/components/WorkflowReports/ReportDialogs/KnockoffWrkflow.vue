<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :search="globalSearch"
          :headers="headers"
          :items="paginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalItems"
          density="comfortable"
          hover
          hide-default-footer
          multi-sort
          class="modern-data-table"
          @update:sort-by="() => {}"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-format-list-bulleted</v-icon
              >
              <div class="text-h6 grey--text mb-2">
                No Knockoff Records Found
              </div>
              <div class="text-body-2 grey--text">
                No workflow knockoff records available.
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
              <div class="text-body-2 grey--text">
                Loading knockoff records...
              </div>
            </div>
          </template>

          <template v-slot:[`item.workflow_name`]="{ item }">
            <div class="d-flex align-center">
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.workflow_name }}
                </div>
                <div class="caption text-grey">{{ item.transaction_id }}</div>
              </div>
            </div>
          </template>
          <template v-slot:[`item.workflow_initiated_by`]="{ item }">
            <div class="d-flex align-center">
              <span class="caption">{{
                fetch_user_name(item.workflow_initiated_by)
              }}</span>
            </div>
          </template>
          <template v-slot:[`item.workflow_initiated_on`]="{ item }">
            <div class="d-flex align-center">
              <span class="caption">{{
                get_date(item.workflow_initiated_on)
              }}</span>
            </div>
          </template>
          <template v-slot:[`item.knocked_off_email_id`]="{ item }">
            <div class="d-flex align-center">
              <span class="caption">{{
                fetch_user_name(item.knocked_off_email_id)
              }}</span>
            </div>
          </template>
          <template v-slot:[`item.knockedoff_timestamp`]="{ item }">
            <div class="d-flex align-center">
              <span class="caption">{{
                get_date(item.knockedoff_timestamp)
              }}</span>
            </div>
          </template>
          <template v-slot:[`item.comments`]="{ item }">
            <div class="d-flex align-center">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div
                    v-if="item.comments"
                    class="caption text-truncate"
                    style="max-width: 200px"
                    v-on="on"
                  >
                    {{
                      item.comments.length >= 50
                        ? item.comments.substr(0, 50) + "..."
                        : item.comments
                    }}
                  </div>
                  <div v-else class="caption">-</div>
                </template>
                <div class="textWrap" style="max-width: 250px">
                  {{ item.comments }}
                </div>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalItems} knockoff records`
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
    </v-card>
  </div>
</template>

<script>
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { list_knockedoff_aging_workflow } from "@/graphql/queries.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    globalSearch: {
      type: String,
      default: "",
    },
  },

  mixins: [get_all_org_users],

  data() {
    return {
      height: 0,
      fixed: true,
      allUSersNames: [],
      next_token: null,
      tableData: [],
      tableLoading: false,

      currentPage: 1,
      itemsPerPage: 20,

      headers: [
        { title: "Workflow Name/ID", key: "workflow_name", sortable: false },
        {
          title: "Initiated By",
          key: "workflow_initiated_by",
          sortable: false,
        },
        {
          title: "Initiated On",
          key: "workflow_initiated_on",
          sortable: false,
        },
        {
          title: "Knocked off By",
          key: "knocked_off_email_id",
          sortable: false,
        },
        {
          title: "Knocked off On",
          key: "knockedoff_timestamp",
          sortable: false,
        },
        { title: "Knocked off Comments", key: "comments", sortable: false },
      ],
    };
  },

  computed: {
    // 🔍 Search filter
    filteredTableData() {
      if (!this.globalSearch || this.globalSearch.trim() === "") {
        return this.tableData;
      }

      const search = this.globalSearch.toLowerCase();

      return this.tableData.filter((row) =>
        Object.values(row).some(
          (val) => val && String(val).toLowerCase().includes(search)
        )
      );
    },

    // 📄 Pagination
    paginatedItems() {
      const sorted = this.filteredTableData.slice().sort((a, b) => {
        const aVal = (a.workflow_name || "").toLowerCase();
        const bVal = (b.workflow_name || "").toLowerCase();
        return aVal.localeCompare(bVal);
      });

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      return sorted.slice(start, end);
    },

    totalItems() {
      return this.filteredTableData.length;
    },

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.pageCount, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  watch: {
    globalSearch() {
      this.currentPage = 1;
    },
  },

  async mounted() {
    this.height = window.innerHeight - 250;
    await this.get_transaction();
    await this.get_all_org_users();
    this.allUSersNames = this.orgUsers;
  },

  methods: {
    async get_transaction() {
      this.tableLoading = true;
      const data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_knockedoff_aging_workflow, {
            input: {
              organization_id: data.organization.organization_id,
              next_token: this.next_token,
              limit: 100, // fetch more at once
            },
          })
        );

        const response = JSON.parse(result.data.list_knockedoff_aging_workflow);

        if (response.Status === "SUCCESS") {
          if (response.data && response.data.length > 0) {
            this.tableData = [...this.tableData, ...response.data];
          }

          // remove duplicates
          this.tableData = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.knockoff_id === obj.knockoff_id)
          );

          this.next_token = response.nextToken;
        }
      } catch (error) {
        console.error("API Error:", error);
      }

      this.tableLoading = false;
    },

    get_date(date) {
      return formatedatetime(date);
    },

    fetch_user_name(value) {
      let name = "";

      this.allUSersNames.forEach((element) => {
        if (element.user_email_id === value) {
          name = element.full_user_name;
        }
      });

      if (value === "SYSTEM") {
        name = "SYSTEM";
      }

      return name;
    },
  },
};
</script>
<style scoped>
.font-weight-medium {
  font-weight: 500;
}
/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
/* Table Footer */
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
.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}
.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}
</style>
