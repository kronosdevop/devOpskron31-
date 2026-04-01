<template>
  <div class="units-container">
    <v-row>
             <!-- Left Panel: Units List -->
       <v-col cols="12" md="4">
        <v-card flat class="pa-4 overflow-y-auto">
          <!-- Header with Search and Add Units Button -->
          <div class="d-flex align-center justify-space-between mb-4">
            <v-text-field
              v-model="searchUnit"
              placeholder="Search units..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="unit-search"
              clearable
            />

            <v-btn size="small" class="action-btn ml-2" @click="addUnit">
              <v-icon left>mdi-plus</v-icon>
              Add Units
            </v-btn>
          </div>

          <!-- Search Field for Units -->

          <!-- Units Table -->
          <v-card flat class=" overflow-y-auto" :height="windowHeight">
            <v-table class="units-table">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">FULLNAME</th>
                  <th class="text-left font-weight-bold">SHORTNAME</th>
                  <th class="text-right"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredUnits.length === 0">
                  <td colspan="3" class="text-center pa-8">
                    <div class="d-flex flex-column align-center">
                      <v-icon size="48" color="grey" class="mb-2"
                        >mdi-package-variant</v-icon
                      >
                      <span class="text-h6 text-grey">No units found</span>
                      <span class="text-body-2 text-grey"
                        >Try adjusting your search criteria</span
                      >
                    </div>
                  </td>
                </tr>
                <tr
                  v-for="unit in filteredUnits"
                  :key="unit.unit_id"
                  :class="{ 'selected-unit': selectedUnit?.unit_id === unit.unit_id }"
                  @click="selectUnit(unit)"
                  class="unit-row"
                >
                  <td>{{ unit.unit_name }}</td>
                  <td>{{ unit.short_name }}</td>
                  <td class="text-right">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          variant="text"
                          size="small"
                          v-bind="props"
                          @click.stop
                        ></v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="editUnit(unit)">
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteUnit(unit)">
                          <v-list-item-title>Delete</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-card>
      </v-col>
             <!-- Right Panel: Unit Details and Items -->
       <v-col cols="12" md="8">
                          <div v-if="selectedUnit && selectedUnitItems && selectedUnitItems.length > 0">
           <!-- Unit Items Overview -->
           <v-card class="mb-4">
             <v-card-text class="pa-4">
               <div class="d-flex align-center justify-space-between mb-4">
                 <h3 class="text-h6 font-weight-medium">UNIT ITEMS</h3>
                 <v-chip color="primary" variant="tonal">
                   {{ selectedUnitItems.length }} Items
                 </v-chip>
               </div>
             </v-card-text>
           </v-card>

          <!-- Items Table -->
          <v-card>
            <v-card-text class="pa-4">
              <v-data-table
                :headers="itemHeaders"
                :items="selectedUnitItems"
                :loading="tableLoading"
                :sort-by="['item_name']"
                :items-per-page="10"
                hide-default-footer
                :height="itemTableHeight"
                class="modern-data-table"
                density="comfortable"
                hover
                :fixed-header="true"
              >
                <template v-slot:no-data>
                  <div class="text-center py-8">
                    <v-icon size="48" color="grey" class="mb-2">mdi-package-variant</v-icon>
                    <div class="text-h6 text-grey">No items in this unit</div>
                    <div class="text-body-2 text-grey">This unit doesn't have any items yet.</div>
                  </div>
                </template>

                <template v-slot:loading>
                  <div class="text-center py-8">
                    <v-progress-circular indeterminate color="primary" size="32" class="mb-4"></v-progress-circular>
                    <div class="text-body-2 text-grey">Loading items...</div>
                  </div>
                </template>

                <!-- Item Name -->
                <template v-slot:[`item.item_name`]="{ item }">
                  <div class="d-flex align-center">
                    <!-- <v-avatar size="32" class="mr-3">
                      <v-img 
                        :src="item.item_image" 
                        :alt="item.item_name"
                      >
                        <template v-slot:placeholder>
                          <v-icon size="20" color="grey">mdi-package-variant</v-icon>
                        </template>
                        <template v-slot:error>
                          <v-icon size="20" color="grey">mdi-package-variant</v-icon>
                        </template>
                      </v-img>
                    </v-avatar> -->
                    <div>
                      <div class="font-weight-medium">{{ item.item_name }}</div>
                      <div class="text-caption text-grey">{{ item.item_code }}</div>
                    </div>
                  </div>
                </template>

                <!-- Stock Quantity -->
                <template v-slot:[`item.stock_quantity`]="{ item }">
                  <div class="d-flex align-center">
                    <v-chip
                      :color="getStockColor(item.stock_quantity)"
                      size="small"
                      variant="tonal"
                      class="text-none"
                    >
                      {{ item.stock_quantity || 0 }}
                    </v-chip>
                  </div>
                </template>

                <!-- Sale Price -->
                <template v-slot:[`item.sale_price`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="green" class="mr-2">mdi-currency-inr</v-icon>
                    <span class="font-weight-medium">{{ item.sale_price?.sale_price || 0 }}</span>
                  </div>
                </template>

                <!-- Purchase Price -->
                <template v-slot:[`item.purchase_price`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="blue" class="mr-2">mdi-currency-inr</v-icon>
                    <span class="font-weight-medium">{{ item.purchase_price?.purchase_price || 0 }}</span>
                  </div>
                </template>

                <!-- Stock Value -->
                <template v-slot:[`item.stock_value`]="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="16" color="purple" class="mr-2">mdi-currency-inr</v-icon>
                    <span class="font-weight-medium">{{ item.stock_value || 0 }}</span>
                  </div>
                </template>

                <!-- Status -->
                <template v-slot:[`item.item_status`]="{ item }">
                  <v-chip
                    :color="getStatusColor(item.item_status)"
                    size="small"
                    variant="tonal"
                    class="text-none"
                  >
                    {{ item.item_status }}
                  </v-chip>
                </template>

                <!-- Actions -->
                <template v-slot:[`item.actions`]="{ item }">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="mdi-dots-vertical"
                        variant="text"
                        size="small"
                        v-bind="props"
                        @click.stop
                      ></v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="viewItem(item)">
                        <v-list-item-title>View Details</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="editItem(item)">
                        <v-list-item-title>Edit</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
              </v-data-table>

              <!-- Table Footer with Pagination -->
              <div class="table-footer">
                <div class="footer-info">
                  {{
                    selectedUnitItems && selectedUnitItems.length > 0
                      ? `Showing ${selectedUnitItems.length} of ${selectedUnitItems.length} items`
                      : "No items in this unit"
                  }}
                </div>
                <div class="pagination-controls">
                  <v-btn
                    :disabled="itemCurrentPage === 1"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="itemCurrentPage = itemCurrentPage - 1"
                    style="color: #666 !important"
                  >
                    Previous
                  </v-btn>
                  <div class="page-numbers">
                    <v-btn
                      v-for="page in visibleItemPages"
                      :key="page"
                      :variant="
                        page === itemCurrentPage ? 'elevated' : 'text'
                      "
                      size="small"
                      :class="
                        page === itemCurrentPage
                          ? 'active-page'
                          : 'inactive-page'
                      "
                      @click="itemCurrentPage = page"
                      :style="
                        page === itemCurrentPage
                          ? 'background: #DB4C77 !important; color: white !important;'
                          : 'color: #666 !important;'
                      "
                    >
                      {{ page }}
                    </v-btn>
                  </div>
                  <v-btn
                    :disabled="itemCurrentPage === itemPageCount"
                    variant="text"
                    size="small"
                    class="pagination-btn"
                    @click="itemCurrentPage = itemCurrentPage + 1"
                    style="color: #666 !important"
                  >
                    Next
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- No Unit Selected -->
        <div v-else class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
          <div class="text-h6 text-grey mb-2">No Unit Selected</div>
          <div class="text-body-2 text-grey">
            Select a unit from the list to view its items.
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Unit Dialog Component -->
    <UnitDialog
      :dialog="unitDialog"
      :editing-unit="editingUnit"
      @update:dialog="unitDialog = $event"
      @clicked="unitDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <!-- Delete Unit Dialog Component -->
    <DeleteUnitDialog
      :deleteUnitDialog="deleteUnitDialog"
      :unitItem="unitToDelete"
        @clicked="deleteUnitDialog = false"
      v-on:errorMsg="error_info"
      v-on:successMsg="success_info"
    />

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
import { get_units_items } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import UnitDialog from "./UnitDialog.vue";
import DeleteUnitDialog from "./DeleteUnitDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  name: "Units",
  components: {
    UnitDialog,
    DeleteUnitDialog,
    SnackBar,
  },
  mixins: [get_material_unit],
  data() {
    return {
      unitmaterials: [],
      selectedUnit: null,
      searchUnit: "",
      unitDialog: false,
      editingUnit: null,
      deleteUnitDialog: false,
      unitToDelete: null,
      saving: false,
      windowHeight: 0,
      tableLoading: false,
      SnackBarComponent: {},
             // Item table properties
       selectedUnitItems: null,
      itemHeaders: [
        { title: "ITEM", value: "item_name", sortable: true },
        { title: "STOCK", value: "stock_quantity", sortable: true },
        { title: "SALE PRICE", value: "sale_price", sortable: true },
        { title: "PURCHASE PRICE", value: "purchase_price", sortable: true },
        { title: "STOCK VALUE", value: "stock_value", sortable: true },
        { title: "STATUS", value: "item_status", sortable: true },
        // { title: "ACTIONS", value: "actions", sortable: false },
      ],
      itemTableHeight: 0,
      // Pagination properties
      itemCurrentPage: 1,
      itemItemsPerPage: 10,
    };
  },
  computed: {
    filteredUnits() {
      if (!this.searchUnit) return this.unitmaterials;
      return this.unitmaterials.filter(
        (unit) =>
          unit.unit_name
            .toLowerCase()
            .includes(this.searchUnit.toLowerCase()) ||
          unit.short_name.toLowerCase().includes(this.searchUnit.toLowerCase())
      );
    },
    // Pagination computed properties
    itemPageCount() {
      return Math.ceil((this.selectedUnitItems?.length || 0) / this.itemItemsPerPage);
    },
    visibleItemPages() {
      const pages = [];
      const start = Math.max(1, this.itemCurrentPage - 2);
      const end = Math.min(
        this.itemPageCount,
        this.itemCurrentPage + 2
      );
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  async mounted() {
    this.windowHeight = window.innerHeight - 290;
    this.itemTableHeight = window.innerHeight - 360;
    await this.get_material_unit(); // Updated to modern structure
    // console.log(this.unitmaterials, "unitmaterials");
    // Select first unit by default
    if (this.unitmaterials.length > 0) {
      this.selectUnit(this.unitmaterials[0]);
    }
  },
  methods: {
    async selectUnit(unit) {
      this.selectedUnit = unit;
      await this.loadUnitItems();
    },

         async loadUnitItems() {
       if (this.selectedUnit) {
         try {
           const result = await API.graphql(
             graphqlOperation(get_units_items, {
               input: {
                 unit_id: this.selectedUnit.unit_id,
               },
             })
           );
           const resultData = JSON.parse(result.data.get_units_items);
           // console.log(resultData, "unit items response");
           if (resultData.Status === "SUCCESS") {
             this.selectedUnitItems = resultData.data || [];
           } else {
             this.selectedUnitItems = [];
           }
         } catch (error) {
           console.log(error);
           this.selectedUnitItems = [];
         }
       } else {
         this.selectedUnitItems = [];
       }
     },

    addUnit() {
      this.editingUnit = null;
      this.unitDialog = true;
    },

    editUnit(unit) {
      this.editingUnit = unit;
      // console.log(this.editingUnit, "editingUnit");
      this.unitDialog = true;
    },
         success_info(val) {
       this.SnackBarComponent = {
         SnackbarVmodel: true,
         SnackbarColor: "green",
         SnackbarText: val,
         timeout: 5000,
         Top: true,
       };
       this.unitmaterials = [];
       this.selectedUnitItems = [];
       this.selectedUnit = null;
       this.unitDialog = false;
       this.deleteUnitDialog = false;
       this.get_material_unit();
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

    deleteUnit(unit) {
      this.unitToDelete = unit;
      this.deleteUnitDialog = true;
    },

    confirmDeleteUnit(unit) {
      const index = this.unitmaterials.findIndex((u) => u.id === unit.id);
      if (index !== -1) {
        this.unitmaterials.splice(index, 1);
        if (this.selectedUnit?.id === unit.id) {
          this.selectedUnit = null;
        }
        this.success_info("Unit deleted successfully");
      }
    },

    // Item table helper methods
    getStockColor(quantity) {
      const qty = parseFloat(quantity) || 0;
      if (qty <= 0) return "red";
      if (qty < 10) return "orange";
      return "green";
    },

    getStatusColor(status) {
      switch (status?.toLowerCase()) {
        case "active":
          return "green";
        case "deactive":
          return "red";
        case "pending":
          return "orange";
        default:
          return "grey";
      }
    },

    viewItem(item) {
      console.log("View item:", item);
      // You can implement item detail view here
    },

    editItem(item) {
      console.log("Edit item:", item);
      // You can implement item edit here
    },
  },
};
</script>

<style scoped>
.units-container {
  background-color: white;
}

.units-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.unit-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.unit-row:hover {
  background-color: #f5f5f5;
}

.selected-unit {
  background-color: #e3f2fd !important;
}
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

.unit-search {
  max-width: 300px;
}

/* Item table styles */
.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.modern-data-table .v-data-table__wrapper {
  border-radius: 8px;
}

.modern-data-table .v-data-table-header {
  background-color: #f8f9fa;
}

.modern-data-table .v-data-table-header th {
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.modern-data-table .v-data-table__tr:hover {
  background-color: #f8f9fa;
}

.modern-data-table .v-data-table__td {
  padding: 12px 16px;
  border-bottom: 1px solid #e9ecef;
}

/* Table Footer Styles */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.footer-info {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-weight: 500;
  text-transform: none;
  min-width: 80px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  font-weight: 600;
  border-radius: 6px;
}

.inactive-page {
  font-weight: 500;
  border-radius: 6px;
  min-width: 32px;
}
</style>
