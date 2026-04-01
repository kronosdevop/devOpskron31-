<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-row>
          <v-form ref="form">
            <v-text-field
              density="compact"
              variant="outlined"
              :rules="[(v) => !!v || 'Required']"
              label="Name"
              v-model="activityName"
              width="250"
              class="ml-3"
            />
          </v-form>
          <v-btn
            @click="add_mutation()"
            :loading="loadingBtn"
            class="text-capitalize cardCss ml-2"
            height="40"
            rounded="lg"
          >
            <v-icon color="white">mdi-plus</v-icon>
            <div class="FontVariant1">Add</div>
          </v-btn>
        </v-row>
        <v-data-table
          :headers="headers"
          :items="sortedAndPaginatedItems"
          :loading="loading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalItems"
          :height="CommonVuetifyObj.height - 280"
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg mt-n1"
          density="compact"
          hover
          multi-sort
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-format-list-bulleted</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Activities Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or add a new activity.
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
              <div class="text-body-2 grey--text">Loading activities...</div>
            </div>
          </template>

          <template v-slot:[`item.activity_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="20" color="primary" class="mr-3"
                >mdi-format-list-bulleted</v-icon
              > -->
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.activity_name || "N/A" }}
                </div>
              </div>
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
                    @click.stop="delete_item(item)"
                    style="font-size: 12px"
                  >
                    <template #prepend>
                      <v-icon size="small" color="red">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Delete Activity</v-list-item-title>
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
                : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} activities`
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
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
                :variant="page === currentPage ? 'elevated' : 'text'"
                @click="currentPage = page"
                >{{ page }}</v-btn
              >
            </div>
            <v-btn
              :disabled="currentPage === pageCount"
              class="pagination-btn"
              variant="text"
              size="small"
              @click="currentPage = currentPage - 1"
              >Next</v-btn
            >
          </div>
        </div>
      </v-card-text>
    </v-card>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <DeleteActivity
        :projectDeletion="projectDeletion"
        :deleteitems="deleteitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="projectDeletion = false"
      />
    </div>
  </div>
</template>

<script>
import { useDisplay } from "vuetify/lib/framework.mjs";
import SnackBar from "@/components/SnackBar.vue";
import DeleteActivity from "@/components/TimeSheets/PopUps/DeleteActivity.vue";
import { create_activity } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_activities } from "@/graphql/queries.js";
export default {
  components: {
    SnackBar,
    DeleteActivity,
  },
  data() {
    return {
      height: 0,
      activityName: "",
      loading: false,
      headers: [
        {
          title: "Name",
          value: "activity_name",
          sortable: true,
          align: "start",
        },
        { title: "Action", value: "actions", sortable: false, align: "center" },
      ],
      tableData: [],
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      tableHeight: 0,
      fixed: true,
      loadingBtn: false,
      projectDeletion: false,
      componentCheck: 0,
      deleteitems: {},
      totalItems: 0,
      currentPage: 1,
      itemsPerPage: 10,
      pageCount: 1,
      sortBy: [{ key: "activity_name", order: "asc" }],
    };
  },
  computed: {
    sortedAndPaginatedItems() {
      const sortedItems = this.tableData.slice().sort((a, b) => {
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
  mounted() {
    this.CommonVuetifyObj = useDisplay();
  },
  watch: {
    currentPage(newVal) {
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
  created() {
    this.tableHeight = window.innerHeight - 290;
    this.fetch_activities();
  },
  methods: {
    getSortValue(value, key) {
      if (!value) return "";
      if (key === "activity_name") {
        return value.toLowerCase();
      }
      return value;
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1;
    },

    async add_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.create_activity_func();
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

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.projectDeletion = false;
      this.fetch_activities();
    },
    delete_item(item) {
      this.deleteitems = item;
      this.componentCheck = 1;
      this.projectDeletion = true;
    },

    async create_activity_func() {
      var data = this.$store.getters.GetUserObj;
      this.loadingBtn = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_activity, {
            input: {
              activity_name: this.activityName,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
            },
          })
        );

        var response = JSON.parse(result.data.create_activity);

        if (response.Status == "SUCCESS") {
          this.loadingBtn = false;
          await this.fetch_activities();
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.loadingBtn = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loadingBtn = false;
        this.$refs.form.reset();
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    async fetch_activities() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_activities, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_activities);
        this.tableData = [];
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.tableData = response.data;
          this.totalItems = this.tableData.length;
        } else {
          this.loading = false;
          this.tableData = [];
          this.totalItems = 0;
        }
      } catch (error) {
        this.loading = false;
        this.tableData = [];
        this.totalItems = 0;
        this.$emit("errorMsg", error.errors[0].message);
      }
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
