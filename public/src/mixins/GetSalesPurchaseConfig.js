import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_organization_sale_purchase_config
} from "@/graphql/queries.js";

export const get_sales_purchase_config = {
    data: () => ({
        salesPurchaseConfig: [],
    }),
    methods: {
        async get_sales_purchase_config() {
            try {
                let result = await API.graphql(
                    graphqlOperation(list_organization_sale_purchase_config)
                );
                this.salesPurchaseConfig = [];
                var response = JSON.parse(result.data.list_organization_sale_purchase_config);
                if (response.Status == "SUCCESS") {
                    this.salesPurchaseConfig = response.data;
                }
                // console.log('Sales Purchase Config:', this.salesPurchaseConfig);
            } catch (error) {
                console.error('Error fetching sales purchase config:', error);
            }
        },
    }
}
