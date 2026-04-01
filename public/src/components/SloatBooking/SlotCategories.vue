<template>
  <div >
    <v-card class="" flat >
      <!-- <v-card-title>
        <v-icon class="mr-3" color="primary" size="large">mdi-view-list</v-icon>
        <span class="font-weight-bold text-h6"
          >Slot Categories ({{ categoriesRecords.length }})</span
        >
      </v-card-title> -->
      <v-card-text>
        <v-data-table
          :headers="categoriesHeaders"
          :items="paginatedItems"
          :loading="tableLoading"
          :fixed-header="true"
          :height="windowHeight"
          hide-default-footer
          density="comfortable"
          class="modern-data-table"
          hover
          multi-sort
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-view-list-outline</v-icon
              >
              <div class="text-h6 text-grey mb-2">No Categories Found</div>
              <div class="text-body-2 text-grey">
                No slot categories have been created yet.
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
              <div class="text-body-2 text-grey">Loading categories...</div>
            </div>
          </template>

          <template v-slot:[`item.slot_category_name`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="20" color="primary" class="mr-3">mdi-tag</v-icon>
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.slot_category_name || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:[`item.slot_category_created_by_name`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="24" color="primary" class="mr-3">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{
                    (item.slot_category_created_by_name || "U")
                      .substring(0, 1)
                      .toUpperCase()
                  }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.slot_category_created_by_name || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:[`item.timesheet_created_on`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2">mdi-clock</v-icon>
              <span class="caption">
                {{ get_date(item.timesheet_created_on * 1000) }}
              </span>
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex align-start justify-start">
              <v-btn
                icon
                size="small"
                variant="text"
                color="red"
                @click="open_deleteDailog(item)"
                class="cursor-pointer"
              >
                <v-icon size="18">mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              categoriesRecords.length === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${categoriesRecords.length} categories`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage === 1"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage = currentPage - 1"
              style="color: #666 !important;"
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
                :style="page === currentPage ? 'background: #DB4C77 !important; color: white !important;' : 'color: #666 !important;'"
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
              style="color: #666 !important;"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeleteCategories
        :categoriesdeletion="categoriesdeletion"
        @clicked="categoriesdeletion = false"
        :categoriesItem="categoriesItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
      <script>
import SnackBar from "@/components/SnackBar.vue";
import DeleteCategories from "@/components/SloatBooking/Popups/DeleteCategories.vue";
import { slot_category } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
    DeleteCategories,
  },
  data() {
    return {
      SnackBarComponent: {},
      categoriesdeletion: false,
      tableLoading: false,
      componentCheck: 0,
      categoriesItem: {},
      categoriesHeaders: [
        { title: "Name", value: "slot_category_name", sortable: false },
        {
          title: "Created By",
          value: "slot_category_created_by_name",
          sortable: false,
        },
        { title: "Actions", value: "actions", sortable: false },
      ],
      categoriesRecords: [],
      fixed: false,
      currentPage: 1,
      itemsPerPage: 20,
      pageCount: 1,
      windowHeight: 0,
    };
  },
  computed: {
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.categoriesRecords.slice(start, end);
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
  async created() {
    await this.fetch_categories();
  },
  mounted() {
    this.windowHeight = window.innerHeight - 280;
  },
  methods: {
    get_date(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },

    open_deleteDailog(item) {
      this.categoriesItem = item;
      this.componentCheck = 1;
      this.categoriesdeletion = true;
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.categoriesdeletion = false;

      this.fetch_categories();
    },

    async fetch_categories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(slot_category, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(result.data.slot_category);
        this.categoriesRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.categoriesRecords = response.data;
          this.tableLoading = false;
          this.pageCount = Math.ceil(
            this.categoriesRecords.length / this.itemsPerPage
          );
        } else {
          this.categoriesRecords = [];

          this.tableLoading = false;
        }
      } catch (error) {
        this.categoriesRecords = [];

        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    updatePageItems(newPage) {
      this.currentPage = newPage;
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  background: #DB4C77 !important;
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