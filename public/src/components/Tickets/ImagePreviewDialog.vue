<template>
  <div>
    <v-dialog :model-value="DialogImagePreview" max-width="700px" persistent>
      <v-card rounded-lg>
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          Image Preview
          <v-btn
            icon
            variant="text"
            @click="DialogImagePreviewEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <div
          v-if="previewImage && previewImage.length > 0"
          class="d-flex justify-center pa-4"
        >
          <v-img
            v-if="previewImage"
            :src="previewImage"
            max-height="500"
            max-width="600"
            contain
            rounded="lg"
          />
        </div>

        <div v-else class="d-flex justify-center pa-4">
          <span>
            <v-icon color="grey" size="64">mdi-camera-off</v-icon>
            <div>No image to display</div>
          </span>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    DialogImagePreview: Boolean,
    previewImage: String,
  },

  methods: {
    DialogImagePreviewEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>
