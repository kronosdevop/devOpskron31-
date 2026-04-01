import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_all_departments
} from "@/graphql/queries.js";

export const get_department_details = {
    data: () => ({
        departmentList: [],
       
    }),
    methods: {
        async get_department_details() {
        
           
            var data = this.$store.getters.GetUserObj;
            try {
              let result = await API.graphql(
                graphqlOperation(list_all_departments, {
                    organization_id: data.organization.organization_id,
                    department_status: "ACTIVE",
                    limit: 500,
                    next_token: null,
                })
              );
             
      this.departmentList =[];
              var response = result.data.list_all_departments;
      
              this.departmentList = response.details;
            } catch (error) {
                this.departmentList =[];
            }
        },
    }
}