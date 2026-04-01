<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="quotationSelection" @update:model-value="$emit('update:quotationSelection', $event)"
    persistent
    max-width="500"
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black ml-2"
          ><div class="custom-title">Generate</div></v-toolbar-title
        >
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text class="mt-4">
        <v-row no-gutters>
          <v-col cols="6">
            <v-card @click="fetch_actions('Quotation')" height="100px">
              <v-card-text class="justify-center">
                <v-icon color="primaryColor" large> mdi-form-select </v-icon>
                <br />
                <div class="mt-2">Quotation</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card
              @click="fetch_actions('Billing')"
              class="ml-2"
              height="100px"
            >
              <v-card-text class="justify-center">
                <v-icon color="primaryColor" large> mdi-cash-plus</v-icon>
                <br />
                <div class="mt-2">Billing</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
/*eslint-disable*/
export default {
  props: {
    quotationSelection: Boolean,
  },
  data() {
    return {};
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    fetch_actions(value) {
      this.$emit("fetchValue", value);
    },
  },
};
</script>