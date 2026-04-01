<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="signupwizard"
    @update:model-value="$emit('update:signupwizard', $event)"
    persistent
    max-width="800"
    transition="dialog-top-transition"
  >
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card elevation="0">
      <v-card-text>
        <v-stepper
          :model-value="stepper"
          @update:model-value="stepper = $event"
          flat
        >
          <v-row class="mt-3" no-gutters>
            <v-col
              cols="12"
              class="d-flex flex-column align-center justify-center"
            >
              <v-stepper-header class="stepper-header-centered mt-2">
                <v-stepper-item
                  :complete="stepper > 0"
                  :value="0"
                ></v-stepper-item>
                <hr class="solid step-divider" />
                <v-stepper-item
                  :complete="stepper > 1"
                  :value="1"
                ></v-stepper-item>
                <v-divider class="step-divider"></v-divider>
                <v-stepper-item
                  :complete="stepper > 2"
                  :value="2"
                ></v-stepper-item>
                <v-divider class="step-divider"></v-divider>
                <v-stepper-item
                  :complete="stepper > 3"
                  :value="3"
                ></v-stepper-item>
                <v-divider class="step-divider"></v-divider>
                <v-stepper-item :value="4"></v-stepper-item>
              </v-stepper-header>
            </v-col>
          </v-row>
          <v-stepper-window>
            <v-stepper-window-item :value="0">
              <OrgNewDetails v-on:emitSecondSTep="second_step" />
            </v-stepper-window-item>
            <v-stepper-window-item :value="1">
              <EmployeSelections
                v-on:emitSecondStepData="fetch_second_step"
                v-on:secondsetepValid="validation_msg"
                v-on:previousfirstStep="prev_first_step"
              />
            </v-stepper-window-item>
            <v-stepper-window-item :value="2">
              <AppSelection
                v-on:emitToFourth="four_step"
                v-on:prevsecondStep="prev_second_step"
                v-on:selectedApps="selected_app_info"
              />
            </v-stepper-window-item>
            <v-stepper-window-item :value="3">
              <AdvanceSettings
                v-on:fifthstep="move_to_last"
                v-on:prevthirdstep="prev_third_step"
              />
            </v-stepper-window-item>
            <v-stepper-window-item :value="4">
              <v-card flat>
                <v-form ref="form">
                  <v-row class="mt-3" no-gutters>
                    <v-col cols="12" class="d-flex align-center justify-center">
                      <b>Provide your Billing Details </b>
                    </v-col>
                    <v-col class="mt-3" cols="12">
                      <v-text-field
                        density="compact"
                        variant="outlined"
                        label="Tax ID/GST NO:"
                        v-model="taxIDGst"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        density="compact"
                        variant="outlined"
                        label="Billing Address"
                        v-model="billingAddress"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                </v-form>
                <v-card-actions class="justify-center mt-4">
                  <v-btn variant="flat" @click="back_action()" color="primary">
                    Back
                  </v-btn>
                  <v-btn
                    :loading="loading"
                    variant="flat"
                    @click="final_save()"
                    color="primary"
                    class="cardCss"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
/*eslint-disable*/
import OrgNewDetails from "@/components/WizardComponents/OrgNewDetails.vue";
import EmployeSelections from "@/components/WizardComponents/EmployeSelections.vue";
import AppSelection from "@/components/WizardComponents/AppSelection.vue";
import AdvanceSettings from "@/components/WizardComponents/AdvanceSettings.vue";
import LastMobNum from "@/components/WizardComponents/LastMobNum.vue";
import { update_apps_details_organization } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    OrgNewDetails,
    EmployeSelections,
    AppSelection,
    AdvanceSettings,
    LastMobNum,
    SnackBar,
  },
  props: {
    signupwizard: Boolean,
  },
  data() {
    return {
      stepper: "0",
      firstStepInfo: {},
      SnackBarComponent: {},
      secondStepInfo: {},
      thirdStepSelectedapps: [],
      advanceStepData: {},
      taxIDGst: "",
      billingAddress: "",
      loading: false,
    };
  },
  methods: {
    back_action() {
      this.stepper = 3;
    },
    second_step(value) {
      this.stepper = 1;
      this.firstStepInfo = value;
    },
    third_step() {
      this.stepper = 2;
    },
    fetch_second_step(value) {
      this.secondStepInfo = value;
      this.stepper = 2;
    },
    validation_msg(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },
    four_step() {
      this.stepper = 3;
    },
    move_to_fisth() {
      this.stepper = 4;
    },
    prev_first_step() {
      this.stepper = 0;
    },
    prev_second_step() {
      this.stepper = 1;
    },
    selected_app_info(value) {
      this.thirdStepSelectedapps = value;
    },
    prev_third_step() {
      this.stepper = 2;
    },
    move_to_last(value) {
      this.advanceStepData = value;
      this.stepper = 4;
    },
    final_save() {
      this.update_the_org_details();
    },
    async update_the_org_details() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(update_apps_details_organization, {
            input: {
              user_role: this.firstStepInfo.jobtitle,
              no_of_employees: this.secondStepInfo.employeeCount,
              business_industry: this.secondStepInfo.selectedIndustry,
              week_off: this.advanceStepData.weekOffs,
              bucket_region: this.advanceStepData.regionbucket,
              is_default_repository: this.advanceStepData.defaultSelected,
              aws_credentials:
                this.advanceStepData.defaultSelected == false
                  ? this.fetch_aws_data()
                  : undefined,
              default_timezone: this.advanceStepData.timeZoneArray,
              enabled_apps: this.thirdStepSelectedapps,
              organization_gst_number:
                this.taxIDGst == "" ? undefined : this.taxIDGst,
              billing_address:
                this.billingAddress == "" ? undefined : this.billingAddress,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.update_apps_details_organization);
        if (response.Status == "SUCCESS") {
          this.$emit("completedStep", "sucess");
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
      }
    },

    fetch_aws_data() {
      var data = {};
      data = {
        access_key: this.advanceStepData.accesKeyID,
        secret_key: this.advanceStepData.secretAccesID,
        bucket_name: this.advanceStepData.customawsRegion,
      };
      return data;
    },
  },
};
</script>
<style scoped>
.stepper-header-centered {
  display: flex;
  justify-content: center;
  /* Align steps horizontally to the center */
  align-items: center;
  /* Align steps vertically to the center */
  /* Add spacing between steps and dividers */
}

.step-divider {
  height: 2px;
  flex-grow: 1;
  margin: 0 8px;
}

hr.solid {
  border-top: 3px solid #7b0d0d;
}
</style>
