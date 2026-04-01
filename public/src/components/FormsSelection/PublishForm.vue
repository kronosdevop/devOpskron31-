<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="publish_form" @update:model-value="$emit('update:publish_form', $event)" fullscreen transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >  <div class="custom-title">
            Configure {{ formDetails.form_name }} form
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text>
          <v-stepper class="elevation-0" v-model="flowStepper">
            <v-stepper-header>
              <v-stepper-step :complete="flowStepper > 1" step="1">
                Configure Form
              </v-stepper-step>
              <v-stepper-step :complete="flowStepper > 2" step="2">
                Create Flow
              </v-stepper-step>
              <v-stepper-step :complete="flowStepper > 3" step="3">
                Configure Field Visibility
              </v-stepper-step>
              <v-stepper-step :complete="flowStepper > 4" step="4">
                Publish
              </v-stepper-step>
              <!-- <v-stepper-step :complete="flowStepper > 5" step="5">
              Publish
            </v-stepper-step> -->
            </v-stepper-header>
            <v-form ref="form">
              <v-stepper-items class="mt-n2">
                <v-stepper-content step="1">
                  <v-card v-if="flowStepper == 1" flat>
                    <v-card-text>
                      <SelectForm
                        :masterArray="masterArray"
                        :selectedSum="selectedSum"
                        :summaryArray="summaryArray"
                        :selectedFormInfo="selectedFormInfo"
                        v-on:displayForm="display_form_name"
                        :currentForm="currentForm"
                        v-on:next_step="fetch_form_details"
                        v-on:summary_info="fetch_summary_data"
                      />
                    </v-card-text>
                  </v-card>
                </v-stepper-content>
                <v-stepper-content step="2">
                  <v-card v-if="flowStepper == 2" flat>
                    <v-card-text>
                      <CreateFlow
                        :masterArray="masterArray"
                        :primaryField="primaryField"
                        :formInfo="formInfo"
                        :currentFormSteps="currentFormSteps"
                        v-on:backStep="back_selected_form"
                        v-on:summary_data="selected_summary"
                        v-on:flowData="fetch_flow_steps"
                      />
                    </v-card-text>
                  </v-card>
                </v-stepper-content>
                <v-stepper-content step="3">
                  <v-card v-if="flowStepper == 3" flat>
                    <v-card-text>
                      <ConfigureForm
                        :formInfo="formInfo"
                        :flowSteps="flowSteps"
                        :currentConfigSteps="currentConfigSteps"
                        :currentZeroStep="currentZeroStep"
                        v-on:previousStep="back_flow_step"
                        v-on:configuredSteps="configured_flow_steps"
                        v-on:zeroFlow="zero_step_configure"
                      />
                    </v-card-text>
                  </v-card>
                </v-stepper-content>
                <v-stepper-content step="4">
                  <v-card v-if="flowStepper == 4" flat>
                    <v-card-text>
                      <PublishWorkflow
                        :formInfo="formInfo"
                        :flowSteps="flowSteps"
                        :primaryField="primaryField"
                        v-on:lastStep="back_flow_Conifg"
                        v-on:prevZeroStep="back_zerostep_Conifg"
                        :flowConfiguredSteps="flowConfiguredSteps"
                        :zeroConfigStep="zeroConfigStep"
                        :workFlowCompletionStep="workFlowCompletionStep"
                        v-on:successMsg="complete_step"
                      />
                    </v-card-text>
                    <!-- <v-card-text>
                    <WorkflowCompletion
                      :flowSteps="flowSteps"
                      :currentWeebhookData="currentWeebhookData"
                      v-on:configStep="previous_config_step"
                      :formInfo="formInfo"
                      v-on:webhookInfo="webhook_completion"
                    />
                  </v-card-text> -->
                  </v-card>
                </v-stepper-content>
                <!-- <v-stepper-content step="5">
                <v-card v-if="flowStepper == 5" flat>
                  <v-card-text>
                    <PublishWorkflow
                      :formInfo="formInfo"
                      :flowSteps="flowSteps"
                      v-on:lastStep="back_flow_Conifg"
                      :flowConfiguredSteps="flowConfiguredSteps"
                      :workFlowCompletionStep="workFlowCompletionStep"
                      v-on:successMsg="complete_step"
                    />
                  </v-card-text>
                </v-card>
              </v-stepper-content> -->
              </v-stepper-items>
            </v-form>
          </v-stepper>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
// import FlowDesigner from '@/components/FlowDesigner.vue'
import SelectForm from "@/components/FlowDesigneComponents/SelectForm.vue";
import CreateFlow from "@/components/FlowDesigneComponents/CreateFlow.vue";
import ConfigureForm from "@/components/FlowDesigneComponents/ConfigureForm.vue";
import WorkflowCompletion from "@/components/FlowDesigneComponents/WorkflowCompletion.vue";
import PublishWorkflow from "@/components/FlowDesigneComponents/PublishWorkflow.vue";
export default {
  props: {
    publish_form: Boolean,
    formDetails: Object,
    masterArray: Array,
    selectedFormInfo: Object,
    selectedForm: Boolean,
    summaryArray: Array,
  },
  components: {
    SelectForm,
    CreateFlow,
    ConfigureForm,
    WorkflowCompletion,
    PublishWorkflow,
    // FlowDesigner
  },
  data: () => ({
    flowStepper: 1,
    componentCheck: 0,
    formDialog: false,
    formInfo: {},
    flowSteps: [],
    flowConfiguredSteps: [],
    workFlowCompletionStep: {},
    currentForm: {},
    currentFormSteps: [],
    currentConfigSteps: [],
    currentWeebhookData: {},
    formNameDisplay: "",
    formSelected: false,
    zeroConfigStep: [],
    currentZeroStep: [],
    primaryField: "",
    selectedSum: "",
  }),
  watch: {
    publish_form: {
      async handler() {
        if (this.publish_form == true) {
          this.flowStepper = 1;
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      localStorage.setItem("flowStepsInfo", []);
      localStorage.setItem("zeroStep", []);
    },
    emit_data() {
      this.$emit("clicked", 0);
    },
    get_form_details() {
      this.componentCheck = 1;
      this.formDialog = true;
    },
    display_form_name(val) {
      this.formSelected = true;
      this.formNameDisplay = val.form_name;
    },
    fetch_form_details(val) {
      this.formInfo = {};
      this.formInfo = val;
      // this.formInfo =  this.formDetails;
      this.flowStepper = 2;
    },
    fetch_summary_data(val) {
      this.primaryField = val;
    },
    back_selected_form(val) {
      this.currentForm = val;
      this.flowStepper = 1;
    },
    selected_summary(val) {
      this.selectedSum = val;
    },
    back_flow_step(val) {
      this.currentFormSteps = val;
      this.flowStepper = 2;
    },
    previous_config_step(val) {
      this.currentConfigSteps = val;
      this.flowStepper = 3;
    },
    back_flow_Conifg(val) {
      this.currentConfigSteps = val;

      this.flowStepper = 3;
    },
    back_zerostep_Conifg(val) {
      this.currentZeroStep = val;
    },
    fetch_flow_steps(val) {
      this.flowSteps = [];
      this.flowSteps = val;
      this.flowStepper = 3;
    },
    configured_flow_steps(val) {
      this.flowConfiguredSteps = val;
      this.flowStepper = 4;
    },
    zero_step_configure(val) {
      this.zeroConfigStep = val;
    },
    // webhook_completion(val) {
    //   this.workFlowCompletionStep = val;
    //   this.flowStepper = 5;
    // },

    complete_step(status, text) {
      this.formInfo = {};
      this.flowSteps = [];
      this.flowConfiguredSteps = [];
      this.workFlowCompletionStep = {};
      localStorage.setItem("flowStepsInfo", []);
      localStorage.setItem("zeroStep", []);
      this.flowStepper = 1;
      this.$emit("clicked", 0);
      // this.$emit("closeDialog", text);
    },
  },
};
</script>

<style>
</style>