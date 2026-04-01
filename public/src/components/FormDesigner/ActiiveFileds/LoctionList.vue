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
        v-model="locations"
        class=""
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required === true ? [(v) => !!v || 'required'] : []"
        :items="loactionitems"
        item-text="location_name"
        item-value="location_id"
        @blur="get_value(locations, index.display_label, index.key)"
      ></v-select>
    </v-card>
  </div>
</template>
    <script>
import { get_location_details } from "@/mixins/GetLocations.js";
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  mixins: [get_location_details],
  data: () => ({
    Toggle: 0,
    dropdownOption: "",
    itemsValue: [],
    loactionitems: [],
    locations: "",
  }),
  async created() {
    // if (this.formActionType == "initiate") {
    await this.get_location_details();
    await this.fetch_details();
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.locations =
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
      this.$emit("LocationEdit", value);
    },

    fetch_details() {
      this.locationList.forEach((element) => {
        this.loactionitems.push({
          location_name: element.location_name,
          location_id: element.location_id,
        });
      });
    },

    get_value(locations, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: locations == "" ? "N/A" : locations,
        key: fieldKey,
      };
      this.$emit("locationselected", data);
    },
  },
};
</script>
    