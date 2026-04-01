<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <!-- Loading State -->
    <v-overlay :model-value="loading" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
      <div class="text-h6 mt-4 text-white">Loading leads...</div>
    </v-overlay>

    <v-card flat class="overflow-y-auto" :height="windowHeight">
      <v-card-text>
        <!-- Action Bar -->
        <v-row class="mb-6" v-if="stages.length > 0">
          <v-col cols="12" class="d-flex justify-space-between align-center">
            <div class="pipeline-stats">
              <v-chip color="success" class="mr-3">
                <v-icon left small>mdi-account-multiple</v-icon>
                {{ totalLeads }} Total Leads
              </v-chip>
              <!-- <v-chip color="info" class="mr-3">
                <v-icon left small>mdi-trending-up</v-icon>
                {{ activeStages }} Active Stages
              </v-chip> -->
            </div>
            <div class="action-buttons">
              <v-btn-toggle
                v-model="viewMode"
                mandatory
                class="view-toggle mr-3"
                dense
              >
                <v-btn value="card" small>
                  <v-icon>mdi-view-grid</v-icon>
                </v-btn>
                <v-btn value="table" small>
                  <v-icon>mdi-table</v-icon>
                </v-btn>
              </v-btn-toggle>
              <v-btn
                color="primary"
                @click="openAddLeadDialog"
                class="add-lead-btn"
                elevation="0"
                large
              >
                <v-icon left>mdi-account-plus</v-icon>
                Add Lead
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Pipeline Stages -->
        <div class="pipeline-stages-container">
          <!-- No Stages State -->
          <div v-if="stages.length === 0" class="no-stages-container">
            <v-card class="no-stages-card" elevation="3">
              <v-card-text class="no-stages-content">
                <v-icon size="80" color="grey lighten-1" class="mb-4">
                  mdi-pipeline-outline
                </v-icon>
                <h3 class="no-stages-title">No Pipeline Stages</h3>
                <p class="no-stages-description">
                  There are currently no pipeline stages configured. 
                  Contact your administrator to set up the sales pipeline.
                </p>
             
              </v-card-text>
            </v-card>
          </div>

          <!-- Card View -->
          <div v-else-if="viewMode === 'card'" class="pipeline-stages-wrapper">
            <div
              v-for="(stage, index) in stages"
              :key="index"
              class="pipeline-stage"
            >
              <v-card
                class="pipeline-card"
                :class="{ 'drag-over': dragOverStage === index }"
                :data-stage="index"
                @dragover="allowDrop($event, index)"
                @dragleave="onDragLeave"
                @drop="drop($event, index)"
                elevation="3"
              >
                <!-- Stage Header -->
                <v-card-title class="stage-header">
                  <div class="stage-title">
                    <v-icon :color="getStageColor(index)" class="mr-2">
                      {{ getStageIcon(index) }}
                    </v-icon>
                    {{ stage.name }}
                    <v-chip
                      :color="getStageColor(index)"
                      text-color="white"
                      small
                      class="stage-count ml-2 mt-1"
                    >
                      {{ stage.leads.length }}
                    </v-chip>
                  </div>
                </v-card-title>

                <!-- Stage Content -->
                <v-card-text class="stage-content">
                  <!-- Leads List -->
                  <div class="leads-container">
                    <div
                      v-for="(lead, i) in stage.leads"
                      :key="i"
                      :draggable="stage.name !== 'Closed'"
                      @dragstart="dragStart($event, lead, index)"
                      @dragend="onLeadDragEnd"
                      @click="openLeadDetails(lead)"
                      class="lead-card"
                      :class="{ 
                        'lead-dragging': draggedLead === lead,
                        'lead-non-draggable': stage.name === 'Closed'
                      }"
                    >
                      <div class="lead-header">
                        <v-avatar size="20" color="primary" class="mr-2">
                          <span
                            class="white--text font-weight-bold"
                            style="font-size: 0.7rem"
                          >
                            {{ lead.name.charAt(0) }}
                          </span>
                        </v-avatar>
                        <div class="lead-info">
                          <div class="lead-name">{{ lead.name }}</div>
                          <div class="lead-details">{{ lead.products_name && lead.products_name.length > 0 ? lead.products_name.join(", ") : lead.details }}</div>
                        </div>
                        <v-btn
                          icon
                          x-small
                          @click.stop="openLeadDetails(lead)"
                          class="lead-actions"
                          :color="isDeadlineCurrent(lead) ? 'red lighten-1' : 'grey lighten-1'"
                          size="16"
                        >
                          <v-icon size="12" :color="isDeadlineCurrent(lead) ? 'red darken-1' : 'grey darken-1'"
                            >mdi-eye-outline</v-icon
                          >
                        </v-btn>
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="stage.leads.length === 0" class="empty-stage">
                      <v-icon size="48" color="grey lighten-1"
                        >mdi-inbox-outline</v-icon
                      >
                      <p class="empty-text">No leads in this stage</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Table View -->
          <div v-else class="table-view-container">
            <v-card flat class="overflow-y-auto ">
              <div class="card-container" style="position: relative">
                <v-card class="" flat>
                  <v-card-text>
                    <v-data-table
                      :headers="tableHeaders"
                      :items="paginatedLeads"
                      :loading="loading"
                      :fixed-header="true"
                      :height="tableHeight"
                      hide-default-footer
                      density="comfortable"
                      class="modern-data-table"
                      hover
                      multi-sort
                      @update:sort-by="handleSortChange"
                    >
                      <template v-slot:no-data>
                        <div class="text-center py-8">
                          <v-icon size="64" color="grey lighten-1" class="mb-4"
                            >mdi-account-multiple-outline</v-icon
                          >
                          <div class="text-h6 grey--text mb-2">No Leads Found</div>
                          <div class="text-body-2 grey--text">
                            No leads available at the moment.
                          </div>
                        </div>
                      </template>

                      <template v-slot:loading>
                        <div class="text-center py-8">
                          <v-progress-circular
                            indeterminate
                            color="primary"
                            size="32"
                            class="mb-4"
                          ></v-progress-circular>
                          <div class="text-body-2 grey--text">Loading leads...</div>
                        </div>
                      </template>

                      <!-- Lead Name -->
                      <template v-slot:[`item.name`]="{ item }">
                        <div class="d-flex align-center">
                          <v-avatar size="32" color="primary" class="mr-3">
                            <span class="white--text font-weight-bold">
                              {{ item.name.charAt(0) }}
                            </span>
                          </v-avatar>
                          <div>
                            <div class="font-weight-medium text-body-2">
                              {{ item.name }}
                            </div>
                            <div class="caption text-grey">
                              {{ item.products_name && item.products_name.length > 0 ? item.products_name.join(", ") : item.details }}
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Stage -->
                      <template v-slot:[`item.stage`]="{ item }">
                        <div class="d-flex align-center">
                          <v-icon
                            size="16"
                            class="mr-2"
                            :color="getStageColor(item.stageIndex)"
                          >
                            {{ getStageIcon(item.stageIndex) }}
                          </v-icon>
                          <v-chip
                            :color="getStageColor(item.stageIndex)"
                            text-color="white"
                            small
                          >
                            {{ item.stage }}
                          </v-chip>
                        </div>
                      </template>

                      <!-- Contact -->
                      <template v-slot:[`item.contact`]="{ item }">
                        <div class="d-flex align-center">
                          <v-icon size="16" color="grey" class="mr-2">mdi-email</v-icon>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                              <div
                                v-if="item.email"
                                class="caption text-truncate"
                                style="max-width: 200px"
                                v-on="on"
                              >
                                {{ item.email }}
                              </div>
                              <div v-else class="caption">-</div>
                            </template>
                            <div class="textWrap" style="max-width: 250px">
                              {{ item.email }}
                            </div>
                          </v-tooltip>
                        </div>
                      </template>

                      <!-- Phone -->
                      <template v-slot:[`item.phone`]="{ item }">
                        <div class="d-flex align-center">
                          <v-icon size="16" color="grey" class="mr-2">mdi-phone</v-icon>
                          <span class="caption">{{ item.phone || '-' }}</span>
                        </div>
                      </template>

                      <!-- Deadline -->
                      <template v-slot:[`item.deadline`]="{ item }">
                        <div class="d-flex align-center">
                          <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
                          <span class="caption">{{
                            item.deadline ? formatDate(item.deadline) : 'No deadline'
                          }}</span>
                        </div>
                      </template>

                      <!-- Actions -->
                      <template v-slot:[`item.actions`]="{ item }">
                        <div class="d-flex align-center">
                          <v-btn
                            size="x-small"
                            color="primary"
                            class="white--text"
                            @click="openLeadDetails(item)"
                          >
                            <v-icon size="14" class="mr-1">mdi-eye</v-icon>
                            View
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>

                    <!-- Modern Table Footer -->
                    <div class="table-footer">
                      <div class="footer-info">
                        {{
                          totalLeads === 0
                            ? "No Results"
                            : `Showing ${paginatedLeads.length} of ${totalLeads} leads`
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
                            :class="page === currentPage ? 'active-page' : 'inactive-page'"
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
              </div>
            </v-card>
          </div>
        </div>

        <!-- Dialog Components -->
        <AddLeadDialog
          :dialog="addLeadDialog"
          @update:dialog="addLeadDialog = $event"
          @cancel="cancelAddLead"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
        />

        <LeadDetailsDialog
          :dialog="leadDetailsDialog"
          :lead-data="selectedLead"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
          @update:dialog="leadDetailsDialog = $event"
          @close="closeLeadDetails"
         
        />

        <DragConfirmDialog
          :dialog="dragConfirmDialog"
          :lead-name="draggedLead?.name || ''"
          :from-stage-name="getStageName(draggedFromStage)"
          :to-stage-name="getStageName(targetStageIndex)"
          :lead-data="draggedLead || {}"
          @update:dialog="dragConfirmDialog = $event"
          @confirm="handleDragConfirm"
          @cancel="cancelDragDrop"
          v-on:errorMsg="error_info"
          v-on:successMsg="success_info"
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { list_crm_leads } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import AddLeadDialog from "./Dialogs/AddLeadDialog.vue";
import LeadDetailsDialog from "./Dialogs/LeadDetailsDialog.vue";
import DragConfirmDialog from "./Dialogs/DragConfirmDialog.vue";

export default {
  name: "PipelineCRM",
  components: {
    SnackBar,
    AddLeadDialog,
    LeadDetailsDialog,
    DragConfirmDialog,
  },
  props: {
    leadData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      stages: [],
      loading: false,
      viewMode: 'card', // 'card' or 'table'
      search: '',
      // Dialog states
      addLeadDialog: false,
      leadDetailsDialog: false,
      dragConfirmDialog: false,

      // Lead data
      selectedLead: {},
      draggedLead: null,
      draggedFromStage: null,
      dragOverStage: null,
      windowHeight: window.innerHeight - 170,
      tableHeight: window.innerHeight - 400,

      // Drag drop data
      targetStageIndex: null,
      originalStageIndex: null,
      originalLeadData: null,

      // Table headers
      tableHeaders: [
        { title: 'Lead Name', key: 'name', sortable: false },
        { title: 'Stage', key: 'stage', sortable: false },
        { title: 'Email', key: 'contact', sortable: false },
        { title: 'Phone', key: 'phone', sortable: false },
        { title: 'Deadline', key: 'deadline', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false }
      ],
      // Pagination
      currentPage: 1,
      itemsPerPage: 20,

      // SnackBar Component
      SnackBarComponent: {},
    };
  },
  computed: {
    totalLeads() {
      return this.stages.reduce(
        (total, stage) => total + stage.leads.length,
        0
      );
    },
    activeStages() {
      return this.stages.filter((stage) => stage.leads.length > 0).length;
    },
    allLeads() {
      const leads = [];
      this.stages.forEach((stage, stageIndex) => {
        stage.leads.forEach(lead => {
          leads.push({
            ...lead,
            stage: stage.name,
            stageIndex: stageIndex
          });
        });
      });
      return leads;
    },
    pageCount() {
      return Math.ceil(this.totalLeads / this.itemsPerPage);
    },
    paginatedLeads() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.allLeads.slice(start, end);
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
  async mounted() {
    await this.fetch_crm_leads();
  },
  methods: {
    async fetch_crm_leads() {
      this.loading = true;
      try {
        let result = await API.graphql(graphqlOperation(list_crm_leads, {}));
        let response = JSON.parse(result.data.list_crm_leads);
        if (response.Status == "SUCCESS") {
          // console.log("response", response.data);
          this.processApiResponse(response.data);
        } else {
          // console.log("response", response);
          this.error_info("Failed to fetch leads data");
        }
      } catch (error) {
        console.log("error", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      } finally {
        this.loading = false;
      }
    },
    processApiResponse(apiData) {
      // Convert API response to stages format
      this.stages = Object.keys(apiData).map((stageName) => {
        const leads = apiData[stageName] || [];
        return {
          name: stageName,
          leads: leads.map((lead) => ({
            lead_id: lead.lead_id,
            name: lead.lead_name,
            details: lead.lead_details,
            email: lead.lead_email,
            phone: lead.lead_phone_no,
            deadline: lead.lead_dead_line,
            lead_type: lead.lead_type,
            products: lead.products,
            lead_status: lead.lead_status,
            stage_id: lead.stage_id,
            pipeline_id: lead.pipeline_id,
            organization_id: lead.organization_id,
            created_on: lead.created_on,
            stage_leads_count: lead.stage_leads_count,
            stage_name: lead.stage_name,
            products_name: lead.products_name,
          })),
        };
      });
      console.log("stages", this.stages);
    },
    dragStart(event, lead, stageIndex) {
      // Prevent dragging from Closed stage
      if (this.stages[stageIndex] && this.stages[stageIndex].name === "Closed") {
        event.preventDefault();
        return false;
      }
      
      // Prevent stage dragging when dragging leads
      event.stopPropagation();
      this.draggedLead = lead;
      this.draggedFromStage = stageIndex;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text", event.target.id);
    },
    allowDrop(event, stageIndex) {
      event.preventDefault();
      event.stopPropagation();
      this.dragOverStage = stageIndex;
    },
    onDragLeave(event) {
      // Only clear if we're actually leaving the stage, not just moving to a child element
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.dragOverStage = null;
      }
    },
    drop(event, stageIndex) {
      event.preventDefault();
      event.stopPropagation();
      this.dragOverStage = null;

      if (this.draggedFromStage !== stageIndex && this.draggedLead) {
        // Store the movement details for confirmation
        this.targetStageIndex = stageIndex;
        this.originalStageIndex = this.draggedFromStage;
        this.originalLeadData = { ...this.draggedLead };

        // Temporarily move the lead for preview
        const originStage = this.stages[this.draggedFromStage];
        const draggedLeadIndex = originStage.leads.indexOf(this.draggedLead);

        if (draggedLeadIndex > -1) {
          // Remove from origin stage
          originStage.leads.splice(draggedLeadIndex, 1);
          // Add to new stage
          this.stages[stageIndex].leads.push(this.draggedLead);

          // Show confirmation dialog
          this.dragConfirmDialog = true;
          this.leadDeadline = "";
          this.movementNotes = "";
        }
      } else {
        // Reset drag state if no movement
        this.draggedLead = null;
        this.draggedFromStage = null;
      }
    },
    onLeadDragEnd() {
      // Only reset if confirmation dialog is not open
      if (!this.dragConfirmDialog) {
        this.resetDragDropState();
      }
    },
    openAddLeadDialog() {
      this.addLeadDialog = true;
    },
    cancelAddLead() {
      this.addLeadDialog = false;
      this.stages = [];
      this.fetch_crm_leads();
    },

    openLeadDetails(lead) {
      this.selectedLead = { ...lead };
      this.leadDetailsDialog = true;
    },
    closeLeadDetails() {
      this.leadDetailsDialog = false;
    },
    getStageColor(index) {
      const colors = [
        "blue",
        "orange",
        "purple",
        "green",
        "red",
        "indigo",
        "pink",
        "teal",
      ];
      return colors[index % colors.length];
    },
    getStageIcon(index) {
      const icons = [
        "mdi-account-plus",
        "mdi-phone",
        "mdi-handshake",
        "mdi-check-circle",
        "mdi-cog",
        "mdi-chart-line",
        "mdi-star",
        "mdi-trophy",
      ];
      return icons[index % icons.length];
    },
    isDeadlineCurrent(lead) {
      // console.log("lead", lead);
      // Check if lead has a deadline and if it's today
      if (!lead.deadline) return false;
      
      const today = new Date();
      const deadline = new Date(lead.deadline * 1000); // Convert from Unix timestamp
      
      // Reset time to compare only dates
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      
      return today.getTime() === deadline.getTime();
    },
    showNotification(message, type = "success") {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor:
          type === "error" ? "red" : type === "info" ? "blue" : "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
    },

    // Drag Drop Confirmation Methods
    getStageName(stageIndex) {
      if (stageIndex === null || stageIndex === undefined) return "";
      return this.stages[stageIndex]?.name || "";
    },

    handleDragConfirm(data) {
      if (this.draggedLead && this.targetStageIndex !== null) {
        // Update lead with deadline and notes
        this.draggedLead.deadline = data.deadline;
        this.draggedLead.movementNotes = data.notes;
        this.draggedLead.movedAt = new Date().toISOString();

        // Close dialog and reset
        this.dragConfirmDialog = false;
        this.resetDragDropState();
      }
    },

    cancelDragDrop() {
      // Revert the lead back to original stage
      if (
        this.draggedLead &&
        this.originalStageIndex !== null &&
        this.targetStageIndex !== null
      ) {
        // Remove from current stage
        const currentStage = this.stages[this.targetStageIndex];
        const leadIndex = currentStage.leads.indexOf(this.draggedLead);
        if (leadIndex > -1) {
          currentStage.leads.splice(leadIndex, 1);
        }

        // Add back to original stage
        this.stages[this.originalStageIndex].leads.push(this.draggedLead);
      }

      // Close dialog and reset
      this.dragConfirmDialog = false;
      this.resetDragDropState();
    },

    resetDragDropState() {
      this.draggedLead = null;
      this.draggedFromStage = null;
      this.dragOverStage = null;
      this.targetStageIndex = null;
      this.originalStageIndex = null;
      this.originalLeadData = null;
    },

    // Snackbar event handlers
    success_info(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 3000,
      };
      this.addLeadDialog = false;
      this.leadDetailsDialog = false;
      this.dragConfirmDialog = false;
      this.stages = [];
      this.fetch_crm_leads();
    },

    error_info(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: message,
        timeout: 4000,
      };
    },

    // Table view methods
    formatDate(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString();
    },

    filterLeads(value, search, item) {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.stage.toLowerCase().includes(searchLower) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.phone && item.phone.toLowerCase().includes(searchLower)) ||
        (item.details && item.details.toLowerCase().includes(searchLower))
      );
    },

    handleSortChange(headers) {
      // Implement sorting logic based on the headers
      // console.log("Sorting by:", headers);
    },
  },
};
</script>

<style scoped>
/* Main Container */
.pipeline-container {
  padding: 24px;
  background: white;
  position: relative;
}

/* Pipeline Stages Container */
.pipeline-stages-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 20px 0;
  margin: 0 -10px;
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
  scroll-behavior: smooth;
  position: relative;
  z-index: 1;
}

.pipeline-stages-container::-webkit-scrollbar {
  height: 10px;
}

.pipeline-stages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.pipeline-stages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pipeline-stages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.pipeline-stages-wrapper {
  display: flex;
  gap: 24px;
  min-width: max-content;
  padding: 0 10px;
}

.pipeline-stage {
  flex: 0 0 320px;
  min-width: 320px;
  max-width: 320px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.pipeline-stage:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Pipeline Cards */
.pipeline-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e0e0e0;
  background: white !important;
  min-height: 400px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pipeline-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 16px 16px 0 0;
}

.pipeline-card.drag-over {
  border: 2px dashed #2196f3;
  background: rgba(33, 150, 243, 0.05);
}

/* Stage Header */
.stage-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 12px 12px 0 0;
  margin: -16px -16px 0 -16px;
  position: relative;
  overflow: hidden;
}

.stage-header::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.stage-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.stage-count {
  font-weight: 700;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.25) !important;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 6px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-width: 28px;
  text-align: center;
}

/* Stage Content */
.stage-content {
  padding: 12px;
  height: calc(100% - 80px);
  background: white;
}

/* Leads Container */
.leads-container {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.leads-container::-webkit-scrollbar {
  width: 6px;
}

.leads-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.leads-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.leads-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Lead Cards */
.lead-card {
  background: white !important;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  border: 1px solid #e0e0e0;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.lead-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  background: white !important;
}

.lead-card.lead-dragging {
  opacity: 0.5;
}

.lead-card.lead-non-draggable {
  cursor: default;
  opacity: 0.7;
  background: #f5f5f5 !important;
  border: 1px solid #e0e0e0;
  position: relative;
}

.lead-card.lead-non-draggable:hover {
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  background: #f5f5f5 !important;
}

.lead-card.lead-non-draggable::after {
  content: "🔒";
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 10px;
  opacity: 0.6;
}

.lead-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.lead-info {
  flex: 1;
  margin-left: 6px;
}

.lead-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: #2c3e50;
  margin-bottom: 1px;
  line-height: 1.1;
}

.lead-details {
  font-size: 0.75rem;
  color: #6c757d;
  line-height: 1.2;
  font-weight: 400;
}

.lead-actions {
  opacity: 0.7;
  transition: opacity 0.2s ease;
  min-width: 16px !important;
  width: 16px !important;
  height: 16px !important;
}

.lead-actions:hover {
  opacity: 1;
}

/* No Stages State */
.no-stages-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.no-stages-card {
  max-width: 500px;
  width: 100%;
  border-radius: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.no-stages-content {
  text-align: center;
  padding: 60px 40px;
}

.no-stages-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 16px;
  line-height: 1.3;
}

.no-stages-description {
  font-size: 1rem;
  color: #6c757d;
  line-height: 1.5;
  margin-bottom: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Empty State */
.empty-stage {
  text-align: center;
  padding: 60px 20px;
  color: #8e9aaf;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
  margin: 20px 0;
}

.empty-text {
  margin-top: 16px;
  font-size: 1rem;
  font-weight: 600;
  color: #8e9aaf;
}

/* Table View Styles - Matching UserEvents.vue */
.table-view-container {
  width: 100%;
}

.font-weight-medium {
  font-weight: 500;
}

.card-container {
  position: relative;
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
  background-color: #DB4C77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}

.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}

.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

/* Stats Chips */
.pipeline-stats .v-chip {
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 20px;
  border-radius: 25px;
  background: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pipeline-stats .v-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Action Buttons Container */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* View Toggle */
.view-toggle {
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.view-toggle .v-btn {
  min-width: 40px !important;
  height: 36px !important;
  border-radius: 6px !important;
  margin: 2px !important;
}

.view-toggle .v-btn--active {
  background: #2196f3 !important;
  color: white !important;
}

.view-toggle .v-btn:not(.v-btn--active) {
  background: transparent !important;
  color: #666 !important;
}

.view-toggle .v-btn:not(.v-btn--active):hover {
  background: #f5f5f5 !important;
}

/* Add Lead Button */
.add-lead-btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  text-transform: none;
  background: #db4c77 !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  border: none !important;
  color: white !important;
  min-height: 40px;
}

.add-lead-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .pipeline-container {
    padding: 10px;
  }

  .pipeline-stage {
    flex: 0 0 280px;
    min-width: 280px;
    max-width: 280px;
  }

  .pipeline-card {
    min-height: 400px;
  }

  .stage-header {
    padding: 16px;
  }

  .stage-content {
    padding: 16px;
  }

  .lead-card {
    padding: 12px;
  }

  .no-stages-container {
    min-height: 300px;
    padding: 20px 10px;
  }

  .no-stages-content {
    padding: 40px 20px;
  }

  .no-stages-title {
    font-size: 1.25rem;
  }

  .no-stages-description {
    font-size: 0.9rem;
  }

  /* Table view responsive */
  .table-header {
    padding: 12px 16px;
    font-size: 1.1rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .view-toggle {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .pipeline-stage {
    flex: 0 0 260px;
    min-width: 260px;
    max-width: 260px;
  }

  .pipeline-stages-wrapper {
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .pipeline-stats {
    flex-direction: column;
    gap: 8px;
  }

  .pipeline-stats .v-chip {
    margin-right: 0 !important;
  }

  .no-stages-container {
    min-height: 250px;
    padding: 15px 5px;
  }

  .no-stages-content {
    padding: 30px 15px;
  }

  .no-stages-title {
    font-size: 1.1rem;
  }

  .no-stages-description {
    font-size: 0.85rem;
  }
}

/* Removed animations for simplicity */

/* Custom Scrollbar for Webkit */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
