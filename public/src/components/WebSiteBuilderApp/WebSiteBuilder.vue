<template>
  <v-container
    fluid
    class="pa-0 fill-height d-flex align-center justify-center modern-bg"
  >
    <!-- SnackBar Component -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    
    <!-- Deployment Status Alert -->
    <v-dialog
      :model-value="showDeploymentAlert"
      @update:model-value="showDeploymentAlert = $event"
      persistent
      max-width="500"
      content-class="deployment-alert"
    >
      <v-card class="pa-6 text-center">
        <v-icon size="64" color="blue" class="mb-4">mdi-rocket-launch</v-icon>
        <h3 class="text-h5 mb-3">Website Deployment in Progress</h3>
        <p class="text-body-1 mb-4">{{ deploymentStatus?.message || 'Your website is being deployed. Please wait.' }}</p>
        <v-progress-circular
          indeterminate
          color="blue"
          size="32"
          class="mb-4"
        ></v-progress-circular>
        <p class="text-caption text-grey">
          Website: <strong>{{ deploymentStatus?.websiteName }}</strong><br>
          Started: {{ formatTime(deploymentStatus?.timestamp) }}
        </p>
        <v-btn
          color="primary"
          @click="showDeploymentAlert = false"
          class="mt-4"
        >
          Continue Building
        </v-btn>
      </v-card>
    </v-dialog>

    <div class="modern-bg-blur"></div>
    <v-row
      class="fill-height d-flex align-center justify-center"
      style="width: 100vw; z-index: 1"
    >
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="8"
        class="d-flex flex-column align-center justify-center"
      >
        <!-- Existing Domain Card (when organization_domain_exists = true) -->
        <div v-if="organizationDomainExists" class="text-center">
         
          <v-card class="modern-card fade-in" elevation="12">
            <v-icon size="80" color="green" class="mb-6">mdi-check-circle</v-icon>
            <h3 class="text-h4 mb-4" style="color: #2563eb; font-weight: 700;">
              {{ organizationName }}
            </h3>
            <p class="text-body-1 mb-6" style="color: #666;">
              Your organization already has a website domain configured.
            </p>
            <div class="mb-6 pa-4" style="background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
              <p class="text-caption text-grey mb-2">Your Website URL:</p>
              <p class="text-h6 font-weight-bold" style="color: #2563eb;">
                {{ subdomainUrl }}
              </p>
            </div>
            <v-btn
              color="primaryColor"
              size="large"
              @click="visitWebsite"
              class="mr-4"
            >
              <v-icon left>mdi-open-in-new</v-icon>
              Visit Website
            </v-btn>
            <v-btn
              variant="outlined"
              size="large"
              @click="goBack"
            >
              <v-icon left>mdi-pencil</v-icon>
             Edit content
            </v-btn>
          </v-card>
        </div>

        <!-- Website Builder Prompt (when organization_domain_exists = false) -->
        <div v-else>
          <h6 class="text-center mb-10 modern-heading">
            Build a Static Webpage for your website
          </h6>
          <v-card class="modern-card fade-in" elevation="12">
            <v-textarea
              v-model="generatedPrompt"
              label="Describe your business"
              variant="outlined"
              rows="4"
              class="mb-8 modern-textarea"
              background-color="grey lighten-4"
              persistent-hint
              auto-grow
            ></v-textarea>
            <v-btn
              class="text-capitalize cardCss"
              size="large"
              @click="continueToNext"
              :disabled="!generatedPrompt.trim()"
            >
              Continue
            </v-btn>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SnackBar from '@/components/SnackBar.vue';

export default {
  components: {
    SnackBar,
  },
  data() {
    return {
      generatedPrompt: this.$store.getters.GetWebsitePrompt || "",
      showDeploymentAlert: false,
      deploymentStatus: null,
      SnackBarComponent: {},
    };
  },
  computed: {
    organizationDomainExists() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      return orgDetails?.organization?.organization_domain_exists || false;
    },
    organizationName() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      return orgDetails?.organization?.organization_name || 'Your Organization';
    },
    subdomainUrl() {
      const orgDetails = this.$store.getters.GetOrgDetails;
      if (orgDetails?.organization?.organization_subdomain) {
        return `https://${orgDetails.organization.organization_subdomain}`;
      }
      return 'https://yourdomain.stichh.com';
    }
  },
  mounted() {
    // Debug: Check what's in the store
   
    // Fix: If websiteBuilder is undefined, clear localStorage and reset
    if (!this.$store.state.websiteBuilder) {
      localStorage.removeItem('vuex-state');
      this.$store.commit('ClearWebsiteBuilder');
      // Force a page reload to reset everything
      window.location.reload();
    }
    
    // const deployment = this.$store.getters.GetDeploymentStatus;
    // if (deployment && deployment.isDeploying) {
    //   this.deploymentStatus = deployment;
    //   this.showDeploymentAlert = true;
    //   this.SnackBarComponent = {
    //     SnackbarVmodel: true,
    //     SnackbarColor: "info",
    //     SnackbarText: deployment.message,
    //     timeout: 8000
    //   };
    // }
  },
  methods: {
    continueToNext() {
      this.$store.commit('SetWebsitePrompt', this.generatedPrompt);
      this.$router.push({ name: "WebSiteTheme" });
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
    visitWebsite() {
      window.open(this.subdomainUrl, '_blank');
    },
    goBack() {
      this.$router.push({ name: "WebsiteEditExisting" });
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
.modern-bg {
  background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
  position: relative;
  overflow: hidden;
}
.modern-bg-blur {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 120vw;
  height: 120vh;
  background: radial-gradient(circle at 60% 40%, #2563eb33 0%, #fff0 70%);
  filter: blur(60px);
  z-index: 0;
  pointer-events: none;
}
.modern-logo {
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.08);
}
.modern-heading {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -1px;
  color: #222;
  margin-bottom: 2.5rem;
}
.modern-card {
  border-radius: 28px;
  box-shadow: 0 12px 48px rgba(37, 99, 235, 0.13), 0 1.5px 8px #0001;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 3rem 2.5rem 2.5rem 2.5rem;
  max-width: 700px;
  margin: 0 auto;
  border: 1.5px solid #e3e8f0;
  transition: box-shadow 0.2s;
}
.fade-in {
  animation: fadeInUp 0.7s cubic-bezier(0.23, 1.01, 0.32, 1) both;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.modern-textarea :deep(.v-input__slot) {
  border-radius: 16px !important;
  background: #f4f6fa !important;
  font-size: 1.15rem;
  min-height: 120px;
}
.modern-btn {
  border-radius: 14px;
  font-size: 1.25rem;
  font-weight: 800;
  box-shadow: 0 2px 16px rgba(37, 99, 235, 0.1);
  letter-spacing: 0.5px;
  padding: 18px 0;
  background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
  transition: background 0.2s, box-shadow 0.2s;
}
.modern-btn:enabled:hover {
  background: linear-gradient(90deg, #1e40af 0%, #2563eb 100%);
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.18);
}

/* Deployment Alert Styles */
.deployment-alert {
  border-radius: 16px;
}
</style>
