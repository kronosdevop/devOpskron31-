import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    get_particular_workflow_details
} from "@/graphql/queries.js";

export const get_workflow_payload = {
    data: () => ({
          workflowInfoPaylod:{},
       
    }),
    methods: {
        async get_workflow_payload() {
           
           
            try {
              let result = await API.graphql(
                graphqlOperation(get_particular_workflow_details, {
                    input: {
                        initiate_id: this.$store.getters.GetInitiatorId
                      },
                })
              );
            
              var response = JSON.parse(result.data.get_particular_workflow_details);
            
              this.workflowInfoPaylod ={};
              if (response.Status == "SUCCESS") {
               
                this.workflowInfoPaylod = response.workflow[0];
                
              }
            } catch (error) {
             this.workflowInfoPaylod =[];
             
            }
          },
    }
}