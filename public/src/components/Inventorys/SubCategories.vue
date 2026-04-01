<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="addSubCategotyDialog"
      @update:model-value="$emit('update:addSubCategotyDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="bg-white">
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>



        <v-card-text class="mt-4">
          <div class="text-center">
            Are you sure you want to delete the
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
    addSubCategotyDialog: Boolean,
    editingCategory: Object,
  },
  data() {
    return {

    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

  },
};
</script>

<style scoped>
</style>
