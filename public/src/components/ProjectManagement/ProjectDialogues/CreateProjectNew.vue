<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="projectCreationDialog"
    @update:model-value="$emit('update:projectCreationDialog', $event)"
    fullscreen
    persistent
    transition="dialog-top-transition"
  >
    <v-card>
      <v-toolbar elevation="0" dark dense class="navBar">
        <v-toolbar-title class="text--black">
          <div class="custom-title">Create Project</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
      </v-toolbar>
      <v-card-text>
        <v-stepper v-model="projectCreation">
          <v-stepper-header>
            <v-stepper-item
              v-for="(label, i) in steps"
              :key="i"
              :title="label"
              :value="i + 1"
            />
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card v-if="projectCreation == 1" flat>
                <v-card-text>
                  <BasicInformation
                    @Nextstep="handleNextStep"
                    :key="closeKey"
                  />
                </v-card-text>
              </v-card>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-card v-if="projectCreation == 2" flat>
                <v-card-text>
                  <ProjectMembers
                    @ClickedBack="back_options('firstStep')"
                    @validateNext="handleValidateNext"
                    :key="closeKey"
                    @errorMsg="errorPopup"
                  />
                </v-card-text>
              </v-card>
            </v-stepper-content>
            <v-stepper-content step="3">
              <v-card v-if="projectCreation == 3" flat>
                <v-card-text>
                  <v-card-actions class="justify-end mt-2">
                    <v-btn
                      depressed
                      @click="back_options('secondStep')"
                      dark
                      class="cardCss text-capitalize button-corner ml-2"
                    >
                      Back
                    </v-btn>
                    <v-btn
                      depressed
                      @click="projectCreation = 4"
                      dark
                      class="cardCss text-capitalize button-corner ml-2"
                    >
                      Next
                    </v-btn>
                  </v-card-actions>
                  <v-row no-gutters class="mt-4">
                    <v-col cols="12">
                      <v-textarea
                        density="compact"
                        variant="outlined"
                        v-model="projectGoals"
                        label="Goals"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        density="compact"
                        variant="outlined"
                        v-model="projectObjectives"
                        label="Objectives"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-stepper-content>
            <v-stepper-content step="4">
              <v-card v-if="projectCreation == 4" flat>
                <v-card-text>
                  <ResourcesAndBudget
                    @submitBudget="handleBudgetSubmit"
                    @goBack="handleGoBack"
                    :key="closeKey"
                  />
                </v-card-text>
              </v-card>
            </v-stepper-content>
            <v-stepper-content step="5">
              <v-card v-if="projectCreation == 5" flat>
                <v-card-text>
                  <v-form ref="form">
                    <v-row no-gutters>
                      <v-col cols="6">
                        <v-checkbox
                          class=""
                          v-model="statusReportByPm"
                          label="Enable Status Report by Project Manager"
                          hide-details
                        ></v-checkbox>
                        <v-select
                          v-show="statusReportByPm"
                          density="compact"
                          variant="outlined"
                          class="mt-4"
                          label="Frequency"
                          v-model="statusFrequencyPm"
                          :items="[
                            { title: 'WEEKLY', value: 'WEEKLY' },
                            { title: 'MONTHLY', value: 'MONTHLY' },
                            { title: 'QUARTERLY', value: 'QUATERLY' },
                          ]"
                          :rules="statusReportByPm ? [rules.required] : []"
                        />

                        <v-select
                          v-show="statusFrequencyPm === 'WEEKLY'"
                          density="compact"
                          variant="outlined"
                          class="mt-4"
                          label="Day of the week"
                          v-model="selectedWeekPm"
                          :items="[
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                          ]"
                          :rules="
                            statusFrequencyPm === 'WEEKLY'
                              ? [rules.required]
                              : []
                          "
                        />

                        <v-select
                          v-show="
                            statusFrequencyPm === 'MONTHLY' ||
                            statusFrequencyPm === 'QUATERLY'
                          "
                          density="compact"
                          variant="outlined"
                          class="mt-4"
                          :label="
                            statusFrequencyPm === 'MONTHLY'
                              ? 'Date of the month'
                              : 'Date'
                          "
                          v-model="selectedDayPm"
                          :items="[
                            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                            29, 30, 31,
                          ]"
                          :rules="
                            statusFrequencyPm === 'MONTHLY' ||
                            statusFrequencyPm === 'QUATERLY'
                              ? [rules.required]
                              : []
                          "
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                          class=""
                          v-model="statusReportByMembers"
                          label="Enable Status Report by Team Members"
                          hide-details
                        ></v-checkbox>
                        <v-select
                          v-show="statusReportByMembers"
                          density="compact"
                          variant="outlined"
                          class="mt-4 ml-2"
                          label="Frequency"
                          v-model="statusFrequencyMem"
                          :items="[
                            { title: 'WEEKLY', value: 'WEEKLY' },
                            { title: 'MONTHLY', value: 'MONTHLY' },
                            { title: 'QUARTERLY', value: 'QUATERLY' },
                          ]"
                          :rules="statusReportByMembers ? [rules.required] : []"
                        />
                        <v-select
                          v-show="statusFrequencyMem === 'WEEKLY'"
                          density="compact"
                          variant="outlined"
                          class="mt-4 ml-2"
                          label="Day of the week"
                          v-model="selectedWeekyMem"
                          :items="[
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday',
                          ]"
                          :rules="
                            statusFrequencyMem === 'WEEKLY'
                              ? [rules.required]
                              : []
                          "
                        />
                        <v-select
                          v-show="
                            statusFrequencyMem === 'MONTHLY' ||
                            statusFrequencyMem === 'QUATERLY'
                          "
                          density="compact"
                          variant="outlined"
                          class="mt-4 ml-2"
                          :label="
                            statusFrequencyMem === 'MONTHLY'
                              ? 'Date of the month'
                              : 'Date'
                          "
                          v-model="selectedDayMem"
                          :items="[
                            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
                            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
                            29, 30, 31,
                          ]"
                          :rules="
                            statusFrequencyMem === 'MONTHLY' ||
                            statusFrequencyMem === 'QUATERLY'
                              ? [rules.required]
                              : []
                          "
                        />
                      </v-col>
                      <v-col v-show="statusReport == true" cols="4">
                        <v-menu
                          ref="menu"
                          v-model="menu"
                          :close-on-content-click="false"
                          :return-value.sync="date"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="date"
                              variant="outlined"
                              label="On which Date"
                              density="compact"
                              class="ml-2 mt-4"
                              readonly
                              v-bind="attrs"
                              v-on="on"
                            ></v-text-field>
                          </template>
                          <v-date-picker v-model="date" no-title scrollable>
                            <v-spacer></v-spacer>
                            <v-btn text color="primary" @click="menu = false">
                              Cancel
                            </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="$refs.menu.save(date)"
                            >
                              OK
                            </v-btn>
                          </v-date-picker>
                        </v-menu>
                      </v-col>
                      <v-divider />
                      <v-col cols="12" class="mt-2">
                        Enable other stichh Apps
                      </v-col>
                      <v-col class="mt-n2" cols="6">
                        <v-checkbox
                          v-model="enableCabinet"
                          label="Enable Cabinet"
                          hide-details
                        ></v-checkbox>
                        <!-- <v-checkbox
                          label="Enable Purchase Order"
                          v-model="enablePurchaseOrder"
                          hide-details
                        ></v-checkbox> -->
                        <v-checkbox
                          label="Enable Timesheet"
                          v-model="enableTimesheet"
                          hide-details
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-form>
                  <v-card-actions class="justify-end">
                    <v-btn
                      depressed
                      @click="projectCreation = 4"
                      dark
                      class="cardCss text-capitalize button-corner ml-2"
                    >
                      Back
                    </v-btn>
                    <v-btn
                      depressed
                      :loading="loading"
                      @click="save_option()"
                      dark
                      class="cardCss text-capitalize button-corner ml-2"
                    >
                      Save
                    </v-btn>
                  </v-card-actions>
                </v-card-text>
              </v-card>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
/*eslint-disable*/
import { create_all_projects } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import BasicInformation from "../AddProjectComp/BasicInformation.vue";
import ProjectMembers from "../AddProjectComp/ProjectMembers.vue";
import ResourcesAndBudget from "../AddProjectComp/ResourcesAndBudget.vue";
export default {
  props: {
    projectCreationDialog: Boolean,
  },
  components: {
    BasicInformation,
    ProjectMembers,
    ResourcesAndBudget,
  },

  data() {
    return {
      projectCreation: 1,
      steps: [
        "Basic Information",
        "Project Members",
        "Goals and Objectives",
        "Resources and Budget",
        "Advance Settings",
      ],
      projectGoals: "",
      projectObjectives: "",
      statusReport: false,
      statusReportByPm: false,
      statusReportByMembers: false,
      statusFrequency: "",
      date: "",
      menu: false,
      enableCabinet: false,
      enablePurchaseOrder: false,
      enableTimesheet: false,
      selectedWeek: "",
      selectedDay: "",
      memberType: "INTERNAL",
      selectedDayMem: "",
      selectedWeekMem: "",
      statusFrequencyMem: "",
      selectedDayPm: "",
      selectedWeekPm: "",
      statusFrequencyPm: "",
      selectedWeekyMem: "",
      loading: false,
      closeKey: 0,
      step1Data: {},
      step2Data: [],
      estimatedBudget: "",
      estimatedData: "",
      resourcesRequired: "",
      // Additional budget fields
      estimatedBudgetActualValue: "",
      estimatedBudgetManMonths: "",
      resourcesRequiredActualValue: "",
      resourcesRequiredManMonths: "",
      rules: {
        required: (value) => !!value || "This field is required",
      },
    };
  },
  watch: {
    projectCreationDialog: {
      async handler() {
        if (this.projectCreationDialog == true) {
          this.projectCreation = 1;
          this.closeKey++;
          this.projectGoals = "";
          this.projectObjectives = "";
          this.statusFrequencyMem = "";
          this.statusFrequencyPm = "";
          this.statusReportByPm = false;
          this.statusReportByMembers = false;
          this.enableCabinet = false;
          this.enablePurchaseOrder = false;
          this.enableTimesheet = false;
          this.projectManagerDisplay =
            this.$store.getters.GetUserObj.user.full_user_name;
          this.$store.commit("Setnamesearch", "");
          this.projectManager =
            this.$store.getters.GetUserObj.user.user_email_id;
        }
      },
      immediate: true,
    },
    statusReportByPm(newValue) {
      if (!newValue) {
        this.statusFrequencyPm = null;
        this.selectedWeekPm = null;
        this.selectedDayPm = null;
      }
    },
    statusReportByMembers(newValue) {
      if (!newValue) {
        this.statusFrequencyMem = null;
        this.selectedWeekyMem = null;
        this.selectedDayMem = null;
      }
    },
  },

  methods: {
    handleBudgetSubmit(budgetData) {
      this.estimatedBudget = budgetData.estimatedBudget;
      this.estimatedData = budgetData.estimatedData;
      this.resourcesRequired = budgetData.resourcesRequired;
      // Store additional budget fields
      this.estimatedBudgetActualValue = budgetData.estimatedBudgetActualValue || "";
      this.estimatedBudgetManMonths = budgetData.estimatedBudgetManMonths || "";
      this.resourcesRequiredActualValue = budgetData.resourcesRequiredActualValue || "";
      this.resourcesRequiredManMonths = budgetData.resourcesRequiredManMonths || "";
      this.projectCreation = 5;
      const processedData = this.fetch_project_budget();
    },
    handleGoBack() {
      this.projectCreation = 3;
    },
    handleValidateNext(teamMembers) {
      this.step2Data = teamMembers;
      this.projectCreation = 3;
    },
    handleNextStep(formData) {
      // console.log("formData", formData);
      this.step1Data = formData;
      this.projectCreation = 2;
    },

    getDynamicLabel() {
      switch (this.statusFrequency) {
        case "WEEKLY":
          return "Day of the week";
        case "MONTHLY":
          return "Date of the month";
        case "QUATERLY":
          return "Date";
        case "Yearly":
          return "Date";
        default:
          return "Date";
      }
    },

    close_dialog() {
      this.projectCreation = 1;
      this.closeKey++;
      this.projectGoals = "";
      this.projectObjectives = "";
      this.statusFrequencyMem = "";
      this.statusFrequencyPm = "";
      this.statusReportByPm = false;
      this.statusReportByMembers = false;
      this.enableCabinet = false;
      this.enablePurchaseOrder = false;
      this.enableTimesheet = false;
      this.$emit("clicked", 0);
    },

    back_options(value) {
      if (value == "firstStep") {
        this.projectCreation = 1;
      } else if (value == "secondStep") {
        this.projectCreation = 2;
      }
    },

    async save_option() {
      const { valid } = await this.$refs.form.validate();
      // console.log("isValid", valid);
      if (valid) {
        this.add_mutation();
        // alert("Form is valid, proceed with saving...");
      }
    },
    errorPopup(val) {
      this.$emit("errorMsg", val);
    },
    async add_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_all_projects, {
            input: {
              internal_project_sponser: this.step1Data.clientSponser,
              project_name: this.step1Data.projectName,
              project_visibility: "RESTRICTED_MEMBERS",
              project_visible_members: this.fetch_teammabers(),
              project_type: this.step1Data.projectSponser,
              project_start_date: this.step1Data.from_date,
              project_end_date: this.step1Data.to_date,
              actual_start_date: this.step1Data.actual_start_date || undefined,
              actual_end_date: this.step1Data.actual_end_date || undefined,
              project_location: this.step1Data.projectLocation,
              project_description: this.step1Data.projectDescription,
              // internal_project_sponser:
              //   this.step1Data.projectSponser == "INTERNAL"
              //     ? this.step1Data.clientSponser
              //     : undefined,
              client_name:
                this.step1Data.projectSponser == "EXTERNAL"
                  ? this.step1Data.clientDetails.clientName
                  : undefined,
              client_email:
                this.step1Data.projectSponser == "EXTERNAL"
                  ? this.step1Data.clientDetails.clientEmail
                  : undefined,
              client_contact_number:
                this.step1Data.projectSponser == "EXTERNAL"
                  ? this.step1Data.clientDetails.clientccode +
                    this.step1Data.clientDetails.clientContactNumber
                  : undefined,
              project_category: this.step1Data.categoryType,
              project_goal:
                this.projectGoals == "" ? undefined : this.projectGoals,
              project_objectives:
                this.projectObjectives == ""
                  ? undefined
                  : this.projectObjectives,
              project_budget_details: this.fetch_project_budget(),
              project_resource:
                this.resourcesRequired == ""
                  ? undefined
                  : this.resourcesRequired,
              app_options: this.fetch_app_options(),
              project_status_report: this.fetch_report_frequency(),
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.create_all_projects);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        // console.log("Error object:", error);
        this.$emit(
          "errorMsg",
          error.errors?.[0]?.message ||
            error.message ||
            "An unknown error occurred"
        );
      }
    },

    fetch_report_frequency() {
      var reportData = {
        enabled_manager_report: this.statusReportByPm,
        enabled_member_report: this.statusReportByMembers,
        manager_report_frequency:
          this.statusFrequencyPm == "" ? undefined : this.statusFrequencyPm,
        manager_report_day:
          this.statusFrequencyPm == "WEEKLY" ? this.selectedWeekPm : "",
        manager_report_date:
          this.statusFrequencyPm == "MONTHLY" ||
          this.statusFrequencyPm == "QUATERLY"
            ? this.selectedDayPm
            : "",
        member_report_frequency:
          this.statusFrequencyMem == "" ? undefined : this.statusFrequencyMem,
        member_report_day:
          this.statusFrequencyMem == "WEEKLY" ? this.selectedWeekyMem : "",
        member_report_date:
          this.statusFrequencyMem == "MONTHLY" ||
          this.statusFrequencyPm == "QUATERLY"
            ? this.selectedDayMem
            : "",
      };
      return reportData;
    },

    fetch_teammabers() {
      var allMembers = [];
      this.step2Data.forEach((element) => {
        allMembers.push({
          name: element.userName,
          email: element.userEmail,
          role: element.userRole,
          member_type: element.memberType,
          countryCode: element.countryCode,
          contactNumber: element.contactNumber,
        });
      });
      // console.log("dddd", JSON.stringify(allMembers), allMembers);
      return JSON.stringify(allMembers);
    },

    fetch_app_options() {
      var data = {
        is_cabinet_enabled: this.enableCabinet,
        is_purchase_order_enabled: this.enablePurchaseOrder,
        is_timesheet_enabled: this.enableTimesheet,
      };
      return data;
    },

    fetch_project_budget() {
      var data = [];
      
      // Add Actual Value budget if it has a value
      if (this.estimatedBudgetActualValue) {
        data.push({
          budget_type: "ACTUAL_VALUE",
          value: this.estimatedBudgetActualValue,
        });
      }
      
      // Add Man-Months budget if it has a value
      if (this.estimatedBudgetManMonths) {
        data.push({
          budget_type: "MAN_MONTHS",
          value: this.estimatedBudgetManMonths,
        });
      }
      
      // If no values in new fields, fall back to existing structure for backward compatibility
      if (data.length === 0 && this.estimatedBudget && this.estimatedData) {
        data.push({
          budget_type: this.estimatedBudget,
          value: this.estimatedData,
        });
      }
      
      return data;
    },
  },
};
</script>
<style scoped>
/* Remove custom stepper CSS to restore default Vuetify look */
</style>