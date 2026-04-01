<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="imageDisplay" @update:model-value="$emit('update:imageDisplay', $event)"
      persistent
      max-width="300"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Preview</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-2">
          <v-img
            :src="imageUrl"
            height="250"
            width="250"
            class="rounded elevation-2"
            cover
          />
        </v-card-text>
      </v-card>
    </v-dialog>
 
  </div>
</template>
<script>
/*eslint-disable*/



export default {

  props: {
    imageUrl: String,
    imageDisplay: Boolean,
  },

  watch: {
    imageDisplay: {
      async handler() {},
      immediate: true,
    },
  },

  data() {
    return {
      logoUrl: "",
    };
  },

  computed: {},

  mounted() {},

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>