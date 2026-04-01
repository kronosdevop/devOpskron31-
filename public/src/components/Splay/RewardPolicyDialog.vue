<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogRewardPolicy" max-width="700px" persistent>
      <v-card rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Reward Policy </span>
          <v-btn
            icon
            variant="text"
            @click="DialogRewardPolicyEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--File Input-->
        <div class="pa-5">
          <v-file-input
            ref="fileInput"
            accept="image/*"
            class="d-none"
            @update:model-value="onFileSelect"
          />
          <div class="preview-wrapper clickable" @click="openFilePicker">
            <v-img
              v-if="imageUrl"
              :src="imageUrl"
              aspect-ratio="16/9"
              class="preview-image"
              cover
            >
              <v-btn
                icon
                size="x-small"
                color="red"
                class="remove-btn"
                @click.stop="removeImage"
              >
                <v-icon size="14">mdi-close</v-icon>
              </v-btn>
            </v-img>
            <div v-else class="preview-placeholder">
              <v-icon size="48">mdi-image-plus</v-icon>
              <div class="mt-2">Click to upload image</div>
            </div>
          </div>

          <!--Email Editor-->
          <div class="mt-3">
            <vue-editor v-model="email" />
          </div>
        </div>

        <!--Buttons-->
        <v-card-actions class="d-flex justify-center">
          <v-btn
            variant="flat"
            rounded="lg"
            size="small"
            color="primary"
            class="hover-elevate"
            :loading="updateLoading"
            @click="UpdateRewardPolicy"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VueEditor } from "vue3-editor";

import { uploadToS3 } from "@/mixins/uploadToS3.js";
import { getS3SignedUrl } from "@/mixins/GetFromS3";
import { GetRewardPolicy } from "@/mixins/GetRewardPolicy";

import { manage_splay_awards_policies } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogRewardPolicy: Boolean },

  mixins: [GetRewardPolicy, uploadToS3, getS3SignedUrl],

  components: { VueEditor, SnackBar },

  data: () => ({
    email: "",

    updateLoading: false,

    imageUrl: null,
    selectedFile: null,

    SnackBarComponent: {},
  }),

  watch: {
    async DialogRewardPolicy(val) {
      if (val) {
        await this.GetRewardPolicyMethod();
        this.email = this.ListRewardPolicy?.[0]?.policy_document || "";
        this.imageUrl =
          (await getS3SignedUrl(
            this.ListRewardPolicy?.[0]?.policy_image_url,
          )) || null;
      }
    },
  },

  async mounted() {
    await this.GetRewardPolicyMethod();
  },

  methods: {
    async UpdateRewardPolicy() {
      this.updateLoading = true;

      try {
        let uploadedImageUrl = null;

        if (this.selectedFile) {
          const key = `rewardpolicy/${Date.now()}-${this.selectedFile.name}`;

          uploadedImageUrl = await uploadToS3(this.selectedFile, key);
        }

        const result = await API.graphql(
          graphqlOperation(manage_splay_awards_policies, {
            input: {
              action_type: "UPDATE",
              policy_image_url: uploadedImageUrl || "",
              policy_document: this.email,
            },
          }),
        );
        let resultObj = JSON.parse(result.data.manage_splay_awards_policies);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.Message,
          };
        }
        this.DialogRewardPolicyEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to update policy, try again",
        };
      } finally {
        this.updateLoading = false;
      }
    },
    DialogRewardPolicyEmit(Toggle) {
      this.$emit("clicked", Toggle);
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
    openFilePicker() {
      this.$refs.fileInput.$el.querySelector("input").click();
    },
    removeImage() {
      this.imageUrl = null;
      this.selectedFile = null;
      const input = this.$refs.fileInput?.$el?.querySelector("input");
      if (input) input.value = "";
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
.remove-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.65);
}
</style>
