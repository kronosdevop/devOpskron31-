<template>
  <div>
    <v-card flat class="">
      <v-toolbar flat class="bg-white">
        <v-select
          v-model="selectedType"
          density="compact"
          variant="outlined"
          class="mt-4 ml-3"
          label="Filter By"
          style="
            min-width: 200px;
            max-width: 200px;
            border-radius: 999px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
            font-size: 14px;
          "
          :items="[
            { title: 'All', value: 'ALL' },
            { title: 'Time Sheet', value: 'TIMESHEET' },
            { title: 'Project Management', value: 'PROJECT_MANAGEMENT' },
          ]"
          item-text="title"
          item-value="value"
        ></v-select>
        <v-spacer />
        <v-text-field
          v-model="searchQuery"
          placeholder="Search projects..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          :max-width="250"
          class="mr-2"
          density="compact"
          clearable
          @click:clear="searchQuery = ''"
        ></v-text-field>
        <v-btn
          @click="add_mutation()"
          class="cardCss text-capitalize mr-4"
          :loading="loadingBtn"
          height="40"
          rounded="lg"
        >
          <v-icon color="white">mdi-plus</v-icon>
          <div class="FontVariant1">Add</div>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-4">
        <v-data-table
          :headers="projectHeaders"
          :items="sortedAndPaginatedItems"
          :loading="loading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalItems"
          :height="CommonVuetifyObj.height - 305"
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg"
          density="compact"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
        >
          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-briefcase-outline</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Projects Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or add a new project.
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
              <div class="text-body-2 grey--text">Loading projects...</div>
            </div>
          </template>

          <template v-slot:[`item.project_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="20" color="primary" class="mr-3"
                >mdi-briefcase</v-icon
              > -->
              <div>
                <div>
                  {{ item.project_name || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <template v-slot:[`item.project_activities`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="16" color="primary" class="mr-2"
                >mdi-format-list-bulleted</v-icon
              > -->
              <span class="caption">
                <span v-if="item.project_activities.length == 0">-</span>
                <span v-else>{{ item.project_activities.join(", ") }}</span>
              </span>
            </div>
          </template>

          <template v-slot:[`item.project_source`]="{ item }">
            <div class="d-flex align-center">
              <v-icon
                v-if="item.project_source === 'TIMESHEET'"
                size="16"
                color="primary"
                class="mr-2"
                >mdi-clock-outline</v-icon
              >
              <v-icon v-else size="16" color="primary" class="mr-2"
                >mdi-list-box</v-icon
              >
              <span class="caption">
                <span v-if="item.project_source === 'TIMESHEET'"
                  >Timesheet</span
                >
                <span v-else-if="item.project_source === 'PROJECT_MANAGEMENT'"
                  >Project Management</span
                >
                <span v-else>{{ item.project_source }}</span>
              </span>
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex align-center justify-center">
              <v-menu offset-y>
                <template #activator="{ props }">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    v-bind="props"
                    class="cursor-pointer"
                  >
                    <v-icon size="18">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list density="compact">
                  <v-list-item
                    @click.stop="edit_item(item)"
                    style="font-size: 12px"
                    elevation="0"
                  >
                    <div class="d-flex align-center">
                      <v-icon size="small" color="blue">mdi-pencil</v-icon>
                      <v-list-item-title class="ml-2"
                        >Edit Project</v-list-item-title
                      >
                    </div>
                  </v-list-item>

                  <v-list-item
                    v-if="item.project_source != 'PROJECT_MANAGEMENT'"
                    @click.stop="delete_item(item)"
                    style="font-size: 12px"
                  >
                    <div class="d-flex align-center">
                      <v-icon size="small" color="red">mdi-delete</v-icon>
                      <v-list-item-title class="ml-2"
                        >Delete Project</v-list-item-title
                      >
                    </div>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table>

        <div class="table-footer">
          <div class="footer-info">
            {{
              sortedAndPaginatedItems === 0
                ? "No Results"
                : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} projects`
            }}
          </div>
          <div class="pagination-controls">
            <v-btn
              :disabled="currentPage === 1"
              class="pagination-btn"
              variant="text"
              size="small"
              @click="currentPage = currentPage - 1"
              >Previous</v-btn
            >
            <div class="page-numbers">
              <v-btn
                v-for="page in visiblePages"
                :key="page"
                :variant="page === currentPage ? 'elevated' : 'text'"
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
                @click="currentPage = page"
                >{{ page }}</v-btn
              >
            </div>
            <v-btn
              :disabled="currentPage === pageCount"
              class="pagination-btn"
              variant="text"
              size="small"
              @click="currentPage = currentPage + 1"
              >Next</v-btn
            >
          </div>
        </div>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <EditProject
        :projectEdition="projectEdition"
        :projectitems="projectitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="projectEdition = false"
        :activityData="activityData"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteProject
        :projectDeletion="projectDeletion"
        :projectitems="projectitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="projectDeletion = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <CreateProject
        :CreatProjectDialog="CreatProjectDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="CreatProjectDialog = false"
      />
    </div>
  </div>
</template>

<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import SnackBar from "@/components/SnackBar.vue";
import EditProject from "@/components/TimeSheets/PopUps/EditProject.vue";
import DeleteProject from "@/components/TimeSheets/PopUps/DeleteProject.vue";
import { get_projects } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import CreateProject from "@/components/TimeSheets/PopUps/CreateProject.vue";
import { get_activities_list } from "@/mixins/GetTimeSheetActivitiesList.js";

export default {
  mixins: [get_activities_list],
  components: {
    DeleteProject,
    EditProject,
    SnackBar,
    CreateProject,
  },
  data() {
    return {
      projectHeaders: [
        { title: "Name", value: "project_name", sortable: false },
        { title: "Activities", value: "project_activities", sortable: false },
        { title: "Type", value: "project_source", sortable: false },
        { title: "Action", value: "actions", sortable: false },
      ],
      fixed: true,
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      projectitems: {},
      projectDeletion: false,
      projectEdition: false,
      componentCheck: 0,
      loading: false,
      tableHeight: 0,
      height: 0,
      tableData: [],
      loadingBtn: false,
      selectedType: "ALL",
      CreatProjectDialog: false,
      activityData: [],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  async created() {
    this.tableHeight = window.innerHeight - 290;
    await this.fetch_projectes();
    await this.get_activities_list();
    let selectData = this.ActivityList;
    selectData.forEach((element) => {
      this.activityData.push({
        title: element.activity_name,
        value: element.activity_name,
      });
    });
  },
  computed: {
    filteredItems() {
      let filtered = this.tableData;

      if (this.selectedType !== "ALL") {
        filtered = filtered.filter(
          (item) => item.project_source === this.selectedType
        );
      }

      if (this.searchQuery && this.searchQuery.trim() !== "") {
        const searchTerm = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (item) =>
            (item.project_name &&
              item.project_name.toLowerCase().includes(searchTerm)) ||
            (item.project_activities &&
              item.project_activities.some((activity) =>
                activity.toLowerCase().includes(searchTerm)
              )) ||
            (item.project_source &&
              item.project_source.toLowerCase().includes(searchTerm))
        );
      }

      return filtered;
    },
    sortedAndPaginatedItems() {
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        const aValue = a.project_name ? a.project_name.toLowerCase() : "";
        const bValue = b.project_name ? b.project_name.toLowerCase() : "";
        return aValue.localeCompare(bValue);
      });

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    totalItems() {
      return this.filteredItems.length;
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
  mounted() {
    this.CommonVuetifyObj = useDisplay();
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    currentPage(newVal) {
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
  methods: {
    edit_item(item) {
      this.projectitems = item;
      this.componentCheck = 1;
      this.projectEdition = true;
    },
    delete_item(item) {
      this.projectitems = item;
      this.componentCheck = 2;
      this.projectDeletion = true;
    },

    add_mutation() {
      this.CreatProjectDialog = true;
      this.componentCheck = 3;
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
      this.projectEdition = false;
      this.projectDeletion = false;
      (this.CreatProjectDialog = false), this.fetch_projectes();
    },

    async fetch_projectes() {
      this.loading = true;

      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_projects, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_projects);
        this.tableData = [];
        this.loading = false;
        this.tableData = response.data;
      } catch (error) {
        this.loading = false;

        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    handleSortChange() {},
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

.dtwidth :deep(.v-data-table__wrapper table) {
  table-layout: fixed;
  width: 100%;
}

.dtwidth :deep(.v-data-table__wrapper th:nth-child(1)) {
  width: 40% !important;
  max-width: 40% !important;
}

.dtwidth :deep(.v-data-table__wrapper th:nth-child(2)) {
  width: 45% !important;
  max-width: 45% !important;
}

.dtwidth :deep(.v-data-table__wrapper th:nth-child(3)) {
  width: 15% !important;
  max-width: 15% !important;
}

.dtwidth :deep(.v-data-table__wrapper th:nth-child(4)) {
  width: 50px !important;
  max-width: 50px !important;
  min-width: 50px !important;
  text-align: center;
  padding: 0 !important;
}

.dtwidth :deep(.v-data-table__wrapper td:nth-child(1)) {
  width: 40% !important;
  max-width: 40% !important;
}

.dtwidth :deep(.v-data-table__wrapper td:nth-child(2)) {
  width: 45% !important;
  max-width: 45% !important;
}

.dtwidth :deep(.v-data-table__wrapper td:nth-child(3)) {
  width: 15% !important;
  max-width: 15% !important;
}

.dtwidth :deep(.v-data-table__wrapper td:nth-child(4)) {
  width: 50px !important;
  max-width: 50px !important;
  min-width: 50px !important;
  text-align: center;
  padding: 8px 4px !important;
}

.dtwidth :deep(.v-data-table__wrapper td:nth-child(4) .d-flex) {
  width: 100%;
  justify-content: center;
}

.dtwidth :deep(.v-data-table__wrapper th),
.dtwidth :deep(.v-data-table__wrapper td) {
  padding: 8px 12px !important;
}

.dtwidth :deep(.v-data-table__wrapper th:last-child),
.dtwidth :deep(.v-data-table__wrapper td:last-child) {
  padding-right: 8px !important;
  padding-left: 8px !important;
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
</style>
