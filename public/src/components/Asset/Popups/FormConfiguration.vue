<template>
  <div>
    <v-card flat>
      <v-expansion-panels>
        <v-expansion-panel
          v-for="(item, index) in flowDesignerSteps"
          :key="index"
        >
          <v-expansion-panel-title>
            {{ item.name }}
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-toolbar class="mt-n3 bg-white" flat dense>
              <v-spacer />
              <v-btn
                @click="
                  edit_field_properties(
                    item.name,
                    item.workflow_template,
                    index
                  )
                "
                class="mr-n2"
                small
                color="primary"
                >Edit Field Properties</v-btn
              >
            </v-toolbar>
            <v-data-table
              density="compact"
              :headers="stepHeaders"
              :items="item.workflow_template"
              :items-per-page="500"
              hide-default-footer
            >
              <template v-slot:[`item.is_displayed`]="{ item }">
                <v-checkbox
                  v-model="item.is_displayed"
                  disabled
                  density="compact"
                ></v-checkbox>
              </template>
              <template v-slot:[`item.is_editable`]="{ item }">
                <v-checkbox
                  v-model="item.is_editable"
                  disabled
                  density="compact"
                ></v-checkbox>
              </template>
              <template v-slot:[`item.is_required`]="{ item }">
                <v-checkbox
                  v-model="item.is_required"
                  disabled
                  density="compact"
                ></v-checkbox>
              </template>
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-card-actions class="justify-start">
        <v-btn
          depressed
          @click="previous_step()"
          dark
          size="small"
          class="cardCss text-capitalize button-corner mt-6 text-white"
        >
          Back
        </v-btn>
        <v-btn
          depressed
          :loading="loading"
          @click="save_next_step()"
          dark
          size="small"
          class="cardCss text-capitalize button-corner mt-6 ml-2 text-white"
        >
          Save
        </v-btn>
      </v-card-actions>
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
  </div>
</template>
<script>
/* eslint-disable */
import EditFieldProperties from "@/components/FlowDesigneComponents/EditFieldProperties.vue";
import { configure_asset_workflows } from "@/graphql/mutations.js";
import FormConfiguration from "@/components/Asset/Popups/FormConfiguration.vue";
import { API, graphqlOperation } from "aws-amplify";

// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
export default {
  props: {
    addedFlowSteps: Array,
    tableData: Object,
    templete: Array,
    actionType: String,
  },
  components: {
    EditFieldProperties,
    FormConfiguration,
  },
  // mixins: [update_audit_logs],
  data() {
    return {
      loading: false,
      stepHeaders: [
        {
          title: "Form Field",
          align: "start",
          sortable: false,
          key: "display_label",
        },
        {
          title: "Visible",
          align: "start",
          sortable: false,
          key: "is_displayed",
        },
        {
          title: "Editable",
          align: "start",
          sortable: false,
          key: "is_editable",
        },
        {
          title: "Mandatory",
          align: "start",
          sortable: false,
          key: "is_required",
        },
      ],
      componentCheck: 0,
      fieldsData: [],
      stepName: "",
      stepIndex: 0,
      editformFields: false,
      flowDesignerSteps: [],
      currentSelectedFlow: [],
      loading: false,
      summaryField1: "",
      summaryField2: "",
      sumarrayItems: [],
    };
  },
  created() {
    var data2 = JSON.parse(localStorage.getItem("flowSteps1Info"));
    this.flowDesignerSteps = data2;
    this.currentSelectedFlow = data2;
  },

  methods: {
    edit_field_properties(Step, formfieldsArry, index) {
      this.fieldsData = [];
      this.componentCheck = 1;
      this.editformFields = true;
      this.fieldsData = formfieldsArry;
      this.stepName = Step;
      this.stepIndex = index;
    },

    save_updated_changes(value, name, index) {
      if (name == this.stepName && index == this.stepIndex) {
        for (
          var j = 0;
          j < this.currentSelectedFlow[index].workflow_template.length;
          j++
        ) {
          for (var k = 0; k < value.length; k++) {
            if (
              this.currentSelectedFlow[index].workflow_template[j]
                .display_label == value[k].label
            ) {
              this.currentSelectedFlow[index].workflow_template[
                j
              ].is_displayed = value[k].visible;
              this.currentSelectedFlow[index].workflow_template[j].is_editable =
                value[k].editable;
              this.currentSelectedFlow[index].workflow_template[j].is_required =
                value[k].mandatory;
            }
          }
        }
      }

      this.editformFields = false;
    },

    previous_step() {
      this.$emit("backAction", this.flowDesignerSteps);
    },

    save_next_step() {
      let transformedArray = this.flowDesignerSteps.map((item, index) => {
        return { ...item, step_no: index + 1 };
      });
      this.save_asset_approval_asset(transformedArray);
      //   this.$emit("configuredSteps", this.flowDesignerSteps);
    },

    async save_asset_approval_asset(value) {
      // if (value == "RETIRE_ASSET") {
      //   this.loadingrec = true;
      // } else {
      //   this.loading = true;
      // }
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      try {
        let result = await API.graphql(
          graphqlOperation(configure_asset_workflows, {
            input: {
              organization_id: data.organization.organization_id,
              form_unique_type:
                this.actionType == undefined
                  ? "ASSET_DELIVERY_ACKNOWLEDGEMENT"
                  : "REQUEST_ASSET",
              workflow_approval_steps: JSON.stringify(value),
            },
          })
        );
        var response = JSON.parse(result.data.configure_asset_workflows);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);

          this.loading = false;
        } else {
          this.loading = false;
        }
      } catch (error) {
        this.loading = false;
      }
    },
    save_mutation() {},
  },
};
</script>