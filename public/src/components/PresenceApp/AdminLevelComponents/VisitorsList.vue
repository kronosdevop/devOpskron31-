<template>
  <div>
    <v-card flat class="overflow-y-auto">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <div>
          <v-card-text class="pa-4">
            <v-data-table
              :headers="headers"
              :items="paginatedItems"
              :loading="tableLoading"
              :sort-by="['last_swiped_on']"
              :items-per-page="itemsPerPage"
              :page="currentPage"
              :server-items-length="totalCount"
              hide-default-footer
              class="modern-data-table"
              density="comfortable"
              hover
              :fixed-header="true"
              :height="windowHeight"
              multi-sort
              @update:sort-by="handleSortChange"
            >
              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey-lighten-1" class="mb-4"
                    >mdi-account-group-outline</v-icon
                  >
                  <div class="text-h6 text-grey mb-2">No Visitors Found</div>
                  <div class="text-body-2 text-grey">
                    No visitors are registered at the moment.
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
                  <div class="text-body-2 text-grey">Loading visitors...</div>
                </div>
              </template>

              <!-- RFID Field with Icon -->
              <template v-slot:[`item.rfid`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="20" color="primary" class="mr-3"
                      >mdi-credit-card-wireless</v-icon
                    > -->
                  <div>
                    <div class="font-weight-medium text-body-2">
                      {{ item.rfid || "N/A" }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Visitor Name Field with Icon -->
              <template v-slot:[`item.visitor_name`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-avatar size="24" color="primary" class="mr-3">
                      <span
                        class="white--text font-weight-medium"
                        style="font-size: 10px"
                      >
                        {{
                          (item.visitor_name || "V")
                            .substring(0, 1)
                            .toUpperCase()
                        }}
                      </span>
                    </v-avatar> -->
                  <div>
                    <div class="font-weight-medium text-body-2">
                      {{ item.visitor_name || "N/A" }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Last Visited On Field with Icon -->
              <template v-slot:[`item.last_swiped_on`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="grey" class="mr-2"
                      >mdi-calendar-clock</v-icon
                    > -->
                  <div>
                    <div class="caption font-weight-medium">
                      {{
                        item.last_swiped_on
                          ? get_date(item.last_swiped_on)
                          : "Never visited"
                      }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Actions Column -->
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="edit_vist(item)"
                  class="cursor-pointer"
                >
                  <v-icon size="18">mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table>

            <!-- Modern Table Footer -->
            <div class="table-footer">
              <div class="footer-info">
                {{
                  totalCount === 0
                    ? "No Results"
                    : `Showing ${
                        paginatedItems ? paginatedItems.length : 0
                      } of ${totalCount} visitors`
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
                    :class="
                      page === currentPage ? 'active-page' : 'inactive-page'
                    "
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
        </div>
      </div>
    </v-card>

    <div v-if="componentCheck == 1">
      <EditVist
        :visitorEdition="visitorEdition"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="visitorEdition = false"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import EditVist from "@/components/PresenceApp/PopUps/EditVist.vue";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { list_presence_visitors } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    EditVist,
  },
  data() {
    return {
      search: "",
      tableLoading: false,
      visitorEdition: false,
      tableData: [],
      SnackBarComponent: {},
      rowInfo: {},
      componentCheck: 0,
      fixed: true,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      itemsPerPage: 10,
      currentPage: 1,
      totalCount: 0,
      sortedAndPaginatedItems: [],
      headers: [
        { title: "RFID", value: "rfid", sortable: false },
        {
          title: "Visitor",
          value: "visitor_name",
          sortable: false,
        },
        {
          title: "Last Visited On",
          value: "last_swiped_on",
          sortable: false,
        },
        {
          title: "Action",
          value: "actions",
          sortable: false,
        },
      ],
      windowHeight: 0,
    };
  },
  created() {
    this.windowHeight = window.innerHeight - 280;
    this.get_vistor_list();
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalCount / this.itemsPerPage);
    },
    paginatedItems() {
      if (!this.tableData || this.tableData.length === 0) {
        return [];
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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
    get_date(val) {
      return formatedatetime(val / 1000);
    },
    edit_vist(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.visitorEdition = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.visitorEdition = false;
      this.tableData = [];
      this.get_vistor_list();
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

    async get_vistor_list() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_presence_visitors, {})
        );

        this.tableLoading = false;
        var response = JSON.parse(result.data.list_presence_visitors);
        if (response.Status == "SUCCESS") {
          let array = this.tableData.concat(response.data || []);
          this.tableData = array;

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.visitor_id === obj.visitor_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.totalCount = this.tableData.length;
          this.sortedAndPaginatedItems = this.tableData;

          // Ensure currentPage doesn't exceed available pages
          const maxPage = Math.ceil(this.totalCount / this.itemsPerPage);
          if (this.currentPage > maxPage && maxPage > 0) {
            this.currentPage = maxPage;
          }
        } else {
          this.tableLoading = false;
        }
      } catch (error) {
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

    handleSortChange(_newSortBy) {
      // Implement the logic to handle sort change
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
}

.card-container {
  padding: 0 24px 24px;
}

.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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

.modern-data-table :deep(.v-data-table__thead th) {
  background-color: #f7f8fa;
  color: #333;
  font-weight: bold;
  font-size: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.modern-data-table :deep(.v-data-table__tbody td) {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
}

.modern-data-table :deep(.v-data-table__tbody tr:last-child td) {
  border-bottom: none;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f8fa;
  border-top: 1px solid #eee;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
}

.footer-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  font-size: 14px;
  color: #666;
  border: 1px solid #eee;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #db4c77;
  color: white;
}

.pagination-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
}

.page-numbers .v-btn {
  margin: 0 4px;
}

.page-numbers .v-btn--text {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  border: 1px solid #eee;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.page-numbers .v-btn--text:hover:not(:disabled) {
  background-color: #db4c77;
  color: white;
}

.page-numbers .v-btn--text.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.page-numbers .v-btn--text.inactive-page {
  color: #666 !important;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}
</style>
