<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card flat class="overflow-y-auto">
      <v-card flat>
        <v-card-text class="pa-4">
          <v-data-table
            :fixed-header="true"
            :headers="adminassetHeaders"
            :height="windowHeight"
            :items="paginatedItems"
            :loading="tableLoading"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="totalCount"
            hide-default-footer
            class="modern-data-table"
            density="comfortable"
            hover
            @click:row="handle_row_click"
          >
            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4"
                  >mdi-desktop-classic</v-icon
                >
                <div class="text-h6 text-grey mb-2">No Assets Found</div>
                <div class="text-body-2 text-grey">
                  Try adjusting your search criteria or request a new asset.
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
                <div class="text-body-2 text-grey">Loading assets...</div>
              </div>
            </template>

            <!-- Asset Description -->
            <template v-slot:[`item.asset_description`]="{ item }">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <div
                    v-bind="props"
                    class="caption text-truncate"
                    style="max-width: 200px"
                  >
                    {{ item.asset_description }}
                  </div>
                </template>
                <div class="textWrap" style="max-width: 250px">
                  {{ item.asset_description }}
                </div>
              </v-tooltip>
            </template>

            <!-- Created On -->
            <template v-slot:[`item.asset_created_on`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                >
                <span class="caption">{{
                  get_date(item.asset_created_on * 1000)
                }}</span>
              </div>
            </template>

            <!-- Product Serial No -->
            <template v-slot:[`item.asset_product_serial_no`]="{ item }">
              <span class="caption">
                {{
                  item.asset_product_serial_no == null ||
                  item.asset_product_serial_no == undefined ||
                  item.asset_product_serial_no == ""
                    ? "N/A"
                    : item.asset_product_serial_no
                }}
              </span>
            </template>

            <!-- Sub Category -->
            <template v-slot:[`item.sub_category_id_text`]="{ item }">
              <span class="caption">
                {{
                  item.sub_category_id_text == null ||
                  item.sub_category_id_text == undefined ||
                  item.sub_category_id_text == ""
                    ? "-"
                    : item.sub_category_id_text
                }}
              </span>
            </template>

            <!-- QR Tagged Status -->
            <template v-slot:[`item.asset_tagged_status`]="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  size="16"
                  :color="
                    item.asset_tagged_status == 'UNTAGGED' ? 'red' : 'green'
                  "
                  class="mr-2"
                  @click.stop="
                    item.asset_tagged_status == 'TAGGED'
                      ? open_qrDailog(item)
                      : null
                  "
                >
                  {{
                    item.asset_tagged_status == "UNTAGGED"
                      ? "mdi-alpha-x-circle"
                      : "mdi-check-circle"
                  }}
                </v-icon>
                <span class="caption font-weight-medium">
                  {{
                    item.asset_tagged_status == "UNTAGGED"
                      ? "Untagged"
                      : "Tagged"
                  }}
                </span>
              </div>
            </template>

            <template v-slot:[`item.last_assigned_to`]="{ item }">
              <span class="caption">
                {{
                  item.last_assigned_to == null ||
                  item.last_assigned_to == undefined ||
                  item.last_assigned_to == ""
                    ? "N/A"
                    : item.last_assigned_to
                }}
              </span>
            </template>

            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
              <div class="d-flex align-center">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      color="primary"
                      class="mr-2"
                      size="small"
                      @click.stop="open_forwardDailog(item)"
                    >
                      mdi-forward
                    </v-icon>
                  </template>
                  <span>Transfer Asset</span>
                </v-tooltip>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon
                      v-bind="props"
                      color="primary"
                      size="small"
                      @click.stop="open_handoverDailog(item)"
                    >
                      mdi-folder-swap-outline
                    </v-icon>
                  </template>
                  <span>Handover Asset</span>
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
                  : `Showing ${paginatedItems.length} of ${totalCount} assets`
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
    </v-card>

    <div v-if="componentCheck == 1">
      <UserAssetdetails
        :assetdisplay="assetdisplay"
        @clicked="assetdisplay = false"
        :assetitems="assetitems"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AssetTransfer
        :transferingasset="transferingasset"
        @clicked="transferingasset = false"
        :assetitems="assetitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AssetHandover
        :handoveringasset="handoveringasset"
        :assetitems="assetitems"
        @clicked="handoveringasset = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <UserRequestAsset
        :requestDialog="requestDialog"
        v-on:successMsg="succces_data"
        v-on:errorMsg="error_info"
        @clicked="requestDialog = false"
      />
    </div>
  </div>
</template>

<script>
// Imports
import AssetHandover from "@/components/Asset/Popups/AssetHandover.vue";
import AssetTransfer from "@/components/Asset/Popups/AssetTransfer.vue";
import UserAssetdetails from "@/components/Asset/Popups/UserAssetdetails.vue";
import UserRequestAsset from "@/components/Asset/Popups/UserRequestAsset.vue";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import { list_user_assets } from "@/graphql/queries.js";

export default {
  props: {
  searchValue: {
    type: String,
    default: "",
  },
},

  // Components
  components: {
    SnackBar,
    UserAssetdetails,
    AssetTransfer,
    AssetHandover,
    UserRequestAsset,
  },

  // Data
  data() {
    return {
      // Array properties
      adminassetHeaders: [
        { title: "Asset ID", key: "asset_prefix", sortable: false },
        { title: "Category", key: "category_id_text", sortable: false },
        {
          title: "Sub Category",
          key: "sub_category_id_text",
          sortable: false,
        },
        {
          title: "Product Serial No",
          key: "asset_product_serial_no",
          sortable: false,
        },
        {
          title: "Last Assigned To",
          key: "last_assigned_to",
          sortable: false,
        },
        { title: "Location", key: "asset_location", sortable: false },
        {
          title: "Value",
          key: "asset_value",
          sortable: false,
        },
        {
          title: "QR Tagged",
          key: "asset_tagged_status",
          sortable: false,
        },
        { title: "Actions", key: "actions", sortable: false },
      ],
      adminassetRecords: [],

      // Object properties
      SnackBarComponent: {},
      assetitems: {},

      // String properties

      // Boolean properties
      tableLoading: false,
      assetdisplay: false,
      transferingasset: false,
      handoveringasset: false,
      requestDialog: true,
      fixed: true,
      adminAppExists: false,

      // Number properties
      componentCheck: 0,
      currentPage: 1,
      itemsPerPage: 20,
      height: 0,
      windowHeight: 0,
    };
  },

  // Lifecycle hooks
  async created() {
    this.windowHeight = window.innerHeight - 220;
    this.fetch_admin_apps();
    await this.fetch_userassert();
    this.height = window.innerHeight - 170;
  },

  // Computed properties
  computed: {
  filteredItems() {
  const query = this.searchValue?.toLowerCase().trim();

  if (!query) return this.adminassetRecords;

  return this.adminassetRecords.filter(asset =>
    [
      asset.asset_prefix,
      asset.category_id_text,
      asset.sub_category_id_text,
      asset.asset_location,
      asset.asset_product_serial_no,
      asset.last_assigned_to,
      asset.asset_value,
    ]
      .filter(Boolean)
      .some(val =>
        String(val).toLowerCase().includes(query)
      )
  );
},

    totalCount() {
      return this.filteredItems.length;
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
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

  // Watchers
  watch: {
   searchValue() {
    this.currentPage = 1;
  },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  // Methods
  methods: {
    // Admin methods
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      // Check if userObj and admin_apps exist
      if (
        !userObj ||
        !userObj.admin_apps ||
        !Array.isArray(userObj.admin_apps)
      ) {
        this.adminAppExists = false;
        return;
      }

      const adminExists = userObj.admin_apps.find(
        (app) => app.dashboard_unique_type === "ASSETS_ADMIN"
      );
      if (adminExists.is_visible == false) {
        this.adminAppExists = false;
        return;
      }

      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },

    open_settings() {
      this.$router.push("/home/AssetTypes");
    },

    // Data fetching methods
    async fetch_userassert() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_user_assets, {
            input: {
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.list_user_assets);
        this.adminassetRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.adminassetRecords = response.data;
          this.tableLoading = false;
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

    // UI interaction methods
    request_asset() {
      this.componentCheck = 4;
      this.requestDialog = true;
    },

    back_call() {
      this.$router.push({ name: "UserlevelApp" });
    },

    open_forwardDailog(item) {
      this.assetitems = item;
      this.componentCheck = 2;
      this.transferingasset = true;
    },

    open_handoverDailog(item) {
      this.assetitems = item;
      this.componentCheck = 3;
      this.handoveringasset = true;
    },

    open_qrDailog(item) {
      // Implement QR dialog functionality
    },

    handle_row_click(click, row) {
      this.assetitems = row;
      this.componentCheck = 1;
      this.assetdisplay = true;
    },

    // Utility methods
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

    // Notification methods
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
      this.transferingasset = false;
      this.handoveringasset = false;
      this.fetch_userassert();
    },

    succces_data(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.requestDialog = false;
    },
  },
};
</script>

<style scoped>
/* Modern Header Section */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

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

/* Search Pill */
.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

/* Action Button Styles */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }

  .search-pill {
    min-width: 240px !important;
    max-width: 240px !important;
  }
}

@media (max-width: 768px) {
  .header-left {
    gap: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .search-pill {
    min-width: 200px !important;
    max-width: 200px !important;
  }

  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }

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
