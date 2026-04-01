import { API, graphqlOperation } from "aws-amplify";
import { list_items } from "@/graphql/queries";

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
                    graphqlOperation(list_items)
                );

                const resultData = JSON.parse(response.data.list_items);
                // console.log(resultData);
                if (resultData.Status == "SUCCESS") {
                    this.masterItems = resultData.data;

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
