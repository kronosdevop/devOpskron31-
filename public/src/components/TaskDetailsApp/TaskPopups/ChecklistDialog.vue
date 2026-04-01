<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="checklistDialog"
      @update:model-value="$emit('update:checklistDialog', $event)"
      persistent
      max-width="900"
      transition="dialog-top-transition"
    >
      <v-card class="modern-checklist-dialog">
        <div class="modern-toolbar">
          <div class="modern-toolbar-title">
            {{ checklistData.checklist_name || "Checklist Details" }}
          </div>
          <v-spacer />
          <v-icon class="icon-class" @click="closeDialog">mdi-close</v-icon>
        </div>

        <v-card-text class="pa-4">
          <!-- Checklist Items -->
          <div class="modern-checklist-list">
            <h6 class="text-h6 mb-3">Checklist Items</h6>
            <div v-if="groupedItems.length > 0">
              <div
                v-for="(group, groupIndex) in groupedItems"
                :key="groupIndex"
                class="mb-4"
              >
                <!-- Section Header as outlined card -->
                <div v-if="group.sectionName" class="mb-3">
                  <v-card outlined class="pa-3 modern-section-header-outlined">
                    <v-icon left color="primary">mdi-folder</v-icon>
                    <span class="section-title">{{ group.sectionName }}</span>
                  </v-card>
                </div>
                <!-- Divider for ungrouped items -->
                <div v-else class="mb-3">
                  <v-divider class="mb-3"></v-divider>
                  <v-divider></v-divider>
                </div>
                <!-- Items in this group -->
                <div>
                  <div
                    v-for="(item, index) in group.items"
                    :key="item.assigned_id"
                  >
                    <v-row
                      class="modern-list-item-row"
                      align="center"
                      no-gutters
                    >
                      <v-col cols="8" class="modern-list-item-details">
                        <div
                          class="font-weight-medium modern-item-title"
                          :class="{ 'text--grey': !isAssignedToMe(item) }"
                        >
                          {{ item.checklist_name }}
                        </div>
                        <div
                          v-if="getItemDescription(item)"
                          class="text-caption modern-item-desc"
                          :class="{ 'text--grey': !isAssignedToMe(item) }"
                        >
                          {{ getItemDescription(item) }}
                        </div>
                        <div
                          class="text-caption text-grey-600 modern-item-assigned"
                          :class="{ 'text--grey': !isAssignedToMe(item) }"
                        >
                          Assigned to: {{ getAssignedUserName(item) }}
                        </div>
                      </v-col>
                      <v-spacer />
                      <v-col
                        cols="4"
                        class="modern-list-item-status"
                        style="text-align: right"
                      >
                        <template v-if="isAssignedToMe(item)">
                          <template
                            v-if="
                              originalStatuses[item.assigned_id] === 'COMPLETED'
                            "
                          >
                            <v-chip small color="success" text-color="white"
                              >Completed</v-chip
                            >
                          </template>
                          <template v-else>
                            <div class="d-flex align-center">
                              <v-select
                                v-model="item.progress_status"
                                :items="[
                                  { text: 'STARTED', value: 'STARTED' },
                                  {
                                    text: 'NOT APPLICABLE',
                                    value: 'NOT_APPLICABLE',
                                  },
                                  { text: 'COMPLETED', value: 'COMPLETED' },
                                ]"
                                item-title="text"
                                item-value="value"
                                variant="outlined"
                                density="compact"
                                hide-details
                                style="width: 180px"
                                class="status-select"
                              />
                              <v-btn
                                v-if="
                                  item.progress_status !==
                                  originalStatuses[item.assigned_id]
                                "
                                small
                                color="primary"
                                class="ml-2"
                                @click="
                                  submitStatusChange(item, groupIndex, index)
                                "
                                :loading="loading"
                                style="min-width: 60px"
                              >
                                Save
                              </v-btn>
                            </div>
                          </template>
                        </template>
                        <template v-else>
                          <v-chip
                            small
                            :color="getStatusColor(item.progress_status)"
                            text-color="white"
                          >
                            {{ getStatusDisplayText(item.progress_status) }}
                          </v-chip>
                        </template>
                      </v-col>
                    </v-row>
                    <v-divider
                      v-if="index < group.items.length - 1"
                      class="modern-list-divider"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center pa-4">
              <v-icon large color="grey" class="mb-2"
                >mdi-format-list-checks</v-icon
              >
              <div class="text-grey">No checklist items available</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*eslint-disable*/
import { get_particular_checklist } from "@/graphql/queries";
import { update_user_checklists } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export default {
  name: "ChecklistDialog",
  props: {
    checklistDialog: {
      type: Boolean,
      default: false,
    },
    checklistData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      checklistItems: [],
      loading: false,
      groupedItems: [],
      originalStatuses: {},
      justCompleted: {},
    };
  },
  computed: {
    overallProgress() {
      const totalItems = this.checklistItems.length;
      const completedItems = this.checklistItems.filter(
        (item) => item.completed
      ).length;
      return totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;
    },
  },
  watch: {
    checklistDialog: {
      async handler(newVal) {
        if (newVal === true) {
          await this.get_checklist_user();
        }
      },
      immediate: true,
    },
  },
  methods: {
    closeDialog() {
      this.$emit("clicked", 0);
    },

    getAssignedUserName(item) {
      if (!item.assigned_to_name) {
        return "Not Assigned";
      }

      // Check if the current user is assigned to this item
      const currentUser = this.$store.getters.GetUserObj.user;
      const currentUserName =
        currentUser.full_user_name || currentUser.user_email_id;

      if (item.assigned_to_name === currentUserName) {
        return "You";
      }

      return item.assigned_to_name;
    },

    getStatusDisplayText(status) {
      switch (status) {
        case "STARTED":
          return "Started";
        case "NOT_APPLICABLE":
          return "Not Applicable";
        case "COMPLETED":
          return "Completed";
        case "PENDING":
          return "Pending";
        case "INPROGRESS":
          return "In Progress";
        default:
          return status || "Pending";
      }
    },

    getStatusColor(status) {
      switch (status) {
        case "STARTED":
          return "orange";
        case "NOT_APPLICABLE":
          return "grey";
        case "COMPLETED":
          return "success";
        case "PENDING":
          return "red";
        case "INPROGRESS":
          return "blue";
        default:
          return "grey";
      }
    },

    async get_checklist_user() {
      try {
        this.loading = true;
        let checklistResult = await API.graphql(
          graphqlOperation(get_particular_checklist, {
            input: {
              checklist_id: this.checklistData.checklist_id,
            },
          })
        );

        var data = JSON.parse(checklistResult.data.get_particular_checklist);
        if (data.Status === "SUCCESS") {
          this.parseChecklistItems(data.data);
        }
      } catch (error) {
        console.error("Error fetching checklist data:", error);
        this.$emit(
          "errorMsg",
          "Failed to load checklist data: " + error.message
        );
      } finally {
        this.loading = false;
      }
    },

    parseChecklistItems(items) {
      // console.log("items", items);
      try {
        this.checklistItems = [];
        this.groupedItems = [];

        // Get current user info for sorting
        const currentUser = this.$store.getters.GetUserObj.user;
        const currentUserId = currentUser.user_id;

        // Group items by section_name
        const groupedBySection = {};
        const ungroupedItems = [];

        items.forEach((item) => {
          if (item.section_name && item.section_name.trim() !== "") {
            // Item has a section name - group it
            const sectionName = item.section_name.trim();
            if (!groupedBySection[sectionName]) {
              groupedBySection[sectionName] = [];
            }
            groupedBySection[sectionName].push({
              ...item,
              completed: item.progress_status === "COMPLETED",
            });
          } else {
            // Item has no section name - keep it separate
            ungroupedItems.push({
              ...item,
              completed: item.progress_status === "COMPLETED",
            });
          }
        });

        // Sort function to prioritize current user's items
        const sortByCurrentUser = (a, b) => {
          const aIsCurrentUser = a.assigned_to === currentUserId;
          const bIsCurrentUser = b.assigned_to === currentUserId;

          if (aIsCurrentUser && !bIsCurrentUser) return -1;
          if (!aIsCurrentUser && bIsCurrentUser) return 1;
          return 0; // Keep original order for items with same assignment status
        };

        // Add grouped sections first
        Object.keys(groupedBySection).forEach((sectionName) => {
          if (groupedBySection[sectionName].length > 0) {
            // Sort items in this section to put current user's items first
            const sortedItems =
              groupedBySection[sectionName].sort(sortByCurrentUser);
            this.groupedItems.push({
              sectionName: sectionName,
              items: sortedItems,
            });
          }
        });

        // Add ungrouped items as a separate group (without section name)
        if (ungroupedItems.length > 0) {
          // Sort ungrouped items to put current user's items first
          const sortedUngroupedItems = ungroupedItems.sort(sortByCurrentUser);
          this.groupedItems.push({
            sectionName: null, // null indicates no section name
            items: sortedUngroupedItems,
          });
        }

        // Flatten all items for progress calculation
        this.checklistItems = this.groupedItems.flatMap((group) => group.items);

        this.originalStatuses = {};
        this.checklistItems.forEach((item) => {
          this.originalStatuses[item.assigned_id] = item.progress_status;
        });
      } catch (error) {
        console.error("Error parsing checklist items:", error);
      }
    },

    updateItemStatus(item, groupIndex, index) {
      // Update the completed status based on progress_status
      item.completed = item.progress_status === "COMPLETED";

      // Update the item status
      this.groupedItems[groupIndex].items[index] = { ...item };

      // Update the flattened list for progress calculation
      this.checklistItems = this.groupedItems.flatMap((group) => group.items);

      // Calculate new completion percentage
      const totalItems = this.checklistItems.length;
      const completedItems = this.checklistItems.filter(
        (item) => item.completed
      ).length;
      const newPercentage =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Emit update event
      this.$emit("updateChecklistProgress", {
        checklistId: this.checklistData.checklist_id,
        completionPercentage: newPercentage,
        updatedItems: this.checklistItems,
      });
    },

    getItemDescription(item) {
      return (
        item.item_description ||
        item.section_description ||
        "No description available"
      );
    },

    formatDate(timestamp) {
      if (!timestamp) return "N/A";
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },

    isAssignedToMe(item) {
      // Replace with your actual user id/email logic
      const myId = this.$store.getters.GetUserObj.user.user_id;
      return item.assigned_to === myId;
    },

    async submitStatusChange(item, groupIndex, index) {
      // Call your API here with item.assigned_id and item.progress_status
      try {
        this.loading = true;
        let result = await API.graphql(
          graphqlOperation(update_user_checklists, {
            input: {
              assigned_id: item.assigned_id,
              progress_status: item.progress_status,
            },
          })
        );
        var data = JSON.parse(result.data.update_user_checklists);
        if (data.Status === "SUCCESS") {
          if (item.progress_status === "COMPLETED") {
            this.justCompleted[item.assigned_id] = true;
          } else {
            delete this.justCompleted[item.assigned_id];
          }
          this.get_checklist_user();
        }
      } catch (error) {
        this.$emit("errorMsg", "Failed to update status: " + error.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.modern-checklist-dialog {
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}
.modern-toolbar {
  display: flex;
  align-items: center;
  padding: 18px 24px 10px 24px;
  background: #fff;
  border-radius: 12px 12px 0 0;
  min-height: 40px;
  border-bottom: 1px solid #eee;
}
.modern-toolbar-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #222;
  line-height: 1.2;
  max-width: 80%;
  word-break: break-word;
}
.icon-class {
  color: #666;
  cursor: pointer;
  font-size: 1.5rem;
}
.modern-checklist-list {
  background: #fff;
  border-radius: 0 0 12px 12px;
  padding: 0;
}
.modern-section-header-outlined {
  background: #fff !important;
  border: 1px solid #e0e0e0 !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  padding: 8px 16px !important;
  font-size: 1rem;
  font-weight: 500;
  color: #222;
  margin-bottom: 8px;
  gap: 8px;
}
.section-title {
  font-weight: 500;
  color: #222;
  font-size: 1.08rem;
  margin-left: 6px;
  display: flex;
  align-items: center;
}
.modern-list-item-row {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 12px 0 12px 0;
  background: #fff;
  gap: 12px;
}
.modern-list-item-details {
  flex: 1 1 0%;
  min-width: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.modern-list-item-status {
  display: flex;
  align-items: center;
  min-width: 200px;
  justify-content: flex-end;
  gap: 8px;
}
.modern-item-title {
  font-size: 1.04rem;
  color: #222;
  font-weight: 600;
  text-align: left;
  margin-bottom: 2px;
}
.modern-item-desc {
  font-size: 0.97rem;
  color: #666;
  text-align: left;
  margin-bottom: 2px;
}
.modern-item-assigned {
  font-size: 0.93rem;
  color: #888;
  text-align: left;
}
.status-select {
  min-width: 160px;
  border-radius: 8px;
  font-size: 0.98rem;
}
.v-chip {
  font-weight: 500;
  border-radius: 16px;
  font-size: 0.97rem;
  height: 28px;
  display: flex;
  align-items: center;
}
.v-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
  font-size: 0.97rem;
  height: 28px;
  min-width: 60px;
  padding: 0 12px;
}
.modern-list-divider {
  margin: 0 0 0 0;
  border-color: #eee;
}
.text--grey {
  color: #b0b0b0 !important;
}
</style>