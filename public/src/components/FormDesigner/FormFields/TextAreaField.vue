<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'">
      <!-- <v-card-text> -->
      <v-textarea
       density="compact"
        variant="outlined"
        class="ma-2"
        readonly
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        auto-grow
        @click="emit_edit_field(index)"
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
      >
        <!-- <template #append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      </v-textarea>
      <!-- -->
      <!-- <v-btn
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
          x-small
          color="red"
          fab
          dark
          absolute
          bottom
          right
          @click="emit_fields((Toggle = 1), index)"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn> -->
      <!-- </v-card-text> -->
    </v-card>
    <v-card flat v-else class="pa-2">
      <v-textarea
        v-if="index.is_displayed == true"
        density="compact"
        variant="outlined"
        v-model="textValue"
       
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        auto-grow
        @blur="get_value(textValue, index.display_label, index.key)"
      ></v-textarea>
    </v-card>
    <!-- <v-card :flat="formActionType != undefined">
      <v-card-text>
        <v-textarea
          dense
          outlined
          class="FontSize"
          :label="index.displayLabel"
          auto-grow
        ></v-textarea>
        <v-btn
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
          x-small
          color="red"
          fab
          dark
          absolute
          bottom
          right
          @click="emit_fields((Toggle = 1), index)"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </v-card-text>
    </v-card> -->
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
  data: () => ({
    Toggle: 0,
  }),
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
  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },
    emit_edit_field(value) {
      this.$emit("paragrapghEdit", value);
    },
  },
};
</script>
