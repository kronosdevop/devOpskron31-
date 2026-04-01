<template>
  <div>
    <v-card  flat>
      <v-toolbar  flat dense>
        <v-text-field
          outlined
          dense
          label="Search"
          style="max-width: 200px"
          v-model="searchlist"
          class="mt-6"
          append-icon="mdi-magnify"
        ></v-text-field>
        <v-spacer />
      </v-toolbar>
      <v-card-text>
        <v-data-table
          :headers="suppliereHeaders"
          :fixed-header="fixed"
          :items="filteredSuppliers"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 mt-n2 dtwidth"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              @click="updatetriggers(item)"
              x-small
              dark
              class="text-capitalize cardCss pa-1 mr-2"
            >
              triggers and template
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import { customer_function } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      searchlist: "",
      tableLoading: false,
      fixed: true,
      SnackBarComponent: {},
      customerRecords: [],
      suppliereHeaders: [
        {
          text: "Customer ID",
          value: "customer_display_id",
          sortable: false,
        },
        {
          text: "Customer Name",
          value: "legal_name",
          sortable: false,
        },
        {
          text: "Email ID",
          value: "customer_email_id",
          sortable: false,
        },
        // {
        //   text: "Contact No",
        //   value: "primary_contact_no",
        //   sortable: false,
        // },
        // {
        //   text: "Address",
        //   value: "address_line_1",
        //   sortable: false,
        // },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
    };
  },
  computed: {
    filteredSuppliers() {
      if (!this.searchlist) return this.customerRecords;

      const search = this.searchlist.toLowerCase();
      return this.customerRecords.filter((item) => {
        return Object.values(item)
          .filter((v) => v !== null && v !== undefined)
          .join(" ")
          .toLowerCase()
          .includes(search);
      });
    },
  },
  mounted() {
    this.$store.commit("SetcustomerData", {});
    this.fetch_customers();
  },
  methods: {
    updatetriggers(item) {
      this.$store.commit("SetcustomerData", item);
      this.$router.push("CustomerTemplates")
    
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
        console.error("Error fetching file:", error);

        this.errorMessage = "Error fetching file: " + error.message;
      } finally {
      }
    },
    async fetch_customers() {
      this.customerRecords = [];
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(customer_function, {
            input: {
              action_type: "LIST_CUSTOMER",
            },
          })
        );
        var response = JSON.parse(result.data.customer_function);

        if (response.Status == "SUCCESS") {
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

<style>
</style>