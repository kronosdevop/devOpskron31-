import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    asset_config_create_list_update_locations
} from "@/graphql/mutations.js";

export const get_asset_sub_location = {
    data: () => ({
        assetMasterLocations: [],
       
    }),
    methods: {
        async get_asset_sub_location() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(asset_config_create_list_update_locations, {
                    input: {
                        action_type:'LIST',
                        organization_id: data.organization.organization_id,
                      },
                  })
                );
                this.assetMasterLocations =[];
                var response = JSON.parse(result.data.asset_config_create_list_update_locations);
                if (response.Status == "SUCCESS") {
                this.assetMasterLocations = response.data;
                   
              
                }
              } catch (error) {
                //  console.log(error)
              }
        },
    }
}