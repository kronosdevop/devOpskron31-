<template>
  <div>
    <v-row class="mt-2" no-gutters>
      <!-- eslint-disable -->
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <!-- <div class="mt-n3">
        <b>Form Name :{{ formInfo.form_name }}</b>
      </div> -->
      <v-spacer />
      <v-btn small @click="back_step()" class="mt-n3 white--text cardCss"
        >Back</v-btn
      >

      <v-btn
        small
        @click="validate_data()"
        :loading="loading"
        class="mt-n3 ml-2 white--text cardCss"
        >Publish</v-btn
      >
    </v-row>
    <v-card class="mt-n4" max-width="700">
      <!-- <v-card-title>F</v-card-title> -->
      <v-card-text>
        <v-form ref="form">
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                outlined
                readonly
                label="Workflow Name"
                :rules="[(v) => !!v || 'required ']"
                v-model="formInfo.form_name"
                dense
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                outlined
                readonly
                rows="1"
                :rules="[(v) => !!v || 'required ']"
                label="Workflow Description"
                v-model="formInfo.form_description"
                dense
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
    <v-card class="mt-2" max-width="700">
      <v-card-title>Webhook/Other Settings</v-card-title>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="12">
            <v-text-field outlined label="URL" v-model="invokeUrl" dense />
          </v-col>
          <v-col cols="12">
            <v-text-field
              outlined
              label="Authorization"
              v-model="webhoolAuth"
              dense
            />
          </v-col>
          <v-col class="mt-n4" cols="6">
            <v-checkbox
              v-model="enableGeoLoc"
              label="Enable Geolocation"
            ></v-checkbox>
          </v-col>
          <v-col class="mt-n4" cols="6">
            <v-checkbox
              v-model="enableAttachments"
              label="Enable Attachments"
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { create_worklow } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
  },
  props: {
    formInfo: Object,
    flowSteps: Array,
    flowConfiguredSteps: Array,
    workFlowCompletionStep: Object,
    publish_form: Boolean,
    zeroConfigStep: Array,
    primaryField: String,
  },
  data() {
    return {
      wrkflowName: "",
      workflowDescription: "",
      SnackBarComponent: {},
      stepsCount: [],
      loading: false,
      invokeUrl: "",
      webhoolAuth: "",
      enableAttachments: false,
      enableGeoLoc: false,
    };
  },
  methods: {
    async validate_data() {
      if (this.$refs.form.validate()) {
        this.publish_workflow();
      }
    },
    async publish_workflow() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_worklow, {
            input: {
              workflow_name: this.formInfo.form_name,
              workflow_description: this.formInfo.form_description,
              organization_id: data.organization.organization_id,
              form_id: this.formInfo.form_id,
              workflow_template: JSON.stringify(this.zeroConfigStep),
              workflow_status: "ACTIVE",
              workflow_deploy_status: "DEPLOY",
              workflow_approval_steps: await this.fetch_workflow_steps(
                this.flowConfiguredSteps
              ),
              workflow_count_steps: this.stepsCount.length,
              user_email_id: data.user.user_email_id,
              is_attachments: 0,
              is_enable_geoloc: false,
              workflow_webhook: this.fetch_weebhook_action(),
              summary_field: this.primaryField,
              is_attachments: this.enableAttachments == false ? 0 : 1,
              is_enable_geoloc: this.enableGeoLoc,
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.create_worklow);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.$emit("successMsg", "Sucess", "close");

          this.$refs.form.reset();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          //   this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };

        // this.$emit("errorMsg", error.errors[0].message);
        // this.loading = false;
      }
    },

    back_step() {
      // this.$emit("lastStep", this.flowConfiguredSteps);
      // this.$emit("prevZeroStep", this.zeroConfigStep);
    },

    fetch_weebhook_action() {
      var data = {};
      data = {
        invoke_url: this.invokeUrl == "" ? "N/A" : this.invokeUrl,
        authorization: this.webhoolAuth == "" ? "N/A" : this.webhoolAuth,
      };
      return JSON.stringify(data);
    },

    fetch_workflow_steps(value) {
      var array = [];
      var steps = [];
      this.stepsCount = [];
      steps = value;
      var self = this;
      var count = 1;

      for (let i = 0; i < steps.length; i++) {
        array.push({
          user_type: steps[i].key,
          user_id:
            steps[i].key == "roles" || steps[i].key == "team_member"
              ? steps[i].value
              : "N/A",
          step_no: count++,
          workflow_template: steps[i].formDetails,
        });
      }

      this.stepsCount = array;

      return JSON.stringify(array);
    },

    construct_data() {},
  },
};
</script>