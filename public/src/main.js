/* eslint-disable */
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import store from './store'
import './assets/Styling.css'
import 'vuetify/styles'
import { Amplify } from 'aws-amplify';
import { suppressResizeObserverWarnings } from './utils/resizeObserverFix';
// import awsconfig from './aws-exports'
// import { createEventBus } from './Eventbus.js'
// import * as storage from '@aws-amplify/storage';
// import Croppa from 'vue-croppa';
// import pdf from "vue-pdf";
import VueApexCharts from "vue3-apexcharts";
import { Loader } from '@googlemaps/js-api-loader';
import { initiateLocalCacheDB } from './db.js';

// Create event bus for Vue 3
export const EventBus = {
  listeners: {},
  $emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  },
  $on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  $off(event, callback) {
    if (this.listeners[event]) {
      if (callback) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
      } else {
        delete this.listeners[event];
      }
    }
  }
};

// Configure Google Maps
// Note: For PlaceAutocompleteElement (new API), ensure:
// 1. Places API (New) is enabled in Google Cloud Console
// 2. API key has proper referrer restrictions (add http://localhost:8081/* for local dev)
// 3. For production, add your production domain to API key restrictions
const googleMapsLoader = new Loader({
  apiKey: 'AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI', // Replace with your actual API key
  version: 'weekly',
  libraries: ['places'] // Required for both legacy and new Places API
});

// Make Google Maps loader available globally
window.googleMapsLoader = googleMapsLoader;

// Amplify.register(Storage);
Amplify.configure({
  Auth: {
    userPoolId: "us-east-1_xkARtBaPQ",
    region: "us-east-1",
    userPoolWebClientId: "7aihrcpjd61dtqvs4d686fdf0g",
    identityPoolId: "us-east-1:7cd0aa90-b935-4b30-9d88-daecb7d63558"

  },
  API: {

    aws_project_region: "us-east-1",
    aws_appsync_graphqlEndpoint: "https://kthsfkinmnfchjiymno4yf6ozy.appsync-api.us-east-1.amazonaws.com/graphql",
    aws_appsync_region: "us-east-1",
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
  },
  // ...awsconfig,
  //
  Storage: {
    AWSS3: {
      bucket: 'stichh-medias',
      region: 'us-east-1'
    }
  }


})
// Storage: {
//   AWSS3: {
//     bucket: awsconfig.aws_user_files_s3_bucket,
//     region: awsconfig.aws_user_files_s3_bucket_region
//   }
// }

const app = createApp(App)
app.use(VueApexCharts);
app.use(vuetify)
app.use(router)
app.use(store)

// Initialize database before mounting the app
const initializeApp = async () => {
  try {
    // Initialize the database
    await initiateLocalCacheDB.methods.ensureDatabaseInitialized();
    // console.log('Database initialized successfully');
  } catch (error) {
    console.warn('Database initialization failed, but app will continue:', error);
  }

  // Suppress ResizeObserver warnings
  suppressResizeObserverWarnings();

  // Mount the app
  app.mount('#app');
};

initializeApp();
