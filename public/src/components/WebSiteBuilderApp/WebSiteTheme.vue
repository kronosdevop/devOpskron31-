<template>
  <v-container fluid class="theme-bg pa-0">
    <div class="modern-bg-blur"></div>
    <div class="theme-grid-container">
      <div class="theme-header-row">
        <v-btn icon class="mb-4 back-btn" @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-card class="mb-6 pa-4 theme-prompt-card" outlined>
          <div class="font-weight-bold mb-2">Your Prompt:</div>
          <div>{{ prompt }}</div>
        </v-card>
      </div>
      <h6 class="mb-6 modern-heading">Choose a Theme</h6>
      <div class="theme-card-grid">
        <div
          v-for="theme in themes"
          :key="theme.key"
          class="theme-card-outer"
        >
          <div
            class="theme-card"
            :class="{ 'theme-card--selected': selectedTheme === theme.key }"
            @click="selectTheme(theme.key)"
          >
            <div class="theme-preview" :style="{ background: theme.bg }">
              <div class="theme-title" :style="{ color: theme.titleColor }">Title</div>
              <div class="theme-body" :style="{ color: theme.bodyColor }">
                Body &nbsp;
                <a :style="{ color: theme.linkColor }" href="#">link</a>
              </div>
              <v-icon
                v-if="selectedTheme === theme.key"
                class="theme-check"
                color="primary"
                small
              >mdi-check-circle</v-icon>
            </div>
            <div class="theme-name">{{ theme.name }}</div>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                 
                  class=""
                  v-bind="attrs"
                  v-on="on"
                  @click.stop="openPreview(theme)"
                  elevation="0"
                >
                  <v-icon size="16" color="primary">mdi-eye</v-icon>
                </v-btn>
              </template>
              <span>Preview</span>
            </v-tooltip>
            <div v-if="theme.createdBy" class="theme-meta">
              <span>Created by you</span>
              <span class="theme-updated">Updated {{ theme.updated }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="theme-continue-btn-wrap">
        <v-btn
          class="cardCss"
          large
          :loading="loading"
          :disabled="!selectedTheme"
          @click="continueToBuilder"
        >
          Continue
        </v-btn>
      </div>
    </div>
    <ThemePreview
      v-if="previewDialog"
      :show.sync="previewDialog"
      @update:show="previewDialog = $event"
      :theme="themeToPreview"
      @select-theme="selectThemeFromPreview"
    />
  </v-container>
</template>

<script>
import ThemePreview from '@/components/WebSiteBuilderApp/ThemePreview.vue'
import axios from "axios";

export default {
  components: {
    ThemePreview
  },
  data() {
    return {
      prompt: this.$store.getters.GetWebsitePrompt || "",
      selectedTheme: this.$store.getters.GetSelectedTheme || "",
      previewDialog: false,
      themeToPreview: null,
      loading: false,
      themes: [
        {
          key: "oasis",
          name: "Oasis",
          bg: "#f7f5ed",
          titleColor: "#2d3a2e",
          bodyColor: "#444",
          linkColor: "#eab308",
        },
        {
          key: "dark",
          name: "Basic Dark",
          bg: "#18181b",
          titleColor: "#fff",
          bodyColor: "#ccc",
          linkColor: "#60a5fa",
        },
        {
          key: "snowball",
          name: "Snowball",
          bg: "linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)",
          titleColor: "#2d3a2e",
          bodyColor: "#6b7280",
          linkColor: "#2563eb",
        },
        {
          key: "sage",
          name: "Sage",
          bg: "#f1f5f2",
          titleColor: "#374151",
          bodyColor: "#6b7280",
          linkColor: "#10b981",
        },
        {
          key: "tranquil",
          name: "Tranquil",
          bg: "linear-gradient(135deg, #e0f7fa 60%, #b2ebf2 100%)",
          titleColor: "#01579b",
          bodyColor: "#0277bd",
          linkColor: "#00bcd4",
        },
        {
          key: "rose",
          name: "Rose",
          bg: "linear-gradient(135deg, #fff1f2 60%, #fbcfe8 100%)",
          titleColor: "#be185d",
          bodyColor: "#db2777",
          linkColor: "#f43f5e",
        },
        {
          key: "sunset",
          name: "Sunset",
          bg: "linear-gradient(135deg, #fbbf24 60%, #f87171 100%)",
          titleColor: "#7c2d12",
          bodyColor: "#b91c1c",
          linkColor: "#ea580c",
        },
        {
          key: "mint",
          name: "Mint",
          bg: "linear-gradient(135deg, #d1fae5 60%, #6ee7b7 100%)",
          titleColor: "#065f46",
          bodyColor: "#047857",
          linkColor: "#10b981",
        },
        {
          key: "lavender",
          name: "Lavender",
          bg: "linear-gradient(135deg, #ede9fe 60%, #c4b5fd 100%)",
          titleColor: "#6d28d9",
          bodyColor: "#7c3aed",
          linkColor: "#a78bfa",
        },
        {
          key: "aqua",
          name: "Aqua",
          bg: "linear-gradient(135deg, #e0f2fe 60%, #38bdf8 100%)",
          titleColor: "#0369a1",
          bodyColor: "#0ea5e9",
          linkColor: "#22d3ee",
        },
        {
          key: "peach",
          name: "Peach",
          bg: "linear-gradient(135deg, #fff7ed 60%, #fdba74 100%)",
          titleColor: "#9a3412",
          bodyColor: "#ea580c",
          linkColor: "#f59e42",
        },
        {
          key: "forest",
          name: "Forest",
          bg: "linear-gradient(135deg, #dcfce7 60%, #22c55e 100%)",
          titleColor: "#166534",
          bodyColor: "#16a34a",
          linkColor: "#4ade80",
        },
      ],
    };
  },
  methods: {
    selectTheme(themeKey) {
      this.selectedTheme = themeKey;
      // Store in Vuex
      this.$store.commit('SetSelectedTheme', themeKey);
    },
    openPreview(theme) {
      this.themeToPreview = theme;
      this.previewDialog = true;
    },
    selectThemeFromPreview(theme) {
      this.selectedTheme = theme.key;
    },
    url_call(orgDetails1) {
    
    },
    async continueToBuilder() {
      const selectedThemeObj = this.themes.find(t => t.key === this.selectedTheme);
      this.loading = true;
      
      // Create a comprehensive prompt that handles any user input
      const structuredPrompt = `Create a professional website based on this business description: "${this.prompt}"

IMPORTANT: Return ONLY a valid JSON object with this exact structure:

{
  "sections": {
    "navigation": {
      "logo": "Business Name",
      "links": ["Home", "About", "Services", "Contact"]
    },
    "hero": {
      "title": "Compelling headline for the business",
      "subtitle": "Professional subtitle describing what the business does and its value proposition",
      "primaryButton": "Get Started",
      "secondaryButton": "Learn More"
    },
    "features": [
      {
        "icon": "mdi-rocket-launch",
        "title": "Feature 1 Title",
        "description": "Professional description of feature 1"
      },
      {
        "icon": "mdi-shield-check", 
        "title": "Feature 2 Title",
        "description": "Professional description of feature 2"
      },
      {
        "icon": "mdi-devices",
        "title": "Feature 3 Title", 
        "description": "Professional description of feature 3"
      },
      {
        "icon": "mdi-cog",
        "title": "Feature 4 Title",
        "description": "Professional description of feature 4"
      }
    ],
    "about": {
      "title": "About Our Company",
      "description": "Professional description about the business, its mission, and what makes it unique",
      "image": "https://via.placeholder.com/400x300"
    },
    "services": [
      {
        "icon": "mdi-web",
        "title": "Service 1 Title",
        "description": "Professional description of service 1",
        "link": "Learn more →"
      },
      {
        "icon": "mdi-palette",
        "title": "Service 2 Title", 
        "description": "Professional description of service 2",
        "link": "Learn more →"
      },
      {
        "icon": "mdi-chart-line",
        "title": "Service 3 Title",
        "description": "Professional description of service 3", 
        "link": "Learn more →"
      }
    ],
    "contact": {
      "title": "Get In Touch",
      "subtitle": "Ready to start your project? Let's discuss how we can help bring your vision to life.",
      "formFields": [
        {"type": "text", "label": "Name", "placeholder": "Your name"},
        {"type": "email", "label": "Email", "placeholder": "your@email.com"},
        {"type": "textarea", "label": "Message", "placeholder": "Tell us about your project...", "rows": 4}
      ],
      "submitButton": "Send Message"
    },
    "footer": {
      "logo": "Business Name",
      "text": "Creating exceptional experiences since 2020.",
      "links": ["Privacy Policy", "Terms of Service", "Contact"]
    }
  }
}

Requirements:
- Use the "${selectedThemeObj.name}" theme style and colors
- Make content professional, engaging, and relevant to the business type
- Ensure all text is business-appropriate and compelling
- Use appropriate Material Design icons (mdi-*)
- Keep descriptions concise but informative
- Make the content specific to the business described in the prompt

     Return ONLY a compact, valid JSON object, no pretty-printing, no extra text, no newlines, no explanations.`;

      axios({
        method: "POST",
        url: "https://pt8lbf5drh.execute-api.us-east-1.amazonaws.com/dev/genrate_with_llm",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "p4DCTzH6tm2ctNyS0VE344fenvBDJfCq7GDaj6lC",
        },
        data: {
          prompt: structuredPrompt
        },
      })
        .then((res) => {
          this.loading = false;
          if (res.data && res.data.Status === "SUCCESS") {
            // Handle successful response
            const jsonResponse = res.data;
          //  console.log("Response data:", jsonResponse);
            
            // Parse the response to extract the sections
            let sections = null;
            try {
              let jsonString = jsonResponse.data;
              if (typeof jsonString === 'string') {
                sections = JSON.parse(jsonString);
              } else if (jsonResponse.data && jsonResponse.data.sections) {
                sections = jsonResponse.data;
              } else {
                sections = jsonResponse;
              }
              if (!sections.sections) {
                throw new Error("Invalid response structure");
              }
            } catch (error) {
              console.error("Failed to parse response:", error);
              // Use comprehensive fallback structure matching ThemePreview.vue
              sections = {
                sections: {
                  navigation: {
                    logo: "YourBrand",
                    links: ["Home", "About", "Services", "Contact"]
                  },
                  hero: {
                    title: "Welcome to Your Website",
                    subtitle: "This is how your website will look with the " + selectedThemeObj.name + " theme. Experience the perfect blend of style and functionality.",
                    primaryButton: "Get Started",
                    secondaryButton: "Learn More"
                  },
                  features: [
                    {
                      icon: "mdi-rocket-launch",
                      title: "Fast Performance",
                      description: "Lightning-fast loading times and smooth interactions."
                    },
                    {
                      icon: "mdi-shield-check",
                      title: "Secure & Reliable",
                      description: "Built with security best practices and reliable hosting."
                    },
                    {
                      icon: "mdi-devices",
                      title: "Mobile Responsive",
                      description: "Perfect experience across all devices and screen sizes."
                    },
                    {
                      icon: "mdi-cog",
                      title: "Easy to Manage",
                      description: "Simple content management and easy updates."
                    }
                  ],
                  about: {
                    title: "About Our Company",
                    description: "We are passionate about creating exceptional digital experiences that help businesses grow and succeed. Our team combines creativity with technical expertise to deliver solutions that make a difference.",
                    image: "https://via.placeholder.com/400x300"
                  },
                  services: [
                    {
                      icon: "mdi-web",
                      title: "Web Development",
                      description: "Custom websites built with modern technologies and best practices.",
                      link: "Learn more →"
                    },
                    {
                      icon: "mdi-palette",
                      title: "UI/UX Design",
                      description: "Beautiful, intuitive designs that enhance user experience.",
                      link: "Learn more →"
                    },
                    {
                      icon: "mdi-chart-line",
                      title: "Digital Marketing",
                      description: "Strategic marketing solutions to grow your online presence.",
                      link: "Learn more →"
                    }
                  ],
                  contact: {
                    title: "Get In Touch",
                    subtitle: "Ready to start your project? Let's discuss how we can help bring your vision to life.",
                    formFields: [
                      {"type": "text", "label": "Name", "placeholder": "Your name"},
                      {"type": "email", "label": "Email", "placeholder": "your@email.com"},
                      {"type": "textarea", "label": "Message", "placeholder": "Tell us about your project...", "rows": 4}
                    ],
                    submitButton: "Send Message"
                  },
                  footer: {
                    logo: "YourBrand",
                    text: "Creating exceptional digital experiences since 2020.",
                    links: ["Privacy Policy", "Terms of Service", "Contact"]
                  }
                }
              };
            }
            
            // Store data in Vuex store
            this.$store.commit('SetWebsitePrompt', this.prompt);
            this.$store.commit('SetSelectedTheme', this.selectedTheme);
            this.$store.commit('SetGeneratedData', sections);
            this.$store.commit('SetThemeObject', selectedThemeObj);
            
            // Navigate to next page with the structured data
            this.$router.push({
              name: "WebsiteDeploy"
            });
          } else {
            // Handle error response
            console.error("API Error:", res.data);
            // You can show error to user here
          }
        })
        .catch((error) => {
          this.loading = false;
          console.error("API Error:", error);
          // You can show error to user here
        });
    },
    goBack() {
      this.$router.back();
    },
  },
};
</script>

<style scoped>
.theme-bg {
  min-height: 100vh;
  background: linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-grid-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.theme-header-row {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 18px;
}
.theme-header-row .back-btn {
  margin-bottom: 0;
}
.theme-header-row .theme-prompt-card {
  margin-bottom: 0;
}
.theme-header {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 18px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.theme-prompt-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 0;
}
.theme-card-grid {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.10);
  padding: 40px 32px 32px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 40px 32px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto 48px auto;
  justify-items: center;
}
.theme-card-outer {
  display: flex;
  justify-content: center;
}
.theme-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.10);
  border: 2px solid transparent;
  min-width: 180px;
  max-width: 220px;
  min-height: 210px;
  padding: 18px 12px 12px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.2s, border 0.2s, transform 0.15s;
  cursor: pointer;
  position: relative;
}
.theme-card:hover {
  box-shadow: 0 12px 36px rgba(37, 99, 235, 0.18);
  transform: translateY(-4px) scale(1.04);
  border: 2px solid #2563eb33;
}
.theme-card--selected {
  border: 2.5px solid #2563eb;
  box-shadow: 0 12px 36px rgba(37, 99, 235, 0.22);
}
.theme-preview {
  border-radius: 12px;
  margin-bottom: 10px;
  padding: 18px 10px 12px 10px;
  min-height: 80px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  position: relative;
}
.theme-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
}
.theme-body {
  font-size: 0.9rem;
}
.theme-check {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 1.5rem;
}
.theme-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 12px 0 8px 0;
  text-align: center;
  width: 100%;
}
.preview-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 1.1rem;
  margin: 0 auto 8px auto;
  background: none;
  color: #2563eb !important;
  box-shadow: none;
  transition: color 0.2s, transform 0.15s;
}
.preview-btn-icon:hover {
  color: #1e40af !important;
  transform: scale(1.12);
}
.theme-meta {
  font-size: 0.7rem;
  color: #888;
  text-align: center;
  margin-top: 6px;
}
.theme-updated {
  display: block;
  font-size: 0.6rem;
}
.theme-continue-btn-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 32px;
}
.modern-heading {
  font-size: 2.6rem;
  font-weight: 900;
  color: #222;
  margin-left: 4px;
  margin-bottom: 28px;
  text-align: center;
}
.modern-btn {
  border-radius: 14px;
  font-size: 1.25rem;
  font-weight: 800;
  box-shadow: 0 2px 16px rgba(37, 99, 235, 0.1);
  letter-spacing: 0.5px;
  padding: 18px 40px;
  background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
  transition: background 0.2s, box-shadow 0.2s;
  color: #fff;
}
.modern-btn:enabled:hover {
  background: linear-gradient(90deg, #1e40af 0%, #2563eb 100%);
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.18);
}
@media (max-width: 900px) {
  .theme-card-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 24px 12px;
    max-width: 700px;
    padding: 32px 8px 24px 8px;
  }
  .theme-card {
    min-width: 150px;
    max-width: 180px;
    min-height: 170px;
    padding: 12px 6px 8px 6px;
  }
}
@media (max-width: 600px) {
  .theme-header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    max-width: 100%;
    padding: 0 8px;
  }
  .theme-header {
    max-width: 100%;
    padding: 0 8px;
  }
  .theme-card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 6px;
    max-width: 100%;
    padding: 0 4px;
  }
  .theme-card {
    min-width: 120px;
    max-width: 100%;
    min-height: 120px;
    padding: 8px 2px 6px 2px;
  }
  .modern-heading {
    font-size: 1.3rem;
  }
  .theme-continue-btn-wrap {
    margin-top: 12px;
  }
}
</style>
