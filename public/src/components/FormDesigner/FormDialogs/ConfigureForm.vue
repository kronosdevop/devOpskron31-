<template>
  <div>
    <v-card-text>
      <v-row class="mt-3" no-gutters>
        <!-- <div>Form Name :{{ formInfo.form_name }}</div> -->
        <v-spacer />
        <v-btn size="small" @click="back_option()" class="text-white cardCss"
          >Back</v-btn
        >

        <v-btn
          size="small"
          @click="next_option()"
          class="ml-2 text-white cardCss"
          >Next</v-btn
        >
      </v-row>
      <v-card class="mt-3" max-width="800px">
        <v-expansion-panels>
          <v-expansion-panel title="Start">
            <v-expansion-panel-text>
              <v-toolbar class="mt-n3 bg-white" flat density="compact ">
                <v-spacer />
                <v-btn
                  @click="edit_field_properties('Start', formElements, 0)"
                  class=""
                  size="small"
                  variant="outlined"
                  color="primary"
                  >Edit Field Properties</v-btn
                >
              </v-toolbar>
              <v-data-table
                density="compact"
                :headers="headers"
                :items="formElements"
                :items-per-page="500"
                hide-default-footer
                ><template v-slot:[`item.is_displayed`]="{ item }">
                  <v-icon :color="item.is_displayed ? 'green' : 'red'">
                    <template v-if="item.is_displayed">
                      mdi-checkbox-marked-circle
                    </template>
                    <template v-else> mdi-close-circle </template>
                  </v-icon>
                </template>
                <template v-slot:[`item.is_editable`]="{ item }">
                  <v-icon :color="item.is_editable ? 'green' : 'red'">
                    <template v-if="item.is_editable">
                      mdi-checkbox-marked-circle
                    </template>
                    <template v-else> mdi-close-circle </template>
                  </v-icon>
                </template>
                <template v-slot:[`item.is_required`]="{ item }">
                  <v-icon :color="item.is_required ? 'green' : 'red'">
                    <template v-if="item.is_required">
                      mdi-checkbox-marked-circle
                    </template>
                    <template v-else> mdi-close-circle </template>
                  </v-icon>
                </template>
              </v-data-table>
              <v-row class="mt-2" no-gutters>
                <v-col cols="4">
                  <v-checkbox
                    class=""
                    v-model="enableStartAttachments"
                    label="Attachments Mandatory"
                    hide-details
                  ></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    class=""
                    v-model="enableStartGeoLocation"
                    label="Enable Geo Location"
                    hide-details
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
            <!-- <v-expansion-panel-content>
           
            </v-expansion-panel-content> -->
          </v-expansion-panel>
          <v-expansion-panel
            v-for="(item, index) in flowDesignerSteps"
            :key="index"
            :title="item.name"
          >
            <v-expansion-panel-text>
              <v-toolbar class="mt-n3 bg-white" flat density="compact">
                <v-spacer />
                <v-btn
                  @click="
                    edit_field_properties(item.name, item.formDetails, index)
                  "
                  v-if="item.key != 'hook'"
                  size="small"
                  variant="outlined"
                  color="primary"
                  >Edit Field Properties</v-btn
                >
              </v-toolbar>
              <v-data-table
                dense
                :headers="stepHeaders"
                :items="item.formDetails"
                :items-per-page="500"
                hide-default-footer
              >
                <template v-slot:[`item.is_displayed`]="{ item }">
                  <v-icon :color="item.is_displayed ? 'green' : 'red'">
                    <template v-if="item.is_displayed">
                      mdi-checkbox-marked-circle
                    </template>
                    <template v-else> mdi-close-circle </template>
                  </v-icon>
                </template>
                <template v-slot:[`item.is_editable`]="{ item }">
                  <v-icon :color="item.is_editable ? 'green' : 'red'">
                    <template v-if="item.is_editable">
                      mdi-checkbox-marked-circle
                    </template>
                    <template v-else> mdi-close-circle </template>
                  </v-icon>
                </template>
                <template v-slot:[`item.is_required`]="{ item }">
                  <v-icon :color="item.is_required ? 'green' : 'red'">
                    <template v-if="item.is_required">
                      mdi-checkbox-marked-circle
                    </template>
                    <template v-else> mdi-close-circle </template>
                  </v-icon>
                </template>
              </v-data-table>
              <v-row class="mt-2" no-gutters>
                <v-col cols="12">
                  <v-radio-group
                    label="Action Buttons"
                    v-model="item.action_buttons"
                    row
                  >
                    <v-row
                      :class="params.formType != 'DEFAULT' ? 'mt-n4' : 'mt-1'"
                    >
                      <v-col cols="6">
                        <v-radio
                          label="Approve/Reject/Forward"
                          value="approveRejectForward"
                        ></v-radio>
                      </v-col>
                      <v-col cols="6" v-if="params.formType == 'DEFAULT'">
                        <v-radio
                          label="Approve/Reject/Forward/Restart"
                          value="approveRejectForwardRestart"
                        ></v-radio>
                      </v-col>
                      <v-col cols="6" v-if="params.formType == 'DEFAULT'">
                        <v-radio
                          label="Approve/Reject/Restart"
                          value="approveRejectRestart"
                        ></v-radio>
                      </v-col>
                      <v-col cols="6">
                        <v-radio
                          label="Approve/Reject"
                          value="approveReject"
                        ></v-radio>
                      </v-col>
                    </v-row>
                  </v-radio-group>
                </v-col>
              </v-row>
              <v-row class="" no-gutters>
                <v-col cols="4">
                  <v-checkbox
                    class="mt-n2"
                    v-model="item.enable_attachments"
                    label="Attachments Mandatory"
                    hide-details
                  ></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    class="mt-n2"
                    v-model="item.enable_geoLocation"
                    label="Enable Geo Location"
                    hide-details
                  ></v-checkbox>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card>
      <div v-if="componentCheck == 1">
        <EditFieldProperties
          :editformFields="editformFields"
          :fieldsData="fieldsData"
          :stepName="stepName"
          :stepIndex="stepIndex"
          v-on:updatedVisibility="save_updated_changes"
          @clicked="editformFields = false"
        />
      </div>
    </v-card-text>
  </div>
</template>
<script>
/* eslint-disable */
import EditFieldProperties from "@/components/FlowDesigneComponents/EditFieldProperties.vue";

export default {
  components: {
    EditFieldProperties,
  },
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  // props: {
  //   formSelected: Object,
  //   flowStepsData: Array,
  //   currentConfigSteps: Array,
  //   currentZeroStep: Array,
  // },
  created() {
    if (this.params.currentStartStep.length > 0) {
      this.formElements = this.params.currentStartStep;
    }
    if (this.params.currentConfigSteps.length > 0) {
      this.flowDesignerSteps = [];
      this.enableStartAttachments =
        this.params.statrStepSettings.enableAttachments;
      this.enableStartGeoLocation =
        this.params.statrStepSettings.enableGeoLocation;
      this.flowDesignerSteps = this.params.currentConfigSteps;
      this.currentSelectedFlow = this.flowDesignerSteps;

      // console.log("back", this.flowDesignerSteps);
      // this.fetch_data(this.formInfo.form_template);
    } else {
      this.flowDesignerSteps = [];
      var data2 = JSON.parse(localStorage.getItem("flowStepsInfo"));

      this.flowDesignerSteps = data2;

      this.currentSelectedFlow = data2;

      var data = JSON.parse(localStorage.getItem("zeroStep"));

      this.formElements = data;
      this.zeroStepInfo = data;
      // console.log("dsfsdf", this.flowDesignerSteps, this.formElements);
    }
  },
  data() {
    return {
      flowDesignerSteps: [],
      stepHeaders: [
        {
          text: "Form Field",
          align: "start",
          sortable: false,
          value: "display_label",
        },
        {
          text: "Visible",
          align: "start",
          sortable: false,
          value: "is_displayed",
        },
        {
          text: "Editable",
          align: "start",
          sortable: false,
          value: "is_editable",
        },
        {
          text: "Mandatory",
          align: "start",
          sortable: false,
          value: "is_required",
        },
      ],
      headers: [
        {
          text: "Form Field",
          align: "start",
          sortable: false,
          value: "display_label",
        },
        {
          text: "Visible",
          align: "start",
          sortable: false,
          value: "is_displayed",
        },
        {
          text: "Editable",
          align: "start",
          sortable: false,
          value: "is_editable",
        },
        {
          text: "Mandatory",
          align: "start",
          sortable: false,
          value: "is_required",
        },
      ],
      componentCheck: 0,
      editformFields: false,
      fieldsData: [],
      formElements: [],
      stepName: "",
      stepIndex: 0,
      zeroStepInfo: [],
      currentSelectedFlow: [],
      enableStartAttachments: false,
      enableStartGeoLocation: false,
    };
  },
  methods: {
    next_option() {
      var data = [];
      data = this.flowSteps;
      // console.log(this.flowDesignerSteps);
      this.$emit("configuredSteps", this.flowDesignerSteps);
      this.$emit("zeroFlow", this.formElements);
      const startStep = {
        enableAttachments: this.enableStartAttachments,
        enableGeoLocation: this.enableStartGeoLocation,
      };
      this.$emit("startStepSettings", startStep);
      // console.log(this.formElements);
    },

    back_option() {
      var data2 = [];
      data2 = this.params.flowStepsData;
      this.$emit("previousStep", data2);
    },

    edit_field_properties(Step, formfieldsArry, index) {
      this.fieldsData = [];
      this.componentCheck = 1;
      this.editformFields = true;
      this.fieldsData = formfieldsArry;
      this.stepName = Step;
      this.stepIndex = index;
    },

    save_updated_changes(value, name, index) {
      if (name == "Start") {
        this.formElements.forEach((element) => {
          value.forEach((element2) => {
            if (element.display_label == element2.label) {
              element.is_displayed = element2.visible;
              element.is_editable = element2.editable;
              element.is_required = element2.mandatory;
            }
          });
        });
        // this.formElements = this.zeroStepInfo;
      } else if (name == this.stepName && index == this.stepIndex) {
        for (
          var j = 0;
          j < this.currentSelectedFlow[index].formDetails.length;
          j++
        ) {
          for (var k = 0; k < value.length; k++) {
            if (
              this.currentSelectedFlow[index].formDetails[j].display_label ==
              value[k].label
            ) {
              this.currentSelectedFlow[index].formDetails[j].is_displayed =
                value[k].visible;
              this.currentSelectedFlow[index].formDetails[j].is_editable =
                value[k].editable;
              this.currentSelectedFlow[index].formDetails[j].is_required =
                value[k].mandatory;
            }
          }
        }
      }

      this.editformFields = false;
    },
  },
};
</script>