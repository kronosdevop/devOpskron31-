import {create_list_edit_delete_material_unit} from "@/graphql/mutations.js";
import {API, graphqlOperation} from "aws-amplify"

export const GetUnitList = {
    data:()=> ({
        unitList :[]
    }) ,
    methods: {
        async GetUnitList(){
            try{
                const result = await API.graphql(
                    graphqlOperation(create_list_edit_delete_material_unit,{
                        input:{
                            action_type: "LIST",
                        }
                    })
                )
                const response = JSON.parse(result.data.create_list_edit_delete_material_unit)
                if(response.Status === "SUCCESS"){
                    this.unitList = response.data
                } 
            }
            catch(e){
                console.log("error",e)
                this.unitList = []
            }
        }
    },
}