<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="qrasset"
      @update:model-value="qrasset = $event"
      persistent
      max-width="350"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Geo Location of {{ adminassetItems.asset_prefix }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-row style="justify-content: center; align-items: center">
            <v-col cols="12" class="d-flex justify-center">
              <div
                style="
                  border: 1px solid black;
                  max-width: fit-content;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100px;
                "
              >
                <VueQRCodeComponent
                  :text="adminassetItems.asset_qr_id"
                  error-level="H"
                  :size="100"
                ></VueQRCodeComponent>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
      <script>
import VueQRCodeComponent from "vue-qrcode-component";
export default {
  props: {
    qrasset: Boolean,
    adminassetItems: Object,
  },
  components: {
    VueQRCodeComponent,
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