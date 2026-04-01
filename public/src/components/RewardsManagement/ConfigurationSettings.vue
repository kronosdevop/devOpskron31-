<template>
  <v-card flat class="ma-2">
    <v-tabs
      v-model="config_toggle"
      color="primary"
      align-tabs="start"
      class="px-4"
      grow
    >
      <v-tab value="reward_policy"> Reward Policy </v-tab>
      <v-tab value="approval"> Approval </v-tab>
      <v-tab value="teamapproval">Team Approval </v-tab>
    </v-tabs>

    <v-window v-model="config_toggle">
      <v-window-item value="approval">
        <ApprovalRewards />
      </v-window-item>
      <v-window-item value="reward_policy">
        <RewardPolicy />
      </v-window-item>
      <v-window-item value="teamapproval">
        <TeamApprovals />
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script>
import ApprovalRewards from "./ApprovalRewards.vue";
import TeamApprovals from "./TeamApprovals.vue";
import RewardPolicy from "./ConfigurationComponents/RewardPolicy.vue";

export default {
  components: {
    ApprovalRewards,
    RewardPolicy,
    TeamApprovals,
  },
  data() {
    return {
      config_toggle: "reward_policy",
    };
  },
};
</script>
