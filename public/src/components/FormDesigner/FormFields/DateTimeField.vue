<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'">
      <!-- <v-card-text> -->
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
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
        @click="emit_edit_field(index)"
      >
        <!-- <template v-slot:append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      </v-text-field>
      <!-- <v-menu
          ref="menu"
          v-model="menu2"
          :close-on-content-click="false"
          :nudge-right="40"
          :return-value.sync="time"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              dense
              v-model="time"
              :label="`${index.displayLabel}`"
              readonly
              outlined
              v-bind="attrs"
              v-on="on"
              @click="emit_edit_field(index)"
            ></v-text-field>
          </template>
          <v-time-picker
            v-if="menu2"
            v-model="time"
            full-width
            @click:minute="$refs.menu.save(time)"
          ></v-time-picker>
        </v-menu> -->
      <!-- <v-btn
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
        </v-btn> -->
      <!-- </v-card-text> -->
    </v-card>
    <v-card flat v-else-if="formActionType == 'preview'"> </v-card>
    <v-card flat v-else class="pa-2">
      <v-text-field
        v-if="index.is_displayed == true"
        density="compact"
        variant="outlined"
        v-model="dateTimevalue"
        readonly
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        rows="0"
        auto-grow
        @click="show_date_time_picker()"
        @blur="get_value(dateTimevalue, index.display_label, index.key)"
      />
      <!-- :readonly="index.is_readonly" -->

      <!-- Combined Date & Time Picker Dialog -->
      <v-dialog v-model="dateTimeMenu" persistent max-width="600">
        <v-card>
          <v-card-title class="text-h6"> Select Date & Time </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-date-picker
                  v-model="dateValue"
                  @update:model-value="onDateSelected"
                  color="primary"
                  scrollable
                  full-width
                ></v-date-picker>
              </v-col>
              <v-col cols="12" md="6">
                <v-time-picker
                  v-model="timeValue"
                  format="24hr"
                  @update:model-value="onTimeSelected"
                  full-width
                ></v-time-picker>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn text color="primary" @click="closeDateTimePicker">
              Cancel
            </v-btn>
            <v-btn color="primary" @click="confirmDateTimePicker"> OK </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
    Idx: Number,
  },
  data() {
    return {
      menu2: false,
      time: "",
      menu: false,
      selectedDate: null,
      dateTimevalue: "",
      showPickers: false,
      showDialog: false,
      timeValue: null,
      dateValue: new Date().toISOString().substr(0, 10),
      customDateFormat: "dd-MM-yyyy",
      dateTimeMenu: false,
    };
  },
  // computed: {
  //   shouldShowDeleteIcon() {
  //     // Check your conditions here
  //     if (
  //       this.formActionType !== "initiate" &&
  //       this.formActionType !== "preview"
  //     ) {
  //       return true; // Show the icon
  //     } else {
  //       return false; // Do not show the icon
  //     }
  //   },
  // },
  computed: {
    shouldShowDeleteIcon() {
      // Check your conditions here
      if (
        (this.$store.getters.GetDirectoryForm === false &&
          this.formActionType !== "initiate" &&
          this.formActionType !== "preview") ||
        (this.formActionType !== "initiate" &&
          this.formActionType !== "preview" &&
          this.$store.getters.GetDirectoryForm === true &&
          this.Idx !== 0)
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
          this.dateTimevalue = element.respectiveValue;
        }
      });
    }
  },

  methods: {
    onDateSelected(date) {
      this.dateValue = date;
    },

    onTimeSelected(time) {
      this.timeValue = time;
    },

    updateDateTimeValue() {
      if (this.dateValue && this.timeValue) {
        let dateStr = this.dateValue;
        if (this.dateValue instanceof Date) {
          // Convert Date object to YYYY-MM-DD string
          const year = this.dateValue.getFullYear();
          const month = String(this.dateValue.getMonth() + 1).padStart(2, "0");
          const day = String(this.dateValue.getDate()).padStart(2, "0");
          dateStr = `${year}-${month}-${day}`;
        }
        let parts = dateStr.split("-");
        let dateReverse = parts[2] + "-" + parts[1] + "-" + parts[0];
        this.dateTimevalue = dateReverse + " " + this.timeValue;
        this.get_value(
          this.dateTimevalue,
          this.index.display_label,
          this.index.key
        );
      }
    },

    show_date_time_picker() {
      this.setCurrentTime();
      this.dateTimeMenu = true;
    },

    closeDateTimePicker() {
      this.dateTimeMenu = false;
    },

    confirmDateTimePicker() {
      this.dateTimeMenu = false;
      this.updateDateTimeValue();
    },

    setCurrentTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      this.timeValue = `${hours}:${minutes}`;
    },

    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == "" ? "N/A" : fieldvalue,
        key: fieldKey,
      };
      // console.log(data);
      this.$emit("dateTimeVal", data);
    },

    save_time(time, fieldlabel, fieldKey) {
      this.$refs.menu.save(time);
      this.get_value(time, fieldlabel, fieldKey);
    },

    emit_edit_field(value) {
      this.$emit("datetimeEdit", value);
      this.$emit("dateTimeIndex", this.Idx);
    },
  },
};
</script>