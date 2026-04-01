<template>
  <div>
    <div>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      
      <div class="card-container" style="position: relative">
        <v-card class="" flat>
          <v-card-text>
            <!-- Top Controls: All in one row -->
            <v-row
              class="align-center px-6 pt-6 pb-2"
              
            >
              <v-col cols="auto" class="d-flex align-center">
                <v-icon class="mr-3" color="primary" size="large">mdi-ruler</v-icon>
                <span class="font-weight-bold text-h6"
                  >Material Units </span
                >
              </v-col>
              <v-spacer />
              <v-col cols="auto" class="d-flex align-center">
                <v-text-field
                  v-model="search"
                  placeholder="Search units..."
                  prepend-inner-icon="mdi-magnify"
                  variant="solo"
                  hide-details
                  density="compact"
                  class="search-pill mr-4"
                  style="
                    min-width: 280px;
                    max-width: 280px;
                    height: 32px;
                    border-radius: 999px;
                    background: #fff;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
                    font-size: 14px;
                  "
                  clearable
                  @click:clear="search = ''"
                />
              </v-col>
              <v-col cols="auto" class="d-flex align-center">
                <v-btn
                  @click="create_unit()"
                  class="cardCss text-capitalize"
                  dark
                  size="small"
                  prepend-icon="mdi-plus"
                  elevation="2"
                >
                  Add Unit
                </v-btn>
              </v-col>

              <!-- Back Button -->
              <v-col cols="auto" class="d-flex align-center">
                <v-btn 
                  text
                  @click="goBack"
                  class="back-link ml-4"
                  color="primary"
                   size="small"
                >
                  <v-icon left>mdi-arrow-left</v-icon>
                  Back 
                </v-btn>
              </v-col>
            </v-row>

            <v-data-table
              :headers="unitHeaders"
              :items="sortedAndPaginatedItems"
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
                    >mdi-ruler-outline</v-icon
                  >
                  <div class="text-h6 grey--text mb-2">No Units Found</div>
                  <div class="text-body-2 grey--text">
                    Try adjusting your search criteria or add a new unit.
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
                  <div class="text-body-2 grey--text">Loading units...</div>
                </div>
              </template>

              <!-- Unit Name -->
              <template v-slot:[`item.material_unit_name`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon size="20" color="primary" class="mr-3"
                    >mdi-ruler</v-icon
                  >
                  <div>
                    <div class="font-weight-medium text-body-1">
                      {{ item.material_unit_name }}
                    </div>
                  </div>
                </div>
              </template>

              <!-- Actions -->
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex align-center justify-center">
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        size="small"
                        color="error"
                        variant="text"
                        @click.stop="open_deletedailog(item)"
                        v-bind="props"
                        class="cursor-pointer"
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Delete Unit</span>
                  </v-tooltip>
                </div>
              </template>
            </v-data-table>

            <!-- Modern Table Footer -->
            <div class="table-footer">
              <div class="footer-info">
                {{
                  totalItems === 0
                    ? "No Results"
                    : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} units`
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

      <div v-if="componentCheck == 1">
        <DeleteUnit
          :unitdeletion="unitdeletion"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          :rowInfo="rowInfo"
          @clicked="unitdeletion = false"
        />
      </div>
      <div v-if="componentCheck == 2">
        <CreateUnit
          :unitcreation="unitcreation"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @clicked="unitcreation = false"
        />
      </div>
    </div>
  </div>
</template>
        <script>
/*eslint-disable*/
import CreateUnit from "@/components/MaterialManagement/Popups/CreateUnit.vue";
import EditProjectsite from "@/components/MaterialManagement/Popups/EditProjectsite.vue";
import DeleteUnit from "@/components/MaterialManagement/Popups/DeleteUnit.vue";
import { create_list_edit_delete_units } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    EditProjectsite,
    DeleteUnit,
    CreateUnit,
  },
  data() {
    return {
      unitHeaders: [
        {
          title: "Unit Name",
          value: "material_unit_name",
          sortable: true,
          align: "start",
        },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
      fixed: true,
      tableData: [],
      tableLoading: false,
      componentCheck: 0,
      SnackBarComponent: {},
      unitcreation: false,
      rowInfo: {},
      unitdeletion: false,
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: [{ key: "material_unit_name", order: "asc" }],
      windowHeight: 0,
    };
  },
  created() {
    this.windowHeight = window.innerHeight - 310;
    this.fetch_projectsite(); // Updated to modern structure
  },
  watch: {
    search() {
      this.currentPage = 1;
    },
    currentPage(newVal) {
      // When the page changes, scroll to top of the card container
      this.$nextTick(() => {
        const cardContainer = document.querySelector(".card-container");
        if (cardContainer) {
          cardContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Fallback to scrolling to top of page
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    },
  },
  computed: {
    filteredItems() {
      if (!this.search || this.search.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.search.toLowerCase().trim();
      return this.tableData.filter((item) =>
        item.material_unit_name.toLowerCase().includes(searchTerm)
      );
    },
    sortedAndPaginatedItems() {
      // First sort the filtered items
      const sortedItems = this.filteredItems.slice().sort((a, b) => {
        for (const sort of this.sortBy) {
          const aValue = this.getSortValue(a[sort.key], sort.key);
          const bValue = this.getSortValue(b[sort.key], sort.key);

          if (aValue < bValue) return sort.order === "asc" ? -1 : 1;
          if (aValue > bValue) return sort.order === "asc" ? 1 : -1;
        }
        return 0;
      });

      // Then paginate
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return sortedItems.slice(start, end);
    },
    totalItems() {
      return this.filteredItems.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
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
  methods: {
    getSortValue(value, key) {
      if (!value) return "";
      if (key === "material_unit_name") {
        return value.toLowerCase();
      }
      return value;
    },

    handleSortChange(newSortBy) {
      this.sortBy = newSortBy;
      this.currentPage = 1; // Reset to first page when sorting changes
    },

    open_deletedailog(value) {
      this.rowInfo = value;
      this.componentCheck = 1;
      this.unitdeletion = true;
    },
    create_unit() {
      this.componentCheck = 2;
      this.unitcreation = true;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.tableData = [];

      this.unitdeletion = false;
      this.unitcreation = false;
      this.fetch_projectsite();
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

    async fetch_projectsite() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_units, {
            input: {
              action_type: "LIST_UNIT",
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(
          result.data.create_list_edit_delete_units
        );
        this.tableLoading = false;
        this.tableData = response.data || [];
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    goBack() {
      this.$emit('backAction');
    }
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
</style>