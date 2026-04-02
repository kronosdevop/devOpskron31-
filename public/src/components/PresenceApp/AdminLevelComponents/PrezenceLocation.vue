<template>
  <SnackBar :SnackBarComponent="SnackBarComponent" />
  <div>
    <v-toolbar color="transparent" density="compact" class="mt-n2">
      <v-toolbar-title>
        <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>Location
        Details
      </v-toolbar-title>
    </v-toolbar>
    <v-card elevation="0">
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :height="CommonVuetifyObj.height - 275"
          :server-items-length="totalCount"
          hide-default-footer
          fixed-header="true"
          class="dtwidth modern-data-table"
          density="compact"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-map-marker-off</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Locations Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or add a new location.
              </div>
            </div>
          </template>

          <template v-slot:[`item.location_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon color="primary" size="small">mdi-map-marker</v-icon> -->
              <div class="ml-2">{{ item.location_name }}</div>
            </div>
          </template>

          <template v-slot:[`item.location_address`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon color="green" size="small">mdi-arch</v-icon> -->
              <div class="ml-2">{{ item.location_address || "-" }}</div>
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
              <div class="text-body-2 text-grey">Loading locations...</div>
            </div>
          </template>

          <template v-slot:[`item.qr_details`]="{ item }">
            <div v-if="item.qr_details.length != 0">
              <v-icon @click="qrView(item)" v-if="item.qr_details.length == 1"
                >mdi-qrcode</v-icon
              >
              <v-btn
                size="x-small"
                dark
                text
                v-else
                class="cardCss text-capitalize"
                @click="qrmultipleView(item)"
                >View</v-btn
              >
            </div>
            <div v-else class="ml-1">-</div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon elevation="0">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-list density="compact">
                  <v-list-item>
                    <v-btn icon elevation="0" @click="add_locationQR(item)">
                      <v-icon color="green">mdi-pencil</v-icon>
                    </v-btn>
                  </v-list-item>
                  <v-list-item>
                    <v-btn icon elevation="0" @click="openDoorDialog(item)">
                      <v-icon color="deep-purple">mdi-door</v-icon>
                    </v-btn>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>
        </v-data-table>
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No Results"
                : `Showing ${sortedAndPaginatedItems.length} of ${totalCount} locations`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              class="pagination-btn"
              :disabled="currentPage === 1"
              variant="text"
              @click="currentPage = currentPage - 1"
              >Previous</v-btn
            >
            <v-btn
              v-for="page in visiblePages"
              :key="page"
              class="page-numbers"
              :class="page === currentPage ? 'active-page' : 'inactive-page'"
              :variant="page === currentPage ? 'text' : ''"
              @click="currentPage = page"
              >{{ page }}</v-btn
            >
            <v-btn
              class="pagination-btn"
              :disabled="currentPage === pageCount"
              variant="text"
              @click="currentPage = page"
              >Next</v-btn
            >
          </div>
        </div>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateLocationQR
        :qrCreation="qrCreation"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="qrCreation = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <LocationQRview
        :qrLocation="qrLocation"
        @clicked="qrLocation = false"
        :rowInfo="rowInfo"
        :qrtype="qrtype"
      />
    </div>
    <div v-if="componentCheck == 3">
      <LocationQrList
        :qrListLocation="qrListLocation"
        @clicked="qrListLocation = false"
        :rowInfo="rowInfo"
      />
    </div>
    <DoorlockDialog
      :model-value="doorDialog"
      :item="doorDialogItem"
      @update:modelValue="doorDialog = $event"
      @toggle-door="handleToggleDoor"
      @successMsg="success_info"
      @errorMsg="error_info"
    />
  </div>
</template>
<script>
import SnackBar from "@/components/SnackBar.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import CreateLocationQR from "@/components/SettingsDialogs/CreateLocationQR.vue";
import { list_all_locations } from "@/graphql/queries.js";
import LocationQrList from "@/components/SettingsDialogs/LocationQrList.vue";
import LocationQRview from "@/components/SettingsDialogs/LocationQRview.vue";
import { API, graphqlOperation } from "aws-amplify";
import DoorlockDialog from "./DoorlockDialog.vue";
export default {
  components: {
    SnackBar,
    CreateLocationQR,
    LocationQRview,
    LocationQrList,
    DoorlockDialog,
  },
  data() {
    return {
      headers: [
        {
          title: "Location",
          value: "location_name",
          sortable: true,
          align: "start",
        },
        { title: "QR", value: "qr_details", sortable: false, align: "center" },
        {
          title: "Address",
          value: "location_address",
          sortable: true,
          align: "start",
        },
        // { title: "Doorlock", value: "door_enabled", sortable: false, align: "center" },
        { title: "Action", value: "actions", sortable: false, align: "center" },
      ],
      tableData: [],
      tableLoading: false,
      qrCreation: false,
      qrListLocation: false,
      qrLocation: false,
      next_token: null,
      componentCheck: 0,
      rowInfo: {},
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      search: "",
      searchQuery: "",
      sortBy: [{ key: "location_name", order: "asc" }],
      fixed: true,
      height: 0,
      qrtype: "Single",
      page: 1,
      itemsPerPage: 100,
      currentPage: 1,
      totalCount: 0,
      doorDialog: false,
      doorDialogItem: null,
    };
  },
  created() {
    this.height = window.innerHeight - 260;
  },
  watch: {},
  mounted() {
    this.CommonVuetifyObj = useDisplay();
    this.fetch_master_locations();
  },
  methods: {
    add_locationQR(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.qrCreation = true;
    },
    qrmultipleView(item) {
      this.componentCheck = 3;
      this.rowInfo = item;
      this.qrListLocation = true;
    },
    qrView(item) {
      this.componentCheck = 2;
      this.rowInfo = item;
      this.qrLocation = true;
    },
    async fetch_master_locations() {
      this.tableLoading = true;
      let data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_locations, {
            organization_id: data.organization.organization_id,
            location_status: "ACTIVE",
            limit: 500,
            next_token: null,
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        let response = result.data.list_all_locations;
        this.tableData = response.details;
        this.tableData = this.tableData.filter(
          (obj) => obj.location_type != "SCAN_ANYWHERE"
        );
        this.totalCount = this.tableData.length;
        this.currentPage = 1;
        // console.log(result, "result");
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
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

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.qrCreation = false;
      this.fetch_master_locations();
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.updatePageItems();
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (key === "location_name" || key === "location_address") {
        return value.toLowerCase();
      }
      return value;
    },
    updatePageItems() {},
    openDoorDialog(item) {
      this.doorDialogItem = item;
      this.doorDialog = true;
    },
    handleToggleDoor(item) {
      if (item) {
        item.door_enabled = !item.door_enabled;
        this.doorDialog = false;
      }
    },
  },
  computed: {
    totalCount() {
      return this.tableData.length;
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },
    sortedAndPaginatedItems() {
      const sortedItems = this.paginatedItems.slice().sort((a, b) => {
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
          start = Math.min(1, end - 4);
        }
      }
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
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
