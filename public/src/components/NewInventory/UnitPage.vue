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
        Add Units
      </v-btn>
    </v-col>
  </v-row>

  <!-- Table Container -->
  <div class="table-container">
<v-data-table
  :headers="headers"
  :items="paginatedItems"
  :loading="loading"
  class="modern-data-table"
  density="compact"
  hover
  hide-default-footer
  height="420"
  :items-per-page="10"
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

  <!-- LEFT TEXT -->
  <div class="footer-info">
    {{
      filteredItems.length === 0
        ? "No Units"
        : `Showing ${paginatedItems.length} of ${filteredItems.length} Units`
    }}
  </div>

  <!-- RIGHT PAGINATION -->
  <div class="pagination-controls">

    <v-btn
      variant="text"
      size="small"
      class="pagination-btn"
      :disabled="currentPage === 1"
      @click="currentPage--"
    >
      Previous
    </v-btn>

    <v-btn
      v-for="page in visiblePages"
      :key="page"
      size="small"
      class="page-btn"
      :class="{ 'active-page': page === currentPage }"
      @click="currentPage = page"
    >
      {{ page }}
    </v-btn>

    <v-btn
      variant="text"
      size="small"
      class="pagination-btn"
      :disabled="currentPage === pageCount"
      @click="currentPage++"
    >
      Next
    </v-btn>

  </div>

</div>

</v-card>
<AddUnits :UnitAdd="UnitAdd" @close="UnitAdd = false"  @successMsg="success_info"
@errorMsg = "error_info"/>
<DeleteUnits :UnitDelete="UnitDelete" :deletedata="deletedata" @close="UnitDelete = false"   @successMsg="success_info"
@errorMsg = "error_info"/>
<EditUnit :UnitEdit="UnitEdit" :updatadata="updatadata" @close="UnitEdit = false"  @successMsg="success_info"
@errorMsg = "error_info"/>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    </div>
</template>
<script>
import {create_list_edit_delete_material_unit} from "@/graphql/mutations.js"
import {API , graphqlOperation} from "aws-amplify"
import AddUnits from "@/components/NewInventory/AddUnits.vue";
import SnackBar from "@/components/SnackBar.vue";
import DeleteUnits from "@/components/NewInventory/DeleteUnits.vue";
import EditUnit from "@/components/NewInventory/EditUnit.vue";

export default{
    components:{
           SnackBar,
           AddUnits,
           DeleteUnits,
           EditUnit
  
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
                    title:'Unit Name' , value:"material_unit_name" ,   align: "start"
                },
                {title:"Action", value:"action",  align: "center"}
            ],
            UnitItems:[],
            UnitAdd : false,
            deletedata : {},
            UnitDelete:false,
            UnitEdit:false ,
            updatadata:{}
        }
    },
    mounted(){
          this.fetch_unit()
    },
    computed: {

 paginatedItems(){
  const start = (this.currentPage - 1) * 10
  const end = start + 10
  return this.filteredItems.slice(start,end)
},

pageCount(){
  return Math.ceil(this.filteredItems.length / 10)
},

visiblePages(){

  const delta = 2
  let start = Math.max(1,this.currentPage - delta)
  let end = Math.min(this.pageCount,this.currentPage + delta)

  const pages=[]
  for(let i=start;i<=end;i++){
    pages.push(i)
  }

  return pages
},
filteredItems() {
  const text = (this.searchvalue || "").toLowerCase()

  return this.UnitItems
    .filter(item =>
      item.material_unit_name?.toLowerCase().includes(text)
    )
    .sort((a, b) =>
      a.material_unit_name.localeCompare(b.material_unit_name)
    )
}
},  
watch:{
  searchvalue(){
    this.currentPage = 1
  }
},
methods:{

        async fetch_unit(){
            this.loading = true
            try{
                const response = await API.graphql(
                    graphqlOperation(create_list_edit_delete_material_unit,{
                        input:{
                            action_type :"LIST"
                        }       
                    })
                )
                const res = JSON.parse(response.data.create_list_edit_delete_material_unit)
                    if(res.Status === "SUCCESS"){
                        this.UnitItems = res.data
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
    
        success_info(msg){
            this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor : "green",
                SnackbarText : msg,
                timeout:4000,
                Top: true,
            }
            this.fetch_unit();
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
        AddDialog(){
            this.UnitAdd = true
        },
        DeleteDialog(item){
            this.UnitDelete = true
            this.deletedata = item
            console.log('delete',item)
        },
        EditDialog(item){
            this.UnitEdit = true
            this.updatadata = item
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
.table-footer{
display:flex;
justify-content:space-between;
align-items:center;
padding:16px 20px;
border-top:1px solid #e0e0e0;
background:#fff;
}

.footer-info{
font-size:14px;
color:#555;
}

.pagination-controls{
display:flex;
align-items:center;
gap:8px;
}

.pagination-btn{
text-transform:none;
font-size:14px;
color:#999;
}

.page-btn{
min-width:36px;
height:36px;
border-radius:8px;
font-size:14px;
color:#555;
}

.active-page{
background-color:#db4c77 !important;
color:white !important;
}
</style>