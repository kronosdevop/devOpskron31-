import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
  leave_reamaining_counts
} from "@/graphql/queries";

export const get_leftout_leaves = {
    data: () => ({
        masterLeaves: [],
       
    }),
    methods: {
        async get_leftout_leaves() {
            var data = this.$store.getters.GetUserObj;
            const currentDate = new Date();
           
            try {
                let result = await API.graphql(
                  graphqlOperation(leave_reamaining_counts, {
                    input: {
                       leave_year: currentDate.getFullYear(),
                        organization_id: data.organization.organization_id,
                        user_id:data.user.user_id
                      },
                  })
                );
                this.masterLeaves =[]; 
                var response = JSON.parse(result.data.leave_reamaining_counts);
                  
                if (response.Status == "SUCCESS") {
                  // this.masterLeaves =
                  this.masterLeaves = response.data;
                  //   response.data[0].leave_types == undefined
                  //     ? []
                  //     : response.data[0].leave_types;
                
                }else{
                   this.masterLeaves =[]; 
                }
                
              } catch (error) {
                this.masterLeaves =[];
                
              }
        },
    }
}