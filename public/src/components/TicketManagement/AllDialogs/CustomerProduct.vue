<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="listProduct" @update:model-value="$emit('update:listProduct', $event)" persistent max-width="400" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2">
          <div class="custom-title">Products</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-2 text-left">
        <!-- <div class="mt-n2 ml-2"><h3>Product List</h3></div> -->
        <v-list>
          <v-list-item-title
            v-for="(item, index) in folders"
            :key="index"
            class="pa-2"
          >
            {{ item }}
            <v-divider v-if="index < item.length - 1" class="mt-2"></v-divider>
          </v-list-item-title>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
            
            <script>
export default {
  props: {
    rowInfo: Object,
    listProduct: Boolean,
  },
  data() {
    return {
      folders: [],
    };
  },

  watch: {
    listProduct: {
      async handler() {
        if (this.listProduct == true) {
          this.folders = this.rowInfo.product_ids;

          //   console.log(this.rowInfo);
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>
            
            <style>
</style>