<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'">
      <v-text-field
          density="compact"
        variant="outlined"
        readonly
        class="ma-2"
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        rows="0"
        auto-grow
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
        @click="emit_edit_field(index)"
      >
        <!-- <template #append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      </v-text-field>
      <!-- <v-card-text> -->
      <!-- <v-checkbox
          dense
          readonly
          :label="
            index.is_required == true
              ? index.displayLabel + '*'
              : index.displayLabel
          "
          @click="emit_edit_field(index)"
        ></v-checkbox>
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
        </v-btn> -->
      <!-- </v-card-text> -->
    </v-card>
    <v-card flat v-else>
      <v-checkbox
        v-if="index.is_displayed == true"
           density="compact"
        
        v-model="checkInput"
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        @update:modelValue="get_value(checkInput, index.display_label, index.key)"
      ></v-checkbox>
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
  created() {
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.checkInput = element.respectiveValue === "true" || element.respectiveValue === true;
        }
      });
    }
  },
  data: () => ({
    Toggle: 0,
    checkInput: false,
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

    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue,
        key: fieldKey,
      };

      this.$emit("checkboxvalue", data);
    },

    emit_edit_field(value) {
      this.$emit("checkboxEdit", value);
    },
  },
};
</script>
<style>
.dense-text-field .v-input__append-inner .v-icon {
  font-size: 1px !important; /* Adjust font size for denser appearance */
  margin: 0; /* Remove margin around the icon */
  padding: 0; /* Remove padding around the icon */
}
</style>
