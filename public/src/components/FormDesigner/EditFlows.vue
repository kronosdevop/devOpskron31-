<template>
  <div>
    <v-card flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-toolbar class="mt-4 bg-white" flat dense>
        <v-toolbar-title
          >Edit Flow for
          {{ $store.getters.GetFlowItem.workflow_name }}</v-toolbar-title
        >
        <v-spacer />
        <v-btn
          dark
          class="text-capitalize cardCss ml-2 text-white"
          @click="back_call()"
        >
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-stepper v-model="editFlowSteps">
          <v-stepper-header>
            <v-stepper-item :complete="editFlowSteps > 0" :value="1">
              Selected Form
            </v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :complete="editFlowSteps > 1" :value="2">
              Create Flow
            </v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :complete="editFlowSteps > 2" :value="3">
              Configure Form
            </v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :complete="editFlowSteps > 3" :value="4">
              Form Details
            </v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :complete="editFlowSteps > 4" :value="5">
              Preview and Publish
            </v-stepper-item>
            <v-divider></v-divider>
          </v-stepper-header>
          <v-form>
            <component
              :is="componentName"
              :params="componentParams"
              @nextStepEdit="next_add_steps"
              @flowData="fetch_flow_steps"
              @firstBackAction="first_back_action"
              @configuredSteps="configured_flow_steps"
              @zeroFlow="zero_step_configure"
              @startStepSettings="fetch_start_settings"
              @previousStep="back_flow_step"
              @completion="final_step"
              @workflowSteps="previous_step"
              @prevZeroStep="last_previous_action"
              @errorMsg="get_error"
              @previewStep="back_publish_step"
              @backstepPreview="back_lastpublish"
              @formflownext="next_formtype"
            />
          </v-form>
        </v-stepper>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import CreateFlowAction from "@/components/FormDesigner/EditFlowsDialogs/CreateFlowAction.vue";
import ConfigureEdit from "@/components/FormDesigner/EditFlowsDialogs/ConfigureEdit.vue";
import PublishEdit from "@/components/FormDesigner/EditFlowsDialogs/PublishEdit.vue";
import EditFormDetails from "@/components/FormDesigner/EditFlowsDialogs/EditFormDetails.vue";
import FormPreviewPublish from "@/components/FormDesigner/EditFlowsDialogs/FormPreviewPublish.vue";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    CreateFlowAction,
    ConfigureEdit,
    PublishEdit,
    SnackBar,
    EditFormDetails,
    FormPreviewPublish,
  },

  data() {
    return {
      editFlowSteps: 0,
      componentParams: {},
      flowStepsData: [],
      flowConfiguredSteps: [],
      zeroConfigStep: [],
      currentFormSteps: [],
      SnackBarComponent: {},
      currentConfigSteps: [],
      currentStartStep: [],
      statrStepSettings: {},
      publishInfo: {},
      formType: "",
    };
  },

  computed: {
    // Destructure the component name and parameters based on the flowSteps value
    componentName() {
      const { component, parameters } = this.getComponentInfo(
        this.editFlowSteps
      );
      // console.log();
      this.componentParams = parameters;

      return component;
    },
  },
  methods: {
    back_call() {
      this.$router.push({
        name: "FormDesignerAdmin",
        params: {
          formMethod: "AllFlows",
        },
      });
      // this.$router.push("/AdminFormTemplate");
    },
    getComponentInfo(step) {
      switch (step) {
        case 0:
          return {
            component: "EditFormDetails",
            parameters: {
              formSelected: this.$store.getters.GetFlowItem,
              currentFormSteps: this.currentFormSteps,
            },
          };
        case 1:
          return {
            component: "CreateFlowAction",
            parameters: {
              formSelected: this.$store.getters.GetFlowItem,
              currentFormSteps: this.currentFormSteps,
              formType: this.formType,
            },
          };
        case 2:
          return {
            component: "ConfigureEdit",
            parameters: {
              formSelected: this.$store.getters.GetFlowItem,
              flowStepsData: this.flowStepsData,
              currentConfigSteps: this.currentConfigSteps,
              currentStartStep: this.currentStartStep,
              statrStepSettings: this.statrStepSettings,
              flowConfiguredSteps: this.flowConfiguredSteps,
              formType: this.formType,
            },
          };
        case 3:
          return {
            component: "PublishEdit",
            parameters: {
              formSelected: this.$store.getters.GetFlowItem,
              flowStepsData: this.flowStepsData,
              flowConfiguredSteps: this.flowConfiguredSteps,
              zeroConfigStep: this.zeroConfigStep,
              statrStepSettings: this.statrStepSettings,
              publishInfo: this.publishInfo,
              formType: this.formType,
            }, // Example parameter for Step 4
          };
        case 4:
          return {
            component: "FormPreviewPublish",
            parameters: {
              formSelected: this.$store.getters.GetFlowItem,
              publishInfo: this.publishInfo,
            }, // Example parameter for Step 5
          };

        default:
          return {
            component: null,
            parameters: {},
          };
      }
    },

    fetch_flow_steps(val) {
      this.flowStepsData = [];
      this.currentFormSteps = [];
      this.flowStepsData = val;
      this.currentFormSteps = val;
      this.editFlowSteps = 2;
    },
    next_formtype(val) {
      this.formType = val;
    },
    first_back_action() {
      this.editFlowSteps = 0;
    },
    back_lastpublish() {
      this.editFlowSteps = 3;
    },
    next_add_steps() {
      this.editFlowSteps = 1;
    },

    configured_flow_steps(val) {
      this.flowConfiguredSteps = val;
      this.editFlowSteps = 3;
    },

    zero_step_configure(val) {
      this.zeroConfigStep = val;
    },

    fetch_start_settings(val) {
      this.statrStepSettings = val;
    },

    back_flow_step(val) {
      this.currentFormSteps = val;
      this.editFlowSteps = 1;
    },
    back_publish_step(val) {
      this.publishInfo = val;
      this.editFlowSteps = 4;
    },

    get_error(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    previous_step(val) {
      this.editFlowSteps = 2;
      this.currentConfigSteps = val;
    },

    last_previous_action(val) {
      this.currentStartStep = val;
    },

    final_step(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.formInfo = {};
      this.flowStepsData = [];
      this.flowConfiguredSteps = [];
      localStorage.setItem("editFlowData", []);
      localStorage.setItem("zeroStep", []);
      this.$router.push({
        name: "FormDesignerAdmin",
        params: {
          formMethod: "AllFlows",
        },
      });
      // this.$router.push("/AdminFormTemplate");
    },
  },
};
</script>