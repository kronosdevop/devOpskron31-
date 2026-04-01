<template>
  <v-dialog
    :model-value="dialog"
    @update:model-value="$emit('update:dialog', $event)"
    max-width="500px"
    persistent
  >
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <div class="d-flex align-center">
          <v-icon left color="primary" class="mr-2">mdi-handshake</v-icon>
          <span class="font-weight-bold text-h5">Confirm Lead Movement</span>
        </div>
        <v-btn icon variant="text" @click="cancel" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-6 py-5">
        <div class="mb-4">
          <p class="text-body-1 mb-2">
            Move <strong>{{ leadName }}</strong> from
            <strong>{{ fromStageName }}</strong> to
            <strong>{{ toStageName }}</strong
            >?
          </p>
        </div>
        <v-text-field
          v-model="formattedDeadline"
          label="Set Deadline (Optional)"
          type="date"
          variant="outlined"
          density="compact"
          :min="today"
          prepend-inner-icon="mdi-calendar"
          hint="Leave empty if no deadline required"
          persistent-hint
        ></v-text-field>

        <v-textarea
          v-model="notes"
          label="Notes (Optional)"
          placeholder="Add any notes about this stage movement..."
          variant="outlined"
          density="compact"
          rows="2"
          counter="200"
        ></v-textarea>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn text @click="cancel">Cancel</v-btn>
        <v-btn color="primary" class="ml-2" :loading="loading" @click="confirm">
          <v-icon left>mdi-check</v-icon>
          Confirm Move
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { edit_crm_lead_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  name: "DragConfirmDialog",
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    leadName: {
      type: String,
      default: "",
    },
    fromStageName: {
      type: String,
      default: "",
    },
    toStageName: {
      type: String,
      default: "",
    },
    leadData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loading: false,
      notes: "",
    };
  },
  computed: {
    today() {
      return new Date().toISOString().split("T")[0];
    },
    formattedDeadline: {
      get() {
        if (this.leadData.deadline) {
          let date;
          if (typeof this.leadData.deadline === "number") {
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
      },
    },
  },
  methods: {
    async confirm() {
      this.loading = true;
      try {
          // Prepare the input for the mutation
          const input = {
            stage_name: this.toStageName,
            lead_id: this.leadData.lead_id,
            lead_dead_line: this.leadData.deadline,
            comments: this.notes,
          };

        // Call the API
        const result = await API.graphql(
          graphqlOperation(edit_crm_lead_details, { input })
        );
        const response = JSON.parse(result.data.edit_crm_lead_details);

        if (response.Status === "SUCCESS") {
          // Emit success message
          this.$emit(
            "successMsg",
            `Lead moved successfully${
              this.leadData.deadline
                ? ` with deadline ${this.leadData.deadline}`
                : ""
            }!`
          );
          this.$emit("confirm", {
            deadline: this.leadData.deadline || null,
            notes: this.notes || null,
          });
          this.resetForm();
        } else {
          this.$emit(
            "errorMsg",
            response.message || "Failed to update lead details."
          );
        }
      } catch (error) {
        console.error("Error updating lead:", error);
        this.$emit("errorMsg", "Failed to move lead. Please try again.");
      } finally {
        this.loading = false;
      }
    },
    cancel() {
      this.$emit("errorMsg", "Lead movement cancelled.");
      this.$emit("cancel");
      this.resetForm();
    },
    resetForm() {
      this.notes = "";
    },
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.resetForm();
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
