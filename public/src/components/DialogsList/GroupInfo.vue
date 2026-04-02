<template>
  <!--  eslint-disable 
 -->
  <div>
    <v-card width="550">
      <v-card-title class="d-flex align-center py-2">
        <span class="text-h6">Group Details</span>
        <v-spacer />
        <v-btn icon variant="text" @click="$emit('close')"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-tabs v-model="tabvalue" direction="vertical">
          <v-tab>
            <v-icon start>mdi-alpha-i-circle-outline</v-icon>
            Overview
          </v-tab>
          <v-tab>
            <v-icon start>mdi-account-multiple-outline</v-icon>
            Members
          </v-tab>
        </v-tabs>
        <v-window v-model="tabvalue">
          <v-window-item :value="0">
            <v-card flat>
              <v-card-text>
                <div class="d-flex justify-center">
                  <v-avatar size="35" color="primary">
                    <v-icon color="white">mdi-account-group</v-icon>
                  </v-avatar>
                </div>
                <div class="d-flex justify-center">
                  <div
                    class="font-weight-bold mt-2"
                    v-if="groupNameEdit == false"
                  >
                    {{ selectedChat.team_name }}
                    <v-icon
                      color="primary"
                      v-if="
                        $store.getters.GetUserObj.user?.user_id ==
                        selectedChat.team_owner_id
                      "
                      size="small"
                      @click="editteamName()"
                      >mdi-pencil</v-icon
                    >
                  </div>
                  <v-row v-else>
                    <v-form ref="form">
                      <v-text-field
                        outlined
                        density="compact"
                        label="Name"
                        :rules="[(v) => !!v || 'Required']"
                        v-model="GroupName"
                        class="mt-4"
                        style="max-width: 80px"
                      />
                    </v-form>
                    <v-btn
                      :loading="loadingsave"
                      size="small"
                      color="primary"
                      variant="flat"
                      class="cardCss text-capitalize mt-4 ml-2"
                      @click="editgroup"
                    >
                      Save</v-btn
                    >
                  </v-row>
                </div>
                <div class="d-flex justify-center">
                  <div class="font-weight-bold mt-2">
                    Created On : {{ fetch_date(selectedChat.team_created_on) }}
                  </div>
                </div>
                <div class="d-flex justify-center">
                  <div class="font-weight-bold mt-2">
                    Created By :
                    {{ fetch_user_name(selectedChat.team_created_by) }}
                  </div>
                </div>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn
                  :loading="loading"
                  @click="exit_teams_message()"
                  size="small"
                  color="primary"
                  variant="flat"
                  v-if="
                    selectedChat.team_owner_id !=
                    $store.getters.GetUserObj.user?.user_id
                  "
                  class="cardCss text-capitalize"
                >
                  Exit Group
                </v-btn>
                <v-btn
                  size="small"
                  :loading="loadingdelete"
                  @click="delete_teams_message()"
                  color="red"
                  variant="flat"
                  v-else
                  class="cardCss ml-2 text-capitalize"
                >
                  Delete Group
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-window-item>
          <v-window-item :value="1">
            <div v-if="memberView == false">
              <div class="d-flex align-center">
                <span class="font-weight-bold">
                  Members ({{ selectedChat.restricted_users.length }})
                </span>
                <v-spacer />
                <v-btn
                  v-if="
                    $store.getters.GetUserObj.user?.user_id ==
                    selectedChat.team_owner_id
                  "
                  color="primary"
                  variant="flat"
                  class="text-capitalize cardCss"
                  @click="memberView = true"
                  >Add</v-btn
                >
              </div>
              <v-list density="compact">
                <v-list-item
                  v-for="chat in selectedChat.restricted_users"
                  :key="chat"
                  style="border-bottom: 1px solid black"
                >
                  <v-list-item-title>
                    {{ fetch_userid_name(chat) }}
                    <!-- <v-icon
                      color="red"
                      v-show="
                        $store.getters.GetUserObj.user?.user_id ==
                        selectedChat.team_owner_id
                      "
                      small
                      v-if="
                        selectedChat.team_owner_id != chat &&
                        $store.getters.GetUserObj.user?.user_id != chat
                      "
                      >mdi-delete</v-icon
                    > -->
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
            <div v-else>
              <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2" @click="memberView = false"
                  >mdi-arrow-left-bold-circle-outline</v-icon
                >
                <span class="font-weight-bold"> Add Members </span>
              </div>
              <v-list density="compact">
                <v-text-field
                  outlined
                  density="compact"
                  label="Search"
                  v-model="searchQuery"
                />
                <v-btn
                  v-if="selectedUsers.length > 0"
                  color="primary"
                  variant="flat"
                  class="text-capitalize cardCss pa-2 mt-n2 mb-2"
                  block
                  :loading="loading"
                  @click="create_teams_message()"
                  >Add {{ selectedUsers.length }} Members</v-btn
                >
                <v-card flat :height="listHeight" class="overflow-auto">
                  <v-selection-group v-model="selectedUsers" multiple>
                    <v-list-item
                      v-for="chat in filteredUsers"
                      :key="chat.user_id"
                      style="border-bottom: 1px solid black"
                    >
                      <template #prepend>
                        <div
                          v-if="
                            chat.user_profile_pic_url != undefined &&
                            chat.user_profile_pic_url != 'N/A' &&
                            chat.user_profile_pic_url != ''
                          "
                        >
                          <v-avatar size="32" class="mt-n1 mb-1 pt-n1">
                            <v-img :src="chat.user_profile_pic_url" />
                          </v-avatar>
                        </div>
                        <div v-else>
                          <v-avatar
                            size="34"
                            class="mt-n1 mb-1 pt-n1"
                            color="primary"
                          >
                            <span class="white--text">
                              {{ chat.full_user_name.substring(0, 1) }}</span
                            >
                          </v-avatar>
                        </div>
                      </template>
                      <v-list-item-title>{{
                        chat.full_user_name
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        chat.designation
                      }}</v-list-item-subtitle>
                      <template #append>
                        <v-checkbox
                          v-model="selectedUsers"
                          :value="chat"
                          color="primary"
                        />
                      </template>
                    </v-list-item>
                  </v-selection-group>
                </v-card>
              </v-list>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable */

import { AddUserToTeam, ExitFromGroupchat } from "@/graphql/mutations.js";
import { edit_team_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  props: {
    selectedChat: Object,
  },
  emits: ["close", "successMsg", "errorMsg", "rowupdate", "successMsgexit"],
  mixins: [get_all_org_users],
  data() {
    return {
      allUSersNames: [],
      allusers: [],
      model: [],
      selectedUsers: [],
      loading: false,
      groupNameEdit: false,
      loadingdelete: false,
      loadingsave: false,
      memberView: false,
      GroupName: "",
      searchQuery: "",
      tabvalue: 0,
      listHeight: 0,
    };
  },
  computed: {
    filteredUsers() {
      return this.allusers.filter((chat) => {
        return chat.full_user_name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      });
    },
  },
  async mounted() {
    this.listHeight = window.innerHeight - 350;
    await this.get_all_org_users();
    this.allUSersNames = this.orgUsers;
    this.allusers = this.orgUsers.filter(
      (user) => user.user_status === "ACTIVE"
    );
    this.allusers = this.allusers.filter(
      (user) =>
        user.user_email_id !== this.$store.getters.GetUserObj.user?.user_email_id
    );

    this.allusers = this.allusers.filter(
      (item) => !this.selectedChat.restricted_users.includes(item.user_id)
    );
    this.GroupName = this.selectedChat.team_name;
  },
  watch: {
    tabvalue() {
      this.groupNameEdit = false;
      this.memberView = false;
      this.selectedUsers = [];
    },
  },
  methods: {
    editgroup() {
      if (this.$refs.form.validate()) {
        this.edit_teams_message();
      }
    },
    editteamName() {
      this.groupNameEdit = true;
    },
    async edit_teams_message() {
      this.loadingsave = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_team_details, {
            input: {
              team_id: this.selectedChat.team_id,
              team_name: this.GroupName,
              team_description: this.GroupName,
            },
          })
        );
        var response = JSON.parse(result.data.edit_team_details);
        this.loadingsave = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("rowupdate", 0);

          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loadingsave = false;
      }
    },
    async delete_teams_message() {
      this.loadingdelete = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_team_details, {
            input: {
              team_id: this.selectedChat.team_id,
              team_name: this.GroupName,
              team_description: this.GroupName,
              team_status: "DEACTIVE",
            },
          })
        );
        var response = JSON.parse(result.data.edit_team_details);
        this.loadingdelete = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("rowupdate", 0);

          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loadingdelete = false;
      }
    },
    async exit_teams_message() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(ExitFromGroupchat, {
            input: {
              team_id: this.selectedChat.team_id,
            },
          })
        );
        var response = JSON.parse(result.data.ExitFromGroupchat);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("successMsgexit", 0);
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    async create_teams_message() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      var users = this.selectedUsers.map((user) => user.user_id);

      try {
        let result = await API.graphql(
          graphqlOperation(AddUserToTeam, {
            input: {
              team_id: this.selectedChat.team_id,
              action_type: "ADD",
              user_id: users,
            },
          })
        );
        var response = JSON.parse(result.data.AddUserToTeam);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("rowupdate", 0);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    fetch_userid_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    fetch_date(val) {
      const d = new Date(parseInt(val * 1000));
      var date = d.getDate().toLocaleString();
      var month = (d.getMonth() + 1).toLocaleString();
      var year = d.getFullYear();

      return (
        (+date <= 9 ? "0" + date : date) +
        "-" +
        (+month <= 9 ? "0" + month : month) +
        "-" +
        year
      );
    },
  },
};
</script>

<style>
</style>