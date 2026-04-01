<template>
  <div>
    <v-card
      :flat="formActionType != undefined"
      v-if="formActionType != 'initiate'"
    >
      <v-card-text>
        <v-select
          dense
          readonly
          outlined
          class=""
          :label="index.displayLabel"
          :items="index.fieldOptions"
          @click="emit_edit_field(index)"
        ></v-select>
        <v-btn
          x-small
          color="red"
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
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
    </v-card>
    <v-card flat v-else>
      <!-- tt -->
      <v-select
        v-if="index.is_displayed == true && index.input_array_value != null"
        dense
        outlined
        :readonly="index.is_readonly"
        v-model="dropdownOption"
        class=""
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required === true ? [(v) => !!v || 'required'] : []"
        :items="[]"
        @update:modelValue="get_value(dropdownOption, index.display_label, index.key)"

      ></v-select>
      <v-select
        v-if="index.is_displayed == true && index.input_array_value == null"
        dense
        outlined
        :readonly="index.is_readonly"
        v-model="dropdownOption"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'Required '] : []"
        :items="itemsValue"
        @update:modelValue="get_value(dropdownOption, index.display_label, index.key)"
      >
      </v-select>
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
  data: () => ({
    Toggle: 0,
    dropdownOption: "",
    itemsValue: [],
  }),
  created() {
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.dropdownOption =
            element.respectiveValue == "N/A" ? "" : element.respectiveValue;

          this.itemsValue.push(element.respectiveValue);
        }
      });
    }
  },
  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == "" ? "N/A" : fieldvalue,
        key: fieldKey,
      };
      this.$emit("countryField", data);
    },

    emit_edit_field(value) {
      this.$emit("countryEdit", value);
    },
  },
};
</script>
