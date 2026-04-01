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
      <!-- <v-card-text>
        <v-switch
          v-model="switch1"
          inset
          readonly
          dense
          :label="
            index.is_required == true
              ? index.displayLabel + '*'
              : index.displayLabel
          "
          @click="emit_edit_field(index)"
        ></v-switch>
        <v-btn
          x-small
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
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
      </v-card-text> -->
    </v-card>
    <v-card flat v-else class="pa-2">
      <v-switch
        v-if="index.is_displayed == true"
        v-model="switch1"
        inset
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        @update:modelValue="get_value(switch1, index.display_label, index.key)"

      ></v-switch>
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
    return {
      switch1: false,
    };
  },
  created() {
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.switch1 = element.respectiveValue === "true" || element.respectiveValue === true;
        }
      });
    }
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

      this.$emit("flipSwitchh", data);
    },
    emit_edit_field(value) {
      this.$emit("flipEdit", value);
    },
  },
};
</script>