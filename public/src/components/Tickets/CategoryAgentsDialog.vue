<template>
  <div>
    <v-dialog :model-value="DialogCategoryAgents" max-width="475px" persistent>
      <v-card rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5 ml-n2">Category Agents</span>
          <v-btn
            icon
            variant="text"
            @click="DialogCategoryAgentsEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Chips-->
        <div style="max-height: 400px; overflow-y: auto" class="pa-4">
          <v-row>
            <v-chip
              size="small"
              v-for="(email, index) in StoreObj.auto_assign_group"
              :key="index"
              class="ma-2 chip"
            >
              {{ email }}
            </v-chip>
          </v-row>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: { DialogCategoryAgents: Boolean, StoreObj: Object },

  methods: {
    DialogCategoryAgentsEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>

<style scoped>
.chip {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  background: white !important;
  border: 1px solid transparent !important;
}
.chip:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}
</style>
