import { get_leaderboard } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export const GetLeaderBoard = {
  data: () => ({
    loading: false,
    ListLeaderBoard: [],
  }),

  methods: {
    async GetLeaderBoardMethod() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(get_leaderboard, {
            input: {
              leaderboard_type: this.status,
            },
          }),
        );
        let resultObj = JSON.parse(result.data.get_leaderboard);
        if (resultObj.Status === "SUCCESS") {
          this.ListLeaderBoard = resultObj.data;
        }
        this.loading = false;
      } catch (error) {
        this.ListLeaderBoard = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
