<template>
  <div>
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-calendar-check</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">My Events</span>
          <span class="header-subtitle">Manage your events</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <v-select
          density="compact"
          variant="outlined"
          v-model="all_event_Items"
          :items="event_Items"
          label="Filter By Status"
          @update:model-value="list_users"
          class="filter-select mr-4 mt-2"
          style="min-width: 200px; max-width: 250px"
        />
        <v-btn
          v-if="adminAppExists"
          @click="open_settings()"
          class="cardCss mr-4"
          size="small"
        >
          <!-- <v-icon start style="color: white !important">mdi-cog</v-icon> -->
          <span style="color: white !important">Admin Events  </span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-card flat  class="overflow-y-auto mt-10">
      <div >
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="paginatedItems"
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
                      >mdi-calendar-blank</v-icon
                    >
                    <div class="text-h6 grey--text mb-2">No Events Found</div>
                    <div class="text-body-2 grey--text">
                      No events available for you at the moment.
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
                    <div class="text-body-2 grey--text">Loading events...</div>
                  </div>
                </template>

                <!-- Event Name -->
                <template v-slot:[`item.event_name`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="20" color="primary" class="mr-3"
                      >mdi-calendar</v-icon
                    >
                    <div>
                      <div class="font-weight-medium text-body-2">
                        {{ item.event_name }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Description -->
                <template v-slot:[`item.event_description`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="grey" class="mr-2">mdi-text</v-icon>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <div
                          v-if="item.event_description"
                          class="caption text-truncate"
                          style="max-width: 200px"
                          v-on="on"
                        >
                          {{
                            item.event_description.length >= 30
                              ? item.event_description.substr(0, 30) + "..."
                              : item.event_description
                          }}
                        </div>
                        <div v-else class="caption">-</div>
                      </template>
                      <div class="textWrap" style="max-width: 250px">
                        {{ item.event_description }}
                      </div>
                    </v-tooltip>
                  </div>
                </template>

                <!-- Date -->
                <template v-slot:[`item.from_date`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="grey" class="mr-2"
                      >mdi-calendar-range</v-icon
                    >
                    <span class="caption">{{
                      get_date(item.from_date) + " to " + get_date(item.to_date)
                    }}</span>
                  </div>
                </template>

                <!-- Status -->
                <template v-slot:[`item.event_progress_status`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon
                      size="16"
                      class="mr-2"
                      :color="
                        item.event_progress_status === 'COMPLETED'
                          ? 'green'
                          : item.event_progress_status === 'LIVE'
                          ? 'orange'
                          : 'blue'
                      "
                    >
                      {{
                        item.event_progress_status === "COMPLETED"
                          ? "mdi-check-circle"
                          : item.event_progress_status === "LIVE"
                          ? "mdi-play-circle"
                          : "mdi-clock"
                      }}
                    </v-icon>
                    <span
                      class="caption"
                      :class="
                        item.event_progress_status === 'COMPLETED'
                          ? 'green--text'
                          : item.event_progress_status === 'LIVE'
                          ? 'orange--text'
                          : 'blue--text'
                      "
                    >
                      {{ item.event_progress_status }}
                    </span>
                  </div>
                </template>

                <!-- Actions -->
                <template v-slot:[`item.actions`]="{ item }">
                  <div v-if="item.event_capcity > 0" class="d-flex align-center">
                    <v-btn
                      v-if="
                        item.register_check == true &&
                        item.event_progress_status != 'COMPLETED'
                      "
                      size="x-small"
                      color="green"
                      class="white--text"
                      @click="visbility_action(item, 'eventregistartion')"
                    >
                      <v-icon size="14" class="mr-1">mdi-check</v-icon>
                      Registered
                    </v-btn>
                    <v-btn
                      v-if="
                        item.register_check == false &&
                        item.event_progress_status != 'COMPLETED'
                      "
                      size="x-small"
                      color="red"
                      class="white--text"
                      @click="visbility_action(item, 'eventunregistartion')"
                    >
                      <v-icon size="14" class="mr-1">mdi-close</v-icon>
                      Unregistered
                    </v-btn>
                    <span
                      v-if="item.event_progress_status == 'COMPLETED'"
                      class="caption"
                      >-</span
                    >
                  </div>
                  <div v-else class="d-flex align-center">
                    <v-btn
                      v-if="
                        item.register_check == true &&
                        item.event_progress_status != 'COMPLETED'
                      "
                      size="x-small"
                      color="green"
                      class="white--text"
                      disabled
                    >
                      <v-icon size="14" class="mr-1">mdi-check</v-icon>
                      Registered
                    </v-btn>
                    <v-btn
                      v-if="
                        item.register_check == false &&
                        item.event_progress_status != 'COMPLETED'
                      "
                      size="x-small"
                      color="red"
                      class="white--text"
                      disabled
                    >
                      <v-icon size="14" class="mr-1">mdi-close</v-icon>
                      Unregister
                    </v-btn>
                    <span
                      v-if="item.event_progress_status == 'COMPLETED'"
                      class="caption"
                      >-</span
                    >
                  </div>
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalItems} events`
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn
                    :disabled="currentPage === 1"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="currentPage = currentPage - 1"
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
    
    <div v-if="componet_check == 1">
      <EventRegistration
        :rowInfo="rowInfo"
        :displayEvents="displayEvents"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clciked="displayEvents = false"
        @check="pop_up"
      />
    </div>
  </div>
</template>
  
<script>
/* eslint-disable */
import { format_Date } from "@/JsonFiles/DateFormate.js";
import { portal_event_list_with_particular_users } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

import EventRegistration from "@/components/EventApp/EventPopups/EventRegistration.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
    EventRegistration,
  },
  data: () => ({
    adminAppExists: false,
    SnackBarComponent: {},
    rowInfo: {},
    componet_check: 0,
    all_event_Items: "ALL",
    fixed: true,
    event_Items: [
      { title: "All", value: "ALL" },
      { title: "Completed", value: "COMPLETED" },
      { title: "Upcoming", value: "UPCOMING" },
      { title: "Live", value: "LIVE" },
    ],
    register_check: null,
    tableLoading: false,
    displayEvents: false,
    tableData: [],
    headers: [
      { title: "Event Name", key: "event_name", sortable: false },
      {
        title: "Description",
        key: "event_description",
        sortable: false,
      },
      {
        title: "Date",
        key: "from_date",
        sortable: false,
      },

      { title: "Status", key: "event_progress_status", sortable: false },
      { title: "Actions", key: "actions", sortable: false },
    ],
    currentPage: 1,
    itemsPerPage: 20,
    windowHeight: 0,
  }),
  created() {
    this.fetch_admin_apps();
    this.windowHeight = window.innerHeight - 250;
    this.list_users();
  },
  computed: {
    totalItems() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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
  watch: {
    all_event_Items() {
      this.currentPage = 1;
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  methods: {
    open_settings() {
      this.$router.push("/home/EventPlanner");
    },
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      // Check if userObj and admin_apps exist
      if (
        !userObj ||
        !userObj.admin_apps ||
        !Array.isArray(userObj.admin_apps)
      ) {
        this.adminAppExists = false;
        return;
      }

      const adminExists = userObj.admin_apps.find(
        (app) => app.dashboard_unique_type === "EVENTS_ADMINS"
      );
      
      // Check if adminExists is defined before accessing its properties
      if (!adminExists) {
        this.adminAppExists = false;
        return;
      }
      
      if (adminExists.is_visible === false) {
        this.adminAppExists = false;
        return;
      }
      
      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    back_call() {
      this.$router.push({ name: "UserlevelApp" });
    },
    get_date(date) {
      return format_Date(date / 1000);
    },
    pop_up(val) {
      if (val == 0) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Email ID aldery Registered",
          timeout: 5000,
          Top: true,
        };
      } else if (val == 1) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Registration is closed",
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
      this.displayEvents = false;
      this.list_users();
    },
    visbility_action(info, displaytype) {
      this.componet_check = 1;
      this.rowInfo = {};
      this.displayEvents = true;
      this.rowInfo = {
        info: info,
        displaytype: displaytype,
      };
    },
    async list_users() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(portal_event_list_with_particular_users, {
            input: {
              organization_id: data.organization.organization_id,
              event_progress_status: this.all_event_Items,
              nextToken: null,
              limit: 100,
            },
          })
        );
        var check_status = JSON.parse(
          result.data.portal_event_list_with_particular_users
        ).Status;
        if (check_status == "SUCCESS") {
          var response = JSON.parse(
            result.data.portal_event_list_with_particular_users
          ).workflow;

          for (let i = 0; i < response.length; i++) {
            if (
              response[i].register_users.indexOf(data.user.user_email_id) > -1
            ) {
              response[i].register_check = true;
            } else {
              response[i].register_check = false;
            }
          }
          this.tableData = response;

          this.tableLoading = false;
          // this.updatePageItems(); // This line is removed as per the edit hint
        } else {
          this.tableLoading = false;
          this.tableData = [];
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: JSON.parse(
              result.data.portal_event_list_with_particular_users
            ).Message,
            timeout: 2000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
        this.tableLoading = false;
      }
    },
    handleSortChange(headers) {
      // Implement sorting logic based on the headers
      // console.log("Sorting by:", headers);
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select {
  max-width: 250px;
}

/* Header field styling for app bar */
.header-actions :deep(.v-field) {
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.header-actions :deep(.v-field__input) {
  color: #333 !important;
  font-size: 14px !important;
}

.header-actions :deep(.v-field__label) {
  color: #666 !important;
  font-size: 12px !important;
}

.header-actions :deep(.v-field__prepend-inner) {
  color: #666 !important;
}

.header-actions :deep(.v-field__append-inner) {
  color: #666 !important;
}

.header-actions :deep(.v-field__outline) {
  color: #e0e0e0 !important;
}

.header-actions :deep(.v-field--focused .v-field__outline) {
  color: #db4c77 !important;
}

.header-actions :deep(.v-text-field input::placeholder) {
  color: #999 !important;
}

.header-actions :deep(.v-select__selection) {
  color: #333 !important;
  font-size: 14px !important;
}

/* Ensure fields are visible */
.header-actions .v-text-field,
.header-actions .v-select {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
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
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #DB4C77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
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
</style>