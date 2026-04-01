import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    aseet_suppliers
} from "@/graphql/mutations.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
export const get_all_org_suppliers = {
    data: () => ({
        orgSupplier: [],

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
        async get_all_org_suppliers() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(aseet_suppliers, {
                        input: {
                            user_email_id: data.user.user_email_id,
                            action_type: "LIST_SUPPLIER",
                        }


                    })
                );
                this.orgSupplier = [];
                var response = JSON.parse(result.data.aseet_suppliers);
                if (response.Status == "SUCCESS") {
                    const details = this.$store.getters.GetOrgDetails;
                    const signedUrl = await getS3SignedUrl(
                        response.url,
                        details.s3_details
                    );
                    if (signedUrl) {
                        let updatedCustomer = await this.fetch_S3_file(signedUrl);
                        this.orgSupplier = updatedCustomer;

                    }
                }


            } catch (error) {
                //  console.log(error)
            }
        },
    }
}