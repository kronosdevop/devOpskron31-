import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_workflow_roles
} from "@/graphql/queries.js";

export const get_workflow_roles = {
    data: () => ({
          worflowRoles:[],
       
    }),
    methods: {
        async get_workflow_roles() {
           
            var data = this.$store.getters.GetUserObj;
            try {
              let result = await API.graphql(
                graphqlOperation(list_workflow_roles, {
                  organization_id: data.organization.organization_id,
                  workflow_role_status: "ACTIVE",
                  limit: 500,
                  next_token: null,
                })
              );
            
              this.worflowRoles = [];
            
              var response = result.data.list_workflow_roles;
              this.worflowRoles = response.details;
            } catch (error) {
             this.worflowRoles =[];
             
            }
          },
    }
}