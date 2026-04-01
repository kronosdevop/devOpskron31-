<template>
  <div>
    <!-- Card Grid View -->
    <div v-if="!selectedComponent">
      <v-card flat class="pa-4 overflow-y-auto" :height="windowHeight">
        <v-card-text class="pa-0">
          <!-- Card Grid Layout -->
          <v-row>
            <v-col
              v-for="(item, index) in configurations"
              :key="index"
              cols="12"
              sm="6"
              md="4"
              class="mb-4"
            >
              <v-card
                class="settings-card"
                elevation="2"
                @click="openComponent(item)"
              >
                <v-card-text class="pa-4">
                  <!-- Header with Icon -->
                  <div class="d-flex align-start mb-3">
                    <!-- Icon Container -->
                    <div class="icon-container">
                      <v-icon class="icon-outline" size="24">{{
                        item.icon
                      }}</v-icon>
                    </div>
                  </div>

                  <!-- Title -->
                  <div class="mb-2">
                    <h3 class="card-title">{{ item.title }}</h3>
                  </div>

                  <!-- Description -->
                  <p class="card-description">{{ item.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <div v-else>
      <component
        :is="selectedComponent.component"
        :search="search"
        ref="tagsCardRef"
        @view-change="currentChildView = $event"
        @component-opened="currentOpenedComponent = $event"
        @exit-tags="goBack"
        @exit-back="goBack"
      />
    </div>
  </div>
</template>

<script>
import ApisCard from "./ApisCard.vue";
import TicketTagsCard from "./TicketTagsCard.vue";

export default {
  props: { search: String },

  components: { ApisCard, TicketTagsCard },

  data() {
    return {
      currentChildView: "categories",

      windowHeight: 0,
      selectedComponent: null,
      currentOpenedComponent: null,

      configurations: [
        {
          title: "Categories and Subcategories",
          description: "Configure ticket categories and subcategories",
          icon: "mdi-tangram",
          component: TicketTagsCard,
        },
        {
          title: "APIs",
          description: "Configure external APIs",
          icon: "mdi-connection",
          component: ApisCard,
        },
      ],
    };
  },

  mounted() {
    this.windowHeight = window.innerHeight - 150;
  },

  methods: {
    openComponent(item) {
      this.selectedComponent = item;
      this.$emit("component-opened", item.component);
    },

    goBack() {
      this.selectedComponent = null;
      this.$emit("component-opened", null);
    },
  },
};
</script>

<style scoped>
.settings-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  height: 100% !important;
  min-height: 180px !important;
  background: white !important;
  border: 1px solid transparent !important;
}
.settings-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  background: linear-gradient(
    135deg,
    #ffe5f0 0%,
    #e8f4fd 50%,
    #f0e8ff 100%
  ) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}
.icon-container {
  width: 48px !important;
  height: 48px !important;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #db4c77 0%, #9c27b0 100%) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.3) !important;
}
.icon-outline {
  color: rgba(255, 255, 255, 0.85) !important;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) !important;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.6),
    0 0 4px rgba(255, 255, 255, 0.4), 0 0 6px rgba(255, 255, 255, 0.2) !important;
  opacity: 0.95 !important;
}
.card-title {
  font-size: 18px !important;
  font-weight: 500 !important;
  color: #2c3e50 !important;
  margin: 0 !important;
  line-height: 1.2 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
.card-description {
  font-size: 14px !important;
  color: #6c757d !important;
  line-height: 1.4 !important;
  margin: 0 !important;
  font-weight: 400 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
@media (max-width: 768px) {
  .settings-card {
    min-height: 160px !important;
  }
  .card-title {
    font-size: 16px !important;
  }
  .card-description {
    font-size: 13px !important;
  }
  .icon-container {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>
