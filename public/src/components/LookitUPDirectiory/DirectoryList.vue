<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <!-- App Bar -->
    <v-app-bar class="modern-header-section" v-if="componentCheck === 0">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-folder-multiple</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Directory</span>
          <span class="header-subtitle">Manage your directories and forms</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Search Field -->
        <div v-if="directoryToggle === 'subscribed'" class="search-container">
          <v-text-field
            v-model="tableSearch"
            placeholder="Search directories..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
            clearable
            @update:model-value="tableSearch = $event"
          />
        </div>

        <!-- Action Buttons -->
        <v-btn
          v-if="directoryToggle === 'subscribed'"
          @click="create_directory()"
          class="action-btn"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create</span>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar
      flat
      class="mt-n10"
      style="background-color: white"
      v-if="componentCheck === 0"
    >
      <template v-slot:extension>
        <v-tabs v-model="directoryToggle" mandatory class="modern-tab-toggle">
          <v-tab value="subscribed" class="tab-btn">
            Subscribed Directories
          </v-tab>
          <v-tab value="all" class="tab-btn"> Other Directories </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <!-- Main Directory List View - Show when componentCheck is 0 -->
    <div v-if="componentCheck === 0">
      <div class="card-container" style="position: relative">
        <v-card flat class="ma-2">
          <!-- Data Table -->
          <v-card-text class="pa-4" v-if="directoryToggle === 'subscribed'">
            <v-data-table
              :headers="adminHeaders"
              :items="paginatedItems"
              :loading="tableLoading"
              :sort-by="['directory_name']"
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
                    >mdi-folder-multiple</v-icon
                  >
                  <div class="text-h6 text-grey mb-2">No Directories Found</div>
                  <div class="text-body-2 text-grey">
                    Try adjusting your search criteria or create a new
                    directory.
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
                  <div class="text-body-2 text-grey">
                    Loading directories...
                  </div>
                </div>
              </template>

              <!-- Directory Name -->
              <template v-slot:[`item.directory_name`]="{ item }">
                <div class="d-flex align-center">
                  <v-tooltip
                    v-if="item.directory_visibility_type === 'ALL_MEMBERS'"
                    location="bottom"
                  >
                    <template #activator="{ props }">
                      <v-icon
                        small
                        :color="getIconColor(item.directory_visibility_type)"
                        v-bind="props"
                        class="mr-2"
                      >
                        {{
                          item.directory_visibility_type === "ALL_MEMBERS"
                            ? "mdi-lock-open"
                            : "mdi-lock-off"
                        }}
                      </v-icon>
                    </template>
                    <span>Open</span>
                  </v-tooltip>
                  <v-tooltip v-else location="bottom">
                    <template #activator="{ props }">
                      <v-icon
                        dense
                        small
                        :color="getIconColor(item.directory_visibility_type)"
                        v-bind="props"
                        class="mr-2"
                      >
                        {{
                          item.directory_visibility_type === "ALL_MEMBERS"
                            ? "mdi-lock-open"
                            : "mdi-lock-off"
                        }}
                      </v-icon>
                    </template>
                    <span>Restricted</span>
                  </v-tooltip>
                  <span class="caption font-weight-medium">{{
                    item.directory_name
                  }}</span>
                  <v-icon
                    dense
                    color="primaryColor"
                    small
                    class="ml-2"
                    v-if="
                      item.directory_created_by ==
                      $store.getters.GetUserObj.user.user_email_id
                    "
                    >mdi-account</v-icon
                  >
                </div>
              </template>

              <!-- Directory Entries -->
              <template v-slot:[`item.directory_entries`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="primary" class="mr-2">mdi-file-document-multiple</v-icon> -->
                  <span class="caption font-weight-medium">{{
                    item.directory_entries || 0
                  }}</span>
                </div>
              </template>

              <!-- Directory Subscriber Count -->
              <template v-slot:[`item.directory_subscriber_count`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="primary" class="mr-2">mdi-account-group</v-icon> -->
                  <span class="caption font-weight-medium">{{
                    item.directory_subscriber_count || 0
                  }}</span>
                </div>
              </template>

              <!-- Created On -->
              <template v-slot:[`item.directory_created_on`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="primary" class="mr-2">mdi-calendar</v-icon> -->
                  <span class="caption font-weight-medium">{{
                    get_date(item.directory_created_on)
                  }}</span>
                </div>
              </template>

              <!-- Created By -->
              <template v-slot:[`item.directory_created_by`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="primary" class="mr-2">mdi-account</v-icon> -->
                  <span class="caption font-weight-medium">{{
                    fethc_names(item.directory_created_by)
                  }}</span>
                </div>
              </template>

              <!-- Actions -->
              <template v-slot:[`item.Actions`]="{ item }">
                <div class="d-flex align-center">
                  <v-tooltip
                    location="top"
                    v-if="
                      item.directory_created_by ==
                      $store.getters.GetUserObj.user.user_email_id
                    "
                  >
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="small"
                        color="red"
                        class="mr-2"
                        @click.stop="directory_delete(item)"
                      >
                        mdi-delete
                      </v-icon>
                    </template>
                    <span>Delete Directory</span>
                  </v-tooltip>
                  <v-tooltip
                    location="top"
                    v-if="
                      item.directory_created_by ==
                      $store.getters.GetUserObj.user.user_email_id
                    "
                  >
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="small"
                        color="primaryColor"
                        @click.stop="directory_transfer_ownership(item)"
                      >
                        mdi-swap-horizontal-bold
                      </v-icon>
                    </template>
                    <span>Transfer Ownership</span>
                  </v-tooltip>
                  <span
                    v-if="
                      item.directory_created_by !=
                      $store.getters.GetUserObj.user.user_email_id
                    "
                    class="caption grey--text"
                    >-</span
                  >
                </div>
              </template>
            </v-data-table>

            <!-- Modern Table Footer -->
            <div class="table-footer" v-if="directoryToggle === 'subscribed'">
              <div class="footer-info">
                {{
                  totalCount === 0
                    ? "No Results"
                    : `Showing ${paginatedItems.length} of ${totalCount} directories`
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
                <div class="page-numbers" v-if="pageCount > 1">
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
      </div>

      <!-- Other Directories Section -->
      <div class="text-left" v-if="directoryToggle === 'all'">
        <OrganizationDirectories />
      </div>
    </div>

    <!-- Popup Components -->
    <div v-if="componentCheck == 2">
      <DirectoryDetails
        :formInfo="formInfo"
        :initialCreation="initialCreation"
        v-on:directoryemit="directory_back_action"
      />
    </div>
    <div v-if="componentCheck == 1">
      <CreateDirectoryDialog
        :createPopup="createPopup"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:successResponse="success_data"
        @clicked="
          () => {
            createPopup = false;
            componentCheck = 0;
          }
        "
      />
    </div>
    <div v-if="componentCheck == 3">
      <FormSelectionView
        :formInfo="formInfo"
        :formSelectionDialog="formSelectionDialog"
        v-on:customSelected="custom_form_selected"
        @clicked="
          () => {
            formSelectionDialog = false;
            componentCheck = 0;
          }
        "
      />
    </div>
    <div v-if="componentCheck == 4">
      <DirectoryDelete
        :rowInfo="rowInfo"
        :deleteDirectoryDialog="deleteDirectoryDialog"
        v-on:successMsg="success_info"
        v-on:errorMsg="error_info"
        @clicked="
          () => {
            deleteDirectoryDialog = false;
            componentCheck = 0;
          }
        "
      />
    </div>
    <div v-if="componentCheck == 5">
      <TransferOwnership
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
        :allusers="allusers"
        :tranferOwnerDialog="tranferOwnerDialog"
        v-on:errorMsg="error_info"
        @clicked="
          () => {
            tranferOwnerDialog = false;
            componentCheck = 0;
          }
        "
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import CreateDirectoryDialog from "@/components/LookitUPDirectiory/AllDialogs/CreateDirectoryDialog.vue";
import DirectoryDetails from "@/components/LookitUPDirectiory/DirectoryDetails.vue";
import FormSelectionView from "@/components/LookitUPDirectiory/AllDialogs/FormSelectionView.vue";
import DirectoryDelete from "@/components/LookitUPDirectiory/AllDialogs/DirectoryDelete.vue";
import TransferOwnership from "@/components/LookitUPDirectiory/AllDialogs/TransferOwnership.vue";
import OrganizationDirectories from "@/components/LookitUPDirectiory/OrganizationDirectories.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import html2canvas from "html2canvas";
import {
  list_user_sub_directories,
  list_Directory_forms,
} from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    CreateDirectoryDialog,
    SnackBar,
    DirectoryDetails,
    FormSelectionView,
    DirectoryDelete,
    TransferOwnership,
    OrganizationDirectories,
    CreateExternalTicketDialog,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      adminHeaders: [
        // { text: "Sl.No", value: "Sl.No", sortable: false },
        { title: "Name", key: "directory_name", sortable: false },
        { title: "#Entries", key: "directory_entries", sortable: false },
        { title: "#Subs", key: "directory_subscriber_count", sortable: false },
        { title: "Created On", key: "directory_created_on", sortable: false },
        { title: "Created By", key: "directory_created_by", sortable: false },
        { title: "Actions", key: "Actions", sortable: false },
      ],
      tableData: [],
      teamLoading: false,
      createPopup: false,
      componentCheck: 0,
      SnackBarComponent: {},
      tableLoading: false,
      initialCreation: 0,
      formInfo: {},
      formSelectionDialog: false,
      createdDireID: {},
      deleteDirectoryDialog: false,
      rowInfo: {},
      tableSearch: "",
      tranferOwnerDialog: false,
      allusers: [],
      directoryToggle: "subscribed",
      cardHeight: 0,
      currentPage: 1,
      itemsPerPage: 10,
      windowHeight: 0,
      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  async created() {
    this.allusers = [];
    this.$store.commit("SetDirectoryForm", false);
    this.$store.commit("SetformLibrary", false);
    this.$store.commit("SetVisitorFormEnabled", false);
    this.$store.commit("SetVisitorFormEdit", false);
    this.$store.commit("SetFormName", "");
    this.$store.commit("SetFormObj", {});
    this.$store.commit("Setnamesearch", "");

    await this.fetch_directories();
    await this.get_all_org_users();
    this.allusers = this.orgUsers;
  },

  mounted() {
    this.windowHeight = window.innerHeight - 260;
    this.cardHeight = window.innerHeight - 200;
  },
  methods: {
    create_directory() {
      this.createPopup = true;
      this.componentCheck = 1;
    },

    getIconColor(visibilityType) {
      return visibilityType === "ALL_MEMBERS" ? "green" : "red";
    },

    fethc_names(value) {
      var name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },

    get_date(val) {
      return format_Date(val);
      // const d = new Date(parseInt(val) * 1000);
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
    },

    directory_back_action() {
      this.componentCheck = 0;
      this.$store.commit("SetDirectoryForm", false);
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetVisitorFormEnabled", false);
      this.$store.commit("SetVisitorFormEdit", false);
      this.$store.commit("SetFormName", "");
      this.$store.commit("SetFormObj", {});
      this.fetch_directories();
    },

    handle_row_click(click, value) {
      if (
        value.item.is_directory_enabled_as_extrenal_form != undefined &&
        value.item.is_directory_enabled_as_extrenal_form != false
      ) {
        this.$store.commit("SetExternalForm", true);
      } else {
        this.$store.commit("SetExternalForm", false);
      }
      this.initialCreation = 0;
      this.$store.commit("SetDirectoryForm", true);
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetVisitorFormEnabled", false);
      this.$store.commit("SetVisitorFormEdit", false);
      this.$store.commit("SetCustomFormDesign", false);
      this.$store.commit("SetFormName", value.item.directory_name);
      this.$store.commit("SetFormObj", value.item);
      this.componentCheck = 2;
      this.formInfo = value.item;
      // this.initialCreation = 0;
      // this.$store.commit("SetDirectoryForm", true);
      // this.$store.commit("SetformLibrary", false);
      // this.$store.commit("SetFormName", value.directory_name);
      // this.$store.commit("SetFormObj", value);
      // this.componentCheck = 2;
      // this.formInfo = value;

      // this.$router.push("/DirectoryDetails");
    },

    async fetch_directories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_user_sub_directories, {
            input: {
              user_email_id: data.user.user_email_id,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        let serialNumber = 1;
        var response = JSON.parse(result.data.list_user_sub_directories);

        if (response.Status == "SUCCESS") {
          this.tableData = response.Data;
          this.tableData.forEach((obj) => {
            obj.serial_number = serialNumber++;
          });
        }
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

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createPopup = false;
      this.deleteDirectoryDialog = false;
      this.tranferOwnerDialog = false;
      this.componentCheck = 0;
      await this.fetch_directories();

      // this.fetch_directories();
    },

    success_data(value) {
      // console.log(value);
      // this.componentCheck = 3;
      // this.formSelectionDialog = true;
      this.formInfo = value;
      this.$store.commit("SetDirectoryForm", true);
      this.$store.commit("SetformLibrary", false);
      this.$store.commit("SetVisitorFormEnabled", false);
      this.$store.commit("SetVisitorFormEdit", false);
      this.$store.commit("SetFormName", value.directory_name);
      this.$store.commit("SetFormObj", value);
      this.componentCheck = 2;
      this.initialCreation = 1;
    },

    custom_form_selected(val) {
      this.formSelectionDialog = false;
      if (val == 0) {
        this.componentCheck = 2;
        this.initialCreation = 1;
        // this.$store.commit("SetFormType", "CUSTOM");
      } else {
        this.$store.commit("SetformLibrary", true);
        // this.$store.commit("SetFormType", "DIRECTORYS_LIBRARY");
        this.componentCheck = 2;
        this.initialCreation = 1;
      }
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

    directory_delete(item) {
      // console.log(item);
      this.componentCheck = 4;
      this.deleteDirectoryDialog = true;
      this.rowInfo = item;
    },

    directory_transfer_ownership(item) {
      this.tranferOwnerDialog = true;
      this.componentCheck = 5;
      this.rowInfo = item;
    },
    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
  },
  computed: {
    filteredItems() {
      if (!this.tableSearch || this.tableSearch.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.tableSearch.toLowerCase().trim();
      return this.tableData.filter(
        (directory) =>
          directory.directory_name?.toLowerCase().includes(searchTerm) ||
          this.fethc_names(directory.directory_created_by)
            ?.toLowerCase()
            .includes(searchTerm) ||
          (directory.directory_entries
            ? String(directory.directory_entries)
                .toLowerCase()
                .includes(searchTerm)
            : false) ||
          (directory.directory_subscriber_count
            ? String(directory.directory_subscriber_count)
                .toLowerCase()
                .includes(searchTerm)
            : false)
      );
    },
    totalCount() {
      return this.filteredItems.length;
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
  watch: {
    tableSearch() {
      this.currentPage = 1;
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
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

/* Search Container Styles */
.search-container {
  margin-right: 16px;
  min-width: 200px;
}

.search-field {
  width: 100%;
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

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  color: #666 !important;
}

.tab-btn:hover {
  color: #db4c77 !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Legacy Styles (keeping for compatibility) */
.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
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
  align-items: center;
  min-height: 36px;
}

.active-page {
  background: #db4c77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
  border-radius: 4px !important;
}

.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
  border-radius: 4px !important;
  border: 1px solid #e0e0e0 !important;
  background: white !important;
}

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }

  .search-container {
    min-width: 180px;
  }
}

@media (max-width: 768px) {
  .header-left {
    gap: 12px;
  }

  .header-icon-bg {
    width: 40px;
    height: 40px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }

  .search-container {
    min-width: 160px;
    margin-right: 8px;
  }
}
</style>
