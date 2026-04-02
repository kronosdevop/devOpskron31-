<template>
  <v-dialog
    :model-value="ItemStock"
    max-width="520"
    persistent
    :key="selectedItem?.product_id"
  >
    <v-card class="stock-card dialog-layout">
      <!-- HEADER -->
<v-card-title class="header">
  
  <!-- LEFT ARROW -->
  <v-icon v-if="showStock" @click="showStock = false">
    mdi-arrow-left
  </v-icon>

  <span class="title">
    {{ showStock ? "Manage Stock" : "Product Details" }}
  </span>

  <v-spacer></v-spacer>

  <v-icon
    v-if="!showStock"
    @click="closeDialog"
  >
    mdi-close
  </v-icon>

</v-card-title>

      <v-card-text class="dialog-content">
        <div v-if="!showStock">
          <!-- product image -->
          <div class="image-box">
            <v-img
              v-if="selectedItem?.image"
              :src="selectedItem.image"
                  class="product-image"
              height="180"
              contain
            />
            <v-icon v-else size="70" color="grey"> mdi-package-variant </v-icon>
          </div>

          <div class="product-name">
            {{ selectedItem?.product_name }}
          </div>

          <div class="product-meta">
            {{ selectedItem?.unit_name }} • {{ selectedItem?.category_name }}
          </div>
          <div class="info-grid">
            <div class="info-box">
              <v-icon size="18" color="green" class="mt-4"
                >mdi-currency-inr</v-icon
              >
              <div>
                <span class="label">Price</span>
                <span class="value">{{ selectedItem?.price }}</span>
              </div>
            </div>

            <div class="info-box">
              <v-icon size="18" color="blue" class="mt-4"
                >mdi-package-variant</v-icon
              >
              <div>
                <span class="label">Total Stock</span>
                <span class="value"
                  >{{ selectedItem?.total_quantity }} PCS</span
                >
              </div>
            </div>

            <div class="info-box">
              <v-icon size="18" color="purple" class="mt-4">mdi-barcode</v-icon>
              <div>
                <span class="label">SKU</span>
                <span class="value">{{ selectedItem?.sku }}</span>
              </div>
            </div>
          </div>
          <!-- DESCRIPTION -->

          <div class="info-box-description">
            <span class="label"> Item Description </span>

            <div class="description-scroll">
              {{ selectedItem?.product_description }}
            </div>
          </div>

          <div class="section-title d-flex justify-space-between ">Locations
            <v-spacer></v-spacer>
            <v-btn size="small" variant="text" @click="LogDialog()" class="ml-2" color="primary"><v-icon class="mr-2">mdi-account-reactivate</v-icon> Recent Activity</v-btn>

          </div>

          <div class="location-stock">
            <div
              v-for="loc in Listlocation"
              :key="loc.location_id"
              class="location-chip"
            >
              <div class="location-left">
                <v-icon size="16" color="error"> mdi-map-marker </v-icon>

                <span class="location-name">
                  {{ loc.location_name }}
                </span>
              </div>

              <div
                class="qty-badge"
                :class="loc.quantity >= 5 ? 'stock-high' : 'stock-low'"
              >
                {{ loc.quantity }} PCS
              </div>
            </div>
          </div>

          <div class="manage-stock-btn">
            <v-btn
              block
              class="manage-btn"
              color="primary"
              variant="flat"
              @click="showStock = true"
            >
              <v-icon start>mdi-warehouse</v-icon>
              Manage Stock
            </v-btn>
          </div>
        </div>

        <div v-else>
          <span size="small" class="text-blue">Inventory Management</span>
          <div class="product-name">
            {{ selectedItem?.product_name }}
          </div>

          <div class="product-meta">
            {{ selectedItem?.unit_name }} • {{ selectedItem?.category_name }}
          </div>

          <v-select
            v-model="selectedLocation"
            :items="allLocations"
            item-title="location_name"
            item-value="location_id"
            variant="outlined"
            density="comfortable"
            class="mt-8"
            return-object
            @update:modelValue="locationChanged"
          >
            <template #label>
              <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
              Select Location
            </template>
          </v-select>

          <div class="counter">
            <v-btn icon variant="tonal" color="primary" @click="decrease">
              <v-icon>mdi-minus</v-icon>
            </v-btn>

            <div class="qty-display">
              <v-icon :color="arrowColor" size="26">
                {{ arrowIcon }}
              </v-icon>

              <div class="qty-number mr-5" :class="arrowColor">
                {{ Math.abs(stockChange) }}
              </div>
            </div>

            <v-btn icon variant="tonal" color="primary" @click="increase">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
          <div class="stock-summary">
            <div class="stock-box">
              <div class="stock-label">CURRENT STOCK</div>
              <div class="stock-value">{{ originalQty }}</div>
            </div>

            <div class="divider"></div>

            <div class="stock-box">
              <div class="stock-label blue">UPDATED STOCK</div>
              <div class="stock-value blue">{{ currentQty }}</div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions v-if="showStock">
        <v-btn
          block
          variant="flat"
          color="primary"
          :loading="loading"
          :disabled="loading"
          @click="updateStock"
        >
          <v-icon start v-if="!loading"> mdi-database-edit </v-icon>

          {{ loading ? "Updating..." : "Update Stock" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <ItemLogs :LogsItem="LogsItem" :logsdata="logsdata" @close="LogsItem = false  " />
</template>

<script>
import { get_location_details } from "@/mixins/GetLocations.js";
import { API, graphqlOperation } from "aws-amplify";
import { restock_Inventory } from "@/graphql/mutations.js";
import { consume_Inventory } from "@/graphql/mutations.js";
import ItemLogs from "@/components/NewInventory/ItemLogs.vue";

export default {
  mixins: [get_location_details],
  components: {
    ItemLogs,
  },
  props: {
    ItemStock: Boolean,
    selectedItem: Object,
  },
  data() {
    return {
      quantity: null,
      selectedLocation: null,
      Listlocation: [],
      loading: false,
      allLocations: [],
      currentQty: 0,
      originalQty: 0,
      showStock: false,
      LogsItem: false,
      logsdata: {},
    };
  },
  computed: {
    stockChange() {
      return this.currentQty - this.originalQty;
    },

    arrowIcon() {
      if (this.stockChange > 0) return "mdi-arrow-up";
      if (this.stockChange < 0) return "mdi-arrow-down";
    },

    arrowColor() {
      if (this.stockChange > 0) return "green";
      if (this.stockChange < 0) return "red";
      return "grey";
    },
  },
  watch: {
    selectedItem: {
      immediate: true,
      async handler(val) {
        if (!val) return;

        await this.get_location_details();

        const locations = [];
        const allLocations = [];

        this.locationList.forEach((loc) => {
          const key = loc.location_id.replaceAll("-", "_");
          const qty = val.location_quantities?.[key] || 0;

          const locationObj = {
            location_id: loc.location_id,
            location_name: loc.location_name,
            quantity: qty,
          };

          // all locations for dropdown
          allLocations.push(locationObj);

          // only locations with stock
          if (qty > 0) {
            locations.push(locationObj);
          }
        });

        this.Listlocation = locations;
        this.allLocations = allLocations;

        if (allLocations.length) {
          this.selectedLocation = allLocations[0];
          this.currentQty = allLocations[0].quantity || 0;
          this.originalQty = allLocations[0].quantity || 0;
        }
      },
    },
  },

  methods: {
    async updateStock() {
      this.loading = true;
      if (this.currentQty === this.originalQty) {
        return;
      }

      try {
        let response;

        // STOCK INCREASE
        if (this.currentQty > this.originalQty) {
          response = await API.graphql(
            graphqlOperation(restock_Inventory, {
              input: {
                products: [
                  {
                    product_id: this.selectedItem?.product_id,
                    quantity: this.currentQty,
                    location_id: this.selectedLocation.location_id,
                    location_name: this.selectedLocation.location_name,
                  },
                ],
              },
            }),
          );

          const result = JSON.parse(response.data.restock_Inventory);

if (result.Status === "SUCCESS") {

  const diff = this.currentQty - this.originalQty

  // update total stock
  this.selectedItem.total_quantity += diff

  // update location quantity
  const loc = this.Listlocation.find(
    l => l.location_id === this.selectedLocation.location_id
  )

  if (loc) {
    loc.quantity = this.currentQty
  }

  // RESET COUNTER
  this.originalQty = this.currentQty

  this.$emit("successMsg", result.Message)
} else {
            this.$emit("errorMsg", result.Message);
          }
        }

        // STOCK DECREASE
        else if (this.currentQty < this.originalQty) {
          const consumeQty = this.originalQty - this.currentQty;

          response = await API.graphql(
            graphqlOperation(consume_Inventory, {
              input: {
                product_id: this.selectedItem?.product_id,
                location_id: this.selectedLocation.location_id,
                quantity: consumeQty,
              },
            }),
          );

          const result = JSON.parse(response.data.consume_Inventory);

 if (result.Status === "SUCCESS") {

  const diff = this.originalQty - this.currentQty

  // update total stock
  this.selectedItem.total_quantity -= diff

  // update location quantity
  const loc = this.Listlocation.find(
    l => l.location_id === this.selectedLocation.location_id
  )

  if (loc) {
    loc.quantity = this.currentQty
  }

  // reset change counter
  this.originalQty = this.currentQty

  this.$emit("successMsg", result.Message)
}else {
            this.$emit("errorMsg", result.Message);
          }
        }
      } catch (e) {
        this.$emit("errorMsg", e.message);
      } finally {
        this.loading = false;
      }
    },
    closeDialog() {
      this.showStock = false;
      this.loading = false;
      this.$emit("close", 0);
    },
    LogDialog() {
      this.LogsItem = true;
      this.logsdata = this.selectedItem;
            console.log("item", this.logsdata);
    },
    locationChanged(val) {
      this.currentQty = val.quantity || 0;
      this.originalQty = val.quantity || 0;
    },
    increase() {
      this.currentQty++;
    },

    decrease() {
      if (this.currentQty > 0) {
        this.currentQty--;
      }
    },
  },
};
</script>
<style scoped>
.stock-card {
  border-radius: 18px;
  padding: 14px;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.image-box{
width:100%;
height:20%; 
border-radius:14px;
overflow:hidden;
display:flex;
align-items:center;
justify-content:center;
margin-bottom:16px;
}

.product-image{
width:100%;
height:100%;
object-fit:cover; 
}

.product-name {
  font-size: 20px;
  font-weight: 600;
  margin-top: 6px;
}

.product-meta {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
}

.info-grid{
display:grid;
grid-template-columns:120px 120px 1fr;
gap:12px;
margin-bottom:18px;
}

.info-box{
display:flex;
align-items:center;
gap:10px;
background:#f3f4f6;
padding:12px;
border-radius:12px;
min-height:70px;
overflow:hidden;
}

.info-box:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.label {
  font-size: 11px;
  color: #6b7280;
  display: block;
}
.value{
font-weight:600;
font-size:15px;
display:block;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
max-width:100%;
}
.info-box:last-child .value{
white-space:normal;
word-break:break-all;
}
.info-box-description {
  background: #f9fafb;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.section-title {
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 15px;
}

.location-stock {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.location-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  padding: 8px 12px;
  background: white;
  transition: all 0.2s ease;
}

.location-chip:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.location-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.location-name {
  font-size: 13px;
}

.qty-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.stock-high {
  background: #dcfce7;
  color: #16a34a;
}

.stock-low {
  background: #ffe4e6;
  color: #ef4444;
}

.manage-btn {
  margin-top: 20px;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.4px;
}
.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
  margin: 20px 0;
}

.qty-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 28px;
  font-weight: 600;
}

.qty-number {
  font-size: 32px;
  font-weight: 700;
}

.green {
  color: #16a34a;
}

.red {
  color: #ef4444;
}

.stock-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  margin-top: 10px;
}

.stock-box {
  flex: 1;
  text-align: center;
}

.stock-label {
  font-size: 12px;
  letter-spacing: 1px;
  color: #888;
  font-weight: 600;
}

.stock-value {
  font-size: 24px;
  font-weight: 700;
}

.blue {
  color: #2563eb;
}

.divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
}
.description-scroll {
  max-height: 120px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  padding-right: 4px;
}
</style>
