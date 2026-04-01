<template>
  <div>
    <!-- eslint-disable  -->
    <v-dialog
      :model-value="viewEmailInfoDialog"
      @update:model-value="$emit('update:viewEmailInfoDialog', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" r class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">View Email Logs</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="12">
              <p>
                CC:
                <b>{{
                  ViewInfo.email_cc_address && ViewInfo.email_cc_address.length
                    ? ViewInfo.email_cc_address.join(", ")
                    : "N/A"
                }}</b>
              </p>
              <p>
                From: <b>{{ ViewInfo.email_sent_from || "N/A" }}</b>
              </p>
              <p>
                To: <b>{{ ViewInfo.email_sent_to || "N/A" }}</b>
              </p>
              <p>
                Subject: <b>{{ ViewInfo.subject || "N/A" }}</b>
              </p>
              <v-card class="mb-4" outlined style="border: 1px solid black">
                <v-card-text v-html="ViewInfo.template"></v-card-text>
              </v-card>
              <p>
                Attachments: <b>{{ getFileName(ViewInfo.attachment_url) }}</b>
                <v-icon
                  class="ml-4"
                  color="green"
                  @click="downloadAttachment(ViewInfo.attachment_url)"
                >
                  mdi-download
                </v-icon>
              </p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
const FileSaver = require("file-saver");
import axios from "axios";

export default {
  props: {
    viewEmailInfoDialog: Boolean,
    ViewInfo: Object,
  },
  data() {
    return {};
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    getFileName(url) {
      if (!url) return "N/A";
      return url.split("/").pop(); // Extracts the filename
    },

    async downloadAttachment(url) {
      if (!url) return;

      try {
        const response = await axios({
          url: url, // Directly use the URL
          method: "GET",
          responseType: "blob",
        });

        // Extract the file name from URL
        const fileName = this.getFileName(url);

        // Save the file
        FileSaver.saveAs(new Blob([response.data]), fileName);
      } catch (error) {
        console.error("Download failed:", error);
      }
    },
  },
};
</script>
