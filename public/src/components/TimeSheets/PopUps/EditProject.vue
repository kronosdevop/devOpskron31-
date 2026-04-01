<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="projectEdition"
      @update:model-value="projectEdition = $event"
      persistent
      max-width="500"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">
              Edit Categories/Project of {{ projectitems.project_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="">
              <v-col cols="12">
                <v-text-field
                  v-model="ProjectName"
                  label="Categories/Project Name"
                  :rules="[(v) => !!v || 'required ']"
                  density="compact"
                  variant="outlined"
                  :readonly="
                    projectitems.project_source == 'PROJECT_MANAGEMENT'
                  "
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  multiple
                  density="compact"
                  variant="outlined"
                  label="Activites"
                  v-model="projectActivity"
                  :rules="[
                    (v) =>
                      (v && v.length > 0) ||
                      'At least one activity is required',
                  ]"
                  item-text="title"
                  item-value="value"
                  :items="activityData"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            size="small"
            @click="validate_data()"
            :loading="loading"
            class="text-capitalize cardCss button-corner text-white"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { edit_project_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    projectEdition: Boolean,
    projectitems: Object,
    activityData: Array,
  },
  data() {
    return {
      ProjectName: "",
      loading: false,
      projectActivity: "",
    };
  },
  watch: {
    projectEdition: {
      async handler() {
        // console.log(this.projectitems);
        this.ProjectName = this.projectitems.project_name;
        this.projectActivity =
          this.projectitems.project_activities == undefined
            ? ""
            : this.projectitems.project_activities;
      },
      immediate: true,
    },
  },

  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        await this.edit_event_info();
      }
    },
    async edit_event_info() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_project_details, {
            input: {
              project_id: this.projectitems.project_id,
              project_name: this.ProjectName,
              project_activities: this.projectActivity,
            },
          })
        );
        var response = JSON.parse(result.data.edit_project_details);

        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>