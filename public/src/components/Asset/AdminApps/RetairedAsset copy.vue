<template>
  <div>
    <v-card flat class="">
      <!-- Data Table -->
      <v-card-text class="pa-4">
        <v-data-table
          :headers="adminassetHeaders"
          :items="paginatedItems"
          :loading="tableLoading"
          :sort-by="['asset_prefix']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
          :fixed-header="true"
          :height="windowHeight"
          @click:row="handle_row_click"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
              <div class="text-h6 text-grey mb-2">No Retired Assets Found</div>
              <div class="text-body-2 text-grey">
                No retired assets match your current filters.
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
              <div class="text-body-2 text-grey">Loading retired assets...</div>
            </div>
          </template>

          <template v-slot:[`item.asset_product_serial_no`]="{ item }">
            <span>{{
              item.asset_product_serial_no == null ||
              item.asset_product_serial_no == undefined ||
              item.asset_product_serial_no == ""
                ? "N/A"
                : item.asset_product_serial_no
            }}</span>
          </template>
          <template v-slot:[`item.sub_category_id_text`]="{ item }">
            <span>{{
              item.sub_category_id_text == null ||
              item.sub_category_id_text == undefined ||
              item.sub_category_id_text == ""
                ? "-"
                : item.sub_category_id_text
            }}</span>
          </template>
          <template v-slot:[`item.asset_created_on`]="{ item }">
            <span v-text="get_date(item.asset_created_on * 1000)"></span>
          </template>
          <template v-slot:[`item.asset_status`]="{ item }">
            <span
              :class="
                item.asset_status == 'ACTIVE' ? 'green--text' : 'red--text'
              "
              >{{ item.asset_status }}</span
            >
          </template>
          <template v-slot:[`item.asset_tagged_status`]="{ item }">
            <div v-if="item.asset_tagged_status == 'UNTAGGED'">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon size="small" color="red" v-bind="attrs" v-on="on"
                    >mdi-alpha-x-circle</v-icon
                  >
                </template>
                <span>Untagged</span>
              </v-tooltip>
            </div>
            <div v-else>
              <span> {{ item.asset_qr_label }} </span>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    size="small"
                    color="green"
                    v-bind="attrs"
                    v-on="on"
                    @click.stop="open_qrDailog(item)"
                    >mdi-check-circle</v-icon
                  >
                </template>
                <span>Tagged</span>
              </v-tooltip>
            </div>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalCount} retired assets`
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
      <AdminAssetdetails
        :assetdisplay="assetdisplay"
        @clicked="assetdisplay = false"
        :adminassetItems="adminassetItems"
      />
    </div>
  </div>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";

import { list_all_assets } from "@/graphql/queries.js";
import AdminAssetdetails from "@/components/Asset/Popups/AdminAssetdetails.vue";
export default {
  components: {
    AdminAssetdetails,
  },
  data() {
    return {
      SnackBarComponent: {},
      adminassetItems: {},
      assetdisplay: false,
      tableLoading: false,
      adminassetRecords: [],
      componentCheck: 0,
      adminassetHeaders: [
        { title: "Asset ID", value: "asset_prefix", sortable: false },
        { title: "Category", value: "category_id_text", sortable: false },
        {
          title: "Sub Category",
          value: "sub_category_id_text",
          sortable: false,
        },
        {
          title: "Product Serial No",
          value: "asset_product_serial_no",
          sortable: false,
        },
        { title: "Location", value: "asset_location", sortable: false },
        {
          title: "Managed By",
          value: "asset_assined_to_name",
          sortable: false,
        },
        {
          title: "Created On",
          value: "asset_created_on",
          sortable: false,
        },
        {
          title: "Status",
          value: "asset_status",
          sortable: false,
        },
        {
          title: "QR Tagged",
          value: "asset_tagged_status",
          sortable: false,
        },
      ],
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
    };
  },
  async created() {
    await this.fetch_assetsadmin();
  },
  
  mounted() {
    this.updateWindowHeight();
    window.addEventListener('resize', this.updateWindowHeight);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWindowHeight);
  },
  
  computed: {
    totalCount() {
      return this.adminassetRecords.length;
    },
    pageCount() {
      return Math.ceil(this.adminassetRecords.length / this.itemsPerPage);
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
    windowHeight() {
      return window.innerHeight - 250; // Adjust height based on header and padding
    },
  },
  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    handle_row_click(click, val) {
      this.adminassetItems = val.item;
      this.componentCheck = 1;
      this.assetdisplay = true;
    },
    
    get_date(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },
    
    open_qrDailog(item) {
      // QR dialog functionality can be added here if needed
      console.log('QR dialog for item:', item);
    },
    
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 250; // Adjust height based on header and padding
    },
    async fetch_assetsadmin() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_assets, {
            input: {
              user_email_id: undefined,
              organization_id: data.organization.organization_id,
              asset_status: "RETIRED",
              asset_tagged_status: undefined,
              sub_category_id: "ALL",
              category_id: "ALL",
            },
          })
        );
        var response = JSON.parse(result.data.list_all_assets);
        this.adminassetRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.adminassetRecords = response.data;
          this.tableLoading = false;
          this.updatePageItems();
        } else {
          this.adminassetRecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.adminassetRecords = [];
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
      this.paginatedItems = this.adminassetRecords.slice(start, end);
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