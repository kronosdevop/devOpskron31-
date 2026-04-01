<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="quotationSubAddDialogue"
      @update:model-value="$emit('update:quotationSubAddDialogue', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Add Details</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-text-field
              density="compact"
              class="ml-2"
              variant="outlined"
              v-model="price"
              @keypress="is_number($event)"
              v-on:paste="process($event)"
              label="Price"
              :rules="[(v) => !!v || 'required ']"
              type="number"
            ></v-text-field>
            <v-text-field
              density="compact"
              class="ml-2"
              variant="outlined"
              v-model="quantity"
              label="Quantity"
              type="number"
              @keypress="is_number($event)"
              v-on:paste="process($event)"
              :rules="[(v) => !!v || 'required ']"
            ></v-text-field>
            <v-text-field
              density="compact"
              v-if="quotationType == 'MANUAL'"
              class="ml-2"
              variant="outlined"
              v-model="unit"
              label="Unit"
              :rules="
                quotationType == 'MANUAL' ? [(v) => !!v || 'required '] : []
              "
            ></v-text-field>
            <v-select
              density="compact"
              v-if="quotationType == 'MASTER'"
              class="ml-2"
              variant="outlined"
              :items="unitItems"
              v-model="unit"
              label="Unit"
              :rules="
                quotationType == 'MASTER' ? [(v) => !!v || 'required '] : []
              "
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            color="primaryColor"
            class="mt-n8 mr-2"
            @click="save_deatails()"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*eslint-disable*/
export default {
  props: {
    quotationSubAddDialogue: Boolean,
    selectedSubCategoryValue: Object,
    quotationType: String,
    selectedData: String,
  },

  data() {
    return {
      price: "",
      quantity: "",
      gstTax: "",
      unit: "",
      unitItems: [],
    };
  },
  watch: {
    quotationSubAddDialogue: {
      async handler() {
        if (this.quotationSubAddDialogue == true) {
          this.price = this.selectedSubCategoryValue.sub_category_price;
          this.unitItems = this.selectedSubCategoryValue.sub_category_unit_name;
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
      this.price = "";
      this.quantity = "";
      this.gstTax = "";
      this.unit = "";
    },

    async save_deatails() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        var SubData = {
          price: this.price,
          quantity: this.quantity,
          selectedValue: this.selectedSubCategoryValue,
          unit: this.unit,
        };
        this.$emit("subInfo", SubData);
        this.price = "";
        this.quantity = "";
        this.gstTax = "";
        this.unit = "";
      }
    },
  },
};
</script>

<style>
</style>