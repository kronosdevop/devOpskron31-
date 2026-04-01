<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'" class="pa-1">
      <!--  :flat="formActionType != undefined" -->
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
        <!-- <template #append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      </v-text-field>
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
      <v-text-field
        v-if="index.is_displayed == true"
        density="compact"
        variant="outlined"
        v-model="emailField"
        :readonly="index.is_readonly"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="
          index.is_required == true ? [rules.email] : [rules.not_mandatoryemail]
        "
        @blur="get_value(emailField, index.display_label, index.key)"
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
  data: () => ({
    Toggle: 0,
    emailField: "",
    rules: {
      email: (value) => {
        const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || "Invalid Email";
      },
      not_mandatoryemail: (value) => {
        const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return !value || pattern.test(value) || "Invalid Email";
      },
    },
  }),
  created() {
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.emailField = element.respectiveValue;
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
      this.$emit("emailValue", data);
    },

    emit_edit_field(value) {
      this.$emit("emailEdit", value);
    },
  },
};
</script>