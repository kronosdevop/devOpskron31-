<template>
  <!-- eslint-disable -->
  <v-snackbar
    v-model="SnackBarComponent.SnackbarVmodel"
    :color="SnackBarComponent.SnackbarColor"
    location="top"
    :timeout="SnackBarComponent.timeout"
  >
    <div class="text-center">{{ SnackBarComponent.SnackbarText }}</div>
  </v-snackbar>
</template>
<script>
export default {
  props: {
    SnackBarComponent: Object,
  },
  data: () => ({
    timeout: 2000,
  }),
};
</script>