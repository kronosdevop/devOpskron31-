<template>
  <div>
    <v-dialog
      :model-value="CreatProjectDialog"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Create Project</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class mr-4" @click="close_dialog()"
            >mdi-close</v-icon
          >
        </v-toolbar>
        <v-card-text class="">
          <v-form ref="form">
            <v-text-field
              density="compact"
              variant="outlined"
              label="Name"
              :rules="[(v) => !!v || 'Required']"
              v-model="projectName"
            />
            <v-select
              density="compact"
              variant="outlined"
              v-model="activityList"
              dense
              :rules="[
                (v) =>
                  (v && v.length > 0) || 'At least one activity is required',
              ]"
              :items="activityData"
              item-text="title"
              item-value="value"
              color="primary"
              label="Select Activity"
              multiple
            >
            </v-select>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            @click="add_mutation()"
            dark
            :loading="loadingBtn"
            size="small"
            class="text-capitalize mt-n6 ma-2 cardCss"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/*eslint-disable*/
// import { EventBus } from "@/main";
import { create_project } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_activities_list } from "@/mixins/GetTimeSheetActivitiesList.js";
export default {
  mixins: [get_activities_list],
  props: {
    CreatProjectDialog: Boolean,
  },

  data() {
    return {
      activityData: [],
      activityList: [],
      projectName: "",
      loadingBtn: false,
    };
  },
  watch: {
    CreatProjectDialog: {
      async handler() {
        if (this.CreatProjectDialog == true) {
          await this.get_activities_list();
          this.activityData = [];
          let selectData = this.ActivityList;
          selectData.forEach((element) => {
            this.activityData.push({
              title: element.activity_name,
              value: element.activity_name,
            });
          });
        }
      },
      immediate: true,
    },
  },
  // async created() {
  //     await this.get_activities_list();
  //     let selectData = this.ActivityList;
  //     selectData.forEach((element) => {
  //         this.activityData.push({
  //             label: element.activity_name,
  //             value: element.activity_name,
  //         });
  //     });
  // },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
    },
    async add_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        await this.create_project_with_activities();
      }
    },

    async create_project_with_activities() {
      var data = this.$store.getters.GetUserObj;
      this.loadingBtn = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_project, {
            input: {
              project_name: this.projectName,
              // organization_id: data.organization.organization_id,
              project_activities: this.activityList,
              user_email_id: data.user.user_email_id,
            },
          })
        );

        var response = JSON.parse(result.data.create_project);
        if (response.Status == "SUCCESS") {
          this.loadingBtn = false;
          this.$refs.form.reset();
          this.$emit("successMsg", response.Message);
        } else {
          this.loadingBtn = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loadingBtn = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>

<style>
</style>