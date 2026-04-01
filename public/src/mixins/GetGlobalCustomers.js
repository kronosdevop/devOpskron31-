import { API, graphqlOperation } from "aws-amplify";
import { customer_function } from "@/graphql/mutations.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
export const get_global_customers = {
  data: () => ({
    masterCustomers: [],
  }),
  methods: {
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
    async get_global_customers() {
      try {
        let result = await API.graphql(
          graphqlOperation(customer_function, {
            input: {
              action_type: "LIST_CUSTOMER",
            },
          })
        );
        this.masterCustomers = [];
        var response = JSON.parse(result.data.customer_function);
        if (response.Status == "SUCCESS") {
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(
            response.url,
            details.s3_details
          );
          if (signedUrl) {
            let updatedCustomer = await this.fetch_S3_file(signedUrl);
            this.masterCustomers = updatedCustomer;
         
          }
        }
        console.log(this.masterCustomers);
      } catch (error) {}
    },
  },
};
