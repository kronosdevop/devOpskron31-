<template>
  <div>
    <v-card flat>
      <v-toolbar flat>
        <v-select
          v-model="selectStatusType"
          style="max-width: 200px"
          :items="[
            { text: 'All', value: 'ALL' },
            { text: 'Product', value: 'PRODUCT' },
            { text: 'Service', value: 'SERVICE' },
          ]"
          class="ml-2 mt-n2"
          item-text="text"
          item-value="value"
          label="Status"
          outlined
          :menu-props="{ contentClass: 'select-items' }"
          @input="filter_data()"
          dense
        />
        <v-text-field
          v-model="search"
          label="Search"
          outlined
          placeholder="Min 3 Character"
          class="ml-3 mt-n2"
          style="max-width: 200px"
          append-icon="mdi-magnify"
          dense
        />
        <v-spacer />
        <v-btn
          dark
          @click="createproductdailog()"
          class="text-capitalize cardCss mt-n3"
          >Create</v-btn
        >
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :search="search"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="elevation-1 dtwidth mt-n2"
          @click:row="handle_row_click"
        >
          <template v-slot:[`item.industries_type`]="{ item }">
            <span v-if="item.industries_type == 'PRODUCT'">Product</span>
            <span v-else>Service</span>
          </template>
          <template v-slot:[`item.product_created_on`]="{ item }">
            <span v-text="get_date(item.product_created_on)"></span>
          </template>
          <template v-slot:[`item.product_head`]="{ item }">
            <span>{{ item.admin_details.full_user_name }}</span>
          </template>
          <template v-slot:[`item.product_description`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div v-if="item.product_description" class="" v-on="on">
                  {{
                    item.product_description.length >= 50
                      ? item.product_description.substr(0, 50) + "..."
                      : item.product_description
                  }}
                </div>
                <div v-else>-</div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.product_description }}
              </div>
            </v-tooltip>
          </template>
          <template v-slot:[`item.Actions`]="{ item }">
            <v-icon small color="red" @click.stop="delete_product(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateProduct
        :addproduct="addproduct"
        @clicked="addproduct = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteProduct
        :deleteProductDialog="deleteProductDialog"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="deleteProductDialog = false"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import CreateProduct from "@/components/CRM/Popups/CreateProduct.vue";
import DeleteProduct from "@/components/CRM/Popups/DeleteProduct.vue";

// import { list_product_details } from "@/graphql/queries.js";
// import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    CreateProduct,
    SnackBar,
    DeleteProduct,
  },
  data() {
    return {
      height: 0,
      componentCheck: 0,
      fixed: true,
      addproduct: false,
      tableData: [],
      search: "",
      selectStatusType: "ALL",
      SnackBarComponent: {},
      productitems: {},
      tableLoading: false,
      toggle_exclusive: "edit_product",
      rowInfo: {},
      deleteProductDialog: false,

      headers: [
        {
          text: "Name",
          value: "product_name",
          sortable: false,
        },
        {
          text: "Description",
          value: "product_description",
          sortable: false,
        },
        {
          text: "Created On",
          value: "product_created_on",
          sortable: false,
        },
        {
          text: "Created By",
          value: "product_created_by",
          sortable: false,
        },
        {
          text: "Industries Type",
          value: "industries_type",
          sortable: false,
        },
        {
          text: "Owned By",
          value: "product_head",
          sortable: false,
        },
        {
          text: "#Campaings",
          value: "no_of_campaigns",
          sortable: false,
        },
        {
          text: "Action",
          value: "Actions",
          sortable: false,
        },
      ],
    };
  },
  watch: {
    search() {
      if (this.search != "") {
        if (this.search.length >= 3) {
          this.get_product();
        }
      } else {
        this.get_product();
      }
    },
    // nextToken() {
    //   this.updatePagination();
    // },
  },
  mounted() {
    this.get_product();
  },
  created() {
    this.height = window.innerHeight - 310;
    this.$store.commit("Setproductitems", {});
  },
  methods: {
    back_mutation() {
      this.displayedit = false;
    },

    delete_product(item) {
      this.componentCheck = 2;
      this.deleteProductDialog = true;
      this.rowInfo = item;
    },

    filter_data() {
      this.tableData = [];
      this.get_product();
    },

    handle_row_click(item) {
      this.productitems = item;
      this.$store.commit("Setproductitems", this.productitems);
      this.$router.push("ViewProduct");
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addproduct = false;
      this.deleteProductDialog = false;
      this.get_product();
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

    createproductdailog() {
      this.componentCheck = 1;
      this.addproduct = true;
    },

    get_date(date) {
      let a = new Date(date * 1000).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    async get_product() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_product_details, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
              nextToken: null,
              industries_type: this.selectStatusType,
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.list_product_details);
        if (response.Status == "SUCCESS") {
          this.tableLoading = false;
          this.tableData = response.data;
        } else {
          this.tableLoading = false;
        }
      } catch (error) {
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

<style>
</style>