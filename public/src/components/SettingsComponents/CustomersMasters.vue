<template>
  <div>
    <v-card flat>
      <v-toolbar class="mt-n1" flat dense>
        <v-spacer />
        <v-btn dark @click="add_supp()" class="text-capitalize cardCss">
          Add
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="suppliereHeaders"
          :fixed-header="fixed"
          :items="customerRecords"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 mt-n2 dtwidth"
        >
          <template v-slot:[`item.timesheet_created_on`]="{ item }">
            <span v-text="get_date(item.timesheet_created_on * 1000)"></span>
          </template>
          <template v-slot:[`item.customer_contact_number`]="{ item }">
            <span>{{
              item.customer_contact_number == null
                ? "N/A"
                : item.customer_country_code +
                  " " +
                  item.customer_contact_number
            }}</span>
          </template>
          <template v-slot:[`item.customer_email_id`]="{ item }">
            <span>{{
              item.customer_email_id == null ||
              item.customer_email_id == undefined
                ? "N/A"
                : item.customer_email_id
            }}</span>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              color="red"
              class="mr-2"
              small
              @click="open_editdailog(item)"
              >mdi-pencil</v-icon
            >
            <v-icon color="red" small @click="open_deletedailog(item)"
              >mdi-delete</v-icon
            >
          </template>
          <template v-slot:[`item.suppliers_address`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div v-on="on">
                  {{
                    item.suppliers_address.length >= 10
                      ? item.suppliers_address.substr(0, 10) + "..."
                      : item.suppliers_address
                  }}
                </div>
              </template>
              <div class="textWrap" style="max-width: 250px">
                {{ item.suppliers_address }}
              </div>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeleteCustomer
        :customerDeletion="customerDeletion"
        @clicked="customerDeletion = false"
        :customerItem="customerItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditCustomers
        :customerEdit="customerEdit"
        @clicked="customerEdit = false"
        :customerItem="customerItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AddCustomer
        :customerAdding="customerAdding"
        @clicked="customerAdding = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
      <script>
/*eslint-disable*/
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import EditCustomers from "@/components/SettingsDialogs/EditCustomers.vue";
import SnackBar from "@/components/SnackBar.vue";
import DeleteCustomer from "@/components/SettingsDialogs/DeleteCustomer.vue";
import AddCustomer from "@/components/SettingsDialogs/AddCustomer.vue";
import { customer_function } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  components: {
    SnackBar,
    DeleteCustomer,
    EditCustomers,
    AddCustomer,
  },
  data() {
    return {
      SnackBarComponent: {},
      customerDeletion: false,
      customerEdit: false,
      tableLoading: false,
      componentCheck: 0,
      suppliereHeaders: [
        {
          text: "Name",
          value: "customer_name",
          sortable: false,
        },

        // {
        //   text: "Contact Name",
        //   value: "customer_contact_name",
        //   sortable: false,
        // },
        {
          text: "Email ID",
          value: "customer_email_id",
          sortable: false,
        },
        {
          text: "Contact No",
          value: "customer_contact_number",
          sortable: false,
        },
        {
          text: "Address",
          value: "customer_address",
          sortable: false,
        },

        { text: "Actions", value: "actions", sortable: false },
      ],
      customerRecords: [],
      fixed: false,
      customerItem: {},
      customerAdding: false,
    };
  },
  computed: {},
  async created() {
    await this.fetch_customers();
  },
  methods: {
    add_supp() {
      this.componentCheck = 3;
      this.customerAdding = true;
    },

    get_date(val) {
      const d = new Date(parseInt(val));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "/" +
        (+month <= 9 ? "0" + month : month) +
        "/" +
        year
      );
    },

    open_deletedailog(item) {
      this.componentCheck = 1;
      this.customerDeletion = true;
      this.customerItem = item;
    },

    open_editdailog(item) {
      this.componentCheck = 2;
      this.customerEdit = true;
      this.customerItem = item;
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
      this.customerDeletion = false;
      this.customerEdit = false;
      this.customerAdding = false;
      this.fetch_customers();
    },
    async fetch_S3_file(value) {
      let responseData = null;
      let data = null;

      try {
        const response = await fetch(value);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch the file: ${response.statusText} (Status Code: ${response.status})`
          );
        }

        if (
          !response.headers.get("Content-Type").includes("application/json")
        ) {
          throw new Error("The file is not in JSON format");
        }

        responseData = await response.text();

        try {
          data = JSON.parse(responseData);
        } catch (jsonError) {
          throw new Error("Error parsing JSON response: " + jsonError.message);
        }

        return data;
      } catch (error) {
        // Log the error details for debugging
        console.error("Error fetching file:", error);

        // Set a user-friendly error message
        this.errorMessage = "Error fetching file: " + error.message;
      } finally {
        // Optional: Reset loading state or other final actions
        // this.loading = false;
      }
    },
    async fetch_customers() {
      this.tableLoading = true;
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(customer_function, {
            input: {
              action_type: "LIST_CUSTOMER",
            },
          })
        );
        var response = JSON.parse(result.data.customer_function);
        this.customerRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          // this.customerRecords = response.data;

          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          if (signedUrl) {
            let updatedCustomer = await this.fetch_S3_file(signedUrl);
            this.customerRecords = updatedCustomer;
          }

          this.tableLoading = false;
        } else {
          this.customerRecords = [];

          this.tableLoading = false;
        }
      } catch (error) {
        // console.log(error);
        this.customerRecords = [];

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