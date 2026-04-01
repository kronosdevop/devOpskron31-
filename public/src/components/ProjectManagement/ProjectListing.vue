<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-folder-multiple</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Projects</span>
          <span class="header-subtitle">Manage your projects</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon color="primary" size="30"> mdi-help-box </v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-text-field
          v-model="searchQuery"
          placeholder="Search projects..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          class="search-field"
          clearable
          style="min-width: 280px; max-width: 320px"
        />
        <v-select
          density="compact"
          variant="outlined"
          v-model="projectStatusTrack"
          :items="[
            { title: 'ALL', value: 'ALL' },
            { title: 'LIVE', value: 'LIVE' },
            { title: 'COMPLETED', value: 'COMPLETED' },
            { title: 'SUSPENDED', value: 'SUSPENDED' },
          ]"
          label="Filter By Status"
          @update:model-value="filterProjects(projectStatusTrack)"
          class="filter-select"
          style="min-width: 200px; max-width: 250px; margin-top: 15px"
        />
        <v-switch
          v-model="toggle_exclusive"
          :label="toggle_exclusive ? 'Grid View' : 'List View'"
          color="primary"
          class="mr-4"
          hide-details
          density="compact"
        />
        <v-btn @click="create_project" class="action-btn" size="small">
          <v-icon>mdi-plus</v-icon>
          <span>Create Project</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-card flat :height="windowHeight" class="overflow-y-auto mt-10">
      <OverlayComp :overlay="overlay" />
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-card-text class="mt-n4" v-if="toggle_exclusive == false">
        <!-- Table View -->

        <v-card class="" flat>
          <v-card-text>
            <v-data-table
              :search="searchQuery"
              :height="tableHeight"
              :headers="tableHeaders"
              :fixed-header="fixed"
              :items="paginatedItems"
              :loading="tableLoading"
              hide-default-footer
              density="comfortable"
              class="modern-data-table"
              hover
              multi-sort
              @click:row="handleClick2"
            >
              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey lighten-1" class="mb-4"
                    >mdi-folder-open-outline</v-icon
                  >
                  <div class="text-h6 grey--text mb-2">No Projects Found</div>
                  <div class="text-body-2 grey--text">
                    Try adjusting your search criteria or create a new project.
                  </div>
                </div>
              </template>

              <template v-slot:[`item.project_display_id`]="{ item }">
                <span class="caption">
                  {{ item.project_display_id || "N/A" }}
                </span>
              </template>

              <template v-slot:loading>
                <div class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="32"
                    class="mb-4"
                  ></v-progress-circular>
                  <div class="text-body-2 grey--text">Loading projects...</div>
                </div>
              </template>

              <!-- Project Name -->
              <template v-slot:[`item.project_name`]="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <div v-bind="props" class="d-flex align-center">
                      <v-icon
                        size="16"
                        :color="getProgressColor(item.project_progress)"
                        class="mr-2"
                      >
                        mdi-circle
                      </v-icon>
                      <span class="caption font-weight-medium">{{
                        item.project_name
                      }}</span>
                      <v-icon
                        size="16"
                        color="primary"
                        class="ml-2"
                        v-show="
                          item.project_created_by ==
                          $store.getters.GetUserObj.user.user_email_id
                        "
                      >
                        mdi-account
                      </v-icon>
                    </div>
                  </template>
                  <div class="text-left">
                    {{ item.project_progress }} Project
                  </div>
                </v-tooltip>
              </template>

              <!-- Project Status -->
              <template v-slot:[`item.project_progress`]="{ item }">
                <v-chip
                  :color="getProgressColor(item.project_progress)"
                  size="small"
                  variant="flat"
                  class="text-caption font-weight-medium"
                >
                  {{ item.project_progress }}
                </v-chip>
              </template>

              <!-- Created By -->
              <template v-slot:[`item.project_created_by`]="{ item }">
                <span class="caption">
                  {{ fetch_name(item.project_created_by) }}
                </span>
              </template>

              <!-- Start Date -->
              <template v-slot:[`item.project_start_date`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="primary" class="mr-2"
                      >mdi-calendar-start</v-icon
                    > -->
                  <span class="caption">{{
                    get_updatedate(item.project_start_date)
                  }}</span>
                </div>
              </template>

              <!-- End Date -->
              <template v-slot:[`item.project_end_date`]="{ item }">
                <div class="d-flex align-center">
                  <!-- <v-icon size="16" color="primary" class="mr-2"
                      >mdi-calendar-end</v-icon
                    > -->
                  <span class="caption">{{
                    get_updatedate(item.project_end_date)
                  }}</span>
                </div>
              </template>

              <!-- Progress -->
              <template
                v-slot:[`item.project_completion_percentage`]="{ item }"
              >
                <div class="d-flex align-center">
                  <v-progress-linear
                    v-model="item.project_completion_percentage"
                    :color="getProgressColor(item.project_progress)"
                    height="6"
                    rounded
                    class="mr-2"
                    style="min-width: 60px"
                  ></v-progress-linear>
                  <span
                    class="caption font-weight-medium"
                    :style="{
                      color: getProgressColor(item.project_progress),
                    }"
                  >
                    {{ item.project_completion_percentage || 0 }}%
                  </span>
                </div>
              </template>

              <!-- Team Members -->
              <template v-slot:[`item.project_visible_members`]="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <div v-bind="props" class="d-flex align-center">
                      <v-avatar
                        v-for="(
                          member, index
                        ) in item.project_visible_members.slice(0, 3)"
                        :key="member.email"
                        class="mr-n1 avatar-member"
                        :style="{ zIndex: 10 - index }"
                        color="primary"
                        size="24"
                      >
                        <img
                          v-if="
                            userProfiles[member.email] &&
                            userProfiles[member.email].startsWith('http')
                          "
                          :src="userProfiles[member.email]"
                          alt="Profile Pic"
                          class="avatar-image"
                        />
                        <span
                          v-else-if="item.project_type === 'INTERNAL'"
                          class="text-caption font-weight-medium"
                        >
                          {{ userProfiles[member.email] }}
                        </span>
                        <span
                          v-else-if="item.project_type === 'EXTERNAL'"
                          class="text-caption font-weight-medium"
                        >
                          {{ getInitials(member.name) }}
                        </span>
                      </v-avatar>
                      <v-avatar
                        v-if="item.project_visible_members.length > 3"
                        color="grey-lighten-2"
                        size="24"
                        class="ml-1"
                      >
                        <span
                          class="text-caption font-weight-medium text-grey-darken-1"
                        >
                          +{{ item.project_visible_members.length - 3 }}
                        </span>
                      </v-avatar>
                    </div>
                  </template>
                  <span>View Team Members</span>
                </v-tooltip>
              </template>
              <!-- Customer -->
              <template v-slot:[`item.customer_name`]="{ item }">
                <span class="caption">
                  {{
                    item.project_type == "EXTERNAL"
                      ? this.masterCustomers.find(customer => customer.customer_email_id === item.internal_project_sponser)?.legal_name || item.internal_project_sponser
                      : "-"
                  }}
                </span>
              </template>

              <!-- Role -->
              <template v-slot:[`item.project_role`]="{ item }">
                <v-chip
                  size="small"
                  color="grey-lighten-1"
                  variant="flat"
                  class="text-caption"
                >
                  {{ userRole(item) }}
                </v-chip>
              </template>

              <!-- Actions -->
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex align-center">
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="small"
                        color="primary"
                        class="mr-2"
                        @click.stop="update_project_status(item)"
                      >
                        mdi-pencil-outline
                      </v-icon>
                    </template>
                    <span>Update Status</span>
                  </v-tooltip>
                  <v-tooltip
                    location="top"
                    v-if="
                      item.project_created_by ==
                        $store.getters.GetUserObj.user.user_email_id &&
                      item.project_progress === 'LIVE'
                    "
                  >
                    <template v-slot:activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="small"
                        color="orange"
                        @click.stop="update_owner(item)"
                      >
                        mdi-swap-horizontal
                      </v-icon>
                    </template>
                    <span>Transfer Owner</span>
                  </v-tooltip>
                </div>
              </template>
            </v-data-table>

            <!-- Modern Table Footer -->
            <div class="table-footer">
              <div class="footer-info">
                {{
                  totalItems === 0
                    ? "No Results"
                    : `Showing ${paginatedItems.length} of ${totalItems} projects`
                }}
              </div>
              <div class="pagination-controls">
                <v-btn
                  :disabled="currentPage === 1"
                  variant="text"
                  size="small"
                  class="pagination-btn"
                  @click="currentPage = currentPage - 1"
                >
                  Previous
                </v-btn>
                <div class="page-numbers">
                  <v-btn
                    v-for="page in visiblePages"
                    :key="page"
                    :variant="page === currentPage ? 'elevated' : 'text'"
                    size="small"
                    :class="
                      page === currentPage ? 'active-page' : 'inactive-page'
                    "
                    @click="currentPage = page"
                  >
                    {{ page }}
                  </v-btn>
                </div>
                <v-btn
                  :disabled="currentPage === pageCount"
                  variant="text"
                  size="small"
                  class="pagination-btn"
                  @click="currentPage = currentPage + 1"
                >
                  Next
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
      <v-card-text v-if="toggle_exclusive == true">
        <div class="center-container" v-if="tableData.length === 0">
          <v-icon size="64" color="grey-lighten-1" class="mb-4"
            >mdi-folder-open-outline</v-icon
          >
          <span class="text-h6 text-grey-darken-1">No Projects Found!</span>
          <p class="text-body-2 text-grey-darken-2 mt-2">
            Create your first project to get started
          </p>
        </div>
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="6"
            md="4"
            lg="3"
            v-for="(project, index) in tableData"
            :key="index"
            class="pa-2"
          >
            <v-card
              @click="handleClick(project)"
              class="project-card h-100"
              elevation="2"
              :class="{ 'project-card-hover': true }"
              style="
                min-height: 380px;
                transition: all 0.3s ease;
                border-radius: 12px;
              "
            >
              <v-card-title class="pb-2">
                <v-row no-gutters align="center">
                  <v-col cols="10">
                    <div class="d-flex align-center">
                      <v-icon
                        size="20"
                        :color="getProgressColor(project.project_progress)"
                        class="mr-2"
                      >
                        mdi-circle
                      </v-icon>
                      <span class="text-h6 font-weight-medium text-truncate">
                        {{ project.project_name }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="2" class="text-right">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          v-bind="props"
                          color="grey-darken-1"
                        >
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list density="compact" class="py-0">
                        <v-list-item
                          @click="update_project_status(project)"
                          prepend-icon="mdi-pencil-outline"
                          class="py-2"
                        >
                          <v-list-item-title class="text-body-2"
                            >Update Status</v-list-item-title
                          >
                        </v-list-item>
                        <v-list-item
                          @click="update_owner(project)"
                          v-if="
                            project.project_created_by ==
                            $store.getters.GetUserObj.user.user_email_id
                          "
                          prepend-icon="mdi-account-switch-outline"
                          class="py-2"
                        >
                          <v-list-item-title class="text-body-2"
                            >Transfer Owner</v-list-item-title
                          >
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-card-title>

              <v-divider class="mx-3 mb-3"></v-divider>

              <v-card-text class="pt-0">
                <!-- Project Creator -->
                <div class="d-flex align-center mb-3">
                  <v-avatar size="28" color="primary" class="mr-2">
                    <v-icon size="16" color="white">mdi-account</v-icon>
                  </v-avatar>
                  <span class="text-body-2 text-grey-darken-1">
                    {{ fetch_name(project.project_created_by) }}
                  </span>
                </div>

                <!-- Project Description -->
                <div class="mb-4">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <p
                        v-bind="props"
                        class="text-body-2 text-grey-darken-2 mb-0"
                        style="line-height: 1.4"
                      >
                        {{
                          project.project_description.length > 80
                            ? project.project_description.slice(0, 80) + "..."
                            : project.project_description
                        }}
                      </p>
                    </template>
                    <div
                      style="
                        max-width: 300px;
                        white-space: normal;
                        word-wrap: break-word;
                      "
                    >
                      {{ project.project_description }}
                    </div>
                  </v-tooltip>
                </div>

                <!-- Progress Section -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span
                      class="text-caption font-weight-medium text-grey-darken-1"
                      >Progress</span
                    >
                    <span
                      class="text-caption font-weight-bold"
                      :style="{
                        color: getProgressColor(project.project_progress),
                      }"
                    >
                      {{ project.project_completion_percentage || 0 }}%
                    </span>
                  </div>
                  <v-progress-linear
                    v-model="project.project_completion_percentage"
                    :color="getProgressColor(project.project_progress)"
                    height="8"
                    rounded
                    class="mb-1"
                  ></v-progress-linear>
                  <div class="d-flex justify-space-between">
                    <span class="text-caption text-grey-darken-2">Status:</span>
                    <v-chip
                      :color="getProgressColor(project.project_progress)"
                      size="x-small"
                      variant="flat"
                      class="font-weight-medium"
                    >
                      {{ project.project_progress }}
                    </v-chip>
                  </div>
                </div>

                <!-- Duration -->
                <div class="mb-4">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="16" color="grey-darken-2" class="mr-2"
                      >mdi-calendar-range</v-icon
                    >
                    <span
                      class="text-caption font-weight-medium text-grey-darken-1"
                      >Duration</span
                    >
                  </div>
                  <div class="text-caption text-grey-darken-2">
                    {{ get_updatedate(project.project_start_date) }} -
                    {{ get_updatedate(project.project_end_date) }}
                  </div>
                </div>

                <!-- Team Members -->
                <div>
                  <div class="d-flex align-center mb-2">
                    <v-icon size="16" color="grey-darken-2" class="mr-2"
                      >mdi-account-group</v-icon
                    >
                    <span
                      class="text-caption font-weight-medium text-grey-darken-1"
                      >Team ({{ project.project_visible_members.length }})</span
                    >
                  </div>
                  <div class="avatar-container d-flex align-center">
                    <v-avatar
                      v-for="(
                        member, index
                      ) in project.project_visible_members.slice(0, 6)"
                      :key="member.email"
                      class="avatar-wrapper avatar-member"
                      :style="{ left: `${index * 24}px`, zIndex: 10 - index }"
                      color="primary"
                      size="28"
                      @mouseover="setHoveredIndex(index)"
                      @mouseleave="clearHoveredIndex"
                    >
                      <img
                        v-if="
                          userProfiles[member.email] &&
                          userProfiles[member.email].startsWith('http')
                        "
                        :src="userProfiles[member.email]"
                        alt="Profile Pic"
                        class="avatar-image"
                      />
                      <span
                        v-else-if="project.project_type === 'INTERNAL'"
                        class="text-caption font-weight-medium"
                      >
                        {{ userProfiles[member.email] }}
                      </span>
                      <span
                        v-else-if="project.project_type === 'EXTERNAL'"
                        class="text-caption font-weight-medium"
                      >
                        {{ getInitials(member.name) }}
                      </span>
                      <v-tooltip bottom v-if="hoveredIndex === index">
                        <template v-slot:activator="{ props }">
                          <div
                            v-bind="props"
                            class="name-tooltip-trigger"
                          ></div>
                        </template>
                        <span>{{ member.name }}</span>
                      </v-tooltip>
                    </v-avatar>
                    <v-avatar
                      v-if="project.project_visible_members.length > 6"
                      class="avatar-wrapper"
                      :style="{ left: `${6 * 24}px`, zIndex: 4 }"
                      color="grey-lighten-2"
                      size="28"
                    >
                      <span
                        class="text-caption font-weight-medium text-grey-darken-1"
                      >
                        +{{ project.project_visible_members.length - 6 }}
                      </span>
                    </v-avatar>
                  </div>
                </div>
              </v-card-text>

              <!-- Card Footer -->
              <v-card-actions class="pt-0">
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  class="text-caption font-weight-medium"
                  @click.stop="handleClick(project)"
                >
                  View Details
                  <v-icon size="16" class="ml-1">mdi-arrow-right</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="5">
            <div v-if="componentCheck == 3">
              <AddMember
                :rowInfo="rowInfo"
                v-on:closeFunc="close_dialog"
                v-on:successMsg="success_data"
                v-on:errorMsg="error_msg"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <CreateProjectNew
        :projectCreationDialog="projectCreationDialog"
        @clicked="projectCreationDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
    <div v-if="componentCheck == 2">
      <ProjectStatusUpdate
        :projectStatusUpdateDialog="projectStatusUpdateDialog"
        :rowInfo="rowInfo"
        @clicked="projectStatusUpdateDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
    <div v-if="componentCheck == 3">
      <ViewProjectMember
        :projectMemberDialog="projectMemberDialog"
        :rowInfo="rowInfo"
        @clicked="projectMemberDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
      />
    </div>
    <div v-if="componentCheck == 4">
      <TransferProject
        :tranferOwnerDialog="tranferOwnerDialog"
        :rowInfo="rowInfo"
        @clicked="tranferOwnerDialog = false"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
        :allUSersNames="allUSersNames"
      />
    </div>
  </div>
</template>

<script>
/*eslint-disable*/
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
import TransferProject from "@/components/ProjectManagement/ProjectDialogues/TransferProject.vue";
import CreateProjectNew from "@/components/ProjectManagement/ProjectDialogues/CreateProjectNew.vue";
import ProjectStatusUpdate from "@/components/ProjectManagement/ProjectDialogues/ProjectStatusUpdate.vue";
import AddMember from "@/components/ProjectManagement/ProjectDialogues/AddMember.vue";
import SnackBar from "@/components/SnackBar.vue";
// import OverlayComp from "@/components/OverlayComp.vue";
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { list_all_user_projects } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewProjectMember from "./ProjectDialogues/ViewProjectMember.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";

export default {
  components: {
    CreateProjectNew,
    SnackBar,
    ProjectStatusUpdate,
    AddMember,
    // OverlayComp,
    ViewProjectMember,
    TransferProject,
    CreateExternalTicketDialog,
  },
  mixins: [get_all_org_users, get_global_customers],
  data() {
    return {
      fixed: true,
      tableLoading: false,
      taskPercentage: 0,
      tableData: [],
      SnackBarComponent: {},
      userProfiles: {},
      overlay: false,
      projectStatusTrack: "LIVE",

      toggle_exclusive: false,
      projetHeaders: [
        {
          title: "Project ID",
          key: "project_display_id",
          sortable: false,
        },
        {
          title: "Project Name",
          key: "project_name",
          sortable: true,
        },
        {
          title: "Project Status",
          key: "project_progress",
          sortable: true,
        },
        {
          title: "Created By",
          key: "project_created_by",
          sortable: true,
        },
        {
          title: "Start Date",
          key: "project_start_date",
          sortable: true,
        },
        {
          title: "End Date",
          key: "project_end_date",
          sortable: true,
        },
        {
          title: "Members",
          key: "project_visible_members",
          sortable: true,
        },
        {
          title: "Customer",
          key: "customer_name",
          sortable: true,
        },
        {
          title: "Role",
          key: "project_role",
          sortable: true,
        },
        {
          title: "Actions",
          key: "actions",
          sortable: true,
        },
      ],
      componentCheck: 0,
      projectCreationDialog: false,
      projectDeletionDialogue: false,
      rowInfo: {},
      hoveredIndex: -1,
      projectStatusUpdateDialog: false,
      allUSersNames: [],
      projectMemberDialog: false,
      tranferOwnerDialog: false,
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      tableHeaders: [
        {
          title: "Project ID",
          key: "project_display_id",
          sortable: false,
        },
        {
          title: "Project Name",
          key: "project_name",
          sortable: true,
        },
        {
          title: "Project Status",
          key: "project_progress",
          sortable: true,
        },
        {
          title: "Created By",
          key: "project_created_by",
          sortable: true,
        },
        {
          title: "Start Date",
          key: "project_start_date",
          sortable: true,
        },
        {
          title: "End Date",
          key: "project_end_date",
          sortable: true,
        },
        {
          title: "Members",
          key: "project_visible_members",
          sortable: true,
        },
        {
          title: "Role",
          key: "project_role",
          sortable: true,
        },
        {
          title: "Customer",
          key: "customer_name",
          sortable: true,
        },
        {
          title: "Actions",
          key: "actions",
          sortable: true,
        },
      ],
      windowHeight: 0,
      tableHeight: 0,

      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },
    };
  },
  async created() {
    this.$store.commit("Setnamesearch", "");
    this.windowHeight = window.innerHeight - 110;
    this.tableHeight = window.innerHeight - 230;
    this.componentCheck = 0;
    this.overlay = true;
    await this.fetch_project_list();
    await this.get_global_customers();
    console.log(this.masterCustomers, "masterCustomers");
    await this.get_all_org_users();
    this.fetch_user_list();

    this.allUSersNames = this.orgUsers;
  },

  computed: {
    filteredItems() {
      if (!this.searchQuery || this.searchQuery.trim() === "") {
        return this.tableData;
      }
      const searchTerm = this.searchQuery.toLowerCase().trim();
      return this.tableData.filter(
        (project) =>
          project.project_name?.toLowerCase().includes(searchTerm) ||
          this.fetch_name(project.project_created_by)
            ?.toLowerCase()
            .includes(searchTerm) ||
          project.project_progress?.toLowerCase().includes(searchTerm) ||
          (project.project_completion_percentage
            ? String(project.project_completion_percentage)
                .toLowerCase()
                .includes(searchTerm)
            : false)
      );
    },
    totalItems() {
      return this.filteredItems.length;
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    projectStatusTrack() {
      this.currentPage = 1;
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".dtwidth");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },

  methods: {
    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
    userRole(item) {
      let useremail = item.project_visible_members.find(
        (user) =>
          user.email == this.$store.getters.GetUserObj.user.user_email_id
      );

      return useremail.role;
    },
    update_owner(item) {
      this.componentCheck = 4;
      this.tranferOwnerDialog = true;
      this.rowInfo = item;
    },
    async filterProjects(status) {
      this.overlay = true;
      try {
        this.projectStatusTrack = status;
        await this.fetch_project_list();
      } catch (error) {
        console.error("Error filtering projects:", error);
      } finally {
        this.overlay = false;
      }
    },

    getProgressColor(progress) {
      const colors = {
        LIVE: "blue",
        COMPLETED: "green",
        SUSPENDED: "red",
        ACTIVE: "purple",
      };
      return colors[progress] || "grey lighten-2";
    },
    getRandomLightColor() {
      const r = Math.floor(Math.random() * 56) + 200;
      const g = Math.floor(Math.random() * 56) + 200;
      const b = Math.floor(Math.random() * 56) + 200;
      return `rgb(${r}, ${g}, ${b})`;
    },
    get_updatedate(date) {
      return formatdisplayDate(date);
    },

    setHoveredIndex(index) {
      this.hoveredIndex = index;
    },

    clearHoveredIndex() {
      this.hoveredIndex = -1;
    },

    add_memeber(value) {
      this.rowInfo = value;
      this.componentCheck = 3;
    },

    create_project() {
      this.componentCheck = 1;
      this.projectCreationDialog = true;
    },
    handleClick2(click, val) {
      this.$router.push("/home/ProjectDetails");
      localStorage.setItem("projectInfo", JSON.stringify(val.item));
    },
    handleClick(item) {
      this.$router.push("/home/ProjectDetails");
      localStorage.setItem("projectInfo", JSON.stringify(item));
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
            this.userProfiles[email] = profilePicUrl;
          } else {
            const initials = this.getInitials(name);
            this.userProfiles[email] = initials;
          }
        }
      });
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
    getInitials(name) {
      if (typeof name !== "string" || name.trim() === "") {
        return "N/A";
      }
      const initials = name.charAt(0).toUpperCase();
      return initials || "N/A";
    },

    getInitials_ext(name) {
      if (name && name.length > 0) {
        return name.charAt(0).toUpperCase();
      }
      return "";
    },

    delete_project(item) {
      this.componentCheck = 2;
      this.projectDeletionDialogue = true;
      this.rowInfo = item;
    },

    update_project_status(item) {
      this.componentCheck = 2;
      this.projectStatusUpdateDialog = true;
      this.rowInfo = item;
    },

    success_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.projectStatusUpdate = false;
      this.projectStatusUpdateDialog = false;
      this.projectCreationDialog = false;
      this.tranferOwnerDialog = false;
      this.fetch_project_list();
    },

    success_data(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.fetch_project_list();
      // console.log()
    },

    error_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    close_dialog() {
      this.componentCheck = 0;
    },

    async fetch_project_list() {
      this.tableLoading = true;
      try {
        let input = {};
        if (this.projectStatusTrack !== "ALL") {
          input.project_progress = this.projectStatusTrack;
        }

        let result = await API.graphql(
          graphqlOperation(list_all_user_projects, { input })
        );
        this.overlay = false;
        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.list_all_user_projects);
        if (response.Status == "ERROR") {
          this.overlay = false;
          this.tableLoading = false;
          this.tableData = [];
        } else {
          this.overlay = false;
          this.tableLoading = false;
          this.tableData = response.data;
          // console.log(this.tableData);
        }
      } catch (error) {
        this.overlay = false;
        this.tableLoading = false;
      }
    },

    View_projectMember(item) {
      this.projectMemberDialog = true;
      this.rowInfo = item;
      this.componentCheck = 3;
    },
  },
};
</script>

<style scoped>
.card-container {
  position: relative;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-field {
  max-width: 320px;
}

.filter-select {
  max-width: 250px;
}

/* Header field styling for app bar */
.header-actions :deep(.v-field) {
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.header-actions :deep(.v-field__input) {
  color: #333 !important;
  font-size: 14px !important;
}

.header-actions :deep(.v-field__label) {
  color: #666 !important;
  font-size: 12px !important;
}

.header-actions :deep(.v-field__prepend-inner) {
  color: #666 !important;
}

.header-actions :deep(.v-field__append-inner) {
  color: #666 !important;
}

.header-actions :deep(.v-field__outline) {
  color: #e0e0e0 !important;
}

.header-actions :deep(.v-field--focused .v-field__outline) {
  color: #db4c77 !important;
}

.header-actions :deep(.v-text-field input::placeholder) {
  color: #999 !important;
}

.header-actions :deep(.v-select__selection) {
  color: #333 !important;
  font-size: 14px !important;
}

/* Ensure fields are visible */
.header-actions .v-text-field,
.header-actions .v-select {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}

.modern-data-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 32px;
}

.avatar-wrapper {
  position: absolute;
  z-index: 2;
  transition: transform 0.2s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.1);
  z-index: 20;
}

.project-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.project-card-hover {
  cursor: pointer;
}

.name-tooltip-trigger {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

.scale-up {
  animation: scaleUp 0.4s ease-in-out;
}

.bounce {
  animation: bounce 1s ease-in-out;
  position: absolute;
  z-index: 3;
}

.name-list-tooltip {
  position: absolute;
  top: 40px;
  background-color: #333;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  max-width: 150px;
  z-index: 10;
  display: block;
}

.name-list-tooltip div {
  padding: 5px;
  cursor: pointer;
  font-size: 12px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.name-list-tooltip div:hover {
  background-color: #444;
}

.avatar-wrapper:hover .name-list-tooltip {
  display: block;
}

.plus-count {
  color: #ff4081;
  font-weight: bold;
}

.center-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh;
  width: 100%;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .project-card {
    min-height: 360px;
  }
}

@media (max-width: 600px) {
  .project-card {
    min-height: 340px;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes scaleUp {
  0% {
    transform: scale(0.5);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* Action Button Styles */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

/* Responsive Design for Action Buttons */
@media (max-width: 768px) {
  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
}

/* Avatar Image Styling */
.avatar-member {
  overflow: hidden;
}

.avatar-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
  border-radius: 50% !important;
}

/* Ensure avatars maintain circular shape */
.avatar-member :deep(.v-avatar__image) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
}
</style>
