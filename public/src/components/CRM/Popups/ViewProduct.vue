<template>
  <div>
    <v-toolbar flat>
      <!-- <v-toolbar-title class="ml-5"> {{ product_name }}</v-toolbar-title> -->
      <v-row class="ml-4">
        <v-btn-toggle
          v-model="toggle_exclusive"
          :key="toggleKey"
          color="grey"
          mandatory
        >
          <v-btn small class="black--text" text value="productDetails">
            Product Details
          </v-btn>
          <v-btn small class="black--text" text value="formDesigner">
            Forms
          </v-btn>
        </v-btn-toggle>
      </v-row>
      <v-spacer />
      <v-btn
        v-if="toggle_exclusive == 'formDesigner'"
        depressed
        @click="create_form()"
        dark
        class="cardCss"
      >
        Create
      </v-btn>
      <v-btn depressed @click="back_mutation()" dark class="cardCss ml-1"
        ><v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <!-- <div v-if="toggle_exclusive == 'productDetails'">
      <ProductDetailsInfo />
    </div>

    <div v-if="toggle_exclusive == 'formDesigner'">
      <ProductForms />
    </div> -->
    <div v-if="componentCheck == 1">
      <FormCreation
        :formCreationDialog="formCreationDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="formCreationDialog = false"
        :actiontype="actiontype"
      />
    </div>
    <component :is="componentName" :key="componentKey" />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */

import ProductForms from "@/components/CRM/Popups/ProductForms.vue";
import ProductDetailsInfo from "@/components/CRM/Popups/ProductDetailsInfo.vue";
import FormCreation from "@/components/FormDesigner/FormDialogs/FormCreation.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    SnackBar,
    ProductForms,
    ProductDetailsInfo,
    FormCreation,
  },
  props: {
    productitems: Object,
  },
  computed: {
    // Destructure the component name and parameters based on the flowSteps value
    componentName() {
      const { component } = this.getComponentInfo(this.toggle_exclusive);

      // this.componentParams = parameters;

      return component;
    },
  },
  data() {
    return {
      componentCheck: 0,
      SnackBarComponent: {},
      height: 0,
      toggle_exclusive: "productDetails",
      actiontype: "CRM",
      formCreationDialog: false,
      toggleKey: 0,
      componentKey: 0,
    };
  },

  created() {
    this.height = window.innerHeight - 310;
    if (this.$router.history.current.params.formMethod == "forms") {
      this.toggle_exclusive = "formDesigner";
    }
  },
  watch: {},
  methods: {
    back_mutation() {
      this.$store.commit("Setproductitems", {});
      this.$router.push({
        name: "CrmAdmins",
        params: {
          formMethod: "incdentproduct",
        },
      });
      // this.$router.push("CrmAdmins");
    },
    create_form() {
      this.componentCheck = 1;
      this.formCreationDialog = true;
    },
    getComponentInfo(step) {
      switch (step) {
        case "productDetails":
          return {
            component: "ProductDetailsInfo",

            // Example parameter for Step 2
          };
        case "formDesigner":
          return {
            component: "ProductForms",

            // Example parameter for Step 2
          };

        default:
          return {
            component: null,
          };
      }
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.componentKey++;
      this.formCreationDialog = false;

      // this.toggle_exclusive = "formDesigner";
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
  },
};
</script>

<style>
</style>