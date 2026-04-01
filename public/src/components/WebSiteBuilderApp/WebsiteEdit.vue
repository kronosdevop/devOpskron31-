<template>
  <v-container>
    <!-- Header -->
    <v-app-bar color="primaryColor" dark elevation="0">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Edit Website Content</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="saveChanges"  color="primary"  rounded
      large>
        <v-icon left>mdi-content-save</v-icon>
        Save Changes
      </v-btn>
    </v-app-bar>

    <!-- SnackBar Component -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-container class="mt-8">
      <v-row>
        <v-col cols="12" md="3">
          <!-- Navigation Menu -->
          <v-card>
            <v-list>
              <v-list-item
                v-for="(tab, index) in tabs"
                :key="tab.name"
                @click="activeTab = index"
                :class="{ 'primary--text': activeTab === index }"
                class="d-flex align-center"
                style="gap: 12px;"
              >
                <v-icon>{{ tab.icon }}</v-icon>
                <span>{{ tab.name }}</span>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="9">
          <!-- Edit Content -->
          <v-card v-if="editableData && editableData.sections">
            <v-card-title>{{ tabs[activeTab].name }}</v-card-title>
            <v-card-text>
              <!-- Navigation Tab -->
              <div v-if="activeTab === 0">
                <v-text-field
                  v-model="editableData.sections.navigation.logo"
                  label="Logo/Company Name"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="navigationLinksInput"
                  label="Navigation Links (comma separated)"
                  variant="outlined"
                  density="compact"
                  hint="e.g., Home, About, Services, Contact"
                ></v-text-field>
              </div>

              <!-- Hero Tab -->
              <div v-if="activeTab === 1">
                <v-text-field
                  v-model="editableData.sections.hero.title"
                  label="Hero Title"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="editableData.sections.hero.subtitle"
                  label="Hero Subtitle"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  class="mb-4"
                ></v-textarea>
                <v-text-field
                  v-model="editableData.sections.hero.primaryButton"
                  label="Primary Button Text"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="editableData.sections.hero.secondaryButton"
                  label="Secondary Button Text"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="heroImageUrl"
                  label="Hero Image URL"
                  variant="outlined"
                  density="compact"
                  hint="Enter a valid image URL"
                ></v-text-field>
              </div>

              <!-- About Tab -->
              <div v-if="activeTab === 2">
                <v-text-field
                  v-model="editableData.sections.about.title"
                  label="About Title"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="editableData.sections.about.description"
                  label="About Description"
                  variant="outlined"
                  density="compact"
                  rows="4"
                  class="mb-4"
                ></v-textarea>
                <v-text-field
                  v-model="editableData.sections.about.image"
                  label="About Image URL"
                  variant="outlined"
                  density="compact"
                  hint="Enter a valid image URL"
                ></v-text-field>
              </div>

              <!-- Features Tab -->
              <div v-if="activeTab === 3">
                <div
                  v-for="(feature, index) in editableData.sections.features"
                  :key="index"
                  class="mb-6 pa-4"
                  style="border: 1px solid #e0e0e0; border-radius: 8px"
                >
                  <v-row>
                    <v-col cols="11">
                      <v-text-field
                        v-model="feature.title"
                        :label="`Feature ${index + 1} Title`"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                      ></v-text-field>
                      <v-textarea
                        v-model="feature.description"
                        :label="`Feature ${index + 1} Description`"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        class="mb-3"
                      ></v-textarea>
                      <v-text-field
                        v-model="feature.icon"
                        :label="`Feature ${
                          index + 1
                        } Icon (Material Design Icon)`"
                        variant="outlined"
                        density="compact"
                        hint="e.g., mdi-star, mdi-heart, mdi-check"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="1" class="d-flex align-center">
                      <v-btn icon color="error" @click="removeFeature(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
                <v-btn color="primary" @click="addFeature" class="mt-2">
                  <v-icon left>mdi-plus</v-icon>
                  Add Feature
                </v-btn>
              </div>

              <!-- Services Tab -->
              <div v-if="activeTab === 4">
                <div
                  v-for="(service, index) in editableData.sections.services"
                  :key="index"
                  class="mb-6 pa-4"
                  style="border: 1px solid #e0e0e0; border-radius: 8px"
                >
                  <v-row>
                    <v-col cols="11">
                      <v-text-field
                        v-model="service.title"
                        :label="`Service ${index + 1} Title`"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                      ></v-text-field>
                      <v-textarea
                        v-model="service.description"
                        :label="`Service ${index + 1} Description`"
                        variant="outlined"
                        density="compact"
                        rows="2"
                        class="mb-3"
                      ></v-textarea>
                      <v-text-field
                        v-model="service.link"
                        :label="`Service ${index + 1} Link Text`"
                        variant="outlined"
                        density="compact"
                        class="mb-3"
                      ></v-text-field>
                      <v-text-field
                        v-model="service.icon"
                        :label="`Service ${
                          index + 1
                        } Icon (Material Design Icon)`"
                        variant="outlined"
                        density="compact"
                        hint="e.g., mdi-star, mdi-heart, mdi-check"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="1" class="d-flex align-center">
                      <v-btn icon color="error" @click="removeService(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
                <v-btn color="primary" @click="addService" class="mt-2">
                  <v-icon left>mdi-plus</v-icon>
                  Add Service
                </v-btn>
              </div>

              <!-- Contact Tab -->
              <div v-if="activeTab === 5">
                <v-text-field
                  v-model="editableData.sections.contact.title"
                  label="Contact Title"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="editableData.sections.contact.subtitle"
                  label="Contact Subtitle"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  class="mb-4"
                ></v-textarea>
                <v-text-field
                  v-model="editableData.sections.contact.submitButton"
                  label="Submit Button Text"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </div>

              <!-- Footer Tab -->
              <div v-if="activeTab === 6">
                <v-text-field
                  v-model="editableData.sections.footer.logo"
                  label="Footer Logo/Company Name"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="editableData.sections.footer.text"
                  label="Footer Text"
                  variant="outlined"
                  density="compact"
                  rows="2"
                  class="mb-4"
                ></v-textarea>
                <v-text-field
                  v-model="footerLinksInput"
                  label="Footer Links (comma separated)"
                  variant="outlined"
                  density="compact"
                  hint="e.g., Privacy Policy, Terms of Service, Contact"
                ></v-text-field>
              </div>
            </v-card-text>
          </v-card>
          
          <!-- Loading state -->
          <v-card v-else>
            <v-card-text class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="mt-4">Loading website data...</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";

export default {
  name: "WebsiteEdit",
  components: {
    SnackBar,
  },
  data() {
    return {
      activeTab: 0,
      editableData: {
        sections: {
          navigation: { logo: "", links: [] },
          hero: { title: "", subtitle: "", primaryButton: "", secondaryButton: "", image: "" },
          about: { title: "", description: "", image: "" },
          features: [],
          services: [],
          contact: { title: "", subtitle: "", submitButton: "" },
          footer: { logo: "", text: "", links: [] }
        }
      },
      navigationLinksInput: "",
      footerLinksInput: "",
      heroImageUrl: "",
      SnackBarComponent: {},
      tabs: [
        { name: "Navigation", icon: "mdi-navigation" },
        { name: "Hero Section", icon: "mdi-star" },
        { name: "About", icon: "mdi-information" },
        { name: "Features", icon: "mdi-feature-search" },
        { name: "Services", icon: "mdi-cog" },
        { name: "Contact", icon: "mdi-phone" },
        { name: "Footer", icon: "mdi-page-layout-footer" },
      ],
    };
  },
  computed: {
    websiteData() {
      const raw = this.$store.getters.GetGeneratedData;
      if (!raw) return null;
      if (raw.sections) return raw;
      if (raw.data && raw.data.sections) return raw.data;
      return null;
    },
  },
  mounted() {
    this.initializeEditMode();
  },
  methods: {
    goBack() {
      this.$router.push("/home/WebsiteDeploy");
    },
    initializeEditMode() {
      if (!this.websiteData) {
        this.$router.push("/WebSiteBuilder");
        return;
      }

      // Deep clone the website data for editing
      this.editableData = JSON.parse(JSON.stringify(this.websiteData));

      // Initialize navigation links input
      this.navigationLinksInput =
        this.websiteData.sections.navigation.links.join(", ");

      // Initialize footer links input
      this.footerLinksInput = this.websiteData.sections.footer.links.join(", ");

      // Initialize hero image URL
      this.heroImageUrl = this.websiteData.sections.hero.image || "";
    },
    saveChanges() {
      // Update navigation links
      this.editableData.sections.navigation.links = this.navigationLinksInput
        .split(",")
        .map((link) => link.trim())
        .filter((link) => link.length > 0);

      // Update footer links
      this.editableData.sections.footer.links = this.footerLinksInput
        .split(",")
        .map((link) => link.trim())
        .filter((link) => link.length > 0);

      // Update hero image URL
      this.editableData.sections.hero.image = this.heroImageUrl;

      // Update the Vuex store with edited data
      this.$store.commit("SetGeneratedData", this.editableData);

      // Show success message
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: "Website content updated successfully!",
        timeout: 3000,
      };

      // Navigate back to deploy view
      setTimeout(() => {
        this.$router.push("/home/WebsiteDeploy");
      }, 1500);
    },
    addService() {
      this.editableData.sections.services.push({
        title: "New Service",
        description: "Service description",
        link: "Learn More",
        icon: "mdi-star",
      });
    },
    removeService(index) {
      this.editableData.sections.services.splice(index, 1);
    },
    addFeature() {
      this.editableData.sections.features.push({
        title: "New Feature",
        description: "Feature description",
        icon: "mdi-star",
      });
    },
    removeFeature(index) {
      this.editableData.sections.features.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
}
</style> 