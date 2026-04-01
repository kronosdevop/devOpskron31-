<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script>
/* eslint-disable */
export default {
  name: "App",
  components: {},
};
</script>

<style lang="scss">
@import "@/assets/Styling.css";
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;700&display=swap");

// html,
// body {
//   height: 100%;
//   margin: 0;
//   background-color: #e35858; /* Background color for the entire page */
// }

#app {
  font-family: Sora, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  height: 100%;
}

.FontVariant1 {
  font-family: Sora, Helvetica, Arial, sans-serif !important;
  font-size: 0.8rem !important;
  font-weight: 500 !important;
}

.FontVariant2 {
  font-family: Sora, Helvetica, Arial, sans-serif !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
}

.FontVariant3 {
  font-family: Sora, Helvetica, Arial, sans-serif !important;
  font-size: 1.1rem !important;
  font-weight: 500 !important;
}

.FontVariant4 {
  font-family: Sora, Helvetica, Arial, sans-serif !important;
  font-size: 30px !important;
  font-weight: 500 !important;
}

/* Apply background color to Vuetify's v-application wrapper */
// .v-application {
//   background-color: #e35858; /* Background color for Vuetify wrapper */
// }

/* Suppress ResizeObserver warnings */
.v-application {
  contain: layout style paint;
}
</style>
