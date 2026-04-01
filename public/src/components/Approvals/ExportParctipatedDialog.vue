<template>
  <v-dialog
    :model-value="ExportDialog"
    max-width="480"
    persistent
  >
    <v-card class="export-card" elevation="12" rounded="xl">

      <!-- HEADER -->
      <v-card-title class="export-header">
        <div class="header-left">
          <v-icon class="header-icon">
            mdi-file-export-outline
          </v-icon>

          <div>
            <div class="title-text">Export Data</div>
            <div class="subtitle-text">
              Select the required fields you want to export.
            </div>
          </div>
        </div>

        <v-btn
          icon
          variant="text"
          class="close-btn"
          :disabled="isAllSelected"
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- BODY -->
      <v-card-text class="pt-5">

        <v-row>
          <v-col cols="6">
            <v-select
              v-model="selectedStatus"
              label="Status"
              :items="statusItems"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-check-circle-outline"
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="selectedWorkflow"
              label="Workflow"
              :items="workflowItems"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-file-tree"
            />
          </v-col>
        </v-row>

        <!-- EXPORT FIELDS -->
        <v-select
          v-model="selectedFields"
          label="Select fields"
          :items="fields"
          item-title="title"
          item-value="value"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-format-list-bulleted"
          :closable-chips="!isAllSelected"
        />

      </v-card-text>

      <!-- FOOTER -->
      <v-card-actions class="export-actions">
        <v-btn
          class="download-btn"
          prepend-icon="mdi-download"
          :loading="loading"
          :disabled="isDisabled"
          @click="exportWorkflow"
        >
          Download
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { export_participant_workflows } from "@/graphql/mutations";
import axios from "axios";
import FileSaver from "file-saver";
import { get_workflows } from "@/mixins/GetWorkflowsummary.js";

export default {
  name: "ExportParticipatedDialog",

  mixins: [get_workflows],

  props: {
    ExportDialog: Boolean,
  },

  emits: ["close", "successMsg", "errorMsg"],

  data() {
    return {
      loading: false,

      selectedStatus: "ALL",
      selectedWorkflow: "ALL",

      // API values
      internalFields: [],

      // UI chips
      displayFields: [],

      isAllSelected: false,

      workflowItems: [],

      statusItems: [
        "ALL",
        "INPROGRESS",
        "COMPLETED",
        "REJECTED",
        "WITHDRAWN",
      ],

      fields: [
        { title: "ALL", value: "__all__" },

        { title: "Transaction ID / Workflow Name", value: "transaction_id" },
        { title: "Initiated By", value: "workflow_initiated_name" },
        { title: "Summary Field", value: "summary_field_1" },
        { title: "Last Acted By", value: "workflow_approval_name" },
        { title: "Pending On", value: "pending_on" },
        { title: "Initiated On / Acted On", value: "workflow_initiated_on" },
        { title: "Status", value: "approval_status" },
      ],
    };
  },

  async mounted() {
    await this.get_workflows();
    this.workflowItems = this.summaryOrgWorkflows.map(
      (w) => w.workflow_name
    );
  },

  computed: {
    selectedFields: {
      get() {
        return this.displayFields;
      },

      set(val) {
        // ALL selected
        if (val.includes("__all__")) {
          this.isAllSelected = true;

          // API → all fields
          this.internalFields = this.fields
            .filter(f => f.value !== "__all__")
            .map(f => f.value);

          // UI → only ALL chip
          this.displayFields = ["__all__"];
        }
        // manual selection
        else {
          this.isAllSelected = false;
          this.displayFields = val;
          this.internalFields = val;
        }
      },
    },

    isDisabled() {
      return (
        this.loading ||
        !this.selectedWorkflow ||
        !this.selectedStatus ||
        this.internalFields.length === 0
      );
    },
  },

  methods: {
    closeDialog() {
      this.resetForm();
      this.$emit("close");
    },

    resetForm() {
      this.selectedStatus = "";
      this.selectedWorkflow = "";
      this.internalFields = [];
      this.displayFields = [];
      this.isAllSelected = false;
    },

    async exportWorkflow() {
      if (this.isDisabled) return;

      try {
        this.loading = true;

        const user = this.$store.getters.GetUserObj;

        const result = await API.graphql(
          graphqlOperation(export_participant_workflows, {
            input: {
              user_email_id:
                user.organization.organization_created_by,
              workflow_name: this.selectedWorkflow,
              approval_status: this.selectedStatus,
              export_fields: this.internalFields,
            },
          })
        );

        const response = JSON.parse(
          result.data.export_participant_workflows
        );

        if (!response.URL) {
          throw new Error("No data found");
        }

        this.$emit("successMsg",response.message || "Export started");

        await this.downloadFile(response.URL, response.FileName);

      } catch (error) {
        this.$emit(
          "errorMsg",
          error.message || "Export failed"
        );
      } finally {
        this.loading = false;
      }
    },

    async downloadFile(url, apiFileName) {
      const teamId =
        this.$store.getters.GetUserObj?.organization
          ?.organization_team_id || "";

      const fileName = apiFileName
        ? `${teamId}_${apiFileName}`
        : `${teamId}_Export.xlsx`;

      const response = await axios.get(url, {
        responseType: "blob",
      });

      FileSaver.saveAs(new Blob([response.data]), fileName);
    },
  },
};
</script>


<style scoped>
.export-card {
  background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
  border: 1px solid #eef2f7;
}

.export-header {
  display: flex;
  justify-content: space-between;
  padding: 26px 28px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  gap: 14px;
}

.header-icon {
  font-size: 30px;
  color: #db4c77;
  background: #eef2ff;
  padding: 8px;
  border-radius: 12px;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
}

.subtitle-text {
  font-size: 13px;
  color: #6b7280;
}

.export-actions {
  padding: 18px 28px 26px;
  display: flex;
  justify-content: flex-end;
}

.download-btn {
  border-radius: 14px;
  height: 44px;
  padding: 0 26px;
  font-weight: 600;
  background: #db4c77;
  color: white;
}
</style>
