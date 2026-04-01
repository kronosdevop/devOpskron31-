<template>
  <div>
    <!-- eslint-disable -->
    <v-card flat v-if="formActionType != 'initiate'" >
      <v-text-field
        density="compact"
        variant="outlined"
        readonly
        class="ma-2"
        :model-value="formattedDate"
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
        @click="emit_edit_field(index)"
      >
      </v-text-field>

      <!-- Date Picker Dialog for Design Mode -->
      <v-dialog
        v-model="dateDialog"
        persistent
        max-width="400"
        transition="dialog-bottom-transition"
      >
        <v-card max-width="320">
          <v-date-picker
            v-model="tempDate"
            @update:model-value="onDateSelected"
            color="primary"
            scrollable
            full-width
          ></v-date-picker>
          <v-card-actions class="justify-end">
            <v-btn text color="primary" @click="closeDatePicker">
              Cancel
            </v-btn>
            <v-btn color="primary" @click="closeDatePicker"> OK </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
    <v-card flat v-else class="pa-2">
      <v-text-field
        v-if="index.is_displayed == true"
        :disabled="index.is_readonly"
        :model-value="formattedDate"
        density="compact"
        variant="outlined"
        persistent-hint
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        class="FontSize"
        readonly
        @click="index.is_readonly ? null : handleFieldClick()"
      >
      </v-text-field>

      <!-- Date Picker Dialog -->
      <v-dialog
        v-model="dateDialog"
        persistent
        max-width="400"
        transition="dialog-bottom-transition"
      >
        <v-card max-width="320">
          <v-date-picker
            v-model="tempDate"
            @update:model-value="onDateSelected"
            color="primary"
            scrollable
            full-width
          ></v-date-picker>
          <v-card-actions class="justify-end">
            <v-btn text color="primary" @click="closeDatePicker">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="get_save_value(tempDate, index.display_label, index.key)"
            >
              OK
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable */
import { formatDatepicker } from "@/JsonFiles/DateFormate.js";

export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
    Idx: Number,
  },
  data: () => ({
    Toggle: 0,
    menuDatePicker: false,
    dateField: "",
    endmodal: false,
    tempDate: null,
    dateDialog: false,
  }),
  created() {
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          // Ensure value is stored as string
          if (element.respectiveValue instanceof Date) {
            this.tempDate = element.respectiveValue.toISOString().substr(0, 10);
          } else {
            this.tempDate = element.respectiveValue;
          }
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
    // maxDate() {
    //   // Return today's date in YYYY-MM-DD format to disable future dates
    //   const today = new Date();
    //   const year = today.getFullYear();
    //   const month = String(today.getMonth() + 1).padStart(2, "0");
    //   const day = String(today.getDate()).padStart(2, "0");
    //   return `${year}-${month}-${day}`;
    // },
    // allowedDates() {
    //   // Function to check if date should be allowed (past and current dates only)
    //   return (date) => {
    //     const selectedDate = new Date(date);
    //     const today = new Date();
    //     today.setHours(23, 59, 59, 999); // End of today
    //     return selectedDate <= today;
    //   };
    // },
    formattedDate() {
      if (!this.tempDate) return "";

      // Convert Date object to string if needed
      let dateString = this.tempDate;
      if (this.tempDate instanceof Date) {
        dateString = this.tempDate.toISOString().substr(0, 10);
      }

      var dateFormat =
        this.$store.getters.GetOrgDetails?.organization?.date_format !=
        undefined
          ? this.$store.getters.GetOrgDetails.organization.date_format
          : "dd-MM-yyyy";

      const formatted = formatDatepicker(dateString, dateFormat);
      return formatted || this.formatDateManually(dateString); // Better fallback
    },
  },
  methods: {
    onDateSelected(date) {
      // Handle date selection in local timezone to avoid timezone conversion issues
      if (typeof date === "string") {
        // If it's already a string (YYYY-MM-DD format), use it directly
        this.tempDate = date;
      } else if (date instanceof Date) {
        // If it's a Date object, convert to local date string
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        this.tempDate = `${year}-${month}-${day}`;
      }

      // In initiate mode, also emit the value
      if (this.formActionType == "initiate") {
        this.get_value(this.tempDate, this.index.display_label, this.index.key);
      }
    },

    fetch_date_value(value) {
      var dateFormat =
        this.$store.getters.GetOrgDetails?.organization?.date_format !=
        undefined
          ? this.$store.getters.GetOrgDetails.organization.date_format
          : "dd-MM-yyyy";
      return formatDatepicker(value, dateFormat);
    },

    formatDateManually(dateString) {
      // Manual fallback formatting for dd-MM-yyyy
      if (!dateString) return "";

      try {
        // Parse the date string in local timezone
        const [year, month, day] = dateString.split("-").map(Number);
        if (!year || !month || !day) return dateString;

        // Create date using local components to avoid timezone issues
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) return dateString;

        const formattedDay = String(date.getDate()).padStart(2, "0");
        const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
        const formattedYear = date.getFullYear();

        return `${formattedDay}-${formattedMonth}-${formattedYear}`;
      } catch (error) {
        return dateString;
      }
    },

    handleFieldClick() {
      if (this.index.is_readonly) {
        return; // Do nothing if readonly
      }
      this.openDatePicker();
    },

    openDatePicker() {
      this.dateDialog = true;
    },

    saveDate() {
      this.selectedDate = this.tempDate;
      this.dateDialog = false;
    },

    closeDatePicker() {
      this.dateDialog = false;
      this.tempDate = null;
    },

    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    get_save_value(dateField, fieldlabel, fieldKey) {
      this.dateDialog = false;
      this.get_value(dateField, fieldlabel, fieldKey);
    },

    emit_edit_field(value) {
      // In design mode, open the date picker for editing
      if (this.formActionType != "initiate") {
        this.openDatePicker();
      }
      this.$emit("editDate", value);
      this.$emit("dateIndex", this.Idx);
    },

    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == "" ? "N/A" : fieldvalue,
        key: fieldKey,
      };

      this.$emit("dateField", data);
    },
  },
  watch: {
    index: {
      handler(newVal) {
        // Update tempDate if the field has a value
        if (newVal && newVal.value) {
          // Ensure value is stored as string
          if (newVal.value instanceof Date) {
            this.tempDate = newVal.value.toISOString().substr(0, 10);
          } else {
            this.tempDate = newVal.value;
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
};
</script>
