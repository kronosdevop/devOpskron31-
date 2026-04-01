<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogCreateExternalTicket"
      max-width="550px"
      persistent
    >
      <v-card rounded="lg">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Create Ticket </span>
          <v-btn
            icon
            variant="text"
            @click="DialogCreateExternalTicketEmit(1)"
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
              <v-col cols="12" md="12">
                <div class="font-weight-bold">
                  Ticket Title <span class="text-error">*</span>
                </div>
                <v-text-field
                  v-model="ticket_title"
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

              <v-col cols="12" md="12">
                <div class="font-weight-bold mt-n2">Ticket Description</div>
                <v-textarea
                  v-model="ticket_description"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mt-1 ml-n1 pa-1"
                  maxlength="200"
                  :counter="200"
                  rows="3"
                  @input="userEditedDescription = true"
                />
              </v-col>

              <v-col cols="6" md="6">
                <div class="font-weight-bold mt-n4">Screenshot</div>
              </v-col>

              <v-col cols="12" md="12">
                <v-img
                  v-if="imagePreview"
                  :src="imagePreview"
                  height="180"
                  rounded="lg"
                  class="mt-1"
                  cover
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
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";

import axios from "axios";
import SnackBar from "../SnackBar.vue";

export default {
  props: {
    DialogCreateExternalTicket: Boolean,
    orgDetails: Object,
    screenshotFile: File,
  },

  mixins: [uploadToS3],

  components: { SnackBar },

  data: () => ({
    ticket_title: "",
    ticket_description: "",
    fileDisplayName: "",

    selectedFile: null,
    imagePreview: null,
    imageUrl: null,

    loading: false,
    isUploading: false,
    userEditedDescription: false,

    SnackBarComponent: {},

    TicketAssignmentItems: [
      { title: "Internal", value: "INTERNAL" },
      { title: "External", value: "EXTERNAL_STICHH" },
    ],
  }),

  watch: {
    DialogCreateExternalTicket(val) {
      if (val) {
        if (this.screenshotFile) {
          this.selectedFile = this.screenshotFile;
          this.fileDisplayName =
            this.screenshotFile.name || "Preloaded Screenshot";
          const reader = new FileReader();
          reader.onload = async (e) => {
            this.imagePreview = e.target.result;
            await this.uploadImage();
          };
          reader.readAsDataURL(this.screenshotFile);
        }
        this.userEditedDescription = false;
      } else {
        this.$refs.form.reset();
        this.imagePreview = null;
        this.selectedFile = null;
        this.imageUrl = null;
        this.userEditedDescription = false;
      }
    },
  },

  computed: {
    ticketTypeList() {
      return this.ListAllTicketTypes.map((ticket) => ({
        title: ticket.ticket_type_name,
        value: ticket.ticket_type_id,
      }));
    },
    currentUserEmail() {
      return this.$store.getters.GetUserEmail;
    },
    currentUserName() {
      return this.$store.getters.GetUserName;
    },
  },

  methods: {
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
        this.CreateTicket();
      }
    },
    async CreateTicket() {
      this.loading = true;
      try {
        const payload = {
          command: "createExtTicket",
          category_id: "686f7388-d355-42bc-b9e3-34791bea2adf",
          title: this.ticket_title,
          description: this.ticket_description,
          attachments: this.imageUrl,
          initial_comment: this.ticket_description,
          initiator_email_id: this.currentUserEmail,
        };
        const response = await axios.post(
          "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/create_ext_ticket",
          payload
        );
        let resultObj = response.data;
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
          this.DialogCreateExternalTicketEmit(2);
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
    DialogCreateExternalTicketEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    handleFileChange(file) {
      if (file) {
        this.selectedFile = file;
        this.fileDisplayName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
        };
        reader.onerror = () => {
          this.imagePreview = null;
        };
        reader.readAsDataURL(file);
        this.imageUrl = null;
      } else {
        this.selectedFile = null;
        this.fileDisplayName = "";
        this.imagePreview = null;
        this.imageUrl = null;
      }
    },
    onImageError() {
      this.imagePreview = null;
    },
  },
};
</script>
