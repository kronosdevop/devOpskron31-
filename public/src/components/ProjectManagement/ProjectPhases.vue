<template>
  <div>
    <v-card flat>
      <v-overlay v-model="overlay">
        <v-progress-circular indeterminate size="44" color="primaryColor" />
        <span class="ml-2" style="color: white">Loading...</span>
      </v-overlay>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
    </v-card>
    <v-card-text>
      <v-row no-gutters v-if="phasesDataList.length > 0">
        <v-col cols="8">
          <v-expansion-panels
            v-model="expanded"
            @update:model-value="handlePanelChange"
            focusable
          >
            <v-expansion-panel v-for="(item, i) in phasesDataList" :key="i">
              <v-expansion-panel-title>
                <div class="d-flex align-center" style="width: 100%">
                  <span>
                    {{ "Phase " + (i + 1) + " - " }}
                    <span class="font-weight-bold">{{ item.phase_name }}</span>
                    {{
                      "(" +
                      " " +
                      "Duration" +
                      " " +
                      " : " +
                      get_updatedate(item.phase_start_date) +
                      " - " +
                      get_updatedate(item.phase_end_date) +
                      ")"
                    }}
                  </span>
                  <v-spacer />
                  <div class="d-flex align-center" style="gap: 12px">
                    <span @click.stop="add_tasks(item)">
                      <v-icon
                        color="primary"
                        v-if="
                          projData.project_created_by ==
                            $store.getters.GetUserObj.user.user_email_id &&
                          new Date() <= new Date(item.phase_end_date) &&
                          projData.project_progress == 'LIVE'
                        "
                        >mdi-plus</v-icon
                      >
                    </span>
                    <v-icon
                      size="small"
                      color="primaryColor"
                      @click.stop="edit_Phase(item)"
                      v-if="
                        projData.project_created_by ==
                        $store.getters.GetUserObj.user.user_email_id
                      "
                      >mdi-pencil</v-icon
                    >
                    <v-icon
                      size="small"
                      @click.stop="delete_Phase(item)"
                      color="red"
                      v-if="
                        projData.project_created_by ==
                        $store.getters.GetUserObj.user.user_email_id
                      "
                      >mdi-delete</v-icon
                    >
                  </div>
                </div>
              </v-expansion-panel-title>

              <v-expansion-panel-text>
                <div v-if="item.tasks && item.tasks.length > 0">
                  <v-data-table
                    :headers="projetHeaders"
                    :items="item.tasks"
                    :loading="tableLoading"
                    :footer-props="{ itemsPerPageOptions: [10, 20] }"
                    :items-per-page="20"
                    density="compact"
                    class="elevation-1 mt-3 dtwidth"
                    @click:row="hadle_row_click"
                  >
                    <template #[`item.assign_to`]="{ item }">
                      <span v-text="fetch_name(item.assign_to)"></span>
                    </template>
                    <template #[`item.task_completion_date`]="{ item }">
                      <span
                        v-text="formatDisplayDate(item.task_completion_date)"
                      ></span>
                    </template>
                    <template #[`item.task_priority`]="{ item }">
                      <span
                        v-if="item.task_priority === 'high'"
                        class="green--text text-capitalize"
                      >
                        High
                      </span>
                      <span
                        v-else-if="item.task_priority === 'low'"
                        class="red--text text-capitalize"
                      >
                        Low
                      </span>
                      <span
                        v-else-if="item.task_priority === 'medium'"
                        class="blue--text text-capitalize"
                      >
                        Medium
                      </span>
                    </template>
                    <template #[`item.task_progress_status`]="{ item }">
                      <span
                        v-if="item.task_progress_status === 'COMPLETED'"
                        class="green--text text-capitalize"
                      >
                        Completed
                      </span>
                      <span
                        v-if="
                          item.task_progress_status === 'INPROGRESS' ||
                          item.task_progress_status === 'ASSIGNED'
                        "
                        class="purple--text text-capitalize"
                      >
                        Inprogress
                      </span>
                      <span
                        v-if="item.task_progress_status === 'HOLD'"
                        class="red--text text-capitalize"
                      >
                        Hold
                      </span>
                      <span
                        v-if="item.task_progress_status === 'WITHDRAWN'"
                        class="yellow--text text-capitalize"
                      >
                        Withdrawn
                      </span>
                    </template>
                    <template #[`item.actions`]="{ item }">
                      <v-icon
                        color="red"
                        size="small"
                        v-if="
                          item.task_progress_status === 'INPROGRESS' ||
                          item.task_progress_status === 'ASSIGNED'
                        "
                        @click.stop="open_deleteDailog(item)"
                        >mdi-delete</v-icon
                      >
                      <span v-else></span>
                    </template>
                  </v-data-table>
                </div>
                <div
                  v-if="!item.tasks || item.tasks.length === 0"
                  class="center-container"
                >
                  <span>No Tasks Found!</span>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>
      <div class="center-container" v-if="phasesDataList.length === 0">
        <span>No Phases Found!</span>
      </div>
    </v-card-text>
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
      <AddTaskDialogue
        :addUserTaskDialogue="addUserTaskDialogue"
        :phaseItem="phaseItem"
        @clicked="addUserTaskDialogue = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_data"
      />
    </div>
    <div v-if="componentCheck == 3">
      <ViewProjectPhase
        :viewPhaseDialog="viewPhaseDialog"
        :viewItem="viewItem"
        :key="phasekey"
        @clicked="viewPhaseDialog = false"
      />
    </div>
    <div v-if="componentCheck == 4">
      <DeleteTask
        :taskdeletion="taskdeletion"
        @clicked="taskdeletion = false"
        :projData="projItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_data"
      />
    </div>
    <div v-if="componentCheck == 5">
      <EditPhase
        :phaseEdition="phaseEdition"
        @clicked="phaseEdition = false"
        :projData="projItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:calllist="refresh_api"
      />
    </div>
    <div v-if="componentCheck == 6">
      <DeletePhase
        :phasedeletion="phasedeletion"
        @clicked="phasedeletion = false"
        :projData="projItem"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import DeletePhase from "@/components/ProjectManagement/ProjectDialogues/DeletePhase.vue";
import EditPhase from "@/components/ProjectManagement/ProjectDialogues/EditPhase.vue";
import DeleteTask from "@/components/ProjectManagement/ProjectDialogues/DeleteTask.vue";
import CreateProjectPhases from "@/components/ProjectManagement/ProjectDialogues/CreateProjectPhases.vue";
import SnackBar from "@/components/SnackBar.vue";
import {
  create_list_edit_phases,
  create_list_edit_phase_tasks,
} from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import AddTaskDialogue from "@/components/ProjectManagement/ProjectDialogues/AddTaskDialogue.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import ViewProjectPhase from "./ProjectDialogues/ViewProjectPhase.vue";

export default {
  components: {
    CreateProjectPhases,
    SnackBar,
    AddTaskDialogue,
    ViewProjectPhase,
    DeleteTask,
    EditPhase,
    DeletePhase,
  },
  mixins: [get_all_org_users],

  data() {
    return {
      projectToggles: [],
      componentCheck: 0,
      phasekey: 0,
      expanded: [],
      projectPhaseCreationDialog: false,
      phaseEdition: false,
      taskdeletion: false,
      phasedeletion: false,
      projData: {},
      projItem: {},
      SnackBarComponent: {},
      phasesDataList: [],
      addUserTaskDialogue: false,
      phaseItem: {},
      projetHeaders: [
        {
          text: "Task Details",
          value: "task_name",
          sortable: false,
          class: "my-header-style",
        },
        // {
        //   text: "Task Description",
        //   value: "task_description",
        //   sortable: false,
        //   class: "my-header-style",
        // },
        {
          text: "Assign To",
          value: "assign_to",
          sortable: false,
          class: "my-header-style",
        },
        {
          text: "Status",
          value: "task_priority",
          sortable: false,
          class: "my-header-style",
        },
        {
          text: "Due Date",
          value: "task_completion_date",
          sortable: false,
          class: "my-header-style",
        },
        {
          text: "Task Status",
          value: "task_progress_status",
          sortable: false,
          class: "my-header-style",
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
          class: "my-header-style",
        },
      ],
      tableLoading: false,
      priorityitem: "",
      selectedPhase: "",
      overlay: false,
      viewPhaseDialog: false,
    };
  },
  async created() {
    var Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));
    this.projData = Projecctdetails;
    await this.project_phase_list();
    await this.get_all_org_users();
    this.getTimesheetHeaders();
    // this.fetch_user_list();
    // this.overlay = true;
  },
  methods: {
    formatDisplayDate(date) {
      if (!date) return "";
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    getTimesheetHeaders() {
      this.projetHeaders = [
        {
          title: "Task Details",
          key: "task_name",
          sortable: false,
          class: "my-header-style",
        },
        // {
        //   text: "Task Description",
        //   value: "task_description",
        //   sortable: false,
        //   class: "my-header-style",
        // },
        {
          title: "Assign To",
          key: "assign_to",
          sortable: false,
          class: "my-header-style",
        },
        {
          title: "Status",
          key: "task_priority",
          sortable: false,
          class: "my-header-style",
        },
        {
          title: "Due Date",
          key: "task_completion_date",
          sortable: false,
          class: "my-header-style",
        },
        {
          title: "Task Status",
          key: "task_progress_status",
          sortable: false,
          class: "my-header-style",
        },
      ];

      if (
        this.projData.project_created_by ==
        this.$store.getters.GetUserObj.user.user_email_id
      ) {
        this.projetHeaders.push({
          title: "Actions",
          key: "actions",
          sortable: false,
          class: "my-header-style",
        });
      }
    },
    refresh_api() {
      this.list_tasks_data(this.selectedPhase);
    },
    edit_Phase(item) {
      this.componentCheck = 5;
      this.phaseEdition = true;
      this.projItem = item;
    },
    delete_Phase(item) {
      this.componentCheck = 6;
      this.phasedeletion = true;
      this.projItem = item;
    },
    open_deleteDailog(item) {
      this.componentCheck = 4;
      this.taskdeletion = true;
      this.projItem = item;
    },
    fetch_user_list() {
      this.userProfiles = {};
      localStorage.setItem("allOrgUsers", JSON.stringify(this.orgUsers));
      this.orgUsers.forEach((element) => {
        if (element.user_status === "ACTIVE") {
          const email = element.user_email_id;
          const profilePicUrl = element.user_profile_pic_url || "";
          const name = element.full_user_name;
          if (profilePicUrl && profilePicUrl != "N/A") {
            this.$set(this.userProfiles, email, profilePicUrl);
          } else {
            const initials = this.getInitials(name);
            this.$set(this.userProfiles, email, initials);
          }
        }
      });
    },
    getInitials(name) {
      if (typeof name !== "string" || name.trim() === "") {
        return "N/A";
      }
      const initials = name.charAt(0).toUpperCase();
      return initials || "N/A";
    },
    fetch_name(value) {
      var data = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          data = element.full_user_name;
        }
      });
      return data;
    },
    project_phases() {
      this.componentCheck = 1;
      this.projectPhaseCreationDialog = true;
    },

    get_updatedate(date) {
      return formatdisplayDate(date);
    },
    handlePanelChange(newIndex) {
      // console.log("newIndex", newIndex);
      // console.log("this.phasesDataList", this.phasesDataList);
      // console.log("this.selectedPhase", this.selectedPhase);
      this.viewPhaseDialog = false;
      if (newIndex !== null) {
        this.selectedPhase = this.phasesDataList[newIndex];
        // console.log("this.selectedPhase", this.selectedPhase);
        this.list_tasks_data(this.selectedPhase);
      }
    },

    fetchPhaseTasks(value) {
      // console.log(value, "dfff");
    },

    fetch_task_details(selectedphase) {
      // console.log(selectedphase);
    },

    async success_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.projectPhaseCreationDialog = false;
      this.phaseEdition = false;
      this.phasedeletion = false;
      await this.project_phase_list();
      await this.list_tasks_data(this.selectedPhase);
    },

    success_data(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.taskdeletion = false;
      this.addUserTaskDialogue = false;
      this.phaseEdition = false;
      this.list_tasks_data(this.selectedPhase);
    },

    async list_tasks_data(value) {
      // console.log("value", value.phase_id);
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_phase_tasks, {
            input: {
              phase_id:
                value == undefined ? this.phaseItem.phase_id : value.phase_id,
              action_type: "LIST",
            },
          })
        );
        this.overlay = false;
        var response = JSON.parse(result.data.create_list_edit_phase_tasks);
        if (response.Status == "SUCCESS") {
          // console.log("response", response);
          // this.priorityitem = response.data[0].task_priority;
          const phaseIndex = this.phasesDataList.findIndex(
            (phase) => phase.phase_id === value.phase_id
          );
          // console.log("phaseIndex", phaseIndex);
          if (phaseIndex !== -1) {
            // console.log("this.phasesDataList[phaseIndex]", this.phasesDataList[phaseIndex]);
            // Use direct assignment for Vue 3 reactivity
            this.phasesDataList[phaseIndex] = {
              ...this.phasesDataList[phaseIndex],
              tasks: response.data,
            };
            // console.log("Updated phase with tasks:", this.phasesDataList[phaseIndex]);
          }
          // console.log("this.phasesDataList", this.phasesDataList);
        }
        this.overlay = false;
      } catch (error) {
        this.tableLoading = false;
        this.overlay = false;
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

    back_call() {
      this.$router.push("/ProjectListing");
    },

    hadle_row_click(click, value) {
      this.viewPhaseDialog = false;
      this.componentCheck = 3;
      this.phasekey++;
      this.viewPhaseDialog = true;
      this.viewItem = value.item;
    },

    async project_phase_list() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_phases, {
            input: {
              project_id: this.projData.project_id,
              action_type: "LIST",
            },
          })
        );

        this.phasesDataList = [];
        this.overlay = false;
        var response = JSON.parse(result.data.create_list_edit_phases);
        if (response.Status == "SUCCESS") {
          this.phasesDataList = response.data;
        } else {
          this.tableData = response;
        }
        this.overlay = false;
      } catch (error) {
        this.tableLoading = false;
        this.overlay = false;
      }
    },

    add_tasks(value) {
      this.componentCheck = 2;
      this.addUserTaskDialogue = true;
      this.phaseItem = value;
    },
  },
};
</script>
<style scoped>
.v-data-table__wrapper > table > thead > tr > th {
  background-color: initial !important;
  font-size: initial !important;
  color: initial !important;
}
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70vh;
  width: 100%;
  text-align: center;
  font-size: 20px;
}
</style>