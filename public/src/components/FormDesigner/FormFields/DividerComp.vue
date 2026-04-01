<template>
  <div>
    <v-card :flat="formActionType != undefined">
      <v-card-text>
        <v-divider></v-divider>
        <v-btn
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
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
  },
  data() {
    return {};
  },
  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },
  },
};
</script>