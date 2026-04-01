<template>
  <div>
    <!-- App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-calendar-multiple</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Event Management</span>
          <span class="header-subtitle">Create and manage events</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Search Field -->
        <v-text-field
          v-model="search"
          placeholder="Search events..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          style="
            min-width: 280px;
            max-width: 280px;
          "
          density="compact"
          class="search-pill mr-2"
          clearable
          @click:clear="search = ''"
        ></v-text-field>
        <!-- Action Buttons -->
        <v-btn
          @click="create_event()"
          class="text-capitalize cardCss mr-2 text-white"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Event</span>
        </v-btn>
        <v-btn
          v-if="adminAppExists"
          @click="back_call()"
          class="text-capitalize cardCss mr-2 text-white"
          size="small"
        >
          <v-icon>mdi-step-backward</v-icon>
          <span>Back</span>
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
          :items="filteredItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          density="compact"
          hover
          multi-sort
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg"
          :fixed-header="true"
          :height="windowHeight"
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-calendar-blank</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Events Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or create a new event.
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
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon
                    size="16"
                    :color="
                      item.event_visibility == undefined ||
                      item.event_visibility.visible_type == 'ALL_MEMBERS'
                        ? 'green'
                        : 'red'
                    "
                    v-on="on"
                    class="mr-2"
                  >
                    {{
                      item.event_visibility == undefined ||
                      item.event_visibility.visible_type == "ALL_MEMBERS"
                        ? "mdi-lock-open-variant-outline"
                        : "mdi-lock-outline"
                    }}
                  </v-icon>
                </template>
                <span
                  v-if="
                    item.event_visibility == undefined ||
                    item.event_visibility.visible_type == 'ALL_MEMBERS'
                  "
                  >All Members</span
                >
                <span v-else>{{
                  fetch_loc_name(item.event_visibility.visible_locations)
                }}</span>
              </v-tooltip>
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.event_name }}
                </div>
              </div>
            </div>
          </template>

          <!-- Event Description -->
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

          <!-- From Date -->
          <template v-slot:[`item.from_date`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2"
                >mdi-calendar-start</v-icon
              >
              <span class="caption">{{ fetch_value(item.from_date) }}</span>
            </div>
          </template>

          <!-- To Date -->
          <template v-slot:[`item.to_date`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="grey" class="mr-2"
                >mdi-calendar-end</v-icon
              >
              <span class="caption">{{ fetch_value(item.to_date) }}</span>
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

          <!-- Registered Users -->
          <template v-slot:[`item.no_of_registerd_users`]="{ item }">
            <div class="d-flex align-center">
              <v-icon size="16" color="primary" class="mr-2"
                >mdi-account-group</v-icon
              >
              <span v-if="item.no_of_registerd_users >= 1" class="caption">{{
                item.no_of_registerd_users
              }}</span>
              <span v-else class="caption">{{
                item.no_of_registerd_users
              }}</span>
              <v-tooltip bottom v-if="item.no_of_registerd_users >= 1">
                <template v-slot:activator="{ on }">
                  <v-icon
                    small
                    v-on="on"
                    class="ml-2"
                    color="primary"
                    @click="event_listing(item)"
                    >mdi-information-variant-circle</v-icon
                  >
                </template>
                <span>View</span>
              </v-tooltip>
            </div>
          </template>

          <!-- Action -->
          <template v-slot:[`item.action`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                small
                color="primary"
                @click="edit_event(item)"
                v-show="
                  item.event_progress_status != 'COMPLETED' &&
                  item.event_progress_status != 'LIVE'
                "
                class="mr-2"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                small
                color="red"
                @click="delete_event(item)"
                v-show="
                  item.event_progress_status != 'COMPLETED' &&
                  item.event_progress_status != 'LIVE'
                "
              >
                mdi-delete
              </v-icon>
              <span
                v-show="
                  item.event_progress_status == 'COMPLETED' ||
                  item.event_progress_status == 'LIVE'
                "
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
                    totalCount === 0
                      ? "No Results"
                      : `Showing ${filteredItems.length} of ${totalCount} events`
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
                  <div class="page-numbers">
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
      </div>
    </v-card>
    <div v-if="componentCheck == 1">
      <EventCreation
        :createEvent="createEvent"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="createEvent = false"
      />
    </div>

    <div v-if="componentCheck == 2">
      <EventEdit
        :editEvent="editEvent"
        :eventInfo="eventInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editEvent = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <EventDeletion
        :eventDelete="eventDelete"
        :eventInfo="eventInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="eventDelete = false"
      />
    </div>
    <div v-if="componentCheck == 4">
      <RegisteredUsers
        :eventInfo="eventInfo"
        :Eventlist="Eventlist"
        v-on:errorMsg="error_info"
        @clicked="Eventlist = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_location_details } from "@/mixins/GetLocations.js";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import RegisteredUsers from "@/components/EventApp/EventPopups/RegisteredUsers.vue";
import EventCreation from "@/components/EventApp/EventPopups/EventCreation.vue";
import EventEdit from "@/components/EventApp/EventPopups/EventEdit.vue";
import EventDeletion from "@/components/EventApp/EventPopups/EventDeletion.vue";
import SnackBar from "@/components/SnackBar.vue";
import { list_events_details } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    RegisteredUsers,
    SnackBar,
    EventEdit,
    EventDeletion,
    EventCreation,
  },
  mixins: [get_location_details],
  data() {
    return {
      headers: [
        { title: "Event Name", key: "event_name", sortable: false },
        {
          title: "Event Description",
          key: "event_description",
          sortable: false,
        },
        { title: "From Date", key: "from_date", sortable: false },
        { title: "To Date", key: "to_date", sortable: false },
        {
          title: "Status",
          key: "event_progress_status",
          sortable: false,
        },

        {
          title: "#Registered",
          key: "no_of_registerd_users",
          sortable: false,
        },
        { title: "Action", key: "action", sortable: false },
      ],
      tableLoading: false,
      adminAppExists: false,
      tableData: [],
      componentCheck: 0,
      createEvent: false,
      SnackBarComponent: {},
      editEvent: false,
      Eventlist: false,
      eventInfo: {},
      eventDelete: false,
      locdata: [],
      next_token: null,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      search: "",
      windowHeight: 0,
    };
  },
  async created() {
    this.windowHeight = window.innerHeight - 240;
    this.fetch_admin_apps();
    await this.get_location_details();
    this.locdata = this.locationList;
    await this.fetch_event_list();
    
  
  },
  computed: {
    totalTaskCount() {
      return this.masterData ? this.masterData.length : 0;
    },
    totalCount() {
      return this.tableData.length;
    },
    startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.totalCount);
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
    filteredItems() {
      return this.tableData.filter((item) => {
        return (
          item.event_name.toLowerCase().includes(this.search.toLowerCase()) ||
          item.event_description
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
          this.fetch_loc_name(item.event_visibility.visible_locations)
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
          item.event_progress_status
            .toLowerCase()
            .includes(this.search.toLowerCase())
        );
      });
    },
  },
  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    fetch_admin_apps() {
      const userObj = this.$store.getters.GetUserObj;

      const userapp = userObj.user_apps.find(
        (app) => app.dashboard_unique_type == "EVENTS"
      );
      // console.log(userapp, "userapp");
      if (userapp == undefined) {
        this.adminAppExists = false;
        return;
      }
      if(userapp.is_visible==false){
        this.adminAppExists = false;
        return;
      }

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

      this.adminAppExists =
        adminExists &&
        (adminExists.app_usage_level === "WEB_PHONE_ONLY" ||
          adminExists.app_usage_level === "WEB_ONLY") &&
        adminExists.is_dashboard_admin === true;
    },
    async updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      // Check if we need more data from API
      if (end > this.tableData.length && this.next_token) {
        await this.fetch_event_list(true);
      }
      this.paginatedItems = this.tableData.slice(start, end);
    },
    fetch_loc_name(values) {
      let names = [];

      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        let name = "";

        this.locdata.forEach((element) => {
          if (element.location_id === value) {
            name = element.location_name;
          }
        });

        names.push(name);
      }

      return names.join(",");
    },

    back_call() {
      this.$router.push("/home/EventsUser");
    },
    create_event() {
      this.componentCheck = 1;
      this.createEvent = true;
    },

    event_listing(item) {
      this.componentCheck = 4;
      this.Eventlist = true;
      this.eventInfo = item;
    },
    get_myteam_Pagination() {
      if (this.next_token) {
        this.fetch_event_list();
      }
    },
    async fetch_event_list() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_events_details, {
            organization_id: data.organization.organization_id,
            event_progress_status: "ALL",
            limit: 22,
            nextToken: this.next_token,
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.list_events_details);
        this.next_token = response.nextToken;
        var dataArray = [];
        if (response.items.length > 0) {
          response.items = response.items.sort((z, y) => {
            return z.from_date - y.from_date;
          });
        }

        dataArray = response.items;
        let array = this.tableData.concat(dataArray);

        this.tableData = array;
        const uniqueArrayOfObjects = this.tableData.filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o.event_id === obj.event_id)
        );
        this.tableData = uniqueArrayOfObjects;
        this.updatePageItems();
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

    edit_event(item) {
      this.eventInfo = item;
      this.componentCheck = 2;
      this.editEvent = true;
    },

    delete_event(item) {
      this.componentCheck = 3;
      this.eventDelete = true;
      this.eventInfo = item;
    },

    fetch_value(val) {
      return format_Date(val / 1000);
      // const d = new Date(parseInt(val));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   year +
      //   "-" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "-" +
      //   (+date <= 9 ? "0" + date : date)
      // );
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
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createEvent = false;
      this.editEvent = false;
      this.eventDelete = false;
      this.tableData = [];
      this.fetch_event_list();
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

/* Modern Header Section */
.modern-header-section {
  background: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  border-bottom: 1px solid #e0e0e0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-container {
  display: flex;
  align-items: center;
}



.header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 14px;
  color: #666;
  line-height: 1.2;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Action Button Styles */
.action-btn {
  background: #DB4C77 !important;
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

.action-btn.secondary {
  background: #757575 !important;
  box-shadow: 0 2px 8px rgba(117, 117, 117, 0.3) !important;
}

.action-btn.secondary:hover {
  background: #616161 !important;
  box-shadow: 0 4px 12px rgba(117, 117, 117, 0.4) !important;
}

/* Card Container */
.card-container {
  position: relative;
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

.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
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

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }
  
  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
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