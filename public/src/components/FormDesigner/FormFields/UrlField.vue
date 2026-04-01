<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'" class="pa-1">
      <!-- <v-card-text> -->
      <v-textarea
        readonly
        density="compact"
        variant="outlined"
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        row-height="10"
        rows="1"
        auto-grow
        @click="emit_edit_field(index)"
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
      >
        <!-- <template #append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      </v-textarea>
      <!-- -->
      <!-- <v-btn
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
          x-small
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
      <v-textarea
        v-if="index.is_displayed == true"
        density="compact"
        variant="outlined"
        v-model="urlfield"
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="
          index.is_required == true
            ? [
                (v) => !!v || 'required ',
                (v) => v === 'N/A' || validateURL(v) || 'Invalid URL format',
              ]
            : [
                (v) =>
                  !v ||
                  v === 'N/A' ||
                  (!!v && v.length > 0, this.validateURL(v)) ||
                  'Invalid URL format',
              ]
        "
        row-height="10"
        rows="1"
        auto-grow
        @blur="get_value(urlfield, index.display_label, index.key)"
      ></v-textarea>
    </v-card>
    <!-- <v-card flat>
      
      <v-text-field
        dense
        v-if="viewAction == 'Inititaie' || viewAction == 'Deployed'"
        outlined
        class="FontSize"
        v-model="textInput"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        @blur="get_value(textInput, index.display_label, index.key)"
      ></v-text-field>

      <v-text-field
        dense
        v-if="viewAction == 'Pending' || viewAction == 'Submited'"
        outlined
        class="FontSize"
        v-model="inputValue"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="
          index.is_required == true
            ? [(v) => !!v || 'required ']
            : [
                (v) =>
                  !v ||
                  (!!v && v.length > 0, this.validateURL(v)) ||
                  'Invalid URL format',
              ]
        "
        @blur="get_value(inputValue, index.display_label, index.key)"
      ></v-text-field>
    
    </v-card> -->
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
    textInput: "",
    inputValue: "",
    urlfield: "",
  }),
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
          this.urlfield = element.respectiveValue;
        }
      });
    }
    // console.log("hello");
  },
  methods: {
    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },

    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue == "" ? "" : fieldvalue,
        key: fieldKey,
      };
      this.$emit("urlInput", data);
    },

    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    emit_edit_field(value) {
      this.$emit("urlEdit", value);
    },
  },
};
</script>
