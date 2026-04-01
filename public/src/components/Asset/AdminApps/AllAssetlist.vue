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
            <span>{{ fetch_user_name(item.asset_verified_by) }}</span>
          </template>

          <template v-slot:[`item.asset_verified_on`]="{ item }">
            <div>{{ item.asset_verified_on }}</div>
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

          <template v-slot:[`item.asset_assined_to_name`]="{ item }">
            <span>{{ getManagedByName(item) }}</span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-menu v-model="menuStates[item.asset_prefix]">
              <template #activator="{ props }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  v-bind="props"
                  class="cursor-pointer"
                >
                  <v-icon size="small">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list density="compact">
                <v-list-item
                  v-if="item.asset_status === 'ACTIVE'"
                  @click.stop="open_editDailog(item)"
                >
                  <v-list-item-title>Edit Asset</v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item @click.stop="open_reactiveDailog(item)">
                  <v-list-item-title>Retire Asset</v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item @click.stop="open_mapDailog(item)">
                  <v-list-item-title>Location</v-list-item-title>
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

    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <AssetActiveinactive
        :assetactivation="assetactivation"
        @clicked="assetactivation = false"
        :adminassetItems="adminassetItems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteAsset
        :assetdeletion="assetdeletion"
        @clicked="assetdeletion = false"
        :adminassetItems="adminassetItems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <EditAsset
        :assetEdition="assetEdition"
        @clicked="assetEdition = false"
        :adminassetItems="adminassetItems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <AdminAssetdetails
        :assetdisplay="assetdisplay"
        @clicked="assetdisplay = false"
        :adminassetItems="adminassetItems"
      />
    </div>
    <div v-if="componentCheck == 5">
      <AssetTag
        :assettagged="assettagged"
        @clicked="assettagged = false"
        :adminassetItems="adminassetItems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 6">
      <AssetLoaction
        :locationasset="locationasset"
        @clicked="locationasset = false"
        :adminassetItems="adminassetItems"
      />
    </div>
    <div v-if="componentCheck == 7">
      <AssetQr
        :qrasset="qrasset"
        @clicked="qrasset = false"
        :adminassetItems="adminassetItems"
      />
    </div>
    <div v-if="componentCheck == 8">
      <AssetOrgmap
        :allassetloc="allassetloc"
        @clicked="allassetloc = false"
        :assetLocationData="assetLocationData"
      />
    </div>
  </div>
</template>

<script>
import AssetOrgmap from "@/components/Asset/Popups/AssetOrgmap.vue";
import AssetQr from "@/components/Asset/Popups/AssetQr.vue";
import AssetLoaction from "@/components/Asset/Popups/AssetLoaction.vue";
import AssetTag from "@/components/Asset/Popups/AssetTag.vue";
import AdminAssetdetails from "@/components/Asset/Popups/AdminAssetdetails.vue";
import EditAsset from "@/components/Asset/Popups/EditAsset.vue";
import AssetActiveinactive from "@/components/Asset/Popups/AssetActiveinactive.vue";
import DeleteAsset from "@/components/Asset/Popups/DeleteAsset.vue";
import SnackBar from "@/components/SnackBar.vue";

import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { get_asset_reatilers } from "@/mixins/GetAssetRetailers.js";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import { API, graphqlOperation } from "aws-amplify";
import { list_all_assets, get_all_organizations_asset_locations } from "@/graphql/queries.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";

export default {
  props: {
    searchValue: {
      type: String,
      default: "",
    },
    userselect: {
      type: String,
      default: "ALL",
    },
    assettaggedstatus: {
      type: String,
      default: "ALL",
    },
    categoriesName: {
      type: String,
      default: "ALL",
    },
    categoriessubName: {
      type: String,
      default: "ALL",
    },
  },

  emits: ["filter-applied", "template-url"],

  components: {
    SnackBar,
    DeleteAsset,
    AssetActiveinactive,
    EditAsset,
    AdminAssetdetails,
    AssetTag,
    AssetLoaction,
    AssetQr,
    AssetOrgmap,
  },

  mixins: [
    get_all_org_users,
    get_asset_distributors,
    get_asset_reatilers,
    get_global_customers,
  ],

  data() {
    return {
      assetstatus: "ACTIVE",
      assetTemplateUrl: "",
      searchF: "",

      componentCheck: 0,
      currentPage: 1,
      itemsPerPage: 20,
      windowHeight: 0,

      assetLocationData: [],

      SnackBarComponent: {},
      adminassetItems: {},
      menuStates: {},

      fixed: true,
      tableLoading: false,
      assetactivation: false,
      assetdeletion: false,
      assetEdition: false,
      allassetloc: false,
      assetdisplay: false,
      qrasset: false,
      goLoading: false,
      locationasset: false,

      searchTimeout: null,

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
        { title: "Actions", value: "actions", sortable: false },
      ],
      adminassetRecords: [],
      allAssetRecords: [],
      allUSersNames: [],
      paginatedItems: [],
    };
  },

  async created() {
    this.$store.commit("Setnamesearch", "");
    await Promise.all([
      this.fetch_location(),
      this.fetch_assetsadmin(),
      this.get_all_org_users(),
      this.get_asset_distributors(),
      this.get_asset_reatilers(),
      this.get_global_customers(),
    ]);
    this.allUSersNames = this.orgUsers;
  },

  mounted() {
    this.updateWindowHeight();
    window.addEventListener("resize", this.updateWindowHeight);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.updateWindowHeight);
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
  computed: {
     filteredAssets() {
    let data = [...this.adminassetRecords];

    // SEARCH
    if (this.searchValue && this.searchValue.trim()) {
      const term = this.searchValue.toLowerCase().trim();

      data = data.filter(asset =>
        [
          asset.asset_prefix,
          asset.category_id_text,
          asset.sub_category_id_text,
          asset.asset_product_serial_no,
          asset.asset_location,
          asset.asset_assined_to_name,
          asset.asset_description,
        ]
          .filter(Boolean)
          .some(val =>
            String(val).toLowerCase().includes(term)
          )
      );
    }

    return data;
  },

  paginatedItems() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAssets.slice(start, end);
  },

  totalCount() {
    return this.filteredAssets.length;
  },

  pageCount() {
    return Math.ceil(this.totalCount / this.itemsPerPage);
  },
    totalTaskCount() {
      return this.masterData ? this.masterData.length : 0;
    },
    totalCount() {
      return this.filteredAssets.length;
    },
    pageCount() {
      return Math.ceil(this.filteredAssets.length / this.itemsPerPage);
    },
    filteredAssets() {
      if (!this.searchValue || this.searchValue.trim() === "") {
        return this.adminassetRecords;
      }

      const searchTerm = this.searchValue.toLowerCase().trim();

      return this.adminassetRecords.filter((asset) => {
        return (
          (asset.asset_prefix &&
            asset.asset_prefix.toLowerCase().includes(searchTerm)) ||
          (asset.category_id_text &&
            asset.category_id_text.toLowerCase().includes(searchTerm)) ||
          (asset.sub_category_id_text &&
            asset.sub_category_id_text.toLowerCase().includes(searchTerm)) ||
          (asset.asset_product_serial_no &&
            asset.asset_product_serial_no.toLowerCase().includes(searchTerm)) ||
          (asset.asset_location &&
            asset.asset_location.toLowerCase().includes(searchTerm)) ||
          (asset.asset_assined_to_name &&
            asset.asset_assined_to_name.toLowerCase().includes(searchTerm)) ||
          (asset.asset_description &&
            asset.asset_description.toLowerCase().includes(searchTerm))
        );
      });
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
   
    userselect() {
      this.get_data();
    },
    assettaggedstatus() {
      this.get_data();
    },
    categoriesName() {
      this.get_data();
    },
    categoriessubName() {
      this.get_data();
    },
  },

  methods: {
    async updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      // Check if we need more data from API
      if (end > this.filteredAssets.length && this.next_token) {
        await this.fetch_assetsadmin(true);
      }
      this.paginatedItems = this.filteredAssets.slice(start, end);
    },
    async fetch_location() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_all_organizations_asset_locations, {})
        );

        var response = JSON.parse(
          result.data.get_all_organizations_asset_locations
        );
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.assetLocationData = response.data;
        } else {
          this.assetLocationData = [];
        }
      } catch (error) {
        // console.log(error);
        this.assetLocationData = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async get_data() {
      // If we have full data, apply local filters
      if (this.allAssetRecords && this.allAssetRecords.length > 0) {
        this.applyLocalFilters();
        // Emit filter applied event
        this.$emit("filter-applied", {
          userselect: this.userselect,
          assettaggedstatus: this.assettaggedstatus,
          categoriesName: this.categoriesName,
          categoriessubName: this.categoriessubName,
        });
      } else {
        // If no data loaded yet, fetch from API
        this.adminassetRecords = [];
        await this.fetch_assetsadmin();
        // Emit filter applied event
        this.$emit("filter-applied", {
          userselect: this.userselect,
          assettaggedstatus: this.assettaggedstatus,
          categoriesName: this.categoriesName,
          categoriessubName: this.categoriessubName,
        });
      }
    },
    async clear_data() {
      this.adminassetRecords = [];
      await this.fetch_assetsadmin();
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
              asset_status: undefined,
              asset_tagged_status: undefined,
              sub_category_id: undefined,
              category_id: undefined,
            },
          })
        );
        var response = JSON.parse(result.data.list_all_assets);
        this.adminassetRecords = [];

        if (response.Status == "SUCCESS") {
          this.assetTemplateUrl = response.template_url;
          this.$emit("template-url", response.template_url);
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          if (signedUrl) {
            let assetData = await this.fetch_S3_file(signedUrl);
            const activeAssets = assetData.filter(
              (asset) => asset.asset_status === "ACTIVE"
            );

            const sortedData = activeAssets.sort((a, b) =>
              (b.asset_verified_on || "").localeCompare(
                a.asset_verified_on || ""
              )
            );

            this.allAssetRecords = sortedData;
            this.applyLocalFilters();
            this.tableLoading = false;
          } else {
            this.assetTemplateUrl = response.template_url;
            this.tableLoading = false;
            this.adminassetRecords = [];
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Failed to generate signed URL for asset data",
              timeout: 5000,
              Top: true,
            };
          }
          this.tableLoading = false;
          this.updatePageItems();
        } else {
          this.assetTemplateUrl = response.template_url;
          if (response.template_url) {
            this.$emit("template-url", response.template_url);
          }
          this.adminassetRecords = [];
          this.tableLoading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Failed to fetch assets",
            timeout: 5000,
            Top: true,
          };
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
    async fetch_S3_file(value) {
      try {
        const response = await fetch(value);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch the file: ${response.statusText} (Status Code: ${response.status})`
          );
        }
        if (
          !response.headers.get("Content-Type").includes("application/json")
        ) {
          throw new Error("The file is not in JSON format");
        }
        const responseData = await response.text();
        try {
          return JSON.parse(responseData);
        } catch (jsonError) {
          throw new Error("Error parsing JSON response: " + jsonError.message);
        }
      } catch (error) {
        console.error("Error fetching file:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error fetching file: " + error.message,
          timeout: 5000,
          Top: true,
        };
        return [];
      }
    },
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 310; // Adjust height based on header and padding
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
    formate_date(value) {
      var data = formatdisplayDate(value);
      return data;
    },
    open_mapDailog(item) {
      // Close the menu
      this.menuStates[item.asset_prefix] = false;

      this.componentCheck = 6;
      this.adminassetItems = item;
      this.locationasset = true;
    },
    open_qrDailog(item) {
      this.componentCheck = 7;
      this.adminassetItems = item;
      this.qrasset = true;
    },
    get_loc() {
      this.componentCheck = 8;
      this.allassetloc = true;
    },
    applyLocalFilters() {
      if (!this.allAssetRecords || this.allAssetRecords.length === 0) {
        this.adminassetRecords = [];
        return;
      }

      // Start with all records
      let filtered = [...this.allAssetRecords];

      // Filter by user_email_id (Managed By)
      if (this.userselect && this.userselect !== "ALL") {
        filtered = filtered.filter(
          (asset) => asset.asset_assined_to === this.userselect
        );
      }

      // Filter by asset_tagged_status
      if (this.assettaggedstatus && this.assettaggedstatus !== "ALL") {
        filtered = filtered.filter(
          (asset) => asset.asset_tagged_status === this.assettaggedstatus
        );
      }

      // Filter by category_id
      if (this.categoriesName && this.categoriesName !== "ALL") {
        filtered = filtered.filter(
          (asset) => String(asset.category_id) === String(this.categoriesName)
        );
      }

      // Filter by sub_category_id
      if (this.categoriessubName && this.categoriessubName !== "ALL") {
        filtered = filtered.filter(
          (asset) =>
            String(asset.sub_category_id) === String(this.categoriessubName)
        );
      }

      // Update adminassetRecords with filtered data
      this.adminassetRecords = filtered;

      // Reset to first page and update pagination
      this.currentPage = 1;
      this.updatePageItems();
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
      this.assetactivation = false;
      this.assetdeletion = false;
      this.assetEdition = false;
      this.assettagged = false;
      this.fetch_assetsadmin();
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
    getManagedByName(item) {
      const managedById = item.asset_assined_to || item.last_assigned_to;

      if (!managedById) {
        return "-";
      }

      // If internal, fetch user name from user list
      if (item.asset_handler_type !== "EXTERNAL") {
        const userName = this.fetch_user_name(managedById);
        return userName || managedById;
      }

      // If external type is DISTRIBUTOR, find name from distributor list
      if (item.asset_external_handler_type === "DISTRIBUTOR") {
        if (
          this.masterAssetDistributors &&
          Array.isArray(this.masterAssetDistributors)
        ) {
          const distributor = this.masterAssetDistributors.find(
            (dist) =>
              dist.asset_distributor_id === managedById ||
              dist.asset_distributor_email_id === managedById ||
              dist.distributor_email_id === managedById ||
              dist.email_id === managedById
          );
          if (distributor) {
            return (
              distributor.asset_distributor_name ||
              distributor.distributor_name ||
              distributor.name ||
              managedById
            );
          }
        }
        return managedById;
      }

      // If external type is RETAILER, find name from retailer list
      if (item.asset_external_handler_type === "RETAILER") {
        if (
          this.masterAssetRetailers &&
          Array.isArray(this.masterAssetRetailers)
        ) {
          const retailer = this.masterAssetRetailers.find(
            (ret) =>
              ret.asset_retailer_id === managedById ||
              ret.asset_retailer_email_id === managedById ||
              ret.retailer_email_id === managedById ||
              ret.email_id === managedById
          );
          if (retailer) {
            return (
              retailer.asset_retailer_name ||
              retailer.retailer_name ||
              retailer.name ||
              managedById
            );
          }
        }
        return managedById;
      }

      // If external type is CUSTOMER, find name from customer list
      if (item.asset_external_handler_type === "CUSTOMER") {
        if (this.masterCustomers && Array.isArray(this.masterCustomers)) {
          const customer = this.masterCustomers.find(
            (cust) =>
              cust.customer_email_id === managedById ||
              cust.customer_id === managedById ||
              cust.email_id === managedById
          );
          if (customer) {
            return (
              (customer.legal_name && customer.customer_display_id
                ? customer.legal_name +
                  " ( " +
                  customer.customer_display_id +
                  " )"
                : customer.legal_name) ||
              customer.name ||
              customer.customer_name ||
              managedById
            );
          }
        }
        return managedById;
      }

      // For other types, return as is
      return managedById;
    },
    handle_row_click(click, val) {
      this.adminassetItems = val.item;
      this.componentCheck = 4;
      this.assetdisplay = true;
    },
    open_reactiveDailog(item) {
      // Close the menu
      this.menuStates[item.asset_prefix] = false;

      this.adminassetItems = item;
      this.componentCheck = 1;
      this.assetactivation = true;
    },
    open_taggedDailog(item) {
      this.adminassetItems = item;
      this.componentCheck = 5;
      this.assettagged = true;
    },
    open_deleteDailog(item) {
      this.adminassetItems = item;
      this.componentCheck = 2;
      this.assetdeletion = true;
    },
    open_editDailog(item) {
      // Close the menu
      this.menuStates[item.asset_prefix] = false;

      this.adminassetItems = item;
      this.componentCheck = 3;
      this.assetEdition = true;
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
