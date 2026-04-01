<template>
  <div>
    <v-card flat>
      <v-overlay
        v-model="overlay"
        class="custom-overlay d-flex align-center justify-center"
        persistent
      >
        <div class="loader-container">
          <v-progress-circular
            indeterminate
            size="50"
            width="4"
            color="primary"
          ></v-progress-circular>

          <div class="loader-text">Loading data...</div>
        </div>
      </v-overlay>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
    </v-card>
    <v-card-text>
      <v-row no-gutters v-if="phasesDataList.length > 0">
        <v-col cols="12">
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
                          (projData.project_created_by ==
                            $store.getters.GetUserObj.user?.user_email_id ||
                            isProjectAdmin) &&
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
                          $store.getters.GetUserObj.user?.user_email_id ||
                        isProjectAdmin
                      "
                      >mdi-pencil</v-icon
                    >
                    <v-icon
                      size="small"
                      @click.stop="delete_Phase(item)"
                      color="red"
                      v-if="
                        projData.project_created_by ==
                          $store.getters.GetUserObj.user?.user_email_id ||
                        isProjectAdmin
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
                    <template #[`item.task_created_on`]="{ item }">
                      <span>{{ formatDisplay(item.task_created_on) }} </span>
                    </template>

                    <template #[`item.task_name`]="{ item }">
                      <v-tooltip
                        location="bottom"
                        content-class="small-tooltip"
                      >
                        <template #activator="{ props }">
                          <span v-bind="props" class="task-name-truncate">
                            {{
                              item.task_name && item.task_name.length > 30
                                ? item.task_name.substring(0, 30) + "..."
                                : item.task_name
                            }}
                          </span>
                        </template>

                        <span>{{ item.task_name }}</span>
                      </v-tooltip>
                    </template>
                    <template #[`item.assign_to`]="{ item }">
                      <span v-text="fetch_name(item.assign_to)"></span>
                    </template>
                    <template #[`item.task_completion_date`]="{ item }">
                      <span
                        v-text="formatDisplayDate(item.task_completion_date)"
                      ></span>
                    </template>

                    <template #[`item.task_priority`]="{ item }">
                      <v-chip
                        size="small"
                        :color="
                          item.task_priority === 'high'
                            ? 'green'
                            : item.task_priority === 'medium'
                            ? 'blue'
                            : 'red'
                        "
                        variant="tonal"
                      >
                        {{ item.task_priority }}
                      </v-chip>
                    </template>

                    <template #[`item.task_progress_status`]="{ item }">
                      <v-chip
                        size="small"
                        :color="
                          item.task_progress_status === 'COMPLETED'
                            ? 'green'
                            : item.task_progress_status === 'INPROGRESS' ||
                              item.task_progress_status === 'ASSIGNED'
                            ? 'orange'
                            : item.task_progress_status === 'HOLD'
                            ? 'red'
                            : 'yellow'
                        "
                        variant="tonal"
                      >
                        {{ item.task_progress_status }}
                      </v-chip>
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
  props: {
    selectedFilterPhase: {
      type: String,
      default: "ALL",
    },
  },

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
        {
          text: "Assign To",
          value: "assign_to",
          sortable: false,
          class: "my-header-style",
        },
        {
          text: "Priority",
          value: "task_priority",
          sortable: false,
          class: "my-header-style",
        },
        {
          text: "Initiated On",
          value: "task_created_on",
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
  },
  watch: {
    selectedFilterPhase: {
      handler() {
        this.applyFilterToAllPhases();
      },
      immediate: true,
    },
  },
  computed: {
    isProjectAdmin() {
      const userEmail = this.$store.getters.GetUserObj.user?.user_email_id;

      if (!this.projData.project_visible_members) return false;

      return this.projData.project_visible_members.some(
        (member) => member.email === userEmail && member.role === "Admin",
      );
    },
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
    formatDisplay(timestamp) {
      if (!timestamp) return "-";

      const date = new Date(timestamp * 1000); // convert seconds → milliseconds

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

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
          title: "Priority",
          key: "task_priority",
          sortable: false,
          class: "my-header-style",
        },
        {
          title: "Initiated On",
          value: "task_created_on",
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
          this.$store.getters.GetUserObj.user?.user_email_id ||
        this.isProjectAdmin
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
      this.viewPhaseDialog = false;

      if (newIndex !== null) {
        this.selectedPhase = this.phasesDataList[newIndex];
      }
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

    async applyFilterToAllPhases() {
      for (const phase of this.phasesDataList) {
        await this.list_tasks_data(phase);
      }
    },

    async list_tasks_data(phase) {
      if (!phase || !phase.phase_id) return;

      this.overlay = true;

      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_phase_tasks, {
            input: {
              phase_id: phase.phase_id,
              action_type: "LIST",
              filter: this.selectedFilterPhase,
            },
          }),
        );

        const response = JSON.parse(result.data.create_list_edit_phase_tasks);

        if (response.Status === "SUCCESS") {
          const index = this.phasesDataList.findIndex(
            (p) => p.phase_id === phase.phase_id,
          );

          if (index !== -1) {
            this.phasesDataList[index] = {
              ...this.phasesDataList[index],
              tasks: response.data,
            };
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
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
          }),
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
.task-name-truncate {
  display: inline-block;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
:deep(.small-tooltip) {
  max-width: 30% !important;
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 6px;
  white-space: normal;
  line-height: 1.3;
}
.custom-overlay {
  backdrop-filter: blur(3px);
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  min-width: 180px;
}

.loader-text {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
}
</style>
