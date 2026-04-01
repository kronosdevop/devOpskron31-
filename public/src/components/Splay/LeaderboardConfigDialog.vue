<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogLeaderboardConfig"
      max-width="480px"
      persistent
    >
      <v-card rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Leaderboard Count </span>
          <v-btn
            icon
            variant="text"
            @click="DialogLeaderboardConfigEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Text-->
        <div class="text-center font-weight-bold mt-2">
          🏆 How many team members would you like to display in your
          leaderboard?
        </div>
        <div class="d-flex justify-center mt-3">
          <v-select
            v-model="count"
            variant="outlined"
            density="compact"
            rounded="lg"
            max-width="100px"
            :items="CountItems"
          />
        </div>

        <!--Button-->
        <v-card-actions class="d-flex justify-center mt-n2">
          <v-btn
            variant="flat"
            color="primary"
            size="small"
            rounded="lg"
            :loading="loading"
            @click="SetLeaderboardCount"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { GetLeaderboardConfigList } from "@/mixins/GetLeaderboardConfigList";
import { splay_leaderboard_management } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogLeaderboardConfig: Boolean },

  mixins: [GetLeaderboardConfigList],

  components: { SnackBar },

  data: () => ({
    count: "100",

    loading: false,

    SnackBarComponent: {},

    CountItems: [
      { title: "10", value: "10" },
      { title: "20", value: "20" },
      { title: "25", value: "25" },
      { title: "50", value: "50" },
      { title: "100", value: "100" },
    ],
  }),

  async mounted() {
    await this.GetLeaderboardConfigListMethod();

    const value = this.LeaderboardConfigList?.[0]?.splay_leaderboard_count;

    if (value) {
      this.count = String(value);
    }
  },

  methods: {
    async SetLeaderboardCount() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(splay_leaderboard_management, {
            input: {
              action_type: "UPDATE",
              splay_leaderboard_count: this.count,
            },
          }),
        );
        let resultObj = JSON.parse(result.data.splay_leaderboard_management);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.Message,
          };
        }
        this.DialogLeaderboardConfigEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to configure leaderboard count, try again",
        };
      } finally {
        this.loading = false;
      }
    },
    DialogLeaderboardConfigEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>
