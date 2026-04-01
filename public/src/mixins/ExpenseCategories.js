
/*eslint-disable*/
import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_expense_category
} from "@/graphql/queries.js";

export const get_expense_categories = {
    data: () => ({
        expenseCategoriesArray: [],
       
    }),
    methods: {
        async get_expense_categories() {
           
            var data = this.$store.getters.GetUserObj;
        
            try {
              let result = await API.graphql(
                graphqlOperation(list_expense_category, {
                  input: {
                    organization_id: data.organization.organization_id,
                    nextToken: null,
                    limit: 100,
                  },
                })
              );
        
            
              this.expenseCategoriesArray = [];
        
              var response = JSON.parse(result.data.list_expense_category);
            
        
              if (response.Status == "SUCCESS") {
                this.expenseCategoriesArray = response.data;
              } 
            } catch (error) {
             
            }
          },
    }
}


