<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'" class="pa-1">
      <!-- :flat="formActionType != undefined" -->
      <!-- <v-card-text> -->
      <v-textarea
        density="compact"
        variant="outlined"
        readonly
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        row-height="10"
        rows="1"
        auto-grow
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click="emit_edit_field(index)"
        @click:append="emit_fields((Toggle = 1), index)"
      >
        <!-- <template #append>
          <v-icon
           
            color="red"
            >mdi-delete</v-icon
          >
        </template> -->
      </v-textarea>

      <!-- -->
      <!-- <v-btn
          v-if="
            $store.getters.GetDirectoryForm == false &&
            formActionType != 'initiate' &&
            formActionType != 'preview'
          "
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
      <!-- <v-btn
          v-if="
            formActionType != 'initiate' &&
            formActionType != 'preview' &&
            $store.getters.GetDirectoryForm == true &&
            Idx != 0
          "
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
        v-model="textValue"
        variant="outlined"
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="[
          (v) => !index.is_required || !!v || 'required', // Mandatory only if is_required is true
          (v) => {
            // Length check only if min_value and max_value are defined
            if (
              index.min_value !== undefined &&
              index.max_value !== undefined
            ) {
              return (
                !v ||
                (v.length >= index.min_value && v.length <= index.max_value) ||
                ` ${index.display_label} length should be between ${index.min_value} and ${index.max_value}`
              );
            } else {
              return true;
            }
          },
        ]"
        row-height="10"
        rows="1"
        auto-grow
        @blur="get_value(textValue, index.display_label, index.key)"
      ></v-textarea>
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
    textValue: "",
  }),
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
          this.textValue = element.respectiveValue;
        }
      });

      // console.log(this.formTemplate);
      // this.textValue =
    }
    // console.log("hello");
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
      this.$emit("textinput", data);
    },

    emit_edit_field(value) {
      this.$emit("textEdit", value);
      this.$emit("textIndex", this.Idx);
    },
  },
};
</script>