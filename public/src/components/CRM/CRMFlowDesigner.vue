<template>
  <div>
    <v-card flat>
      <v-card-title
        >{{ this.$store.getters.GetCRMForm.form_name }}
      </v-card-title>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-stepper v-model="flowSteps">
        <v-stepper-header>
          <v-stepper-step :complete="flowSteps > 1" step="1">
            Create Flow
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="flowSteps > 2" step="2">
            Configure Form
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step :complete="flowSteps > 3" step="3">
            Publish Flow
          </v-stepper-step>
        </v-stepper-header>
        <v-form ref="form">
          <component
            :is="componentName"
            :params="componentParams"
            @flowData="fetch_flow_steps"
            @backACtion="back_selected_form"
            @previousStep="back_flow_step"
            @configuredSteps="configured_flow_steps"
            @zeroFlow="zero_step_configure"
            @completion="final_step"
            @workflowSteps="previous_step"
            @prevZeroStep="last_previous_action"
          />
          <!-- @backACtion="back_selected_form"
            @previousStep="back_flow_step"
            @configuredSteps="configured_flow_steps"
            @zeroFlow="zero_step_configure"
            @completion="final_step"
            @workflowSteps="previous_step"
            @prevZeroStep="last_previous_action"
            @errorMsg="get_error" -->
        </v-form>
      </v-stepper>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import CreateFlow from "@/components/CRM/FlowDesignerComp/CreateFlow.vue";
import ConfigureFlow from "@/components/CRM/FlowDesignerComp/ConfigureFlow.vue";
import PublishFlow from "@/components/CRM/FlowDesignerComp/PublishFlow.vue";
export default {
  components: {
    SnackBar,
    CreateFlow,
    PublishFlow,
    ConfigureFlow,
  },
  data() {
    return {
      flowSteps: 1,
      SnackBarComponent: {},
      formsArray: [],
      searchF: "",
      selectForm: "",
      datacheck: 0,
      formSelected: {},
      flowStepsData: [],
      currentForm: {},
      currentFormSteps: [],
      currentConfigSteps: [],
      currentZeroStep: [],
      flowConfiguredSteps: [],
      zeroConfigStep: [],
      componentParams: {},
      SnackBarComponent: {},
      currentStartStep: [],
    };
  },
  computed: {
    // Destructure the component name and parameters based on the flowSteps value
    componentName() {
      const { component, parameters } = this.getComponentInfo(this.flowSteps);

      this.componentParams = parameters;

      return component;
    },
  },
  methods: {
    getComponentInfo(step) {
      switch (step) {
        case 1:
          return {
            component: "CreateFlow",
            parameters: {
              formSelected: this.$store.getters.GetCRMForm,
              currentFormSteps: this.currentFormSteps,
            },
            // Example parameter for Step 2
          };
        case 2:
          return {
            component: "ConfigureFlow",
            parameters: {
              formSelected: this.$store.getters.GetCRMForm,
              flowStepsData: this.flowStepsData,
              currentConfigSteps: this.currentConfigSteps,
              currentStartStep: this.currentStartStep,
            }, // Example parameter for Step 3
          };
        case 3:
          return {
            component: "PublishFlow",
            parameters: {
              formSelected: this.$store.getters.GetCRMForm,
              flowStepsData: this.flowStepsData,
              flowConfiguredSteps: this.flowConfiguredSteps,
              zeroConfigStep: this.zeroConfigStep,
            }, // Example parameter for Step 4
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
      this.flowStepsData = val;
      this.flowSteps = 2;
    },
    back_selected_form(val) {
      this.currentForm = val;
      this.$router.push({
        name: "ViewProduct",
        params: {
          formMethod: "forms",
        },
      });
    },

    back_flow_step(val) {
      this.currentFormSteps = val;
      this.flowSteps = 1;
    },
    configured_flow_steps(val) {
      this.flowConfiguredSteps = val;
      this.flowSteps = 3;
    },
    zero_step_configure(val) {
      this.zeroConfigStep = val;
    },
    final_step(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      setTimeout(() => {
        this.flowSteps = 1;
        this.formInfo = {};
        this.flowStepsData = [];
        this.flowConfiguredSteps = [];
        localStorage.setItem("flowStepsInfo", []);
        localStorage.setItem("zeroStep", []);
        this.formSelected = {};
        this.selectForm = "";
        this.$router.push({
          name: "ViewProduct",
          params: {
            formMethod: "forms",
          },
        });
        // this.$refs.form.reset();
      }, 500);
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
    last_previous_action(val) {
      this.currentStartStep = val;
    },

    previous_step(val) {
      this.flowSteps = 2;
      this.currentConfigSteps = val;
    },
  },
};
</script>