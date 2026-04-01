import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_membership
} from "@/graphql/queries.js";

export const get_member_details = {
    data: () => ({
        membershipDeatils: [],
       
    }),
    methods: {
        async get_member_details() {
        
           
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                    graphqlOperation(list_membership, {
                      input: {
                        organization_id: data.organization.organization_id,
                        limit: 100,
                        nextToken: null,
                      },
                    })
                  );
             
             this.membershipDeatils =[];
             var response = JSON.parse(result.data.list_membership);
      
             if (response.Status == "SUCCESS") {
                this.membershipDeatils = response.data;
                
              }
            } catch (error) {
                this.membershipDeatils =[];
            }
        },
    }
}