import {
    API,
    graphqlOperation
} from "aws-amplify";
import {
    list_products
} from "@/graphql/queries.js";

export const get_product_service_list = {
    data: () => ({
        productListArray: [],
       
    }),
    methods: {
        async get_product_service_list() {
            var data = this.$store.getters.GetUserObj;
            try {
                let result = await API.graphql(
                  graphqlOperation(list_products, {
                    // input:{
                      organization_id: data.organization.organization_id,
                      limit: 100,
                      nextToken: null,
                    // }
                  })
                );
                this.productListArray =[];
                var response = JSON.parse(result.data.list_products);
                
               this.productListArray = response.items;
                
              } catch (error) {
                this.productListArray =[];
                
              }
        },
    }
}