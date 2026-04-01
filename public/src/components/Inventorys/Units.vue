<template>
  <div class="units-container">
    <v-card flat class="pa-4 w-100">
      <!-- Search + Add -->
      <div class="d-flex align-center justify-space-between">
        <v-text-field
          v-model="searchUnit"
          variant="outlined"
          density="compact"
          label="Search Unit"
          class="mr-4 mt-2"
          style="max-width: 250px"
          prepend-inner-icon="mdi-magnify"
          clearable
        />

        <v-btn
          class="text-capitalize cardCss white--text mr-2"
          size="small"
          @click="addUnit"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Unit
        </v-btn>
      </div>

      <!-- Units Table -->
      <v-data-table
        :headers="unitHeaders"
        :items="filteredUnits"
        :loading="tableLoading"
        item-key="unit_id"
        :fixed-header="true"
        density="compact"
        class="modern-data-table"
        @click:row="onRowClick"
        :height="windowHeight"
        hover
      >
        <!-- FULL NAME -->
        <template #item.unit_name="{ item }">
          <div class="unit-row">
            {{ item.unit_name }}
          </div>
        </template>

        <!-- SHORT NAME -->
         <template #item.short_name="{ item }">
          <div class="unit-row">
            {{ item.unit_created_by }}
          </div>
        </template>

        <!-- ACTIONS -->
        <template #item.actions="{ item }">
          <v-icon
            size="small"
            @click.stop="editUnit(item)"
            class="mr-4"
            color="green"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            @click.stop="deleteUnit(item)"
            class="mr-4"
            color="red"
          >
            mdi-delete
          </v-icon>
          <!-- <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                v-bind="props"
                @click.stop
              />
            </template>

            <v-list>
              <v-list-item @click="editUnit(item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="deleteUnit(item)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu> -->
        </template>
      </v-data-table>
    </v-card>

    <!-- ADD / EDIT UNIT -->
    <UnitDialog
      :dialog="unitDialog"
      :editing-unit="editingUnit"
      @clicked="unitDialog = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />

    <!-- DELETE UNIT -->
    <DeleteUnitDialog
      :deleteUnitDialog="deleteUnitDialog"
      :unitItem="unitToDelete"
      @clicked="deleteUnitDialog = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />

    <!-- UNIT ITEMS DIALOG -->
    <UnitItems
      :ItemDialog="ItemDialog"
      :items="selectedUnitItems"
      :loading="tableLoading"
      @close="ItemDialog = false"
    />

    <!-- SNACKBAR -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
import { get_units_items } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

import UnitDialog from "./UnitDialog.vue";
import DeleteUnitDialog from "./DeleteUnitDialog.vue";
import UnitItems from "./UnitItems.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  name: "Units",

  components: {
    UnitDialog,
    DeleteUnitDialog,
    UnitItems,
    SnackBar,
  },

  mixins: [get_material_unit],

  data() {
    return {
      unitmaterials: [],
      searchUnit: "",
      windowHeight: 0,

      unitDialog: false,
      deleteUnitDialog: false,
      ItemDialog: false,

      editingUnit: null,
      unitToDelete: null,
      selectedUnitItems: [],

      tableLoading: false,

      SnackBarComponent: {},

      unitHeaders: [
        { title: "Full Name", value: "unit_name", align: "start", sortable: true },
        { title: "Created By", value: "unit_created_by", align: "center" , sortable: true},
        { title: "", value: "actions", align: "end", sortable: false },
      ],
    };
  },

  computed: {
    filteredUnits() {
      if (!this.searchUnit) return this.unitmaterials;
      return this.unitmaterials.filter(
        (u) =>
          u.unit_name.toLowerCase().includes(this.searchUnit.toLowerCase()) ||
          u.short_name.toLowerCase().includes(this.searchUnit.toLowerCase())
      );
    },
  },

  async mounted() {
    this.tableLoading = true;
    this.windowHeight = window.innerHeight - 280;
    await this.get_material_unit();
    this.tableLoading = false;
  },

  methods: {
    onRowClick(event, row) {
      const unit = row.item;
      console.log("Clicked row:", unit);
      this.openUnitItems(unit);
    },
    async openUnitItems(unit) {
      this.ItemDialog = true;
      this.tableLoading = true;
      this.selectedUnitItems = [];

      try {
        const result = await API.graphql(
          graphqlOperation(get_units_items, {
            input: { unit_id: unit.unit_id },
          })
        );

        const res = JSON.parse(result.data.get_units_items);
        this.selectedUnitItems = res.Status === "SUCCESS" ? res.data : [];
      } catch (err) {
        this.error_info("Failed to load unit items");
      } finally {
        this.tableLoading = false;
      }
    },

    addUnit() {
      this.editingUnit = null;
      this.unitDialog = true;
    },

    editUnit(unit) {
      this.editingUnit = unit;
      this.unitDialog = true;
    },

    deleteUnit(unit) {
      this.unitToDelete = unit;
      this.deleteUnitDialog = true;
    },

    success_info(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: msg,
        timeout: 4000,
        Top: true,
      };
      this.get_material_unit();
      this.unitDialog = false;
      this.deleteUnitDialog = false;
    },

    error_info(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: msg,
        timeout: 4000,
        Top: true,
      };
    },
  },
};
</script>

<style scoped>
/* DATA TABLE */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

/* BUTTON */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border-radius: 8px;
}
</style>
