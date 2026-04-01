<template>
  <div>
    <!-- Back Button Header -->
    <v-card flat class="">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="page-title">
            <div class="d-flex align-center">
              <v-icon size="large" color="primary" class="mr-3">mdi-package-variant</v-icon>
              <span class="font-weight-bold text-h6">Rejected Assets</span>
            </div>
          </div>
          <v-btn
            variant="text"
            class="back-link"
            @click="$emit('backAction')"
          >
            <v-icon>mdi-arrow-left</v-icon>
            Back to Asset Requests
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card flat>
      <!-- <v-icon @click="refresh_icon()" small>mdi-refresh</v-icon> -->

      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="validTableData"
          :loading="tableLoading"
          :sort-by="['user_id_text']"
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
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
              <div class="text-h6 text-grey mb-2">No Rejected Assets Found</div>
              <div class="text-body-2 text-grey">
                No assets have been rejected.
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
              <div class="text-body-2 text-grey">Loading rejected assets...</div>
            </div>
          </template>

          <template v-slot:[`item.asset_description`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ props }">
                <div v-bind="props">
                  {{
                    (item.asset_description && item.asset_description.length >= 15)
                      ? item.asset_description.substr(0, 15) + "..."
                      : (item.asset_description || "No description")
                  }}
                </div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.asset_description || "No description available" }}
              </div>
            </v-tooltip>
          </template>

          <template v-slot:[`item.asset_dispatch_comments`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ props }">
                <div v-bind="props">
                  {{
                    item.asset_dispatch_comments && item.asset_dispatch_comments.length >= 15
                      ? item.asset_dispatch_comments.substr(0, 15) + "..."
                      : item.asset_dispatch_comments || "-"
                  }}
                </div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.asset_dispatch_comments || "No reason provided" }}
              </div>
            </v-tooltip>
          </template>

          <template v-slot:[`item.Action`]="{ item }">
            <v-btn
              color="primaryColor"
              dark
              x-small
              @click="disptach_workflow(item)"
              >Dispatch</v-btn
            >
            <v-btn
              color="red"
              class="ml-2"
              dark
              x-small
              @click="reject_action(item)"
              >Reject</v-btn
            >
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalCount} rejected assets`
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
    <!-- <div v-if="componentCheck == 1">
      <DispatchAssests
        :dispatchWorkflow="dispatchWorkflow"
        :rowData="rowData"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
        @clicked="dispatchWorkflow = false"
      />
    </div> -->
    <!-- <div v-if="componentCheck == 2">
      <RejectionAsset
        :rejectDialog="rejectDialog"
        :rowData="rowData"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
        @clicked="rejectDialog = false"
      />
    </div> -->
  </div>
</template>
<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";

import { list_all_requested_assets } from "@/graphql/queries.js";
import DispatchAssests from "@/components/Asset/Popups/DispatchAssests.vue";
import RejectionAsset from "@/components/Asset/Popups/RejectionAsset.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    DispatchAssests,
    RejectionAsset,
  },
  emits: ['backAction'],
  data() {
    return {
      headers: [
        { title: "Requested  By", key: "user_id_text", sortable: false },
        { title: "Category", key: "category_id_text", sortable: false },
        { title: "Subcategory", key: "sub_category_id_text", sortable: false },
        { title: "Comments", key: "asset_description", sortable: false },
        { title: "Reason", key: "asset_dispatch_comments", sortable: false },
        // { title: "Status", key: "asset_dispatch_status", sortable: false },
        // { title: "Location", key: "asset_prefix", sortable: false },
        // { title: "Action", key: "Action", sortable: false },
      ],
      tableData: [],
      fixed: true,
      tableLoading: false,
      componentCheck: 0,
      dispatchWorkflow: false,
      rowData: {},
      rejectWorkflow: false,
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
    };
  },
  created() {
    this.fetch_requested_asset();
  },
  mounted() {
    this.updateWindowHeight();
    window.addEventListener('resize', this.updateWindowHeight);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWindowHeight);
  },
  computed: {
    totalTaskCount() {
      return this.masterData ? this.masterData.length : 0;
    },
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
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
    // Filter out items with missing critical properties
    validTableData() {
      return this.tableData.filter(item => {
        return item && typeof item === 'object';
      });
    },
  },
  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    async updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      // Check if we need more data from API
      if (end > this.validTableData.length && this.next_token) {
        await this.fetch_requested_asset(true);
      }
      this.paginatedItems = this.validTableData.slice(start, end);
    },
    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.rejectDialog = false;
      this.rejectWorkflow = false;
      this.fetch_requested_asset();
    },

    error_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    refresh_icon() {
      this.fetch_requested_asset();
    },

    async fetch_requested_asset() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_requested_assets, {
            input: {
              action_type: "REJECTED",
              limit: 200,
              nextToken: null,
            },
          })
        );
        this.tableData = [];
        var response = JSON.parse(result.data.list_all_requested_assets);
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          // console.log(response.data);
          response.data.forEach((element) => {
            const newItem = {
              ...element.workflow_payload, // Spread the existing properties
              responeObj: element,
              asset_dispatch_status: element.asset_dispatch_status,
              asset_dispatch_comments: element.asset_dispatch_comments, // Add your new key-value pair here
              // Ensure asset_description has a fallback value
              asset_description: element.workflow_payload?.asset_description || element.asset_description || "No description available",
            };
            this.tableData.push(newItem);
            this.updatePageItems();
          });
          
          // Clean up any invalid data after processing
          this.cleanupData();
        } else {
          this.tableLoading = false;
          this.tableData = [];
        }
      } catch (error) {
        this.tableLoading = false;
        // console.log(error);
        this.tableData = [];
      }
    },

    disptach_workflow(item) {
      if (!item) {
        console.warn('Dispatch workflow called with undefined item');
        return;
      }
      this.componentCheck = 1;
      this.rowData = item;
      this.dispatchWorkflow = true;
    },

    reject_action(item) {
      if (!item) {
        console.warn('Reject action called with undefined item');
        return;
      }
      this.componentCheck = 2;
      this.rowData = item;
      this.rejectDialog = true;
    },

    updateWindowHeight() {
      this.windowHeight = window.innerHeight- 320;;
    },

    // Clean up data to remove invalid items
    cleanupData() {
      this.tableData = this.tableData.filter(item => {
        return item && 
               typeof item === 'object' && 
               item.asset_description !== undefined;
      });
      this.updatePageItems();
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

/* Page Title */
.page-title {
  flex: 1;
}

.page-title span {
  margin: 0;
  color: black !important;
}

.page-title .v-icon {
  color: #DB4C77 !important;
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