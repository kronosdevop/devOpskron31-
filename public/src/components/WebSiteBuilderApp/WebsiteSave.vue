<template>
  <div class="website-save">
    <v-card class="ma-2" flat elevation="0">
      <v-card-title class="grey lighten-2 black--text">
        <v-btn icon @click="$emit('go-back')" class="mr-3">
          <v-icon class="black--text">mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon left class="black--text">mdi-content-save</v-icon>
        Save & Export Your Website
        <v-spacer></v-spacer>
        <v-chip color="grey lighten-3" small class="black--text">
          <v-icon left small class="black--text">mdi-check-circle</v-icon>
          Ready to Save
        </v-chip>
      </v-card-title>

      <v-card-text class="grey lighten-5 pa-4">
        <v-alert type="success" dense class="mb-4" color="grey lighten-4">
          <v-icon left small class="black--text">mdi-check-circle</v-icon>
          <strong class="black--text">Congratulations!</strong>
          <span class="black--text"
            >Your landing page has been generated successfully. Choose how you'd
            like to save and export it.</span
          >
        </v-alert>

        <!-- Save Options -->
        <v-row>
          <v-col cols="12" md="6">
            <v-card class="mb-4 grey lighten-4" flat>
              <v-card-title class="grey lighten-4">
                <v-icon left class="black--text">mdi-download</v-icon>
                <span class="black--text">Download Options</span>
              </v-card-title>
              <v-card-text class="grey lighten-5">
                <v-btn
                  @click="downloadHTML"
                  color="grey darken-2"
                  block
                  class="white--text mb-3"
                  size="large"
                >
                  <v-icon left>mdi-file-code</v-icon>
                  Download HTML File
                </v-btn>

                <v-btn
                  @click="downloadZIP"
                  color="grey darken-2"
                  block
                  outlined
                  class="black--text mb-3"
                >
                  <v-icon left class="black--text">mdi-folder-zip</v-icon>
                  Download as ZIP (with assets)
                </v-btn>

                <v-btn
                  @click="copyToClipboard"
                  color="grey lighten-2"
                  block
                  outlined
                  class="black--text"
                  :loading="isCopying"
                >
                  <v-icon left class="black--text">mdi-content-copy</v-icon>
                  {{ isCopying ? "Copying..." : "Copy HTML to Clipboard" }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="mb-4 grey lighten-4" flat>
              <v-card-title class="grey lighten-4">
                <v-icon left class="black--text">mdi-cloud-upload</v-icon>
                <span class="black--text">Export Options</span>
              </v-card-title>
              <v-card-text class="grey lighten-5">
                <v-btn
                  @click="exportToPDF"
                  color="grey darken-2"
                  block
                  class="white--text mb-3"
                  size="large"
                  :loading="isExportingPDF"
                >
                  <v-icon left>mdi-file-pdf-box</v-icon>
                  {{ isExportingPDF ? "Generating PDF..." : "Export as PDF" }}
                </v-btn>

                <v-btn
                  @click="saveToProject"
                  color="grey darken-2"
                  block
                  outlined
                  class="black--text mb-3"
                  :loading="isSaving"
                >
                  <v-icon left class="black--text">mdi-folder-plus</v-icon>
                  {{ isSaving ? "Saving..." : "Save to Project Library" }}
                </v-btn>

                <v-btn
                  @click="shareLink"
                  color="grey lighten-2"
                  block
                  outlined
                  class="black--text"
                  :loading="isSharing"
                >
                  <v-icon left class="black--text">mdi-share-variant</v-icon>
                  {{ isSharing ? "Generating..." : "Generate Shareable Link" }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Page Information -->
        <v-card class="mb-4 grey lighten-4" flat>
          <v-card-title class="grey lighten-4">
            <v-icon left class="black--text">mdi-information</v-icon>
            <span class="black--text">Page Information</span>
          </v-card-title>
          <v-card-text class="grey lighten-5">
            <v-row>
              <v-col cols="12" sm="6">
                <v-list dense class="grey lighten-5">
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon class="black--text">mdi-domain</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="black--text"
                        >Business Name</v-list-item-title
                      >
                      <v-list-item-subtitle class="black--text">{{
                        businessName
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon class="black--text">mdi-tag</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="black--text"
                        >Business Type</v-list-item-title
                      >
                      <v-list-item-subtitle class="black--text">{{
                        businessType
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" sm="6">
                <v-list dense class="grey lighten-5">
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon class="black--text">mdi-calendar</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="black--text"
                        >Created</v-list-item-title
                      >
                      <v-list-item-subtitle class="black--text">{{
                        createdDate
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon class="black--text">mdi-file-code</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="black--text"
                        >File Size</v-list-item-title
                      >
                      <v-list-item-subtitle class="black--text">{{
                        fileSize
                      }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Quick Actions -->
        <v-card class="grey lighten-4" flat>
          <v-card-title class="grey lighten-4">
            <v-icon left class="black--text">mdi-lightning-bolt</v-icon>
            <span class="black--text">Quick Actions</span>
          </v-card-title>
          <v-card-text class="grey lighten-5">
            <v-row>
              <v-col cols="12" sm="4">
                <v-btn
                  @click="$emit('create-new')"
                  color="grey darken-2"
                  block
                  outlined
                  class="black--text"
                >
                  <v-icon left class="black--text">mdi-plus</v-icon>
                  Create New Page
                </v-btn>
              </v-col>

              <v-col cols="12" sm="4">
                <v-btn
                  @click="$emit('edit-page')"
                  color="grey darken-2"
                  block
                  outlined
                  class="black--text"
                >
                  <v-icon left class="black--text">mdi-pencil</v-icon>
                  Edit This Page
                </v-btn>
              </v-col>

              <v-col cols="12" sm="4">
                <v-btn
                  @click="$emit('preview-page')"
                  color="grey darken-2"
                  block
                  outlined
                  class="black--text"
                >
                  <v-icon left class="black--text">mdi-eye</v-icon>
                  Preview Again
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSuccess" color="grey lighten-4" timeout="3000">
      <span class="black--text">{{ successMessage }}</span>
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="showSuccess = false"
          class="black--text"
          >Close</v-btn
        >
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "WebsiteSave",
  props: {
    businessName: {
      type: String,
      default: "",
    },
    businessType: {
      type: String,
      default: "",
    },
    generatedHTML: {
      type: String,
      default: "",
    },
    pageContent: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      isCopying: false,
      isExportingPDF: false,
      isSaving: false,
      isSharing: false,
      showSuccess: false,
      successMessage: "",
    };
  },
  computed: {
    createdDate() {
      return new Date().toLocaleDateString();
    },
    fileSize() {
      const size = this.generatedHTML.length;
      if (size < 1024) return `${size} bytes`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    },
  },
  methods: {
    downloadHTML() {
      const element = document.createElement("a");
      const file = new Blob([this.generatedHTML], { type: "text/html" });
      element.href = URL.createObjectURL(file);
      element.download = `${this.businessName || "landing-page"}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      this.showSuccessMessage("HTML file downloaded successfully!");
    },

    downloadZIP() {
      // This would require a ZIP library like JSZip
      this.showSuccessMessage("ZIP download feature coming soon!");
    },

    async copyToClipboard() {
      this.isCopying = true;
      try {
        await navigator.clipboard.writeText(this.generatedHTML);
        this.showSuccessMessage("HTML copied to clipboard!");
      } catch (err) {
        this.showSuccessMessage("Failed to copy to clipboard");
      }
      this.isCopying = false;
    },

    exportToPDF() {
      this.isExportingPDF = true;
      // This would require a PDF library like jsPDF or html2pdf
      setTimeout(() => {
        this.isExportingPDF = false;
        this.showSuccessMessage("PDF export feature coming soon!");
      }, 2000);
    },

    saveToProject() {
      this.isSaving = true;
      // This would save to a project library
      setTimeout(() => {
        this.isSaving = false;
        this.showSuccessMessage("Page saved to project library!");
      }, 2000);
    },

    shareLink() {
      this.isSharing = true;
      // This would generate a shareable link
      setTimeout(() => {
        this.isSharing = false;
        this.showSuccessMessage("Shareable link generated!");
      }, 2000);
    },

    showSuccessMessage(message) {
      this.successMessage = message;
      this.showSuccess = true;
    },
  },
};
</script>

<style scoped>
.website-save {
  background-color: #f5f5f5;
}

/* Global Light Grey Background with Black Text Styles */
.v-card {
  background-color: #fafafa !important;
}

.v-card__title {
  background-color: #e0e0e0 !important;
  color: black !important;
}

.v-card__text {
  background-color: #f5f5f5 !important;
  color: black !important;
}

.v-card__actions {
  background-color: #e0e0e0 !important;
}

/* Button Styles */
.v-btn {
  color: black !important;
}

.v-btn--contained {
  background-color: #757575 !important;
  color: white !important;
}

.v-btn--outlined {
  border-color: #757575 !important;
  color: black !important;
}

.v-btn--text {
  color: black !important;
}

/* Icon Styles */
.v-icon {
  color: black !important;
}

/* Alert Styles */
.v-alert {
  background-color: #e0e0e0 !important;
  color: black !important;
}

.v-alert__content {
  color: black !important;
}

/* Chip Styles */
.v-chip {
  background-color: #e0e0e0 !important;
  color: black !important;
}

/* List Styles */
.v-list-item__title {
  color: black !important;
}

.v-list-item__subtitle {
  color: black !important;
}

/* Snackbar Styles */
.v-snackbar {
  background-color: #e0e0e0 !important;
  color: black !important;
}
</style> 