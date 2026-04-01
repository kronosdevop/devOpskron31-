<template>
  <!-- eslint-disable -->
  <div>
    <v-card v-if="cardValue == 1" :height="cardHeight">
      <!-- <v-row class="mt-4" align="center" justify="start">
        <v-avatar class="ml-2" color="green-lighten-4" size="30">
          <span class="text-subtitle-1 font-weight-bold">C</span>
        </v-avatar>
        <div class="ml-4">
          <div class="text-subtitle-1 font-weight-medium">
            Chaitra book stores
          </div>
          <div class="caption text-grey">+91 3803803884</div>
        </div>
        <v-spacer />
      
      </v-row> -->
      <v-toolbar elevation="0" density="compact" class="bg-white">
        <v-toolbar-title class="ml-2">
          <div class="custom-title">
            <v-avatar color="green-lighten-4" class="mt-2" size="35">
              <span class="text-subtitle-1 font-weight-bold">{{
                customerDetails.customer.customer_name.charAt(0)
              }}</span>
            </v-avatar>
            <span class="ml-3 pt-16 text-subtitle-1">
              {{ customerDetails.customer.customer_name }}</span
            >
          </div>
        </v-toolbar-title>
        <v-spacer />
      </v-toolbar>
      <!-- <div class="mt-4 d-flex justify-end">
          <span class="caption mr-2">NET BALANCE:</span>
          <span class="font-weight-bold text-red">You'll Get: ₹100</span>
        </div> -->
      <!-- <div class="mt-4">
        <div class="caption text-grey mb-2">Set Due Date:</div>
        <v-btn-toggle mandatory density="compact">
          <v-btn text size="small">7 days</v-btn>
          <v-btn text size="small">14 days</v-btn>
          <v-btn text size="small">30 days</v-btn>
          <v-btn text size="small">Select Date</v-btn>
        </v-btn-toggle>
      </div> -->

      <v-card-text class="mt-4 scrollable-apar">
        <div class="d-flex justify-end align-center">
          <span :style="{ color: balanceColor }" class="font-weight-bold">
            <v-icon size="small" :color="balanceColor">{{ iconName }}</v-icon>
            {{ balanceText }}
          </span>
        </div>
        <v-table class="mt-6" v-if="customerData.length > 0">
          <thead>
            <tr>
              <th class="text-left">ENTRIES</th>
              <th class="text-left">YOU GAVE</th>
              <th class="text-left">YOU GOT</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in customerData"
              :key="index"
              @click="View_Details(item)"
              style="cursor: pointer"
            >
              <td>
                <div class="mt-1 font-weight-bold">
                  <v-tooltip
                    location="bottom"
                    v-if="item.transaction_type == 'INVOICE_PAYMENT'"
                  >
                    <template v-slot:activator="{ props }">
                      <v-icon color="red" v-bind="props">
                        mdi-invoice-list-outline
                      </v-icon>
                    </template>
                    <span>Invoice Payment</span>
                  </v-tooltip>

                  <v-tooltip location="bottom" v-else>
                    <template v-slot:activator="{ props }">
                      <v-icon color="blue" v-bind="props">
                        mdi-receipt-text-outline
                      </v-icon>
                    </template>
                    <span>Normal Payment</span>
                  </v-tooltip>
                  {{ formatTimestamp(item.transaction_timestamp) }},
                  {{ get_updatedate(item.transaction_date) }}
                  <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        color="primary"
                        v-bind="props"
                        v-if="item.reversed"
                      >
                        mdi-arrow-u-left-top
                      </v-icon>
                    </template>
                    <span>Reverse Transaction</span>
                  </v-tooltip>
                </div>
                <div class="text-caption text-grey">
                  Balance: ₹{{ item.amount_paid ?? 0 }}
                </div>
                <div class="caption">
                  {{ item.notes || item.description || "-" }}
                </div>
              </td>

              <td
                :class="
                  item.bill_settling_type === 'PAID'
                    ? 'text-red font-weight-bold'
                    : ''
                "
              >
                <template v-if="item.bill_settling_type === 'PAID'"
                  >₹{{ item.amount_paid }}</template
                >
                <template v-else>-</template>
              </td>

              <td
                :class="
                  item.bill_settling_type === 'RECEIVED' ||
                  item.transaction_type === 'REVERSAL'
                    ? 'text-green font-weight-bold'
                    : ''
                "
              >
                <template
                  v-if="
                    item.bill_settling_type === 'RECEIVED' ||
                    item.transaction_type === 'REVERSAL'
                  "
                >
                  ₹{{ item.amount_paid }}
                </template>
                <template v-else>-</template>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- <v-list class="mt-4" v-if="customerData.length > 0">
          <v-list-item-group>
            <v-list-item
              v-for="(item, index) in customerData"
              :key="index"
              class="outlined-item"
              @click="View_Details(item)"
            >
              <v-list-item-content>
                <div class="d-flex justify-space-between text-caption">
                  <span class="text-left"
                    >{{ formatTimestamp(item.transaction_timestamp) }},
                    {{ get_updatedate(item.transaction_date) }}</span
                  >
                  <span
                    class="font-weight-bold d-flex align-center"
                    :style="{
                      color:
                        item.transaction_type === 'REVERSAL'
                          ? 'green'
                          : item.bill_settling_type === 'PAID'
                          ? 'red'
                          : 'green',
                    }"
                  >
                    ₹ {{ item.amount_paid }}
                    <v-icon
                      size="small"
                      class="ml-1"
                      :color="
                        item.transaction_type === 'REVERSAL'
                          ? 'green'
                          : item.bill_settling_type === 'PAID'
                          ? 'red'
                          : 'green'
                      "
                    >
                      {{
                        item.transaction_type === "REVERSAL"
                          ? "mdi-arrow-u-left-top"
                          : item.bill_settling_type === "PAID"
                          ? "mdi-arrow-top-right"
                          : "mdi-arrow-bottom-left"
                      }}
                    </v-icon>
                  </span>
                </div>

                <div class="d-flex justify-space-between text-caption mt-1">
                  <span class="text-left"
                    >Bal: ₹ {{ item.amount_paid ?? 0 }}</span
                  >
                  <span class="text-right">
                    {{
                      item.transaction_type === "REVERSAL"
                        ? "Reversed"
                        : item.bill_settling_type === "PAID"
                        ? "YOU GAVE"
                        : "YOU GOT"
                    }}
                  </span>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list> -->
        <div v-if="customerLoading">
          <span class="loading-text">Wait for a minute...</span>
          <v-progress-linear
            color="red"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </div>
        <v-container
          v-if="!customerLoading && customerData.length === 0"
          class="text-center mt-10"
        >
          <v-icon size="50" color="grey-darken-2">mdi-swap-vertical</v-icon>
          <p class="mt-2 font-weight-bold text-grey-darken-2">
            No transaction found for the customer
          </p>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-row dense class="w-100">
          <v-col cols="6">
            <v-btn
              density="compact"
              block
              style="color: red; background-color: rgba(255, 0, 0, 0.1)"
              @click="you_gave_Tab('You_Gave')"
            >
              You Gave ₹
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn
              density="compact"
              block
              style="background-color: rgba(0, 255, 0, 0.1); color: green"
              @click="you_gave_Tab('You_Got')"
            >
              You Get ₹
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <v-card v-if="cardValue == 2">
      <YouGaveCustomer
        @clicked="backAction"
        :itemValue="itemValue"
        :Give_Got_Type="Give_Got_Type"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </v-card>
    <v-card v-if="cardValue == 3">
      <CustomerTransactionView
        @clicked="backAction"
        :itemValue="itemValue"
        :customerData="customerData"
        :TransactionDetails="TransactionDetails"
      />
    </v-card>
  </div>
</template>

<script>
/* eslint-disable */
import { list_Customer_Transaction } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import YouGaveCustomer from "./YouGaveCustomer.vue";
import CustomerTransactionView from "./CustomerTransactionView.vue";
export default {
  props: {
    transactionList: Boolean,
    customerDetails: Object,
  },

  components: {
    YouGaveCustomer,
    CustomerTransactionView,
  },

  data() {
    return {
      customerLoading: false,
      customerData: [],
      getbalance: "",
      cardValue: 1,
      itemValue: {},
      Give_Got_Type: "",
      TransactionDetails: {},
      cardHeight: 0,
    };
  },
  mounted() {
    this.cardHeight = window.innerHeight - 115;
  },
  watch: {
    transactionList: {
      async handler() {
        if (this.transactionList) {
          await this.getCustomers();
        }
      },
      immediate: true,
    },
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
      this.getbalance = 0;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.$emit("youGaveTransaction", "success");
      this.customerData = [];
      this.cardValue = 1;
      this.getCustomers();
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

    async getCustomers() {
      this.customerLoading = true;
      this.customerData = [];
      try {
        let result = await API.graphql(
          graphqlOperation(list_Customer_Transaction, {
            input: {
              customer_id: this.customerDetails.customer.customer_id,
            },
          })
        );
        var response = JSON.parse(result.data.list_Customer_Transaction);
        this.customerLoading = false;
        if (response.Status == "SUCCESS") {
          this.customerData = response.data.transactions.sort(
            (a, b) => b.transaction_timestamp - a.transaction_timestamp
          );
          this.getbalance = response.data.balanceDue;
          this.$emit("blanceAmount", this.getbalance);
           this.$emit("customerID", this.customerDetails.customer.customer_id);
         
        } else {
          this.customerData = [];
        }
      } catch (error) {
        this.customerLoading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    you_gave_Tab(item) {
      this.cardValue = 2;
      this.itemValue = this.customerDetails;
      this.Give_Got_Type = item;
    },

    backAction() {
      this.cardValue = 1;
      this.getCustomers();
    },

    View_Details(item) {
      this.TransactionDetails = item;
      this.cardValue = 3;
      this.itemValue = this.customerDetails;
    },
  },
};
</script>
<style scoped>
.scrollable-content1 {
  min-height: 400px !important;
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
  border: 1px solid rgba(0, 0, 0, 0.2);
  /* Subtle border */
  border-radius: 8px;
  /* Rounded corners */
  margin-bottom: 8px;
  /* Space between items */
  padding: 5px;
  transition: all 0.2s ease-in-out;
}

.outlined-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  /* Light hover effect */
}
</style>