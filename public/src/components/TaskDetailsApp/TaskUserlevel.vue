<template>
  <div style="background-color: white">
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-format-list-checks</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Tasks</span>
          <span class="header-subtitle">Manage your tasks and assignments</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Search Field - Only show for My Tasks tab -->
        <div
          v-if="selectStatusType === 'ASSIGN_TO_ME'"
          class="search-container"
        >
          <v-text-field
            v-model="searchValue"
            placeholder="Search tasks, descriptions, assignees, status, dates..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
            clearable
            @update:model-value="handleSearchChange"
          />
        </div>

        <!-- Search Field - Only show for Assigned Tasks tab -->
        <div
          v-if="selectStatusType === 'ASSIGN_BY_ME'"
          class="search-container"
        >
          <v-text-field
            v-model="assignedByMeSearchValue"
            placeholder="Search tasks, descriptions, assignees, status, dates..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
            clearable
            @update:model-value="handleAssignedByMeSearchChange"
          />
        </div>

        <!-- Filter Button - Only show for My Tasks tab -->
        <v-btn
          v-if="selectStatusType === 'ASSIGN_TO_ME'"
          :class="
            activeFiltersCount > 0
              ? 'action-btn filter-btn active'
              : 'action-btn filter-btn'
          "
          @click="handleFilterClick"
        >
          <v-icon>mdi-filter-variant</v-icon>
          <span>Filter</span>
          <v-badge
            v-if="activeFiltersCount > 0"
            :content="activeFiltersCount"
            color="white"
            class="ml-2"
          />
        </v-btn>

        <!-- Filter Button - Only show for Assigned Tasks tab -->
        <v-btn
          v-if="selectStatusType === 'ASSIGN_BY_ME'"
          :class="
            assignedByMeActiveFiltersCount > 0
              ? 'action-btn filter-btn active'
              : 'action-btn filter-btn'
          "
          @click="handleAssignedByMeFilterClick"
        >
          <v-icon>mdi-filter-variant</v-icon>
          <span>Filter</span>
          <v-badge
            v-if="assignedByMeActiveFiltersCount > 0"
            :content="assignedByMeActiveFiltersCount"
            color="white"
            class="ml-2"
          />
        </v-btn>

        <v-btn class="action-btn add-btn" @click="assign_data()">
          <v-icon>mdi-plus</v-icon>
          <span>Assign Task</span>
        </v-btn>
        <v-btn class="action-btn back-btn" @click="back_call()">
          <v-icon>mdi-arrow-left</v-icon>
          <span>Back</span>
        </v-btn>
      </div>
    </v-app-bar>

    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs v-model="selectStatusType" mandatory class="modern-tab-toggle">
          <v-tab value="ASSIGN_TO_ME" class="tab-btn"> My Tasks </v-tab>
          <v-tab value="ASSIGN_BY_ME" class="tab-btn"> Assigned Tasks </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <div class="text-left" v-if="selectStatusType == 'ASSIGN_BY_ME'">
      <AssignedByMe
        :searchValue="assignedByMeSearchValue"
        :selectedStatusFilter="assignedByMeSelectedStatusFilter"
        v-on:active-filters-count="handleAssignedByMeActiveFiltersCount"
        v-on:search-changed="handleAssignedByMeSearchChange"
        v-on:filter-changed="handleAssignedByMeFilterChange"
        ref="assignedByMeRef"
      />
    </div>
    <div class="text-left" v-if="selectStatusType == 'ASSIGN_TO_ME'">
      <AssignedToMe
        :searchValue="searchValue"
        :selectedSourceFilter="selectedSourceFilter"
        v-on:active-filters-count="handleActiveFiltersCount"
        v-on:search-changed="handleSearchChange"
        v-on:filter-changed="handleFilterChange"
        v-on:total-task-count="handleTotalTaskCount"
        v-on:project-task-count="handleProjectTaskCount"
        v-on:internal-task-count="handleInternalTaskCount"
        v-on:checklist-task-count="handleChecklistTaskCount"
        ref="assignedToMeRef"
      />
    </div>

    <div v-if="componentcheck == 1">
      <AssignTask
        :assignPopup="assignPopup"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="assignPopup = false"
      />
    </div>
  </div>
</template>

<script>
/* eslint-disable */

//Imports
import SnackBar from "@/components/SnackBar.vue";
import AssignTask from "@/components/TaskDetailsApp/TaskPopups/AssignTask.vue";
import AssignedByMe from "@/components/TaskDetailsApp/AssignedByMe.vue";
import AssignedToMe from "@/components/TaskDetailsApp/AssignedToMe.vue";

export default {
  // Components
  components: {
    AssignTask,
    SnackBar,
    AssignedByMe,
    AssignedToMe,
  },

  // Data
  data() {
    return {
      // UI state properties
      selectStatusType: "ASSIGN_TO_ME",
      componentcheck: 0,
      assignPopup: false,
      componetKey: 0,
      windowHeight: 0,

      // Search and filter properties
      searchValue: "",
      selectedSourceFilter: "ALL",
      activeFiltersCount: 0,

      // Task count properties
      totalTaskCount: 0,
      checklistTaskCount: 0,
      projectTaskCount: 0,
      internalTaskCount: 0,

      // AssignedByMe properties
      assignedByMeSearchValue: "",
      assignedByMeSelectedStatusFilter: "ALL",
      assignedByMeActiveFiltersCount: 0,

      // Component data
      SnackBarComponent: {},
    };
  },

  // Lifecycle hooks
  created() {
    this.windowHeight = window.innerHeight - 100;
  },

  // Methods
  methods: {
    // Dialog management methods
    assign_data() {
      this.componentcheck = 1;
      this.assignPopup = true;
    },

    // Navigation methods
    back_call() {
      this.$router.push("/home/DashboardView");
    },

    // Search and filter methods
    handleSearchChange(value) {
      this.searchValue = value;
      this.activeFiltersCount = 0;
      this.selectedSourceFilter = "ALL";
    },

    handleFilterChange(value) {
      this.selectedSourceFilter = value;
      this.activeFiltersCount = 0;
      this.searchValue = "";
    },

    clearFilter() {
      this.selectedSourceFilter = "ALL";
      this.activeFiltersCount = 0;
      this.searchValue = "";
    },

    handleFilterClick() {
      if (this.$refs.assignedToMeRef) {
        this.$refs.assignedToMeRef.openFilterDrawer();
      }
    },

    // Event handler methods
    handleActiveFiltersCount(count) {
      this.activeFiltersCount = count;
    },

    handleTotalTaskCount(count) {
      this.totalTaskCount = count;
    },

    handleProjectTaskCount(count) {
      this.projectTaskCount = count;
    },

    handleInternalTaskCount(count) {
      this.internalTaskCount = count;
    },

    handleChecklistTaskCount(count) {
      this.checklistTaskCount = count;
    },

    // AssignedByMe methods
    handleAssignedByMeSearchChange(value) {
      this.assignedByMeSearchValue = value;
      this.assignedByMeActiveFiltersCount = 0;
      this.assignedByMeSelectedStatusFilter = "ALL";
    },

    handleAssignedByMeFilterChange(value) {
      this.assignedByMeSelectedStatusFilter = value;
      this.assignedByMeActiveFiltersCount = 0;
      this.assignedByMeSearchValue = "";
    },

    handleAssignedByMeActiveFiltersCount(count) {
      this.assignedByMeActiveFiltersCount = count;
    },

    handleAssignedByMeFilterClick() {
      if (this.$refs.assignedByMeRef) {
        this.$refs.assignedByMeRef.openFilterDrawer();
      }
    },

    // Utility methods
    getFilterLabel(value) {
      switch (value) {
        case "ALL":
          return "All Tasks";
        case "CHECKLIST":
          return "Checklist";
        case "PROJECT":
          return "Projects";
        case "INTERNAL":
          return "My Tasks";
        default:
          return "All Tasks";
      }
    },

    // Notification methods
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.componetKey += 1;
      this.assignPopup = false;
      this.selectStatusType = "ASSIGN_BY_ME";
    },
  },
};
</script>
<style scoped>
/* Main Container Styles */
div {
  background-color: white !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
}

/* Search Container Styles */
.search-container {
  margin-right: 16px;
  min-width: 250px;
}

.search-field {
  width: 100%;
}

/* Filter Button Styles */
.filter-btn {
  background: #e91e63 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(233, 30, 99, 0.3) !important;
  transition: all 0.3s ease !important;
}

.filter-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4) !important;
}

.filter-btn.active {
  background: #c2185b !important;
  box-shadow: 0 2px 8px rgba(194, 24, 91, 0.3) !important;
}

.filter-btn.active:hover {
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.4) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-container {
    min-width: 200px;
    margin-right: 8px;
  }
}
</style>
