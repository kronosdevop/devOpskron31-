<template>
    <div class="categorioes-container">
      <v-card flat class="ma-4 category-card-container">

  <v-row>
 

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

  <!-- Table Container -->
  <div class="table-container">

    <v-data-table
      :headers="headers"
      :items="sortedAndPaginatedItems"
      :loading="loading"
      class="modern-data-table"
      density="compact"
      hover
      hide-default-footer
      height="420"
    >
      <template #item.action="{item}">
        <v-icon size="small" color="green" @click="EditDialog(item)">
          mdi-pencil
        </v-icon>

        <v-icon size="small" color="red" @click="DeleteDialog(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

  </div>

  <!-- Footer -->
  <div class="table-footer">
    <div class="footer-info">
      {{
        filteredItems.length === 0
          ? "No Results"
          : `Showing ${sortedAndPaginatedItems.length} of ${filteredItems.length} Categories`
      }}
    </div>

    <div class="pagination-controls">
      <v-btn
        :disabled="currentPage === 1"
        variant="text"
        size="small"
        @click="currentPage--"
      >
        Previous
      </v-btn>

      <div class="page-numbers">
        <v-btn
          v-for="page in visiblePages"
          :key="page"
          size="small"
          color="primary"
          @click="currentPage = page"
        >
          {{ page }}
        </v-btn>
      </div>

      <v-btn
        :disabled="currentPage === pageCount"
        variant="text"
        size="small"
        @click="currentPage++"
      >
        Next
      </v-btn>
    </div>
  </div>

</v-card>
<AddCategory :CategoryAdd="CategoryAdd" 
@close="CategoryAdd = false"  @successMsg="success_info"
@errorMsg = "error_info"
/>

<EditCategory :CategoryEdit="CategoryEdit" :updatedata="updatedata"
@close="CategoryEdit = false"  @successMsg="success_info"
@errorMsg = "error_info" />

<DeleteCategory :CategoryDelete = "CategoryDelete" @close="CategoryDelete = false"
      :deletedata = "deletedata"
       @successMsg="success_info"
@errorMsg = "error_info"/>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    </div>
</template>
<script>
import {inventory_categories_CRUD} from "@/graphql/mutations.js"
import {API , graphqlOperation} from "aws-amplify"
import AddCategory from "@/components/NewInventory/AddCategory.vue";
import SnackBar from "@/components/SnackBar.vue";
import EditCategory from "@/components/NewInventory/EditCategory.vue";
import DeleteCategory from "@/components/NewInventory/DeleteCategory.vue";



export default{
    components:{
           SnackBar,
    AddCategory,
    EditCategory,
    DeleteCategory
    },
    props:{
      searchvalue : String,
    },
    data(){
        return{
                  totalItems: 0,
                    currentPage: 1,
                        height: 0,
                        itemsPerPage: 20,
            
            loading:false,
                  SnackBarComponent: {},
            headers:[
                {
                    title:'Category Name' , value:"category_name" 
                },
                {
                 title:"Created-By", value:"created_by"
                },
                {title:"Action", value:"action"}
            ],
            CategoryItems:[],
            CategoryAdd : false,
            CategoryEdit: false,
            updatedata :{},
            deletedata:{},
            CategoryDelete : false,

          
        }
    },
    mounted(){
          this.fetch_category()
    },
    computed: {

  filteredItems() {
    const text = (this.searchvalue || "").toLowerCase()

    return this.CategoryItems.filter(item =>
      item.category_name?.toLowerCase().includes(text) ||
      item.created_by?.toLowerCase().includes(text)
    )
  },

  sortedAndPaginatedItems() {

    const sorted = this.filteredItems.slice().sort((a,b)=>{
      return (a.category_name || "").localeCompare(b.category_name || "")
    })

    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage

    return sorted.slice(start,end)
  },

  pageCount(){
    return Math.ceil(this.filteredItems.length / this.itemsPerPage)
  },

  visiblePages(){

    const totalPages = this.pageCount
    const current = this.currentPage
    const delta = 2

    let start = Math.max(1,current-delta)
    let end = Math.min(totalPages,current+delta)

    if(end-start < 4){
      if(start===1){
        end = Math.min(totalPages,start+4)
      }else{
        start = Math.max(1,end-4)
      }
    }

    const pages=[]
    for(let i=start;i<=end;i++){
      pages.push(i)
    }

    return pages
  }

},  
methods:{

        async fetch_category(){
            this.loading = true
            try{
                const response = await API.graphql(
                    graphqlOperation(inventory_categories_CRUD,{
                        input:{
                            action_type :"LIST"
                        }       
                    })
                )
                const res = JSON.parse(response.data.inventory_categories_CRUD)
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
            this.CategoryAdd = false
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
        },
        EditDialog(item){
          this.CategoryEdit = true
          this.updatedata = item;
        },
        DeleteDialog(item){
          this.CategoryDelete = true
          this.deletedata = item
        }
    }


}
</script>

<style scoped>
.add{
    margin-left: 87%;
    margin-bottom: 20px;
}
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

.action-btn {
  background: #db4c77 !important;
  color: white !important;
}
.search{
    margin-top: -50%;
}
</style>