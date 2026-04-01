<template>
  <div>
    <v-card flat >
      <v-toolbar flat class="bg-white">
        <v-btn
          variant="text"
          class="back-link"
          @click="$emit('backAction')"
        >
          <v-icon>mdi-arrow-left</v-icon>
          Back to Asset Settings
        </v-btn>
        <v-spacer />
        <v-btn
          size="small"
          dark
          @click="add_reasonretire()"
          class="text-capitalize cardCss text-white"
        >
          Add
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-4">
        <v-data-table
          :headers="suppliereHeaders"
          :items="paginatedItems"
          :loading="tableLoading"
          :sort-by="['retire_reason']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
          :fixed-header="true"
          :height="windowHeight"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-delete-sweep</v-icon>
              <div class="text-h6 text-grey mb-2">No Retirement Reasons Found</div>
              <div class="text-body-2 text-grey">
                No asset retirement reasons have been added yet.
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
              <div class="text-body-2 text-grey">Loading retirement reasons...</div>
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="red" size="small" @click="open_deleteDailog(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalCount} retirement reasons`
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
      <DeleteRetirereason
        :retiredeletion="retiredeletion"
        @clicked="retiredeletion = false"
        :retireitems="retireitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddRetirereason
        :retireAddition="retireAddition"
        @clicked="retireAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import DeleteRetirereason from "@/components/Asset/Popups/DeleteRetirereason.vue";
import AddRetirereason from "@/components/Asset/Popups/AddRetirereason.vue";
import SnackBar from "@/components/SnackBar.vue";
import { asset_retire } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
    DeleteRetirereason,
    AddRetirereason,
  },
  emits: ['backAction'],
  data() {
    return {
      fixed: false,
      SnackBarComponent: {},
      componentCheck: 0,
      suppliereRecords: [],
      tableLoading: false,
      retiredeletion: false,
      retireitems: {},
      suppliereHeaders: [
        {
          title: "Reason",
          key: "retire_reason",
          sortable: false,
        },

        { title: "Actions", key: "actions", sortable: false },
      ],
      retireAddition: false,
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
    };
  },
  async mounted() {
    this.updateWindowHeight();
    window.addEventListener('resize', this.updateWindowHeight);
    this.fetch_assetretire();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWindowHeight);
  },
  computed: {
    totalCount() {
      return this.suppliereRecords.length;
    },
    pageCount() {
      return Math.ceil(this.suppliereRecords.length / this.itemsPerPage);
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
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    add_reasonretire() {
      this.componentCheck = 2;
      this.retireAddition = true;
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
      this.retiredeletion = false;
      this.retireAddition = false;
      this.fetch_assetretire();
    },

    open_deleteDailog(item) {
      this.retireitems = item;
      this.componentCheck = 1;
      this.retiredeletion = true;
    },
    async fetch_assetretire() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_retire, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_RETIRE_REASON",
            },
          })
        );
        var response = JSON.parse(result.data.asset_retire);
        this.suppliereRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.suppliereRecords = response.data;
          this.tableLoading = false;
          this.updatePageItems();
        } else {
          this.suppliereRecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.suppliereRecords = [];
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
    updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedItems = this.suppliereRecords.slice(start, end);
    },
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 310; // Adjust for header and footer
    },
  },
};
</script>

<style scoped>
/* Back Button */
.back-link {
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  color: #DB4C77 !important;
}

.back-link:hover {
  background-color: rgba(219, 76, 119, 0.1) !important;
  transform: translateX(-2px) !important;
}

.back-link .v-icon {
  margin-right: 8px !important;
}

/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Responsive Design */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 16px;
    padding: 12px 16px;
  }
  
  .pagination-controls {
    gap: 4px;
  }
  
  .pagination-btn {
    min-width: 60px !important;
    font-size: 12px !important;
  }
  
  .page-numbers {
    gap: 2px;
  }
  
  .active-page,
  .inactive-page {
    min-width: 32px !important;
    height: 32px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 480px) {
  .table-footer {
    padding: 8px 12px;
  }
  
  .footer-info {
    font-size: 12px;
  }
  
  .pagination-btn {
    min-width: 50px !important;
    font-size: 11px !important;
  }
  
  .active-page,
  .inactive-page {
    min-width: 28px !important;
    height: 28px !important;
    font-size: 11px !important;
  }
}
</style>