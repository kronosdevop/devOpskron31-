<template>
  <div>
    <v-toolbar flat >
      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="basicDetails">
            Basic Details
          </v-btn>

          <v-btn small class="black--text" text value="taskadmins">
            Admins
          </v-btn>
          <v-btn small class="black--text" text value="taskcategories">
            Categories
          </v-btn>
          <v-btn small class="black--text" text value="customerDetails">
            Customers
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-spacer />
      <v-btn
        v-if="toggle_exclusive == 'taskadmins'"
        dark
        @click="add_admins()"
        class="text-capitalize cardCss"
        >Add</v-btn
      >
      <v-btn
        v-if="toggle_exclusive == 'taskcategories'"
        dark
        class="text-capitalize cardCss ml-2"
        @click="add_call()"
      >
        Add
      </v-btn>
      <v-btn dark class="text-capitalize ml-2 cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'taskadmins'">
      <AdminsList :key="adminKey" />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'taskcategories'">
      <CategoriesList :key="serviceKey" />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'basicDetails'">
      <ProductBasicDetails />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'customerDetails'">
      <ProductCustomer />
    </div>
    <div v-if="componentCheck == 1">
      <AddAdminDialog
        :addDialog="addDialog"
        @clicked="addDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:adminRefresh="admin_refresh"
      />
    </div>
    <div v-if="componentCheck == 2">
      <CreateCategories
        :addConfiguration="addConfiguration"
        @clicked="addConfiguration = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:serviceRefresh="services_refresh"
      />
    </div>

    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
        
<script>
import AdminsList from "@/components/TicketManagement/AdminsList.vue";
import CategoriesList from "@/components/TicketManagement/CategoriesList.vue";
import ProductBasicDetails from "@/components/TicketManagement/ProductBasicDetails.vue";
import ProductCustomer from "@/components/TicketManagement/ProductCustomer.vue";
import AddAdminDialog from "@/components/TicketManagement/AllDialogs/AddAdminDialog.vue";
import CreateCategories from "@/components/TicketManagement/AllDialogs/CreateCategories.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    AdminsList,
    CategoriesList,
    ProductBasicDetails,
    ProductCustomer,
    AddAdminDialog,
    SnackBar,
    CreateCategories,
  },
  data: () => ({
    toggle_exclusive: "basicDetails",
    componentCheck: 0,
    addDialog: false,
    SnackBarComponent: {},
    addConfiguration: false,
    adminKey: 0,
    serviceKey: 0,
  }),
  methods: {
    back_call() {
      this.$router.push("/TicketManagement");
    },
    add_admins() {
      this.addDialog = true;
      this.componentCheck = 1;
    },
    add_call() {
      this.componentCheck = 2;
      this.addConfiguration = true;
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
    admin_refresh() {
      this.adminKey += 1;
    },

    services_refresh() {
      this.serviceKey += 1;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addDialog = false;
      this.addConfiguration = false;
    },
  },
};
</script>
        
        <style>
</style>