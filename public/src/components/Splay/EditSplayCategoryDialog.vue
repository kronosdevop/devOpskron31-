<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogEditSplayCategory"
      max-width="650px"
      persistent
    >
      <v-card>
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Edit Category </span>
          <v-btn
            icon
            variant="text"
            @click="DialogEditSplayCategoryEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Form Field-->
        <div class="pa-5">
          <v-row>
            <!--Category Name-->
            <v-col cols="6">
              <div class="font-weight-bold mt-n3">Category Name</div>
              <v-text-field
                v-model="updated_category"
                variant="outlined"
                rounded="lg"
                density="compact"
                max-width="450"
                class="mt-2"
                prepend-inner-icon="mdi-view-list"
              />
            </v-col>

            <!--Question Intervals-->
            <v-col cols="6">
              <div class="font-weight-bold mt-n3">Question Interval</div>
              <v-select
                v-model="updated_interval"
                variant="outlined"
                rounded="lg"
                density="compact"
                max-width="450"
                class="mt-2"
                prepend-inner-icon="mdi-clock-outline"
                :items="intervalItems"
                :rules="[(v) => !!v || 'Required']"
              />
            </v-col>

            <!--File Input & Preview-->
            <v-col cols="12">
              <!--File Input-->
              <v-file-input
                ref="fileInput"
                accept="image/*"
                class="d-none"
                @update:model-value="onFileSelect"
              />
              <!--Preview-->
              <div class="font-weight-bold mt-n3">
                Image (To represent category)
              </div>
              <div
                class="preview-wrapper clickable mt-3"
                @click="openFilePicker"
              >
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
        </div>

        <!--Button-->
        <v-card-actions class="d-flex justify-center mt-n5">
          <v-btn
            size="small"
            variant="flat"
            color="primary"
            @click="EditCategory"
            :loading="loading"
            flat
          >
            Update
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
import { uploadImgS3 } from "@/mixins/S3Upload";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogEditSplayCategory: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    updated_category: "",
    updated_interval: "10",

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
    DialogEditSplayCategory(val) {
      if (!val) return;
      this.updated_category = this.StoreObj.splay_category_name;
      this.updated_interval = this.StoreObj.question_interval || 10;
      this.selectedFile = null;
      this.imageUrl = this.StoreObj.splay_category_image || null;
    },
  },

  methods: {
    async EditCategory() {
      this.loading = true;
      try {
        let finalImageUrl = this.StoreObj.splay_category_image;

        if (this.selectedFile) {
          const key = `categories/${Date.now()}-${this.selectedFile.name}`;
          finalImageUrl = await uploadImgS3(this.selectedFile, key);
        }

        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_splay_categories, {
            input: {
              action_type: "UPDATE",
              splay_category_id: this.StoreObj.splay_category_id,
              splay_category_name: this.updated_category,
              question_interval: parseInt(this.updated_interval),
              splay_category_image: finalImageUrl,
            },
          }),
        );
        const resultObj = JSON.parse(
          result.data.create_list_edit_delete_splay_categories,
        );
        if (resultObj?.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.Message,
          };
          this.DialogEditSplayCategoryEmit(2);
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to update category, try again",
        };
      } finally {
        this.loading = false;
      }
    },
    openFilePicker() {
      this.$refs.fileInput.$el.querySelector("input").click();
    },
    onFileSelect(file) {
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
    DialogEditSplayCategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
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
