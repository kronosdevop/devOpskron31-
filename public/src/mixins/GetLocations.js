import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_all_locations
} from "@/graphql/queries.js";

export const get_location_details = {
    data: () => ({
        locationList: [],
       
    }),
    methods: {
        async get_location_details() {
        
           
            var data = this.$store.getters.GetUserObj;
            try {
              let result = await API.graphql(
                graphqlOperation(list_all_locations, {
                  organization_id: data.organization.organization_id,
                  location_status: "ACTIVE",
                  limit: 500,
                  next_token: null,
                })
              );
             
                this.locationList =[];
              var response = result.data.list_all_locations;
      
              this.locationList = response.details;
            } catch (error) {
                this.locationList =[];
            }
        },
    }
}