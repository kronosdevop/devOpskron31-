<template>
  <div>
    <v-dialog
      :model-value="DialogSubcategoryAgents"
      max-width="500px"
      persistent
    >
      <v-card rounded="lg">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Subcategory Agents</span>
          <v-btn
            icon
            variant="text"
            @click="DialogSubcategoryAgentsEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <div style="max-height: 400px; overflow-y: auto" class="pa-4">
          <v-row>
            <v-chip
              size="small"
              class="ma-2 chip"
              v-for="(email, index) in StoreObj.auto_assign_group"
              :key="index"
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
  props: { DialogSubcategoryAgents: Boolean, StoreObj: Object },

  data: () => ({}),

  methods: {
    DialogSubcategoryAgentsEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>
