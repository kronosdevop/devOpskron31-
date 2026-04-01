<template>
  <v-dialog
    :model-value="viewproductDialog"
    @update:model-value="$emit('update:viewproductDialog', $event)"
    persistent
    max-width="1200"
    transition="dialog-bottom-transition"
  >
    <v-card>

      <!-- HEADER -->
      <v-toolbar flat>
        <v-toolbar-title>
          {{ selectedProduct?.item_name || "Product Details" }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon @click="close_dialog()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider />

      <v-card-text class="pa-4">

        <!-- PRODUCT SUMMARY -->
        <v-card class="mb-4" v-if="selectedProduct && selectedProduct.item_type === 'PRODUCT'">
          <v-card-text>

            <div class="d-flex align-center justify-space-between mb-4">
              <h2 class="text-h6 font-weight-medium">
                {{ selectedProduct.item_name }}
              </h2>

              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-chart-line"
                class="text-none"
                @click="openStockAdjustment"
              >
                ADJUST STOCK
              </v-btn>
            </div>

            <v-row>
              <v-col cols="3">
                <div class="text-caption text-grey">SALE PRICE</div>
                <div class="text-h6">
                  ₹{{ selectedProduct.sale_price?.sale_price || 0 }}
                </div>
              </v-col>

              <v-col cols="3">
                <div class="text-caption text-grey">PURCHASE PRICE</div>
                <div class="text-h6">
                  ₹{{ selectedProduct.purchase_price?.purchase_price || 0 }}
                </div>
              </v-col>

              <v-col cols="3">
                <div class="text-caption text-grey">STOCK</div>
                <div
                  class="text-h6"
                  :style="{ color: getStockColor(selectedProduct.stock_quantity) }"
                >
                  {{ selectedProduct.stock_quantity || 0 }}
                </div>
              </v-col>

              <v-col cols="3" class="text-right">
                <div class="text-caption text-grey">STOCK VALUE</div>
                <div class="text-h6">
                  ₹{{ selectedProduct.stock_value || 0 }}
                </div>
              </v-col>
            </v-row>

          </v-card-text>
        </v-card>

        <!-- TRANSACTIONS -->
        <v-card>
          <v-card-text>

            <div class="d-flex justify-space-between mb-3">
              <h3 class="text-h6">Transactions</h3>

              <v-text-field
                v-model="searchTransaction"
                placeholder="Search transactions..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                width="250"
              />
            </div>

            <v-data-table
              :headers="transactionHeaders"
              :items="filteredTransactions"
              :loading="transactionLoading"
              fixed-header
              height="350"
            >
              <template v-slot:item.transaction_type="{ item }">
                <v-chip
                  :color="item.transaction_type === 'CREDIT' ? 'green' : 'red'"
                  size="small"
                  variant="tonal"
                >
                  {{ item.transaction_type }}
                </v-chip>
              </template>

              <template v-slot:item.stock_quantity="{ item }">
                <span :style="{ color: getStockColor(item.stock_quantity) }">
                  {{ item.stock_quantity }}
                </span>
              </template>

              <template v-slot:no-data>
                <div class="text-center py-6 text-grey">
                  No transactions found
                </div>
              </template>

            </v-data-table>

          </v-card-text>
        </v-card>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    viewproductDialog: Boolean,
    selectedProduct: Object
  },

  data() {
    return {
      searchTransaction: "",
      transactionLoading: false,

      transactionHeaders: [
        { title: "Type", key: "transaction_type" },
        { title: "Date", key: "transaction_date" },
        { title: "Qty", key: "stock_quantity" },
        { title: "Value", key: "stock_value" }
      ],

      transactions: [] // load via API
    }
  },

  computed: {
    filteredTransactions() {
      if (!this.searchTransaction) return this.transactions

      return this.transactions.filter(t =>
        Object.values(t)
          .join(" ")
          .toLowerCase()
          .includes(this.searchTransaction.toLowerCase())
      )
    }
  },

  methods: {
    getStockColor(qty) {
      const q = Number(qty || 0)
      if (q <= 0) return "red"
      if (q < 10) return "orange"
      return "green"
    },

    openStockAdjustment() {
      alert("Open stock adjustment dialog")
    }
  }
}
</script>
