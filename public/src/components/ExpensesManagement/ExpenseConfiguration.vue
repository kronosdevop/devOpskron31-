<template>
  <div >
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat >
      <!-- <v-toolbar flat>
        <v-spacer />
        <v-btn
          dark
          @click="add_expense()"
          class="text-capitalize cardCss mt-n7 mr-2"
          >Add</v-btn
        >
      </v-toolbar> -->

      <!-- Data Table -->
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="sortedAndPaginatedItems"
          :loading="tableLoading"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalItems"
          hide-default-footer
          class="elevation-2 dtwidth text-caption rounded-lg"
          density="compact"
          hover
          multi-sort
          :fixed-header="true"
          :height="height"
          @update:sort-by="handleSortChange"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4"
                >mdi-format-list-bulleted</v-icon
              >
              <div class="text-h6 grey--text mb-2">No Expense Types Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your search criteria or add a new expense type.
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
              <div class="text-body-2 grey--text">Loading expense types...</div>
            </div>
          </template>

          <!-- Expense Type -->
          <template v-slot:[`item.expense_name`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-icon size="20" color="primary" class="mr-3"
                >mdi-format-list-bulleted</v-icon
              > -->
              <div>
                <div class="font-weight-medium text-body-2">
                  {{ item.expense_name || "N/A" }}
                </div>
              </div>
            </div>
          </template>

          <!-- Created By -->
          <template v-slot:[`item.expense_created_by`]="{ item }">
            <div class="d-flex align-center">
              <!-- <v-avatar size="24" color="primary" class="mr-2">
                <span
                  class="white--text font-weight-medium"
                  style="font-size: 10px"
                >
                  {{
                    (item.expense_created_by || "U")
                      .substring(0, 1)
                      .toUpperCase()
                  }}
                </span>
              </v-avatar> -->
              <span class="caption">
                {{ item.expense_created_by || "N/A" }}
              </span>
            </div>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <div class="d-flex align-start justify-start">
              <v-btn
                icon
                size="small"
                variant="text"
                @click.stop="delete_item(item)"
                color="red"
                class="cursor-pointer"
              >
                <v-icon size="18">mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>


              <!-- Modern Table Footer -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    totalItems === 0
                      ? "No Results"
                      : `Showing ${sortedAndPaginatedItems.length} of ${totalItems} expense types`
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




    
    <div v-if="componentCheck == 1">
      <AddExpenseconfi
        :addConfiguration="addConfiguration"
        @clicked="addConfiguration = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteExpenseconfi
        :deleteExpense="deleteExpense"
        :custom_details="custom_details"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="deleteExpense = false"
      />
    </div>
  </div>
</template>

<script>
import { list_expense_category } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
// import AddExpenseconfi from "./ExpensePopups/AddExpenseconfi.vue";
import DeleteExpenseconfi from "./ExpensePopups/DeleteExpenseconfi.vue";
export default {
  components: {
    SnackBar,
    // AddExpenseconfi,
    DeleteExpenseconfi,
  },
  data() {
    return {
      fixed: true,
      tableData: [],
      SnackBarComponent: {},
      tableLoading: false,
      addConfiguration: false,
      deleteExpense: false,
      height: 0,
      headers: [
        { title: "Category", value: "expense_name", sortable: false },
        { title: "Created By", value: "expense_created_by", sortable: false },
        { title: "Actions", value: "actions", sortable: false },

        // {
        //   text: "Role",
        //   value: "user_type",
        //   sortable: false,
        // },
        // {
        //   text: "Action",
        //   value: "action",
        //   sortable: false,
        // },
      ],
      componentCheck: 0,
      custom_details: {},
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    totalItems() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    sortedAndPaginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
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
  created() {
    this.height = window.innerHeight - 250;
    this.fetch_expenses();
  },
  methods: {
    add_expense() {
      this.componentCheck = 1;
      this.addConfiguration = true;
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
    delete_item(item) {
      this.componentCheck = 2;
      this.custom_details = item;
      this.deleteExpense = true;
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addConfiguration = false;
      this.deleteExpense = false;
      this.fetch_expenses();
    },
    handleSortChange() {
      // Implement sorting logic if needed
    },
    async fetch_expenses() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_expense_category, {
            input: {
              organization_id: data.organization.organization_id,
              nextToken: null,
              limit: 100,
            },
          })
        );

        this.tableLoading = false;
        this.tableData = [];

        var response = JSON.parse(result.data.list_expense_category);
        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
        } else {
          // this.SnackBarComponent = {
          //   SnackbarVmodel: true,
          //   SnackbarColor: "red",
          //   SnackbarText: response.Message,
          //   timeout: 5000,
          //   Top: true,
          // };
        }
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
  },
};
</script>

<style scoped>
.font-weight-medium {
  font-weight: 500;
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