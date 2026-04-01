<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <OverlayComp :overlay="overlay" />
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />

    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-chart-line</v-icon>
          </div>
        </div>
        <div class="header-text"> 
          <span class="header-title">Workflows</span>
          <span class="header-subtitle"
            >Track and analyze workflow transactions</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <v-text-field
  v-model="globalSearch"
  label="Search WorkFlows"
  prepend-inner-icon="mdi-magnify"
  density="compact"
  variant="outlined"
  hide-details
  style="width: 200px"
/>

        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Filter Button - Only show for All Transactions tab -->
        <v-btn
          v-if="toggle_exclusive == 'alltransactions'"
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

        <!-- Aging Reports Toolbar - Only show for Aging Reports tab -->
        <div v-if="toggle_exclusive == 'agingReports'" class="aging-toolbar">
          <!-- <v-autocomplete
            density="compact"
            v-model="agingUserselect"
            label="Search User"
            variant="outlined"
            item-text="title"
            item-value="user_id"
            :items="agingUserArray"
            class="mt-2"
            v-model:search-input="agingSearchuser"
            hide-no-data
            style="max-width: 200px; margin-right: 12px"
            placeholder="Min 3 Character"
            hide-selected
          /> -->
          <v-btn
            class="action-btn filter-btn"
            size="small"
            @click="showFilterDrawer = true"
            style="margin-right: 12px"
          >
            <v-icon>mdi-filter-variant</v-icon>
            <span>Filter</span>
          </v-btn>
          <v-btn
            @click="agingBulkForward()"
            class="action-btn bulk-btn"
            size="small"
            v-show="agingSelectedItemsForward.length != 0"
          >
            <v-icon>mdi-forward</v-icon>
            <span>Bulk Forward</span>
          </v-btn>
        </div>

        <!-- Generate Report Button - Only show for Report Builder tab -->
        <v-btn
          v-if="toggle_exclusive == 'reportsTransactions'"
          class="action-btn generate-btn"
          @click="generate_report()"
          size="small"
        >
          <v-icon>mdi-file-chart</v-icon>
          <span>Generate</span>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs
          v-model="toggle_exclusive"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
          @update:model-value="onTabSwitch"
        >
          <v-tab value="agingReports" class="tab-btn"> In Progress </v-tab>
          <v-tab value="alltransactions" class="tab-btn">
            Workflow Transactions
          </v-tab>

          <v-tab value="knockoffWrk" class="tab-btn">
            Knock off Workflow
          </v-tab>
          <v-tab value="reportsTransactions" class="tab-btn">
            Report Builder
          </v-tab>
          <v-tab value="systemApprovals" class="tab-btn">
            System Approvals
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <!-- Filter Navigation Drawer -->
    <v-navigation-drawer
      :model-value="showFilterDrawer"
      @update:model-value="showFilterDrawer = $event"
      location="right"
      temporary
      :width="$vuetify.display.smAndDown ? '100%' : '400'"
      class="pa-0 filter-drawer"
      style="z-index: 1000"
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
              <!-- From Date Filter -->
              <!-- <div class="filter-group">
                <label class="filter-label">From Date</label>
                <v-text-field
                  v-model="computedDateDisplay"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="openDatePicker"
                  class="filter-select"
                >
                  <v-dialog v-model="datePicker" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempDate"
                        :max="new Date().toISOString().substr(0, 10)"
                        color="#DB4C77"
                        class="primaryColor"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          text
                          color="primaryColor"
                          @click="datePicker = false"
                          >Cancel</v-btn
                        >
                        <v-btn text color="primaryColor" @click="saveDate"
                          >OK</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-text-field>
              </div> -->

              <!-- To Date Filter -->
              <!-- <div class="filter-group">
                <label class="filter-label">To Date</label>
                <v-text-field
                  v-model="dataDisplayFormatted"
                  variant="outlined"
                  density="compact"
                  append-inner-icon="mdi-calendar"
                  readonly
                  @click="openDatePickerTo"
                  class="filter-select"
                >
                  <v-dialog v-model="datePickerTo" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempDateTo"
                        :max="new Date().toISOString().substr(0, 10)"
                        color="#DB4C77"
                        class="primaryColor"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          text
                          color="primaryColor"
                          @click="datePickerTo = false"
                          >Cancel</v-btn
                        >
                        <v-btn text color="primaryColor" @click="saveDateTo"
                          >OK</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-text-field>
              </div> -->

              <!-- Status Filter -->
              <div
                class="filter-group"
                v-if="toggle_exclusive == 'alltransactions'"
              >
                <label class="filter-label">Filter By Status</label>
                <v-select
                  v-model="allTransactionItems"
                  :items="transaction_Items"
                  item-text="text"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
              </div>

              <!-- User Filter -->
              <div class="filter-group">
                <label class="filter-label">Search User</label>
                <v-autocomplete
                  v-model="userselect"
                  :items="userArray"
                  item-text="title"
                  item-value="user_id"
                  v-model:search-input="searchuser"
                  hide-no-data
                  placeholder="Min 3 Characters"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
              </div>

              <!-- Workflow Filter -->
              <div class="filter-group">
                <label class="filter-label">Filter By Workflows</label>
                <v-autocomplete
                  v-model="filterWorkflows"
                  :items="workflowItems"
                  v-model:search-input="searchworkflow"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                  :menu-props="{ offsetY: true, maxHeight: 200 }"
                />
              </div>

              <!-- Summary Fields Filter -->
              <div class="filter-group" v-if="selectItems.length">
                <label class="filter-label">Summary Fields</label>
                <v-select
                  v-model="summarylabel"
                  :items="selectItems"
                  item-title="text"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
              </div>

              <!-- Search by Summary Filter -->
              <div
                class="filter-group"
                v-if="summarylabel && toggle_exclusive == 'alltransactions'"
              >
                <label class="filter-label">Search by Summary</label>
                <v-text-field
                  v-model="searchsummary"
                  placeholder="Min 3 Characters"
                  append-icon="mdi-magnify"
                  :rules="[
                    (v) =>
                      v.length >= 3 || v.length === 0 || 'Min 3 characters',
                  ]"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="filter-select"
                />
              </div>

              <!-- Action Buttons -->
              <div class="filter-actions">
                <v-btn
                  :loading="goLoading"
                  class="apply-filter-btn"
                  @click="applyFilterFromDrawer()"
                  block
                >
                  <v-icon class="mr-2">mdi-filter</v-icon>
                  Apply Filters
                </v-btn>
                <v-btn
                  class="clear-filter-btn"
                  @click="clearFilters()"
                  block
                  variant="outlined"
                >
                  <v-icon class="mr-2">mdi-close</v-icon>
                  Clear All
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <v-card
      v-if="toggle_exclusive == 'alltransactions'"
      flat
      class="overflow-y-auto"
    >
      <div>
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                :fixed-header="true"
                :headers="modernHeaders"
                :height="windowHeight"
                 :search = "globalSearch"
                :items="filteredTableData"
                :loading="tableLoading"
                :items-per-page="itemsPerPage"
                :page="currentPage"
                :server-items-length="totalCount"
                hide-default-footer
                class="modern-data-table"
                density="comfortable"
                hover
                @update:sort-by="handleSortChange"
                @click:row="handleClick"
              >
                <template #no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4"
                      >mdi-format-list-bulleted</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">
                      No Workflow Transactions Found
                    </div>
                    <div class="text-body-2 text-grey">
                      Try adjusting your search criteria or date range.
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
                    <div class="text-body-2 text-grey">
                      Loading workflow transactions...
                    </div>
                  </div>
                </template>

                <template v-slot:[`item.workflow_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3"
                >mdi-format-list-bulleted</v-icon
              > -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.workflow_name }}
                      </div>
                      <div class="caption text-grey">
                        {{ item.transaction_id }}
                      </div>
                    </div>
                  </div>
                </template>
                <template v-slot:[`item.workflow_initiated_on`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="grey" class="mr-2"
                >mdi-calendar-clock</v-icon
              > -->
                    <span class="caption">{{
                      get_date(item.workflow_initiated_on)
                    }}</span>
                  </div>
                </template>
                <template v-slot:[`item.workflow_aprroved_on`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="grey" class="mr-2"
                >mdi-check-circle</v-icon
              > -->
                    <span
                      v-if="item.workflow_aprroved_on == null"
                      class="caption"
                      >-</span
                    >
                    <span v-else class="caption">{{
                      get_date(item.workflow_aprroved_on)
                    }}</span>
                  </div>
                </template>
                <template v-slot:[`item.approval_status`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon
                      size="16"
                      class="mr-2"
                      :color="
                        item.approval_status == 'COMPLETED'
                          ? 'green'
                          : item.approval_status == 'INPROGRESS'
                          ? 'orange'
                          : 'red'
                      "
                    >
                      {{
                        item.approval_status == "COMPLETED"
                          ? "mdi-check-circle"
                          : item.approval_status == "INPROGRESS"
                          ? "mdi-clock"
                          : "mdi-close-circle"
                      }}
                    </v-icon>
                    <span
                      :class="
                        item.approval_status == 'COMPLETED'
                          ? 'green--text'
                          : item.approval_status == 'INPROGRESS'
                          ? 'orange--text'
                          : 'red--text'
                      "
                      class="caption"
                    >
                      {{ item.approval_status }}
                    </span>
                  </div>
                </template>
                <template v-slot:[`item.approval_user_email_id`]="{ item }">
                  <div
                    v-if="
                      item.approval_status == 'COMPLETED' ||
                      item.approval_status == 'REJECTED'
                    "
                    class="d-flex align-center"
                  >
                    <!-- <v-avatar size="24" color="primary" class="mr-2">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{
                    (fetch_user_name(item.approval_user_email_id) || "U")
                      .substring(0, 1)
                      .toUpperCase()
                  }}
                </span>
              </v-avatar> -->
                    <span class="caption">{{
                      fetch_user_name(item.approval_user_email_id)
                    }}</span>
                  </div>
                  <div v-else class="d-flex align-center">
                    <v-icon size="16" color="grey" class="mr-2"
                      >mdi-minus</v-icon
                    >
                    <span class="caption">-</span>
                  </div>
                </template>

                <template v-slot:[`item.pending_on`]="{ item }">
                  <div
                    v-show="item.approval_status == 'INPROGRESS'"
                    class="caption"
                  >
                    {{
                      item.pending_on != undefined
                        ? fetch_user_name(item.pending_on)
                        : "-"
                    }}
                  </div>
                  <div v-show="item.approval_status != 'INPROGRESS'">-</div>
                </template>

                <template v-slot:[`item.workflow_initiated_by`]="{ item }">
                  <div
                    v-if="item.workflow_initiated_by"
                    class="d-flex align-center"
                  >
                    <!-- <v-icon size="16" color="primary" class="mr-2"
                >mdi-account</v-icon
              > -->
                    <span class="caption">{{
                      fetch_user_name(item.workflow_initiated_by)
                    }}</span>
                  </div>
                </template>

                <template v-slot:[`item.summary_field_1`]="{ item }">
                  <div
                    v-if="
                      item.summary_field_1 == undefined ||
                      item.summary_field_1 == null
                    "
                  >
                    -
                  </div>
                  <v-tooltip bottom v-else>
                    <template v-slot:activator="{ on }">
                      <div class="caption" v-on="on">
                        {{
                          getFileName(item.summary_field_1).length >= 10
                            ? getFileName(item.summary_field_1).substr(0, 10) +
                              "..."
                            : getFileName(item.summary_field_1)
                        }}
                      </div>
                    </template>
                    <div class="textWrap" style="max-width: 250px">
                      {{ getFileName(item.summary_field_1) }}
                    </div>
                  </v-tooltip>
                </template>
                <template v-slot:[`item.summary_field_2`]="{ item }">
                  <div
                    v-if="
                      item.summary_field_2 == undefined ||
                      item.summary_field_2 == null
                    "
                  >
                    -
                  </div>
                  <v-tooltip bottom v-else>
                    <template v-slot:activator="{ on }">
                      <div class="caption" v-on="on">
                        {{
                          getFileName(item.summary_field_2).length >= 10
                            ? getFileName(item.summary_field_2).substr(0, 10) +
                              "..."
                            : getFileName(item.summary_field_2)
                        }}
                      </div>
                    </template>
                    <div class="textWrap" style="max-width: 250px">
                      {{ getFileName(item.summary_field_2) }}
                    </div>
                  </v-tooltip>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalCount === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalCount} workflows`
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

    <div v-if="componentCheck == 1">
      <FormInfo
        :submittedInfo="submittedInfo"
        :formDetails="formDetails"
        :formAction="formAction"
        :rowInfo="rowInfo"
        @clicked="submittedInfo = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <ReportGeneration
        :reportBuilderDialog="reportBuilderDialog"
        v-on:sucessMsg="success_info"
        v-on:errorMsg="error_info"
        @clicked="reportBuilderDialog = false"
      />
    </div>

    <div v-if="toggle_exclusive == 'reportsTransactions'">
      <AllReports  :globalSearch="globalSearch"
 :key="reportKey" />
    </div>
    <!-- <div class="text-left" v-if="toggle_exclusive == 'approvals'">
      <ApprovalsList />
    </div> -->
    <div v-if="toggle_exclusive == 'agingReports'">
      <AgingReports
        ref="AgingReports"
        :globalSearch="globalSearch"
        :workflow="filterWorkflows"
        :parentUserselect="userselect"
        :summaryLabel="summarylabel"
        :searchSummary="searchsummary"
        @selection-change="handleAgingSelectionChange"
      />
    </div>
    <div v-if="toggle_exclusive == 'knockoffWrk'">
      <KnockoffWrkflow :globalSearch="globalSearch" />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'systemApprovals'">
      <ApprovalsList  :globalSearch="globalSearch"/>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import KnockoffWrkflow from "@/components/WorkflowReports/ReportDialogs/KnockoffWrkflow.vue";
import ApprovalsList from "@/components/SettingsDialogs/ApprovalsList.vue";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import moment from "moment";
import SnackBar from "@/components/SnackBar.vue";
import { list_all_workflow_transactionsv2 } from "@/graphql/queries.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";

import FormInfo from "@/components/FormFields/FormInfo.vue";
import AllReports from "@/components/WorkflowReports/AllReports.vue";
import ReportGeneration from "@/components/WorkflowReports/ReportDialogs/ReportGeneration.vue";
import AgingReports from "@/components/WorkflowReports/AgingReports.vue";
import OverlayComp from "@/components/OverlayComp.vue";
import { get_workflow_payload } from "@/mixins/GetWorkflowDetails.js";
// import { get_all_workflows } from "@/mixins/GetAllWorkflows.js";
import { get_workflows } from "@/mixins/GetWorkflowsummary.js";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    SnackBar,
    FormInfo,
    AllReports,
    ReportGeneration,
    OverlayComp,
    AgingReports,
    ApprovalsList,
    KnockoffWrkflow,
    CreateExternalTicketDialog,
  },
  mixins: [
    get_workflow_payload,
    // get_all_workflows,
    get_all_org_users,
    get_workflows,
  ],
  data() {
    return {
      search: "",
      searchworkflow: "",
      searchuser: null,
      workflowSelect: "ALL",
      modal: false,
      endmodal: false,
      userselect: "",
      next_token: null,
      allTransactionItems: "ALL",
      pagination: {
        rowsPerPage: 20,
        itemsPerPage: 20,
      },
      SnackBarComponent: {},
      userArray: [],
      headers: [
        {
          title: "Workflow Name/ID",
          key: "workflow_name",
          sortable: false,
        },
        // { text: "Transaction ID", key: "transaction_id", sortable: false },
        { title: "Summary Field 1", key: "summary_field_1", sortable: false },
        { title: "Summary Field 2", key: "summary_field_2", sortable: false },
        {
          title: "Initiated By",
          key: "workflow_initiated_by",
          sortable: false,
        },

        {
          title: "Intiated On",
          key: "workflow_initiated_on",
          sortable: false,
        },
        {
          title: "Acted On",
          key: "workflow_aprroved_on",
          sortable: false,
        },
        { title: "Status", key: "approval_status", sortable: false },
        {
          title: "Pending On",
          key: "pending_on",
          sortable: false,
        },
        {
          title: "Acted By",
          key: "approval_user_email_id",
          sortable: false,
        },
      ],
      tableData: [],
      transaction_Items: [
        { title: "All", value: "ALL" },
        { title: "Completed", value: "COMPLETED" },
        // { title: "Inprogress ", value: "INPROGRESS" },
        { title: "Rejected", value: "REJECTED" },
        { title: "Withdrawn", value: "WITHDRAWN" },
      ],
      tableLoading: false,
      fixed: true,
      submittedInfo: false,
      formDetails: {},
      formAction: "",
      selectedDate: "",
      minmonth: "",
      summarylabel: "",
      searchsummary: "",
      selectItems: [],
      componentCheck: 0,
      toggle_exclusive: "agingReports",
      reportBuilderDialog: false,
      reportKey: 0,
      // Set default dates - From Date as 7 days ago, To Date as today
      date: (() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return sevenDaysAgo.toISOString().substr(0, 10);
      })(),
      todate: new Date().toISOString().substr(0, 10),
      workflowItems: [],
      overlay: false,
      filterWorkflows: "",
      workflowCheck: false,
      allUSersNames: [],
      allOrgUsers: [],
      search: "",
      datePicker: false,
      datePickerTo: false,
      computedDateFormatted: this.formatDate(new Date()),
      dataFormatted: this.formatDate(new Date()),
      tempDate: null,
      tempDateTo: null,
      date: null,
      currentPage: 1,
      itemsPerPage: 20,
      isFetching: false,
      windowHeight: 0,
    globalSearch: "",

      // Aging Reports Data Properties
      agingUserselect: "ALL",
      agingSearchuser: "",
      agingUserArray: [],
      agingSelectedItemsForward: [],

      // Filter Drawer Properties
      showFilterDrawer: false,
      goLoading: false,

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
    this.filterWorkflows = "";
    this.height = window.innerHeight - 280;
    this.windowHeight = window.innerHeight - 250;
    this.selectedDate = this.get_orgdate(
      this.$store.getters.GetUserObj.organization.organization_created_on
    );
    this.minmonth = moment(this.selectedDate, "MM/DD/YYYY").format(
      "YYYY-MM-DD"
    );
    this.tableLoading = true;
    this.$store.commit("Setnamesearch", "");
    await this.get_all_org_users(),
      localStorage.setItem("orgUsers", JSON.stringify(this.orgUsers)),
      await Promise.all([
        // (this.allOrgUsers = this.orgUsers),
        // this.get_all_workflows(),
        this.get_transaction(),
        this.get_workflows(),
      ]);
    this.allUSersNames = this.orgUsers;
    await this.fetch_all_workflows();
    this.initAgingReportsData();
  },
  watch: {
  
    currentPage() {
      this.updatePageItems();
    },

    filterWorkflows(newVal) {
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
  },
  computed: {
  
    modernHeaders() {
      return [
        { title: "Workflow Name/ID", key: "workflow_name", sortable: false },
        { title: "Summary Field 1", key: "summary_field_1", sortable: false },
        { title: "Summary Field 2", key: "summary_field_2", sortable: false },
        {
          title: "Initiated By",
          key: "workflow_initiated_by",
          sortable: false,
        },
        { title: "Intiated On", key: "workflow_initiated_on", sortable: false },
        { title: "Acted On", key: "workflow_aprroved_on", sortable: false },
        { title: "Status", key: "approval_status", sortable: false },
        { title: "Pending On", key: "pending_on", sortable: false },
        { title: "Acted By", key: "approval_user_email_id", sortable: false },
      ];
    },
    filteredTableData() {
  if (!this.globalSearch || this.globalSearch.trim() === "") {
    return this.tableData;
  }

  const search = this.globalSearch.toLowerCase();

  return this.tableData.filter(row =>
    Object.values(row).some(val =>
      val !== null &&
      val !== undefined &&
      String(val).toLowerCase().includes(search)
    )
  );
},

    totalCount() {
    return this.filteredTableData.length;
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
    },
    computedDateDisplay() {
      return this.displayFormatDate(this.computedDateFormatted);
    },
    dataDisplayFormatted() {
      return this.displayFormatDate(this.dataFormatted);
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
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
    activeFiltersCount() {
      let count = 0;

      // Count date filters
      if (this.computedDateDisplay && this.computedDateDisplay !== "") {
        count++;
      }
      if (this.dataDisplayFormatted && this.dataDisplayFormatted !== "") {
        count++;
      }

      // Count status filter (if not default)
      if (this.allTransactionItems && this.allTransactionItems !== "ALL") {
        count++;
      }

      // Count user filter (if not empty)
      if (this.userselect && this.userselect !== "") {
        count++;
      }

      // Count workflow filter (if not empty)
      if (this.filterWorkflows && this.filterWorkflows !== "") {
        count++;
      }

      // Count summary filter (if not empty)
      if (this.summarylabel && this.summarylabel !== "") {
        count++;
      }

      // Count search summary (if not empty)
      if (this.searchsummary && this.searchsummary !== "") {
        count++;
      }

      return count;
    },
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
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
    onTabSwitch() {
      if (
        this.toggle_exclusive == "alltransactions" ||
        this.toggle_exclusive == "agingReports"
      ) {
        this.clearFilters();
      }
    },
    async updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;

      const end = start + this.itemsPerPage;
      // Check if we need more data from API
      if (end > this.tableData.length && this.next_token) {
        await this.get_transaction(true);
      }

      this.paginatedItems = this.filteredTableData.slice(start, end);
    },
    displayFormatDate(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    saveDate() {
      this.date = this.tempDate;
      this.computedDateFormatted = this.tempDate
        ? this.formatDate(this.tempDate)
        : "";
      this.datePicker = false;

      // Reset To Date if From Date is after current To Date
      if (this.computedDateFormatted && this.dataFormatted) {
        if (this.computedDateFormatted > this.dataFormatted) {
          this.dataFormatted = this.computedDateFormatted;
          this.tempDateTo = this.computedDateFormatted;
        }
      }
    },
    saveDateTo() {
      this.date = this.tempDateTo;
      this.dataFormatted = this.tempDateTo
        ? this.formatDate(this.tempDateTo)
        : "";
      this.datePickerTo = false;
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
    check_from_date(date) {
      this.$refs.dialog1.save(date);
      this.todate = new Date().toISOString().substr(0, 10);
    },
    clear_data_field() {
      this.allTransactionItems = "ALL";
      this.userselect = "";
      this.summarylabel = "";
      this.selectItems = [];
      this.filterWorkflows = "";
      this.searchsummary = "";
      this.searchuser = "";
      this.searchworkflow = "";

      // Set default dates - From Date as 7 days ago, To Date as today
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      this.date = sevenDaysAgo.toISOString().substr(0, 10);
      this.todate = today.toISOString().substr(0, 10);
      this.computedDateFormatted = this.formatDate(sevenDaysAgo);
      this.dataFormatted = this.formatDate(today);
      this.tempDate = this.date;
      this.tempDateTo = this.todate;
      this.currentPage = 1;
      this.tableData = [];
      this.paginatedItems = [];
      this.next_token = null;
      this.get_transaction();
    },
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    get_orgdate(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    get_scanlogs_pagination() {
      const inputDate = new Date(this.date);
      inputDate.setDate(inputDate.getDate() + 1);
      const convertedDate = new Date(inputDate).toISOString().substr(0, 10);
      // this.todate = convertedDate;
      // this.tableData = [];
      // this.get_transaction();
      // this.get_transaction();
    },

    back_call() {
      this.$router.push({ name: "AdminLevelApps" });
    },

    fetch_all_workflows() {
      this.workflowItems = [];
      // this.allOrgWorkflows.forEach((element) => {
      //   this.workflowItems.push(element);
      // });
      this.summaryOrgWorkflows.forEach((element) => {
        this.workflowItems.push(element.workflow_name);
      });
      // console.log(this.allOrgWorkflows);
      this.workflowItems.sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            title: element.full_user_name,
            user_id: element.user_email_id,
          });
          // this.userArray.unshift({
          //   full_user_name: "All",
          //   user_id: "ALL",
          // });
        }
      });
    },

    get_data() {
      if (this.userselect != null) {
        this.tableData = [];
        this.get_transaction();
      }
    },

    filter_data(val) {
      if (this.summarylabel != "" && this.searchsummary == "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Search by summary with a minimum of three characters",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.paginatedItems = [];
        this.tableData = [];
        this.next_token = null;
        this.get_transaction();
      }
    },

    success_info(val) {
      this.reportBuilderDialog = false;
      this.reportKey += 1;
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    clear_data() {
      this.reportKey = 0;

      if (this.toggle_exclusive == "alltransactions") {
        this.allTransactionItems = "ALL";
        this.userselect = "";
        this.summarylabel = "";
        this.selectItems = [];
        this.filterWorkflows = "";

        // Set default dates - From Date as 7 days ago, To Date as today
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        this.date = sevenDaysAgo.toISOString().substr(0, 10);
        this.todate = today.toISOString().substr(0, 10);
        this.computedDateFormatted = this.formatDate(sevenDaysAgo);
        this.dataFormatted = this.formatDate(today);
        this.tempDate = this.date;
        this.tempDateTo = this.todate;
        this.tableData = [];
        this.paginatedItems = [];
        this.next_token = null;
        this.get_transaction();
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
    getcal() {
      this.modal = true;
    },
    dateformating(todate) {
      if (!todate) return null;
      const [year, month, day] = todate.split("-");
      return `${day}/${month}/${year}`;
    },

    get_transaction_Pagination() {
      if (this.next_token) {
        this.get_transaction();
      }
    },

    get_date(date) {
      return formatedatetime(date);
    },

    onPageChange() {
      this.updatePageItems();
    },
    async get_transaction(isNextPage = false) {
      if (this.isFetching) return;
      // console.log(this.filterWorkflows);
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_workflow_transactionsv2, {
            input: {
              user_email_id: data.user.user_email_id,
              approval_status: this.allTransactionItems,
              limit: 21,
              nextToken: isNextPage ? this.next_token : null,
              organization_id: data.organization.organization_id,
              workflow_name_search: "",
              initiated_by: this.userselect == null ? "" : this.userselect,
              pending_on: "ALL",
              // start_date: this.computedDateFormatted,
              // end_date: this.dataFormatted,
              workflow_name:
                this.filterWorkflows == null ? "" : this.filterWorkflows,
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
        var response = JSON.parse(result.data.list_all_workflow_transactionsv2);

        var dataArray = [];
        // this.next_token = response.nextToken;

        if (response.Status == "SUCCESS") {
          const newItems = response.workflow || [];
          this.next_token = response.nextToken || null;
          this.tableData = [...this.tableData, ...newItems];

          this.tableData = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.initiate_id === obj.initiate_id)
          );

          this.tableData.forEach((item) => {
            item.pending_on = item.approval_user_email_id;
          });

          this.updatePageItems();
          // console.log(this.tableData);

          // this.updatePageItems();
          // dataArray = response.workflow;

          // let array = this.tableData.concat(dataArray);

          // this.tableData = array;
          // const uniqueArrayOfObjects = this.tableData.filter(
          //   (obj, index, self) =>
          //     index === self.findIndex((o) => o.initiate_id === obj.initiate_id)
          // );
          // this.tableData = uniqueArrayOfObjects;
          // for (let i = 0; i < this.tableData.length; i++) {
          //   this.tableData[i].pending_on =
          //     this.tableData[i].approval_user_email_id;
          // }
        }
        // console.log(this.tableData);
      } catch (error) {
        this.tableLoading = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.tableLoading = false;
        this.isFetching = false;
      }
    },

    input_check() {
      if (this.filterWorkflows != "") {
        this.workflowCheck = true;
        this.summarylabel = "";
        this.searchsummary = "";
      }
    },

    async handleClick(click, value) {
      this.overlay = true;
      this.rowInfo = value.item;
      var initaorName = this.fetch_user_name(value.item.workflow_initiated_by);
      localStorage.setItem("initiatedBy", initaorName);
      this.$store.commit("SetInitiatorId", value.item.initiate_id);
      await this.get_workflow_payload();
      // console.log(this.workflowInfoPaylod);
      this.overlay = false;
      // console.log(this.formDetails);
      this.componentCheck = 1;
      this.submittedInfo = true;
      this.formDetails = this.workflowInfoPaylod;
      this.formAction = "ALL";
    },

    generate_report() {
      this.componentCheck = 2;
      this.reportBuilderDialog = true;
    },

    handleSortChange(_newSortBy) {
      // Implement the logic to handle sort change
    },

    // Aging Reports Methods
    agingFilterData() {
      // Trigger filter in AgingReports component
      if (this.$refs.agingReports) {
        this.$refs.agingReports.filter_data();
      }
    },

    agingBulkForward() {
      // Trigger bulk forward in AgingReports component
      if (this.$refs.AgingReports) {
        this.$refs.AgingReports.bulk_forward();
      }
    },

    handleAgingSelectionChange(selected) {
      // Update the agingSelectedItemsForward with selected items from AgingReports
      this.agingSelectedItemsForward = selected;
    },

    // Initialize aging reports data
    initAgingReportsData() {
      this.agingUserArray = [];
      this.agingUserArray.push({
        title: "ALL",
        user_id: "ALL",
      });
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.agingUserArray.push({
            title: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
    },

    // Filter drawer methods
    closeFilterDrawer() {
      this.showFilterDrawer = false;
    },

    applyFilterFromDrawer() {
      if (this.toggle_exclusive == "agingReports") {
        if (this.$refs.AgingReports) {
          this.$refs.AgingReports.fetch_workflow_aging_records();
          this.closeFilterDrawer();
        }
      } else {
        this.goLoading = true;
        this.filter_data();
        this.closeFilterDrawer();
        this.goLoading = false;
      }
    },

    clearFilters() {
      // Reset to default dates (7 days ago to today)
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      this.date = sevenDaysAgo.toISOString().substr(0, 10);
      this.todate = today.toISOString().substr(0, 10);
      this.computedDateFormatted = this.formatDate(sevenDaysAgo);
      this.dataFormatted = this.formatDate(today);
      this.tempDate = this.date;
      this.tempDateTo = this.todate;
      this.allTransactionItems = "ALL";
      this.userselect = "";
      this.summarylabel = "";
      this.selectItems = [];
      this.filterWorkflows = "";
      this.searchsummary = "";
      this.searchuser = "";
      this.searchworkflow = "";
      this.currentPage = 1;
      this.tableData = [];
      this.paginatedItems = [];
      this.nextToken = null;
      this.get_transaction();
      if (this.$refs.AgingReports) {
        this.$refs.AgingReports.fetch_workflow_aging_records();
      }
    },

    // Method to open date picker and set temp date
    openDatePicker() {
      if (!this.tempDate) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        this.tempDate = sevenDaysAgo.toISOString().substr(0, 10);
      }
      this.datePicker = true;
    },

    openDatePickerTo() {
      if (!this.tempDateTo) {
        this.tempDateTo = new Date().toISOString().substr(0, 10);
      }
      this.datePickerTo = true;
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

/* Action Button Styles */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  min-height: 36px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
}

.generate-btn {
  background: #db4c77 !important;
}

.generate-btn:hover {
  background: #c2185b !important;
}

/* Aging Toolbar Styles */
.aging-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-btn {
  background: #db4c77 !important;
}

.filter-btn:hover {
  background: #c2185b !important;
}

.bulk-btn {
  background: #28a745 !important;
}

.bulk-btn:hover {
  background: #218838 !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Legacy Styles (keeping for reference) */
.theme-toggle {
  background-color: transparent;
  border-radius: 10px;
  padding: 4px;
  display: inline-flex;
}

.theme-btn {
  border-radius: px !important;
}

.theme-btn.v-btn--active {
  background-color: #1e3e5c !important;
  color: #1a202c !important;
}
.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}
.component-wrapper {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  /* or set a fixed height if needed */
}

.fixed-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-spacer {
  height: 48px; /* or match your toolbar height (56px, etc) */
}

.scrollable-content {
  overflow-y: auto;
  flex-grow: 1;
  padding: 12px;
}

.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}

.pagination-container {
  min-width: 160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-footer {
  margin: 0;
  padding: 0;
  display: inline-flex;
}

.pagination-footer :deep(.v-pagination__list) {
  background: transparent;
  justify-content: flex-end;
}

.pagination-footer :deep(.v-pagination__item) {
  border-radius: 50%;
  margin: 0 2px;
}

.pagination-footer :deep(.v-pagination__item--is-active) {
  background-color: var(--v-primary-base);
  color: white;
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

/* Card Container */
.card-container {
  position: relative;
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

.filter-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.apply-filter-btn {
  background: #db4c77 !important;
  color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 40px !important;
  min-height: 40px !important;
}

.clear-filter-btn {
  background: #f5f5f5 !important;
  color: #666 !important;
  text-transform: none !important;
  font-weight: 500 !important;
  height: 40px !important;
  min-height: 40px !important;
}

/* Filter Drawer Styles */
.filter-drawer {
  position: fixed !important;
  top: 0 !important;
  height: 100vh !important;
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

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px;
  }

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
}
</style>
