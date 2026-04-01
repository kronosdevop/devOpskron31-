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
          :label="
            index.is_required == true
              ? index.displayLabel + '*'
              : index.displayLabel
          "
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
      <v-select
        dense
        outlined
        :readonly="index.is_readonly"
        v-model="designations"
        class=""
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required === true ? [(v) => !!v || 'required'] : []"
        :items="designationItems"
        item-text="designation_name"
        item-value="designation_id"
        @blur="get_value(designations, index.display_label, index.key)"
      ></v-select>
    </v-card>
  </div>
</template>
      <script>
import { get_designations_details } from "@/mixins/GetDesignations.js";
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  mixins: [get_designations_details],
  data: () => ({
    Toggle: 0,
    dropdownOption: "",
    itemsValue: [],
    designationItems: [],
    designations: "",
  }),
  async created() {
    // if (this.formActionType == "initiate") {
    await this.get_designations_details();
    await this.fetch_details();
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.designations =
            element.respectiveValue == "N/A" ? "" : element.respectiveValue;

          // this.itemsValue.push(element.respectiveValue);
        }
      });
    }
    // }
  },
  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    emit_edit_field(value) {
      this.$emit("DesginationEdit", value);
    },

    fetch_details() {
      this.designationList.forEach((element) => {
        this.designationItems.push({
          designation_name: element.designation_name,
          designation_id: element.designation_id,
        });
      });
    },

    get_value(designations, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: designations == "" ? "N/A" : designations,
        key: fieldKey,
      };
      this.$emit("designationSelected", data);
    },
  },
};
</script>
      