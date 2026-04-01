<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="viewDialog" @update:model-value="$emit('update:viewDialog', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title"> Description
              </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-textarea
            outlined
            v-model="rowInfo.broadcast_message.description"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
export default {
  props: {
    viewDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {};
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>