<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'"  class="pa-1">
      <!-- <v-card-text> -->
      <v-text-field
         density="compact"
         variant="outlined"
        readonly
        class="FontSize "
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
    <v-card flat v-else  class="pa-2">
      <v-text-field
         density="compact"
        v-if="index.is_displayed == true"
         variant="outlined"
        class="FontSize"
        v-model="numberInput"
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        v-on:keypress="is_Number($event)"
        v-on:paste="paste_event($event)"
        :rules="[
          (v) => !index.is_required || !!v || 'required',
          (v) => {
            if (v === undefined || v === null || v === '') {
              return true;
            }
            const numValue = parseFloat(v);
            if (isNaN(numValue)) {
              return 'Please enter a valid number';
            }
            if (
              index.min_value !== undefined &&
              numValue < parseFloat(index.min_value)
            ) {
              return `${index.display_label} should be greater than or equal to ${index.min_value}`;
            }
            if (
              index.max_value !== undefined &&
              numValue > parseFloat(index.max_value)
            ) {
              return `${index.display_label} should be less than or equal to ${index.max_value}`;
            }
            return true;
          },
        ]"
        @blur="get_value(numberInput, index.display_label, index.key)"
      ></v-text-field>
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
    Idx: Number,
  },
  data: () => ({
    Toggle: 0,
    numberInput: null,
  }),
  created() {
    // console.log(this.formActionType, this.formAction);
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.numberInput = element.respectiveValue;
        }
      });
    }
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

  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == null ? "N/A" : fieldvalue,
        key: fieldKey,
      };
      this.$emit("numberFieldData", data);
    },

    is_Number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    paste_event(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },

    emit_edit_field(value) {
      // console.log(333333);
      this.$emit("numberEdit", value);
      this.$emit("numIndex", this.Idx);
    },
  },
};
</script>
