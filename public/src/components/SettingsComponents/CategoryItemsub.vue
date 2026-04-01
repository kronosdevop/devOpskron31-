<template>
  <div>
    <!-- Component Content -->
    <v-card flat class="rounded-lg" >
      <v-toolbar
        flat
        class="px-6 pt-6 pb-2 bg-white"
        
      >
        <v-btn-toggle
          v-model="toggle_exclusive"
          color="primary"
          mandatory
          class="mr-4"
          density="compact"
        >
          <v-btn size="small" value="itemsMasters" class="text-capitalize">
            <v-icon size="16" class="mr-2">mdi-package-variant</v-icon>
            Products
          </v-btn>
          <v-btn size="small" value="masterCategory" class="text-capitalize">
            <v-icon size="16" class="mr-2">mdi-folder-multiple</v-icon>
            Category
          </v-btn>
        </v-btn-toggle>

        <v-spacer />

        <v-btn
          v-if="toggle_exclusive == 'itemsMasters'"
          @click="add_items()"
          dark
          size="small"
          class="text-capitalize cardCss"
          prepend-icon="mdi-plus"
          flat
        >
          Create Product
        </v-btn>
        <v-btn
          v-if="toggle_exclusive == 'masterCategory'"
          @click="add_categories()"
          dark
          size="small"
          class="text-capitalize cardCss"
          prepend-icon="mdi-plus"
          flat
        >
          Add Categories
        </v-btn>

        <!-- Back Button -->
        <v-btn 
          text
          @click="goBack"
          class="back-link ml-4"
          color="primary"
          size="small"
        >
          <v-icon left>mdi-arrow-left</v-icon>
          Back 
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-4">
        <div v-if="toggle_exclusive == 'masterCategory'">
          <MasterCategory :key="categoryKey" />
        </div>
        <div v-if="toggle_exclusive == 'itemsMasters'">
          <MasterItems :key="itemKey" />
        </div>
      </v-card-text>
    </v-card>

    <div v-if="componentCheck == 1">
      <AddCategory
        :categoriesAddition="categoriesAddition"
        @clicked="categoriesAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:updaterefesh="updatecategory"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddItems
        :ItemsAddition="ItemsAddition"
        @clicked="ItemsAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:updaterefesh="updateItems"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
  
<script>
import AddItems from "@/components/SettingsDialogs/AddItems.vue";
import AddCategory from "@/components/SettingsDialogs/AddCategory.vue";
import MasterCategory from "@/components/SettingsComponents/MasterCategory.vue";
import MasterItems from "@/components/SettingsComponents/MasterItems.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    MasterItems,
    MasterCategory,
    AddCategory,
    AddItems,
    SnackBar,
  },
  data() {
    return {
      toggle_exclusive: "itemsMasters",
      componentCheck: 0,
      categoryKey: 0,
      itemKey: 0,
      categoriesAddition: false,
      ItemsAddition: false,
      SnackBarComponent: {},
    };
  },
  created() {},
  methods: {
    add_categories() {
      this.componentCheck = 1;
      this.categoriesAddition = true;
    },
    add_items() {
      this.componentCheck = 2;
      this.ItemsAddition = true;
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

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.ItemsAddition = false;
      this.categoriesAddition = false;
    },
    updatecategory() {
      this.categoryKey++;
    },
    updateItems() {
      this.itemKey++;
    },
    goBack() {
      this.$emit('backAction');
    }
  },
};
</script>
  
<style scoped>
.rounded-lg {
  border-radius: 12px !important;
}

.v-btn-toggle :deep(.v-btn) {
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.v-btn-toggle :deep(.v-btn--selected) {
  background-color: var(--v-primary-base) !important;
  color: white !important;
}

.v-btn-toggle :deep(.v-btn--selected .v-icon) {
  color: white !important;
}
</style>