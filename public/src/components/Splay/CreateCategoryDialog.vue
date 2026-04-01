<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogCreateCategory" max-width="650px" persistent>
      <v-card>
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Create Category </span>
          <v-btn
            icon
            variant="text"
            @click="DialogCreateCategoryEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Form Fields-->
        <v-row class="pa-5">
          <!--Category-->
          <v-col cols="6" class="mt-n4">
            <div class="font-weight-bold">Category</div>
            <v-text-field
              v-model="category"
              variant="outlined"
              density="compact"
              rounded="lg"
              prepend-inner-icon="mdi-view-list"
              class="mt-2"
            />
          </v-col>

          <!--Question Interval-->
          <v-col cols="6" class="mt-n4">
            <div class="font-weight-bold">Question Interval</div>
            <v-select
              v-model="interval"
              variant="outlined"
              density="compact"
              rounded="lg"
              prepend-inner-icon="mdi-clock-outline"
              class="mt-2"
              :items="intervalItems"
            />
          </v-col>

          <!--File Input-->
          <v-col cols="12" class="mt-n5">
            <v-file-input
              ref="fileInput"
              accept="image/*"
              class="d-none"
              @update:model-value="OnFileSelect"
            />
            <!--Preview-->
            <div class="font-weight-bold mt-n1">
              Image (To repsent category)
            </div>
            <div class="preview-wrapper clickable mt-3" @click="openFilePicker">
              <v-img
                v-if="imageUrl"
                :src="imageUrl"
                aspect-ratio="16/9"
                class="preview-image"
                cover
              />
              <div v-else class="preview-placeholder">
                <v-icon size="48">mdi-image-plus</v-icon>
                <div class="mt-2">Click to upload image</div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!--Button-->
        <v-card-actions class="d-flex justify-center mt-n3">
          <v-btn
            variant="flat"
            size="small"
            rounded="lg"
            color="primary"
            :loading="loading"
            @click="CreateCategory"
          >
            Create
            <template #loader>
              <v-progress-circular indeterminate color="white" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { create_list_edit_delete_splay_categories } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";
import { uploadImgS3 } from "@/mixins/S3Upload.js";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogCreateCategory: Boolean },

  components: { SnackBar },

  data: () => ({
    category: "",
    interval: "10",

    loading: false,

    imageUrl: null,
    selectedFile: null,

    SnackBarComponent: {},

    intervalItems: [
      { title: "10", value: "10" },
      { title: "15", value: "15" },
      { title: "30", value: "30" },
      { title: "45", value: "45" },
      { title: "60", value: "60" },
    ],
  }),

  watch: {
    DialogCreateCategory(val) {
      if (!val) {
        this.category = "";
        this.interval = "10";
        this.imageUrl = null;
        this.selectedFile = null;
      }
    },
  },

  methods: {
    async CreateCategory() {
      this.loading = true;
      try {
        let uploadedImageUrl = null;
        if (this.selectedFile) {
          const key = `categories/${Date.now()}-${this.selectedFile.name}`;
          uploadedImageUrl = await uploadImgS3(this.selectedFile, key);
        }
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_splay_categories, {
            input: {
              action_type: "CREATE",
              question_interval: this.interval,
              splay_category_name: this.category,
              repository_source: "CUSTOM",
              splay_category_image: uploadedImageUrl,
            },
          }),
        );
        const resultObj = JSON.parse(
          result.data.create_list_edit_delete_splay_categories,
        );
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.Message,
          };
        }
        this.DialogCreateCategoryEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to create category, try again",
        };
      } finally {
        this.loading = false;
      }
    },
    DialogCreateCategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    openFilePicker() {
      this.$refs.fileInput.$el.querySelector("input").click();
    },
    OnFileSelect(file) {
      this.selectedFile = file || null;
      this.imageUrl = null;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
  },
};
</script>

<style scoped>
.preview-wrapper {
  height: 260px;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}
.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}
.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9e9e9e;
  text-align: center;
}
.clickable {
  cursor: pointer;
}
</style>
