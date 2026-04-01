<template>
  <div style="padding-bottom: 70px">
    <!--  eslint-disable 
 -->
    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2" >
        <v-card-text class="pb-0">
          <v-row class="align-center mb-2" no-gutters>
            <v-col cols="auto">
              <v-text-field
                v-model="searchlist"
                placeholder="Search transactions..."
                prepend-inner-icon="mdi-magnify"
                variant="solo"
                hide-details
                density="compact"
                class="search-pill mr-4"
                style="min-width: 280px; max-width: 280px; height: 32px; border-radius: 999px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); font-size: 14px;"
                clearable
                @click:clear="searchlist = ''"
              ></v-text-field>
            </v-col>
            <v-col cols="auto">
              <v-select
                style="max-width: 200px"
                density="compact"
                variant="outlined"
                label="Location"
                item-title="location_name"
                item-value="location_id"
                v-model="loactionFilter"
                :items="filteredLocationItems"
                class="ml-2 mr-2"
                @update:model-value="filterStatus()"
              />
            </v-col>
            <v-col cols="auto">
              <v-select
                style="max-width: 200px"
                density="compact"
                variant="outlined"
                label="Product"
                item-title="sub_category_name"
                item-value="sub_category_id"
                :items="filteredSubMasterList"
                v-model="stockProduct"
                class="ml-2 mr-2"
                @update:model-value="filterStatus()"
              />
            </v-col>
            <v-spacer />
          </v-row>
          <v-data-table
            :headers="tableHeaders"
            :fixed-header="fixed"
            :search="searchlist"
            :items="StockData"
            :loading="tableLoading"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            :items-per-page="20"
            density="compact"
            class="elevation-2 dtwidth rounded-lg mt-0"
            hover
            hide-default-footer
          >
            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-format-list-bulleted</v-icon>
                <div class="text-h6 grey--text mb-2">No Transaction Data Found</div>
                <div class="text-body-2 grey--text">
                  Try adjusting your filter or check back later.
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
                <div class="text-body-2 grey--text">Loading transaction data...</div>
              </div>
            </template>
            <template
              v-slot:[`item.sub_category_consumption_timestamp`]="{ item }"
            >
              <span>{{
                get_updatedate(item.sub_category_consumption_timestamp)
              }}</span>
            </template>
            <template v-slot:[`item.transaction`]="{ item }">
              <span v-if="item.stock_credit" class="green--text"
                >+ {{ item.stock_credit }}</span
              >
              <span v-else class="red--text">- {{ item.stock_debit }}</span>
            </template>
            <template v-slot:[`item.remaining_stock`]="{ item }">
              <span v-if="item.remaining_stock"> {{ item.remaining_stock }}</span>
              <span v-else>-</span>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      <!-- Footer bar always rendered -->
      <div
        class="footer-bar d-flex align-center justify-space-between px-6 py-2"
        style="min-height: 56px; background: #f7f8fa"
      >
        <div class="text-caption ml-4" style="color: black; font-size: 14px">
          {{
            StockData.length === 0
              ? "No Results"
              : (pagination.page - 1) * itemsPerPage + 1 +
                " to " +
                Math.min(pagination.page * itemsPerPage, StockData.length) +
                " of " +
                StockData.length +
                " Results"
          }}
        </div>
        <div class="pagination-container d-flex align-center mr-4">
          <v-pagination
            v-model="pagination.page"
            :length="Math.ceil(StockData.length / itemsPerPage)"
            active-color="primary"
            density="comfortable"
            class="pagination-footer"
            :total-visible="5"
            next-icon="mdi-chevron-right"
            prev-icon="mdi-chevron-left"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */

import { get_sub_categories } from "@/mixins/GetMasterSubcategories.js";
import SnackBar from "@/components/SnackBar.vue";
import { product_Consumption_Logs } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import { get_location_details } from "@/mixins/GetLocations.js";
export default {
  components: {
    SnackBar,
  },
  mixins: [get_location_details, get_sub_categories],
  data() {
    return {
      searchlist: "",
      loactionFilter: "ALL",
      stockProduct: "ALL",
      fixed: true,
      tableLoading: false,
      StockData: [],
      tableHeaders: [
        { title: "Product", key: "sub_category_name", sortable: false },
        {
          title: "Created On",
          key: "sub_category_consumption_timestamp",
          sortable: false,
        },
        { title: "Location", key: "location_name", sortable: false },
        { title: "Remaining Stock", key: "remaining_stock", sortable: false },
        { title: "Transaction", key: "transaction", sortable: false },
        // { title: "Quantity", key: "location_name", sortable: false },
        // { title: "Action", key: "actions", sortable: false },
      ],
      addStockDialog: false,
      componentCheck: 0,
      SnackBarComponent: {},
      nextToken: null,
      pagination: {
        page: 1
      },
      itemsPerPage: 20,
    };
  },
  computed: {
    filteredSubMasterList() {
      this.MasterSubCategories.unshift({
        sub_category_name: "All",
        sub_category_id: "ALL",
        sub_category_type: "PRODUCT",
      });

      return this.MasterSubCategories.filter(
        (item) => item.sub_category_type === "PRODUCT"
      );
    },
    filteredLocationItems() {
      this.locationList.unshift({
        location_name: "All",
        location_id: "ALL",
      });
      return this.locationList.filter(
        (item) =>
          item.location_type != "SCAN_ANYWHERE" &&
          (item.is_product_inventory_space == null ||
            item.is_product_inventory_space == true)
      );
    },
  },
  async mounted() {
    await Promise.all([
      this.fetch_TransactionList(),
      this.get_location_details(),
      this.get_sub_categories(),
    ]);
  },

  methods: {
    get_updatedate(date) {
      if (date != "" && date != undefined) {
        return formatedatetime(date);
      }
    },
    filterStatus() {
      this.StockData = [];
      this.fetch_TransactionList();
    },
    async fetch_TransactionList() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(product_Consumption_Logs, {
            input: {
              sub_category_id: this.stockProduct,
              location_id: this.loactionFilter,
              nextToken: this.nextToken,
              limit: 11,
            },
          })
        );
        this.tableLoading = false;
        let response = JSON.parse(result.data.product_Consumption_Logs);
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.StockData = response.data;
        }
      } catch (error) {
        this.tableLoading = false;
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}
.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
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