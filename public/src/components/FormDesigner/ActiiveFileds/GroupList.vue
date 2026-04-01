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
        v-model="departments"
        class=""
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required === true ? [(v) => !!v || 'required'] : []"
        :items="depertmentItems"
        item-text="department_name"
        item-value="department_id"
        @blur="get_value(departments, index.display_label, index.key)"
      ></v-select>
    </v-card>
  </div>
</template>
        <script>
import { get_department_details } from "@/mixins/GetDepartments.js";
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  mixins: [get_department_details],
  data: () => ({
    Toggle: 0,
    dropdownOption: "",
    itemsValue: [],
    depertmentItems: [],
    departments: "",
  }),

  async created() {
    // if (this.formActionType == "initiate") {
    await this.get_department_details();
    await this.fetch_details();
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.departments =
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
      this.$emit("GroupEdit", value);
    },

    fetch_details() {
      this.departmentList.forEach((element) => {
        this.depertmentItems.push({
          department_name: element.department_name,
          department_id: element.department_id,
        });
      });
    },

    get_value(departments, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: departments == "" ? "N/A" : departments,
        key: fieldKey,
      };
      this.$emit("groupSelected", data);
    },
  },
};
</script>
        