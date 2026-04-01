<template>
  <v-dialog
    :model-value="productDialog"
    max-width="1100"
    transition="dialog-top-transition"
    presistent
  >
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <div class="d-flex align-center gap-3">
          <span class="text-h6 font-weight-medium"> CATEGORY PRODUCTS </span>
        </div>
        <v-spacer />
        <v-chip
          color="pink-lighten-4"
          class="text-pink-darken-2 mr-7"
          size="small"
        >
          {{ products.length }} Products
        </v-chip>

        <v-btn
          icon
          variant="text"
          size="small"
          color="red"
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-data-table
          :headers="headers"
          :items="paginatedProducts"
          :loading="loading"
          fixed-header
          :height="windowHeight"
          hide-default-footer
          class="modern-data-table"
          density="comfortable"
          hover
        >
          <template #item.item_name="{ item }">
            <div class="font-weight-medium">
              {{ item.item_name }}
            </div>
          </template>

          <template #item.stock_quantity="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              :color="getStockColor(item.stock_quantity)"
            >
              {{ item.stock_quantity || 0 }}
            </v-chip>
          </template>

          <template #item.sale_price="{ item }">
            <span class="text-green-darken-2">
              ₹ {{ item.sale_price?.sale_price || 0 }}
            </span>
          </template>

          <template #item.purchase_price="{ item }">
            <span class="text-blue-darken-2">
              ₹ {{ item.purchase_price?.purchase_price || 0 }}
            </span>
          </template>

          <template #item.stock_value="{ item }">
            <span class="text-purple-darken-2">
              ₹ {{ item.stock_value || 0 }}
            </span>
          </template>

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
      </v-card-text>
      <div class="table-footer">
        <div class="footer-info">
          {{
            totalProducts === 0
              ? "No Result"
              : `Showing ${products.length} of ${totalProducts} products`
          }}
        </div>
        <div class="pagination-controls">
          <v-btn
            :disabled="currentPage === 1"
            variant="text"
            size="small"
            class="pagination-btn"
            @click="currentPage--"
            style="color: #666 !important"
            >PREVIOUS</v-btn
          >
          <div class="page-numbers">
            <v-btn
              v-for="page in visiblePages"
              :key="page"
              size="small"
              :variant="page === currentPage ? 'elevated' : 'text'"
              @click="currentPage = page"
              :class="page === currentPage ? 'active-page' : 'inactive-page'"
              >{{ page }}</v-btn
            >
          </div>
          <v-btn
            :disabled="currentPage === pageCount"
            variant="text"
            size="small"
            @click="currentPage++"
            >Next</v-btn
          >
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "CategoryProducts",

  props: {
    productDialog: {
      type: Boolean,
      required: true,
    },
    products: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["close"],

  data() {
    return {
      headers: [
        { title: "PRODUCT", value: "item_name" },
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
    totalProducts() {
      return this.products.length;
    },

    pageCount() {
      return Math.ceil(this.totalProducts / this.itemsPerPage);
    },

    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.products.slice(start, end);
    },

    visiblePages() {
      const pages = [];
      for (let i = 1; i <= this.pageCount; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  mounted() {
    this.windowHeight = window.innerHeight - 250;
  },

  methods: {
    getStockColor(qty) {
      const val = Number(qty) || 0;
      if (val <= 0) return "red";
      if (val < 10) return "orange";
      return "green";
    },
  },
};
</script>

<style scoped>
.modern-data-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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
