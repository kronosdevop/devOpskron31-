<template>
  <div>
     <!-- eslint-disable -->
    <v-dialog :model-value="subView" @update:model-value="$emit('update:subView', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
            Sub Categories
            </div></v-toolbar-title
          >
          <v-spacer />

          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-2">
          <div class="font-weight-bold">
            1. Farms <br />
            2. Greenhouses <br />
            3. Nurseries
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */

export default {
  props: {
    subView: Boolean,
  },
  components: {},
  created() {
    this.height = window.innerHeight - 210;
  },
  data() {
    return {
      height: 0,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>