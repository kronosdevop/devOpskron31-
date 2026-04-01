<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-card flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <!-- <v-card-title class="d-flex mt-n6 justify-space-between align-center" style="font-size: 18px;">
                Add some Photos
            </v-card-title> -->
      <span class="d-flex align-center" style="font-size: small">
        You'll need 5-10 photos to get started.
      </span>
      <v-card
        outlined
        color="#E0E0E0"
        class="d-flex flex-column align-center pa-6"
      >
        <v-icon size="64" class="my-4 mt-n4">mdi-camera</v-icon>
        <v-btn color="primary" class="mt-n4" @click="addPhotos" x-small
          >Add Photos</v-btn
        >
        <input
          type="file"
          ref="fileInput"
          multiple
          hidden
          accept="image/*"
          @change="handleFileUpload"
        />
        <div v-if="selectedFiles.length" class="d-flex flex-wrap">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="ma-2 d-flex flex-column align-center"
          >
            <v-img
              :src="file.preview"
              max-width="130"
              max-height="150"
              contain
            ></v-img>
            <v-btn
              x-small
              dense
              color="red"
              @click="removePhoto(index)"
              class="mt-n8 white--text"
              >Delete</v-btn
            >
          </div>
        </div>
      </v-card>

      <v-card-actions class="justify-center mt-2">
        <v-btn depressed @click="back_action()" dark color="primary">
          Back
        </v-btn>
        <v-btn depressed @click="emit_fourth_step()" dark class="cardCss">
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable */

import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      selectedFiles: [],
      SnackBarComponent: {},
    };
  },
  methods: {
    addPhotos() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const files = Array.from(event.target.files);

      if (this.selectedFiles.length + files.length > 10) {
        this.showSnackbar("You can only upload up to 10 photos.", "red");
        return;
      }

      this.selectedFiles = [
        ...this.selectedFiles,
        ...files.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        })),
      ];
    },
    removePhoto(index) {
      this.selectedFiles.splice(index, 1);
    },
    emit_fourth_step() {
      if (this.selectedFiles.length < 5 || this.selectedFiles.length > 10) {
        this.showSnackbar(
          "Please ensure you have selected between 5 to 10 photos before proceeding.",
          "red"
        );
        return;
      }
      this.$emit("emitfourthstep", this.selectedFiles);
    },
    back_action() {
      this.$emit("emitthirdstep", 2);
    },
    showSnackbar(message, color) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: color,
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>

<style>
.v-icon {
  color: #757575;
}
</style>
