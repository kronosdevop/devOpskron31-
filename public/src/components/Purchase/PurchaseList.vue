<template>
  <div>
    <v-card flat>
      <v-toolbar flat>
        <v-spacer />
        <v-btn dark @click="createOrder()" class="text-capitalize cardCss">
          Generate
        </v-btn>
        <v-btn dark class="text-capitalize ml-2 cardCss" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="purchaseHeaders"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 mt-n2 dtwidth"
          :options.sync="pagination"
          @update:options="handle_pagination()"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="primaryColor"
              class=""
              small
              @click="statusChange(item)"
              >mdi-pencil</v-icon
            >
            COMPLETED
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreatePurchase
        :purchaseCreation="purchaseCreation"
        @clicked="purchaseCreation = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <PurchaseStatus
        :purchaseUpdate="purchaseUpdate"
        @clicked="purchaseUpdate = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { list_all_purchase_orders } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import PurchaseStatus from "@/components/Purchase/Popups/PurchaseStatus.vue";
import CreatePurchase from "@/components/Purchase/Popups/CreatePurchase.vue";
export default {
  components: {
    CreatePurchase,
    PurchaseStatus,
    SnackBar,
  },
  data() {
    return {
      purchaseCreation: false,
      rowInfo: {},
      purchaseHeaders: [
        { text: "Name", value: "material_name", sortable: false },
        { text: "Quantity", value: "material_quantity", sortable: false },
        { text: "Supplier", value: "supplier_name", sortable: false },
        { text: "Delivery Location", value: "location_name", sortable: false },
        {
          text: "Order Status",
          value: "order_delivery_status",
          sortable: false,
        },
        { text: "Action", value: "actions", sortable: false },
      ],
      fixed: true,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      tableData: [],
      nextToken: null,
      tableLoading: false,
      purchaseUpdate: false,
      SnackBarComponent: {},
      componentCheck: 0,
    };
  },
  mounted() {
    this.get_all_purchase();
  },
  methods: {
    back_call() {
      this.$router.push("AdminLevelApps");
    },
    createOrder() {
      this.componentCheck = 1;
      this.purchaseCreation = true;
    },
    statusChange(item) {
      this.componentCheck = 2;
      this.purchaseUpdate = true;
      this.rowInfo = item;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.nextToken = null;
      this.tableData = [];
      this.purchaseUpdate = false;
      this.purchaseCreation = false;
      this.get_all_purchase();
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
    handle_pagination() {
      if (this.nextToken) {
        this.get_all_purchase();
      }
    },
    async get_all_purchase() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_purchase_orders, {
            nextToken: this.nextToken,
            limit: 100,
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.list_all_purchase_orders);
        // console.log(response);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          // this.nextToken = response.nextToken;
          this.tableData = response.data;

          // const uniqueArrayOfObjects = this.tableData.filter(
          //   (obj, index, self) =>
          //     index ===
          //     self.findIndex((o) => o.dashboard_id === obj.dashboard_id)
          // );

          // this.tableData = uniqueArrayOfObjects;
        } else {
          this.tableLoading = false;
          this.tableData = [];
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

<style>
</style>