<template>
  <div>
    <CreateTicketDialog
      :DialogCreateTicket="DialogCreateTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateTicketEmit"
    />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-timer-sand</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Pending Workflows <v-icon @click="refresh_list" size="x-small" color="primary">mdi-refresh</v-icon>
</span> 
          <span class="header-subtitle"
            >Review and manage pending workflows</span
          >
        </div>
      </div>
      <v-spacer />
      <!--Refresh-->
      <div class="refresh-action">
      </div>
      <div class="header-actions">
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              class="text-capitalize"
              v-bind="props"
              v-show="selectedItemsForward.length != 0"
              style="
                width: 120px;
                margin-right: 16px;
                color: #db4c77 !important;
                border-color: #db4c77 !important;
              "
            >
              Actions
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="bulk_forward()">
              <v-list-item-title class="text-left">
                Bulk Forward
              </v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="bulk_reject()">
              <v-list-item-title>Bulk Reject</v-list-item-title>
            </v-list-item>
            <v-list-item @click="bulk_aprroval()">
              <v-list-item-title>Bulk Approval</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          color="primary"
          size="small"
          class="text-capitalize"
          @click="back_call()"
          prepend-icon="mdi-step-backward"
          style="background: #db4c77 !important; color: white !important"
        >
          Back
        </v-btn>
      </div>
    </v-app-bar>

    <v-card flat class="overflow-y-auto mt-10">
      <div>
        <OverlayComp :overlay="overlay" />
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                v-model="selectedItemsForward"
                :fixed-header="true"
                :headers="modernHeaders"
                :height="windowHeight"
                :items="paginatedItems"
                :loading="tableLoading"
                item-value="initiate_id"
                :items-per-page="itemsPerPage"
                :page="currentPage"
                :server-items-length="totalItems"
                hide-default-footer
                class="modern-data-table"
                density="comfortable"
                hover
                :multi-select="true"
                show-select
                @click:row="handleClick"
                @update:modelValue="onSelectionChange"
              >
                <template #no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4"
                      >mdi-timer-sand</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">
                      No Pending Workflows
                    </div>
                    <div class="text-body-2 text-grey">
                      No pending workflows found.
                    </div>
                  </div>
                </template>
                <template v-slot:[`item.summary_field_1`]="{ item }">
                  <div class="d-flex flex-column">
                    <v-tooltip location="top" v-if="item.summary_field_1">
                      <template v-slot:activator="{ props }">
                        <span
                          v-bind="props"
                          class="caption text-truncate"
                          style="max-width: 200px"
                        >
                          {{ getFileName(item.summary_field_1) }}
                        </span>
                      </template>
                      <span>{{ getFileName(item.summary_field_1) }}</span>
                    </v-tooltip>
                    <span v-else class="caption text-grey">-</span>

                    <v-tooltip location="top" v-if="item.summary_field_2">
                      <template v-slot:activator="{ props }">
                        <span
                          v-bind="props"
                          class="caption text-truncate text-grey"
                          style="max-width: 200px"
                        >
                          {{ getFileName(item.summary_field_2) }}
                        </span>
                      </template>
                      <span>{{ getFileName(item.summary_field_2) }}</span>
                    </v-tooltip>
                    <span v-else class="caption text-grey">-</span>
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
                    <div class="text-body-2 text-grey">
                      Loading workflows...
                    </div>
                  </div>
                </template>
                <template v-slot:[`item.workflow_initiated_on`]="{ item }">
                  <span class="caption">{{
                    fetch_value(item.workflow_initiated_on)
                  }}</span>
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
      </div>
    </v-card>
    <!-- Dialogs -->
    <div v-if="componentCheck == 1">
      <FormInfo
        :submittedInfo="submittedInfo"
        :formDetails="formDetails"
        :formAction="formAction"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="submittedInfo = false"
        :rowInfo="rowInfo"
        v-on:popupmessage="popups"
      />
    </div>
    <div v-if="componentCheck == 2">
      <ApprovalEdit
        :editableField="editableField"
        :formDetails="formDetails"
        :formActionType="formActionType"
        :formAction="formAction"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editableField = false"
        :rowInfo="rowInfo"
        v-on:popupmessage="popups"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DirectoryApprovals
        :directoryApprovalsDialog="directoryApprovalsDialog"
        :formDetails="formDetails"
        :formActionType="formActionType"
        :formAction="formAction"
        v-on:errorMsg="error_info"
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
        @clicked="directoryApprovalsDialog = false"
        v-on:popupmessage="popups"
      />
    </div>
    <div v-if="componentCheck == 4">
      <BulkForwardWorkflows
        :allselecctedRecords="allselecctedRecords"
        :bulkForwardDialog="bulkForwardDialog"
        @clicked="bulkForwardDialog = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 5">
      <BulkRejectWorkflows
        :allselecctedRecords="allselecctedRecords"
        :bulkRejectDialog="bulkRejectDialog"
        @clicked="bulkRejectDialog = false"
        v-on:errorMsg="error_info"
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
      />
    </div>

    <div v-if="componentCheck == 6">
      <BulkApprovalDialog 
        :bulkapprovalDialog="bulkapprovalDialog"
        @clicked="bulkapprovalDialog = false"
        :allselecctedRecords="allselecctedRecords"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

  </div>
</template>
<script>
/*eslint-disable*/

// Imports
import BulkApprovalDialog from "@/components/Approvals/BulkAprrovalDialog.vue"
import { API, graphqlOperation } from "aws-amplify";
import { EventBus } from "@/main";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import {
  list_pending_workflows_v1,
  get_particular_workflow_details,
} from "@/graphql/queries.js";
import { get_workflow_payload } from "@/mixins/GetWorkflowDetails.js";
import { get_workflows } from "@/mixins/GetWorkflowsummary.js";

// Components
import SnackBar from "@/components/SnackBar.vue";
import OverlayComp from "@/components/OverlayComp.vue";
import FormInfo from "@/components/FormFields/FormInfo.vue";
import ApprovalEdit from "@/components/FormFields/ApprovalEdit.vue";
import DirectoryApprovals from "@/components/LookitUPDirectiory/AllDialogs/DirectoryApprovals.vue";
import BulkForwardWorkflows from "@/components/Approvals/BulkForwardWorkflows.vue";
import BulkRejectWorkflows from "@/components/Approvals/BulkRejectWorkflows.vue";
import CreateTicketDialog from "../Tickets/CreateTicketDialog.vue";
import html2canvas from "html2canvas";

export default {
  // Components
  components: {
    SnackBar,
    FormInfo,
    ApprovalEdit,
    OverlayComp,
    DirectoryApprovals,
    BulkForwardWorkflows,
    BulkRejectWorkflows,
    CreateTicketDialog,
    BulkApprovalDialog,
  },

  // Mixins
  mixins: [get_workflow_payload, get_workflows],

  // Data
  data() {
    return {
      // Boolean properties
      singleSelect: false,
      tableLoading: false,
      overlay: false,
      submittedInfo: false,
      editableField: false,
      directoryApprovalsDialog: false,
      bulkRejectDialog: false,
      bulkForwardDialog: false,
      isVisible: false,
      fixed: true,

      // String properties
      approvalType: "",
      actionItem: "",
      formAction: "Pending",
      formActionType: "initiate",
      summarylabel: "",
      searchsummary: "",
      search: "",
      filterByAction: "",

      // Number properties
      formCheck: 0,
      componentCheck: 0,
      bulkAction: 0,
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
      windowHeight: 0,

      // Array properties
      selectedItemsForward: [],
      tableData: [],
      workflowItems: [],
      selectItems: [],
      allselecctedRecords: [],

      // Object properties
      SnackBarComponent: {},
      formDetails: {},
      rowInfo: {},
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },

      // Other properties
      onBoardDialog: false,
      formViewDailog: false,
      next_token: null,
      goLoading: false,

      //Screenshot Values
      DialogCreateTicket: false,
      ScreenshotFile: null,
      bulkapprovalDialog: false,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },

      // Table headers
      headers: [
        { title: "Transaction Id", key: "transaction_id", sortable: false },
        { title: "Workflow Name", key: "workflow_name", sortable: false },
        { title: "Summary Fields", key: "summary_field_1", sortable: false },
        {
          title: "Initiated By",
          key: "workflow_initiated_name",
          sortable: false,
        },
        {
          title: "Initiated On",
          key: "workflow_initiated_on",
          sortable: false,
        },
      ],
    };
  },

  // Computed properties
  computed: {
    modernHeaders() {
      return [
        { title: "Transaction Id", key: "transaction_id", sortable: false },
        { title: "Workflow Name", key: "workflow_name", sortable: false },
        { title: "Summary Fields", key: "summary_field_1", sortable: false },
        {
          title: "Initiated By",
          key: "workflow_initiated_name",
          sortable: false,
        },
        {
          title: "Initiated On",
          key: "workflow_initiated_on",
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

  // Watchers
  watch: {
    // When page changes, load more if needed
    currentPage(newVal, oldVal) {
      if (newVal > oldVal && this.next_token) {
        this.get_pending_workflows();
      } else {
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
  },

  // Lifecycle hooks
  async created() {
    this.isVisible = true;
    this.windowHeight = window.innerHeight - 220;
    await Promise.all([this.get_pending_workflows(), this.get_workflows()]);
    this.fetch_all_workflows();
  },

  // Methods
  methods: {
  refresh_list(){
      this.next_token =  null
      this.get_pending_workflows();
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
    // Navigation methods
    back_call() {
      this.$router.push("/home/DashboardView");
    },

    // Utility methods
    formatDate(timestamp, format) {
      const date = new Date(timestamp * 1000);

      const day = String(date.getDate()).padStart(2, "0");
      const numericMonth = String(date.getMonth() + 1).padStart(2, "0");
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();

      const formatMap = {
        DD: day,
        MM: numericMonth,
        YYYY: year,
        Month: monthName,
      };

      return format.replace(
        /DD|MM|YYYY|Month/gi,
        (matched) => formatMap[matched]
      );
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

    fetch_value(date) {
      return formatedatetime(date);
    },

    fetch_name(formType, formInfo) {
      var data = "";
      if (formType == "MEMBER_ONBOARD") {
        data = formInfo.workflow_payload.first_name;
      } else {
        data = formInfo.workflow_payload.user_id_text;
      }
      return data;
    },

    // Workflow management methods
    fetch_all_workflows() {
      this.workflowItems = [];
      this.summaryOrgWorkflows.forEach((element) => {
        this.workflowItems.push(element.workflow_name);
      });
      this.workflowItems.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
    },

    // Bulk action methods
    bulk_reject() {
      var valid = true;
      this.allselecctedRecords = [];

      if (this.selectedItemsForward.length > 20) {
        valid = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            "The maximum number of records that can be reject at one time is 20",
          timeout: 5000,
          Top: true,
        };
      }
      if (valid) {
        this.componentCheck = 5;
        this.bulkRejectDialog = true;
        this.allselecctedRecords = this.selectedItemsForward;
      }
    },

    bulk_forward() {
      var valid = true;
      this.allselecctedRecords = [];

      if (this.selectedItemsForward.length > 20) {
        valid = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            "The maximum number of records that can be forwarded at one time is 20",
          timeout: 5000,
          Top: true,
        };
      }
      if (valid) {
        this.componentCheck = 4;
        this.bulkForwardDialog = true;
        this.allselecctedRecords = this.selectedItemsForward;
      }
    },

    // Pagination methods
    get_submitworkflow_Pagination() {
      if (this.next_token) {
        this.get_pending_workflows();
      }
    },

    // Filter methods
    input_check() {
      if (this.filterByAction != "") {
        this.summarylabel = "";
        this.searchsummary = "";
      }
    },

    bulk_aprroval() {
  let valid = true
  this.allselecctedRecords = []

  if (this.selectedItemsForward.length === 0) {
    valid = false
    this.SnackBarComponent = {
      SnackbarVmodel: true,
      SnackbarColor: "red",
      SnackbarText: "Please select at least one workflow",
      timeout: 5000,
      Top: true,
    }
  }

  if (this.selectedItemsForward.length > 20) {
    valid = false
    this.SnackBarComponent = {
      SnackbarVmodel: true,
      SnackbarColor: "red",
      SnackbarText:
        "The maximum number of records that can be approved at one time is 20",
      timeout: 5000,
      Top: true,
    }
  }

  if (valid) {
    this.componentCheck = 6
    this.bulkapprovalDialog = true
    this.allselecctedRecords = this.selectedItemsForward
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
        this.get_pending_workflows();
      }
    },

    clear_data() {
      this.filterByAction = "";
      this.summarylabel = "";
      this.tableData = [];
      this.next_token = null;
      this.selectItems = [];
      this.get_pending_workflows();
    },

    // API methods
    async get_pending_workflows() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_pending_workflows_v1, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              limit: 101,
              nextToken: this.next_token,
              workflow_name:
                this.filterByAction != "" ? this.filterByAction : undefined,
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
        var response = JSON.parse(result.data.list_pending_workflows_v1);
        let array = [];
        if (response.Status == "SUCCESS") {
          this.goLoading = false;
          this.next_token = response.nextToken;
          array = this.tableData.concat(response.workflow);
          this.tableData = array;
          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.initiate_id === obj.initiate_id)
          );
          this.tableData = uniqueArrayOfObjects;
          this.totalItems = this.tableData.length;
        } else {
          this.goLoading = false;
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

    async get_transaction() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_workflow_details, {
            input: {
              initiate_id: this.formDetails.initiate_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_particular_workflow_details);

        if (response.Status == "SUCCESS") {
          this.detailsform = response.data[0];
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

    // Event handlers
    async handleClick(click, value) {
      this.overlay = true;
      this.rowInfo = value.item;
      localStorage.setItem("initiatedBy", value.item.workflow_initiated_name);
      this.$store.commit("SetInitiatorId", value.item.initiate_id);
      await this.get_workflow_payload();

      this.overlay = false;

      var dataCheck = this.workflowInfoPaylod.workflow_template.every(
        (obj) => obj.is_readonly === true
      );
      if (
        dataCheck == true &&
        this.workflowInfoPaylod.form_unique_type !=
          "DIRECTORY_EDIT_ENTRY_FORM" &&
        this.workflowInfoPaylod.form_unique_type !=
          "DIRECTORY_ADD_ENTRY_FORM" &&
        this.workflowInfoPaylod.form_unique_type !=
          "DIRECTORY_DELETE_ENTRY_FORM" &&
        this.workflowInfoPaylod.form_unique_type != "DIRECTORY_ACCESS_FORM"
      ) {
        this.componentCheck = 1;
        this.actionItem = "Pending";
        this.submittedInfo = true;
        this.formDetails = this.workflowInfoPaylod;
      } else if (
        dataCheck == true &&
        (this.workflowInfoPaylod.form_unique_type ==
          "DIRECTORY_EDIT_ENTRY_FORM" ||
          this.workflowInfoPaylod.form_unique_type ==
            "DIRECTORY_ADD_ENTRY_FORM" ||
          this.workflowInfoPaylod.form_unique_type ==
            "DIRECTORY_DELETE_ENTRY_FORM" ||
          this.workflowInfoPaylod.form_unique_type == "DIRECTORY_ACCESS_FORM")
      ) {
        this.componentCheck = 3;
        this.actionItem = "Pending";
        this.submittedInfo = true;
        this.formDetails = this.workflowInfoPaylod;
        this.directoryApprovalsDialog = true;
      } else {
        this.componentCheck = 2;
        this.actionItem = "Pending";
        this.editableField = true;
        this.formDetails = this.workflowInfoPaylod;
      }
    },

    onSelectionChange(selected) {
      this.selectedItemsForward = selected;
    },

    // Notification methods
    popups(val) {
      if (val == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "While rejection comments are mandatory",
          timeout: 5000,
          Top: true,
        };
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

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.bulkRejectDialog = false;
      this.submittedInfo = false;
      this.editableField = false;
      this.next_token = null;
      this.tableData = [];
      this.directoryApprovalsDialog = false;
      this.bulkForwardDialog = false;
      this.bulkapprovalDialog = false
      this.allselecctedRecords = [];
      this.selectedItemsForward = [];
      await this.get_pending_workflows();
    },
  },
};
</script>
<style scoped>
/* Card Container */
.card-container {
  position: relative;
}
</style>
