<template>
  <v-container v-if="websiteData && websiteData.sections" class="pa-0">
    <!-- SnackBar Component -->
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    
    <!-- Deployment Dialog -->
    <WebsiteDeployDialog
      :showDeployDialog.sync="showDeployDialog"
      :organizationName="organizationName"
      @deploy="handleDeploy"
      @deploy-success="handleDeploySuccess"
      @deploy-error="handleDeployError"
      @deployment-started="handleDeploymentStarted"
      @cancel="handleDeployCancel"
    />
    
    <!-- Navigation -->
    <v-app-bar :color="themeObject?.bg || 'white'" flat>
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title :style="{ color: themeObject?.titleColor || '#222' }">
        {{ websiteData.sections.navigation.logo }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <!-- Action Buttons -->
      <v-btn @click="navigateToEdit" color="primary" class="mr-2">
        <v-icon left>mdi-pencil</v-icon>
        Edit Website
      </v-btn>
      <v-btn @click="deployWebsite" color="success">
        <v-icon left>mdi-rocket-launch</v-icon>
        Deploy Website
      </v-btn>
      
      <div>
        <v-btn v-for="link in websiteData.sections.navigation.links" :key="link" text :style="{ color: themeObject?.bodyColor || '#444' }">
          {{ link }}
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Hero Section -->
    <v-row class="align-center justify-center py-12" :style="{ background: themeObject?.bg }">
      <v-col cols="12" md="6" class="text-center text-md-left">
        <h1 :style="{ color: themeObject?.titleColor, fontWeight: 900, fontSize: '2.8rem' }">
          {{ websiteData.sections.hero.title }}
        </h1>
        <p :style="{ color: themeObject?.bodyColor, fontSize: '1.3rem', marginBottom: '2rem' }">
          {{ websiteData.sections.hero.subtitle }}
        </p>
        <v-btn large class="mr-4" :style="{ background: themeObject?.linkColor, color: '#fff' }">
          {{ websiteData.sections.hero.primaryButton }}
        </v-btn>
        <v-btn large outlined :style="{ borderColor: themeObject?.linkColor, color: themeObject?.linkColor }">
          {{ websiteData.sections.hero.secondaryButton }}
        </v-btn>
      </v-col>
      <v-col cols="12" md="6" class="text-center">
        <v-img :src="heroImage" max-width="500" max-height="350" contain style="border-radius: 18px; box-shadow: 0 4px 24px rgba(37,99,235,0.10);" />
      </v-col>
    </v-row>

    <!-- Features Section -->
    <v-container class="py-10">
      <h2 class="text-center mb-8" :style="{ color: themeObject?.titleColor, fontWeight: 800 }">Why Choose Us</h2>
      <v-row>
        <v-col v-for="feature in websiteData.sections.features" :key="feature.title" cols="12" sm="6" md="3">
          <v-card class="pa-6 text-center" :style="{ background: themeObject?.bg, borderRadius: '18px', boxShadow: '0 4px 24px rgba(37,99,235,0.10)' }">
            <v-icon size="40" :color="themeObject?.linkColor">{{ feature.icon }}</v-icon>
            <h3 class="mt-4 mb-2" :style="{ color: themeObject?.titleColor, fontWeight: 700 }">{{ feature.title }}</h3>
            <p :style="{ color: themeObject?.bodyColor }">{{ feature.description }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- About Section -->
    <v-container class="py-10">
      <v-row align="center">
        <v-col cols="12" md="6">
          <h2 :style="{ color: themeObject?.titleColor, fontWeight: 800 }">{{ websiteData.sections.about.title }}</h2>
          <p :style="{ color: themeObject?.bodyColor }">{{ websiteData.sections.about.description }}</p>
        </v-col>
        <v-col cols="12" md="6" class="text-center">
          <v-img :src="aboutImage" max-width="400" max-height="300" contain></v-img>
        </v-col>
      </v-row>
    </v-container>

    <!-- Services Section -->
    <v-container class="py-10">
      <h2 class="text-center mb-8" :style="{ color: themeObject?.titleColor, fontWeight: 800 }">Our Services</h2>
      <v-row>
        <v-col v-for="service in websiteData.sections.services" :key="service.title" cols="12" sm="6" md="4">
          <v-card class="pa-6 text-center" :style="{ background: themeObject?.bg, borderRadius: '18px', boxShadow: '0 4px 24px rgba(37,99,235,0.10)' }">
            <v-icon size="32" :color="themeObject?.linkColor">{{ service.icon }}</v-icon>
            <h3 class="mt-4 mb-2" :style="{ color: themeObject?.titleColor, fontWeight: 700 }">{{ service.title }}</h3>
            <p :style="{ color: themeObject?.bodyColor }">{{ service.description }}</p>
            <a :style="{ color: themeObject?.linkColor, fontWeight: 600 }" href="#">{{ service.link }}</a>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Contact Section -->
    <v-container class="py-10">
      <h2 class="text-center mb-8" :style="{ color: themeObject?.titleColor, fontWeight: 800 }">{{ websiteData.sections.contact.title }}</h2>
      <p class="text-center mb-6" :style="{ color: themeObject?.bodyColor }">{{ websiteData.sections.contact.subtitle }}</p>
      <v-row justify="center">
        <v-col cols="12" md="6">
          <v-form>
            <v-row>
              <v-col v-for="field in websiteData.sections.contact.formFields" :key="field.label" cols="12">
                <v-text-field v-if="field.type !== 'textarea'" :label="field.label" :placeholder="field.placeholder" outlined dense></v-text-field>
                <v-textarea v-else :label="field.label" :placeholder="field.placeholder" :rows="field.rows" outlined dense></v-textarea>
              </v-col>
            </v-row>
            <v-btn color="primary" large block>{{ websiteData.sections.contact.submitButton }}</v-btn>
          </v-form>
        </v-col>
      </v-row>
    </v-container>

    <!-- Footer -->
    <v-footer padless :color="themeObject?.bg || '#fff'">
      <v-col class="text-center py-6">
        <div :style="{ color: themeObject?.titleColor, fontWeight: 700 }">{{ websiteData.sections.footer.logo }}</div>
        <div :style="{ color: themeObject?.bodyColor }">{{ websiteData.sections.footer.text }}</div>
        <div class="mt-2">
          <a v-for="link in websiteData.sections.footer.links" :key="link" :style="{ color: themeObject?.bodyColor, margin: '0 8px' }" href="#">{{ link }}</a>
        </div>
      </v-col>
    </v-footer>
  </v-container>
  <div v-else class="text-center pa-10">
    <h2>No website data found. Please generate a website first.</h2>
    <v-btn color="primary" @click="goBack">Go Back</v-btn>
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import WebsiteDeployDialog from "@/components/WebSiteBuilderApp/WebsiteDeployDialog.vue";

export default {
  name: 'WebsiteDeploy',
  components: {
    SnackBar,
    WebsiteDeployDialog,
  },
  data() {
    return {
      SnackBarComponent: {},
      showDeployDialog: false,
    }
  },
  computed: {
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
    organizationName() {
      // Get organization name from store or use website data
      const orgDetails = this.$store.getters.GetOrgDetails;
      if (orgDetails && orgDetails.organization && orgDetails.organization.organization_name) {
        return orgDetails.organization.organization_name;
      }
      // Fallback to website navigation logo
      if (this.websiteData && this.websiteData.sections) {
        return this.websiteData.sections.navigation.logo;
      }
      return 'My Website';
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
      // Use the about image if provided, otherwise use a default business image
      if (this.websiteData.sections.about.image && this.websiteData.sections.about.image.trim() !== '') {
        return this.websiteData.sections.about.image;
      }
      return 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80';
    }
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    navigateToEdit() {
      this.$router.push('/home/WebsiteEdit');
    },
    deployWebsite() {
      this.showDeployDialog = true;
    },
    handleDeploy(deployData) {
      // Handle deployment start
     // console.log('Deploying website:', deployData);
      
      // Show deployment message
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "blue",
        SnackbarText: `Deploying ${deployData.websiteName}...`,
        timeout: 3000
      };
    },
    handleDeploySuccess(deployData) {
      // Handle successful deployment
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: `${deployData.websiteName} deployed successfully!`,
        timeout: 5000
      };
      this.showDeployDialog = false;
      // You can navigate to a success page or show deployment details
      // this.$router.push('/website-deployment-success');
    },
    handleDeployError(error) {
      // Handle deployment error
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "error",
        SnackbarText: "Deployment failed. Please try again.",
        timeout: 5000
      };
    },
    handleDeployCancel() {
      // Handle deployment cancellation
      this.showDeployDialog = false;
    },
    handleDeploymentStarted(deployData) {
      // Store deployment status in Vuex for WebSiteBuilder to access
      this.$store.commit('SetDeploymentStatus', {
        isDeploying: true,
        websiteName: deployData.websiteName,
        message: deployData.message,
        timestamp: new Date().toISOString()
      });
      
      // Show deployment started message
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "success",
        SnackbarText: deployData.message,
        timeout: 8000
      };
      
      // Close dialog
      this.showDeployDialog = false;
    }
  }
}
</script>

<style scoped>
.website-preview-container {
  min-height: 100vh;
  background: #f8fafc;
}
</style>