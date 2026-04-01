<template>
  <v-card-text class="pa-0">
    <AddSubCategoryDialog
      :DialogAddSubCategory="DialogAddSubCategory"
      :StoreObj="AddSubCategoryObj"
      @clicked="DialogAddSubCategoryEmit"
    />
    <EditSubCategoryDialog
      :DialogEditSubCategory="DialogEditSubCategory"
      :StoreObj="EditSubcategoryObj"
      @clicked="DialogEditSubCategoryEmit"
    />
    <DeleteSubcategoryDialog
      :DialogDeleteSubcategory="DialogDeleteSubcategory"
      :StoreObj="DeleteSubcategoryObj"
      @clicked="DialogDeleteSubcategoryEmit"
    />
    <SubcategoryAgentsDialog
      :DialogSubcategoryAgents="DialogSubcategoryAgents"
      :StoreObj="SubcategoryAgentsObj"
      @clicked="DialogSubcategoryAgentsEmit"
    />
    <div class="font-weight-bold ml-2 mt-n3 text-h6 text-primary">
      {{ StoreObj.category_name }}'s Subcategories
    </div>

    <!--Buttons-->
    <v-card-actions class="d-flex justify-end mt-n10">
      <!--Create Button-->
      <v-btn
        rounded="lg"
        variant="flat"
        color="primary"
        class="mt-n2"
        @click="OpenDialogAddSubCategory"
      >
        <v-icon color="white">mdi-plus</v-icon>
        Create
      </v-btn>

      <!--Back Button-->
      <v-btn rounded="lg" variant="flat" color="primary" class="mt-n2" @click="goBack">
        <v-icon color="white">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-card-actions>
    <v-data-table
      :headers="TableHeaders"
      :items="paginatedItems"
      :loading="loading"
      :height="windowHeight"
      class="modern-data-table"
      hide-default-footer
    >
      <!--No Data-->
      <template #no-data>
        <div class="text-center py-8">
          <v-icon size="84" color="grey-lighten-1" class="mb-4">
            mdi-tangram
          </v-icon>
          <div class="text-h6 text-grey mb-2">No Subcategories to list!</div>
          <div class="text-body-2 text-grey">Create one to get started.</div>
        </div>
      </template>

      <!--Date-->
      <template #[`item.type_created_on`]="{ item }">
        <div>{{ ConvertDate(item.type_created_on) }}</div>
      </template>

      <!--Actions-->
      <template #[`item.actions`]="{ item }">
        <v-menu
          :model-value="openMenuIndex === item.ticket_type_id"
          @update:model-value="
            (val) => (openMenuIndex = val ? item.ticket_type_id : null)
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
          <v-card>
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
                        (openMenuIndex = null), OpenDialogEditSubCategory(item)
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
                        (openMenuIndex = null),
                          OpenDialogDeleteSubcategory(item)
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
                      @click.stop="
                        (openMenuIndex = null),
                          OpenDialogSubcategoryAgents(item)
                      "
                    >
                      <v-icon color="teal" size="15">mdi-account-group</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
    </v-data-table>

    <!--Pagination-->
    <div class="table-footer">
      <div class="footer-info">
        {{
          totalItems === 0
            ? "No Results"
            : `Showing ${paginatedItems.length} of ${totalItems} subcategories`
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
import AddSubCategoryDialog from "./AddSubCategoryDialog.vue";
import EditSubCategoryDialog from "./EditSubCategoryDialog.vue";
import DeleteSubcategoryDialog from "./DeleteSubcategoryDialog.vue";
import SubcategoryAgentsDialog from "./SubcategoryAgentsDialog.vue";

import { GetAllListTicketTypes } from "@/mixins/GetAllListTicketTypes";

export default {
  components: {
    AddSubCategoryDialog,
    EditSubCategoryDialog,
    DeleteSubcategoryDialog,
    SubcategoryAgentsDialog,
  },

  mixins: [GetAllListTicketTypes],

  props: { StoreObj: Object, search: String },

  data: () => ({
    windowHeight: 0,
    currentPage: 1,
    itemsPerPage: 15,

    loading: false,
    DialogAddSubCategory: false,
    DialogEditSubCategory: false,
    DialogDeleteSubcategory: false,
    DialogSubcategoryAgents: false,

    openMenuIndex: null,

    SubcategoryAgentsObj: {},
    AddSubCategoryObj: {},

    ListAllTicketTypes: [],
    TableHeaders: [
      { title: "Name", value: "ticket_type_name", width: "30%" },
      { title: "Created On", value: "type_created_on", width: "30%" },
      { title: "Prefix", value: "prefix_name", width: "30%" },
      { title: "Actions", value: "actions", width: "10%" },
    ],
  }),

  computed: {
    filteredSubcategories() {
      if (!this.StoreObj) return [];

      const base = this.ListAllTicketTypes.filter(
        (t) => t.default_category === this.StoreObj.category_id
      );

      if (!this.search) return base;

      const s = this.search.toLowerCase();

      return base.filter(
        (item) =>
          item.ticket_type_name.toLowerCase().includes(s) ||
          item.prefix_name?.toLowerCase().includes(s)
      );
    },
    totalItems() {
      return this.filteredSubcategories.length;
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
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredSubcategories.slice(start, end);
    },
    pageCount() {
      return Math.ceil(this.filteredSubcategories.length / this.itemsPerPage);
    },
  },

  async mounted() {
    this.windowHeight = window.innerHeight - 270;
    await this.GetAllListTicketTypesMethod();
    this.$emit("navigate", { screen: "subcategories" });
  },

  methods: {
    OpenDialogEditSubCategory(item) {
      this.EditSubcategoryObj = item;
      this.DialogEditSubCategory = true;
    },
    DialogEditSubCategoryEmit(Toggle) {
      this.DialogEditSubCategory = false;
      if (Toggle === 2) {
        this.GetAllListTicketTypesMethod();
      }
    },
    OpenDialogDeleteSubcategory(item) {
      this.DeleteSubcategoryObj = item;
      this.DialogDeleteSubcategory = true;
    },
    DialogDeleteSubcategoryEmit(Toggle) {
      this.DialogDeleteSubcategory = false;
      if (Toggle === 2) {
        this.GetAllListTicketTypesMethod();
      }
    },
    ConvertDate(type_created_on) {
      const date = new Date(type_created_on * 1000);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    OpenDialogSubcategoryAgents(item) {
      this.SubcategoryAgentsObj = item;
      this.DialogSubcategoryAgents = true;
    },
    DialogSubcategoryAgentsEmit() {
      this.DialogSubcategoryAgents = false;
    },
    OpenDialogAddSubCategory() {
      this.AddSubCategoryObj = this.StoreObj;
      this.DialogAddSubCategory = true;
    },
    DialogAddSubCategoryEmit(Toggle) {
      this.DialogAddSubCategory = false;
      if (Toggle === 2) this.GetAllListTicketTypesMethod();
    },
    goBack() {
      this.$emit("navigate", { screen: "categories" });
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
