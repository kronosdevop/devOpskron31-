import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_workflow_names
} from "@/graphql/queries.js";

export const get_all_workflows = {
    data: () => ({
        allOrgWorkflows: [],
       
    }),
    methods: {
        async get_all_workflows() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(list_workflow_names, {
                    input:{
                        organization_id: data.organization.organization_id,
                    }
                  })
                );
                this.allOrgWorkflows =[];
                var response = JSON.parse(result.data.list_workflow_names);
                if(response.Status == 'SUCCESS'){
                  this.allOrgWorkflows = response.data;
                }else{
                  this.allOrgWorkflows = [];
                } 
               
               
              } catch (error) {
                this.allOrgWorkflows =[];
                 
              }
        },
    }
}