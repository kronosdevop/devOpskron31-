import { API, graphqlOperation } from "aws-amplify";
import { inventory_products_CRUD } from "@/graphql/mutations.js"

export const get_inventory_items = {
    data() {
        return {
            masterItems: [],
            itemsLoading: false,
        };
    },

    methods: {
        async get_inventory_items() {
            this.itemsLoading = true;
            try {
                    const response = await API.graphql(
          graphqlOperation(inventory_products_CRUD, {
            input: {
              action_type: "LIST",
            },
          }),
                );

                const resultData = JSON.parse(response.data.inventory_products_CRUD);
                // console.log(resultData);
                if (resultData.Status == "SUCCESS") {
  this.masterItems = resultData.data.map(item => ({
    ...item,
    item_name: item.product_name,   // ✅ fix mapping
    item_id: item.product_id
  }))
} else {
                    this.masterItems = [];
                }
            } catch (error) {
                console.error("Error fetching inventory items:", error);
                this.masterItems = [];
            } finally {
                this.itemsLoading = false;
            }
        },
    },
};
