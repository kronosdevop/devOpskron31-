
import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_territories
} from "@/graphql/queries.js";

export const get_visit_terittory = {
    data: () => ({
        visitTerittory: [],

    }),
    methods: {
        async get_visit_terittory() {

            try {
                let result = await API.graphql(
                    graphqlOperation(list_territories, {

                    })
                );
                this.visitTerittory = [];
                var response = JSON.parse(result.data.list_territories);
                if (response.Status == "SUCCESS") {
                    this.visitTerittory = response.Data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}