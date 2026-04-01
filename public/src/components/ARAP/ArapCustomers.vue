<template>
  <div>
    <!-- <v-card flat class="mt-n2" > -->
    <v-row no-gutters>
      <!-- Left Panel - Customer List -->
      <v-col cols="12" sm="6" class="">
        <v-card flat class="ma-2 d-flex flex-column" :height="cardHeight">
          <v-card-text class="">
            <!-- Header Summary -->
            <v-row align="center" class="mb-3">
              <v-col cols="5">
                <div class="font-weight-medium">
                  You'll Give:
                  <span class="text-green">₹{{ totalPayableAmount }}</span>
                  <v-icon size="small" color="green">mdi-arrow-top-right</v-icon>
                </div>
              </v-col>
              <v-col cols="1" class="d-flex justify-center">
                <v-divider vertical></v-divider>
              </v-col>
              <v-col cols="5">
                <div class="font-weight-medium">
                  You'll Get:
                  <span class="text-red">₹{{ totalReceivableAmount }}</span>
                  <v-icon size="small" color="red">mdi-arrow-bottom-left</v-icon>
                </div>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col cols="6">
                <!-- Search Bar -->
                <v-text-field
                  label="Search For Customers"
                  density="compact"
                  variant="outlined"
                  class="mb-4"
                  style="max-width: 250px"
                  v-model="searchlist"
                  append-icon="mdi-magnify"
                />
              </v-col>
              <v-col cols="6" v-if="initiateAction == 0">
                <v-select
                  label="Filter By"
                  density="compact"
                  variant="outlined"
                  class="mb-4 ml-1"
                  style="max-width: 250px"
                  v-model="filterBy"
                  :items="[
                    { title: 'All', value: 'ALL' },
                    { title: 'You`ll Give', value: 'you_give' },
                    { title: 'You`ll Get', value: 'you_get' },
                    { title: 'Settled', value: 'settled' },
                  ]"
                />
              </v-col>
              <!-- <v-col cols="4">
                <v-select
                  label="Sort By"
                  density="compact"
                  variant="outlined"
                  class="mb-4 ml-1"
                  style="max-width: 250px"
                  v-model="sortBy"
                  :items="[
                    { title: 'Most Recent', value: 'most_recent' },
                    { title: 'Highest Amount', value: 'highest_amount' },
                    { title: 'Least Amount', value: 'least_amount' },
                    { title: 'By Name', value: 'by_name' },
                    { title: 'Oldest', value: 'Oldest' },
                  ]"
                />
              </v-col> -->
            </v-row>
            <!-- Customer List -->
            <div
              v-if="customerData.length != 0"
              style="flex-grow: 1; overflow-y: auto"
              :style="{ height: listHeight + 'px', overflowY: 'auto' }"
            >
              <v-list lines="two">
                <v-list-item
                  v-for="(item, index) in filteredCustomers"
                  :key="index"
                  @click="ViewCustomerDetails(item)"
                  class="mb-2"
                  :style="{
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    borderRadius: '8px',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    backgroundColor:
                      customerDetails === item ? '#E0F7FA' : 'white',
                  }"
                >
                  <!-- Avatar -->
                  <template v-slot:prepend>
                    <v-avatar
                      size="48"
                      :style="{
                        backgroundColor: getLightTransparentColor(index),
                        color: '#333',
                      }"
                      class="elevation-0"
                    >
                      <span class="text-h6 text-uppercase">
                        {{ item.customer.customer_name?.charAt(0) || "?" }}
                      </span>
                    </v-avatar>
                  </template>

                  <!-- Info -->
                  <v-list-item-title class="font-weight-bold">
                    {{ item.customer.customer_name || "No Name" }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">
                    {{ item.customer.customer_brand_name || "-" }}
                  </v-list-item-subtitle>

                  <!-- Balance -->
                  <template v-slot:append>
                    <div class="text-right mr-2">
                      <div
                        v-if="
                          customerUpdatedID == item.customer.customer_id &&
                          updatedAmount != null
                        "
                      >
                        <div
                          :style="{
                            color:
                              Number(updatedAmount) < 0
                                ? 'red'
                                : Number(updatedAmount) > 0
                                ? 'green'
                                : 'black',
                          }"
                          class="font-weight-bold"
                        >
                          ₹
                          {{ Math.abs(updatedAmount) }}
                        </div>
                      </div>
                      <div
                        v-else
                        :style="{
                          color:
                            item.TransactionSummary.currentBalance < 0
                              ? 'green'
                              : item.TransactionSummary.currentBalance > 0
                              ? 'red'
                              : 'black',
                        }"
                        class="font-weight-bold"
                      >
                        ₹
                        {{ Math.abs(item.TransactionSummary.currentBalance) }}
                      </div>

                      <div class="text-caption">Total Transaction</div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
            <div
              v-else
              class="d-flex justify-center align-center fill-height text-center"
            >
              {{ initiateAction == 0 ? "No Transaction" : "No Customer" }}
            </div>
          </v-card-text>
          <div v-if="initiateAction == 0" class="d-flex justify-center pt-4">
            <v-btn
              color="secondaryColor"
              class="cardCss"
              @click="initiateTransaction(customerDetails)"
            >
              Initiate Transaction
            </v-btn>
          </div>
          <div v-if="initiateAction == 1" class="d-flex justify-start pt-4">
            <v-btn color="secondaryColor" class="cardCss" @click="backTransaction()">
              Back
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- Right Panel - Transaction Details -->
      <v-col
        cols="12"
        sm="6"
        class=""
        v-if="
          customerDetails &&
          Object.keys(customerDetails).length &&
          customerDetails.customer
        "
      >
        <v-card flat class="ma-2" :height="cardHeight">
          <CustomerTransaction
            :key="customerDetails?.customer?.customer_id || indexKey"
            :transactionList="transactionList"
            @clicked="closeDialog"
            :customerDetails="customerDetails"
            @errorMsg="error_info"
            @blanceAmount="balanceCheck"
            @customerID="customerCheck"
          />
        </v-card>
      </v-col>
    </v-row>
    <!-- v-on:youGaveTransaction="success_call" -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- </v-card> -->
  </div>
</template>

<script>
/*eslint-disable*/

import CustomerTransaction from "@/components/ARAP/popups/CustomerTransaction.vue";
import SnackBar from "@/components/SnackBar.vue";
import { list_All_Customers } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import YouGaveCustomer from "@/components/ARAP/popups/YouGaveCustomer.vue";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";

export default {
  components: {
    SnackBar,
    CustomerTransaction,
    YouGaveCustomer,
  },
  mixins: [get_global_customers],
  data() {
    return {
      ComponentCheck: 0,
      searchlist: "",
      filterBy: "ALL",
      sortBy: "",
      totalPayableAmount: "",
      totalReceivableAmount: "",
      updatedAmount: null,
      customerUpdatedID: "",
      Give_Got_Type: "",
      next_token: null,
      fixed: true,
      customerLoading: false,
      transactionList: false,
      giveGotTransaction: false,
      customerData: [],
      SnackBarComponent: {},
      customerDetails: {},
      indexKey: 0,
      cardHeight: 0,
      listHeight: 0,
      noTransactionArray: [],
      transactionArray: [],
      actualResposne: {},
      initiateAction: 0,
    };
  },
  computed: {
    filteredCustomers() {
      let result = this.customerData;

      // 1. Filter by transaction balance
      if (this.filterBy === "you_give") {
        result = result.filter(
          (item) => item.TransactionSummary?.currentBalance < 0
        );
      } else if (this.filterBy === "you_get") {
        result = result.filter(
          (item) => item.TransactionSummary?.currentBalance > 0
        );
      } else if (this.filterBy === "settled") {
        result = result.filter(
          (item) => item.TransactionSummary?.currentBalance === 0
        );
      }

      // 2. Search filter on customer data
      if (this.searchlist) {
        const search = this.searchlist.toLowerCase();
        result = result.filter((item) =>
          Object.values(item.customer || {}).some((value) =>
            String(value).toLowerCase().includes(search)
          )
        );
      }

      return result;
    },
  },
  async mounted() {
    this.initiateAction = 0;
    this.cardHeight = window.innerHeight - 115;
    this.listHeight = this.cardHeight - 230;
    // await this.get_global_customers();
    this.fetch_customers();
    // console.log(this.masterCustomers);
    // this.customersArray = this.masterCustomers;
    // await this.fetch_customers();
  },
  methods: {
    customerCheck(val) {
      this.customerUpdatedID = val;
    },
    ViewCustomerDetails(item) {
      this.customerDetails = {}; // reset first if needed
      this.indexKey += 1; // force re-render
      this.customerDetails = item;
      this.transactionList = true;
      // this.fetch_customers();
    },

    getLightTransparentColor(index) {
      const colors = [
        "rgba(244, 67, 54, 0.2)",
        "rgba(233, 30, 99, 0.2)",
        "rgba(156, 39, 176, 0.2)",
        "rgba(63, 81, 181, 0.2)",
        "rgba(33, 150, 243, 0.2)",
        "rgba(0, 188, 212, 0.2)",
        "rgba(76, 175, 80, 0.2)",
        "rgba(255, 235, 59, 0.2)",
        "rgba(255, 152, 0, 0.2)",
        "rgba(121, 85, 72, 0.2)",
      ];
      return colors[index % colors.length];
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
      this.customerData = [];
      this.giveGotTransaction = false;
      this.next_token = null;
      this.fetch_customers();
    },
    // success_call(){

    // },
    handleClick(item) {
      this.ComponentCheck = 1;
      this.transactionList = true;
      this.customerDetails = item;
    },

    closeDialog() {
      this.transactionList = false;
      this.fetch_customers();
    },

    get_updatedate(date) {
      if (date != "" && date != undefined) {
        return format_Date(date);
      }
    },

    open_yougot(item) {
      this.customerDetails = item;
      this.Give_Got_Type = "You_Gave";
      this.ComponentCheck = 2;
      this.giveGotTransaction = true;
    },

    open_yougave(item) {
      this.customerDetails = item;
      this.Give_Got_Type = "You_Got";
      this.ComponentCheck = 2;
      this.giveGotTransaction = true;
    },

    initiateTransaction() {
      this.customerData = [];
      this.customerData = this.noTransactionArray;
      this.totalReceivableAmount = 0;
      this.totalPayableAmount = 0;
      this.initiateAction = 1;
    },

    backTransaction() {
      this.customerDetails = {};
      this.initiateAction = 0;
      this.customerData = this.transactionArray;
      this.totalReceivableAmount = this.actualResposne.summary.totalReceivable;
      this.totalPayableAmount = this.actualResposne.summary.totalPayable;
    },
    balanceCheck(val) {
      this.updatedAmount = val;
    },

    async fetch_customers() {
      this.customerLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_All_Customers, {
            input: {
              nextToken: this.next_token,
              limit: 100,
            },
          })
        );
        this.customerLoading = false;
        let response = JSON.parse(result.data.list_All_Customers);
        // console.log("customers", response);
        if (response.Status == "SUCCESS") {
          this.actualResposne = response;

          const filteredCustomers = response.data.filter(
            (item) =>
              item.TransactionSummary.totalReceived !== 0 ||
              item.TransactionSummary.totalPaid !== 0
          );
          const filterNoTransactionsCust = response.data.filter(
            (item) =>
              item.TransactionSummary.totalReceived == 0 &&
              item.TransactionSummary.totalPaid == 0
          );
          // this.customerData = response.data;
   

          // const filteredCustomers = response.data.filter(
          //   (item) =>
          //     item.TransactionSummary.totalReceived !== 0 &&
          //     item.TransactionSummary.totalPaid !== 0
          // );
          this.transactionArray = filteredCustomers;

          // const filterNoTransactionsCust = response.data.filter(
          //   (item) =>
          //     item.TransactionSummary.totalReceived == 0 &&
          //     item.TransactionSummary.totalPaid == 0
          // );
          // console.log(filterNoTransactionsCust, filteredCustomers);
          this.noTransactionArray = filterNoTransactionsCust;
          this.customerData = filteredCustomers;
          this.totalReceivableAmount = response.summary.totalReceivable;
          this.totalPayableAmount = response.summary.totalPayable;
          // console.log(this.totalPayable);
          this.next_token = response.nextTokenResponse;
          this.updatedAmount = null;
        } else {
          this.totalReceivableAmount = 0;
          this.totalPayableAmount = 0;
          this.customerData = [];
          this.next_token = null;
        }
        // console.log(JSON.parse(result.data.list_All_Customers).data);
      } catch (error) {
        this.customerLoading = false;
        this.customerData = [];
        this.next_token = null;
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