<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="taskdeletion"
      @update:model-value="$emit('update:taskdeletion', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">Delete Task</div></v-toolbar-title
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
        <v-card-text class="mt-4">
          <div class="text-left">
            Are you sure you want to delete Task assigned to
            <b> {{ fetch_name(projData.assign_to) }}</b> ?
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="cardCss"
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
import { create_list_edit_phase_tasks } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  props: {
    taskdeletion: Boolean,
    projData: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      loading: false,
    };
  },
  watch: {
    taskdeletion: {
      async handler() {
        if (this.taskdeletion == true) {
          await this.get_all_org_users();
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_name(value) {
      var data = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          data = element.full_user_name;
        }
      });
      return data;
    },
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_mutation() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_phase_tasks, {
            input: {
              task_id: this.projData.task_id,
              phase_id:this.projData.phase_id,
              action_type:'DELETE'
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.create_list_edit_phase_tasks);
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