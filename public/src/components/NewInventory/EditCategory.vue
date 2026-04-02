<template>
  <v-dialog :model-value="CategoryEdit" persistent max-width="420">
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center px-4 py-3">
        <v-icon color="black" class="mr-2"> mdi-shape-outline </v-icon>

        <span class="text-h6 font-weight-medium"> Update Category </span>

        <v-spacer></v-spacer>

        <v-btn icon variant="text" size="small" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <v-text-field
        v-model="Categoryname"
          label="Category Name"
          variant="outlined"
          density="comfortable"
            :rules="[v => !!v || 'Category name required']"

        />
   <v-textarea
   v-model="description"
        label="Category Description"
           variant="outlined"
          density="comfortable"
          class="mt-2"
          counter="500"
          maxlength="500"
          :rules = "[v => !!v || 'Category Description required']"
        />
   
      </v-card-text>
  
      <v-card-actions class="px-4 pb-4">
        <v-spacer></v-spacer>


        <v-btn color="primary" variant="flat" @click="EditCategory"  class="ml-2" :loading="loading"
  :disabled="loading"> 
            <v-icon > mdi-shape-outline </v-icon>

   Update Category </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { graphqlOperation, API } from 'aws-amplify';
import {inventory_categories_CRUD} from "@/graphql/mutations.js"

export default {
  name: "CategoryEditDialog",

  props: {
    CategoryEdit: {
      type: Boolean,
      default: false,
    },
    updatedata: Object
  },
  data(){
    return{
        Categoryname:"",
        description:"",
         loading:false

    }
  },
  watch:{
 updatedata:{
    immediate: true,
    handler(val){
        if(val){
            this.Categoryname = val.category_name
            this.description = val.category_description
        }
    }
 }
  },
 

  methods: {
    closeDialog() {
      this.$emit("close", 0);
    },

    async EditCategory(){
      this.loading = true
         try{
           const result = await API.graphql(
            graphqlOperation(inventory_categories_CRUD,{
                input:{
                    action_type :"UPDATE",
                    category_id : this.updatedata.category_id,
                    category_name : this.Categoryname,
                    category_description : this.description    
                }
            })
        )
        const response = JSON.parse(result.data.inventory_categories_CRUD);
    if(response.Status === "SUCCESS"){
        this.$emit("successMsg", response.Message)
          this.Categoryname = ""
      this.description = ""

      this.closeDialog()
    }
    else{
         this.$emit("errorMsg", response.Message);
    }

    }
    catch(err){
              this.$emit("errorMsg", err.Message);
   
    }
    finally{
      this.loading = false
    }
         }
        
  },
};
</script>
