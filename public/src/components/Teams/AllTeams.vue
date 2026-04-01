<template>
  <div>
    <!--eslint-disable  -->
    <v-card class="" flat>
      <!-- Search and Filter Container moved to parent component -->

      <!-- Filter Navigation Drawer -->
      <v-navigation-drawer
        :model-value="showFilterDrawer"
        @update:model-value="showFilterDrawer = $event"
        app
        location="right"
        temporary
        width="400"
        class="pa-0"
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
                <!-- Status Filter -->
                <div class="filter-group">
                  <label class="filter-label">Status</label>
                  <v-select
                    v-model="selectStatusType"
                    :items="[
                      { title: 'All', value: 'ALL' },
                      { title: 'Active', value: 'ACTIVE' },
                      { title: 'Inactive', value: 'DEACTIVE' },
                      { title: 'Invited', value: 'INVITED' },
                    ]"
                    item-text="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="filter-select"
                  />
                </div>

                <!-- Filter By -->
                <div class="filter-group">
                  <label class="filter-label">Filter By</label>
                  <v-select
                    v-model="filterBy"
                    :items="[
                      { title: 'All', value: '' },
                      { title: 'Groups', value: 'groups' },
                      { title: 'Locations', value: 'locations' },
                    ]"
                    item-text="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="filter-select"
                  />
                </div>

                <!-- Groups Filter (when Filter By is 'groups') -->
                <div class="filter-group" v-if="filterBy == 'groups'">
                  <label class="filter-label">Select Groups</label>
                  <v-select
                  v-model="filterByGroups"
                  :items="groupList"
                  item-title="title"
                  item-value="value"
                  multiple
                  chips
                  clearable
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
                </div>

                <!-- Locations Filter (when Filter By is 'locations') -->
                <div class="filter-group" v-if="filterBy == 'locations'">
                  <label class="filter-label">Select Location</label>
                  <v-select
                    v-model="filterByLocations"
                    :items="locationRecords"
                    item-text="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="filter-select"
                  />
                </div>

                <!-- Member ID Filter -->

                <!-- Filter By User -->
                <div class="filter-group">
                  <label class="filter-label">Filter By User</label>
                  <v-select
                    v-model="searachByFilter"
                    :items="[
                      { title: 'All', value: '' },
                      { title: 'Name', value: 'filterByName' },
                      { title: 'Email', value: 'filterByEmail' },
                      { title: 'Mobile Number', value: 'filterByMobNum' },
                      {
                        title: 'Reporting Manager',
                        value: 'filterByReportingManager',
                      },
                      { title: 'Member ID', value: 'filterByMemberId' },
                    ]"
                    item-text="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="filter-select"
                  />
                </div>

                <!-- Email Search (when Filter By User is 'Email') -->
                <div
                  class="filter-group"
                  v-if="searachByFilter == 'filterByEmail'"
                >
                  <label class="filter-label">Search Email</label>
                  <v-autocomplete
                    v-model="userEmailSelect"
                    variant="outlined"
                    item-title="email_id"
                    item-value="email_id"
                    :items="userArray"
                    v-model:search-input="searchEmail"
                    hide-no-data
                    placeholder="Min 3 Character"
                    hide-selected
                    density="compact"
                    hide-details
                    class="filter-select"
                  />
                </div>

                <!-- Name Search (when Filter By User is 'Name') -->
                <div
                  class="filter-group"
                  v-if="searachByFilter == 'filterByName'"
                >
                  <label class="filter-label">Search User</label>
                  <v-autocomplete
                    v-model="userselect"
                    variant="outlined"
                    item-title="full_user_name"
                    item-value="user_id"
                    :items="userArray"
                    v-model:search-input="searchF"
                    hide-no-data
                    placeholder="Min 3 Character"
                    hide-selected
                    density="compact"
                    hide-details
                    class="filter-select"
                  />
                </div>

                <!-- Mobile Number Search (when Filter By User is 'Mobile Number') -->
                <div
                  class="filter-group"
                  v-if="searachByFilter == 'filterByMobNum'"
                >
                  <label class="filter-label">Search Number</label>
                  <v-autocomplete
                    v-model="userMobNumSelect"
                    variant="outlined"
                    item-title="contact_number_key"
                    item-value="contact_number"
                    :items="
                      userArray.filter(
                        (item) =>
                          item.contact_number && item.contact_number !== 'N/A'
                      )
                    "
                    v-model:search-input="searchNum"
                    hide-no-data
                    placeholder="Min 3 Character"
                    hide-selected
                    density="compact"
                    hide-details
                    class="filter-select"
                  />
                </div>

                <!-- Reporting Manager Search (when Filter By User is 'Reporting Manager') -->
                <div
                  class="filter-group"
                  v-if="searachByFilter == 'filterByReportingManager'"
                >
                  <label class="filter-label">Search Reporting Manager</label>
                  <v-autocomplete
                    v-model="reportingName"
                    variant="outlined"
                    item-title="full_user_name"
                    item-value="selected_user_id"
                    :items="userArray"
                    v-model:search-input="searchF"
                    hide-no-data
                    placeholder="Min 3 Character"
                    hide-selected
                    density="compact"
                    hide-details
                    class="filter-select"
                  />
                </div>

                <!-- Member ID Search (when Filter By User is 'Member ID') -->
                <div
                  class="filter-group"
                  v-if="searachByFilter == 'filterByMemberId'"
                >
                  <label class="filter-label">Search Member ID</label>
                  <v-select
                    v-model="memberIdSelect"
                    :items="memberIdOptions"
                    placeholder="Select Member ID"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="filter-select"
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
              @click="clear_data"
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

      <v-card-text>
        <v-data-table
          :search="search"
          :headers="selectStatusType == 'DEACTIVE' ? remoedheaders : headers"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="tableData.length"
          hide-default-footer
          :height="height"
          density="comfortable"
          @click:row="handle_row_click"
          class="modern-data-table"
          hover
          multi-sort
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-account-group-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Team Members Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or filters.
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
              <div class="text-body-2 grey--text">Loading team members...</div>
            </div>
          </template>

<template v-slot:[`item.full_user_name`]="{ item }">
  <div class="user-profile-cell">
    <div class="user-avatar">
      <v-avatar
        v-if="
          item.user_profile_pic_url &&
          item.user_profile_pic_url !== 'N/A'
        "
        size="40"
        class="user-avatar-img cursor-pointer"
        @click.stop="openImagePreview(item)"
      >
        <v-img :src="item.user_profile_pic_url" />
      </v-avatar>

      <v-avatar v-else size="40" class="user-avatar-fallback">
        <span class="avatar-text">
          {{ (item.full_user_name || 'U').charAt(0).toUpperCase() }}
        </span>
      </v-avatar>
    </div>

    <div class="user-info">
      <div class="user-name">
        {{ item.full_user_name || 'N/A' }}
      </div>
      <div class="user-id">
        {{ item.member_id || 'N/A' }}
      </div>
    </div>
  </div>
</template>

          <template v-slot:[`item.user_contact_number`]="{ item }">
            <div class="contact-cell">
              <div class="contact-icon">
                <!-- <v-icon size="16" color="grey">mdi-email</v-icon> -->
              </div>
              <div class="contact-info">
                <div class="contact-email">
                  {{ item.user_email_id || "N/A" }}
                </div>
                <div class="contact-phone">
                  {{ item.user_full_contact_number || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:[`item.department`]="{ item }">
            <div class="department-cell">
              <div class="department-icon">
                <!-- <v-icon size="16" color="grey">mdi-account-group</v-icon> -->
              </div>
              <div
                class="department-tag"
                :class="getDepartmentTagClass(item.department)"
              >
                {{ item.department == "N/A" ? "-" : item.department }}
              </div>
            </div>
          </template>

          <template v-slot:[`item.location`]="{ item }">
            <div class="location-cell">
              <div class="location-icon">
                <!-- <v-icon size="16" color="grey">mdi-map-marker</v-icon> -->
              </div>
              <div class="location-text">
                {{ item.location == "N/A" ? "-" : item.location }}
              </div>
            </div>
          </template>

          <template v-slot:[`item.date_of_joining`]="{ item }">
            <div class="date-cell">
              <div class="date-icon">
                <!-- <v-icon size="16" color="grey">mdi-calendar</v-icon> -->
              </div>
              <div class="date-info">
                <div class="date-text">
                  {{
                    item.date_of_joining == "N/A" ||
                    item.date_of_joining == null ||
                    item.date_of_joining == undefined
                      ? "-"
                      : formatDate(item.date_of_joining)
                  }}
                </div>
                <div class="reporting-manager">
                  {{
                    item.reporting_manager == "N/A" ||
                    item.reporting_manager == null
                      ? "-"
                      : item.reporting_manager
                  }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:[`item.deactivated_on`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2"
                >mdi-calendar-remove</v-icon
              >
              <span class="font-weight-medium text-body-2">
                {{ fetch_value(item.deactivated_on) }}
              </span>
            </div>
          </template>

          <template v-slot:[`item.relieving_date`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2"
                >mdi-calendar-clock</v-icon
              >
              <div class="d-flex align-center">
                <span class="font-weight-medium text-body-2 mr-2">
                  {{
                    item.relieving_date != undefined
                      ? fetch_value(item.relieving_date)
                      : "-"
                  }}
                </span>
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click.stop="get_relived_on(item)"
                  class="cursor-pointer"
                >
                  <v-icon size="16">mdi-pencil</v-icon>
                </v-btn>
              </div>
            </div>
          </template>

          <template v-slot:[`item.user_status`]="{ item }">
            <div class="status-cell">
              <div
                class="status-tag"
                :class="getStatusTagClass(item.user_status)"
              >
                <div class="status-icon">
                  <v-icon
                    size="16"
                    :color="getStatusIconColor(item.user_status)"
                  >
                    {{
                      item.user_status == "JOINED"
                        ? "mdi-check-circle"
                        : item.user_status == "INVITED"
                        ? "mdi-clock"
                        : "mdi-close-circle"
                    }}
                  </v-icon>
                </div>
                <div class="status-text">
                  {{
                    item.user_status == "JOINED"
                      ? "Active"
                      : item.user_status == "INVITED"
                      ? "Invited"
                      : item.user_status == "REMOVED"
                      ? "Inactive"
                      : item.user_status
                  }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:[`item.action`]="{ item }">
            <div class="action-cell">
              <v-btn
                v-show="
                  item.user_id != $store.getters.GetUserObj.user.user_id &&
                  item.user_type != 'OWNER' &&
                  item.user_status != 'REMOVED'
                "
                icon
                size="small"
                variant="text"
                color="red"
                @click.stop="remove_user(item)"
              >
                <v-icon size="18">mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              !tableData || tableData.length === 0
                ? "No Results"
                : `Showing ${Math.min(
                    itemsPerPage,
                    tableData.length - (currentPage - 1) * itemsPerPage
                  )} of ${tableData.length} members`
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
      <ViewDetails
        :viewDetailsDialog="viewDetailsDialog"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="call_teams()"
      />
    </div>

    <div v-if="componentCheck == 4">
      <AddMember
        :addmember="addmember"
        @clicked="addmember = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 5">
      <RemoveMember
        :memberRemove="memberRemove"
        @clicked="memberRemove = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 6">
      <EditRelevingDate
        :relivedDilaog="relivedDilaog"
        @clicked="relivedDilaog = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
 <ImagePreviewDialog
  :imagePreviewDialog="imagePreviewDialog"
    :selectedUserDetail = "selectedUserDetail"
  @close="imagePreviewDialog = false"
/>
  </div>
</template>
<script>
/* eslint-disable */
// Imports
import ChangeDepertment from "@/components/StaticForms/ChangeDepertment.vue";
import ChnageLocation from "@/components/StaticForms/ChnageLocation.vue";
import ChangeRM from "@/components/StaticForms/ChangeRM.vue";
import ChangeDesignation from "@/components/StaticForms/ChangeDesignation.vue";
import RemoveMember from "@/components/StaticForms/RemoveMember.vue";
import AddMember from "@/components/StaticForms/AddMember.vue";
import { list_users } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import AddUser from "@/components/UserDialogs/AddUser.vue";
import EditUser from "@/components/UserDialogs/EditUser.vue";
import ViewDetails from "@/components/UserDialogs/ViewDetails.vue";
import DeleteUser from "@/components/UserDialogs/DeleteUser.vue";
import EditRelevingDate from "@/components/Teams/EditRelevingDate.vue";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import SnackBar from "@/components/SnackBar.vue";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import axios from "axios";
import ImagePreviewDialog from "@/components/Teams/ImagePreviewDialog.vue";

export default {
  // Props
  props: {
    showFilterButton: {
      type: Boolean,
      default: true,
    },
    searchValue: {
      type: String,
      default: "",
    },
  },

  // Components
  components: {
ImagePreviewDialog ,
    AddUser,
    SnackBar,
    EditUser,
    ChangeDepertment,
    DeleteUser,
    ChangeRM,
    AddMember,
    RemoveMember,
    ChangeDesignation,
    ChnageLocation,
    ViewDetails,
    EditRelevingDate,
  },

  // Mixins
  mixins: [get_department_details, get_location_details, get_all_org_users],

  // Emits
  emits: ["filter-button-click", "active-filters-count", "search-changed"],

  // Data
  data() {
    return {
      // Array properties
      imagePreviewDialog:false,
      selectedUserDetail: {},
      tableData: [],
      
      headers: [
        { title: "Profile & Name", key: "full_user_name", sortable: false },
        {
          title: "Date Of Joining/RM",
          key: "date_of_joining",
          sortable: true,
        },
        {
          title: "Mobile Number / Email",
          key: "user_contact_number",
          sortable: false,
        },
        {
          title: "Group",
          key: "department",
          sortable: false,
        },
        {
          title: "Location",
          key: "location",
          sortable: false,
        },
        { title: "Status", key: "user_status", sortable: false },
        {
          title: "Action",
          key: "action",
          sortable: false,
        },
      ],
      remoedheaders: [
        { title: "Profile & Name", key: "full_user_name", sortable: false },
        // {
        //   title: "Email",
        //   key: "user_email_id",
        //   sortable: false,
        // },
        {
          title: "Group",
          key: "department",
          sortable: false,
        },
        {
          title: "Mobile Number",
          key: "user_contact_number",
          sortable: false,
        },
        {
          title: "Location",
          key: "location",
          sortable: false,
        },
        { title: "Status", key: "user_status", sortable: false },
        {
          title: "Deactivated On",
          key: "deactivated_on",
          sortable: false,
        },
        {
          title: "Relived On",
          key: "relieving_date",
          sortable: false,
        },
      ],
      groupList: [],
      locationRecords: [],
      userArray: [],
      allUsersList: [],
      finalArray: [],

      // Object properties
      SnackBarComponent: {},
      rowInfo: {},

      // String properties
      search: "",
      selectStatusType: "ACTIVE",
filterByGroups: [],
      filterBy: "",
      searchNum: "",
      userMobNumSelect: "",
      searchEmail: "",

      // Array properties for member_id filter
      memberIdOptions: [],
      userEmailSelect: "",
      searachByFilter: "",
      userselect: "",
      searchF: "",
      reportingName: "",
      memberIdSelect: "",

      // Boolean properties
      tableLoading: false,
      locationChange: false,
      depertmentchange: false,
      addDialog: false,
      addmember: false,
      designationChange: false,
      changeManger: false,
      memberRemove: false,
      editDialog: false,
      deleteDialog: false,
      viewDetailsDialog: false,
      relivedDilaog: false,
      goLoading: false,
      fixed: true,
      showFilterDrawer: false,

      // Number properties
      componentCheck: 0,
      itemsPerPage: 20,
      totalItems: 0,
      currentPage: 1,
      height: 0,

      // Null properties
      nextToken: null,
    };
  },

  // Lifecycle hooks
  created() {
    this.height = window.innerHeight - 250;
    // Ensure tableData is initialized as an array
    if (!Array.isArray(this.tableData)) {
      this.tableData = [];
    }
  },

  async mounted() {
    await this.get_users();
    this.allUsersList = [];
    this.$store.commit("Setnamesearch", "");
    await this.get_all_org_users();
    this.fetch_user_list();
    await this.get_location_details();
    await this.get_department_details();
    await this.fetch_details();
  },

  // Watchers
  watch: {
    searchValue: {
      handler(newValue) {
        this.search = newValue;
        // Reset to first page when search changes
        this.currentPage = 1;
        // Emit search change to parent
        this.$emit("search-changed", newValue);
        // Trigger search if search value is 3 or more characters
        if (newValue && newValue.length >= 3) {
          this.performSearch(newValue);
        } else if (!newValue || newValue.length === 0) {
          // If search is cleared, reload all data
          this.resetSearch();
        }
      },
      immediate: true,
    },
    selectStatusType: {
      handler(newValue) {
        // Clear any existing filter selections that depend on userArray first
        this.clearUserDependentFilters();
        // Reset userArray when status filter changes
        this.$nextTick(() => {
          this.resetUserArray();
        });
      },
      immediate: true,
    },
    search() {
      // Reset to first page when search changes
      this.currentPage = 1;
    },
    currentPage(newVal) {
      // When the page changes, scroll to top of table (optional)
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });

      // Debug pagination
      // console.log('Page changed to:', newVal);
      //  console.log('Total items:', this.tableData.length);
    },
    pageCount(newCount) {
      // Ensure currentPage doesn't exceed the new page count
      if (this.currentPage > newCount && newCount > 0) {
        this.currentPage = newCount;
      } else if (newCount === 0) {
        this.currentPage = 1;
      }
    },
    tableData: {
      handler(newVal) {
        // Ensure tableData is always an array
        if (!Array.isArray(newVal)) {
          this.tableData = [];
        }
      },
      deep: true,
      immediate: true,
    },
    userArray: {
      handler(newVal) {
        // Populate member_id options when userArray changes (status filter applied)
        if (newVal && newVal.length > 0) {
          this.populateMemberIdOptions();
        }
      },
      deep: true,
      immediate: false,
    },
    activeFiltersCount: {
      handler(newCount) {
        this.$emit("active-filters-count", newCount);
      },
      immediate: true,
    },

    memberIdSelect: {
      handler(newValue) {
        if (newValue !== undefined) {
          this.applyMemberIdSelectFilter();
        }
      },
      immediate: false,
    },
  },

  // Computed properties
  computed: {
    pageCount() {
      if (!this.tableData || !Array.isArray(this.tableData)) {
        return 0;
      }
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
    activeFiltersCount() {
      let count = 0;

      // Count status filter (if not default)
      if (this.selectStatusType && this.selectStatusType !== "ACTIVE") {
        count++;
      }

      // Count filter by selection
      if (this.filterBy && this.filterBy !== "") {
        count++;
      }

      // Count groups filter
if (this.filterByGroups && this.filterByGroups.length > 0) {
          count++;
      }

      // Count locations filter
      if (this.filterByLocations && this.filterByLocations !== "") {
        count++;
      }

      // Count member_id filter
      if (this.memberIdSelect && this.memberIdSelect !== "") {
        count++;
      }

      // Count user filter selection
      if (this.searachByFilter && this.searachByFilter !== "") {
        count++;
      }

      // Count email search
      if (this.userEmailSelect && this.userEmailSelect !== "") {
        count++;
      }

      // Count name search
      if (this.userselect && this.userselect !== "") {
        count++;
      }

      // Count mobile number search
      if (this.userMobNumSelect && this.userMobNumSelect !== "") {
        count++;
      }

      // Count reporting manager search
      if (this.reportingName && this.reportingName !== "") {
        count++;
      }

      return count;
    },
  },

  // Methods
  methods: {
    openImagePreview(item){
      this.selectedUserDetail = item;
      this.imagePreviewDialog = true
    },
    formatDate(date) {
      return formatdisplayDate(date);
    },
    // Search methods
    async performSearch(searchTerm) {
      try {
        this.tableLoading = true;
        this.tableData = [];
        this.nextToken = null;
        this.currentPage = 1;

        // Update the search term for the API call
        this.userselect = searchTerm;

        // Call the API with search
        await this.get_users();
      } catch (error) {
        console.error("Search error:", error);
        this.tableLoading = false;
      }
    },

    async resetSearch() {
      try {
        this.tableLoading = true;
        this.tableData = [];
        this.nextToken = null;
        this.currentPage = 1;
        this.userselect = "";

        // Reload all data without search
        await this.get_users();
      } catch (error) {
        console.error("Reset search error:", error);
        this.tableLoading = false;
      }
    },

    // Data fetching methods
    async get_users() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_users, {
            organization_id: data.organization.organization_id,
            user_status: this.selectStatusType,
            user_type: "MEMBER",
            name_search: this.userselect,
            user_email_id:
              this.userEmailSelect == "" ? undefined : this.userEmailSelect,
            user_contact_number:
              this.userMobNumSelect == "" ? undefined : this.userMobNumSelect,
            limit: 1000,
            nextToken: this.nextToken,
            reporting_manager: this.reportingName,
            member_id:
              this.memberIdSelect == "" ? undefined : this.memberIdSelect,
          })
        );
        this.tableLoading = false;
        var dataArray = [];
        var response = result.data.list_users;
        dataArray = result.data.list_users.details;
        this.totalItems = result.data.list_users.length;
        this.nextToken = result.data.list_users.nextToken;

        // Ensure tableData is always an array
        if (!Array.isArray(this.tableData)) {
          this.tableData = [];
        }

        // Replace tableData instead of concatenating to avoid duplicates
        if (this.nextToken) {
          // If there's a nextToken, we're loading more data
          this.tableData = this.tableData.concat(dataArray);
        } else {
          // If no nextToken, replace the data completely
          this.tableData = dataArray;
        }

        // Remove duplicates and sort
        const uniqueArrayOfObjects = this.tableData.filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o.user_id === obj.user_id)
        );
        this.tableData = uniqueArrayOfObjects;

        // Filter out users with invalid member_id values
        // this.tableData = this.tableData.filter(item =>
        //   item.member_id &&
        //   item.member_id !== 'N/A' &&
        //   item.member_id !== 'undefined' &&
        //   item.member_id !== 'null'
        // );

        this.tableData.sort((a, b) => {
          return a.full_user_name.localeCompare(b.full_user_name);
        });

        this.finalArray = this.tableData;

        // Debug pagination
        // console.log('=== ALL TEAMS PAGINATION TEST ===');
        // console.log('Total items loaded:', this.tableData.length);
        // console.log('Items per page:', this.itemsPerPage);
        // console.log('Page count:', this.pageCount);
        // console.log('Current page:', this.currentPage);

        // Reset to first page when new data is loaded
        this.currentPage = 1;
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

    fetch_user_list() {
      this.allUsersList = this.orgUsers;
      // Reset userArray based on current status filter
      this.resetUserArray();
    },

    fetch_details() {
      this.groupList = [];
      this.locationRecords = [];
      this.departmentList.forEach((element) => {
        this.groupList.push({
          title: element.department_name,
          value: element.department_name,
        });
      });

      this.locationList.forEach((element) => {
        this.locationRecords.push({
          title: element.location_name,
          value: element.location_name,
        });
      });
    },

    // Filtering methods
    clearUserDependentFilters() {
      // Clear filter selections that depend on userArray
      this.userEmailSelect = "";
      this.userselect = "";
      this.userMobNumSelect = "";
      this.reportingName = "";
      this.searachByFilter = "";

      // Clear search inputs for autocomplete fields
      this.searchEmail = "";
      this.searchF = "";
      this.searchNum = "";

      // Force UI update by temporarily clearing userArray
      this.userArray = [];
    },

    resetUserArray() {
      // Ensure userArray is completely cleared first
      this.userArray = [];

      // Add a small delay to ensure UI clears properly
      this.$nextTick(() => {
        if (this.selectStatusType == "ACTIVE") {
          this.allUsersList.forEach((element) => {
            // Filter out users with invalid member_id values
            if (
              element.user_status === "ACTIVE" &&
              element.user_type !== "CHATBOT" &&
              element.member_id &&
              element.member_id !== "N/A" &&
              element.member_id !== "undefined" &&
              element.member_id !== "null"
            ) {
              this.userArray.push({
                full_user_name: element.full_user_name,
                user_id: element.full_user_name,
                member_id: element.member_id,
                email_id: element.user_email_id,
                contact_number: element.user_contact_number,
                contact_number_key:
                  element.user_country_code + " " + element.user_contact_number,
                selected_user_id: element.user_id,
              });
            }
          });
        } else if (this.selectStatusType == "DEACTIVE") {
          this.allUsersList.forEach((element) => {
            // Filter out users with invalid member_id values
            if (
              element.user_status === "DEACTIVE" &&
              element.user_type !== "CHATBOT" &&
              element.member_id &&
              element.member_id !== "N/A" &&
              element.member_id !== "undefined" &&
              element.member_id !== "null"
            ) {
              this.userArray.push({
                full_user_name: element.full_user_name,
                user_id: element.full_user_name,
                member_id: element.member_id,
                selected_user_id: element.user_id,
                email_id: element.user_email_id,
                contact_number: element.user_contact_number,
                contact_number_key:
                  element.user_country_code + " " + element.user_contact_number,
              });
            }
          });
        } else if (this.selectStatusType == "INVITED") {
          this.allUsersList.forEach((element) => {
            // Filter out users with invalid member_id values
            if (
              element.user_status === "INVITED" &&
              element.user_type !== "CHATBOT" &&
              element.member_id &&
              element.member_id !== "N/A" &&
              element.member_id !== "undefined" &&
              element.member_id !== "null"
            ) {
              this.userArray.push({
                full_user_name: element.full_user_name,
                user_id: element.full_user_name,
                email_id: element.user_email_id,
                member_id: element.member_id,
                selected_user_id: element.user_id,
                contact_number: element.user_contact_number,
                contact_number_key:
                  element.user_country_code + " " + element.user_contact_number,
              });
            }
          });
        } else {
          // For "ALL" status, include all users except CHATBOT and those with invalid member_id
          this.allUsersList.forEach((element) => {
            if (
              element.user_type !== "CHATBOT" &&
              element.member_id &&
              element.member_id !== "N/A" &&
              element.member_id !== "undefined" &&
              element.member_id !== "null"
            ) {
              this.userArray.push({
                full_user_name: element.full_user_name,
                user_id: element.full_user_name,
                email_id: element.user_email_id,
                member_id: element.member_id,
                selected_user_id: element.user_id,
                contact_number: element.user_contact_number,
                contact_number_key:
                  element.user_country_code + " " + element.user_contact_number,
              });
            }
          });
        }
      });
    },

    fetch_user_filter_actions() {
      // Reset userArray based on current status type
      this.resetUserArray();

      // Then clear the appropriate filter values based on selected filter
      if (this.searachByFilter == "filterByName") {
        this.userEmailSelect = "";
        this.userMobNumSelect = "";
        this.reportingName = "";
        this.memberIdSelect = "";
      } else if (this.searachByFilter == "filterByEmail") {
        this.userselect = "";
        this.userMobNumSelect = "";
        this.reportingName = "";
        this.memberIdSelect = "";
      } else if (this.searachByFilter == "filterByMobNum") {
        // Filter out users with N/A contact numbers for mobile number search
        this.userArray = this.userArray.filter(
          (item) => item.contact_number !== "N/A" && item.contact_number !== ""
        );

        this.userselect = "";
        this.userEmailSelect = "";
        this.reportingName = "";
        this.memberIdSelect = "";
      } else if (this.searachByFilter == "filterByReportingManager") {
        this.userselect = "";
        this.userEmailSelect = "";
        this.userMobNumSelect = "";
        this.memberIdSelect = "";
      } else if (this.searachByFilter == "filterByMemberId") {
        this.userselect = "";
        this.userEmailSelect = "";
        this.userMobNumSelect = "";
        this.reportingName = "";
      }
    },

    async filter_data() {
      this.tableData = [];
      this.nextToken = null;
      this.currentPage = 1;
      this.$emit("selectedData", this.selectStatusType);

      await this.get_users();
      if (this.filterBy != "") {
        if (this.filterBy == "groups" && this.filterByGroups != "") {
          await this.fetch_group_input();
        } else if (this.filterBy != "groups" && this.filterByLocations != "") {
          await this.fetch_group_input();
        }
      }
    },

    fetch_group_input() {
  if (this.filterBy == "groups") {
    if (!this.filterByGroups || this.filterByGroups.length === 0) {
      this.tableData = this.finalArray;
    } else {
      this.tableData = this.finalArray.filter((obj) =>
        this.filterByGroups.includes(obj.department)
      );
    }

    this.$emit("groupName", this.filterByGroups);
  } else {
    this.tableData = this.finalArray.filter(
      (obj) => obj.location === this.filterByLocations
    );

    this.$emit("locaName", this.filterByLocations);
  }

  this.currentPage = 1;
},

    // UI interaction methods
    get_fetch_data(value) {
      this.resetUserArray();
    },

    call_teams() {
      this.viewDetailsDialog = false;
      this.rowInfo = {};
      this.tableData = [];
      this.get_users();
    },

    handle_row_click(click, val) {
      this.componentCheck = 1;
      this.viewDetailsDialog = true;
      this.$store.commit("SetUserEmailTeam", val.item.user_email_id);
      this.rowInfo = val.item;
    },

    add_members() {
      this.addmember = true;
      this.componentCheck = 4;
    },

    remove_user(item) {
      this.memberRemove = true;
      this.rowInfo = item;
      this.componentCheck = 5;
    },

    get_relived_on(item) {
      this.componentCheck = 6;
      this.rowInfo = item;
      this.relivedDilaog = true;
    },

    clear_data() {
      this.selectStatusType = "ACTIVE";
      this.filterByGroups = "";
      this.filterBy = "";
      this.searachByFilter = "";
      this.searchNum = "";
      this.userMobNumSelect = "";
      this.searchEmail = "";
      this.userselect = "";
      this.reportingName = "";
      this.userEmailSelect = "";

      this.memberIdSelect = "";
      this.get_fetch_data();
      this.tableData = [];
      this.nextToken = null;
      this.currentPage = 1;
      this.get_users();
    },

    // Filter drawer methods
    openFilterDrawer() {
      this.showFilterDrawer = true;
      this.$emit("filter-button-click");
    },

    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },

    applyFilterFromDrawer() {
      // Apply the filter and close the drawer
      this.filter_data();
      this.closeFilterDrawer();
    },

    // Pagination methods
    loadMoreData() {
      if (this.nextToken) {
        this.get_users();
      }
    },

    // Action methods
    add_data() {
      this.componentCheck = 1;
      this.addDialog = true;
    },

    edit_action(item, action) {
      this.$store.commit("SetUserEmailTeam", item.user_email_id);
      this.actionItem = action;
      this.componentCheck = 2;
      this.editDialog = true;
      this.rowInfo = item;
    },

    delete_action(item) {
      this.componentCheck = 3;
      this.rowInfo = item;
      this.deleteDialog = true;
    },

    // Dialog methods
    close_dialog(val) {
      if (val == 0) {
        this.addDialog = false;
        this.editDialog = false;
        this.deleteDialog = false;
      } else if (val == 1) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Please Provide Details",
          timeout: 5000,
          Top: true,
        };
      } else if (val == 2) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Invalid Email",
          timeout: 5000,
          Top: true,
        };
      } else if (val == 3) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "User Created Successfully",
          timeout: 5000,
          Top: true,
        };

        this.addDialog = false;
      }
    },

    // Utility methods
    fetch_conatct_number(value) {
      // Placeholder for contact number formatting
    },

    fetch_value(val) {
      if (val != null) {
        let a = val.toString();

        const d = new Date(
          a.length == 13 ? parseInt(val) : parseInt(val) * 1000
        );
        var date = d.getDate().toLocaleString();
        var month = (d.getMonth() + 1).toLocaleString();
        var year = d.getFullYear();
        var dateValue =
          (+date <= 9 ? "0" + date : date) +
          "/" +
          (+month <= 9 ? "0" + month : month) +
          "/" +
          year;

        return dateValue;
      }
    },

    // UI Helper methods
    getStatusTagClass(status) {
      if (status === "JOINED") return "status-active";
      if (status === "INVITED") return "status-invited";
      return "status-inactive";
    },

    getStatusIconColor(status) {
      if (status === "JOINED") return "white";
      if (status === "INVITED") return "white";
      return "white";
    },

    getDepartmentTagClass(department) {
      if (department === "N/A" || !department) return "department-empty";
      if (department === "Menthum") return "department-menthum";
      if (department.includes("Group")) return "department-group";
      return "department-default";
    },

    applyMemberIdSelectFilter() {
      // Since member_id filter is now applied at API level, we just need to refresh the data
      this.get_users();
    },

    populateMemberIdOptions() {
      // Clear existing options
      this.memberIdOptions = [];

      // Add "All" option
      this.memberIdOptions.push({
        title: "All Member IDs",
        value: "",
      });

      // Add unique member_ids from userArray (status-filtered), excluding N/A, undefined, and null
      if (this.userArray && this.userArray.length > 0) {
        const uniqueMemberIds = [
          ...new Set(
            this.userArray
              .filter(
                (item) =>
                  item.member_id &&
                  item.member_id !== "N/A" &&
                  item.member_id !== "undefined" &&
                  item.member_id !== "null"
              )
              .map((item) => item.member_id)
          ),
        ].sort();

        uniqueMemberIds.forEach((memberId) => {
          this.memberIdOptions.push({
            title: `Member ID: ${memberId}`,
            value: memberId,
          });
        });
      }

      // Debug logging
      // console.log('populateMemberIdOptions called');
      // console.log('userArray length:', this.userArray ? this.userArray.length : 0);
      // console.log('memberIdOptions length:', this.memberIdOptions.length);
      // console.log('memberIdOptions:', this.memberIdOptions);
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
      this.memberRemove = false;
      this.addmember = false;
      this.addDialog = false;
      this.depertmentchange = false;
      this.designationChange = false;
      this.locationChange = false;
      this.changeManger = false;
      this.memberRemove = false;
      this.editDialog = false;
      this.deleteDialog = false;
      this.relivedDilaog = false;
      this.get_users();
    },
  },
};
</script>

<style scoped>
/* Filter Container Styles */
.filter-container {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.search-row {
  flex: 1;
  max-width: 400px;
}

.search-field {
  width: 100%;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* Filter Button Styles */
.filter-drawer-btn {
  background: #e91e63 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3) !important;
  transition: all 0.3s ease !important;
}

.filter-drawer-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4) !important;
}

.filter-drawer-btn.active {
  background: #c2185b !important;
  box-shadow: 0 2px 8px rgba(194, 24, 91, 0.3) !important;
}

.filter-drawer-btn.active:hover {
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.4) !important;
}

/* Card Actions Button */
.cardCss {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3) !important;
  transition: all 0.3s ease !important;
}

.cardCss:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
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
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-row {
    max-width: none;
  }

  .filter-actions {
    justify-content: center;
  }
}
.cursor-pointer {
  cursor: pointer;
}

.user-avatar-img:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}
</style>
