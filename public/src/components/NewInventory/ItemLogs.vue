<template>
  <v-dialog :model-value="LogsItem" max-width="420" persistent>
<v-card class="pa-4">

<v-card-title class="text-h6 d-flex justify-space-between">
Recent Activity
<v-spacer></v-spacer>
<v-icon @click="closedialog()">mdi-close</v-icon>
</v-card-title>

<v-divider class="mb-2"/>

<div v-if="loading" class="text-center py-6">
<v-progress-circular indeterminate color="primary"/>
</div>

<div v-else>

<div
v-for="log in logs"
:key="log.log_id"
class="activity-row"
>

<!-- ICON -->
<div
class="activity-icon"
:class="log.consumption_type === 'ADDED' ? 'add-bg' : 'remove-bg'"
>

<v-icon
size="18"
:color="log.consumption_type === 'ADDED' ? 'green-darken-2' : 'red-darken-2'"
>
{{ log.consumption_type === "ADDED"
? "mdi-arrow-up-bold"
: "mdi-arrow-down-bold" }}
</v-icon>

</div>

<!-- CONTENT -->
<div class="activity-text">

<div class="activity-title"
:class="log.consumption_type === 'ADDED' ? 'text-add' : 'text-remove'"
>
{{ log.consumption_type === "ADDED"
? "Stock Added"
: "Stock Removed" }}
</div>

<div class="activity-desc">

<span
:class="log.consumption_type === 'ADDED' ? 'qty-add' : 'qty-remove'"
>

{{ log.consumption_type === 'ADDED'
? `+${log.stock_credit}`
: `-${log.stock_debit}` }}

PCS

</span>

at <b>{{ log.location_name }}</b>

<span class="user">
by {{ log.user_email_id.split("@")[0] }}
</span>

</div>

</div>

<!-- TIME -->
<div class="activity-time">
{{ formatTime(log.consumption_timestamp) }}
</div>

</div>

</div>

</v-card>
</v-dialog>
</template>
<script>
import {API, graphqlOperation } from 'aws-amplify';
import {get_inventory_consumption_logs} from "@/graphql/queries.js"
export default{
    props:{
      LogsItem : Boolean,
      logsdata : Object
    },
data(){
return{
logs:[],
loading:false
}
},

watch:{
LogsItem:{
async handler(val){
if(val){
await this.fetch_Activities()
}
}
}
},

methods:{

async fetch_Activities(){

this.loading = true

try{

const response = await API.graphql(
graphqlOperation(get_inventory_consumption_logs,{
input:{
product_id:this.logsdata.product_id
}
})
)

const result = JSON.parse(
response.data.get_inventory_consumption_logs
)

if(result.Status === "SUCCESS"){
this.logs = result.data
}

}catch(e){
console.log(e)
}

finally{
this.loading = false
}

},
closedialog(){
    this.$emit('close',0)
},

formatTime(timestamp){

const diff = Math.floor(Date.now()/1000 - timestamp)

const days = Math.floor(diff / 86400)
const hours = Math.floor(diff / 3600)

if(days > 0) return `${days}d ago`
if(hours > 0) return `${hours}h ago`

const mins = Math.floor(diff / 60)
return `${mins}m ago`

}

}
}
</script>
<style scoped>
.activity-row{
display:flex;
align-items:center;
gap:14px;
padding:14px;
border-radius:12px;
transition:all .2s ease;
margin-bottom:6px;
}

.activity-row:hover{
background:#f9fafb;
}

.activity-icon{
width:36px;
height:36px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
flex-shrink:0;
}

.add-bg{
background:#dcfce7;
}

.remove-bg{
background:#fee2e2;
}

.activity-text{
flex:1;
display:flex;
flex-direction:column;
}

.activity-title{
font-size:14px;
font-weight:600;
}

.text-add{
color:#15803d;
}

.text-remove{
color:#b91c1c;
}

.activity-desc{
font-size:13px;
color:#6b7280;
margin-top:2px;
}

.qty-add{
color:#16a34a;
font-weight:600;
margin-right:4px;
}

.qty-remove{
color:#ef4444;
font-weight:600;
margin-right:4px;
}

.user{
color:#9ca3af;
margin-left:4px;
}

.activity-time{
font-size:12px;
color:#9ca3af;
white-space:nowrap;
}
</style>