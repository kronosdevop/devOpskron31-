<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'">
      <!-- <v-textarea
        readonly
        dense
        class="ma-2"
        outlined
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        rows="0"
        auto-grow
        @click="emit_edit_field(index)"
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
      > -->
      <!-- <template #append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      <!-- </v-textarea> -->
      <v-card
        flat
        outlined
        class="ma-2 "
        style="position: relative; padding-bottom: 30px;"
      >
        <v-card-text>
          <div @click="emit_edit_field(index)" class="text-left">
            {{ index.displayLabel }}
          </div>

          <v-btn
            v-if="formActionType != 'initiate' && formActionType != 'preview'"
            color="white"
            
            variant="text"
            dark
            class="custom-delete-btn"
            @click="emit_fields((Toggle = 1), index)"
            style="position: absolute; bottom: 12px; right: 1px"
          >
            <v-icon class="custom-delete-icon">mdi-delete</v-icon>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card>
    <v-card flat v-else class="pa-2">
      <div class="text-left FontSize">
        <b>{{ index.display_label }}</b>
      </div>
      <v-divider />
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  data() {
    return {};
  },
  computed: {
    shouldShowDeleteIcon() {
      // Check your conditions here
      if (
        this.formActionType !== "initiate" &&
        this.formActionType !== "preview"
      ) {
        return true; // Show the icon
      } else {
        return false; // Do not show the icon
      }
    },
  },
  created() {},
  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },
    emit_edit_field(value) {
      this.$emit("labelEdit", value);
    },
  },
};
</script>
<style scoped>
.custom-delete-btn {
  background-color: white !important;
}
.custom-delete-icon {
  color: grey !important;
}
</style>