import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_forms_customs
} from "@/graphql/queries.js";

export const get_custom_forms = {
    data: () => ({
        customFormArrray: [],
       
    }),
    methods: {
        async get_custom_forms() {
          
            var data = this.$store.getters.GetUserObj;
            try {
              let result = await API.graphql(
                graphqlOperation(list_forms_customs, {
                  input: {
                    organization_id: data.organization.organization_id,
                 
                    limit: 200,
                    nextToken: null,
                  },
                })
              );
      
              this.customFormArrray = [];
           
              var response = JSON.parse(result.data.list_forms_customs);
              if (response.Status == "SUCCESS") {
                this.customFormArrray = response.data;
              } else {
                this.customFormArrray =[]
              }
            } catch (error) {
             this.customFormArrray =[];
            }
          },
    }
}