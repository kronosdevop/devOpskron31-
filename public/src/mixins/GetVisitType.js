
import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_visittypes
} from "@/graphql/queries.js";

export const get_visit_type = {
    data: () => ({
        typeVist: [],

    }),
    methods: {
        async get_visit_type() {

            try {
                let result = await API.graphql(
                    graphqlOperation(list_visittypes, {

                    })
                );
                this.typeVist = [];
                var response = JSON.parse(result.data.list_visittypes);
                if (response.Status == "SUCCESS") {
                    this.typeVist = response.Data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}