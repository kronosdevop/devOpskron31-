<template>
  <div class="categories-container">
    <v-card flat class="ma-4">
      <div class="d-flex align-center justify-space-between">
        <v-text-field
          v-model="searchCategory"
          variant="outlined"
          density="compact"
          label="Search Categories"
          class="mr-4 mt-2"
          style="max-width: 250px"
          prepend-inner-icon="mdi-magnify"
          clearable
        />

        <v-btn
          class="text-capitalize cardCss white--text mr-2"
          size="small"
          @click="addCategory"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Category
        </v-btn>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredCategories"
        :loading="tableLoading"
        :fixed-header="true"
        density="compact"
        item-key="category_id"
        class="modern-data-table"
        @click:row="onRowClick"
        :height="windowHeight"
        hover
      >
        <template #item.category_name="{ item }">
          {{ item.category_name }}
        </template>

        <template #item.item_count="{ item }">
          {{ item.item_count }}
        </template>
<template #item.category_created_by="{ item }">
    {{ item.category_created_by }}

</template>


        <template #item.actions="{ item }">
          <v-icon
            size="small"
            @click.stop="editCategory(item)"
            class="mr-4"
            color="green"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            v-if="item.item_count === 0"
            @click.stop="deleteCategory(item)"
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
              <v-list-item @click="editCategory(item)">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>

              <v-list-item v-if="item.item_count === 0" @click="deleteCategory(item)">
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu> -->
        </template>
      </v-data-table>
    </v-card>

    <CategoryProducts
      :productDialog="productDialog"
      :products="selectedCategory"
      :loading="tableLoading"
      @close="productDialog = false"
    />

    <CategoryDialog
      :dialog="categoryDialog"
      :editing-category="editingCategory"
      @clicked="categoryDialog = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />

    <DeleteCategoryDialog
      :deleteCategoryDialog="deleteCategoryDialog"
      :categoryItem="categoryToDelete"
      @clicked="deleteCategoryDialog = false"
      @successMsg="success_info"
      @errorMsg="error_info"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import CategoryDialog from "./CategoryDialog.vue";
import DeleteCategoryDialog from "./DeleteCategoryDialog.vue";
import CategoryProducts from "./CategoriesProduct.vue";
import SnackBar from "@/components/SnackBar.vue";
import { get_global_categories } from "@/mixins/GetGlobalCategories.js";
import { get_category_items } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  name: "Categories",

  components: {
    CategoryDialog,
    DeleteCategoryDialog,
    CategoryProducts,
    SnackBar,
  },

  mixins: [get_global_categories],

  data() {
    return {
      masterGlobalCategories: [],
      selectedCategory: [],
      searchCategory: "",
      categoryDialog: false,
      editingCategory: null,
      deleteCategoryDialog: false,
      categoryToDelete: null,
      productDialog: false,
      tableLoading: false,
      SnackBarComponent: {},
      windowHeight: 0,

      headers: [
        {
          title: "Category Name",
          value: "category_name",
          align: "start",
          sortable: true,
        },

        {
          title: "#Items",
          value: "item_count",
          align: "center",
          sortable: true,
        },
        {
          title: "Created By",
          value: "category_created_by",
          align: "center",
          sortable: true,
        },
        { title: "", value: "actions", align: "end", sortable: false },
      ],
    };
  },

  computed: {
    filteredCategories() {
      if (!this.searchCategory) return this.masterGlobalCategories;
      return this.masterGlobalCategories.filter((category) =>
        category.category_name
          .toLowerCase()
          .includes(this.searchCategory.toLowerCase()),
      );
    },
  },

  async mounted() {
    this.windowHeight = window.innerHeight - 280;

    this.tableLoading = true;
    try {
      await this.get_global_categories();
    } finally {
      this.tableLoading = false;
    }
  },

  methods: {
    onRowClick(event, { item }) {
      console.log("Clicked row:", item);
      this.selectCategory(item);
    },
    async selectCategory(category) {
      try {
        const response = await API.graphql(
          graphqlOperation(get_category_items, {
            input: { category_id: category.category_id },
          }),
        );

        const res = JSON.parse(response.data.get_category_items);
        this.selectedCategory = res.Status === "SUCCESS" ? res.data : [];

        this.productDialog = true;
      } catch (error) {
        this.error_info("Failed to load category products");
      } finally {
      }
    },
    addCategory() {
      this.editingCategory = null;
      this.categoryDialog = true;
    },

    editCategory(category) {
      this.editingCategory = category;
      this.categoryDialog = true;
    },

    deleteCategory(category) {
      this.categoryToDelete = category;
      console.log("categoryToDelete", this.categoryToDelete);
      this.deleteCategoryDialog = true;
    },

    success_info(msg) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: msg,
        timeout: 4000,
        Top: true,
      };
      this.categoryDialog = false;
      this.deleteCategoryDialog = false;
      this.get_global_categories();
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

.action-btn {
  background: #db4c77 !important;
  color: white !important;
}
</style>
