<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <OverlayComp :overlay="overlay" />

    <v-card flat class="pa-3">
      <v-data-table
        :headers="checklistHeader"
        :items="paginatedItems"
        :loading="tableLoading"
        item-key="category_id"
        :items-per-page="itemsPerPage"
        :page="currentPage"
        :server-items-length="totalCount"
        hide-default-footer
        density="compact"
        class="modern-data-table"
        hover
        multi-sort
        :fixed-header="true"
        :height="windowHeight"
      >
        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4"
              >mdi-format-list-checks</v-icon
            >
            <div class="text-h6 text-grey mb-2">No Checklists Found</div>
            <div class="text-body-2 text-grey">
              Try creating a new checklist to get started.
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
            <div class="text-body-2 text-grey">Loading checklists...</div>
          </div>
        </template>

        <template v-slot:[`item.checklist_name`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="primary" class="mr-2"
              >mdi-format-list-checks</v-icon
            > -->
            <div>
              <div class="font-weight-medium text-body-2">
                {{ item.checklist_name }}
              </div>
              <div class="caption text-grey">{{ item.category_id }}</div>
            </div>
          </div>
        </template>

        <template v-slot:[`item.checklist_created_on`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="grey" class="mr-2"
              >mdi-calendar-clock</v-icon
            > -->
            <span class="caption font-weight-medium">{{
              formatDate(item.checklist_created_on)
            }}</span>
          </div>
        </template>

        <template v-slot:[`item.checklist_visible_members`]="{ item }">
          <div class="d-flex align-center">
            <!-- <v-icon size="16" color="primary" class="mr-2"
              >mdi-account-group</v-icon
            > -->
            <span class="caption font-weight-medium">
              {{
                item.checklist_visible_members &&
                item.checklist_visible_members.filter(Boolean).length > 0
                  ? item.checklist_visible_members.filter(Boolean).length
                  : orgUsers.filter((user) => user.user_status === "ACTIVE")
                      .length
              }}
              Users
            </span>
          </div>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                color="grey"
              />
            </template>

            <v-list density="compact" class="py-0">
              <v-list-item @click.stop="View_checklist(item)" class="py-2">
                <template #prepend>
                  <v-icon icon="mdi-eye" size="small" color="green" />
                </template>
                <v-list-item-title class="text-body-2"
                  >View Checklist</v-list-item-title
                >
              </v-list-item>

              <v-divider v-if="item.checklist_created_by == $store.getters.GetUserObj.user.user_id" />

              <v-list-item @click.stop="Edit_checklist(item)" class="py-2" v-if="item.checklist_created_by == $store.getters.GetUserObj.user.user_id">
                <template #prepend>
                  <v-icon icon="mdi-pencil" size="small" color="blue" />
                </template>
                <v-list-item-title class="text-body-2"
                  >Edit Checklist</v-list-item-title
                >
              </v-list-item>

                <v-divider v-if="item.checklist_created_by == $store.getters.GetUserObj.user.user_id" />

              <v-list-item @click.stop="Deactive_checklist(item)" class="py-2" v-if="item.checklist_created_by == $store.getters.GetUserObj.user.user_id">
                <template #prepend>
                  <v-icon icon="mdi-delete" size="small" color="red" />
                </template>
                <v-list-item-title class="text-body-2"
                  >Delete Checklist</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <!-- Modern Table Footer -->
      <div class="table-footer">
        <div class="footer-info">
          {{
            totalCount === 0
              ? "No Results"
              : `Showing ${paginatedItems.length} of ${totalCount} checklists`
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
    </v-card>

    <div v-if="componentCheck == 1">
      <DeactiveChecklist
        :deactivechecklistDialog="deactivechecklistDialog"
        :ChecklistItem="ChecklistItem"
        @clicked="deactivechecklistDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { list_admin_checklists } from "@/graphql/queries.js";
import DeactiveChecklist from "./Popups/DeactiveChecklist.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    DeactiveChecklist,
    OverlayComp,
    SnackBar,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      ChecklistData: [],
      paginatedItems: [],
      componentCheck: 0,
      overlay: false,
      deactivechecklistDialog: false,
      ChecklistItem: {},
      SnackBarComponent: {},
      currentPage: 1,
      itemsPerPage: 20,
      windowHeight: 0,
      checklistHeader: [
        { title: "Name", key: "checklist_name", sortable: false },
        { title: "Created On", key: "checklist_created_on", sortable: false },
        { title: "Created By", key: "checklist_created_by_name", sortable: false },
        {
          title: "Assignees",
          key: "checklist_visible_members",
          sortable: false,
        },
        { title: "Actions", key: "actions", sortable: false },
      ],
      tableLoading: false,
    };
  },
  computed: {
    totalCount() {
      return this.ChecklistData.length;
    },
    pageCount() {
      return Math.ceil(this.ChecklistData.length / this.itemsPerPage);
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
  async created() {
    // console.log(this.$store.getters.GetUserObj.user.user_id)
    this.windowHeight = window.innerHeight - 250;
    this.fetch_Checklists();
    this.fetch_user_list();
    await this.get_all_org_users();
  },
  watch: {
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    updatePageItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      this.paginatedItems = this.ChecklistData.slice(start, end);
    },
    fetch_user_list() {
      this.userProfiles = {};
      localStorage.setItem("allOrgUsers", JSON.stringify(this.orgUsers));
      this.orgUsers.forEach((element) => {
        if (element.user_status === "ACTIVE") {
          const email = element.user_email_id;
          const profilePicUrl = element.user_profile_pic_url || "";
          const name = element.full_user_name;
          if (profilePicUrl && profilePicUrl != "N/A") {
            this.$set(this.userProfiles, email, profilePicUrl);
          } else {
            const initials = this.getInitials(name);
            this.$set(this.userProfiles, email, initials);
          }
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
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.deactivechecklistDialog = false;
      this.fetch_Checklists();
    },

    async fetch_Checklists() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_admin_checklists, {
            input: {
              limit: 100,
              nextToken: null,
            },
          })
        );
        this.ChecklistData = [];
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_admin_checklists);
        if (response.Status == "ERROR") {
          this.ChecklistData = [];
        } else {
          this.ChecklistData = response.data;
          this.tableLoading = false;
          this.updatePageItems();
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },

    formatDate(ts) {
      if (!ts) return "—";
      return new Date(ts * 1000).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    View_checklist(item) {
      this.$router.push("/home/ViewCheckList");
      this.$store.commit("SetChecklist", item);
      // console.log(item);
    },
    Edit_checklist(item) {
      // console.log(item);
      this.$store.commit("SetChecklist", item);
      this.$router.push("/home/EditChecklist");
    },
    Deactive_checklist(item) {
      this.deactivechecklistDialog = true;
      this.ChecklistItem = item;
      this.componentCheck = 1;
    },
  },
};
</script>

<style scoped>
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  background: #DB4C77 !important;
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

/* Responsive Design */
@media (max-width: 768px) {
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
