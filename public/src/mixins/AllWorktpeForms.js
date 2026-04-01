import {list_worktype_forms} from '@/graphql/queries.js'
import {API, graphqlOperation} from 'aws-amplify'

export const Form_List = {
    data: () => ({
         formList: [], 
    }),
    methods: {
          async fetchForms(){
            try{
                let result = await API.graphql(
                    graphqlOperation(list_worktype_forms , {
                        input:{

                        },
                    })
                )
  var response = JSON.parse(result.data.list_worktype_forms)   
  if(response.Status === "SUCCESS"){
 this.formList = response.worktype_forms;  }             
            }
            catch(e){
                console.log("error",e)
            }
        }
    },
}