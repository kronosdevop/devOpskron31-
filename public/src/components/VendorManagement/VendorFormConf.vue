<template>
  <div>
    <v-form ref="form">
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
                size="small"
                color="primary"
                variant="flat"
                >Edit Field Properties</v-btn
              >
            </v-toolbar>
            <v-data-table
              density="compact"
              :headers="stepHeaders"
              :items="item.workflow_template"
              :items-per-page="5"
              class="dense-table"
            >
              <template #[`item.is_displayed`]="{ item }">
                <v-checkbox
                  v-model="item.is_displayed"
                  disabled
                  density="compact"
                  hide-details
                ></v-checkbox>
              </template>
              <template #[`item.is_editable`]="{ item }">
                <v-checkbox
                  v-model="item.is_editable"
                  disabled
                  density="compact"
                  hide-details
                ></v-checkbox>
              </template>
              <template #[`item.is_required`]="{ item }">
                <v-checkbox
                  v-model="item.is_required"
                  disabled
                  density="compact"
                  hide-details
                ></v-checkbox>
              </template>
            </v-data-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-row>
        <v-col cols="12">
          <v-card flat>
            <v-card-subtitle class="font-weight-bold mt-4"
              >Select Summary Fields</v-card-subtitle
            >
            <v-card-text class="mt-n2">
              <v-row no-gutters>
                <v-col cols="6">
                  <v-select
                    label="Summary One"
                    :items="sumarrayItems"
                    style="max-width: 280px"
                    v-model="summaryField1"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="6">
                  <v-select
                    class="ml-2"
                    style="max-width: 280px"
                    label="Summary Two"
                    :items="sumarrayItems"
                    v-model="summaryField2"
                    item-title="label"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-subtitle class="font-weight-bold"
              >Notification (You will be notified by email and by app
              notification.)
            </v-card-subtitle>
            <v-card-text>
              <v-autocomplete
                v-model="selectTeam"
                label="Select User"
                density="compact"
                variant="outlined"
                item-title="full_user_name"
                item-value="user_id"
                :items="userArray"
                v-model:search-input="searchF"
                @input="searchF = ''"
                style="max-width: 280px"
                hide-no-data
                placeholder="Min 3 Character"
                multiple
              />
              <v-card-subtitle class="mt-n4 ml-n3 font-weight-bold">
                <v-checkbox
                  v-model="groupheadNotification"
                  label="Group Head will be notified by email and by app
                notification"
                />
              </v-card-subtitle>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-card-actions class="justify-start">
        <v-btn
          depressed
          @click="previous_step()"
          dark
          class="cardCss text-capitalize button-corner mt-4 ml-2 text-white"
        >
          Back
        </v-btn>
        <v-btn
          depressed
          :loading="loading"
          @click="save_next_step()"
          dark
          class="cardCss text-capitalize button-corner mt-4 ml-2 text-white"
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
    </v-form>
  </div>
</template>
  <script>
/* eslint-disable */
import EditFieldProperties from "@/components/FlowDesigneComponents/EditFieldProperties.vue";
import { update_vendor_workflows } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  props: {
    addedFlowSteps: Array,
    tableData: Object,
    templete: Array,
  },
  components: {
    EditFieldProperties,
  },
  // mixins: [update_audit_logs],
  mixins: [get_all_org_users],
  data() {
    return {
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
      groupheadNotification: false,
      flowDesignerSteps: [],
      currentSelectedFlow: [],
      loading: false,
      summaryField1: "",
      summaryField2: "",
      sumarrayItems: [],
      selectTeam: "",
      userArray: [],
      searchF: "",
    };
  },
  async created() {
    var data2 = JSON.parse(localStorage.getItem("flowSteps1Info"));
    this.flowDesignerSteps = data2;
    this.currentSelectedFlow = data2;
    this.groupheadNotification =
      this.tableData.is_group_noftication_enabled == undefined
        ? false
        : this.tableData.is_group_noftication_enabled;

    this.summaryField1 =
      this.tableData.summary_field_1 == undefined
        ? ""
        : this.tableData.summary_field_1;
    this.summaryField2 =
      this.tableData.summary_field_2 == undefined
        ? ""
        : this.tableData.summary_field_2;

    this.selectTeam =
      this.tableData.notifications == undefined
        ? []
        : this.tableData.notifications;

    await this.fetch_summary_fields();
    await this.get_all_org_users();
    this.fetch_user();
  },

  methods: {
    resetForm() {
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },
    fetch_user() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
    },

    fetch_summary_fields() {
      var data = this.templete;
      this.sumarrayItems = [];
      data.forEach((element) => {
        if (element.data_type != "media") {
          this.sumarrayItems.push({
            label: element.display_label,
            value: this.fetch_keys(element),
          });
        }
      });
    },
    fetch_keys(value) {
      var data = "";
      if (value.input_value == "list_users") {
        data = "user_id_text";
      } else if (value.input_value == "expense_details") {
        data = "category_id_text";
      } else if (value.input_value == "list_expense_group") {
        data = "expense_group_id_text";
      } else {
        data = value.key.toLowerCase().replace(/ /g, "_");
      }
      return data;
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
      this.save_vendor_head(transformedArray);
      this.$emit("configuredSteps", this.flowDesignerSteps);
    },

    async save_vendor_head(value) {
      this.loading = true;

      // console.log(this.tableData);
      try {
        let result = await API.graphql(
          graphqlOperation(update_vendor_workflows, {
            input: {
              workflow_id: this.tableData.workflow_id,
              workflow_approval_steps: JSON.stringify(value),
              notifications: this.selectTeam,
              is_group_noftication_enabled: this.groupheadNotification,
              workflow_template: JSON.stringify(this.tableData.workflow_template),

              // summary_field_1: this.summaryField1,
              // summary_field_2: this.summaryField2,
            },
          })
        );
        var response = JSON.parse(result.data.update_vendor_workflows);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        console.log(error);
        this.$emit("errorMsg", error.errors[0].message);

        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.dense-table {
  --v-data-table-row-height: 32px !important;
}

.dense-table :deep(.v-data-table__tr) {
  height: 32px !important;
}

.dense-table :deep(.v-data-table__td) {
  padding: 4px 8px !important;
  height: 32px !important;
}

.dense-table :deep(.v-data-table__th) {
  padding: 8px !important;
  height: 40px !important;
}

.dense-table :deep(.v-checkbox) {
  margin: 0 !important;
  padding: 0 !important;
}

.dense-table :deep(.v-checkbox .v-selection-control) {
  min-height: 24px !important;
}
</style>