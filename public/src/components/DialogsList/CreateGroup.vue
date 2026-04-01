<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-card
      class="create-group-card d-flex flex-column"
      max-width="500"
      style="max-height: 80vh"
    >
      <v-card-title
        class="d-flex align-center justify-space-between pa-4 flex-shrink-0"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="primary">mdi-account-group</v-icon>
          <span class="text-h6 font-weight-medium">Create New Group</span>
        </div>
        <v-btn icon variant="text" @click="$emit('close')" class="ml-auto">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4 flex-grow-1" style="overflow-y: auto">
        <v-form ref="form" @submit.prevent="CreatingGroup">
          <v-text-field
            v-model="groupName"
            label="Group Name"
            placeholder="Enter group name"
            variant="outlined"
            density="comfortable"
            :rules="nameRules"
            prepend-inner-icon="mdi-account-group"
            class="mb-4"
            hide-details="auto"
          />

          <!-- Selected Users Display -->
          <div v-if="selectedUsers.length > 0" class="mb-4">
            <div class="d-flex align-center mb-2">
              <v-icon size="small" class="mr-2" color="primary"
                >mdi-account-multiple</v-icon
              >
              <span class="text-subtitle-2 font-weight-medium"
                >Selected Members ({{ selectedUsers.length }})</span
              >
            </div>
            <v-chip-group>
              <v-chip
                v-for="(user, index) in selectedUsers"
                :key="user.user_id"
                closable
                variant="elevated"
                color="grey-darken-3"
                @click:close="removeUser(index)"
                class="ma-1"
              >
                <v-avatar start color="white">
                  <span
                    class="text-grey-darken-3 font-weight-bold text-caption"
                  >
                    {{ user.full_user_name.substring(0, 1).toUpperCase() }}
                  </span>
                </v-avatar>
                {{ user.full_user_name }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- User Search and Selection -->
          <div class="mb-4">
            <div class="d-flex align-center mb-2">
              <v-icon size="small" class="mr-2" color="primary"
                >mdi-account-search</v-icon
              >
              <span class="text-subtitle-2 font-weight-medium"
                >Add Members</span
              >
            </div>

            <v-text-field
              v-model="searchQuery"
              label="Search users"
              placeholder="Type to search..."
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              hide-details="auto"
              class="mb-3"
            />

            <v-card variant="outlined" class="user-list-container">
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="user in filteredUsers"
                  :key="user.user_id"
                  class="user-list-item"
                  :class="{ 'selected-user': isUserSelected(user) }"
                >
                  <template #prepend>
                    <v-checkbox
                      v-model="selectedUsers"
                      :value="user"
                      color="primary"
                      hide-details
                      density="compact"
                      class="pr-2"
                    />
                    <v-avatar color="primary" size="40">
                      <v-img
                        v-if="
                          user.user_profile_pic_url &&
                          user.user_profile_pic_url !== 'N/A' &&
                          user.user_profile_pic_url !== ''
                        "
                        :src="user.user_profile_pic_url"
                        cover
                      />
                      <span v-else class="text-body-2 font-weight-medium">
                        {{ user.full_user_name.substring(0, 1).toUpperCase() }}
                      </span>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="text-body-1 font-weight-medium">
                    {{ user.full_user_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle
                    class="text-caption text-medium-emphasis"
                  >
                    {{ user.designation || "N/A" }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item
                  v-if="filteredUsers.length === 0"
                  class="text-center"
                >
                  <v-list-item-content>
                    <v-list-item-title class="text-body-2 text-medium-emphasis">
                      No users found
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </div>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 flex-shrink-0">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('close')" class="mr-3">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!groupName.trim() || selectedUsers.length === 0"
          @click="CreatingGroup"
          prepend-icon="mdi-plus"
        >
          Create Group
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable */

import { create_teams } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  name: "CreateGroup",
  data() {
    return {
      searchQuery: "",
      groupName: "",
      allusers: [],
      selectedUsers: [],
      loading: false,
      nameRules: [
        (v) => !!v || "Group name is required",
        (v) => v.length >= 2 || "Group name must be at least 2 characters",
        (v) => v.length <= 50 || "Group name must be less than 50 characters",
      ],
    };
  },
  mixins: [get_all_org_users],
  computed: {
    filteredUsers() {
      if (!this.searchQuery.trim()) {
        return this.allusers;
      }
      return this.allusers.filter((user) => {
        return (
          user.full_user_name
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          (user.designation &&
            user.designation
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase()))
        );
      });
    },
  },
  async mounted() {
    await this.get_all_org_users();

    this.allusers = this.orgUsers.filter(
      (user) => user.user_status === "ACTIVE"
    );
    this.allusers = this.allusers.filter(
      (user) =>
        user.user_email_id !== this.$store.getters.GetUserObj.user?.user_email_id
    );
  },
  methods: {
    removeUser(index) {
      this.selectedUsers.splice(index, 1);
    },
    isUserSelected(user) {
      return this.selectedUsers.some(
        (selectedUser) => selectedUser.user_id === user.user_id
      );
    },
    CreatingGroup() {
      if (this.$refs.form.validate()) {
        if (this.selectedUsers.length > 0) {
          this.create_teams_message();
        } else {
          this.$emit("errorMsg", "Please select at least one member");
        }
      }
    },
    async create_teams_message() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      var users = this.selectedUsers.map((user) => user.user_id);

      try {
        let result = await API.graphql(
          graphqlOperation(create_teams, {
            input: {
              team_name: this.groupName.trim(),
              team_description: this.groupName.trim(),
              user_id: users,
            },
          })
        );
        var response = JSON.parse(result.data.create_teams);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.resetForm();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit(
          "errorMsg",
          error.errors?.[0]?.message ||
            "An error occurred while creating the group"
        );
        this.loading = false;
      }
    },
    resetForm() {
      this.groupName = "";
      this.selectedUsers = [];
      this.searchQuery = "";
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
    },
  },
};
</script>

<style scoped>
.create-group-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.user-list-container {
  border-radius: 8px;
}

.user-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s ease;
}

.user-list-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.user-list-item.selected-user {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.user-list-item:last-child {
  border-bottom: none;
}

.v-list-item {
  min-height: 60px;
}

.v-chip {
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Custom scrollbar for the user list */
.user-list-container::-webkit-scrollbar {
  width: 6px;
}

.user-list-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.user-list-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.user-list-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>