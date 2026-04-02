<template>
  <div>
    <v-card flat class="overflow-y-auto">
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <div class="card-container" style="position: relative">
        <v-card class="" flat>
          <v-card-text class="pa-4">
            <v-data-table
              :headers="headers"
              :items="paginatedItems"
              :loading="tableLoading"
              :fixed-header="true"
              :height="windowHeight"
              :items-per-page="itemsPerPage"
              :page="currentPage"
              :server-items-length="totalCount"
              hide-default-footer
              class="modern-data-table"
              density="comfortable"
              hover
            >
              <template #no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-folder-outline</v-icon>
                  <div class="text-h6 text-grey mb-2">No Other Cabinets Found</div>
                  <div class="text-body-2 text-grey">
                    No restricted cabinets are available for access request.
                  </div>
                </div>
              </template>

              <template #loading>
                <div class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="32"
                    class="mb-4"
                  ></v-progress-circular>
                  <div class="text-body-2 text-grey">Loading cabinets...</div>
                </div>
              </template>

              <template v-slot:[`item.directory_created_on`]="{ item }">
                <span class="caption">{{ get_date(item.directory_created_on) }}</span>
              </template>
              
              <template v-slot:[`item.directory_created_by`]="{ item }">
                <span class="caption">{{ fethc_names(item.directory_created_by) }}</span>
              </template>
              
              <template v-slot:[`item.folder_description`]="{ item }">
                <div
                  style="
                    white-space: normal;
                    word-wrap: break-word;
                    line-height: 1.3;
                    padding: 4px 0;
                  "
                  class="caption"
                >
                  {{ item.folder_description || "No description" }}
                </div>
              </template>
              
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  @click="request_access(item)"
                  color="primary"
                  class="text-capitalize"
                  elevation="0"
                  size="small"
                  style="background: #DB4C77 !important; color: white !important;"
                >
                  Request Access
                </v-btn>
              </template>
            </v-data-table>

            <!-- Modern Table Footer -->
            <div class="table-footer">
              <div class="footer-info">
                {{
                  totalCount === 0
                    ? "No Results"
                    : `Showing ${paginatedItems.length} of ${totalCount} cabinets`
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
      </div>
      
      <div v-if="componentCheck == 1">
        <RequestAccess
          :rowInfo="rowInfo"
          :requestAccessDialog="requestAccessDialog"
          @clicked="requestAccessDialog = false"
          v-on:successMsg="get_successs_toast"
          v-on:errorMsg="get_error"
        />
      </div>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import { list_cabinet_root_folders } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import RequestAccess from "@/components/NewCabinet/RequestAccess.vue";

export default {
  components: {
    SnackBar,
    RequestAccess,
  },
  data() {
    return {
      headers: [
        { title: "Folder", value: "Key", sortable: false },
        { title: "Description", value: "folder_description", sortable: false },
        {
          title: "Created By",
          value: "folder_created_by_name",
          sortable: false,
        },
        { title: "Actions", value: "actions", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      SnackBarComponent: {},
      requestAccessDialog: false,
      componentCheck: 0,
      rowInfo: {},
      currentPage: 1,
      pageCount: 1,
      itemsPerPage: 20,
      totalCount: 0,
      paginatedItems: [],
      windowHeight: 0,
    };
  },
  created() {
    this.fetch_root_folders();
    this.windowHeight = window.innerHeight - 250;
  },
  computed: {
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
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    async fetch_root_folders() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_cabinet_root_folders, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_cabinet_root_folders);
        let restrictedCabinets = [];
        let arraynew = [];
        if (response.Status == "SUCCESS") {
          restrictedCabinets = response.data;
          restrictedCabinets.forEach((element) => {
            if (
              element.folder_visibility.visible_type == "RESTRICTED_MEMBERS" &&
              element.folder_created_by_email !=
                this.$store.getters.GetUserObj.user?.user_email_id
            ) {
              arraynew.push(element);
              this.tableData = arraynew.filter(
                (item) =>
                  !item.folder_visibility.visible_members.includes(
                    this.$store.getters.GetUserObj.user?.user_id
                  )
              );
            }
          });
          //   this.tableData = response.data;
          //   console.log(response);
        }
        this.totalCount = this.tableData.length;
        this.pageCount = Math.ceil(this.totalCount / this.itemsPerPage);
        this.paginatedItems = this.tableData.slice(
          (this.currentPage - 1) * this.itemsPerPage,
          Math.min(this.currentPage * this.itemsPerPage, this.totalCount)
        );
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

    request_access(item) {
      this.componentCheck = 1;
      this.rowInfo = item;
      this.requestAccessDialog = true;
    },

    get_successs_toast(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.requestAccessDialog = false;
    },

    get_error(val) {
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
      this.paginatedItems = this.tableData.slice(startIndex, endIndex);
    },
  },
};
</script>

<style scoped>
/* Card Container */
.card-container {
  position: relative;
}

/* Modern Data Table */
.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(219, 76, 119, 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

.modern-data-table :deep(.v-data-table__thead th) {
  background-color: #f8f9fa !important;
  color: #333 !important;
  font-weight: 600 !important;
  border-bottom: 1px solid #e0e0e0 !important;
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

/* Legacy Footer Styles (keeping for reference) */
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
  background-color: var(--v-theme-primary);
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

/* Responsive Design */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
}
</style>