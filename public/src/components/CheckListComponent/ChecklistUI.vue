<template>
  <div >
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card flat class="pa-3">
      <v-data-table
        :headers="checklistHeader"
        :items="paginatedItems"
        :loading="tableLoading"
        item-key="category_id"
        :items-per-page="itemsPerPage"
        :page="currentPage"
        :server-items-length="totalCount"
        hide-default-footer
        density="compact"
        class="modern-data-table"
        hover
        multi-sort
        :fixed-header="true"
        :height="windowHeight"
      >
        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4"
              >mdi-format-list-checks</v-icon
            >
            <div class="text-h6 text-grey mb-2">No Checklists Found</div>
            <div class="text-body-2 text-grey">
              Try creating a new checklist to get started.
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
            <div class="text-body-2 text-grey">Loading Master checklists...</div>
          </div>
        </template>

        <template v-slot:[`item.checklist_name`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="primary" class="mr-2"
              >mdi-format-list-checks</v-icon
            > -->
            <div>
              <div class="font-weight-medium text-body-2">
                {{ item.checklist_name }}
              </div>
              <div class="caption text-grey">{{ item.category_id }}</div>
            </div>
          </div>
        </template>

        <template v-slot:[`item.checklist_description`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="grey" class="mr-2">mdi-text</v-icon> -->
            <span class="caption font-weight-medium description-text">
              {{ item.checklist_description || "No description" }}
            </span>
          </div>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                color="grey"
              />
            </template>

            <v-list density="compact" class="py-0">
              <v-list-item @click.stop="View_Checklist(item)" class="py-2">
                <template #prepend>
                  <v-icon icon="mdi-eye" size="small" color="green" />
                </template>
                <v-list-item-title class="text-body-2"
                  >View Checklist</v-list-item-title
                >
              </v-list-item>

              <v-divider />

              <v-list-item @click.stop="edition(item)" class="py-2">
                <template #prepend>
                  <v-icon icon="mdi-pencil" size="small" color="blue" />
                </template>
                <v-list-item-title class="text-body-2"
                  >Edit Checklist</v-list-item-title
                >
              </v-list-item>

              <v-divider />

              <v-list-item @click.stop="deletion(item)" class="py-2">
                <template #prepend>
                  <v-icon icon="mdi-delete" size="small" color="red" />
                </template>
                <v-list-item-title class="text-body-2"
                  >Delete Checklist</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <!-- Modern Table Footer -->
      <div class="table-footer">
        <div class="footer-info">
          {{
            totalCount === 0
              ? "No Results"
              : `Showing ${paginatedItems.length} of ${totalCount} checklists`
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
    </v-card>

    <div v-if="componentCheck == 1">
      <EditChecklistMaster
        :editChecklistDialog="editChecklistDialog"
        :ChecklistItem="ChecklistItem"
        @clicked="closeEdit"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteChecklistMaster
        :deleteChecklistDialog="deleteChecklistDialog"
        :ChecklistItem="ChecklistItem"
        @clicked="deleteChecklistDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <ViewChecklistMaster
        :viewChecklistDialog="viewChecklistDialog"
        :ChecklistItem="ChecklistItem"
        @clicked="viewChecklistDialog = false"
      />
    </div>
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import { list_master_checklist } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import EditChecklistMaster from "./Popups/EditChecklistMaster.vue";
import DeleteChecklistMaster from "./Popups/DeleteChecklistMaster.vue";
import ViewChecklistMaster from "./Popups/ViewChecklistMaster.vue";

export default {
  components: {
    SnackBar,
    EditChecklistMaster,
    DeleteChecklistMaster,
    ViewChecklistMaster,
  },
  data() {
    return {
      componentCheck: 0,
      SnackBarComponent: {},
      tableLoading: false,
      checklistData: [],
      paginatedItems: [],
      currentPage: 1,
      itemsPerPage: 20,
      checklistHeader: [
        { title: "Name", key: "checklist_name", sortable: false },
        {
          title: "Description",
          key: "checklist_description",
          sortable: false,
        },
        { title: "Actions", key: "actions", sortable: false },
      ],
      editChecklistDialog: false,
      windowHeight: 0,
      ChecklistItem: {},
      deleteChecklistDialog: false,
      viewChecklistDialog: false,
    };
  },
  computed: {
    totalCount() {
      return this.checklistData.length;
    },
    pageCount() {
      return Math.ceil(this.checklistData.length / this.itemsPerPage);
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
  async mounted() {
    this.windowHeight = window.innerHeight - 240;
    await this.fetch_checklist();
  },
  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedItems = this.checklistData.slice(start, end);
    },

    edition(item) {
      this.editChecklistDialog = true;
      this.ChecklistItem = item;
      this.componentCheck = 1;
    },
    deletion(item) {
      this.deleteChecklistDialog = true;
      this.ChecklistItem = item;
      this.componentCheck = 2;
    },
    View_Checklist(item) {
      this.viewChecklistDialog = true;
      this.ChecklistItem = item;
      this.componentCheck = 3;
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
    closeEdit() {
      this.editChecklistDialog = false;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.editChecklistDialog = false;
      this.deleteChecklistDialog = false;
      this.fetch_checklist();
    },
    async fetch_checklist() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_master_checklist, {
            input: {},
          })
        );
        var response = JSON.parse(result.data.list_master_checklist);
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.checklistData = response.data;
          this.tableLoading = false;
          this.updatePageItems();
        } else {
          this.checklistData = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.checklistData = [];
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

.description-text {
  max-width: 850px;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  display: inline-block;
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
