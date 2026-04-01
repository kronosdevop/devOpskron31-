<template>
  <v-dialog :model-value="showDeployDialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon left class="mr-2">mdi-rocket-launch</v-icon>
        Deploy Your Website
      </v-card-title>
      
      <v-card-text class="pa-4">
        <div class="mb-4">
          <!-- <p class="text-body-1 mb-2">
            {{ deploymentDescription }}
          </p> -->
          <!-- <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            Your website will be deployed to AWS S3 and will be accessible via a unique URL.
          </v-alert> -->
        </div>

        <v-form @submit.prevent="confirmDeploy">
          <v-text-field
            v-model="domainName"
            label="Domain Name"
            placeholder="Enter your domain name"
            :error-messages="nameError"
            @input="validateDomainName"
            @blur="validateDomainName"
            required
            variant="outlined"
            class="mb-4"
            :hint="nameHint"
            persistent-hint
            :readonly="isWebsiteNameReadonly"
            maxlength="10"
            counter="10"
          >
            <template v-slot:prepend>
              <v-icon>mdi-web</v-icon>
            </template>
            <template v-slot:append>
              <span class="text-caption grey--text">.stichh.com</span>
            </template>
          </v-text-field>

          <v-alert
            v-if="fullDomainUrl"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-link</v-icon>
            </template>
            <strong>Your website will be available at:</strong><br>
            <span class="text-h6 font-weight-bold primary--text">{{ fullDomainUrl }}</span>
          </v-alert>

          <!-- <v-alert
            v-if="organizationName"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template v-slot:prepend>
              <v-icon>mdi-domain</v-icon>
            </template>
            <strong>Organization:</strong> {{ organizationName }}
            <br>
            <small class="text-caption">
              This name will be used for generating your website. Do you want to keep it the same or use a different name?
            </small>
          </v-alert> -->
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="cancelDeploy"
          :disabled="isDeploying"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="confirmDeploy"
          :loading="isDeploying"
          :disabled="!isValidName"
          :loading-text="isDeploying ? 'Deploying...' : 'Deploy'"
        >
          <v-icon left>mdi-rocket-launch</v-icon>
          Deploy Website
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { Auth } from 'aws-amplify';
import { uploadToS3 } from '@/mixins/S3PutStorageFile.js';
import { generateWebsiteHTML, generateBasicHTML } from '@/utils/simpleHtml.js';
import axios from "axios";

export default {
  name: 'WebsiteDeployDialog',
  props: {
    showDeployDialog: {
      type: Boolean,
      default: false
    },
    organizationName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      domainName: '',
      nameError: '',
      isDeploying: false
    };
  },
  computed: {
    dialog: {
      get() {
        return this.showDeployDialog;
      },
      set(value) {
        this.$emit('update:showDeployDialog', value);
      }
    },
    deploymentDescription() {
      return 'This will be the name for your website. You can customize it below.';
    },
    nameHint() {
      if (this.organizationDomainExists) {
        return 'Your organization domain already exists. The website will be deployed using your organization name.';
      }
      return 'Enter your domain name (max 10 characters). Your website will be available at yourdomain.stichh.com';
    },
    previewUrl() {
      if (!this.domainName) return '';
      const cleanName = this.domainName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return 'https://' + cleanName + '.yourdomain.com';
    },
    fullDomainUrl() {
      if (!this.domainName) return '';
      return 'https://' + this.domainName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.stichh.com';
    },
    isValidName() {
      return this.domainName && this.domainName.length >= 3 && this.domainName.length <= 10 && !this.nameError;
    },
    websiteData() {
      const raw = this.$store.getters.GetGeneratedData;
      if (!raw) return null;
      if (raw.sections) return raw;
      if (raw.data && raw.data.sections) return raw.data;
      return null;
    },
    themeObject() {
      return this.$store.getters.GetThemeObject;
    },
    heroImage() {
      const prompt = (this.$store.getters.GetWebsitePrompt || '').toLowerCase();

      if (prompt.includes('interior')) {
        return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
      }
      if (prompt.includes('restaurant')) {
        return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
      }
      if (prompt.includes('fitness') || prompt.includes('gym')) {
        return 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=800&q=80';
      }
      if (prompt.includes('travel')) {
        return 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80';
      }
      if (prompt.includes('lawyer') || prompt.includes('legal')) {
        return 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80';
      }
      if (prompt.includes('doctor') || prompt.includes('medical') || prompt.includes('clinic')) {
        return 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=800&q=80';
      }
      if (prompt.includes('real estate')) {
        return 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80';
      }
      if (prompt.includes('photography')) {
        return 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80';
      }
      return 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80';
    },
    aboutImage() {
      if (this.websiteData && this.websiteData.sections.about.image && this.websiteData.sections.about.image.trim() !== '') {
        return this.websiteData.sections.about.image;
      }
      return 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80';
    },
    organizationDomainExists() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      return orgDetails?.organization?.organization_domain_exists || false;
    },
    isWebsiteNameReadonly() {
      return this.organizationDomainExists;
    }
  },
  watch: {
    showDeployDialog: {
      async handler() {
        if (this.showDeployDialog == true) {
       //   console.log('Organization domain exists:', this.organizationDomainExists);
          this.initializeDialog();
        }
      },
      immediate: true,
    },
  },
 
  methods: {
    initializeDialog() {
      if (this.organizationDomainExists) {
        // Extract just the subdomain part from the organization name
        const orgDetails = this.$store.getters.GetOrgDetails;
        const fullDomain = orgDetails?.organization?.organization_subdomain || this.organizationName;
        // Remove .stichh.com if present
        this.domainName = fullDomain.replace('.stichh.com', '');
      } else {
        this.domainName = this.organizationName || 'mywebsite';
      }
      this.nameError = '';
      this.isDeploying = false;
    },
    validateDomainName() {
      this.nameError = '';
      
      const invalidChars = /[<>:"/\\|?*]/;
      if (invalidChars.test(this.domainName)) {
        this.nameError = 'Domain name cannot contain special characters like < > : " / \\ | ? *';
        return;
      }
      
      const reservedWords = ['www', 'http', 'https', 'ftp', 'admin', 'login', 'api'];
      if (reservedWords.includes(this.domainName.toLowerCase())) {
        this.nameError = 'This name is reserved and cannot be used';
        return;
      }
      
      if (this.domainName.length < 3) {
        this.nameError = 'Domain name must be at least 3 characters long';
        return;
      }
      
      if (this.domainName.length > 10) {
        this.nameError = 'Domain name must be less than 10 characters';
        return;
      }
    },
    cancelDeploy() {
      this.dialog = false;
      this.$emit('cancel');
    },
    async confirmDeploy() {
      if (!this.isValidName) return;
      
      this.isDeploying = true;
      
      try {
        const generatedHTML = this.generateCompleteHTML();
        const htmlFile = new Blob([generatedHTML], { type: 'text/html' });
        htmlFile.name = 'index.html';
        
        const fileUrl = await this.uploadToS3(htmlFile);
        
        // Only call API if organization domain doesn't exist
        if (!this.organizationDomainExists) {
          const orgDetails = this.$store.getters.GetOrgDetails;
          const orgNameClean = this.domainName.toLowerCase().replace(/[^a-z0-9-]/g, "");
          await this.url_call(orgNameClean, orgDetails);
        }
        
        this.$emit('deploy', {
          websiteName: this.domainName,
          websiteUrl: this.fullDomainUrl,
          organizationName: this.organizationName
        });
        
        this.dialog = false;
        this.$emit('deploy-success', {
          websiteName: this.domainName,
          websiteUrl: this.fullDomainUrl
        });
        
      } catch (error) {
        console.error('Deployment error:', error);
        this.$emit('deploy-error', error);
      } finally {
        this.isDeploying = false;
      }
    },
    async uploadToS3(htmlFile) {
      try {
        await Auth.currentCredentials();
        const orgDetails = this.$store.getters.GetOrgDetails;
        
        if (!orgDetails || !orgDetails.organization) {
          throw new Error('Organization details not found');
        }
        
        const s3_details = {
          bucket_name: "subdomains.stichh.com",
          region: "us-east-1",
        };
        
        const orgNameClean = this.domainName
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        
        const key = orgNameClean + '/' + htmlFile.name;
      //  console.log(key);
        
        const fileUrl = await uploadToS3(htmlFile, s3_details, key);
        
        if (fileUrl) {
       //   console.log("✅ Website deployed successfully:", fileUrl);
          return fileUrl;
        } else {
          throw new Error('Failed to upload to S3');
        }
        
      } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error('Upload failed: ' + error.message);
      }
    },
    url_call(orgDetails1,orgDetails) {
      axios({
        method: "POST",
        url: "https://pt8lbf5drh.execute-api.us-east-1.amazonaws.com/dev/create_aws_sub_domains",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "p4DCTzH6tm2ctNyS0VE344fenvBDJfCq7GDaj6lC",
        },

        data: {
          sub_domain_name: orgDetails1,
          alternative_sub_domain_name: [],
          organization_id: orgDetails.organization.organization_id,
        },
      })
        .then((res) => {
          this.loadingDeploy = false;
       //   console.log(res);
          
          if (res.data.Status === "SUCCESS") {
            // Show deployment success message
            this.$emit('deployment-started', {
              websiteName: this.domainName,
              message: 'Your website deployment has been initiated. It will take 10-15 minutes to complete. Please wait.'
            });
            
            // Close dialog and navigate to WebSiteBuilder
            this.dialog = false;
            this.$router.push('/WebSiteBuilder');
          } else {
            this.$emit('deploy-error', res.data.Message || 'Deployment failed');
          }
        })
        .catch((error) => {
          console.error('API call error:', error);
          this.$emit('deploy-error', 'Failed to initiate deployment. Please try again.');
        });
    },
    generateCompleteHTML() {
      if (!this.websiteData || !this.websiteData.sections) {
        return generateBasicHTML(this.domainName);
      }

      return generateWebsiteHTML({
        websiteName: this.domainName,
        sections: this.websiteData.sections,
        themeObject: this.themeObject,
        heroImage: this.heroImage,
        aboutImage: this.aboutImage
      });
    },
    generateBasicHTML() {
      return generateBasicHTML(this.domainName);
    }
  }
}
</script>

<style scoped>
.v-dialog {
  border-radius: 12px;
}
</style> 