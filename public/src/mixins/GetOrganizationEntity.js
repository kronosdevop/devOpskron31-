import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    quotation_billing_entities
} from "@/graphql/mutations.js";

export const get_organization_entity = {
    data: () => ({
        entitylist: [],

    }),
    methods: {
        async get_organization_entity() {
            try {
                let result = await API.graphql(
                    graphqlOperation(quotation_billing_entities, {
                        input: {
                            action_type: "LIST",
                        },
                    })
                );
                this.entitylist = [];
                var response = JSON.parse(result.data.quotation_billing_entities);
                if (response.Status == "SUCCESS") {
                    this.entitylist = response.data;
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}