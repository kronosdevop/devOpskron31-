<template>
  <div>
    <v-card flat >
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :search="search"
          :items="tableData"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth mt-n2"
          @update:options="get_customer_pagination()"
        >
          <template v-slot:[`item.customer_created_on`]="{ item }">
            <span v-text="get_date(item.customer_created_on)"></span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="red" small @click="open_deleteDailog(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentcheck == 1">
      <DeleteproductCustomer
        :customerdeletion="customerdeletion"
        @clicked="customerdeletion = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import DeleteproductCustomer from "@/components/TicketManagement/AllDialogs/DeleteproductCustomer.vue";
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import SnackBar from "@/components/SnackBar.vue";
import { list_customers } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
    DeleteproductCustomer,
  },
  data() {
    return {
      height: 0,
      fixed: true,
      nextToken: null,
      customerdeletion: false,
      tableData: [],
      componentcheck: 0,
      rowInfo: {},
      SnackBarComponent: {},
      tableLoading: false,
      search: "",
      headers: [
        {
          text: "Customer Name",
          value: "customer_name",
          sortable: false,
        },
        {
          text: "Contact Number",
          value: "customer_contact_number",
          sortable: false,
        },
        {
          text: "Email ID",
          value: "customer_email_id",
          sortable: false,
        },
        {
          text: "Product Name",
          value: "product_name",
          sortable: false,
        },
        {
          text: "Created On",
          value: "customer_created_on",
          sortable: false,
        },

        {
          text: "Created By",
          value: "customer_created_by",
          sortable: false,
        },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  created() {
    this.height = window.innerHeight - 210;
    this.get_customers();
  },
  methods: {
    get_customer_pagination() {
      if (this.nextToken) {
        this.get_customers();
      }
    },
    get_date(date) {
      return formatedatetime(date);
      // let a = new Date(date * 1000).toLocaleTimeString("en-In", {
      //   year: "numeric",
      //   month: "2-digit",
      //   day: "2-digit",
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   second: "2-digit",
      // });
      // return a.toUpperCase();
    },
    open_deleteDailog(item) {
      this.rowInfo = item;
      this.componentcheck = 1;
      this.customerdeletion = true;
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

      this.customerdeletion = false;
      this.get_customers();
    },
    async get_customers() {
      this.tableLoading = true;
      //   var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_customers, {
            input: {
              //   organization_id: data.organization.organization_id,
              product_id: this.$store.getters.Getproductitems.product_id,
              limit: 101,
              nextToken: this.nextToken,
              action_type: "PRODUCT",
            },
          })
        );
        this.tableLoading = false;
        // var dataArray = [];
        var response = result.data.list_customers.items;
        // console.log(response);
        // dataArray = result.data.list_customers.details;

        this.nextToken = result.data.list_customers.nextToken;

        this.tableData = this.tableData.concat(response);

        // this.tableData = response;
        const uniqueArrayOfObjects = this.tableData.filter(
          (obj, index, self) =>
            index === self.findIndex((o) => o.customer_email_id	 === obj.customer_email_id	)
        );

        this.tableData = uniqueArrayOfObjects;
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