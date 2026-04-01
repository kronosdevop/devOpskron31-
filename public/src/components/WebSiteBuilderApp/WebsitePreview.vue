<template>
  <div class="website-preview">
    <v-card class="ma-2" flat elevation="0">
      <v-card-title class="grey lighten-2 black--text">
        <v-btn icon @click="$emit('go-back')" class="mr-3">
          <v-icon class="black--text">mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon left class="black--text">mdi-eye</v-icon>
        Your Landing Page Preview
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="viewMode" mandatory>
          <v-btn value="preview" small>
            <v-icon class="black--text">mdi-eye</v-icon>
          </v-btn>
          <v-btn value="builder" small>
            <v-icon class="black--text">mdi-pencil</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-card-title>

      <v-card-text class="grey lighten-5 pa-0">
        <!-- Preview Mode -->
        <div v-if="viewMode === 'preview'" class="preview-container">
          <div class="preview-header grey lighten-4 pa-3">
            <v-row align="center">
              <v-col cols="12" sm="6">
                <h3 class="black--text mb-0">
                  {{ businessName || "Your Business" }}
                </h3>
                <p class="black--text mb-0">
                  {{ businessType || "Business Type" }}
                </p>
              </v-col>
              <v-col cols="12" sm="6" class="text-right">
                <v-btn
                  @click="downloadHTML"
                  color="grey darken-2"
                  small
                  class="white--text"
                >
                  <v-icon left small>mdi-download</v-icon>
                  Download HTML
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <div class="preview-content grey lighten-5 pa-4">
            <div v-html="generatedHTML" class="preview-html"></div>
          </div>
        </div>

        <!-- Builder Mode -->
        <div v-else class="builder-container grey lighten-5 pa-4">
          <v-alert type="info" dense class="mb-4" color="grey lighten-4">
            <v-icon left small class="black--text">mdi-pencil</v-icon>
            <strong class="black--text">Builder Mode:</strong>
            <span class="black--text"
              >Click the edit icons to customize each section of your landing
              page.</span
            >
          </v-alert>

          <!-- Hero Section -->
          <v-card class="mb-4 grey lighten-4" flat>
            <v-card-title class="grey lighten-4">
              <v-icon left class="black--text">mdi-star</v-icon>
              <span class="black--text">Hero Section</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="editSection('hero')" small>
                <v-icon class="black--text">mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="grey lighten-5">
              <div class="section-content">
                <h2 class="black--text">
                  {{ pageContent.hero?.title || "Hero Title" }}
                </h2>
                <p class="black--text">
                  {{ pageContent.hero?.subtitle || "Hero Subtitle" }}
                </p>
                <v-btn color="grey darken-2" class="white--text">
                  {{ pageContent.hero?.cta || "Call to Action" }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Features Section -->
          <v-card class="mb-4 grey lighten-4" flat>
            <v-card-title class="grey lighten-4">
              <v-icon left class="black--text">mdi-format-list-bulleted</v-icon>
              <span class="black--text">Features Section</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="editSection('features')" small>
                <v-icon class="black--text">mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="grey lighten-5">
              <div class="section-content">
                <v-row>
                  <v-col
                    v-for="(feature, index) in pageContent.features"
                    :key="index"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-card class="grey lighten-5" flat>
                      <v-card-text class="text-center">
                        <v-icon size="48" class="black--text mb-3">{{
                          feature.icon
                        }}</v-icon>
                        <h4 class="black--text">{{ feature.title }}</h4>
                        <p class="black--text">{{ feature.description }}</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <!-- About Section -->
          <v-card class="mb-4 grey lighten-4" flat>
            <v-card-title class="grey lighten-4">
              <v-icon left class="black--text">mdi-information</v-icon>
              <span class="black--text">About Section</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="editSection('about')" small>
                <v-icon class="black--text">mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="grey lighten-5">
              <div class="section-content">
                <v-row align="center">
                  <v-col cols="12" md="8">
                    <h2 class="black--text">
                      {{ pageContent.about?.title || "About Us" }}
                    </h2>
                    <p class="black--text">
                      {{
                        pageContent.about?.description || "About description"
                      }}
                    </p>
                  </v-col>
                  <v-col cols="12" md="4" class="text-center">
                    <v-img
                      :src="
                        pageContent.about?.image ||
                        'https://via.placeholder.com/300x200'
                      "
                      height="200"
                      class="rounded"
                    ></v-img>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <!-- Contact Section -->
          <v-card class="mb-4 grey lighten-4" flat>
            <v-card-title class="grey lighten-4">
              <v-icon left class="black--text">mdi-phone</v-icon>
              <span class="black--text">Contact Section</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="editSection('contact')" small>
                <v-icon class="black--text">mdi-pencil</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text class="grey lighten-5">
              <div class="section-content text-center">
                <h2 class="black--text">
                  {{ pageContent.contact?.title || "Get In Touch" }}
                </h2>
                <p class="black--text">
                  {{
                    pageContent.contact?.description || "Contact description"
                  }}
                </p>
                <v-btn color="grey darken-2" class="white--text">
                  {{ pageContent.contact?.cta || "Contact Us" }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Section Editor Dialog -->
    <v-dialog v-model="showSectionDialog" max-width="800px">
      <v-card class="grey lighten-5">
        <v-card-title class="grey lighten-4 black--text">
          <v-icon left class="black--text">mdi-pencil</v-icon>
          Edit {{ editingSection }} Section
          <v-spacer></v-spacer>
          <v-btn icon @click="showSectionDialog = false">
            <v-icon class="black--text">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="grey lighten-5">
          <div v-if="editingSection === 'hero'">
            <v-text-field
              v-model="editingContent.title"
              label="Title"
              outlined
              dense
              class="mb-3"
              background-color="grey lighten-4"
            ></v-text-field>
            <v-textarea
              v-model="editingContent.subtitle"
              label="Subtitle"
              outlined
              dense
              rows="3"
              class="mb-3"
              background-color="grey lighten-4"
            ></v-textarea>
            <v-text-field
              v-model="editingContent.cta"
              label="Call to Action"
              outlined
              dense
              background-color="grey lighten-4"
            ></v-text-field>
          </div>

          <div v-else-if="editingSection === 'features'">
            <div
              v-for="(feature, index) in editingContent"
              :key="index"
              class="mb-4 pa-3 grey lighten-4 rounded"
            >
              <h4 class="black--text mb-2">Feature {{ index + 1 }}</h4>
              <v-text-field
                v-model="feature.icon"
                label="Icon"
                outlined
                dense
                class="mb-2"
                background-color="grey lighten-4"
              ></v-text-field>
              <v-text-field
                v-model="feature.title"
                label="Title"
                outlined
                dense
                class="mb-2"
                background-color="grey lighten-4"
              ></v-text-field>
              <v-textarea
                v-model="feature.description"
                label="Description"
                outlined
                dense
                rows="2"
                background-color="grey lighten-4"
              ></v-textarea>
            </div>
          </div>

          <div v-else-if="editingSection === 'about'">
            <v-text-field
              v-model="editingContent.title"
              label="Title"
              outlined
              dense
              class="mb-3"
              background-color="grey lighten-4"
            ></v-text-field>
            <v-textarea
              v-model="editingContent.description"
              label="Description"
              outlined
              dense
              rows="4"
              class="mb-3"
              background-color="grey lighten-4"
            ></v-textarea>
            <v-text-field
              v-model="editingContent.image"
              label="Image URL"
              outlined
              dense
              background-color="grey lighten-4"
            ></v-text-field>
          </div>

          <div v-else-if="editingSection === 'contact'">
            <v-text-field
              v-model="editingContent.title"
              label="Title"
              outlined
              dense
              class="mb-3"
              background-color="grey lighten-4"
            ></v-text-field>
            <v-textarea
              v-model="editingContent.description"
              label="Description"
              outlined
              dense
              rows="3"
              class="mb-3"
              background-color="grey lighten-4"
            ></v-textarea>
            <v-text-field
              v-model="editingContent.cta"
              label="Call to Action"
              outlined
              dense
              background-color="grey lighten-4"
            ></v-text-field>
          </div>
        </v-card-text>
        <v-card-actions class="grey lighten-4">
          <v-spacer></v-spacer>
          <v-btn
            @click="showSectionDialog = false"
            color="grey darken-2"
            class="white--text"
          >
            Cancel
          </v-btn>
          <v-btn @click="saveSection" color="grey darken-2" class="white--text">
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "WebsitePreview",
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
      default: () => ({
        hero: {
          title: "Welcome to Our Businessfj",
          subtitle: "We provide amazing solutions for your needs",
          cta: "Get Started",
        },
        features: [
          {
            icon: "mdi-rocket",
            title: "Fast & Reliable",
            description: "Lightning-fast performance you can count on",
          },
          {
            icon: "mdi-shield-check",
            title: "Secure",
            description:
              "Your data is protected with enterprise-grade security",
          },
          {
            icon: "mdi-headset",
            title: "24/7 Support",
            description: "Round-the-clock support whenever you need us",
          },
        ],
        about: {
          title: "About Us",
          description:
            "We are a passionate team dedicated to delivering exceptional solutions.",
          image: "https://via.placeholder.com/400x300",
        },
        contact: {
          title: "Get In Touch",
          description: "Ready to get started? Contact us today!",
          cta: "Contact Us",
        },
      }),
    },
  },
  data() {
    return {
      viewMode: "preview",
      showSectionDialog: false,
      editingSection: "",
      editingContent: {},
    };
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
    },

    editSection(section) {
      this.editingSection = section;
      this.editingContent = JSON.parse(
        JSON.stringify(this.pageContent[section])
      );
      this.showSectionDialog = true;
    },
    
    saveSection() {
      this.$emit("update-section", {
        section: this.editingSection,
        content: this.editingContent,
      });
      this.showSectionDialog = false;
    },
    getIndexHtmlFile() {
      const htmlBlob = new Blob([this.generatedHTML], { type: "text/html" });
      return new File([htmlBlob], "index.html", { type: "text/html" });
    },
    async deployToWebsite() {
      try {
        const htmlFile = this.getIndexHtmlFile();
       // console.log(htmlFile);
        // S3 details and key
        // const s3_details = {
        //   bucket_name: "your-bucket-name",
        //   region: "your-region",
        // };
        // const key = "index.html";

        // // Upload using your helper
        // const fileUrl = await uploadToS3(htmlFile, s3_details, key);

        // if (fileUrl) {
        //   this.$vuetify.snackbar.show({
        //     text: "Website deployed successfully!",
        //     color: "success",
        //   });
        // } else {
        //   throw new Error("Upload failed");
        // }
      } catch (err) {
        // this.$vuetify.snackbar.show({
        //   text: "Failed to deploy: " + err.message,
        //   color: "error",
        // });
      }
    },
  },
};
</script>

<style scoped>
.website-preview {
  background-color: #f5f5f5;
}

.preview-container {
  background-color: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  border-bottom: 1px solid #e0e0e0;
}

.preview-content {
  min-height: 400px;
}

.preview-html {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.builder-container {
  min-height: 400px;
}

.section-content {
  background-color: white;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

/* Ensure all text in the preview is black */
.preview-html :deep(*) {
  color: black !important;
}

.section-content :deep(*) {
  color: black !important;
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

/* Dialog Styles */
.v-dialog .v-card {
  background-color: #fafafa !important;
}

.v-dialog .v-card__title {
  background-color: #e0e0e0 !important;
  color: black !important;
}

.v-dialog .v-card__text {
  background-color: #f5f5f5 !important;
  color: black !important;
}

.v-dialog .v-card__actions {
  background-color: #e0e0e0 !important;
}

/* Form Field Styles */
.v-input__slot {
  background-color: #fafafa !important;
}

.v-textarea__slot textarea {
  color: black !important;
}

.v-label {
  color: black !important;
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

/* Toggle Button Styles */
.v-btn-toggle .v-btn {
  background-color: #e0e0e0 !important;
  color: black !important;
}

.v-btn-toggle .v-btn--active {
  background-color: #757575 !important;
  color: white !important;
}

/* Preview Content Styles */
.preview-html {
  background-color: white !important;
}

.section-content {
  background-color: white !important;
}

/* Form Background Overrides */
.v-textarea--outlined .v-input__slot {
  background-color: #fafafa !important;
}
</style> 