<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'" class="pa-1">
      <!-- :flat="formActionType != undefined" -->
      <!-- <v-card-text> -->
      <v-row class="ma-2" no-gutters>
        <v-col cols="4">
          <v-select
            density="compact"
            variant="outlined"
            label="CC"
            :items="[]"
            class=""
            readonly
          ></v-select>
        </v-col>
        <v-col cols="8">
          <v-text-field
            density="compact"
            variant="outlined"
            readonly
            class="FontSize ml-2"
            type="number"
            :label="
              index.is_required == true
                ? index.displayLabel + '*'
                : index.displayLabel
            "
            @click="emit_edit_field(index)"
            :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
            @click:append="emit_fields((Toggle = 1), index)"
          >
            <!-- <template #append>
              <v-icon color="red">mdi-delete</v-icon>
            </template> -->
          </v-text-field>
        </v-col>
      </v-row>

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
    <v-card flat v-else class="pa-2">
      <v-row v-if="index.is_displayed == true" no-gutters>
        <v-col cols="6">
          <v-select
            density="compact"
            variant="outlined"
            v-model="countryList"
            label="Country"
            :items="countryitems"
            :rules="countryRules"
            class="mr-2"
            item-title="name"
            item-value="code"
          ></v-select>
          <!-- :rules="
              index.is_required == true ? [(v) => !!v || 'required '] : []
            " -->
        </v-col>
        <v-col cols="6">
          <v-text-field
            density="compact"
            variant="outlined"
            class="FontSize ml-2"
            v-model="numberInput"
            :readonly="index.is_readonly"
            :label="
              index.is_required == true
                ? index.display_label + '*'
                : index.display_label
            "
            v-on:keypress="is_Number($event)"
            v-on:paste="paste_event($event)"
            max-length="15"
            :rules="
              index.is_required == true
                ? [
                    (v) => !!v || 'required ',
                    (v) =>
                      (index.is_required && !v) ||
                      v.length >= 7 ||
                      'Minimum length must be 7 characters',
                    (v) =>
                      (index.is_required && !v) ||
                      v.length <= 15 ||
                      'Maximum length must be 15 characters',
                  ]
                : [
                    (v) => !index.is_required || !!v || 'required',
                    (v) =>
                      (!index.is_required && !v) ||
                      v.length >= 7 ||
                      'Minimum length must be 7 characters',
                    (v) =>
                      (!index.is_required && !v) ||
                      v.length <= 15 ||
                      'Maximum length must be 15 characters',
                  ]
            "
            @update:modelValue="get_value(numberInput, index.display_label, index.key)"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */

import CountryList from "@/JsonFiles/CountryList.json";

export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  components: {
    CountryList,
  },
  computed: {
    countryRules() {
      let rules = [];
      if (this.index.is_required) {
        rules.push((v) => !!v || "required");
      }
      if (this.numberInput && this.numberInput.length > 1) {
        rules.push((v) => !!v || "required");
      }
      return rules;
    },
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
  data: () => ({
    Toggle: 0,
    numberInput: null,
    countryitems: [],
    countryList: "",
  }),
  created() {
    // console.log(this.formTemplate, this.index);
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          var numberSplit = element.respectiveValue.split("_");

          this.countryList = numberSplit[0];

          this.numberInput = numberSplit[1];
        }
      });
    }
    this.fetch_coutry_list();
  },
  methods: {
    fetch_coutry_list() {
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.name + "(" + element.dial_code + ")",
          code: element.dial_code,
        });
      });
    },
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },
    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == null ? "N/A" : this.countryList + "_" + fieldvalue,
        key: fieldKey,
      };

      this.$emit("phonenumberData", data);
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
      this.$emit("phoneNumberEdit", value);
    },
  },
};
</script>
