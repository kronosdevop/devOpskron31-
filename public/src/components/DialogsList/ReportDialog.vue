<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="trackReport" @update:model-value="$emit('update:trackReport', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Report Issue</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <div class="text-left">Are you sure you want to report an issue?</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="html_image()"
            dark
            class="text-capitalize cardCss button-corner"
          >
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
    trackReport: Boolean,
    //  adminassetItems: Object,
  },
  data() {
    return {
      loading: false,
      selectedFilesFromDrop: [],
    };
  },
  watch: {
    trackReport: {
      async handler() {
        // You can add logic here if needed when trackReport changes
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", false);
    },

    html_image() {
      this.$router.push("ReportView");
    },
  },
};
</script>
  