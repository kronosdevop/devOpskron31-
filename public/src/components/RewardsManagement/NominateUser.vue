<template>
  <v-dialog :model-value="userNomination" max-width="420">
    <v-card class="pa-0 rounded-xl">
      <v-card-title class="d-flex align-center justify-space-between px-6 py-4">
        <span class="font-weight-bold text-h5">User Nomination</span>
        <v-btn icon variant="text" @click="closeDialog" size="small">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="px-6 py-5">
        <v-form ref="form1">
          <v-select
            variant="outlined"
            v-model="userNominated"
            density="compact"
            label="Select User"
            :items="userItems"
            item-title="full_name"
            item-value="user_id"
            :loading="userLoading"
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
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";
import { create_list_nominations } from "@/graphql/mutations.js";

export default {
  name: "RequestAdvanceDialog",
  mixins: [get_all_org_users],
  props: {
    userNomination: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      userLoading: false,
      userItems: [],

      rewardTitle: "",
      userDescription: "",
      userNominated: "",
    };
  },
  watch: {
    userNomination: {
      async handler() {
        if (this.userNomination == true) {
          this.$store.commit("Setnamesearch", "");
          this.userLoading = true;
          await this.get_all_org_users();
          await this.fetchData();
          this.userLoading = false;
        }
      },

      immediate: true,
    },
  },

  methods: {
    fetchData() {
      this.userItems = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userItems.push({
            full_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
      this.userLoading = false;
      // console.log(this.orgUsers);
    },
    async submitAdvanceRequest() {
      const { valid } = await this.$refs.form1.validate();
      // console.log(valid);
      if (valid) {
        this.loading = true;
        try {
          let result = await API.graphql(
            graphqlOperation(create_list_nominations, {
              input: {
                nominee_email_id: this.userNominated,
                recommendation_title: this.rewardTitle,
                recommendation_description: this.userDescription,
                action_type: "CREATE_NOMINATION",
              },
            })
          );
          this.loading = false;
          var response = JSON.parse(result.data.create_list_nominations);
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
      this.userNominated = "";
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