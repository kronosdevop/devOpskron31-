<template>
  <div>
    <v-card flat >
      <v-toolbar dense flat >
        <v-text-field
          v-model="search"
          label="Search"
          outlined
          placeholder="Min 3 Character"
          class="mt-5"
          style="max-width: 200px"
          append-icon="mdi-magnify"
          dense
        />
        <v-spacer />
        <!-- <v-btn
          dark
          small
          @click="createCrmMember()"
          class="text-capitalize cardCss mt-n2"
          >Add</v-btn
        > -->

        <!-- <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn
              color="primary"
              class="text-capitalize cardCss ml-2 mt-n2"
              small
              v-bind="attrs"
              v-on="on"
            >
              Actions
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="primaryColor">mdi-download</v-icon>
              </v-list-item-icon>
              <v-list-item-title>Download Template</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="primaryColor">mdi-import</v-icon>
              </v-list-item-icon>
              <BulkIndex
                :on-success="handleSuccess"
                :before-upload="beforeUpload"
              />
            </v-list-item>
          </v-list>
        </v-menu> -->
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :fixed-header="fixed"
          :headers="headers"
          :items="tableData"
          :search="search"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          :sort-by="['from_duration']"
          :options.sync="pagination"
          @update:options="get_customer_pagination()"
          dense
          class="elevation-1 dtwidth"
        >
          <!--   :height="height" -->
          <template v-slot:[`item.customer_created_on`]="{ item }">
            <span v-text="get_date(item.customer_created_on)"></span>
          </template>
          <template v-slot:[`item.product_ids`]="{ item }">
            <span>{{ item.product_ids[0] }}</span>
            <span
              class="ml-3 green--text"
              color=""
              v-if="item.product_ids.length > 1"
              @click="openProductlist(item)"
              >+ {{ item.product_ids.length - 1 }}</span
            >
            <!-- <v-tooltip bottom>
              <template #activator="{ on }">
                <v-icon
                  small
                  v-on="on"
                  class="ml-2"
                  v-if="item.product_ids.length > 1"
                  @click="openProductlist(item)"
                  >mdi-information-slab-circle-outline</v-icon
                >
              </template>
              <span>View</span>
            </v-tooltip> -->
          </template>
          <template v-slot:[`item.customer_email_id`]="{ item }">
            <span v-if="item.customer_email_id != null">{{
              item.customer_email_id
            }}</span>
            <span v-else class="ml-5">-</span>
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
      <CreateDB
        :addmember="addmember"
        @clicked="addmember = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentcheck == 2">
      <BulkUpload
        :bulkuploadDialog="bulkuploadDialog"
        :excelHeaders="excelHeaders"
        :excelTableData="excelTableData"
        @clicked="bulkuploadDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentcheck == 3">
      <CustomerProduct
        :listProduct="listProduct"
        @clicked="listProduct = false"
        :rowInfo="rowInfo"
      />
    </div>
    <div v-if="componentcheck == 4">
      <DeleteCustomer
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
/*eslint-disable*/
import { formatedatetime } from "@/JsonFiles/DateFormate.js";
import BulkIndex from "@/components/TicketManagement/BulkIndex.vue";
import CreateDB from "./AllDialogs/CreateDB.vue";
import SnackBar from "@/components/SnackBar.vue";
import BulkUpload from "@/components/TicketManagement/AllDialogs/BulkUpload.vue";
import { list_cusomters_v2 } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import CustomerProduct from "@/components/TicketManagement/AllDialogs/CustomerProduct.vue";
import DeleteCustomer from "@/components/TicketManagement/AllDialogs/DeleteCustomer.vue";
export default {
  components: {
    BulkIndex,
    SnackBar,
    CreateDB,
    BulkUpload,
    CustomerProduct,
    DeleteCustomer,
  },
  data() {
    return {
      height: 0,
      fixed: true,
      pagination: {
        itemsPerPage: 20,
        page: 1,
      },
      nextToken: null,
      listProduct: false,
      tableData: [],
      SnackBarComponent: {},
      addmember: false,
      componentcheck: 0,
      customerdeletion: false,
      tableLoading: false,
      search: "",
      excelTableData: [],
      excelHeaders: [],
      bulkuploadDialog: false,
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
          value: "product_ids",
          sortable: false,
        },
        {
          text: "Created On",
          value: "customer_created_on",
          sortable: false,
        },
        { text: "Actions", value: "actions", sortable: false },

        // {
        //   text: "Created By",
        //   value: "customer_created_by",
        //   sortable: false,
        // },
      ],
      rowInfo: {},
    };
  },
  created() {
    this.height = window.innerHeight - 270;
    this.get_customers();
  },
  methods: {
    get_customer_pagination() {
      if (this.nextToken) {
        this.get_customers();
      }
    },
    open_deleteDailog(item) {
      this.rowInfo = item;
      this.componentcheck = 4;
      this.customerdeletion = true;
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
    openProductlist(item) {
      this.componentcheck = 3;
      this.rowInfo = item;
      this.listProduct = true;
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
      this.addmember = false;
      this.bulkuploadDialog = false;
      this.customerdeletion = false;
      this.get_customers();
    },
    handleSuccess({ results, header }) {
      // console.log(results, header);
      this.excelTableData = results;
      this.componentcheck = 2;
      // console.log(this.exceldata.tabledata);
      this.excelHeaders = header;
      this.bulkuploadDialog = true;
      // this.$refs.editupload.getexceldata(this.exceldata);
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (isLt1M) {
        return true;
      }
      this.$message({
        message: "Please do not upload files larger than 1m in size.",
        type: "warning",
      });
      return false;
    },
    createCrmMember() {
      this.componentcheck = 1;
      this.addmember = true;
    },
    async get_customers() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(list_cusomters_v2, {
            input: {
              organization_id: data.organization.organization_id,
              //   product_id:
              // action_type: "ALL",
              limit: 101,
              NextToken: this.nextToken,
            },
          })
        );
        this.tableLoading = false;
        // console.log(result);
        var dataArray = [];
        var response = JSON.parse(result.data.list_cusomters_v2).data;
        if (response.Status == "ERROR") {
          this.tableLoading = false;
        } else {
          this.nextToken = JSON.parse(result.data.list_cusomters_v2).nextToken;

          this.tableData = this.tableData.concat(response);

          const uniqueArrayOfObjects = this.tableData.filter(
            (obj, index, self) =>
              index === self.findIndex((o) => o.customer_id === obj.customer_id)
          );

          this.tableData = uniqueArrayOfObjects;
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