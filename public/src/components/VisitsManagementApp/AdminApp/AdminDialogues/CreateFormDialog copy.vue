<template>
  <div>
    <v-dialog
      :model-value="createFormDialogue"
      @update:model-value="$emit('update:createFormDialogue', $event)"
      persistent
      fullscreen
      transition="dialog-top-transition"
    >
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Visit Type</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-stepper v-model="stepperflow" vertical>
          <v-stepper-step :complete="stepperflow > 1" step="1" class="ml-4">
            Visit Type
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-card flat height="300">
              <v-card-text class="">
                <v-form ref="form">
                  <v-row no-gutters class="mt-1">
                    <v-col cols="12">
                      <v-text-field
                        density="compact"
                        v-model="visitName"
                        label="Name*"
                        :rules="[(v) => !!v || 'required ']"
                        variant="outlined"
                        style="max-width: 300px"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-autocomplete
                        density="compact"
                        v-model="visitFrequency"
                        label="Visit Frequency"
                        :rules="[(v) => !!v || 'required ']"
                        variant="outlined"
                        :items="[
                          'Daily',
                          'Once in one week',
                          'Once in two weeks',
                          'Monthly',
                          'Quarterly',
                          'Once a year',
                        ]"
                        :search-input.sync="searchF"
                        hide-no-data
                        style="max-width: 300px"
                      >
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12">
                      <v-radio-group
                        class="mt-n1"
                        label="Visit Type"
                        v-model="visitTypeAction"
                        :rules="[(v) => !!v || 'required ']"
                        row
                      >
                        <v-radio label="Physical" value="PHYSICAL"></v-radio>
                        <v-radio label="Virtual" value="VIRTUAL"></v-radio>
                      </v-radio-group>
                    </v-col>
                    <v-radio-group
                      class="mt-n1"
                      label="Adhoc Approval Requried"
                      v-model="adhocapproval"
                      :rules="[(v) => !!v || 'required ']"
                      row
                    >
                      <v-radio label="Yes" value="YES"></v-radio>
                      <v-radio label="No" value="NO"></v-radio>
                    </v-radio-group>
                    <v-col cols="12">
                      <v-text-field
                        style="max-width: 300px"
                        dense
                        v-if="visitTypeAction == 'PHYSICAL'"
                        v-model="scanTolerance"
                        label="Scan Tolerance"
                        class=""
                        outlined
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  class="text-capitalize cardCss"
                  dark
                  @click="nextstep()"
                  v-show="visitTypeAction"
                >
                  Continue
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>
          <v-stepper-step :complete="stepperflow > 2" step="2" class="ml-4">
            Desgin a Form
          </v-stepper-step>
          <v-stepper-content step="2">
            <v-card flat>
              <v-btn
                class="text-capitalize cardCss mb-n4 ml-4"
                @click="stepperflow = 1"
              >
                Previous
              </v-btn>
              <AdminFormDesigner
                :key="componentCheck"
                v-on:errorMsg="error_info"
                v-on:successMsg="success_info"
              />
            </v-card>
          </v-stepper-content>
        </v-stepper>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import AdminFormDesigner from "@/components/FormDesigner/AdminFormDesigner.vue";

export default {
  components: {
    AdminFormDesigner,
  },
  props: {
    createFormDialogue: Boolean,
  },
  data() {
    return {
      formFields: [],
      previewCheck: 0,
      componentCheck: 0,
      previewDialog: false,
      adhocapproval: "YES",
      stepperflow: 1,
      cardHeight: 0,
      visitName: "",
      visitFrequency: "",
      userArray: [],
      searchF: "",
      visitTypeAction: null,
      scanTolerance: 0,
    };
  },
  watch: {
    createFormDialogue: {
      async handler() {
        if (this.createFormDialogue == true) {
          this.visitName = "";
          this.visitFrequency = "";
          this.visitTypeAction = "PHYSICAL";
          this.scanTolerance = 0;
          this.stepperflow = 1;
          this.componentCheck += 1;
          this.$store.commit("Setvisitdetails", {});
        }
      },
      immediate: true,
    },
  },
  methods: {
    error_info(val) {
      this.$emit("errorMsg", val);
    },
    success_info(val) {
      this.$emit("successMsg", val);
      this.$emit("formupdate", 0);
    },
    nextstep() {
      if (this.$refs.form.validate()) {
        var data = {
          visit_type_name: this.visitName,
          visit_type_frequency: this.visitFrequency,
          visit_type_representation: this.visitTypeAction,
          scan_tolerance:
            this.visitTypeAction == "VIRTUAL" ? 0 : this.scanTolerance,
          adhock_approval_required: this.adhocapproval == "YES" ? true : false,
        };
        this.$store.commit("Setvisitdetails", data);
        this.stepperflow = 2;
      }
    },
    close_dialog() {
      this.visitName = "";
      this.visitFrequency = "";
      this.visitTypeAction = null;
      this.stepperflow = 1;
      this.$store.commit("SetVisitorFormEnabled", false);
      this.$store.commit("SetVisitorFormEdit", false);
      this.$emit("clicked", 0);
    },
  },
};
</script>