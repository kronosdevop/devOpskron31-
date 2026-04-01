<template>
  <div>
    <v-card class="" flat >
      <v-card-text class="mt-3">
        <v-tabs vertical align="left" class="my-tabs" v-model="settingsTab">
          <v-tabs-slider class="navBar"></v-tabs-slider>
          <!-- <v-tab class="">Territories</v-tab>
          <v-tab-item>
            <TerritoriesMaster />
          </v-tab-item> -->
          <v-tab class="">Visit Types</v-tab>
          <v-tab-item>
            <VisitTypesConfig />
          </v-tab-item>
          <v-tab class="">Approval</v-tab>
          <v-tab-item>
            <VIstApproval />
          </v-tab-item>
          <!-- <v-tab class="">Location Types</v-tab>
          <v-tab-item>
            <LocationTypeMasters />
          </v-tab-item> -->
        </v-tabs>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import VIstApproval from "@/components/VisitsManagementApp/AdminApp/VIstApproval.vue";
import VisitTypesConfig from "@/components/VisitsManagementApp/AdminApp/VisitTypesConfig.vue";
// import LocationTypeMasters from "@/components/VisitsManagementApp/AdminApp/LocationTypeMasters.vue";

export default {
  components: {
    VIstApproval,
    // LocationTypeMasters,
    VisitTypesConfig,
  },
  data() {
    return {
      settingsTab: "",
    };
  },
};
</script>