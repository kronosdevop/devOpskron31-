import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
  create_list_edit_delete_asset_distributors
} from "@/graphql/mutations.js";

export const get_asset_distributors = {
    data: () => ({
        masterAssetDistributors: [],
       
    }),
    methods: {
        async get_asset_distributors() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(create_list_edit_delete_asset_distributors, {
                    input: {
                      organization_id: data.organization.organization_id,
                       action_type: "LIST",
                      },
                  })
                );
                this.masterAssetDistributors =[];
                var response = JSON.parse(result.data.create_list_edit_delete_asset_distributors);
                if (response.Status == "SUCCESS") {
                  this.masterAssetDistributors = response.data;
            
                }
              } catch (error) {
                //  console.log(error)
              }
        },
    }
}