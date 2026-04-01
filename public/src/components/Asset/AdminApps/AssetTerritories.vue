<template>
  <div>
    <!-- Territory List View -->
    <div class="pa-4">
      <v-card class="" flat>
        <v-card-text class="pa-4">
          <v-toolbar flat class="mb-4" style="background: transparent !important" >
            <v-text-field
              v-model="searchQuery"
              placeholder="Search territories..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              style="max-width: 400px"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn
              dark
              @click="add_territory()"
              class="text-capitalize cardCss"
            >
              Add Territory
            </v-btn>
          </v-toolbar>
          <v-data-table
            :headers="territoryHeaders"
            :items="paginatedItems"
            :loading="tableLoading"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="filteredItems.length"
            hide-default-footer
            class="modern-data-table"
            density="comfortable"
            hover
            :fixed-header="true"
            :height="windowHeight"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4"
                  >mdi-map-marker-off-outline</v-icon
                >
                <div class="text-h6 text-grey mb-2">No Territories Found</div>
                <div class="text-body-2 text-grey">
                  Create your first territory to get started.
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
                <div class="text-body-2 text-grey">Loading territories...</div>
              </div>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
              <v-icon
                color="primaryColor"
                class="mr-2"
                small
                @click="edit_territory(item)"
                >mdi-pencil</v-icon
              >
              <v-icon color="red" small @click="open_deletedailog(item)"
                >mdi-delete</v-icon
              >
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                filteredItems.length === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${filteredItems.length} territories`
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
      </v-card>
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <div v-if="componentCheck == 1">
      <AddingTerritory
        :createTerritoryDialog="createTerritoryDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="createTerritoryDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditTerritory
        :editTerritoryDialogue="editTerritoryDialogue"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editTerritoryDialogue = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteTerritory
        :deleteTerritoryDialogue="deleteTerritoryDialogue"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
        @clicked="deleteTerritoryDialogue = false"
      />
    </div>
  </div>
</template>
  <script>
/*eslint-disable*/
import AddingTerritory from "@/components/Asset/Popups/AddingTerritory.vue";
import EditTerritory from "@/components/Asset/Popups/EditTerritory.vue";
import DeleteTerritory from "@/components/Asset/Popups/DeleteTerritory.vue";
import { create_list_edit_territories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    AddingTerritory,
    SnackBar,
    EditTerritory,
    DeleteTerritory,
  },
  data() {
    return {
      territoryHeaders: [
        { title: "Name", key: "territory_name", sortable: false },
        { title: "Description", key: "territory_description", sortable: false },
        { title: "Manager", key: "territory_head_name", sortable: false },
        { title: "Action", key: "actions", sortable: false },
      ],
      fixed: true,
      tableData: [],
      tableLoading: false,
      componentCheck: 0,
      createTerritoryDialog: false,
      SnackBarComponent: {},
      editTerritoryDialogue: false,
      rowInfo: {},
      deleteTerritoryDialogue: false,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,
      searchQuery: "",
    };
  },
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const query = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter((item) => {
        return (
          (item.territory_name &&
            item.territory_name.toLowerCase().includes(query)) ||
          (item.territory_description &&
            item.territory_description.toLowerCase().includes(query)) ||
          (item.territory_head_name &&
            item.territory_head_name.toLowerCase().includes(query))
        );
      });
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
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
      // Reset to first page when search changes
      this.currentPage = 1;
    },
  },
  mounted() {
    this.windowHeight = window.innerHeight - 330;
    this.fetch_territories();
  },
  methods: {
    add_territory() {
      this.componentCheck = 1;
      this.createTerritoryDialog = true;
    },
    edit_territory(value) {
      this.rowInfo = value;
      console.log(this.rowInfo);
      this.componentCheck = 2;
      this.editTerritoryDialogue = true;
    },

    open_deletedailog(value) {
      this.rowInfo = value;
      this.componentCheck = 3;
      this.deleteTerritoryDialogue = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createTerritoryDialog = false;
      this.editTerritoryDialogue = false;
      this.deleteTerritoryDialogue = false;
      this.fetch_territories();
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

    async fetch_territories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_territories, {
            input: {
              action_type: "LIST",
              organization_id: data.organization.organization_id,
            },
            // product_name: "",
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.create_list_edit_territories);
        this.tableLoading = false;
        this.tableData = response.data;
        this.totalItems = response.data.length;
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];
        this.totalItems = 0;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style scoped>
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



/* Responsive Design */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }

}
</style>