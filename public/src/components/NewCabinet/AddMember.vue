<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="addMemberDialog"
      @update:model-value="$emit('update:addMemberDialog', $event)"
      persistent
      max-width="600"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Add Members to {{ rowInfo.Key }}</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-2" @click="close_dialog()">
            mdi-close
          </v-icon>
        </v-toolbar>

        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="">
              <v-col cols="12" class="mt-4">
                <div class="text-subtitle-2 mb-3"><b>Add New Members</b></div>
                <v-row no-gutters align="end">
                  <v-col cols="9">
                    <v-autocomplete
                      v-model="selectedUser"
                      :items="availableUsers"
                      item-title="full_user_name"
                      item-value="user_id"
                      label="Select User"
                      variant="outlined"
                      density="compact"
                      :menu-props="{ maxHeight: '200' }"
                      :search-input.sync="search"
                      clearable
                    />
                  </v-col>
                  <v-col cols="3" class="pl-2">
                    <v-btn
                      @click="add_member()"
                      :disabled="!selectedUser"
                      dark
                      size="small"
                      class="text-capitalize cardCss button-corner ml-2"
                      :loading="loading"
                    >
                      <v-icon left size="small">mdi-plus</v-icon>
                      Add
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
              <v-col cols="12">
                <div class="text-subtitle-2 mb-3"><b>Current Members</b></div>
                <v-data-table
                  :headers="memberHeaders"
                  :items="currentMembers"
                  :loading="tableLoading"
                  density="compact"
                  class="elevation-1"
                  hide-default-footer
                >
                  <template v-slot:[`item.actions`]="{ item }">
                    <v-icon
                      dense
                      @click.stop="remove_member(item)"
                      color="red"
                      size="small"
                      v-if="
                        item.user_id !== $store.getters.GetUserObj.user.user_id
                      "
                    >
                      mdi-delete
                    </v-icon>
                    <span v-else class="text-caption text-grey">Owner</span>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { add_remove_member_cabinet } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";

export default {
  props: {
    addMemberDialog: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      loading: false,
      saveLoading: false,
      tableLoading: false,
      selectedUser: null,
      search: "",
      currentMembers: [],
      availableUsers: [],
      memberHeaders: [
        { title: "Name", value: "full_user_name", sortable: false },
        { title: "Email", value: "user_email_id", sortable: false },
        { title: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  watch: {
    addMemberDialog: {
      async handler() {
        if (this.addMemberDialog == true) {
          await this.initialize_data();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async initialize_data() {
      this.tableLoading = true;
      await this.get_all_org_users();
      this.load_current_members();
      this.load_available_users();
      this.tableLoading = false;
    },

    load_current_members() {
      this.currentMembers = [];
      if (this.rowInfo.folder_visibility) {
        if (this.rowInfo.folder_visibility.visible_type === "ALL_MEMBERS") {
          // For ALL_MEMBERS, show all active users
          this.orgUsers.forEach((user) => {
            if (user.user_status === "ACTIVE") {
              this.currentMembers.push({
                user_id:    [user.user_id],
                full_user_name: user.full_user_name,
                user_email_id: user.user_email_id,
              });
            }
          });
        } else if (
          this.rowInfo.folder_visibility.visible_type === "RESTRICTED_MEMBERS"
        ) {
          // For RESTRICTED_MEMBERS, show only the visible members
          this.rowInfo.folder_visibility.visible_members.forEach((memberId) => {
            const user = this.orgUsers.find((u) => u.user_id === memberId);
            if (user) {
              this.currentMembers.push({
                user_id: user.user_id,
                full_user_name: user.full_user_name,
                user_email_id: user.user_email_id,
              });
            }
          });
        }
      }
    },

    load_available_users() {
      this.availableUsers = [];
      const currentMemberIds = this.currentMembers.map((m) => m.user_id);

      this.orgUsers.forEach((user) => {
        if (
          user.user_status === "ACTIVE" &&
          !currentMemberIds.includes(user.user_id)
        ) {
          this.availableUsers.push({
            user_id: user.user_id,
            full_user_name: user.full_user_name,
            user_email_id: user.user_email_id,
          });
        }
      });
    },

    async add_member() {
      if (!this.selectedUser) return;
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(add_remove_member_cabinet, {
            input: {
              folder_id: this.rowInfo.folder_id,

              user_id: this.selectedUser,
              action_type: "ADD",
            },
          })
        );
        var response = JSON.parse(result.data.add_remove_member_cabinet);
        this.loading = false;
        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", "Member added successfully!");
          this.close_dialog();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    async remove_member(item) {
        // Don't allow removing the owner
      try {
        const result = await API.graphql(
          graphqlOperation(add_remove_member_cabinet, {
            input: {
              folder_id: this.rowInfo.folder_id,
              user_id: item.user_id,
              action_type: "REMOVE",
            },
          })
        );
        var response = JSON.parse(result.data.add_remove_member_cabinet);

        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", "Member removed successfully!");
          this.close_dialog();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

  

    close_dialog() {
      this.selectedUser = null;
      this.currentMembers = [];
      this.availableUsers = [];
      this.search = "";
      this.$emit("clicked", 0);
    },
  },
};
</script>

<style scoped>
.navBar {
  background: #f8f9fa !important;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-title {
  color: black !important;
  font-weight: 600;
  font-size: 18px;
}

.icon-class {
  color: black !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-class:hover {
  transform: scale(1.1);
  color: #db4c77 !important;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 4px;
}

.cardCss {
  background: #db4c77;
  border-radius: 8px;
}

.button-corner {
  border-radius: 8px;
  padding: 0 24px;
  font-weight: 600;
}
</style> 