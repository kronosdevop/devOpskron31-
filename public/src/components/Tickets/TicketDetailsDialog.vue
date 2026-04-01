<template>
  <div>
    <ImagePreviewDialog
      :DialogImagePreview="DialogImagePreview"
      :previewImage="previewImage"
      @clicked="DialogImagePreviewEmit"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-dialog :model-value="DialogTicketDetails" max-width="1200px">
      <v-card rounded="lg" class="d-flex flex-column" style="height: 100vh">
        <!-- Card Title -->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
          style="flex-shrink: 0"
        >
          Ticket Details - {{ ListAllTicketDetails.ticket_id }} (Due -
          {{ ConvertDueDate(ListAllTicketDetails.due_date) }})
          <v-btn
            icon
            variant="text"
            @click="DialogTicketDetailsEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Overlay -->
        <v-overlay
          v-model="loading"
          contain
          class="align-center justify-center text-center overlay"
        >
          <v-progress-circular indeterminate color="primary" size="64" />
          <div class="text-white mt-2">Loading...</div>
        </v-overlay>

        <!-- Form Fields, Images, and Comments -->
        <div class="flex-grow-1 overflow-y-auto" style="padding: 20px">
          <v-row class="pa-5" style="height: 100%" no-gutters>
            <!-- Form Fields -->
            <v-col cols="6">
              <!--Created by and on-->
              <v-row>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Created by</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllTicketDetails.created_by }}
                    </div>
                  </span>
                </v-col>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Created on</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ConvertCreatedAtDate(ListAllTicketDetails.created_at)
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Ticket ID and Distribution Method-->
              <v-row>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">ID</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllTicketDetails.ticket_id }}
                    </div>
                  </span>
                </v-col>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Distribution Method</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ListAllTicketDetails.distribution_method ===
                        "CLAIM_TICKET"
                          ? "Claim"
                          : ListAllTicketDetails.distribution_method ===
                            "ROUND_ROBIN"
                          ? "Round Robin"
                          : ListAllTicketDetails.distribution_method ===
                            "LOAD_SHARING"
                          ? "Load Sharing"
                          : "Moderator"
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Ticket Title and Description-->
              <v-row>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Title</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllTicketDetails.title }}
                    </div>
                  </span>
                </v-col>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Description</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllTicketDetails.description }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Ticket Category and Assigned On-->
              <v-row>
                <v-col
                  v-if="
                    ListAllTicketDetails?.assigned_to_email?.startsWith('POOL_')
                  "
                  cols="6"
                >
                  <span>
                    <div class="font-weight-bold mr-2">Assigned To</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllTicketDetails.category_name }}
                    </div>
                  </span>
                </v-col>

                <v-col v-else cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Assigned To</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllTicketDetails.assigned_to_name }} ({{
                        ListAllTicketDetails.assigned_to_email
                      }})
                    </div>
                  </span>
                </v-col>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Assigned On</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ConvertAssignedDate(ListAllTicketDetails.assigned_at)
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Assign Agent-->
              <v-row v-if="assigningAgent">
                <v-col cols="6" md="6">
                  <div class="font-weight-bold text-primary">Assign</div>
                  <v-select
                    v-model="agents"
                    :items="reassignAgents"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    class="mt-1 ml-n1 pa-1"
                    width="250"
                  />
                </v-col>
              </v-row>

              <!--Ticket Status and Claim Status-->
              <v-row>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Ticket Status</div>
                    <v-chip
                      :color="
                        ListAllTicketDetails.status === 'OPEN'
                          ? 'blue'
                          : ListAllTicketDetails.status === 'ONHOLD'
                          ? 'orange'
                          : ListAllTicketDetails.status === 'IN_PROGRESS'
                          ? 'primary'
                          : ListAllTicketDetails.status === 'RESOLVED'
                          ? '#607D8B'
                          : ListAllTicketDetails.status === 'CLOSED'
                          ? 'red'
                          : ListAllTicketDetails.status === 'REOPEN'
                          ? '#311B92'
                          : 'grey-darken-2'
                      "
                      size="small"
                      class="mt-2"
                    >
                      {{
                        ListAllTicketDetails.status === "OPEN"
                          ? "Open"
                          : ListAllTicketDetails.status === "ONHOLD"
                          ? "On Hold"
                          : ListAllTicketDetails.status === "IN_PROGRESS"
                          ? "In Progress"
                          : ListAllTicketDetails.status === "RESOLVED"
                          ? "Resolved"
                          : ListAllTicketDetails.status === "CLOSED"
                          ? "Closed"
                          : ListAllTicketDetails.status === "REOPEN"
                          ? "Re-Opened"
                          : "Cancelled"
                      }}
                    </v-chip>
                  </span>
                </v-col>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Claim Status</div>
                    <v-chip
                      :color="
                        ListAllTicketDetails.claim_status === 'UNCLAIMED'
                          ? 'red'
                          : 'green'
                      "
                      size="small"
                      class="mt-2"
                      >{{
                        ListAllTicketDetails.claim_status === "UNCLAIMED"
                          ? "Unclaimed"
                          : "Claimed"
                      }}</v-chip
                    >
                  </span>
                </v-col>
              </v-row>

              <!--Claimed by and on-->
              <v-row v-if="ListAllTicketDetails.claim_status === 'CLAIMED'">
                <v-col
                  cols="6"
                  v-if="
                    ListAllTicketDetails.claimed_by ||
                    ListAllTicketDetails.claimed_by > 0
                  "
                >
                  <span>
                    <div class="font-weight-bold mr-2">Claimed by:</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllTicketDetails.claimed_by || "-" }}
                    </div>
                  </span>
                </v-col>
                <v-col
                  cols="6"
                  v-if="
                    ListAllTicketDetails.claimed_at ||
                    ListAllTicketDetails.claimed_at > 0
                  "
                >
                  <span>
                    <div class="font-weight-bold mr-2">Claimed at</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ConvertClaimedAtDate(ListAllTicketDetails.claimed_at)
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Resolved by and on-->
              <v-row v-if="ListAllTicketDetails.status === 'RESOLVED'">
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Resolved by:</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllTicketDetails.resolved_by }}
                    </div>
                  </span>
                </v-col>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Resolved at:</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ConvertResolvedAtDate(ListAllTicketDetails.resolved_at)
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="auto" class="d-flex justify-center">
              <v-divider vertical class="full-height-divider"></v-divider>
            </v-col>

            <!-- Comments and Attachments Row -->
            <v-col cols="6" class="mt-n4">
              <!-- Attachments Section -->
              <v-col cols="12">
                <div class="font-weight-bold">Attachments</div>
                <!-- Image Preview -->
                <v-card
                  v-if="hasValidAttachment"
                  class="pa-2 mt-2 settings-card"
                  rounded="lg"
                  elevation="1"
                  style="width: 100%; max-width: 700px"
                  @click="OpenImagePreview"
                >
                  <v-img
                    :src="imagePreview || ListAllTicketDetailsAttachments[0]"
                    height="200"
                    contain
                    rounded="lg"
                  />
                </v-card>
                <!-- No image fallback-->
                <v-card
                  v-else
                  rounded="lg"
                  flat
                  class="d-flex flex-column align-center justify-center py-6"
                  style="width: 100%; max-width: 700px"
                >
                  <v-icon size="70" color="grey">mdi-camera</v-icon>
                  <div class="mt-2 text-medium-emphasis">
                    No attachments available
                  </div>
                </v-card>
              </v-col>
              <!--Comments-->
              <v-col cols="12">
                <div class="font-weight-bold">Comments</div>
                <v-card
                  class="pa-2"
                  style="max-height: 500px; overflow-y: auto"
                  height="39vh"
                  flat
                >
                  <!-- No comments Placeholder -->
                  <v-card
                    v-if="!ListAllTicketDetailsComments.length"
                    rounded="lg"
                    flat
                    class="d-flex flex-column align-center justify-center py-6 mt-2"
                    style="width: 100%; max-width: 700px"
                  >
                    <v-icon size="70" color="grey">mdi-chat</v-icon>
                    <div class="mt-2 text-medium-emphasis">
                      No comments yet!
                    </div>
                  </v-card>

                  <!-- Comments -->
                  <v-row v-else>
                    <v-col
                      cols="6"
                      v-for="(item, index) in ListAllTicketDetailsComments"
                      :key="index"
                    >
                      <v-card
                        rounded="lg"
                        width="100%"
                        class="pa-2 settings-card"
                        elevation="3"
                      >
                        <v-card-text class="pt-0">{{
                          item.comment_text
                        }}</v-card-text>
                        <v-card-subtitle
                          class="text-caption text-medium-emphasis mt-n3"
                        >
                          <span>
                            {{ ConvertCreatedAtDate(item.created_at) }} -
                            {{ item.commented_by }}
                          </span>
                        </v-card-subtitle>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-col>
          </v-row>
        </div>

        <!-- Buttons -->
        <v-card-actions class="d-flex justify-center mb-2">
          <!--Assign Agent Button-->
          <v-btn
            v-if="!assigningAgent"
            rounded="lg"
            variant="flat"
            color="blue"
            size="small"
            :loading="loading"
            @click="assigningAgent = true"
          >
            <v-icon color="white">mdi-account</v-icon>
            Assign Agent
          </v-btn>

          <div v-else>
            <v-btn
              rounded="lg"
              variant="flat"
              color="green"
              class="mr-2"
              size="small"
              :loading="loading"
              @click="assignAgentMethod"
            >
              <v-icon color="white">mdi-check</v-icon>
              Save
            </v-btn>

            <v-btn
              rounded="lg"
              variant="flat"
              color="red"
              size="small"
              @click="assigningAgent = false"
            >
              <v-icon color="white">mdi-close</v-icon>
              Cancel
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { assign_ticket } from "@/graphql/mutations";
import { get_ticket_by_id } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

import ImagePreviewDialog from "./ImagePreviewDialog.vue";
import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogTicketDetails: Boolean, StoreObj: Object },

  mixins: [get_ticket_by_id, assign_ticket],

  components: { ImagePreviewDialog, SnackBar },

  data: () => ({
    agents: "",
    previewImage: "",

    loading: false,
    assigningAgent: false,
    DialogImagePreview: false,

    imagePreview: null,

    SnackBarComponent: {},
    ListAllTicketDetails: {},

    ListAllTicketDetailsAttachments: [],
    ListAllTicketDetailsComments: [],
  }),

  computed: {
    reassignAgents() {
      const t = this.ListAllTicketDetails;

      if (
        Array.isArray(t.ticket_type_auto_assign_group) &&
        t.ticket_type_auto_assign_group.length > 0
      ) {
        return t.ticket_type_auto_assign_group
          .filter((email) => email !== this.currentUserEmail)
          .map((email) => ({ title: email, value: email }));
      }

      if (
        Array.isArray(t.category_auto_assign_group) &&
        t.category_auto_assign_group.length > 0
      ) {
        return t.category_auto_assign_group
          .filter((email) => email !== this.currentUserEmail)
          .map((email) => ({ title: email, value: email }));
      }

      const fallback = t.agents_list || [];
      return fallback
        .filter((email) => email !== this.currentUserEmail)
        .map((email) => ({ title: email, value: email }));
    },
    currentUserEmail() {
      return this.$store.getters.GetUserEmail || "";
    },
    hasValidAttachment() {
      const hasLocal =
        this.imagePreview && typeof this.imagePreview === "string";
      const hasBackend =
        Array.isArray(this.ListAllTicketDetailsAttachments) &&
        this.ListAllTicketDetailsAttachments.length > 0 &&
        typeof this.ListAllTicketDetailsAttachments[0] === "string" &&
        this.ListAllTicketDetailsAttachments[0].trim().length > 0;
      return hasLocal || hasBackend;
    },
  },

  watch: {
    DialogTicketDetails(val) {
      if (val) {
        return this.GetTicketDetails();
      }
      this.resetLocalPreview();
    },
  },

  methods: {
    async GetTicketDetails() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(get_ticket_by_id, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
            },
          })
        );
        let resultObj = JSON.parse(result.data.get_ticket_by_id);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllTicketDetails = resultObj.data.ticket || {};
          this.ListAllTicketDetailsComments = resultObj.data.comments || [];
          this.ListAllTicketDetailsComments.sort(
            (a, b) => b.created_at - a.created_at
          );

          const rawAttachments = resultObj.data.ticket.attachments;
          if (Array.isArray(rawAttachments)) {
            this.ListAllTicketDetailsAttachments = rawAttachments.filter(
              (u) => u && typeof u === "string"
            );
          } else if (rawAttachments && typeof rawAttachments === "string") {
            this.ListAllTicketDetailsAttachments = [rawAttachments];
          } else {
            this.ListAllTicketDetailsAttachments = [];
          }

          if (
            this.ListAllTicketDetailsAttachments.length > 0 &&
            !this.imagePreview
          ) {
            this.previewImage = this.ListAllTicketDetailsAttachments[0];
          } else {
            if (!this.imagePreview) this.previewImage = "";
          }
        } else {
          this.ListAllTicketDetails = {};
          this.ListAllTicketDetailsComments = [];
          this.ListAllTicketDetailsAttachments = [];
        }
      } catch (error) {
        this.ListAllTicketDetails = {};
        this.ListAllTicketDetailsComments = [];
        this.ListAllTicketDetailsAttachments = [];
      } finally {
        this.loading = false;
      }
    },
    async assignAgentMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(assign_ticket, {
            input: {
              ticket_id: this.ListAllTicketDetails.ticket_id,
              assigned_to_email: this.agents,
            },
          })
        );
        let resultObj = JSON.parse(result.data.assign_ticket);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + (resultObj.Message || "Assign failed"),
          };
        }
        this.DialogTicketDetailsEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to assign ticket.",
        };
      } finally {
        this.loading = false;
      }
    },
    ConvertCreatedAtDate(created_at) {
      if (!created_at) return "N/A";
      const timestamp = Number(created_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minute} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
    ConvertAssignedDate(assigned_at) {
      if (!assigned_at) return "N/A";
      const timestamp = Number(assigned_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minute} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
    ConvertClaimedAtDate(claimed_at) {
      if (!claimed_at) return "N/A";
      const timestamp = Number(claimed_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minute} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
    ConvertResolvedAtDate(resolved_at) {
      if (!resolved_at) return "N/A";
      const timestamp = Number(resolved_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minute} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
    ConvertDueDate(due_date) {
      if (!due_date) return "TBD";
      const date = new Date(due_date * 1000);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    DialogTicketDetailsEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    DialogImagePreviewEmit() {
      this.DialogImagePreview = false;
    },
    OpenImagePreview() {
      if (this.imagePreview && typeof this.imagePreview === "string") {
        this.previewImage = this.imagePreview;
        this.DialogImagePreview = true;
        return;
      }

      if (
        Array.isArray(this.ListAllTicketDetailsAttachments) &&
        this.ListAllTicketDetailsAttachments.length > 0 &&
        typeof this.ListAllTicketDetailsAttachments[0] === "string" &&
        this.ListAllTicketDetailsAttachments[0].trim().length > 0
      ) {
        this.previewImage = this.ListAllTicketDetailsAttachments[0];
        this.DialogImagePreview = true;
        return;
      }

      return;
    },
    resetLocalPreview() {
      this.imagePreview = null;
      this.previewImage = "";
      this.ListAllTicketDetailsAttachments = [];
      this.ListAllTicketDetailsComments = [];
      this.ListAllTicketDetails = {};
    },
  },
};
</script>

<style scoped>
.overlay {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-radius: 8px !important;
}
.settings-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  background: white !important;
  border: 1px solid transparent !important;
}
.settings-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}
.gradient-border-card {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}
</style>
