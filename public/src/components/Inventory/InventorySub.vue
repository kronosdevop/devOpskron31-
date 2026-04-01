<template>
  <div>
    <v-card flat class="mt-4" >
      <v-card class="rounded-lg ml-4 pa-4 mr-4" outlined>
        <v-row align="center">
          <!-- <v-col cols="12" sm="2">
            <div class="pt-1 mt-n4" style="font-size: small">TOTAL VALUE</div>
            <div class="font-weight-bold text-h5">₹ {{ totalAmount }}</div>
          </v-col>
          <v-divider vertical></v-divider> -->
          <v-col cols="12">
            <div class="d-flex" style="gap: 30px">
              <v-card
                width="150px"
                height="100"
                class="rounded-xl outlined"
                color="green"
                @click="$store.commit('SetstockStatus', 'INSTOCK')"
              >
                <div
                  class="d-flex flex-column justify-center align-center"
                  style="height: 100%; padding: 10px"
                >
                  <span> In Stock </span><br />
                  <div class="font-weight-bold">{{ inStock }}</div>
                </div>
              </v-card>

              <v-card
                width="150px"
                height="100"
                class="rounded-xl outlined"
                color="orange"
                @click="$store.commit('SetstockStatus', 'LOWSTOCK')"
              >
                <div
                  class="d-flex flex-column justify-center align-center"
                  style="height: 100%; padding: 10px"
                >
                  <span> Low stock </span><br />
                  <div class="font-weight-bold">{{ lowStock }}</div>
                </div>
              </v-card>

              <v-card
                width="150px"
                height="100"
                class="rounded-xl outlined"
                color="#EF5350"
                @click="$store.commit('SetstockStatus', 'OUTOFSTOCK')"
              >
                <div
                  class="d-flex flex-column justify-center align-center"
                  style="height: 100%; padding: 10px"
                >
                  <span> Out of stock </span><br />
                  <div class="font-weight-bold">{{ outStock }}</div>
                </div>
              </v-card>
            </div>

            <!-- <div class="pt-1">
              <b>{{ total }}</b> Products
            </div> -->
            <!-- <v-progress-linear
              height="8"
              rounded
              :model-value="100"
              class="mt-2"
            >
              <template #default>
                <div class="progress-bar-segments">
                  <div
                    class="stock-bar in-stock"
                    :style="{ width: (inStock / total) * 100 + '%' }"
                  ></div>
                  <div
                    class="stock-bar low-stock"
                    :style="{ width: (lowStock / total) * 100 + '%' }"
                  ></div>
                  <div
                    class="stock-bar out-stock"
                    :style="{ width: (outStock / total) * 100 + '%' }"
                  ></div>
                </div>
              </template>
            </v-progress-linear>
            <div class="d-flex align-center justify-start mt-2 text-caption">
              <div class="d-flex align-center mr-4">
                <v-icon size="10" color="cyan" class="mr-1">mdi-circle</v-icon>
                In stock: <strong>{{ inStock }}</strong>
              </div>
              <div class="d-flex align-center mr-4">
                <v-icon size="10" color="orange" class="mr-1"
                  >mdi-circle</v-icon
                >
                Low stock: <strong>{{ lowStock }}</strong>
              </div>
              <div class="d-flex align-center">
                <v-icon size="10" color="red" class="mr-1">mdi-circle</v-icon>
                Out of stock: <strong>{{ outStock }}</strong>
              </div>
            </div> -->
          </v-col>
        </v-row>
      </v-card>

      <v-toolbar
        
        density="compact"
        flat
        class="mt-n2"
      >
        <v-btn-toggle
          class="ml-3"
          v-model="toggle_exclusive"
          density="compact"
          variant="outlined"
          mandatory
          divided
        >
          <v-btn
            size="small"
            class="text-capitalize"
            :class="toggle_exclusive === 'stock' ? 'active-btn' : ''"
            value="stock"
          >
            Stock
          </v-btn>
          <v-btn
            size="small"
            class="text-capitalize"
            :class="toggle_exclusive === 'inventoty' ? 'active-btn' : ''"
            value="inventoty"
          >
            Transaction List
          </v-btn>
          <v-btn
            size="small"
            class="text-capitalize"
            :class="toggle_exclusive === 'product' ? 'active-btn' : ''"
            value="product"
          >
            Product
          </v-btn>
          <v-btn
            size="small"
            class="text-capitalize"
            :class="toggle_exclusive === 'location' ? 'active-btn' : ''"
            value="location"
          >
            Setting
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
      </v-toolbar>
      <div class="text-left" v-if="toggle_exclusive == 'product'">
        <v-card
          flat
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <InventoryProduct />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'stock'">
        <v-card
          flat
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <StockDetails @stock="refreshdashboard" />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'inventoty'">
        <v-card
          flat
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <TransactionList />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'location'">
        <v-card
          flat
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <LocationList />
        </v-card>
      </div>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
    
<script>
/*eslint-disable*/
import InventoryProduct from "@/components/Inventory/InventoryProduct.vue";
import SnackBar from "@/components/SnackBar.vue";
import StockDetails from "@/components/Inventory/StockDetails.vue";
import TransactionList from "@/components/Inventory/TransactionList.vue";
import LocationList from "@/components/Inventory/LocationList.vue";
import { get_Inventory_StockList } from "@/mixins/GetInventoryStockList.js";
export default {
  components: {
    StockDetails,
    TransactionList,
    SnackBar,
    LocationList,
    InventoryProduct,
  },
  mixins: [get_Inventory_StockList],
  data: () => ({
    toggle_exclusive: "stock",
    componentCheck: 0,
    dashboardCreation: false,
    cardHeight: 0,
    SnackBarComponent: {},
    inStock: 0,
    lowStock: 0,
    outStock: 0,
    total: "",
    totalAmount: "",
  }),

  async mounted() {
    this.$store.commit("SetstockStatus", "ALL");
    this.cardHeight = window.innerHeight - 250;
    await this.refreshdashboard();
  },
  methods: {
    async refreshdashboard() {
      await this.get_Inventory_StockList();
      await this.fetch_details();
    },
    fetch_details() {
      if (this.InventotyStockList) {
        this.inStock = this.InventotyStockList.total_in_stock;
        this.lowStock = this.InventotyStockList.total_low_stock;

        this.outStock = this.InventotyStockList.total_out_of_stock;
      } else {
        this.inStock = 0;
        this.lowStock = 0;
        this.outStock = 0;
      }
      // if (this.InventotyStockList && this.InventotyStockList.length > 0) {
      //   let inventoryData = this.InventotyStockList;
      //   inventoryData = Array.from(
      //     new Map(
      //       inventoryData.map((item) => [item.sub_category_id, item])
      //     ).values()
      //   );
      //   this.total = inventoryData.length;
      //   // console.log(this.InventotyStockList);
      //   // this.total = this.InventotyStockList.reduce(
      //   //   (sum, item) => sum + (item.sub_category_quantity || 0),
      //   //   0
      //   // );
      //   this.totalAmount = this.InventotyStockList.reduce(
      //     (sum, item) => sum + (item.amount_paid || 0),
      //     0
      //   );

      //   // this.inStock = this.InventotyStockList.filter(
      //   //   (item) => item.sub_category_stock_status === "INSTOCK"
      //   // ).reduce((sum, item) => sum + (item.sub_category_quantity || 0), 0);
      //   let instockData = this.InventotyStockList.filter(
      //     (item) => item.sub_category_stock_status === "INSTOCK"
      //   );
      //   this.inStock = [];

      //   const seenIds2 = new Set();

      //   instockData.forEach((obj) => {
      //     if (!seenIds2.has(obj.sub_category_id)) {
      //       seenIds2.add(obj.sub_category_id);
      //       this.inStock.push(obj);
      //     }
      //   });
      //   this.lowStock = instockData.filter(
      //     (obj) => obj.sub_category_quantity < obj.depletion_quantity
      //   );

      //   // this.lowStock = this.InventotyStockList.filter(
      //   //   (item) => item.sub_category_stock_status === "LOWSTOCK"
      //   // ).reduce((sum, item) => sum + (item.sub_category_quantity || 0), 0);

      //   let outstockData = this.InventotyStockList.filter(
      //     (item) => item.sub_category_stock_status === "OUTOFSTOCK"
      //   );
      //   this.outStock = [];

      //   const seenIds = new Set();

      //   outstockData.forEach((obj) => {
      //     if (!seenIds.has(obj.sub_category_id)) {
      //       seenIds.add(obj.sub_category_id);
      //       this.outStock.push(obj);
      //     }
      //   });

      // } else {
      //   this.total = 0;
      //   this.inStock = [];
      //   this.lowStock = [];
      //   this.outStock = [];
      // }
    },
  },
};
</script>