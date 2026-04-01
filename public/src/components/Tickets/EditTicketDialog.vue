<template>
  <div>
    <v-dialog :model-value="DialogEditTicket" max-width="650px">
      <v-card rounded="lg">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Edit Internal Ticket</span>
          <v-btn
            icon
            variant="text"
            @click="DialogEditTicketEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!--Form Fields-->
        <div style="max-height: 500px; overflow-y: auto">
          <v-form ref="form">
            <v-row no-gutters class="pa-4">
              <!--Ticket Title-->
              <v-col cols="12" md="12">
                <div class="font-weight-bold ml-2">
                  Ticket Title <span class="text-error">*</span>
                </div>
                <v-text-field
                  v-model="edited_ticket_title"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mt-1 ml-n1 pa-1"
                  maxlength="100"
                  :counter="100"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) =>
                      (v && v.length <= 100) ||
                      'Title must be 100 characters or less',
                  ]"
                />
              </v-col>

              <!--Ticket Description-->
              <v-col cols="12" md="12">
                <div class="font-weight-bold ml-2 mt-n2">
                  Ticket Description
                </div>
                <v-textarea
                  v-model="edited_ticket_description"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mt-1 ml-n1 pa-1"
                  @input="userEditedDescription = true"
                  maxlength="200"
                  :counter="200"
                />
              </v-col>

              <!--Attachments-->
              <v-col cols="6" md="6">
                <div class="font-weight-bold mt-n3">Attachments</div>
                <v-file-input
                  v-model="selectedFile"
                  variant="outlined"
                  rounded="xl"
                  width="300"
                  class="mt-2"
                  accept="image/png, image/jpeg"
                  @update:model-value="handleFileChange"
                  density="compact"
                />
              </v-col>

              <!--Image Preview (Existing or Newly Uploaded)-->
              <v-col cols="12" md="12">
                <v-img
                  v-if="imagePreview"
                  :src="imagePreview"
                  height="230"
                  width="700"
                  rounded="lg"
                  contain
                  class="mt-n10"
                  @error="onImageError"
                />
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!--Button-->
        <v-card-actions class="d-flex jutify-end mt-n4">
          <v-btn
            rounded="lg"
            color="primary"
            class="mb-1 mr-1"
            @click="ValidateForm"
            :loading="loading"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { update_ticket } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: { DialogEditTicket: Boolean, orgDetails: Object, StoreObj: Object },

  mixins: [uploadToS3],

  data: () => ({
    edited_ticket_title: "",
    edited_ticket_description: "",

    selectedFile: null,
    imagePreview: null,
    imageUrl: null,

    loading: false,
    isUploading: false,
    userEditedDescription: false,

    existingAttachments: [],
    ListAllCategories: [],
    ListAllTicketTypes: [],
  }),

  watch: {
    async DialogEditTicket(val) {
      if (val) {
        this.edited_ticket_title = this.StoreObj.title;
        this.edited_category = this.StoreObj.category_id;
        this.edited_subcategory = this.StoreObj.ticket_type_id;
        this.edited_ticket_description = this.StoreObj.description;
        this.existingAttachments = Array.isArray(this.StoreObj.attachments)
          ? this.StoreObj.attachments
          : this.StoreObj.attachments
          ? [this.StoreObj.attachments]
          : [];
        this.imagePreview = this.existingAttachments[0] || null;
        this.imageUrl = this.existingAttachments[0] || null;
        this.userEditedDescription = false;
        if (this.imageUrl) {
          try {
            const response = await fetch(this.imageUrl);
            const blob = await response.blob();
            this.selectedFile = new File([blob], "existing_image.jpg", {
              type: blob.type,
            });
          } catch (e) {
            console.warn("Failed to load remote image file");
            this.selectedFile = null;
          }
        }
      } else {
        this.$refs.form.reset();
        this.existingAttachments = [];
        this.imagePreview = null;
        this.selectedFile = null;
        this.imageUrl = null;
        this.userEditedDescription = false;
      }
    },
    ticket_title(newVal) {
      if (!this.userEditedDescription) {
        this.edited_ticket_description = newVal;
      }
    },
  },

  methods: {
    async handleFileChange(file) {
      if (file) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.onerror = () => {
          this.imagePreview = null;
        };
        reader.readAsDataURL(file);

        await this.uploadImage();
      } else {
        this.selectedFile = null;
        this.imagePreview = null;
        this.imageUrl = null;
      }
    },
    async uploadImage() {
      try {
        this.isUploading = true;
        const timestamp = Date.now();
        const key = `tickets/${timestamp}_${this.selectedFile.name}`;
        this.imageUrl = await uploadToS3(
          this.selectedFile,
          this.orgDetails,
          key
        );
      } catch (error) {
        this.imageUrl = null;
      }
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.EditTicket();
      }
    },
    async EditTicket() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(update_ticket, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
              title: this.edited_ticket_title,
              description: this.edited_ticket_description,
              attachments: this.imageUrl || this.StoreObj.attachments,
            },
          })
        );
        let resultObj = JSON.parse(result.data.update_ticket);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
          this.DialogEditTicketEmit(2);
          this.$refs.form.reset();
          this.imagePreview = null;
          this.selectedFile = null;
          this.imageUrl = null;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
          this.$refs.form.reset();
          this.imagePreview = null;
          this.selectedFile = null;
          this.imageUrl = null;
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to create Ticket, try again!",
        };
      } finally {
        this.loading = false;
      }
    },
    onImageError() {
      this.imagePreview = null;
    },
    DialogEditTicketEmit(Toggle) {
      this.isEditing = false;
      this.$emit("clicked", Toggle);
    },
  },
};
</script>
