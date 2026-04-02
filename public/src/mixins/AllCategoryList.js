import {inventory_categories_CRUD} from "@/graphql/mutations.js"
import {API , graphqlOperation} from "aws-amplify"

export const GetAllCategory = {
    data:() => ({
        listCategory : [],
    }),
    methods:{
        async GetCategoryListing(){
            try{
                const result = await API.graphql (
                    graphqlOperation(inventory_categories_CRUD , {
                        input:{
                             action_type: "LIST",
                        }
                    })
                  
                )
                  const response  = JSON.parse(result.data.inventory_categories_CRUD)
                  if(response.Status === "SUCCESS"){
                    this.listCategory = response.data
                  }
            }
            catch(err){
                console.error("API not Fetched",err)
                this.listCategory = []
            }
        }
    },
};