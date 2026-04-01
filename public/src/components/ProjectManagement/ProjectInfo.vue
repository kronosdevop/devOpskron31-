<template>
  <div>
    <v-card class="mt-4" flat outlined>
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="6">
            <v-col cols="12">
              <div class="primary--text">
                <b>Project Details</b>
                <v-icon
                  class="ml-4 mt-n2"
                  color="primary"
                  v-if="
                    (projData.project_created_by ==
      $store.getters.GetUserObj.user?.user_email_id || isProjectAdmin)
                  "
                  @click="edit_project()"
                  >mdi-pencil</v-icon
                >
              </div>
            </v-col>
            <v-divider />
            <v-col cols="12">
              <div>
                <b>Project Name</b> :
                {{ projectName }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Project Description</b> :
                {{ projectDesc }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Project Manager</b> :
                {{ projectManager }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Project Duration</b> :
                {{
                  get_updatedate(projecStartDate) +
                  " / " +
                  get_updatedate(projectEndDate)
                }}
              </div>
            </v-col>
            <v-col cols="12" v-if="actualStartDate">
              <div>
                <b>Actual Start Date</b> :
                {{ get_updatedate(actualStartDate) }}
              </div>
            </v-col>
            <v-col cols="12" v-if="actualEndDate">
              <div>
                <b>Actual End Date</b> :
                {{ get_updatedate(actualEndDate) }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Project Sponsor Type</b> :
                {{ projectType }}
              </div>
            </v-col>
            <v-col v-show="projectType == 'INTERNAL'" cols="12">
              <div>
                <b>Internal Sponsor</b> :
                {{ projectInternalSPonser }}
              </div>
            </v-col>
            <v-col v-show="projectType == 'EXTERNAL'" cols="12">
              <div>
                <b>External Sponsor Name</b> :
                <!-- {{ projectClientName }} -->
                {{ projectInternalSPonser }}
              </div>
            </v-col>
            <!-- <v-col v-show="projectType == 'EXTERNAL'" cols="12">
              <div>
                <b>External Sponsor Email</b> :
                {{ clientEmail }}
              </div>
            </v-col>
            <v-col v-show="projectType == 'EXTERNAL'" cols="12">
              <div>
                <b>External Sponsor ContactNumber</b> :
                {{ clientContactNumber }}
              </div>
            </v-col> -->

            <v-col cols="12">
              <div>
                <b>Project Category</b> :
                {{ projectCategory }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Project Location</b> :
                {{ projectLocation }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Project Goals</b> :
                {{ projectGoals }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Project Objectives</b> :
                {{ projectObjectives }}
              </div>
            </v-col>
            <v-col cols="12" v-if="projectBudgetActualValue || projectBudgetManMonths">
              <div>
                <b>Project Budget</b> :
                <div v-if="projectBudgetActualValue" class="ml-4 mt-1">
                  • Actual Value: {{ projectBudgetActualValue }}
                </div>
                <div v-if="projectBudgetManMonths" class="ml-4 mt-1">
                  • Man-Months: {{ projectBudgetManMonths }}
                </div>
                <!-- Fallback for old format -->
                <div v-if="!projectBudgetActualValue && !projectBudgetManMonths && projectBudget" class="ml-4 mt-1">
                  {{ projectBudget + " (" + (budgetType === "ACTUAL_VALUE" ? "Actual Value" : "In Manmonths") + ")" }}
                </div>
              </div>
            </v-col>
          </v-col>
          <v-col cols="6">
            <v-divider class="" style="margin-top: 46px" />
            <v-col cols="12">
              <div>
                <b>Cabinet</b> :
                {{ cabinetEnabled }}
              </div>
            </v-col>
            <!-- <v-col cols="12">
              <div>
                <b>Purchase Order</b> :
                {{ purchaseOrderEnabled }}
              </div>
            </v-col> -->
            <v-col cols="12">
              <div>
                <b>Timesheet</b> :
                {{ timeSheetEnabled }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Project Reports</b>
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Manager Report</b> :
                {{ projectReports.enabled_manager_report }}
              </div>
            </v-col>
            <v-col cols="12" v-if="projectReports.enabled_manager_report">
              <div>
                <b>Manager Report Frequency</b> :
                {{ projectReports.manager_report_frequency }}
                ({{
                  projectReports.manager_report_frequency == "WEEKLY"
                    ? projectReports.manager_report_day
                    : projectReports.manager_report_date
                }})
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Member Report</b> :
                {{ projectReports.enabled_member_report }}
              </div>
            </v-col>
            <v-col cols="12" v-if="projectReports.enabled_member_report">
              <div>
                <b>Member Report Frequency</b> :
                {{ projectReports.member_report_frequency }}
                ({{
                  projectReports.member_report_frequency == "WEEKLY"
                    ? projectReports.member_report_day
                    : projectReports.member_report_date
                }})
              </div>
            </v-col>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div v-if="componetCheck == 1">
      <EditProject
        :projectEdition="projectEdition"
        @clicked="projectEdition = false"
        :projData="projData"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { get_particular_project } from "@/graphql/queries.js";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import EditProject from "@/components/ProjectManagement/ProjectDialogues/EditProject.vue";
export default {
  components: {
    EditProject,
    SnackBar,
  },
  data() {
    return {
      projectName: "",
      projectDesc: "",
      projecStartDate: "",
      projectEndDate: "",
      actualStartDate: "",
      actualEndDate: "",
      projectType: "",
      projectTeamMembers: [],
      projectCategory: "",
      projectLocation: [],
      projectManager: "",
      projectGoals: "",
      projectObjectives: "",
      projectBudget: "",
      budgetType: "",
      projectBudgetActualValue: "",
      projectBudgetManMonths: "",
      projectInternalSPonser: "",
      projectClientName: "",
      clientEmail: "",
      clientContactNumber: "",
      timeSheetEnabled: null,
      purchaseOrderEnabled: null,
      cabinetEnabled: null,
      projectEdition: false,
      componetCheck: 0,
      projData: {},
      projectReports: {},
      SnackBarComponent: {},
    };
  },
  async created() {
    let Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));
    this.projData = JSON.parse(localStorage.getItem("projectInfo"));
    this.projectName = Projecctdetails.project_name;
    this.projectDesc = Projecctdetails.project_description;
    this.projecStartDate = Projecctdetails.project_start_date;
    this.projectEndDate = Projecctdetails.project_end_date;
    this.actualStartDate = Projecctdetails.actual_start_date || "";
    this.actualEndDate = Projecctdetails.actual_end_date || "";
    this.projectType = Projecctdetails.project_type;
    this.projectCategory =
      Projecctdetails.project_category == undefined
        ? "N/A"
        : Projecctdetails.project_category;
        if( Projecctdetails.project_location_name){
 this.projectLocation =
      Projecctdetails.project_location_name.length == 0
        ? "N/A"
        : Projecctdetails.project_location_name.join(",");
        }
   
    this.projectReports = Projecctdetails.project_status_report;
    this.projectManager = Projecctdetails.project_manager;
    this.projectGoals = Projecctdetails.project_goal;
    this.projectObjectives = Projecctdetails.project_objectives;
    
    // Handle budget details - check if it's an array or object
    if (Array.isArray(Projecctdetails.project_budget_details)) {
      // New format: array of budget objects
      Projecctdetails.project_budget_details.forEach((budget) => {
        if (budget.budget_type === "ACTUAL_VALUE") {
          this.projectBudgetActualValue = budget.value || "";
        } else if (budget.budget_type === "MAN_MONTHS") {
          this.projectBudgetManMonths = budget.value || "";
        }
      });
      // Set default for backward compatibility
      if (Projecctdetails.project_budget_details.length > 0) {
        this.budgetType = Projecctdetails.project_budget_details[0].budget_type;
        this.projectBudget = Projecctdetails.project_budget_details[0].value || "";
      }
    } else {
      // Old format: single object
      this.projectBudget =
        Projecctdetails.project_budget_details != undefined
          ? Projecctdetails.project_budget_details.value
          : "";
      this.budgetType =
        Projecctdetails.project_budget_details != undefined
          ? Projecctdetails.project_budget_details.budget_type
          : "";
      // Populate new fields based on old data
      if (this.budgetType === "ACTUAL_VALUE") {
        this.projectBudgetActualValue = this.projectBudget;
      } else if (this.budgetType === "MAN_MONTHS") {
        this.projectBudgetManMonths = this.projectBudget;
      }
    }
    // console.log(Projecctdetails, "Projecctdetails");
    this.projectInternalSPonser =
      Projecctdetails.client_name != undefined
        ? Projecctdetails.client_name
        : "";
    this.clientContactNumber =
      Projecctdetails.client_contact_number != undefined
        ? Projecctdetails.client_contact_number
        : "";
    this.clientEmail =
      Projecctdetails.client_email != undefined
        ? Projecctdetails.client_email
        : "";
    this.projectClientName =
      Projecctdetails.client_name != undefined
        ? Projecctdetails.client_name
        : "";
    this.cabinetEnabled =
      Projecctdetails.app_options.is_cabinet_enabled == true
        ? "Enabled"
        : "Not Enabled";
    this.purchaseOrderEnabled =
      Projecctdetails.app_options.is_purchase_order_enabled == true
        ? "Enabled"
        : "Not Enabled";
    this.timeSheetEnabled =
      Projecctdetails.app_options.is_timesheet_enabled == true
        ? "Enabled"
        : "Not Enabled";
    this.fetch_project_list();
  },
    computed: {
  isProjectAdmin() {
    const userEmail = this.$store.getters.GetUserObj.user?.user_email_id;

    if (!this.projData.project_visible_members) return false;

    return this.projData.project_visible_members.some(
      member => member.email === userEmail && member.role === "Admin"
    );
  }
},
  methods: {
    async fetch_project_list() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_project, {
            input: {
              project_id: this.projData.project_id,
            },
          })
        );
        let response = JSON.parse(result.data.get_particular_project);
        if (response.Status == "SUCCESS") {
          let projectdetails = response.data[0];
          this.projData = projectdetails;
          // console.log(projectdetails);
          
          // Handle budget details - check if it's an array or object
          if (Array.isArray(projectdetails.project_budget_details)) {
            // New format: array of budget objects
            this.projectBudgetActualValue = "";
            this.projectBudgetManMonths = "";
            projectdetails.project_budget_details.forEach((budget) => {
              if (budget.budget_type === "ACTUAL_VALUE") {
                this.projectBudgetActualValue = budget.value || "";
              } else if (budget.budget_type === "MAN_MONTHS") {
                this.projectBudgetManMonths = budget.value || "";
              }
            });
            // Set default for backward compatibility
            if (projectdetails.project_budget_details.length > 0) {
              this.budgetType = projectdetails.project_budget_details[0].budget_type;
              this.projectBudget = projectdetails.project_budget_details[0].value || "";
            }
          } else {
            // Old format: single object
            this.projectBudget =
              projectdetails.project_budget_details != undefined
                ? projectdetails.project_budget_details.value
                : "";
            this.budgetType =
              projectdetails.project_budget_details != undefined
                ? projectdetails.project_budget_details.budget_type
                : "";
            // Populate new fields based on old data
            if (this.budgetType === "ACTUAL_VALUE") {
              this.projectBudgetActualValue = this.projectBudget;
            } else if (this.budgetType === "MAN_MONTHS") {
              this.projectBudgetManMonths = this.projectBudget;
            }
          }
          this.projectGoals = projectdetails.project_goal;
          this.projectObjectives = projectdetails.project_objectives;
          this.projectDesc = projectdetails.project_description;
          this.projecStartDate = projectdetails.project_start_date;
          this.projectEndDate = projectdetails.project_end_date;
          this.actualStartDate = projectdetails.actual_start_date || "";
          this.actualEndDate = projectdetails.actual_end_date || "";
          this.projectReports = projectdetails.project_status_report;

          this.projectType = projectdetails.project_type;
          this.projectLocation =projectdetails.project_location_name?
            projectdetails.project_location_name.length == 0
              ? "N/A"
              : projectdetails.project_location_name.join(","):"N/A";
          this.projectInternalSPonser =
            projectdetails.client_name != undefined
              ? projectdetails.client_name
              : "";
        }
      } catch (error) {
       
      }
    },
    error_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    async success_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.projectEdition = false;
      await this.fetch_project_list();
    },
    get_updatedate(date) {
      return formatdisplayDate(date);
    },
    edit_project() {
      this.componetCheck = 1;
      // console.log(this.projData, "this.projData");
      // this.projData = JSON.parse(localStorage.getItem("projectInfo"));
      this.projectEdition = true;
    },
  },
};
</script>