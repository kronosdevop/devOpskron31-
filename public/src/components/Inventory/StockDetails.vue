<template>
  <div style="padding-bottom: 70px">
    <!--  eslint-disable  -->
    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2" >
        <v-card-text class="pb-0">
          <v-row class="align-center mb-2" no-gutters>
            <v-col cols="auto">
              <v-text-field
                v-model="searchlist"
                placeholder="Search stock..."
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
                label="Status"
                item-title="text"
                item-value="value"
                v-model="statusFilter"
                :items="statusItems"
                class="ml-2 mr-2"
                @update:model-value="filterStatus"
              />
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
                @update:model-value="filterStatus"
              />
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <v-btn
                variant="flat"
                @click="add_Stock()"
                dark
                size="small"
                class="text-capitalize cardCss"
              >
                Add Stock
              </v-btn>
            </v-col>
          </v-row>
          <v-data-table
            :headers="tableHeaders"
            :fixed-header="fixed"
            :search="searchlist"
            :items="StockData"
            :loading="tableLoading"
            :footer-props="{ itemsPerPageOptions: [10, 20] }"
            :items-per-page="20"
            density="compact"
            class="elevation-2 dtwidth rounded-lg mt-0"
            hide-default-footer
            hover
            @click:row="handle_row_click"
          >
            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-cube-outline</v-icon>
                <div class="text-h6 grey--text mb-2">No Stock Data Found</div>
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
                <div class="text-body-2 grey--text">Loading stock data...</div>
              </div>
            </template>
            <template v-slot:[`item.sub_category_Image`]="{ item }">
              <img
                :src="item.sub_category_Image"
                alt="Logo"
                style="width: 50px; height: 50px; object-fit: contain"
                v-if="item.sub_category_Image"
              />
              <span v-else class="ml-4"> - </span>
            </template>
            <template v-slot:[`item.sub_category_quantity`]="{ item }">
              <span>{{
                item.sub_category_quantity +
                " ( " +
                item.sub_category_unit_name +
                " ) "
              }}</span>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    @click.stop="adding_stock(item)"
                    color="green"
                  >
                    mdi-plus-box
                  </v-icon>
                </template>
                <span>Add Stock</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    @click.stop="handle_row_click(item)"
                    color="blue"
                    class="ml-2"
                  >
                    mdi-arrow-right-bold-circle
                  </v-icon>
                </template>
                <span>Consumption</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    @click.stop="handle_reorder(item)"
                    color="orange"
                    class="ml-2"
                  >
                    mdi-account-reactivate-outline
                  </v-icon>
                </template>
                <span>Reorder</span>
              </v-tooltip>
            </template>
            <template v-slot:[`item.sub_category_added_to_stock_on`]="{ item }">
              <span>{{
                get_updatedate(item.sub_category_added_to_stock_on)
              }}</span>
            </template>
            <template v-slot:[`item.sub_category_stock_status`]="{ item }">
              <span
                :class="
                  item.sub_category_stock_status == 'INSTOCK'
                    ? 'green--text'
                    : item.sub_category_stock_status == 'LOWSTOCK'
                    ? 'orange--text'
                    : 'red--text'
                "
                >{{ item.sub_category_stock_status }}</span
              >
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
    <div v-if="componentCheck == 1">
      <AddStock
        :addStockDialog="addStockDialog"
        @clicked="closeDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <ViewStockDetails
        :viewStockDialog="viewStockDialog"
        :rowInfo="rowInfo"
        @clicked="viewStockDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <reorderStock
        :reorderingStock="reorderingStock"
        :rowInfo="rowInfo"
        @clicked="reorderingStock = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <IndividualStock
        :stockIndividual="stockIndividual"
        :rowInfo="rowInfo"
        @clicked="stockIndividual = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import IndividualStock from "@/components/Inventory/Popups/IndividualStock.vue";
import reorderStock from "@/components/Inventory/Popups/reorderStock.vue";
import { get_location_details } from "@/mixins/GetLocations.js";
import AddStock from "./Popups/AddStock.vue";
import SnackBar from "@/components/SnackBar.vue";
import { List_product_stock } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import ViewStockDetails from "./Popups/ViewStockDetails.vue";
export default {
  components: {
    AddStock,
    SnackBar,
    reorderStock,
    ViewStockDetails,
    IndividualStock,
  },
  mixins: [get_location_details],
  data() {
    return {
      searchlist: "",
      // statusFilter: "ALL",
      loactionFilter: "ALL",
      fixed: true,
      tableLoading: false,
      stockIndividual: false,
      statusItems: [
        { text: "ALL", value: "ALL" },
        { text: "Instock", value: "INSTOCK" },
        { text: "Outofstock", value: "OUTOFSTOCK" },
        { text: "Lowstock", value: "LOWSTOCK" },
      ],
      StockData: [],
      tableHeaders: [
        { title: "Logo", key: "sub_category_Image", sortable: false },
        { title: "Product", key: "sub_category_name", sortable: false },
        // { text: "Unit", value: "sub_category_unit_name", sortable: false },
        { title: "Location", key: "location_name", sortable: false },
        { title: "Quantity", key: "sub_category_quantity", sortable: false },
        { title: "Status", key: "sub_category_stock_status", sortable: false },

        {
          title: "Updated On",
          key: "sub_category_added_to_stock_on",
          sortable: false,
        },
        {
          title: "Action",
          key: "actions",
          sortable: false,
        },
      ],
      addStockDialog: false,
      reorderingStock: false,
      componentCheck: 0,
      SnackBarComponent: {},
      nextToken: null,
      rowInfo: {},
      viewStockDialog: false,
      pagination: {
        page: 1
      },
      itemsPerPage: 20,
    };
  },

  async mounted() {
    await Promise.all([this.fetch_Stockitems(), this.get_location_details()]);
  },
  watch: {
    // Watch for changes to `statusFilter`
    statusFilter(newValue, oldValue) {
      this.filterStatus(newValue);
    },
  },
  computed: {
    statusFilter: {
      get() {
        return this.$store.getters.GetstockStatus; // Retrieve the current value from the store
      },
      set(value) {
        this.$store.commit("SetstockStatus", value); // Commit the change to the store
        this.filterStatus(value); // Optionally call filterStatus here
      },
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
  methods: {
    adding_stock(item) {
      this.componentCheck = 4;
      this.rowInfo = item;
      this.stockIndividual = true;
    },
    handle_reorder(item) {
      this.componentCheck = 3;
      this.rowInfo = item;
      this.reorderingStock = true;
    },
    filterStatus() {
      this.StockData = [];
      this.$emit("stock", 0);
      this.fetch_Stockitems();
    },
    get_updatedate(date) {
      if (date != "" && date != undefined) {
        return formatedatetime(date);
      }
    },
    add_Stock() {
      this.addStockDialog = true;
      this.componentCheck = 1;
      // this.$router.push("/AddingStock");
    },
    closeDialog() {
      this.addStockDialog = false;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addStockDialog = false;
      this.viewStockDialog = false;
      this.reorderingStock = false;
      this.stockIndividual = false;
      this.StockData = [];
      this.$emit("stock", 0);
      this.fetch_Stockitems();
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

    async fetch_Stockitems() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(List_product_stock, {
            input: {
              sub_category_id: "ALL",
              nextToken: this.nextToken,
              limit: 100,
              location_id: this.loactionFilter,
              sub_category_stock_status: this.statusFilter,
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.List_product_stock);
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.StockData = response.data;
        }
      } catch (error) {
        this.tableLoading = false;
        console.error(error);
      }
    },

    handle_row_click(item) {
      this.rowInfo = item;
      this.componentCheck = 2;
      this.viewStockDialog = true;
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
</style>