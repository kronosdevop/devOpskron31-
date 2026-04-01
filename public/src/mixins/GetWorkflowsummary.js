import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_workflow_details
} from "@/graphql/queries.js";

export const get_workflows = {
    data: () => ({
        summaryOrgWorkflows: [],
       
    }),
    methods: {
        async get_workflows() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(list_workflow_details, {
                    input:{
                        organization_id: data.organization.organization_id,
                    }
                  })
                );
                this.summaryOrgWorkflows =[];
                var response = JSON.parse(result.data.list_workflow_details);
                if(response.Status == 'SUCCESS'){
                   
                  this.summaryOrgWorkflows = response.data;
                }else{
                  this.summaryOrgWorkflows = [];
                } 
               
               
              } catch (error) {
                this.summaryOrgWorkflows =[];
                 
              }
        },
    }
}