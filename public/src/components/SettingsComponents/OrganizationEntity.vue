<template>
  <div style="padding-bottom: 70px">
    <v-card  flat class="mt-n4">
      <v-toolbar  class="" flat dense>
        <v-spacer />
        <v-btn
          dark
          @click="create_entity()"
          size="small"
          class="text-capitalize cardCss mr-4"
        >
          Create
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="entityHeaders"
          :fixed-header="fixed"
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
          @click:row="handle_row_click"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-domain-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">
                No Organization Entities Found
              </div>
              <div class="text-body-2 grey--text">
                Try creating a new organization entity.
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
                Loading organization entities...
              </div>
            </div>
          </template>

          <template v-slot:[`item.entity_logo`]="{ item }">
            <img
              :src="item.entity_logo"
              alt="Entity Logo"
              style="width: 50px; height: 50px; object-fit: contain"
              v-if="item.entity_logo"
            />
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="blue" size="x-small" @click.stop="edit_entity(item)">
              mdi-pencil
            </v-icon>
            <v-icon
              v-if="item.entity_id != 'DEFAULT_ENTITY'"
              color="red"
              size="x-small"
              @click.stop="delete_entity(item)"
            >
              mdi-delete
            </v-icon>
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
      <CreateEntity
        :createEntityDialog="createEntityDialog"
        @clicked="createEntityDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditEntity
        :editEntityDialog="editEntityDialog"
        :ViewEntityInfo="ViewEntityInfo"
        @clicked="editEntityDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteEntity
        :deleteEntityDialog="deleteEntityDialog"
        :ViewEntityInfo="ViewEntityInfo"
        @clicked="deleteEntityDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <ViewEntity
        :viewEntityDialog="viewEntityDialog"
        :ViewEntityInfo="ViewEntityInfo"
        @clicked="viewEntityDialog = false"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import CreateEntity from "./Popups/CreateEntity.vue";
import { quotation_billing_entities } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import EditEntity from "./Popups/EditEntity.vue";
import DeleteEntity from "./Popups/DeleteEntity.vue";
import ViewEntity from "./Popups/ViewEntity.vue";
export default {
  components: {
    CreateEntity,
    SnackBar,
    EditEntity,
    DeleteEntity,
    ViewEntity,
  },

  data() {
    return {
      componentCheck: 0,
      createEntityDialog: false,
      tableData: [],
      tableLoading: false,
      fixed: true,
      SnackBarComponent: {},
      entityHeaders: [
        { title: "Entity Name", value: "entity_name", sortable: false },
        {
          title: "Entity Owner Name",
          value: "entity_owner_name",
          sortable: false,
        },
        { title: "Entity Logo", value: "entity_logo", sortable: false },
        { title: "Action", value: "actions", sortable: false },
      ],
      tableLoading: false,
      ViewEntityInfo: {},
      editEntityDialog: false,
      deleteEntityDialog: false,
      viewEntityDialog: false,
      // Pagination properties
      paginatedItems: [],
      itemsPerPage: 20,
      currentPage: 1,
      sortBy: [{ key: "entity_name", order: "asc" }],
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

  created() {
    this.fetch_entitylist();
    this.updatePageItems(); // Initialize paginated items
  },

  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },

  methods: {
    create_entity() {
      this.componentCheck = 1;
      this.createEntityDialog = true;
    },

    edit_entity(item) {
      this.editEntityDialog = true;
      this.componentCheck = 2;
      this.ViewEntityInfo = item;
    },

    delete_entity(item) {
      this.deleteEntityDialog = true;
      this.componentCheck = 3;
      this.ViewEntityInfo = item;
    },

    handle_row_click(click, item) {
      this.viewEntityDialog = true;
      this.componentCheck = 4;
      this.ViewEntityInfo = item.item;
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
      this.createEntityDialog = false;
      this.editEntityDialog = false;
      this.deleteEntityDialog = false;
      this.fetch_entitylist();
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
      if (key === "entity_name" || key === "entity_owner_name") {
        return value.toLowerCase();
      }
      return value;
    },

    async fetch_entitylist() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(quotation_billing_entities, {
            input: {
              action_type: "LIST",
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.quotation_billing_entities);
        this.tableLoading = false;
        this.tableData = response.data;
        this.updatePageItems(); // Update paginated items after data is loaded
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