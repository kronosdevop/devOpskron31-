<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-human-edit</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Data Corrections</span>
          <span class="header-subtitle"
            >Review and manage data corrections</span
          >
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

        <!-- Add Data Correction Button -->
        <v-btn
          color="primary"
          size="small"
          class="text-capitalize"
          @click="add_data_correction()"
          style="
            background: #db4c77 !important;
            color: white !important;
            margin-right: 16px;
          "
        >
          <v-icon class="mr-1">mdi-plus</v-icon>
          Add Data Correction
        </v-btn>

        <v-btn
          color="primary"
          size="small"
          class="text-capitalize"
          @click="back_action()"
          prepend-icon="mdi-step-backward"
          style="background: #db4c77 !important; color: white !important"
        >
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
              <v-data-table
                :headers="headers"
                :items="paginatedItems"
                :loading="tableLoading"
                :sort-by="['datacorrected_correct_on']"
                :items-per-page="itemsPerPage"
                :page="currentPage"
                :server-items-length="totalItems"
                hide-default-footer
                class="modern-data-table"
                density="comfortable"
                hover
                :fixed-header="true"
                :height="windowHeight"
                @update:sort-by="handleSortChange"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1" class="mb-4"
                      >mdi-human-edit-outline</v-icon
                    >
                    <div class="text-h6 text-grey mb-2">
                      No Data Corrections Found
                    </div>
                    <div class="text-body-2 text-grey">
                      Try adjusting your search criteria or add a new data
                      correction.
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
                      Loading data corrections...
                    </div>
                  </div>
                </template>

                <!-- Member Name/ID Column -->
                <template v-slot:[`item.user_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-avatar size="24" color="primary" class="mr-3">
                      <span
                        class="white--text font-weight-medium"
                        style="font-size: 10px"
                      >
                        {{ (item.user_name || "U").substring(0, 1).toUpperCase() }}
                      </span>
                    </v-avatar> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.user_name || "N/A" }}
                      </div>
                      <div class="caption text-medium-emphasis">
                        {{ item.member_id || "N/A" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Location Column -->
                <template v-slot:[`item.location_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3">mdi-map-marker</v-icon> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.location_name || "Unknown Location" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Corrected For Column -->
                <template v-slot:[`item.swiped_time`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="grey" class="mr-2">mdi-calendar-clock</v-icon> -->
                    <div>
                      <div class="caption font-weight-medium">
                        {{ get_date(item.swiped_time) }}
                      </div>
                      <div class="caption text-medium-emphasis">
                        {{ get_time(item.swiped_time) }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Corrected On Column -->
                <template v-slot:[`item.datacorrected_correct_on`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="16" color="success" class="mr-2">mdi-check-circle</v-icon> -->
                    <div>
                      <div class="caption font-weight-medium">
                        {{ get_date(item.datacorrected_correct_on) }}
                      </div>
                      <div class="caption text-medium-emphasis">
                        {{ get_time(item.datacorrected_correct_on) }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Approved By Column -->
                <template v-slot:[`item.datacorrected_by`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-icon size="20" color="primary" class="mr-3">mdi-account-check</v-icon> -->
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.datacorrected_by || "N/A" }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Comments Column -->
                <template v-slot:[`item.datacorrected_comments`]="{ item }">
                  <v-tooltip location="top">
                    <template v-slot:activator="{ on }">
                      <div class="d-flex align-center" v-on="on">
                        <!-- <v-icon size="16" color="grey" class="mr-2">mdi-comment-text</v-icon> -->
                        <span
                          class="caption text-truncate"
                          style="max-width: 200px"
                        >
                          {{
                            item.datacorrected_comments == ""
                              ? "-"
                              : item.datacorrected_comments
                          }}
                        </span>
                      </div>
                    </template>
                    <div style="max-width: 300px">
                      <div class="font-weight-medium mb-1">Comments</div>
                      <div>
                        {{
                          item.datacorrected_comments == ""
                            ? "No comments available"
                            : item.datacorrected_comments
                        }}
                      </div>
                    </div>
                  </v-tooltip>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalItems} data corrections`
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
      <AddDatacorrection
        :datacorrectionDialog="datacorrectionDialog"
        @clicked="datacorrectionDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:dataCorrection="data_correction_refresh"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { format_Date, formatTime } from "@/JsonFiles/DateFormate.js";
import { list_all_organizations_swipes } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import AddDatacorrection from "@/components/PresenceApp/PopUps/AddDatacorrection.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "@/components/Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    AddDatacorrection,
    CreateExternalTicketDialog,
    SnackBar,
  },
  data() {
    return {
      search: "",
      searchQuery: "",
      sortBy: [{ key: "datacorrected_correct_on", order: "desc" }],
      tableLoading: false,
      tableData: [],
      SnackBarComponent: {},
      componentCheck: 0,
      datacorrectionDialog: false,
      fixed: true,
      next_token: null,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      headers: [
        {
          title: "Member Name/ID",
          value: "user_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Location",
          value: "location_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Corrected For",
          value: "swiped_time",
          sortable: true,
          align: "start",
        },
        {
          title: "Corrected On",
          value: "datacorrected_correct_on",
          sortable: true,
          align: "start",
        },
        {
          title: "Approved By",
          value: "datacorrected_by",
          sortable: true,
          align: "start",
        },
        {
          title: "Comments",
          value: "datacorrected_comments",
          sortable: true,
          align: "start",
        },
      ],
      currentPage: 1,
      itemsPerPage: 20,
      totalItems: 0,
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
  created() {
    this.windowHeight = window.innerHeight - 250;
    this.get_data_correction();
  },
  watch: {
    currentPage(newVal, oldVal) {
      // When the page changes, check if we need to load more data
      if (newVal > oldVal && this.next_token) {
        // User is going to next page and we have more data to load
        this.get_data_correction();
      } else {
        // Just scroll to top of table for same page or going back
        const table = document.querySelector(".modern-data-table");
        if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
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
    back_action() {
      this.$store.commit("SetattendenceBack", true);
      this.$router.push("/home/UserLevel");
    },
    add_data_correction() {
      this.componentCheck = 1;
      this.datacorrectionDialog = true;
    },
    get_swipe_pagination() {
      if (this.next_token) {
        this.get_data_correction();
      }
    },
    get_date(val) {
      return format_Date(val / 1000);
      // const d = new Date(parseInt(val));
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
    get_time(date) {
      return formatTime(date / 1000);

      // let a = new Date(date).toLocaleTimeString("en-In", {
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   second: "2-digit",
      // });
      // return a.toUpperCase();
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.datacorrectionDialog = false;
      this.tableData = [];
      this.next_token = null;
      this.currentPage = 1;
      this.totalItems = 0;
      this.get_data_correction();
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

    async get_data_correction() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      // Reset pagination if this is the first load (no next_token)
      if (!this.next_token) {
        this.currentPage = 1;
        this.totalItems = 0;
      }
      try {
        let result = await API.graphql(
          graphqlOperation(list_all_organizations_swipes, {
            input: {
              user_email_id: data.user.user_email_id,
              swipe_source: "DATACORRECTION",
              organization_id: data.organization.organization_id,
              limit: 100,
              nextToken: this.next_token,
            },
          })
        );

        this.tableLoading = false;

        var response = result.data.list_all_organizations_swipes;
        if (response.Status == "SUCCESS") {
          this.next_token = response.nextToken;

          if (this.next_token) {
            // If we have more data, concatenate to existing array
            let array = this.tableData.concat(response.data);
            this.tableData = array;
          } else {
            // If no more data, concatenate what we have (don't replace)
            if (response.data && response.data.length > 0) {
              let array = this.tableData.concat(response.data);
              this.tableData = array;
            }
          }

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.swipe_id === obj.swipe_id)
          );
          this.tableData = uniqueArrayOfObjects;

          // Update total items for pagination
          this.totalItems = this.tableData.length;
        } else {
          this.tableLoading = false;
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
      }
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (
        key === "user_name" ||
        key === "member_id" ||
        key === "location_name" ||
        key === "datacorrected_by" ||
        key === "datacorrected_comments"
      ) {
        return value.toLowerCase();
      }
      if (key === "swiped_time" || key === "datacorrected_correct_on") {
        return new Date(value).getTime();
      }
      return value;
    },
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
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

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
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

/* Modern Header Section */
.modern-header-section {
  background: white;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(219, 76, 119, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.header-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #db4c77;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.header-actions {
  display: flex;
  align-items: center;
}

.header-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(219, 76, 119, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.header-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #db4c77;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 12px;
  color: #666;
  line-height: 1.2;
}

.header-actions {
  display: flex;
  align-items: center;
}

.card-container {
  padding: 0 24px 24px;
}

.modern-data-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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

.modern-data-table :deep(.v-data-table__thead th) {
  background-color: #f7f8fa;
  color: #333;
  font-weight: bold;
  font-size: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.modern-data-table :deep(.v-data-table__tbody td) {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #eee;
}

.modern-data-table :deep(.v-data-table__tbody tr:last-child td) {
  border-bottom: none;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f8fa;
  border-top: 1px solid #eee;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.04);
}

.footer-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-btn {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 4px;
  font-size: 14px;
  color: #666;
  border: 1px solid #eee;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #db4c77;
  color: white;
}

.pagination-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
}

.page-numbers .v-btn {
  margin: 0 4px;
}

.page-numbers .v-btn--text {
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  border: 1px solid #eee;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.page-numbers .v-btn--text:hover:not(:disabled) {
  background-color: #db4c77;
  color: white;
}

.page-numbers .v-btn--text.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.page-numbers .v-btn--text.inactive-page {
  color: #666 !important;
}
</style>
