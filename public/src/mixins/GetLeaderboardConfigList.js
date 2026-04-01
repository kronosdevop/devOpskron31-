import { splay_leaderboard_management } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export const GetLeaderboardConfigList = {
  data: () => ({
    loading: false,
    LeaderboardConfigList: [],
  }),

  methods: {
    async GetLeaderboardConfigListMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(splay_leaderboard_management, {
            input: {
              action_type: "LIST",
            },
          }),
        );
        let resultObj = JSON.parse(result.data.splay_leaderboard_management);
        if (resultObj.Status === "SUCCESS") {
          this.LeaderboardConfigList = resultObj.data;
        }
      } catch (error) {
        this.LeaderboardConfigList = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
