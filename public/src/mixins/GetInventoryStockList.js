import {
    API,
    graphqlOperation
} from "aws-amplify";
import { 
    List_product_stock 
} from "@/graphql/queries.js";

export const get_Inventory_StockList = {
    data: () => ({
        InventotyStockList: {},
    }),
    methods: {
        async get_Inventory_StockList() {

            try {
                let result = await API.graphql(
                    graphqlOperation(List_product_stock, {
                        input: {
                            sub_category_id: "ALL",
                            nextToken: this.nextToken,
                            limit: 100,
                            location_id:"ALL",
                            sub_category_stock_status:"ALL",
                        },
                    })
                );
                var response = JSON.parse(result.data.List_product_stock);
                if (response.Status == "SUCCESS") {
                    this.InventotyStockList = response;
                }
            }catch (error) {
                console.error(error);
            }
        },
    }
}