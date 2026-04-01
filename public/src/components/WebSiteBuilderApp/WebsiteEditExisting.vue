<template>
  <div class="website-edit-existing">
    <v-container fluid class="pa-0">
      <!-- Header -->
      <v-app-bar color="primaryColor" dark elevation="0">
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>Edit Website Content</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          class="website-builder-btn"
          @click="saveChanges"
          :loading="isSaving"
          :disabled="!hasChanges"
          elevation="2"
          rounded
          large
        >
          <v-icon left>mdi-content-save</v-icon>
          Save Changes
        </v-btn>
      </v-app-bar>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center pa-8">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        ></v-progress-circular>
        <div class="mt-4 text-h6">Loading website content...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center pa-8">
        <v-alert
          type="error"
          class="mx-auto"
          max-width="500"
        >
          <template v-slot:prepend>
            <v-icon>mdi-alert-circle</v-icon>
          </template>
          {{ error }}
          <v-btn
            color="primary"
            class="mt-3"
            @click="fetchWebsiteData"
          >
            Try Again
          </v-btn>
        </v-alert>
      </div>

      <!-- Edit Content -->
      <div v-else class="edit-content">
        <v-row>
          <!-- Sidebar -->
          <v-col cols="12" md="3" class="sidebar">
            <v-card class="pa-4" elevation="2">
              <h3 class="text-h6 mb-4">Website Sections</h3>
              <v-list dense>
                <v-list-item
                  v-for="(section, key) in websiteData"
                  :key="key"
                  @click="activeSection = key"
                  :class="['section-list-item', { 'active-section': activeSection === key }]"
                  rounded
                  style="cursor:pointer;"
                >
                  <v-icon class="mr-3">{{ getSectionIcon(key) }}</v-icon>
                  <span class="section-title">{{ key.charAt(0).toUpperCase() + key.slice(1) }}</span>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- Main Content -->
          <v-col cols="12" md="9" class="main-content">
            <v-card class="pa-6" elevation="2">
              <!-- Hero Section -->
              <div v-if="activeSection === 'hero'">
                <h2 class="text-h5 mb-4">Hero Section</h2>
                <v-text-field
                  v-model="websiteData.hero.title"
                  label="Hero Title"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="websiteData.hero.subtitle"
                  label="Hero Subtitle"
                  variant="outlined"
                  rows="3"
                  class="mb-4"
                ></v-textarea>
                <v-text-field
                  v-model="websiteData.hero.cta_text"
                  label="Call to Action Text"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="websiteData.hero.cta_link"
                  label="Call to Action Link"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="websiteData.hero.image"
                  label="Hero Image URL"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
              </div>

              <!-- About Section -->
              <div v-if="activeSection === 'about'">
                <h2 class="text-h5 mb-4">About Section</h2>
                <v-text-field
                  v-model="websiteData.about.title"
                  label="About Title"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="websiteData.about.content"
                  label="About Content"
                  variant="outlined"
                  rows="6"
                  class="mb-4"
                ></v-textarea>
                <v-text-field
                  v-model="websiteData.about.image"
                  label="About Image URL"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
              </div>

              <!-- Services Section -->
              <div v-if="activeSection === 'services'">
                <h2 class="text-h5 mb-4">Services Section</h2>
                <v-text-field
                  v-model="websiteData.services.title"
                  label="Services Title"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="websiteData.services.subtitle"
                  label="Services Subtitle"
                  variant="outlined"
                  rows="3"
                  class="mb-4"
                ></v-textarea>
                
                <h3 class="text-h6 mb-3">Service Items</h3>
                <div
                  v-for="(service, index) in websiteData.services.items"
                  :key="index"
                  class="service-item mb-4 pa-4 border rounded"
                >
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="service.title"
                        :label="`Service ${index + 1} Title`"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="service.icon"
                        :label="`Service ${index + 1} Icon`"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-textarea
                    v-model="service.description"
                    :label="`Service ${index + 1} Description`"
                    variant="outlined"
                    rows="3"
                    density="compact"
                  ></v-textarea>
                  <v-btn
                    color="error"
                    small
                    @click="removeService(index)"
                    class="mt-2"
                  >
                    Remove Service
                  </v-btn>
                </div>
                <v-btn
                  color="primary"
                  @click="addService"
                  class="mt-2"
                >
                  Add Service
                </v-btn>
              </div>

              <!-- Contact Section -->
              <div v-if="activeSection === 'contact'">
                <h2 class="text-h5 mb-4">Contact Section</h2>
                <v-text-field
                  v-model="websiteData.contact.title"
                  label="Contact Title"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="websiteData.contact.content"
                  label="Contact Content"
                  variant="outlined"
                  rows="4"
                  class="mb-4"
                ></v-textarea>
                <v-text-field
                  v-model="websiteData.contact.email"
                  label="Contact Email"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="websiteData.contact.phone"
                  label="Contact Phone"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-text-field
                  v-model="websiteData.contact.address"
                  label="Contact Address"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
              </div>

              <!-- Footer Section -->
              <div v-if="activeSection === 'footer'">
                <h2 class="text-h5 mb-4">Footer Section</h2>
                <v-text-field
                  v-model="websiteData.footer.copyright"
                  label="Copyright Text"
                  variant="outlined"
                  class="mb-4"
                ></v-text-field>
                <v-textarea
                  v-model="websiteData.footer.links"
                  label="Footer Links (one per line)"
                  variant="outlined"
                  rows="4"
                  class="mb-4"
                  hint="Enter each link on a new line"
                  persistent-hint
                ></v-textarea>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
    
    <!-- SnackBar for notifications -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { Auth } from 'aws-amplify';
import { Storage } from 'aws-amplify';
import { uploadToS3 } from '@/mixins/S3PutStorageFile.js';
import { generateWebsiteEditHTML } from '@/utils/websiteEditHtml.js';
import SnackBar from "@/components/SnackBar.vue";

export default {
  name: 'WebsiteEditExisting',
  components: {
    SnackBar,
  },
  data() {
    return {
      isLoading: false,
      isSaving: false,
      error: null,
      activeSection: 'hero',
      originalData: null,
      SnackBarComponent: {},
      websiteData: {
        hero: {
          title: '',
          subtitle: '',
          cta_text: '',
          cta_link: '',
          image: ''
        },
        about: {
          title: '',
          content: '',
          image: ''
        },
        services: {
          title: '',
          subtitle: '',
          items: []
        },
        contact: {
          title: '',
          content: '',
          email: '',
          phone: '',
          address: ''
        },
        footer: {
          copyright: '',
          links: ''
        }
      }
    };
  },
  computed: {
    hasChanges() {
      if (!this.originalData) return false;
      return JSON.stringify(this.websiteData) !== JSON.stringify(this.originalData);
    },
    organizationName() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      return orgDetails?.organization?.organization_name || 'Your Organization';
    },
    domainName() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      if (orgDetails?.organization?.organization_subdomain) {
        return orgDetails.organization.organization_subdomain.replace('.stichh.com', '');
      }
      return 'mywebsite';
    }
  },
  async mounted() {
    await this.fetchWebsiteData();
  },
  methods: {
    async getS3File(s3_details, key) {
      try {
        if (!s3_details || !key) throw new Error("Missing S3 details or key");

        const bucket = s3_details.bucket_name;
        const region = s3_details.region;

        const options = {
          level: "public",
          customPrefix: { public: "" },
          bucket,
          region,
          expires: 900, // 15 minutes
        };

        const fileContent = await Storage.get(key, options);
        
        // If it's a URL, fetch the content
        if (typeof fileContent === 'string' && fileContent.startsWith('http')) {
          const response = await fetch(fileContent);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
          }
          return await response.text();
        }
        
        return fileContent;
      } catch (err) {
        // console.error("❌ Failed to get S3 file:", err.message || err);
        return null;
      }
    },
    
    async fetchWebsiteData() {
      this.isLoading = true;
      this.error = null;
      
      try {
        await Auth.currentCredentials();
        
        const s3_details = {
          bucket_name: "subdomains.stichh.com",
          region: "us-east-1",
        };
        
        // Clean domain name for S3 key
        const orgNameClean = this.domainName
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        
        // Try to fetch existing HTML file instead of JSON
        const htmlKey = orgNameClean + '/index.html';
        // console.log('Fetching HTML from:', htmlKey);
        
        const existingHTML = await this.getS3File(s3_details, htmlKey);
        if (existingHTML) {
          // Parse the HTML and extract website data
          this.websiteData = this.extractDataFromHTML(existingHTML);
          this.originalData = JSON.parse(JSON.stringify(this.websiteData));
        } else {
          // If no existing HTML, show error
          this.error = 'No existing website found. Please deploy a website first.';
        }
        
      } catch (error) {
        // console.error('Error fetching website data:', error);
        this.error = 'Failed to load website content. Please try again.';
      } finally {
        this.isLoading = false;
      }
    },
    
    extractDataFromHTML(html) {
    //   console.log('🔍 Extracting data from HTML...');
      
      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
    //   console.log('📄 Parsed HTML document:', doc);
      
      // Extract data from the HTML
      const websiteData = {
        hero: {
          title: this.extractTextContent(doc, '.hero-text h1') || this.organizationName,
          subtitle: this.extractTextContent(doc, '.hero-text p') || 'Welcome to our website',
          cta_text: this.extractTextContent(doc, '.hero-text .btn') || 'Get Started',
          cta_link: this.extractAttribute(doc, '.hero-text .btn', 'href') || '#contact',
          image: this.extractAttribute(doc, '.hero-image img', 'src') || 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80'
        },
        about: {
          title: this.extractTextContent(doc, '#about .section-title') || 'About Us',
          content: this.extractTextContent(doc, '#about p') || 'We are dedicated to providing excellent service to our customers.',
          image: this.extractAttribute(doc, '#about .about-image img', 'src') || 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80'
        },
        services: {
          title: this.extractTextContent(doc, '#services .section-title') || 'Our Services',
          subtitle: this.extractTextContent(doc, '#services p') || 'We offer a wide range of services to meet your needs',
          items: this.extractServices(doc)
        },
        contact: {
          title: this.extractTextContent(doc, '#contact .section-title') || 'Contact Us',
          content: this.extractTextContent(doc, '#contact p') || 'Get in touch with us for any inquiries.',
          email: this.extractContactInfo(doc, 'Email:') || 'contact@example.com',
          phone: this.extractContactInfo(doc, 'Phone:') || '+1 (555) 123-4567',
          address: this.extractContactInfo(doc, 'Address:') || '123 Main Street, City, State 12345'
        },
        footer: {
          copyright: this.extractTextContent(doc, '.footer > div:first-child') || `© ${new Date().getFullYear()} ${this.organizationName}. All rights reserved.`,
          links: this.extractFooterLinks(doc) || 'Privacy Policy\nTerms of Service\nContact Us'
        }
      };
      
    //   console.log('📊 Extracted website data:', websiteData);
      return websiteData;
    },
    
    extractTextContent(doc, selector) {
      const element = doc.querySelector(selector);
      return element ? element.textContent.trim() : '';
    },
    
    extractAttribute(doc, selector, attribute) {
      const element = doc.querySelector(selector);
      return element ? element.getAttribute(attribute) : '';
    },
    
    extractServices(doc) {
      const serviceCards = doc.querySelectorAll('#services .service-card');
      const services = [];
      
      serviceCards.forEach(card => {
        const title = this.extractTextContent(card, 'h3') || 'Service';
        const description = this.extractTextContent(card, 'p') || 'Service description';
        const icon = this.extractAttribute(card, '.service-icon i', 'class') || 'mdi-star';
        
        services.push({
          title,
          description,
          icon
        });
      });
      
      return services.length > 0 ? services : [
        {
          title: 'Service 1',
          description: 'Description of service 1',
          icon: 'mdi-star'
        },
        {
          title: 'Service 2',
          description: 'Description of service 2',
          icon: 'mdi-heart'
        }
      ];
    },
    
    extractContactInfo(doc, label) {
      const contactItems = doc.querySelectorAll('#contact .contact-item');
      for (const item of contactItems) {
        const text = item.textContent;
        if (text.includes(label)) {
          return text.replace(label, '').trim();
        }
      }
      return '';
    },
    
    extractFooterLinks(doc) {
      const footerLinks = doc.querySelectorAll('.footer a');
      const links = [];
      
      footerLinks.forEach(link => {
        links.push(link.textContent.trim());
      });
      
      return links.join('\n');
    },
    
    async saveChanges() {
      if (!this.hasChanges) return;
      
      this.isSaving = true;
      
      try {
        await Auth.currentCredentials();
        
        const s3_details = {
          bucket_name: "subdomains.stichh.com",
          region: "us-east-1",
        };
        
        // Clean domain name for S3 key
        const orgNameClean = this.domainName
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        
        // Generate and save updated HTML only
        const htmlKey = orgNameClean + '/index.html';
        const generatedHTML = generateWebsiteEditHTML({
          websiteName: this.organizationName,
          websiteData: this.websiteData
        });
        
        const htmlBlob = new Blob([generatedHTML], { type: 'text/html' });
        await uploadToS3(htmlBlob, s3_details, htmlKey);
        
        // Update original data
        this.originalData = JSON.parse(JSON.stringify(this.websiteData));
        
        // Show success message
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "success",
          SnackbarText: "Website content updated successfully!",
          timeout: 5000
        };
        
      } catch (error) {
        // console.error('Error saving changes:', error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "error",
          SnackbarText: "Failed to save changes. Please try again.",
          timeout: 5000
        };
      } finally {
        this.isSaving = false;
      }
    },
    
    getSectionIcon(section) {
      const icons = {
        hero: 'mdi-home',
        about: 'mdi-information',
        services: 'mdi-briefcase',
        contact: 'mdi-phone',
        footer: 'mdi-copyright'
      };
      return icons[section] || 'mdi-file-document';
    },
    
    addService() {
      this.websiteData.services.items.push({
        title: 'New Service',
        description: 'Service description',
        icon: 'mdi-star'
      });
    },
    
    removeService(index) {
      this.websiteData.services.items.splice(index, 1);
    },
    
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.website-edit-existing {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  background-color: #f5f5f5;
}

.active-section {
  background-color: #e3f2fd !important;
  border-radius: 8px;
}

.service-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.border {
  border: 1px solid #e0e0e0;
}

.rounded {
  border-radius: 8px;
}

.website-builder-btn {
  background-color: #e75480 !important; /* Match sidebar color */
  color: #fff !important;
  border-radius: 24px !important;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.v-list-item .v-list-item-icon {
  min-width: 32px;
}
.v-list-item-title {
  font-size: 1rem;
  font-weight: 500;
}

.section-list-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  transition: background 0.2s;
  font-size: 1rem;
  font-weight: 500;
}

.section-list-item .v-icon {
  font-size: 22px;
}

.section-title {
  margin-left: 4px;
  letter-spacing: 0.5px;
}

.active-section {
  background-color: #e3f2fd !important; /* or your theme's highlight color */
  color: #1976d2 !important; /* or your theme's primary text color */
}
</style> 