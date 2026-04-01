<template>
  <div>
    <CreateTicketDialog :DialogCreateTicket="DialogCreateTicket" :screenshot-file="ScreenshotFile"
      :org-details="orgDetails" @clicked="DialogCreateTicketEmit" />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-form-select</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">User Forms </span>
          <span class="header-subtitle">Browse and manage available forms</span>
        </div>
      </div>
      <v-spacer />

      <!-- Search Field in App Bar -->

      <div class="header-search">
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-text-field v-model="searchlist" placeholder="Search forms..." prepend-inner-icon="mdi-magnify" variant="solo"
          hide-details density="compact" class="search-pill" style="
            min-width: 280px;
            max-width: 280px;
            height: 40px;
            border-radius: 8px;
            background: #f8f9fa;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
            font-size: 14px;
          " clearable @click:clear="searchlist = ''" />
      </div>

      <div class="header-actions">
        <v-btn color="primary" class="text-capitalize" @click="back_call()" prepend-icon="mdi-step-backward"
          style="background: #db4c77 !important; color: white !important">
          Back
        </v-btn>
      </div>
    </v-app-bar>

    <v-card flat class="overflow-y-auto mt-10">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table :headers="modernHeaders" :height="windowHeight" :items="paginatedItems"
                :loading="tableLoading" :search="searchlist" :sort-by="['workflow_created_on']"
                :items-per-page="itemsPerPage" :page="currentPage" :server-items-length="totalItems" hide-default-footer
                class="modern-data-table" density="comfortable" hover @click:row="handle_row_click">
                <template #no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-form-select</v-icon>
                    <div class="text-h6 text-grey mb-2">No Forms Found</div>
                    <div class="text-body-2 text-grey">
                      Try adjusting your search criteria.
                    </div>
                  </div>
                </template>

                <template #loading>
                  <div class="text-center py-8">
                    <v-progress-circular indeterminate color="primary" size="32" class="mb-4"></v-progress-circular>
                    <div class="text-body-2 text-grey">Loading forms...</div>
                  </div>
                </template>

                <!-- Created On -->
                <template v-slot:[`item.workflow_created_on`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="grey" class="mr-2">mdi-clock-outline</v-icon> -->
                    <span class="caption">{{
                      fetch_value(item.workflow_created_on)
                    }}</span>
                  </div>
                </template>

                <!-- Deploy Status -->
                <template v-slot:[`item.workflow_deploy_status`]="{ item }">
                  <v-chip v-if="item.workflow_deploy_status == 'DEPLOY'" color="success" size="small" variant="flat"
                    class="text-white">
                    Deployed
                  </v-chip>
                  <v-chip v-else color="error" size="small" variant="flat" class="text-white">
                    Un Deployed
                  </v-chip>
                </template>

                <!-- Workflow Name -->
                <template v-slot:[`item.workflow_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="primary" class="mr-2">mdi-form-textbox</v-icon> -->
                    <span class="caption font-weight-medium">{{
                      item.workflow_name
                    }}</span>
                  </div>
                </template>

                <!-- Workflow Description -->
                <template v-slot:[`item.workflow_description`]="{ item }">
                  <v-tooltip location="top" :disabled="!item.workflow_description ||
                    item.workflow_description.length <= 50
                    ">
                    <template v-slot:activator="{ props }">
                      <div v-bind="props" class="d-flex align-center">
                        <!-- <v-icon size="16" color="grey" class="mr-2">mdi-text</v-icon> -->
                        <span class="caption text-truncate" style="max-width: 300px">
                          {{ item.workflow_description }}
                        </span>
                      </div>
                    </template>
                    <span>{{ item.workflow_description }}</span>
                  </v-tooltip>
                </template>

                <!-- Workflow Speed -->
                <template v-slot:[`item.workflow_speed`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="orange" class="mr-2">mdi-speedometer</v-icon> -->
                    <span class="caption font-weight-medium">{{
                      item.workflow_speed
                    }}</span>
                  </div>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalItems} forms`
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn :disabled="currentPage === 1" variant="text" size="small" class="pagination-btn"
                    @click="currentPage = currentPage - 1" style="color: #666 !important">
                    Previous
                  </v-btn>
                  <div class="page-numbers">
                    <v-btn v-for="page in visiblePages" :key="page"
                      :variant="page === currentPage ? 'elevated' : 'text'" size="small" :class="page === currentPage ? 'active-page' : 'inactive-page'
                        " @click="currentPage = page" :style="page === currentPage
                          ? 'background: #DB4C77 !important; color: white !important;'
                          : 'color: #666 !important;'
                        ">
                      {{ page }}
                    </v-btn>
                  </div>
                  <v-btn :disabled="currentPage === pageCount" variant="text" size="small" class="pagination-btn"
                    @click="currentPage = currentPage + 1" style="color: #666 !important">
                    Next
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card>

    <!-- Dialogs -->
    <div v-if="componentCheck == 1">
      <ViewForm :formDialog="formDialog" :formInfo="formInfo" :formActionType="formActionType"
        v-on:errorMsg="error_info" v-on:successMsg="success_info" v-on:validateData="validate_message"
        @clicked="formDialog = false" />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { format_Date } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import ViewForm from "@/components/UserLevelForms/ViewForm.vue";
import { list_workflow } from "@/graphql/queries.js";
import { getData } from "@/mixins/AllQueries.js";
import CreateTicketDialog from "../Tickets/CreateTicketDialog.vue";
import html2canvas from "html2canvas";

export default {
  components: {
    ViewForm,
    SnackBar,
    CreateTicketDialog,
  },
  mixins: [getData],
  data() {
    return {
      searchlist: "",
      headers: [
        { title: "Name", key: "workflow_name", sortable: false },

        {
          title: "Description",
          key: "workflow_description",
          sortable: false,
        },
        {
          title: "Created On",
          key: "workflow_created_on",
          sortable: false,
        },
        {
          title: "Speed",
          key: "workflow_speed",
          sortable: false,
        },
      ],
      tableData: [],
      tableLoading: false,
      formInfo: {},
      formDialog: false,
      componentCheck: 0,
      formActionType: "initiate",
      SnackBarComponent: {},
      isVisible: false,

      // Pagination properties
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,

      //Screenshot Values
      DialogCreateTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },

  computed: {
    modernHeaders() {
      return [
        { title: "Name", key: "workflow_name", sortable: false },
        {
          title: "Description",
          key: "workflow_description",
          sortable: false,
        },
        {
          title: "Created On",
          key: "workflow_created_on",
          sortable: false,
        },
        {
          title: "Speed",
          key: "workflow_speed",
          sortable: false,
        },
      ];
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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

  watch: {
    currentPage(newVal, oldVal) {
      // When the page changes, scroll to top of table
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    searchlist() {
      // Reset to first page when searching
      this.currentPage = 1;
    },
  },

  created() {
    this.windowHeight = window.innerHeight - 220;
    this.isVisible = true;
    this.get_all_flows();
  },

  methods: {

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
      this.DialogCreateTicket = true;
    },
    DialogCreateTicketEmit() {
      this.DialogCreateTicket = false;
    },
    back_call() {
      this.$router.push("/home/DashboardView");
    },

    async get_all_flows() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      const variables = {
        organization_id: data.organization.organization_id,
        limit: 1000,
        nextToken: null,
        user_id: data.user.user_id,
      };
      this.tableData = [];
      this.fetchData(list_workflow, variables)
        .then(() => {
          var response = JSON.parse(this.queryResponse.data.list_workflow);
          this.tableLoading = false;
          this.tableData = response.details;
          this.tableData = this.tableData.filter(
            (obj) =>
              (obj.workflow_design_type === "DEFAULT" ||
                obj.workflow_design_type === undefined) &&
              obj.workflow_deploy_status === "DEPLOY"
          );

          // Update total items for pagination
          this.totalItems = this.tableData.length;

          localStorage.setItem(
            "workflowList",
            JSON.stringify(response.details)
          );
        })
        .catch((error) => {
          this.tableLoading = false;
          console.error("Error fetching data:", error);
        });
    },

    fetch_value(val) {
      return format_Date(val);
    },

    handle_row_click(click, value) {
      this.formInfo = value.item;
      this.componentCheck = 1;
      this.formDialog = true;
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

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.formDialog = false;
    },

    validate_message(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>

<style scoped>
/* Card Container */
.card-container {
  position: relative;
}

/* Modern Header Styles */

.header-search {
  display: flex;
  align-items: center;
  margin-right: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Modern Data Table Styles */
.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__thead) {
  background: #f8f9fa;
}

.modern-data-table :deep(.v-data-table__thead th) {
  background: #f8f9fa !important;
  color: #495057 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f3f4;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(219, 76, 119, 0.04) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-data-table :deep(.v-data-table__tbody td) {
  padding: 16px 12px !important;
  font-size: 14px;
  color: #495057;
}

/* Table Footer Styles */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 12px 12px;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(219, 76, 119, 0.1) !important;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 8px;
  min-width: 40px;
  height: 40px;
  transition: all 0.2s ease;
}

.inactive-page:hover {
  background: rgba(219, 76, 119, 0.1) !important;
}

/* Search Styles */
.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 40px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

.search-pill :deep(.v-field__outline) {
  border-color: #e9ecef;
}

.search-pill :deep(.v-field--focused .v-field__outline) {
  border-color: #db4c77;
}

.search-pill :deep(.v-field__field) {
  background: #f8f9fa;
}

.search-pill :deep(.v-field--focused .v-field__field) {
  background: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>
