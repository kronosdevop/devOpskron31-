<template>
  <div>
    <v-card
      :flat="formActionType != undefined"
      v-if="formActionType != 'initiate'"
    >
      <v-card-text>
        <v-radio-group
          readonly
          dense
          row
          mandatory
          :label="index.display_label"
        >
          <v-radio
            v-for="(option, idx) in index.field_options"
            :key="idx"
            :label="option"
            :value="option"
          ></v-radio>
        </v-radio-group>
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
      <v-radio-group dense row mandatory :label="index.display_label">
        <v-radio
          v-for="(option, idx) in index.field_options"
          :key="idx"
          :label="option"
          :readonly="index.is_readonly"
          :value="option"
        ></v-radio>
      </v-radio-group>
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    index: Object,
    formAction: String,
    formActionType: String,
    formTemplate: Array,
  },
  data: () => ({
    Toggle: 0,
  }),
  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },
  },
};
</script>
