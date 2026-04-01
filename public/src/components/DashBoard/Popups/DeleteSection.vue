<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="deleteSectionDialog" @update:model-value="$emit('update:deleteSectionDialog', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Delete</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to delete
            <b> {{ rowInfo.sectionTitle }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn depressed @click="delete_mutation()" dark class="cardCss">
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */

export default {
  props: {
    deleteSectionDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    delete_mutation() {
      this.$emit("deleteData", 0);
    },
  },
};
</script>