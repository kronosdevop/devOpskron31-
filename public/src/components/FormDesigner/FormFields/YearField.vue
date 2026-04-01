<template>
  <div>
    <!-- eslint-disable -->
    <v-card flat v-if="formActionType != 'initiate'" class="pa-1">
      <!-- <v-card-text> -->
      <v-text-field
        density="compact"
        variant="outlined"
        readonly
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
        @click="emit_edit_field(index)"
      >
        <!-- <template #append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      </v-text-field>
      <!-- <v-menu
          ref="menu"
          v-model="menuDatePicker"
          :close-on-content-click="false"
          :return-value.sync="dateField"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="dateField"
              dense
              class="FontSize"
              :label="`${index.displayLabel}`"
              readonly
              outlined
              v-bind="attrs"
              v-on="on"
              @click="emit_edit_field(index)"
            >
            </v-text-field>
          </template>
          <v-date-picker v-model="dateField" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
            <v-btn text color="primary" @click="$refs.menu.save(dateField)">
              OK
            </v-btn>
          </v-date-picker>
        </v-menu> -->
      <!-- <v-btn
          x-small
          color="red"
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
          x-small
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
      <v-select
        v-if="index.is_displayed == true"
        density="compact"
        variant="outlined"
        :readonly="index.is_readonly"
        v-model="selectedYear"
        class=""
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required === true ? [(v) => !!v || 'required'] : []"
        :items="yearOptions"
        @blur="get_value(selectedYear, index.display_label, index.key, index)"
      ></v-select>
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
    menuDatePicker: false,
    dateField: "",
    menu: false,
    selectedDate: null,
    selectedYear: "",
    yearOptions: [],
  }),
  created() {
    this.fetch_years();
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.selectedYear = element.respectiveValue;
          //   console.log(this.selectedYear);
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

    fetch_years() {
      this.yearOptions = [];
      const currentYear = new Date().getFullYear();

      for (let year = currentYear; year >= currentYear - 100; year--) {
        this.yearOptions.push(year.toString());
      }
      //   console.log(this.yearOptions);
    },

    // get_save_value(dateField, fieldlabel, fieldKey) {
    //   this.$refs.menu.save(dateField);
    //   this.get_value(dateField, fieldlabel, fieldKey);
    // },

    emit_edit_field(value) {
      this.$emit("editYear", value);
    },

    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == "" ? "N/A" : fieldvalue,
        key: fieldKey,
      };

      this.$emit("yearField", data);
    },
  },
};
</script>
