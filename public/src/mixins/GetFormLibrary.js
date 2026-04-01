import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_form_library
} from "@/graphql/queries.js";

export const get_all_from_libraries = {
    data: () => ({
          globalForms:[],
       
    }),
    methods: {
        async get_all_from_libraries() {
           
            
            try {
              let result = await API.graphql(
                graphqlOperation(list_form_library, {
                 
                    limit: 500,
                    nextToken: null,
                })
              );
            
              this.globalForms = [];
            
              var response = JSON.parse(result.data.list_form_library);
            //   console.log(response)
              this.globalForms = response.items;

            } catch (error) {
             this.globalForms =[];
             
            }
          },
    }
}