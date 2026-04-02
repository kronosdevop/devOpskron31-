<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-toolbar
      density="compact"
      color="transparent"
      class="mt-n3"
      elevation="0"
    >
      <v-toolbar-title
        ><v-icon color="primary" class="mr-2">mdi-id-card</v-icon
        >RFID</v-toolbar-title
      >
      <v-spacer />
      <v-btn
        @click="add_action()"
        class="mt-3 elevation-0 cardCss mr-4"
        height="35"
      >
        <v-icon dark>mdi-plus</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card elevation="0">
      <v-card-text class="">
        <v-data-table
          :headers="headers"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          :height="CommonVuetifyObj.height - 275"
          hide-default-footer
          class="dtwidth modern-data-table"
          density="compact"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-credit-card-wireless-off</v-icon
              >
              <div class="text-h6 grey--text mb-2">No RFID Mappings Found</div>
              <div class="text-body-2 grey--text">
                Try adding a new RFID mapping or check your data.
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
              <div class="text-body-2 text-grey">Loading RFID mappings...</div>
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              size="small"
              class=""
              color="primaryColor"
              @click="edit_Rfid(item)"
              >mdi-pencil</v-icon
            >
            <v-icon
              size="small"
              class="ml-2"
              color="red"
              @click="delete_Rfid(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${sortedAndPaginatedItems.length} of ${totalCount} RFID's`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              class="pagination-btn"
              :disabled="currentPage === 1"
              variant="text"
              size="small"
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
              @click="currentPage + 1"
              >Next</v-btn
            >
          </div>
        </div>
      </v-card-text>
    </v-card>

    <div v-if="componentCheck == 1">
      <AddRfid
        :rfidCreation="rfidCreation"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="rfidCreation = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditRfid
        :rfidEdition="rfidEdition"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
        @clicked="rfidEdition = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteRfid
        :rfidDeletion="rfidDeletion"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
        @clicked="rfidDeletion = false"
      />
    </div>
  </div>
</template>
<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import DeleteRfid from "@/components/PresenceApp/PopUps/DeleteRfid.vue";
import AddRfid from "@/components/PresenceApp/PopUps/AddRfid.vue";
import EditRfid from "@/components/PresenceApp/PopUps/EditRfid.vue";
import SnackBar from "@/components/SnackBar.vue";
import { list_rfid_mapped_locations } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
    AddRfid,
    EditRfid,
    DeleteRfid,
  },
  data() {
    return {
      headers: [
        { title: "Location", value: "location_name", sortable: false },
        { title: "Box ID", value: "box_id", sortable: false },
        { title: "Action", value: "actions", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      rfidCreation: false,
      rfidEdition: false,
      rfidDeletion: false,
      next_token: null,
      componentCheck: 0,
      rowInfo: {},
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      search: "",
      fixed: true,
      height: 0,
      sortedAndPaginatedItems: [],
      page: 1,
      itemsPerPage: 100,
      currentPage: 1,
      totalCount: 0,
      pageCount: 0,
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalCount / this.itemsPerPage);
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
  created() {
    this.height = window.innerHeight - 260;
  },
  watch: {},
  mounted() {
    this.CommonVuetifyObj = useDisplay();
    this.fetch_rfid();
  },
  methods: {
    add_action() {
      this.componentCheck = 1;
      this.rfidCreation = true;
    },
    edit_Rfid(item) {
      this.componentCheck = 2;
      this.rfidEdition = true;
      this.rowInfo = item;
    },
    delete_Rfid(item) {
      this.componentCheck = 3;
      this.rfidDeletion = true;
      this.rowInfo = item;
    },
    async fetch_rfid() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_rfid_mapped_locations, {})
        );
        this.tableLoading = false;
        this.tableData = [];
        let response = JSON.parse(result.data.list_rfid_mapped_locations);
        this.tableData = Array.isArray(response.data) ? response.data : [];
        this.totalCount = this.tableData.length;
        this.sortedAndPaginatedItems = this.tableData;
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
      this.rfidCreation = false;
      this.rfidEdition = false;
      this.rfidDeletion = false;
      this.fetch_rfid();
    },

    handleSortChange(newSortBy) {
      // Implement the logic to handle sort change
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
