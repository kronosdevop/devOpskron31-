<template>
  <div>
    <v-card flat >
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-toolbar flat >
        <v-select
          v-model="selectStatusType"
          style="max-width: 200px"
          :items="[
            { text: 'All', value: 'ALL' },
            { text: 'Completed', value: 'COMPLETED' },
            { text: 'Assigned', value: 'ASSIGNED' },
            { text: 'Not Assigned', value: 'NOT_ASSIGNED' },
            { text: 'Paused', value: 'PAUSED' },
          ]"
          class="mt-6"
          item-text="text"
          item-value="value"
          label="Filter By"
          outlined
          :menu-props="{ contentClass: 'select-items' }"
          dense
        />
        <v-autocomplete
          dense
          v-model="userselect"
          label="Search User"
          outlined
          item-text="full_user_name"
          item-value="user_id"
          :items="userArray"
          :search-input.sync="searchuser"
          hide-no-data
          style="max-width: 200px"
          class="mr-2 ml-2 mt-6"
          placeholder="Min 3 Character"
          hide-selected
        />
        <v-autocomplete
          dense
          v-model="products"
          label="Search Product"
          outlined
          item-text="product_name"
          item-value="product_id"
          :items="productitems"
          :search-input.sync="searchproducts"
          hide-no-data
          style="max-width: 200px"
          class="mr-2 ml-2 mt-6"
          placeholder="Min 3 Character"
          hide-selected
          @change="filter_category()"
        />
        <v-autocomplete
          dense
          v-model="categories"
          label="Search Category"
          outlined
          item-text="category_name"
          item-value="category_id"
          :items="categoriesitems"
          :search-input.sync="searchcategory"
          hide-no-data
          style="max-width: 200px"
          class="mr-2 ml-2 mt-6"
          placeholder="Min 3 Character"
          hide-selected
        />
        <v-btn
          dark
          class="text-capitalize cardCss ml-2 mt-2"
          :loading="goLoading"
          @click="filter_data()"
          >Go</v-btn
        >
        <v-btn
          dark
          class="text-capitalize cardCss ml-2 mt-2"
          @click="clear_data()"
          >Clear</v-btn
        >
      </v-toolbar>
      <!-- @change="getexpense_list()" -->
      <v-card-text>
        <v-data-table
          :headers="adminHeaders"
          :fixed-header="fixed"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth"
          @click:row="handleClick"
        >
          <!--   :height="height" -->
          <template v-slot:[`item.ticket_raised_on`]="{ item }">
            <span v-text="get_date(item.ticket_raised_on)"></span>
          </template>
          <template v-slot:[`item.ticket_status`]="{ item }">
            <span v-if="item.ticket_status == 'NOT_ASSIGNED'" class="red--text"
              >NOT ASSIGNED</span
            >
            <span
              v-else-if="item.ticket_status == 'ASSIGNED'"
              class="orange--text"
              >ASSIGNED</span
            >
            <span
              v-else-if="item.ticket_status == 'PAUSED'"
              class="primary--text"
              >Paused
            </span>
            <span v-else class="green--text">{{ item.ticket_status }}</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentcheck == 1">
      <ViewHistory
        :historydailog="historydailog"
        @clicked="historydailog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
      />
    </div>
  </div>
</template>

<script>
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import {
  ticket_history,
  list_product_category_names,
} from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewHistory from "@/components/TicketManagement/AllDialogs/ViewHistory.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    ViewHistory,
    SnackBar,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      tableLoading: false,
      userselect: "ALL",
      rowInfo: {},
      height: 0,
      fixed: false,
      adminHeaders: [
        {
          text: "Ticket ID",
          value: "ticket_no_id",
          sortable: false,
        },
        {
          text: "User",
          value: "user_name",
          sortable: false,
        },

        {
          text: "Ticket Raised On",
          value: "ticket_raised_on",
          sortable: false,
        },
        {
          text: "Product/Services",
          value: "product_name",
          sortable: false,
        },
        {
          text: "Category Type",
          value: "categorie_name",
          sortable: false,
        },
        {
          text: "Assigned To",
          value: "ticket_assign_to",
          sortable: false,
        },
        {
          text: "Ticket Status",
          value: "ticket_status",
          sortable: false,
        },
      ],
      tableData: [],
      selectStatusType: "ALL",
      historydailog: false,
      componentcheck: 0,
      searchuser: "",
      SnackBarComponent: {},
      userArray: [],
      categories: "ALL",
      categoriesitems: [],
      searchcategory: "",
      products: "ALL",
      searchproducts: "",
      productitems: [],
      goLoading: false,
    };
  },
  async created() {
    this.height = window.innerHeight - 290;
    await Promise.all([
      this.get_all_org_users(),
      this.fetch_tickethistory(),
      this.fetch_product(),
    ]);

    this.fetch_user_data();
  },
  methods: {
    fetch_user_data() {
      this.userArray = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
          this.userArray.unshift({
            full_user_name: "All",
            user_id: "ALL",
          });
        }
      });
      this.productitems.unshift({
        product_name: "All",
        product_id: "ALL",
      });
      this.categoriesitems.unshift({
        category_name: "All",
        category_id: "ALL",
      });
    },
    filter_data() {
      this.goLoading = true;
      this.tableData = [];
      this.fetch_tickethistory();
    },
    clear_data() {
      this.selectStatusType = "ALL";
      this.userselect = "ALL";
      this.products = "ALL";
      this.categories = "ALL";
      this.fetch_tickethistory();
    },
    handleClick(value) {
      this.componentcheck = 1;
      this.rowInfo = value;
      this.historydailog = true;
    },
    getexpense_list() {
      this.tableData = [];
      this.fetch_tickethistory();
    },

    success_info(val) {
      // console.log(val);
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.historydailog = false;
      this.fetch_tickethistory();
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
    get_date(val) {
      return formatedatetime(val);
      // const d = new Date(parseInt(val * 1000));
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
    },
    async fetch_tickethistory() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(ticket_history, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
              nextToken: this.nextToken,
              ticket_status: this.selectStatusType,
              categorie_id:
                this.categories == "ALL" || this.categories == ""
                  ? undefined
                  : this.categories,
              product_id:
                this.products == "ALL" || this.products == ""
                  ? undefined
                  : this.products,
                  ticket_assign_to:
                this.userselect == "ALL" || this.userselect == ""
                  ? undefined
                  : this.userselect,
            },
          })
        );
        this.tableLoading = false;
        this.goLoading = false;

        var response = JSON.parse(result.data.ticket_history).data;
        this.tableData = response;
        // console.log(response);
      } catch (error) {
        this.tableLoading = false;
        this.goLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async fetch_product() {
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_product_category_names, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "PRODUCTS",
            },
          })
        );

        var response = JSON.parse(result.data.list_product_category_names);
        if (response.Status == "SUCCESS") {
          this.productitems = [];
          response.data.forEach((element) => {
            this.productitems.push({
              product_name: element.product_name,
              product_id: element.product_id,
            });
          });
          this.productitems.unshift({
            product_name: "All",
            product_id: "ALL",
          });
          this.products = "ALL";
        } else {
          this.productitems = [];
          this.productitems.unshift({
            product_name: "All",
            product_id: "ALL",
          });
          this.products = "ALL";
        }

        // this.tableData = response;
      } catch (error) {
        this.productitems = [];
        this.productitems.unshift({
          product_name: "All",
          product_id: "ALL",
        });
        this.products = "ALL";
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async filter_category() {
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_product_category_names, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "CATEGORIES",
              product_id: this.products,
            },
          })
        );

        var response = JSON.parse(result.data.list_product_category_names);
        if (response.Status == "SUCCESS") {
          this.categoriesitems = [];
          // console.log(response.data);
          response.data.forEach((element) => {
            this.categoriesitems.push({
              category_name: element.categorie_name,
              category_id: element.categorie_id,
            });
          });
          this.categoriesitems.unshift({
            category_name: "All",
            category_id: "ALL",
          });
          this.categories = "ALL";
        } else {
          this.categoriesitems = [];
          this.categoriesitems.unshift({
            category_name: "All",
            category_id: "ALL",
          });
          this.categories = "ALL";
        }
        // this.tableData = response;
      } catch (error) {
        this.categoriesitems = [];
        this.categoriesitems.unshift({
          category_name: "All",
          category_id: "ALL",
        });
        this.categories = "ALL";
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