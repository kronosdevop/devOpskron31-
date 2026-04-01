<template>
  <div>
    <v-card flat class="" >
      <!-- <v-card-title>Material Management</v-card-title> -->
      <v-toolbar dense flat class="mt-2" >
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory dense>
          <v-btn small class="black--text" text value="materilaReports">
            Instock
          </v-btn>
          <v-btn small class="black--text" text value="materialTransactions">
            Transactions
          </v-btn>
          <v-btn small class="black--text" text value="materialsettings">
            Settings
          </v-btn>
          <!-- <v-btn small class="black--text" text value="project_site">
            Project Site
          </v-btn> -->

          <!-- <v-btn small class="black--text" text value="materialList">
            Materials
          </v-btn>
          <v-btn small class="black--text" text value="in_stock">
            Stock (By Material)
          </v-btn>
          <v-btn small class="black--text" text value="in_stock_byProject">
            Stock (By Projectsite)
          </v-btn> -->
          <!-- <v-btn small class="black--text" text value="dispatch_stock">
            Dispatched Stock
          </v-btn> -->
        </v-btn-toggle>

        <v-spacer />
        <v-btn
          dark
          @click="createProject()"
          v-if="toggle_exclusive == 'project_site'"
          class="text-capitalize cardCss"
        >
          Create
        </v-btn>
        <v-btn
          dark
          @click="createMaterial()"
          v-if="toggle_exclusive == 'materialList'"
          class="text-capitalize cardCss"
        >
          Create
        </v-btn>
        <v-btn
          dark
          @click="createstock()"
          v-if="toggle_exclusive == 'materialTransactions'"
          class="text-capitalize cardCss"
        >
          Add
        </v-btn>
        <v-btn
          dark
          @click="createreps()"
          v-if="toggle_exclusive == 'materialreps'"
          class="text-capitalize cardCss"
        >
          Create
        </v-btn>
      </v-toolbar>
      <div class="text-left" v-if="toggle_exclusive == 'materilaReports'">
        <MaterialReports />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'materialTransactions'">
        <v-card flat :height="cardHeight" class="overflow-auto" >
        <AllAMaterilaTransaction :key="stockkey" />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'materialsettings'">
        <MaterialSettings />
      </div>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <CreateProjectSite
        :projectCreation="projectCreation"
        @clicked="projectCreation = false"
        v-on:updaterefesh="refreshproject"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <CreateMaterial
        :materialcreation="materialcreation"
        @clicked="materialcreation = false"
        v-on:updaterefesh="refreshmaterial"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 3">
      <CreateProjectrep
        :repcreation="repcreation"
        @clicked="repcreation = false"
        v-on:updaterefesh="refreshrep"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <CreateStock
        :stockcreation="stockcreation"
        @clicked="stockcreation = false"
        v-on:updaterefesh="refresstock"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>

<script>
/*eslint-disable*/

import DispatchStock from "@/components/MaterialManagement/DispatchStock.vue";
import CreateStock from "@/components/MaterialManagement/Popups/CreateStock.vue";
import InStockMaterial from "@/components/MaterialManagement/InStockMaterial.vue";
import InstockProjectSite from "@/components/MaterialManagement/InstockProjectSite.vue";
import CreateProjectrep from "@/components/MaterialManagement/Popups/CreateProjectrep.vue";
import MaterialReps from "@/components/MaterialManagement/MaterialReps.vue";
import CreateMaterial from "@/components/MaterialManagement/Popups/CreateMaterial.vue";
import MaterialList from "@/components/MaterialManagement/MaterialList.vue";
import ProjectSite from "@/components/MaterialManagement/ProjectSite.vue";
import SnackBar from "@/components/SnackBar.vue";
import CreateProjectSite from "@/components/MaterialManagement/Popups/CreateProjectSite.vue";
import AllAMaterilaTransaction from "@/components/MaterialManagement/AllAMaterilaTransaction.vue";
import MaterialReports from "@/components/MaterialManagement/MaterialReports.vue";
import MaterialSettings from "@/components/MaterialManagement/MaterialSettings.vue";

export default {
  components: {
    SnackBar,
    CreateProjectSite,
    CreateStock,
    ProjectSite,
    MaterialList,
    CreateMaterial,
    MaterialReps,
    CreateProjectrep,
    InStockMaterial,
    DispatchStock,
    InstockProjectSite,
    MaterialReports,
    AllAMaterilaTransaction,
    MaterialSettings,
  },
  data: () => ({
    toggle_exclusive: "materialreps",
    projectCreation: false,
    materialcreation: false,
    stockkey: 0,
    stockcreation: false,
    repcreation: false,
    SnackBarComponent: {},
    projectkey: 0,
    componentCheck: 0,
    projectrepKey: 0,
    materialkey: 0,
    cardHeight: 0,
  }),

  mounted() {
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.projectCreation = false;
      this.materialcreation = false;
      this.repcreation = false;
      this.stockcreation = false;
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    refreshproject() {
      this.projectkey += 1;
    },
    refreshrep() {
      this.projectrepKey += 1;
    },
    refreshmaterial() {
      this.materialkey += 1;
    },
    refresstock() {
      this.stockkey += 1;
    },
    createProject() {
      this.componentCheck = 1;
      this.projectCreation = true;
    },
    createMaterial() {
      this.componentCheck = 2;
      this.materialcreation = true;
    },
    createreps() {
      this.componentCheck = 3;
      this.repcreation = true;
    },
    createstock() {
      this.componentCheck = 4;
      this.stockcreation = true;
    },
  },
};
</script>

<style>
</style>