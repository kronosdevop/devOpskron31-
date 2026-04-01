<template>
  <div>
    <!-- eslint-disable  -->
    <v-dialog
      :model-value="projectMemberDialog"
      @update:model-value="$emit('update:projectMemberDialog', $event)"
      persistent
      max-width="400px"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Members of {{ rowInfo?.project_name }}
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="scrollable-content">
          <v-list v-if="rowInfo?.project_visible_members?.length">
            <v-list-item
              v-for="member in rowInfo.project_visible_members"
              :key="member.email"
            >
              <v-list-item-avatar>
                <v-avatar color="primaryColor" size="40">
                  <img
                    v-if="
                      userProfiles[member.email] &&
                      isValidUrl(userProfiles[member.email])
                    "
                    :src="userProfiles[member.email]"
                    alt="Profile Pic"
                    @error="handleImageError(member.email)"
                  />
                  <span v-else class="white--text">
                    {{ userProfiles[member.email] || getInitials(member.name) }}
                  </span>
                </v-avatar>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{ member.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ member.role }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info" dense>No members found.</v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>  

<script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  mixins: [get_all_org_users],
  props: {
    projectMemberDialog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      userProfiles: {},
    };
  },
  async created() {
    await this.get_all_org_users();
    this.fetch_user_list();
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    fetch_user_list() {
      this.userProfiles = {};

      localStorage.setItem("allOrgUsers", JSON.stringify(this.orgUsers));

      this.orgUsers.forEach((element) => {
        if (element.user_status === "ACTIVE") {
          const email = element.user_email_id;
          let profilePicUrl = element.user_profile_pic_url || "";
          const name = element.full_user_name;
          if (
            profilePicUrl &&
            profilePicUrl !== "N/A" &&
            this.isValidUrl(profilePicUrl)
          ) {
            this.userProfiles[email] = profilePicUrl;
          } else {
            const initials = this.getInitials(name);
            this.userProfiles[email] = initials;
          }
        }
      });
    },

    getInitials(name) {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    },

    isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    },

    handleImageError(email) {
      this.userProfiles[email] = this.getInitials(email);
    },
  },
};
</script>

<style scoped>
.custom-title {
  font-weight: bold;
  font-size: 16px;
}
.icon-class {
  cursor: pointer;
}
</style>
