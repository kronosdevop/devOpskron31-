<template>
  <v-overlay
    :model-value="overlay"
    class="d-flex align-center justify-center"
    persistent
    scrim
  >
    <v-card
      class="pa-6 rounded-xl d-flex align-center justify-center"
      elevation="10"
      width="100"
      height="100"
    >
      <img
        src="@/assets/favicon.png"
        alt="Loading"
        class="rotating-image"
      />
    </v-card>
  </v-overlay>
</template>

<script setup>
defineProps({
  overlay: Boolean,
});
</script>

<style scoped>
.rotating-image {
  width: 80px;
  height: 80px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
