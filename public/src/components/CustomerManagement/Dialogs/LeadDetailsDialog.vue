<template>
  <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" max-width="700px" persistent>
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <div class="d-flex align-center">
          <v-icon left color="primary" class="mr-2">mdi-pencil</v-icon>
          <span class="font-weight-bold text-h5">Edit Lead</span>
        </div>
        <v-btn icon variant="text" @click="close" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="px-6 py-5">
          <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="leadData.name"
              label="Lead Name"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-account"
              :rules="[(v) => !!v || 'Lead name is required']"
              counter="50"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="leadData.email"
              label="Email"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-email"
              type="email"
              :rules="[
                (v) => !v || /.+@.+\..+/.test(v) || 'Email must be valid',
              ]"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="leadData.phone"
              label="Phone"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-phone"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="leadData.stage_id"
              :items="stageOptions"
              label="Select Stage"
              item-title="stage_name"
              item-value="stage_id"
              variant="outlined"
              density="compact"
              :rules="[(v) => v !== null || 'Please select a stage']"
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="leadData.details"
              label="Details"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-text"
              rows="3"
              counter="200"
            ></v-textarea>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formattedDeadline"
              label="Deadline"
              type="date"
              variant="outlined"
              density="compact"
              :min="today"
              prepend-inner-icon="mdi-calendar"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn text @click="cancelEdit">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :loading="loading"
          @click="saveChanges"
          :disabled="!isValidLead"
        >
          <v-icon left>mdi-check</v-icon>
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { edit_crm_lead_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { list_pipeline_stages } from "@/graphql/queries.js";

export default {
  name: "LeadDetailsDialog",
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    leadData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      stageOptions: [],
    };
  },
  computed: {
    isValidLead() {
      return (
        this.leadData.name && this.leadData.name.trim() !== "" && 
        this.leadData.stage_id !== null
      );
    },
    today() {
      return new Date().toISOString().split("T")[0];
    },
    formattedDeadline: {
      get() {
        if (this.leadData.deadline) {
          let date;
          if (typeof this.leadData.deadline === 'number') {
            date = new Date(this.leadData.deadline * 1000);
          } else {
            date = new Date(this.leadData.deadline);
          }
          return date.toISOString().split("T")[0];
        }
        return "";
      },
      set(value) {
        if (value) {
          this.leadData.deadline = new Date(value).getTime() / 1000;
        } else {
          this.leadData.deadline = null;
        }
      }
    },
  },
  methods: {
    async fetch_pipeline_stages() {
      try {
        let result = await API.graphql(
          graphqlOperation(list_pipeline_stages, {})
        );
        let response = JSON.parse(result.data.list_pipeline_stages);
        if (response.Status == "SUCCESS") {
          this.stageOptions = response.data;
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", "Failed to fetch pipeline stages");
      }
    },
    async saveChanges() {
      if (this.isValidLead) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(edit_crm_lead_details, {
              input: {
                lead_id: this.leadData.lead_id,
                stage_name: this.stageOptions.find(stage => stage.stage_id === this.leadData.stage_id).stage_name,
                lead_name: this.leadData.name,
                lead_email: this.leadData.email,
                lead_phone_no: this.leadData.phone,
                lead_details: this.leadData.details,
                lead_dead_line: this.leadData.deadline,
              },
            })
          );
          let response = JSON.parse(result.data.edit_crm_lead_details);
          if (response.Status == "SUCCESS") {
            this.$emit(
              "successMsg",
              `Lead "${this.leadData.name}" updated successfully!`
            );
            this.$emit("close");
          } else {
            this.$emit("errorMsg", "Failed to update lead. Please try again.");
          }
        } catch (error) {
          this.$emit("errorMsg", "Failed to update lead. Please try again.");
        } finally {
          this.loading = false;
        }
      } else {
        this.$emit("errorMsg", "Please fill in all required fields.");
      }
    },
    cancelEdit() {
      this.$emit("close");
    },
    close() {
      this.$emit("close");
    },
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.fetch_pipeline_stages();
      }
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
}
.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.v-btn[variant="text"] {
  color: #888;
}
</style>
