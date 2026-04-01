<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="stockdispatching" @update:model-value="$emit('update:stockdispatching', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Dispatch for {{ stockitems.material_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-select
                  outlined
                  dense
                  v-model="locations"
                  :rules="[(v) => !!v || 'required ']"
                  label="Location*"
                  :items="locationitems"
                  item-text="text"
                  item-value="value"
                  return-object
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  dense
                  v-model="material_quntuty"
                  label="Dispatch Quantity*"
                  :rules="[(v) => !!v || 'required ']"
                  @keypress="is_number($event)"
                  v-on:paste="process($event)"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="ewaybill"
                  outlined
                  dense
                  label="Comments"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
                  <script>
/* eslint-disable */
import { get_location_details } from "@/mixins/GetLocations.js";
import { dispatch_Material_Stock } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    stockdispatching: Boolean,
    stockitems: Object,
  },
  mixins: [get_location_details],
  data() {
    return {
      loading: false,
      locationitems: [],
      material_quntuty: "",
      locations: "",
      ewaybill: "",
    };
  },
  watch: {
    stockdispatching: {
      async handler() {
        if (this.stockdispatching == true) {
          await this.get_location_details(), this.fetch_details();
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
    fetch_details() {
      var loaction = this.locationList;
      loaction = loaction.filter((obj) => obj.location_type == "PROJECT SITE");
      loaction.forEach((element) => {
        this.locationitems.push({
          text: element.location_name,
          value: element.location_id,
        });
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    async delete_mutation() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        var data = this.$store.getters.GetUserObj;
        try {
          let result = await API.graphql(
            graphqlOperation(dispatch_Material_Stock, {
              input: {
                location_id: this.locations.value,
                location_name: this.locations.text,
                eway_bil: this.ewaybill,
                material_quantity: this.material_quntuty,
                material_id: this.stockitems.material_id,
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(result.data.dispatch_Material_Stock);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
  },
};
</script>