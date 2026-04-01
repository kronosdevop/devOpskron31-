import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    genrate_list_quotaions_bills
} from "@/graphql/mutations.js";

export const get_quotation_list = {
    data: () => ({
        quotationList: [],

    }),
    methods: {
        async get_quotation_list(val) {
            try {
                let result = await API.graphql(
                    graphqlOperation(genrate_list_quotaions_bills, {
                        input: {
                            action_type: "LIST",
                            type: val,
                        },
                    })
                );
                this.quotationList = [];
                var response = JSON.parse(result.data.genrate_list_quotaions_bills);
                if (response.Status == "SUCCESS") {
                    this.quotationList = response.data;
                    // console.log("project", this.quotationList)
                }
            } catch (error) {
                //  console.log(error)
            }
        },
    }
}