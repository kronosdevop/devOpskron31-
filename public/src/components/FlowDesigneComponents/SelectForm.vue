<template>
  <!-- eslint-disable -->
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-row>
      <div class="text-h6 text-left">
        <b>Configure Summary Field/Masters</b>
      </div>
      <v-spacer />
      <v-btn small @click="next_option()" class="white--text cardCss"
        >Next</v-btn
      >
    </v-row>
    <v-row class="mt-5" no-gutters>
      <v-select
        label="Choose Summary Field"
        v-model="summaryField"
        :items="summaryArray"
        item-text="label"
        item-value="value"
        style="max-width: 350px"
        dense
        class="ml-n2"
        outlined
      />
    </v-row>
    <v-row class="mt-3" no-gutters>
      <!-- <v-card flat max-width="800px"> -->

      <v-expansion-panels class="justify-start mt-1">
        <v-expansion-panel v-for="(item, i) in masterArray" :key="i">
          <v-expansion-panel-header>
            {{ item.displayLabel }}</v-expansion-panel-header
          >

          <v-expansion-panel-content>
            <v-row no-gutters>
              <v-col cols="8">
                <v-text-field
                  dense
                  v-model="message"
                  outlined
                  :abel="item.displayLabel"
                  type="text"
                />
              </v-col>
              <v-col cols="2">
                <v-btn
                  @click="add_masters(item, message)"
                  class="mx-2"
                  fab
                  dark
                  small
                  color="primary"
                >
                  <v-icon dark> mdi-plus </v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <v-card-text class="d-flex justify--start">
              <v-chip
                v-for="(data, index) in item.arrayValue"
                :key="index"
                close
                class="ma-2"
                @click:close="get_removed(data, item.displayLabel)"
              >
                {{ data.type }}
              </v-chip>
            </v-card-text>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <!-- </v-card> -->
    </v-row>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";

import { get_org_forms } from "@/mixins/GetDeployedForms.js";
export default {
  mixins: [get_org_forms],
  components: {
    SnackBar,
  },
  props: {
    currentForm: Object,
    masterArray: Array,
    selectedFormInfo: Object,
    summaryArray: Array,
    selectedSum: String,
  },
  data() {
    return {
      formDialog: false,
      listItems: [],
      formDetails: {},
      componentCheck: 0,
      selectedForm: false,
      SnackBarComponent: {},
      masterCheck: 0,
      message: "",
      summaryField: "",
    };
  },
  created() {
    if (Object.keys(this.currentForm).length != 0) {
      this.summaryField = this.selectedSum;
      // alert(2);
      // this.selectedForm = true;
      // this.selectedFormInfo = this.currentForm;
      // this.select_action(this.currentForm);
    }
  },
  methods: {
    async open_dialog() {
      this.listItems = [];
      await this.get_org_forms();
      this.listItems = this.listForms;
      this.formDialog = true;
      this.selectedForm = false;
    },

    add_masters(val, msg) {
      this.masterArray.forEach((element) => {
        if (element.displayLabel == val.displayLabel) {
          element.arrayValue.push({
            id: element.arrayValue.length + 1,
            type: msg,
          });
        }
      });
      this.message = "";
    },

    get_removed(val, label) {
      var data = this.formDetails;
      this.masterArray.forEach((element) => {
        element.arrayValue.forEach((element2) => {
          if (element.displayLabel == label && val.type == element2.type) {
            element.arrayValue.splice(element.arrayValue.indexOf(val.type), 1);
          }
        });
      });
    },

    get_form_details(item) {
      this.formDetails = item;
      this.componentCheck = 1;
    },

    select_action(value) {
      this.masterArray = [];
      localStorage.setItem("zeroStep", JSON.stringify(value.form_template));

      var array2 = value.form_template;

      array2.forEach((element) => {
        if (
          element.data_type == "single_choice" &&
          element.input_array_value != null
        ) {
          this.masterCheck = 1;
          this.masterArray.push({
            arrayValue: element.input_array_value,
            displayLabel: element.display_label,
          });
        }
      });
      this.selectedForm = true;
      this.selectedFormInfo = value;
      this.formDialog = false;
    },

    next_option() {
      this.$emit("next_step", this.selectedFormInfo);
      this.$emit("summary_info", this.summaryField);
      // if (this.selectedForm == false) {
      //   this.SnackBarComponent = {
      //     SnackbarVmodel: true,
      //     SnackbarColor: "red",
      //     SnackbarText: "Select Form",
      //     timeout: 5000,
      //     Top: true,
      //   };
      // } else {
      //   this.$emit("next_step", this.selectedFormInfo);
      // }
    },
  },
};
</script>