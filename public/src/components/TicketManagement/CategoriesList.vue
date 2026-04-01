<template>
  <div>
    <v-card flat >
      <!-- <v-toolbar flat>
        <v-spacer />
        <v-btn dark class="text-capitalize cardCss ml-2" @click="add_call()">
          Add
        </v-btn>
      </v-toolbar> -->
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
        >
          <template v-slot:[`item.action`]="{ item }">
            <v-icon
              small
              color="red"
              class="ml-1"
              @click.stop="delete_admins(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <CreateCategories
        :addConfiguration="addConfiguration"
        @clicked="addConfiguration = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteCategories
        :categorydelete="categorydelete"
        :categoryinfo="categoryinfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="categorydelete = false"
      />
    </div>
  </div>
</template>
  
  <script>
import SnackBar from "@/components/SnackBar.vue";
import { list_categories_products } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import CreateCategories from "./AllDialogs/CreateCategories.vue";
import DeleteCategories from "./AllDialogs/DeleteCategories.vue";
export default {
  components: {
    SnackBar,
    CreateCategories,
    DeleteCategories,
  },
  data() {
    return {
      height: 0,
      fixed: true,
      componentCheck: 0,
      tableData: [],
      addConfiguration: false,
      SnackBarComponent: {},
      tableLoading: false,
      categoryinfo: {},
      categorydelete: false,
      search: "",
      headers: [
        {
          text: "Category",
          value: "categorie_name",
          sortable: false,
        },

        {
          text: "Created By ",
          value: "create_by",
          sortable: false,
        },
        {
          text: "Action",
          value: "action",
          sortable: false,
        },
      ],
    };
  },
  created() {
    this.height = window.innerHeight - 220;
    this.get_categories();
  },
  methods: {
    delete_admins(item) {
      this.categoryinfo = item;
      this.componentCheck = 2;
      this.categorydelete = true;
    },
    async get_categories() {
      this.tableLoading = true;
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_categories_products, {
            input: {
              product_id: this.$store.getters.Getproductitems.product_id,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];

        var response = JSON.parse(result.data.list_categories_products);
        this.tableData = response.data;
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
    add_call() {
      this.componentCheck = 1;
      this.addConfiguration = true;
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
      this.addConfiguration = false;
      this.categorydelete = false;
      this.get_categories();
    },
  },
};
</script>
  
  <style>
</style>