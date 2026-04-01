<template>
  <div>
    <v-toolbar flat>
      <!-- <v-toolbar-title v-if="formSelected == false"
        >Flow Designer
      </v-toolbar-title> -->
      <!-- <v-toolbar-title v-if="formSelected == true"
        >Flow Designer
        <div>{{ formNameDisplay }}</div></v-toolbar-title
      > -->
      <v-spacer />
      <v-btn small color="primaryColor" @click="back_action()">Back</v-btn>
    </v-toolbar>
    <v-card class="mt-n4" flat>
      <v-card-text>
        <v-stepper class="elevation-0" v-model="flowStepper">
          <v-stepper-header>
            <v-stepper-step :complete="flowStepper > 1" step="1">
              Create Flow
            </v-stepper-step>

            <v-stepper-step :complete="flowStepper > 2" step="2">
              Publish
            </v-stepper-step>
          </v-stepper-header>
          <v-form ref="form">
            <v-stepper-items class="mt-n2">
              <v-stepper-content step="1">
                <v-card v-if="flowStepper == 1" flat>
                  <v-card-text>
                    <SelectForm
                      v-on:displayForm="display_form_name"
                      :currentForm="currentForm"
                      v-on:next_step="fetch_form_details"
                    />
                  </v-card-text>
                </v-card>
              </v-stepper-content>
              <v-stepper-content step="2">
                <v-card v-if="flowStepper == 2" flat>
                  <v-card-text>
                    <CreateFlow
                      :formInfo="formInfo"
                      :currentFormSteps="currentFormSteps"
                      v-on:backStep="back_selected_form"
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
    <!-- <div v-if="componentCheck == 1">
      <SelectForm :formDialog="formDialog" />
    </div> -->
  </div>
</template>
<script>
/* eslint-disable */

import SelectForm from "@/components/FlowDesigneComponents/SelectForm.vue";
import CreateFlow from "@/components/FlowDesigneComponents/CreateFlow.vue";
import ConfigureForm from "@/components/FlowDesigneComponents/ConfigureForm.vue";
import WorkflowCompletion from "@/components/FlowDesigneComponents/WorkflowCompletion.vue";
import PublishWorkflow from "@/components/FlowDesigneComponents/PublishWorkflow.vue";

export default {
  components: {
    SelectForm,
    CreateFlow,
    ConfigureForm,
    WorkflowCompletion,
    PublishWorkflow,
  },
  props: {
    formDetails: Object,
  },
  data() {
    return {
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
    };
  },
  created() {},
  methods: {
    back_action() {
      this.$emit("backAction", 0);
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
    back_selected_form(val) {
      this.currentForm = val;
      this.flowStepper = 1;
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
      this.$emit("closeDialog", text);
    },
  },
};
</script>