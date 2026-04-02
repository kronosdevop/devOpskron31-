<template>
 <v-snackbar
  v-model="AppSnackBarComponent.AppSnackBarVmodel"
  :color="AppSnackBarComponent.AppSnackbarColor"
  location="top"
  :timeout="AppSnackBarComponent.timeout"
  content-class="tall-snackbar modern-snackbar"
>
  <div class="snackbar-body">
    <!-- Icon badge -->
    <div class="snackbar-icon">
      <v-icon size="22">
        {{ AppSnackBarComponent.icon || 'mdi-information-outline' }}
      </v-icon>
    </div>

    <!-- Message -->
    <div class="snackbar-text">
      {{ AppSnackBarComponent.AppSnackbarText }}
    </div>
  </div>
</v-snackbar>



</template>

<script>
export default {
  props: {
    AppSnackBarComponent: {
      type: Object,
      required: true,
    },
  },
};
</script>
<style scoped>
/* Snackbar shell */
:deep(.modern-snackbar.v-snackbar__content) {
  min-height: 72px;
  padding: 16px 22px;
  border-radius: 14px;

  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.18),
    0 4px 10px rgba(0, 0, 0, 0.12);
}

/* Layout */
.snackbar-body {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Icon badge */
.snackbar-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(255, 255, 255, 0.18);
  flex-shrink: 0;
}

/* Text */
.snackbar-text {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}



</style>
