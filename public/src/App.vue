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
  // mounted() {
  //   // 🚫 Disable right-click globally
  //   document.addEventListener("contextmenu", (e) => e.preventDefault());

  //   // 🚫 Disable devtools shortcuts
  //   document.addEventListener("keydown", function (e) {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
  //       (e.ctrlKey && e.key === "U")
  //     ) {
  //       e.preventDefault();
  //     }
  //   });

  //   // ⚠️ Detect if DevTools is open
  //   setInterval(() => {
  //     if (
  //       window.outerWidth - window.innerWidth > 200 ||
  //       window.outerHeight - window.innerHeight > 200
  //     ) {
  //       document.body.innerHTML =
  //         "<h2 style='text-align:center;'>Developer tools are disabled 🚫</h2>";
  //     }
  //   }, 1000);   
  // },
};
</script>

<style lang="scss">
@import "@/assets/Styling.css";
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;500;700&display=swap");

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
.v-application {
  contain: layout style paint;
}
.hover-elevate {
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.hover-elevate:hover {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}
.calendar {
  padding: 16px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.title {
  font-weight: 700;
  font-size: 18px;
}
.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 8px;
  color: #999;
  font-size: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}
.cell {
  min-height: 120px;
  border-radius: 14px;
  padding: 10px;

  background: white;
  border: 1px solid #f1f1f1;

  transition: all 0.2s ease;
}

.cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}
.cell.today {
  border: none;
  background: linear-gradient(135deg, #fff0f5, #fff);
  box-shadow: 0 0 0 2px #db4c77 inset;
}
.date {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
}
.event {
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 4px 6px;
  border-radius: 8px;

  background: #f4f6f8;
  margin-bottom: 4px;

  font-size: 11px;
}
.event img {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}
.name {
  font-size: 11px;
  font-weight: 600;
}
.time {
  font-size: 10px;
  color: #888;
}
.event {
  display: flex;
  align-items: center;
  gap: 6px;

  margin-bottom: 6px;
  background: #fafafa;
  padding: 6px;
  border-radius: 6px;

  position: relative;
}
.event-content {
  flex: 1;
}

.delete-btn {
  opacity: 0;
  transition: 0.2s;
}

.event:hover .delete-btn {
  opacity: 1;
}

.delete-btn .v-icon {
  transition: color 0.2s ease;
}

.delete-btn:hover .v-icon {
  color: #ef4444 !important;
}
.header {
  position: sticky;
  top: 0;
  z-index: 10;

  background: white;
  padding: 10px 12px;

  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}
.date {
  font-weight: 700;
  font-size: 13px;
  color: #444;
}
.weekdays {
  font-size: 11px;
  color: #aaa;
  font-weight: 500;
}
.v-skeleton-loader {
  border-radius: 8px;
}
.more {
  font-size: 11px;
  color: #db4c77;
  font-weight: 600;
  margin-top: 4px;
}
.skeleton-event {
  height: 28px;
  border-radius: 8px;
  margin-bottom: 6px;

  background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 37%, #f0f0f0 63%);

  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
.empty-day {
  font-size: 11px;
  color: #9aa0a6;

  margin-top: 10px;
  padding: 10px;

  text-align: center;

  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  background: #fcfcfc;
}
</style>
