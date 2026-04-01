
import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_all_assets
} from "@/graphql/queries.js";

export const get_organization_untagged_assets = {
    data: () => ({
       allUntaggedAssets : [],
       
    }),
    methods: {
        async get_organization_untagged_assets() {
          
            var data = this.$store.getters.GetUserObj;
            try {
              let result = await API.graphql(
                graphqlOperation(list_all_assets, {
                  input: {
                   
                    organization_id: data.organization.organization_id,
                    asset_status:'ACTIVE',
                    // asset_tagged_status:'UNTAGGED',   
                    
                  },
                })
              );
              var response = JSON.parse(result.data.list_all_assets);
              this.allUntaggedAssets = [];
             
              if (response.Status == "SUCCESS") {
                this.allUntaggedAssets = response.data;
                
              } else {
                this.allUntaggedAssets = [];
                
              }
            } catch (error) {
              this.allUntaggedAssets = [];
              
            }
          },
    }
}

