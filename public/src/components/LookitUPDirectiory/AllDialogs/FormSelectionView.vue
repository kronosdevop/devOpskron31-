<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog :model-value="formSelectionDialog" @update:model-value="$emit('update:formSelectionDialog', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Create Form</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-row class="mt-10" no-gutters>
            <v-col cols="6">
              <v-card
                @click="form_library()"
                height="180px"
                class="text-center"
              >
                <v-card-text class="justify-center">
                  <v-icon class="mt-5" color="primaryColor" x-large>
                    mdi-form-select
                  </v-icon>
                  <br />
                  <div class="mt-2">Form Library</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card
                @click="get_custom()"
                height="180px"
                class="ml-2 text-center"
              >
                <v-card-text class="justify-center">
                  <v-icon class="mt-5" color="primaryColor" x-large>
                    mdi-note-edit-outline</v-icon
                  >
                  <br />
                  <div class="mt-2">Custom Form</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6"> </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

export default {
  props: {
    formSelectionDialog: Boolean,
  },
  data() {
    return {};
  },
  methods: {
    form_library() {
      this.$store.commit("Setlibraryformtype", "DIRECTORY_FORM_LIBRARY");
      this.$emit("customSelected", 1);
    },

    get_custom() {
      this.$store.commit("Setlibraryformtype", "");
      this.$emit("customSelected", 0);
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>