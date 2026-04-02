<template>
<div class="inventory-page">

<!-- Ticket Dialog -->
<CreateExternalTicketDialog
  :DialogCreateExternalTicket="DialogCreateExternalTicket"
  :screenshot-file="ScreenshotFile"
  :org-details="orgDetails"
  @clicked="DialogCreateExternalTicketEmit"
/>

<!-- HEADER -->
<v-app-bar class="modern-header-section" flat>

  <div class="header-left">

    <div class="header-icon-bg">
      <v-icon color="white" size="26">mdi-package-variant</v-icon>
    </div>

    <div class="header-text">
      <span class="header-title mt-2">Inventory</span>
      <span class="header-subtitle">
Manage products, services, categories and units      </span>
    </div>

  </div>

  <v-spacer/>

  <v-tooltip text="Take a screenshot and raise a ticket">
    <template #activator="{ props }">
      <v-btn icon v-bind="props" @click="TakeScreenShot">
        <v-icon color="primary">mdi-help-circle-outline</v-icon>
      </v-btn>
    </template>
  </v-tooltip>

</v-app-bar>


<!-- TOOLBAR -->
<v-toolbar class="toolbar-section d-flex align-center" flat>

  <!-- Search -->
  <div class="search-wrapper">
    <v-text-field
      v-model="globalSearch"
      :label="searchLabel"
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-magnify"
      clearable
      class="search-field"
      hide-details
    />
  </div>

  <v-spacer/>

  <!-- Tabs -->
  <div class="tab-wrapper">

    <v-tabs
      v-model="tab"
      class="custom-tabs"
      bg-color="transparent"
      density="comfortable"
        selected-class="v-tab--selected"
    >
      <v-tab value="Item">
        <v-icon size="16" class="mr-1">mdi-cube-outline</v-icon>
        Items
      </v-tab>

      <v-tab value="Category">
        <v-icon size="16" class="mr-1">mdi-shape-outline</v-icon>
        Categories
      </v-tab>

      <v-tab value="units">
        <v-icon size="16" class="mr-1">mdi-scale-balance</v-icon>
        Units
      </v-tab>

    </v-tabs>

  </div>

</v-toolbar>


<!-- TAB CONTENT -->
<v-window v-model="tab">

  <v-window-item value="Item">
  <ItemPage ref="itemPage" :searchvalue="globalSearch" />
  </v-window-item>

  <v-window-item value="Category">
    <CategoryPage :searchvalue="globalSearch"/>
  </v-window-item>

  <v-window-item value="units">
    <UnitPage :searchvalue="globalSearch"/>
  </v-window-item>

</v-window>

</div>
</template>
<script>
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";
import ItemPage from "@/components/NewInventory/ItemPage.vue";
import CategoryPage from "@/components/NewInventory/CategoryPage.vue";
import UnitPage from "@/components/NewInventory/UnitPage.vue";
export default {
    components:{
         CreateExternalTicketDialog,
          ItemPage,CategoryPage, UnitPage

    },
    data() {
        return {
            tab:"Item",
            DialogCreateExternalTicket: false,
            ScreenshotFile: null,
            orgDetails: {
                bucket_name: "stichh-medias",
                region: "us-east-1"
            },
            globalSearch :""

        }

    },
    computed:{
   searchLabel(){
    if(this.tab === "Item") return "Search-Item";
    if(this.tab === "Category") return "Search-Category"
    if(this.tab === "units")  return "Search-Units"
   }
    },
    watch:{
  tab(newTab){
    if(newTab === "Item"){
      this.$nextTick(()=>{
        this.$refs.itemPage?.refreshData()
      })
    }
  }
},

    methods: {
        async TakeScreenShot() {
            const target = document.body;
            const canvas = await html2canvas(target, {
                scale: window.devicePixelRatio || 2,
                useCORS: true,
                logging: false,
                windowWidth: document.documentElement.scrollWidth,
                windowHeight: document.documentElement.scrollHeight
            });
            const dataUrl = canvas.toDataURL("image/png");
            const blob = await (await fetch(dataUrl)).blob()
            const file = new File([blob], "screenshot.png", { type: "image/png" })
      this.ScreenshotFile = file;
            this.DialogCreateExternalTicket = true;
        },
        DialogCreateExternalTicketEmit() {
            this.DialogCreateExternalTicket = false
        }
    }
}
</script>
<style scoped>
/* PAGE */

.inventory-page{
  padding-bottom:20px;
}


/* HEADER */

.modern-header-section{
  background:white;
  border-bottom:1px solid #e5e7eb;
  padding:0 24px;
  height:70px;
}

.header-left{
  display:flex;
  align-items:center;
  gap:14px;
}

.header-icon-bg{
  width:40px;
  height:40px;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
}

.header-text{
  display:flex;
  flex-direction:column;
}

.header-title{
  font-size:18px;
  font-weight:600;
  color:#1f2937;
}

.header-subtitle{
  font-size:13px;
  color:#6b7280;
}



.toolbar-section{
  background:white;
  border-bottom:1px solid #eef0f2;
  padding:12px 24px;
}


/* SEARCH FIELD */

.search-wrapper{
  width:260px;
  display:flex;
  align-items:center;
}

.search-field :deep(.v-field){
  border-radius:10px;
  height:40px;
}


/* TAB WRAPPER */

.tab-wrapper{
  display:flex;
  align-items:center;
  background:#f6f7fb;
  padding:4px;
  border-radius:10px;
  border:1px solid #e4e6eb;
  height:40px;
}


/* REMOVE DEFAULT VUETIFY TAB SLIDER */

.custom-tabs :deep(.v-tabs-slider){
  display:none !important;
}


/* TAB STYLE */

.custom-tabs :deep(.v-tab){
  text-transform:none;
  font-size:13px;
  font-weight:500;
  height:32px;
  min-width:95px;
  padding:0 16px;
  border-radius:8px;
  color:#4b5563;
  transition:all .2s ease;
  align-items: center;
  margin-top:15px;
}


/* HOVER STATE */

.custom-tabs :deep(.v-tab:hover){
  background:#ffd6e3;
  color:#DD4D78;
}

.custom-tabs :deep(.v-tab.v-tab--selected){
  background:#DD4D78 !important;
  color:white !important;
}
.custom-tabs :deep(.v-tab::after){
  display:none;
}
</style>