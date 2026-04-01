<template>
  <div>
    <v-card flat>
    <!-- <v-card-title>Ticket Administration</v-card-title> -->
    <v-toolbar dense class="mt-3" flat>
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="products">
            Products / Services / Location
          </v-btn>
          <v-btn small class="black--text" text value="dataBase">
            Customers
          </v-btn>
          <v-btn small class="black--text" text value="ticketAssign">
            Raised Tickets
          </v-btn>
          <v-btn small class="black--text" text value="historyticket">
            Tickets History
          </v-btn>
          <!-- <v-btn small class="black--text" text value="ploat_ticket">
            Plot
          </v-btn> -->
          <v-btn small class="black--text" text value="report_ticket">
            Report
          </v-btn>
          <!-- <v-btn
            v-if="
              $store.getters.GetUserObj.user.user_type == 'ADMIN' ||
              $store.getters.GetUserObj.user.user_type == 'OWNER'
            "
            small
            class="black--text"
            text
            value="Submitted_list"
          >
            Payroll Management
          </v-btn> -->
        </v-btn-toggle>

      <v-spacer />
      <v-btn
        v-if="toggle_exclusive == 'products'"
        dark
        @click="createproductdailog()"
        class="text-capitalize cardCss"
        >Create</v-btn
      >
      <v-btn
        v-if="toggle_exclusive == 'ploat_ticket'"
        dark
        @click="add_ploat()"
        class="text-capitalize cardCss"
        >Add</v-btn
      >
      <v-btn
        v-if="toggle_exclusive == 'dataBase'"
        dark
        @click="createCrmMember()"
        class="text-capitalize cardCss"
        >Add</v-btn
      >

      <v-menu v-if="toggle_exclusive == 'dataBase'" offset-y>
        <template #activator="{ on, attrs }">
          <v-btn
            color="primary"
            class="text-capitalize cardCss ml-2"
            v-bind="attrs"
            v-on="on"
          >
            Actions
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item @click="download_item()">
            <v-list-item-icon>
              <v-icon color="primaryColor">mdi-download</v-icon>
            </v-list-item-icon>
            <v-list-item-title class="text-left"
              >Download Template</v-list-item-title
            >
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
            <!-- <v-list-item-title>Import Excel</v-list-item-title> -->
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
  </v-card>
    <div class="text-left" v-if="toggle_exclusive == 'historyticket'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <TicketHistory />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'products'">
      <v-card flat :height="cardHeight" class="overflow-auto">
      <ProductList :key="productKey" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'dataBase'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <CustomerDb :key="customerKey" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'ticketAssign'">
      <v-card flat :height="cardHeight" class="overflow-auto">
      <AssignTickets />
      </v-card>
      <!-- <CustomerDb :key="customerKey" /> -->
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'ploat_ticket'">
      <v-card flat :height="cardHeight" class="overflow-auto">
      <PloatList :key="ploatKey" />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'report_ticket'">
      <v-card flat :height="cardHeight" class="overflow-auto">
      <ExportReport />
      </v-card>
    </div>
    <div v-if="componentCheck == 1">
      <CreateProduct
        :addproduct="addproduct"
        @clicked="addproduct = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:productRefresh="create_product_refresh"
      />
    </div>
    <div v-if="componentCheck == 2">
      <CreateDB
        :addmember="addmember"
        @clicked="addmember = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:createDBRefresh="create_db_refresh"
      />
    </div>
    <div v-if="componentCheck == 2">
      <BulkUpload
        :bulkuploadDialog="bulkuploadDialog"
        :excelHeaders="excelHeaders"
        :excelTableData="excelTableData"
        @clicked="bulkuploadDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:createDBRefresh="create_db_refresh"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AddPloat
        :categoriessubAddition="categoriessubAddition"
        @clicked="categoriessubAddition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:updaterefesh="subrefresh"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/
import ExportReport from "@/components/TicketManagement/ExportReport.vue";
import AddPloat from "@/components/TicketManagement/AllDialogs/AddPloat.vue";
import PloatList from "@/components/TicketManagement/PloatList.vue";
import ProductList from "@/components/TicketManagement/ProductList.vue";
import CreateProduct from "@/components/TicketManagement/AllDialogs/CreateProduct.vue";
import AssignTickets from "@/components/TicketManagement/AssignTickets.vue";
import CustomerDb from "./CustomerDb.vue";
import SnackBar from "@/components/SnackBar.vue";
import CreateDB from "@/components/TicketManagement/AllDialogs/CreateDB.vue";
import BulkUpload from "@/components/TicketManagement/AllDialogs/BulkUpload.vue";
import BulkIndex from "@/components/TicketManagement/BulkIndex.vue";
import TicketHistory from "@/components/TicketManagement/TicketHistory.vue";
const FileSaver = require("file-saver");
import axios from "axios";
export default {
  components: {
    ProductList,
    CustomerDb,
    CreateProduct,
    SnackBar,
    CreateDB,
    BulkUpload,
    BulkIndex,
    AssignTickets,
    TicketHistory,
    PloatList,
    AddPloat,
    ExportReport,
  },
  data() {
    return {
      toggle_exclusive: "products",
      componentCheck: 0,
      addproduct: false,
      SnackBarComponent: {},
      categoriessubAddition: false,
      addmember: false,
      bulkuploadDialog: false,
      excelTableData: [],
      excelHeaders: [],
      productKey: 0,
      customerKey: 0,
      ploatKey: 0,
      excelFileUrl: "",
      cardHeight: 0,
    };
  },
  mounted() {
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {
    async download_item() {
      var fileName = "Sample Template" + ".xlsx";
      axios({
        url: "https://stichh-medias.s3.amazonaws.com/customers.xlsx",
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },

    createproductdailog() {
      this.componentCheck = 1;
      this.addproduct = true;
    },
    add_ploat() {
      this.componentCheck = 3;
      this.categoriessubAddition = true;
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
    subrefresh() {
      this.ploatKey += 1;
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
      this.addmember = false;
      this.categoriessubAddition = false;
      this.bulkuploadDialog = false;
    },
    download_excel() {
      // Sample headers and data
      const headers = [
        "Name",
        "Country Code",
        "Contact Number",
        "Email",
        "Address",
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");

      const excelBlob = XLSX.write(wb, { bookType: "xlsx", type: "blob" });

      this.excelFileUrl = URL.createObjectURL(excelBlob);
      // console.log(this.excelFileUrl);
      // this.$refs.downloadLink.click();
    },
    createCrmMember() {
      this.componentCheck = 2;
      this.addmember = true;
    },

    create_product_refresh() {
      this.productKey += 1;
    },

    create_db_refresh() {
      this.customerKey += 1;
    },

    handleSuccess({ results, header }) {
      // console.log(results, header);
      this.excelTableData = results;
      this.componentCheck = 2;
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
  },
};
</script>