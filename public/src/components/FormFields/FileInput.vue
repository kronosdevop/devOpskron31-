<template>
  <div>
    <v-card>
      <v-card-text>
        <v-file-input
          dense
          class="FontSize my-0"
          :label="index.field_name"
        ></v-file-input>
        <v-btn
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