<template>
  <div>
    <v-card
      width="400"
      class="mx-auto"
      :key="`create-channel-${channelVisbility}-${selectedUsers.length}`"
    >
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6 font-weight-medium">Create New Channel</span>
        <v-btn
          color="primary"
          size="small"
          :loading="loading"
          @click="CreatingGroup()"
          prepend-icon="mdi-plus"
        >
          Create
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <v-form ref="form" @submit.prevent="CreatingGroup">
          <v-text-field
            v-model="groupName"
            label="Channel Name"
            variant="outlined"
            density="compact"
            :rules="[(v) => !!v || 'Channel name is required']"
            placeholder="Enter channel name"
            prepend-inner-icon="mdi-bullhorn-outline"
            class="mb-4"
          />

          <v-transition-group name="fade" mode="out-in">
            <!-- Selected Users Display -->
            <div
              v-if="selectedUsers.length > 0"
              class="mb-4"
              :key="`selected-users`"
            >
              <div class="text-subtitle-2 mb-2">
                Selected Members ({{ selectedUsers.length }})
              </div>
              <div class="selected-users-container">
                <v-chip-group>
                  <v-chip
                    v-for="(user, index) in selectedUsers"
                    :key="`selected-${user.user_id}`"
                    closable
                    @click:close="removeUser(index)"
                    color="primary"
                    variant="tonal"
                    size="small"
                  >
                    <v-avatar size="20" class="mr-2">
                      <v-img
                        v-if="
                          user.user_profile_pic_url &&
                          user.user_profile_pic_url !== 'N/A' &&
                          user.user_profile_pic_url !== ''
                        "
                        :src="user.user_profile_pic_url"
                      />
                      <span v-else class="text-caption">
                        {{ user.full_user_name.substring(0, 1).toUpperCase() }}
                      </span>
                    </v-avatar>
                    {{ user.full_user_name }}
                  </v-chip>
                </v-chip-group>
              </div>
            </div>

            <!-- Channel Visibility -->
            <div class="mb-4" :key="`visibility`">
              <div class="text-subtitle-2 mb-2">Channel Visibility</div>
              <v-radio-group
                v-model="channelVisbility"
                inline
                @update:model-value="handleVisibilityChange"
                :rules="[(v) => !!v || 'Please select channel visibility']"
              >
                <v-radio value="OPEN" label="Open to All" color="primary">
                  <template #label>
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-2" color="green"
                        >mdi-earth</v-icon
                      >
                      <span>Open to All</span>
                    </div>
                  </template>
                </v-radio>
                <v-radio
                  value="RESTRICTED"
                  label="Restricted Access"
                  color="primary"
                >
                  <template #label>
                    <div class="d-flex align-center">
                      <v-icon size="16" class="mr-2" color="orange"
                        >mdi-lock</v-icon
                      >
                      <span>Restricted Access</span>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>
          </v-transition-group>

          <!-- User Selection Container - Always present but conditionally visible -->
          <div
            class="user-selection-container"
            :class="{ visible: channelVisbility === 'RESTRICTED' }"
            v-if="channelVisbility === 'RESTRICTED'"
          >
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-2">Select Members</div>
              <v-text-field
                v-model="searchQuery"
                placeholder="Search users..."
                variant="outlined"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-magnify"
                class="ml-4"
                style="max-width: 200px"
              />
            </div>

            <v-card variant="outlined" class="user-list-container">
              <v-list lines="two" density="compact" class="pa-0">
                <v-list-item
                  v-for="user in filteredUsers"
                  :key="`user-${user.user_id}`"
                  class="user-list-item"
                >
                  <template #prepend>
                    <v-avatar size="32" color="primary" variant="tonal">
                      <v-img
                        v-if="
                          user.user_profile_pic_url &&
                          user.user_profile_pic_url !== 'N/A' &&
                          user.user_profile_pic_url !== ''
                        "
                        :src="user.user_profile_pic_url"
                      />
                      <span v-else class="text-caption font-weight-medium">
                        {{ user.full_user_name.substring(0, 1).toUpperCase() }}
                      </span>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ user.full_user_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ user.designation || "No designation" }}
                  </v-list-item-subtitle>

                  <template #append>
                    <v-checkbox
                      v-model="selectedUsers"
                      :value="user"
                      color="primary"
                      density="compact"
                      hide-details
                      @change="handleUserSelection"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import { create_stichh_channel } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  data() {
    return {
      listHeight: 0,
      searchQuery: "",
      groupName: "",
      allusers: [],
      model: [],
      selectedUsers: [],
      loading: false,
      channelVisbility: null,
      visibilityUsers: [],
      isTransitioning: false,
      selectionTimeout: null,
    };
  },
  mixins: [get_all_org_users],
  // computed: {
  //   filteredUsers() {
  //     return this.allusers.filter((chat) => {
  //       return chat.full_user_name
  //         .toLowerCase()
  //         .includes(this.searchQuery.toLowerCase());
  //     });
  //   },
  // },

  computed: {
    filteredUsers() {
      // Cache the search query to prevent unnecessary recalculations
      const query = this.searchQuery.toLowerCase().trim();

      if (this.channelVisbility === "OPEN") {
        return [];
      } else if (this.channelVisbility === "RESTRICTED") {
        // Create a stable reference to prevent unnecessary re-renders
        let allUsersMerged = [...this.allusers, ...this.visibilityUsers];
        let uniqueUsers = allUsersMerged.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.user_id === user.user_id)
        );

        // Only filter if there's a search query
        if (query) {
          return uniqueUsers.filter((user) =>
            user.full_user_name.toLowerCase().includes(query)
          );
        }

        return uniqueUsers;
      }
      return [];
    },
  },

  async mounted() {
    this.listHeight = window.innerHeight - 350;
    await this.get_all_org_users();
    this.fetch_details();

    this.allusers = this.orgUsers.filter(
      (user) => user.user_status === "ACTIVE"
    );
    this.allusers = this.allusers.filter(
      (user) =>
        user.user_email_id !== this.$store.getters.GetUserObj.user.user_email_id
    );
  },
  methods: {
    removeUser(index) {
      // Use nextTick to ensure stable layout updates
      this.$nextTick(() => {
        this.selectedUsers.splice(index, 1);
      });
    },
    handleVisibilityChange(newValue) {
      // Prevent rapid state changes that could cause ResizeObserver errors
      if (this.isTransitioning) return;

      this.isTransitioning = true;

      // Use setTimeout to debounce the change
      setTimeout(() => {
        this.clear_value();
        this.isTransitioning = false;
      }, 50);
    },
    handleUserSelection() {
      // Debounce user selection changes to prevent ResizeObserver errors
      if (this.selectionTimeout) {
        clearTimeout(this.selectionTimeout);
      }

      this.selectionTimeout = setTimeout(() => {
        // Force a stable layout update
        this.$nextTick(() => {
          // Any additional logic can go here if needed
        });
      }, 100);
    },
    clear_value() {
      var data = this.$store.getters.GetUserObj;

      // Use nextTick to ensure DOM updates are complete before making changes
      this.$nextTick(() => {
        if (this.channelVisbility === "OPEN") {
          this.selectedUsers = [];
        } else if (this.channelVisbility === "RESTRICTED") {
          // Find current user and add to selected users if not already present
          const currentUserId = data.user.user_id;
          const isCurrentUserSelected = this.selectedUsers.some(
            (user) => user.user_id === currentUserId
          );

          if (!isCurrentUserSelected) {
            const currentUser = this.allusers.find(
              (u) => u.user_id === currentUserId
            );
            if (currentUser) {
              this.selectedUsers = [currentUser];
            }
          }
        }
      });
    },
    fetch_details() {
      var data = this.$store.getters.GetUserObj;
      // console.log("Fetched User Data:", data);
      this.visibilityUsers = [];
      if (data && data.user) {
        this.visibilityUsers.push({
          full_user_name: data.user.full_user_name,
          user_id: data.user.user_id,
        });
      }
    },
    CreatingGroup() {
      if (this.$refs.form.validate()) {
        this.create_teams_message();
      }
    },
    async create_teams_message() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      var users = this.selectedUsers.map((user) => user.user_id);
      try {
        let result = await API.graphql(
          graphqlOperation(create_stichh_channel, {
            input: {
              team_name: this.groupName,
              team_description: this.groupName,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              team_visibility: this.channelVisbility,
              restricted_users:
                this.channelVisbility === "OPEN" ? undefined : users,
            },
          })
        );
        var response = JSON.parse(result.data.create_stichh_channel);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        if (error && error.errors && error.errors.length > 0) {
          this.$emit("errorMsg", error.errors[0].message);
        } else {
          this.$emit(
            "errorMsg",
            error.message || "An unexpected error occurred."
          );
        }

        this.loading = false;
      }
    },
  },
  beforeDestroy() {
    // Clean up timeout to prevent memory leaks
    if (this.selectionTimeout) {
      clearTimeout(this.selectionTimeout);
    }
  },
};
</script>

<style scoped>
/* Fix ResizeObserver loop error */
.v-card {
  contain: layout style paint;
  will-change: transform;
}

.v-form {
  contain: layout style paint;
}

.v-card-text {
  contain: layout style paint;
  min-height: 200px;
}

/* User list container */
.user-list-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  contain: layout style paint;
}

.user-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: background-color 0.2s ease;
  contain: layout style paint;
}

.user-list-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.user-list-item:last-child {
  border-bottom: none;
}

/* Chip styling */
.v-chip-group {
  gap: 8px;
  contain: layout style paint;
}

.v-chip {
  transition: all 0.2s ease;
  contain: layout style paint;
}

.v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar for the user list */
.user-list-container::-webkit-scrollbar {
  width: 6px;
}

.user-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.user-list-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.user-list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Form validation styling */
.v-form .v-field--error {
  border-color: rgb(var(--v-theme-error)) !important;
}

/* Radio button styling */
.v-radio-group .v-radio {
  margin-right: 16px;
  contain: layout style paint;
}

/* Conditional content containers */
.v-card-text > div {
  contain: layout style paint;
}

/* Prevent layout shifts */
.v-text-field {
  contain: layout style paint;
}

.v-radio-group {
  contain: layout style paint;
}

/* Smooth transitions */
.v-card {
  transition: transform 0.2s ease-out;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-card {
    width: 100% !important;
    margin: 0 8px;
  }

  .v-radio-group .v-radio {
    margin-right: 8px;
  }
}

/* Additional performance optimizations */
.v-list {
  contain: layout style paint;
}

.v-list-item {
  contain: layout style paint;
}

.v-avatar {
  contain: layout style paint;
}

.v-checkbox {
  contain: layout style paint;
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-move {
  transition: transform 0.3s ease;
}

/* Prevent layout thrashing during transitions */
.v-transition-group {
  contain: layout style paint;
}

/* Ensure stable layout during user selection changes */
.v-chip-group {
  min-height: 40px;
  contain: layout style paint;
}

/* Selected users container */
.selected-users-container {
  height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s ease;
  contain: layout style paint;
  margin-bottom: 0;
}

.user-selection-container.visible {
  height: auto;
  opacity: 1;
  margin-bottom: 16px;
  min-height: 350px;
}

/* Ensure the container has a stable height when visible */
.user-selection-container.visible .user-list-container {
  height: 300px;
  contain: layout style paint;
}

/* Prevent layout shifts during transitions */
.v-card-text {
  contain: layout style paint;
  min-height: 500px;
}

/* Additional performance optimizations */
.v-list {
  contain: layout style paint;
}

.v-list-item {
  contain: layout style paint;
}

.v-avatar {
  contain: layout style paint;
}

.v-checkbox {
  contain: layout style paint;
}

/* Transition styles */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-move {
  transition: transform 0.3s ease;
}

/* Prevent layout thrashing during transitions */
.v-transition-group {
  contain: layout style paint;
}

/* Ensure stable layout during user selection changes */
.v-chip-group {
  min-height: 40px;
  contain: layout style paint;
}
</style>