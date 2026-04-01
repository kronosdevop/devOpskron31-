<template>
  <div>
    <OverlayComp :overlay="overlay" />

    <v-card flat class="overflow-y-auto">
      <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text class="pa-4">
              <v-data-table
                v-model="selectedItemsForward"
                :fixed-header="true"
                :headers="modernHeaders"
                :height="windowHeight"
                :items="paginatedFilteredItems"
                :loading="tableLoading"
                item-value="initiate_id"
                :items-per-page="itemsPerPage"
                :page="currentPage"
                :server-items-length="totalCount"
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
                      >mdi-format-list-bulleted</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">
                      No Aging Records Found
                    </div>
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
                    <div class="text-body-2 text-grey">Loading records...</div>
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
                <template v-slot:[`item.workflow_initiated_by`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="primary" class="mr-2"
                      >mdi-account</v-icon
                    > -->
                    <span class="caption">{{
                      fetch_user_name(item.workflow_initiated_by)
                    }}</span>
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
                <template v-slot:[`item.pending_on`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="primary" class="mr-2"
                      >mdi-account-clock</v-icon
                    > -->
                    <span class="caption">{{
                      item.pending_on != undefined
                        ? fetch_user_name(item.pending_on)
                        : "-"
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
                <template v-slot:[`item.pending_since`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="orange" class="mr-2"
                      >mdi-timer-sand</v-icon
                    > -->
                    <span class="caption">
                      {{
                        item.workflow_approval_on == undefined
                          ? calculateDaysFromEpoch(item.workflow_initiated_on)
                          : calculateDaysFromEpoch(item.workflow_approval_on)
                      }}
                    </span>
                  </div>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon
                    size="small"
                    class=""
                    @click.stop="bulk_reject(item)"
                    color="red"
                    >mdi-account-reactivate-outline</v-icon
                  >
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalCount === 0
                      ? "No Results"
                      : `Showing ${paginatedFilteredItems.length} of ${totalCount} workflows`
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
      <BulkForwardaging
        :allselecctedRecords="allselecctedRecords"
        :bulkForwardDialog="bulkForwardDialog"
        @clicked="bulkForwardDialog = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <BulkRejectaging
        :bulkitems="bulkitems"
        :bulkRejectDialog="bulkRejectDialog"
        @clicked="bulkRejectDialog = false"
        v-on:errorMsg="error_info"
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/
import BulkForwardaging from "@/components/WorkflowReports/ReportDialogs/BulkForwardaging.vue";
import BulkRejectaging from "@/components/WorkflowReports/ReportDialogs/BulkRejectaging.vue";
import { get_workflow_aging_records } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { get_workflow_payload } from "@/mixins/GetWorkflowDetails.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import OverlayComp from "@/components/OverlayComp.vue";
import FormInfo from "@/components/FormFields/FormInfo.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  props: {
    globalSearch: {
      type: String,
      default: "ALL",
    },
    parentUserselect: {
      type: String,
      default: "ALL",
    },
    workflow: {
      type: String,
      default: "ALL",
    },
    summaryLabel: {
      type: String,
      default: "",
    },
    searchSummary: {
      type: String,
      default: "",
    },
  },
  components: {
    OverlayComp,
    SnackBar,
    FormInfo,
    BulkForwardaging,
    BulkRejectaging,
  },
  mixins: [get_workflow_payload, get_all_org_users],
  data() {
    return {
      tableLoading: false,
      filterWorkflows: "ALL",
      summarylabel: "",
      searchsummary: "",
      selectedItemsForward: [],
      SnackBarComponent: {},
      searchuser: "",
      allselecctedRecords: [],
      userselect: this.parentUserselect,
      bulkRejectDialog: false,
      bulkForwardDialog: false,
      userArray: [],
      height: 0,
      fixed: true,
      bulkitems: {},
      tableData: [],
      search: "",
      componentCheck: 0,
      submittedInfo: false,
      formDetails: {},
      formAction: "",
      rowInfo: {},
      overlay: false,
      headers: [
        {
          title: "Workflow Name/ID",
          key: "workflow_name",
          sortable: false,
        },

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
          title: "Pending On",
          key: "pending_on",
          sortable: false,
        },

        {
          title: "Pending Since",
          key: "pending_since",
          sortable: false,
        },
        {
          title: "Action",
          key: "actions",
          sortable: false,
        },

        // {
        //   text: "Flow",
        //   value: "",
        //   sortable: false,
        // },
      ],
      nextToken: null,
      allUSersNames: [],
      allOrgUsers: [],
      itemsPerPage: 20,
      pagination: {
        rowsPerPage: 20,
        itemsPerPage: 20,
      },
      currentPage: 1,
      isFetching: false,
      paginatedItems: [],
      windowHeight: 0,
    };
  },
  async created() {
    this.allUSersNames = [];
    this.allOrgUsers = [];
    this.userArray = [];
    this.height = window.innerHeight - 240;
    this.windowHeight = window.innerHeight - 250;
    this.tableLoading = true;
    // Get user data from mixin
    await this.get_all_org_users();
    this.allUSersNames = this.orgUsers;
    this.allOrgUsers = this.orgUsers;

    this.fetch_recrords();
    this.tableData = [];
    this.tableLoading = true;
    this.fetch_workflow_aging_records();
  },
  watch: {
    globalSearch() {
      this.currentPage = 1;
    },
    workflow(newVal) {
      this.filterWorkflows = newVal;
      this.filter_data();
    },
    summaryLabel(val) {
      this.summarylabel = val;
      this.filter_data();
    },
    searchSummary(val) {
      this.searchsummary = val;
      this.filter_data();
    },

    currentPage() {
      this.updatePageItems();
    },
    parentUserselect(newVal) {
      this.userselect = newVal;
      this.filter_data();
    },
    orgUsers: {
      handler(newVal) {
        if (newVal && Array.isArray(newVal)) {
          this.allUSersNames = newVal;
          this.allOrgUsers = newVal;
          this.fetch_recrords();
        }
      },
      immediate: true,
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
        { title: "Pending On", key: "pending_on", sortable: false },
        { title: "Pending Since", key: "pending_since", sortable: false },
        { title: "Action", key: "actions", sortable: false },
      ];
    },
    filteredTableData() {
      if (!this.globalSearch || this.globalSearch.trim() === "") {
        return this.tableData;
      }

      const search = this.globalSearch.toLowerCase();

      return this.tableData.filter((row) =>
        Object.values(row).some(
          (val) => val && String(val).toLowerCase().includes(search)
        )
      );
    },

    paginatedFilteredItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      return this.filteredTableData.slice(start, end);
    },

    totalCount() {
      return this.filteredTableData.length;
    },

    pageCount() {
      return Math.ceil(this.filteredTableData.length / this.itemsPerPage);
    },
  },
  methods: {
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
    async updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;

      const end = start + this.itemsPerPage;
      // Check if we need more data from API
      if (end > this.tableData.length && this.next_token) {
        await this.fetch_workflow_aging_records(true);
      }

      this.paginatedItems = this.tableData.slice(start, end);
    },
    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.tableData = [];
      this.nextToken = null;
      this.bulkRejectDialog = false;
      this.bulkForwardDialog = false;
      this.selectedItemsForward = [];
      await this.fetch_workflow_aging_records();
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
        this.componentCheck = 2;
        this.bulkForwardDialog = true;
        this.allselecctedRecords = this.selectedItemsForward;
      }
    },
    bulk_reject(item) {
      this.componentCheck = 3;
      this.bulkRejectDialog = true;
      this.bulkitems = item;
    },
    fetch_recrords() {
      this.userArray = [];

      this.userArray.push({
        title: "ALL",
        user_id: "ALL",
      });

      // Add null check to prevent forEach error
      if (this.allOrgUsers && Array.isArray(this.allOrgUsers)) {
        this.allOrgUsers.forEach((element) => {
          if (element.user_status == "ACTIVE") {
            this.userArray.push({
              title: element.full_user_name,
              user_id: element.user_email_id,
            });
          }
        });
      }
    },
    calculateDaysFromEpoch(epochTimestamp) {
      // Convert the epoch timestamp to a Date object
      const epochDate = new Date(epochTimestamp * 1000); // Convert seconds to milliseconds

      // Get the current date
      const currentDate = new Date();

      // Calculate the difference in time (in milliseconds)
      const differenceInTime = currentDate - epochDate;

      // Convert the difference from milliseconds to days
      const differenceInDays = Math.floor(
        differenceInTime / (1000 * 60 * 60 * 24)
      );

      return differenceInDays + " " + "days";
    },
    fetch_user_name(value) {
      var name = "";

      // console.log(this.allOrgUsers);
      if (this.allUSersNames && Array.isArray(this.allUSersNames)) {
        this.allUSersNames.forEach((element) => {
          if (element.user_email_id == value) {
            name = element.full_user_name;
          }
        });
      }
      if (value == "SYSTEM") {
        name = "SYSTEM";
      }
      return name;
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
    async fetch_workflow_aging_records(isNextPage = false) {
      if (this.isFetching) return;

      this.isFetching = true;
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        const result = await API.graphql(
          graphqlOperation(get_workflow_aging_records, {
            input: {
              approval_status: "INPROGRESS",
              workflow_name:
                this.filterWorkflows == null
                  ? undefined
                  : this.filterWorkflows == "ALL"
                  ? undefined
                  : this.filterWorkflows,
              initiated_by:
                this.userselect == null
                  ? undefined
                  : this.userselect == ""
                  ? undefined
                  : this.userselect,
              user_email_id: data.user.user_email_id,

              limit: 51,

              nextToken: isNextPage ? this.next_token : null,

              // summary_field_1:
              //   this.summarylabel == "summary_field_1"
              //     ? this.searchsummary.trim().length == 0
              //       ? undefined
              //       : this.searchsummary
              //     : undefined,
              // summary_field_2:
              //   this.summarylabel == "summary_field_2"
              //     ? this.searchsummary.trim().length == 0
              //       ? undefined
              //       : this.searchsummary
              //     : undefined,
            },
          })
        );

        const response = JSON.parse(result.data.get_workflow_aging_records);

        if (response.Status === "SUCCESS") {
          const newItems = response.workflow || [];

          const merged = [...this.tableData, ...newItems];
          const uniqueItems = merged.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.initiate_id === obj.initiate_id)
          );

          uniqueItems.forEach((item) => {
            item.pending_on = item.approval_user_email_id;
          });

          this.tableData = uniqueItems;
          this.next_token = response.nextToken || null;

          this.updatePageItems();
        } else {
          this.tableData = [];
          this.next_token = null;
          this.updatePageItems();
        }
      } catch (error) {
        console.error("Error fetching workflow aging records:", error);
      } finally {
        this.isFetching = false;
        this.tableLoading = false;
      }
    },

    get_date(date) {
      return formatedatetime(date);
    },

    get_transaction_Pagination() {
      if (this.nextToken) {
        this.fetch_workflow_aging_records();
      }
    },
    filter_data() {
      this.nextToken = null;
      this.tableData = [];
      this.tableLoading = true;
      this.fetch_workflow_aging_records();
    },
    onSelectionChange(selected) {
      this.selectedItemsForward = selected;
      // Emit the selected items to parent component
      this.$emit("selection-change", selected);
    },
  },
};
</script>
<style scoped>
/* Card Container */
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
</style>