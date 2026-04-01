<template>
  <div>
    <v-card flat class="mt-n2" >
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <v-toolbar
        dense
        class="mt-4"
        flat
        
      >
        <v-btn-toggle
          @change="filter_data()"
          v-model="selectStatusType"
          color="grey"
          mandatory
        >
          <v-btn small class="black--text" text value="ASSIGN_BY_ME">
            Assigned by me
          </v-btn>
          <v-btn small class="black--text" text value="ASSIGN_TO_ME">
            Assigned to me
          </v-btn>
        </v-btn-toggle>

        <v-spacer />
        <v-btn
          v-if="selectStatusType == 'ASSIGN_BY_ME'"
          dark
          small
          @click="assign_data()"
          class="text-capitalize cardCss mr-2"
          >Assign Task</v-btn
        >
        <v-btn
          dark
          class="text-capitalize cardCss mr-2"
          small
          @click="back_call()"
        >
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      <div class="text-left" v-if="selectStatusType == 'ASSIGN_BY_ME'">
        <AssignedByMe />
      </div>
      <div class="text-left" v-if="selectStatusType == 'ASSIGN_TO_ME'">
        <AssignedToMe />
      </div>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */

// Imports
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
      selectStatusType: "ASSIGN_BY_ME",
    };
  },

  // Methods
  methods: {
    // This component currently has no methods
  },
};
</script>