<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="publishFormDialog" @update:model-value="$emit('update:publishFormDialog', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card v-if="$store.getters.GetFormType == 'CUSTOM'">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Publish Form</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">Are you sure you want to publish form ?</div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="publish_form()"
            dark
            class="cardCss text-white"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-else>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--white ml-2"
            >Import Form</v-toolbar-title
          >
          <v-spacer />
          <v-icon @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                  label="Form Name"
                  v-model="formName"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                 density="compact"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                  label="Form Description"
                  v-model="formDesc"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="validate_data()"
            dark
            class="cardCss button-corner text-capitalize text-white"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { custom_form_design, create_worklow } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_custom_forms } from "@/mixins/GetCustomForms.js";

export default {
  props: {
    publishFormDialog: Boolean,
    formDataArray: Array,
  },
  mixins: [get_custom_forms],
  data() {
    return {
      loading: false,
      formName: "",
      formDesc: "",
      regularS3URLsnew: [],
      arrayurls: [],
      modifiedarray: [],
      sortedWorkflowApprovalSteps: null,
      sortedWorkflowStarts: [],
    };
  },
  watch: {
    publishFormDialog: {
      async handler() {
        if (this.publishFormDialog == true) {
        }
      },
      immediate: true,
    },
  },
  methods: {
    convertArrayToRegularS3URLs(presignedURLs) {
      this.arrayurls = [];

      for (const presignedURL of presignedURLs) {
        const regularS3URL = this.convertToRegularS3URL(presignedURL);
        this.arrayurls.push(regularS3URL);
      }
      return this.arrayurls;
    },

    convertToRegularS3URL(presignedURL) {
      const url = new URL(presignedURL);
      const regularS3URL = url.origin + url.pathname;
      return regularS3URL;
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.formName = "";
      this.formDesc = "";
    },

    convertRegualr() {
      for (let i = 0; i < this.formDataArray.length; i++) {
        const obj = this.formDataArray[i];
        if (obj.type === "GALLERY") {
          obj.fieldOptions = this.convertArrayToRegularS3URLs(obj.fieldOptions);
        }
      }
      return this.formDataArray;
    },
  async  validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (this.$store.getters.GetFormType == "FORMS_LIBRARY") {
          var data = {
            FormName: this.formName,
            FormDescription: this.formDesc,
          };
          this.$store.commit("SetFormLibObject", data);
        }
        this.publish_form();
      }
    },

    async publish_form() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      var formsarray = await this.convertRegualr(this.formDataArray);
      try {
        let result = await API.graphql(
          graphqlOperation(custom_form_design, {
            input: {
              organization_id: data.organization.organization_id,
              form_id: this.$store.getters.GetFormObject.form_id,
              form_design_template: JSON.stringify(formsarray),
              is_form_designed: true,
              enum_type: this.$store.getters.GetFormType,
              form_name:
                this.$store.getters.GetFormType == "FORMS_LIBRARY"
                  ? this.formName
                  : undefined,
              form_description:
                this.$store.getters.GetFormType == "FORMS_LIBRARY"
                  ? this.formDesc
                  : undefined,
              user_email_id:
                this.$store.getters.GetFormType == "FORMS_LIBRARY"
                  ? data.user.user_email_id
                  : undefined,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.custom_form_design);
        if (response.Status == "SUCCESS") {
          this.loading = false;

          if (this.$store.getters.GetEditFormDetails.FormEdit == true) {
            // console.log("calling this ");
            this.publish_workflow(response.data);
          } else if (this.$store.getters.GetFormType == "FORMS_LIBRARY") {
            this.$store.commit("SetFormObj", response);
            this.$emit("successMsg", response.Message);

            this.formName = "";
            this.formDesc = "";
          } else {
            this.$emit("successMsg", response.Message);

            this.formName = "";
            this.formDesc = "";
          }
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
        // this.$emit("successMsg", "Form Created Successfully");
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    sortWorkflowTemplateSteps(workflow_approval_steps) {
      const templateOrder = this.extractTemplateOrder();

      for (const key in workflow_approval_steps) {
        if (workflow_approval_steps[key].workflow_template) {
          workflow_approval_steps[key].workflow_template.sort((a, b) => {
            return (
              templateOrder.indexOf(a.display_label) -
              templateOrder.indexOf(b.display_label)
            );
          });
        }
      }
      this.sortedWorkflowApprovalSteps = [];
      this.sortedWorkflowApprovalSteps = workflow_approval_steps;
    },
    extractTemplateOrder() {
      return Object.values(this.modifiedarray).map(
        (item) => item.display_label
      );
    },
    sortWorkflowStarts(workflowStarts) {
      const templateOrder = Object.values(this.modifiedarray).map(
        (item) => item.display_label
      );

      const sortedArray = Object.values(workflowStarts).sort(
        (a, b) =>
          templateOrder.indexOf(a.display_label) -
          templateOrder.indexOf(b.display_label)
      );
      this.sortedWorkflowStarts = [];
      this.sortedWorkflowStarts = sortedArray;
    },
    async publish_workflow(formtemp) {
      this.loading = true;
      var modifiedData = [];
      var flowInfo = this.$store.getters.GetEditFormDetails.FlowValue;
      await this.get_custom_forms();
      this.customFormArrray.forEach((element) => {
        if (element.form_id == flowInfo.form_id) {
          modifiedData = element;
        }
      });
      this.modifiedarray = modifiedData.form_template;
      await this.sortWorkflowTemplateSteps(formtemp.workflow_approval_steps);
      await this.sortWorkflowStarts(formtemp.workflow_starts);
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_worklow, {
            input: {
              workflow_design_type: flowInfo.workflow_design_type,
              is_group_noftication_enabled:
                flowInfo.is_group_noftication_enabled == undefined
                  ? false
                  : flowInfo.is_group_noftication_enabled,
              workflow_name: flowInfo.workflow_name,
              workflow_description: flowInfo.workflow_description,
              organization_id: data.organization.organization_id,
              form_id: flowInfo.form_id,
              // workflow_template: JSON.stringify(modifiedData.form_template),
              workflow_template: JSON.stringify(this.sortedWorkflowStarts),
              workflow_type: "CUSTOM_FLOWS",
              workflow_starts: JSON.stringify(this.sortedWorkflowStarts),
              // workflow_approval_steps:
              //   flowInfo.workflow_approval_steps.length != 0
              //     ? await this.fetch_workflow_steps(
              //         modifiedData.form_template,
              //         flowInfo.workflow_approval_steps
              //       )
              //     : JSON.stringify(flowInfo.workflow_approval_steps),
              workflow_approval_steps: JSON.stringify(
                this.sortedWorkflowApprovalSteps
              ),
              workflow_count_steps: flowInfo.workflow_count_steps,
              user_email_id: data.user.user_email_id,
              is_attachments: 0,
              is_enable_geoloc: flowInfo.is_geo_enabled,
              workflow_webhook: JSON.stringify(flowInfo.workflow_webhook),
              summary_field: "N/A",
              workflow_visibility: flowInfo.workflow_visibility,
              summary_field_1: flowInfo.summary_field_1,
              summary_field_2: flowInfo.summary_field_2,
              notifications: flowInfo.notifications,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.create_worklow);

        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.$emit("onPublish", "success");
        } else {
          this.loading = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    fetch_workflow_steps(modifiedPaylod, flowData) {
      flowData.forEach((element) => {
        element.workflow_template = modifiedPaylod;
      });
      return JSON.stringify(flowData);
    },
  },
};
</script>