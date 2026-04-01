<template>
  <!--  eslint-disable 
 -->
  <div>
    <v-card flat class="mt-4" >
      <!-- <v-card-title> Arap </v-card-title> -->
      <v-toolbar
        
        density="compact"
        flat
        class=""
      >
        <v-btn-toggle
          class="ml-3"
          v-model="toggle_exclusive"
          density="compact"
          variant="outlined"
          mandatory
          divided
        >
          <v-btn
            size="small"
            class="text-capitalize"
            :class="toggle_exclusive === 'ordersList' ? 'active-btn' : ''"
            value="ordersList"
          >
            Orders
          </v-btn>
          <v-btn
            size="small"
            class="text-capitalize"
            :class="toggle_exclusive === 'emailTemplate' ? 'active-btn' : ''"
            value="emailTemplate"
          >
            Email Template
          </v-btn>
        </v-btn-toggle>

        <v-spacer />
      </v-toolbar>
      <div class="text-left" v-if="toggle_exclusive == 'ordersList'">
        <v-card
          flat
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <OrdersList />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'emailTemplate'">
        <v-card
          flat
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <OrderEmailTemplate />
        </v-card>
      </div>
    </v-card>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
    
<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import OrdersList from "./OrdersList.vue";
import OrderEmailTemplate from "./OrderEmailTemplate.vue";

export default {
  components: {
    OrdersList,
    OrderEmailTemplate,
    SnackBar,
  },
  data: () => ({
    toggle_exclusive: "ordersList",
    cardHeight: 0,
    SnackBarComponent: {},
  }),

  mounted() {
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {},
};
</script>
    
<style>
.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}
</style>