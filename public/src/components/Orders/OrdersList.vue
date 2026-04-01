<template>
  <div class="card-container" style="position: relative; padding-bottom: 70px;">
    <!--  eslint-disable
 -->
    <v-card flat >
      <v-toolbar flat >
        <v-select
          variant="outlined"
          density="compact"
          v-model="filterOrder"
          :items="[
            { text: 'All', value: 'ALL' },
            { text: 'Inprogress', value: 'ORDER_PLACED' },
            { text: 'Dispatched', value: 'DISPATCHED' },
            { text: 'Delivered', value: 'DELEVERED' },
            { text: 'Cancelled', value: 'CANCELLED' },
          ]"
          item-title="text"
          item-value="value"
          label="Filter Orders"
          style="max-width: 250px"
          class="mt-8 ml-4"
        />

        <v-spacer />
        <v-btn @click="add_order()" class="cardCss text-capitalize" dark>
          Create Order
        </v-btn>
      </v-toolbar>
      <v-card-text class="pa-4">
        <v-data-table
          :headers="Headers"
          :items="paginatedItems"
          :loading="tableLoading"
          :sort-by="[]"
          :items-per-page="itemsPerPage"
          :page="currentPage"
          :server-items-length="totalCount"
          hide-default-footer
          class="elevation-1 dtwidth text-caption rounded-lg"
          density="compact"
          hover
          fixed-header
          height="440px"
          @click:row="handle_row_click"
        >
          <template #no-data>
            <div class="text-center py-8">
              <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-cart</v-icon>
              <div class="text-h6 grey--text mb-2">No Orders Found</div>
              <div class="text-body-2 grey--text">
                Try adjusting your filter or create a new order.
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
              <div class="text-body-2 grey--text">Loading orders...</div>
            </div>
          </template>
          <template v-slot:[`item.products_count`]="{ item }">
            <div class="d-flex align-center">
              <span>{{ item.products_count }}</span>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-icon
                    small
                    class="ml-1"
                    color="green"
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-information
                  </v-icon>
                </template>

                <div style="white-space: pre">
                  Product Details
                  <br />
                  <template v-for="(product, index) in item.products" :key="index">
        <div>
                      {{ product.product_name }} — {{ product.quantity }}
                    </div>
                  </template>
                </div>
              </v-tooltip>
            </div>
          </template>

          <template v-slot:[`item.remaining_amount`]="{ item }">
            <span>
              {{
                item.remaining_amount != null
                  ? item.remaining_amount
                  : item.total_amount != null
                  ? item.total_amount
                  : "-"
              }}
            </span>
          </template>

          <template v-slot:[`item.advance_recevied`]="{ item }">
            <span>
              {{ item.advance_recevied != null ? item.advance_recevied : "-" }}
            </span>
          </template>

          <template v-slot:[`item.delivey_agent`]="{ item }">
            <span>
              {{
                item.order_deleverd_by && item.order_deleverd_by.name
                  ? item.order_deleverd_by.name
                  : "Not assigned"
              }}
            </span>
          </template>

          <template v-slot:[`item.order_delevery_status`]="{ item }">
            <span
              :style="{
                color:
                  item.order_delevery_status === 'ORDER_PLACED'
                    ? 'orange'
                    : item.order_delevery_status === 'DISPATCHED'
                    ? 'blue'
                    : item.order_delevery_status === 'DELEVERED'
                    ? 'green'
                    : item.order_delevery_status === 'CANCELLED'
                    ? 'red'
                    : 'black',
              }"
            >
              {{
                item.order_delevery_status === "ORDER_PLACED"
                  ? "Inprogress"
                  : item.order_delevery_status === "DISPATCHED"
                  ? "Dispatched"
                  : item.order_delevery_status === "DELEVERED"
                  ? "Delivered"
                  : item.order_delevery_status === "CANCELLED"
                  ? "Cancelled"
                  : item.order_delevery_status
              }}
            </span>
          </template>

          <template v-slot:[`item.action`]="{ item }">
            <v-menu
              :close-on-content-click="true"
              :location="'bottom start'"
              :z-index="3000"
              attach="body"
            >
              <template #activator="{ props }">
                <v-btn variant="text" v-bind="props">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click="view_order(item)">
                  <v-list-item-icon>
                    <v-icon
                      size="small"
                      :color="item.order_delevery_status === 'DISPATCHED' ? 'green' : 'primary'"
                    >
                      {{
                        item.order_delevery_status === "DISPATCHED"
                          ? "mdi-package-variant-closed-remove"
                          : "mdi-eye"
                      }}
                    </v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>
                    {{
                      item.order_delevery_status === "DISPATCHED"
                        ? "Close Order"
                        : "View Order"
                    }}
                  </v-list-item-title>
                </v-list-item>
                <template v-if="item.order_delevery_status === 'ORDER_PLACED'">
                  <v-list-item @click="dispatch_order(item)">
                    <v-list-item-icon>
                      <v-icon size="small" color="green">mdi-truck-delivery</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Dispatch Order</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="cancel_order(item)">
                    <v-list-item-icon>
                      <v-icon size="small" color="red">mdi-cart-remove</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Cancel Order</v-list-item-title>
                  </v-list-item>
                </template>
                <template v-else-if="item.order_delevery_status === 'DISPATCHED'">
                  <v-list-item @click="cancel_order(item)">
                    <v-list-item-icon>
                      <v-icon size="small" color="red">mdi-cart-remove</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>Cancel Order</v-list-item-title>
                  </v-list-item>
                </template>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-card-text>
      <div
        class="footer-bar d-flex align-center justify-space-between px-6 py-2"
        style="min-height: 56px; background: #f7f8fa"
      >
        <div class="text-caption ml-4" style="color: black; font-size: 14px">
          {{
            totalCount === 0
              ? "No Results"
              : (currentPage - 1) * itemsPerPage +
                1 +
                " to " +
                Math.min(currentPage * itemsPerPage, totalCount) +
                " of " +
                totalCount +
                " Results"
          }}
        </div>
        <div class="pagination-container d-flex align-center mr-4">
          <v-pagination
            v-model="currentPage"
            :length="pageCount"
            active-color="primary"
            density="comfortable"
            class="pagination-footer"
            :total-visible="5"
            next-icon="mdi-chevron-right"
            prev-icon="mdi-chevron-left"
          />
        </div>
      </div>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <AddOrder
        :addOrderDialog="addOrderDialog"
        @clicked="addOrderDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <ViewOrder
        :ViewOrderDialog="ViewOrderDialog"
        :rowInfo="rowInfo"
        @clicked="ViewOrderDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <CancelOrder
        :cancelOrderDialig="cancelOrderDialig"
        :rowInfo="rowInfo"
        @clicked="cancelOrderDialig = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <DispatchView
        :dispatchOrderDialog="dispatchOrderDialog"
        :rowInfo="rowInfo"
        @clicked="dispatchOrderDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

import AddOrder from "./AddOrder.vue";
import ViewOrder from "./ViewOrder.vue";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import { list_orders } from "@/graphql/queries.js";
import CancelOrder from "./CancelOrder.vue";
import DispatchView from "./DispatchView.vue";
export default {
  components: {
    AddOrder,
    ViewOrder,
    SnackBar,
    CancelOrder,
    DispatchView,
  },
  data() {
    return {
      SnackBarComponent: {},
      tableLoading: false,
      fixed: true,
      Headers: [
        { title: "Delivery Date", key: "expected_delevery_date" },
        { title: "Customer Name", key: "customer_name", sortable: false },
        { title: "Order ID", key: "order_transaction_id", sortable: false },
        { title: "Product", key: "products_count", sortable: false },
        { title: "Advance Paid", key: "advance_recevied", sortable: false },
        { title: "Balance Amount", key: "remaining_amount", sortable: false },
        { title: "Delivery Agent", key: "delivey_agent", sortable: false },
        { title: "Status", key: "order_delevery_status", sortable: false },
        { title: "Action", key: "action", sortable: false },
      ],
      tableData: [],
      componentCheck: 0,
      addOrderDialog: false,
      ViewOrderDialog: false,
      nextToken: null,
      filterOrder: "ALL",
      cancelOrderDialig: false,
      dispatchOrderDialog: false,
      currentPage: 1,
      itemsPerPage: 20,
    };
  },
  computed: {
    totalCount() {
      return this.tableData.length;
    },
    pageCount() {
      return Math.ceil(this.tableData.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.tableData.slice(start, end);
    },
  },
  created() {
    this.fetch_Orderlist();
  },
  watch: {
    filterOrder(newVal) {
      this.fetch_Orderlist();
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  methods: {
    add_order() {
      this.addOrderDialog = true;
      this.componentCheck = 1;
    },

    view_order(item) {
      this.ViewOrderDialog = true;
      this.componentCheck = 2;
      this.rowInfo = item;
    },

    cancel_order(item) {
      this.componentCheck = 3;
      this.rowInfo = item;
      this.cancelOrderDialig = true;
    },

    dispatch_order(item) {
      this.componentCheck = 4;
      this.rowInfo = item;
      this.dispatchOrderDialog = true;
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
      this.addOrderDialog = false;
      this.cancelOrderDialig = false;
      this.dispatchOrderDialog = false;
      this.ViewOrderDialog = false;
      this.fetch_Orderlist();
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

    async fetch_Orderlist() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_orders, {
            input: {
              limit: 100,
              nextToken: this.nextToken,
              order_delevery_status: this.filterOrder,
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.list_orders);
        this.tableLoading = false;
        this.tableData = response.data;
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
    handle_row_click(click, val) {
      // Optionally implement row click if needed
    },
  },
};
</script>

<style scoped>
.card-container {
  position: relative;
  padding-bottom: 70px;
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
  overflow: auto;
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