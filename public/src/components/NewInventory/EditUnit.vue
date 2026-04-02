<template>
  <v-dialog :model-value="UnitEdit" persistent width="420" elevation="10" rounded="xl">

    <v-card class="unit-dialog" >

      <v-card-title class="dialog-header">

        <div class="header-left">
          <v-icon color="primary" size="20">mdi-scale-balance</v-icon>
          <span>Update Unit</span>
        </div>

        <v-btn icon variant="text" size="small" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>

      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="dialog-body">
    <v-text-field
          v-model="unit_name"
          label="Unit Name"
          variant="outlined"
          density="compact"
          hide-details
        />

      </v-card-text>

      <v-card-actions class="dialog-actions">

        <v-spacer></v-spacer>

        <v-btn
          color="primary"
          variant="flat"
          class="add-btn ml-2"
          density="compact"
          :loading="loading"
:disabled="!unit_name"
          @click="Update_units()"
        >
                 <v-icon>mdi-scale-balance</v-icon>

          Update Unit
        </v-btn>

      </v-card-actions>

    </v-card>

  </v-dialog>
</template>
<script>
    import {create_list_edit_delete_material_unit} from "@/graphql/mutations.js"
import { API, graphqlOperation } from "aws-amplify"
export default{
    props:{
        UnitEdit : Boolean,
        updatadata:Object,
    },
    data(){
        return{
         loading:false,
         unit_name : ""
        }
    },
    watch:{
        updatadata :{
            immediate: true,
            handler(val){
                if(val){
                this.unit_name = val.material_unit_name
                }
            }
        }
    },
    methods:{
        closeDialog(){
            this.$emit('close',0)
        },
        async Update_units(){
            this.loading = true
            try{
                const result = await API.graphql(
                    graphqlOperation(create_list_edit_delete_material_unit,{
                        input:{
                            action_type : "EDIT",
                             material_unit_id: this.updatadata?.material_unit_id,
                            material_unit_name : this.unit_name
                        }
                    })
                )
                const response = JSON.parse(result.data.create_list_edit_delete_material_unit)
                if(response.Status === "SUCCESS"){
        this.$emit("successMsg", response.Message)
        this.closeDialog()
                }
                else{
                    this.$emit("errorMsg", response.Message)
                }
            }
            catch(e){
                this.$emit("errorMsg", e.Message)
            }
            finally{
                this.loading = false
            }
        }
    }
}
</script>
<style scoped>

.unit-dialog{
border-radius:12px;
}


.dialog-header{
display:flex;
align-items:center;
justify-content:space-between;
padding:5px 10px;
font-size:16px;
font-weight:600;
}

.header-left{
display:flex;
align-items:center;
gap:8px;
}


.dialog-body{
padding:24px 20px;
}


.dialog-actions{
padding:0 20px 20px;
}

/* BUTTON */

.add-btn{
border-radius:8px;
text-transform:none;
font-weight:500;
}

</style>
