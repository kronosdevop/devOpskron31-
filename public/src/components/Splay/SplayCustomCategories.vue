<template>
  <v-card-text>
    <!--Dialog Imports-->
    <CreateCategoryDialog
      :DialogCreateCategory="DialogCreateCategory"
      @clicked="DialogCreateCategoryEmit"
    />
    <DeleteCategory
      :DialogDeleteCategory="DialogDeleteCategory"
      :StoreObj="StoreObj"
      @clicked="DialogDeleteCategoryEmit"
    />
    <ScheduleCustomGameDialog
      :DialogScheduleCustomGame="DialogScheduleCustomGame"
      :StoreObj="StoreObj"
      @clicked="DialogScheduleCustomGameEmit"
    />
    <CustomQuestions
      v-if="current_view === 'Custom_Questions'"
      :StoreObj="StoreObj"
      @clicked="QuestionPageEmit"
    />

    <div v-else class="mt-n15">
      <!--Create Category-->
      <v-card-actions class="d-flex justify-end">
        <v-tooltip text="Create Category">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="flat"
              rounded="lg"
              size="small"
              color="primary"
              class="text-start"
              @click="DialogCreateCategory = true"
            >
              Create
            </v-btn>
          </template>
        </v-tooltip>
      </v-card-actions>

      <!--Data Table-->
      <v-data-table
        :height="windowHeight"
        :headers="TableHeaders"
        :items="ListAllCustomCategories"
        :loading="loading"
        @click:row="OpenQuestionsPage"
        class="modern-data-table"
        hide-default-footer
      >
        <!--Action Buttons-->
        <template #[`item.action`]="{ item }">
          <!--Schedule Game-->
          <v-tooltip text="Schedule Game">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                rounded="lg"
                size="20"
                color="transparent"
                elevation="0"
                icon
                @click.stop="OpenDialogScheduleCustomGame(item)"
              >
                <v-icon color="orange">mdi-clock-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <!--Delete-->
          <v-tooltip text="Delete">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                rounded="lg"
                size="small"
                color="transparent"
                class="mr-2"
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
import { GetAllCustomCategories } from "@/mixins/GetAllCustomCategories";

import CustomQuestions from "./CustomQuestions.vue";
import CreateCategoryDialog from "./CreateCategoryDialog.vue";
import DeleteCategory from "./DeleteCategory.vue";
import ScheduleCustomGameDialog from "./ScheduleCustomGameDialog.vue";

export default {
  mixins: [GetAllCustomCategories],

  components: {
    CustomQuestions,
    CreateCategoryDialog,
    DeleteCategory,
    ScheduleCustomGameDialog,
  },

  data: () => ({
    current_view: "Custom_Categories",

    windowHeight: 0,

    DialogCreateCategory: false,
    DialogDeleteCategory: false,
    DialogScheduleCustomGame: false,

    StoreObj: {},

    ListAllCustomCategories: [],
    TableHeaders: [
      { title: "Category Name", value: "splay_category_name", width: "45%" },
      { title: "Questions", value: "question_count", width: "45%" },
      { title: "Action", value: "action" },
    ],
  }),

  async mounted() {
    this.windowHeight = window.innerHeight - 230;
    await this.GetAllCustomCategoriesMethod();
  },

  computed: {
    totalItems() {
      return this.ListAllCustomCategories.length;
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.ListAllCustomCategories.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.ListAllCustomCategories.length / this.itemsPerPage);
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
    },
    QuestionPageEmit() {
      this.current_view = "Custom_Categories";
    },
    DialogCreateCategoryEmit(Toggle) {
      this.DialogCreateCategory = false;
      if (Toggle === 2) {
        this.GetAllCustomCategoriesMethod();
      }
    },
    OpenDialogDeleteCategory(item) {
      this.StoreObj = item;
      this.DialogDeleteCategory = true;
    },
    DialogDeleteCategoryEmit(Toggle) {
      this.DialogDeleteCategory = false;
      if (Toggle === 2) {
        this.GetAllCustomCategoriesMethod();
      }
    },
    OpenDialogScheduleCustomGame(item) {
      this.StoreObj = item;
      this.DialogScheduleCustomGame = true;
    },
    DialogScheduleCustomGameEmit() {
      this.DialogScheduleCustomGame = false;
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
