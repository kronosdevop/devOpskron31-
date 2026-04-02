<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card variant="flat">
      <v-card-text>
        <v-data-table
          :headers="headers"
          fixed-headers
          :items="paginatedItems"
          hide-default-footer
          fixed-header
          height="420"
          class="modern-data-table"
        >
          <template #no-data>
            <div v-if="!tableLoading"></div>
          </template>
          <template v-slot:[`item.user_profile_pic_url`]="{ item }">
            <div class="user-profile-cell">
              <div class="user-avatar">
                <v-avatar
                  v-if="
                    item.user_profile_pic_url &&
                    item.user_profile_pic_url !== 'N/A'
                  "
                  size="40"
                  class="user-avatar-img cursor-pointer"
                  @click.stop="openImagePreview(item)"
                >
                  <v-img :src="item.user_profile_pic_url" />
                </v-avatar>

                <div v-else>
                  <v-avatar size="40" class="user-avatar-fallback">
                    <span class="avatar-text">
                      {{
                        (item.full_user_name || "U")
                          .substring(0, 1)
                          .toUpperCase()
                      }}
                    </span>
                  </v-avatar>
                </div>
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ item.full_user_name || "N/A" }}
                </div>
                <div class="user-id">
                  {{ item.member_id || "N/A" }}
                </div>
                <v-icon
                  v-if="item.user_type == 'ADMIN' || item.user_type == 'OWNER'"
                  size="16"
                  color="primary"
                  class="admin-icon"
                >
                  mdi-account
                </v-icon>
              </div>
            </div>
          </template>

          <template v-slot:[`item.department`]="{ item }">
            <span
              v-if="item.department && item.department !== 'N/A'"
              class="group-pill"
            >
              {{ item.department }}
            </span>
            <span v-else class="text-grey">-</span>
          </template>
          <template v-slot:[`item.user_contact_number`]="{ item }">
            <div class="contact-cell">
              <div class="contact-icon">
                <!-- <v-icon size="16" color="grey">mdi-email</v-icon> -->
              </div>
              <div class="contact-info">
                <div class="contact-email">
                  {{ item.user_email_id || "N/A" }}
                </div>
                <div class="contact-phone">
                  {{ item.user_full_contact_number || "N/A" }}
                </div>
              </div>
            </div>
          </template>
          <template v-slot:[`item.location`]="{ item }">
            <div class="location-cell">
              <!-- <div class="location-icon">
                      <v-icon size="16" color="grey">mdi-map-marker</v-icon>
                    </div> -->
              <div class="location-text">
                {{ item.location == "N/A" ? "-" : item.location }}
              </div>
            </div>
          </template>
          <template v-slot:[`item.date_of_joining`]="{ item }">
            <div class="date-cell">
              <div class="date-icon">
                <!-- <v-icon size="16" color="grey">mdi-calendar</v-icon> -->
              </div>
              <div class="date-info">
                <div class="date-text">
                  {{
                    item.date_of_joining == "N/A" ||
                    item.date_of_joining == null ||
                    item.date_of_joining == undefined
                      ? "-"
                      : formatDate(item.date_of_joining)
                  }}
                </div>
              </div>
            </div>
          </template>
          <template v-slot:[`item.user_status`]="{ item }">
            <div
              class="status-pill"
              :class="getStatusTagClass(item.user_status)"
            >
              <v-icon size="14" class="mr-1"> mdi-check-circle </v-icon>
              {{
                item.user_status === "JOINED"
                  ? "Active"
                  : item.user_status === "INVITED"
                  ? "Invited"
                  : item.user_status === "REMOVED"
                  ? "Inactive"
                  : item.user_status
              }}
            </div>
          </template>
          <template #item.action="{ item }">
         <v-tooltip text="View Attendance" location="bottom"  content-class="custom-tooltip"
 >
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                color="primary"
                class="cursor-pointer"
                @click.stop="attendance_view(item)"
              >
                mdi-face-recognition
              </v-icon>
            </template>
          </v-tooltip>
          </template>
          <template #body.prepend>
            <tr v-if="tableLoading">
              <td :colspan="headers.length" class="loader-td">
                <div class="loader-center">
                  <v-progress-circular
                    indeterminate
                    size="42"
                    width="3"
                    color="primary"
                  />
                  <div class="loader-text">Loading Reporties…</div>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalItems === 0
                ? "No members"
                : `Showing ${paginatedItems.length} of ${totalItems} members`
            }}
          </div>

          <!-- RIGHT PAGINATION -->
          <div class="pagination-controls">
            <v-btn
              variant="text"
              size="small"
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Previous
            </v-btn>

            <v-btn
              v-for="page in visiblePages"
              :key="page"
              size="small"
              class="page-btn"
              :class="{ 'active-page': page === currentPage }"
              @click="currentPage = page"
            >
              {{ page }}
            </v-btn>

            <v-btn
              variant="text"
              size="small"
              class="pagination-btn"
              :disabled="currentPage === pageCount"
              @click="currentPage++"
            >
              Next
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <ImagePreviewDialog
      :imagePreviewDialog="imagePreviewDialog"
      :selectedUserDetail="selectedUserDetail"
      @close="imagePreviewDialog = false"
    />
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import { list_users } from "@/graphql/queries.js";
import ImagePreviewDialog from "@/components/Teams/ImagePreviewDialog.vue";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";

export default {
  components: {
    SnackBar,
    ImagePreviewDialog,
  },

  data() {
    return {
      imagePreviewDialog: false,
      selectedUserDetail: {},
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      headers: [
        {
          title: "Profile & Name",
          value: "user_profile_pic_url",
          sortable: false,
        },
        { title: "Date of Joining", value: "date_of_joining", sortable: false },
        {
          title: "Mobile Number / Email",
          value: "user_contact_number",
          sortable: false,
        },
        { title: "Group", value: "department", sortable: false },
        { title: "Location", value: "location", sortable: false },
        { title: "Actions", value: "action", sortable: false },
      ],
      tableItems: [],

      tableLoading: false,
      next_token: null,
      assetHead: "",
      masterUsers: [],
      attendance: {},

      searchF: null,
      // pagination: {
      //   itemsPerPage: 20,
      //   page: 1,
      // },
      SnackBarComponent: {},
      search: "",
      fixed: true,
      height: 0,
    };
  },
  watch: {
    currentPage(newVal) {
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
  computed: {
    sortedItems() {
      return [...this.tableItems].sort((a, b) => {
        const nameA = (a.full_user_name || "").toLowerCase();
        const nameB = (b.full_user_name || "").toLowerCase();
        return nameA.localeCompare(nameB); // ASCENDING
      });
    },

    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedItems.slice(start, end);
    },

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    visiblePages() {
      const delta = 2;
      let start = Math.max(1, this.currentPage - delta);
      let end = Math.min(this.pageCount, this.currentPage + delta);

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  async created() {
    this.height = window.innerHeight - 180;
    await this.fetch_reporties();
  },
  methods: {
    formatDate(date) {
      return formatdisplayDate(date);
    },
    openImagePreview(item) {
      this.selectedUserDetail = item;
      this.imagePreviewDialog = true;
    },
    async fetch_reporties() {
      this.tableLoading = true;
      const data = this.$store.getters.GetUserObj;

      try {
        const result = await API.graphql(
          graphqlOperation(list_users, {
            organization_id: data.organization.organization_id,
            user_status: "ACTIVE",
            user_type: "MEMBER",
            limit: 500,
            next_token: null,
            name_search: "",
            reporting_manager: data.user.user_id,
          })
        );

        const response = result.data.list_users;

        // ✅ SINGLE source of truth
        this.tableItems = response.details || [];
        this.totalItems = this.tableItems.length;
        this.currentPage = 1;

        this.SnackBarComponent = {
          show: true,
          color: "success",
          message: "Users fetched successfully",
          timeout: 3000,
        };
      } catch (error) {
        console.error(error);
        this.SnackBarComponent = {
          show: true,
          color: "error",
          message: "Something went wrong while fetching users",
          timeout: 3000,
        };
      } finally {
        this.tableLoading = false;
      }
    },
    getStatusTagClass(status) {
      switch (status) {
        case "JOINED":
          return "status-active";
        case "INVITED":
          return "status-invited";
        case "REMOVED":
          return "status-inactive";
        default:
          return "status-default";
      }
    },
    attendance_view(item) {
      this.$router.push("/home/ReportiesAttendance");
      this.$store.commit("SetReportieData", item);
    },
  },
};
</script>

<style scoped>
/* Main Card: Fixed Height */
.scrollable-main-card {
  max-width: 1000px;
  min-height: 520px;
  /* Allows expansion */
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  scrollbar-width: thin;
  /* Firefox */
  scrollbar-color: rgba(100, 100, 100, 0.5) transparent;
  /* Firefox */
}

.scrollable-content::-webkit-scrollbar {
  width: 2px;
  /* Ultra-thin scrollbar */
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
  /* Hidden track */
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 100, 0.6);
  /* Grey scrollbar */
  border-radius: 10px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 100, 100, 0.8);
  /* Slightly darker on hover */
}

/* Circular Buttons */
.circle-btn {
  height: 56px;
  width: 56px;
  border-radius: 50%;
  justify-content: center;
  background-color: #1976d2;
  color: white;
}

/* Align Headers to the Left */
.text-left {
  display: block;
  text-align: left;
  margin-bottom: 10px;
  font-weight: bold;
}

.group-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: grey;
  padding: 2px 10px 2px 2px;
  border-radius: 999px;
}

.group-text {
  font-size: 14px;
  font-weight: 200;
  color: white;
  white-space: nowrap;
}

.group-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 28px;
  padding: 0 14px;

  background-color: #9e9e9e;
  color: #ffffff;

  font-size: 13px;
  font-weight: 500;

  border-radius: 999px;
  white-space: nowrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* Green - Active */
.status-active {
  background-color: #4caf50;
  color: white;
}

/* Blue - Invited */
.status-invited {
  background-color: #2196f3;
  color: white;
}

/* Red - Inactive */
.status-inactive {
  background-color: #f44336;
  color: white;
}

.status-default {
  background-color: #9e9e9e;
  color: white;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

.footer-info {
  font-size: 14px;
  color: #555;
}

/* Pagination */
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  text-transform: none;
  font-size: 14px;
  color: #999;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  color: #555;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.loader-center {
  height: 300px;
  display: flex;
  /* margin-top: -5%; */
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loader-text {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}
:deep(.custom-tooltip) {
  background: linear-gradient(135deg, #fdf2f8, #eef2ff) !important;
  color: #be185d !important;
  font-weight: 500;
  border-radius: 8px;
  padding: 6px 12px;
  box-shadow: 0 4px 12px rgba(221, 77, 120, 0.3);
}
</style>
