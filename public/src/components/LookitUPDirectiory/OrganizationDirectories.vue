<template>
  <div >
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div >
      <v-card flat class="ma-2" >
        <!-- Top Controls: All in one row -->
        <!-- <v-row
          class="align-center px-6 pt-6 pb-2"
          
        >
          <v-col cols="auto" class="d-flex align-center">
            <v-icon class="mr-3" color="primary" size="large">mdi-folder-multiple</v-icon>
            <span class="font-weight-bold text-h6">Organization Directories ({{ totalCount }})</span>
          </v-col>
          <v-spacer /> -->

          <!-- Search Field -->
          <!-- <v-col cols="auto" class="d-flex align-center">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search directories..."
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
        </v-row> -->

        <!-- Data Table -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="headers"
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
          >
            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-folder-multiple</v-icon>
                <div class="text-h6 text-grey mb-2">No Directories Found</div>
                <div class="text-body-2 text-grey">
                  Try adjusting your search criteria.
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
                <div class="text-body-2 text-grey">Loading directories...</div>
              </div>
            </template>

            <!-- Directory Name -->
            <template v-slot:[`item.directory_name`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="red" class="mr-2">mdi-lock-outline</v-icon> -->
                <span class="caption font-weight-medium">{{ item.directory_name }}</span>
              </div>
            </template>

            <!-- Directory Description -->
            <template v-slot:[`item.directory_description`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2">mdi-text</v-icon> -->
                <span class="caption font-weight-medium">{{ item.directory_description || '-' }}</span>
              </div>
            </template>

            <!-- Directory Entries -->
            <template v-slot:[`item.directory_entries`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2">mdi-file-document-multiple</v-icon> -->
                <span class="caption font-weight-medium">{{ item.directory_entries || 0 }}</span>
              </div>
            </template>

            <!-- Directory Subscriber Count -->
            <template v-slot:[`item.directory_subscriber_count`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2">mdi-account-group</v-icon> -->
                <span class="caption font-weight-medium">{{ item.directory_subscriber_count || 0 }}</span>
              </div>
            </template>

            <template v-slot:[`item.directory_created_on`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2">mdi-calendar</v-icon> -->
                <span class="caption font-weight-medium">{{ get_date(item.directory_created_on) }}</span>
              </div>
            </template>

            <template v-slot:[`item.directory_created_by`]="{ item }">
              <div class="d-flex align-center">
                <!-- <v-icon size="16" color="primary" class="mr-2">mdi-account</v-icon> -->
                <span class="caption font-weight-medium">{{ fethc_names(item.directory_created_by) }}</span>
              </div>
            </template>

            <template v-slot:[`item.Actions`]="{ item }">
              <v-btn
                @click="request_access(item)"
                color="primary"
                class="text-capitalize"
                elevation="0"
                size="small"
              >
                Request Access
              </v-btn>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
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
                style="color: #666 !important;"
              >
                Previous
              </v-btn>
              <div class="page-numbers" v-if="pageCount > 1">
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

    <div v-if="componentCheck == 1">
      <RequestDirectoryAccess
        :rowInfo="rowInfo"
        :requestAccessDialog="requestAccessDialog"
        @clicked="requestAccessDialog = false"
        v-on:successMsg="get_successs_toast"
        v-on:errorMsg="get_error"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { list_Directory_forms } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import RequestDirectoryAccess from "@/components/LookitUPDirectiory/AllDialogs/RequestDirectoryAccess.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    RequestDirectoryAccess,
    SnackBar,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      headers: [
        { title: "Name", key: "directory_name", sortable: false },
        {
          title: "Description",
          key: "directory_description",
          sortable: false,
        },
        { title: "#Entries", key: "directory_entries", sortable: false },
        { title: "#Subs", key: "directory_subscriber_count", sortable: false },
        { title: "Created On", key: "directory_created_on", sortable: false },
        { title: "Created By", key: "directory_created_by", sortable: false },
        { title: "Actions", key: "Actions", sortable: false },
      ],
      tableData: [],
      searchQuery: "",
      tableLoading: false,
      allusers: [],
      componentCheck: 0,
      requestAccessDialog: false,
      rowInfo: {},
      SnackBarComponent: {},
      currentPage: 1,
      itemsPerPage: 20,
      windowHeight: 0,
    };
  },

  async created() {
    this.windowHeight = window.innerHeight - 260;
    this.fetch_all_directories();
    await this.get_all_org_users();
    this.allusers = this.orgUsers;
  },

  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter(directory => 
        directory.directory_name?.toLowerCase().includes(searchTerm) ||
        directory.directory_description?.toLowerCase().includes(searchTerm) ||
        this.fethc_names(directory.directory_created_by)?.toLowerCase().includes(searchTerm)
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
    searchQuery() {
      this.currentPage = 1;
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  methods: {
    async fetch_all_directories() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_Directory_forms, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.list_Directory_forms);
        let restrictedDirectories = [];
        let arraynew = [];
        if (response.Status == "SUCCESS") {
          restrictedDirectories = response.data;
          restrictedDirectories.forEach((element) => {
            if (
              element.directory_visibility_type == "USERS" &&
              element.directory_created_by !=
                this.$store.getters.GetUserObj.user?.user_email_id
            ) {
              arraynew.push(element);
              this.tableData = arraynew.filter(
                (item) =>
                  !item.directory_visibility_users.includes(
                    this.$store.getters.GetUserObj.user?.user_id
                  )
              );
            }
          });
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },

    request_access(item) {
      this.rowInfo = item;
      this.componentCheck = 1;
      this.requestAccessDialog = true;
    },

    get_successs_toast(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.requestAccessDialog = false;
    },

    get_error(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
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
    },
  },
};
</script>

<style scoped>
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

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}
</style>