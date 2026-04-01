<template>
  <div>
    <v-app-bar class="modern-header-section" density="compact">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-folder-multiple</v-icon>
          </div>
        </div>
        <div class="header-text">
          <div class="header-title">{{ projData.project_name }}</div>
        </div>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        v-show="allProjectDetails == 1"
        dark
        class="text-capitalize cardCss"
        @click="project_phases()"
        v-if="
          projData.project_created_by ==
            $store.getters.GetUserObj.user.user_email_id &&
          new Date() <= new Date(projData.project_end_date) &&
          projData.project_progress == 'LIVE'
        "
        >Create Phases</v-btn
      >
      <v-btn
        v-show="allProjectDetails == 2"
        dark
        class="text-capitalize cardCss"
        @click="add_project_members()"
        v-if="
          projData.project_created_by ==
          $store.getters.GetUserObj.user.user_email_id
        "
        >Add</v-btn
      >
      <v-btn
        dark
        class="text-capitalize cardCss ml-2 mr-4"
        @click="back_call()"
      >
        <v-icon class="">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-app-bar>
    <v-toolbar class="bg-white mt-6" density="compact" flat>
      <v-tabs v-model="allProjectDetails" class="modern-tab-toggle">
        <v-tab class="tab-btn"
          >Basic Details ({{ projData.project_name }})</v-tab
        >
        <v-tab class="tab-btn">Project Phases</v-tab>
        <v-tab class="tab-btn">Team Members</v-tab>
        <v-tab class="tab-btn">Status Report</v-tab>
        <v-tab class="tab-btn">TimeSheet</v-tab>
        <v-tab class="tab-btn">Cost</v-tab>
      </v-tabs>
      <v-spacer />
    </v-toolbar>
    <v-card class="pa-0">
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <div v-if="allProjectDetails == 0">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <ProjectInfo />
        </v-card>
      </div>
      <div v-if="allProjectDetails == 1">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <ProjectPhases :key="projectPhases" />
        </v-card>
      </div>
      <div v-if="allProjectDetails == 2">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <AddMember :key="projectMembers" />
        </v-card>
      </div>
      <div v-if="allProjectDetails == 3">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <ProjectReports />
        </v-card>
      </div>
      <div v-if="allProjectDetails == 4">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <ProjectTimeSheet />
        </v-card>
      </div>
      <div v-if="allProjectDetails == 5">
        <v-card flat :height="cardHeight" class="overflow-auto">
          <VendorExpensereport />
        </v-card>
      </div>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateProjectPhases
        :projectPhaseCreationDialog="projectPhaseCreationDialog"
        :projData="projData"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="projectPhaseCreationDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddMemberDialogue
        :addProjectMemberDialogue="addProjectMemberDialogue"
        :projData="projData"
        v-on:successMsg="success_data"
        v-on:errorMsg="error_info"
        @clicked="addProjectMemberDialogue = false"
      />
    </div>
  </div>
</template>

<script>
import VendorExpensereport from "@/components/ProjectManagement/VendorExpensereport.vue";
import ProjectInfo from "@/components/ProjectManagement/ProjectInfo.vue";
import ProjectPhases from "@/components/ProjectManagement/ProjectPhases.vue";
import AddMember from "@/components/ProjectManagement/ProjectDialogues/AddMember.vue";
import CreateProjectPhases from "@/components/ProjectManagement/ProjectDialogues/CreateProjectPhases.vue";
import AddMemberDialogue from "@/components/ProjectManagement/ProjectDialogues/AddMemberDialogue.vue";
import SnackBar from "@/components/SnackBar.vue";
import ProjectReports from "@/components/ProjectManagement/ProjectReports.vue";
import ProjectTimeSheet from "@/components/ProjectManagement/ProjectTimeSheet.vue";
export default {
  components: {
    ProjectInfo,
    ProjectPhases,
    AddMember,
    CreateProjectPhases,
    SnackBar,
    AddMemberDialogue,
    ProjectReports,
    ProjectTimeSheet,
    VendorExpensereport,
  },
  data() {
    return {
      allProjectDetails: 0,
      componentCheck: 0,
      projectPhaseCreationDialog: false,
      projData: {},
      SnackBarComponent: {},
      projectPhases: 0,
      addProjectMemberDialogue: false,
      projectMembers: 0,
      cardHeight: 0,
    };
  },
  created() {
    var Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));
    this.projData = Projecctdetails;
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {
    back_call() {
      this.$router.push("/home/ProjectListing");
    },

    add_project_members() {
      this.componentCheck = 2;
      this.addProjectMemberDialogue = true;
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

    success_info(value) {
      this.projectPhases++;
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.projectPhaseCreationDialog = false;
    },

    success_data(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.projectMembers++;
      this.addProjectMemberDialogue = false;
    },

    project_phases() {
      this.componentCheck = 1;
      this.projectPhaseCreationDialog = true;
    },
  },
};
</script>

<style scoped>
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  color: #666 !important;
}

.tab-btn:hover {
  color: #db4c77 !important;
}
</style>
