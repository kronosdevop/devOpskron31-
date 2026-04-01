<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="overlay" @update:model-value="$emit('update:overlay', $event)"
    persistent
    width="400"
    transition="dialog-top-transition"
  >
    <v-card dark class="appBar overflow-hidden">
      <v-card-text class="mb-n1 mt-2" align="center" justify="center">
        Loading... Please wait
        <v-progress-linear
          indeterminate
          color="black"
          class="mb-2 mt-2"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    overlay: Boolean,
  },
};
</script>