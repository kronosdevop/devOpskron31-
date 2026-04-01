<template>
  <!-- eslint-disable -->
  <div>
    <v-card v-if="cardValue == 1" class="overflow-hidden" :height="supplierHeight">
      <v-toolbar elevation="0" density="compact" class="bg-white">
        <v-toolbar-title class="text-black ml-2">
          <div class="custom-title">
            Supplier Transaction of {{ SuplierData.supplier.supplier_name }}
          </div>
        </v-toolbar-title>
        <v-spacer />
        <!-- <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon> -->
      </v-toolbar>
      <v-card-text class="mt-4 ">
        <div class="d-flex justify-end align-center">
          <span :style="{ color: balanceColor }" class="font-weight-bold">
            <v-icon small :color="balanceColor">{{ iconName }}</v-icon>
            {{ balanceText }}
          </span>
        </div>
          <div v-if="suplierLoading">
          <span class="loading-text">Wait for a minute...</span>
          <v-progress-linear
            color="red"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </div>
        <v-responsive :height="contenHeight"  class="overflow-auto" v-if="SupliersData.length > 0">
          <v-list class="mt-4" v-if="SupliersData.length > 0">
            <v-list-item-group>
              <v-list-item
                v-for="(item, index) in SupliersData"
                :key="index"
                class="outlined-item"
                @click="View_Details(item)"
              >
                <v-list-item-content>
                  <div class="d-flex justify-space-between text-caption">
                    <span class="text-left">
                      <v-tooltip
                        bottom
                        v-if="
                          item.transaction_type == 'INVOICE_CREATED' ||
                          item.transaction_type == 'INVOICE_PAYMENT'
                        "
                      >
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon color="red" v-bind="attrs" v-on="on">
                            mdi-invoice-list-outline
                          </v-icon>
                        </template>
                        <span>Invoice Payment</span>
                      </v-tooltip>

                      <v-tooltip bottom v-else>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon color="blue" v-bind="attrs" v-on="on">
                            mdi-receipt-text-outline
                          </v-icon>
                        </template>
                        <span>Normal Payment</span>
                      </v-tooltip>
                      {{ formatTimestamp(item.transaction_timestamp) }},
                      {{ get_updatedate(item.transaction_date) }}
                    </span>
                    <span
                      class="font-weight-bold d-flex align-center"
                      :style="{
                        color:
                          item.reversed == true
                            ? 'green'
                            : item.transaction_type === 'NORMAL_PAYMENT' ||
                              item.transaction_type === 'INVOICE_PAYMENT'
                            ? 'red'
                            : 'green',
                      }"
                    >
                      ₹ {{ item.amount_paid }}

                      <v-icon
                        small
                        class="ml-1"
                        :color="
                          item.reversed == true
                            ? 'green'
                            : item.transaction_type === 'NORMAL_PAYMENT' ||
                              item.transaction_type === 'INVOICE_PAYMENT'
                            ? 'red'
                            : 'green'
                        "
                      >
                        {{
                          item.reversed == true
                            ? "mdi-arrow-u-left-top"
                            : item.transaction_type === "NORMAL_PAYMENT" ||
                              item.transaction_type === "INVOICE_PAYMENT"
                            ? "mdi-arrow-top-right"
                            : "mdi-arrow-bottom-left"
                        }}
                      </v-icon>
                    </span>
                  </div>
                  <div class="d-flex justify-space-between text-caption mt-1">
                    <span class="text-left" v-if="!item.reversed">
                      Bal: ₹ {{ item.amount_paid ?? 0 }}</span
                    >
                    <span v-else>{{ `    ` }} </span>
                    <span class="text-right">
                      {{
                        item.reversed == true
                          ? "Reversed"
                          : item.transaction_type === "NORMAL_PAYMENT" ||
                            item.transaction_type === "INVOICE_PAYMENT"
                          ? "PAYMENT"
                          : "PURCHASE"
                      }}
                    </span>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-responsive>
      
        <v-container
          v-if="!suplierLoading && SupliersData.length === 0"
          class="text-center mt-10"
        >
          <v-icon size="50" color="grey darken-2">mdi-swap-vertical</v-icon>
          <p class="mt-2 font-weight-bold text-grey-darken-2">
            No transaction found for the customer
          </p>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-row>
          <v-col cols="6">
            <v-btn
              dense
              block
              style="background-color: rgba(0, 255, 0, 0.1); color: green"
              @click="purchase_payment_Tab('purchase_type')"
            >
              Purchase ₹
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn
              dense
              block
      
              style="color: red; background-color: rgba(255, 0, 0, 0.1)"
              @click="purchase_payment_Tab('payment_type')"
            >
              Payment ₹
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <v-card v-if="cardValue == 2">
      <PurchasePaymentSuplier
        @clicked="backAction"
        :purchase_payment_Type="purchase_payment_Type"
        :itemValue="itemValue"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </v-card>
    <v-card v-if="cardValue == 3">
      <SuplierTransactionView
        @clicked="backAction"
        :itemValue="itemValue"
        :TransactionDetails="TransactionDetails"
      />
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import { list_supplier_transaction } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import PurchasePaymentSuplier from "./PurchasePaymentSuplier.vue";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import SuplierTransactionView from "./SuplierTransactionView.vue";

export default {
  props: {
    SuplierDetails: Boolean,
    SuplierData: Object,
  },

  components: {
    PurchasePaymentSuplier,
    SuplierTransactionView,
  },

  data() {
    return {
      suplierLoading: false,
      supplierHeight: 0,
      contenHeight:0,
      SupliersData: [],
      suplierHeaders: [
        { text: "Pending Amount", value: "pending_amount", sortable: false },
        { text: "Amount Paid", value: "amount_paid", sortable: false },
        {
          text: "Transaction Type",
          value: "transaction_type",
          sortable: false,
        },
      ],
      searchlist: "",
      fixed: true,
      cardValue: 1,
      getbalance: 0,
      purchase_payment_Type: "",
      itemValue: {},
    };
  },
  watch: {
    SuplierDetails: {
      async handler(newValue) {
        if (newValue === true) {
          await this.getSupliers();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.supplierHeight = window.innerHeight -130;
    this.contenHeight=window.innerHeight -300
  },

  computed: {
    balanceText() {
      if (this.getbalance === 0) {
        return `₹ 0`;
      }
      return this.getbalance < 0
        ? `You will get: ₹ ${Math.abs(this.getbalance)}`
        : `You will give: ₹ ${this.getbalance}`;
    },
    balanceColor() {
      if (this.getbalance === 0) {
        return "black";
      }
      return this.getbalance < 0 ? "red" : "green";
    },
    iconName() {
      if (this.getbalance === 0) {
        return "";
      }
      return this.getbalance < 0
        ? "mdi-arrow-bottom-left"
        : "mdi-arrow-top-right";
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    formatTimestamp(unixTimestamp) {
      if (!unixTimestamp) return "";

      const date = new Date(unixTimestamp * 1000);
      return date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    },
    get_updatedate(date) {
      if (date != "" && date != undefined) {
        return formatdisplayDate(date);
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
      this.SupliersData = [];
      this.cardValue = 1;
      this.getSupliers();
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
    purchase_payment_Tab(item) {
      this.purchase_payment_Type = item;
      this.cardValue = 2;
      this.itemValue = this.SuplierData;
    },

    async getSupliers() {
      this.suplierLoading = true;
      this.SupliersData = [];
      try {
        let result = await API.graphql(
          graphqlOperation(list_supplier_transaction, {
            input: {
              suppliers_id: this.SuplierData.supplier.suppliers_id,
            },
          })
        );
        var response = JSON.parse(result.data.list_supplier_transaction);
        this.suplierLoading = false;

        if (response.Status === "SUCCESS") {
          this.SupliersData = response.data.transactions.sort(
            (a, b) => b.transaction_timestamp - a.transaction_timestamp
          );

          this.getbalance =
            response.data.summary.balanceDue == undefined
              ? 0
              : response.data.summary.balanceDue;
          connsole.log(this.getbalance, " this.getbalance");
          this.suplierLoading = false;
        } else {
          this.SupliersData = [];
          this.suplierLoading = false;
        }
      } catch (error) {
        this.suplierLoading = false;
        // console.error("API error:", error);
      }
    },
    backAction() {
      this.cardValue = 1;
      this.getSupliers();
    },
    View_Details(item) {
      this.TransactionDetails = item;
      this.cardValue = 3;
      this.itemValue = this.SuplierData;
    },
  },
};
</script>

<style scoped>
.scrollable-content {
  
  overflow-y: auto;
  padding-right: 5px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.scrollable-content::-webkit-scrollbar {
  width: 2px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

.outlined-item {
  border: 1px solid rgba(0, 0, 0, 0.2); /* Subtle border */
  border-radius: 8px; /* Rounded corners */
  margin-bottom: 8px; /* Space between items */
  padding: 5px;
  transition: all 0.2s ease-in-out;
}

.outlined-item:hover {
  background-color: rgba(0, 0, 0, 0.05); /* Light hover effect */
}
</style>