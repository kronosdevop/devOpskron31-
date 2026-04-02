<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-toolbar density="compact" class="ml-2 mt-n1" flat color="transparent">
      <v-toolbar-title>
        <v-icon class="mr-3" color="primary" size="large"
          >mdi-account-cog</v-icon
        >
        <span class="font-weight-bold text-h6">Members Settings</span>
      </v-toolbar-title>
      <v-spacer />
      <v-text-field
        placeholder="Search by name, location, or RFID"
        density="compact"
        variant="outlined"
        hide-details
        class="mr-6 mt-1"
        width="20px"
        v-model="search"
        @keydown.esc="search = ''"
        :loading="!!search"
        clearable
        prepend-inner-icon="mdi-magnify"
      ></v-text-field>
    </v-toolbar>
    <v-card flat>
      <v-card-text>
        <v-data-table
          :search="search"
          :headers="headers"
          :fixed-header="fixed"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :height="CommonVuetifyObj.height - 275"
          hide-default-footer
          density="compact"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
          class="modern-data-table dtwidth"
          @click:row="handle_row_click"
        >
          <template v-slot:loading>
                  <div class="text-center">
                    <v-progress-circular indeterminate color="primary" size="32" class="mt-6" />
                    <div class="text-subtitle-2 mt-4 text-grey">Loading Member Settings</div>
                  </div>

                </template>
          <template v-slot:[`item.full_user_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon color="primary">mdi-account</v-icon> -->
              <div class="ml-2">{{ item.full_user_name }}</div>
            </div>
          </template>
          <template v-slot:[`item.work_shift_timings_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon color="primary">mdi-account</v-icon> -->
              <div class="ml-2">{{ item.presence_settings?.work_shift_timings_name || '-' }}</div>
            </div>
          </template>

          <template v-slot:[`item.rfid`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon color="primary">mdi-id-card</v-icon> -->
              <div class="ml-2">
                {{ item.rfid == undefined ? "N/A" : item.rfid }}
              </div>
            </div>
          </template>

          <template v-slot:[`item.location`]="{ item }">
            <div
              v-if="
                item.presence_settings != null ||
                item.presence_settings != undefined
              "
              class="d-flex align-center"
            >
              <!-- <v-icon color="primary">mdi-map-marker</v-icon> -->
              <div class="ml-2">
                {{
                  item.presence_settings.is_scan_anywhere == true
                    ? "Scan Any where"
                    : item.presence_settings.location_name == undefined
                    ? "Geo Location"
                    : item.presence_settings.location_name
                }}
              </div>
            </div>
            <div v-else>Scan Any where</div>
          </template>

          <template v-slot:[`item.presence_settings_updated_on`]="{ item }">
  <div class="d-flex flex-column">
    <div v-if="item.presence_settings_updated_on">
      {{ get_date(item.presence_settings_updated_on) }}
    </div>

    <div
      v-if="item.presence_settings_updated_by"
      class="text-caption text--secondary"
    >
      By: {{ item.presence_settings_updated_by }}
    </div>

    <div v-else class="text-caption text--disabled">
      -
    </div>
  </div>
</template>


          <template v-slot:[`item.action`]="{ item }">
            <v-icon size="small" color="primary" @click.stop="click_edit(item)"
              >mdi-pencil</v-icon
            >
            <v-icon
              size="small"
              color="primary"
              class="ml-2"
              v-if="item.rfid != undefined && item.rfid != 'N/A'"
              @click.stop="unmap_userrfid(item)"
              >mdi-card-account-details-outline</v-icon
            >
          </template>
        </v-data-table>

        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Show ${sortedAndPaginatedItems.length} of ${totalItems} member settings`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage === 1"
              class="pagination-btn"
              variant="text"
              size="small"
              @click="currentPage = currentPage - 1"
              >Previous</v-btn
            >
            <v-btn
              v-for="page in visiblePages"
              :key="page"
              class="page-numbers"
              size="small"
              :class="page === currentPage ? 'active-page' : 'inactive-page'"
              :variant="page === currentPage ? 'text' : ''"
              @click="currentPage = page"
              >{{ page }}</v-btn
            >
            <v-btn
              :disabled="currentPage === pageCount"
              variant="text"
              size="small"
              class="pagination-btn"
              @click="currentPage = currentPage + 1"
              >Next</v-btn
            >
          </div>
        </div>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <SettingsMembers
        :membersUpdate="membersUpdate"
        @clicked="membersUpdate = false"
        :membersItem="membersItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <UnmapRfid
        :rfidMapping="rfidMapping"
        @clicked="rfidMapping = false"
        :membersItem="membersItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import UnmapRfid from "@/components/PresenceApp/PopUps/UnmapRfid.vue";
import SettingsMembers from "@/components/PresenceApp/PopUps/SettingsMembers.vue";
import { list_all_users } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    SettingsMembers,
    UnmapRfid,
  },
  data() {
    return {
      membersUpdate: false,
      rfidMapping: false,
      membersItem: {},
      search: "",
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      tableData: [],
      nextToken: null,
      tableLoading: false,
      fixed: true,
      componentCheck: 0,
      sortBy: [],
      page: 1,
      totalItems: 0,
      itemsPerPage: 10,
      currentPage: 1,
      pageCount: 0,
      sortedAndPaginatedItems: [],
      headers: [
        { title: "Name", value: "full_user_name", sortable: true },
        {
          title: "Location",
          value: "location",
          sortable: true,
        },
        { title: "RFID", value: "rfid", sortable: true },
        {
          title: "Updated On",
          value: "presence_settings_updated_on",
          sortable: true,
        },
        {
          title: "Work Shift",
          value: "work_shift_timings_name",
          sortable: true,
        },

        {
          title: "Action",
          value: "action",
          sortable: false,
          align: "center",
        },
      ],
    };
  },
  computed: {
    sortedAndPaginatedItems() {
      const sortedItems = this.tableData.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
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
    this.CommonVuetifyObj = useDisplay();
    await this.get_users();
    this.paginateData();
  },
  methods: {
    handlePagination_check1() {
      if (this.nextToken) {
        this.get_users();
      }
    },
    get_date(date) {
      return formatedatetime(date);
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.tableData = [];
      this.membersUpdate = false;
      this.rfidMapping = false;
      this.get_users();
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
    handle_row_click(click, val) {
      this.membersItem = val.item;
      this.componentCheck = 1;
      this.membersUpdate = true;
    },
    click_edit(val) {
      this.membersItem = val;
      this.componentCheck = 1;
      this.membersUpdate = true;
    },
    unmap_userrfid(val) {
      this.membersItem = val;
      this.componentCheck = 2;
      this.rfidMapping = true;
    },
    async get_users() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_users, {
            input: {
              limit: 500,
              nextToken: this.nextToken,
            },
          })
        );
        this.tableLoading = false;

        let response = result.data.list_all_users;
        if (typeof response === "string") {
          response = JSON.parse(response);
        }

        if (response.Status === "SUCCESS") {
          let dataArray = response.data || [];
          this.nextToken = response.nextToken;
          let array = this.tableData.concat(dataArray);
          this.tableData = array;
          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.user_id === obj.user_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.tableData.sort((a, b) => {
            return a.full_user_name.localeCompare(b.full_user_name);
          });
          this.paginateData();
          this.totalItems = this.tableData.length;
        } else {
          this.tableData = [];
          this.totalItems = 0;
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.message || "Failed to fetch users",
          timeout: 5000,
          Top: true,
        };
      }
    },
    updatePageItems(newPage) {
      this.currentPage = newPage;
    },
    paginateData() {
      this.pageCount = Math.ceil(this.tableData.length / this.itemsPerPage);
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
    },
    getSortValue(value, key) {
      if (typeof value === "object" && key in value) {
        return value[key];
      }
      return value;
    },
  },
};
</script>

<style scoped>
.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.font-weight-medium {
  font-weight: 500;
}

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

.search-field {
  transition: max-width 0.3s ease;
}

.search-field:focus-within {
  max-width: 400px !important;
}

.search-field :deep(.v-field__input) {
  min-height: 36px;
  padding-top: 0;
  padding-bottom: 0;
}

.search-field :deep(.v-field__append-inner) {
  padding-top: 6px;
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
</style>
