<template>
  <div>
    <v-app-bar class="modern-header-section" elevation="0">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-package-variant</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Assets </span>
          <span class="header-subtitle"
            >Manage and track your assigned assets</span
          >
        </div>
      </div>
      <v-spacer />

      <div class="header-actions">
        <!-- Search Field -->
        <div
          v-if="
            toggle_exclusive === 'adminasset' ||
            toggle_exclusive === 'instorewarehouse' ||
            toggle_exclusive === 'userassets' ||
            toggle_exclusive === 'retiralasset' ||
            toggle_exclusive === 'assetverfiy'
          "
          class="search-container"
        >
          <v-text-field
            v-model="searchValue"
            placeholder="Search assets..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
            clearable
          />
        </div>
        <!-- Filter Button -->
        <v-btn
          v-if="toggle_exclusive == 'userassets'"
          @click="request_asset()"
          class="action-btn mr-4"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Request Asset</span>
        </v-btn>
        <v-btn
          v-if="toggle_exclusive == 'adminasset'"
          :class="
            activeFiltersCount > 0
              ? 'action-btn filter-btn active'
              : 'action-btn filter-btn'
          "
          @click="showFilterDrawer = true"
          size="small"
        >
          <v-icon>mdi-filter-variant</v-icon>
          <span>Filter</span>
          <v-badge
            v-if="activeFiltersCount > 0"
            :content="activeFiltersCount"
            color="white"
            class="ml-2"
          />
        </v-btn>
        <v-menu
          offset-y
          v-if="toggle_exclusive == 'adminasset'"
          class="actions-menu"
        >
          <template #activator="{ props }">
            <v-btn v-bind="props" class="action-btn mr-4" size="small">
              <v-icon>mdi-dots-vertical</v-icon>
              <span>Actions</span>
            </v-btn>
          </template>

          <v-list density="compact" class="actions-list">
            <v-list-item
              v-if="toggle_exclusive == 'adminasset'"
              @click="add_asset()"
            >
              <template #prepend>
                <v-icon color="primary">mdi-plus</v-icon>
              </template>
              <v-list-item-title>Add Asset</v-list-item-title>
            </v-list-item>

            <v-divider class="my-1" />
            
            <v-list-item
              v-if="toggle_exclusive == 'adminasset'"
              @click="downloadFile(assetTemplateUrl, 'Asset_Template.xlsx')"
            >
              <template #prepend>
                <v-icon color="primary">mdi-download</v-icon>
              </template>
              <v-list-item-title>Download Template</v-list-item-title>
            </v-list-item>

            <v-divider class="my-1" />

            <v-list-item v-if="toggle_exclusive == 'adminasset'">
              <template #prepend>
                <v-icon color="primary">mdi-import</v-icon>
              </template>

              <BulkAsset
                :on-success="handleSuccessAsset"
                :before-upload="beforeUpload"
              />
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          v-if="toggle_exclusive == 'assetReports'"
          class="action-btn mr-4"
          @click="export_asset_reports()"
          size="small"
        >
          <v-icon>mdi-download</v-icon>
          <span>Export</span>
        </v-btn>

        <!-- <v-btn
          v-if="adminAppExists"
          class="action-btn back-btn"
          @click="back_call()"
          size="small"
        >
          <v-icon>mdi-step-backward</v-icon>
          <span>Back</span>
        </v-btn> -->
      </div>
    </v-app-bar>

    <v-card flat class="mt-n8">
      <v-toolbar
        flat
        class=""
        style="background-color: white"
        v-if="adminAppExists"
      >
        <template v-slot:extension>
          <v-tabs
            v-model="toggle_exclusive"
            mandatory
            class="modern-tab-toggle"
            color="#DB4C77"
            slider-color="#DB4C77"
          >
            <v-tab value="userassets" class="tab-btn"> My Assets </v-tab>
            <v-tab value="assetReports" class="tab-btn"> Reports </v-tab>
            <v-tab value="adminasset" class="tab-btn"> Assets </v-tab>
            <v-tab value="requestedAssets" class="tab-btn"> Requested </v-tab>
            <v-tab value="instorewarehouse" class="tab-btn">
              In Warehouse/Store
            </v-tab>
            <v-tab value="intransit" class="tab-btn"> In Transit </v-tab>
            <v-tab value="assetverfiy" class="tab-btn"> Verification </v-tab>
            <v-tab value="retiralasset" class="tab-btn"> Retired </v-tab>
            <v-tab value="assetSettings" class="tab-btn"> Settings </v-tab>
          </v-tabs>
        </template>
      </v-toolbar>

      <!-- Filter Navigation Drawer -->
      <v-navigation-drawer
        :model-value="showFilterDrawer"
        @update:model-value="showFilterDrawer = $event"
        location="right"
        temporary
        width="400"
        class="pa-0 filter-drawer"
        style="z-index: 1000; margin-top: 64px"
      >
        <v-card flat>
          <v-toolbar elevation="1" density="compact" class="navBar">
            <v-toolbar-title class="text--white ml-2">
              <div class="custom-title">Filter Options</div>
            </v-toolbar-title>
            <v-spacer />
            <v-icon class="mr-2" @click="closeFilterDrawer()">mdi-close</v-icon>
          </v-toolbar>
          <v-card-text>
            <v-form ref="filterForm">
              <div class="filter-content">
                <!-- Search User Filter -->
                <div class="filter-group">
                  <label class="filter-label">Search User</label>
                  <v-autocomplete
                    v-model="userselect"
                    label="Search User"
                    density="compact"
                    variant="outlined"
                    item-text="title"
                    item-value="user_id"
                    :items="userArray"
                    hide-no-data
                    placeholder="Min 3 Character"
                    hide-selected
                    class="filter-select"
                    clearable
                  />
                </div>

                <!-- QR Status Filter -->
                <div class="filter-group">
                  <label class="filter-label">QR Status</label>
                  <v-select
                    density="compact"
                    variant="outlined"
                    item-text="name"
                    item-value="value"
                    label="QR Status"
                    :items="assetitemstagged"
                    v-model="assettaggedstatus"
                    class="filter-select"
                    clearable
                  />
                </div>

                <!-- Category Filter -->
                <div class="filter-group">
                  <label class="filter-label">Category Name</label>
                  <v-select
                    v-model="categoriesName"
                    :items="categoriesitems"
                    label="Category Name"
                    class="filter-select"
                    density="compact"
                    variant="outlined"
                    item-text="text"
                    item-value="value"
                    @update:modelValue="fetch_subcategories"
                    clearable
                  />
                </div>

                <!-- Sub Category Filter -->
                <div class="filter-group">
                  <label class="filter-label">Sub Category Name</label>
                  <v-select
                    v-model="categoriessubName"
                    :items="categoriessubitems"
                    label="Sub Category Name"
                    class="filter-select"
                    density="compact"
                    variant="outlined"
                    item-text="text"
                    item-value="value"
                    clearable
                  />
                </div>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn
              variant="outlined"
              size="small"
              @click="clearFilters"
              class="text-capitalize"
            >
              <v-icon class="mr-2">mdi-close</v-icon>
              Clear All
            </v-btn>
            <v-btn
              dark
              size="small"
              @click="applyFilterFromDrawer"
              :loading="goLoading"
              class="text-capitalize cardCss text-white"
            >
              <v-icon class="mr-2">mdi-filter</v-icon>
              Apply Filter
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-navigation-drawer>

      <div class="text-left" v-if="toggle_exclusive == 'assetReports'">
        <AseetReports />
      </div>
      <div
        class="text-left"
        v-if="toggle_exclusive == 'userassets'"
        :class="!adminAppExists ? 'mt-16' : ''"
      >
        <UserAsset :searchValue="searchValue" />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'adminasset'">
        <AllAssetlist
          :key="assetkey"
          ref="allAssetList"
          :searchValue="searchValue"
          :userselect="userselect"
          :assettaggedstatus="assettaggedstatus"
          :categoriesName="categoriesName"
          :categoriessubName="categoriessubName"
          @filter-applied="handleFilterApplied"
          @template-url="handleTemplateUrl"
        />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'retiralasset'">
        <RetairedAsset :searchValue="searchValue" />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'requestedAssets'">
        <AllRequestedAssets />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'assetSettings'">
        <AssetSettings />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'assetverfiy'">
        <AssetVerification :searchValue="searchValue" />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'intransit'">
        <AssetsIntransit />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'instorewarehouse'">
        <AssetsInWarehouse :searchValue="searchValue" />
      </div>

      <div v-if="componentCheck == 3">
        <CreateAsset
          :assetCreation="assetCreation"
          @clicked="assetCreation = false"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          v-on:updaterefesh="assetfresh"
        />
      </div>

      <div v-if="componentCheck == 2">
        <AssetLocationCreation
          :addAssetLocationDialog="addAssetLocationDialog"
          @clicked="addAssetLocationDialog = false"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          v-on:recallcomponent="location_refresh"
        />
      </div>

      <div v-if="componentCheck == 4">
        <ProcurmentDialog
          :assetProcureDialog="assetProcureDialog"
          @clicked="assetProcureDialog = false"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
        />
      </div>
      <div v-if="componentCheck == 5">
        <UserRequestAsset
          :requestDialog="requestDialog"
          v-on:successMsg="success_info"
          v-on:errorMsg="error_info"
          @clicked="requestDialog = false"
        />
      </div>
      <div v-if="uploadAssetDialog">
        <UploadAsset
          :uploadAssetDialog="uploadAssetDialog"
          :excelTableData="excelTableData"
          :excelHeaders="excelHeaders"
          @clicked="uploadAssetDialog = false"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          v-on:updaterefesh="assetfresh"
        />
      </div>
      <div v-if="exportAssetReportsDialog">
        <ExportAssetReportsDialog
          :exportDialog="exportAssetReportsDialog"
          @clicked="exportAssetReportsDialog = false"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
        />
      </div>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
    </v-card>
  </div>
</template>

<script>
/*eslint-disable*/
import UserAsset from "@/components/Asset/UserAsset.vue";
import UserRequestAsset from "@/components/Asset/Popups/UserRequestAsset.vue";
import RetairedAsset from "@/components/Asset/AdminApps/RetairedAsset.vue";
import AssetVerification from "@/components/Asset/AdminApps/AssetVerification.vue";
import QRGenearation from "@/components/Asset/AdminApps/QRGenearation.vue";
import AddRetirereason from "@/components/Asset/Popups/AddRetirereason.vue";
import AddSubcategories from "@/components/Asset/Popups/AddSubcategories.vue";
import AssetSubCategories from "@/components/Asset/AdminApps/AssetSubCategories.vue";
import AseetReports from "@/components/Asset/AdminApps/AseetReports.vue";
import SnackBar from "@/components/SnackBar.vue";
import AssetRetirelist from "@/components/Asset/AdminApps/AssetRetirelist.vue";
import CreateAsset from "@/components/Asset/Popups/CreateAsset.vue";
import AllAssetlist from "@/components/Asset/AdminApps/AllAssetlist.vue";
import AddCategories from "@/components/Asset/Popups/AddCategories.vue";
import AddSuppliers from "@/components/Asset/Popups/AddSuppliers.vue";
import AssetCategorieslist from "@/components/Asset/AdminApps/AssetCategorieslist.vue";
import AssetSuppliersList from "@/components/Asset/AdminApps/AssetSuppliersList.vue";
import AssetLocations from "@/components/Asset/AdminApps/AssetLocations.vue";
import AssetLocationCreation from "@/components/Asset/Popups/AssetLocationCreation.vue";
import AssetSettings from "@/components/Asset/AdminApps/AssetSettings.vue";
import ProcurmentDialog from "@/components/Asset/Popups/ProcurmentDialog.vue";
import AllRequestedAssets from "@/components/Asset/AdminApps/AllRequestedAssets.vue";
import AssetsIntransit from "@/components/Asset/AdminApps/AssetsIntransit.vue";
import AssetsInWarehouse from "@/components/Asset/AdminApps/AssetsInWarehouse.vue";
import BulkAsset from "@/components/Asset/Bulkupload/BulkAsset.vue";
import UploadAsset from "@/components/Asset/Popups/UploadAsset.vue";
import ExportAssetReportsDialog from "@/components/Asset/Popups/ExportAssetReportsDialog.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import {
  asset_categories,
  asset_sub_category,
  assets,
} from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    AssetCategorieslist,
    AssetSuppliersList,
    AddSuppliers,
    AddCategories,
    AllAssetlist,
    CreateAsset,
    SnackBar,
    AssetRetirelist,
    AssetSubCategories,
    AddSubcategories,
    AddRetirereason,
    QRGenearation,
    AssetLocations,
    AssetLocationCreation,
    AssetSettings,
    AseetReports,
    AssetVerification,
    RetairedAsset,
    ProcurmentDialog,
    AllRequestedAssets,
    AssetsIntransit,
    AssetsInWarehouse,
    UserRequestAsset,
    UserAsset,
    BulkAsset,
    UploadAsset,
    ExportAssetReportsDialog,
  },
  mixins: [get_all_org_users],
  data: () => ({
    toggle_exclusive: "userassets",
    supplierAddition: false,
    categoriesAddition: false,
    retireAddition: false,
    assetCreation: false,
    categoriessubAddition: false,
    componentCheck: 0,
    categoryKey: 0,
    SnackBarComponent: {},
    supplierKey: 0,
    subkeycategory: 0,
    assetkey: 0,
    retireKey: 0,
    addAssetLocationDialog: false,
    requestDialog: true,
    locRefresh: 0,
    loading: false,
    assetProcureDialog: false,
    adminAppExists: false,
    windowHeight: 0,
    showFilterDrawer: false,
    goLoading: false,

    // Filter properties
    userselect: "ALL",
    assettaggedstatus: "ALL",
    categoriesName: "ALL",
    categoriessubName: "ALL",
    userArray: [],
    assetitemstagged: [
      { title: "All", value: "ALL" },
      { title: "QR Tagged", value: "TAGGED" },
      { title: "QR Untagged", value: "UNTAGGED" },
    ],
    categoriesitems: [],
    categoriessubitems: [],
    searchValue: "",
    assetTemplateUrl: "",
    uploadAssetDialog: false,
    excelTableData: [],
    excelHeaders: [],
    exportAssetReportsDialog: false,
  }),
  async created() {
    this.fetch_admin_apps();
    this.windowHeight = window.innerHeight - 100;
    this.initializeFilters();
    // Check for query parameters to set tab
    if (this.$route.query.tab) {
      this.toggle_exclusive = this.$route.query.tab;
    }
    // Template URL will be received from AllAssetlist component via emit
  },
  watch: {
    toggle_exclusive() {
      this.searchValue = "";
    },
  },

  computed: {
    activeFiltersCount() {
      let count = 0;

      if (this.userselect && this.userselect !== "ALL") {
        count++;
      }
      if (this.assettaggedstatus && this.assettaggedstatus !== "ALL") {
        count++;
      }
      if (this.categoriesName && this.categoriesName !== "ALL") {
        count++;
      }
      if (this.categoriessubName && this.categoriessubName !== "ALL") {
        count++;
      }

      return count;
    },
  },
  methods: {
    request_asset() {
      this.componentCheck = 5;
      this.requestDialog = true;
    },
    back_call() {
      this.$router.push("/home/UserAsset");
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type == "ASSETS_USER"
      );

      if (userapp == undefined) {
        this.adminAppExists = false;
        return;
      }
      if (userapp.is_visible == false) {
        this.adminAppExists = false;
        return;
      }

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

      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    create_location() {
      this.componentCheck = 2;
      this.addAssetLocationDialog = true;
    },
    add_supp() {
      this.componentCheck = 1;
      this.supplierAddition = true;
    },
    add_categories() {
      this.componentCheck = 2;
      this.categoriesAddition = true;
    },
    add_subcategories() {
      this.componentCheck = 4;
      this.categoriessubAddition = true;
    },
    add_asset() {
      this.componentCheck = 3;
      this.assetCreation = true;
    },
    add_asset_procurement() {
      this.componentCheck = 4;
      this.assetProcureDialog = true;
    },
    add_reasonretire() {
      this.componentCheck = 5;
      this.retireAddition = true;
    },

    assetfresh() {
      this.assetkey += 1;
    },
    location_refresh() {
      this.locRefresh += 1;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.assetCreation = false;
      this.addAssetLocationDialog = false;
      this.supplierAddition = false;
      this.categoriesAddition = false;
      this.categoriessubAddition = false;
      this.AssetLocationCreation = false;
      this.retireAddition = false;
      this.assetProcureDialog = false;
      this.requestDialog = false;
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

    // Filter methods
    async initializeFilters() {
      await Promise.all([this.get_all_org_users(), this.fetch_categories()]);
      this.populateUserArray();
      this.categoriessubitems.unshift({
        title: "All",
        value: "ALL",
      });
    },

    populateUserArray() {
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

    async fetch_categories() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_categories, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_CATEGORY",
            },
          })
        );
        var response = JSON.parse(result.data.asset_categories);

        if (response.Status == "SUCCESS") {
          var categoriesRecords = response.data;

          categoriesRecords.forEach((element) => {
            this.categoriesitems.push({
              title: element.category_name,
              value: element.category_id,
            });
          });
        } else {
          this.categoriesitems = [];
        }
      } catch (error) {
        this.categoriesitems = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    async fetch_subcategories() {
      this.categoriessubitems = [];
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(asset_sub_category, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_SUBCATEGORY",
            },
          })
        );
        var response = JSON.parse(result.data.asset_sub_category);

        if (response.Status == "SUCCESS") {
          var categoriesRecords = response.data;

          var filteredArray = categoriesRecords.filter(
            (obj) => obj.category_id === this.categoriesName
          );

          this.categoriessubitems = [];
          this.categoriessubitems.unshift({
            title: "All",
            value: "ALL",
          });
          filteredArray.forEach((element) => {
            this.categoriessubitems.push({
              title: element.sub_category_name,
              value: element.sub_category_id,
            });
          });
        } else {
          this.categoriessubitems = [];
        }
      } catch (error) {
        this.categoriessubitems = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },

    applyFilterFromDrawer() {
      this.goLoading = true;
      // Call the child component's filter method
      if (this.$refs.allAssetList) {
        this.$refs.allAssetList.get_data();
      }
      this.closeFilterDrawer();
      this.goLoading = false;
    },

    clearFilters() {
      this.userselect = "ALL";
      this.assettaggedstatus = "ALL";
      this.categoriesName = "ALL";
      this.categoriessubName = "ALL";
      this.searchValue = ""; // Clear search value when filters are cleared

      // Refresh the asset list with cleared filters
      if (this.$refs.allAssetList) {
        this.$refs.allAssetList.get_data();
      }
    },

    handleFilterApplied(filterData) {
      // This method will be called when the child component applies the filter
      console.log("Filter applied:", filterData);
    },

    handleTemplateUrl(templateUrl) {
      // This method will be called when the child component receives the template URL
      this.assetTemplateUrl = templateUrl;
    },

    async downloadFile(url, fileName) {
      const fileUrl = url;

      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Network response was not ok");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading the file:", error);
      }
    },
    beforeUpload(file) {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.type === "text/csv";
      if (!isExcel) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Only Excel files are allowed!",
          timeout: 5000,
          Top: true,
        };
        return false;
      }
      return true;
    },
    handleSuccessAsset({ results, header }) {
      this.excelTableData = results;
      this.excelHeaders = header;
      this.uploadAssetDialog = true;
    },
    export_item() {
      // TODO: Implement export functionality for assets
      console.log("Export assets");
    },
    export_asset_reports() {
      this.exportAssetReportsDialog = true;
    },
  },
};
</script>

<style scoped>
/* Modern Header Section */

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-container {
  display: flex;
  align-items: center;
}

.header-icon-bg {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 14px;
  color: #666;
  line-height: 1.2;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Search Container Styles */
.search-container {
  margin-right: 16px;
  min-width: 200px;
}

.search-field {
  width: 100%;
}

/* Action Button Styles */
.action-btn,
button.action-btn,
.v-btn.action-btn {
  background: #db4c77 !important;
  background-color: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  min-height: 36px !important;
}

.action-btn:hover,
button.action-btn:hover,
.v-btn.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
  background-color: #c2185b !important;
  color: white !important;
}

/* Ensure text and icons are visible */
.action-btn span,
.action-btn .v-icon,
.filter-btn span,
.filter-btn .v-icon {
  color: white !important;
}

/* Ensure button keeps its background when menu is open */
.actions-menu .action-btn,
.actions-menu .action-btn:hover,
.actions-menu .action-btn:focus,
.actions-menu .action-btn:active,
.actions-menu .action-btn.v-btn--active {
  background: #db4c77 !important;
  color: white !important;
}

.actions-menu :deep(.v-btn),
.actions-menu :deep(.v-btn__overlay) {
  background: #db4c77 !important;
  color: white !important;
}

.actions-menu :deep(.v-btn:hover),
.actions-menu :deep(.v-btn:focus),
.actions-menu :deep(.v-btn:active),
.actions-menu :deep(.v-btn--active),
.actions-menu :deep(.v-btn__overlay:hover) {
  background: #c2185b !important;
  color: white !important;
}

/* Override Vuetify's default button styles when menu is active */
.actions-menu :deep(button.v-btn),
.actions-menu :deep(.v-btn) {
  background-color: #db4c77 !important;
  background: #db4c77 !important;
}

.actions-menu :deep(button.v-btn .v-btn__overlay),
.actions-menu :deep(.v-btn .v-btn__overlay) {
  background-color: transparent !important;
  background: transparent !important;
}

.actions-menu :deep(button.v-btn--active),
.actions-menu :deep(.v-btn--active) {
  background-color: #db4c77 !important;
  background: #db4c77 !important;
}

/* Force button background in all states */
.actions-menu button,
.actions-menu button.v-btn,
.actions-menu button.action-btn {
  background: #db4c77 !important;
  background-color: #db4c77 !important;
}

.actions-menu button:hover,
.actions-menu button.v-btn:hover,
.actions-menu button.action-btn:hover {
  background: #c2185b !important;
  background-color: #c2185b !important;
}

.add-btn {
  background: #db4c77 !important;
}

.add-btn:hover {
  background: #c2185b !important;
}

.back-btn {
  background: #1976d2 !important;
}

.back-btn:hover {
  background: #1565c0 !important;
}

/* Button Toggle Styles */
.font-size-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
}

.active-btn {
  color: white !important;
  background-color: #db4c77 !important;
  border-radius: 8px !important;
}

/* Main Container Styles - scoped to avoid affecting buttons */
.main-container,
.v-card,
.v-card-text,
.v-toolbar,
.header-actions,
.search-container {
  background-color: white !important;
}

/* Exclude buttons from global div rule - but keep their own colors */
button.v-btn.action-btn,
button.action-btn,
.actions-menu button.v-btn.action-btn,
.actions-menu button.action-btn {
  background-color: #db4c77 !important;
  color: white !important;
}

button.v-btn.filter-btn,
button.filter-btn {
  background-color: #e91e63 !important;
  color: white !important;
}

button.v-btn.filter-btn.active,
button.filter-btn.active {
  background-color: #c2185b !important;
  color: white !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px;
  }

  .search-container {
    min-width: 200px;
    margin-right: 8px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .font-size-btn {
    font-size: 12px !important;
  }
}

/* Filter Button Styles */
.filter-btn,
button.filter-btn,
.v-btn.filter-btn {
  background: #e91e63 !important;
  background-color: #e91e63 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3) !important;
  transition: all 0.3s ease !important;
}

.filter-btn:hover,
button.filter-btn:hover,
.v-btn.filter-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4) !important;
  background: #c2185b !important;
  background-color: #c2185b !important;
  color: white !important;
}

.filter-btn.active,
button.filter-btn.active,
.v-btn.filter-btn.active {
  background: #c2185b !important;
  background-color: #c2185b !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(194, 24, 91, 0.3) !important;
}

.filter-btn.active:hover,
button.filter-btn.active:hover,
.v-btn.filter-btn.active:hover {
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.4) !important;
  background: #c2185b !important;
  background-color: #c2185b !important;
  color: white !important;
}

/* Navigation Drawer Styles */
.navBar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.custom-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

/* Filter Content Styles */
.filter-content {
  padding: 16px 0;
}

.filter-group {
  margin-bottom: 16px;
}

.filter-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  display: block;
}

.filter-select {
  width: 100%;
}

/* Filter Drawer Styles */
.filter-drawer {
  position: fixed !important;
  top: 64px !important;
  height: calc(100vh - 64px) !important;
}

/* Menu and List Styling */
.actions-menu :deep(.v-menu__content) {
  background-color: white !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e0e0e0 !important;
}

.actions-list {
  background-color: white !important;
  border-radius: 8px !important;
}

.actions-list :deep(.v-list-item) {
  background-color: white !important;
  transition: background-color 0.2s ease !important;
}

.actions-list :deep(.v-list-item:hover) {
  background-color: #f5f5f5 !important;
}

.actions-list :deep(.v-list-item-title) {
  color: #333 !important;
  font-weight: 500 !important;
}

.actions-list :deep(.v-divider) {
  border-color: #e0e0e0 !important;
}

/* Override global div rule for menu content */
.actions-menu :deep(.v-menu__content) > div {
  background-color: white !important;
}
</style>
