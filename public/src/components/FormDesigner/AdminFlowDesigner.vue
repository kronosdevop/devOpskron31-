<template>
  <div>
    <v-card flat>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <OverlayComp :overlay="overlay" />

      <v-card-text class="mt-n1">
        <v-card-title>
          Design Flow For
          {{ formNameValue }}</v-card-title
        >
        <v-stepper v-model="flowSteps">
          <v-stepper-header>
            <v-stepper-item :complete="flowSteps > 0" :value="1">
              Selected Form
            </v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :complete="flowSteps > 1" :value="2">
              Create Flow
            </v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :complete="flowSteps > 2" :value="3">
              Configure Form
            </v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :complete="flowSteps > 3" :value="4">
              Form Details
            </v-stepper-item>
            <v-divider></v-divider>
            <v-stepper-item :complete="flowSteps > 4" :value="5">
              Preview and Publish
            </v-stepper-item>
            <v-divider></v-divider>
          </v-stepper-header>
          <v-form ref="form">
            <!-- <v-stepper-items> -->
            <v-stepper-content v-show="flowSteps == 0" step="0">
              <v-card-text>
                <v-row no-gutters>
                  <!-- <v-autocomplete
                    dense
                    v-model="selectForm"
                    style="max-width: 300px"
                    class=""
                    label="Choose Form"
                    :rules="[(v) => !!v || 'required ']"
                    outlined
                    item-text="formName"
                    item-value="formId"
                    :items="formsArray"
                    return-object
                    :search-input.sync="searchF"
                    @input="get_selected_data(selectForm)"
                    hide-no-data
                  >
                  </v-autocomplete> -->
                  <!-- <v-btn small @click="select_data()" class="white--text cardCss"
                  >Select Form</v-btn
                > -->

                  <v-spacer> </v-spacer>
                  <v-btn
                    size="small"
                    @click="validate_next_step()"
                    class="text-white cardCss"
                    >Next</v-btn
                  >
                </v-row>
              </v-card-text>
            </v-stepper-content>
          </v-form>
          <component
            :is="componentName"
            :params="componentParams"
            v-if="flowSteps > 0"
            @flowData="fetch_flow_steps"
            @backACtion="back_selected_form"
            @previousStep="back_flow_step"
            @configuredSteps="configured_flow_steps"
            @zeroFlow="zero_step_configure"
            @startStepSettings="fetch_start_settings"
            @completion="final_step"
            @workflowSteps="previous_step"
            @prevZeroStep="last_previous_action"
            @errorMsg="get_error"
            @formflownext="next_formtype"
            @previewStep="back_publish_step"
            @backstepPreview="back_lastpublish"
          />

          <div v-if="flowSteps == 0">
            <FlowSelectedView :formFields="formFields" :key="flowViewKey" />
          </div>
          <!-- <v-stepper-content v-show="flowSteps == 2" step="2">
            <v-card-text>
              <CreateFlow
                :formSelected="formSelected"
                v-on:flowData="fetch_flow_steps"
                v-on:backACtion="back_selected_form"
              />
            </v-card-text>
          
          </v-stepper-content> -->
          <!-- <v-stepper-content v-show="flowSteps == 3" step="3">
            <v-card-text>
              <ConfigureForm
                :formSelected="formSelected"
                :flowStepsData="flowStepsData"
                :currentConfigSteps="currentConfigSteps"
                :currentZeroStep="currentZeroStep"
                v-on:previousStep="back_flow_step"
                v-on:configuredSteps="configured_flow_steps"
                v-on:zeroFlow="zero_step_configure"
              />
            </v-card-text>
          
          </v-stepper-content> -->
          <!-- <v-stepper-content v-show="flowSteps == 4" step="4">
            <v-card-text>
              <WorkflowPublish
                :formSelected="formSelected"
                :flowStepsData="flowStepsData"
                v-on:completion="completion"
                v-on:workflowSteps="previous_step"
                :flowConfiguredSteps="flowConfiguredSteps"
                :zeroConfigStep="zeroConfigStep"
              />
            </v-card-text>
          </v-stepper-content> -->
          <!-- </v-stepper-items> -->
        </v-stepper>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_custom_forms } from "@/mixins/GetCustomForms.js";
import CreateFlow from "@/components/FormDesigner/FormDialogs/CreateFlow.vue";
import WorkflowPublish from "@/components/FormDesigner/FormDialogs/WorkflowPublish.vue";
import ConfigureForm from "@/components/FormDesigner/FormDialogs/ConfigureForm.vue";
import FlowSelectedView from "@/components/FormDesigner/FlowSelectedView.vue";
import SnackBar from "@/components/SnackBar.vue";
import WorkflowPreview from "@/components/FormDesigner/FormDialogs/WorkflowPreview.vue";
import OverlayComp from "@/components/OverlayComp.vue";

export default {
  components: {
    CreateFlow,
    WorkflowPublish,
    WorkflowPreview,
    ConfigureForm,
    SnackBar,
    FlowSelectedView,
    OverlayComp,
  },
  data() {
    return {
      flowSteps: 0,
      formsArray: [],
      searchF: "",
      selectForm: "",
      datacheck: 0,
      formSelected: {},
      publishInfo: {},
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
      flowFormView: false,
      formFields: [],
      flowViewKey: 0,
      selectedFormValue: false,
      formNameValue: "",
      formType: "",
      overlay: false,
      statrStepSettings: {},
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
  mixins: [get_custom_forms],

  async created() {
    this.overlay = true;
    await this.get_custom_forms();
    this.overlay = false;
    if (Object.keys(this.currentForm).length != 0) {
      this.selectForm = this.currentForm.formId;
    }
    this.fetch_forms();
  },

  methods: {
    fetch_forms() {
      this.formsArray = [];

      // console.log("dfgsds", this.$store.getters.GetFormObject);
      // if (this.$store.getters.GetFormType == "FORMS_LIBRARY") {
      //   var formData = this.$store.getters.GetFormObject;
      //   this.formsArray.push({
      //     formName: this.$store.getters.GetFormLibObject.FormName,
      //     formId: formData.form_id,
      //     formDesc: this.$store.getters.GetFormLibObject.FormDescription,
      //     formTemplate: formData.form_template,
      //   });
      //   this.formSelected = this.formsArray[0];
      //   this.formNameValue = this.formsArray[0].formName;
      //   this.formFields = this.formsArray[0].formTemplate;
      //   this.flowViewKey += 1;
      //   localStorage.setItem(
      //     "zeroStep",
      //     JSON.stringify(this.formsArray[0].formTemplate)
      //   );
      // } else {
      this.customFormArrray.forEach((element) => {
        if (this.$store.getters.GetFormObject.form_id == element.form_id) {
          this.formsArray.push({
            formName:
              this.$store.getters.GetFormType == "FORMS_LIBRARY"
                ? this.$store.getters.GetFormLibObject.FormName
                : element.form_name,
            formId: element.form_id,
            formDesc:
              this.$store.getters.GetFormType == "FORMS_LIBRARY"
                ? this.$store.getters.GetFormLibObject.FormDescription
                : element.form_description,
            formTemplate: element.form_template,
          });
        }
      });

      this.formSelected = this.formsArray[0];
      this.formNameValue = this.formsArray[0].formName;
      this.formFields = this.formsArray[0].formTemplate;
      this.flowViewKey += 1;
      localStorage.setItem(
        "zeroStep",
        JSON.stringify(this.formsArray[0].formTemplate)
      );
    },

    fetch_start_settings(val) {
      this.statrStepSettings = val;
    },
    next_formtype(val) {
      this.formType = val;
    },
    back_publish_step(val) {
      this.publishInfo = val;
      this.flowSteps = 4;
    },
    back_lastpublish() {
      this.flowSteps = 3;
    },
    getComponentInfo(step) {
      switch (step) {
        case 1:
          return {
            component: "CreateFlow",
            parameters: {
              formSelected: this.formSelected,
              currentFormSteps: this.currentFormSteps,
              formType: this.formType,
            },
            // Example parameter for Step 2
          };
        case 2:
          return {
            component: "ConfigureForm",
            parameters: {
              formSelected: this.formSelected,
              flowStepsData: this.flowStepsData,
              currentConfigSteps: this.currentConfigSteps,
              currentStartStep: this.currentStartStep,
              statrStepSettings: this.statrStepSettings,
              formType: this.formType,
            }, // Example parameter for Step 3
          };
        case 3:
          return {
            component: "WorkflowPublish",
            parameters: {
              formSelected: this.formSelected,
              flowStepsData: this.flowStepsData,
              flowConfiguredSteps: this.flowConfiguredSteps,
              zeroConfigStep: this.zeroConfigStep,
              statrStepSettings: this.statrStepSettings,
              formType: this.formType,
              publishInfo: this.publishInfo,
            }, // Example parameter for Step 4
          };
        case 4:
          return {
            component: "WorkflowPreview",
            parameters: {
              formSelected: this.formSelected,
              publishInfo: this.publishInfo,
            }, // Example parameter for Step 4
          };
        default:
          return {
            component: null,
            parameters: {},
          };
      }
    },

    select_data() {
      this.datacheck = 1;
    },

    get_selected_data(value) {
      this.formFields = [];
      this.flowFormView = false;
      this.formSelected = value;
      this.formFields = value.formTemplate;
      this.flowFormView = true;
      this.selectedFormValue = true;
      this.formNameValue = value.formName;
      this.flowViewKey += 1;
      localStorage.setItem("zeroStep", JSON.stringify(value.formTemplate));
    },

    validate_next_step() {
      if (this.$refs.form.validate()) {
        this.flowSteps = 1;
      }
    },

    fetch_flow_steps(val) {
      this.flowStepsData = [];
      this.flowStepsData = val;
      this.flowSteps = 2;
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
        this.$emit("flowMethod", "all_flows");

        // this.flowSteps = 1;
        this.formInfo = {};
        this.flowStepsData = [];
        this.flowConfiguredSteps = [];
        localStorage.setItem("flowStepsInfo", []);
        localStorage.setItem("zeroStep", []);
        this.formSelected = {};
        this.selectForm = "";
        this.$router.push({ name: "FormDesignerAdmin" });
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

    back_selected_form(val) {
      this.currentForm = val;
      this.flowSteps = 0;
    },

    previous_step(val) {
      this.flowSteps = 2;
      this.currentConfigSteps = val;
    },

    last_previous_action(val) {
      this.currentStartStep = val;
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
  },
};
</script>