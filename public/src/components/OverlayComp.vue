<template>
  <v-overlay
    :model-value="overlay"
    class="overlay-center d-flex align-center justify-center"
    persistent
  >
    <div class="loader-wrapper">
      <v-progress-circular
        indeterminate
        size="80"
        width="4"
        color="#DB4C77"
      />

      <p class="loading-text" color="white">
        Loading, please wait...
      </p>
    </div>
  </v-overlay>
</template>

<script setup>
defineProps({
  overlay: Boolean,
});
</script>
<style scoped>
.overlay-center {
  background-color: rgba(0, 0, 0, 0.35);
}

.loader-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: fadeIn 0.3s ease-in;
}

.loading-text {
  font-size: 13px;
  font-weight: 500;
  color: #e8e7e7;
  letter-spacing: 0.3px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


</style>