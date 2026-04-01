<template>
  <v-dialog :model-value="Preivew" max-width="500">
    <v-card class="pa-4">
      <!-- HEADER -->
      <v-card-title class="d-flex justify-space-between">
      <span class="text-h6 font-weight-bold">
  <v-icon size="25" class="mb-2" color="primary">
    mdi-file-document-outline
  </v-icon>
  {{ Formdata?.worktype_form_name || "Untitled Form" }} - Preview
</span>
        <v-icon @click="closeDialog">mdi-close</v-icon>
      </v-card-title>

      <v-divider></v-divider>

      <!-- BODY -->
      <v-card-text>
        <v-row>
          <v-col v-for="(field, index) in fields" :key="index" cols="12">
            <!-- 🔥 TEXT -->
            <v-text-field
              class="bright-border"
              v-if="field.type === 'TEXTFIELD' || field.type === 'NAME'"
              :label="field.displayLabel"
              :required="field.is_required"
              variant="outlined"
              density="compact"
              disabled
            />

            <!-- 🔥 PARAGRAPH -->
            <v-textarea
              class="bright-border"
              v-else-if="field.type === 'PARAGRAPH'"
              :label="field.displayLabel"
              :required="field.is_required"
              variant="outlined"
              density="compact"
              disabled
            />

            <!-- 🔥 NUMBER -->
            <v-text-field
              class="bright-border"
              v-else-if="field.type === 'NUMBER'"
              type="number"
              :label="field.displayLabel"
              variant="outlined"
              density="compact"
              disabled
            />

            <!-- 🔥 DATE -->
            <v-text-field
              class="bright-border"
              v-else-if="field.type === 'DATE'"
              type="date"
              :label="field.displayLabel"
              variant="outlined"
              density="compact"
              disabled
            />

            <!-- 🔥 MOBILE -->
            <v-text-field
              class="bright-border"
              v-else-if="field.type === 'MOBILENUMBER'"
              type="tel"
              :label="field.displayLabel"
              variant="outlined"
              density="compact"
              disabled
            />

            <!-- 🔥 EMAIL -->
            <v-text-field
              class="bright-border"
              v-else-if="field.type === 'EMAIL'"
              type="email"
              :label="field.displayLabel"
              variant="outlined"
              density="compact"
              disabled
            />

            <!-- 🔥 DROPDOWN -->
            <v-select
              class="bright-border"
              v-else-if="field.type === 'DROPDOWN'"
              :items="field.fieldOptions || []"
              :label="field.displayLabel"
              variant="outlined"
              density="compact"
              disabled
            />

            <!-- 🔥 CHECKBOX -->
            <v-checkbox
              class="bright-border"
              v-else-if="field.type === 'CHECKBOX'"
              :label="field.displayLabel"
              disabled
            />

            <!-- 🔥 DEFAULT FALLBACK -->
            <v-text-field
              class="bright-border"
              v-else
              :label="field.displayLabel"
              variant="outlined"
              density="compact"
              disabled
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    Preivew: Boolean,
    fields: {
      type: Array,
      default: () => [],
    },
Formdata: Object  },

  methods: {
    closeDialog() {
      this.$emit("close");
    },
  },
};
</script>
<style scoped>
.bright-border :deep(.v-field) {
  border: 1.5px solid #0a0b0c !important; /* primary blue */
  border-radius: 8px;
}

.bright-border :deep(.v-field--active) {
  border: 2px solid #0a0b0c !important;
}

.bright-border :deep(.v-field:hover) {
  border: 1.5px solid #0a0b0c !important;
}
</style>
