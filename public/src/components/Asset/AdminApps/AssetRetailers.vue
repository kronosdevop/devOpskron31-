<template>
  <div>
    <v-card flat >
      <v-toolbar flat class="bg-white">
        <v-btn
          variant="text"
          class="back-link"
          @click="$emit('backAction')"
        >
          <v-icon>mdi-arrow-left</v-icon>
          Back to Asset Settings
        </v-btn>
        <v-spacer />
        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="outlined"
          label="Search Retailers"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          style="max-width: 300px;"
          class="mr-4"
          @input="onSearchChange"
        ></v-text-field>
        <v-btn
          size="small"
          dark
          @click="add_retailer()"
          class="text-capitalize cardCss text-white"
        >
          Add
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-4">
        <v-data-table
          :headers="retailerHeaders"
          :items="paginatedItems"
          :loading="tableLoading"
          :sort-by="['asset_retailer_name']"
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
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-store</v-icon>
              <div class="text-h6 text-grey mb-2">No Retailers Found</div>
              <div class="text-body-2 text-grey">
                No asset retailers have been added yet.
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
              <div class="text-body-2 text-grey">Loading retailers...</div>
            </div>
          </template>

          <template v-slot:[`item.asset_retailer_code`]="{ item }">
            <span>{{
              item.asset_retailer_code == null ? "-" : item.asset_retailer_code
            }}</span>
          </template>
          <template v-slot:[`item.full_contact_no`]="{ item }">
            <span>{{
              item.full_contact_no == null ? "-" : item.full_contact_no
            }}</span>
          </template>
          <template v-slot:[`item.asset_retailer_email`]="{ item }">
            <span>{{
              item.asset_retailer_email == null ||
              item.asset_retailer_email == undefined
                ? "-"
                : item.asset_retailer_email
            }}</span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="red"
              class="mr-2"
              size="small"
              @click="open_editdailog(item)"
              >mdi-pencil</v-icon
            >
            <v-icon color="red" size="small" @click="open_deletedailog(item)"
              >mdi-delete</v-icon
            >
          </template>
          <template v-slot:[`item.contact_name`]="{ item }">
            <span>{{
              item.contact_name == null || item.contact_name == undefined
                ? "-"
                : item.contact_name
            }}</span>
          </template>
        </v-data-table>

        <!-- Modern Table Footer -->
        <div class="table-footer">
          <div class="footer-info">
            {{
              totalCount === 0
                ? "No Results"
                : `Showing ${paginatedItems.length} of ${totalCount} retailers`
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
    <div v-if="componentcheck == 1">
      <AddRetailer
        :createretailer="createretailer"
        @clicked="createretailer = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentcheck == 2">
      <EditRetailer
        :retaileredition="retaileredition"
        @clicked="retaileredition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :retaileritem="retaileritem"
      />
    </div>
    <div v-if="componentcheck == 3">
      <DeleteRetailer
        :retaileredeletion="retaileredeletion"
        @clicked="retaileredeletion = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :retaileritem="retaileritem"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
<script>
import { API, graphqlOperation } from "aws-amplify";

import { create_list_edit_delete_asset_retailers } from "@/graphql/mutations.js";
import SnackBar from "@/components/SnackBar.vue";
import DeleteRetailer from "@/components/Asset/Popups/DeleteRetailer.vue";
import AddRetailer from "@/components/Asset/Popups/AddRetailer.vue";
import EditRetailer from "@/components/Asset/Popups/EditRetailer.vue";
export default {
  components: {
    AddRetailer,
    EditRetailer,
    DeleteRetailer,
    SnackBar,
  },
  emits: ['backAction'],
  data() {
    return {
      createretailer: false,
      retaileredition: false,
      retaileredeletion: false,
      SnackBarComponent: {},
      componentcheck: 0,
      fixed: true,
      retailerRecords: [],
      tableLoading: false,
      retaileritem: {},
      retailerHeaders: [
        {
          title: "Distributor",
          key: "asset_distributor_name",
          sortable: false,
        },
        {
          title: "Name",
          key: "asset_retailer_name",
          sortable: false,
        },
        {
          title: "Contact Name",
          key: "contact_name",
          sortable: false,
        },
        {
          title: "Code",
          key: "asset_retailer_code",
          sortable: false,
        },

        {
          title: "Email ID",
          key: "asset_retailer_email",
          sortable: false,
        },
        {
          title: "Contact No",
          key: "full_contact_no",
          sortable: false,
        },

        { title: "Actions", key: "actions", sortable: false },
      ],
      currentPage: 1,
      itemsPerPage: 20,
      paginatedItems: [],
      windowHeight: 0,
      searchQuery: "",
      filteredRetailerRecords: [],
    };
  },
  mounted() {
    this.updateWindowHeight();
    window.addEventListener('resize', this.updateWindowHeight);
    this.fetch_retailerlist();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateWindowHeight);
  },
  computed: {
    totalCount() {
      return this.filteredRetailerRecords.length;
    },
    pageCount() {
      return Math.ceil(this.filteredRetailerRecords.length / this.itemsPerPage);
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
    currentPage() {
      this.updatePageItems();
    },
  },
  methods: {
    open_editdailog(item) {
      this.componentcheck = 2;
      this.retaileredition = true;
      this.retaileritem = item;
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
      this.createretailer = false;
      this.retaileredition = false;
      this.retaileredeletion = false;
      this.fetch_retailerlist();
    },

    open_deletedailog(item) {
      this.componentcheck = 3;
      this.retaileredeletion = true;
      this.retaileritem = item;
    },

    add_retailer() {
      this.componentcheck = 1;
      this.createretailer = true;
    },

    async fetch_retailerlist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_delete_asset_retailers, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(
          result.data.create_list_edit_delete_asset_retailers
        );
        this.retailerRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.retailerRecords = response.data;
          this.filterRetailers();
          this.tableLoading = false;
          this.updatePageItems();
        } else {
          this.retailerRecords = [];
          this.filteredRetailerRecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.retailerRecords = [];
        this.filteredRetailerRecords = [];

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

    onSearchChange() {
      this.currentPage = 1;
      this.filterRetailers();
      this.updatePageItems();
    },
    filterRetailers() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        this.filteredRetailerRecords = this.retailerRecords;
      } else {
        const query = this.searchQuery.toLowerCase().trim();
        this.filteredRetailerRecords = this.retailerRecords.filter(
          (retailer) => {
            return (
              (retailer.asset_retailer_name &&
                retailer.asset_retailer_name.toLowerCase().includes(query)) ||
              (retailer.asset_retailer_code &&
                retailer.asset_retailer_code.toLowerCase().includes(query)) ||
              (retailer.contact_name &&
                retailer.contact_name.toLowerCase().includes(query)) ||
              (retailer.asset_retailer_email &&
                retailer.asset_retailer_email.toLowerCase().includes(query)) ||
              (retailer.asset_distributor_name &&
                retailer.asset_distributor_name.toLowerCase().includes(query)) ||
              (retailer.full_contact_no &&
                retailer.full_contact_no.toString().includes(query))
            );
          }
        );
      }
    },
    updatePageItems() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.paginatedItems = this.filteredRetailerRecords.slice(startIndex, endIndex);
    },

    updateWindowHeight() {
      this.windowHeight = window.innerHeight - 310; // Adjust for header and toolbar
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
  color: #DB4C77 !important;
}

.back-link:hover {
  background-color: rgba(219, 76, 119, 0.1) !important;
  transform: translateX(-2px) !important;
}

.back-link .v-icon {
  margin-right: 8px !important;
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

@media (max-width: 480px) {
  .table-footer {
    padding: 8px 12px;
  }
  
  .footer-info {
    font-size: 12px;
  }
  
  .pagination-btn {
    min-width: 50px !important;
    font-size: 11px !important;
  }
  
  .active-page,
  .inactive-page {
    min-width: 28px !important;
    height: 28px !important;
    font-size: 11px !important;
  }
}
</style>