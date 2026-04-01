<template>
  <v-dialog
    :model-value="DialogExportAuditTrail"
    class="d-flex justify-center"
    max-width="480"
    persistent
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">Export Audit Logs</span>
        <v-btn icon elevation="0">
          <v-icon @click="DialogExportAuditTrailEmit(1)">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-row class="pa-5">
        <v-col cols="6" class="mt-n3">
          <v-menu v-model="startMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <div class="filter-label">From Date</div>
              <v-text-field
                :model-value="formatedStartDate"
                v-bind="props"
                width="200"
                prepend-inner-icon="mdi-calendar"
                density="compact"
                variant="outlined"
              />
            </template>
            <v-date-picker
              v-model="startDate"
              :max="new Date()"
              header-color="primary"
            />
          </v-menu>
        </v-col>
        <v-col cols="6" class="mt-n3">
          <v-menu v-model="endMenu" :close-on-content-click="false">
            <template #activator="{ props }">
              <div class="filter-label">To Date</div>
              <v-text-field
                :model-value="formatedEndDate"
                v-bind="props"
                width="200"
                prepend-inner-icon="mdi-calendar"
                density="compact"
                variant="outlined"
              />
            </template>
            <v-date-picker
              v-model="endDate"
              :min="startDate"
              :max="new Date()"
              header-color="primary"
            />
          </v-menu>
        </v-col>
        <v-col cols="6" class="mt-n5">
          <div class="filter-label">Filter By App</div>
          <v-select
            v-model="filtered_app"
            density="compact"
            max-width="250"
            :items="AppItems"
            item-text="title"
            item-value="value"
            variant="outlined"
            class="filter-select"
            hide-details
          />
        </v-col>
        <v-col cols="6" class="mt-n5">
          <div class="filter-label">Filter By Source</div>
          <v-select
            v-model="filtered_source"
            density="compact"
            max-width="250"
            :items="SourceItems"
            item-title="title"
            item-value="value"
            variant="outlined"
            class="filter-select"
            hide-details
          />
        </v-col>
      </v-row>
      <v-card-actions class="d-flex justify-center">
        <v-btn
          class="action-btn"
          max-width="250"
          @click="exportAuditTrail()"
          :disabled="isLoading"
          :style="
            isLoading
              ? 'opacity: 1; background-color: #DB4C77 !important; color: white !important;'
              : ''
          "
        >
          <template v-if="isLoading">
            <v-progress-circular
              indeterminate
              color="white"
              background-color="primary"
              size="24"
              class="mr-2"
            ></v-progress-circular>
            Exporting
          </template>
          <template v-else>
            <v-icon class="mr-2">mdi-download</v-icon>
            Export
          </template>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { export_audit_trail } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    DialogExportAuditTrail: Boolean,
    tableData: Array,
  },
  data: () => ({
    filtered_app: "ALL",
    filtered_source: "0",
    startMenu: false,
    endMenu: false,
    isLoading: false,
    startDate: new Date(),
    endDate: new Date(),
    AppItems: [
      { title: "All", value: "ALL" },
      { title: "Cabinet", value: "CABINET" },
      { title: "Channel", value: "CHANNEL" },
      { title: "Dashboard", value: "DASHBOARD" },
      { title: "Directory", value: "DIRECTORY" },
      { title: "Events", value: "EVENTS" },
      { title: "Expense", value: "EXPENSE" },
      { title: "Form", value: "FORM" },
      { title: "Presence", value: "PRESENCE" },
      { title: "Slot Booking", value: "SLOT_BOOKING" },
      { title: "Stichh", value: "STICHH" },
      { title: "Task", value: "TASK" },
      { title: "Ticket Management", value: "TICKET_MANAGEMENT" },
      { title: "Timesheet", value: "TIMESHEET" },
      { title: "Workflow", value: "WORKFLOW" },
    ],
    SourceItems: [
      { title: "All", value: "0" },
      { title: "Web", value: "1" },
      { title: "Phone", value: "2" },
    ],
  }),
  watch: {
    startDate(newStartDate) {
      if (newStartDate && this.endDate && newStartDate > this.endDate) {
        this.endDate = new Date(newStartDate);
      }
    },
  },
  computed: {
    formatedStartDate() {
      if (!this.startDate) return "";
      return this.ConvertStartDate(this.startDate);
    },
    formatedEndDate() {
      if (!this.endDate) return "";
      return this.ConvertEndDate(this.endDate);
    },
  },
  methods: {
    ConvertStartDate(startDate) {
      const date = new Date(startDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },
    ConvertEndDate(endDate) {
      const date = new Date(endDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },
    async exportAuditTrail() {
      this.isLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(export_audit_trail, {
            input: {
              limit: 100,
              organization_id:
                this.$store.getters.GetOrgDetails.organization.organization_id,
              audit_type: this.filtered_app,
              from_date: this.ConvertStartDate(this.startDate),
              to_date: this.ConvertEndDate(this.endDate),
              source: this.filtered_source,
            },
          })
        );
        let response = JSON.parse(result.data.export_audit_trail);
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          window.open(response.URL);
          this.DialogExportAuditTrailEmit(2);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        console.log("Error", error);
        const errorMessage =
          error.errors && error.errors[0]
            ? error.errors[0].message
            : "Failed to export audit trails. Please try again.";
        this.$emit("errorMsg", errorMessage);
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      this.filtered_app = "ALL";
      this.filtered_source = "0";
      this.startDate = new Date();
      this.endDate = new Date();
      this.startMenu = false;
      this.endMenu = false;
    },
    DialogExportAuditTrailEmit(Toggle) {
      this.resetForm();
      this.$emit("clicked", Toggle);
    },
  },
};
</script>

<style scoped>
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  min-height: 36px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
}

.add-btn {
  background: #db4c77 !important;
}

.add-btn:hover {
  background: #c2185b !important;
}

.navBar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.filter-select {
  width: 100%;
}

.date-picker {
  width: 100%;
}

.filter-label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  display: block;
}
</style>
