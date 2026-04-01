<template>
  <div>
    <v-card flat class="mt-2" >
      <v-toolbar
        
        density="compact"
        flat
        class="mt-"
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
            :class="toggle_exclusive === 'arapCustomers' ? 'active-btn' : ''"
            value="arapCustomers"
          >
            Customers
          </v-btn>
          <v-btn
            size="small"
            class="text-capitalize"
            :class="toggle_exclusive === 'arapSuppliers' ? 'active-btn' : ''"
            value="arapSuppliers"
          >
            Suppliers
          </v-btn>
          <!-- <v-btn
            size="small"
            class="text-capitalize"
            :class="toggle_exclusive === 'templateTriggers' ? 'active-btn' : ''"
            value="templateTriggers"
          >
            Template and Triggers
          </v-btn> -->
        </v-btn-toggle>

        <!-- <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory dense>
          <v-btn small class="black--text" text value="arapCustomers"
            >Customers</v-btn
          >
          <v-btn small class="black--text" text value="arapSuppliers"
            >Suppliers</v-btn
          >
        </v-btn-toggle> -->
        <v-spacer />
      </v-toolbar>
      <div class="text-left" v-if="toggle_exclusive === 'arapCustomers'">
        <ArapCustomers />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'arapSuppliers'">
        <ArapSuppliers />
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'templateTriggers'">
        <CustomerSettings />
      </div>
      <!-- <v-container fluid> -->
      <!-- <v-row fill-height dense>
        <v-col cols="12">
          <v-card
            flat
            class="fill-height d-flex flex-column"
            :style="{ backgroundColor: '#ECEFF1', minHeight: '100vh' }"
          >
            <ArapCustomers v-if="toggle_exclusive === 'arapCustomers'" />
            <ArapSuppliers v-if="toggle_exclusive === 'arapSuppliers'" />
          </v-card>
        </v-col>
      </v-row> -->
      <!-- </v-container> -->
    </v-card>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>

  <!-- <v-card flat class="mt-4" >
     
      <v-toolbar
        
        dense
        flat
        class="mt-n2"
      >
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory dense>
          <v-btn small class="black--text" text value="arapCustomers">
            Customers
          </v-btn>
          <v-btn small class="black--text" text value="arapSuppliers">
            Suppliers
          </v-btn>
        </v-btn-toggle>

        <v-spacer />
      </v-toolbar>
      <div class="text-left" v-if="toggle_exclusive == 'arapSuppliers'">
        <v-card
          flat
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <ArapSuppliers />
        </v-card>
      </div>
      <div class="text-left" v-if="toggle_exclusive == 'arapCustomers'">
        <v-card
          flat
          :height="cardHeight"
          class="overflow-auto"
          
        >
          <ArapCustomers />
        </v-card>
      </div>
    </v-card> -->
</template>
  
  <script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import ArapCustomers from "@/components/ARAP/ArapCustomers.vue";
import ArapSuppliers from "@/components/ARAP/ArapSuppliers.vue";
import CustomerSettings from "@/components/ARAP/CustomerSettings.vue";
export default {
  components: {
    ArapSuppliers,
    ArapCustomers,
    CustomerSettings,
    SnackBar,
  },
  data: () => ({
    toggle_exclusive: "arapCustomers",
    componentCheck: 0,
    dashboardCreation: false,
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
</style>