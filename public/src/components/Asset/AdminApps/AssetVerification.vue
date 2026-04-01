<template>
  <div>
    <v-card flat class="">
      <v-card-text class="pa-4">
        <v-tabs align="left" class="my-tabs mt-n6" color="primary" v-model="verifiyTab" grow>
          <v-tabs-slider class="navBar"></v-tabs-slider>

          <v-tab class="text-capitalize">Verified in the last {{ verificationFrequency }} month ({{
            asset_counts.verified_assets
          }})</v-tab>
          <v-tab-item />
          <v-tab class="text-capitalize">Not verified in the last {{ verificationFrequency }} month ({{
            asset_counts.unverified_assets
          }})</v-tab>
          <v-tab-item />
        </v-tabs>

        <!-- Filter Controls -->
        <v-row class="align-center px-6 pt-6 pb-2">
          <v-spacer />

          <!-- Search User Field -->
          <v-col cols="2" class="d-flex align-center">
            <v-autocomplete density="compact" variant="outlined" v-model="userselect" label="Search User"
              item-title="title" item-value="user_id" :items="userArray" hide-no-data style="max-width: 180px"
              class="mr-n2" placeholder="Min 3 Character" hide-selected @input="searchF = ''" />
          </v-col>

          <!-- Category Filter -->
          <v-col cols="2" class="d-flex align-center">
            <v-select density="compact" variant="outlined" v-model="categoriesName" style="max-width: 180px"
              :items="categoriesitems" label="Category Name" class="mr-n2" item-title="text" item-value="value"
              @update:model-value="fetch_sub_data()" />
          </v-col>

          <!-- Sub Category Filter -->
          <v-col cols="2" class="d-flex align-center">
            <v-select density="compact" variant="outlined" class="mr-n2" style="max-width: 180px" v-model="subcategory"
              :items="assetSubCategoriesList" item-title="text" item-value="value" label="Sub Category" />
          </v-col>

          <!-- Action Buttons -->
          <v-col cols="4" class="align-center mr-n12 mt-n6">
            <v-btn dark class="text-capitalize cardCss mr-2" :loading="goLoading" @click="get_data()">
              <v-icon>mdi-filter</v-icon>
              Apply Filter
            </v-btn>
            <v-btn dark class="text-capitalize cardCss mr-2" :loading="clearData" @click="clear_data()">
              <v-icon>mdi-filter-remove</v-icon>
            </v-btn>
            <v-btn dark class="text-capitalize cardCss" :loading="exportload" @click="get_export()">
              <v-icon>mdi-download</v-icon>
              Export
            </v-btn>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-data-table :headers="headers" :items="paginatedItems" :loading="tableLoading" :sort-by="['asset_prefix']"
          :items-per-page="itemsPerPage" :page="currentPage" :server-items-length="totalCount" hide-default-footer
          class="modern-data-table" density="comfortable" hover :fixed-header="true" :height="windowHeight">
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
              <div class="text-h6 text-grey mb-2">No Assets Found</div>
              <div class="text-body-2 text-grey">
                No assets match your current filters.
              </div>
            </div>
          </template>

          <template v-slot:loading>
            <div class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="32" class="mb-4"></v-progress-circular>
              <div class="text-body-2 text-grey">Loading assets...</div>
            </div>
          </template>

          <template v-slot:[`item.asset_verified_on`]="{ item }">
            <span>{{ formate_date(item.asset_verified_on) }}</span>
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
            <v-btn :disabled="currentPage === 1" variant="text" size="small" class="pagination-btn"
              @click="currentPage = currentPage - 1" style="color: #666 !important;">
              Previous
            </v-btn>
            <div class="page-numbers">
              <v-btn v-for="page in visiblePages" :key="page" :variant="page === currentPage ? 'elevated' : 'text'"
                size="small" :class="page === currentPage ? 'active-page' : 'inactive-page'" @click="currentPage = page"
                :style="page === currentPage ? 'background: #DB4C77 !important; color: white !important;' : 'color: #666 !important;'">
                {{ page }}
              </v-btn>
            </div>
            <v-btn :disabled="currentPage === pageCount" variant="text" size="small" class="pagination-btn"
              @click="currentPage = currentPage + 1" style="color: #666 !important;">
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_asset_categories } from "@/mixins/GetAssetCategoryList.js";
import { get_asset_sub_categories } from "@/mixins/GetAssetSubCategories.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { API, graphqlOperation } from "aws-amplify";
import {
  get_verified_unverified_assets,
  asset_management_reports,
} from "@/graphql/queries.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import SnackBar from "@/components/SnackBar.vue";
const FileSaver = require("file-saver");
import axios from "axios";
export default {
  props: {
    searchValue: {
      type: String,
      default: "",
    },
  },

  components: {
    SnackBar,
  },
  mixins: [get_all_org_users, get_asset_categories, get_asset_sub_categories],
  data() {
    return {
      verificationAssets: [],
      pagination: {
        pageStart: 1,
        page: 1,
        rowsPerPage: 20,
        itemsPerPage: 20,
      },
      categoriesName: "ALL",
      clearData: false,
      exportload: false,
      modal: false,
      asset_counts: {},
      date: new Date().toISOString().substr(0, 10),
      SnackBarComponent: {},
      verifiyTab: 0,
      goLoading: false,
      searchF: "",
      userselect: "ALL",
      nextToken: null,
      search: "",
      verificationFrequency: "",
      tableLoading: false,
      tableData: [],
      subcategory: "ALL",
      userArray: [],
      assetSubCategoriesList: [],
      allSubCategories: [],
      categoriesitems: [],
      headers: [
        {
          title: "Asset ID",
          value: "asset_prefix",
          sortable: false,
        },
        {
          title: "Asset QR ID",
          value: "asset_qr_label",
          sortable: false,
        },
        { title: "Category", value: "category_id_text", sortable: false },
        {
          title: "Sub Category",
          value: "sub_category_id_text",
          sortable: false,
        },
        { title: "Location", value: "asset_location", sortable: false },
        {
          title: "Assigned To",
          value: "asset_assined_to_name",
          sortable: false,
        },
        {
          title: "Verified On",
          value: "asset_verified_on",
          sortable: false,
        },
      ],
      currentPage: 1,
      itemsPerPage: 20,
      windowHeight: 0,
    };
  },
  watch: {
    searchValue() {
      this.currentPage = 1;
    },
    verifiyTab() {
      this.userselect = "ALL";
      this.categoriesName = "ALL";
      this.assetSubCategoriesList = [];
      this.assetSubCategoriesList.push({
        text: "All",
        value: "ALL",
      });
      this.subcategory = "ALL";

      this.tableData = [];
      this.nextToken = null;
      this.fetch_list();
    },

  },
  async mounted() {
    this.$store.commit("Setnamesearch", "");
    var data = this.$store.getters.GetOrgDetails;
    this.verificationFrequency =
      data.organization.asset_verification_frequency != undefined
        ? data.organization.asset_verification_frequency
        : 3;

    this.date = this.subtractMonths(this.date, this.verificationFrequency);
    await Promise.all([
      this.get_all_org_users(),
      this.get_asset_categories(),
      this.get_asset_sub_categories(),
      this.fetch_list(),
    ]);
    await this.fetch_details();

    this.categoriesitems = this.assetCategories;
    this.categoriesitems.push({
      text: "All",
      value: "ALL",
    });
    this.allSubCategories = this.assetSubCategories;
    this.assetSubCategoriesList.push({
      text: "All",
      value: "ALL",
    });

    // Set up window height handling
    this.updateWindowHeight();
    window.addEventListener('resize', this.updateWindowHeight);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWindowHeight);
  },

  computed: {
    filteredAssets() {
      const query = this.searchValue.toLowerCase().trim();

      if (!query) return this.tableData;

      return this.tableData.filter(asset =>
        [
          asset.asset_prefix,
          asset.asset_qr_label,
          asset.category_id_text,
          asset.sub_category_id_text,
          asset.asset_location,
          asset.asset_assined_to_name,
        ]
          .filter(Boolean)
          .some(val =>
            String(val).toLowerCase().includes(query)
          )
      );
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredAssets.slice(start, end);
    },

    filteredAssets() {
      const query = this.searchValue?.toLowerCase().trim();

      if (!query) return this.tableData;

      return this.tableData.filter(asset =>
        [
          asset.asset_prefix,
          asset.asset_qr_label,
          asset.category_id_text,
          asset.sub_category_id_text,
          asset.asset_location,
          asset.asset_assined_to_name,
        ]
          .filter(Boolean)
          .some(val =>
            String(val).toLowerCase().includes(query)
          )
      );
    },
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
    totalCount() {
      return this.filteredAssets.length;
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
    windowHeight() {
      return window.innerHeight - 360; // Adjust height based on header, tabs, and padding
    },
  },
  methods: {
    handlePagination_check1() {
      if (this.nextToken) {
        this.fetch_list();
      }
    },
    fetch_sub_data() {
      this.subcategory = "";
      var filteredArray = this.assetSubCategories.filter(
        (obj) => obj.category_id === this.categoriesName
      );

      this.assetSubCategoriesList = [];
      filteredArray.forEach((element) => {
        this.assetSubCategoriesList.push({
          text: element.sub_category_name,
          value: element.sub_category_id,
        });
      });
      //   console.log(this.assetSubCategoriesList);
    },
    fetch_details() {
      this.userArray = [
        {
          title: "ALL",
          user_id: "ALL",
        },
      ];

      this.orgUsers.forEach((element) => {
        if (element.user_status === "ACTIVE") {
          this.userArray.push({
            title: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
    },

    async get_data() {
      this.tableData = [];
      this.nextToken = null;
      this.fetch_list();
    },
    async clear_data() {
      this.userselect = "ALL";
      this.categoriesName = "ALL";
      this.assetSubCategoriesList = [];
      this.assetSubCategoriesList.push({
        text: "All",
        value: "ALL",
      });
      this.subcategory = "ALL";
      this.clearData = true;
      this.tableData = [];
      this.nextToken = null;
      this.fetch_list();
    },
    subtractMonths(dateString, monthsToSubtract) {
      // Parse the input date string
      const date = new Date(dateString);

      // Subtract the specified number of months
      date.setMonth(date.getMonth() - monthsToSubtract);

      // Format the date back to yyyy-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    },
    check_from_date(date) {
      this.$refs.dialog1.save(date);
      this.fetch_list();
    },
    formate_date(value) {
      var data = formatdisplayDate(value);
      return data;
    },
    async get_export() {
      this.exportload = true;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_management_reports, {
            input: {
              asset_verirfication_status:
                this.verifiyTab == 0 ? "VERIFIED" : "UNVERIFIED",
              date: this.date,
              asset_assined_to: this.userselect,
              category_id: this.categoriesName,
              sub_category_id: this.subcategory,
            },
          })
        );
        var response = JSON.parse(result.data.asset_management_reports);

        this.exportload = false;
        if (response.Status == "SUCCESS") {
          this.download_invoice(response.data);

          this.exportload = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.exportload = false;
        }
      } catch (error) {
        this.exportload = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async fetch_list() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(get_verified_unverified_assets, {
            input: {
              asset_verirfication_status:
                this.verifiyTab == 0 ? "VERIFIED" : "UNVERIFIED",
              date: this.date,
              asset_assined_to: this.userselect,
              category_id: this.categoriesName,
              sub_category_id: this.subcategory,
              nextToken: this.nextToken,
              limit: 50,
            },
          })
        );
        var response = JSON.parse(result.data.get_verified_unverified_assets);

        this.tableLoading = false;
        this.clearData = false;
        if (response.Status == "SUCCESS") {
          this.nextToken = response.nextToken;

          var array = this.tableData.concat(response.data);
          const uniqueArrayOfObjects = array.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.asset_id === obj.asset_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.tableLoading = false;
          this.clearData = false;
          this.asset_counts = {};
          this.asset_counts = response.asset_counts;
        } else {
          this.asset_counts = response.asset_counts;
          this.tableData = [];
          this.clearData = false;
          this.tableLoading = false;
        }
      } catch (error) {
        this.asset_counts = {
          verified_assets: 0,
          unverified_assets: 0,
          total_assets: 0,
        };
        this.clearData = false;
        this.tableData = [];

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
    async download_invoice(url) {
      var fileName =
        this.verifiyTab == 0
          ? `Verified in the last ${this.verificationFrequency} month.xlsx`
          : `Not verified in the last ${this.verificationFrequency} month.xlsx`;
      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
    getcal() {
      this.modal = true;
    },
    formatDate(date) {
      if (!date) return null;
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    get_details() { },
    updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedItems = this.filteredAssets.slice(start, end);
    },
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 350; // Adjust height based on header, tabs, and padding
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