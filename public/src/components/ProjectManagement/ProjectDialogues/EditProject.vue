<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="projectEdition"
      @update:model-value="$emit('update:projectEdition', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Edit Project</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <div class="text-left">
            <v-form ref="form">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="displayFromDate"
                    label="Proposed Start Date*"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Required']"
                    readonly
                    @click="fromDateDialog = true"
                  >
                    <template #append-inner>
                      <v-icon @click="fromDateDialog = true">mdi-calendar</v-icon>
                    </template>
                  </v-text-field>
                  <v-dialog v-model="fromDateDialog" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempFromDate"
                        :max="toDate || undefined"
                        color="primary"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" color="primary" @click="fromDateDialog = false">Cancel</v-btn>
                        <v-btn variant="text" color="primary" @click="saveFromDate">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="displayToDate"
                    label="Proposed End Date*"
                    variant="outlined"
                    density="compact"
                    :rules="[(v) => !!v || 'Required']"
                    readonly
                    @click="toDateDialog = true"
                  >
                    <template #append-inner>
                      <v-icon @click="toDateDialog = true">mdi-calendar</v-icon>
                    </template>
                  </v-text-field>
                  <v-dialog v-model="toDateDialog" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempToDate"
                        :min="fromDate || undefined"
                        color="primary"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" color="primary" @click="toDateDialog = false">Cancel</v-btn>
                        <v-btn variant="text" color="primary" @click="saveToDate">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="displayActualStartDate"
                    label="Actual Start Date"
                    variant="outlined"
                    density="compact"
                    readonly
                    @click="actualStartDateDialog = true"
                  >
                    <template #append-inner>
                      <v-icon @click="actualStartDateDialog = true">mdi-calendar</v-icon>
                    </template>
                  </v-text-field>
                  <v-dialog v-model="actualStartDateDialog" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempActualStartDate"
                        color="primary"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" color="primary" @click="actualStartDateDialog = false">Cancel</v-btn>
                        <v-btn variant="text" color="primary" @click="saveActualStartDate">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="displayActualEndDate"
                    label="Actual End Date"
                    variant="outlined"
                    density="compact"
                    readonly
                    @click="actualEndDateDialog = true"
                  >
                    <template #append-inner>
                      <v-icon @click="actualEndDateDialog = true">mdi-calendar</v-icon>
                    </template>
                  </v-text-field>
                  <v-dialog v-model="actualEndDateDialog" persistent max-width="325">
                    <v-card>
                      <v-date-picker
                        v-model="tempActualEndDate"
                        :min="actualStartDate || undefined"
                        color="primary"
                      ></v-date-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn variant="text" color="primary" @click="actualEndDateDialog = false">Cancel</v-btn>
                        <v-btn variant="text" color="primary" @click="saveActualEndDate">OK</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
                <v-col cols="6">
                  <v-textarea
                    v-model="estimatedBudgetActualValue"
                    variant="outlined"
                    density="compact"
                    label="Estimated Budget (Actual Value)"
                    auto-grow
                    rows="0"
                  ></v-textarea>
                </v-col>
                <v-col cols="6">
                  <v-textarea
                    v-model="estimatedBudgetManMonths"
                    variant="outlined"
                    density="compact"
                    label="Estimated Budget (Man-Month)"
                    auto-grow
                    rows="0"
                  ></v-textarea>
                </v-col>
                <v-col cols="6">
                  <v-textarea
                    v-model="resourcesRequiredActualValue"
                    variant="outlined"
                    density="compact"
                    label="Resources Required(Assets,Tools) for Actual Value"
                    auto-grow
                    rows="0"
                  ></v-textarea>
                </v-col>
                <v-col cols="6">
                  <v-textarea
                    v-model="resourcesRequiredManMonths"
                    variant="outlined"
                    density="compact"
                    label="Resources Required(Assets,Tools) for Man-Month"
                    auto-grow
                    rows="0"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="projectDescription"
                    variant="outlined"
                    density="compact"
                    :error-messages="[]"
                    :rules="[
                      (v) => (v !== null && v !== undefined && v.length >= 20) || 'Minimum length is 20 characters',
                      (v) => !!v || 'Required',
                    ]"
                    label="Project Description*"
                    auto-grow
                    rows="0"
                    minlength="50"
                    maxlength="500"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="projectGoals"
                    variant="outlined"
                    density="compact"
                    :error-messages="[]"
                    label="Project Goals"
                    auto-grow
                    rows="0"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="projectObjectives"
                    variant="outlined"
                    density="compact"
                    :error-messages="[]"
                    label="Project Objectives"
                    auto-grow
                    rows="0"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="projectLocation"
                    :items="locationItems"
                    item-title="location_name"
                    item-value="location_id"
                    multiple
                    variant="outlined"
                    density="compact"
                    label="Select Location"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-row no-gutters>
                    <v-col cols="6">
                      <v-select
                        v-model="projectSponser"
                        :items="['INTERNAL', 'EXTERNAL']"
                        variant="outlined"
                        density="compact"
                        :rules="[(v) => !!v || 'required ']"
                        label="Project Sponsor*"
                        @update:model-value="claerfields"
                      ></v-select>
                    </v-col>
                    <v-col cols="6">
                      <v-autocomplete
                        v-if="projectSponser == 'INTERNAL'"
                        v-model="clientSponser"
                        :items="userList"
                        item-title="full_user_name"
                        item-value="user_id"
                        variant="outlined"
                        density="compact"
                        :rules="projectSponser == 'INTERNAL' ? [(v) => !!v || 'required '] : []"
                        label="Select User*"
                        :search-input.sync="searchp"
                        hide-no-data
                        placeholder="Min 3 Character"
                        class="ml-2"
                        @update:model-value="searchp = ''"
                      ></v-autocomplete>
                      <v-autocomplete
                        v-if="projectSponser == 'EXTERNAL'"
                        v-model="customerName"
                        :items="customersArray"
                        item-title="customer_name"
                        item-value="customer_id"
                        variant="outlined"
                        density="compact"
                        :rules="projectSponser === 'EXTERNAL' ? [(v) => !!v || 'Client Name is required'] : []"
                        label="Select Customer*"
                        :search-input.sync="searchcust"
                        hide-no-data
                        placeholder="Min 3 Character"
                        @update:model-value="searchcust = ''"
                          class="ml-2"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12">
                  <v-row no-gutters>
                    <v-col cols="6">
                      <v-checkbox
                        class=""
                        v-model="statusReportByPm"
                        label="Enable Status Report by Project Manager"
                        hide-details
                        @change="clearvaluesreports()"
                      ></v-checkbox>
                      <v-select
                        v-show="statusReportByPm"
                        variant="outlined"
                        density="compact"
                        class="mt-4"
                        label="Frequency"
                        v-model="statusFrequencyPm"
                        :items="[
                          { title: 'WEEKLY', value: 'WEEKLY' },
                          { title: 'MONTHLY', value: 'MONTHLY' },
                          { title: 'QUARTERLY', value: 'QUATERLY' },
                        ]"
                        :rules="[
                          statusReportByPm ? rules.required : () => true,
                        ]"
                      />

                      <v-select
                        v-show="statusFrequencyPm === 'WEEKLY'"
                        variant="outlined"
                        density="compact"
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
                        :rules="[
                          statusFrequencyPm === 'WEEKLY'
                            ? rules.required
                            : () => true,
                        ]"
                      />

                      <v-select
                        v-show="
                          statusFrequencyPm === 'MONTHLY' ||
                          statusFrequencyPm === 'QUATERLY'
                        "
                        variant="outlined"
                        density="compact"
                        class="mt-4"
                        :label="
                          statusFrequencyPm === 'MONTHLY'
                            ? 'Date of the month'
                            : 'Date'
                        "
                        v-model="selectedDayPm"
                        :items="[
                          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                          17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                          30, 31,
                        ]"
                        :rules="[
                          statusFrequencyPm === 'MONTHLY' ||
                          statusFrequencyPm === 'QUATERLY'
                            ? rules.required
                            : () => true,
                        ]"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-checkbox
                        class=""
                        v-model="statusReportByMembers"
                        label="Enable Status Report by Team Members"
                        hide-details
                        @change="clearvaluesMembers()"
                      ></v-checkbox>
                      <v-select
                        v-show="statusReportByMembers"
                        variant="outlined"
                        density="compact"
                        class="mt-4 ml-2"
                        label="Frequency"
                        v-model="statusFrequencyMem"
                        :items="[
                          { title: 'WEEKLY', value: 'WEEKLY' },
                          { title: 'MONTHLY', value: 'MONTHLY' },
                          { title: 'QUARTERLY', value: 'QUATERLY' },
                        ]"
                        :rules="[
                          statusReportByMembers ? rules.required : () => true,
                        ]"
                      />
                      <v-select
                        v-show="statusFrequencyMem === 'WEEKLY'"
                        variant="outlined"
                        density="compact"
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
                        :rules="[
                          statusFrequencyMem === 'WEEKLY'
                            ? rules.required
                            : () => true,
                        ]"
                      />
                      <v-select
                        v-show="
                          statusFrequencyMem === 'MONTHLY' ||
                          statusFrequencyMem === 'QUATERLY'
                        "
                        variant="outlined"
                        density="compact"
                        class="mt-4 ml-2"
                        :label="
                          statusFrequencyMem === 'MONTHLY'
                            ? 'Date of the month'
                            : 'Date'
                        "
                        v-model="selectedDayMem"
                        :items="[
                          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                          17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
                          30, 31,
                        ]"
                        :rules="[
                          statusFrequencyMem === 'MONTHLY' ||
                          statusFrequencyMem === 'QUATERLY'
                            ? rules.required
                            : () => true,
                        ]"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="cardCss"
          >
            save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
          <script>
/* eslint-disable */
import { edit_project } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import { get_location_details } from "@/mixins/GetLocations.js";
export default {
  props: {
    projectEdition: Boolean,
    projData: Object,
  },
  mixins: [get_all_org_users, get_global_customers, get_location_details],
  data() {
    return {
      projectReports: {},
      fromDate: "",
      projectGoals: "",
      projectObjectives: "",
      selectedWeekPm: "",
      projectSponser: "",
      clientSponser: "",
      searchcust: "",
      searchp: "",
      projectDescription: "",
      statusFrequencyMem: "",
      selectedDayMem: "",
      selectedDayPm: "",
      estimatedBudget: "MAN_MONTHS",
      estimatedData: "",
      estimatedBudgetActualValue: "",
      estimatedBudgetManMonths: "",
      resourcesRequiredActualValue: "",
      resourcesRequiredManMonths: "",
      selectedWeekyMem: "",
      toDate: "",
      actualStartDate: "",
      actualEndDate: "",
      statusFrequencyPm: "",
      customerName: "",
      customersArray: "",
      loading: false,
      userList: [],
      projectLocation: [],
      locationItems: [],
      statusReportByPm: false,
      statusReportByMembers: false,
      currentDate: this.formatDate(new Date()),
      rules: {
        required: (value) => !!value || "This field is required",
      },
      // Date picker variables
      fromDateDialog: false,
      toDateDialog: false,
      tempFromDate: "",
      tempToDate: "",
      actualStartDateDialog: false,
      actualEndDateDialog: false,
      tempActualStartDate: "",
      tempActualEndDate: "",
    };
  },
  computed: {
    minToDate() {
      return this.fromDate || this.currentDate;
    },
    minActualEndDate() {
      return this.actualStartDate || this.currentDate;
    },
    displayFromDate() {
      if (!this.fromDate) return '';
      const d = new Date(this.fromDate);
      if (isNaN(d)) return this.fromDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    displayToDate() {
      if (!this.toDate) return '';
      const d = new Date(this.toDate);
      if (isNaN(d)) return this.toDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    displayActualStartDate() {
      if (!this.actualStartDate) return '';
      const d = new Date(this.actualStartDate);
      if (isNaN(d)) return this.actualStartDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    displayActualEndDate() {
      if (!this.actualEndDate) return '';
      const d = new Date(this.actualEndDate);
      if (isNaN(d)) return this.actualEndDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  },
  watch: {
    projectEdition: {
      async handler() {
        if (this.projectEdition == true) {
          this.projectReports = this.projData;
          // console.log(this.projectReports, "projectReports.projData");
          this.projectLocation = this.projectReports.project_location;
          this.projectSponser = this.projectReports.project_type;
          this.clientSponser = this.projectReports.internal_project_sponser;
          this.customerName = this.projectReports.internal_project_sponser;
          if (
            this.projectReports.project_status_report.enabled_manager_report
          ) {
            this.statusReportByPm =
              this.projectReports.project_status_report.enabled_manager_report;
            this.statusFrequencyPm =
              this.projectReports.project_status_report.manager_report_frequency;
            this.selectedWeekPm =
              this.projectReports.project_status_report.member_report_day;

            this.selectedDayPm = Number(
              this.projectReports.project_status_report.manager_report_date
            );
          }
          if (this.projectReports.project_status_report.enabled_member_report) {
            this.statusReportByMembers =
              this.projectReports.project_status_report.enabled_member_report;
            this.statusFrequencyMem =
              this.projectReports.project_status_report.member_report_frequency;
            this.selectedWeekyMem =
              this.projectReports.project_status_report.member_report_day;
            this.selectedDayMem = Number(
              this.projectReports.project_status_report.member_report_date
            );
          }
          this.projectDescription = this.projData.project_description;
          this.toDate = this.projData.project_end_date;
          this.fromDate = this.projData.project_start_date;
          this.actualStartDate = this.projData.actual_start_date || "";
          this.actualEndDate = this.projData.actual_end_date || "";
          
          // Handle budget details - check if it's an array or object
          if (Array.isArray(this.projData.project_budget_details)) {
            // New format: array of budget objects
            this.projData.project_budget_details.forEach((budget) => {
              if (budget.budget_type === "ACTUAL_VALUE") {
                this.estimatedBudgetActualValue = budget.value || "";
              } else if (budget.budget_type === "MAN_MONTHS") {
                this.estimatedBudgetManMonths = budget.value || "";
              }
            });
            // Set default for backward compatibility
            if (this.projData.project_budget_details.length > 0) {
              this.estimatedBudget = this.projData.project_budget_details[0].budget_type;
              this.estimatedData = this.projData.project_budget_details[0].value || "";
            }
          } else {
            // Old format: single object
            this.estimatedBudget =
              this.projData.project_budget_details?.budget_type || "MAN_MONTHS";
            this.estimatedData = this.projData.project_budget_details?.value || "";
            // Populate new fields based on old data
            if (this.estimatedBudget === "ACTUAL_VALUE") {
              this.estimatedBudgetActualValue = this.estimatedData;
            } else if (this.estimatedBudget === "MAN_MONTHS") {
              this.estimatedBudgetManMonths = this.estimatedData;
            }
          }
          this.projectGoals =
            this.projData.project_goal == "N/A"
              ? ""
              : this.projData.project_goal;
          this.projectObjectives =
            this.projData.project_objectives == "N/A"
              ? ""
              : this.projData.project_objectives;
          
          // Initialize temp dates for date pickers
          this.tempFromDate = this.fromDate;
          this.tempToDate = this.toDate;
          this.tempActualStartDate = this.actualStartDate;
          this.tempActualEndDate = this.actualEndDate;
          
          await Promise.all([
            this.get_all_org_users(),
            this.get_global_customers(),
            this.get_location_details(),
          ]);

          this.fetchDetails();
        }
      },
      immediate: true,
    },
  },
  methods: {
    claerfields() {
      this.clientSponser = "";
      this.customerName = "";
    },
    fetchDetails() {
      let locationupdate = this.locationList.filter(
        (obj) =>
          obj.location_type == "OFFICE" ||
          obj.location_type == "PROJECT SITE" ||
          obj.location_type == "MAIN_LOCATION"
      );
      locationupdate.forEach((element) => {
        this.locationItems.push({
          location_name: element.location_name,
          location_id: element.location_id,
        });
      });
      this.customersArray = this.masterCustomers;
      this.userList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push(element);
        }
      });
    },
    clearvaluesMembers() {
      this.statusFrequencyMem = "";
      this.selectedWeekyMem = "";
      this.selectedDayMem = "";
    },
    clearvaluesreports() {
      this.statusFrequencyPm = "";
      this.selectedWeekPm = "";
      this.selectedDayPm = "";
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    close_dialog() {
      this.$emit("clicked", 0);
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
    async delete_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(edit_project, {
              input: {
                project_id: this.projData.project_id,
                project_start_date: this.formatDate(this.fromDate),
                project_end_date: this.formatDate(this.toDate),
                actual_start_date: this.actualStartDate ? this.formatDate(this.actualStartDate) : undefined,
                actual_end_date: this.actualEndDate ? this.formatDate(this.actualEndDate) : undefined,
                project_description: this.projectDescription,
                project_budget_details: this.fetch_project_budget(),
                project_goal:
                  this.projectGoals == "" ? "N/A" : this.projectGoals,
                project_objectives:
                  this.projectObjectives == "" ? "N/A" : this.projectObjectives,
                project_status_report: this.fetch_report_frequency(),
                internal_project_sponser:
                  this.projectSponser == "EXTERNAL"
                    ? this.customerName
                    : this.clientSponser,
                project_location: this.projectLocation,
                project_type: this.projectSponser,
              },
            })
          );

          this.loading = false;
          var response = JSON.parse(result.data.edit_project);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
    saveFromDate() {
      this.fromDate = this.tempFromDate;
      this.fromDateDialog = false;
    },
    saveToDate() {
      this.toDate = this.tempToDate;
      this.toDateDialog = false;
    },
    saveActualStartDate() {
      this.actualStartDate = this.tempActualStartDate;
      this.actualStartDateDialog = false;
    },
    saveActualEndDate() {
      this.actualEndDate = this.tempActualEndDate;
      this.actualEndDateDialog = false;
    },
  },
};
</script>