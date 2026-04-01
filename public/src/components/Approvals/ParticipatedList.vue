<template>
  <div>
    <CreateTicketDialog :DialogCreateTicket="DialogCreateTicket" :screenshot-file="ScreenshotFile"
      :org-details="orgDetails" @clicked="DialogCreateTicketEmit" />
    <ExportPartipatedDialog :ExportDialog="ExportDialog" @close="ExportDialog = false" v-on:errorMsg="error_info"
      v-on:successMsg="success_info" />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-account-group</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Participated Workflows <v-icon @click="refresh_list" size="x-small" color="primary">mdi-refresh</v-icon>
</span>
          <span class="header-subtitle">Review and manage participated workflows</span>
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

        <!--Export Button-->
        <v-btn color="primary" size="small" class="text-capitalize" prepend-icon="mdi-download"
          style="background: #db4c77 !important; color: white !important" @click="exportClick()">
          Export
        </v-btn>

        <!-- Filter Button -->
        <v-btn class="apply-filter-btn" @click="openFilterDrawer()" style="margin-right: 16px">
          <v-icon>mdi-filter-variant</v-icon>
          <span>Filter</span>
          <v-badge v-if="activeFiltersCount > 0" :content="activeFiltersCount" color="white" class="ml-2" />
        </v-btn>

        <v-btn color="primary" size="small" class="text-capitalize" @click="back_call()"
          prepend-icon="mdi-step-backward" style="background: #db4c77 !important; color: white !important">
          Back
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Filter Navigation Drawer -->
    <v-navigation-drawer :model-value="showFilterDrawer" @update:model-value="showFilterDrawer = $event"
      location="right" temporary width="400" class="pa-0 filter-drawer"
      :style="{ top: '64px', height: 'calc(100vh - 64px)' }">
      <v-card flat>
        <v-toolbar elevation="1" density="compact" class="navBar">
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">Filter Options</div>
          </v-toolbar-title>
          <v-spacer />
          <v-btn variant="text" color="white" size="small" @click="clear_data()" class="mr-2">
            <v-icon size="16">mdi-close-circle</v-icon>
            <span class="ml-1">Clear</span>
          </v-btn>
          <v-icon class="mr-2" @click="closeFilterDrawer()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="filterForm">
            <div class="filter-content">
              <!-- Status Filter -->
              <div class="filter-group">
                <label class="filter-label">Status</label>
                <v-select v-model="filterBy" :items="[
                  { title: 'ALL', value: 'ALL' },
                  { title: 'INPROGRESS', value: 'INPROGRESS' },
                  { title: 'COMPLETED', value: 'COMPLETED' },
                  { title: 'REJECTED', value: 'REJECTED' },
                  { title: 'WITHDRAWN', value: 'WITHDRAWN' },
                ]" item-title="title" item-value="value" variant="outlined" density="compact" hide-details
                  class="filter-select" />
              </div>

              <!-- User Search -->
              <div class="filter-group">
                <label class="filter-label">Search User</label>
                <v-autocomplete v-model="userselect" item-title="full_user_name" item-value="user_id" :items="userArray"
                  v-model:search="searchuser" hide-no-data variant="outlined" density="compact" hide-details
                  class="filter-select" placeholder="Search User" hide-selected />
              </div>

              <!-- Workflow Filter -->
              <div class="filter-group">
                <label class="filter-label">Workflow</label>
                <v-autocomplete v-model="filterByAction" :items="workflowItems" v-model:search="search"
                  @update:model-value="input_check" variant="outlined" density="compact" hide-details
                  class="filter-select" :menu-props="{ offsetY: true, maxHeight: 200 }" />
              </div>

              <!-- Summary Fields Filter -->
              <div class="filter-group" v-if="selectItems.length">
                <label class="filter-label">Summary Field</label>
                <v-select v-model="summarylabel" :items="selectItems" item-text="text" item-value="value"
                  variant="outlined" density="compact" hide-details class="filter-select"
                  :menu-props="{ offsetY: true, maxHeight: 200 }" />
              </div>

              <!-- Search Summary -->
              <div class="filter-group" v-if="summarylabel != ''">
                <label class="filter-label">Search Summary</label>
                <v-text-field v-model="searchsummary" placeholder="Min 3 Character" variant="outlined" density="compact"
                  hide-details class="filter-select" append-inner-icon="mdi-magnify" :rules="[
                    (v) =>
                      v.length >= 3 || v.length === 0 || 'Min 3 characters',
                  ]" />
              </div>

              <!-- Action Buttons -->
              <div class="filter-actions">
                <v-btn :loading="goLoading" class="apply-filter-btn" @click="applyFilterFromDrawer()" block
                  style="margin-bottom: 8px">
                  <v-icon class="mr-2">mdi-filter</v-icon>
                  Apply Filters
                </v-btn>
                <v-btn class="clear-filter-btn" @click="clear_data()" block variant="outlined">
                  <v-icon class="mr-2">mdi-close</v-icon>
                  Clear All
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <v-card flat class="overflow-y-auto mt-10">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <OverlayComp :overlay="overlay" />
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table :headers="headers" :items="paginatedItems" :loading="tableLoading"
                :sort-by="['workflow_initiated_on']" :items-per-page="itemsPerPage" :page="currentPage"
                :server-items-length="totalItems" hide-default-footer class="modern-data-table" density="comfortable"
                hover :fixed-header="true" :height="height" @click:row="handleClick">
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-group</v-icon>
                    <div class="text-h6 text-grey mb-2">
                      No Participated Workflows
                    </div>
                    <div class="text-body-2 text-grey">
                      Try adjusting your filter criteria.
                    </div>
                  </div>
                </template>

                <template v-slot:loading>
                  <div class="text-center py-8">
                    <v-progress-circular indeterminate color="primary" size="32" class="mb-4"></v-progress-circular>
                    <div class="text-body-2 text-grey">
                      Loading workflows...
                    </div>
                  </div>
                </template>


                <!-- Transaction ID / Workflow Name -->
                <template v-slot:[`item.transaction_id`]="{ item }">
                  <div class="d-flex flex-column">
                    <span class="caption font-weight-medium">{{
                      item.transaction_id
                    }}</span>
                    <span class="caption text-truncate" style="max-width: 200px">{{ item.workflow_name }}</span>
                  </div>
                </template>

                <!-- Initiated By -->
                <template v-slot:[`item.workflow_initiated_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="primary" class="mr-2">mdi-account</v-icon> -->
                    <span class="caption font-weight-medium">{{
                      fetch_user_name(item.workflow_initiated_name)
                    }}</span>
                  </div>
                </template>

                <!-- Summary Fields -->
                <template v-slot:[`item.summary_field_1`]="{ item }">
                  <div class="d-flex flex-column">
                    <v-tooltip location="top" v-if="item.summary_field_1">
                      <template v-slot:activator="{ props }">
                        <span v-bind="props" class="caption text-truncate" style="max-width: 200px">
                          {{ getFileName(item.summary_field_1) }}
                        </span>
                      </template>
                      <span>{{ getFileName(item.summary_field_1) }}</span>
                    </v-tooltip>
                    <span v-else class="caption text-grey">-</span>

                    <v-tooltip location="top" v-if="item.summary_field_2">
                      <template v-slot:activator="{ props }">
                        <span v-bind="props" class="caption text-truncate text-grey" style="max-width: 200px">
                          {{ getFileName(item.summary_field_2) }}
                        </span>
                      </template>
                      <span>{{ getFileName(item.summary_field_2) }}</span>
                    </v-tooltip>
                    <span v-else class="caption text-grey">-</span>
                  </div>
                </template>

                <!-- Acted By -->
                <template v-slot:[`item.workflow_approval_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="success" class="mr-2">mdi-account-check</v-icon> -->
                    <span class="caption font-weight-medium">
                      {{
                        item.approval_status == "COMPLETED" ||
                          item.approval_status == "REJECTED"
                          ? fetch_user_name(item.workflow_approval_name)
                          : "-"
                      }}
                    </span>
                  </div>
                </template>

                <!-- Pending On -->
                <template v-slot:[`item.pending_on`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="warning" class="mr-2">mdi-clock-outline</v-icon> -->
                    <span class="caption font-weight-medium">
                      {{
                        item.approval_status == "INPROGRESS"
                          ? fetch_user_name(item.pending_on)
                          : "-"
                      }}
                    </span>
                  </div>
                </template>

                <!-- Initiated On / Acted On -->
                <template v-slot:[`item.workflow_initiated_on`]="{ item }">
                  <div class="d-flex flex-column">
                    <div class="d-flex align-center">
                      <v-icon size="16" color="primary" class="mr-2">mdi-calendar-start</v-icon>
                      <span class="caption">{{
                        fetch_value(item.workflow_initiated_on)
                      }}</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon size="16" color="success" class="mr-2">mdi-calendar-check</v-icon>
                      <span class="caption">{{
                        fetch_value(item.workflow_aprroved_on)
                      }}</span>
                    </div>
                  </div>
                </template>

                <!-- Approval Status -->
                <template v-slot:[`item.approval_status`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" :color="getStatusColor(item.approval_status)" class="mr-2">
                      {{ getStatusIcon(item.approval_status) }}
                    </v-icon>
                    <span class="caption font-weight-medium">{{
                      item.approval_status
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
                      : `Showing ${paginatedItems.length} of ${totalItems} workflows`
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

    <!-- Form Dialog -->
    <div v-if="componentCheck == 1">
      <FormInfo :submittedInfo="submittedInfo" :formDetails="formDetails" :formAction="formAction" :rowInfo="rowInfo"
        v-on:errorMsg="error_info" v-on:successMsg="success_info" @clicked="submittedInfo = false" />
    </div>
  </div>
</template>

<script>
/*eslint-disable*/
import { format_Date } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import ExportPartipatedDialog from "@/components/Approvals/ExportParctipatedDialog.vue";
import {
  list_participants_workflows_v1,
  all_users_of_organization,
} from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import FormInfo from "@/components/FormFields/FormInfo.vue";
import OverlayComp from "@/components/OverlayComp.vue";
import { get_workflow_payload } from "@/mixins/GetWorkflowDetails.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_workflows } from "@/mixins/GetWorkflowsummary.js";
import CreateTicketDialog from "../Tickets/CreateTicketDialog.vue";
import html2canvas from "html2canvas";

export default {
  components: {
    SnackBar,
    FormInfo,
    OverlayComp,
    CreateTicketDialog,
    ExportPartipatedDialog,
  },
  mixins: [get_workflow_payload, get_all_org_users, get_workflows],

  data() {
    return {
      ExportDialog: false,
      SnackBarComponent: {},
      userselect: "",
      userArray: [],
      searchuser: "",
      tableData: [],
      height: 0,
      tableLoading: false,
      next_token: null,
      fixed: true,
      headers: [

        {
          title: "Transaction ID / Workflow Name",
          key: "transaction_id",
          sortable: false,
        },
        {
          title: "Initiated By",
          key: "workflow_initiated_name",
          sortable: false,
        },
        {
          title: "Summary Fields",
          key: "summary_field_1",
          sortable: false,
        },
        {
          title: "Last Acted By",
          key: "workflow_approval_name",
          sortable: false,
        },
        {
          title: "Pending On",
          key: "pending_on",
          sortable: false,
        },
        {
          title: "Initiated On / Acted On",
          key: "workflow_initiated_on",
          sortable: false,
        },
        {
          title: "Status",
          key: "approval_status",
          sortable: false,
          width: "100px",
        },
      ],
      submittedInfo: false,
      formDetails: {},
      formAction: "",
      componentCheck: 0,
      overlay: false,
      filterByAction: "",
      filterBy: "ALL",
      goLoading: false,
      workflowItems: [],
      search: "",
      workflowCheck: false,
      allUSersNames: [],
      selectItems: [],
      summarylabel: "",
      searchsummary: "",
      rowInfo: {},
      isVisible: false,
      // Pagination properties
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,

      // Filter drawer properties
      showFilterDrawer: false,

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
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
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
      if (this.filterBy && this.filterBy !== "ALL") {
        count++;
      }

      // Count user search
      if (this.userselect && this.userselect !== "") {
        count++;
      }

      // Count workflow filter
      if (this.filterByAction && this.filterByAction !== "") {
        count++;
      }

      // Count summary field filter
      if (this.summarylabel && this.summarylabel !== "") {
        count++;
      }

      // Count search summary
      if (this.searchsummary && this.searchsummary !== "") {
        count++;
      }

      return count;
    },
  },

  watch: {
    filterByAction(newVal) {
      const selectedWorkflow = this.summaryOrgWorkflows.find(
        (item) => item.workflow_name === newVal
      );

      if (selectedWorkflow) {
        this.selectItems = [];
        if (selectedWorkflow.summary_field_1) {
          this.selectItems.push({
            text: selectedWorkflow.summary_field_1.replace(/_/g, " "),
            value: "summary_field_1",
          });
        }
        if (selectedWorkflow.summary_field_2) {
          this.selectItems.push({
            text: selectedWorkflow.summary_field_2.replace(/_/g, " "),
            value: "summary_field_2",
          });
        }
      }
    },
    currentPage(newVal, oldVal) {
      // When the page changes, check if we need to load more data
      if (newVal > oldVal && this.next_token) {
        // User is going to next page and we have more data to load
        this.get_participated_workflow();
      } else {
        // Just scroll to top of table for same page or going back
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  },

  async created() {
    this.isVisible = true;
    this.height = window.innerHeight - 220;
    await Promise.all([
      this.get_participated_workflow(),
      this.get_all_org_users(),
      this.get_workflows(),
    ]);
    this.allUSersNames = this.orgUsers;
    this.$store.commit("Setnamesearch", "");
    this.fetch_all_workflows();
  },

  methods: {
    refresh_list() {
      this.next_token = null
      this.get_participated_workflow();
      ;
    },
    exportClick() {
      this.ExportDialog = true;
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
      this.DialogCreateTicket = true;
    },
    DialogCreateTicketEmit() {
      this.DialogCreateTicket = false;
    },
    // Filter drawer methods
    openFilterDrawer() {
      this.showFilterDrawer = true;
    },

    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },

    applyFilterFromDrawer() {
      // Apply the filter and close the drawer
      this.filter_data();
      this.closeFilterDrawer();
    },

    getStatusColor(status) {
      switch (status) {
        case "COMPLETED":
          return "success";
        case "INPROGRESS":
          return "warning";
        case "REJECTED":
          return "error";
        case "WITHDRAWN":
          return "primary";
        default:
          return "grey";
      }
    },

    getStatusIcon(status) {
      switch (status) {
        case "COMPLETED":
          return "mdi-check-circle";
        case "INPROGRESS":
          return "mdi-clock-outline";
        case "REJECTED":
          return "mdi-close-circle";
        case "WITHDRAWN":
          return "mdi-account-remove";
        default:
          return "mdi-help-circle";
      }
    },

    back_call() {
      this.$router.push("/home/DashboardView");
    },

    getFileName(url) {
      if (typeof url === "string") {
        const match = url.match(
          /[^\/]+\.(jpg|png|xlsx|jpeg|gif|bmp|tiff|pdf|doc|docx|xls|csv|txt|mp4|mp3|avi|mkv)$/i
        );
        return match ? match[0] : url;
      } else {
        return url;
      }
    },

    clear_data() {
      this.filterBy = "ALL";
      this.userselect = "";
      this.filterByAction = "";
      this.summarylabel = "";
      this.selectItems = [];
      this.tableData = [];
      this.next_token = null;
      this.currentPage = 1;
      this.totalItems = 0;
      this.get_participated_workflow();
    },

    get_participatedworkflow_Pagination() {
      if (this.next_token) {
        this.get_participated_workflow();
      }
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

    input_check() {
      if (this.filterByAction != "") {
        this.workflowCheck = true;
        this.summarylabel = "";
        this.searchsummary = "";
      }
    },

    filter_data() {
      if (this.summarylabel != "" && this.searchsummary == "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Search by summary with a minimum of three characters",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.tableData = [];
        this.goLoading = true;
        this.next_token = null;
        this.currentPage = 1;
        this.totalItems = 0;
        this.get_participated_workflow();
      }
    },

    fetch_all_workflows() {
      this.workflowItems = [];
      this.summaryOrgWorkflows.forEach((element) => {
        this.workflowItems.push(element.workflow_name);
      });
      this.workflowItems.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
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
      this.submittedInfo = false;
      this.tableData = [];
      this.next_token = null;
      this.currentPage = 1;
      this.totalItems = 0;
      this.ExportDialog = false;
      await this.get_participated_workflow();
    },

    fetch_value(val) {
      if (val == undefined) {
        return "-";
      } else {
        return format_Date(val);
      }
    },

    async handleClick(click, value) {
      this.overlay = true;
      var initaorName = this.fetch_user_name(
        value.item.workflow_initiated_name
      );
      localStorage.setItem("initiatedBy", initaorName);
      this.rowInfo = value.item;
      this.$store.commit("SetInitiatorId", value.item.initiate_id);
      await this.get_workflow_payload();
      this.overlay = false;
      this.componentCheck = 1;
      this.submittedInfo = true;
      this.formDetails = this.workflowInfoPaylod;
      this.formAction = "Submited";
    },

    async get_participated_workflow() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_participants_workflows_v1, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              limit: 21,
              nextToken: this.next_token,
              approval_status: this.filterBy,
              workflow_name:
                this.filterByAction == null ? "" : this.filterByAction,
              workflow_initiated_by:
                this.userselect == null ? "" : this.userselect,
              summary_field_1:
                this.summarylabel == "summary_field_1"
                  ? this.searchsummary.trim().length == 0
                    ? undefined
                    : this.searchsummary
                  : undefined,
              summary_field_2:
                this.summarylabel == "summary_field_2"
                  ? this.searchsummary.trim().length == 0
                    ? undefined
                    : this.searchsummary
                  : undefined,
            },
          })
        );
        this.tableLoading = false;
        this.goLoading = false;
        var response = JSON.parse(result.data.list_participants_workflows_v1);
        this.next_token = response.nextToken;

        if (response.Status == "SUCCESS") {
          this.goLoading = false;

          if (this.next_token) {
            // If we have more data, concatenate to existing array
            let array = this.tableData.concat(response.workflow);
            this.tableData = array;
          } else {
            // If no more data, concatenate what we have (don't replace)
            if (response.workflow && response.workflow.length > 0) {
              let array = this.tableData.concat(response.workflow);
              this.tableData = array;
            }
          }

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index ===
              self.findIndex((o) => o.participant_id === obj.participant_id)
          );
          this.tableData = uniqueArrayOfObjects;
          for (let i = 0; i < this.tableData.length; i++) {
            this.tableData[i].pending_on =
              this.tableData[i].workflow_approval_name;
          }

          // Update total items for pagination
          this.totalItems = this.tableData.length;
        } else {
          this.goLoading = false;
          // Only clear data if this is the first load (no next_token) or filter reset
          if (!this.next_token && this.tableData.length === 0) {
            this.tableData = [];
            this.totalItems = 0;
          }
        }
      } catch (error) {
        this.tableLoading = false;
        this.goLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style scoped>
/* Card Container */
.card-container {
  position: relative;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Filter Button Styles */
.filter-btn {
  background: #e91e63 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 40px !important;
  min-height: 40px !important;
}

.filter-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4) !important;
}

.filter-btn.active {
  background: #c2185b !important;
  box-shadow: 0 2px 8px rgba(194, 24, 91, 0.3) !important;
}

.filter-btn.active:hover {
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.4) !important;
}

/* Navigation Drawer Styles */
.filter-drawer {
  z-index: 1000 !important;
  position: fixed !important;
}

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

.filter-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.header-filter {
  background: white !important;
  border-radius: 8px !important;
}

.apply-filter-btn {
  background: #db4c77 !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 28px !important;
}

.clear-filter-btn {
  background: #f5f5f5 !important;
  color: #666 !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 40px !important;
  min-height: 40px !important;
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
</style>
