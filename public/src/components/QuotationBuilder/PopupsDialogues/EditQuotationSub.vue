<template>
  <div>
    <!--  eslint-disable  -->
    <v-dialog :model-value="EditQuotationSubDialog" @update:model-value="$emit('update:EditQuotationSubDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Edit Details</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-text-field
              dense
              class="ml-2"
              outlined
              v-model="price"
              @keypress="is_number($event)"
              v-on:paste="process($event)"
              :rules="[(v) => !!v || 'required ']"
              label="Price"
              type="number"
            ></v-text-field>
            <v-text-field
              dense
              class="ml-2"
              outlined
              @keypress="is_number($event)"
              v-on:paste="process($event)"
              :rules="[(v) => !!v || 'required ']"
              v-model="quantity"
              label="Quantity"
              type="number"
            ></v-text-field>
            <v-text-field
              dense
              class="ml-2"
              outlined
              v-model="unit"
              label="Unit"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            small
            color="primaryColor"
            class="mt-n8 mr-2"
            @click="save_deatails()"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  props: {
    EditQuotationSubDialog: Boolean,
    ViewInfo: Object,
  },

  data() {
    return {
      price: "",
      quantity: "",
      unit: "",
    };
  },

  watch: {
    EditQuotationSubDialog: {
      async handler() {
        if (this.EditQuotationSubDialog == true) {
          this.price = this.ViewInfo.price;
          this.quantity = this.ViewInfo.quantatity;
          this.unit = this.ViewInfo.unit;
        }
      },
      immediate: true,
    },
  },

  methods: {
    is_number(evt) {
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
    process(event) {
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
    close_dialog() {
      this.$emit("clicked", 0);
    },

    save_deatails() {
      if (this.$refs.form.validate()) {
        var EditedData = {
          price: this.price,
          quantity: this.quantity,
          editedValue: this.ViewInfo,
          unit: this.unit,
        };
        // console.log("SubData", EditedData)
        this.$emit("successData", EditedData);
      }
    },
  },
};
</script>

<style>
</style>