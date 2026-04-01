<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="qr_view" @update:model-value="$emit('update:qr_view', $event)" persistent max-width="350" transition="dialog-top-transition">
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2"> 
          <div class="custom-title"> View Qr 
            </div>
          </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text align="center">
        <!-- <v-img src="@/assets/horizontal-logo.png" class="mt-5" height="60" width="200">
        </v-img> -->
        <div
          style="border: 1px solid black; max-width: fit-content"
          class="pa-3 mt-8 mb-8"
        >
          <VueQRCodeComponent
            :text="member_qr"
            error-level="H"
            :size="150"
          ></VueQRCodeComponent>
        </div>
        <span class="font-weight-bold">
          {{ custom_details.dashboard_name }}
        </span>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
/* eslint-disable */
import VueQRCodeComponent from "vue-qrcode-component";
export default {
  props: {
    qr_view: Boolean,
    custom_details: Object,
  },
  components: { VueQRCodeComponent },
  data() {
    return {
      member_qr: "",
    };
  },
  watch: {
    qr_view: {
      async handler() {
        if (this.qr_view == true) {
          this.member_qr = this.custom_details.dashboard_link;
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>

<style>
</style>