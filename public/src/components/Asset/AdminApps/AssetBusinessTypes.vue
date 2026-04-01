<template>
  <div>
    <!-- Back Button Header -->
    <v-card flat class="">
      <v-toolbar flat class="bg-white">
        <v-btn variant="text" class="back-link" @click="$emit('backAction')">
          <v-icon>mdi-arrow-left</v-icon>
          Back to Asset Settings
        </v-btn>
        <v-spacer />
        <v-btn
          dark
          @click="add_business_type()"
          class="text-capitalize cardCss text-white"
        >
          Add
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="validTableData"
          :loading="tableLoading"
          :sort-by="['business_type_name']"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
          :fixed-header="true"
          :height="windowHeight"
        >
          <template v-slot:no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4"
                >mdi-briefcase</v-icon
              >
              <div class="text-h6 text-grey mb-2">No Business Types Found</div>
              <div class="text-body-2 text-grey">
                No business types have been added yet.
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
              <div class="text-body-2 text-grey">Loading business types...</div>
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="primary"
              class="mr-2"
              small
              @click="open_edit_dialog(item)"
              >mdi-pencil</v-icon
            >
            <v-icon color="red" small @click="open_delete_dialog(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalCount} business types`
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
                :class="page === currentPage ? 'active-page' : 'inactive-page'"
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

    <!-- Add Dialog -->
    <div v-if="componentcheck == 1">
      <AddBusinessType
        :createBusinessType="createBusinessType"
        @clicked="createBusinessType = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <!-- Edit Dialog -->
    <div v-if="componentcheck == 2">
      <EditBusinessType
        :editBusinessType="editBusinessType"
        @clicked="editBusinessType = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :businessTypeItem="businessTypeItem"
      />
    </div>

    <!-- Delete Dialog -->
    <div v-if="componentcheck == 3">
      <DeleteBusinessType
        :deleteBusinessType="deleteBusinessType"
        @clicked="deleteBusinessType = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :businessTypeItem="businessTypeItem"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import AddBusinessType from "@/components/Asset/Popups/AddBusinessType.vue";
import EditBusinessType from "@/components/Asset/Popups/EditBusinessType.vue";
import DeleteBusinessType from "@/components/Asset/Popups/DeleteBusinessType.vue";
import { create_list_edit_bussinesstype } from "@/graphql/mutations.js";

export default {
  components: {
    SnackBar,
    AddBusinessType,
    EditBusinessType,
    DeleteBusinessType,
  },
  emits: ["backAction"],
  data() {
    return {
      headers: [
        {
          title: "Business Type Name",
          key: "bussinesstypes_name",
          sortable: false,
        },
        { title: "Actions", key: "actions", sortable: false },
      ],
      tableData: [],
      tableLoading: false,
      componentcheck: 0,
      createBusinessType: false,
      editBusinessType: false,
      deleteBusinessType: false,
      businessTypeItem: {},
      SnackBarComponent: {},
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
    };
  },
  created() {
    this.fetch_business_types();
  },
  mounted() {
    this.updateWindowHeight();
    window.addEventListener("resize", this.updateWindowHeight);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.updateWindowHeight);
  },
  computed: {
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
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
    validTableData() {
      return this.tableData.filter((item) => {
        return item && typeof item === "object";
      });
    },
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
      this.paginatedItems = this.validTableData.slice(start, end);
    },
    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 320;
    },
    add_business_type() {
      this.componentcheck = 1;
      this.createBusinessType = true;
    },
    open_edit_dialog(item) {
      if (!item) {
        console.warn("Edit dialog called with undefined item");
        return;
      }
      this.componentcheck = 2;
      this.businessTypeItem = item;
      this.editBusinessType = true;
    },
    open_delete_dialog(item) {
      if (!item) {
        console.warn("Delete dialog called with undefined item");
        return;
      }
      this.componentcheck = 3;
      this.businessTypeItem = item;
      this.deleteBusinessType = true;
    },
    async fetch_business_types() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_bussinesstype, {
            input: {
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(result.data.create_list_edit_bussinesstype);

        this.tableData = [];
        this.tableLoading = false;

        if (response.Status == "SUCCESS") {
          this.tableData = response.data || [];
          this.updatePageItems();
        } else {
          this.tableData = [];
        }
      } catch (error) {
        this.tableLoading = false;
        this.tableData = [];
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            error.errors?.[0]?.message || "Error fetching business types",
          timeout: 5000,
          Top: true,
        };
      }
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.createBusinessType = false;
      this.editBusinessType = false;
      this.deleteBusinessType = false;
      this.fetch_business_types();
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
  },
};
</script>

<style scoped>
/* Back Button */
.back-link {
  font-weight: 500 !important;
  text-transform: none !important;
  letter-spacing: 0.5px !important;
  transition: all 0.2s ease !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  color: #db4c77 !important;
}

.back-link:hover {
  background-color: rgba(219, 76, 119, 0.1) !important;
  transform: translateX(-2px) !important;
}

.back-link .v-icon {
  margin-right: 8px !important;
}

/* Page Title */
.page-title {
  flex: 1;
}

.page-title span {
  margin: 0;
  color: black !important;
}

.page-title .v-icon {
  color: #db4c77 !important;
}

/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
  background: #db4c77 !important;
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
    padding: 12px 16px;
  }

  .pagination-controls {
    gap: 4px;
  }

  .pagination-btn {
    min-width: 60px !important;
    font-size: 12px !important;
  }

  .page-numbers {
    gap: 2px;
  }

  .active-page,
  .inactive-page {
    min-width: 32px !important;
    height: 32px !important;
    font-size: 12px !important;
  }
}
</style>

