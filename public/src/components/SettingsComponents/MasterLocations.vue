<template>
  <div>
    <div>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      
      <!-- Main Locations List View -->
      <div v-if="componentCheck === 0" class="card-container" style="position: relative">
        <v-card class="" flat>
          <v-card-text>
            <!-- Top Controls: All in one row -->
            <v-row
              class="align-center px-6 pt-6 pb-2"
              
            >
              <v-col cols="auto" class="d-flex align-center">
                <v-icon class="mr-3" color="primary" size="large"
                  >mdi-map-marker-multiple</v-icon
                >
                <span class="font-weight-bold text-h6"
                  >Locations </span
                >
              </v-col>
              <v-spacer />

              <!-- Search Field -->
              <v-col cols="auto" class="d-flex align-center">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Search locations..."
                  prepend-inner-icon="mdi-magnify"
                  variant="solo"
                  hide-details
                  density="compact"
                  class="search-pill mr-4"
                  style="
                    min-width: 280px;
                    max-width: 280px;
                    height: 32px;
                    border-radius: 999px;
                    background: #fff;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
                    font-size: 14px;
                  "
                  clearable
                  @click:clear="searchQuery = ''"
                ></v-text-field>
              </v-col>

              <!-- Add Button -->
              <v-col cols="auto" class="d-flex align-center">
                <v-btn
                  @click="add_action()"
                  class="cardCss text-capitalize"
                  dark
                  size="small"
                  prepend-icon="mdi-plus"
                  flat
                >
                  Add Location
                </v-btn>
              </v-col>

              <!-- Back Button -->
              <v-col cols="auto" class="d-flex align-center">
                <v-btn 
                  text
                  @click="goBack"
                  class="back-link ml-4"
                  color="primary"
                   size="small"
                >
                  <v-icon left>mdi-arrow-left</v-icon>
                  Back 
                </v-btn>
              </v-col>
            </v-row>

            <v-data-table
              :headers="headers"
              :items="sortedAndPaginatedItems"
              :loading="tableLoading"
              :fixed-header="fixed"
              :height="windowHeight"
              hide-default-footer
              density="comfortable"
              class="modern-data-table"
              hover
              multi-sort
              @update:sort-by="handleSortChange"
            >
              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey lighten-1" class="mb-4"
                    >mdi-map-marker-off</v-icon
                  >
                  <div class="text-h6 grey--text mb-2">No Locations Found</div>
                  <div class="text-body-2 grey--text">
                    Try adjusting your search criteria or add a new location.
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
                  <div class="text-body-2 grey--text">Loading locations...</div>
                </div>
              </template>

              <!-- Location Name -->
              <template v-slot:[`item.location_name`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="20" color="primary" class="mr-3"
                    >mdi-map-marker</v-icon
                  > -->
                  <div>
                    <div class="font-weight-medium text-body-2">
                      {{ item.location_name || "N/A" }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Location Head -->
              <template v-slot:[`item.location_head`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-avatar size="24" color="primary" class="mr-2">
                    <span
                      class="white--text font-weight-medium"
                      style="font-size: 10px"
                    >
                      {{
                        (item.location_head || "H").substring(0, 1).toUpperCase()
                      }}
                    </span>
                  </v-avatar> -->
                  <span class="caption">
                    {{ item.location_head || "N/A" }}
                  </span>
                </div>
              </template>

              <!-- Location Type -->
              <template v-slot:[`item.location_type`]="{ item }">
                <div class="d-flex align-center">
                  <v-chip
                    :color="getLocationTypeColor(item.location_type)"
                    size="small"
                    variant="flat"
                    class="text-caption"
                  >
                    {{ getLocationTypeLabel(item.location_type) }}
                  </v-chip>
                </div>
              </template>

              <!-- Address -->
              <template v-slot:[`item.location_address`]="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ on }">
                    <div class="d-flex align-center" v-on="on">
                      <!-- <v-icon size="16" color="grey" class="mr-2"
                        >mdi-map-marker-outline</v-icon
                      > -->
                      <span
                        class="caption text-truncate"
                        style="max-width: 200px"
                      >
                        {{ item.location_address || "N/A" }}
                      </span>
                    </div>
                  </template>
                  <div style="max-width: 300px">
                    <div class="font-weight-medium mb-1">Address</div>
                    <div>
                      {{ item.location_address || "No address available" }}
                    </div>
                  </div>
                </v-tooltip>
              </template>

              <!-- Pincode -->
              <template v-slot:[`item.location_pincode`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="grey" class="mr-2">mdi-pin</v-icon> -->
                  <span class="caption">
                    {{
                      item.location_pincode && item.location_pincode != 0
                        ? item.location_pincode
                        : "N/A"
                    }}
                  </span>
                </div>
              </template>

              <!-- Country -->
              <template v-slot:[`item.location_country`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="grey" class="mr-2">mdi-flag</v-icon> -->
                  <span class="caption">
                    {{ item.location_country || "N/A" }}
                  </span>
                </div>
              </template>

              <!-- State -->
              <template v-slot:[`item.location_state`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="grey" class="mr-2">mdi-map</v-icon> -->
                  <span class="caption">
                    {{ item.location_state || "N/A" }}
                  </span>
                </div>
              </template>

              <!-- District -->
              <template v-slot:[`item.location_district`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="grey" class="mr-2">mdi-city</v-icon> -->
                  <span class="caption">
                    {{ item.location_district || "N/A" }}
                  </span>
                </div>
              </template>

              <!-- Actions -->
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex align-center justify-center">
                  <v-menu
                    offset-y
                    v-if="item.location_type != 'SCAN_ANYWHERE'"
                    v-model="menuStates[item.location_id]"
                  >
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        size="small"
                        variant="text"
                        v-bind="props"
                        class="cursor-pointer"
                      >
                        <v-icon size="18">mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list density="compact">
                      <v-list-item
                        @click.stop="view_location(item, item.location_id)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="green">mdi-eye</v-icon>
                        </template>
                        <v-list-item-title>Edit Location</v-list-item-title>
                      </v-list-item>

                      <v-divider class="my-1" />

                      <v-list-item
                        @click.stop="edit_location(item, item.location_id)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="blue">mdi-pencil</v-icon>
                        </template>
                        <v-list-item-title>Edit Location Head</v-list-item-title>
                      </v-list-item>

                      <v-divider class="my-1" />

                      <v-list-item
                        @click.stop="delete_user_items(item, item.location_id)"
                        style="font-size: 12px"
                      >
                        <template #prepend>
                          <v-icon size="small" color="red">mdi-delete</v-icon>
                        </template>
                        <v-list-item-title>Delete Location</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <span v-else class="caption grey--text">-</span>
                </div>
              </template>
            </v-data-table>

            <!-- Modern Table Footer -->
            <div class="table-footer">
              <div class="footer-info">
                {{
                  totalItems === 0
                    ? "No Results"
                    : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} locations`
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

      <!-- View Location Dialog Component -->
      <ViewLocationDialog
        :dialog="componentCheck == 3"
        :rowInfo="rowInfo"
        @update:dialog="updateViewLocationDialog"
        @close="close_view_location"
        @errorMsg="error_info"
        @successMsg="handleLocationUpdateSuccess"
      />

      <!-- Add Location Dialog Component -->
      <div v-if="componentCheck == 1">
        <AddLocationDialog
          :dialog="componentCheck == 1"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @close="close_add_location"
        />
      </div>
      <div v-if="componentCheck == 2">
        <DeleteLocation
          :deleteDialog="deleteDialog"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @clicked="close_dialogs"
          :rowInfo="rowInfo"
        />
      </div>
      <div v-if="componentCheck == 4">
        <EditMasterhead
          :editMasterDailog="editMasterDailog"
          :rowInfo="rowInfo"
          :tabName="tabName"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @clicked="editMasterDailog = false"
        />
      </div>
      <div v-if="componentCheck == 5">
        <CreateLocationQR
          :qrCreation="qrCreation"
          :rowInfo="rowInfo"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @clicked="qrCreation = false"
        />
      </div>
      <div v-if="componentCheck == 6">
        <LocationQRview
          :qrLocation="qrLocation"
          @clicked="qrLocation = false"
          :rowInfo="rowInfo"
          :qrtype="qrtype"
        />
      </div>
      <div v-if="componentCheck == 7">
        <LocationQrList
          :qrListLocation="qrListLocation"
          @clicked="qrListLocation = false"
          :rowInfo="rowInfo"
        />
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */

// Imports
import LocationQrList from "@/components/SettingsDialogs/LocationQrList.vue";
import LocationQRview from "@/components/SettingsDialogs/LocationQRview.vue";
import CreateLocationQR from "@/components/SettingsDialogs/CreateLocationQR.vue";
import SnackBar from "@/components/SnackBar.vue";
import DeleteLocation from "@/components/SettingsDialogs/DeleteLocation.vue";
import EditMasterhead from "@/components/SettingsDialogs/EditMasterhead.vue";
import AddLocationDialog from "@/components/SettingsDialogs/AddLocationDialog.vue";
import ViewLocationDialog from "@/components/SettingsDialogs/ViewLocationDialog.vue";
import { list_all_locations } from "@/graphql/queries.js";
import { edit_location, create_locations } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_master_loactiontype } from "@/mixins/GetMasterlocationtype";
import CountryList from "@/JsonFiles/CountryList.json";
import { get_project_site } from "@/mixins/GetProjectsite.js";
import { get_asset_distributors } from "@/mixins/GetAssetDistributors.js";
import { get_asset_reatilers } from "@/mixins/GetAssetRetailers.js";
import { get_master_terittory } from "@/mixins/GetMasterTerritory";
import { get_all_users } from "@/mixins/GetAllUsers.js";
import GoogleMaps from "@/components/GoogleMaps.vue";
import GoogleAddressAutocomplete from "@/components/GoogleAddressAutocomplete.vue";

export default {
  // Components
  components: {
    SnackBar,
    DeleteLocation,
    EditMasterhead,
    CreateLocationQR,
    LocationQRview,
    LocationQrList,
    GoogleMaps,
    GoogleAddressAutocomplete,
    AddLocationDialog,
    ViewLocationDialog,
  },

  // Mixins
  mixins: [
    get_all_users,
    get_master_terittory,
    get_asset_reatilers,
    get_asset_distributors,
    get_master_loactiontype,
    get_project_site,
  ],

  // Data
  data() {
    return {
      // Table properties
      tableData: [],
      tableLoading: false,
      fixed: true,
      windowHeight: 0,

      // Search and pagination
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: [{ key: "location_name", order: "asc" }],

      // Table headers
      headers: [
        {
          title: "Location Name",
          value: "location_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Location Head",
          value: "location_head",
          sortable: true,
          align: "start",
        },
        {
          title: "Location Type",
          value: "location_type",
          sortable: true,
          align: "start",
        },
        {
          title: "Location Address",
          value: "location_address",
          sortable: true,
          align: "start",
        },
        {
          title: "Country",
          value: "location_country",
          sortable: true,
          align: "start",
        },
        {
          title: "State",
          value: "location_state",
          sortable: true,
          align: "start",
        },
        {
          title: "District",
          value: "location_district",
          sortable: true,
          align: "start",
        },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],

      // Dialog states
      addLocation: false,
      deleteDialog: false,
      locationViewDialog: false,
      editMasterDailog: false,
      qrCreation: false,
      qrLocation: false,
      qrListLocation: false,
      componentCheck: 0,

      // Component data
      SnackBarComponent: {},
      rowInfo: {},
      tabName: "",
      qrtype: "Single",
      menuStates: {}, // Track menu open/close states

      // ViewLocation integrated data
      center: { lat: 45.508, lng: -73.587 },
      mapMarkers: [],
      mapCenter: { lat: 0, lng: 0 },
      places: [],
      currentPlace: null,
      loading1: false,
      countryitems: [],
      territory: "",
      selectRetailer: "",
      selectprojectsite: "",
      selectDistributor: "",
      distribuorList: [],
      projectsiteList: [],
      retailerItems: [],
      territoryitems: [],
      searchLocation: "",
      locationAddress: "",
      locationState: "",
      geoLongitude: "",
      districtItems: [],
      geoLattitude: "",
      countryData: "",
      locationPincode: "",
      locationDistrict: "",
      locationType: "",
      loading: false,
      locationitems: [],
      defaultCenter: {
        lat: 0,
        lng: 0,
      },
      googleApiKey: "AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI",

      // LocationAdd integrated data
      locationName: "",
      locationHead: "",
      masterUsers: [],
      stateItems: [],
    };
  },

  // Computed properties
  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter(
        (item) =>
          (item.location_name &&
            item.location_name.toLowerCase().includes(searchTerm)) ||
          (item.location_head &&
            item.location_head.toLowerCase().includes(searchTerm)) ||
          (item.location_type &&
            this.getLocationTypeLabel(item.location_type)
              .toLowerCase()
              .includes(searchTerm)) ||
          (item.location_address &&
            item.location_address.toLowerCase().includes(searchTerm)) ||
          (item.location_country &&
            item.location_country.toLowerCase().includes(searchTerm)) ||
          (item.location_state &&
            item.location_state.toLowerCase().includes(searchTerm)) ||
          (item.location_district &&
            item.location_district.toLowerCase().includes(searchTerm))
      );
    },

    sortedAndPaginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },

    totalItems() {
      return this.filteredItems.length;
    },

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
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
    searchQuery() {
      this.currentPage = 1;
    },

    currentPage(newVal) {
      // When the page changes, scroll to top of the card container
      this.$nextTick(() => {
        const cardContainer = document.querySelector(".card-container");
        if (cardContainer) {
          cardContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Fallback to scrolling to top of page
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    },

    componentCheck: {
      handler(newVal) {
        // Component check watcher - dialogs handle their own initialization
      },
      immediate: true,
    },
  },

  // Lifecycle hooks
  created() {
    this.fetch_master_locations();
    this.windowHeight = window.innerHeight - 330;
  },

  // Methods
  methods: {
    // Location type utility methods
    getLocationTypeColor(type) {
      const colors = {
        OFFICE: "blue",
        MAIN_LOCATION: "green",
        BRANCH: "orange",
        SCAN_ANYWHERE: "grey",
        default: "grey",
      };
      return colors[type] || colors.default;
    },

    getLocationTypeLabel(type) {
      const labels = {
        OFFICE: "Office",
        MAIN_LOCATION: "Main Location",
        BRANCH: "Branch",
        SCAN_ANYWHERE: "Scan Anywhere",
        default: type || "Unknown",
      };
      return labels[type] || labels.default;
    },

    // Sorting methods
    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "location_name" ||
        key === "location_head" ||
        key === "location_address" ||
        key === "location_country" ||
        key === "location_state" ||
        key === "location_district"
      ) {
        return value.toLowerCase();
      }
      if (key === "location_type") {
        return this.getLocationTypeLabel(value).toLowerCase();
      }
      return value;
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },

    // Data fetching methods
    async fetch_master_locations() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_locations, {
            organization_id: data.organization.organization_id,
            location_status: "ACTIVE",
            limit: 500,
            next_token: null,
          })
        );
        
        this.tableLoading = false;
        var response = result.data.list_all_locations;

        // Check multiple possible data structures
        let locationsData = null;

        if (response.details && Array.isArray(response.details)) {
          locationsData = response.details;
        } else if (response.data && Array.isArray(response.data)) {
          locationsData = response.data;
        } else if (response.items && Array.isArray(response.items)) {
          locationsData = response.items;
        } else if (response.locations && Array.isArray(response.locations)) {
          locationsData = response.locations;
        } else {
          locationsData = [];
        }

        this.tableData = locationsData || [];
      } catch (error) {
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

    // QR code methods
    qrView(item) {
      this.componentCheck = 6;
      this.rowInfo = item;
      this.qrLocation = true;
    },

    qrmultipleView(item) {
      this.componentCheck = 7;
      this.rowInfo = item;
      this.qrListLocation = true;
    },

    add_locationQR(item) {
      this.componentCheck = 5;
      this.rowInfo = item;
      this.qrCreation = true;
    },

    // Dialog management methods
    updateViewLocationDialog(value) {
      if (!value) {
        this.componentCheck = 0;
      }
    },

    handleLocationUpdateSuccess(message) {
      this.success_info(message);
      // Refresh the table data after successful update
      this.fetch_master_locations();
    },

    view_location(item, locationId) {
      // Close the menu
      this.menuStates[locationId] = false;

      this.componentCheck = 3;
      this.rowInfo = item;
    },

    add_action() {
      this.componentCheck = 1;
      this.addLocation = true;
    },

    delete_user_items(item, locationId) {
      // Close the menu
      this.menuStates[locationId] = false;

      this.rowInfo = item;
      this.componentCheck = 2;
      this.deleteDialog = true;
    },

    edit_location(item, locationId) {
      // Close the menu
      this.menuStates[locationId] = false;

      this.rowInfo = item;
      this.tabName = "Location";
      this.editMasterDailog = true;
      this.componentCheck = 4;
    },

    close_dialogs(val) {
      if (val == 0) {
        this.addLocation = false;
        this.deleteDialog = false;
        this.componentCheck = 0;
      }
    },

    // Navigation methods
    goBack() {
      this.$emit('backAction');
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
      this.qrCreation = false;
      this.addLocation = false;
      this.locationViewDialog = false;
      this.deleteDialog = false;
      this.editMasterDailog = false;
        
      // Close view location if it's open
      if (this.componentCheck === 3) {
        this.close_view_location();
      }
      
      // Close add location if it's open
      if (this.componentCheck === 1) {
        this.close_add_location();
      }
      
      this.fetch_master_locations();
    },

    close_view_location() {
      this.componentCheck = 0;
    },


    close_add_location() {
      this.componentCheck = 0;
    },

    clearvalue() {
      this.selectDistributor = "";
      this.selectRetailer = "";
    },

  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
}

.card-container {
  position: relative;
}

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

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
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

/* ViewLocation Component Styles */
.view-location-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.view-location-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-toolbar {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 20px;
  position: relative;
}

.search-toolbar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
}

.location-search-input {
  min-width: 450px;
  margin-right: 12px;
}

.search-btn {
  border-radius: 8px;
  font-weight: 500;
}

.dialog-content {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.map-section {
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  position: relative;
  min-height: 450px;
}

.map-section .v-alert {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 5;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  height: fit-content;
  position: relative;
  max-height: 600px;
  overflow-y: auto;
}

.form-section::-webkit-scrollbar {
  width: 6px;
}

.form-section::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.form-section::-webkit-scrollbar-thumb {
  background: #db4c77;
  border-radius: 3px;
}

.form-section::-webkit-scrollbar-thumb:hover {
  background: #c73e6b;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #db4c77;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #fce4ec;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #db4c77;
  border-radius: 2px;
}

.section-title b {
  font-weight: 600;
}

.dialog-actions {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* Ensure the card has proper spacing */
.v-card-text {
  padding: 0;
}

/* Make sure toolbar styling is preserved */
.navBar {
  background: #f8f9fa !important;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navBar .custom-title {
  color: black !important;
  font-weight: 600;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.navBar .icon-class {
  color: black !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.navBar .icon-class:hover {
  transform: scale(1.1);
  color: #db4c77 !important;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 4px;
}

/* Form field enhancements */
.v-text-field,
.v-select,
.v-autocomplete,
.v-textarea {
  margin-bottom: 8px;
}

.v-text-field .v-field,
.v-select .v-field,
.v-autocomplete .v-field,
.v-textarea .v-field {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.v-text-field .v-field:hover,
.v-select .v-field:hover,
.v-autocomplete .v-field:hover,
.v-textarea .v-field:hover {
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.15);
}

.v-text-field .v-field--focused,
.v-select .v-field--focused,
.v-autocomplete .v-field--focused,
.v-textarea .v-field--focused {
  box-shadow: 0 0 0 2px rgba(219, 76, 119, 0.2);
  border-color: #db4c77;
}

/* Readonly field styling */
.v-text-field .v-field--readonly {
  background-color: #f5f5f5;
  opacity: 0.8;
}

/* Error state styling */
.v-text-field .v-field--error,
.v-select .v-field--error,
.v-autocomplete .v-field--error,
.v-textarea .v-field--error {
  border-color: #ff5252;
  box-shadow: 0 0 0 2px rgba(255, 82, 82, 0.2);
}

/* Success state styling */
.v-text-field .v-field--success,
.v-select .v-field--success,
.v-autocomplete .v-field--success,
.v-textarea .v-field--success {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

/* Button enhancements */
.v-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.3s ease;
  height: 40px !important;
  align-items: center;
  display: inline-flex;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.v-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.cardCss {
  background: #db4c77;
  border-radius: 8px;
}

.button-corner {
  border-radius: 8px;
  padding: 0 24px;
  font-weight: 600;
}

/* Alert styling */
.v-alert {
  margin-bottom: 16px;
  border-radius: 8px;
  border-left: 4px solid #db4c77;
}

.v-alert--info {
  background: rgba(33, 150, 243, 0.1);
  border-left-color: #2196f3;
}

.v-alert--success {
  background: rgba(76, 175, 80, 0.1);
  border-left-color: #4caf50;
}

.v-alert--warning {
  background: rgba(255, 193, 7, 0.1);
  border-left-color: #ffc107;
}

.v-alert--error {
  background: rgba(244, 67, 54, 0.1);
  border-left-color: #f44336;
}

/* Responsive adjustments */
@media (max-width: 1600px) {
  .view-location-card {
    width: 95%;
    max-width: 1000px;
    max-height: 80vh;
    margin: 20px;
  }

  .location-search-input {
    min-width: 350px;
  }

  .dialog-content {
    padding: 12px;
    max-height: calc(80vh - 200px);
    overflow-y: auto;
  }

  .map-section,
  .form-section {
    padding: 8px;
  }
}

@media (max-width: 1200px) {
  .view-location-card {
    width: 95%;
    max-width: 1200px;
  }

  .location-search-input {
    min-width: 300px;
  }
}

@media (max-width: 992px) {
  .view-location-card {
    width: 98%;
    max-width: 1000px;
  }

  .location-search-input {
    min-width: 250px;
  }

  .v-col {
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .view-location-card {
    width: 100%;
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .location-search-input {
    min-width: 200px;
  }

  .dialog-content {
    padding: 8px;
  }

  .map-section,
  .form-section {
    padding: 8px;
    margin-bottom: 8px;
  }

  .section-title {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .dialog-actions {
    padding: 8px;
    flex-direction: column;
    gap: 8px;
  }

  .dialog-actions .v-btn {
    width: 100%;
    margin: 0;
  }

  .v-btn {
    font-size: 12px;
    padding: 8px 16px;
  }
}

/* Scrollbar styling */
.view-location-card::-webkit-scrollbar {
  width: 8px;
}

.view-location-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.view-location-card::-webkit-scrollbar-thumb {
  background: #db4c77;
  border-radius: 4px;
}

.view-location-card::-webkit-scrollbar-thumb:hover {
  background: #c73e6b;
}

/* Print styles */
@media print {
  .dialog-actions,
  .search-toolbar {
    display: none !important;
  }

  .view-location-card {
    position: static;
    transform: none;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .view-location-card {
    border: 2px solid #000;
  }

  .v-btn {
    border: 1px solid #000;
  }

  .v-text-field .v-field,
  .v-select .v-field,
  .v-autocomplete .v-field,
  .v-textarea .v-field {
    border: 1px solid #000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .view-location-card {
    animation: none;
  }

  .v-btn:hover {
    transform: none;
  }

  .navBar .icon-class:hover {
    transform: none;
  }
}

/* LocationAdd Component Styles */
.add-location-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.add-location-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

.add-location-card::-webkit-scrollbar {
  width: 8px;
}

.add-location-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.add-location-card::-webkit-scrollbar-thumb {
  background: #db4c77;
  border-radius: 4px;
}

.add-location-card::-webkit-scrollbar-thumb:hover {
  background: #c73e6b;
}

/* Responsive adjustments for add location */
@media (max-width: 1600px) {
  .add-location-card {
    width: 95%;
    max-width: 1000px;
    max-height: 80vh;
    margin: 20px;
  }
}

@media (max-width: 1200px) {
  .add-location-card {
    width: 95%;
    max-width: 1200px;
  }
}

@media (max-width: 992px) {
  .add-location-card {
    width: 98%;
    max-width: 1000px;
  }
}

@media (max-width: 768px) {
  .add-location-card {
    width: 100%;
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
}
</style>