<template>
  <v-card-text>
    <!--Dialog Imports-->
    <DeleteCategory
      :DialogDeleteCategory="DialogDeleteCategory"
      :StoreObj="StoreObj"
      @clicked="DialogDeleteCategoryEmit"
    />
    <EditSplayCategoryDialog
      :DialogEditSplayCategory="DialogEditSplayCategory"
      :StoreObj="StoreObj"
      @clicked="DialogEditSplayCategoryEmit"
    />
    <CustomQuestions
      v-if="current_view === 'Custom_Questions'"
      ref="questionsComponent"
      :StoreObj="StoreObj"
      @clicked="QuestionPageEmit"
    />

    <div v-else class="mt-n2">
      <!--Data Table-->
      <v-data-table
        :height="windowHeight"
        :headers="TableHeaders"
        :items="paginatedItems"
        :loading="loading"
        :items-per-page="itemsPerPage"
        @click:row="OpenQuestionsPage"
        class="modern-data-table"
        hide-default-footer
      >
        <!--No data-->
        <template #no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4"
              >mdi-controller</v-icon
            >
            <div class="text-h6 text-grey mb-2">
              No custom categories at the moment!
            </div>
            <div class="text-body-2 text-grey">Create one to start</div>
          </div>
        </template>

        <!--Category-->
        <template #[`item.splay_category_name`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar>
              <v-img :src="item.splay_category_image" cover />
            </v-avatar>
            <div class="ml-2">{{ item.splay_category_name }}</div>
          </div>
        </template>

        <!--Action Buttons-->
        <template #[`item.action`]="{ item }">
          <!--Edit-->
          <v-tooltip text="Edit">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                color="transparent"
                elevation="0"
                icon
                @click.stop="OpenDialogEditSplayCategory(item)"
              >
                <v-icon color="green">mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <!--Delete-->
          <v-tooltip text="Delete">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                color="transparent"
                elevation="0"
                icon
                @click.stop="OpenDialogDeleteCategory(item)"
              >
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>

      <!--Pagination-->
      <div class="table-footer">
        <div class="footer-info">
          {{
            totalItems === 0
              ? "No Results"
              : `Showing ${paginatedItems.length} of ${totalItems} custom categories`
          }}
        </div>
        <div class="pagination-controls">
          <v-btn
            :disabled="currentPage === 1"
            variant="text"
            size="small"
            class="pagination-btn"
            @click="currentPage = currentPage - 1"
            style="color: #666 !important"
          >
            Previous
          </v-btn>
          <div class="page-numbers">
            <v-btn
              v-for="page in visiblePages"
              :key="page"
              :variant="page === currentPage ? 'elevated' : 'text'"
              size="small"
              :class="page === currentPage ? 'active-page' : 'inactive-page'"
              @click="currentPage = page"
              :style="
                page === currentPage
                  ? 'background: #DB4C77 !important; color: white !important;'
                  : 'color: #666 !important;'
              "
            >
              {{ page }}
            </v-btn>
          </div>
          <v-btn
            :disabled="currentPage === pageCount"
            variant="text"
            size="small"
            class="pagination-btn"
            @click="currentPage = currentPage + 1"
            style="color: #666 !important"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div>
  </v-card-text>
</template>

<script>
import { GetAllCategories } from "@/mixins/GetAllCategories";

import CustomQuestions from "./CustomQuestions.vue";
import EditSplayCategoryDialog from "./EditSplayCategoryDialog.vue";
import DeleteCategory from "./DeleteCategory.vue";

export default {
  emits: ["question-view", "category-view"],

  mixins: [GetAllCategories],

  components: {
    CustomQuestions,
    EditSplayCategoryDialog,
    DeleteCategory,
  },

  data: () => ({
    current_view: "Custom_Categories",

    windowHeight: 0,
    currentPage: 1,
    itemsPerPage: 15,

    DialogDeleteCategory: false,
    DialogEditSplayCategory: false,

    StoreObj: {},
    signedImages: {},

    TableHeaders: [
      { title: "Category Name", value: "splay_category_name", width: "45%" },
      { title: "Questions", value: "question_count", width: "45%" },
      { title: "Action", value: "action" },
    ],
  }),

  async mounted() {
    this.windowHeight = window.innerHeight - 230;
    await this.GetAllCategoriesMethod();
  },

  computed: {
    totalItems() {
      return this.ListCustomCategories.length;
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.ListCustomCategories.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.ListCustomCategories.length / this.itemsPerPage);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },

  methods: {
    OpenQuestionsPage(event, rowItem) {
      this.StoreObj = rowItem.item;
      this.current_view = "Custom_Questions";
      this.$emit("question-view", rowItem.item);
    },
    QuestionPageEmit() {
      this.current_view = "Custom_Categories";
      this.$emit("category-view");
    },
    OpenDialogDeleteCategory(item) {
      this.StoreObj = item;
      this.DialogDeleteCategory = true;
    },
    DialogDeleteCategoryEmit(Toggle) {
      this.DialogDeleteCategory = false;
      if (Toggle === 2) {
        this.GetAllCategoriesMethod();
      }
    },
    OpenDialogEditSplayCategory(item) {
      this.StoreObj = item;
      this.DialogEditSplayCategory = true;
    },
    DialogEditSplayCategoryEmit(Toggle) {
      this.DialogEditSplayCategory = false;
      if (Toggle === 2) {
        this.GetAllCategoriesMethod();
      }
    },
    openCreateQuestion() {
      if (this.current_view === "Custom_Questions") {
        this.$refs.questionsComponent?.openCreateQuestion();
      }
    },
    goBackToCategories() {
      this.current_view = "Custom_Categories";
      this.$emit("category-view");
    },
    refreshQuestions() {
      if (this.current_view === "Custom_Questions") {
        this.$refs.questionsComponent?.ListQuestionsMethod();
      }
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
.modern-data-table >>> tbody tr:hover {
  background-color: #f5f5f5 !important;
  transform: translateY(-3px);
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}
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
  font-size: 14px;
  color: #666;
  font-weight: 400;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pagination-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-width: 80px !important;
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.active-page {
  background: #db4c77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
}
.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
}
</style>
