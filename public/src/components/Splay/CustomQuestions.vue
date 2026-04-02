<template>
  <v-card-text class="pa-0">
    <!--Component Imports-->
    <EditQuestion
      :DialogEditQuestion="DialogEditQuestion"
      :StoreObj="EditQuestionObj"
      @clicked="DialogEditQuestionEmit"
    />
    <DeleteQuestion
      :DialogDeleteQuestion="DialogDeleteQuestion"
      :StoreObj="DeleteQuestionObj"
      @clicked="DialogDeleteQuestionEmit"
    />

    <!--Title-->
    <div class="text-primary mt-n2">
      Questions for {{ StoreObj.splay_category_name }}
    </div>

    <!--Data Table-->
    <v-data-table
      :height="windowHeight"
      :headers="TableHeaders"
      :items="paginatedItems"
      :loading="loading"
      :items-per-page="itemsPerPage"
      class="modern-data-table mt-3"
      hide-default-footer
    >
      <!--No data-->
      <template #no-data>
        <div class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-controller</v-icon
          >
          <div class="text-h6 text-grey mb-2">
            No custom questions at the moment!
          </div>
          <div class="text-body-2 text-grey">Create one to start</div>
        </div>
      </template>

      <!--Actions-->
      <template #[`item.actions`]="{ item }">
        <div class="d-flex justify-start">
          <v-tooltip text="Edit" location="left">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="button_animate"
                elevation="0"
                size="30"
                color="transparent"
                @click="OpenDialogEditQuestion(item)"
                icon
                flat
              >
                <v-icon size="17" color="green">mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Delete" location="left">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="button_animate"
                elevation="0"
                size="30"
                color="transparent"
                @click="OpenDialogDeleteQuestion(item)"
                icon
                flat
              >
                <v-icon size="17" color="red">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>

    <!--Pagination-->
    <div class="table-footer">
      <div class="footer-info">
        {{
          totalItems === 0
            ? "No Results"
            : `Showing ${paginatedItems.length} of ${totalItems} custom questions`
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
  </v-card-text>
</template>

<script>
import EditQuestion from "./EditQuestion.vue";
import DeleteQuestion from "./DeleteQuestion.vue";

import { ListQuestions } from "@/mixins/ListQuestions";

export default {
  props: { StoreObj: Object },

  components: { EditQuestion, DeleteQuestion },

  mixins: [ListQuestions],

  data: () => ({
    windowHeight: 0,
    currentPage: 1,
    itemsPerPage: 15,

    DialogEditQuestion: false,
    DialogDeleteQuestion: false,

    CategoryObj: {},
    EditQuestionObj: {},
    DeleteQuestionObj: {},

    ListAllQuestions: [],
    TableHeaders: [
      { title: "Question", value: "splay_question_text" },
      { title: "Option A", value: "splay_option_1" },
      { title: "Option B", value: "splay_option_2" },
      { title: "Option C", value: "splay_option_3" },
      { title: "Option D", value: "splay_option_4" },
      { title: "Answer", value: "splay_correct_option" },
      { title: "Actions", value: "actions" },
    ],
  }),

  async mounted() {
    this.windowHeight = window.innerHeight - 260;
    await this.ListQuestionsMethod();
  },

  computed: {
    totalItems() {
      return this.ListAllQuestions.length;
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.ListAllQuestions.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.ListAllQuestions.length / this.itemsPerPage);
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
    QuestionPageEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    OpenDialogEditQuestion(item) {
      this.EditQuestionObj = item;
      this.DialogEditQuestion = true;
    },
    DialogEditQuestionEmit(Toggle) {
      this.DialogEditQuestion = false;
      if (Toggle === 2) {
        this.ListQuestionsMethod();
      }
    },
    OpenDialogDeleteQuestion(item) {
      this.DeleteQuestionObj = item;
      this.DialogDeleteQuestion = true;
    },
    DialogDeleteQuestionEmit(Toggle) {
      this.DialogDeleteQuestion = false;
      if (Toggle === 2) {
        this.ListQuestionsMethod();
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
