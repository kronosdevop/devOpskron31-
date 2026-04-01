import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
  create_list_edit_bussinesstype
} from "@/graphql/mutations.js";

export const get_business_types = {
    data: () => ({
        masterBusinessTypes: [],
       
    }),
    methods: {
        async get_business_types() {
            try {
                let result = await API.graphql(
                  graphqlOperation(create_list_edit_bussinesstype, {
                    input: {
                      action_type: "LIST",
                    },
                  })
                );
                this.masterBusinessTypes = [];
                var response = JSON.parse(result.data.create_list_edit_bussinesstype);
                if (response.Status == "SUCCESS") {
                  this.masterBusinessTypes = response.data || [];
                }
              } catch (error) {
                //  console.log(error)
              }
        },
    }
}

