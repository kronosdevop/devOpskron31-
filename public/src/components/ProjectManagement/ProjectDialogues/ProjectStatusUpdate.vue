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
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Update Project Status 
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-row no-gutters>
            <v-col cols="12">
              Update Project Status for {{ rowInfo.project_name }} ?
            </v-col>
            <v-col cols="12">
              <v-select
                density="compact"
                variant="outlined"
                class="mt-3"
                v-model="projectStatus"
                :items="[
                  { title: 'LIVE', value: 'LIVE' },
                  { title: 'COMPLETED', value: 'COMPLETED' },
                  { title: 'SUSPENDED', value: 'SUSPENDED' },
                ]"
              ></v-select>
            </v-col>
          </v-row>

          <!-- <div class="text-left">
            Are you sure you want to delete
            <b> {{ rowInfo.project_name }}</b> ?
          </div> -->
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
import { update_project_status } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";

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