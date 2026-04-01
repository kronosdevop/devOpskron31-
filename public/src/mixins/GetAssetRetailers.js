import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    create_list_edit_delete_asset_retailers
} from "@/graphql/mutations.js";

export const get_asset_reatilers = {
    data: () => ({
        masterAssetRetailers: [],
        
    }),
    methods: {
        async get_asset_reatilers() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(create_list_edit_delete_asset_retailers, {
                    input: {
                      organization_id: data.organization.organization_id,
                       action_type: "LIST",
                      },
                  })
                );
                this.masterAssetRetailers =[];
                var response = JSON.parse(result.data.create_list_edit_delete_asset_retailers);
                if (response.Status == "SUCCESS") {
                this.masterAssetRetailers = response.data;
               
                }
              } catch (error) {
                //  console.log(error)
              }
        },
    }
}