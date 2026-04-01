<template>
  <v-dialog
    :model-value="ItemDialog"
    max-width="1200"
    transition="dialog-top-transition"
    persistent
  >
    <v-card rounded="xl">

      <!-- HEADER -->
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="text-h6 font-weight-medium">UNIT ITEMS</span>
        <v-spacer/>
        <v-chip
          color="pink-lighten-4"
          class="text-pink-darken-2"
          size="small"
        >
          {{ items.length }} Items
        </v-chip>

        <v-btn icon variant="text" color="red" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>

      </v-card-title>

      <v-divider />

      <!-- TABLE -->
      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="paginatedProducts"
          fixed-header
             :height="windowHeight"
          :loading="loading"
          hide-default-footer
          density="comfortable"
          hover
          class="modern-data-table"
        >
          <!-- ITEM -->
          <template #item.item_name="{ item }">
            <div class="font-weight-medium">
              {{ item.item_name }}
            </div>
          </template>

          <!-- STOCK -->
          <template #item.stock_quantity="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              :color="getStockColor(item.stock_quantity)"
            >
              {{ item.stock_quantity || 0 }}
            </v-chip>
          </template>

          <!-- SALE -->
          <template #item.sale_price="{ item }">
            <span class="text-green-darken-2">
              ₹ {{ item.sale_price?.sale_price || 0 }}
            </span>
          </template>

          <!-- PURCHASE -->
          <template #item.purchase_price="{ item }">
            <span class="text-blue-darken-2">
              ₹ {{ item.purchase_price?.purchase_price || 0 }}
            </span>
          </template>

          <!-- STOCK VALUE -->
          <template #item.stock_value="{ item }">
            <span class="text-purple-darken-2">
              ₹ {{ Number(item.stock_value) || 0 }}
            </span>
          </template>

          <!-- STATUS -->
          <template #item.item_status="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              :color="item.item_status === 'ACTIVE' ? 'green' : 'red'"
            >
              {{ item.item_status }}
            </v-chip>
          </template>
        </v-data-table>

        <!-- FOOTER -->
       <div class="table-footer">
        <div class="footer-info">
          {{ totalItems === 0 ? 'No Item Available ': `Showing ${items.length } of ${totalItems} Items` }}
        </div>
        <div class="pagination-controls">
          <v-btn
          :disabled="currentPage === 1"
          variant="text"
          size = "small"
          class="pagination-btn"
          @click="currentPage--"
          style="color: #666 !important"
          >Previous</v-btn>
          <v-btn
          v-for="page in visiblePages"
          :key="page"
          :variant="page === currentPage ? 'elevated' : 'text'"
          size="small"
          @click="currentPage = page"
          :class="page === currentPage ? 'active-page' : 'inactive-page'"
          >
          {{ page }}

          </v-btn>
          <v-btn 
          :disabled="currentPage === pageCount"
          variant="text"
          size = "small"
          @click="currentPage++">Next</v-btn>
        </div>
       </div>
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "UnitItemsDialog",

  props: {
    ItemDialog: Boolean,
    items: {
      type: Array,
      default: () => [],
    },
    loading: Boolean,
  },

  emits: ["close"],

  data() {
    return {
      headers: [
        { title: "ITEM", value: "item_name" },
        { title: "STOCK", value: "stock_quantity", align: "center" },
        { title: "SALE PRICE", value: "sale_price", align: "center" },
        { title: "PURCHASE PRICE", value: "purchase_price", align: "center" },
        { title: "STOCK VALUE", value: "stock_value", align: "center" },
        { title: "STATUS", value: "item_status", align: "center" },
      ],
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
  totalItems() {
    return this.items.length;
  },

  pageCount() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  },

  paginatedProducts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.items.slice(start, end);
  },

  visiblePages() {
    const pages = [];
    for (let i = 1; i <= this.pageCount; i++) {
      pages.push(i);
    }
    return pages;
  },
},
mounted(){
  this.windowHeight =  window.innerHeight - 250;
},


  methods: {
    getStockColor(qty) {
      const val = Number(qty) || 0;
      if (val <= 0) return "red";
      if (val < 10) return "green-lighten-2";
      return "green";
    },
  },
};
</script>

<style scoped>
.modern-data-table {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
}

.modern-data-table .v-data-table-header {
  background: #f8f9fa;
}

.table-footer {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
}
</style>
