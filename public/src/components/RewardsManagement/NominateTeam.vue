<template>
  <v-dialog :model-value="teamNomination" max-width="420">
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">Nomination for the team</span>
        <v-btn icon variant="text" @click="closeDialog" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-6 py-5">
        <v-form ref="form1">
          <v-select
            variant="outlined"
            v-model="projectNominated"
            density="compact"
            label="Select Team"
            :items="projectItems"
            item-title="project_name"
            item-value="project_id"
            :loading="projectLoading"
            class="mb-4"
            :rules="[(v) => !!v || 'Amount is required']"
          />
          <v-text-field
            v-model="rewardTitle"
            label="Reward Title"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            :rules="[(v) => !!v || 'Amount is required']"
          ></v-text-field>
          <v-textarea
            v-model="userDescription"
            label="Description/Justification"
            variant="outlined"
            density="comfortable"
            rows="2"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="px-6 py-4 justify-end">
        <v-btn text @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          class="ml-2"
          :loading="loading"
          @click="submitAdvanceRequest"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { create_team_nominations } from "@/graphql/mutations.js";
import { list_all_reward_projects } from "@/graphql/queries.js";

export default {
  name: "RequestAdvanceDialog",
  props: {
    teamNomination: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      projectLoading: false,
      projectItems: [],
      masterProjects: [],

      rewardTitle: "",
      userDescription: "",
      projectNominated: "",
    };
  },
  watch: {
    teamNomination: {
      async handler() {
        if (this.teamNomination == true) {
          this.$store.commit("Setnamesearch", "");
          this.projectLoading = true;
          await this.get_all_reward_projects();
          await this.fetchData();
          this.projectLoading = false;
        }
      },

      immediate: true,
    },
  },

  methods: {
    async get_all_reward_projects() {
      try {
        this.projectLoading = true;
        const orgDetails = this.$store.getters.GetOrgDetails;

        if (!orgDetails || !orgDetails.organization || !orgDetails.organization.organization_id) {
          console.warn("Organization details not available for fetching reward projects");
          return;
        }

        const response = await API.graphql(
          graphqlOperation(list_all_reward_projects, {
            organization_id: orgDetails.organization.organization_id,
          })
        );

        let result = JSON.parse(response.data.list_all_reward_projects);
        if (result && result.items) {
          this.masterProjects = result.items;
        } else {
          this.masterProjects = [];
        }

      } catch (error) {
        this.masterProjects = [];
        console.error("Error fetching reward projects:", error);
      } finally {
        this.projectLoading = false;
      }
    },
    fetchData() {
      this.projectItems = [];
      this.masterProjects.forEach((element) => {
        this.projectItems.push({
          project_name: element.project_name,
          project_id: element.project_id,
        });
      });
      this.projectLoading = false;
      // console.log(this.orgUsers);
    },
    async submitAdvanceRequest() {
      const { valid } = await this.$refs.form1.validate();
      // console.log(valid);
      if (valid) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(create_team_nominations, {
              input: {
                action_type: "CREATE_TEAM_NOMINATION",
                project_id: this.projectNominated,
                recommendation_title: this.rewardTitle,
                recommendation_description: this.userDescription,
              },
            })
          );
          this.loading = false;
          var response = JSON.parse(result.data.create_team_nominations);
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.resetForm();
            this.$emit("clicked");
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          console.log(error);
          this.loading = false;
          this.$emit("errorMsg", error.errors?.[0]?.message || error.message);
        }
      }
    },
    closeDialog() {
      this.resetForm();
      this.$emit("clicked");
    },
    resetForm() {
      this.projectNominated = "";
      this.rewardTitl = "";
      this.userDescription = "";
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 18px !important;
  box-shadow: 0 4px 24px 0 rgba(60, 60, 60, 0.1),
    0 2px 8px 0 rgba(60, 60, 60, 0.06);
}
.v-card-title {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  color: #222 !important;
  letter-spacing: 0.01em;
  font-family: "Inter", "Segoe UI", Arial, sans-serif;
}
.v-btn[variant="text"] {
  color: #888;
}
</style> 