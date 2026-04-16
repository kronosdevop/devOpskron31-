/* eslint-disable */
import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import store from "./store";
import "./assets/Styling.css";
import "vuetify/styles";
import { Amplify, Auth } from "aws-amplify";
import { suppressResizeObserverWarnings } from "./utils/resizeObserverFix";
import VueApexCharts from "vue3-apexcharts";
import { Loader } from "@googlemaps/js-api-loader";
import { initiateLocalCacheDB } from "./db.js";
import disableDevtool from "disable-devtool";
import '@mdi/font/css/materialdesignicons.css'

disableDevtool({
  disableMenu: true,
  clearLog: true,
  ondevtoolopen: () => {
    window.location.replace("https://google.com", "__blank");
  },
});

// Create event bus for Vue 3
export const EventBus = {
  listeners: {},
  $emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(...args));
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
        this.listeners[event] = this.listeners[event].filter(
          (cb) => cb !== callback,
        );
      } else {
        delete this.listeners[event];
      }
    }
  },
};
function hideConsoles() {
  // if (process.env.NODE_ENV === "development") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  // }
}

hideConsoles();

const googleMapsLoader = new Loader({
  apiKey: "AIzaSyCiwPvMBsTQy6yiTJDvDkqZPIWdDerOcRI",
  version: "weekly",
  libraries: ["places"],
});

window.googleMapsLoader = googleMapsLoader;

Amplify.configure({
  Auth: {
    region: "us-east-1",

    userPoolId: "us-east-1_xkARtBaPQ",
    userPoolWebClientId: "7aihrcpjd61dtqvs4d686fdf0g",
    identityPoolId: "us-east-1:7cd0aa90-b935-4b30-9d88-daecb7d63558",
    oauth: {
      domain: "stichh.auth.us-east-1.amazoncognito.com",
      scopes: ["openid", "email", "profile"],
      redirectSignIn: "https://portal.stichh.com/home/DashboardView",
      redirectSignOut: "https://portal.stichh.com",
      responseType: "code",
    },
  },

  API: {
    aws_project_region: "us-east-1",
    aws_appsync_graphqlEndpoint:
      "https://kthsfkinmnfchjiymno4yf6ozy.appsync-api.us-east-1.amazonaws.com/graphql",
    aws_appsync_region: "us-east-1",
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
  },

  Storage: {
    AWSS3: {
      bucket: "stichh-medias",
      region: "us-east-1",
    },
  },
});

const app = createApp(App);
app.use(VueApexCharts);
app.use(vuetify);
app.use(router);
app.use(store);

const initializeApp = async () => {
  try {
    await initiateLocalCacheDB.methods.ensureDatabaseInitialized();
  } catch (error) {
    console.warn(
      "Database initialization failed, but app will continue:",
      error,
    );
  }

  suppressResizeObserverWarnings();

  app.mount("#app");
};

initializeApp();
