<template>
  <v-card-text class="pa-0">
    <TicketTagsDialog
      :DialogTicketTags="DialogTicketTags"
      @clicked="DialogTicketTagsEmit"
    />
    <EditTicketTagsDialog
      :DialogEditTicketTags="DialogEditTicketTags"
      :StoreObj="EditTicketTagObj"
      @clicked="DialogEditTicketTagsEmit"
    />
    <DeleteCategoryDialog
      :DialogDeleteCategory="DialogDeleteCategory"
      :StoreObj="DeleteCategoryObj"
      @clicked="DialogDeleteCategoryEmit"
    />
    <CategoryAgentsDialog
      :DialogCategoryAgents="DialogCategoryAgents"
      :StoreObj="CategoryAgentsObj"
      @clicked="DialogCategoryAgentsEmit"
    />
    <TicketSubcategoriesCard
      v-if="current_view === 'Subcategories'"
      :search="search"
      :StoreObj="CategoryObj"
      @navigate="handleSubcategoryNavigation"
    />
    <div v-if="current_view === 'Categories'">
      <div class="font-weight-bold ml-2 mt-n3 text-h6 text-primary">
        Categories
      </div>
      <!--Buttons-->
      <v-card-actions class="d-flex justify-end mt-n10">
        <!--Create Button-->
        <v-btn
          rounded="lg"
          variant="flat"
          color="primary"
          class="mt-n2"
          @click="DialogTicketTags = true"
        >
          <v-icon color="white">mdi-plus</v-icon>
          Create
        </v-btn>

        <!--Back Button-->
        <v-btn
          rounded="lg"
          variant="flat"
          color="primary"
          class="mt-n2"
          @click="goBack"
        >
          <v-icon color="white">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-card-actions>

      <v-data-table
        :headers="TableHeaders"
        :items="paginatedItems"
        :loading="loading"
        :height="windowHeight"
        @click:row="ShowSubcategories"
        class="modern-data-table"
        hide-default-footer
      >
        <!--No Data-->
        <template #no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-tangram
            </v-icon>
            <div class="text-h6 text-grey mb-2">No categories to list!</div>
            <div class="text-body-2 text-grey">Create one to get started.</div>
          </div>
        </template>

        <!--Ticket Distribution Method-->
        <template #[`item.ticket_distribution`]="{ item }">
          <div>
            {{
              item.ticket_distribution === "CLAIM_TICKET"
                ? "Claim Ticket"
                : item.ticket_distribution === "ROUND_ROBIN"
                ? "Round Robin"
                : item.ticket_distribution === "LOAD_SHARING"
                ? "Load Sharing"
                : item.ticket_distribution === "MODERATOR"
                ? "Load Moderator"
                : "To be decided"
            }}
          </div>
        </template>

        <!--Created on-->
        <template #[`item.category_created_on`]="{ item }">
          <div>{{ ConvertDate(item.category_created_on) }}</div>
        </template>

        <!--Actions-->
        <template #[`item.actions`]="{ item }">
          <v-menu
            :model-value="openMenuIndex === item.category_id"
            @update:model-value="
              (val) => (openMenuIndex = val ? item.category_id : null)
            "
            open-on-hover
            open-delay="0"
            close-delay="150"
          >
            <template #activator="{ props }">
              <v-btn v-bind="props" icon flat color="transparent">
                <v-icon color="primary">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <!--Edit Button-->
              <v-list-item>
                <v-tooltip text="Edit">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      flat
                      color="transparent"
                      size="25"
                      @click.stop="
                        (openMenuIndex = null), OpenDialogEditTicketTags(item)
                      "
                    >
                      <v-icon color="green" size="15">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-list-item>

              <!--Delete Button-->
              <v-list-item>
                <v-tooltip text="Delete">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      flat
                      color="transparent"
                      size="25"
                      @click.stop="
                        (openMenuIndex = null), OpenDialogDeleteCategory(item)
                      "
                    >
                      <v-icon color="red" size="15">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-list-item>

              <!--Agents-->
              <v-list-item>
                <v-tooltip text="Agents">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      flat
                      color="transparent"
                      size="25"
                      @click="OpenDialogCategoryAgents(item)"
                    >
                      <v-icon color="teal" size="15">mdi-account-group</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>

      <!--Pagination-->
      <div class="table-footer">
        <div class="footer-info">
          {{
            totalItems === 0
              ? "No Results"
              : `Showing ${paginatedItems.length} of ${totalItems} categories`
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
import TicketTagsDialog from "./TicketTagsDialog.vue";
import TicketSubcategoriesCard from "./TicketSubcategoriesCard.vue";
import EditTicketTagsDialog from "./EditTicketTagsDialog.vue";
import DeleteCategoryDialog from "./DeleteCategoryDialog.vue";
import CategoryAgentsDialog from "./CategoryAgentsDialog.vue";

import { GetAllListCategories } from "@/mixins/GetAllListCategories";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  emits: ["ready"],

  props: { StoreObj: Object, search: String },

  components: {
    TicketTagsDialog,
    TicketSubcategoriesCard,
    EditTicketTagsDialog,
    DeleteCategoryDialog,
    CategoryAgentsDialog,
  },

  mixins: [GetAllListCategories, get_all_org_users],

  data: () => ({
    subcategory: "",
    subcategory_agents: [],
    subticket_prefix: "",
    current_view: "Categories",

    windowHeight: 0,
    currentPage: 1,
    itemsPerPage: 15,

    DialogTicketTags: false,
    DialogEditTicketTags: false,
    DialogDeleteCategory: false,
    DialogCategoryAgents: false,
    loading: false,

    openMenuIndex: null,

    CategoryObj: {},
    EditTicketTagObj: {},
    DeleteCategoryObj: {},
    AddSubCategoryObj: {},
    CategoryAgentsObj: {},

    ListAllCategories: [],
    ListAllTicketTypes: [],
    TableHeaders: [
      { title: "Name", value: "category_name", width: "25%" },
      { title: "Prefix", value: "prefix_name", width: "25%" },
      { title: "Created On", value: "category_created_on", width: "25%" },
      {
        title: "Distribution Method",
        value: "ticket_distribution",
        width: "25%",
      },
      { title: "Actions", value: "actions" },
    ],
  }),

  computed: {
    filteredCategories() {
      if (!this.search) return this.ListAllCategories;
      const s = this.search.toLowerCase();
      return this.ListAllCategories.filter(
        (item) =>
          item.category_name.toLowerCase().includes(s) ||
          item.prefix_name?.toLowerCase().includes(s)
      );
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredCategories.slice(start, end);
    },
    totalItems() {
      return this.filteredCategories.length;
    },
    pageCount() {
      return Math.ceil(this.filteredCategories.length / this.itemsPerPage);
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

  async mounted() {
    this.windowHeight = window.innerHeight - 270;
    await this.GetAllListCategoriesMethod();
    await this.get_all_org_users();
    this.$emit("ready");
    this.$emit("view-change", "tags");
  },

  methods: {
    shorten(email) {
      if (!email) return "";
      return email.length <= 10 ? email : `${email.slice(0, 10)}..`;
    },
    getTicketTypesForCategory(category_id) {
      return this.ListAllTicketTypes.filter(
        (t) => t.default_category === category_id
      );
    },
    DialogTicketTagsEmit(Toggle) {
      this.DialogTicketTags = false;
      if (Toggle === 2) {
        this.GetAllListCategoriesMethod();
      }
    },
    OpenDialogEditTicketTags(item) {
      this.EditTicketTagObj = item;
      this.DialogEditTicketTags = true;
    },
    DialogEditTicketTagsEmit(Toggle) {
      this.DialogEditTicketTags = false;
      if (Toggle === 2) {
        this.GetAllListCategoriesMethod();
      }
    },
    OpenDialogDeleteCategory(item) {
      this.DeleteCategoryObj = item;
      this.DialogDeleteCategory = true;
    },
    DialogDeleteCategoryEmit(Toggle) {
      this.DialogDeleteCategory = false;
      if (Toggle === 2) {
        this.GetAllListCategoriesMethod().then(() => {
          this.ListAllCategories = [...this.ListAllCategories];
        });
      }
    },
    ConvertDate(category_created_on) {
      const date = new Date(category_created_on * 1000);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    ShowSubcategories(event, rowItem) {
      this.CategoryObj = rowItem.item;
      this.current_view = "Subcategories";
      this.$emit("view-change", "subcategories");
    },
    goBack() {
      if (this.current_view === "Subcategories") {
        this.current_view = "Categories";
        this.$emit("view-change", "categories");
      } else {
        this.$emit("exit-tags");
      }
    },
    goBackToCategories() {
      this.current_view = "Categories";
      this.$emit("view-change", "tags");
    },
    OpenDialogCategoryAgents(item) {
      this.CategoryAgentsObj = item;
      this.DialogCategoryAgents = true;
    },
    DialogCategoryAgentsEmit() {
      this.DialogCategoryAgents = false;
    },
    handleSubcategoryNavigation(e) {
      if (e.screen === "categories") {
        this.current_view = "Categories";
        this.$emit("view-change", "categories");
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
