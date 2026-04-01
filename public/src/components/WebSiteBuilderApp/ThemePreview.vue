<template>
  <v-dialog
    v-model="showPreview"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    @click:outside="closePreview"
  >
  <v-toolbar  dense dark  elevation="0">
       
        <v-toolbar-title class="ml-2">{{ theme?.name }} Preview</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="primary" icon  @click="closePreview">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
    <v-card class="preview-modal">
      <!-- Header Toolbar -->
     

      <!-- Preview Content -->
      <div 
        class="preview-content"
        :style="{ background: theme?.bg }"
      >
        <!-- Navigation Bar -->
        <nav 
          class="preview-nav"
          :style="{ 
            background: theme?.bg,
            borderBottom: `1px solid ${theme?.bodyColor}20`
          }"
        >
          <div class="nav-container">
            <div 
              class="nav-logo"
              :style="{ color: theme?.titleColor }"
            >
              YourBrand
            </div>
            <div class="nav-links">
              <a 
                href="#"
                class="nav-link"
                :style="{ color: theme?.bodyColor }"
              >Home</a>
              <a 
                href="#"
                class="nav-link"
                :style="{ color: theme?.bodyColor }"
              >About</a>
              <a 
                href="#"
                class="nav-link"
                :style="{ color: theme?.bodyColor }"
              >Services</a>
              <a 
                href="#"
                class="nav-link"
                :style="{ color: theme?.bodyColor }"
              >Contact</a>
            </div>
          </div>
        </nav>

        <!-- Hero Section -->
        <section class="preview-hero">
          <div class="hero-container">
            <div class="hero-content">
              <h1 
                class="hero-title"
                :style="{ color: theme?.titleColor }"
              >
                Welcome to Your Website
              </h1>
              <p 
                class="hero-subtitle"
                :style="{ color: theme?.bodyColor }"
              >
                This is how your website will look with the {{ theme?.name }} theme. 
                Experience the perfect blend of style and functionality.
              </p>
              <div class="hero-buttons">
                <v-btn
                  class="hero-btn primary"
                  :style="{ 
                    background: theme?.linkColor,
                    color: '#fff'
                  }"
                  large
                >
                  Get Started
                </v-btn>
                <v-btn
                  class="hero-btn secondary"
                  :style="{ 
                    border: `2px solid ${theme?.linkColor}`,
                    color: theme?.linkColor
                  }"
                  outlined
                  large
                >
                  Learn More
                </v-btn>
              </div>
            </div>
            <div class="hero-visual">
              <div 
                class="hero-placeholder"
                :style="{ 
                  background: theme?.bg,
                  border: `2px solid ${theme?.bodyColor}20`
                }"
              >
                <v-icon 
                  :style="{ color: theme?.bodyColor }"
                  size="48"
                >
                  mdi-image
                </v-icon>
                <p 
                  :style="{ color: theme?.bodyColor }"
                  class="placeholder-text"
                >
                  Hero Image
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="preview-features">
          <div class="features-container">
            <h2 
              class="section-title"
              :style="{ color: theme?.titleColor }"
            >
              Why Choose Us
            </h2>
            <div class="features-grid">
              <div 
                v-for="(feature, index) in features"
                :key="index"
                class="feature-card"
                :style="{ 
                  background: theme?.bg,
                  border: `1px solid ${theme?.bodyColor}15`
                }"
              >
                <div 
                  class="feature-icon"
                  :style="{ color: theme?.linkColor }"
                >
                  <v-icon size="32">{{ feature.icon }}</v-icon>
                </div>
                <h3 
                  class="feature-title"
                  :style="{ color: theme?.titleColor }"
                >
                  {{ feature.title }}
                </h3>
                <p 
                  class="feature-description"
                  :style="{ color: theme?.bodyColor }"
                >
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- About Section -->
        <section class="preview-about">
          <div class="about-container">
            <div class="about-content">
              <h2 
                class="section-title"
                :style="{ color: theme?.titleColor }"
              >
                About Our Company
              </h2>
              <p 
                class="about-text"
                :style="{ color: theme?.bodyColor }"
              >
                We are passionate about creating exceptional digital experiences that help businesses grow and succeed. Our team combines creativity with technical expertise to deliver solutions that make a difference.
              </p>
              <p 
                class="about-text"
                :style="{ color: theme?.bodyColor }"
              >
                With years of experience in web development and design, we understand what it takes to build websites that not only look great but also perform exceptionally well.
              </p>
              <a 
                href="#"
                class="about-link"
                :style="{ color: theme?.linkColor }"
              >
                Learn more about our story →
              </a>
            </div>
            <div class="about-visual">
              <div 
                class="about-placeholder"
                :style="{ 
                  background: theme?.bg,
                  border: `2px solid ${theme?.bodyColor}20`
                }"
              >
                <v-icon 
                  :style="{ color: theme?.bodyColor }"
                  size="40"
                >
                  mdi-account-group
                </v-icon>
                <p 
                  :style="{ color: theme?.bodyColor }"
                  class="placeholder-text"
                >
                  Team Photo
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Services Section -->
        <section class="preview-services">
          <div class="services-container">
            <h2 
              class="section-title"
              :style="{ color: theme?.titleColor }"
            >
              Our Services
            </h2>
            <div class="services-grid">
              <div 
                v-for="(service, index) in services"
                :key="index"
                class="service-card"
                :style="{ 
                  background: theme?.bg,
                  border: `1px solid ${theme?.bodyColor}15`
                }"
              >
                <div 
                  class="service-icon"
                  :style="{ color: theme?.linkColor }"
                >
                  <v-icon size="28">{{ service.icon }}</v-icon>
                </div>
                <h3 
                  class="service-title"
                  :style="{ color: theme?.titleColor }"
                >
                  {{ service.title }}
                </h3>
                <p 
                  class="service-description"
                  :style="{ color: theme?.bodyColor }"
                >
                  {{ service.description }}
                </p>
                <a 
                  href="#"
                  class="service-link"
                  :style="{ color: theme?.linkColor }"
                >
                  Learn more →
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- Contact Section -->
        <section class="preview-contact">
          <div class="contact-container">
            <h2 
              class="section-title"
              :style="{ color: theme?.titleColor }"
            >
              Get In Touch
            </h2>
            <p 
              class="contact-subtitle"
              :style="{ color: theme?.bodyColor }"
            >
              Ready to start your project? Let's discuss how we can help bring your vision to life.
            </p>
            <div class="contact-form">
              <div class="form-row">
                <div class="form-group">
                  <label 
                    class="form-label"
                    :style="{ color: theme?.titleColor }"
                  >
                    Name
                  </label>
                  <input 
                    type="text"
                    class="form-input"
                    :style="{ 
                      border: `1px solid ${theme?.bodyColor}30`,
                      color: theme?.bodyColor,
                      background: theme?.bg
                    }"
                    placeholder="Your name"
                  >
                </div>
                <div class="form-group">
                  <label 
                    class="form-label"
                    :style="{ color: theme?.titleColor }"
                  >
                    Email
                  </label>
                  <input 
                    type="email"
                    class="form-input"
                    :style="{ 
                      border: `1px solid ${theme?.bodyColor}30`,
                      color: theme?.bodyColor,
                      background: theme?.bg
                    }"
                    placeholder="your@email.com"
                  >
                </div>
              </div>
              <div class="form-group">
                <label 
                  class="form-label"
                  :style="{ color: theme?.titleColor }"
                >
                  Message
                </label>
                <textarea 
                  class="form-textarea"
                  :style="{ 
                    border: `1px solid ${theme?.bodyColor}30`,
                    color: theme?.bodyColor,
                    background: theme?.bg
                  }"
                  placeholder="Tell us about your project..."
                  rows="4"
                ></textarea>
              </div>
              <v-btn
                class="contact-btn"
                :style="{ 
                  background: theme?.linkColor,
                  color: '#fff'
                }"
                large
              >
                Send Message
              </v-btn>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer 
          class="preview-footer"
          :style="{ 
            background: theme?.bg,
            borderTop: `1px solid ${theme?.bodyColor}20`
          }"
        >
          <div class="footer-container">
            <div class="footer-content">
              <div 
                class="footer-logo"
                :style="{ color: theme?.titleColor }"
              >
                YourBrand
              </div>
              <p 
                class="footer-text"
                :style="{ color: theme?.bodyColor }"
              >
                Creating exceptional digital experiences since 2020.
              </p>
            </div>
            <div class="footer-links">
              <a 
                href="#"
                class="footer-link"
                :style="{ color: theme?.bodyColor }"
              >Privacy Policy</a>
              <a 
                href="#"
                class="footer-link"
                :style="{ color: theme?.bodyColor }"
              >Terms of Service</a>
              <a 
                href="#"
                class="footer-link"
                :style="{ color: theme?.bodyColor }"
              >Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ThemePreview',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    theme: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      features: [
        {
          icon: 'mdi-rocket-launch',
          title: 'Fast Performance',
          description: 'Lightning-fast loading times and smooth interactions.'
        },
        {
          icon: 'mdi-shield-check',
          title: 'Secure & Reliable',
          description: 'Built with security best practices and reliable hosting.'
        },
        {
          icon: 'mdi-devices',
          title: 'Mobile Responsive',
          description: 'Perfect experience across all devices and screen sizes.'
        },
        {
          icon: 'mdi-cog',
          title: 'Easy to Manage',
          description: 'Simple content management and easy updates.'
        }
      ],
      services: [
        {
          icon: 'mdi-web',
          title: 'Web Development',
          description: 'Custom websites built with modern technologies and best practices.'
        },
        {
          icon: 'mdi-palette',
          title: 'UI/UX Design',
          description: 'Beautiful, intuitive designs that enhance user experience.'
        },
        {
          icon: 'mdi-chart-line',
          title: 'Digital Marketing',
          description: 'Strategic marketing solutions to grow your online presence.'
        }
      ]
    }
  },
  computed: {
    showPreview: {
      get() {
        return this.show
      },
      set(value) {
        this.$emit('update:show', value)
      }
    }
  },
  methods: {
    closePreview() {
      
      this.$emit('update:show', false)
    },
    selectTheme() {
      this.$emit('select-theme', this.theme)
      this.closePreview()
    }
  }
}
</script>

<style scoped>
.preview-modal {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.v-toolbar {
  min-height: 44px !important;
  height: 44px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border-bottom: 1px solid #e0e7ef;
  background: #fff !important;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 0 !important;
  margin-top: 0 !important;
}

.preview-content > *:first-child {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Navigation */
.preview-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: 700;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.nav-link:hover {
  opacity: 0.7;
}

/* Hero Section */
.preview-hero {
  padding-top: 0 !important;
  margin-top: 0 !important;
  padding-bottom: 48px;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 24px;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 16px;
}

.hero-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
}

.hero-btn.secondary {
  background: transparent !important;
}

.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-placeholder {
  width: 100%;
  height: 300px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.6;
}

.placeholder-text {
  margin-top: 16px;
  font-size: 0.9rem;
  opacity: 0.7;
}

/* Features Section */
.preview-features {
  padding: 80px 0;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 60px;
  line-height: 1.2;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-card {
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.feature-description {
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.8;
}

/* About Section */
.preview-about {
  padding: 80px 0;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.about-text {
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 20px;
  opacity: 0.9;
}

.about-link {
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.2s;
}

.about-link:hover {
  opacity: 0.8;
}

.about-placeholder {
  width: 100%;
  height: 250px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.6;
}

/* Services Section */
.preview-services {
  padding: 80px 0;
}

.services-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}

.service-card {
  padding: 32px;
  border-radius: 16px;
  transition: transform 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
}

.service-icon {
  margin-bottom: 20px;
}

.service-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.service-description {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 16px;
  opacity: 0.8;
}

.service-link {
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.service-link:hover {
  opacity: 0.8;
}

/* Contact Section */
.preview-contact {
  padding: 80px 0;
}

.contact-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}

.contact-subtitle {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 48px;
  opacity: 0.9;
}

.contact-form {
  text-align: left;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: currentColor !important;
}

.contact-btn {
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  margin-top: 16px;
}

/* Footer */
.preview-footer {
  padding: 40px 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-logo {
  font-size: 1.25rem;
  font-weight: 700;
}

.footer-text {
  margin-top: 8px;
  font-size: 0.9rem;
  opacity: 0.7;
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  text-decoration: none;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.footer-link:hover {
  opacity: 0.7;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-container,
  .about-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .footer-container {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .nav-links {
    display: none;
  }
  
  .preview-hero {
    padding-top: 16px;
  }
}
</style> 