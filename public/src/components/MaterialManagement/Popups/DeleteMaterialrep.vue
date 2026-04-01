<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="vistrepdeletion" @update:model-value="$emit('update:vistrepdeletion', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">
              Delete Material Reps
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-title class="text-center">
          <v-img
            :src="require('@/assets/trash.png')"
            alt="Stichh Logo"
            max-width="800"
            height="150"
            contain
            class="rotate-swing"
          />
        </v-card-title>
        <v-card-text class="mt-6">
          <div class="text-left">
            Are you sure you want to delete

            <b> {{ fetch_user_name(rowInfo.user_email_id) }} </b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
                <script>
/* eslint-disable */
import { edit_delete_project_site_users } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  props: {
    vistrepdeletion: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      loading: false,
      allUSersNames: [],
    };
  },
  watch: {
    vistrepdeletion: {
      async handler() {
        if (this.vistrepdeletion == true) {
          await this.get_all_org_users();

          this.allUSersNames = this.orgUsers;
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_user_name(value) {
      var name = "";
      this.allUSersNames.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      if (value == "SYSTEM") {
        name = value;
      }
      return name;
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },
    async delete_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_delete_project_site_users, {
            input: {
              project_site_user_id: this.rowInfo.project_site_user_id,
              action_type: "DELETE_USER",
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.edit_delete_project_site_users);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>