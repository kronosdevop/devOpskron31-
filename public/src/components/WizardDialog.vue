<template>
  <v-stepper v-model="e6">
    <v-stepper-header>
      <v-stepper-step :complete="e6 > 1" step="1">
        Organization Details
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="e6 > 2" step="2">
        Configure Locations
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3"> Configure Group </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="4"> Configure Designations </v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
        <OrgDetails v-on:nextStep="emit_data" />
      </v-stepper-content>
      <v-stepper-content step="2">
        <MasterLocations />
        <v-card-actions class="justify-start">
          <v-btn color="primary" @click="e6 = 1"> Back </v-btn>
          <v-btn color="primary" @click="e6 = 3"> Continue </v-btn>
        </v-card-actions>
      </v-stepper-content>

      <v-stepper-content step="3">
        <MasterDepartments />
        <v-card-actions class="justify-start">
          <v-btn color="primary" @click="e6 = 2"> Back </v-btn>
          <v-btn color="primary" @click="e6 = 4"> Continue </v-btn>
        </v-card-actions>
      </v-stepper-content>

      <v-stepper-content step="4">
        <MasterDesignations />
        <v-card-actions class="justify-start">
          <v-btn color="primary" @click="e6 = 3"> Back </v-btn>
          <v-btn color="primary" @click="complete_vizard()"> Complete </v-btn>
        </v-card-actions>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>
<script>
import OrgDetails from "@/components/WizardComponents/OrgDetails.vue";
import MasterLocations from "@/components/SettingsComponents/MasterLocations.vue";
import MasterDepartments from "@/components/SettingsComponents/MasterDepartments.vue";
import MasterDesignations from "@/components/SettingsComponents/MasterDesignations.vue";
export default {
  components: {
    OrgDetails,
    MasterLocations,
    MasterDepartments,
    MasterDesignations,
  },
  data() {
    return {
      e6: 1,
    };
  },
  methods: {
    emit_data(val) {
      if (val == 1) {
        this.e6 = 2;
      }
    },
    complete_vizard() {
      this.$emit("completeSteps", 2);
    },
    get_action() {
      this.e6 = 2;
    },
  },
};
</script>