import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_all_designation
} from "@/graphql/queries.js";

export const get_designations_details = {
    data: () => ({
        designationList: [],
       
    }),
    methods: {
        async get_designations_details() {
        
           
            var data = this.$store.getters.GetUserObj;
            try {
              let result = await API.graphql(
                graphqlOperation(list_all_designation, {
                    organization_id: data.organization.organization_id,
                    designation_status: "ACTIVE",
                    limit: 500,
                    next_token: null,
                })
              );
             
      this.designationList =[];
              var response = JSON.parse(result.data.list_all_designation);
      
              this.designationList = response.details;
            } catch (error) {
                this.designationList =[];
            }
        },
    }
}