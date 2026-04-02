<template>
  <div>
    <v-card flat class="overflow-y-auto">
      <v-card flat>
        <v-card-text>
          <v-switch
            v-model="visibleToEveryone"
            label="Lead visible to everyone"
            color="primary"
            hide-details
            inset
            @change="saveVisibilitySettings"
          />
          <div class="text-caption text-medium-emphasis mt-2 ml-8">
            When enabled, all leads will be visible to members
          </div>
        </v-card-text>
      </v-card>
      <div>
        <div class="card-container" style="position: relative">
          <v-card class="" flat>
            <v-card-text>
              <v-data-table
                :headers="suppliereHeaders"
                :fixed-header="fixed"
                :items="paginatedItems"
                :loading="tableLoading"
                :height="tableHeight"
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
                      >mdi-account-group-outline</v-icon
                    >
                    <div class="text-h6 grey--text mb-2">No Members Found</div>
                    <div class="text-body-2 grey--text">
                      Try adjusting your search criteria or add a new member.
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
                    <div class="text-body-2 text-grey">Loading members...</div>
                  </div>
                </template>

                <template v-slot:[`item.products_name`]="{ item }"> 
                  <span class="caption font-weight-medium">{{ item.products_name ? item.products_name.join(", ") : "N/A" }}</span>
                </template>
                <template v-slot:[`item.client_id`]="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar size="32" color="primary" class="mr-3">
                      <span class="text-white font-weight-bold text-caption">
                        {{
                          getInitials(
                            item.client_id ||
                              item.name ||
                              item.user_name ||
                              "N/A"
                          )
                        }}
                      </span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">
                        {{
                          item.client_id || item.name || item.user_name || "N/A"
                        }}
                      </div>
                    </div>
                  </div>
                </template>

                <template v-slot:[`item.product`]="{ item }">
                  <v-chip
                    :color="
                      getProductColor(
                        item.product || item.app_name || item.service_name
                      )
                    "
                    size="small"
                    variant="flat"
                  >
                    {{
                      item.product ||
                      item.app_name ||
                      item.service_name ||
                      "N/A"
                    }}
                  </v-chip>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="blue"
                    @click="editMember(item)"
                  />
                </template>
              </v-data-table>

              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${paginatedItems.length} of ${totalItems} members`
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
                      :class="
                        page === currentPage ? 'active-page' : 'inactive-page'
                      "
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

    <!-- Edit Member Dialog -->
    <EditMemberDialog
      :dialog="editDialog"
      :member-data="selectedMember"
      @update:dialog="editDialog = $event"
      :dashboardId="dashboardId"
      @cancel="handleEditCancel"
      @successMsg="success_info"
      @errorMsg="error_info"
    />
  </div>
  <SnackBar :SnackBarComponent="SnackBarComponent" />
</template>

<script>
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { list_user_app_subscribers } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import EditMemberDialog from "./Dialogs/EditMemberDialog.vue";
import { edit_organization } from "@/graphql/mutations.js";
import SnackBar from "@/components/SnackBar.vue";
export default {
  name: "Members",
  components: {
    EditMemberDialog,
    SnackBar,
  },
  mixins: [get_Org_details],
  data() {
    return {
      dashboardId: "",
      tableLoading: false,
      fixed: true,
      suppliereHeaders: [
        {
          title: "Member Email",
          value: "client_id",
          sortable: false,
        },
        {
          title: "Products",
          value: "products_name",
          sortable: false,
        },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
      memberRecords: [],
      // Pagination properties
      itemsPerPage: 10,
      currentPage: 1,
      sortBy: [{ key: "client_id", order: "asc" }],
      windowHeight: 0,
      tableHeight: 0,
      // Dialog state
      editDialog: false,
      selectedMember: {},
      visibleToEveryone: true,
      SnackBarComponent: {},
    };
  },
  computed: {
    filteredMembers() {
      return this.memberRecords;
    },
    totalItems() {
      return this.filteredMembers.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    paginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredMembers.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
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
  async created() {
    this.windowHeight = window.innerHeight - 120;
    this.tableHeight = this.windowHeight - 240;
    await this.get_Org_details();
    
    // Add null checks for organization data
    if (this.orgDetails && this.orgDetails.organization) {
      this.visibleToEveryone =
        this.orgDetails.organization.is_lead_visible_all == undefined
          ? true
          : this.orgDetails.organization.is_lead_visible_all;
    } else {
      // Default to true if organization data is not available
      this.visibleToEveryone = true;
      console.warn("Organization details not available, defaulting visibility to true");
    }
    
    // console.log(
    //   "this.orgDetails",
    //   this.orgDetails?.organization?.is_lead_visible_all
    // );
    
    // Get dashboard ID from user apps
    let appObj = this.$store.getters.GetUserObj.user_apps;
    appObj.forEach((element) => {
      if (element.dashboard_unique_type == "CUSTOMERS_ADMINS") {
        this.dashboardId = element.dashboard_id;
      }
    });

    // Only load members if we have a valid dashboard ID
    if (this.dashboardId) {
      await this.loadMembers();
    } else {
      console.warn("No dashboard ID found for CUSTOMERS_ADMINS");
      this.tableLoading = false;
    }
  },
  watch: {
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
  methods: {
    async saveVisibilitySettings() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              is_lead_visible_all: this.visibleToEveryone,
            },
          })
        );
        var response = JSON.parse(result.data.edit_organization);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.error("Error saving visibility settings:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    getInitials(name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    },
    getProductColor(product) {
      if (!product) return "grey";

      const colors = {
        "CRM System": "primary",
        "Analytics Dashboard": "success",
        "Project Management": "warning",
        "Marketing Tools": "info",
        "Financial Reports": "error",
        "HR Management": "purple",
        "Customer Management": "primary",
        "Sales Management": "success",
        "Inventory Management": "warning",
        Reporting: "info",
        Administration: "error",
        Support: "purple",
      };
      return colors[product] || "primary";
    },
    editMember(member) {
      // console.log("Member edited:", member);
      this.selectedMember = { ...member };
      // console.log("selectedMember", this.selectedMember);
      this.editDialog = true;
    },
    async loadMembers() {
      this.tableLoading = true;
      this.memberRecords = [];

      try {
        // console.log("Loading members for dashboard ID:", this.dashboardId);

        let result = await API.graphql(
          graphqlOperation(list_user_app_subscribers, {
            input: {
              dashboard_id: this.dashboardId,
            },
          })
        );

        // console.log("API Response:", result);

        var response = JSON.parse(result.data.list_user_app_subscribers);
        // console.log("Parsed Response:", response);

        if (response.Status == "SUCCESS") {
          this.memberRecords = response.data || [];
          // console.log(
          //   "Members loaded successfully:",
          //   this.memberRecords.length,
          //   "members"
          // );
        } else {
          this.memberRecords = [];
          // console.log(
          //   "API returned error:",
          //   response.message || "Unknown error"
          // );
        }
      } catch (error) {
        console.error("Error loading members:", error);
        this.memberRecords = [];
      } finally {
        this.tableLoading = false;
      }
    },
    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
    },
    getSortValue(value, key) {
      if (!value) return "";
      if (key === "client_id") {
        return value.toLowerCase();
      }
      if (key === "product") {
        return value.toLowerCase();
      }
      return value;
    },

    handleEditCancel() {
      this.editDialog = false;
      this.selectedMember = {};
    },
    handleEditError(errorMessage) {
      // console.error("Edit error:", errorMessage);
      // You can show a snackbar or notification here
    },

    // Snackbar event handlers (same pattern as PipeLine.vue)
    success_info(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 3000,
        Top: true,
      };
      this.editDialog = false;
      // Reload members data if needed
      if (this.dashboardId) {
        this.loadMembers();
      }
    },

    error_info(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: message,
        timeout: 4000,
        Top: true,
      };
    },
  },
};
</script>

<style scoped>
.card-container {
  position: relative;
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
  background-color: #db4c77 !important;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .pagination-controls {
    justify-content: center;
  }
}
</style>