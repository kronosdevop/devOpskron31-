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
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-package-variant</v-icon
              >
              <div class="text-h6 text-grey mb-2">No Assets Found</div>
              <div class="text-body-2 text-grey">
                No assets match your current filters.
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
              <div class="text-body-2 text-grey">Loading assets...</div>
            </div>
          </template>

          <template v-slot:[`item.asset_verified_by`]="{ item }">
            <span>{{ item.asset_verified_by }}</span>
          </template>

          <template v-slot:[`item.asset_verified_on`]="{ item }">
            <span>{{
              item.asset_verified_on !== undefined &&
              item.asset_verified_on !== "" &&
              item.asset_verified_on !== "N/A"
                ? formate_date(item.asset_verified_on)
                : "-"
            }}</span>
          </template>
          <template v-slot:[`item.asset_description`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  {{
                    item.asset_description.length >= 10
                      ? item.asset_description.substr(0, 10) + "..."
                      : item.asset_description
                  }}
                </div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.asset_description }}
              </div>
            </v-tooltip>
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
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
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
    <div v-if="componentCheck == 1">
      <AdminAssetdetails
        :assetdisplay="assetdisplay"
        @clicked="assetdisplay = false"
        :adminassetItems="adminassetItems"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import AdminAssetdetails from "@/components/Asset/Popups/AdminAssetdetails.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";

import { list_all_assets } from "@/graphql/queries.js";
export default {
  props: { searchValue: String },

  components: {
    SnackBar,
    AdminAssetdetails,
  },

  mixins: [get_all_org_users],

  data() {
    return {
      SnackBarComponent: {},
      componentCheck: 0,
      tableLoading: false,
      adminassetItems: {},
      locationasset: false,
      assetstatus: "ACTIVE",
      searchF: "",
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
          title: "Verified On",
          value: "asset_verified_on",
          sortable: false,
        },
        {
          title: "Verified By",
          value: "asset_verified_by",
          sortable: false,
        },
        {
          title: "QR Tagged",
          value: "asset_tagged_status",
          sortable: false,
        },
      ],
      adminassetRecords: [],
      allUSersNames: [],
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
      assetdisplay: false,
    };
  },
  async created() {
    await this.fetch_assetsadmin();
  },

  mounted() {
    this.updateWindowHeight();
    window.addEventListener("resize", this.updateWindowHeight);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.updateWindowHeight);
  },

  computed: {
    filteredRecords() {
      if (!this.searchValue) return this.adminassetRecords;

      const term = this.searchValue.toLocaleLowerCase();

      return this.adminassetRecords.filter((item) => {
        return (
          item.asset_prefix?.toLocaleLowerCase().includes(term) ||
          item.category_id_text?.toLocaleLowerCase().includes(term) ||
          item.sub_category_id_text?.toLocaleLowerCase().includes(term) ||
          item.asset_product_serial_no?.toLocaleLowerCase().includes(term) ||
          item.asset_assined_to_name?.toLocaleLowerCase().includes(term) ||
          item.asset_verified_on?.toLocaleLowerCase().includes(term) ||
          item.asset_location?.toLocaleLowerCase().includes(term)
        );
      });
    },
    totalTaskCount() {
      return this.masterData ? this.masterData.length : 0;
    },
    totalCount() {
      return this.filteredRecords.length;
    },
    pageCount() {
      return Math.ceil(this.filteredRecords.length / this.itemsPerPage);
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
      return window.innerHeight - 250;
    },
  },
  watch: {
    currentPage() {
      this.updatePageItems();
    },
    searchValue() {
      this.currentPage = 1;
      this.updatePageItems();
    },
  },
  methods: {
    async updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      const filtered = this.filteredRecords;
      this.paginatedItems = filtered.slice(start, end);
    },
    async get_data() {
      this.adminassetRecords = [];
      await this.fetch_assetsadmin();
    },
    async clear_data() {
      this.filterByComp = "";

      await this.fetch_assetsadmin();
    },
    async fetch_assetsadmin() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_assets, {
            input: {
              user_email_id:
                this.userselect == "ALL" ? undefined : this.userselect,
              organization_id: data.organization.organization_id,
              asset_shipment_status: "INSTOCK",
              // asset_shipment_status:''
              //   asset_status:
              //     this.assetstatus == "ALL" ? undefined : this.assetstatus,
              //   asset_tagged_status:
              //     this.assettaggedstatus == "ALL"
              //       ? undefined
              //       : this.assettaggedstatus,
              //   sub_category_id: this.categoriessubName,
              //   category_id: this.categoriesName,
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
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 250; // Adjust height based on header and padding
    },
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      if (value == "SYSTEM") {
        name = value;
      }
      return name;
    },
    handle_row_click(click, val) {
      this.adminassetItems = val.item;
      this.componentCheck = 1;
      this.assetdisplay = true;
    },
    formate_date(value) {
      var data = formatdisplayDate(value);
      return data;
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
      console.log("QR dialog for item:", item);
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
