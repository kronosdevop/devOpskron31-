<template>
  <div>
    <v-card class="mt-3" flat >
      <v-card-text>
        <v-tabs
          align="left"
          class="my-tabs mt-n6"
          v-model="materialStock"
          @input="onTabChange"
          grow
        >
          <v-tabs-slider class="navBar"></v-tabs-slider>

          <v-tab class="text-capitalize">Stock By Material</v-tab>
          <v-tab-item>
            <InStockMaterial :key="materialStock === 0 ? uniqueKey : null" />
          </v-tab-item>
          <v-tab class="text-capitalize">Stock By Project Site</v-tab>
          <v-tab-item>
            <InstockProjectSite :key="materialStock === 1 ? uniqueKey : null" />
          </v-tab-item>
        </v-tabs>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/

import InStockMaterial from "@/components/MaterialManagement/InStockMaterial.vue";
import InstockProjectSite from "@/components/MaterialManagement/InstockProjectSite.vue";

export default {
  components: {
    InStockMaterial,
    InstockProjectSite,
  },
  data() {
    return {
      materialStock: 0,
      uniqueKey: 0,
    };
  },
  methods: {
    onTabChange() {
      this.uniqueKey++;
    },
  },
};
</script>