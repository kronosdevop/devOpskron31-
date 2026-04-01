<template>
  <div>
    <v-card flat class="mt-n4">
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <!-- <v-card-title>Vehicle Load Management</v-card-title> -->
      <v-toolbar
        class="mt-6"
        dense
        flat
      >
        <v-btn-toggle dense v-model="vehichleItems" color="grey" mandatory>
          <v-btn small class="black--text" text value="conatainers">
            Containers List
          </v-btn>
          <v-btn small class="black--text" text value="items">
            Items List</v-btn
          >
        </v-btn-toggle>
        <v-spacer />

        <v-btn
          v-show="vehichleItems == 'conatainers'"
          small
          dark
          @click="create_container()"
          class="ml-2 text-capitalize cardCss mr-2"
        >
          Add
        </v-btn>
        <v-btn
          v-show="vehichleItems == 'items'"
          small
          dark
          @click="create_items()"
          class="ml-2 text-capitalize cardCss mr-2"
        >
          Add
        </v-btn>
      </v-toolbar>
    </v-card>
    <div class="text-left" v-if="vehichleItems == 'conatainers'">
      <v-card flat  :height="cardHeight" class="overflow-auto">
        <ContainerList :key="countCheck" />
      </v-card>
    </div>
    <div class="text-left" v-if="vehichleItems == 'items'">
      <v-card flat :height="cardHeight"  class="overflow-auto">
      <ItemsList :key="CheckItem" />
      </v-card>
      </div>
    <div v-if="componentCheck == 1">
      <AddConatinerDialogue
        :addContainerSizes="addContainerSizes"
        @clicked="addContainerSizes = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddItemDialog
        :addlistItem ="addlistItem"
        @clicked="addlistItem = false"
        v-on:successMsg="successitemmsg"
        v-on:errorMsg="error_msg"
      />
    </div>
  </div>
</template>
  <script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import ContainerList from "@/components/VehicleOptimizer/ContainerList.vue";
import ItemsList from "@/components/VehicleOptimizer/ItemsList.vue";
import AddConatinerDialogue from "@/components/VehicleOptimizer/PopUpsDialogues/AddConatinerDialogue.vue";
import AddItemDialog from "./PopUpsDialogues/AddItemDialog.vue";

export default {
  components: {
    SnackBar,
    ContainerList,
    ItemsList,
    AddConatinerDialogue,
    AddItemDialog
  },
  data() {
    return {
      vehichleItems: "conatainers",
      SnackBarComponent: {},
      addContainerSizes: false,
      componentCheck: 0,
      countCheck: 0,
      addlistItem: false,
      CheckItem : 0,
      cardHeight : 0,
    };
  },
  mounted() {
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {
    create_container() {
      this.addContainerSizes = true;
      this.componentCheck = 1;
    },
    create_items() {
      this.componentCheck = 2;
      this.addlistItem = true;
    },
    success_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addContainerSizes = false;
      this.countCheck += 1;
    },
    successitemmsg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.addlistItem = false;
      this.CheckItem += 1;
    },

    error_msg(val) {
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