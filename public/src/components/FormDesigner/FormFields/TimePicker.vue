<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'">
      <v-text-field
        density="compact"
        variant="outlined"
        readonly
        class="ma-2"
        :model-value="time"
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

      <!-- Time Picker Dialog for Design Mode -->
      <v-dialog
        v-model="timeDialog"
        persistent
        max-width="400"
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-time-picker
            v-model="time"
            format="24hr"
            color="primary"
            full-width
          ></v-time-picker>
          <v-card-actions class="justify-end">
            <v-btn text color="primary" @click="closeTimePicker">
              Cancel
            </v-btn>
            <v-btn color="primary" @click="saveTime"> OK </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
    <v-card flat v-else-if="formActionType == 'preview'"> </v-card>
    <v-card flat v-else class="pa-2">
      <v-text-field
        v-if="index.is_displayed == true"
        :disabled="index.is_readonly"
        v-model="time"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        density="compact"
        variant="outlined"
        readonly
        @click="openTimePicker"
      ></v-text-field>

      <!-- Time Picker Dialog for Initiate Mode -->
      <v-dialog
        v-model="timeDialog"
        persistent
        max-width="290"
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-time-picker
            v-model="time"
            format="24hr"
            color="primary"
            full-width
          ></v-time-picker>
          <v-card-actions class="justify-end">
            <v-btn text color="primary" @click="closeTimePicker">
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="save_time(time, index.display_label, index.key)"
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
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  data() {
    return {
      time: "",
      timeDialog: false,
    };
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
  created() {
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.time = element.respectiveValue;
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

      this.$emit("timeInput", data);
    },
    save_time(time, fieldlabel, fieldKey) {
      this.timeDialog = false;
      this.get_value(time, fieldlabel, fieldKey);
    },
    emit_edit_field(value) {
      // In design mode, open the time picker for editing
      if (this.formActionType != "initiate") {
        this.openTimePicker();
      }
      this.$emit("timeEdit", value);
    },
    openTimePicker() {
      this.timeDialog = true;
    },
    closeTimePicker() {
      this.timeDialog = false;
      this.time = "";
    },
    saveTime() {
      this.timeDialog = false;
    },
  },
};
</script>