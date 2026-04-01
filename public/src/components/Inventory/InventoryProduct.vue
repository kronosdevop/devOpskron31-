<template>
  <div style="padding-bottom: 70px">
    <div class="card-container" style="position: relative">
      <v-card flat class="ma-2" >
        <v-card-text class="pb-0">
          <v-row class="align-center mb-2" no-gutters>
            <v-col cols="auto">
              <v-text-field
                v-model="searchQuery"
                placeholder="Search products..."
                prepend-inner-icon="mdi-magnify"
                variant="solo"
                hide-details
                density="compact"
                class="search-pill mr-4"
                style="min-width: 280px; max-width: 280px; height: 32px; border-radius: 999px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); font-size: 14px;"
                clearable
                @click:clear="searchQuery = ''"
              ></v-text-field>
            </v-col>
            <v-spacer />
          </v-row>
          <v-data-table
            :headers="categoriesHeaders"
            :fixed-header="fixed"
            :search="searchQuery"
            :items="categoriesRecords"
            :loading="tableLoading"
            :footer-props="{
              itemsPerPageOptions: [10, 20],
            }"
            item-key="category_id"
            :items-per-page="20"
            density="compact"
            class="elevation-2 dtwidth rounded-lg mt-0"
            hover
            hide-default-footer
          >
            <template #no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-cube-outline</v-icon>
                <div class="text-h6 grey--text mb-2">No Product Data Found</div>
                <div class="text-body-2 grey--text">
                  Try adjusting your search criteria or check back later.
                </div>
              </div>
            </template>
            <template #loading>
              <div class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-4"
                ></v-progress-circular>
                <div class="text-body-2 grey--text">Loading product data...</div>
              </div>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon @click="edit_product(item)" size="small" color="red"
                >mdi-pencil</v-icon
              >
            </template>
            <template v-slot:[`item.depletion_quantity`]="{ item }">
              <span>{{
                item.depletion_quantity == undefined ? 0 : item.depletion_quantity
              }}</span>
            </template>
            <template v-slot:[`item.restock_quantity`]="{ item }">
              <span>{{
                item.restock_quantity == undefined ? 0 : item.restock_quantity
              }}</span>
            </template>
            <template v-slot:[`item.enable_reorder`]="{ item }">
              <v-icon
                color="red"
                v-if="
                  item.enable_reorder == undefined || item.enable_reorder == false
                "
                >mdi-alpha-x-circle</v-icon
              >
              <v-icon v-else color="green">mdi-check-circle</v-icon>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      <!-- Footer bar always rendered -->
      <div
        class="footer-bar d-flex align-center justify-space-between px-6 py-2"
        style="min-height: 56px; background: #f7f8fa"
      >
        <div class="text-caption ml-4" style="color: black; font-size: 14px">
          {{
            categoriesRecords.length === 0
              ? "No Results"
              : (pagination.page - 1) * itemsPerPage + 1 +
                " to " +
                Math.min(pagination.page * itemsPerPage, categoriesRecords.length) +
                " of " +
                categoriesRecords.length +
                " Results"
          }}
        </div>
        <div class="pagination-container d-flex align-center mr-4">
          <v-pagination
            v-model="pagination.page"
            :length="Math.ceil(categoriesRecords.length / itemsPerPage)"
            active-color="primary"
            density="comfortable"
            class="pagination-footer"
            :total-visible="5"
            next-icon="mdi-chevron-right"
            prev-icon="mdi-chevron-left"
          />
        </div>
      </div>
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <EditProduct
        :rowInfo="rowInfo"
        :productEdition="productEdition"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
        @clicked="productEdition = false"
      />
    </div>
  </div>
</template>
  <script>
/*eslint-disable*/
import EditProduct from "@/components/Inventory/Popups/EditProduct.vue";
import SnackBar from "@/components/SnackBar.vue";
import { quotation_sub_categories } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
    EditProduct,
  },
  data() {
    return {
      tableLoading: false,
      productEdition: false,
      fixed: true,
      componentCheck: 0,
      SnackBarComponent: {},
      rowInfo: {},
      categoriesRecords: [],
      searchQuery: "",
      pagination: {
        page: 1
      },
      itemsPerPage: 20,
      categoriesHeaders: [
        { title: "Name", key: "sub_category_name", sortable: false },
        { title: "Reorder", key: "enable_reorder", sortable: false },
        {
          title: "Depletion Quantity",
          key: "depletion_quantity",
          sortable: false,
        },
        {
          title: "Restock Quantity",
          key: "restock_quantity",
          sortable: false,
        },
        { title: "Actions", key: "actions", sortable: false },
      ],
    };
  },
  async created() {
    await this.fetch_categories();
  },
  methods: {
    success_msg(value) {
      this.productEdition = false;

      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.fetch_categories();
    },

    error_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    edit_product(item) {
      this.componentCheck = 1;
      this.productEdition = true;
      this.rowInfo = item;
    },
    async fetch_categories() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(quotation_sub_categories, {
            input: {
              action_type: "LIST",
            },
          })
        );
        var response = JSON.parse(result.data.quotation_sub_categories);
        //  console.log(response);
        this.categoriesRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          this.categoriesRecords = response.data.filter(
            (obj) => obj.sub_category_type == "PRODUCT"
          );
          this.tableLoading = false;

          // console.log(this.categoriesRecords, "this.categoriesRecords");
        } else {
          this.categoriesRecords = [];

          this.tableLoading = false;
        }
      } catch (error) {
        this.categoriesRecords = [];

        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style scoped>
.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}
.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}
.footer-bar {
  background: #f7f8fa;
  min-height: 56px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  border-radius: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
}
.pagination-container {
  min-width: 160px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.pagination-footer {
  margin: 0;
  padding: 0;
  display: inline-flex;
}
.pagination-footer :deep(.v-pagination__list) {
  background: transparent;
  justify-content: flex-end;
}
.pagination-footer :deep(.v-pagination__item) {
  border-radius: 50%;
  margin: 0 2px;
}
.pagination-footer :deep(.v-pagination__item--is-active) {
  background-color: var(--v-primary-base);
  color: white;
}
.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}
.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}
.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}
</style>