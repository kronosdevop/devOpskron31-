<template>
    <div class="categorioes-container">
<v-card flat class="pa-4 pb-6 full-width-card">                <v-row>
                <v-col>
                    <v-text-field variant="outlined" density="compact" label="Search Categories" class="mr-4 mt-2 search"
                     v-model="search"   style="max-width:250px" preprend-inner-icon="mdi-magnify" clearable />
                </v-col>
                <v-spacer/>
                <v-col>
                    <v-btn
          class="text-capitalize cardCss white--text mr-2 mt-4 add"
          size="small"
          @click="AddDialog"
        >
          <v-icon start>mdi-plus</v-icon>
          Add Category
        </v-btn>
                </v-col>
            </v-row>
<div class="cards-scroll-container">

            <v-row class="mt-4" dense>
         <v-col
  v-for="item in paginatedItem"
  :key="item.id"
  cols="12"
>
                <v-card class="category-card pa-4" elevation="2">
                    <div class="d-flex align-center">
                        <div>
                            <v-icon size="28" color="grey-darken-1">
                                mdi-shape-outline
                            </v-icon>
                        </div>
                        <div class="ml-4 flex-grow-1">
                            <div class="category-title">
                                {{ item.category_name }}
                            </div>

                        <div class="category-meta">
                            Created By {{ item.created_by }}

                        </div>
                        </div>
                        <div class="d-flex align-center">
                                 <v-icon
            size="18"
            color="blue"
            class="mr-3 cursor-pointer"
          >
            mdi-pencil
          </v-icon>

          <v-icon
            size="18"
            color="red"
            class="cursor-pointer"
          >
            mdi-delete
          </v-icon>
                        </div>
                    </div>

                </v-card>

                </v-col>

            </v-row>
        </div>

            <!-- <v-data-table
            :headers="headers"
            :items="CategoryItems"
            :loading="loading"
            :search="search"
            class="moder-data-table"
            density="compact"
            hover
            >
            <template #item.action="{item}">
                <v-icon size="small" color="green">
                    mdi-pencil
                </v-icon>

                <v-icon size="small" color="red">
                    mdi-delete
                </v-icon>
            </template>
         </v-data-table> -->
         <v-row class="mt-6 justify-center">
  <div class="pagination-container">

    <v-btn
      variant="outlined"
      size="small"
      :disabled="currentPage === 1"
      @click="currentPage--"
    >
      Previous
    </v-btn>

    <span class="page-text">
      Page {{ currentPage }} of {{ totalPages }}
    </span>

    <v-btn
      variant="outlined"
      size="small"
      :disabled="currentPage >= totalPages"
      @click="currentPage++"
    >
      Next
    </v-btn>

  </div>
</v-row>
        </v-card>

      
<AddCategory :CategoryAdd="CategoryAdd" 
@close="CategoryAdd = false"  v-on:successMsg="success_info"
v-on:errorMsg = "error_info"
/>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    </div>
</template>
<script>
import {inventory_categories_CRUD } from "@/graphql/mutations.js"
import {API , graphqlOperation} from "aws-amplify"
import AddCategory from "@/components/NewInventory/AddCategory.vue";
import SnackBar from "@/components/SnackBar.vue";

export default{
    components:{
           SnackBar,
    AddCategory
    },
    data(){
        return{
            search:"",
            loading:false,
                  SnackBarComponent: {},
           currentPage:1,
    itemsPerPage:12,
            CategoryItems:[],
            CategoryAdd : false
          
        }
    },
    computed:{
     paginatedItem(){
        const start = (this.currentPage - 1) * this.itemsPerPage
        const end = start + this.itemsPerPage
        return this.CategoryItems.slice(start, end)
     },
     totalPages(){
        return Math.ceil(this.CategoryItems.length/ this.itemsPerPage)
     }
    },
    mounted(){
          this.fetch_category()
    },
    methods:{

        async fetch_category(){
            this.loading = true
            try{
                const response = await API.graphql(
                    graphqlOperation(inventory_categories_CRUD ,{
                        input:{
                            action_type :"LIST"
                        }       
                    })
                )
                const res = JSON.parse(response.data.inventory_categories_CRUD )
                    if(res.Status === "SUCCESS"){
                        this.CategoryItems = res.data
                    }
                    else{
                        console.error("not able to fetch the category list")
                    }
            console.log("res",response)
            
            }catch(error){
                console.log("error",error)
            }
            finally{
                this.loading = false
            }
        },
        AddDialog(){
            this.CategoryAdd = true
        },
        success_info(msg){
            this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor : "green",
                SnackbarText : msg,
                timeout:4000,
                Top: true,
            }
            this.CategoryAdd = false;
            this.fetch_category();
        },

        error_info(msg){
            this.SnackBarComponent = {
                SnackbarVmodel: true,
                Snackbarcolor :"red",
                 SnackbarText: msg,
        timeout: 4000,
        Top: true,
            }
        }
    }


}
</script>

<style scoped>
.category-card{
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
}

.category-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.08);
}

.card-content{
  display:flex;
  align-items:center;
}

.icon-box{
  width:42px;
  height:42px;
  border-radius:10px;
  background:#f3f4f6;
  display:flex;
  align-items:center;
  justify-content:center;
}

.category-info{
  flex:1;
  margin-left:14px;
}

.category-title{
  font-size:15px;
  font-weight:600;
}

.category-meta{
  font-size:12px;
  color:#6b7280;
}

.card-actions{
  display:flex;
  gap:14px;
  cursor:pointer;
}

.action-btn {
  background: #db4c77 !important;
  color: white !important;
}
.search{
    margin-top: -50%;
}
.pagination-container{
  display:flex;
  align-items:center;
  gap:16px;
}

.page-text{
  font-size:14px;
  font-weight:500;
}
.full-width-card{
  width:100%;
}
.cards-scroll-container{
  max-height: 450px;
  overflow-y: auto;
  padding-right: 6px;
}
</style>