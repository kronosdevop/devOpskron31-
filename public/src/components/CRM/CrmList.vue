<template>
  <div>
    <v-card flat>
      <v-toolbar dense flat>
        <!-- <v-toolbar-title>Customer Relationship Management (CRM)</v-toolbar-title> -->
        <v-text-field
          v-model="search"
          label="Search"
          outlined
          placeholder="Min 3 Character"
          class="ml-3"
          style="max-width: 200px"
          append-icon="mdi-magnify"
          dense
        />
        <v-spacer />
        <v-btn
          dark
          small
          @click="createCrmMember()"
          class="text-capitalize cardCss mt-n2"
          >Add</v-btn
        >
        <v-menu offset-y>
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
            <v-list-item align="left">
              <v-list-item-icon>
                <v-icon color="primaryColor">mdi-download</v-icon>
              </v-list-item-icon>
              <div class="text-left">Download Template</div>
            </v-list-item>
            <v-divider />
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="primaryColor">mdi-import</v-icon>
                <BulkIndex
                  :on-success="handleSuccess"
                  :before-upload="beforeUpload"
                />
              </v-list-item-icon>

              <!-- <v-list-item-title>Import Excel</v-list-item-title> -->
            </v-list-item>
          </v-list>
        </v-menu>
        <!-- <v-btn
          dark
          small
          @click="createCrmMember()"
          class="text-capitalize cardCss ml-2 mt-n2"
          >Actions</v-btn
        > -->
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :items="tableData"
          :search="search"
          :loading="tableLoading"
          :items-per-page="10"
          :sort-by="['from_duration']"
          dense
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.customer_created_on`]="{ item }">
            <span v-text="get_date(item.customer_created_on)"></span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentcheck == 1">
      <CreateCrm
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
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import CreateCrm from "@/components/CRM/Popups/CreateCrm.vue";
// import { list_crm_details } from "@/graphql/queries.js";
// import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import BulkIndex from "@/components/CRM/BulkIndex.vue";
import BulkUpload from "@/components/CRM/Popups/BulkUpload.vue";

export default {
  components: {
    SnackBar,
    CreateCrm,
    BulkIndex,
    BulkUpload,
  },
  data() {
    return {
      height: 0,
      fixed: true,
      tableData: [],
      SnackBarComponent: {},
      addmember: false,
      componentcheck: 0,
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
          value: "full_contact_number",
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

        // {
        //   text: "Product Name",
        //   value: "customer_created_by",
        //   sortable: false,
        // },
      ],
    };
  },
  created() {
    this.height = window.innerHeight - 290;
    this.fetch_crm_list();
  },
  watch: {
    search() {
      if (this.search != "") {
        if (this.search.length >= 3) {
          this.fetch_crm_list();
        }
      } else {
        this.fetch_crm_list();
      }
    },
  },
  methods: {
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
      this.fetch_crm_list();
    },

    handleSuccess({ results, header }) {
      this.excelTableData = results;
      this.componentcheck = 2;

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

    back_call() {
      this.$router.push("/UserlevelApp");
    },
    createCrmMember() {
      this.componentcheck = 1;
      this.addmember = true;
    },

    async fetch_crm_list() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_crm_details, {
            input: {
              organization_id: data.organization.organization_id,
              limit: 100,
              nextToken: null,
              customer_name_search: this.search,
            },
          })
        );
        this.tableLoading = false;

        // this.tableData
        var response = JSON.parse(result.data.list_crm_details);
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

    import_data() {
      this.importDialog = true;
      this.componentcheck = 2;
    },
  },
};
</script>

<style>
</style>