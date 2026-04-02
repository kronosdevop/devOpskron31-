<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="projectStatusUpdateDialog"
      @update:model-value="$emit('update:projectStatusUpdateDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card rounded="lg">

        <!-- Header -->
        <v-toolbar elevation="0" density="comfortable" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Update Project Status</div>
          </v-toolbar-title>

          <v-spacer />

          <v-icon class="icon-class mr-4" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <!-- Content -->
        <v-card-text class="mt-4">

          <v-row no-gutters>

            <!-- Project name -->
            <v-col cols="12" class="mb-2">
              <div class="text-body-1 font-weight-medium">
                Update Project Status for
                <span class="font-weight-bold text-primary">
                  {{ rowInfo.project_name }}
                </span> ?
              </div>
            </v-col>

            <!-- Select -->
            <v-col cols="12">
              <v-select
                density="compact"
                variant="outlined"
                class="mt-3"
                v-model="projectStatus"
                label="Select Status"
                :items="[
                  { title: 'Live', value: 'LIVE' },
                  { title: 'Completed', value: 'COMPLETED' },
                  { title: 'Suspended', value: 'SUSPENDED' },
                ]"
              />
            </v-col>

            <!-- Warning message if completed -->
            <v-col cols="12" v-if="projectStatus === 'COMPLETED' && rowInfo.inprogress_task_count != 0 " class="mt-4">
              <v-alert
                type="warning"
                variant="tonal"
                border="start"
                border-color="warning"
                icon="mdi-alert"
              >
                Are you sure you want to
                <b>complete</b> the project <b>"{{ rowInfo.project_name }}"</b> ?
                <br /><br />
                There are still <b >{{ rowInfo.inprogress_task_count }}</b>  task(s) pending in this project. Completing
                the project will prevent further progress updates.
              </v-alert>
            </v-col>

          </v-row>

        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="justify-end pb-4 pr-4">

          <v-btn
            variant="text"
            color="grey"
            @click="close_dialog()"
          >
            Cancel
          </v-btn>

          <v-btn
            :loading="loading"
            :disabled="!projectStatus"
            color="primary"
            variant="flat"
            @click="delete_mutation()"
          >
            {{ projectStatus === 'COMPLETED' ? 'Complete Project' : 'Update' }}
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */
import { update_project_status } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    projectStatusUpdateDialog: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      loading: false,
      projectStatus: "",
    };
  },

  watch: {
    projectStatusUpdateDialog: {
      async handler() {
        if (this.projectStatusUpdateDialog == true) {
          this.projectStatus = this.rowInfo.project_progress;
        }
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async delete_mutation() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(update_project_status, {
            input: {
              project_id: this.rowInfo.project_id,
              project_status: "ACTIVE",
              project_progress: this.projectStatus,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.update_project_status);

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