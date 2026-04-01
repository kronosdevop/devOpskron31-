<template>
  <div>
    <v-card class="" flat >
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <VendorInitiateConf />
          </v-col>
          <!-- <v-col cols="6">
            <SupplierApproval />
          </v-col> -->
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
/*eslint-disable*/
import SupplierApproval from "@/components/VendorManagement/SupplierApproval.vue";
import VendorInitiateConf from "@/components/VendorManagement/VendorInitiateConf.vue";
export default {
  components: {
    VendorInitiateConf,
    SupplierApproval,
  },
};
</script>

<style>
</style>