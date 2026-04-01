<template>
  <div>
    <v-card class="mt-n4" flat >
      <v-card-text class="mt-3">
        <v-tabs vertical align="left" class="my-tabs" v-model="settingsTab">
          <v-tabs-slider class="navBar"></v-tabs-slider>
          <!-- <v-tab class="">Units</v-tab>
          <v-tab-item>
            <MaterialUnit />
          </v-tab-item>
          <v-tab class="">Materials</v-tab>
          <v-tab-item>
            <MaterialList />
          </v-tab-item> -->
          <v-tab class=""> Site Supervisor</v-tab>
          <v-tab-item>
            <MaterialReps />
          </v-tab-item>
        </v-tabs>
      </v-card-text>
    </v-card>
  </div>
</template>
  <script>
/*eslint-disable*/
import MaterialReps from "@/components/MaterialManagement/MaterialReps.vue";
import MaterialList from "@/components/MaterialManagement/MaterialList.vue";
import VisitTypesConfig from "@/components/VisitsManagementApp/AdminApp/VisitTypesConfig.vue";
import MaterialUnit from "@/components/MaterialManagement/MaterialUnit.vue";
export default {
  components: {
    MaterialList,
    VisitTypesConfig,
    MaterialUnit,
    MaterialReps,
  },
  data() {
    return {
      settingsTab: "",
    };
  },
};
</script>