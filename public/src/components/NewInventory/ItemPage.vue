<template>
  <div class="item-card">
    <OverlayComp :overlay="overlay" />

    <v-card flat class="mx-4 item-container">
      <div class="table-container">
        <div class="category-filter-wrapper">
          <!-- LEFT SCROLL BUTTON -->
          <v-btn
            icon
            size="small"
            variant="text"
            class="scroll-btn"
            :disabled="!canScrollLeft"
            @click="scrollCategories('left')"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>

          <!-- CHIPS CONTAINER -->
          <div class="chips-scroll" ref="chipsScroll" @scroll="checkScroll">
            <v-chip
              class="category-chip"
              :class="{ active: selectedCategory === null }"
              :color="selectedCategory === null ? 'primary' : ''"
              @click="selectedCategory = null"
            >
              <v-icon size="16" class="mr-1">mdi-view-grid</v-icon>
              All
            </v-chip>

            <v-chip
              v-for="cat in CategoryItems"
              :key="cat.category_id"
              class="category-chip"
              :class="{ active: selectedCategory === cat.category_name }"
              :color="selectedCategory === cat.category_name ? 'primary' : ''"
              @click="selectedCategory = cat.category_name"
            >
              {{ cat.category_name }}
            </v-chip>
          </div>

          <!-- RIGHT SCROLL BUTTON -->
          <v-btn
            icon
            size="small"
            variant="text"
            class="scroll-btn"
            :disabled="!canScrollRight"
            @click="scrollCategories('right')"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>

          <v-spacer />

          <v-select
            v-model="selectedLocation"
            :items="locationOptions"
            item-title="location_name"
            item-value="location_id"
            variant="outlined"
            density="compact"
            label="Location"
            return-object
            prepend-inner-icon="mdi-map-marker"
            class="mt-4"
            style="max-width: 250px"
          />
          <v-menu offset-y>
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="text-capitalize cardCss white--text mr-2 mb-2"
                density="comfortable"
                elevation="2"
                style="height: 36px"
                :loading="actionLoading"
                :disabled="actionLoading"
              >
                <v-icon>mdi-dots-vertical</v-icon>
                Actions
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="AddDialog">
                <template #prepend>
                  <v-icon color="primary">mdi-plus</v-icon>
                </template>

                <v-list-item-title class="menu-text">
                  Add Item
                </v-list-item-title>
              </v-list-item>

              <v-list-item @click="triggerImport">
                <template #prepend>
                  <v-icon color="primary">mdi-import</v-icon>
                </template>

                <v-list-item-title class="menu-text">
                  Import Items
                </v-list-item-title>

                <BulkItemImport
                  ref="bulkImport"
                  class="d-none"
                  :on-success="handleSuccess"
                  :before-upload="beforeUpload"
                />
              </v-list-item>

              <v-divider class="my-1" />

              <v-list-item
                @click="download_item"
                :disabled="templateLoading"
                class="menu-item"
              >
                <template #prepend>
                  <v-icon v-if="!templateLoading" color="#e57373" size="20">
                    mdi-download
                  </v-icon>

                  <v-progress-circular
                    v-else
                    indeterminate
                    size="18"
                    width="2"
                    color="#e57373"
                  />
                </template>

                <v-list-item-title class="menu-text">
                  {{ templateLoading ? "Downloading..." : "Download Template" }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <div v-if="Object.keys(groupedItems).length === 0" class="no-items">
          <v-icon size="100" color="grey" class="icon"
            >mdi-package-variant-remove</v-icon
          >
          <p class="icon text-grey">No Items Found</p>
        </div>

        <div
          v-for="(items, category) in groupedItems"
          :key="category"
          class="category-group"
        >
          <div class="category-header" @click="toggleCategory(category)">
            <v-icon size="18" class="category-toggle">
              {{
                openCategory[category]
                  ? "mdi-chevron-down-circle-outline"
                  : "mdi-chevron-right-circle-outline"
              }}
            </v-icon>

            <span class="category-title">
              {{ category }}
            </span>

            <v-chip
              size="small"
              class="category-count"
              color="primary"
              variant="tonal"
            >
              {{ items.length }} Items
            </v-chip>
          </div>

          <div v-if="openCategory[category]" class="items-grid">
            <div
              v-for="item in items"
              :key="item.product_id"
              class="inventory-item-card"
              @click="StockDialog(item)"
            >
              <v-avatar size="48">
                <v-img :src="item.image"></v-img>
              </v-avatar>

              <div class="item-info">
                <div class="item-title">
                  {{ item.product_name }}
                </div>

                <div class="item-meta">
                  <span v-if="getItemQty(item) === 0" class="out-stock">
                    Out of Stock
                  </span>

                  <span v-else-if="getItemQty(item) <= 5" class="low-stock">
                    {{ getItemQty(item) }} Stock Left
                  </span>

                  <span v-else class="stock"> In Stock </span>
                </div>
              </div>

              <div
                :class="[
                  'item-qty',
                  getItemQty(item) === 0
                    ? 'qty-out'
                    : getItemQty(item) <= 5
                    ? 'qty-low'
                    : 'qty-normal',
                ]"
              >
                {{ getItemQty(item) }}
              </div>

              <div class="item-actions">
                <v-icon size="18" @click.stop="UpdateDialog(item)" color="blue"
                  >mdi-pencil</v-icon
                >
                <v-icon
                  size="18"
                  @click.stop="DeleteDialog(item)"
                  color="red"
                  v-if="getItemQty(item) === 0"
                  >mdi-delete</v-icon
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
    <AddItem
      :ItemAdd="ItemAdd"
      @close="ItemAdd = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />
    <EditItems
      :ItemEdit="ItemEdit"
      @close="ItemEdit = false"
      :updatedata="updatedata"
      @successMsg="success_info"
      @errorMsg="error_info"
    />
    <DeleteItem
      :ItemDelete="ItemDelete"
      @close="ItemDelete = false"
      :deletedata="deletedata"
      @successMsg="success_info"
      @errorMsg="error_info"
    />

    <StockAdjustment
      :ItemStock="ItemStock"
      :selectedItem="selectedItem"
      @close="ItemStock = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />
  </div>
</template>
<script>
import { API, graphqlOperation } from "aws-amplify";
import { inventory_products_CRUD } from "@/graphql/mutations.js";
import { inventory_categories_CRUD } from "@/graphql/mutations.js";
import OverlayComp from "@/components/OverlayComp.vue";
import AddItem from "@/components/NewInventory/AddItem.vue";
import DeleteItem from "@/components/NewInventory/DeleteItem.vue";
import EditItems from "@/components/NewInventory/EditItems.vue";
import StockAdjustment from "@/components/NewInventory/StockAdjustment.vue";
import { get_location_details } from "@/mixins/GetLocations.js";
import BulkItemImport from "@/components/NewInventory/BulkItemImport.vue";
const FileSaver = require("file-saver");
import * as XLSX from "xlsx";

export default {
  mixins: [get_location_details],
  components: {
    OverlayComp,
    AddItem,
    DeleteItem,
    EditItems,
    StockAdjustment,
    BulkItemImport,
  },
  props: {
    searchvalue: String,
  },
  data() {
    return {
      canScrollLeft: false,
      canScrollRight: false,
      selectedLocation: { location_id: "ALL", location_name: "All Locations" },
      Listlocation: [],
      selectedCategory: null,
      loading: false,
      openCategory: {},
      itemData: [],
      CategoryItems: [],
      overlay: false,
      ItemAdd: false,
      ItemDelete: false,
      deletedata: {},
      updatedata: {},
      ItemEdit: false,
      selectedItem: {},
      ItemStock: false,
    };
  },
  watch: {
    "$store.state.refreshItems"(val) {
      if (val) {
        this.fetch_items();
        this.fetch_category();
        this.$store.commit("REFRESH_ITEMS", false);
      }
    },
  },

  computed: {
    locationOptions() {
      return [
        { location_id: "ALL", location_name: "All Locations" },
        ...(this.Listlocation || []),
      ];
    },
    groupedItems() {
      const groups = {};
      let items = this.itemData;

      // CATEGORY FILTER
      if (this.selectedCategory) {
        items = items.filter((i) => i.category_name === this.selectedCategory);
      }

      // SEARCH FILTER
      if (this.searchvalue) {
        const text = this.searchvalue.toLowerCase();

        items = items.filter(
          (i) =>
            i.product_name?.toLowerCase().includes(text) ||
            i.category_name?.toLowerCase().includes(text),
        );
      }

      // LOCATION FILTER
      if (
        this.selectedLocation &&
        this.selectedLocation.location_id !== "ALL"
      ) {
        const key = this.selectedLocation.location_id.replaceAll("-", "_");

        items = items.filter(
          (i) => i.location_quantities && i.location_quantities[key] > 0,
        );
      }

      items.forEach((item) => {
        if (!groups[item.category_name]) {
          groups[item.category_name] = [];
        }

        groups[item.category_name].push(item);
      });

      return groups;
    },
  },

  async mounted() {
    await this.get_location_details();

    this.Listlocation = [
      { location_id: "ALL", location_name: "All Locations" },
      ...this.locationList,
    ];
    await this.fetch_items();
    await this.fetch_category();
  },

  methods: {
    async download_item() {
      try {
        this.templateLoading = true;
        this.actionLoading = true; // 🔥 activate Actions loader

        const headers = [
          "Product Name",
          "SKU",
          "Pricing",
          "Category",
          "Units",
          "Description",
        ];

        let teamId =
          this.$store.getters.GetUserObj?.organization?.organization_team_id ||
          "";

        let fileName = teamId
          ? `${teamId}_Inventory Template.xlsx`
          : "Inventory Template.xlsx";

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, fileName);
      } finally {
        this.templateLoading = false;
        this.actionLoading = false; // ✅ stop Actions loader
      }
    },
    triggerImport() {
      const input =
        this.$refs.bulkImport?.$el.querySelector('input[type="file"]');
      if (input) input.click();
    },
    async refreshData() {
      await Promise.all([this.fetch_items(), this.fetch_category()]);
    },
    scrollCategories(direction) {
      const container = this.$refs.chipsScroll;
      const scrollAmount = 200;

      if (!container) return;

      if (direction === "right") {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }

      setTimeout(() => {
        this.checkScroll();
      }, 300);
    },

    checkScroll() {
      const container = this.$refs.chipsScroll;
      if (!container) return;

      const maxScroll = container.scrollWidth - container.clientWidth;

      this.canScrollLeft = container.scrollLeft > 0;
      this.canScrollRight = container.scrollLeft < maxScroll - 2;
    },
    getItemQty(item) {
      if (
        !this.selectedLocation ||
        this.selectedLocation.location_id === "ALL"
      ) {
        return item.total_quantity;
      }

      const key = this.selectedLocation.location_id.replaceAll("-", "_");

      return item.location_quantities?.[key] || 0;
    },
    toggleCategory(category) {
      this.openCategory[category] = !this.openCategory[category];
    },
    async fetch_items() {
      this.overlay = true;

      try {
        const response = await API.graphql(
          graphqlOperation(inventory_products_CRUD, {
            input: {
              action_type: "LIST",
            },
          }),
        );

        const res = JSON.parse(response.data.inventory_products_CRUD);
        if (res.Status === "SUCCESS") {
          this.itemData = res.data;
          res.data.forEach((item) => {
            if (!this.openCategory[item.category_name]) {
              this.openCategory[item.category_name] = true;
            }
          });
        }
      } catch (e) {
        console.log("error", e);
      } finally {
        this.overlay = false;
      }
    },

    async fetch_category() {
      this.loading = true;
      try {
        this.overlay = true;

        const response = await API.graphql(
          graphqlOperation(inventory_categories_CRUD, {
            input: {
              action_type: "LIST",
            },
          }),
        );
        const res = JSON.parse(response.data.inventory_categories_CRUD);
        if (res.Status === "SUCCESS") {
          this.CategoryItems = res.data;
          this.$nextTick(() => {
            this.checkScroll();
          });
        } else {
          console.error("not able to fetch the category list");
        }
        console.log("res", response);
      } catch (error) {
        console.log("error", error);
      } finally {
        this.overlay = false;
      }
    },
    success_info(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: msg,
        timeout: 4000,
        Top: true,
      };
      this.ItemAdd = false;
      this.fetch_items();
    },
    error_info(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        Snackbarcolor: "red",
        SnackbarText: msg,
        timeout: 4000,
        Top: true,
      };
    },
    StockDialog(item) {
      console.log("item", item);
      this.ItemStock = true;
      this.selectedItem = item;
    },
    AddDialog() {
      this.ItemAdd = true;
    },
    UpdateDialog(item) {
      this.ItemEdit = true;
      this.updatedata = item;
    },
    DeleteDialog(item) {
      this.ItemDelete = true;
      this.deletedata = item;
    },

    getItemQty(item) {
      if (
        !this.selectedLocation ||
        this.selectedLocation.location_id === "ALL"
      ) {
        return item.total_quantity;
      }

      const key = this.selectedLocation.location_id.replaceAll("-", "_");

      return item.location_quantities?.[key] || 0;
    },
    handleSuccess({ results, header }) {
      this.$router.push("/home/BulkUploadInventory");
      let customerData = {
        excelHeaders: header,
        excelTableData: results,
      };
      this.$store.commit("SetcustomerDetails", customerData);
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 5;
      return isLt1M;
    },
  },
};
</script>
<style>
.category-filter-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 5;

  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.category-filter-wrapper::-webkit-scrollbar {
  height: 6px;
}

.category-filter-wrapper::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.category-chip {
  flex: 0 0 auto;
}

.location-select {
  margin-left: auto;
  max-width: 220px;
}

.category-group {
  margin-top: 18px;
}

.category-chip {
  border-radius: 20px !important;
  padding: 5px 16px !important;
  font-size: 13px;
  font-weight: 500;
  background: #f3f4f6 !important;
  color: #374151 !important;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
}

.category-chip:hover {
  background: #ffe2eb !important;
  color: #dd4d78 !important;
}

.category-chip.active {
  background: #dd4d78 !important;
  color: white !important;
  box-shadow: 0 3px 6px rgba(221, 77, 120, 0.35);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 12px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f3f4f6;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  letter-spacing: 0.2px;
}

.category-count {
  font-size: 12px;
  font-weight: 500;
  border-radius: 14px;
  padding: 2px 10px;
}

.category-toggle {
  color: #6b7280;
}

.inventory-item-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #ffffff;
  border-radius: 14px;
  padding: 14px 18px;

  border: 1px solid #f1f1f1;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);

  transition: all 0.25s ease;
}

.inventory-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08), 0 10px 24px rgba(0, 0, 0, 0.1);
}

.inventory-item-card .v-avatar {
  background: #f8fafc;
  border-radius: 10px;
  padding: 6px;
}

.low-stock {
  color: #ef4444;
  font-weight: 500;
}

.out-stock {
  color: #b91c1c;
  font-weight: 600;
}

.qty-low {
  background: #fee2e2;
  color: #dc2626;
}

.qty-out {
  background: #fecaca;
  color: #991b1b;
}

.qty-normal {
  background: #dcfce7;
  color: #16a34a;
}

.item-icon {
  display: flex;
  align-items: center;
}

.item-info {
  flex: 1;
}

.item-container {
  height: calc(100vh - 170px);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.table-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  letter-spacing: 0.2px;
}

.item-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.stock {
  color: #16a34a;
  font-weight: 500;
}

.price {
  color: #9ca3af;
}

.item-qty {
  font-weight: 600;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 10px;
  min-width: 36px;
  text-align: center;
}

.item-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.item-actions .v-icon {
  color: #6b7280;
  transition: all 0.2s ease;
}

.item-actions .v-icon:hover {
  color: #111827;
  transform: scale(1.05);
}

.chip {
  margin-top: -6%;
  margin-left: 20%;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-top: 6px;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.no-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-weight: 500;
}

.icon {
  margin-left: 5%;
}

.location-filter {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
}

.location-title {
  font-size: 14px;
}

.location-select {
  margin-top: px;
}

.location-select .v-field {
  border-radius: 10px;
}

.chips-scroll {
  display: flex;
  gap: 10px;
  overflow: hidden;
  flex: 4;
}

.category-chip {
  flex: 0 0 auto;
}

.scroll-btn {
  min-width: 32px;
}

.chips-scroll::-webkit-scrollbar {
  display: none;
}

.no-border {
  border: none !important;
  box-shadow: none !important;
}

.v-list-item {
  border-bottom: none !important;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
}
</style>
